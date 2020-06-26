module.exports = function(app,cb){

    var api = {};
    var dao = app.src.modTransportation.dao.LogAplicacaoDAO;

    //############################################################################################################
    // LOGS APLICAÇÃO

    api.listarLogAplicacao = async function (req, res, next) {
        await dao.listarLogAplicacao(req, res, next)
          .then((result1) => {
            res.json(result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });
      };
    
    api.buscarLogAplicacao = async function (req, res, next) {
      await dao.buscarLogAplicacao(req, res, next)
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