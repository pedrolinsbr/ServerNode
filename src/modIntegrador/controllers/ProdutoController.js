module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.ProdutoDAO;

  /**
   * @description Lista todos os dados da tabela G010.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarProduto = async function (req, res, next) {
    await dao.listarProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
   * @description Salva um dado na tabela G010.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvarProduto = async function (req, res, next) {
    
    await dao.salvarProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
   * @description Busca um dado da tabela G010.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarProduto = async function (req, res, next) {

    await dao.buscarProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
   * @description Atualiza um dado da tabela G010.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarProduto = async function (req, res, next) {
    await dao.atualizarProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
   * @description Exclui um dado da tabela G010.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirProduto = async function (req, res, next) {
    await dao.excluirProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEmbalagensProduto = async function (req, res, next) {
    await dao.buscarEmbalagensProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarEmbalagensProduto = async function (req, res, next) {
    await dao.salvarEmbalagensProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarRelacaoEmbalagemProduto = async function (req, res, next) {
    await dao.salvarRelacaoEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizarRelacaoEmbalagemProduto = async function (req, res, next) {
    await dao.atualizarRelacaoEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.listarRelacaoEmbalagemProduto = async function (req, res, next) {
    await dao.listarRelacaoEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  api.buscarEmbalagemProduto = async function (req, res, next) {
    await dao.buscarEmbalagemProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.verificaEmbPad = async function (req, res, next) {
    await dao.verificaEmbPad(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.alteraEmbPad = async function (req, res, next) {
    await dao.alteraEmbPad(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };



  return api;
};
