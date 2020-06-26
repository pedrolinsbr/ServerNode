module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.ClienteDAO;

  api.listar = async function (req, res, next) {
    await dao.listar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.listarBusca = async function (req, res, next) {
    await dao.listarBusca(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvar = async function (req, res, next) {
    await dao.salvar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.getClienteByCj = async function (req, res, next) {
    console.log("getClienteByCj ")
    await dao.getClienteByCj(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizar = async function (req, res, next) {
    await dao.atualizar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarPermissaoEmail = async function (req, res, next) {
    await dao.atualizarPermissaoEmail(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluir = async function (req, res, next) {
    await dao.excluir(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.operacoesCliente = async function (req, res, next) {
    await dao.operacoesCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
  * @author Filipe Freitas Tozze
  * @since 29/11/2017
  * @description Função para validar se o CNPJ e IE do parceiro existe. Caso existir retorna o id do cadastro
  * @param {parameter} params - Espera params.cjparcei (CNPJ do parceiro) e params.ieparcei (I.E do parceiro).
  * @function fn/validaParceiro
  *
  * @return {JSON} Retorna um objeto JSON.
  **/
  api.validaParceiro = async function (req, res, next) {

    var objReturn = {};

    objReturn.result = '';

    if (typeof req.cjparcei == 'undefined' || typeof req.ieparcei == 'undefined') {

      objReturn.msgReturn = 'CNPJ e I.E do parceiro são obrigatórios';

      return objReturn;
    }

    await dao.buscaParceiro(req, res, next)
      .then((result) => {
        if (Object.keys(result).length > 0) {
          objReturn.result = result;
        } else {
          objReturn.msgReturn = 'CNPJ e I.E do parceiro não encontrados';
          objReturn.result = '';
        }
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    return objReturn;    
  }

  api.buscaIndustriasCliente = async function (req, res, next) {
    await dao.buscaIndustriasCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

   api.saveIndustriasCliente = async function (req, res, next) {

    await dao.saveIndustriasCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
      
  };

  api.listarClientesContatos = async function (req, res, next) {

    await dao.listarClientesContatos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };

  api.salvarOperacao = async function (req, res, next) {
        
    await dao.salvarOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  
  api.buscarOperacao = async function (req, res, next) {
    
    await dao.buscarOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };

  api.updateOperacao = async function (req, res, next) {
    
    await dao.updateOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };

  api.excluirOperacao = async function (req, res, next) {
        
    await dao.excluirOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };

  api.buscarClientesOperacao = async function (req, res, next) {

    await dao.buscarClientesOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };





  api.insertContatosExcel = async function (req, res, next) {
    
    await dao.insertContatosExcel(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };


  api.listarClientesV2 = async function (req, res, next) {
    await dao.listarClientesV2(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.UpdateClientesExcel = async function (req, res, next) {

    await dao.UpdateClientesExcel(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

  };

  return api;
};
