module.exports = function (app, cb) {

	const fs		= require('fs');
    const logger    = app.config.logger;

	var fn = {};

	//-----------------------------------------------------------------------\\
	/**
	 * @description Retorna os dados do arquivo informado
	 * @author Rafael Delfino Calzado
	 * @since 22/05/2018
	 *
	 * @function getFileStatus
	 * @param 	{String}  path Caminho do arquivo
	 * @return 	{Object}  Dados do arquivo
	*/
	 //-----------------------------------------------------------------------\\

	 fn.getFileStatus = function (path) { return fs.statSync(path) }

	//-----------------------------------------------------------------------\\
	/**
	 * @description Verifica a existência de um path
	 * @author Rafael Delfino Calzado
	 * @since 13/06/2018
	 *
	 * @param {String} path Caminho a ser verificado
	 * @function existsPath
	 * @return {Boolean} Resultado da verificação
	*/
	 //-----------------------------------------------------------------------\\

	 fn.existsPath = function (path) { return fs.existsSync(path) }

	//-----------------------------------------------------------------------\\
	/**
	 * @description Salva o conteúdo de uma string em um arquivo
	 * @author Rafael Delfino Calzado
	 * @since 19/07/2018
	 *
	 * @param {String} path   Caminho do arquivo a ser salvo
	 * @param {String} buffer Conteúdo do arquivo a ser salvo
	 *
	 * @function saveFile
	*/
	//-----------------------------------------------------------------------\\

	fn.saveFile = function (path, buffer) {
		fs.writeFileSync(path, buffer);
		logger.info(`Arquivo salvo em ${path}`);
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Lista o conteúdo de um diretório em um array
	 * @author Rafael Delfino Calzado
	 * @since 05/12/2017
	 *
	 * @param {String} path Diretório a ser listado
	 * @function listFiles
	 * @return {Array} Conteúdo do diretório informado
	*/
	 //-----------------------------------------------------------------------\\

	fn.listFiles = function (path) {

		var files = [];

		if (fs.existsSync(path)) {

			fs.readdirSync(path).forEach(file => {
				var objFile = fs.statSync(`${path}${file}`);
				objFile.filename = file;

				files.push(objFile);
			});
		}

		return files;
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Copia um arquivo de uma pasta a outra, com a opção de renomeá-lo
	 * @author Rafael Delfino Calzado
	 * @since 05/06/2018
	 *
	 * @async
	 * @param {String}  dirOrigem    Diretório de Origem
	 * @param {String}  dirDestino   Diretório de Destino
	 * @param {String}  nmArqOrigem  Arquivo de Origem
	 * @param {String}  nmArqDestino Arquivo de Destino (opcional)
	 * @function copyFile
	*/
	//-----------------------------------------------------------------------\\

    fn.copyFile = async function (req) {

        if (fs.existsSync(`${req.dirOrigem}${req.nmArqOrigem}`)) {

			if (!req.hasOwnProperty('nmArqDestino')) req.nmArqDestino = req.nmArqOrigem;

            var strOrigem  = `${req.dirOrigem}${req.nmArqOrigem}`;
            var strDestino = `${req.dirDestino}${req.nmArqDestino}`;

            logger.info(`Copiando o arquivo ${strOrigem} para ${strDestino}`);
            await fs.copyFile(strOrigem, strDestino, ((err) => { if (err) throw err }));
        }

	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Chamada de dupla função que salva o conteúdo e duplica o arquivo
	 * @author Rafael Delfino Calzado
	 * @since 18/07/2018
	 *
	 * @param {Object}  objArq	Parâmetros do arquivo a ser salvo
	 *
	 * @function saveAndCopy
	*/
	//-----------------------------------------------------------------------\\

    fn.saveAndCopy = function (objArq, res, next) {

        this.saveFile(`${objArq.dirOrigem}${objArq.nmArqOrigem}`, objArq.buffer);
        this.copyFile(objArq, res, next);

    }

	//-----------------------------------------------------------------------\\
	/**
	 * @description Move um arquivo de uma pasta a outra, com a opção de renomeá-lo
	 * @author Rafael Delfino Calzado
	 * @since 05/06/2018
	 *
	 * @async
	 * @param {String}  dirOrigem    Diretório de Origem
	 * @param {String}  dirDestino   Diretório de Destino
	 * @param {String}  nmArqOrigem  Arquivo de Origem
	 * @param {String}  nmArqDestino Arquivo de Destino (opcional)
	 * @function moveFile
	*/
	//-----------------------------------------------------------------------\\

    fn.moveFile = async function (req) {

        if (fs.existsSync(`${req.dirOrigem}${req.nmArqOrigem}`)) {

			if (!req.hasOwnProperty('nmArqDestino')) req.nmArqDestino = req.nmArqOrigem;

            var strOrigem  = `${req.dirOrigem}${req.nmArqOrigem}`;
            var strDestino = `${req.dirDestino}${req.nmArqDestino}`;

            logger.info(`Movendo o arquivo ${strOrigem} para ${strDestino}`);
            await fs.rename(strOrigem, strDestino, ((err) => { if (err) throw err }));
        }

    }

	//-----------------------------------------------------------------------\\

	/**
	 * @description Lista o conteúdo de um diretório em um array
	 * @author João Eduardo Saad
	 * @since 01/03/2018
	 *
	 * @async
	 * @function fn/listFilesInterno
	 * @return {Array} Conteúdo do diretório informado
	*/

	fn.listFilesInterno = async function (req) {
		var files = [];
		//console.log(" Lendo Arquivos ");
		fs.readdirSync(req).forEach(file => {
			// var objFile = fs.statSync(`${req}${file}`);
			// objFile.filename = file;
			//console.log("\t \t Arquivo:" + file);

			files.push(file);
		});

		return files;
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Deleta um conjunto de arquivos informados em um array
	 * @author Rafael Delfino Calzado
	 * @since 05/06/2018
	 *
	 * @async
	 * @param {Array}   req	 Array de arquivos a serem excluídos
	 * @function removeFiles
	*/
	//-----------------------------------------------------------------------\\

	fn.removeFiles = async function (req, res, next) {

		var arFiles = [];

		for (var file of req) {

			if (fs.existsSync(file)) {

				arFiles.push(file);
				fs.unlinkSync(file);
			}

		}

		return arFiles;
	}

	//-----------------------------------------------------------------------\\
	/**
	 * @description Salva arquivos do Memory Storage para o disco
	 * @author Rafael Delfino Calzado
	 * @since 07/06/2018
	 *
	 * @function uploadFiles
	 * @param    {Array}	files 	Array de arquivos a serem salvos
	 * @param    {String}	dir		Legenda do diretório de destino
	 * @returns  {Array}			Lista de Arquivos
	 * @throws   {Object}			Objeto com o erro
	*/
	//-----------------------------------------------------------------------\\

    fn.uploadFiles = function (req, res, next) {

		if ((Array.isArray(req.files)) &&
			(req.files.length > 0) &&
			(req.body.dir))  {

			var arFiles = [];

			//======================================\\

			switch (req.body.dir.toUpperCase()) {

				case 'DOWNLOAD':
					var strDir = process.env.FOLDER_DOWNLOAD;
					break;

				case 'CTG': //Delivery de Contingência Syngenta
					var strDir = process.env.FOLDER_CONTINGENCY;
					break;

				case 'XLSX': //PLANILHAS DE OCUPAÇÃO DASHBOARD
					var strDir = process.env.FOLDER_XLSX;
					break;

				default: //CTE
					var strDir = process.env.FOLDER_CTE_IN;
					break;

			}

			//======================================\\

			for (var file of req.files) {

				fs.writeFile(`${strDir}${file.originalname}`, file.buffer, 'binary', (err) => {
					if (err) throw(err);
				});

				arFiles.push(file.originalname);
			}

			res.status(200).send(arFiles);

		} else {

			res.status(400).send({ msg: 'Diretório / Arquivo(s) não informados '});

		}

	}

	return fn;
}
