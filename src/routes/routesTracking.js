var mcache = require('memory-cache');

var cache = (duration) => {
	return (req, res, next) => {
		let key = '__express__' + req.originalUrl || req.url
		let cachedBody = mcache.get(key)
		if (cachedBody) {
			//console.log('cache if');
			res.send(JSON.parse(cachedBody))
			return
		} else {
			//console.log('cache else');
			res.sendResponse = res.send
			res.send = (body) => {
				mcache.put(key, body, duration * 1000);
				res.sendResponse(body)
			}
			next()
		}
	}
}

module.exports = function (app) {

	var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
	var tokenApi = app.src.modTracking.controllers.AutentApiController; 

	var api = app.src.modTracking.controllers.NotasXmlController;

	app.get('/api/tracking', api.listarNotasJsonXml);
	app.post('/api/tracking', api.listarNotasXml);

	var cte = app.src.modTracking.controllers.CTeController;
	app.get('/api/ctes', cte.listar);
	app.get('/api/ctes/:pagina', token, cte.listar);
	app.get('/api/ctes/:pagina/:limite', token, cte.listar);

	app.post('/api/ctes', cte.listar);//listagem com filtro
	app.get('/api/cte/:id', cte.buscar);
	app.get('/api/cteCargas/:id', cte.buscarCargasCTe);

	var delivery = app.src.modTracking.controllers.DeliveryController;	
    var sysUpdates = app.src.modGlobal.controllers.SysUpdatesController;
	app.post('/api/mobile/delivery', token, delivery.buscaDeliveryMobile);
	app.post('/api/mobile/version', sysUpdates.listar);
	app.post('/api/deliveries', token, delivery.listarBusca);
	// app.get('/api/deliveries', token, delivery.listarBusca);
	app.get('/api/rastreio-delivery/:CDCLIEXT', token, delivery.rastreio);

	var itens = app.src.modTracking.controllers.ItensDeliveryController;
	app.get('/api/itens/:id', token, itens.itens);

	//nova delivery copiado do integrador
	var novaDelivery = app.src.modTracking.controllers.NovaDeliveryController;
	app.post('/api/tracking/delivery/alteraprevisao', token, novaDelivery.alterarDataPrevisaoCarga);

	var dashboard = app.src.modTracking.controllers.DashboardController;

	app.post('/api/tracking/dashboard', token, cache(1200000), dashboard.index);
	app.post('/api/tracking/grafico-deliveries-dias', token, dashboard.graficoDeliveriesDias)
	app.get('/api/tracking/transportadoras', token, cache(1200000), dashboard.transportadoras);
	app.post('/api/tracking/grafico-cargas-transp', token, dashboard.graficoDeliveriesPorTransportadora);
	app.post('/api/tracking/total-cargas-transportadoras', token, dashboard.totalCargasPorTransportadora)
	app.post('/api/tracking/total-deliveries-transportadora', token, dashboard.totalDeliveriesPorTransportadora)
	
	//qm notification
	var qmNotification = app.src.modTracking.controllers.QmNotificationController;
	app.post('/api/qmnotification', tokenApi.veriToken, qmNotification.receiveNotification);
	app.post('/api/listQmNotification', token, qmNotification.listaLogQm);
	app.post('/api/tracking/qmnotification', token, qmNotification.receiveNotification);
	app.post('/api/gerCodOcorr', qmNotification.gerCodOcorr);

	//token api
	
	app.post('/api/tokenapi/ger', token, tokenApi.gerToken);
	app.post('/api/tokenapi/cadUrl', token, tokenApi.cadUrl);

	//log interface
	var logInterface =  app.src.modTracking.controllers.LogInterfaceController;
	app.post('/api/logInterface',token,logInterface.listarLog);
	app.post('/api/logInterface/:id',token,logInterface.logDetalhado);

	var qmDoc = app.src.modTracking.controllers.QmDoc;
	app.get('/api/qmdoc', qmDoc.importaQm);

	var api = app.src.modTracking.controllers.AppController;
	app.get('/api/tracking/nfxcte/listar/:id', token, api.listarNotasCTe);
	app.get('/api/tracking/nfxcte/getCanhoto/:id', token, api.getCanhotoById);

};