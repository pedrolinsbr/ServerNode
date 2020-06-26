module.exports = function (app) {

  let ctrlMilestones = app.src.modWarehouse.controllers.MilestonesController;

  return {
    ZWS_MILESTONE_SET: {
      RegMil: {
        ZmfMilestoneSet: function (args, callback) {
          ctrlMilestones.gerarMilSoap(args)
            .then((result) => {
              callback({ EvOk: result.EvOk });
            });
        }
      }
    }
  }
}
