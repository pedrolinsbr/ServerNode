/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G003.
*/

/**
 * @module dao/Fornecedor
 * @description Função para realizar o CRUD da tabela G005.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Fornecedor
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;

  //-----------------------------------------------------------------------\\
	/**
		* @description Lista Todos os Fornecedores
		*
		* @async 
		* @function listar
		* @param {Object} req
		* @returns {Array} Retorna um array com o resultado da pesquisa 
		*
		* @author Ítalo Andrade Oliveira
		* @since 11/07/2018
  */
  api.listarFornecedor = async function (req, res, next) {

    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G034', true);

    let sql = `SELECT 
                G034.IDG034,
                G034.NMFORNEC,
                G034.RSFORNEC,
                G034.TPPESSOA,
                G034.CJFORNEC,
                G034.IEFORNEC,
                G034.IMFORNEC,
                G034.DSENDERE,
                G034.NRENDERE,
                G034.DSCOMEND,
                G034.BIENDERE,
                G034.CPENDERE,
                G034.STCADAST,
                TO_CHAR(G034.DTCADAST, 'DD/MM/YYYY') DTCADAST,
                G034.IDS001,
                G034.SNDELETE,
                G034.IDG036,
                G036.DSGRUFOR AS G036_DSGRUFOR,
                G034.IDG003,
                G003.NMCIDADE AS G003_NMCIDADE,
                COUNT(G034.IDG034) OVER () AS COUNT_LINHA
              FROM G034 
              INNER JOIN G003 ON
                  G034.IDG003 = G003.IDG003
              INNER JOIN G036 ON
                G034.IDG036 = G036.IDG036`+
      sqlWhere +
      sqlOrder +
      sqlPaginate;

    return await db.execute(
      {
        sql,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result, null, 4, 4));
      })
      .catch((err) => {
        throw err;
      });
  };

  //-----------------------------------------------------------------------\\
	/**
		* @description Busca um Fornecedor por ID
		*
		* @async 
		* @function buscar
		* @param {Object} req
		* @returns {Object} Retorna um objeto contendo os dados do Fornecedor 
		*
		* @author Ítalo Andrade Oliveira
		* @since 11/07/2018
  */
  api.buscarFornecedor = async function (req, res, next) {

    let sql = `SELECT 
                G034.IDG034,
                G034.NMFORNEC,
                G034.RSFORNEC,
                G034.TPPESSOA,
                G034.CJFORNEC,
                G034.IEFORNEC,
                G034.IMFORNEC,
                G034.DSENDERE,
                G034.NRENDERE,
                G034.DSCOMEND,
                G034.BIENDERE,
                G034.CPENDERE,
                G034.STCADAST,
                TO_CHAR(G034.DTCADAST, 'DD/MM/YYYY') DTCADAST,
                G034.IDS001,
                G034.SNDELETE,
                G034.IDG036,
                G036.DSGRUFOR AS G036_DSGRUFOR,
                G034.IDG003,
                G003.NMCIDADE AS G003_NMCIDADE
              FROM G034
                INNER JOIN G003 ON
                  G034.IDG003 = G003.IDG003
                INNER JOIN G036 ON
                  G034.IDG036 = G036.IDG036
              WHERE G034.IDG034 = ${req.params.id}`;
    return await db.execute(
      {
        sql,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result, null, 4, 4))
      })
      .catch((err) => {
        throw err;
      });
  };

  //-----------------------------------------------------------------------\\
	/**
		* @description Salva um novo fornecedor
		*
		* @async 
		* @function salvar
		* @param {Object} req
		* @returns {Object} Retorna um objeto com o elemento ID, indicando o ID do item incluso 
		*
		* @author Ítalo Andrade Oliveira
		* @since 11/07/2018
  */
  api.salvarFornecedor = async function (req, res, next) {

    let colunas = {
      NMFORNEC: req.body.NMFORNEC,
      RSFORNEC: req.body.RSFORNEC,
      TPPESSOA: req.body.TPPESSOA,
      CJFORNEC: req.body.CJFORNEC,
      IEFORNEC: req.body.IEFORNEC,
      IMFORNEC: req.body.IMFORNEC,
      DSENDERE: req.body.DSENDERE,
      NRENDERE: req.body.NRENDERE,
      DSCOMEND: req.body.DSCOMEND,
      BIENDERE: req.body.BIENDERE,
      CPENDERE: req.body.CPENDERE,
      IDG003: req.body.IDG003,
      STCADAST: req.body.STCADAST,
      DTCADAST: new Date(),
      IDS001: req.body.IDS001,
      SNDELETE: req.body.SNDELETE,
      IDG036: req.body.IDG036,
      SNDELETE: 0
    }

    return await db.insert({
      tabela: `G034`,
      colunas: colunas,
      key: `G034.IDG034`
    })
      .then((result) => {
        return { id: result };
      })
      .catch((err) => {
        throw err;
      });
  };

  //-----------------------------------------------------------------------\\
	/**
		* @description Atualiza um fornecedor
		*
		* @async 
		* @function atualizar
    * @param {Object} req Campos do fornecedor que serão alterados
    * @param {Integer} req.params Id do fornecedor que deve alterar
		* @returns {Object} Indicando a alteração feita no fornecedor 
		*
		* @author Ítalo Andrade Oliveira
		* @since 11/07/2018
  */
  api.atualizarFornecedor = async function (req, res, next) {

    let id = req.params.id;
    let colunas = {
      NMFORNEC: req.body.NMFORNEC,
      RSFORNEC: req.body.RSFORNEC,
      TPPESSOA: req.body.TPPESSOA,
      CJFORNEC: req.body.CJFORNEC,
      IEFORNEC: req.body.IEFORNEC,
      IMFORNEC: req.body.IMFORNEC,
      DSENDERE: req.body.DSENDERE,
      NRENDERE: req.body.NRENDERE,
      DSCOMEND: req.body.DSCOMEND,
      BIENDERE: req.body.BIENDERE,
      CPENDERE: req.body.CPENDERE,
      IDG003: req.body.IDG003,
      STCADAST: req.body.STCADAST,
      IDS001: req.body.IDS001,
      SNDELETE: req.body.SNDELETE,
      IDG036: req.body.IDG036,
      SNDELETE: 0
    }

    return await db.update({
      tabela: `G034`,
      colunas: colunas,
      condicoes: `G034.IDG034 = :id`,
      parametros: {
        id: id
      }
    })
      .then((result) => {
        return { response: 'Cadastro do Fornecedor atualizado com sucesso' };
      })
      .catch((err) => {
        throw err;
      });
  };

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza o softdelete em um fornecedor
		*
		* @async 
		* @function excluir
    * @param {Integer} req.params Id do fornecedor que deve alterar
		* @returns {boolean} Indicando a exclusão foi realizada com sucesso 
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */

  api.excluirFornecedor = async function (req, res, next) {
    let id = req.params.id;

    return await db.update({
      tabela: `G034`,
      colunas: {
        SNDELETE: 1
      },
      condicoes: `G034.IDG034 = :id`,
      parametros: {
        id: id
      }
    })
      .then((result) => {
        return true
      })
      .catch((err) => {
        throw err;
      });
  };

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza a busca de contatos cadastrados para o fornecedor
		*
		* @async 
		* @function listarContatos
    * @param {Integer} req.params Id do fornecedor que deve buscar os contatos
		* @returns {Object} Campos com o retorno da pesquisa
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */

  api.listarContatosFornecedor = async function (req, res, next) {

    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G035', false);

    let sql = `
                SELECT 
                  G035.IDG035,
                  G035.IDG034,
                  G035.IDG007,
                  G007.NMCONTAT  G007_NMCONTAT,
                  G007.DTNASCIM  G007_DTNASCIM,
                  G008.DSCONTAT AS G008_DSCONTAT,
                  TO_CHAR(G007.DTCADAST, 'DD/MM/YYYY') G007_DTCADAST,
                  G034.NMFORNEC G034_NMFORNEC,
                  G034.TPPESSOA G034_TPPESSOA,
                  G034.CJFORNEC G034_CJFORNEC,
                  COUNT(G035.IDG035) OVER () AS COUNT_LINHA
                FROM G035
                INNER JOIN G034 ON
                  G035.IDG034 = G034.IDG034
                INNER JOIN G007 ON
                  G035.IDG007 = G007.IDG007
                INNER JOIN G008 ON
                  G007.IDG007 = G008.IDG007
              `
      + sqlWhere
      + sqlOrder
      + sqlPaginate;

    return await db.execute({
      sql,
      param: bindValues
    })
      .then(result => {
        return (utils.construirObjetoRetornoBD(result, null, 4, 4));
      })
      .catch(err => {
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza a busca de contatos_fornecedor por ID do contatos_fornecedor
		*
		* @async 
		* @function buscarContato
    * @param {Integer} req.params Id da tabela de contatos_fornecedor
		* @returns {Object} Campos com o retorno da pesquisa
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */

  api.buscarContatoFornecedor = async function (req, res, next) {

    let sql = `
              SELECT 
                G035.IDG035,
                G035.IDG007,
                G035.IDG034
              FROM G035
              WHERE G035.IDG035 = ${req.params.id}`;

    return await db.execute({
      sql: sql,
      param: []
    })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result, null, 4, 4));
      })
      .catch((err) => {
        throw err;
      })
  }

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza o cadastro de um contato do fornecedor
		*
		* @async 
		* @function salvarContato
    * @param {Object} req.body Contém os dados a serem incluidos
		* @returns {Object} Retorna um objeto com o id do novo contato cadastrado
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */
  api.salvarContatoFornecedor = async function (req, res, next) {

    let colunas = {
      IDG034: req.body.IDG034,
      IDG007: req.body.IDG007
    };

    return await db.insert({
      tabela: 'G035',
      colunas: colunas,
      key: `G035.IDG035`
    })
      .then((result) => {
        return { id: result }
      })
      .catch((err) => {
        throw err;
      })
  }

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza a atualização dos dados através do id do contatos_fornecedor
		*
		* @async 
    * @function atualizarContato
    * @param {Integer} req.params Contém o id para a condição do Where
    * @param {Object} req.body Contém os dados a serem alterados
		* @returns {Object} Retorna um objeto com a response, contendo a mensagem de sucesso
		*
		* @author Ítalo Andrade Oliveira
		* @since 12/07/2018
  */
  api.atualizarContatoFornecedor = async function (req, res, next) {

    let colunas = {
      IDG034: req.body.IDG034,
      IDG007: req.body.IDG007
    }

    return await db.update({
      tabela: `G035`,
      colunas: colunas,
      condicoes: `WHERE G035.IDG035 = :id`,
      parametros: {
        id: req.params.id
      }
    })
      .then((result) => {
        return { response: 'Contato Atualizado com sucesso' }
      })
      .catch((err) => {
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza o delete em um contatos_fornecedor
		*
		* @async 
		* @function excluirContato
    * @param {Integer} req.params Id do contatos_fornecedor que deve excluir
		* @returns {boolean} Indicando a exclusão foi realizada com sucesso 
		*
		* @author Ítalo Andrade Oliveira
		* @since 13/07/2018
  */
  api.excluirContatoFornecedor = async function (req, res, next) {

    let sql = `DELETE 
              FROM G035
              WHERE IDG035=${req.params.id}`;

    return await db.execute({
      sql: sql,
      param: []
    })
      .then((result) => {
        return true;
      })
      .catch((err) => {
        throw err;
      })

  }

  return api;
};
