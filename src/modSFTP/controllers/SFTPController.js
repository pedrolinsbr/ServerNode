module.exports = function (app, cb) {

	//const Client = require('ssh2-sftp-client');
	const Client = require('ssh2').Client;
	const fs = require('fs');

	const logger = app.config.logger;

	const strUpDir = process.env.FOLDER_UPLOAD;
	const strDownDir = process.env.FOLDER_DOWNLOAD;

	const keyFile = fs.readFileSync('../key/id_rsa');

	var vlTimeout = 5000; // 5 segundos

	var api = {};

	var objConn = {
		host: 'integration-test.gtnexus.com'
		, port: 18222
		, username: 'bravosftp'
	//	, password: ':syn@#$%!'
		, privateKey: keyFile
		, remoteDir: '/bravosftp/'
		, delLocal: true
		, delRemote: false
		, maxNumDownloads: 200
		, debug: (a) => { logger.info(a) }
		, algorithms: {
			kex: ['diffie-hellman-group1-sha1'],
			serverHostKey: ['ssh-dss'],
			cipher: ['aes256-ctr']
		}
	}

	if ((process.env.APP_ENV == 'PRD') || (process.env.APP_ENV == 'EVT')) {
		objConn.host = 'integration.gtnexus.com';
		objConn.port = 8222
	}

	//-----------------------------------------------------------------------\\   

	api.handler = function (req, res, next) {

		try {

			api.sftpHandler(req.params.operation, res, next);
			res.status(200).send({ ok: true });

		} catch (err) {
			res.status(500).send(err);

		}

	}

	//-----------------------------------------------------------------------\\        
    /**
		 * @description Manipulador de conexão remota via SSH/SFTP
		 * 
		 * @function sftpHandler			
		 * @param   {String} operation Tipo de operação a ser realizada
         * 
		 * @throws  {Object} Descrição do erro
		 * 
		 * @author Rafael Delfino Calzado
		 * @since 12/07/2018
    */
	//-----------------------------------------------------------------------\\

	api.sftpHandler = function (operation, res, next) {

		try {
			var conn = new Client();

			logger.info(`Iniciando conexao ao servidor ${objConn.host}`);

			conn.on('ready', () => {
				logger.info(`Conectado ao servidor ${objConn.host}`);

				conn.sftp((err, sftpStream) => {

					if (err) {

						logger.error(err);
						//throw err; 

					} else {

						switch (operation) {

							case 'download':
								this.download(conn, sftpStream);
								break;

							case 'upload':
								this.upload(conn, sftpStream);
								break;

							default:
								this.sftpClose(conn, sftpStream);
								break;

						}

					}

				});

			}).on('end', () => {
				logger.info('Cliente SFTP encerrado');

			}).on('close', () => {
				logger.info('Conexão finalizada');

			}).on('error', (err) => {
				logger.error(`Erro ao conectar no servidor ${objConn.host}`);
				logger.error(err);

			}).connect(objConn);

		} catch (err) {
			logger.error(err);
		}
	}

	//-----------------------------------------------------------------------\\
    /**
		 * @description Encerra a conexão 
		 * 
		 * @function sftpClose
		 * @param   {Object} conn           Manipulador da conexão
         * @param   {Object} sftpStream     Manipulador de arquivos
         * 	
		 * @author Rafael Delfino Calzado
		 * @since 02/08/2018
    */
	//-----------------------------------------------------------------------\\    

	api.sftpClose = function (conn, sftpStream) {

		sftpStream.end();
		conn._sshstream.channelClose(0);
		conn.end();
		conn._channels = {};
		conn = null;
	}

	//-----------------------------------------------------------------------\\
    /**
		 * @description Loop de arquivos para download
		 * 
		 * @function download
		 * @param   {Object} conn           Manipulador da conexão
         * @param   {Object} sftpStream     Manipulador de arquivos
         * 
		 * @throws  {Object} Descrição do erro
		 * 
		 * @author Rafael Delfino Calzado
		 * @since 12/07/2018
    */
	//-----------------------------------------------------------------------\\    

	api.download = function (conn, sftpStream) {

		sftpStream.readdir(objConn.remoteDir, (err, list) => {

			if (err) {

				logger.error(`Erro ao tentar ler o diretório remoto ${objConn.remoteDir} - ${err}`);
				this.sftpClose(conn, sftpStream);

			} else {

				if ((Array.isArray(list)) && (list.length > 0)) {

					list = list.slice(0, objConn.maxNumDownloads);

					for (var i in list)
						this.getFile(conn, sftpStream, list, i);

				} else {

					logger.info(`Diretório remoto vazio`);
					this.sftpClose(conn, sftpStream);

				}

			}

		});

	}

	//-----------------------------------------------------------------------\\    
    /**
		 * @description Manipulador de download
		 * 
		 * @function getFile
		 * @param   {Object}  conn           Manipulador da conexão
         * @param   {Object}  sftpStream     Manipulador de arquivos
         * @param   {Array}   list           Lista de arquivos a ser
         * @param   {Integer} i              Índice da lista de arquivos
         * 
		 * @throws  {Object} Descrição do erro
		 * 
		 * @author Rafael Delfino Calzado
		 * @since 12/07/2018
    */
	//-----------------------------------------------------------------------\\

	api.getFile = function (conn, sftpStream, list, i) {

		var filename = list[i];
		var strRemoteFile = `${objConn.remoteDir}${filename.filename}`;
		var strLocalFile = `${strDownDir}${filename.filename}`;

		sftpStream.fastGet(strRemoteFile, strLocalFile, (err) => {

			if (err) {

				logger.error(`Erro ao tentar salvar localmente o arquivo ${strLocalFile} - ${err}`);

			} else {

				logger.info(`Arquivo ${strLocalFile} salvo localmente`);

				if (objConn.delRemote) {

					sftpStream.unlink(strRemoteFile, (err) => {

						if (err)
							logger.error(`Erro ao tentar remover o arquivo ${strRemoteFile} do servidor remoto`);
						else
							logger.info(`Arquivo ${strRemoteFile} removido do servidor remoto`);

					});

				}

			}

			if ((parseInt(i) + 1) == list.length)
				setTimeout(() => { this.sftpClose(conn, sftpStream) }, vlTimeout);

		});

	}

	//-----------------------------------------------------------------------\\
    /**
		 * @description Loop de arquivos para upload
		 * 
		 * @function upload
		 * @param   {Object} conn           Manipulador da conexão
         * @param   {Object} sftpStream     Manipulador de arquivos
         * 
		 * @throws  {Object} Descrição do erro
		 * 
		 * @author Rafael Delfino Calzado
		 * @since 12/07/2018
    */
	//-----------------------------------------------------------------------\\   

	api.upload = function (conn, sftpStream) {

		var list = fs.readdirSync(strUpDir);

		if ((Array.isArray(list)) && (list.length > 0)) {

			for (var i in list) {
				if (list[i].indexOf('BravoDocumentFolderInbound_DEL') < 0) {
					this.putFile(conn, sftpStream, list, i);
				}
			}

		} else {

			logger.info(`Diretório local vazio`);
			this.sftpClose(conn, sftpStream);

		}

	}

	//-----------------------------------------------------------------------\\
    /**
		 * @description Manipulador de upload
		 * 
		 * @function putFile
		 * @param   {Object}  conn           Manipulador da conexão
         * @param   {Object}  sftpStream     Manipulador de arquivos
         * @param   {Array}   list           Lista de arquivos a ser
         * @param   {Integer} i              Índice da lista de arquivos
         * 
		 * @throws  {Object} Descrição do erro
		 * 
		 * @author Rafael Delfino Calzado
		 * @since 12/07/2018
    */
	//-----------------------------------------------------------------------\\      

	api.putFile = function (conn, sftpStream, list, i) {

		var filename = list[i];
		var strRemoteFile = `${objConn.remoteDir}${filename}`;
		var strLocalFile = `${strUpDir}${filename}`;

		sftpStream.fastPut(strLocalFile, strRemoteFile, (err) => {

			if (err) {

				logger.error(`Erro ao tentar enviar remotamente o arquivo ${strRemoteFile} - ${err}`);

			} else {

				logger.info(`Arquivo ${strRemoteFile} salvo remotamente`);

				if (objConn.delLocal) {

					fs.unlink(strLocalFile, (err) => {

						if (err)
							logger.error(`Erro ao remover o arquivo ${strLocalFile} do servidor local`);
						else
							logger.info(`Arquivo ${strLocalFile} removido do servidor local`);

					});

				}

			}

			if ((parseInt(i) + 1) == list.length)
				setTimeout(() => { this.sftpClose(conn, sftpStream) }, vlTimeout);

		});

	}

	//-----------------------------------------------------------------------\\         

	return api;

}