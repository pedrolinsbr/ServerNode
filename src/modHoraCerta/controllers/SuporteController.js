module.exports = function (app, cb) {

  var api   = {};
  var dao   = app.src.modHoraCerta.dao.SuporteDAO;
  var tsDao = app.src.modHoraCerta.dao.TrocarStatusDAO;

  var moment = require('moment');

  api.listarSlots = async function (req, res, next) {
    await dao.listarSlots(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarSlot = async function (req, res, next) {
    try {
      let arrSlot = await dao.buscarSlot(req, res, next);

      if (arrSlot.length > 0) {

        for (let a of arrSlot) {

          a.arrTransportadoras = [];
          a.arrClientes        = [];

          if (a.G024_IDG024 && a.G024_NMTRANSP) {

            let arrIdTransp = a.G024_IDG024.split(',');
            let arrNmTransp = a.G024_NMTRANSP.split(',');

            for (let i in arrIdTransp) {
              a.arrTransportadoras.push({ id: arrIdTransp[i], text: arrNmTransp[i] });
            }

          }

          if (a.G005_IDG005 && a.G005_NMCLIENT) {

            let arrIdClient = a.G005_IDG005.split(',');
            let arrNmClient = a.G005_NMCLIENT.split(',');

            for (let i in arrIdClient) {
              a.arrClientes.push({ id: arrIdClient[i], text: arrNmClient[i] });
            }

          }

          delete a.G024_IDG024;
          delete a.G005_IDG005;
          delete a.G024_NMTRANSP;
          delete a.G005_NMCLIENT;
        }

      }

      res.send(arrSlot);

    } catch (error) {

      res.status(500).send({ error: err.message });

    }

  };

  api.updateSlot = async function (req, res, next) {
    await dao.updateSlot(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.setAcaoSlots = async function (req, res, next) {
    await dao.setAcaoSlots(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.listarAgendamentos = async function (req, res, next) {
    await dao.listarAgendamentos(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarAgendamento = async function (req, res, next) {
    await dao.buscarAgendamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.updateAgendamento = async function (req, res, next) {

    try {
      let blOk = false, msgErro = '';
      req.objConn = await dao.controller.getConnection();

      let update = await dao.updateAgendamento(req, res, next).then(result => 'Ok');
      blOk = (update == 'Ok');

      if (blOk) {
        if (req.body.TROCAR_STATUS == 1 && req.body.REGIST_FLUXO) {

          let objTS = {
              objConn  : req.objConn
            , IDH006   : req.body.IDH006
            , STAGENDA : req.body.STAGENDA
            , IDI015   : null
            , IDS001   : req.headers.ids001
          }

          let insertH008 = await tsDao.salvarStatusH008(objTS, res, next).then(result => 'Ok');
          blOk = (insertH008 == 'Ok');

          if (!blOk) {
            msgErro = 'Falha ao salvar status H008.'
          }
        }
      } else {
        msgErro = 'Falha ao atualizar dados do agendamento.';
      }

      if (blOk) {
        await req.objConn.close();
        res.json(req.body.IDH006);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message: msgErro});
      }
    } catch (error) {
      await req.objConn.closeRollback();
      res.status(500).send({ message:"Ocorreu um erro ao atualizar dados do agendamento!" });
    }

  }

  api.updatePesagem = async function (req, res, next) {
    await dao.updatePesagem(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.listarAgendamentosStatus = async function (req, res, next) {
    await dao.listarAgendamentosStatus(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.updateDatasStatus = async function (req, res, next) {
    try {
      var msgErro = null;
      var blOk    = false;
      req.objConn = await dao.controller.getConnection();

      blOk = (req.body.arrStatus.length > 0);

      if (blOk) {
        req.body.arrStatus.map(objStatus => {
          let objDate = {
              year  : objStatus['DATA'].year
            , month : (objStatus['DATA'].month - 1)
            , day   : objStatus['DATA'].day
            , hour  : objStatus['HORA'].hour
            , minute: objStatus['HORA'].minute
            , second: objStatus['HORA'].second
          };
          objStatus['DATAHORA'] = moment(objDate).format('YYYY-MM-DD HH:mm:ss');
          return objStatus;
        });

        let countResult = 0;
        for (let objStatus of req.body.arrStatus) {
          let obj = {
              IDH006    : req.body.IDH006
            , IDH008    : objStatus.IDH008
            , DATAHORA  : objStatus.DATAHORA
            , OBSERVACAO: (objStatus.OBSERVACAO) ? objStatus.OBSERVACAO : ''
            , objConn   : req.objConn
          };
          let result = await dao.updateDatasStatus(obj, res, next).then((result) => { return 'Ok'; });
          if (result == 'Ok') { countResult++; }
        }
        blOk = ( req.body.arrStatus.length === countResult);

        if (!blOk) {
          msgErro = `Falha ao atualizar datas dos status do agendamento ${req.body.IDH006}.`;
        }
      } else {
        msgErro = `Nenhuma data a ser atualizada!`;
      }

      if (blOk) {
        await req.objConn.close();
        res.json(req.body.IDH006);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }
    } catch (error) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${error.message}`});
    }
  }

  return api;

};
