module.exports = function(app) {
	//var api = app.src.modTestes.controllers.CrlTestes;
	//app.get('/api/otimizador/teste', api.lista);	

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
	var api = app.src.modTestes.controllers.CrlTst;

	var multer        = require('multer');
	var storageMulter = multer.memoryStorage();
	var uploadMulter  = multer({ storage: storageMulter });
	
	app.put('/api/teste/insere',	token,	api.checkForm,	api.insere);
	app.put('/api/teste/altera', 	token,	api.checkForm,	api.altera);
	app.put('/api/teste/remove', 	token,  api.checkKeys,	api.remove);
		
	/*
	app.get('/api/socket', function(req, res){
		res.sendFile('index.html', { root: 'public/' });
	});
	*/

	var api = app.src.modTestes.controllers.tabelaPrecoController;
	
	app.get('/api/teste/tabela/removeClientTranspG088/:id', token, api.removeClientTranspG088);	
	app.post('/api/teste/tabela/addClientTranps', token, api.addClientTranps);	
	app.post('/api/teste/tabela/editarTabelaFrete', token, api.editarTabelaFrete);	
	app.post('/api/teste/tabela/listPrecoFrete', token, api.listPrecoFrete);	
	app.post('/api/teste/tabela/listCidadeDestino', token, api.listCidadeDestino);	
	app.get('/api/teste/tabela/listClientTransp/:id', token, api.listClientTransp);	
	app.get('/api/teste/tabela/preco', token, api.importPriceTable);	
	app.post('/api/teste/tabela/preco', token, uploadMulter.any(), (req, res, next) => {        
		api.importPriceTable(req, res, next);
	});		
	
	var api2 = app.src.modTestes.controllers.MarcoController;
	app.get('/api/marcoOracle', api2.marcoOracle);	

	app.post('/api/importarFrete', api2.importarFrete);	
			   
};
