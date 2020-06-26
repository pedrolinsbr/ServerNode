module.exports = function(app) {

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

	//::::::::::::::::::::RELATORIOS::::::::::::::::::::

	var api = app.src.modOferecimento.controllers.RelatorioController;

	app.post('/api/oferecimento/rel/oferecimento',        token,   api.relOferecimento);
	app.post('/api/oferecimento/rel/distribuicao',        token,   api.relDistribuicao);

	//::::::::::::::::::::::CARGA:::::::::::::::::::::::	

	var api = app.src.modOferecimento.controllers.CargaController;

	app.get('/api/oferecimento/carga/spot/lista/:id',     	token,  api.calcFreteSpot); 
	app.post('/api/oferecimento/carga/spot/salva',        	token,  api.checkSpot,		     	api.salvaFreteSpot);
	app.post('/api/oferecimento/carga/distribui',         	token,  api.checkDistribuicao,     	api.distribuiCargas); 
	app.post('/api/oferecimento/carga/trocastatus',       	token,  api.checkTrocaStatus,      	api.trocaStatus);
	app.get('/api/oferecimento/frete/soma/:status',		 	token,  api.fretePanorama);
	app.get('/api/oferecimento/exigencias/:id',		  	 	token,  api.exigenciaCliente);
	app.get('/api/oferecimento/cotacao/cliente/:id',		token,  api.detalheCotacaoCliente);

	//::::::::::::::::::::::LISTA:::::::::::::::::::::::	

	var api = app.src.modOferecimento.controllers.ListaController;

	app.post('/api/oferecimento/carga/lista',             token,  api.listaCargas); 
	app.get('/api/oferecimento/carga/cabecalho/:id',      token,  api.listaCabecalho); 
	app.get('/api/oferecimento/carga/historico/:id',      token,  api.listaHistorico); 

	//::::::::::::::::::::::AVISO:::::::::::::::::::::::	

	var api = app.src.modOferecimento.controllers.AvisoController;

	app.post('/api/oferecimento/carga/aviso',             token,  api.checkAviso,             api.preparaAvisos);

	//::::::::::::::::::::::APROVA:::::::::::::::::::::::	

	var api = app.src.modOferecimento.controllers.AprovaController;

	app.put('/api/oferecimento/carga/motivo/aprova/insere',       token,  api.checkMotivoAprova,       api.insMotivoAprova);

	//::::::::::::::::::::MOTIVO::::::::::::::::::::\\	

	var api = app.src.modOferecimento.controllers.MotivoController;

	app.post('/api/oferecimento/cad/motivo/lista',            token,  api.lista);
	app.put('/api/oferecimento/cad/motivo/edita',             token,  api.checkModel,         api.edita);
	app.delete('/api/oferecimento/cad/motivo/remove/:id',     token,  api.remove);
	app.put('/api/oferecimento/carga/motivo/recusa/insere',   token,  api.checkMotivoRecusa,  api.insMotivoRecusa);

	//::::::::::::::::::::OFERECIMENTO::::::::::::::::::::\\

	var api = app.src.modOferecimento.controllers.RegraController;

    app.post('/api/oferecimento/cad/regra/busca',			    token,      api.checkModelEspec, 	api.buscaEspecialidade);
    app.post('/api/oferecimento/cad/regra/lista',			    token,      api.listaRegra);    
    app.put('/api/oferecimento/cad/regra/edita',                token,  	api.checkModelRegra,    api.editaRegra);    
    app.delete('/api/oferecimento/cad/regra/remove/:id',	    token,      api.removeRegra);

    app.put('/api/oferecimento/cad/part/insere',                token,      api.checkModelPart,     api.inserePart);        
    app.delete('/api/oferecimento/cad/part/remove/:id',	        token,      api.removePart);

    app.get('/api/oferecimento/cad/frota/lista/:id',            token,      api.listaFrota);
    app.put('/api/oferecimento/cad/frota/insere',               token,      api.checkModelFrota,     api.insereFrota);        

    app.get('/api/oferecimento/cad/regra/lista-3pl/:id',        token,      api.lista3PL);
    app.get('/api/oferecimento/cad/regra/lista-3pl-cad/:id',    token,      api.lista3PLRegra);
    
    //::::::::::::::NÍVEIS DE APROVAÇÃO:::::::::::::::\\	
    	
  	var api = app.src.modOferecimento.controllers.NivelController;

    app.post('/api/oferecimento/cad/nivel/lista',                 token,  api.lista);
    app.get('/api/oferecimento/cad/nivel/lista/:id',              token,  api.lista);    
    app.put('/api/oferecimento/cad/nivel/edita',                  token,  api.checkModel,          api.edita);
    app.delete('/api/oferecimento/cad/nivel/remove/:id',          token,  api.remove);

    app.get('/api/oferecimento/cad/nivel/lista-usuario/:id',      token,  api.listaUsuario);
    app.post('/api/oferecimento/cad/nivel/lista-usuario',         token,  api.listaUsuario);
    app.put('/api/oferecimento/cad/nivel/insere-usuario',         token,  api.checkUsuario,        api.insUsuario);
    app.delete('/api/oferecimento/cad/nivel/remove-usuario/:id',  token,  api.removeUsuario);
    
	//::::::::::::::::::::TRANSPORTADORA::::::::::::::::::::\\

	var api = app.src.modOferecimento.controllers.TransportadoraController;

	app.get('/api/oferecimento/cad/transportadora/lista-pc/:id',	token,	api.listaPC);
	app.get('/api/oferecimento/cad/transportadora/busca/:id',	    token,	api.listaTransp);
	app.post('/api/oferecimento/cad/transportadora/lista',          token,	api.listaTransp);
	app.post('/api/oferecimento/cad/transportadora/lista-gtp',		token,	api.listaGTP);
	app.put('/api/oferecimento/cad/transportadora/edita',           token,	api.editaTransp);
	app.delete('/api/oferecimento/cad/transportadora/remove/:id',   token,  api.removeTransp);

	//:::::::::::::::::::::::CONTATO:::::::::::::::::::::::\\

	var api = app.src.modOferecimento.controllers.ContatoController;	

	app.get('/api/oferecimento/cad/contato/busca/:id',			    token,	api.listaContato);
	app.post('/api/oferecimento/cad/contato/lista',				    token,	api.listaContato);

	app.get('/api/oferecimento/cad/contato-tipo/busca/:id',			token,	api.listaTipo);
	app.post('/api/oferecimento/cad/contato-tipo/lista',			token,	api.listaTipo);	

	app.put('/api/oferecimento/cad/contato/edita',					token,	api.checkModelContato,	api.editaContato);
	app.put('/api/oferecimento/cad/contato-tipo/edita',				token,	api.checkModelTipo,		api.editaTipo);

	app.delete('/api/oferecimento/cad/contato/remove/:id',			token,	api.removeContato);
	app.delete('/api/oferecimento/cad/contato-tipo/remove/:id',		token,	api.removeTipo);	

	//:::::::::::::::::::CLIENTE ESPECIAL::::::::::::::::::::\\

	var api = app.src.modOferecimento.controllers.EspecialController;

	app.post('/api/oferecimento/cad/especial/lista',			token,	api.listaCliEspecial);
	app.post('/api/oferecimento/cad/exigencia/lista',			token,	api.listaExige);
	app.get('/api/oferecimento/cad/exigencia/disponivel/:id',	token,	api.listaExigeDisp);
	app.get('/api/oferecimento/cad/exigencia/cadastrada/:id',	token,	api.listaExigeCliente);
	app.put('/api/oferecimento/cad/exigencia/altera',			token,	api.checaExige,	api.updExige);
	app.put('/api/oferecimento/cad/cliexige/insere',			token,	api.checaExigeCliente,	api.insereExigeCliente);


	//:::::::::::::::::::::::: OCORRENCIA :::::::::::::::::::::::::\\

	var ocorrencia = app.src.modOferecimento.controllers.OcorrenciaController;

	app.post('/api/oferecimento/ocorrencia/listar', token, ocorrencia.listar);
	app.post('/api/oferecimento/ocorrencia/aprovar', token, ocorrencia.aprovar);
	app.post('/api/oferecimento/ocorrencia/reprovar', token, ocorrencia.reprovar);

	//:::::::::::::::::::::::: FRETE :::::::::::::::::::::::::\\

	//var api = app.src.modOferecimento.controllers.FreteController;

	//app.get('/api/oferecimento/frete/calculo/:id?',		token,	api.calculaFrete);

}
