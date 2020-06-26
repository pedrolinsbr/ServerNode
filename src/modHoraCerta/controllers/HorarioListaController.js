/**
 * @description Possui os métodos responsaveis por alimentar a lista de 
 * horarios do hora certa no oferecimento
 * @author Everton Pessôa
 * @since 11/04/2019
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
  var dao               =       app.src.modHoraCerta.dao.HorarioListaDAO;
  var ctrlAgendamento   =       app.src.modHoraCerta.controllers.AgendamentoController;
  var moment            =       require('moment');


  api.buscar = async function (req, res, next) {
    var parm ={body:req.body};
    
    var tempoSlots = await ctrlAgendamento.tempoSlots(parm,res,next);

    var horarios = await dao.buscar(req, res, next);
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
