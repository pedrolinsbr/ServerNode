module.exports = function (app, cb) {

	const tmz     = app.src.utils.DataAtual;
	const utilsCA = app.src.utils.ConversorArquivos;  
    const Joi     = require('joi');

	var fn = {};
	
	//-----------------------------------------------------------------------\\

	fn.chkModelPost = function (req, res, next) {

		var objVal = fn.checaEsquema(req.post, req.model);

		if (objVal.blOK) {
			next();
		} else {
			res.status(400).send({ error: objVal.strErro });
		} 

	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description Formata uma string para um valor Float válido
	 * @author Rafael Delfino Calzado
	 * @since 24/01/2018
	 *
	 * @function currencyToFloat
	 * @param {String}  strVal Formato 123.456,78
	 * @returns {Float} Formato 123456.78
	*/
	//-----------------------------------------------------------------------\\
	
	fn.currencyToFloat = function (strVal) {
		return parseFloat(strVal.replace(/\./g, '').replace(',', '.'));
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Formata uma variável Float em BRL Currency
	 * @author Rafael Delfino Calzado
	 * @since 17/04/2019
	 *
	 * @function floatToCurrency
	 * @param 	{Float}   floatVal 	Formato 123456.78
	 * @returns {String}  			Formato 123.456,78
	*/
	//-----------------------------------------------------------------------\\

	fn.floatToCurrency = function (floatVal) {

		var strVal = floatVal.toLocaleString('pt-br', { minimumFractionDigits: 2 });

		strVal = strVal.replace(/\./g, ';');
		strVal = strVal.replace(/\,/g, '.');
		strVal = strVal.replace(';', ',');

		return strVal;
	}

    //-----------------------------------------------------------------------\\
	/**
	 * @description Formata o número Shipment com um caracter crescente, seguido do número da carga + etapa (opcional)
	 * @author Rafael Delfino Calzado
	 * @since 24/01/2018
	 *
	 * @function formataShipment
	 * @param {Integer}  idCarga ID da Carga
	 * @param {Integer}  nrEtapa Etapa (opcional)
	 * @returns {String} Shipment no formato A123456-78
	*/
	//-----------------------------------------------------------------------\\

	fn.formataShipment = function (param) {
		const nrASCII 	= 65; //A
		const nrCasas	= 6;
		const base  	= Math.pow(10, nrCasas);		

		var nrCarga		= parseInt(param.idCarga);
		var quociente 	= Math.floor(nrCarga / base);
		var letra		= String.fromCharCode(nrASCII + quociente);
		var strCarga	= String(nrCarga - (base * quociente));

		var strShipment = letra + utilsCA.LPad(strCarga, '0', nrCasas);

		if (param.hasOwnProperty('nrEtapa'))
			strShipment += '-' + utilsCA.LPad(String(param.nrEtapa), '0', 2);

		return strShipment;
    }
    
	//-----------------------------------------------------------------------\\
	/**
	 * @description Retorna um objeto com os atributos existentes entre o cruzamento dos dois parâmetros
	 * @author Rafael Delfino Calzado
	 * @since 19/02/2018
	 *
	 * @function existeAtributo
	 * @param {Object} objBusca objeto a ser comparado
	 * @param {Object} objAtributos atributos a serem verificados
	 * @returns {Object} Objeto com os os atributos cruzados
	*/
	//-----------------------------------------------------------------------\\

	fn.existeAtributo = function (objBusca, objAtributos) {
		var objResp = {};

        for (var i in objBusca) 
			if ((i !== undefined) && (objAtributos.hasOwnProperty(i))) objResp[i] = objBusca[i];
			
		return objResp;
	}

	//-----------------------------------------------------------------------\\
    /**
     * @description Atribui os campos submitados pertinentes ao Schema carregado
     * @function setSchema
     * @author Rafael Delfino Calzado
     * @since 04/04/2018
     *
     * @param {Object} objSchema Modelo do Schema
     * @param {Object} objBusca  Objeto a ser comparado
	 * @returns {Object} Objeto formatado
     */
    //-----------------------------------------------------------------------\\

    fn.setSchema = function (objSchema, objBusca) {

		var objFormatted 	  = Object.assign({}, objSchema);
		objFormatted.vlFields = this.existeAtributo(objBusca, objSchema.columns);
		objFormatted.vlKey    = {};
		
		if (Array.isArray(objFormatted.key)) { 
			for (var key of objFormatted.key) {
				if (objFormatted.vlFields.hasOwnProperty(key)) {
					objFormatted.vlKey[key] = objFormatted.vlFields[key];
					delete objFormatted.vlFields[key];
				}	
			}
		}
		
        return objFormatted;
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Valida os campos em um Schema informado
     * @function validateSchema
     * @author Rafael Delfino Calzado
     * @since 28/02/2018
     *
     * @param   {Object}  objSchema Schema a ser validado
     * @returns {Boolean} Retorna um objeto com o número de registros afetados
     */
    //-----------------------------------------------------------------------\\

    fn.validateSchema = function (objSchema) {

        var objV = Joi.validate(objSchema.vlFields, objSchema.columns);

        return (objV.error == null);
    }    

	//-----------------------------------------------------------------------\\ 
    /**
     * @description Valida os campos em um Schema e retorna mensagem em caso de erro
     * @function validaEsquema
     * @author Rafael Delfino Calzado
     * @since 05/06/2018
     *
	 * @param   {Object}  objAnalise Objeto a ser analisado
     * @param   {Object}  objEsquema Esquema a ser validado
     * @returns {Object}  Retorna um booleano e uma mensagem em caso de erro
     */
	//-----------------------------------------------------------------------\\
		
	fn.validaEsquema = function (objAnalise, objEsquema) {

		var objR = { strErro: '' };
		var objV = Joi.validate(objAnalise, objEsquema);

		objR.blOK = (objV.error == null);
		if (!objR.blOK) objR.strErro = objV.error.message.replace(/"/g, '');

		return objR;
	}

	//-----------------------------------------------------------------------\\
    /**
     * @description Valida os campos em um Schema e atribui valores definidos
     * @function checaEsquema
     * @author Rafael Delfino Calzado
     * @since 11/09/2018
     *
	 * @param   {Object}  objAnalise Objeto a ser analisado
     * @param   {Object}  objEsquema Esquema a ser validado
	 * @returns {Object} 
     * @returns {Boolean} blOK    - Booleano se o modelo foi validado
	 * @returns {String}  strErro - Erro encontrado no modelo
	 * @returns {Object}  value   - Valores validados no modelo
     */
	//-----------------------------------------------------------------------\\

	fn.checaEsquema = function (objAnalise, objEsquema) {

		var objVal = Joi.validate(objAnalise, objEsquema, { stripUnknown: true });

		objVal.blOK = (objVal.error == null);
		objVal.strErro = (objVal.blOK) ? null : objVal.error.details[0].message.replace(/\"/g, '').replace('is required', 'é requerido');

		return objVal;
	
	}	

	//-----------------------------------------------------------------------\\ 
	/**
     * @description Retorna objeto com os campos da tabela de ocorrência
     * 
     * @function gerarOcorrencia
     * @param  {Number} IDI009		ID Tabela I009
	 * @param  {String} NMCAMPO		Nome do campo
	 * @param  {Object} OBOCORRE	Observação da ocorrência
	 * 
	 * @requires module:utils/DataAtual~dataAtualJS
	 * 
     * @returns {Object} Objeto com os campos da ocorrência preenchidos
     * 
     * @author Rafael Delfino Calzado
     * @since 20/04/2018
    */
	//-----------------------------------------------------------------------\\

	fn.gerarOcorrencia = function (IDI009, NMCAMPO, OBOCORRE, DSSHIPOI = null) {

		return { IDI009, NMCAMPO, OBOCORRE, DTCADAST: tmz.dataAtualJS(), DSSHIPOI };
	}

 	//-----------------------------------------------------------------------\\

    return fn;
}