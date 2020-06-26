module.exports = function (app, cb) {

    const utilsDir   = app.src.utils.Diretorio;
    const strDirWHMS = process.env.FOLDER_WHMS;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
		 * @description Download arquivo ASN
		 * 
		 * @function downloadWHMS
		 * @param   {Object} req	
		 * @param   {Object} req.params
		 * @param   {number} req.params.folder Tipo do MS
         * @param   {number} req.params.id ASN
         * 
		 * @returns {File} Retorna o arquivo XML
		 * @throws  {status(500) | string} Arquivo não encontrado
		 * 
		 * @author Luiz Gustavo Borges Bosco
		 * @since 22/10/2018
         * 
         * @author Allan Barcelos
         * @since 16/07/2019
         * 
         * @author Rafael Calzado
         * @since 17/07/2019
    */
    //-----------------------------------------------------------------------\\      

    api.downloadWHMS = function (req, res, next) {

        var strFile   = req.params.id;
        var strFolder = req.params.folder.toUpperCase();

        var strDirBase = `${strDirWHMS}${strFolder}/`;

        if (utilsDir.existsPath(`${strDirBase}${strFile}`))
            res.sendFile(strFile, { root: strDirBase });
        else
            res.status(500).send({ erro: 'Arquivo não encontrado' });
    }

    //-----------------------------------------------------------------------\\      

    return api;
}