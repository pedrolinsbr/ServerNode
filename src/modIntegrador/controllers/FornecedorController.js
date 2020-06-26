module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.FornecedorDAO;

  /**
  * Lista todos os itens da tabela.
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next -
  * @return {json} result - Retorna um objeto JSON.
  */
  api.listarFornecedor = async function (req, res, next) {
    await dao.listarFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
  * Envia os itens para o DAO salvar na tabela
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next -
  * @return {json} result - Retorna um objeto JSON.
  */
  api.salvarFornecedor = async function (req, res, next) {
    await dao.salvarFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
  * Requisita ao objeto DAO um determinado resultado apartir de uma busca
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next -
  * @return {json} result - Retorna um objeto JSON.
  */
  api.buscarFornecedor = async function (req, res, next) {
    await dao.buscarFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
  * Atualiza informações de um determinado registro apartir de seu id
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next -
  * @return {json} result - Retorna um objeto JSON.
  */
  api.atualizarFornecedor = async function (req, res, next) {
    await dao.atualizarFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
  * Envia ao DAO uma requisição de apagar determinado objeto apartir de um id
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next -
  * @return {json} result - Retorna um objeto JSON.
  */
  api.excluirFornecedor = async function (req, res, next) {
    await dao.excluirFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza a busca de contatos cadastrados para o fornecedor
		*
		* @async 
		* @function listarContatos
    * @param {Object} req Contém os dados da pesquisa
		* @returns {Object} Campos de retorno da pesquisa
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */

  api.listarContatosFornecedor = async function (req, res, next) {
    await dao.listarContatosFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }


  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza a busca de contatos_fornecedor por ID do contatos_fornecedor
		*
		* @async 
		* @function buscarContato
    * @param {Object} req Contém os dados da pesquisa
		* @returns {Object} Campos com o retorno da pesquisa
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */

  api.buscarContatoFornecedor = async function (req, res, next) {
    await dao.buscarContatoFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\
  /**
    * @description Realiza o cadastro de um contato do fornecedor
    *
    * @async 
    * @function salvarContato
    * @param {Object} req Contém os dados para a inclusão
    * @returns {Object} Retorna um objeto com o id do novo contato cadastrado
    *
    * @author Ítalo Andrade Oliveira
    * @since 12/07/2018
  */
  api.salvarContatoFornecedor = async function (req, res, next) {
    await dao.salvarContatoFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\
  /**
    * @description Realiza a atualização dos dados através do id do contatos_fornecedor
    *
    * @async 
    * @function atualizarContato
    * @param {Object} req Contém os dados para atualização do contato
    * @returns {Object} Retorna um objeto com a response, contendo a mensagem de sucesso
    *
    * @author Ítalo Andrade Oliveira
    * @since 12/07/2018
  */
  api.atualizarContatoFornecedor = async function (req, res, next) {
    await dao.atualizarContatoFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\
  /**
    * @description Realiza o delete em um contatos_fornecedor
    *
    * @async 
    * @function excluirContato
    * @param {Object} req Contém os dados para exclusão do contato
    * @returns {boolean} Indicando a exclusão foi realizada com sucesso 
    *
    * @author Ítalo Andrade Oliveira
    * @since 13/07/2018
  */
  api.excluirContatoFornecedor = async function (req, res, next) {
    await dao.excluirContatoFornecedor(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  return api;
};
