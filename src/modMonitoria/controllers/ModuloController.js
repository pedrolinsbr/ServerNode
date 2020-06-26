module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modMonitoria.dao.ModuloDAO;

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

  api.listarGrupos = async function (req, res, next) {
    await dao.listarGrupos(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarMenus = async function (req, res, next) {
    await dao.listarMenus(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarMenusV2 = async function (req, res, next) {
    await dao.listarMenusV2(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };  

  api.acrescentarMenuVinculo = async function (req, res, next) {
    await dao.acrescentarMenuVinculo(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.removerVinculoMenu = async function (req, res, next) {
    await dao.removerVinculoMenu(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };  

  api.listarMenusPais = async function (req, res, next) {
    await dao.listarMenusPais(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  
  api.salvarNovoMenu = async function (req, res, next) {
    await dao.salvarNovoMenu(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarMenu = async function (req, res, next) {
    await dao.buscarMenu(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizarMenu = async function (req, res, next) {
    await dao.atualizarMenu(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizarOrdemMenu = async function (req, res, next) {
    await dao.atualizarOrdemMenu(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarGruposUsuarios = async function (req, res, next) {
    await dao.listarGruposUsuarios(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.addUsuarioGrupoIndividual = async function (req, res, next) {
    await dao.addUsuarioGrupoIndividual(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.removerUsuarioGrupo = async function (req, res, next) {
    await dao.removerUsuarioGrupo(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.loadAcoes = async function (req, res, next) {
    await dao.loadAcoes(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  
  api.deleteMenuCadastrado = async function (req, res, next) {
    await dao.deleteMenuCadastrado(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
}