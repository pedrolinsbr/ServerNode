/**
 * @description Possui os métodos responsaveis por alimentar a grid de horario do hora certa
 * @author Desconhecido
 * @since 20/02/2018
 * 
*/

/** 
 * @module controller/Horario
 * @description H006/H007.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api               =       {};
  var dao               =       app.src.modHoraCerta.dao.HorarioDAO;
  var daoAgendamento    =       app.src.modHoraCerta.dao.AgendamentoDAO;
  var logger            =       app.config.logger;
  var ctrlAgendamento   =       app.src.modHoraCerta.controllers.AgendamentoController;
  var moment            = require('moment');

  /**
   * @description Busca slots para alimentar grid.
   *
   * @async
   * @function api/getHorarios
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.getHorarios = async function (req, res, next) {
   var transp = [];
   var cliente = [];
   var IDG028 = req.body.IDG028;
   var HOINICIO = req.body.DTPESQUI;

   admin = await daoAgendamento.verificarAdmin(req, res, next)
            .then(( result) => {
                if (result[0].SNADMIN == 1){
                  return true
                }else{
                  return false
                }
              })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });

   transp = await daoAgendamento.buscarTranspGrade(req, res, next)
            .then(( result) => {
                return result;
              })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });

    cliente = await daoAgendamento.buscarClienteGrade(req, res, next)
              .then(( result) => {
                  return result;
                })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
              });

    armazem = await daoAgendamento.buscarArmazemUser(req, res, next)
              .then(( result) => {
                  return result;  
                })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
              });

   /* Verifica se a Operação é 4PL */
   operacao = await daoAgendamento.buscarOperacaoUser(req, res, next)
              .then(( result) => {
                  return result;
                })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
              });

    armSyngenta = await daoAgendamento.buscarArmSyngenta(req, res, next)
                  .then(( result) => {
                      return result;
                    })
                  .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    next(err);
                  });
   /* Verifica se a Operação é 4PL */

    await dao.getHorarios(req, res, next)
      .then(async( result) => {
        if(!admin){
          var permitirTransp     = [];
          var permitirCliente    = [];
          var permitirArmazem    = [];
          var permitirOperacao   = [];
          var permitirReservados = [];
          var permitir = [];

          var reservadosTransp  = [];
          var reservadosCliente = [];

          var auxReservTransp  = [];
          var auxReservCliente = [];

          if (transp.length >= 1) {
            var IDG024R = [];
            for (t of transp){
              IDG024R.push(t.IDG024)
            }

            var obj = {
              IDG028:IDG028,
              HOINICIO:HOINICIO,
              TPPARAME: 'T',
              NRVALUE: IDG024R
            };

            reservadosTransp = await dao.buscarListaReservados(obj, res, next); //id de todos os slots que estao reservados para transportadora do user

            for (var j of transp) {
              for (var i of result.slots) {
                if (parseInt(i.IDG024) == parseInt(j.IDG024) || i.IDH006 == null) {
                  if (i.STHORARI == 'R' && i.IDH006 == null) {
                    auxReservTransp.push(i.IDH007);
                  } else {
                    permitirTransp.push(i.IDH007);
                  }
                }
              }
            }
          }

          if (cliente.length >= 1) {
            var IDG005R = [];
            for (c of cliente){
              IDG005R.push(c.IDG005)
            }

            var obj = {
              IDG028:IDG028,
              HOINICIO:HOINICIO,
              TPPARAME: 'C',
              NRVALUE: IDG005R
            };

            reservadosCliente = await dao.buscarListaReservados(obj, res, next); //id de todos os slots que estao reservados para cliente do user

            for (var c of cliente) {
              for (var d of result.slots) {
                if (d.IDH006 == null) {
                  if (d.STHORARI == 'R') {
                    auxReservCliente.push(d.IDH007);
                  } else {
                    permitirCliente.push(d.IDH007);
                  }
                } else {
                  if (d.IDG005) {
                    let permClient = false;
                    for(var e of d.IDG005.split(',')){
                      if(parseInt(e) == parseInt(c.IDG005)){
                        permClient = true;
                      }
                    }
                    if (permClient) {
                      permitirCliente.push(d.IDH007);
                    }
                  }
                }
              }
            }
          }

          if (armazem.length >= 1) {
            for (var x of armazem) {
              for (var y of result.slots) {
                if (parseInt(y.IDG028) == parseInt(x.IDG028) || y.IDH006 == null) {
                  permitirArmazem.push(y.IDH007);
                }
              }
            }
          }

          if (operacao.length >= 1 && armSyngenta.length >= 1) {
            for (var x of operacao) {
              for (var y of result.slots) {
                if (y.IDH006 == null) {
                  permitirOperacao.push(y.IDH007);
                } else {
                  armSyn = armSyngenta.filter((arm) => { return (parseInt(y.IDG028) == parseInt(arm.IDG028)); });

                  if (armSyn.length > 0) { // Se for armazém Syngenta, libera!
                    permitirOperacao.push(y.IDH007);
                  } else {
                    if (y.NRCARGA && y.CDMOVTO == 'C') {
                      let tpCarga = await daoAgendamento.buscarTpModCar({ IDG046: y.NRCARGA }, res, next)
                                    .then((result) => {
                                      return result;
                                    })
                                    .catch((err) => {
                                      err.stack = new Error().stack + `\r\n` + err.stack;
                                      next(err);
                                    });

                      if (tpCarga.length > 0) {
                        let arr4pl = tpCarga.filter((tp) => { return tp.TPMODCAR == 2; });

                        if (arr4pl.length > 0) {  // Se for cargas 4PL, libera!
                          permitirOperacao.push(y.IDH007);
                        }
                      }
                    } else if (y.CDMOVTO == 'D') {
                      permitirOperacao.push(y.IDH007);
                    }
                  }
                }
              }
            }
          }

          if (auxReservCliente.length > 0 || auxReservTransp.length > 0) {
            let reservados = [];
            if ((reservadosCliente.length == 0 || auxReservCliente.length == 0) && reservadosTransp.length > 0) { // Se não houver reserva por cliente
              for (let art of auxReservTransp) {
                for (let ret of reservadosTransp) {
                  if (art == ret.IDH007) {
                    reservados.push(art);
                  }
                }
              }
            } else if (reservadosCliente.length > 0 && (reservadosTransp.length == 0 || auxReservTransp.length == 0)) { // Se não houver reserva por transportadora
              for (let arc of auxReservCliente) {
                for (let rec of reservadosCliente) {
                  if (arc == rec.IDH007) {
                    reservados.push(arc);
                  }
                }
              }
            } else { // Se houver reserva por cliente e transportadora
              let auxResT = [];
              let auxResC = [];

              for (let art of auxReservTransp) {
                for (let ret of reservadosTransp) {
                  if (art == ret.IDH007) {
                    auxResT.push(art);
                  }
                }
              }

              for (let arc of auxReservCliente) {
                for (let rec of reservadosCliente) {
                  if (arc == rec.IDH007) {
                    auxResC.push(arc);
                  }
                }
              }

              if (auxResT.length > 0 && auxResC.length > 0) {
                for (let t of auxResT) {
                  for (let c of auxResC) {
                    if (t == c) {
                      reservados.push(t);
                    }
                  }
                }
              }
            }

            for (let i of result.slots) {
              if(i.STHORARI == 'R' && i.IDH006 == null){
                if(reservados.length){ //caso existam slots reservados
                  fitro = [];
                  fitro = reservados.filter(res => {return res == i.IDH007}); //filtra o slot do loop pelos slots reservador
                  if(fitro.length){ // caso o slot esteja entre os slots reservados libera
                    permitirReservados.push(i.IDH007);
                  }
                }
              }
            }
          }

          if(transp.length || cliente.length || armazem.length) {

            if(permitirTransp.length && !permitirCliente.length && !permitirArmazem.length) { //só transportadora
              permitir = permitirTransp
            } 
            else if(!permitirTransp.length && permitirCliente.length && !permitirArmazem.length) { // só cliente
              permitir = permitirCliente
            }
            else if(!permitirTransp.length && !permitirCliente.length && permitirArmazem.length) { // só armazém
              permitir = permitirArmazem
            }


            else if(permitirTransp.length && permitirCliente.length && !permitirArmazem.length){ // transportadora e cliente
              for(tra of permitirTransp){
                for(cli of permitirCliente){
                  if(tra == cli){
                    permitir.push(tra);
                  }
                }
              }
            }
            else if(permitirTransp.length && !permitirCliente.length && permitirArmazem.length){ // transportadora e armazem
              for(tra of permitirTransp){
                for(arm of permitirArmazem){
                  if(tra == arm){
                    permitir.push(tra);
                  }
                }
              }
            }
            else if(!permitirTransp.length && permitirCliente.length && permitirArmazem.length){ // cliente e armazem
              for(cli of permitirCliente){
                for(arm of permitirArmazem){
                  if(cli == arm){
                    permitir.push(cli);
                  }
                }
              }
            }
            else if(permitirTransp.length && permitirCliente.length && permitirArmazem.length){ // transportadora, cliente e armazem
              aux = [];
              
              for (tra of permitirTransp) {
                for (cli of permitirCliente) {
                  if (tra == cli) {
                    aux.push(tra);
                  }
                }
              }
              for(i of aux){
                for(arm of permitirArmazem){
                  if(i==arm){
                    permitir.push(i);
                  }
                }
              }
            }

            if (permitirReservados.length > 0) { // Se houver reservados
              permitir = [...permitir, ...permitirReservados];
            }

            if (operacao.length && permitirOperacao.length) {
              let auxPermitir = [];
              for (let per of permitir) {
                for (let op of permitirOperacao) {
                  if (per == op) {
                    auxPermitir.push(per);
                  }
                }
              }
              if (auxPermitir.length > 0) {
                permitir = auxPermitir;
              }
            }
          }
          else{ //bloqueia tudo
            for (s in result.slots){
              if(result.slots[s].IDH006 != null){
                result.slots[s].STAGENDA = 0;
              }
            }
          }

          //permitir = permitirTransp;
          if(permitir.length){
            for(var k of result.slots){
              bloqueia = true
              for(var m of permitir){
                if(m == k.IDH007){
                  bloqueia = false;
                }
              }
              if(bloqueia){
                k.STAGENDA = 0
              } else {
                if(k.STHORARI == 'R' && !k.IDH006){
                  k.STAGENDA = 2;
                }
              }
            }
          }
        }

        for(i of result.slots){
          if(i.NRCARGA){
            i.NRCARGA = i.NRCARGA.split(',');
          }
        }

        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.gerarAgenda = async function (req, res, next) {
    await dao.gerarAgenda(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.deleteSlots = async function (req, res, next) {
    await dao.deleteSlots(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  

  api.horariosResumido = async function (req, res, next) {
    var parm ={body:req.body};
    
    var tempoSlots = await ctrlAgendamento.tempoSlots(parm,res,next);

    var horarios = await dao.horariosResumido(req, res, next);
    var id = 0;
    var resp = [];
    for(var h in horarios){ //loop array Horários principal
      h = parseInt(h);
      if(h < (horarios.length - (tempoSlots.QTSLOTS -1))){ //escapar as últimas posições
        var hora = {};
        hora.HOINICIO = horarios[h].HOINICIO;
        hora.HOFINAL = horarios[h + (tempoSlots.QTSLOTS - 1)].HOFINAL;

        var diffHora = api.diffHora(hora);

        var existe = false;

        for(i of resp){
          if(moment(hora.HOINICIO).format('HH:mm') == i.HOINICIO){
            existe = true;
          }
        }
        if(!existe){
          if( tempoSlots.QTTEMPRE == diffHora ) {
            
            var slots = [];
            
            slots.push(horarios[h].IDH007);
            slots.push(horarios[h + (tempoSlots.QTSLOTS - 1)].IDH007);
            id +=1; 
            var obj={
              id: id,
              desc: `${moment(hora.HOINICIO).format('HH:mm')}-${moment(hora.HOFINAL).format('HH:mm')}`, 
              IDH007: slots,
              HOINICIO: moment(hora.HOINICIO).format('HH:mm'),
              HOFINAL: moment(hora.HOFINAL).format('HH:mm'),
              janela: horarios[h].NRJANELA,
              class:'outline-primary'
            }
            resp.push(obj);
          } // tempoSlots.QTTEMPRE == diffHora
        }
      }
    } //loop array Horários principal
    resp.sort((a,b) => { //ordenação
      return a.HOINICIO > b.HOINICIO ? 1 : a.HOINICIO < b.HOINICIO ? -1 : 0;
    })
    res.json(resp);
   
  };


  api.diffHora = function (req) {
    
    HOINICIO    =   req.HOINICIO.getHours() * 60 + req.HOINICIO.getMinutes();
    HOFINAL     =   req.HOFINAL.getHours() * 60 + req.HOFINAL.getMinutes();

    return (HOFINAL - HOINICIO);
  };

   
  return api;
};
