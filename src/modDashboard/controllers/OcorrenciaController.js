module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modDashboard.dao.OcorrenciaDAO;
  const moment = require('moment');
  var daoTransf = app.src.modDashboard.dao.TransferenciaDAO;
  var daoDist = app.src.modDashboard.dao.DistribuicaoDAO;``

  // -------------------------------------------------- NEW --------------------------------------------------------------------- //

  api.getOcorrencias = async function (req, res, next) {

    try {
    req.body.auxDTENTREG = `AND TO_CHAR(G043.DTENTREG,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')`; // DATA DE ENTREGA
    req.body.auxDTREGIST = `AND (TO_CHAR(A001.DTREGIST,'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM') 
    OR TO_CHAR(A001.DTREGIST,'YYYY-MM') <> TO_CHAR(CURRENT_DATE, 'YYYY-MM') AND A006.IDA006 IN(1,2))`; // DATA DE REGISTRO OCORRENCIA
    req.body.auxDTAVALIA = `AND TO_CHAR(G061.DTAVALIA,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')`; // DATA DE AVALIACAO DO NPS
    req.body.auxDTENVIO = `AND TO_CHAR(G061.DTENVIO,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')`; // DATA DE ENVIO EMAIL DO NPS
    req.body.auxIDG014 = ``;
    
    if(req.body.DTEMINOTI && req.body.DTEMINOTF){
      req.body.auxDTENTREG = `AND TRUNC(G043.DTENTREG) >= TO_DATE('${req.body.DTEMINOTI}' , 'YYYY-MM-DD') AND TRUNC(G043.DTENTREG) <= TO_DATE('${req.body.DTEMINOTF}' , 'YYYY-MM-DD')`;
      req.body.auxDTREGIST = `AND TRUNC(A001.DTREGIST) >= TO_DATE('${req.body.DTEMINOTI}' , 'YYYY-MM-DD') AND TRUNC(A001.DTREGIST) <= TO_DATE('${req.body.DTEMINOTF}' , 'YYYY-MM-DD')`;
      req.body.auxDTAVALIA = `AND TRUNC(G061.DTAVALIA) >= TO_DATE('${req.body.DTEMINOTI}' , 'YYYY-MM-DD') AND TRUNC(G061.DTAVALIA) <= TO_DATE('${req.body.DTEMINOTF}' , 'YYYY-MM-DD')`;
      req.body.auxDTENVIO = `AND TRUNC(G061.DTENVIO) >= TO_DATE('${req.body.DTEMINOTI}' , 'YYYY-MM-DD') AND TRUNC(G061.DTENVIO) <= TO_DATE('${req.body.DTEMINOTF}' , 'YYYY-MM-DD')`;
    }

    if (req.body.IDG014) { // VALIDACAO PARA QUANDO POSSUI IDG014, PARA FILTRAGEM DE OPERACAO.
      if (req.body.IDG014.length > 0) {
        let IDG014 = req.body.IDG014.map(d => d.id);
        req.body.auxIDG014 = `AND G014.IDG014 IN (${IDG014.join()})`;
      }
    }
    
      req.objConn = await dao.controller.getConnection();

      let result = { ocorrencia: { arTipo : []}, nps : {}};

      let entregues = await dao.contarEntregues(req, res, next); //BUSCA NA QUERRY A QUANTIDADE TOTAL ENTREGUES 

      result.entregue = entregues[0].TOTAL; //QUANTIDADE TOTAL DE NOTAS FISCAIS ENTREGUES DO MES CORRENTE     

      // -- INICIO DADOS PARA OCORRENCIA -- //
      let ocorrencia = await dao.getOcorrencias(req, res, next); //BUSCA NA QUERRY OCORRENCIA

      result.ocorrencia.data = ocorrencia; // ARRAY TOTAL PARA RESPOSTA OCORRENCIA

      result.ocorrencia.total = ocorrencia.length; //TOTAL DE OCORRENCIAS

      result.ocorrencia.aberta = ocorrencia.filter(d => {return d.DTFIM == null}).length; //OCORRENCIAS ABERTAS
      
      result.ocorrencia.fechada = ocorrencia.filter (d => {return d.DTFIM != null}).length; //OCORRENCIAS FECHADAS

      result.ocorrencia.desbloqueada = ocorrencia.filter(d => {return d.DTBLOQUE == null && d.DTDESBLO == null || d.DTBLOQUE != null && d.DTDESBLO != null}).length; //DESBLOQUEADAS

      result.ocorrencia.bloqueada = ocorrencia.filter(d => {return d.DTBLOQUE != null && d.DTDESBLO == null}).length; //BLOQUEADAS

      result.ocorrencia.ocorrenciaVsEntregue = parseFloat(((result.ocorrencia.total/result.entregue)*100).toFixed(2)); //OCORRENCIAS VS ENTREGUES 

      result.ocorrencia.bloqueadaVsEntregue = parseFloat(((result.ocorrencia.bloqueada/result.entregue)*100).toFixed(2)); //BLOQUEADAS VS ENTREGUES 

      // ================== INICIO CONTAGEM HORAS =================================== //

      result.ocorrencia.aberta0 = [];
      result.ocorrencia.aberta2 = [];
      result.ocorrencia.aberta4 = [];
      result.ocorrencia.aberta8 = [];
      result.ocorrencia.fechada0 = [];
      result.ocorrencia.fechada2 = [];
      result.ocorrencia.fechada4 = [];
      result.ocorrencia.fechada8 = [];
      result.ocorrencia.bloq0 = [];
      result.ocorrencia.bloq2 = [];
      result.ocorrencia.bloq4 = [];
      result.ocorrencia.bloq8 = [];

      for (let i of ocorrencia) {
        
        let dtNow = moment([moment().year(), moment().month(), moment().date(), moment().hour(), moment().minute()]);
        let dtdesblo = moment([moment(i.DTDESBLO).year(), moment(i.DTDESBLO).month(), moment(i.DTDESBLO).date(), moment(i.DTDESBLO).hour(), moment(i.DTDESBLO).minute()]);

        if(i.DTFIM == null){ //OCORRENCIAS ABERTAS
          let dtregist = moment([moment(i.DTREGIST).year(), moment(i.DTREGIST).month(), moment(i.DTREGIST).date(), moment(i.DTREGIST).hour(), moment(i.DTREGIST).minute()]);
          await api.contar0(dtNow, dtregist, i).then((resp)=>{
            if(resp){
              result.ocorrencia.aberta0.push(resp)
            } 
          });
          await api.contar2(dtNow, dtregist, i).then((resp)=>{
            if(resp){
              result.ocorrencia.aberta2.push(resp)
            } 
          });
          await api.contar4(dtNow, dtregist, i).then((resp)=>{
            if(resp){
              result.ocorrencia.aberta4.push(resp)
            } 
          });
          await api.contar8(dtNow, dtregist, i).then((resp)=>{
            if(resp){
              result.ocorrencia.aberta8.push(resp)
            } 
          });
        }

        if(i.DTFIM != null){ //OCORRENCIAS FECHADAS
          let dtfim = moment([moment(i.DTFIM).year(), moment(i.DTFIM).month(), moment(i.DTFIM).date(), moment(i.DTFIM).hour(), moment(i.DTFIM).minute()]);
          await api.contar0(dtNow, dtfim, i).then((resp)=>{
            if(resp){
              result.ocorrencia.fechada0.push(resp)
            } 
          });
          await api.contar2(dtNow, dtfim, i).then((resp)=>{
            if(resp){
              result.ocorrencia.fechada2.push(resp)
            } 
          });
          await api.contar4(dtNow, dtfim, i).then((resp)=>{
            if(resp){
              result.ocorrencia.fechada4.push(resp)
            } 
          });
          await api.contar8(dtNow, dtfim, i).then((resp)=>{
            if(resp){
              result.ocorrencia.fechada8.push(resp)
            } 
          });
        }

        if(i.DTBLOQUE != null && i.DTDESBLO == null){  //NFS BLOQUEADAS
          let dtbloque = moment([moment(i.DTBLOQUE).year(), moment(i.DTBLOQUE).month(), moment(i.DTBLOQUE).date(), moment(i.DTBLOQUE).hour(), moment(i.DTBLOQUE).minute()]);
          await api.contar0(dtNow, dtbloque, i).then((resp)=>{
            if(resp){
              result.ocorrencia.bloq0.push(resp)
            } 
          });
          await api.contar2(dtNow, dtbloque, i).then((resp)=>{
            if(resp){
              result.ocorrencia.bloq2.push(resp)
            } 
          });
          await api.contar4(dtNow, dtbloque, i).then((resp)=>{
            if(resp){
              result.ocorrencia.bloq4.push(resp)
            } 
          });
          await api.contar8(dtNow, dtbloque, i).then((resp)=>{
            if(resp){
              result.ocorrencia.bloq8.push(resp)
            } 
          });
        }
  
      }

      // CONTAR TOTAL OCORRENCIA POR DEFINICAO DE HORAS ESPECIFICAS
      result.ocorrencia.ar0 = result.ocorrencia.aberta0.concat(result.ocorrencia.fechada0);
      result.ocorrencia.ar2 = result.ocorrencia.aberta2.concat(result.ocorrencia.fechada2);
      result.ocorrencia.ar4 = result.ocorrencia.aberta4.concat(result.ocorrencia.fechada4);
      result.ocorrencia.ar8 = result.ocorrencia.aberta8.concat(result.ocorrencia.fechada8);

      result.ocorrencia.contarAberta0 = result.ocorrencia.aberta0.length;
      result.ocorrencia.contarAberta2 = result.ocorrencia.aberta2.length;
      result.ocorrencia.contarAberta4 = result.ocorrencia.aberta4.length;
      result.ocorrencia.contarAberta8 = result.ocorrencia.aberta8.length;

      result.ocorrencia.contarFechada0 = result.ocorrencia.fechada0.length;
      result.ocorrencia.contarFechada2 = result.ocorrencia.fechada2.length;
      result.ocorrencia.contarFechada4 = result.ocorrencia.fechada4.length;
      result.ocorrencia.contarFechada8 = result.ocorrencia.fechada8.length;

      result.ocorrencia.contarBloq0 = result.ocorrencia.bloq0.length;
      result.ocorrencia.contarBloq2 = result.ocorrencia.bloq2.length;
      result.ocorrencia.contarBloq4 = result.ocorrencia.bloq4.length;
      result.ocorrencia.contarBloq8 = result.ocorrencia.bloq8.length;
      
      result.ocorrencia.ttContar0 = result.ocorrencia.ar0.length;
      result.ocorrencia.ttContar2 = result.ocorrencia.ar2.length;
      result.ocorrencia.ttContar4 = result.ocorrencia.ar4.length;
      result.ocorrencia.ttContar8 = result.ocorrencia.ar8.length;
      
      // ================== FIM CONTAGEM HORAS =================================== //
  
      // LOGICA PARA CONSTRUIR O ARRAY COM TIPOS DE OCORRENCIA - ABERTAS E FECHADAS
      for(let i of ocorrencia){
        let inserir = true;
        for (let j of result.ocorrencia.arTipo) {
          if(j.id == i.IDA002){
            inserir = false
            if(i.DTFIM == null){
              j.abertas++;
            }else{
              j.fechadas++;
            }
          }
        }
        if(inserir){
          if(i.DTFIM == null){
            result.ocorrencia.arTipo.push({id: i.IDA002, name: i.DSTPMOTI, abertas: 1, fechadas: 0 })
          }else{
            result.ocorrencia.arTipo.push({id: i.IDA002, name: i.DSTPMOTI, abertas: 0, fechadas: 1 })
          }
        }
      }

      // -- INICIO DADOS PARA NPS -- //
      let nps = await dao.getNps(req, res, next); // BUSCA NA QUERRY NPS

      result.nps.data = nps; // ARRAY TOTAL DA RESPOSTA NPS

      result.nps.total = nps.length; //TOTAL NPS

      result.nps.detratores = nps.filter(d => {return d.NOTA < 7}).length; //TOTAL DE DETRATORES ( NOTA < 7)

      result.nps.neutros = nps.filter(d => {return d.NOTA == 7 || d.NOTA == 8}).length; //TOTAL DE NEUTROS (NOTA = 7 ou NOTA = 8)

      result.nps.promotores = nps.filter(d => {return d.NOTA > 8}).length; //TOTAL DE PROMOTORES (NOTA > 8)

      result.nps.valor = (result.nps.total != 0) ? Math.round(((result.nps.promotores/result.nps.total) - (result.nps.detratores/result.nps.total)) * 100) : 0;

      result.nps.npsVsEntregue = parseFloat(((result.nps.total/result.entregue)*100).toFixed(2)); //NPS VS ENTREGUES 

      for(let i of nps){ // TEMPO DE DIFERENCA ENTRE A ABERTURA E A AVALIACAO DO NPS 
        let dtenvio = moment([moment(i.DTENVIO).year(), moment(i.DTENVIO).month(), moment(i.DTENVIO).date(), moment(i.DTENVIO).hour(), moment(i.DTENVIO).minute()]);
        let dtavalia = moment([moment(i.DTAVALIA).year(), moment(i.DTAVALIA).month(), moment(i.DTAVALIA).date(), moment(i.DTAVALIA).hour(), moment(i.DTAVALIA).minute()]);

        if(dtenvio && dtavalia){
          var valor = (dtavalia.diff(dtenvio, 'hours', true));
        }

        if(valor){
          switch (true) {
            case valor < 1: // minutos
              retorno = valor * 60;
              if(retorno > 1){
                i.tempo = `${retorno.toFixed(0)} minutos`;
              }else {
                i.tempo = `${retorno.toFixed(0)} minuto`;
              }
              break;
            case valor > 1 && valor < 24: // horas
              retorno = valor.toString().split('.');
              let hora = (retorno[0] < 10) ? `0${retorno[0]}` : retorno[0];
              let minuto = retorno[1];
              minuto = (minuto > 0) ? (parseFloat(`0.${minuto}`)*60).toFixed(0) : 00;
              if(minuto < 10) minuto = `0${minuto}`;
              i.tempo = `${hora}:${minuto} horas`;
              break;
            case valor > 24: // dias
              retorno = parseInt(valor/24);
              if(retorno > 1){
                i.tempo = `${retorno} dias`;
              }else{
                i.tempo = `${retorno} dia`;
              }
              break;
          }
        }

      }

      res.status(200).send(result);

    } catch (err) {
      res.status(500).send({ message: err });
    }
  };

api.contar0 = async function(dtNow, d2, i) { // CONTA A DIFERENCA DE HORAS ATÉ 4 HORAS
  if((dtNow.diff(d2, 'hours', true)) <= 2){
    return i;
  }
}

api.contar2 = async function(dtNow, d2, i) { // CONTA A DIFERENCA DE HORAS DE 2 HÁ 4 HORAS
  if((dtNow.diff(d2, 'hours', true)) > 2 && (dtNow.diff(d2, 'hours', true)) <= 4){
    return i;
  }
}

api.contar4 = async function(dtNow, d2, i) { // CONTA A DIFERENCA DE HORAS DE 4 HÁ 8 HORAS
  if((dtNow.diff(d2, 'hours', true)) > 4 && (dtNow.diff(d2, 'hours', true)) <= 8){
    return i;
  }
}

api.contar8 = async function(dtNow, d2, i) { // CONTA A DIFERENCA DE HORAS, MAIS DE 8 HORAS
  if((dtNow.diff(d2, 'hours', true)) > 8){
    return i;
  }
}

  api.getNpsCte = async function (req, res, next) {
    await dao.getNpsCte(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

// --------------------------------------------------------------------------------------------------------------------------- //

  return api;

};
