module.exports = function (app, cb) {

    const fs = require('fs');
    const stream = require('stream');
    const logger = app.config.logger;

    const tmz = app.src.utils.DataAtual;

    const utilsDir = app.src.utils.Diretorio;

    const dirSave = process.env.FOLDER_SAVE;
    const dirDownload = process.env.FOLDER_DOWNLOAD;
    const dirContingency = process.env.FOLDER_CONTINGENCY;
    const dirExcel = process.env.FOLDER_XLSX;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
		 * @description Download da cópia do XML da última Delivery importada
		 * 
		 * @function downloadDelivery			
		 * @param   {Object} req	
		 * @param   {Object} req.params
		 * @param   {number} req.params.id ID da Delivery
         * 
		 * @returns {File} Retorna o arquivo XML
		 * @throws  {status(500) | string} Arquivo não encontrado
		 * 
		 * @author Rafael Delfino Calzado
		 * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\      

    api.downloadDelivery = function (req, res, next) {

        var file = `delivery-${req.params.id}.xml`;

        if (utilsDir.existsPath(`${dirSave}${file}`))
            res.sendFile(file, { root: dirSave });
        else
            res.status(500).send({ erro: 'Arquivo não encontrado' });
    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista os arquivos XML disponíveis para importação em Contingência
        *
        * @function listContingency
        * 
        * @requires module:config/logger
        * 
        * @returns {Array} Retorna um array com o resultado da pesquisa
        * @throws {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 26/12/2018
    */
    //-----------------------------------------------------------------------\\         

    api.listContingency = function (req, res, next) {

        logger.info('Listando Contingência');

        var arrList = utilsDir.listFiles(dirContingency, res, next);

        arrList.forEach((file) => {
            //var arFilename = file.filename.split('_');
            //file.CDDELIVE  = arFilename[1];			
            file.dtFile = tmz.formataData(file.atime, 'DD/MM/YYYY');
        });

        res.status(200).send(arrList);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista os arquivos XML disponíveis para importação
        *
        * @function listDownload			
        * @param  {Object} req  Parâmetros da pesquisa
        * 
        * @see {@link module:delivery/controllers/DeliveryClass~listDownload}
        * 
        * @requires module:config/logger
        * 
        * @returns {Array} Retorna um array com o resultado da pesquisa
        * @throws {Object} Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 03/04/2018
    */
    //-----------------------------------------------------------------------\\         

    api.listDownload = function (req, res, next) {

        logger.info('Listando Downloads');

        var arrList = utilsDir.listFiles(dirDownload, res, next);

        arrList.forEach((file) => {
            var arFilename = file.filename.split('_');
            file.CDDELIVE = arFilename[1];
            file.dtFile = tmz.formataData(file.atime, 'DD/MM/YYYY');
        });

        res.status(200).send(arrList);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Responável por baixar o modelo da planilha do contato dos cliente
        *
        * @function baixarModeloExcelContato			
        * @param  {Object} req  Parâmetros da pesquisa
        * 
        * @see 
        * 
        * @requires module:config/logger
        * 
        * @returns {Array} Retorna um array com o resultado da pesquisa
        * @throws {Object} Retorna a descrição do erro
        *
        * @author Marcos Henrique de Carvalho
        * @since 20/11/2019
    */
    //-----------------------------------------------------------------------\\

    api.baixarModeloExcelContato = async function (req, res, next) {
        try {
            logger.info('Listando Downloads');
            let dir = `${dirExcel}excel-modelo-contato.xlsx`;
            let excel = fs.readFileSync(dir, { encoding: 'base64' });
            var fileContents = Buffer.from(excel, 'base64');

            var readStream = new stream.PassThrough();
            readStream.end(fileContents);

            res.set('Content-disposition', 'attachment; filename=' + 'excel-modelo-contato.xlsx');
            res.set('Content-Type', 'application/excel');

            readStream.pipe(res);

        } catch (error) {
            throw error;
        }

    }
    //-----------------------------------------------------------------------\\
    /**
        * @description Responável por baixar o modelo da planilha da tabela de preco frete
        *
        * @function baixarModeloExcelPrecoFrete			
        * @param  {Object} req  Parâmetros da pesquisa
        * 
        * @see 
        * 
        * @requires module:config/logger
        * 
        * @returns {Array} Retorna um array com o resultado da pesquisa
        * @throws {Object} Retorna a descrição do erro
        *
        * @author Marcos Henrique de Carvalho
        * @since 20/11/2019
    */
    //-----------------------------------------------------------------------\\

    api.baixarModeloExcelPrecoFrete = async function (req, res, next) {
        try {
            let dir = `${dirExcel}modelo-tabela-preco-frete.xlsx`;
            let excel = fs.readFileSync(dir, { encoding: 'base64' });
            var fileContents = Buffer.from(excel, 'base64');

            var readStream = new stream.PassThrough();
            readStream.end(fileContents);

            res.set('Content-disposition', 'attachment; filename=' + 'modelo-tabela-preco-frete.xlsx');
            res.set('Content-Type', 'application/excel');

            readStream.pipe(res);

        } catch (error) {
            throw error;
        }

    }


    return api;

}