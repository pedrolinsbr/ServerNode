module.exports = function(app,cb){

    var api = {};
    var dao = app.src.modTransportation.dao.LogDAO;

    //############################################################################################################
    // LOGS

    api.listarLog = async function (req, res, next) {
        await dao.listarLog(req, res, next)
          .then((result1) => {
            res.json(result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });
      };
    
    api.buscarLog = async function (req, res, next) {
      await dao.buscarLog(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    };

    api.listarTimeLine = async function (req, res, next) {
      await dao.listarTimeLine(req, res, next)
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