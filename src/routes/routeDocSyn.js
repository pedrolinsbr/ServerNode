module.exports = function(app) {
	
	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
	
	//::::::::::::::::::::::::::::::::::::::::

	var api = app.src.modDocSyn.controllers.XASNController;
	app.get('/api/docsyn/asn/generate',				token, 	api.newASN);	
	
	var api = app.src.modDocSyn.controllers.MSController;
	app.get('/api/docsyn/milestone/generate', 		token,	api.newMS);	
	app.get('/api/docsyn/milestone/tracking', 		token,	api.trackingMS);
	app.get('/api/entrega/cancela/:id', 			token,	api.cancelaEntrega);
	
	var api = app.src.modDocSyn.controllers.InvoiceController;
	app.get('/api/docsyn/invoice/generate', 		token,	api.newInvoice);
	
	var api = app.src.modDocSyn.controllers.PODController;
	app.get('/api/docsyn/pod/generate/:id', 		token,	api.newPOD);

	//::::::::::::::::::::::::::::::::::::::::

	var api = app.src.modDocSyn.controllers.ListDocController;

	app.post('/api/docsyn/download/asn',		token, api.listDocASN);
	app.post('/api/docsyn/download/invoice',	token, api.listDocInvoice);
	app.post('/api/docsyn/download/ms',			token, api.listDocMS);
	app.post('/api/docsyn/download/pod',		token, api.listDocPOD);
	  
	//::::::::::::::::::::::::::::::::::::::::	

	var api = app.src.modDocSyn.controllers.DownloadController;

	app.get('/api/delivery/listarDelivery', 		token,	api.listDownload);
	app.get('/api/delivery/listarContingencia', 	token,	api.listContingency);
	app.get('/api/delivery/download/:id',   		token,	api.downloadDelivery);	
	app.get('/api/cliente/downloadExcelContato',    token,	api.baixarModeloExcelContato);

	//MODELO DA PLANILHA DO PREÇO DO FRETE
	app.get('/api/teste/tabela/frete/downloadExcelFrete',    token,	api.baixarModeloExcelPrecoFrete);

	//::::::::::::::::::::::::::::::::::::::::

}
