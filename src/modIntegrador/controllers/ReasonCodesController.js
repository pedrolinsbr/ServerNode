module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.ReasonCodesDAO;

  api.listarReasonCode = async function (req, res, next) {
    await dao.listarReasonCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.listarOld = async function (req, res, next) {
    await dao.listarOld(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarReasonCode = async function (req, res, next) {
      await dao.buscarReasonCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {  
        next(err);
      });
  };

  api.buscarMotivosReasonCode = async function (req, res, next) {
    await dao.buscarMotivosReasonCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarReasonCode = async function (req, res, next) {

    try {

        req.objConn = await dao.controller.getConnection();

        let IDI007 = await dao.salvarReasonCode(req, res, next);

        if (IDI007) {

          req.body.IDI007 = IDI007;
          let result = await dao.salvarMotivosReasonCode(req, res, next)
              .then((result) => {
                  return result;
              })
              .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  next(err);
              });

          if ((result == undefined) || (result == false) || (result == ""))
          {

            await req.objConn.closeRollback();
            return res.status(400).send({ armensag: req.__('it.erro.insert') });

          } else {

            await req.objConn.close();
            res.json(result);

          }

        } else {

            await req.objConn.closeRollback();
            return res.status(400).send({armensag: req.__('it.erro.insert')});

        }

    } catch (err) {

      await req.objConn.closeRollback();
      throw err;

    }

  };

  api.atualizarReasonCode = async function (req, res, next) {

    try {

      req.objConn = await dao.controller.getConnection();

      let IDI007 = await dao.atualizarReasonCode(req, res, next);

      if (IDI007) {

        let listaMotivosReasonCode = await dao.listarMotivosReasonCode(req, res, next);

        let motivosReasonCode = req.body.IDI015;
        let novaListaMotivosReasonCode = [];
        motivosReasonCode.forEach(motivo => {
          novaListaMotivosReasonCode.push({IDI015: motivo.id, IDI007: req.body.IDI007, IDG014: req.body.IDG014});
        });

        if (listaMotivosReasonCode.length > 0 && novaListaMotivosReasonCode.length > 0) {

          let listaMotRcAtualizar = [];
          let listaMotRcExcluir = [];
          let listaMotRcInserir = [];

          listaMotivosReasonCode.forEach(i => {

            const motivoReasonCodeAtualizar = novaListaMotivosReasonCode.filter(j => j.IDI015 == i.IDI015 && j.IDI007 == i.IDI007);
            if (motivoReasonCodeAtualizar.length > 0) {
              listaMotRcAtualizar.push(i);
            } else {
              listaMotRcExcluir.push(i);
            }

          });

          novaListaMotivosReasonCode.forEach(i => {

            const motivoReasonCodeInserir = listaMotivosReasonCode.filter(j => j.IDI015 == i.IDI015 && j.IDI007 == i.IDI007);
            if (motivoReasonCodeInserir.length == 0) {
              listaMotRcInserir.push(i);
            }

          });

          try {

            if (listaMotRcAtualizar.length > 0) {

              let motivosReasonCodeAtualizar = [];
              listaMotRcAtualizar.forEach(i => {
                motivosReasonCodeAtualizar.push(i.IDI015);
              });
              req.motivosReasonCodeAtualizar = motivosReasonCodeAtualizar;

              await dao.atualizarMotivosReasonCode(req, res, next);

            }

            if (listaMotRcExcluir.length > 0) {

              let motivosReasonCodeExcluir = [];
              listaMotRcExcluir.forEach(i => {
                motivosReasonCodeExcluir.push(i.IDI015);
              });
              req.motivosReasonCodeExcluir = motivosReasonCodeExcluir;

              await dao.excluirMotivosReasonCode(req, res, next);

            }

            if (listaMotRcInserir.length > 0) {

              let IDI015 = [];
              listaMotRcInserir.forEach(i => {
                IDI015.push({ idi015: i.IDI015 });
              });
              req.body.IDI015 = IDI015;

              await dao.salvarMotivosReasonCode(req, res, next);

            }

          } catch (err) {

            await req.objConn.closeRollback();
            throw err;

          }

          await req.objConn.close();
          return res.status(200).send({ response: req.__('it.sucesso.update') });

        } else {

          await req.objConn.closeRollback();
          res.status(400).send({armensag: req.__('it.erro.update')});

        }

      } else {

        await req.objConn.closeRollback();
        res.status(400).send({armensag: req.__('it.erro.update')});

      }

    } catch (err) {

      await req.objConn.closeRollback();
      throw err;

    }
  };
  
  api.excluirReasonCode = async function (req, res, next) {
    await dao.excluirReasonCode(req, res, next)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
  };

  api.listarOnde = async function (req, res, next) {
    await dao.listarOnde(req, res, next)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            next(err);
        });
  };

  api.buscarOnde = async function (req, res, next) {
      await dao.buscarOnde(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.salvarOnde = async function (req, res, next) {
      await dao.salvarOnde(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.atualizarOnde = async function (req, res, next) {
      await dao.atualizarOnde(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.excluirOnde = async function (req, res, next) {
      await dao.excluirOnde(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.listarPorque = async function (req, res, next) {
    await dao.listarPorque(req, res, next)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            next(err);
        })
  };

  api.buscarPorque = async function (req, res, next) {
      await dao.buscarPorque(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.salvarPorque = async function (req, res, next) {
      await dao.salvarPorque(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.atualizarPorque = async function (req, res, next) {
      await dao.atualizarPorque(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.excluirPorque = async function (req, res, next) {
      await dao.excluirPorque(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.listarQuem = async function (req, res, next) {
    await dao.listarQuem(req, res, next)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            next(err);
        })
  };

  api.buscarQuem = async function (req, res, next) {
      await dao.buscarQuem(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.salvarQuem = async function (req, res, next) {
      await dao.salvarQuem(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.atualizarQuem = async function (req, res, next) {
      await dao.atualizarQuem(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.excluirQuem = async function (req, res, next) {
      await dao.excluirQuem(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.listarResultado = async function (req, res, next) {
    await dao.listarResultado(req, res, next)
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            next(err);
        });
  };

  api.buscarResultado = async function (req, res, next) {
      await dao.buscarResultado(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.salvarResultado = async function (req, res, next) {
      await dao.salvarResultado(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.atualizarResultado = async function (req, res, next) {
      await dao.atualizarResultado(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

  api.excluirResultado = async function (req, res, next) {
      await dao.excluirResultado(req, res, next)
          .then((result) => {
              res.json(result);
          })
          .catch((err) => {
              next(err);
          });
  };

    return api; 
};
