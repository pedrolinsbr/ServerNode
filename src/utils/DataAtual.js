module.exports = function (app, cb) {

	var fn = {};

	const localTZ = process.env.LOCAL_TIMEZONE;

	//-----------------------------------------------------------------------\\
    /**
     * @description Retorna o dia/hora no formato especificado, de acordo com o timezone configurado
     * @function 	tempoAtual
     * @author 		Rafael Delfino Calzado
     * @since 		15/02/2018
	 * 
     * @param  {String}  formato Formato requerido da data/hora atual
	 * @param  {Boolean} utc	 Uso do Timezone / UTC
	 * 
     * @return {String}  Retorna a data/hora no formato requerido     
     */
    //-----------------------------------------------------------------------\\ 

	fn.tempoAtual = function (formato, utc) {
		var moment = require('moment');

		var tz = (utc == true) ? moment.utc() : moment();

		return tz.format(formato);
	}

	//-----------------------------------------------------------------------\\
    /**
     * @description Retorna objeto Date no timezone configurado
     * @function 	dataAtualJS
     * @author 		Rafael Delfino Calzado
     * @since 		15/02/2018
	 * 
     * @return {Date}  Data e hora no timezone configurado
     */
    //-----------------------------------------------------------------------\\ 

	fn.dataAtualJS = function () {
		var moment = require('moment');

		return moment().toDate();
	}

	//-----------------------------------------------------------------------\\
    /**
     * @description Modifica o formato de um objeto Date e retorna uma string
     * @function 	formataData
     * @author 		Rafael Delfino Calzado
     * @since 		15/02/2018
	 * 
     * @param  {Date} 	 data		Objeto Date 
	 * @param  {String}	 formato	Formato da saída
	 * 
     * @return {String}  Retorna a data/hora no formato requerido     
     */
    //-----------------------------------------------------------------------\\ 	

	fn.formataData = function (data, formato) {
		var moment = require('moment');

		return moment(data).format(formato);
	}

	//-----------------------------------------------------------------------\\
    /**
     * @description Retorna um objeto Date a partir de uma Data em String
     * @function 	retornaData
     * @author 		Rafael Delfino Calzado
     * @since 		15/02/2018
	 * 
     * @param  {String}  data		Data de Entrada
	 * @param  {String}	 formato	Formato de Entrada da Data
	 * 
     * @return {Date}  Retorna um objeto Date
     */
    //-----------------------------------------------------------------------\\ 

	fn.retornaData = function (data, formato) {
		var moment = require('moment');

		return moment(data, formato).toDate();
	}

	//-----------------------------------------------------------------------\\
    /**
     * @description Adiciona (ou remove) tempo em uma data
     * @function 	tempoAdd
     * @author 		Rafael Delfino Calzado
     * @since 		15/02/2018
	 * 
     * @param  {String}  data		Data de Entrada
	 * @param  {String}	 formato	Formato de Entrada da Data
	 * @param  {Number}  qtd  		Quantidade de tempo adicionada / removida
	 * @param  {Number}  tipo  		Tipo da adição ( ss, mm, HH, DD, MM, YYYY )
	 * 
     * @return {String}  Data alterada
     */
    //-----------------------------------------------------------------------\\ 

	fn.tempoAdd = function (data, formato, qtd, tipo){
    	var moment  = require('moment-timezone');

    	var add = moment(data, formato).add(qtd, tipo).format(formato);

    	return add;
	}

	//-----------------------------------------------------------------------\\

	fn.msToHMS = function (ms) {

		// 1- Convert to seconds:
		var seconds = ms / 1000;
		
		// 2- Extract hours:		
		var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
		seconds = seconds % 3600; // seconds remaining after extracting hours

		// 3- Extract minutes:
		var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute

		// 4- Keep only seconds not extracted to minutes:
		seconds = seconds % 60;
		
		if (seconds < 10) seconds = "0" + seconds;
		
		if (minutes < 10) minutes = "0" + minutes;
		
		if (hours < 10) hours = "0" + hours;
		
		return `${hours}:${minutes}:${seconds}`;
	}

	//-----------------------------------------------------------------------\\

	fn.validaData = function (dt) {

		var retorno = (dt) ? new Date(dt) : null;

    	return retorno;
	}

	//-----------------------------------------------------------------------\\

	return fn;
}
