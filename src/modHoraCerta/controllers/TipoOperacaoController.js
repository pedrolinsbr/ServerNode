module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modHoraCerta.dao.TipoOperacaoDAO;

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
    try {
      var msgErro = null;
      var blOk    = false;
      req.objConn = await dao.controller.getConnection();

      req.body.IDOPERAC = await dao.buscarIDG097(req, res, next).then((result) => { return result[0].IDOPERAC; });

      var result = await dao.salvarTipoOperacao(req, res, next);

      blOk = (result.id !== undefined);

      if (blOk) {
        req.body.IDG097 = result.id;

        if (req.body.TOLERA1 && req.body.TOLERA2) { // Se houver tolerâncias
          let obj = {};
          obj.objConn  = req.objConn;
          obj.IDG097   = req.body.IDG097;
          obj.QTTOLERA = req.body.TOLERA1;
          obj.TPTOLERA = 16;

          let result2 = await dao.salvarTolerancia(obj, res, next);

          blOk = (result2.id !== undefined);

          if (blOk) {
            let obj2 = {};
            obj2.objConn  = req.objConn;
            obj2.IDG097   = req.body.IDG097;
            obj2.QTTOLERA = req.body.TOLERA2;
            obj2.TPTOLERA = 17;

            let result3 = await dao.salvarTolerancia(obj2, res, next);

            blOk = (result3.id !== undefined);

            if (!blOk) {
              msgErro = "Não foi possível salvar tolerâncias";
            }
          } else {
            msgErro = "Não foi possível salvar tolerâncias";
          }
        }

      } else {
        msgErro = "Não foi possível salvar tipo de operação!";
      }

      if (blOk) {
        await req.objConn.close();
        res.json(req.body.IDG097);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});
    }
  };

  api.atualizar = async function (req, res, next) {
    try {
      var msgErro = null;
      var blOk    = false;
      req.objConn = await dao.controller.getConnection();

      let result = await dao.atualizarTipoOperacao(req, res, next).then(() => { return 'Ok'});

      blOk = (result == 'Ok');

      if (blOk) {
        if (req.body.TOLERA1 && req.body.TOLERA2) { // Se houver tolerâncias
          let obj = {};
          obj.objConn  = req.objConn;
          obj.IDG097   = req.body.IDG097;
          obj.QTTOLERA = req.body.TOLERA1;
          obj.TPTOLERA = 16;

          let result2 = await dao.atualizarTolerancia(obj, res, next).then(() => { return 'Ok' });

          blOk = (result2 == 'Ok');

          if (blOk) {
            let obj2 = {};
            obj2.objConn  = req.objConn;
            obj2.IDG097   = req.body.IDG097;
            obj2.QTTOLERA = req.body.TOLERA2;
            obj2.TPTOLERA = 17;

            let result3 = await dao.atualizarTolerancia(obj2, res, next).then(() => { return 'Ok' });

            blOk = (result3 == 'Ok');

            if (!blOk) {
              msgErro = "Não foi possível atualizar tolerâncias";
            }
          } else {
            msgErro = "Não foi possível atualizar tolerâncias";
          }
        }

      } else {
        msgErro = "Não foi possível atualizar tipo de operação!";
      }

      if (blOk) {
        await req.objConn.close();
        res.status(200).send({message:'Tipo de operação atualizado com sucesso!'});
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});
    }
  };

  api.excluir = async function (req, res, next) {
    try {
      var msgErro = null;
      var blOk    = false;
      req.objConn = await dao.controller.getConnection();

      var result = await dao.excluirTipoOperacao(req, res, next).then(() => { return 'Ok'; });

      blOk = (result == 'Ok');

      if (blOk) {
        var result2 = await dao.excluirTolerancias(req, res, next).then(() => { return 'Ok' });

        blOk = (result2 == 'Ok');

        if (!blOk) {
          msgErro = "Não foi possível excluir tolerâncias";
        }
      } else {
        msgErro = "Não foi possível excluir tipo de operação!";
      }

      if (blOk) {
        await req.objConn.close();
        res.status(200).send({message:'Tipo de operação excluído com sucesso!'});
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});
    }
  };

  return api;
};
