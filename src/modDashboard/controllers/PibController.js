module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modDashboard.dao.PibDAO;
  var xlsxj = require("xlsx-to-json");
  var moment = require('moment');


  api.pibGeral = async function (req, res, next) {
    await dao.pibGeral(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.pibQualidadeOfericimento = async function (req, res, next) {
    await dao.pibQualidadeOfericimento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.pibTipoVeiculo = async function (req, res, next) {
    await dao.pibTipoVeiculo(req, res, next)
      .then((result1) => {
        let tipo = [
          { DSTIPVEI: "LEVE", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "TOCO", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "TRUCK", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "BI-TRUCK", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "CARRETA", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "VANDERLEIA", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "BI-TREM", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "RODOTREM", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
          { DSTIPVEI: "OUTROS", TT_CAPACIDADE: 0, TT_CARGAS: 0, TT_PESO: 0 },
        ]
        for(item of result1) {

          switch(item.IDG030) {
            case 31:
              tipo[0].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[0].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[0].TT_PESO +=  item.TT_PESO;
              break

            case 33: //TOCO
            case 32:
              tipo[1].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[1].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[1].TT_PESO +=  item.TT_PESO; 
              break
              
            case 155: //TRUCK
            case 34:
              tipo[2].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[2].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[2].TT_PESO +=  item.TT_PESO; 
              break

            case 45: //BI-TRUCK
              tipo[3].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[3].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[3].TT_PESO +=  item.TT_PESO;  
              break

            case 36: //CARRETA
            case 37:
            case 154:
            case 38:
            case 39:
              tipo[4].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[4].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[4].TT_PESO +=  item.TT_PESO;  
              break

            case 41: //VANDERLEIA
            case 40:
            case 153:
            case 159:
              tipo[5].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[5].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[5].TT_PESO +=  item.TT_PESO;  
              break

            case 160: //BI-TREM
              tipo[6].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[6].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[6].TT_PESO +=  item.TT_PESO; 
              break

            case 156: //RODOTREM
            case 42:
              tipo[7].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[7].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[7].TT_PESO +=  item.TT_PESO; 
              break
           
            default:
              tipo[8].TT_CAPACIDADE +=  item.TT_CAPACIDADE; 
              tipo[8].TT_CARGAS +=  item.TT_CARGAS; 
              tipo[8].TT_PESO +=  item.TT_PESO;  
              break
          }
        }        
        // tipo.sort((a,b) => {
        //   return a.TT_CARGAS < b.TT_CARGAS ? 1 : a.TT_CARGAS > b.TT_CARGAS ? -1 : 0;
        // })
        res.json(tipo);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.pibTransportadora = async function (req, res, next) {
    await dao.pibTransportadora(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.gridPib = async function (req, res, next) {
    await dao.gridPib(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.previsaoFaturamento = async function(req,res,next){
    xlsxj({
      input: `../xml/xlsx/${req.body.path}`, 
      output: "../xml/xlsx/output.json"
    }, function(err, result) {
      if(err) {
        console.error(err);
      }else {
        var filtroOpen= result.filter(d => {return d['Order Status'] == 'Open'});
        var obj = {};
        obj.diaAtual = moment().format("MM-DD-YYYY")
        obj.semanaAtual = moment().format('w')
        obj.mesAtual = moment().format('MM')
        obj.anoAtual = moment().format('YYYY')
        obj.quarterAtual = api.BuscarQuarter(moment().format('MM'));

        obj.calcAtrasadas = 0;
        obj.calcSemana = 0;
        obj.calcMes = 0;
        obj.calcQuarter = 0;
        obj.calcAno = 0;
        obj.calcProximosAnos = 0;
        for(var i of filtroOpen){
          obj.dia = moment(i['Plan Goods Issue Date']).format("MM-DD-YYYY")
          obj.semana = moment(i['Plan Goods Issue Date']).format('w')
          obj.mes = moment(i['Plan Goods Issue Date']).format('MM')
          obj.quarter = api.BuscarQuarter(moment(i['Plan Goods Issue Date']).format('MM'));
          obj.ano = moment(i['Plan Goods Issue Date']).format('YYYY')
          if(obj.anoAtual == obj.ano){

            if (obj.dia < obj.diaAtual){
              obj.calcAtrasadas = obj.calcAtrasadas + parseFloat(i['Total Net Value Item LC'])

            }
            if (obj.semanaAtual == obj.semana && obj.dia >= obj.diaAtual  ){ // calcular semana atual
              obj.calcSemana = obj.calcSemana + parseFloat(i['Total Net Value Item LC'])
            }

            if (obj.mesAtual == obj.mes && obj.semana > obj.semanaAtual){ // calcular semana atual
              obj.calcMes = obj.calcMes + parseFloat(i['Total Net Value Item LC'])
            }

            if (obj.quarterAtual == obj.quarter && obj.mes > obj.mesAtual){ // calcular semana atual
              obj.calcQuarter = obj.calcQuarter + parseFloat(i['Total Net Value Item LC'])
            }
            if (obj.anoAtual == obj.ano && obj.quarter > obj.quarterAtual){ // calcular semana atual
              obj.calcAno = obj.calcAno + parseFloat(i['Total Net Value Item LC'])
            }
          }

          if(obj.ano > obj.anoAtual){
            obj.calcProximosAnos = obj.calcProximosAnos + parseFloat(i['Total Net Value Item LC'])
          }
        }

        var resposta = [
                            { name : 'Atrasadas',     value: Math.round(obj.calcAtrasadas) }
                          , { name : 'Semana',        value: Math.round(obj.calcSemana) }
                          , { name : 'Mês',           value: Math.round(obj.calcMes) }
                          , { name : 'Quarter',       value: Math.round(obj.calcQuarter) }
                          , { name : 'Ano',           value: Math.round(obj.calcAno) }
                          , { name : 'Próximos anos', value: Math.round(obj.calcProximosAnos) }
                        ]
        
        res.json(resposta);

      }
    });
  }

  api.previsaoFaturamentoAcumulado = async function(req,res,next){
    xlsxj({
      input: `../xml/xlsx/${req.body.path}`, 
      output: "../xml/xlsx/output.json"
    }, function(err, result) {
      if(err) {
        console.error(err);
      }else {
        var filtroOpen= result.filter(d => {return d['Order Status'] == 'Open'});
        var obj = {};
        obj.diaAtual = moment().format("MM-DD-YYYY")
        obj.semanaAtual = moment().format('w')
        obj.mesAtual = moment().format('MM')
        obj.anoAtual = moment().format('YYYY')
        obj.quarterAtual = api.BuscarQuarter(moment().format('MM'));

        obj.calcAtrasadas = 0;
        obj.calcSemana = 0;
        obj.calcMes = 0;
        obj.calcQuarter = 0;
        obj.calcAno = 0;
        obj.calcProximosAnos = 0;
        for(var i of filtroOpen){
          obj.dia = moment(i['Plan Goods Issue Date']).format("MM-DD-YYYY")
          obj.semana = moment(i['Plan Goods Issue Date']).format('w')
          obj.mes = moment(i['Plan Goods Issue Date']).format('MM')
          obj.quarter = api.BuscarQuarter(moment(i['Plan Goods Issue Date']).format('MM'));
          obj.ano = moment(i['Plan Goods Issue Date']).format('YYYY')
          if(obj.anoAtual == obj.ano){

            if (obj.dia < obj.diaAtual){
              obj.calcAtrasadas = obj.calcAtrasadas + parseFloat(i['Total Net Value Item LC'])

            }
            if (obj.semanaAtual == obj.semana && obj.dia >= obj.diaAtual  ){ // calcular semana atual
              obj.calcSemana = obj.calcSemana + parseFloat(i['Total Net Value Item LC'])
            }

            if (obj.mesAtual == obj.mes && obj.semana >= obj.semanaAtual){ // calcular semana atual
              obj.calcMes = obj.calcMes + parseFloat(i['Total Net Value Item LC'])
            }

            if (obj.quarterAtual == obj.quarter && obj.mes >= obj.mesAtual){ // calcular semana atual
              obj.calcQuarter = obj.calcQuarter + parseFloat(i['Total Net Value Item LC'])
            }
            if (obj.anoAtual == obj.ano && obj.quarter >= obj.quarterAtual){ // calcular semana atual
              obj.calcAno = obj.calcAno + parseFloat(i['Total Net Value Item LC'])
            }
          }

          if(obj.ano > obj.anoAtual){
            obj.calcProximosAnos = obj.calcProximosAnos + parseFloat(i['Total Net Value Item LC'])
          }
        }

        var resposta = [
                            { name : 'Atrasadas',     value: Math.round(obj.calcAtrasadas) }
                          , { name : 'Semana',        value: Math.round(obj.calcSemana) }
                          , { name : 'Mês',           value: Math.round(obj.calcMes) }
                          , { name : 'Quarter',       value: Math.round(obj.calcQuarter) }
                          , { name : 'Ano',           value: Math.round(obj.calcAno) }
                          , { name : 'Próximos anos', value: Math.round(obj.calcProximosAnos) }
                        ]
        
        res.json(resposta);

      }
    });
  }

  api.BuscarQuarter = function(mes,res,next){
    var Q;
    
    switch(parseInt(mes)){
      case 1:
      case 2:
      case 3:
        Q = 1;
        break;
      case 4:
      case 5:
      case 6:
        Q = 2;
        break;
      case 7:
      case 8:
      case 9:
        Q = 3;
        break;
      case 10:
      case 11:
      case 12:
        Q = 4;
        break;
    }
    return Q;

  }

  //-=-=-=-=-==--=- NOVOS SQLS -=-=-=-=-=-=-=-=-=

  api.buscarPib = async function (req, res, next) {
    
    try {
      req.objConn = await dao.controller.getConnection();

      req.body.aux = `AND G043.STETAPA IN (0,1,2)`
      
      let pib = await dao.buscarPib(req, res, next);

      req.body.aux = `AND G043.STETAPA IN (3) AND G046.STCARGA <> 'C' AND H007.HOINICIO IS NOT NULL`

      let pibAgendadas = await dao.buscarPib(req, res, next);

      let result = pib.concat(pibAgendadas);

      res.status(200).send(result);
      
    } catch(err) {
      res.status(500).send({message:`Erro ao buscar transferências`});
    }

  }

  return api;
};
