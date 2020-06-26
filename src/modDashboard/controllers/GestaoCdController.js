module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modDashboard.dao.GestaoCdDAO;
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
    }, function (err, result) {
      if (err) {
        console.error(err);
      } else {
        return result;
      }
    });
  }

  api.buscarOcupacao = async function (req, res, next) {
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

    var workbook = xls.readFile(`../xml/xlsx/contratoCD.xlsx`);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var contra = xls.utils.sheet_to_json(worksheet);


    var contratados = [];
    var armazCd = []
    var armazLivres = []
    var totalContratados = 0;

    for (let item of contra) {
      totalContratados += item.pallets;
      let objCont = { IDG028: item.ID, name: item['CD Origem'], value: (item.pallets != null && item.pallets != undefined) ? item.pallets : 0 };
      let obj = { IDG028: item.ID, name: item['CD Origem'], value: 0 };
      contratados.push(objCont);

    }


    var totalCd = 0;

    for (var i of armazenado) {
      var paletes = i.QTPALLET;
      totalCd += paletes;

      let obj = {
        name: i.NMARMAZE,
        value: i.QTPALLET
      };
      armazCd.push(obj);
      var temContratado = false;
      for (c of contratados) {
        if (c.IDG028 == i.IDG028) {
          let objAux = {
            name: i.NMARMAZE,
            value: c.value - i.QTPALLET
          };
          armazLivres.push(objAux);
          temContratado = true;
        }
      }
      if (!temContratado) {
        let objAux2 = {
          name: i.NMARMAZE,
          value: 0
        };
        armazLivres.push(objAux2);
      }

    }

    var resposta =
    {
      total: [
        { name: 'Ocupacão CD', value: totalCd }
        , { name: 'Livres', value: totalContratados - totalCd }
      ],
      ArmazCd: armazCd,
      ArmazLivres: armazLivres
    }
    res.json(resposta);


  }

  api.inOutGeralNovo = async function (req, res, next) {
    var result = await dao.inOutGeralNovo(req, res, next);
    var resultArmazTotal = await dao.inOutGeralTotal(req, res, next)


    // ##### INTEIROS #####
    var totalIN = 0
    var totalOUT = 0
    /* --------------- */
    var outRealizado = 0;
    var outNaoRealizado = 0;
    var outNaoRealAtraso = 0;
    var outNaoRealPrazo = 0;
    /* --------------- */
    var inRealizado = 0;
    var inNaoRealizado = 0;
    var inNaoRealAtraso = 0;
    var inNaoRealPrazo = 0;
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


    for (var item of resultArmazTotal) {

      if (item.TPMOVTO == "C") {
        arArmazTotalOut.push({ name: item.NMARMAZE, value: item.QTPESO });
      } else {
        arArmazTotalIn.push({ name: item.NMARMAZE, value: item.QTPESO });
      }
    }


    // colocar um número zerado para nos que não tem para seguimentar os gráficos/////
    var result1 = [];
    for (var x of result) {

      if (x.TPMOVTO == "C") { // OUT
        if (x.STAGENDA == 8) { //REALIZADO
          var filtro = result.filter(d => { return d.IDG028 == x.IDG028 && d.STAGENDA == 3 && d.TPMOVTO == "C" });
          if (filtro == 0) { result1.push({ QTPESO: 0, TPMOVTO: "C", STAGENDA: 3, NMARMAZE: x.NMARMAZE }) };
        } else { // NÃO REALIZADO
          var filtro = result.filter(d => { return d.IDG028 == x.IDG028 && d.STAGENDA == 8 && d.TPMOVTO == "C" });
          if (filtro == 0) { result1.push({ QTPESO: 0, TPMOVTO: "C", STAGENDA: 8, NMARMAZE: x.NMARMAZE }) };

        }
      } else { // IN
        if (x.STAGENDA == 8) { //REALIZADO
          var filtro = result.filter(d => { return d.IDG028 == x.IDG028 && d.STAGENDA == 3 && d.TPMOVTO == "D" });
          if (filtro == 0) { result1.push({ QTPESO: 0, TPMOVTO: "D", STAGENDA: 3, NMARMAZE: x.NMARMAZE }) };
        } else { // NÃO REALIZADO
          var filtro = result.filter(d => { return d.IDG028 == x.IDG028 && d.STAGENDA == 8 && d.TPMOVTO == "D" });
          if (filtro == 0) { result1.push({ QTPESO: 0, TPMOVTO: "D", STAGENDA: 8, NMARMAZE: x.NMARMAZE }) };
        }
      }
    }

    for (z of result1) {
      result.push(z);
    }
    // colocar um número zerado para nos que não tem para seguimentar os gráficos/////

    for (var i of result) {
      var QTPESO = parseFloat(i.QTPESO);
      var TPRAZO = parseFloat((i.TT_PRAZO == null) ? 0 : i.TT_PRAZO);
      var TATRASO = parseFloat((i.TT_ATRASO == null) ? 0 : i.TT_ATRASO);

      if (i.TPMOVTO == "C") { //OUT
        totalOUT += QTPESO
        if (i.STAGENDA == 8) { // REALIZADO
          outRealizado += QTPESO;
          arArmazOutRealizadas.push({ name: i.NMARMAZE, value: i.QTPESO / ton, IDG028: i.IDG028 })

        } else { // NÃO REALIZADO
          outNaoRealizado += QTPESO;
          outNaoRealAtraso += TATRASO;
          outNaoRealPrazo += TPRAZO;

          arArmazOutNaoRealAtras.push({ name: i.NMARMAZE, value: TATRASO / ton, IDG028: i.IDG028 });
          arArmazOutNaoRealPrazo.push({ name: i.NMARMAZE, value: TPRAZO / ton, IDG028: i.IDG028 });

          arArmazOutNaoRealizadas.push({ name: i.NMARMAZE, value: i.QTPESO / ton, IDG028: i.IDG028 })
        }
      } else { //IN
        totalIN += QTPESO;
        if (i.STAGENDA == 8) { // REALIZADO
          inRealizado += QTPESO;
          arArmazInRealizadas.push({ name: i.NMARMAZE, value: i.QTPESO / ton, IDG028: i.IDG028 })
        } else { // NÃO REALIZADO
          inNaoRealizado += QTPESO;
          inNaoRealAtraso += TATRASO;
          inNaoRealPrazo += TPRAZO;

          arArmazInNaoRealAtras.push({ name: i.NMARMAZE, value: TATRASO / ton, IDG028: i.IDG028 });
          arArmazInNaoRealPrazo.push({ name: i.NMARMAZE, value: TPRAZO / ton, IDG028: i.IDG028 });

          arArmazInNaoRealizadas.push({ name: i.NMARMAZE, value: i.QTPESO / ton, IDG028: i.IDG028 })
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
      geral: [
        {
            name: 'Não realizado no prazo'
          , value: (inNaoRealPrazo / ton) + (outNaoRealPrazo / ton)
          , percent: Math.round((totalInNaoRealPrazoPer + totalOutNaoRealPrazoPer)/2)
        },
        {
            name: 'Não realizado Atrasado'
          , value: (inNaoRealAtraso / ton) + (outNaoRealAtraso / ton)
          , percent: Math.round((totalInNaoRealAtrasoPer + totalOutNaoRealAtrasoPer)/2)
        },
        {
            name: 'Realizado'
          , value: (inRealizado / ton) + (outRealizado / ton)
          , percent: Math.round((totalInRealPer + totalOutRealPer)/2)
        }
      ],
      out: [
        { name: 'Não realizado no prazo', value: outNaoRealPrazo / ton, percent: Math.round(totalOutNaoRealPrazoPer) },
        { name: 'Não realizado Atrasado', value: outNaoRealAtraso / ton, percent: Math.round(totalOutNaoRealAtrasoPer) },
        { name: 'Realizado', value: outRealizado / ton, percent: Math.round(totalOutRealPer) }
      ],
      in: [
        { name: 'Não realizado no prazo', value: inNaoRealPrazo / ton, percent: Math.round(totalInNaoRealPrazoPer) },
        { name: 'Não realizado Atrasado', value: inNaoRealAtraso / ton, percent: Math.round(totalInNaoRealAtrasoPer) },
        { name: 'Realizado', value: inRealizado / ton, percent: Math.round(totalInRealPer) }
      ],
      arArmazOutRealizadas: arArmazOutRealizadas,
      arArmazOutNaoRealizadas: arArmazOutNaoRealizadas,
      arArmazInRealizadas: arArmazInRealizadas,
      arArmazInNaoRealizadas: arArmazInNaoRealizadas,
      arArmazTotalOut: arArmazTotalOut,
      arArmazTotalIn: arArmazTotalIn,

      arArmazOutNaoRealAtras: arArmazOutNaoRealAtras,
      arArmazOutNaoRealPrazo: arArmazOutNaoRealPrazo,
      arArmazInNaoRealAtras: arArmazInNaoRealAtras,
      arArmazInNaoRealPrazo: arArmazInNaoRealPrazo

    }

    res.json(resposta);

  };


  /*** 
  * 
  * FUNÇÃO PARA ATUALIZAR 
  * A TABELA DE ARMAZENAGEM -- G080
  * 
 ***/
  api.atualizarArmazenagem = async function (req, res, next) {
    const { item } = req.body;
    try {
      var workbook = xls.readFile(`../xml/xlsx/${item.file.name}`);
      var worksheet = workbook.Sheets[workbook.SheetNames[0]];
      var arJSON = xls.utils.sheet_to_json(worksheet);
      var arOcorre = [];

      var sqlUpdate = '';
      var sqlInsert = '';
      let resposta;
      var objConn = await dao.controller.getConnection();
      let validation = [];
      //Responsável por remover o objeto
      arJSON.splice(0, 1);
      arJSON.forEach(async (item, index) => {
        let position = index + 1;
        if (item.IDG028) {
          if (typeof item.IDG028 !== "number") {
            validation.push(`O campo id armazém deve ser do formato numérico linha ${position}`);
          }
        } else {
          validation.push(`O campo id armazém é obrigatório linha ${position}`);
        }
        if (item.IDG005) {
          if (typeof item.IDG005 !== "number") {
            validation.push(`O campo id cliente deve ser do formato numérico linha ${position}`);
          }
        } else {
          validation.push(`O campo id cliente obrigatório linha ${position}`);
        }
        if (item.NRPESO) {
          if (typeof item.NRPESO !== "number") {
            validation.push(`O campo peso total deve ser do formato numérico linha ${position}`);
          }
        } else {
          validation.push(`O campo peso total é obrigatório linha ${position}`);
        }
        if (item.QTKGLITR) {
          if (typeof item.QTKGLITR !== "number") {
            validation.push(`O campo quantidade kg ou litro deve ser do formato numérico linha ${position}`);
          }
        } else {
          validation.push(`O campo quantidade kg ou litro é obrigatório linha ${position}`);
        }
        if (item.QTPALETE) {
          if (typeof item.QTPALETE !== "number") {
            validation.push(`O campo quantidade de paletes deve ser do formato numérico linha ${position}`);
          }
        } else {
          validation.push(`O campo quantidade de paletes é obrigatório linha ${position}`);
        }
        if (item.TPCDAG) {
          if (typeof item.TPCDAG !== "number") {
            validation.push(`O campo cd ou ag deve ser do formato numérico linha ${position}`);
          }
        } else {
          validation.push(`O campo cd ou ag é obrigatório linha ${position}`);
        }
        if (item.DTOCUPAC) {
          if (typeof item.DTOCUPAC !== "string") {
            validation.push(`O campo data deve ser do formato texto linha ${position}`);
          }
        } else {
          validation.push(`O campo data é obrigatório linha ${position}`);
        }
        if (validation.length > 0) {
          res.status(500);
          resposta = { response: "Erro ao Atualizar Dados de Ocupação", arOcorre: validation };
          res.json(resposta); 
        } else {
          //VERIFICO SE TEM O IDG028 NA G080 QUASE TENHA ELE DEVE ATUALIZAR O REGISTRO E SE NÃO TER
          //DEVE INSERIR UM NOVO REGISTRO
          
          sqlFind = `
            SELECT * FROM G080
            WHERE IDG028 = ${item.IDG028} 
            AND IDG005 = ${parseInt(item.IDG005)}
            AND TPCDAG = ${item.TPCDAG}
            AND TO_CHAR(DTOCUPAC, 'DD/MM/YYYY') = '${item.DTOCUPAC}'
          `
          let retornoArmazem = await dao.atualizaArmazenagem(sqlFind, objConn)
            .then(async (result1) => {
              return result1
            })
            .catch((err) => {
              arOcorre.push('Erro no Update');
            });
          if (retornoArmazem.length == 0) {
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
            VALUES(${item.IDG028}, TO_DATE('${item.DTOCUPAC}', 'DD/MM/YYYY'), ${parseInt(item.IDG005)}, ${item.NRPESO}, ${item.QTKGLITR}, ${item.QTPALETE}, ${item.TPCDAG})            
          `;
            await dao.atualizaArmazenagem(sqlInsert, objConn)
              .then(async (result1) => { 
              })
              .catch((err) => {
                arOcorre.push('Erro no Insert');
              });
          } else {
            sqlUpdate = `
              UPDATE G080
              SET 
                NRPESO = ${item.NRPESO},
                QTKGLITR = ${item.QTKGLITR},
                QTPALETE = ${item.QTPALETE},
                TPCDAG = ${item.TPCDAG}
              WHERE  (IDG028 = ${item.IDG028} 
                AND IDG005 = ${parseInt(item.IDG005)} 
                AND TO_CHAR(DTOCUPAC, 'DD/MM/YYYY') = '${item.DTOCUPAC}'
                AND TPCDAG = ${item.TPCDAG})
              AND 
              ( NRPESO   <> ${item.NRPESO} OR
                QTKGLITR <> ${item.QTKGLITR} OR
                QTPALETE <> ${item.QTPALETE} OR
                TPCDAG <> ${item.TPCDAG} )
            `;
            await dao.atualizaArmazenagem(sqlUpdate, objConn)
              .then(async (result1) => {
                return result1
              })
              .catch((err) => {
                arOcorre.push('Erro no Update');
              });
          }

          if (arOcorre.length == 0) {
            await objConn.close();
            res.status(200);
            resposta = { response: "Dados de Ocupação atualizados com sucesso.", arOcorre: arOcorre };
            res.json(resposta);            
          }
          else {
            await objConn.closeRollback();
            res.status(500);
            resposta = { response: "Erro ao Atualizar Dados de Ocupação", arOcorre: arOcorre };  
            res.json(resposta);          
          }
        }
      });      
    } catch (error) {
      res.status(500);
      resposta = { response: "Erro ao Atualizar Dados de Ocupação", arOcorre: arOcorre };
      res.json(resposta);
    }
  }


  /*** 
 * 
 * FUNÇÃO PARA ATUALIZAR 
 * A TABELA DE PLANEJAMENTO DE MOVIMENTAÇÃO -- G079
 * 
***/
  api.atualizarPlaneMovimentacao = async function (req, res, next) {
    let resposta;
    const { item } = req.body;
    try {
      var workbook = xls.readFile(`${process.env.FOLDER_XLSX}${item.file.name}`);
      var worksheet = workbook.Sheets[workbook.SheetNames[0]];
      var arJSON = xls.utils.sheet_to_json(worksheet);
      var arOcorre = [];

      var sqlUpdate = '';
      var sqlInsert = '';

      var objConn = await dao.controller.getConnection();
      //Responsável por remover o objeto
      arJSON.splice(0, 1);
      let validation = [];
      for (let item of arJSON) {
        if (item.IDG014) {
          if (typeof item.IDG014 !== "number") {
            validation.push('O campo id operação deve ser do formato numérico');
          }
        } else {
          validation.push('O campo id operação é obrigatório');
        }
        if (item.IDG028) {
          if (typeof item.IDG028 !== "number") {
            validation.push('O campo id armazém deve ser do formato numérico');
          }
        } else {
          validation.push('O campo id armazém é obrigatório');
        }
        if (item.NRPSCONT) {
          if (typeof item.NRPSCONT !== "number") {
            validation.push('O campo peso contratado deve ser do formato numérico');
          }
        } else {
          validation.push('O campo peso contratado é obrigatório');
        }
        if (item.NRPSPREV) {
          if (typeof item.NRPSPREV !== "number") {
            validation.push('O campo peso previsto deve ser do formato numérico');
          }
        } else {
          validation.push('O campo peso previsto é obrigatório');
        }
        if (item.DTREGIST) {
          if (typeof item.DTREGIST !== "string") {
            validation.push('O campo data deve ser do formato texto');
          }
        } else {
          validation.push('O campo data é obrigatório');
        }
        if (validation.length > 0) {
          res.status(500);
          resposta = { response: "Erro ao Atualizar Dados de Planejamento de Movimentação", arOcorre: validation };
        } else {
          sqlUpdate = `
              UPDATE G079
              SET 
                IDG014 = ${item.IDG014}, 
                IDG028 = ${item.IDG028}, 
                NRPSCONT = ${item.NRPSCONT}, 
                NRPSPREV = ${item.NRPSPREV}, 
                DTREGIST = TO_DATE('${item.DTREGIST}', 'DD/MM/YYYY'),
                SNDELETE = 0
              WHERE  (IDG014 = ${item.IDG014} AND IDG028 = ${item.IDG028} AND TO_CHAR(DTREGIST, 'DD/MM/YYYY') = '24/04/2019')
              AND 
              ( NRPSCONT <> ${item.NRPSCONT} OR
                NRPSPREV <> ${item.NRPSPREV} OR
                SNDELETE <> 0
              )
          `;

          await dao.atualizaArmazenagem(sqlUpdate, objConn)
            .then(async (result1) => {
              return result1
            })
            .catch((err) => {
              arOcorre.push('Erro no Update');

            });

          sqlInsert = `
            INSERT INTO G079 (
              IDG014, 
              IDG028, 
              NRPSCONT, 
              NRPSPREV, 
              DTREGIST,
              SNDELETE
            ) 
            SELECT
              ${item.IDG014},  
              ${item.IDG028}, 
              ${item.NRPSCONT}, 
              ${item.NRPSPREV},
              TO_DATE('${item.DTREGIST}', 'DD/MM/YYYY'),
              0 
              FROM dual
            WHERE NOT EXISTS (
              SELECT 1 FROM G079 WHERE IDG014 = ${item.IDG014} AND IDG028 = ${item.IDG028} AND TO_CHAR(DTREGIST, 'DD/MM/YYYY') = '${item.DTREGIST}'
              )
  
          `;

          await dao.atualizaArmazenagem(sqlInsert, objConn)
            .then(async (result1) => { })
            .catch((err) => {
              arOcorre.push('Erro no Insert');

            });
          if (arOcorre.length == 0) {
            await objConn.close();
            res.status(200);
            resposta = { response: "Dados de Planejamento de Movimentação atualizados com sucesso.", arOcorre: arOcorre };
          }
          else {
            await objConn.closeRollback();
            res.status(500);
            resposta = { response: "Erro ao Atualizar Dados de Planejamento de Movimentação", arOcorre: arOcorre };
          }
        }
      }
      res.json(resposta);
    } catch (error) {
      res.status(500);
      resposta = { response: "Erro ao Atualizar Dados de Planejamento de Movimentação", arOcorre: arOcorre };
      res.json(resposta);
    }
  }


  return api;
};
