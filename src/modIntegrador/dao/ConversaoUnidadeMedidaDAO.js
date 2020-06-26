/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G016.
 * @author Yusha Mariak Miranda Silva
 * @since 25/10/2017
*/

/** 
 * @module dao/ConversaoUnidadeMedida
 * @description Função para realizar o CRUD da tabela G016.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/ConversaoUnidadeMedida
*/
module.exports = function (app, cb) {

  var api = {};
  api.controller = app.config.ControllerBD;
  var db = app.config.database;
  var utils = app.src.utils.FuncoesObjDB;

  /**
   * @description Contém o SQL que requisita os dados da tabela G013.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarConversaoUnidMed = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    try{
    var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G013',true);
    
      
       let sql = ` SELECT 
                        G013.IDG013 as "G013_IDG013", 
                        G013.IDG010 as "G013_IDG010", 
                        G013.IDG009OR as "G013_IDG009OR", 
                        G013.IDG009DE as "G013_IDG009DE",
                        G013.TPCONVERT as "G013_TPCONVERT", 
                        G013.VRFATCON as "G013_VRFATCON", 
                        G013.STCADAST as "G013_STCADAST",
                        (DE.CDUNIDAD||' - '||DE.DSUNIDAD) AS "DE_DSUNIDADDE",
                        (ORE.CDUNIDAD||' - '||ORE.DSUNIDAD) AS "ORE_DSUNIADOR"
                  FROM G013
                  INNER JOIN G009  DE
                  ON (DE.IDG009 = G013.IDG009DE)
                  INNER JOIN G009  ORE
                  ON (ORE.IDG009 = G013.IDG009OR)
              ${sqlWhere} `;
              
      let resultCount = await con.execute(
        {	
          sql: ` select count(x.G013_IDG013) as QTD from (` + sql + `) x `,
          param: bindValues
        })

      .then((result) => {
        return result[0];
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
      });
      let result = await con.execute(

				{
					sql: sql +
						sqlOrder +
						sqlPaginate,
					param: bindValues
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
      });
      if (result && result != null && result.length > 0) {
				result[0].COUNT_LINHA = resultCount.QTD;
			}
		
		result = (utils.construirObjetoRetornoBD(result));

		await con.close();
		return result;
		}catch (err) {
					
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;

		}
  };

  /**
   * @description Insere um dado na tabela G013.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvarConversaoUnidMed = async function (req, res, next) {
    return await db.insert({
      tabela: 'G013',
      colunas: {
        IDG010: req.body.IDG010,
        IDG009OR: req.body.IDG009OR,
        IDG009DE: req.body.IDG009DE,
        VRFATCON: req.body.VRFATCON,
        STCADAST: req.body.STCADAST,
        DTCADAST: new Date()

      },
      key: 'IDG013'
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Busca um dado na tabela G013.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarConversaoUnidMed = async function (req, res, next) {
    return await db.execute({
      sql: `SELECT 
                    G013.IDG013, 
                    G013.IDG010, 
                    G013.IDG009DE, 
                    G013.IDG009OR,
                    G013.TPCONVERT, 
                    G013.VRFATCON,
                    G013.DTCADAST, 
                    G013.STCADAST,
                    DE.CDUNIDAD as "DE_CDUNIDAD",
                    ORE.CDUNIDAD as "ORE_CDUNIDAD",
                    DE.DSUNIDAD as "G013_DSUNIDADDE",
                    ORE.DSUNIDAD as "G013_DSUNIDADOR"
              FROM  G013 G013
              INNER JOIN G009  DE
              ON (DE.IDG009 = G013.IDG009DE)
              INNER JOIN G009  ORE
              ON (ORE.IDG009 = G013.IDG009OR)
              WHERE G013.SNDELETE = 0
                AND G013.IDG013 = ${req.params.id}`,
      param: [],
    }).then((result) => {
      return (result);
    }).catch((err) => {
      throw err;
    });
  };

  /**
   * @description Exclui um dado na tabela G013.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirConversaoUnidMed = async function (req, res, next) {

    return await db.execute({
        sql: `UPDATE G013
              SET SNDELETE = 1
              WHERE IDG013 = ${req.params.id}`,
        param: [],
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Atualiza um dado da tabela G013.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarConversaoUnidMed = async function (req, res, next) {
    var id = req.params.id;

    return await
      db.update({
        tabela: 'G013',
        colunas: {
          IDG010: req.body.IDG010,
          IDG009OR: req.body.IDG009OR,
          IDG009DE: req.body.IDG009DE,
          TPCONVERT: req.body.TPCONVERT,
          VRFATCON: req.body.VRFATCON
        },
        condicoes: 'IdG013 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "Atualizado com sucesso." };
        })
        .catch((err) => {
          throw err;
        });
  };

  return api;
};
