module.exports = function (app) {

    var multer        = require('multer');
    var storageMulter = multer.memoryStorage();
    var uploadMulter  = multer({ storage: storageMulter });

    const dirUpload = process.env.FOLDER_UPLOAD;
  
    var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

    var utils = app.src.utils.Diretorio;


    app.post('/api/file/monitoria/upload',    token,  uploadMulter.any(), (req, res, next) => {        
        utils.uploadFilesMo(req, res, next);
    });

    app.post('/api/file/upload',    token,  uploadMulter.any(), (req, res, next) => {        
        utils.uploadFiles(req, res, next);
    });

    //::::::::::::::::::::::::::::::::::::::::\\    
    
    var api = app.src.modGlobal.controllers.DirController;

    app.post('/api/file/remove',    token,  api.removeFiles);  
    
    //::::::::::::::::::::::::::::::::::::::::\\    

    app.get('/api/upload/listar',   token,  (req, res, next) => {

        var arFiles = utils.listFiles(dirUpload);
        res.status(200).send(arFiles);
        
    });

    //::::::::::::::::::::::::::::::::::::::::\\

    var api = app.src.modGlobal.controllers.MultiDocController;

    app.post('/api/multidoc/info',          token,  api.getInfoDoc);
    app.get('/api/multidoc/download/:id',   token,  api.getBinaries);
    app.get('/api/multidoc/downloadCte/:id',   token,  api.getBinariesCTE);
    app.delete('/api/multidoc/remove/:id',  token,  api.removeDoc)
    app.put('/api/multidoc/save',           token,  uploadMulter.any(), (req, res, next) => {        
        api.saveDoc(req, res, next);
    });

    //::::::::::::::::::::::::::::::::::::::::\\    

};
