module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modDashboard.dao.PlanejamentoDAO;

  api.listar = async function (req, res, next) {
    await dao.listar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  api.salvar = async function (req, res, next) {
    await dao.buscarData(req, res, next)
      .then((result1) => {
        
        if(result1){
          res.json({message: "Já existe valores cadastrados para esta data neste armazém.", isSave: true});
        }
        else{
          dao.salvar(req, res, next)
            .then((result2) => {
              res.json(result2);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });
        }
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  // api.salvar = async function (req, res, next) {
  //   await dao.salvar(req, res, next)
  //     .then((result1) => {
  //       res.json(result1);
  //     })
  //     .catch((err) => {
  //       err.stack = new Error().stack + `\r\n` + err.stack;
  //       next(err);
  //     });
  // };

  api.atualizar = async function (req, res, next) {
    await dao.atualizar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.excluir = async function (req, res, next) {
    await dao.excluir(req, res, next)
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
