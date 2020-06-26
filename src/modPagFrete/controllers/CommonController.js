module.exports = function (app, cb) {

	var api = {};

	const utilsCA  = app.src.utils.ConversorArquivos;
	const utilsFMT = app.src.utils.Formatador;

	api.utilsCA  = utilsCA;
	api.utilsFMT = utilsFMT;

	//-----------------------------------------------------------------------\\ 
    /****
        * @description Realiza busca no XML por parâmetros XPath
        * 
        * @function readNodes
        * @param    {Object}   objDOM     XML convertido para objeto DOM
        * @param    {Array}    arXPath    Array de parâmetors XPath
        * @param    {Integer}  i          Índice de busca
        * 
        * @returns  {Object} Retorna objeto com valores encontrados
        * @throws   {Object} Retorna erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 02/09/2019
    *****/
	//-----------------------------------------------------------------------\\     

	api.readNodes = function (objDOM, arXPath, i) {

		try {

			var objTmp  = { arOccurrence: [] };
			var idOcc   = 1;
			var vlField = null;
			var objVal  = { blOK: false };
			var nodes   = [];

			for (var objRef of arXPath) {

				nodes = utilsCA.getXmlNodes(objRef.xPath, objDOM);

				if (i >= nodes.length) {

					idOcc = 1;
					objVal.blOK = false;

				} else {

					idOcc = 2;
					vlField = (nodes[i].firstChild) ? nodes[i].firstChild.data : null;
					objVal = this.validateField(objRef.tpField, vlField);					
					if (objVal.blOK) objTmp[objRef.nmField] = objVal.vlField;

				}

				if ((!objVal.blOK) && (objRef.blMandatory))
					objTmp.arOccurrence.push(utilsFMT.gerarOcorrencia(idOcc, objRef.nmField, `Campo: ${objRef.dsField}`));

			}

			return objTmp;

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\ 
    /****
        * @description Valida os tipos de dados de acordo modelo de importação
        * 
        * @function validateField
        * @param    {String}   tpfField  Tipo de dado
        * @param    {String}   vlField   Valor do Campo
        * 
        * @returns  {Object} Retorna objeto com valores validados
        * @throws   {Object} Retorna erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 02/09/2019
    *****/
	//-----------------------------------------------------------------------\\ 

	api.validateField = function (tpField, vlField) {

		try {

			switch (tpField) {

				case 'float':
					var re = /^\d+(\.\d{2})?$/;
					var blOK = re.test(vlField);	
					break;

				case 'integer':
					var re = /^\d+$/;
					var blOK = re.test(vlField);
					break;

				case 'email':
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					var blOK = re.test(vlField);
					break;

				case 'date':
					vlField  = new Date(vlField);
					var blOK = true;
					break;

				default:
					var blOK = ((typeof vlField == 'string') && (vlField.length > 0));
					if (blOK) vlField = vlField.replace(/(\s+|\t+)/g, ' '); //Multiple SPACE / TAB
					break;

			}

			return { vlField, blOK };

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	return api;

}