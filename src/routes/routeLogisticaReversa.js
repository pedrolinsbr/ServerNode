module.exports = function (app) {

    var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    // ROTAS PARA RECUSA 4PL

    var api = app.src.modLogisticaReversa.controllers.Recusa4plController;

    app.post('/api/logrev/recusa-4pl/cancela',              token,  api.checkModel,     api.iniciaCancela);
    app.post('/api/logrev/recusa-4pl/cards',                token,  api.buscaRecusa4plCards);
    app.post('/api/logrev/recusa-4pl/backlog',              token,  api.buscaRecusa4plBacklog);
    app.post('/api/logrev/recusa-4pl/otimizando',           token,  api.buscaRecusa4plOtimiza);
    app.post('/api/logrev/recusa-4pl/transporte',           token,  api.buscaRecusa4plTransporte);
    app.post('/api/logrev/recusa-4pl/alteraetapa',          token,  api.alterarEtapaCarga);
    app.post('/api/logrev/recusa-4pl/otimiza/dados',        token,  api.buscaDadosOtimizacao);
    app.get('/api/logrev/recusa-4pl/delivery/:id',          token,  api.buscaDadosDelivery);
    app.get('/api/logrev/recusa-4pl/otimiza/:id',           token,  api.retiraBacklogRecusa);
    
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    //ROTAS DELIVERY

    var delivery = app.src.modLogisticaReversa.controllers.DeliveryController;

    app.post('/api/logisticaReversa/delivery/dashboard', token, delivery.getDashboardJsonAtu);
    app.post('/api/logisticaReversa/delivery/dashboardOtimizando', token, delivery.getDashboardOtimizando);
    app.post('/api/logisticaReversa/delivery/registrarContato', token, delivery.registrarContato);
    app.post('/api/logisticaReversa/delivery/qt-status', token, delivery.retQntStDelivery);
    app.post('/api/logisticaReversa/delivery/dashboardOtimizando/details', token, delivery.otimizandoDetails);
    app.post('/api/logisticaReversa/delivery/dashboard/statusCarga', token, delivery.alterarStatusCarga);
    app.post('/api/logisticaReversa/delivery/dashboard/confirmarColeta', token, delivery.confirmaColeta);
    app.post('/api/logisticaReversa/delivery/dashboard/salvarProtocolo', token, delivery.salvarProtocolo);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    //ROTAS DEVOLUÇÃO

    var devolucao = app.src.modLogisticaReversa.controllers.DevolucaoController;

    app.post('/api/logisticaReversa/delivery/dashboard', token, devolucao.getDashboardJsonAtu);
    app.post('/api/logisticaReversa/delivery/dashboardOtimizando', token, devolucao.getDashboardOtimizando);
    app.post('/api/logisticaReversa/delivery/registrarContato', token, devolucao.registrarContato);
    app.post('/api/logisticaReversa/delivery/qt-status', token, devolucao.retQntStDelivery);
    app.post('/api/logisticaReversa/delivery/dashboardOtimizando/details', token, devolucao.otimizandoDetails);
    app.post('/api/logisticaReversa/delivery/dashboard/statusCarga', token, devolucao.alterarStatusCarga);
    app.post('/api/logisticaReversa/delivery/dashboard/confirmarColeta', token, devolucao.confirmaColeta);
    app.post('/api/logisticaReversa/delivery/dashboard/salvarProtocolo', token, devolucao.salvarProtocolo);


    //ROTAS RECUSA
/*     var recusa = app.src.modLogisticaReversa.controllers.RecusaController;
    app.post('/api/logisticaReversa/recusadas/', token, recusa.listar);
    app.get('/api/logisticaReversa/recusada/:id', token, recusa.buscar); */

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    // ROTAS PARA DEVOLUÇÃO 4PL

    var api = app.src.modLogisticaReversa.controllers.Devolucao4plController;
    
    app.get('/api/logrev/devolucao-4pl/seleciona3pl/:id',       token,  api.selecionar3pl);
    app.post('/api/logrev/devolucao-4pl/cardsDevolucao4pl',     token,  api.cardsDevolucao4pl);
    app.post('/api/logrev/devolucao-4pl/listarDevolucao4pl',    token,  api.listarDevolucao4pl);    
    app.post('/api/logrev/devolucao-4pl/alteraetapa',           token,  api.alterarEtapaDelivery);            
    app.post('/api/logrev/devolucao-4pl/insereprotocolo',       token,  api.inserirProtocolo);
    app.post('/api/logrev/devolucao-4pl/cancelarcarga',         token,  api.cancelarCargaDev);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    // ROTAS PARA DEVOLUCAO 3PL

    var api = app.src.modLogisticaReversa.controllers.Devolucao3plController;
    
    app.post('/api/logrev/devolucao-3pl/cardsDevolucao3pl',     token,  api.cardsDevolucao3pl);
    app.post('/api/logrev/devolucao-3pl/listarDevolucao3pl',    token,  api.listarDevolucao3pl);        
    app.get('/api/logrev/devolucao-3pl/historico/:id',          token,  api.listarHistContato);
    app.put('/api/logrev/devolucao-3pl/registrarcontato',       token,  api.checkContato,           api.registrarContato);
    app.put('/api/logrev/devolucao-3pl/editarcarga',            token,  api.checkEdicao,            api.editarDadosCarga);
    app.put('/api/logrev/devolucao-3pl/confirmarcoleta',        token,  api.checkConfirmaColeta,    api.confirmarColeta);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

    //ROTAS PARA CADASTRO MAPTOP

    var api = app.src.modLogisticaReversa.controllers.MapTopController;
    
    app.get('/api/logrev/cad/maptop/lista/:id',         token,  api.lista);
    app.post('/api/logrev/cad/maptop/lista',            token,  api.lista);
    app.put('/api/logrev/cad/maptop/edita',             token,  api.checkModel,  api.edita);
    app.delete('/api/logrev/cad/maptop/remove/:id',     token,  api.remove);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

    //ROTAS PARA RELATORIOS 

    var api = app.src.modLogisticaReversa.controllers.RelatorioController;

    app.post('/api/logrev/relatorio/listarRelatorioDevolucao',  token,  api.listarRelatorioDevolucao);
    app.post('/api/logrev/relatorio/recusa',                    token,  api.listarRelatorioRecusa);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

    //ROTAS PARA RECUSA 
    var recusa = app.src.modLogisticaReversa.controllers.RecusaController;
    
    app.post('/api/logisticaReversa/recusa/cardsRecusa', token, recusa.cardsRecusa);
    
};