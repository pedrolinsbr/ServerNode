module.exports = function (app, cb) {

  var api = {};
  var db = require(process.cwd() + '/config/database');
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;

  const gdao = app.src.modGlobal.dao.GenericDAO;

  /**
   * @description Lista todos os motivos na grid
   *
   * @async
   * @function listarMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.listarMotivos = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'I015',true);


      let result = await con.execute(
        {
          sql: ` SELECT I015.IDI015,
                        I015.DSOCORRE,
                        LISTAGG(I018.DSGRUMOT, '; ') WITHIN GROUP (ORDER BY I018.DSGRUMOT) DSGRUMOT
                   FROM I019 I019
                   JOIN I015 I015 ON I015.IDI015 = I019.IDI015
                   JOIN I018 I018 ON I018.IDI018 = I019.IDI018
                        ${sqlWhere}
                    AND I019.SNDELETE = 0
               GROUP BY I015.IDI015,
                        I015.DSOCORRE`+
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          throw err;
        });

      await con.close();
      return result;

    } catch (err) {

      await con.closeRollback();
      throw err;

    }
  };

  /**
   * @description Busca um motivo por Id
   *
   * @async
   * @function buscarMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015 ID do motivo
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.buscarMotivos = async function (req, res, next) {
    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDI015;

      let result = await con.execute(
      {
        sql: ` Select I015.IDI015,
                      I015.DSOCORRE
                 From I015 I015
                Where I015.IDI015   = : id
                  And I015.SNDELETE = 0`,
        param: {
          id: id
        }
      })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
      
      await con.close();
      return result;
    
    } catch (err) {

      await con.closeRollback();
      throw err;
    }
  };

  /**
   * @description Salva um motivo na tabela I015
   *
   * @async
   * @function salvarMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.salvarMotivos = async function (req, res, next) {

    let result = await req.objConn.insert({
      tabela: 'I015',
      colunas: {

        DSOCORRE: req.body.DSOCORRE,

      },
      key: 'IDI015'
    })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      throw err;
    });

    return result;
  };

  /**
   * @description Atualiza os dados de um motivo
   *
   * @async
   * @function atualizarMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015 ID do motivo
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.atualizarMotivos = async function (req, res, next) {

    var id = req.body.IDI015;

    let result = await req.objConn.update({
      tabela: 'I015',
      colunas: {

        DSOCORRE: req.body.DSOCORRE,

      },
      condicoes: 'IDI015 = :id',
      parametros: {
        id: id
      }
    }).then((result) => {
      return result;

    }).catch((err) => {
      throw err;
    });

    return result;
  };

  /**
   * @description Exclui motivos e seus relacionamentos em cascata
   *
   * @async
   * @function excluirMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Array}  req.body.IDI015 ID do motivo
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.excluirMotivos = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {
 
      var ids = req.body.IDI015;  

      let result = await con.update({
        tabela: 'I015',
        colunas: {
          SNDELETE: 1
        },
        condicoes: ` IDI015 in (`+ids+`)`

      }).then((result) => {
        return result;
      }).catch((err) => {
        throw err;
      });

      if (result) {
        let resultGruMot = await con.update({
          tabela: 'I019',
          colunas: {
            SNDELETE: 1
          },
          condicoes: ` IDI015 in (`+ids+`)`

        }).then((result) => {
          return { response: req.__('it.sucesso.delete') };
        }).catch((err) => {
          throw err;
        });

        await con.close();
        return resultGruMot;

      } else {
        await con.closeRollback();
        res.status(400).send({armensag: req.__('it.erro.delete')});
      }

    } catch (err) {
      await con.closeRollback();
      throw err;
    }
  };

  /*
   * ########## CRUD GRUPO MOTIVOS ##########
   */

  /**
   * @description Adiciona grupo motivos ao motivo pela tabela I019
   *
   * @async
   * @function salvarGrupoMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.salvarGrupoMotivos = async function (req, res, next) {

    try {

      var arCampos  = ['IDI018', 'IDI015'];
      var arValores = [];

      var sql = `INSERT INTO I019 (${arCampos.join()}) \n`;

      sql += 'WITH input_values AS ( \n';

      for (var id of req.body[arCampos[0]]) {

          var strValor = `SELECT ${id.idi018} ${arCampos[0]}, ${req.body[arCampos[1]]} ${arCampos[1]} FROM DUAL`;
          arValores.push(strValor);

      } 

      sql += arValores.join(' UNION ALL \n');

      sql += `) SELECT * FROM input_values`;

      req.sql = sql;

      let result = await gdao.executar(req, res, next)
        .then((result) => {
          return { response: req.__('it.sucesso.insert') };
        })
        .catch((err) => {
          throw err;
        });

      return result;

    } catch (err) {

        throw err;

    }

  };

  /**
   * @description Busca grupo motivos referentes ao motivo por Id do motivo
   *
   * @async
   * @function buscarGrupoMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.buscarGrupoMotivos = async function (req, res, next) {
    let con = await this.controller.getConnection();

    try {

      var id = req.body.IDI015;

      let result = await con.execute(
      {
        sql: ` Select I018.IDI018 As id,
                      I018.IDI018 ||' - '|| I018.DSGRUMOT As text 
                 From I018 I018
                 Join I019 I019 On I019.IDI018 = I018.IDI018
                Where I019.IDI015   = : id
                  And I019.SNDELETE = 0`,
        param: {
          id: id
        }
      })
      .then((result) => {
        return utils.array_change_key_case(result);
      })
      .catch((err) => {
        throw err;
      });
      
      await con.close();
      return result;
    
    } catch (err) {

      await con.closeRollback();
      throw err;
    }
  };

  /**
   * @description Lista todos grupo motivos referentes ao motivo por Id do motivo
   *
   * @async
   * @function listarGrupoMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.listarGrupoMotivos = async function (req, res, next) {

    var id = req.body.IDI015;

    let result = await req.objConn.execute(
    {
      sql: ` Select I019.IDI018,
                    I019.IDI015
               From I019 I019
              Where I019.IDI015 = : id
           Order By I019.IDI018`,
      param: {
        id: id
      }
    })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      throw err;
    });

    return result;
  };

  /**
   * @description Atualiza o relacionamento entre grupo motivos e motivo por Id do motivo
   *
   * @async
   * @function atualizarGrupoMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015
   * @param {Array}  req.grupoMotivosAtualizar
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.atualizarGrupoMotivos = async function (req, res, next) {

    var idi015 = req.body.IDI015;
    var idi018 = req.grupoMotivosAtualizar;

    let result = await req.objConn.update({
      tabela: 'I019',
      colunas: {

        SNDELETE: 0,

      },
      condicoes: `IDI015 = :idi015 and IDI018 in (${idi018.join()})`,
      parametros: {
        idi015: idi015
      }
    }).then((result) => {
      return result;

    }).catch((err) => {
      throw err;
    });

    return result;
  };

  /**
   * @description Exclui o relacionamento entre grupo motivos e motivo por Id do motivo
   *
   * @async
   * @function buscarGrupoMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015
   * @param {Array}  req.body.grupoMotivosExcluir
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.excluirGrupoMotivos = async function (req, res, next) {

    var idi015 = req.body.IDI015;
    var idi018 = req.grupoMotivosExcluir;

    let result = await req.objConn.update({
      tabela: 'I019',
      colunas: {

        SNDELETE: 1,

      },
      condicoes: `IDI015 = :idi015 and IDI018 in (${idi018.join()})`,
      parametros: {
        idi015: idi015
      }
    }).then((result) => {
      return result;

    }).catch((err) => {
      throw err;
    });

    return result;
  };

  return api;
};
