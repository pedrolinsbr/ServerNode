module.exports = function (app, cb) {
  var api = {};
  var dao = app.src.modDashboard.dao.MapDAO;

  var moment = require('moment');

  api.listarNfs = async function (req, res, next) {
    await dao.listarNfs(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + erxr.stack;
        next(err);
      });
  };

  api.buscarDadosLocalizacao = async function (req, res, next) {

    try {

      req.body.date = `AND TO_CHAR(G043.DTEMINOT,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')`
      req.body.tptransp = `AND G051.TPTRANSP IN ('T', 'V', 'D')`
      req.body.auxG005 = ``;
      req.body.auxG014 = ``;
      req.body.dataAUX = ``;

      if (req.body.IDG005 != null) {
        if (req.body.IDG005.length > 0) {
          let idg005 = req.body.IDG005.map(d => d.id);
          idg005 = idg005.join();
          req.body.auxG005 = `AND G005RE.IDG005 IN(${idg005})`;
        }
      }

      if (req.body.IDG014 != null) {
        if (req.body.IDG014.length > 0) {
          let idg014 = req.body.IDG014.map(d => d.id);
          idg014 = idg014.join();
          req.body.auxG014 = `AND G043.IDG014 IN(${idg014})`;
        }
      }

      if (req.body.TPTRANSP != null) {
        if (req.body.TPTRANSP.length > 0) {
          for (let i of req.body.TPTRANSP) {
            let id = i.id;
            i.id = `'${id}'`;
          }
          let tptransp = req.body.TPTRANSP.map(d => d.id);
          tptransp = tptransp.join();
          req.body.tptransp = `AND G051.TPTRANSP IN(${tptransp})`;
        }
      }

      if (req.body.DTEMINOTI && req.body.DTEMINOTF) {
        let DTEMINOTI = Object.assign({}, req.body.DTEMINOTI);
        DTEMINOTI.month = DTEMINOTI.month - 1;
        let DTEMINOTF = Object.assign({}, req.body.DTEMINOTF);
        DTEMINOTF.month = DTEMINOTF.month - 1;
        DTEMINOTI = moment(DTEMINOTI).format('YYYY-MM-DD');
        DTEMINOTF = moment(DTEMINOTF).format('YYYY-MM-DD');
        req.body.date = `AND TRUNC(G043.DTEMINOT) >= TO_DATE('${DTEMINOTI}' , 'YYYY-MM-DD')
                         AND TRUNC(G043.DTEMINOT) <= TO_DATE('${DTEMINOTF}' , 'YYYY-MM-DD')`
      }

      let result = await dao.buscarDadosLocalizacao(req, res, next);

      let retorno = {
        "type": "FeatureCollection",
        "features": []
      };

      for (let i of result) {
        if (i.NRLATITU != null && i.NRLONGIT != null || i.NRLATITU == 0 || i.NRLONGIT == 0) {
          retorno.features.push(
            {
              "type": "Feature",
              "properties": { IDG043: i.IDG043, NRNOTA: i.NRNOTA, DTEMINOT: i.DTEMINOT },
              "geometry": { "type": "Point", "coordinates": [i.NRLONGIT, i.NRLATITU] }
            }
          )
        }
      };

      res.status(200).send(retorno);

    } catch (err) {

      res.status(500).send({ err, message: `Erro ao buscar dados!` });

    };

  };

  api.buscarDadosCalor = async function (req, res, next) {

    try {

      req.body.date = `AND TO_CHAR(G043.DTEMINOT,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')` // AUX PARA A DATA DE EMISSAO DA NOTA DO MES CORRENTE;
      req.body.tptransp = `AND G051.TPTRANSP IN ('T', 'V', 'D')` // AUX PARA O TIPO DE TRANSPORTE;
      req.body.auxG005 = ``; // AUX PARA O CLIENTE;
      req.body.auxG014 = ``; // AUX PARA OPERACAO;
      req.body.DTENTREG = ``; // AUX PARA FILTRAGEM DE ENTREGUE, EM TRANSITO OU TODOS;

      if (req.body.IDG005 != null) { //FILTRAR CLIENTE
        if (req.body.IDG005.length > 0) {
          let idg005 = req.body.IDG005.map(d => d.id);
          idg005 = idg005.join();
          req.body.auxG005 = `AND G005DE.IDG005 IN(${idg005})`;
        }
      };

      if (req.body.IDG014 != null) { //FILTRAR OPERACAO
        if (req.body.IDG014.length > 0) {
          let idg014 = req.body.IDG014.map(d => d.id);
          idg014 = idg014.join();
          req.body.auxG014 = `AND G043.IDG014 IN(${idg014})`;
        }
      };

      if (req.body.TPTRANSP != null) { // FILTRAR PELO TIPO DE TRANSPORTE
        if (req.body.TPTRANSP.length > 0) {
          for (let i of req.body.TPTRANSP) {
            let id = i.id;
            i.id = `'${id}'`;
          }
          let tptransp = req.body.TPTRANSP.map(d => d.id);
          tptransp = tptransp.join();
          req.body.tptransp = `AND G051.TPTRANSP IN(${tptransp})`;
        }
      };

      if (req.body.SNENTREG) { // FILTRAR ENTREGUE OU TRANSITO 
        switch (req.body.SNENTREG.id) {
          case 1: // ENTREGUE
            req.body.DTENTREG = `AND G043.DTENTREG IS NOT NULL`;
            break; 
          case 2: // EM TRANSITO
            req.body.DTENTREG = `AND G043.DTENTREG IS NULL`;
            break;
          default: // TODOS
            req.body.DTENTREG = ``;
            break;
        }
      };

      // INICIO FILTRO DE DATA E CARREGAMENTO DE 10K+
      let result = [];
      let dayI;
      let monthI;
      let yearI;
      let dayF;
      let monthF;
      let yearF;

      if(req.body.DTEMINOTI && req.body.DTEMINOTF){ //CASO SEJA ENVIADA UMA DATA PARA FILTAGREM, É TRATADADA AQUI
        let diaI = String(req.body.DTEMINOTI.day);
        let mesI = String(req.body.DTEMINOTI.month);
        let anoI = String(req.body.DTEMINOTI.year);
        let dataI = moment(`${anoI}-${mesI}-${diaI}`).format('YYYY-MM-DD')
        dayI = moment(dataI).format('DD');
        monthI = moment(dataI).format('MM');
        yearI = moment(dataI).format('YYYY');
        let diaF = String(req.body.DTEMINOTF.day);
        let mesF = String(req.body.DTEMINOTF.month);
        let anoF = String(req.body.DTEMINOTF.year);
        let dataF = moment(`${anoF}-${mesF}-${diaF}`).format('YYYY-MM-DD')
        dayF = moment(dataF).format('DD');
        monthF = moment(dataF).format('MM');
        yearF = moment(dataF).format('YYYY');
        let mesAux = moment(dataI).subtract(1, 'months').format('MM');
        req.body.dataAUX = `${anoI}-${mesAux}`;
      }else{ // CALCULO A PARTIR DA DATA ATUAL (DATA DE HOJE);
        dayI = '01';
        monthI = moment().format('MM');
        yearI = moment().format('YYYY');
        dayF = moment().format('DD');
        monthF = moment().format('MM');
        yearF = moment().format('YYYY');
        let mesAux = moment().subtract(1, 'months').format('MM');
        req.body.dataAUX = `${yearI}-${mesAux}`;
      }

      let dif = (parseInt(dayF) - parseInt(dayI) == 0) ? 1 : parseInt(dayF) - parseInt(dayI);

      if((dif) <= 7){ // ATE 7 DIAS DE DIFERENCA
        req.body.DTINIPER = `${yearI}-${monthI}-${dayI} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${dayF} 00:00:00`;

        let list1 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list1];
      }

      if((dif) > 7 && (dif) <= 14){ // A PARTIR DE 8 DIAS E MENOR OU IGUAL HÁ 14 DIAS DE DIFERENCA
        let diaInicial1 = ((parseInt(dayI) + 7) < 10) ? `0${parseInt(dayI) + 7}` : `${parseInt(dayI) + 7}` ;
        req.body.DTINIPER = `${yearI}-${monthI}-${dayI} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${diaInicial1} 00:00:00`;

        let list1 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list1];

        diaInicial1 = ((parseInt(diaInicial1) + 1) < 10) ? `0${parseInt(diaInicial1) + 1}` : `${parseInt(diaInicial1) + 1}` ;
        req.body.DTINIPER = `${yearI}-${monthI}-${diaInicial1} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${dayF} 00:00:00`;

        let list2 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list2];
      }

      if((dif) > 14 && (dif) <= 21){  // A PARTIR DE 14 DIAS E MENOR OU IGUAL HÁ 21 DIAS DE DIFERENCA
        let diaInicial1 = ((parseInt(dayI) + 7) < 10) ? `0${parseInt(dayI) + 7}` : `${parseInt(dayI) + 7}` ;
        let diaInicial2 = parseInt(dayI) + 14;
        
        req.body.DTINIPER = `${yearI}-${monthI}-${dayI} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${diaInicial1} 00:00:00`;

        let list1 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list1];

        diaInicial1 = ((parseInt(diaInicial1) + 1) < 10) ? `0${parseInt(diaInicial1) + 1}` : `${parseInt(diaInicial1) + 1}` ;
        req.body.DTINIPER = `${yearI}-${monthI}-${diaInicial1} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${diaInicial2} 00:00:00`;

        let list2 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list2];

        diaInicial2 = diaInicial2 + 1;
        req.body.DTINIPER = `${yearI}-${monthI}-${diaInicial2} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${dayF} 00:00:00`;

        let list3 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list3];
      }

      if((dif) > 21 && (dif) <= 30){  // MAIS QUE 21 DIAS DE DIFERENCA
        let diaInicial1 = ((parseInt(dayI) + 7) < 10) ? `0${parseInt(dayI) + 7}` : `${parseInt(dayI) + 7}` ;
        let diaInicial2 = parseInt(dayI) + 14;
        let diaInicial3 = parseInt(dayI) + 21;

        req.body.DTINIPER = `${yearI}-${monthI}-${dayI} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${diaInicial1} 00:00:00`;

        let list1 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list1];

        diaInicial1 = ((parseInt(diaInicial1) + 1) < 10) ? `0${parseInt(diaInicial1) + 1}` : `${parseInt(diaInicial1) + 1}` ;
        req.body.DTINIPER = `${yearI}-${monthI}-${diaInicial1} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${diaInicial2} 00:00:00`;

        let list2 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list2];

        diaInicial2 = diaInicial2 + 1;
        req.body.DTINIPER = `${yearI}-${monthI}-${diaInicial2} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${diaInicial3} 00:00:00`;

        let list3 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list3];

        diaInicial3 = diaInicial3 + 1;
        req.body.DTINIPER = `${yearI}-${monthI}-${diaInicial3} 00:00:00`;
        req.body.DTFINPER = `${yearF}-${monthF}-${dayF} 00:00:00`;

        let list4 = await dao.buscarDadosCalor(req, res, next);
        result = [...result, ...list4];
      }

      let mesAnterior = await dao.buscarDadosCalorMesAnterior(req, res, next); // SQL PARA PEGAR TODAS AS CARGAS DO MES ANTERIOR QUE AINDA NAO FORAM ENTREGUES 
      result = [...result, ...mesAnterior];

      let retorno = {
        "type": "FeatureCollection",
        "features": []
      };

      for (let i of result) { // FOR PARA MONTAR O ARRAY QUE ALIMENTA O MAPA 
        if (i.NRLATITU != null && i.NRLONGIT != null || i.NRLATITU == 0 || i.NRLONGIT == 0) {
          retorno.features.push(
            {
              "type": "Feature",
              "properties": { IDG043: i.IDG043, NRNOTA: i.NRNOTA, DTEMINOT: i.DTEMINOT },
              "geometry": { "type": "Point", "coordinates": [i.NRLONGIT, i.NRLATITU] }
            }
          )
        }
      };

      res.status(200).send(retorno);

    } catch (err) {

      res.status(500).send({ err, message: `Erro ao buscar dados!` });

    };

  };

  return api;
}