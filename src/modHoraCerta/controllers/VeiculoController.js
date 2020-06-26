module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modHoraCerta.dao.VeiculoDAO;

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
    await dao.salvar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

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

  api.buscarFrota = async function (req, res, next) {
    await dao.buscarFrota(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarPlaca = async function (req, res, next) {
    await dao.buscarPlaca(req, res, next)
    .then (result => {
      res.json(result);
    })
    .catch(err => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      next(err);
    });
  }

  api.atualizarMultiplasDatas = async function (req, res, next) {
    await dao.atualizarMultiplasDatas(req, res, next)
    .then (result => {
      res.json(result);
    })
    .catch(err => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      next(err);
    });
  }

  api.uploadImagens = async function(req, res, next) {
    await dao.saveUploadImg(req, res, next)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log("[ERROR]: ", err);
            next(err);
        });
}

api.getImagemVeiculo = async function (req, res, next) {
  await dao.getImagemVeiculo(req, res, next)
  .then (result => {
    res.json(result);
  })
  .catch(err => {
    err.stack = new Error().stack + `\r\n` + err.stack;
    next(err);
  });
}

api.deleteImagemVeiculo = async function (req, res, next) {
  await dao.deleteImagemVeiculo(req, res, next)
  .then (result => {
    res.json(result);
  })
  .catch(err => {
    err.stack = new Error().stack + `\r\n` + err.stack;
    next(err);
  });
}

  return api;
};
