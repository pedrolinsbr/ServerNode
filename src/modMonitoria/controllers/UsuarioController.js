module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modMonitoria.dao.UsuarioDAO;
  var hash = app.src.modMonitoria.controllers.HashController;
  var email = app.src.modMonitoria.controllers.EmailController;

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

  api.getUserFromHashcode = async function (req, res, next) {
    var hashObj = req.body.hashcode;

    let objResponse = {
      IDS001: '',
      NMUSUARI: '',
      STEMAIL: ''
    };

    try {
      var usuario = await hash.decrypt((hashObj));

      var objAux = await dao.buscarInfoRegSenha(usuario, req.UserId)
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      objResponse.IDS001 = objAux[0].IDS001;
      objResponse.NMUSUARI = objAux[0].NMUSUARI;
      objResponse.STEMAIL = objAux[0].STEMAIL;
    } catch (err) {
      objResponse.STEMAIL = 1;
    }
    return res.json(objResponse);
  }

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

    let result = await dao.salvar(req, res, next)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    await email.sendEmail(result, req.headers.origin);
    res.json(result);
  };

  api.reenviarEmail = async function (req, res, next) {
    let result = await dao.atualizarEnviado(req, res, next)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    await email.sendEmail(req.body.IDS001, req.headers.origin, req.UserId);

    res.json(result);
  };

  api.resetPasswordByEmail = async function (req, res, next) {
    let result = await dao.resetPasswordByEmail(req, res, next)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
    if (result.IDS001 != undefined) {
      await email.sendEmail(result.IDS001, req.headers.origin, req.UserId);
      res.json(result);
    } else {
      res.status(403).json(result)
    }

  };

  api.excluirUsuariosSelecionados = async function (req, res, next) {
    await dao.excluirUsuariosSelecionados(req, res, next)
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

  api.validaEmail = async function (req, res, next) {
    await dao.validaEmail(req, res, next)
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


  api.salvarSenha = async function (req, res, next) {
    var usuario = req.body.IDS001;
    var senha = req.body.passwordField;

    try {
      var passwordEncrypted = await hash.encryptLogin(senha);
      var objUsuario = { 'IDS001': usuario, 'DSSENHA': passwordEncrypted };
      await dao.salvarSenha(objUsuario, req.UserId)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
    } catch (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.validaTime4pl = async function (req, res, next) {
    await dao.validaTime4pl(req, res, next)
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
