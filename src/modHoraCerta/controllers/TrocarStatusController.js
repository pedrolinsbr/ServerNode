module.exports = function (app, cb) {

  var api      = {};
  const dao    = app.src.modHoraCerta.dao.TrocarStatusDAO;
  const daoAG2 = app.src.modHoraCerta.dao.Agendamento2DAO;

  const tmz     		= app.src.utils.DataAtual;

  const ctrlWare = app.src.modWarehouse.controllers.MilestonesController;

  const objTS = {
    IDH006      : '',
    STAGENDA    : '',
    OLD_STAGENDA: '',
    IDI015      : '',
    IDG028      : '',
    IDS001      : '',
    TXOBSERV    : '',
    objConn     : '',
  }

  //=-=-=-= LEGENDA STATUS AGENDAMENTO=-=-=-=-=-=-=-=-=
  // 03 - AGENDADO
  // 04 - CHECKIN
  // 05 - ENTROU
  // 06 - INICIOU OPERAÇÃO
  // 07 - FINALIZOU OPERAÇÃO
  // 08 - SAIU
  // 09 - FALTOU
  // 10 - CANCELADO
  // 11 - REAGENDADO
  // 12 - SOLICITOU ENTRADA
  // 13 - SOLICITOU SAÍDA
  // 14 - INICIOU CONFERÊNCIA
  // 16 - FINALIZOU CONFERÊNCIA
  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

  api.trocarStatus = async function (req, res, next) {

    try {

      //=-=-=-= DEFINIÇÃO DE VARIÁVEIS=-=-=-=-=-=-=-=-=
      objTS.IDS001       = req.body.IDS001;
      objTS.IDH006       = req.body.IDH006;
      objTS.STAGENDA     = req.body.STAGENDA;
      objTS.OLD_STAGENDA = (req.body.OLD_STAGENDA !== undefined) ? req.body.OLD_STAGENDA : null;
      objTS.IDI015       = (req.body.IDI015       !== undefined) ? req.body.IDI015       : null;
      objTS.IDG028       = (req.body.IDG028       !== undefined) ? req.body.IDG028       : null;
      //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

      if (objTS.IDS001 && objTS.IDH006 && objTS.STAGENDA) {

        objTS.objConn = await dao.controller.getConnection();

        let coment = await dao.buscarComentario(objTS, res, next);

        objTS.TXOBSERV = (coment) ? coment : '';

        let st = await dao.buscarStatusAtual(objTS, res, next);

        if (st[0]['STAGENDA']) {
          var result = {};
          let status = st[0]['STAGENDA'];

          if (status == 10) {
            result.blOk    = false;
            result.msgErro = `Não é possível alterar o status do agendamento, pois o mesmo foi cancelado!`;
          } else {

            if (objTS.STAGENDA == status) {
              result.blOk    = false;
              result.msgErro = `Não é possível alterar o status do agendamento para o mesmo status que o atual!`;
            } else {

              switch(objTS.STAGENDA) {
                case 3:
                    result = await api.agendado(objTS, res, next);
                  break
                case 4:
                  if (status == 6 || status == 7) {
                    result.blOk    = false;
                    result.msgErro = `Não é possível alterar o status do agendamento de 'Iniciou Operação' ou 'Finalizou Operação' para 'Checkin'!`;
                  } else {
                    result = await api.checkin(objTS, res, next);
                  }
                  break
                case 5:
                  if (status < 4) {
                    result.blOk    = false;
                    result.msgErro = `Não é possível alterar o status do agendamento de 'Agendado' para 'Entrou'!`;
                  } else {
                    result = await api.entrou(objTS, res, next);
                  }
                  break
                case 6:
                  if (status < 5) {
                    result.blOk    = false;
                    result.msgErro = `Não é possível alterar o status do agendamento de 'Agendado' ou 'Checkin' para 'Iniciou Operação'!`;
                  } else {
                    result = await api.iniciouOperacao(objTS, res, next);
                  }
                  break
                case 7:
                  if (status < 6) {
                    result.blOk    = false;
                    result.msgErro = `Não é possível alterar o status do agendamento de 'Entrou' para 'Finalizou Operação'!`;
                  } else {
                    result = await api.finalizouOperacao(objTS, res, next);
                  }
                  break
                case 8:
                  result = await api.saiu(objTS, res, next);
                  break
                case 9:
                  result = await api.faltou(objTS, res, next);
                  break
                case 11:
                  result = await api.reagendado(objTS, res, next);
                  break
                case 12:
                  if (status == 4) {
                    result = await api.solicitouEntrada(objTS, res, next);
                  } else {
                    result.blOk = false;
                    result.msgErro = `Só é possível solicitar entrada se o agendamento estiver em 'CheckIn'.`;
                  }
                  break
                case 13:
                  result = await api.solicitouSaida(objTS, res, next);
                  break
                case 14:
                case 15:
                  result = await api.iniciouConferencia(objTS, res, next);
                  break
                case 16:
                case 17:
                  result = await api.finalizouConferencia(objTS, res, next);
                  break
              }

            }

          }

          if (result.blOk) {
            await objTS.objConn.close();
            res.json(objTS.IDH006);
          } else {
            await objTS.objConn.closeRollback();
            res.status(400).send({message: result.msgErro});
          }
        } else {
          await objTS.objConn.closeRollback();
          res.status(400).send({message: `Falha ao buscar status atual do agendamento, ERRO: 0015`});
        }
      } else {
        res.status(500).send({message:"É necessário informar o número do agendamento, usuário e o novo status para prosseguir!, ERRO: 0001"});
      }
    }
    catch (err) {
      await objTS.objConn.closeRollback();
      res.status(500).send({message:"Ocorreu um erro ao Trocar o Status do Agendamento, ERRO: 0002"});
    }
  }

  api.agendado = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Agendado!, ERRO: 0003';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.checkin = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');

        if (blOk && req.OLD_STAGENDA && req.OLD_STAGENDA == 5) {
          let deletePesagem = await dao.cancelarPesagens(req, res, next).then((result) => { return 'Ok'; });
          blOk = (deletePesagem == 'Ok');
        }
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para CheckIn!, ERRO: 0004';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.entrou = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        if (req.OLD_STAGENDA && req.OLD_STAGENDA > req.STAGENDA && req.IDG028 && req.IDG028 != 11) {

          req.OLD_STAGENDA = '6,7';
          let deleteST     = await dao.deleteStatusH008(req, res, next).then((result) => { return 'Ok'; });
          blOk = (deleteST == 'Ok');

        } else {

          let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
          blOk = (salvarST == 'Ok');

        }
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Entrou!, ERRO: 0005';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.iniciouOperacao = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        if (req.OLD_STAGENDA && req.OLD_STAGENDA > req.STAGENDA && req.IDG028 && req.IDG028 != 11) {

          req.OLD_STAGENDA = '7';
          let deleteST     = await dao.deleteStatusH008(req, res, next).then((result) => { return 'Ok'; });
          blOk = (deleteST == 'Ok');

        } else {

          let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
          blOk = (salvarST == 'Ok');

        }
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Iniciou Operação!, ERRO: 0006';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.finalizouOperacao = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let dadosAgendamento = await dao.buscarDadosAgendamento(req, res, next).then((result) => { return result[0]; });
      blOk = (dadosAgendamento != null);

      if (blOk) {
        if (dadosAgendamento.TPMOVTO == 'C' && dadosAgendamento.IDG046 != null) {
          let updateCarga = await dao.updateCarga(dadosAgendamento, res, next).then((result) => { return 'Ok'; });
          blOk = (updateCarga == 'Ok');

          if (blOk) {
            dadosAgendamento.IDG097DO = 145;
            let cargas4PL = await dao.buscarCargas4PL(dadosAgendamento, res, next).then((result) => { return result[0]; });
            blOk = (cargas4PL != null);

            if (blOk) {
              if (cargas4PL.IDG046) {

                //****WAREHOUSE*****************************************/

                parmWare = {}
                parmWare.TPPROCES = dadosAgendamento.TPMOVTO;
                parmWare.IDG046 = cargas4PL.IDG046;
                parmWare.DTMILEST = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
                parmWare.objConn = req.objConn;
                await ctrlWare.criarMilestonesHc(parmWare);
 
                //***************************************************** */

                var params = {};
                params.STETAPA = 4;
                params.IDG046 = cargas4PL.IDG046.split(',');

                let changeStatus = await daoAG2.changeShipmentStatus(params, res, next).then((result) => { return 'Ok'; });
                blOk = (changeStatus == 'Ok');

                if (!blOk) {
                  msgErro = 'Falha ao atualizar Shipment Status, ERRO: 0007';
                }
              }
            } else {
              msgErro = 'Falha ao buscar cargas 4PL!, ERRO: 0007';
            }
          } else {
            msgErro = 'Falha ao atualizar carga(s) para Transporte!, ERRO: 0007';
          }
        }

        if (blOk) {
          let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
          blOk = (updateST == 'Ok');
  
          if (blOk) {
            let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
            blOk = (salvarST == 'Ok');
            if (!blOk) {
              msgErro = 'Falha ao trocar status para Finalizou Operação!, ERRO: 0007';
            }
          } else {
            msgErro = 'Falha ao trocar status para Finalizou Operação!, ERRO: 0007';
          }
        }
      } else {
        msgErro = 'Falha ao buscar dados agendamento!, ERRO: 0007';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.saiu = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      if (req.IDG028 && req.IDG028 != 282 && req.IDG028 != 284) {
        let count = await dao.verificaStAgendamento(req, res, next);

        if ((count[1].COUNT_H008 == 0) || (count[0].COUNT_H008 == 0) /*|| (count[1].COUNT_H008 > count[0].COUNT_H008)*/) {

          msgErro = 'Agendamento ainda não finalizou operação!, ERRO: 0008';

        } else {
          blOk = true;
        }
      } else {
        blOk = true;
      }

      if (blOk) {
        let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
        blOk = (updateST == 'Ok');

        if (blOk) {
          let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
          blOk = (salvarST == 'Ok');
        }

        if (!blOk) {
          msgErro = 'Falha ao trocar status para Saiu!, ERRO: 0008';
        }
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.faltou = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Faltou!, ERRO: 0009';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.reagendado = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Reagendado!, ERRO: 0011';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.solicitouEntrada = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Solicitou Entrada!, ERRO: 0012';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.solicitouSaida = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Solicitou Saída!, ERRO: 0012';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.iniciouConferencia = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let cancelaPesagem = await dao.cancelarUltimaPesagem(req, res, next).then((result) => { return 'Ok'; });
      blOk = (cancelaPesagem == 'Ok');

      if (blOk) {
        let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
        blOk = (updateST == 'Ok');

        if (blOk) {
          let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
          blOk = (salvarST == 'Ok');
        }

        if (!blOk) {
          msgErro = 'Falha ao trocar status para Iniciou Conferência!, ERRO: 0014';
        }
      } else {
        msgErro = 'Falha ao cancelar a última pesagem de saída!, ERRO: 0014';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  api.finalizouConferencia = async function (req, res, next) {
    try {

      let blOk    = false;
      let msgErro = '';

      let updateST = await dao.updateStatusH006(req, res, next).then((result) => { return 'Ok'; });
      blOk = (updateST == 'Ok');

      if (blOk) {
        let salvarST = await dao.salvarStatusH008(req, res, next).then((result) => { return 'Ok'; });
        blOk = (salvarST == 'Ok');
      }

      if (!blOk) {
        msgErro = 'Falha ao trocar status para Finalizou Conferência!, ERRO: 0016';
      }

      return { blOk, msgErro };

    } catch (err) {
      throw err;
    }
  }

  return api;
};
