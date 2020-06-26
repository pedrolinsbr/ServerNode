/**
 * @module modDelivery/controllers/DeliveryClass
 * 
 * @requires NPM:fs
 * 
 * @requires module:delivery/models/XMLModel
 * 
 * @requires module:utils/ConversorArquivos
 * @requires module:utils/Diretorio
 * @requires module:utils/DataAtual
 * @requires module:utils/Formatador
 * @requires module:config/logger
*/
module.exports = function (app, cb) {

	const utilsCA	= app.src.utils.ConversorArquivos;
	const utilsDir	= app.src.utils.Diretorio;
	const fmt		= app.src.utils.Formatador;
	const logger	= app.config.logger;

	const XMLSchema = app.src.modDelivery.models.XMLModel;
	const ctlCom    = app.src.modDelivery.controllers.CommonController;

	var api = {};

    //-----------------------------------------------------------------------\\        
	/**
	 * @description Faz a leitura do XML enviado pela Syngenta.
	 * 
	 * @function lerXMLDelivery
	 * @param  	{Object} req Parâmetros da pesquisa
	 * @param  	{string} req.dir Caminho do diretório
	 * @param  	{Object} req.filename Nome do arquivo
	 * @returns {Object} Retorna um objeto com os campos da Delivery
	 * 
	 * @requires module:config/logger
	 * @requires module:utils/ConversorArquivos
	 * @requires module:modDelivery/controllers/DeliveryClass~deliveryHeader
	 * 
	 * @author Rafael Delfino Calzado
	 * @since 20/04/2018
  */
    api.lerXMLDelivery = function (req, res, next) {

		var path = `${req.dir}${req.filename}`;

		if (utilsDir.existsPath(path)) {

			logger.debug('Construindo objeto Delivery');

			var strXml 		= utilsCA.lerArquivo(path);
			var xmlDom 		= utilsCA.getXmlDom(strXml);
			var objDelivery	= this.deliveryHeader(xmlDom);
			
			objDelivery.filename = req.filename;

		} else {

			logger.debug(`Arquivo ${path} não encontrado`);

			var objDelivery = {};

		}

		return objDelivery;
	}

    //-----------------------------------------------------------------------\\        
	/**
	 * @description Faz a leitura do cabeçalho do XML enviado pela Syngenta.
	 * 
	 * @function deliveryHeader
	 * @param  	{Object} xmlDom Dados do XML
	 * 
	 * @requires module:modDelivery/controllers/DeliveryClass~validarCampos
	 * @requires module:modDelivery/controllers/DeliveryClass~deliveryItem
	 * @requires module:modDelivery/controllers/DeliveryClass~gerarOcorrencia
	 * @requires module:utils/DataAtual~dataAtualJS
	 * @requires module:utils/DataAtual~formataData
	 *
	 * @requires module:config/logger
	 * 
	 * @returns {Object} Retorna um objeto com os campos da Delivery
	 *
	 * @author Rafael Delfino Calzado
	 * @since 20/04/2018
  */
	api.deliveryHeader = function (xmlDom) {

		var objDelivery = ctlCom.buscaNos(xmlDom, XMLSchema.DH, 0);

		if (objDelivery.hasOwnProperty('CDDELIVE')) {
			objDelivery = ctlCom.formatDelivery(objDelivery);
			objDelivery = this.deliveryItem(objDelivery, xmlDom);
		}

		return objDelivery;
    }    
    
    //-----------------------------------------------------------------------\\
	/**
	 * @description Faz a leitura dos itens na delivery.
	 * 
	 * @function deliveryItem
	 * @param  	{Object} 	xmlDom 						Dados do XML
	 * @param  	{Object} 	objDelivery 				Dados da Delivery
	 * @param  	{Array} 	objDelivery.arOcorrencia	Ocorrências
	 * @param  	{Object} 	objDelivery.item			Dados do item
	 * 
	 * @returns {Object} Retorna um objeto com os itens da Delivery
	 * 
	 * @requires module:utils/ConversorArquivos~getXmlNodes
	 * @requires module:utils/ConversorArquivos~getXmlDom
	 * @requires module:modDelivery/controllers/DeliveryClass~validarCampos
	 * @requires module:modDelivery/controllers/DeliveryClass~deliveryLote
	 * 
	 * @requires module:config/logger
	 * 
	 * @author Rafael Delfino Calzado
	 * @since 20/04/2018
	*/
    api.deliveryItem = function (objDelivery, xmlDom) {

		objDelivery.item = [];
		var nodes = utilsCA.getXmlNodes(XMLSchema.loopItem, xmlDom);

		if (nodes.length > 0) {

			for (var i=0; i<nodes.length; i++) {

				//==========================================\\
				// Obtendo e validando nodes do item

				var objItem = ctlCom.buscaNos(xmlDom, XMLSchema.DI, i);

				if (!objItem.hasOwnProperty('NRONU')) objItem.NRONU = 0;

				logger.debug(`Obtendo Item: ${objItem.NRORDITE}`);

				//==========================================\\
				// lotes

				objItem = api.deliveryLote(xmlDom, objItem);

				if (objItem.arOcorrencia.length == 0) {

					var ttProd = 0;
					objItem.lote.forEach(v => { ttProd += v.QTPRODUT });
					objItem.VRUNIPRO = (objDelivery.VRDELIVE == 0 || ttProd == 0) ? 0 : (objDelivery.VRDELIVE / ttProd);
				
				} else {

					objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(objItem.arOcorrencia);

				}

				objDelivery.item.push(objItem);

			}

		}

		return objDelivery;
	}

    //-----------------------------------------------------------------------\\
	/**
     * @description Faz a leitura dos lotes dos itens na delivery.
     * 
     * @function deliveryLote
     * @param  	{Object} xmlDom 	Dados do XML
	 * @param  	{Object} objItem 	Dados dos items
	 * 
	 * @requires module:utils/ConversorArquivos~getXmlDom
	 * @requires module:modDelivery/controllers/DeliveryClass~validarCampos
	 * 
     * @returns {Object} Retorna objeto com os Lotes da Delivery
     * 
     * @author Rafael Delfino Calzado
     * @since 20/04/2018
    */
	api.deliveryLote = function (xmlDom, objItem) {

        objItem.lote = [];

        var strLoop = XMLSchema.loopLote.replace('itemId', objItem.NRORDITE);

        var nodes = utilsCA.getXmlNodes(strLoop, xmlDom);

		if (nodes.length > 0) {

			for (var objNode of nodes) {

                var xmlDomLote = utilsCA.getXmlDom(objNode.toString());
				var objLote = ctlCom.buscaNos(xmlDomLote, XMLSchema.DL, 0);
				
				if (!objLote.hasOwnProperty('DSLOTE')) objLote.DSLOTE = '0';

                objItem.lote.push(objLote);

                objItem.arOcorrencia = objItem.arOcorrencia.concat(objLote.arOcorrencia);
			}

		} else {

			objItem.arOcorrencia.push(fmt.gerarOcorrencia(1, 'LOTE', 'Lote do Item não encontrado'));

		}

		return objItem;
	}

    //-----------------------------------------------------------------------\\

  return api;
}