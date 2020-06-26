module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modDashboard.dao.GestaoCdAgDAO;
  var xlsxj = require("xlsx-to-json");
  var moment = require('moment');

  const xls = require('xlsx');

  api.inOutGeral = async function (req, res, next) {
    await dao.inOutGeral(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.inOutFiliais = async function (req, res, next) {
    await dao.inOutFiliais(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.planejamentoSemanalDetalhado = async function (req, res, next) {
    await dao.planejamentoSemanalDetalhado(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.planejamentoSemanalRealizado = async function (req, res, next) {
    await dao.planejamentoSemanalRealizado(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.planejamentoMensalGeral = async function (req, res, next) {
    await dao.planejamentoMensalGeral(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  api.planejamentoMensalRealizado = async function (req, res, next) {
    await dao.planejamentoMensalRealizado(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.gestaoCdGrid = async function (req, res, next) {
    await dao.gestaoCdGrid(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.detailAgendamento = async function (req, res, next) {
    await dao.detailAgendamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.ocupacaoGeral = async function (req, res, next) {
    await dao.ocupacaoGeral(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.lerXlsx = async function (req, res, next) {
    xlsxj({
      input: `../xml/xlsx/${req.body.path}`,
      output: "../xml/xlsx/output.json"
    }, function(err, result) {
      if(err) {
        console.error(err);
      }else {
        return result;
      }
    });
  }

  api.buscarMovimentacao = async function (req, res, next) {
  //  await api.atualizarArmazenagem();
    var armazenado = [];
    await dao.listarOcupacao(req, res, next)
    .then((result1) => {
      armazenado = result1.data;
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      next(err);
    });

   var workbook   = xls.readFile(`../xml/xlsx/contratoCD.xlsx`);
   var worksheet  = workbook.Sheets[workbook.SheetNames[0]];
   var contra     = xls.utils.sheet_to_json(worksheet);


   var contratados = [];
   var armazCd = [];
   var armazAg = [];
   var armazLivres = [];
   var totalContratados = 0;

  for(let item of contra){
    totalContratados += item.pallets;
    let objCont = {IDG028: item.ID, name:item['CD Origem'], value: (item.pallets != null && item.pallets != undefined)?item.pallets:0};
    let obj = {IDG028: item.ID, name:item['CD Origem'], value: 0};
    contratados.push(objCont);

  }


    var totalCd = 0;
    var totalAg = 0;

    for (var i of armazenado){
      var paletes = i.QTPALLET;
      

      let obj = {
        IDG028: i.IDG028,
        name : i.NMARMAZE,
        value: paletes
      };
      
  
      if(i.TPCDAG == 1)
      {
        totalCd += paletes;
        armazCd.push(obj);
      }
      if(i.TPCDAG == 2)
      {
        totalAg += paletes;
        armazAg.push(obj);
      } 
            
      var temContratado = false;
      for(c of contratados){
        if(c.IDG028 == i.IDG028){
          var temLivre = false;
          armazLivres.map(d=>{
            if(i.IDG028 == d.IDG028){
              temLivre = true;
              d.value -= i.QTPALLET
            }
          });
          if(!temLivre){
            let objAux = {
              IDG028: i.IDG028,
              name : i.NMARMAZE,
              value: c.value - i.QTPALLET
            };
            armazLivres.push(objAux);
            
          }    
          temContratado = true;  
        }
      }
      if(!temContratado){
        let objAux2 = {
          IDG028: i.IDG028,
          name : i.NMARMAZE,
          value: 0
        };
        armazLivres.push(objAux2);
      }

    }

    for(let jtem of armazLivres){
      var temCd = false;
      var temAg = false;
      armazCd.map(c=>{
        if(jtem.IDG028 == c.IDG028){
          temCd = true;
        }
      });
      armazAg.map(a=>{
        if(jtem.IDG028 == a.IDG028){
          temAg = true;
        }
      });
      if(!temCd){
        armazCd.push(
          {
            IDG028: jtem.IDG028,
            name : jtem.name,
            value: 0
          }
        );
      }
      if(!temAg){
        armazAg.push(
          {
            IDG028: jtem.IDG028,
            name : jtem.name,
            value: 0
          }
        );
      }
    }

    var resposta =
    {
      total:[
            {name: 'Livres', value: totalContratados - (totalCd + totalAg)}           
          , {name:'Ocupacão CD', value: totalCd}
          , {name:'Ocupacão AG', value: totalAg}
      ],
      ArmazCd:armazCd,
      ArmazAg:armazAg,
      ArmazLivres: armazLivres
    }
    res.json(resposta);
  }

  api.inOutGeralNovo = async function (req, res, next) {
    var result = await dao.inOutGeralNovo(req, res, next);
    var resultArmazTotal = await dao.inOutGeralTotal(req, res, next)


    // ##### INTEIROS #####
    var totalIN  = 0
    var totalOUT = 0
    /* --------------- */
    var outRealizado     = 0;
    var outNaoRealizado  = 0;
    var outNaoRealAtraso = 0;
    var outNaoRealPrazo  = 0;
    /* --------------- */
    var inRealizado     = 0;
    var inNaoRealizado  = 0;
    var inNaoRealAtraso = 0;
    var inNaoRealPrazo  = 0;
    /* --------------- */
    var ton = 1000;

    // ##### ARRAYS #####
    var arArmazOutRealizadas = [];
    var arArmazOutNaoRealizadas = [];
    var arArmazOutNaoRealPrazo = [];
    var arArmazOutNaoRealAtras = [];
    /* ------------------------ */
    var arArmazInRealizadas = [];
    var arArmazInNaoRealizadas = [];
    var arArmazInNaoRealPrazo = [];
    var arArmazInNaoRealAtras = [];
    /* ------------------------ */
    var arArmazTotalOut = [];
    var arArmazTotalIn = [];


    for (var item of resultArmazTotal ){

      if(item.TPMOVTO =="C"){
        arArmazTotalOut.push({name:item.NMARMAZE, value:item.QTPESO});
      } else{
        arArmazTotalIn.push({name:item.NMARMAZE, value:item.QTPESO});
      }
    }


    // colocar um número zerado para nos que não tem para seguimentar os gráficos/////
    var result1 = [];
    for(var x of result){

      if(x.TPMOVTO == "C"){ // OUT
        if(x.STAGENDA == 8 ){ //REALIZADO
          var filtro = result.filter(d => {return d.IDG028 == x.IDG028 && d.STAGENDA == 3 && d.TPMOVTO == "C" });
          if(filtro == 0){ result1.push({ QTPESO:0, TPMOVTO:"C", STAGENDA:3, NMARMAZE:x.NMARMAZE }) };
        } else{ // NÃO REALIZADO
          var filtro = result.filter(d => {return d.IDG028 == x.IDG028 && d.STAGENDA == 8  && d.TPMOVTO == "C" });
          if(filtro == 0){ result1.push({ QTPESO:0, TPMOVTO:"C", STAGENDA:8, NMARMAZE:x.NMARMAZE }) };

        }
      } else{ // IN
        if(x.STAGENDA == 8 ){ //REALIZADO
          var filtro = result.filter(d => {return d.IDG028 == x.IDG028 && d.STAGENDA == 3  && d.TPMOVTO == "D" });
          if(filtro == 0){ result1.push({ QTPESO:0, TPMOVTO:"D", STAGENDA:3, NMARMAZE:x.NMARMAZE }) };
        } else{ // NÃO REALIZADO
          var filtro = result.filter(d => {return d.IDG028 == x.IDG028 && d.STAGENDA == 8  && d.TPMOVTO == "D"});
          if(filtro == 0){ result1.push({ QTPESO:0, TPMOVTO:"D", STAGENDA:8, NMARMAZE:x.NMARMAZE }) };
        }
      }
    }

    for(z of result1){
      result.push(z);
    }
    // colocar um número zerado para nos que não tem para seguimentar os gráficos/////

    for(var i of result){
      var QTPESO = parseFloat(i.QTPESO);
      var TPRAZO = parseFloat((i.TT_PRAZO == null)? 0 : i.TT_PRAZO);
      var TATRASO = parseFloat((i.TT_ATRASO == null)? 0 : i.TT_ATRASO);

      if(i.TPMOVTO == "C"){ //OUT
        totalOUT += QTPESO
        if(i.STAGENDA == 8 ){ // REALIZADO
          outRealizado += QTPESO;
          arArmazOutRealizadas.push({name:i.NMARMAZE, value:i.QTPESO / ton, IDG028:i.IDG028})

        }else{ // NÃO REALIZADO
          outNaoRealizado += QTPESO;
          outNaoRealAtraso += TATRASO;
          outNaoRealPrazo += TPRAZO;

          arArmazOutNaoRealAtras.push({name:i.NMARMAZE, value:TATRASO / ton, IDG028:i.IDG028});
          arArmazOutNaoRealPrazo.push({name:i.NMARMAZE, value:TPRAZO / ton, IDG028:i.IDG028});

          arArmazOutNaoRealizadas.push({name:i.NMARMAZE, value:i.QTPESO / ton, IDG028:i.IDG028})
        }
      } else { //IN
        totalIN += QTPESO;
        if(i.STAGENDA == 8 ){ // REALIZADO
          inRealizado += QTPESO;
          arArmazInRealizadas.push({name:i.NMARMAZE, value:i.QTPESO / ton, IDG028:i.IDG028})
        }else{ // NÃO REALIZADO
          inNaoRealizado += QTPESO;
          inNaoRealAtraso += TATRASO;
          inNaoRealPrazo += TPRAZO;

          arArmazInNaoRealAtras.push({name:i.NMARMAZE, value:TATRASO / ton, IDG028:i.IDG028});
          arArmazInNaoRealPrazo.push({name:i.NMARMAZE, value:TPRAZO / ton, IDG028:i.IDG028});

          arArmazInNaoRealizadas.push({name:i.NMARMAZE, value:i.QTPESO / ton, IDG028:i.IDG028})
        }
      }

    }

    var total = totalIN + totalOUT;
    var totalINPer = (totalIN * 100) / total;
    var totalOUTPer = (totalOUT * 100) / total;
    /* --------------------------- */
    var totalOutRealPer = (outRealizado * 100) / totalOUT;
    var totalOutNaoRealPer = (outNaoRealizado * 100) / totalOUT;
    var totalOutNaoRealAtrasoPer = (outNaoRealAtraso * 100) / totalOUT;
    var totalOutNaoRealPrazoPer = (outNaoRealPrazo * 100) / totalOUT;
    /* --------------------------- */
    var totalInRealPer = (inRealizado * 100) / totalIN;
    var totalInNaoRealPer = (inNaoRealizado * 100) / totalIN;
    var totalInNaoRealAtrasoPer = (inNaoRealAtraso * 100) / totalIN;
    var totalInNaoRealPrazoPer = (inNaoRealPrazo * 100) / totalIN;

     resposta = {
                geral:[
                  {name:'OUT', value:totalOUT / ton, percent: Math.round(totalOUTPer) }
                , {name:'IN', value:totalIN / ton, percent: Math.round(totalINPer)}
                ],
                out:[
                  {name:'Não realizado no prazo', value:outNaoRealPrazo / ton, percent: Math.round(totalOutNaoRealPrazoPer)},
                  {name:'Não realizado Atrasado', value:outNaoRealAtraso / ton, percent: Math.round(totalOutNaoRealAtrasoPer)},
                  {name:'Realizado', value:outRealizado / ton , percent: Math.round(totalOutRealPer) }
                ],
                in:[
                  {name:'Não realizado no prazo', value:inNaoRealPrazo / ton, percent: Math.round(totalInNaoRealPrazoPer)},
                  {name:'Não realizado Atrasado', value:inNaoRealAtraso / ton, percent: Math.round(totalInNaoRealAtrasoPer)},
                  {name:'Realizado', value:inRealizado / ton , percent: Math.round(totalInRealPer) }
                ],
                arArmazOutRealizadas: arArmazOutRealizadas,
                arArmazOutNaoRealizadas: arArmazOutNaoRealizadas,
                arArmazInRealizadas: arArmazInRealizadas,
                arArmazInNaoRealizadas: arArmazInNaoRealizadas,
                arArmazTotalOut: arArmazTotalOut,
                arArmazTotalIn: arArmazTotalIn,

                arArmazOutNaoRealAtras : arArmazOutNaoRealAtras,
                arArmazOutNaoRealPrazo : arArmazOutNaoRealPrazo,
                arArmazInNaoRealAtras : arArmazInNaoRealAtras,
                arArmazInNaoRealPrazo : arArmazInNaoRealPrazo

              }

    res.json(resposta);

  };

  /***
   *
   * FUNÇÃO CHAMADA EM CRON PARA ATUALIZAR
   * A TABELA DE ARMAZENAGEM -- G080
   *
  ***/
  api.atualizarArmazenagem = async function (req, res, next) {
    // var workbook = xls.readFile(`../xml/xlsx/paletes.xlsx`);
    var workbook = xls.readFile(`../xml/xlsx/${item.file.name}`);      
    var worksheet  = workbook.Sheets[workbook.SheetNames[0]];
    var arJSON     = xls.utils.sheet_to_json(worksheet);
    var arOcorre = [];

    var sqlUpdate = '';
    var sqlInsert = '';

    var objConn = await dao.controller.getConnection();

    for(let item of arJSON){
      //item.Data = '20/02/2019'
      sqlUpdate = `
        UPDATE G080
        SET
          NRPESO = ${item.Peso},
          QTKGLITR = ${item['Qtdd (KG/L)']},
          QTPALETE = ${item.Paletes}
        WHERE  (IDG028 = ${item.id} AND IDG005 = ${parseInt(item['ID Pagador'])})
        AND
        ( NRPESO   <> ${item.Peso} OR
          QTKGLITR <> ${item['Qtdd (KG/L)']} OR
          QTPALETE <> ${item.Paletes})
      `;

      await dao.atualizaArmazenagem(sqlUpdate, objConn)
      .then(async (result1) => {})
      .catch((err) => {
        arOcorre.push('Erro no Update');

      });

      sqlInsert = `
        INSERT INTO G080 (
          IDG028,
          DTOCUPAC,
          IDG005,
          NRPESO,
          QTKGLITR,
          QTPALETE,
          TPCDAG
        )
        SELECT
          ${item.id},
          TO_DATE('${item.Data}', 'DD/MM/YYYY'),
          ${parseInt(item['ID Pagador'])},
          ${item.Peso},
          ${item['Qtdd (KG/L)']},
          ${item.Paletes},
          1
          FROM dual
        WHERE NOT EXISTS (SELECT 1 FROM G080 WHERE IDG028 = ${item.id} AND TO_CHAR(DTOCUPAC, 'DD/MM/YYYY') = '${item.Data}'
        AND IDG005 = ${parseInt(item['ID Pagador'])})
      `;

      await dao.atualizaArmazenagem(sqlInsert, objConn)
      .then(async (result1) => {})
      .catch((err) => {
        arOcorre.push('Erro no Insert');

      });
    }

    if (arOcorre.length == 0)
        await objConn.close();
    else
        await objConn.closeRollback();

    return arOcorre;
  }

  return api;
};
