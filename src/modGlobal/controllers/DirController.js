module.exports = function (app, cb) {

    var api = {};

    const utilsDir   = app.src.utils.Diretorio;
    
    const dirDownload    = process.env.FOLDER_DOWNLOAD;
    const dirContingency = process.env.FOLDER_CONTINGENCY;

    //-----------------------------------------------------------------------\\
    /**
     * @description Remove arquvivos de um diretório
     *
     * @async 
     * @function removeFiles
     * @param  	{Array}     req.body.files Array com o path do arquivo a ser deletado
     * @param  	{String}    req.body.dir   Apelido do diretório a ser listado
     * @returns {Array}     Retorna array com os arquivos removidos
     * 
     * @author Rafael Delfino Calzado
     * @since 11/09/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.removeFiles = async function (req, res, next) {

        var arFiles = [];

        if (req.body.hasOwnProperty('dir')) {

            switch (req.body.dir.toUpperCase()) {

                case 'CTG':
                    var nmDir = dirContingency;
                    break;
            
                default:
                    var nmDir = dirDownload;
                    break;

            }

        } else {
            var nmDir = dirDownload;
        }
        

        if (Array.isArray(req.body.files)) {

            for (var file of req.body.files)
                arFiles.push(`${nmDir}${file}`);

            await utilsDir.removeFiles(arFiles, res, next)

            .catch((err) => { res.status(500).send(err) })
            .then((files) => { res.status(200).send(files) });

        } else {

            res.status(400).send(arFiles);

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}