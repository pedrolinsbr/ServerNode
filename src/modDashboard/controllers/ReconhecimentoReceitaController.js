module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modDashboard.dao.ReconhecimentoReceitaDAO;

  var xlsxj = require("xlsx-to-json");

  api.reconheceReceitaGeral = async function (req, res, next) {

    req.body.auxDTEMINOT = `AND TO_CHAR(G043.DTEMINOT,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')`;
    req.body.auxIDG005 = ``;
    req.body.auxIDG014 = ``;
    
    if(req.body.dataInicial && req.body.dataFinal){
      // req.body.auxDTEMINOT = `AND (TRUNC(G043.DTEMINOT) >= TO_DATE('${req.body.dataInicial}' , 'YYYY-MM-DD') AND TRUNC(G043.DTEMINOT) <= TO_DATE('${req.body.dataFinal}' , 'YYYY-MM-DD') 
      // OR TRUNC(G043.DTENTREG) >= TO_DATE('${req.body.dataInicial}' , 'YYYY-MM-DD') AND TRUNC(G043.DTENTREG) <= TO_DATE('${req.body.dataFinal}' , 'YYYY-MM-DD')`
      req.body.auxDTEMINOT = `AND TRUNC(G043.DTEMINOT) >= TO_DATE('${req.body.dataInicial}' , 'YYYY-MM-DD') AND TRUNC(G043.DTEMINOT) <= TO_DATE('${req.body.dataFinal}' , 'YYYY-MM-DD')`
    };

    if (req.body.IDG005) {
      if (req.body.IDG005.length > 0) {
        let IDG005 = req.body.IDG005.map(d => d.id);
        req.body.auxIDG005 = `AND G005.IDG005 IN (${IDG005.join()})`;
      }
    };

    if (req.body.IDG014) {
      if (req.body.IDG014.length > 0) {
        let IDG014 = req.body.IDG014.map(d => d.id);
        req.body.auxIDG014 = `AND G014.IDG014 IN (${IDG014.join()})`;
      }
    };

    await dao.reconheceReceitaGeral(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.reconheceReceitaGrid = async function (req, res, next) {
    await dao.reconheceReceitaGrid(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarCutOff = async function(req, res, next){
    let name = ``;

    let IDG014 = await dao.buscarUsuario(req, res, next); 

    switch (IDG014[0].IDG014) {
      case 75:
        name = `CUTOFF-UPL`
        break;
      case 93:
        name = `CUTOFF-FMC`
        break;
      default:
        name = ``
        break;
    }

    if(name != ``){
      xlsxj({
        input: `../xml/xlsx/${name}.xlsx`,
        output: "../xml/xlsx/output.json"
      }, function (err, result) {
        if (err) {
          console.error(err);
        } else {
          res.json(result);
        }
      })
    }else{
      res.status(200).send('OK');
    }

  }

  return api;
  
};
