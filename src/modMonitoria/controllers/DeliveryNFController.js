module.exports = function (app) {

  var api = {};
  var dao = app.src.modMonitoria.dao.DeliveryNFDAO;
  var email = app.src.modMonitoria.controllers.EmailController;

  var up = app.src.modGlobal.controllers.MultiDocController;
  var nxt = app.src.modDocSyn.dao.NextIdDAO;
  var tmz = app.src.utils.DataAtual;
  var fnValidaDominio = app.src.modIntegrador.dao.ContatoClienteDAO;

  const fs = require('fs');
  const utilsCA = app.src.utils.ConversorArquivos;

  api.controller = app.config.ControllerBD;

  var PDFDocument, doc;
  PDFDocument = require('pdfkit');

  var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

  var request = require('request');
  const axios = require('axios');

  api.validaNfeBloqueada = async function (result) {
    if ("data" in result) {
      result.data.forEach(function (item) {
        if ((item.DTBLOQUE != null && item.DTBLOQUE != undefined && item.DTBLOQUE != 'n.i.')
          && (item.DTDESBLO == null || item.DTDESBLO == undefined || item.DTDESBLO == 'n.i.')) {
          item.DTENTCON = 'n.i.';
          item.DTENTREG = 'n.i.';
          item.PREENTRE = 'n.i.';
        }
      });
      return result;
    } else {
      return result;
    }
  }

  api.listar = async function (req, res, next) {
    try {
      let result1 = await dao.listar(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
      //result1 = await api.validaNfeBloqueada(result1);
      res.json(result1);
    } catch (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.listarWithoutCte = async function (req, res, next) {
    try {
      let result1 = await dao.listarWithoutCte(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
      result1 = await api.validaNfeBloqueada(result1);
      res.json(result1);
    } catch (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.listarCargaPorNfe = async function (req, res, next) {
    await dao.listarCargaPorNfe(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getDatasToAtendimento = async function (req, res, next) {
    await dao.getDatasToAtendimento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getNotasVinculadasAtendimento = async function (req, res, next) {
    await dao.getNotasVinculadasAtendimento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.isEntregue = async function (req, res, next) {
    await dao.isEntregue(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.isValidSendRastreio = async function (req, res, next) {
    await dao.isValidSendRastreio(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.validaPermissaoRastreio = async function (req, res, next) {
    await dao.validaPermissaoRastreio(req, res, next)
      .then((result1) => {
        console.log("result1", result1);
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.sendRastreio = async function (req, res, next) {
    //let result = await dao.getRastreio(req, res, next)
    var crondao = app.src.modMonitoria.dao.CronDAO;
    let paramLogCron = {};
    var validaDominio = {
      status: false,
      email: ''
    };
    let result = await dao.getRastreioPorCTE(req.body)
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    let emailValid = (req.body.DSEMAIL ? req.body.DSEMAIL : (req.body.DSEMASYN ? req.body.DSEMASYN : null));
    if (result.ISLIBERA == 1) {
      // if ((req.body.DSEMAIL != null && req.body.DSEMAIL != '' && req.body.DSEMAIL != undefined) || (req.body.DSEMASYN != null && req.body.DSEMASYN != '' && req.body.DSEMASYN != undefined)) {
      if (emailValid) {
        let objParamDominio = {
          CONTATO: [],
          IDG006: 27,
          IDG014: req.body.IDG014
        }
        let emailsAux = emailValid.split(',');

        for (let i = 0; i < emailsAux.length; i++) {
          objParamDominio.CONTATO.push({G008_TPCONTAT:'E',G008_DSCONTAT:emailsAux[i]})
        }

        validaDominio = await fnValidaDominio.validarEmails({ body: objParamDominio });

        if (validaDominio.status) {
          //valida e-mail exclusivo para Syngenta
          if (result.CDOPERAC == 5) {
            //console.log("email sygenta");
            await email.sendEmailEntregaSyngentaV2(result.NRNOTEMA, emailValid, req.headers.origin, req.UserId, null);
          } else if (result.CDOPERAC == 93) {
            await email.sendEmailEntregaFmcV2(result.NRNOTEMA, emailValid, req.headers.origin, req.UserId, null);
          } else if (result.CDOPERAC == 71) {
            await email.sendEmailEntregaAdamaV2(result.NRNOTEMA, emailValid, req.headers.origin, req.UserId, null);
          } else {
            //console.log("email normal");
            await email.sendEmailEntregaV2(result.NRNOTEMA, emailValid, req.headers.origin, req.UserId, null);
          }

          paramLogCron.IDG051 = result.IDG051;
          paramLogCron.IDG005DE = result.IDG005DE;
          paramLogCron.DSEMAID = '';
          paramLogCron.DSENVPAR = emailValid;
          paramLogCron.SNENVIAD = 1;
          paramLogCron.TPSISENV = 'R';
          paramLogCron.TXOBSERV = `Email enviado com sucesso G051 ${result.IDG051}`;
          paramLogCron.SNENVMAN = 1;
          paramLogCron.IDS001 = req.body.IDS001;
          await crondao.gravaLogEnvioCron(paramLogCron);

          res.json(result);
        } else {
          res.status(500).send({ armensag: `Não é permitido enviar o rastreio com esse(s) domínio(s): ${validaDominio.email}` });
        }
      } else {
        res.status(500).send({ armensag: 'Não foi possível enviar o rastreio.' });
      }
    } else {
      res.status(500).send({ armensag: 'Não foi possível enviar o rastreio.' });
    }
  };

  api.getStatusGeralNota = async function (req, res, next) {
    await dao.getStatusGeralNota(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarSatisfacao = async function (req, res, next) {
    await dao.salvarSatisfacao(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getComentario = async function (req, res, next) {
    await dao.getComentario(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarResposta = async function (req, res, next) {
    await dao.salvarResposta(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.validaRastreio = async function (req, res, next) {
    await dao.getRastreioPorCTE(req.body)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.validaSatisfacao = async function (req, res, next) {
    await dao.getSatisfacao(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.unsubSatisfacao = async function (req, res, next) {
    await dao.unsubSatisfacao(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getInformacoesCargaCompleta = async function (req, res, next) {
    let controller = req.body;

    let infoCarga = null;
    let infoParadas = null;
    let infoCTE = null;
    let infoNFE = null;
    let infoNFE_AUX = null;
    let infoAtendimento = null;

    infoCarga = await dao.getInformacoesCarga(req, res, next)
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    if (controller.G048 && controller.G048) {
      infoParadas = await dao.getParadasFromCarga(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G051) {
      infoCTE = await dao.getInformacoesCTe(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G043) {
      infoNFE = await dao.getInformacoesNotaFiscal(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G043_AUX) {
      infoNFE_AUX = await dao.getInformacoesNotaFiscalFromParada(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    let retorno = {};

    retorno =
      {
        'G046': (controller.IDG046 ? infoCarga : null),
        'G048': (controller.G048 ? infoParadas : null),
        'G051': (controller.G051 ? infoCTE : null),
        'G043': (controller.G043 ? infoNFE : null),
        'G043_AUX': (controller.G043_AUX ? infoNFE_AUX : null),
        'A001': (controller.A001 ? infoAtendimento : null)
      };

    res.json(retorno);
  }

  api.getInformacoesCargaCompletaSemAcl = async function (req, res, next) {
    let controller = req.body;

    let infoCarga = null;
    let infoParadas = null;
    let infoCTE = null;
    let infoNFE = null;
    let infoNFE_AUX = null;
    let infoAtendimento = null;
    let infoRestricoes = null;

    if (controller.G046) {
      infoCarga = await dao.getInformacoesCargaSemAcl(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G048 && controller.G048) {
      infoParadas = await dao.getParadasFromCargaSemAcl(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G051) {
      infoCTE = await dao.getInformacoesCTeSemAcl(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G043) {
      infoNFE = await dao.getInformacoesNotaFiscalSemAcl(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.G043_AUX) {
      infoNFE_AUX = await dao.getInformacoesNotaFiscalFromParadaSemAcl(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.IDG046) {
      infoRestricoes = await dao.getInformacoesRestricoesCarga(req, res, next)
        .then((res) => {
          return res;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    let retorno = {};

    retorno =
      {
        'G046': (controller.IDG046 ? infoCarga : null),
        'G048': (controller.G048 ? infoParadas : null),
        'G051': (controller.G051 ? infoCTE : null),
        'G043': (controller.G043 ? infoNFE : null),
        'G043_AUX': (controller.G043_AUX ? infoNFE_AUX : null),
        'A001': (controller.A001 ? infoAtendimento : null),
        'T004': (controller.IDG046 ? infoRestricoes : null)
      };

    res.json(retorno);
  }

  api.getInformacoesNotaFiscal = async function (req, res, next) {

    let controller = req.body;

    let infoNFE = null;
    let itensNFE = null;
    let infoCTE = null;
    let notasCTE = null;
    let infoCarga = null;
    let infoRastreamento = null;
    let infoTracking = null;
    let infoEmailRastreio = null;
    let infoNFE_AG = null;
    let itensNFE_AG = null;
    let infoRastreamento_AG = null;

    if (controller.NFE) {
      infoNFE = await dao.getInformacoesNotaFiscal(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.NFE && controller.IT_NFE) {
      itensNFE = await dao.getItensNotaFiscal(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.CTE) {
      infoCTE = await dao.getInformacoesCTe(req, res, next)
        .then((result1) => {
          return result1[0];
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.CTE && controller.NT_CTE) {
      notasCTE = await dao.getNotaVinculadasCTe(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.CARGA) {
      infoCarga = await dao.getInformacoesCarga(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.RASTREIO) {
      infoRastreamento = await dao.getInformacoesRastreamento(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.TRACKING) {
      infoTracking = await dao.getInformacoesTracking(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.EMAIL) {
      infoEmailRastreio = await dao.getEmailToRastreio(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.NFE_AG) {
      infoNFE_AG = await dao.getInformacoesNotaFiscalAg(req, res, next)
        .then((result1) => {
          return result1[0];
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.NFE_AG && controller.IT_NFE_AG) {
      itensNFE_AG = await dao.getItensNotaFiscalAG(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (controller.RASTREIO_AG) {
      infoRastreamento_AG = await dao.getInformacoesRastreamentoAg(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    if (infoNFE && infoNFE.length > 0) {
      if (infoNFE.length > 1) {
        for (let i = 0; i < infoNFE.length; i++) {
          if (itensNFE && itensNFE.length > 0) {
            let arItens = [];
            arItens = itensNFE.filter(item => { return item.IDG043 == infoNFE[i].IDG043 });
            infoNFE[i] = Object.assign(infoNFE[i], { 'ITENS_NFE': arItens });
          } else {
            infoNFE[i] = Object.assign(infoNFE[i], { 'ITENS_NFE': [] });
          }
        }
      } else {
        infoNFE = Object.assign(infoNFE[0], { 'ITENS_NFE': itensNFE });
      }
    }

    let retorno = {};

    // try {
    //   if (infoNFE != null && infoNFE != undefined &&
    //       infoCTE != null && infoCTE != undefined &&
    //       infoCarga != null && infoCarga != undefined &&
    //       infoRastreamento != null && infoRastreamento != undefined &&
    //       infoTracking != null && infoTracking != undefined) {

    retorno =
      {
        'NFE': (controller.NFE && infoNFE ? infoNFE : null),
        'CTE': (controller.CTE && infoCTE ? Object.assign(infoCTE, { 'NOTAS_CTE': notasCTE }) : null),
        'CARGA': (controller.CARGA ? infoCarga : null),
        'RASTREAMENTO': (controller.RASTREIO ? infoRastreamento : null),
        'TRACKING': (controller.TRACKING ? infoTracking : null),
        'EMAIL': (controller.EMAIL ? infoEmailRastreio : null),
        'NFE_AG': (controller.NFE_AG ? Object.assign(infoNFE_AG, { 'ITENS_NFE': itensNFE_AG }) : null),
        'RASTREAMENTO_AG': (controller.RASTREIO_AG ? infoRastreamento_AG : null)

      };
    res.json(retorno);
  };

  api.getItensNotaFiscal = async function (req, res, next) {
    await dao.getItensNotaFiscal(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getInformacoesCTe = async function (req, res, next) {
    await dao.getInformacoesCTe(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };



  api.getNotaVinculadasCTe = async function (req, res, next) {
    await dao.getNotaVinculadasCTe(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getInformacoesCarga = async function (req, res, next) {
    await dao.getInformacoesCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getDashboardIndicadores = async function (req, res, next) {
    await dao.getDashboardIndicadores(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getDashboardDiasEmAtraso = async function (req, res, next) {
    await dao.getDashboardDiasEmAtraso(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getDashboardEntregas = async function (req, res, next) {
    await dao.getDashboardEntregas(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getDashboardDemanda = async function (req, res, next) {
    await dao.getDashboardDemanda(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getRastreio = async function (req, res, next) {
    await dao.getRastreio(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.enviarSatisfacao = async function () {
    // - Crio um pool de conexão

    var daoCron = app.src.modMonitoria.dao.CronDAO;
    let con = await dao.controller.getConnection();
    let paramLogCron = {};
    //let urlHost = 'http://localhost:4200';
    let urlHost = 'http://monitoria.evolog.com.br';
    //let urlHost =  process.env.URL_MONITORIA;
    try {
      await dao.controller.setConnection(con);
      let req = {};
      req.body = {};
      req.con = con;

      //console.log("enviarSatisfacao",req.body);

      var objEnvioCteSatisfacao = await daoCron.cteEnvioSatisfacaoMonitoria();
      //console.log("objEnvioCteSatisfacao ", objEnvioCteSatisfacao);
      // return false;
      for (i = 0; i < objEnvioCteSatisfacao.length; i++) {

        //let emailUser = await dao.getEmailToRastreio(req, res, next)
        let emailUser = await dao.getEmailToNpsFromCte(req, objEnvioCteSatisfacao[i])
          .then((result1) => {
            return result1;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
          });

        //##############################################################################################
        // se for operação da Syngenta, não pega contatos de cliente e sim o contato que fica na nota
        let emailNpsSyngenta = null;
        if (objEnvioCteSatisfacao[i].IDG014 == 5) {
          emailNpsSyngenta = await dao.getEmailToRastreioCtePorDelivery(objEnvioCteSatisfacao[i])
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
            });

          //se for operação syngenta, sobrescreve os e-mail de contato e pega os contato que estão na delivery
          if (emailNpsSyngenta && typeof emailNpsSyngenta.DSEMAIL != undefined && emailNpsSyngenta.DSEMAIL != '') {
            if (emailUser != undefined && emailUser != null && emailUser.DSEMAIL != null && emailUser.DSEMAIL != undefined) {
              emailUser.DSEMAIL = emailNpsSyngenta.DSEMAIL + ',' + emailUser.DSEMAIL;
            } else {
              emailUser = emailNpsSyngenta;
            }
          }

        }

        //emailUser.DSEMAIL = 'filipe.tozze@bravolog.com.br';
        //emailUser.DSEMAIL = 'filipe.tozze@bravolog.com.br, evelyn.bull@bravolog.com.br';

        if (emailUser != null &&
          emailUser.DSEMAIL != null &&
          emailUser.DTENTREG != null
        ) {
          req.body.IDG005CO = emailUser.IDG005CO;
          req.body.IDG051 = emailUser.IDG051;
          req.body.DSEMAIL = emailUser.DSEMAIL;
          req.body.CDCTRC = emailUser.CDCTRC;
          req.body.IDG061 = emailUser.IDG061;

          let IDG061 = null;
          if (emailUser.IDG061 == null) {
            IDG061 = await dao.salvarCteSatisfacao(req, objEnvioCteSatisfacao[i])
              .then((result1) => {
                return result1;
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
              });
          }

          if (emailUser.IDG061 != null || IDG061 != null) {
            // - Pega o código da Satisfação ( Token )
            let result = await dao.getSatisfacaoFromCte(req, objEnvioCteSatisfacao[i])
              .then((result1) => {
                return result1;
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
              });

            if (result.ISLIBERA == 1) {
              //console.log("DSEMAIL", req.body.DSEMAIL);
              if (req.body.DSEMAIL != null && req.body.DSEMAIL != '') {
                //req.headers.origin = 'http://qas.monitoria.bravo2020.com.br/';
                // - Faz o Envio do E-mail
                if (process.env.APP_ENV == 'EVT') {
                  let resultEmail = null;
                  if (objEnvioCteSatisfacao[i].IDG014 == 5) {
                    // - Faz envio para syngenta
                    resultEmail = await email.sendEmailSatisfacaoV2Syngenta(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);
                  } else if (objEnvioCteSatisfacao[i].IDG014 == 93) {
                    resultEmail = await email.sendEmailSatisfacaoV2Fmc(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);
                  } else if (objEnvioCteSatisfacao[i].IDG014 == 71) {
                    resultEmail = await email.sendEmailSatisfacaoV2Adama(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);
                  } else {
                    resultEmail = await email.sendEmailSatisfacaoV2(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);
                  }
                  paramLogCron.IDG051 = emailUser.IDG051;
                  paramLogCron.DSEMAID = '';
                  paramLogCron.DSENVPAR = req.body.DSEMAIL;
                  paramLogCron.SNENVIAD = 1;
                  paramLogCron.TPSISENV = 'N';
                  paramLogCron.TXOBSERV = `Satisfação enviada com sucesso G051 ${emailUser.IDG051}`;
                  await daoCron.gravaLogEnvioCron(paramLogCron);
                  //res.json(result);
                }
              } else {
                con.closeRollback();
                paramLogCron.IDG051 = emailUser.IDG051;
                paramLogCron.DSEMAID = '';
                paramLogCron.DSENVPAR = '';
                paramLogCron.SNENVIAD = 2;
                paramLogCron.TPSISENV = 'N';
                paramLogCron.TXOBSERV = `Não foi possível enviar a satisfação, e-mail não informado G051 ${emailUser.IDG051}`;
                await daoCron.gravaLogEnvioCron(paramLogCron);
                //res.status(500).send({armensag:'Não foi possível enviar a satisfação.'});
              }
            } else {
              con.closeRollback();
              paramLogCron.IDG051 = emailUser.IDG051;
              paramLogCron.DSEMAID = '';
              paramLogCron.DSENVPAR = '';
              paramLogCron.SNENVIAD = 0;
              paramLogCron.TPSISENV = 'N';
              paramLogCron.TXOBSERV = `Não é possível enviar satisfação, não liberada G051 ${emailUser.IDG051}`;
              await daoCron.gravaLogEnvioCron(paramLogCron);
              //res.status(500).send({armensag:'Não foi possível enviar a satisfação.'});
            }
          } else {
            con.closeRollback();
            paramLogCron.IDG051 = emailUser.IDG051;
            paramLogCron.DSEMAID = '';
            paramLogCron.DSENVPAR = '';
            paramLogCron.SNENVIAD = 3;
            paramLogCron.TPSISENV = 'N';
            paramLogCron.TXOBSERV = `Registro de satisfação não encontrado G051 ${emailUser.IDG051}`;
            await daoCron.gravaLogEnvioCron(paramLogCron);
            //res.status(500).send({armensag:'Não foi possível enviar o e-mail, pois já foi enviado.'});
          }
        } else {
          con.closeRollback();
          paramLogCron.IDG051 = objEnvioCteSatisfacao[i].IDG051;
          paramLogCron.DSEMAID = '';
          paramLogCron.DSENVPAR = '';
          paramLogCron.SNENVIAD = 4;
          paramLogCron.TPSISENV = 'N';
          paramLogCron.TXOBSERV = `Não foi possível enviar o e-mail, existem campos inválidos G051 ${objEnvioCteSatisfacao[i].IDG051}`;
          await daoCron.gravaLogEnvioCron(paramLogCron);
          //res.status(500).send({armensag:'Não foi possível enviar o e-mail, existem campos inválidos.'});
        }
      }
      console.log("Processo envio satisfação finalizado");
      await con.close();
      return `Processo envio satisfação finalizado`;
    } catch (err) {
      console.log(err);
      con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
    }
  };

  api.enviarSatisfacaoUnico = async function (req, res, next) {
    // - Crio um pool de conexão
    let con = await dao.controller.getConnection();
    var daoCron = app.src.modMonitoria.dao.CronDAO;
    let paramLogCron = {};
    //let urlHost = 'http://localhost:4200';
    let urlHost = 'http://monitoria.evolog.com.br';
    var param = req.body;
    var emailEnvio = req.body.DSEMAIL;
    var IDS001 = req.body.IDS001;
    var validaDominio = {
      status: false,
      email: ''
    };

    try {
      await dao.controller.setConnection(con);
      let req = {};
      req.body = {};
      req.con = con;


      let emailUser = await dao.getEmailToNpsFromCte(req, param)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
        });
          
        if (emailUser) {
          emailUser.DSEMAIL = emailEnvio;
        } else {
          emailUser = {
            DSEMAIL: emailEnvio
          }
        }

      if (emailUser != null &&
        emailUser.DSEMAIL != null &&
        emailUser.DTENTREG != null
      ) {
        req.body.IDG005CO = emailUser.IDG005CO;
        req.body.IDG051 = emailUser.IDG051;
        req.body.DSEMAIL = emailUser.DSEMAIL;
        req.body.CDCTRC = emailUser.CDCTRC;
        req.body.IDG061 = emailUser.IDG061;

        let IDG061 = null;
        if (emailUser.IDG061 == null) {
          IDG061 = await dao.salvarCteSatisfacao(req, param)
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
            });
        }

        if (emailUser.IDG061 != null || IDG061 != null) {
          // - Pega o código da Satisfação ( Token )
          let result = await dao.getSatisfacaoFromCte(req, param)
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
            });

          if (result.ISLIBERA == 1) {
            //console.log("DSEMAIL", req.body.DSEMAIL);
            if (req.body.DSEMAIL != null && req.body.DSEMAIL != '') {
              let objParamDominio = {
                CONTATO: [],
                IDG006: 27,
                IDG014: req.body.IDG014
              }
              let emailsAux = req.body.DSEMAIL.split(',');

              for (let i = 0; i < emailsAux.length; i++) {
                objParamDominio.CONTATO.push({G008_TPCONTAT:'E',G008_DSCONTAT:emailsAux[i]})
              }

              validaDominio = await fnValidaDominio.validarEmails({ body: objParamDominio });

              if (validaDominio.status) {
                // - Faz o Envio do E-mail
                if (emailUser.IDG014 == 5) {
                  // - Faz envio para syngenta
                  let resultEmail = await email.sendEmailSatisfacaoV2Syngenta(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);

                  paramLogCron.IDG051 = emailUser.IDG051;
                  paramLogCron.DSEMAID = '';
                  paramLogCron.DSENVPAR = req.body.DSEMAIL;
                  paramLogCron.SNENVIAD = 1;
                  paramLogCron.TPSISENV = 'N';
                  paramLogCron.TXOBSERV = `Satisfação enviada com sucesso G051 ${emailUser.IDG051}`;
                  paramLogCron.SNENVMAN = 1;
                  paramLogCron.IDS001 = IDS001;
                  await daoCron.gravaLogEnvioCron(paramLogCron);

                  res.json({ success: true, armensag: `Satisfação enviada com sucesso G051 ${emailUser.IDG051}` });
                } else if (emailUser.IDG014 == 93) {
                  let resultEmail = await email.sendEmailSatisfacaoV2Fmc(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);

                  paramLogCron.IDG051 = emailUser.IDG051;
                  paramLogCron.DSEMAID = '';
                  paramLogCron.DSENVPAR = req.body.DSEMAIL;
                  paramLogCron.SNENVIAD = 1;
                  paramLogCron.TPSISENV = 'N';
                  paramLogCron.TXOBSERV = `Satisfação enviada com sucesso G051 ${emailUser.IDG051}`;
                  paramLogCron.SNENVMAN = 1;
                  paramLogCron.IDS001 = IDS001;
                  await daoCron.gravaLogEnvioCron(paramLogCron);

                  res.json({ success: true, armensag: `Satisfação enviada com sucesso G051 ${emailUser.IDG051}` });

                } else if (emailUser.IDG014 == 71) {
                  let resultEmail = await email.sendEmailSatisfacaoV2Adama(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);

                  paramLogCron.IDG051 = emailUser.IDG051;
                  paramLogCron.DSEMAID = '';
                  paramLogCron.DSENVPAR = req.body.DSEMAIL;
                  paramLogCron.SNENVIAD = 1;
                  paramLogCron.TPSISENV = 'N';
                  paramLogCron.TXOBSERV = `Satisfação enviada com sucesso G051 ${emailUser.IDG051}`;
                  paramLogCron.SNENVMAN = 1;
                  paramLogCron.IDS001 = IDS001;
                  await daoCron.gravaLogEnvioCron(paramLogCron);

                  res.json({ success: true, armensag: `Satisfação enviada com sucesso G051 ${emailUser.IDG051}` });
                } else {
                  let resultEmail = await email.sendEmailSatisfacaoV2(req.body.CDCTRC, result.G043_NRNOTA, req.body.DSEMAIL, result.CDSATISF, urlHost, null);

                  paramLogCron.IDG051 = emailUser.IDG051;
                  paramLogCron.DSEMAID = '';
                  paramLogCron.DSENVPAR = req.body.DSEMAIL;
                  paramLogCron.SNENVIAD = 1;
                  paramLogCron.TPSISENV = 'N';
                  paramLogCron.TXOBSERV = `Satisfação enviada com sucesso G051 ${emailUser.IDG051}`;
                  paramLogCron.SNENVMAN = 1;
                  paramLogCron.IDS001 = IDS001;
                  await daoCron.gravaLogEnvioCron(paramLogCron);

                  res.json({ success: true, armensag: `Satisfação enviada com sucesso G051 ${emailUser.IDG051}` });
                }
              } else {
                con.closeRollback();
                res.status(500).send({ success: false, armensag: `Não é permitido enviar NPS com esse(s) domínio(s): ${validaDominio.email}` });
              }
            } else {
              con.closeRollback();
              res.status(500).send({ success: false, armensag: `Não foi possível enviar a satisfação, e-mail não informado G051 ${emailUser.IDG051}` });
            }
          } else {
            con.closeRollback();
            res.status(500).send({ success: false, armensag: `Registro de satisfação não liberada G051 ${emailUser.IDG051}` });
          }
        } else {
          con.closeRollback();
          res.status(500).send({ success: false, armensag: `Registro de satisfação não encontrado G051 ${emailUser.IDG051}` });
        }
      } else {
        con.closeRollback();
        res.status(500).send({ success: false, armensag: 'Não foi possível enviar o e-mail, existem campos inválidos G051.' });
      }
    } catch (err) {
      console.log(err);
      con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
    }
  };

  api.uploadCanhotoMo = async function (req, res, next) {

    var allow = 0;
    var extentionFile;
    var sizeFile;

    for (let arq of req.files) {
      extentionFile = ((arq.originalname).substring((arq.originalname).lastIndexOf("."))).toLowerCase();
      sizeFile = arq.size;

      if ((extentionFile == ".jpeg" || extentionFile == ".jpg") && arq.size <= 4194304) {
        allow = 1;
      } else {
        allow = 0;
        break;
      }

    }
    if (allow == 1) {
      // await up.saveDoc(req, res, next)
      //   .then( async (result) => {
      //     await nxt.insereEventoDelivery({
      //       IDG043: req.body.PKS007,
      //       IDI001: 30,
      //       DTEVENTO: tmz.tempoAtual('YYYY-MM-DD HH:mm:ss')
      //     })
      //   });

      let filename = req.files[0].originalname;
      let path = process.cwd() + '\\public\\canhotos\\' + filename;
      fs.writeFileSync(path, req.files[0].buffer);


      var data = {
        file: fs.createReadStream(path),
        IDS001: req.body.IDS001,
        NMTABELA: req.body.NMTABELA,
        PKS007: req.body.PKS007,
        TPDOCUME: req.body.TPDOCUME
      }

      request.put({ url: 'http://34.238.36.203/api/multidoc/save', formData: data }, async function callback(err, response, body) {
        if (err) {
          fs.unlinkSync(path);
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        }

        fs.unlinkSync(path);
        await nxt.insereEventoDelivery({
          IDG043: req.body.PKS007,
          IDI001: 30,
          DTEVENTO: tmz.tempoAtual('YYYY-MM-DD HH:mm:ss')
        })
        res.status(200).send('Upload realizado com sucesso!');

      })



    } else {
      if (extentionFile != ".jpeg" && extentionFile != ".jpg") {
        res.status(400).send('Extensões invalidas');
      } else if (sizeFile > 204800) {
        res.status(400).send('O tamanho permitido por arquivo é 4M.');
      } else {
        res.status(400).send('Erro na importação do(s) canhoto(s)');
      }

    }

  }

  api.listarPorCarga = async function (req, res, next) {
    await dao.listarPorCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarPorConhecimento = async function (req, res, next) {
    await dao.listarPorConhecimento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarQM = async function (req, res, next) {

    try {

      let transpFilter = req.body.NM_TRANSP;
      let pastaFilter = req.body.NM_PASTA;
      let dataFilter = req.body.DT_PROCESS;
      let nota = req.body.NRNOTA;

      let pathFilter = null;
      let arquivos = null;
      let files = [];
      let obj = null;

      let path = null;
      // Verifica se é Windows
      if (process.platform === "win32") {
        path = process.cwd() + '/../rastreio';
      } else {
        // Caso se diferente ele vai para a pasta do Linux.
        path = "/dados/rastreio";
      }

      let pastas = fs.readdirSync(path);

      for (key in pastas) {

        if (transpFilter != null && transpFilter != undefined && transpFilter != '') {

          if (pastas[key] == transpFilter.toLowerCase()) {

            if (pastaFilter != null && pastaFilter != undefined && pastaFilter != '') {
              if (pastaFilter == 'in') {
                pathFilter = path + '/' + pastas[key] + '/qm/in';

              } else {
                pathFilter = path + '/' + pastas[key] + '/qm/out';

              }

              arquivos = fs.readdirSync(pathFilter);

              for (key in arquivos) {

                if (nota != null && nota != undefined && nota != '') {
                  let pathFile = pathFilter + '/' + arquivos[key];

                  // Lê o arquivo.
                  let strXml = utilsCA.lerArquivo(pathFile);
                  // Converte o arquivo em DOM.
                  let xmlDom = utilsCA.getXmlDom(strXml);
                  // Pega todas as tag dnf.
                  let elements = utilsCA.getXmlNodes('/infnfs/dnf', xmlDom);

                  for (let x = 0; x < elements.length; x++) {
                    let nf = elements[x].getAttribute('nf');

                    if (nota == nf) {
                      if (dataFilter != null && dataFilter != undefined && dataFilter != '') {
                        if (dataFilter == (arquivos[key].substr(0, 10))) {
                          obj = {
                            'ARQUIVO': (arquivos[key] ? arquivos[key] : null),
                            'PASTA': (pastaFilter ? pastaFilter.toUpperCase() : null),
                            'TRANSPORTADORA': (transpFilter ? transpFilter.toUpperCase() : null)
                          };

                          files.push(obj);
                          break;

                        }
                      } else {
                        obj = {
                          'ARQUIVO': (arquivos[key] ? arquivos[key] : null),
                          'PASTA': (pastaFilter ? pastaFilter.toUpperCase() : null),
                          'TRANSPORTADORA': (transpFilter ? transpFilter.toUpperCase() : null)
                        };

                        files.push(obj);
                        break;
                      }
                    }

                  }

                } else {
                  if (dataFilter != null && dataFilter != undefined && dataFilter != '') {
                    if (dataFilter == (arquivos[key].substr(0, 10))) {
                      obj = {
                        'ARQUIVO': (arquivos[key] ? arquivos[key] : null),
                        'PASTA': (pastaFilter ? pastaFilter.toUpperCase() : null),
                        'TRANSPORTADORA': (transpFilter ? transpFilter.toUpperCase() : null)
                      };

                      files.push(obj);
                    }
                  } else {

                    obj = {
                      'ARQUIVO': (arquivos[key] ? arquivos[key] : null),
                      'PASTA': (pastaFilter ? pastaFilter.toUpperCase() : null),
                      'TRANSPORTADORA': (transpFilter ? transpFilter.toUpperCase() : null)
                    };

                    files.push(obj);

                  }
                }



              }

            }
          }

        }

      }

      res.json(files);

    } catch (err) {
      logger.info(err);
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

  }

  api.listarConteudoQM = async function (req, res, next) {

    try {

      let transp = req.body.TRANSPORTADORA;
      let pasta = req.body.PASTA;
      let arquivo = req.body.ARQUIVO;
      let nota = req.body.NRNOTA;

      let pathFound = null;
      let arquivosFound = null;
      let conteudo = [];

      let path = null;
      // Verifica se é Windows
      if (process.platform === "win32") {
        path = process.cwd() + '/../rastreio';
      } else {
        // Caso se diferente ele vai para a pasta do Linux.
        path = "/dados/rastreio";
      }

      let pastas = fs.readdirSync(path);

      for (key in pastas) {

        if (transp != null && transp != undefined && transp != '') {

          if (pastas[key] == transp.toLowerCase()) {

            if (pasta != null && pasta != undefined && pasta != '') {
              if (pasta.toLowerCase() == 'in') {
                pathFound = path + '/' + pastas[key] + '/qm/in';

              } else {
                pathFound = path + '/' + pastas[key] + '/qm/out';

              }

              arquivosFound = fs.readdirSync(pathFound);

              for (key1 in arquivosFound) {

                if (arquivosFound[key1] == arquivo) {
                  let pathFile = pathFound + '/' + arquivosFound[key1];

                  // Lê o arquivo.
                  let strXml = utilsCA.lerArquivo(pathFile);
                  // Converte o arquivo em DOM.
                  let xmlDom = utilsCA.getXmlDom(strXml);
                  // Pega todas as tag dnf.
                  let elements = utilsCA.getXmlNodes('/infnfs/dnf', xmlDom);

                  for (let x = 0; x < elements.length; x++) {

                    let nf = elements[x].getAttribute('nf');
                    let lat = elements[x].getAttribute('lat').replace(/,/g, ".").substr(0, 15);
                    let lon = elements[x].getAttribute('lon').replace(/,/g, ".").substr(0, 15);
                    let dhatu = elements[x].getAttribute('dhatu');
                    let loc = elements[x].getAttribute('loc');
                    let dtentr = elements[x].getAttribute('dtentr');
                    let dtpreent = elements[x].getAttribute('dtpreent');
                    let ocor = elements[x].getAttribute('ocor');
                    let cjrem = elements[x].getAttribute('cjrem');

                    if (nota != null && nota != undefined && nota != '') {

                      if (nf == nota) {

                        obj = {
                          'NF': (nf ? nf : null),
                          'LAT': (lat ? lat : null),
                          'LON': (lon ? lon.toUpperCase() : null),
                          'DHATU': (dhatu ? dhatu : null),
                          'LOC': (loc ? loc : null),
                          'DTENTR': (dtentr ? dtentr.toUpperCase() : null),
                          'DTPREENT': (dtpreent ? dtpreent : null),
                          'OCOR': (ocor ? ocor : null),
                          'CJREM': (cjrem ? cjrem.toUpperCase() : null)
                        };

                        conteudo.push(obj);

                      }

                    } else {

                      obj = {
                        'NF': (nf ? nf : null),
                        'LAT': (lat ? lat : null),
                        'LON': (lon ? lon.toUpperCase() : null),
                        'DHATU': (dhatu ? dhatu : null),
                        'LOC': (loc ? loc : null),
                        'DTENTR': (dtentr ? dtentr.toUpperCase() : null),
                        'DTPREENT': (dtpreent ? dtpreent : null),
                        'OCOR': (ocor ? ocor : null),
                        'CJREM': (cjrem ? cjrem.toUpperCase() : null)
                      };

                      conteudo.push(obj);

                    }

                  }
                }

              }

            }
          }

        }

      }

      res.json(conteudo);

    } catch (err) {
      logger.info(err);
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

  }

  api.visualizarQM = function (req, res, next) {

    let transp = req.body.TRANSPORTADORA.toLowerCase();
    let pasta = req.body.PASTA.toLowerCase();
    let arquivo = req.body.ARQUIVO;
    let pathArquivo = null;

    let path = null;
    // Verifica se é Windows
    if (process.platform === "win32") {
      path = process.cwd() + '/../rastreio';
    } else {
      // Caso se diferente ele vai para a pasta do Linux.
      path = "/dados/rastreio";
    }

    pathArquivo = path + '/' + transp + '/qm/' + pasta + '/' + arquivo;

    let strArquivo = utilsCA.lerArquivo(pathArquivo);

    res.json(strArquivo);

  }

  api.listarAg = async function (req, res, next) {
    try {
      let result1 = await dao.listarAg(req, res, next)
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
      //result1 = await api.validaNfeBloqueada(result1);
      res.json(result1);
    } catch (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.getDatasToAtendimentoAg = async function (req, res, next) {
    await dao.getDatasToAtendimentoAg(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getInfoCTE = async function (req, res, next) {
    await dao.getInfoCTE(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvaDataCanhoto = async function (req, res, next) {
    await dao.salvaDataCanhoto(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.validaRastreioAg = async function (req, res, next) {
    await dao.getCteInfoAg(req.body)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarNotaAlterada = async function (req, res, next) {
    await dao.salvarNotaAlterada(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.descadastroRastreio = async function (req, res, next) {
    await dao.descadastroRastreio(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarQMAux = async function (req, res, next) {

    axios.post('http://34.238.36.203/api/mo/deliverynf/listarQm', req.body)
      .then((result) => {
        res.json(result.data);
      }).catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  }

  api.listarConteudoQMAux = async function (req, res, next) {

    axios.post('http://34.238.36.203/api/mo/deliverynf/listarConteudoQM', req.body)
      .then((result) => {
        res.json(result.data);
      }).catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  }

  api.visualizarQMAux = async function (req, res, next) {

    axios.post('http://34.238.36.203/api/mo/deliverynf/visualizarQM ', req.body)
      .then((result) => {
        res.json(result.data);
      }).catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  }

  api.auxGerarXML = async function (req, res, next) {

    axios.get('http://34.238.36.203/api/docsyn/pod/generate/' + req.body.IDG043)
      .then((result) => {
        res.json(result.data);
      }).catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  }

  api.danfeGeneratorByXml = async function (req, res, next) {
    await dao.danfeGeneratorByXml(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.downloadXmlDocs = async function (req, res, next) {
    await dao.downloadXmlDocs(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }
  
  api.dacteGeneratorByXml = async function (req, res, next) {
    await dao.dacteGeneratorByXml(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  api.getListUnsubMail = async function (req, res, next) {
    await dao.getListUnsubMail(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.enableMailReceptionNPS = async function (req, res, next) {
    await dao.enableMailReceptionNPS(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\	

  return api;
};
