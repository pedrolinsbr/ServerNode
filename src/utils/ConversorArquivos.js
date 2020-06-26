module.exports = function (app, cb) {

	const fs	  = require('fs');
	const parser  = require('xml2json'); //https://www.npmjs.com/package/xml2json  
	const promise = require('promise');

	const xpath	  = require('xpath')
	const xmldom  = require('xmldom').DOMParser;

	fn = {};

	//-----------------------------------------------------------------------\\

	fn.lerArquivo = function (path) {
		return fs.readFileSync(path, 'utf8');
	}

	//-----------------------------------------------------------------------\\

	fn.salvarArquivo = async function (path, conteudo) {
		fs.writeFileSync(path, conteudo);
	}

	//-----------------------------------------------------------------------\\

	fn.getXmlNodes = function (pattern, xmlDom) {
		//return xpath.evaluate(pattern, xmlDoc, null, xpath.XPathResult.ANY_TYPE, null);    
		return xpath.select(pattern, xmlDom);
	}

	//-----------------------------------------------------------------------\\

	fn.getXmlDom = function (strXml) {
		return new xmldom().parseFromString(strXml);
	}

	//-----------------------------------------------------------------------\\

	fn.converterXmlparaJson = function (strArquivo) {
		fs.readFile(strArquivo, function (err, data) {
			resultado = parser.toJson(data, { object: true, coerce: true });
			return res.status(200).send(resultado);
		});
	}

	//-----------------------------------------------------------------------\\

	fn.converterXmlparaJsonPromise = function (strArquivo) {
		return new promise(function (sucesso, erro) {

			fs.readFile(strArquivo, function (err, data) {
				if (err)
					return erro(err.message);
				else
					resultado = parser.toJson(data, { object: true, coerce: true });

				if (!resultado) return erro(err);
				else return sucesso(resultado);
			})
		})
	}

	//-----------------------------------------------------------------------\\

	fn.formataData = function (data) {
		//Entrada: yyyy-mm-dd 
		//Saída: dd/mm/yyyy

		var novaData = data.split('-'); //yyyy-mm-dd

		var sep = '/';
		var dia = novaData[2];
		var ano = novaData[0];
		var mes = novaData[1];

		return dia + sep + mes + sep + ano;
	}

	//-----------------------------------------------------------------------\\

	fn.formataDataOracle = function (data) {
		//Entrada: dd/mm/yyyy
		//Saída: dd/MMM/yyyy

		var sep = '/';
		var novaData = data.split(sep); //dd-mm-yyyy
		var arrMes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

		var dia = novaData[0];
		var mes = arrMes[parseInt(novaData[1]) - 1];
		var ano = novaData[2];

		return dia + sep + mes + sep + ano;
	}

	//-----------------------------------------------------------------------\\

	fn.formataDataHoraOracle = function (data) {
		//Entrada: dd/mm/yyyy
		//Saída: dd/MMM/yyyy

		var novaData = data.split(sep); //dd-mm-yyyy
		var arrMes = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

		var dia = novaData[0];
		var mes = arrMes[parseInt(novaData[1]) - 1];
		var ano = novaData[2];

		var time = new Date();

		var hours = time.getHours();
		var minutes = time.getMinutes();
		var seconds = time.getSeconds();

		return `${dia}/${mes}/${ano} ${hours}:${minutes}:${seconds}`;
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Verifica se a string de entrada é uma data válida
	 * @function 	isDate
	 * @author 		Rafael Delfino Calzado
	 * @since 		15/02/2018
	 * 
	 * @param  {String}  data  Data no formato yyyy/mm/dd ou yyyy-mm-dd
	 * 
	 * @return {Boolean} Retorna se a data é válida ou não
	*/
	//-----------------------------------------------------------------------\\ 

	fn.isDate = function (data) {

		var ok = (data.length > 0);

		if (ok) {

			var rxDatePattern = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;
			var dtArray = data.match(rxDatePattern);

			ok = (dtArray != null);

			if (ok) {

				var dtMonth = dtArray[3];
				var dtDay = dtArray[5];
				var dtYear = dtArray[1];
				var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));

				if (dtMonth < 1 || dtMonth > 12) {
					ok = false;
				} else if (dtDay < 1 || dtDay > 31) {
					ok = false;
				} else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) {
					ok = false;
				} else if (dtMonth == 2) {
					if (dtDay > 29 || (dtDay == 29 && !isleap)) ok = false;
				}

			}

		}

		return ok;
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Adiciona caracteres à esquerda da String de entrada
	 * @function 	LPad
	 * @author 		Rafael Delfino Calzado
	 * @since 		15/02/2018
	 * 
	 * @param  {String}  valorInicial Entrada original
	 * @param  {String}  strPad       String a ser pré-fixada
	 * @param  {Integer} qtd          Tamanho final da String
	 * 
	 * @return {String} Saída formatada
	*/
	//-----------------------------------------------------------------------\\ 

	fn.LPad = function (valorInicial, strPad, qtd) {
		var s = "";

		valorInicial = String(valorInicial);
		strPad = String(strPad);
		qtd = parseInt(qtd);

		for (var x = 0; x < (qtd - valorInicial.length); x++) s += strPad;

		s += valorInicial;

		return s;
	}

	//-----------------------------------------------------------------------\\

	// codificar para base 64
	fn.base64_encode = function (file) {
		// read binary data
		var bitmap = fs.readFileSync(file);
		// convert binary data to base64 encoded string
		return new Buffer(bitmap).toString('base64');
	}

	//-----------------------------------------------------------------------\\

	// formata dia e mes das datas que não são 2 dígitos
	fn.formataDiasMesDigitos = function (value) {
		var novo = '';
		if (value < 10) {
			novo = `0${value}`;
		} else {
			novo = value;
		}
		return novo;
	}

	//-----------------------------------------------------------------------\\

	return fn;
	
}
