module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.ContatoClienteDAO;

  api.listarContatoCliente = async function (req, res, next) {
    await dao.listarContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarContatoCliente = async function (req, res, next) {
    await dao.buscarContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarClienteContato = async function (req, res, next) {
    await dao.buscarClienteContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarContatoCliente = async function (req, res, next) {
    await dao.salvarContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarContatoCliente = async function (req, res, next) {
    await dao.atualizarContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluirContatoCliente = async function (req, res, next) {
    await dao.excluirContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.inserirClienteContato = async function (req, res, next) {
    await dao.inserirClienteContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.alterarClienteContato = async function (req, res, next) {
    await dao.alterarClienteContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscaInfoClienteContato = async function (req, res, next) {
    await dao.buscaInfoClienteContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.removerClienteContato = async function (req, res, next) {
    await dao.removerClienteContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
