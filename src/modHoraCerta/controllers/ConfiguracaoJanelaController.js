module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modHoraCerta.dao.ConfiguracaoJanelaDAO;

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

  api.alterarSituacao = async function (req, res, next) {

    try {
      let objInfo = { type: 0, msg: null };
      let msgErro = null;
      let blOk    = false;
      req.objConn = await dao.controller.getConnection();

      let stAtual = await dao.buscarSituacao(req, res, next);
      blOk = (stAtual !== undefined);

      if (blOk) {
        req.body.STCADAST = (stAtual == 'A') ? 'I' : 'A';

        if (req.body.STCADAST == 'I') {
          let qtdSlots = await dao.verificarSlotsOcupados(req, res, next);
          blOk = (qtdSlots !== undefined);
          req.body.QTDSLOTS = (blOk) ? qtdSlots : 0;
        } else {
          req.body.QTDSLOTS = 0;
        }

        if (blOk) {
          if (req.body.QTDSLOTS == 0) {
            let alterarSituacao = await dao.alterarSituacao(req, res, next).then((result) => 'Ok');
            blOk = (alterarSituacao == 'Ok');

            if (blOk) { // Sucesso
              objInfo.msg = 'Situação do registro alterado com sucesso!'
            } else {
              msgErro = 'Falha ao alterar situação do registro.';
            }
          } else {
            objInfo.type = 1; // Alerta
            objInfo.msg  = 'Não é possível desativar esta janela, pois há configurações de slots ocupados para a mesma!';
          }
        } else {
          msgErro = 'Falha ao verificar quantidade de slots ocupados.';
        }
      } else {
        msgErro = 'Falha ao buscar situação atual do registro.';
      }

      if (blOk) {
        await req.objConn.close();
        res.json(objInfo);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }
    }
    catch (error) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${error.message}`});
    }

    await dao.alterarSituacao(req, res, next)
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
