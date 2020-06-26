module.exports = function(app) {
	
	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

	//::::::::::::::::::::::ACEITE:::::::::::::::::::::::::::	

	var api = app.src.modOferece.controllers.AceiteController;

	app.get('/api/aceite/lista-id/:id',					token,	api.listaID);
	app.get('/api/aceite/lista-3pl',					token,	api.lista3PL); 
	app.get('/api/aceite/lista-tomador/:id',			token,	api.listaTomador);
	app.get('/api/aceite/lista-tomador-descarga/:id',	token,	api.listaTomadorDescarga);
	app.post('/api/aceite/lista-agenda',				token,	api.listaAgenda);	
	app.post('/api/aceite/lista',						token,	api.lista);	
	app.post('/api/aceite/altera',						token,	api.altera);
	app.post('/api/aceite/altera-dtent',				token,	api.alteraDataEntrega);

	//::::::::::::::::::::::AVISOS:::::::::::::::::::::::::::	

	var api = app.src.modOferece.controllers.AvisoController;

	app.post('/api/aviso/envia',				token,	api.envia);

	//:::::::::::::::::::RELATORIOS:::::::::::::::::::::::::::

	var api = app.src.modOferece.controllers.RelatorioController;	

	app.post('/api/carga/distribuicao',			token,	api.distribuicao);
	app.post('/api/carga/realizado',			token,	api.realizado);
	app.post('/api/carga/recusada',				token,	api.recusada);

	//::::::::::::::::::::::CARGA::::::::::::::::::::::::::::

	var api = app.src.modOferece.controllers.CargaController;	
	
	app.get('/api/carga/lista-tpcarga',			token,	api.listaTipoCarga);	
	app.get('/api/carga/lista-3pl/:id',			token,	api.lista3PL);	
	app.get('/api/carga/lista-etapa/:id',		token,	api.listaEtapa);	
	app.get('/api/carga/historico/:id',			token,	api.historico);
	app.get('/api/carga/cabecalho',				token,	api.cabecalho);	

	app.post('/api/aceite/cabecalho',			token,	api.cabecalho);	

	app.post('/api/carga/lista-tpv',			token,	api.listaTPV);		
	app.post('/api/carga/altera-tpv',			token,	api.alteraTPV);
	app.post('/api/carga/altera-dtcol',			token,	api.alteraDataColeta);	
	app.post('/api/carga/lista',				token,	api.lista);	
	app.post('/api/carga/spot',					token,	api.spot);
	app.post('/api/carga/recusa',				token,	api.recusa);
	app.post('/api/carga/distribui',			token,	api.distribuiCargas);

	//:::::::::::::::::::::::CONTATO:::::::::::::::::::::::::

	var api = app.src.modOferece.controllers.ContatoController;	

	app.get('/api/contato/edita/:id',			token,	api.edita);
	app.get('/api/contato/edita-tipo/:id',		token,	api.editaTipo);
	app.post('/api/contato/lista',				token,	api.lista);
	app.post('/api/contato/lista-tipo',			token,	api.listaTipo);
	app.post('/api/contato/lista-cargo',		token,	api.listaCargo);
	app.post('/api/contato/lista-setor',		token,	api.listaSetor);		
	app.post('/api/contato/insere',				token,	api.insere);
	app.post('/api/contato/insere-tipo',		token,	api.insereTipo);
	app.post('/api/contato/altera',				token,	api.altera);
	app.post('/api/contato/altera-tipo',		token,	api.alteraTipo);
	app.delete('/api/contato/exclui/:id',		token,	api.exclui);
	app.delete('/api/contato/exclui-tipo/:id',	token,	api.excluiTipo);

	//:::::::::::::::::::::::::EMAIL:::::::::::::::::::::::::

	var api = app.src.modGlobal.controllers.EmailController;

	app.post('/api/email/envio',				token,	api.envio);

	//::::::::::::::::::::::::MOTIVO:::::::::::::::::::::::::
	
	var api = app.src.modOferece.controllers.MotivoController;
	
	app.get('/api/motivo/edita/:id',		token,	api.edita); 
	app.post('/api/motivo/lista',			token,	api.lista);
	app.post('/api/motivo/insere',			token,	api.insere);
	app.post('/api/motivo/altera', 			token,	api.altera);		
	app.delete('/api/motivo/exclui/:id',	token,	api.exclui);
	app.delete('/api/motivo/remove/:id',	token,	api.remove);

	//:::::::::::::::::::::::OTIMIZADOR::::::::::::::::::::::	

	var api = app.src.modOferece.controllers.OtimizadorController;

	app.get('/api/otimizador/edita/:id',			token,	api.edita); 
	app.post('/api/otimizador/lista',				token,	api.lista);
	app.post('/api/otimizador/insere',				token,	api.insere);
	app.post('/api/otimizador/altera', 				token,	api.altera);
	app.delete('/api/otimizador/exclui/:id',		token,	api.exclui);

	app.get('/api/otimizador/lista-tpv/:id',		token,	api.listaTPV);
	app.get('/api/otimizador/lista-tpv-cad/:id',	token,	api.listaTPVCad);
	app.post('/api/otimizador/insere-tpv',			token,	api.insereTPV);
	app.delete('/api/otimizador/remove-tpv/:id',	token,	api.removeTPV);

	//::::::::::::::::::::::::::REGRA::::::::::::::::::::::::

	var api = app.src.modOferece.controllers.RegraController;

	app.get('/api/regra/edita/:id',				token,	api.edita);
	app.post('/api/regra/lista',				token,	api.lista);	
	app.post('/api/regra/insere',				token,	api.insere);
	app.post('/api/regra/altera', 				token,	api.altera);
	app.delete('/api/regra/exclui/:id',			token,	api.exclui);

	app.post('/api/regra/busca',				token,	api.busca);	
	app.post('/api/regra/lista-armazem',		token,	api.listaArmazem);

	app.get('/api/regra/lista-r3pl/:id',		token,	api.listaR3PL);
	app.get('/api/regra/lista-r3pl-cad/:id',	token,	api.listaR3PLCad);
	app.post('/api/regra/insere-r3pl',			token,	api.insereR3PL);	
	app.delete('/api/regra/remove-r3pl/:id',	token,	api.removeR3PL);

	app.get('/api/regra/lista-rtpv/:id',		token,	api.listaRTPV);
	app.get('/api/regra/lista-rtpv-cad/:id',	token,	api.listaRTPVCad);
	app.post('/api/regra/insere-rtpv',			token,	api.insereRTPV);	
	app.delete('/api/regra/remove-rtpv/:id',	token,	api.removeRTPV);
		
	//::::::::::::::::::::TIPO DE VEÍCULOS:::::::::::::::::::	

	var api = app.src.modOferece.controllers.TipoVeiculoController;
	
	app.get('/api/tpveiculo/edita/:id',		token,	api.edita); 
	app.post('/api/tpveiculo/lista',		token,	api.lista);
	app.post('/api/tpveiculo/insere',		token,	api.insere);
	app.post('/api/tpveiculo/altera', 		token,	api.altera);		
	app.delete('/api/tpveiculo/exclui/:id',	token,	api.exclui);
	app.delete('/api/tpveiculo/remove/:id',	token,	api.remove);

	//::::::::::::::::::::TRANSPORTADORA:::::::::::::::::::::	

	var api = app.src.modOferece.controllers.TransportadoraController;
	
	app.get('/api/transportadora/edita/:id',		token,	api.edita); 
	app.get('/api/transportadora/lista-pc/:id',		token,	api.listaPCAtende);
	app.post('/api/transportadora/lista-gtp',		token,	api.listaGTP);
	app.post('/api/transportadora/lista',			token,	api.lista);
	app.post('/api/transportadora/insere',			token,	api.insere);
	app.post('/api/transportadora/altera', 			token,	api.altera);		
	app.delete('/api/transportadora/exclui/:id',	token,	api.exclui);
	app.delete('/api/transportadora/remove/:id',	token,	api.remove);
	
	//::::::::::::::::::::::::VIAGEM:::::::::::::::::::::::::	

	var api = app.src.modOferece.controllers.ViagemController;

	app.post('/api/viagem/insere',			token,	api.insere);	

	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::	
	
	var api = app.src.modOferece.controllers.RelOfereceController;

	app.post('/api/reloferece/listar',         token, api.listar);

	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::
};
