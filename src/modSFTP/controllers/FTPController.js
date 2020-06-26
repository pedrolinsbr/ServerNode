module.exports = function (app, cb) {
        
    const ftpClass  = require('ftp');	
    const fs        = require('fs');
    const logger    = app.config.logger;   

    var api = {};

    //-----------------------------------------------------------------------\\   

    api.openFTP = async function (req, res, next) {
       
        var objFTP = {
                host: 'ftp.mecanica.ufrgs.br'
            ,	port: 21
            ,	user: 'anonymous'
            ,   password: null
            ,	remoteDir: '/hpveedemo/demo5/www/'
            ,   localDir:  '../xml/download/'
            ,   remoteDel: false
            ,   localDel:  false            
        };

        var client = new ftpClass();

        try {

            client.on('ready', () => {

                logger.info(`Conectado em ${objFTP.host}:${objFTP.port}`);
    
                switch (req.params.operation) {
                    case 'download':
                        api.listRemoteFiles(client, objFTP);
                        break;

                    default:
                        client.end();
                        break;
                }
    
            });            
            
            client.connect(objFTP);            
    
            res.status(200).send({ ok: true });

        } catch(err) {

            res.status(500).send(err);

        }
            
    }

    //-----------------------------------------------------------------------\\    

    api.listRemoteFiles = function (client, objFTP) {

        client.cwd(objFTP.remoteDir, (err, list) => {
            if (err) throw err;

            client.list((err, list) => {
                if (err) throw err;

                logger.info(`${list.length} arquivos encontrados`);

                for (var file of list) 
                   if (file.type != 'd') this.getFile(objFTP, file.name);                

                client.end();
    
            });

        });

    }

    //-----------------------------------------------------------------------\\

    api.getFile = function (objFTP, filename) {
        
        var client = new ftpClass();

        try {

            client.on('ready', () => {

                client.cwd(objFTP.remoteDir, (err, list) => {
                    if (err) throw err;

                    logger.info(`Baixando arquivo ${objFTP.remoteDir}${filename}`);

                    client.get(filename, (err, stream) => {
                        if (err) throw err;

                        stream.once('close', () => { 

                            if (objFTP.remoteDel) {

                                client.delete(filename, (err, stream) => {
                                    if (err) throw err;

                                    logger.info(`Arquivo remoto ${objFTP.remoteDir}${filename} removido`);
                                    client.end();

                                });

                            } else { 

                                client.end();

                            }

                        });

                        stream.pipe(fs.createWriteStream(`${objFTP.localDir}${filename}`));
                        logger.info(`Arquivo ${filename} salvo em ${objFTP.localDir}`);

                    });

                });

            });

            client.connect(objFTP);

        } catch (err) {

            throw err;

        }        

    }

    //-----------------------------------------------------------------------\\

    return api;

}