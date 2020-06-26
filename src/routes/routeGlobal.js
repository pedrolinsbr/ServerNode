module.exports = function(app) {
	
    
    var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

	//::::::::::::::::::::GLOBAL::::::::::::::::::::\\

    var api = app.src.modGlobal.controllers.MenuAcoesController;
    
    app.post('/api/global/acoes/busca',     token,      api.checkModel,     api.buscaAcoes);
 
    var sysUpdates = app.src.modGlobal.controllers.SysUpdatesController;
    app.post('/api/global/updates/getSistemas', token, sysUpdates.getSistemas);
    app.post('/api/global/updates/getModulos', token, sysUpdates.getModulos);
    app.post('/api/global/updates/listar', token, sysUpdates.listar);
    app.post('/api/global/updates/tiposUpdate', token, sysUpdates.tiposUpdate);
    app.post('/api/global/updates/itensUpdate', token, sysUpdates.itensUpdate);
    app.post('/api/global/updates/salvarUpdate', token, sysUpdates.salvarUpdate);
    app.post('/api/global/updates/salvarItemUpdate', token, sysUpdates.salvarItemUpdate);
    app.post('/api/global/updates/getListUpdates', token, sysUpdates.getListUpdates);
    app.post('/api/global/updates/getUpdates', token, sysUpdates.getUpdates);
    app.post('/api/global/updates/salvarItemUpdate', token, sysUpdates.salvarItemUpdate);
    app.post('/api/global/updates/getItemUpdate', token, sysUpdates.getItemUpdate);
    app.post('/api/global/updates/editarItemUpdate', token, sysUpdates.editarItemUpdate);
    app.post('/api/global/updates/getListItensUpdates', token, sysUpdates.getListItensUpdates);
    app.post('/api/global/updates/editaUpdate', token, sysUpdates.editaUpdate);
    app.post('/api/global/updates/getItensUpdate', token, sysUpdates.getItensUpdate);
    app.post('/api/global/updates/removeUpdate', token, sysUpdates.removeUpdate);
    app.post('/api/global/updates/removeItemUpdate', token, sysUpdates.removeItemUpdate);
    app.post('/api/global/updates/verificaVersao', token, sysUpdates.verificaVersao);    
    
    
}
