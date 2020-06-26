module.exports = function (app, cb) {

  var dao = app.src.modLogisticaReversa.dao.DevolucaoDAO;
  const fldAdd = app.src.modGlobal.controllers.XFieldAddController;


  var api = {};

  //-----------------------------------------------------------------------\\

  api.registrarContato = async function (req, res, next) {
    await dao.registrarContato(req, res, next)
      .then(async result => {
        req.body.idAtendimento = result.id;

        let teste = await dao.registrarObservacoes(req, res, next)
          .then(async result => {

            console.log(result);

            if (req.body.G043_STETAPA == 20) {
              req.body.G043_STETAPA = 22;
              req.body.G043_STULTETA = 20;
              let resultadoStatus = await dao.alterarStatusCarga(req, res, next)
                .then(result => { 
                  return result;
                })
                .catch(err => {
                  err.stack = new Error().stack + '\r\n' + err.stack;
                });
            }
            return result;
          })
          .catch(err => {
            err.stack = new Error().stack + '\r\n' + err.stack;
          });
        console.log(teste);

        await dao.registrarContatoDelivery(req, res, next)
          .then(result => {
            return result;
          })
          .catch(err => {
            err.stack = new Error().stack + '\r\n' + err.stack;
          });

        res.json(result);
      })
      .catch(err => {
        err.stack = new Error().stack + '\r\n' + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.registrarObservacoes = async function (req, res, next) {
    await dao.registrarObservacoes(req, res, next)
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        err.stack = new Error().stack + '\r\n' + err.stack;
      });
  }

  //-----------------------------------------------------------------------\\

  api.getDashboardJson = async function (req, res, next) {
    await dao.getDashboardData(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.getDashboardJsonAtu = async function (req, res, next) {
    await dao.getDashboardDataAtu(req, res, next)
      .then((result) => {
        res.send(result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.getDashboardOtimizando = async function (req, res, next) {
    await dao.getDashboardOtimizando(req, res, next)
      .then(result => {
        res.send(result);
      })

      .catch(err => {
        err.stack = new Error().stack + `\r\n` + err.stack;
      });
  }

  //-----------------------------------------------------------------------\\

  api.retQntStDelivery = async function (req, res, next) {
    await dao.retQntStDelivery(req, res, next)
      .then(result => {
        let temp = [20, 22, 23, 24, 4, 5]; // []

        temp = temp.map((dataMap) => {
          return result.filter(dataFilter => {
            return dataFilter.filtParam == dataMap
          })[0];
        });

        result = temp;
        res.json(result);
      })
      .catch(err => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }
    //-----------------------------------------------------------------------\\

  api.otimizandoDetails = async function (req, res, next) {
    var resultado;

    await dao.otimizandoDetails(req, res, next)
      .then(result => {
        resultado = result;
      })
      .catch(err => {
        err.stack = new Error().stack + '\r\n' + err.stack;
        next(err);
      });

    let objPesoValor = {
      PSBRUTO: 0,
      VRDELIVE: 0,
      VRVOLUME: 0
    };

    for (let i = 0; i < resultado.length; i++) {
      objPesoValor.PSBRUTO += resultado[i].PSBRUTO;
      objPesoValor.VRDELIVE += resultado[i].VRDELIVE;
      objPesoValor.VRVOLUME += resultado[i].VRVOLUME;
    }

    resultado.pesoBrutoTotal = objPesoValor.PSBRUTO;
    resultado.valorTotal = objPesoValor.VRDELIVE;
    resultado.volumeTotal = objPesoValor.VRVOLUME;

    await dao.buscaTransporte(resultado, res, next)
      .then(result => {
        resultado.transporte = result[0];
      })
      .catch(err => {
        err.stack = new Error().stack + '\r\n' + err.stack;
        next(err);
      })

    resultado = resultado.map(d => {
      d.pesoBrutoTotal = resultado.pesoBrutoTotal;
      d.valorTotal = resultado.valorTotal;
      d.volumeTotal = resultado.volumeTotal;
      d.IDG030 = {
        id: resultado.transporte.IDG030,
        idg030: resultado.transporte.IDG030,
        text: resultado.transporte.DSTIPVEI,
        dstipvei: resultado.transporte.DSTIPVEI,
        qtcappes: resultado.transporte.QTCAPPES,
        qtcapvol: resultado.transporte.QTCAPVOL,
        pcpesmin: resultado.transporte.PCPESMIN
      };
      d.IDG024 = {
        id: d.G024_IDG024,
        cjtransp: d.G024_CJTRANSP,
        idlogos: d.G024_IDLOGOS,
        ietransp: d.G024_IETRANSP,
        nmtransp: d.G024_NMTRANSP,
        nrlatitu: d.G024_NRLATITU,
        nrlongit: d.G024_NRLONGIT,
        rstransp: d.G024_RSTRANSP,
        text: (d.G024_NMTRANSP == null && d.G024_CJTRANSP == null && d.G024_IETRANSP == null) ? null : `${d.G024_NMTRANSP} [${(d.G024_CJTRANSP + '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")} - ${d.G024_IETRANSP} - ${d.G024_IDLOGOS != null ? d.G024_IDLOGOS : ''}]`
      };

      delete d.G024_IDG024;
      delete d.G024_CJTRANSP;
      delete d.G024_IDLOGOS;
      delete d.G024_IETRANSP;
      delete d.G024_NMTRANSP;
      delete d.G024_NRLATITU;
      delete d.G024_NRLONGIT;
      delete d.G024_RSTRANSP;

      d.IDG031M1 = api.criaObjMotorista(d.G031M1_IDG031, d.G031M1_NMMOTORI, d.G031M1_NRMATRIC);
      d.IDG031M2 = api.criaObjMotorista(d.G031M2_IDG031, d.G031M2_NMMOTORI, d.G031M2_NRMATRIC);
      d.IDG031M3 = api.criaObjMotorista(d.G031M3_IDG031, d.G031M3_NMMOTORI, d.G031M3_NRMATRIC);

      delete d.G031M1_IDG031;
      delete d.G031M1_NMMOTORI;
      delete d.G031M1_NRMATRIC;
      delete d.G031M2_IDG031;
      delete d.G031M2_NMMOTORI;
      delete d.G031M2_NRMATRIC;
      delete d.G031M3_IDG031;
      delete d.G031M3_NMMOTORI;
      delete d.G031M3_NRMATRIC;


      d.IDG032V1 = api.criaObjVeiculo(d.G032V1_IDG032, d.G032V1_DSVEICUL, d.G032V1_NRCHASSI, d.G032V1_NRPLAVEI);
      d.IDG032V2 = api.criaObjVeiculo(d.G032V2_IDG032, d.G032V2_DSVEICUL, d.G032V2_NRCHASSI, d.G032V2_NRPLAVEI);
      d.IDG032V3 = api.criaObjVeiculo(d.G032V3_IDG032, d.G032V3_DSVEICUL, d.G032V3_NRCHASSI, d.G032V3_NRPLAVEI);


      delete d.G032V1_IDG032;
      delete d.G032V1_DSVEICUL;
      delete d.G032V1_NRCHASSI;
      delete d.G032V1_NRPLAVEI;
      delete d.G032V2_IDG032;
      delete d.G032V2_DSVEICUL;
      delete d.G032V2_NRCHASSI;
      delete d.G032V2_NRPLAVEI;
      delete d.G032V3_IDG032;
      delete d.G032V3_DSVEICUL;
      delete d.G032V3_NRCHASSI;
      delete d.G032V3_NRPLAVEI;

      return d;
    })

    res.json(resultado);
  }
    //-----------------------------------------------------------------------\\

  api.criaObjMotorista = function (id, nome, matricula) {
    let obj;

    if (id == null) {

      obj = null;
    } else {

      obj = {
        id: id,
        text: `${nome} [${matricula != null ? matricula : 'n.i'}]`
      }
    }

    return obj;
  }
    //-----------------------------------------------------------------------\\

  api.criaObjVeiculo = function (id, descricao, chassi, placa) {
    let obj;

    if (id == null) {

      obj = null;
    } else {

      obj = {
        id: id,
        text: `${descricao} [${chassi != null ? chassi : 'n.i'} - ${placa}]`
      }
    }

    return obj;
  }
    //-----------------------------------------------------------------------\\

  api.alterarStatusCarga = async function (req, res, next) {
    await dao.alterarStatusCarga(req, res, next)
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        err.stack = new Error().stack + '\r\n' + err.stack;
        next(err);
      })
  }
    //-----------------------------------------------------------------------\\

  api.confirmaColeta = async function (req, res, next) {
    let altStatus = {};

    //Validando caso a delivery seja de recusa ela vai direto para encerrado (stetapa = 5)
    if(req.body.DH_TPDELIVE == 4){
      altStatus = {body:{G043_STETAPA: 5, IDG043: req.body.IDG043 }}
    }else {
      altStatus = {body:{G043_STETAPA: 4, IDG043: req.body.IDG043 }}    
    }

    await dao.confirmaColeta(req, res, next)
      .then(async data => {
        if (data.error) {
          res.json(data);
        } else {
                
          await dao.alterarStatusCarga(altStatus, res, next)
            .then(result => {
              return result;
            })
            .catch(err => {
              err.stack = new Error().stack + '\r\n' + err.stack;
              next(err);
            });

            res.json(data);           
        }        
      }) 
      .catch(err => {
        err.stack = new Error().stack + '\r\n' + err.stack;
        next(err);
      })
    
  }
    //-----------------------------------------------------------------------\\

  api.salvarProtocolo = async function (req, res, next) {

    req.objConn = await dao.controller.getConnection();
    req.idTabela = req.body.IDG043;
    req.nmTabela = 'G043';
    req.NRPROTOC = req.body.NRPROTOC;
    var result = await fldAdd.inserirValoresAdicionais(req, res, next)
      .then(async () => {
        await req.objConn.close();
      })
      .catch((err) => {
        throw err
      });

    res.status(200).send({ message: "Registro Incluido com sucesso" });
  }
    //-----------------------------------------------------------------------\\

  return api;

};