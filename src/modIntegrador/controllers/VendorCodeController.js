module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.VendorCodeDAO;

  api.listarVendorCode = async function (req, res, next) {
    await dao.listarVendorCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.listarBusca = async function (req, res, next) {
    await dao.listarBusca(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarVendorCode = async function (req, res, next) {
    await dao.buscarVendorCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.salvarVendorCode = async function (req, res, next) {

    try {

      req.objConn = await dao.controller.getConnection(null, req.UserId);

      let IDG056 = await dao.salvarVendorCode(req, res, next);

      if (IDG056) {

        let objI014 = {
          IDG002: req.body.IDG002.id,
          IDG024: req.body.IDG024.id,
          IDS001: req.body.IDS001,
          STCADAST: req.body.STCADAST
        };

        if (req.body.IDG003 === null || req.body.IDG003.length == 0) {
          objI014.IDG003 = [{id: null}];
        } else {
          objI014.IDG003 = req.body.IDG003;
        }

        let objBD = {
          objI014,
          objConn: req.objConn
        };

        await dao.salvarI014(objBD, res, next);

        await req.objConn.close();
        res.json({id: IDG056});

      } else {

        await req.objConn.closeRollback();
        res.status(400).send({armensag: req.__('it.erro.insert')});

      }
    } catch (err) {

      await req.objConn.closeRollback();
      res.status(500).send({armensag: req.__('it.erro.insert')});

    }
  };

  api.atualizarVendorCode = async function (req, res, next) {
    await dao.atualizarVendorCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.excluirVendorCode = async function (req, res, next) {

    let IDG024 = await dao.buscarG024(req, res, next)
                    .then((result) => {
                      return result;
                    })
                    .catch((err) => {
                      throw err;
                    });

    if (IDG024) {
      req.body.IDG024 = IDG024;

      let result = await dao.excluirVendorCode(req, res, next)
                    .then((result) => {
                      return result;
                    })
                    .catch((err) => {
                      throw err;
                    });

      if (result.response == 'Excluído') {

        await dao.excluirCascataI014(req, res, next)
          .then((result) => {
            return res.json({ response: "Vendor Code excluido com sucesso!" });
          })
          .catch((err) => {
            throw err;
          });

      } else {
        res.json({ response: "Falha ao excluir Vendor Code!" });
      }

    } else {
      res.json({ response: "Falha ao excluir Vendor Code!" });
    }

  };

  api.listarI014 = async function (req, res, next) {
    await dao.listarI014(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.verificarI014 = async function (req, res, next) {
    let listaI014 = await dao.verificarI014(req, res, next)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

    if (listaI014 && listaI014.length > 0) {

      let result = false;
      let listaIDG024 = listaI014.filter(i => i.IDG024 == req.body.IDG024.id);
      if (listaIDG024.length > 0) {
        result = true;
      }

      res.json({ response: result });

    } else {
      res.json({ response: true});
    }
  };

  api.salvarI014 = async function (req, res, next) {

    try {

      req.objConn = await dao.controller.getConnection();

      let result = await dao.salvarI014(req, res, next)
          .then((result) => {
            return result;
          })
          .catch((err) => {
            next(err);
          });

      await req.objConn.close();
      res.json(result);

    } catch (err) {

      await req.objConn.closeRollback();
      throw err;

    }
  };

  api.atualizarI014 = async function (req, res, next) {
    await dao.atualizarI014(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.alterarSituacaoI014 = async function (req, res, next) {
    await dao.alterarSituacaoI014(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.excluirI014 = async function (req, res, next) {
    await dao.excluirI014(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });
  };

  return api;
};
