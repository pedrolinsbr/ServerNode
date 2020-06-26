module.exports = function(app) {

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

	var api = app.src.modAG.controllers.AGController;	
    app.get('/api/ag/listar', 					token,	api.listaVendaAG);	
	app.get('/api/ag/post', 					token,	api.postAGList);
	app.post('/api/ag/delivery/cancela',		token,	api.cancelaDeliveryAG);
	app.post('/api/ag/delivery/calcularSLA',	token,	api.calcularSLA);
		
}
