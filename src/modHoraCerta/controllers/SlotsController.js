module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modHoraCerta.dao.SlotsDAO;


  api.getSlots = async function (req, res, next) {
    await dao.getSlots(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atribuirStatus = async function (req, res, next) {
    await dao.atribuirStatus(req, res, next)
      .then(async (result1) => {
        if (req.body.STAGENDA == 'R') {
          await dao.excluirReserva(req, res, next)
            .then(async (result1) => {
              for (var i of req.body.IDH007.split(',')) {
                for (var j of req.body.IDG024) {
                  await dao.salvarReserva({IDH007:i, NRVALUE:j.id, TPPARAME: 'T'}, res, next)
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      next(err);
                    });
                }

                for (var j of req.body.IDG005) {
                  await dao.salvarReserva({IDH007:i, NRVALUE:j.id, TPPARAME: 'C'}, res, next)
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      next(err);
                    });
                }
              }
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });

          res.json(result1);
        } else {
          res.json(result1);
        }
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.replicarStatus = async function (req, res, next) {
    await dao.replicarStatus(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  return api;
};
