module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modMonitoria.dao.CidadeDAO;

  api.excluirMunipiosSelecionados = async function (req, res, next) {
    await dao.excluirMunipiosSelecionados(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.excluir = async function (req, res, next) {
    await dao.excluir(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvar = async function (req, res, next) {
    await dao.salvar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizar = async function (req, res, next) {
    await dao.atualizar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listar = async function (req, res, next) {
    await dao.listar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.listarDemoNotas = async function (req, res, next) {
    res.json(
      {
        "data": [
          {
            "NF": 123,
            "EMISSAO": "04/04/2018 14:00:00",
            "EMISSOR": "Syngenta",
            "DEST": "Syngenta",
            "TRANS": "Bravo"
          },
          {
            "NF": 124,
            "EMISSAO": "05/04/2018 15:00:00",
            "EMISSOR": "Syngenta",
            "DEST": "Syngenta",
            "TRANS": "Bravo"
          },
          {
            "NF": 125,
            "EMISSAO": "06/04/2018 16:00:00",
            "EMISSOR": "Syngenta",
            "DEST": "Syngenta",
            "TRANS": "Bravo"
          }
        
        ], "draw": "null", "recordsFiltered": 1, "recordsTotal": 10
      });
  };
  
  api.listarDemoNotasCarga = async function (req, res, next) {
    res.json(
      {
        "data": [
          {
            "CODE": 123,
            "CTE": 123,
            "EMISSOR": "Syngenta",
            "DESTINATARIO": "Syngenta",
            "TOMADOR": "Syngenta",
            "VLNOTA": "R$ 1.000,00",
            "DTEMISSAO": "01/01/2018 10:40:32"
          },
          {
            "CODE": 124,
            "CTE": 124,
            "EMISSOR": "Syngenta",
            "DESTINATARIO": "Syngenta",
            "TOMADOR": "Syngenta",
            "VLNOTA": "R$ 1.000,00",
            "DTEMISSAO": "01/01/2018 10:40:32"
          },
          {
            "CODE": 125,
            "CTE": 125,
            "EMISSOR": "Syngenta",
            "DESTINATARIO": "Syngenta",
            "TOMADOR": "Syngenta",
            "VLNOTA": "R$ 1.000,00",
            "DTEMISSAO": "01/01/2018 10:40:32"
          }], "draw": "null", "recordsFiltered": 1, "recordsTotal": 10
      });
  };

  api.listarDemoNotasCTe = async function (req, res, next) {
    res.json(
      {
        "data": [
          {
            "CODE": 123,
            "CTE": 123,
            "EMISSOR": "Syngenta",
            "DESTINATARIO": "Syngenta",
            "TOMADOR": "Syngenta",
            "VLNOTA": "R$ 1.000,00",
            "DTEMISSAO": "01/01/2018 10:40:32"
          },
          {
            "CODE": 124,
            "CTE": 123,
            "EMISSOR": "Syngenta",
            "DESTINATARIO": "Syngenta",
            "TOMADOR": "Syngenta",
            "VLNOTA": "R$ 1.000,00",
            "DTEMISSAO": "01/01/2018 10:40:32"
          },
          {
            "CODE": 125,
            "CTE": 123,
            "EMISSOR": "Syngenta",
            "DESTINATARIO": "Syngenta",
            "TOMADOR": "Syngenta",
            "VLNOTA": "R$ 1.000,00",
            "DTEMISSAO": "01/01/2018 10:40:32"
          }], "draw": "null", "recordsFiltered": 1, "recordsTotal": 10
      });
  };

  api.listarDemoAtendimentos = async function (req, res, next) {
    res.json(
      {
        "data": [
          {
            "CODE": 123,
            "SOLIC": "Marcelo",
            "TPACAO": "Atendimento <i class='fas fa-comments' style='color: #4DADF7;'></i>",
            "TITLE": "Problema em relatório",
            "SITUA": "Finalizado",
            "TIME": "04:30:00",
            "DTABERTURA": "05/04/18 10:30",
            "DTFECHAMENTO": "05/04/18 15:00"
          },
          {
            "CODE": 124,
            "SOLIC": "Marcelo",
            "TPACAO": "Ocorrência <i class='fas fa-exclamation-triangle' style='color: red;'></i>",
            "TITLE": "Cliente não recebeu carga",
            "SITUA": "Pendente",
            "TIME": "04:30:00",
            "DTABERTURA": "05/04/18 09:30",
            "DTFECHAMENTO": ""
          },
          {
            "CODE": 125,
            "SOLIC": "Marcelo",
            "TPACAO": "Ocorrência <i class='fas fa-exclamation-triangle' style='color: red;'></i>",
            "TITLE": "Veículo em Manutenção",
            "SITUA": "Aberto",
            "TIME": "04:30:00",
            "DTABERTURA": "05/04/18 07:30",
            "DTFECHAMENTO": ""
          }], "draw": "null", "recordsFiltered": 1, "recordsTotal": 10
      });
  };

  return api;
};
