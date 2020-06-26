module.exports = function (app, cb) {
  var fs  = require('fs');
  var api = {};
  var dao = app.src.modHoraCerta.dao.CancelarAgendamentoDAO;

  api.cancelar = async function (req, res, next) {

    try {
      var msgErro = null;
      var blOk    = false;
      var obj     = {};
      req.objConn = await dao.controller.getConnection();

      obj.dadosAgendamento = await dao.buscarAgendamento(req, res, next).then((result) => { return result[0]; });

      blOk = (obj.dadosAgendamento != null && obj.dadosAgendamento != undefined);

      if (blOk) {
        if (obj.dadosAgendamento['TPMOVTO'] != 'D') { // VERIFICA SE É DESCARGA
          obj.dadosCargas = await dao.buscarCargas(req, res, next);

          blOk = (obj.dadosCargas != null && obj.dadosCargas != undefined);

          if (blOk) {
            if (obj.dadosCargas.length > 0) { // VERIFICA SE É CARGA CRIADA

              for (let carga of obj.dadosCargas) {
                if (blOk) {
                  if (carga['TPMODCAR'] == 2) { // VERIFICA SE É 4PL
                    let objO005 = {
                      body: { IDG046: carga['IDG046'] },
                      objConn: req.objConn
                    };

                    let rs     = await dao.buscarIDO005(objO005, res, next);
                    let IDO005 = (rs.length > 0) ? rs[0].IDO005 : null;

                    if (IDO005) {
                      let dadosRejeitar = {
                        IDO005  : IDO005,
                        IDG024  : obj.dadosAgendamento['IDG024'],
                        IDS001RE: req.body.IDS001,
                        objConn : req.objConn
                      };
                      let cancelaOferec = await dao.atualizaOferecimento(dadosRejeitar, res, next).then(() => { return 'Ok'; });
                      blOk = (cancelaOferec == 'Ok');

                      if (!blOk) {
                        msgErro = `Falha ao cancelar oferecimento!`;
                      }
                    }

                    if (blOk) {
                      let obj4PL = {
                        body: { IDG046: carga['IDG046'] },
                        objConn: req.objConn
                      };
                      let cancela4PL = await api.cancelar4PL(obj4PL, res, next);

                      blOk = (cancela4PL == '');

                      if (!blOk) {
                        msgErro = cancela4PL;
                      }
                    }

                  } else { // CARGA 3PL
                    let obj3PL = {
                      body: {
                        IDG046 : carga['IDG046'],
                        STCARGA: 'A' // ACEITA
                      },
                      objConn: req.objConn
                    };

                    let atualizaStatusCarga = await dao.atualizaStatusCarga(obj3PL, res, next).then(() => { return 'Ok'; });
                    blOk = (atualizaStatusCarga == 'Ok');

                    if (!blOk) {
                      msgErro = `Falha ao voltar carga para aceite!`;
                    }
                  }
                }
              }

            }
          } else {
            msgErro = 'Falha ao buscar dados da carga!';
          }
        }

        if (blOk) {
          let cancelaAgendamento = await dao.atualizaStatusAgendamento(req, res, next).then(() => { return 'Ok'; });
          blOk = (cancelaAgendamento == 'Ok');

          if (blOk) {
            let bho      = await dao.buscarHoInicio(req, res, next);
            let HOINICIO = (bho.length > 0) ? bho[0].HOINICIO : null;

            blOk = (HOINICIO != null);

            if (blOk) {
              let objEtapa = {
                IDH006  : req.body.IDH006,
                IDI015  : req.body.IDI015,
                IDS001  : req.body.IDS001,
                HOINICIO: HOINICIO,
                STAGENDA: 10,
                objConn : req.objConn
              };
              let alteraEtapa = await dao.alterarEtapaAgendamento(objEtapa, res, next).then(() => { return 'Ok'; });
              blOk = (alteraEtapa == 'Ok');

              if (blOk) {
                let limpaSlots = await dao.limparSlots(req, res, next).then(() => { return 'Ok'; });
                blOk = (limpaSlots == 'Ok');

                if (!blOk) {
                  msgErro = `Falha ao limpar slots!`;
                }
              } else {
                msgErro = `Falha ao alterar etapa agendamento!`;
              }
            } else {
              msgErro = `Falha ao buscar horário do agendamento!`;
            }
          } else {
            msgErro = `Falha ao cancelar agendamento!`;
          }
        }
      } else {
        msgErro = 'Falha ao buscar dados agendamento!';
      }

      if (blOk) {
        await req.objConn.close();
        return res.status(200).send({message:"Agendamento cancelado com sucesso!"});
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }
    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:"Ocorreu um erro ao cancelar o agendamento!"});
    }

  }

  api.cancelar4PL = async function (req, res, next) {
    try {
      var msgErro = null;
      var blOk    = false;

      let rs = await dao.buscarEtapaDelivery(req, res, next);
      blOk = (rs.length > 0);

      if (blOk) {
        if (rs[0]['STETAPA'] != 7) {
          let atualizaDelivery = await dao.atualizaEtapaDelivery(req, res, next).then(() => { return 'Ok'; });
          blOk = (atualizaDelivery == 'Ok');
        }

        if (blOk) {
          let atualizaSTCLI = await dao.atualizaSTCLI(req, res, next).then(() => { return 'Ok'; });
          blOk = (atualizaSTCLI == 'Ok');

          if (blOk) {
            req.body.STCARGA = 'X'; // CANCELADA

            let atualizaStatusCarga = await dao.atualizaStatusCarga(req, res, next).then(() => { return 'Ok'; });
            blOk = (atualizaStatusCarga == 'Ok');

            if (!blOk) {
              msgErro = `Falha ao cancelar carga!`;
            }
          } else {
            msgErro = `Falha ao alterar STINTCLI!`;
          }
        } else {
          msgErro = `Falha ao atualizar delivery!`;
        }
      } else {
        msgErro = `Falha ao buscar etapa da delivery!`;
      }

      if (blOk) {
        return '';
      } else {
        return msgErro;
      }

    } catch (err) {
      throw err;
    }
  }

  return api;
};
