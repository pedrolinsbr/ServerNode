var multer = require('multer');

var storageDeliveries = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, DirCanhoto)
    },
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(1, function (err, raw) {
        cb(null, raw.toString('hex') + Date.now() + '.' + file.originalname);
      });
    }
  });

var uploadDeliveries = multer({ storage: storageDeliveries });

module.exports = function (app) {

    var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    var api = app.src.modWarehouse.controllers.XcockpitController;

    app.post('/api/wh/cockpit/shipment/listar', api.listarShipments);
    app.post('/api/wh/cockpit/shipment/cards', api.calcularCards);
    app.post('/api/wh/cockpit/shipment/cards/tp', api.calcularCardsTp);
    app.post('/api/wh/cockpit/cargas/trocar-status', api.trocarStatus);
    app.post('/api/wh/cockpit/deliveries/listar', api.listarDeliveries);
    app.post('/api/wh/cockpit/delivery/itens/listar', api.listarItensDelivery);
    app.post('/api/wh/cockpit/deliveries/transp/update', api.updateTransp);
    app.post('/api/wh/cockpit/deliveries/itens/update', api.updateItens);
    app.post('/api/wh/cockpit/deliveries/reserva/update', api.reservarSaldo);
    app.post('/api/wh/cockpit/mapa/listar', api.mapaDelivery);
    app.post('/api/wh/cockpit/deliveries/dt/add', api.criarDt);
    app.post('/api/wh/cockpit/deliveries/tp/add', api.criarTp);
    app.post('/api/wh/cockpit/deliveries/cancelar', api.cancelarDeliveryBravo);
    app.post('/api/wh/cockpit/deliveries/buscar/hc', api.buscarInfoHc);
    app.post('/api/wh/cockpit/deliveries/excluir', api.excluirDelivery);

    app.post('/api/wh/cockpit/deliveries/detalhes', api.detalhesDelivery);
    app.post('/api/wh/cockpit/delivery/moveretapa', api.moverEtapa);


    //EVOLOG
    app.post('/api/wh/cockpit/cargas/add', api.inserirPreAsn);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    var api = app.src.modWarehouse.controllers.MilestonesController;

    //app.post('/api/wh/interfaces/milestones/salvar', api.GerarMilestonesManual);
    app.post('/api/wh/interfaces/milestones/listar', api.listarMilestones);
    app.post('/api/wh/interfaces/milestones/enviar', api.enviarMilestones);
    app.post('/api/wh/interfaces/milestones/inserir', api.inserirMilestone);
    app.post('/api/wh/interfaces/milestones/fisico', api.milestonesFisico);

    app.post('/api/wh/interfaces/milestones/hc', api.testeMilestoneHC);

    app.get('/api/wh/interfaces/milestones/download/:IDW006', api.milestonesFisico);





    //app.post('/api/wh/interfaces/pgr/salvar/manual', api.salvarPGRManual);


    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

    var api = app.src.modWarehouse.controllers.CompraIndustrialController;

    app.post('/api/wh/compra/delivery/add', api.addDeliveryCompra);
    app.post('/api/wh/compra/shipment/add', api.addShipmentCompra);
    app.post('/api/wh/compra/deliveries/listar', api.listarDeliveries);


    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\


    var api = app.src.modWarehouse.controllers.CommonController;

    app.post('/api/wh/cockpit/deliveries/timeline/list', api.listarTimeline);




    var api = app.src.modWarehouse.controllers.SoapClientController;

    app.post('/api/soap/client/regMil', api.Iwhc);

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\


    var api = app.src.modWarehouse.controllers.InventarioController;

    app.get('/api/wh/cockpit/inventory/cards', api.calcularCards);
    app.post('/api/wh/cockpit/inventory/listar', api.listarInventario);
    app.post('/api/wh/cockpit/inventory/listar/envio', api.listarInventarioEnvio);
    app.post('/api/wh/cockpit/inventory/enviar', api.enviarInventario);
    app.post('/api/wh/cockpit/inventory/gerar', api.gerarTarefa);
    app.post('/api/wh/cockpit/inventory/detalhes', api.detalhesInventario);
    app.post('/api/wh/cockpit/inventory/detalhes/contagem', api.detalhesInventarioContagem);
    app.post('/api/wh/cockpit/inventory/resultado/enviar/:id', api.downloadXmlInventario);

    app.post('/api/wh/cockpit/inventory/gerar/fcm', api.gerarFCM);
    app.post('/api/wh/cockpit/inventory/gerar/cbs', api.gerarCBS);
    app.post('/api/wh/cockpit/inventory/recontagem', api.recontagem);
    app.post('/api/wh/cockpit/inventory/gerar/resultado', api.gerarResultado);
    app.post('/api/wh/cockpit/inventory/inventario', api.gerarINV);
    app.post('/api/wh/cockpit/inventory/itens/update', api.editarQuantItem);
    app.post('/api/wh/cockpit/inventory/excluir', api.excluirInventario);


    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

    var api = app.src.modWarehouse.controllers.XMLController;

    app.post('/api/wh/xml/importa', api.importarXml);
    //app.post('/api/wh/interfaces/deliveries/listar', api.listarDelivery);
    app.post('/api/wh/interfaces/deliveries/listar', api.listDeliveries);
    app.post('/api/wh/interfaces/deliveries/listar/manual', api.listarDeliveryManual);
    app.post('/api/wh/interfaces/deliveries/excluir', api.excluirDelivery);



    app.post('/api/wh/interfaces/deliveries/upload', uploadDeliveries.any(), function (req, res, next) {
        api.uploadDeliveries(req, res, next);
    });

    //app.get('/api/wh/delivery/download/bd/:IDG082', api.getXmlDelivery);

    app.get('/api/wh/delivery/download/:file', 	api.downloadDelivery);

    app.get('/api/wh/delivery/download/processados/:file', 	api.downloadDeliveryProcessada);

    app.get('/api/wh/delivery/importar/manual', 	api.importarXmlCron);







};
