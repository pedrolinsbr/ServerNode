module.exports = function (app) {

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

	var api = app.src.modPagFrete.controllers.LeitorController;
	app.get('/api/cte/leitura',			token,	api.mostrarDirCTe);
	app.get('/api/cte/download/:id',	token,  api.downloadCTe);
	app.post('/api/cte/excluir',		token,	api.excluirXML);
	
	var api = app.src.modPagFrete.controllers.MainController;
	app.get('/api/cte/ocorrencias',		token,	api.listarOcorrencias);
	app.post('/api/cte/salvar', 		token,	api.salvarCTe);
	app.post('/api/cte/buscar',			token,	api.buscarDadosCTe);

	var api = app.src.modPagFrete.controllers.CompController;
	app.get('/api/componente/listar',			token,	api.listarComponente);
	app.get('/api/componente/editar/:id',		token,	api.editarCompEmite);	
	app.post('/api/componente/inserir',			token,	api.inserirCompEmite);
	app.post('/api/componente/alterar',			token,	api.alterarCompEmite);
	app.post('/api/componente/buscar',			token,	api.buscarCompEmite);		
	app.delete('/api/componente/excluir/:id',	token,	api.excluirCompEmite);

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	var api = app.src.modPagFrete.controllers.List4PLController;
	app.post('/api/pgf/sync4pl/consulta',			token,	api.listSync4PL);
	app.get('/api/pgf/sync4pl/detail/:id',			token,	api.detailSync4PL);
	app.get('/api/pgf/download/xml/:NRCHADOC',		token,	api.getXML);

	var api = app.src.modPagFrete.controllers.List3PLController;
	app.post('/api/pgf/sync3pl/consulta',			token,	api.listSync3PL);
	app.get('/api/pgf/sync3pl/detail/:id',			token,	api.detailSync3PL);

	var api = app.src.modPagFrete.controllers.ListSinController;
	
	app.post('/api/pgf/sinistro/consulta',			token,	api.listND);
	app.get('/api/pgf/chamados/:id',				token,	api.listCalls);	

	var api = app.src.modPagFrete.controllers.ComponentController;
	app.put('/api/pgf/component/insert',			token,	api.checkForm, 	api.insertComp);
	app.delete('/api/pgf/component/delete/:id',		token,	api.deleteComp);
	app.get('/api/pgf/component/listcad/:id',		token,	api.listCompCad);
	app.get('/api/pgf/component/list3pl/:id',		token,	api.listComp3PL);

	var api = app.src.modPagFrete.controllers.ZDocController;
	app.get('/api/pgf/document/listfiles',			token,	api.listDocFiles);
	app.get('/api/pgf/document/importdoc',			token,	api.importDoc);
	app.post('/api/pgf/document/occurrence',		token,	api.listOccurrence);

	var api = app.src.modPagFrete.controllers.ListOrdersController;
	app.post('/api/pgf/orders/consulta',			token,	api.listOrders);

}
