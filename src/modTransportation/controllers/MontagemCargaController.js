module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.MontagemCargaDAO;

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


  api.validacaoDatas = async function (req, res, next) {
    await dao.validacaoDatas(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.indicadoresMountingLoad = async function (req, res, next) {

    if (req.params.IDG024TR == undefined || req.params.IDG024TR == null || req.params.IDG024TR == '') {
      req.params.IDG024TR = -1;
    }
    
    await dao.indicadoresMountingLoad(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.indicadoresMountingLoad4pl = async function (req, res, next) {

    if (req.params.IDG024TR == undefined || req.params.IDG024TR == null || req.params.IDG024TR == '') {
      req.params.IDG024TR = -1;
    }
    
    await dao.indicadoresMountingLoad4pl(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //###############################



  api.listarDocumentos = async function (req, res, next) {

    await dao.listarDocumentos(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };

  api.listarParadas = async function (req, res, next) {

    await dao.listarParadas(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };


  api.salvarCarga = async function (req, res, next) {

    /*let carga = req.body.grid;
    let objVerificar = {
      body: {
        arrIDG043ver: null,
        arrIDG051ver: null
      }
    }

    objVerificar.body.arrIDG051ver = carga.filter(d => { return d.LSCTE != null }).map(d => { return d.LSCTE });
    objVerificar.body.arrIDG043ver = carga.filter(d => { return d.LSNFE != null }).map(d => { return d.LSNFE });

    let verificacao = [];
    verificacao = await dao.buscaCargasAntesInserir(objVerificar, res, next)
      .then(result => {

        return result;
      })
      .catch((err) => {

        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    if (verificacao.length > 0) {
      let response = '';
      if (objVerificar.body.arrIDG051ver.length > 0) {
        response = `Documento(s): ${verificacao.map(d => { return d.G051_CDCTRC })}. Já possui(em) registro(s) de carga(s)`;
      } else {
        response = `Documento(s): ${verificacao.map(d => { return d.IDG043 })}. Já possui(em) registro(s) de carga(s)`;
      }


      res.status(400).send({ response: response });
    } else {

      await dao.salvarCarga(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }*/

    await dao.salvarCarga(req, res, next)
    .then((result1) => {
      res.json(result1);
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      next(err);
    });
  };

  api.validarCarga = async function (req, res, next) {

    await dao.validarCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };


  api.salvarReprocessarCarga = async function (req, res, next) {

    await dao.salvarReprocessarCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };

  api.getArmazemColeta = async function (req, res, next) {

    await dao.getArmazemColeta(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };

  api.getCapacidadePeso = async function (req, res, next) {

    await dao.getCapacidadePeso(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };

  api.recalculoPrazoEntrega = async function (req, res, next) {

    await dao.recalculoPrazoEntrega(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  };


  // api.setTipoTransporte = async function (req, res, next) {

  //   await dao.setTipoTransporte(req, res, next)
  //     .then((result1) => {
  //       res.json(result1);
  //     })
  //     .catch((err) => {
  //       err.stack = new Error().stack + `\r\n` + err.stack;
  //       next(err);
  //     });

  // };

  return api;
};
