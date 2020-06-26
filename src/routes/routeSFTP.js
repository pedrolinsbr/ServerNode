module.exports = function(app) {

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

	//::::::::::::::::::::::::::::::::::::::::\\
	
	var api = app.src.modSFTP.controllers.SFTPController;	
	app.get('/api/sftp/:operation', token, api.handler);

	//::::::::::::::::::::::::::::::::::::::::\\

	var api = app.src.modSFTP.controllers.FTPController;	
	app.get('/api/ftp/:operation', token, api.openFTP);

	//::::::::::::::::::::::::::::::::::::::::\\	

};
