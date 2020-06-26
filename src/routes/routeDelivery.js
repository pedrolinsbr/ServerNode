module.exports = function (app) {

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

  	//::::::::::::::::::::::::::::::::::::::::

	var api = app.src.modDelivery.controllers.DeliveryController;

	app.get('/api/delivery/entrega/:id',    		token,  api.listaEntrega);
	app.get('/api/delivery/breaks',         		token,  api.listaImportacao);
	app.post('/api/delivery/importa', 				token,	api.importaDelivery);
	app.post('/api/delivery/ocorrencia/listar',     token,  api.listarOcorrenciasGrid);
	app.post('/api/delivery/ocorrencia/cancelar', 	token, 	api.cancelarOcorrencia);

	//::::::::::::::::::::::::::::::::::::::::
	  
	var api = app.src.modDelivery.controllers.XCortevaController;
	app.post('/api/corteva/importa', 		token,	api.importaXLS);

  	//::::::::::::::::::::::::::::::::::::::::

	var api = app.src.modDelivery.controllers.APIController;	
	app.post('/api/delivery/insere', 		token,	api.insereDelivery);

  	//::::::::::::::::::::::::::::::::::::::::

	
}
