module.exports = function (app, cb) {

    const logger    = app.config.logger;

    const utilsDir  = app.src.utils.Diretorio;
    const utilsCA   = app.src.utils.ConversorArquivos;
    const utilsFMT  = app.src.utils.Formatador;

    const model     = app.src.modDelivery.models.ContingenciaModel;
    const ctlCom    = app.src.modDelivery.controllers.CommonController;

    var api = {};

    //-----------------------------------------------------------------------\\ 

    api.lerXMLContingencia = function (req, res, next) {

        var path = `${req.dir}${req.filename}`;

        if (utilsDir.existsPath(path)) {

            logger.debug('Construindo objeto Delivery');

            var strXml = utilsCA.lerArquivo(path);
            var xmlDom = utilsCA.getXmlDom(strXml);
            var objDelivery = this.deliveryHeader(xmlDom);

            objDelivery.filename = req.filename;

        } else {

            logger.debug(`Arquivo ${path} não encontrado`);
            
            var objDelivery = {};

        }

        return objDelivery;
    }

    //-----------------------------------------------------------------------\\ 

    api.deliveryHeader = function (xmlDom) {

        var objDelivery = ctlCom.buscaNos(xmlDom, model.DH, 0);

        if (objDelivery.hasOwnProperty('CDDELIVE')) {
            objDelivery     = ctlCom.formatDelivery(objDelivery);
            objDelivery     = this.deliveryItem(objDelivery, xmlDom);
        }

	    return objDelivery;
    }

    //-----------------------------------------------------------------------\\ 

    api.deliveryItem = function (objDelivery, xmlDom) {

        objDelivery.item = [];
        var nodesItem = utilsCA.getXmlNodes(model.loopItem1, xmlDom);

        if (nodesItem.length > 0) {

            objDelivery = this.loopItem(objDelivery, xmlDom, nodesItem);

        } else {

            var nodesItem = utilsCA.getXmlNodes(model.loopItem2, xmlDom);
            objDelivery = this.loopItem(objDelivery, xmlDom, nodesItem);

        }

        if (objDelivery.item.length == 0)
            objDelivery.arOcorrencia.push(utilsFMT.gerarOcorrencia(1, 'ITEM', 'Itens da Delivery não encontrados', objDelivery.CDFILIAL));

        return objDelivery;

    }

    //-----------------------------------------------------------------------\\
    
    api.loopItem = function (objDelivery, xmlDom, nodesItem) {

        for (var i=0; i<nodesItem.length; i++) {

            var objItem = ctlCom.buscaNos(xmlDom, model.DI, i);

            if (!objItem.hasOwnProperty('NRONU')) objItem.NRONU = 0;
            if (objItem.hasOwnProperty('DSREFFAB')) objItem.DSREFFAB = String(objItem.DSREFFAB);

            objItem.VRUNIPRO = (objDelivery.VRDELIVE == 0) ? 0 : (objDelivery.VRDELIVE / nodesItem.length);												
            
            objItem = api.deliveryLote(xmlDom, objItem);

            if (objItem.arOcorrencia.length > 0) 
                objDelivery.arOcorrencia = objDelivery.arOcorrencia.concat(objItem.arOcorrencia);

            objDelivery.item.push(objItem);

        }

        return objDelivery;

    }

    //-----------------------------------------------------------------------\\

    api.deliveryLote = function (xmlDom, objItem) {

        objItem.lote = [];

        var strLoop = model.loopLote.replace('cdLoopDL', objItem.cdLoopDL);

        var nodesLote = utilsCA.getXmlNodes(strLoop, xmlDom);

        if (nodesLote.length > 0) {

			for (var objNode of nodesLote) {

                var xmlDomLote = utilsCA.getXmlDom(objNode.toString());
                var objLote = ctlCom.buscaNos(xmlDomLote, model.DL, 0);
                objItem.lote.push(objLote);

                objItem.arOcorrencia = objItem.arOcorrencia.concat(objLote.arOcorrencia);
                
            }

        } else {

            objItem.arOcorrencia.push(utilsFMT.gerarOcorrencia(1, 'LOTE', 'Lote do Item não encontrado'));

        }        

        return objItem;

    }

    //-----------------------------------------------------------------------\\

    return api;

}