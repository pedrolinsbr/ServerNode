module.exports = function (app, cb) {

  const fs  = require('fs');
  const dao = app.src.modIntegrador.dao.DeliveryDAO;
  
  var api = {};

  //-----------------------------------------------------------------------\\

  api.listar = async function (req, res, next) {
    dao.deliveries(req, res, next)
      .then((result) => {
        res.json(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result) => {
        res.json(result);
      })

      .catch((err) => {
        next(err);
      });
  }
  //-----------------------------------------------------------------------\\

  api.listarCanhoto = async function (req, res, next) {
    await dao.listarCanhoto(req, res, next)
      .then((result) => {
        res.json(result);
      })

      .catch((err) => {
        next(err);
      });
  }


  /**
   * @description Retorna o numero de dias 
   * @author Yusha Mariak e Everton
   * @since 22/12/2017
   *
   * @async
   * @function api/buscarOrigemDestino
   * @return Retorna um numero.
   * @throws Retorna o erro da consulta.
   */
  api.buscarOrigemDestino = async function (id) {

    let oriDest;

    oriDest = await dao.buscarOrigemDestino(id)
      .catch((err) => {
        next(err);
      });

    return await dao.buscarDiasSLA(oriDest)
      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.getDashboardItens = async function (req, res, next) {

    var id = parseInt(req.params.id);

    if (isNaN(id)) id = 0;

    await dao.buscarItensDashboard(id, res, next)
      .then((result) => {
        res.status(200).send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.getDashboardDelivery = async function (req, res, next) {
    await dao.getDashboardDelivery(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  api.postDashboardDelivery = async function (req, res, next) {
    await dao.postDashboardDelivery(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        next(err);
      });
  }
  //-----------------------------------------------------------------------\\

  api.getDeliveryACancelar = async function (req, res, next) {
    await dao.getDeliveryACancelar(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  api.postDeliveryACancelar = async function (req, res, next) {
    await dao.postDeliveryACancelar(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  api.postDeliveryACancelarBacklog = async function (req, res, next) {
    await dao.postDeliveryACancelarBacklog(req, res, next)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  api.cancelarDelivery = async function (req, res, next) {
    await dao.cancelarDelivery(req, res, next)
      .then((result) => {
        return res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  api.voltarBacklog = async function (req, res, next) {
    
    var tpDelive = req.body.DH_TPDELIVE;

    if (tpDelive == '3' || tpDelive == '4') {
      req.etapa = 20;
    } else {
      req.etapa = 0;
    }

    var objResult = await dao.voltarBacklog(req, res, next)
    .catch((err) => { 
      next(err); 
    });

    res.status(200).send({result : objResult});
  }

  //-----------------------------------------------------------------------\\

  /**
   * @description Verifica se existe delivery passada e retorna o ID.
   *
   * @async
   * @function api/buscaDeliveryPorCd
   * @return {Array} Retorno da consulta SQL.
   */

  api.buscaDeliveryPorCd = async function (idDelivery) {

    var objDelive = await dao.buscaDeliveryPorCd(idDelivery);

    return objDelive;
  }



  //-----------------------------------------------------------------------\\

  /**
   * @description Verifica se existe delivery passada e retorna o ID.
   *
   * @async
   * @function api/buscaDeliveryPorId
   * @return {Array} Retorno da consulta SQL.
   */

  api.buscaDeliveryPorId = async function (idDelivery) {

    var objDelive = await dao.buscaDeliveryPorId(idDelivery);

    return objDelive;
  }



  //-----------------------------------------------------------------------\\

  /**
   * @description Verifica se existe delivery passada e retorna o ID.
   *
   * @async
   * @function api/buscaDeliveryPorCdOrNota
   * @return {Array} Retorno da consulta SQL.
   */

  api.buscaDeliveryPorCdOrNota = async function (obj) {

    var objDelive = await dao.buscaDeliveryPorCdOrNota(obj);

    return objDelive;
  }

  
  //-----------------------------------------------------------------------\\

  /**
   * @description Atualiza dados do conhecimento na delivery.
   *
   * @async
   * @function api/atualizaDeliveryConhecimento
   * @return {Array} Retorno da consulta SQL.
   */

  api.atualizaDeliveryConhecimento = async function (req, res, next) {

    var objDelive = await dao.atualizaDeliveryConhecimento(req, res, next);

    return objDelive;
  }

    /**
   * @description Atualiza a coluna SNAG da delivery.
   *
   * @async
   * @function api/atualizaSnag
   * @return {Array} Retorno da consulta SQL.
   */

  api.atualizaSnag = async function (req, res, next) {

    var objDelive = await dao.atualizaSnag(req, res, next);

    return objDelive;
  }

  /**
   * @description Pega ID da localidade e produtos das delivery.
   *
   * @async
   * @function api/listarLocProDelivery
   * @return {Array} Retorno da consulta SQL.
   */

  api.listarLocProDelivery = async function (req, res, next) {
    return await dao.listarLocProDelivery(req, res, next)
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
   * @description Lista Eventos da delivery.
   *
   * @async
   * @function api/listarEventosDelivery
   * @return {Array} Retorno da consulta SQL.
   */
  //-----------------------------------------------------------------------\\

  api.listarEventosDelivery = async function (req, res, next) {
    dao.listarEventosDelivery(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  //-----------------------------------------------------------------------\\

  /**
   * @description Lista Parceiros da delivery.
   *
   * @async
   * @function api/listarEventosDelivery
   * @return {Array} Retorno da consulta SQL.
   */

  //-----------------------------------------------------------------------\\

  api.listarParceirosDelivery = async function (req, res, next) {
    dao.listarParceirosDelivery(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  //-----------------------------------------------------------------------\\

  /**
   * @description Lista Cargas da delivery.
   *
   * @async
   * @function api/listarCargasDelivery
   * @return {Array} Retorno da consulta SQL.
   */

  //-----------------------------------------------------------------------\\

  api.listarCargasDelivery = async function (req, res, next) {
    dao.listarCargasDelivery(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  //-----------------------------------------------------------------------\\

  /**
   * @description Faz o download do xml da delivery
   * @author Ademário Marcolino
   * @since 15/01/2018
   *
   * @async
   * @function api/Download
   * @return {JSON}
   * @throws Em caso de erro, será apresentado no console
   */

  api.baixarXml = async function (req, res) {
    var idDelivery = req.params.CDDELIVE;
    var file = '../xml/delivery/save/delivery-' + idDelivery + '.xml';

    if (fs.existsSync(file)) {
      res.download(file);
    } else {
      res.json({
        error: 'Arquivo não encontrado.'
      }, 500);
    }
  }

  //-----------------------------------------------------------------------\\  

  api.alterarDataPrevisaoCarga = async function (req, res, next) {
    await dao.alterarDataPrevisaoCarga(req, res, next)
      .then((result) => {
        res.status(200).send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.processCanhoto = function (req, res, next) {
    uploadCanhoto.any();
  }

  api.ajustaPDFCanhoto = async function (req, res, next) {
    var DirCanhoto = process.env.FOLDER_CANHOTO;
    var arquivos = await dao.ajustaPDFCanhoto(req, res, next)

    for (var key of arquivos) {
      fs.unlinkSync(`${DirCanhoto}${key.TXCANHOT}`)
    }

  }


  api.envioOtimizadorManual = async function (req, res, next) {

    await dao.envioOtimizadorManual(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  api.cancelarEnvioOtimizadorManual = async function (req, res, next) {

    await dao.cancelarEnvioOtimizadorManual(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        next(err);
      });
  }

  api.buscaDeliveryEmMassaPorCd = async function (params, next) {

    return await dao.buscaDeliveryEmMassaPorCd(params, next)
      .then((result) => {
        var objDeliverys = result.map((delivery) => {
          return delivery.IDG043;
        });
        return objDeliverys;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.buscaDeliveryNotaEmMassaPorCd = async function (params, next) {

    return await dao.buscaDeliveryNotaEmMassaPorCd(params, next)
      .then((result) => {
        var objDeliverys = [];
        objDeliverys.IDG043 = result.map((delivery) => {
          return delivery.IDG043;
        });
        objDeliverys.IDG005RE = result.length > 0 ? result[0].IDG005RE : null;
        return objDeliverys;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }


  api.buscarWarehouseDashboard = async function (req, res, next) {
    return await dao.buscarWarehouseDashboard(req, res, next)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  /**
   * @description Verifica se existe delivery passada e retorna o ID.
   *
   * @async
   * @function api/buscaDeliveryPorCd
   * @return {Array} Retorno da consulta SQL.
   */

  api.buscaTpDelivery = async function (idDeliverys, res, next) {

    var objDelive = await dao.buscaTpDelivery(idDeliverys, res, next);

    return objDelive;
  }

  //-----------------------------------------------------------------------\\

  /**
   * @description Verifica se existe delivery passada e retorna o ID.
   *
   * @async
   * @function api/buscaDeliveryPorCd
   * @return {Array} Retorno da consulta SQL.
   */

  api.vincularDeliveryNotaAG = async function (objNota, objCte) {

    var objDelive = await dao.vincularDeliveryNotaAG(objNota, objCte);

    return objDelive;
  }

  api.retQntStDelivery = async function(req,res,next){
    await dao.retQntStDelivery(req, res, next)

    .then((result) => {
        res.json(result);
    })

    .catch((err) => {
        next(err);
    });
  }

  return api;

};