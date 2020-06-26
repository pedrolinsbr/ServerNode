module.exports = function (app) {
  
  let ctrlMilestones = app.src.modWarehouse.controllers.MilestonesController;
  
  return {
    ZWS_CONFIRMA_INBOUND: {
      ConfInb: {
        ZmfConfirmaInbound: function (args, callback) {
            args.Milestonecode = 'PGR'
            ctrlMilestones.gerarMilSoapPGR(args)
            .then((result) => {
              callback({ EvOk: result.EvOk });
            });
        }
      }
    }
  }
}