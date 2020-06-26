/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G003.
*/

/**
 * @module dao/Cliente
 * @description Função para realizar o CRUD da tabela G005.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Cliente
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var db = app.config.database;
  var acl = app.src.modIntegrador.controllers.FiltrosController;
  var logger = app.config.logger;
  const fs = require('fs');

  //Conexão V4
  api.controller = app.config.ControllerBD;

  var emailsClient = app.src.modIntegrador.dao;

  api.listar = async function (req, res, next) {


    //###############################################################################################################
    // tratativa do filtro Industria Rastreio, onde lista se está ou não com permissão quando houver apenas 1 cliente no filtro
    let snPermissaoIndustriaRastreio = '';
    let joinSnPermissaoIndustriaRastreio = '';
    let whereSnPermissaoIndustriaRastreio = '';
    let groupSnPermissaoIndustriaRastreio = '';
    let filterPermissaoRastreio = req.body['parameter[SNPERRAS]'];

    if (filterPermissaoRastreio == '') {
      filterPermissaoRastreio = '0,1';
    }

    if (typeof req.body['parameter[IDRESRAS][in][]'] != undefined && req.body['parameter[IDRESRAS][in][]'] != null) {
      let objWhereIndustriaRastreio = req.body['parameter[IDRESRAS][in][]'];

      if (typeof objWhereIndustriaRastreio == "string") {
        snPermissaoIndustriaRastreio = ` ,(
                                            Select 
                                              CASE
                                                WHEN Count(*) > 0 THEN 1
                                                Else 0
                                              END 
                                            From G077 G077S 
                                            Join G022 G022S On G022S.IDG022 = G077S.Idg022
                                            Where G077S.Idg005 = G005.Idg005 /*Valido o Cliente*/
                                                  And G022S.Idg005 = G051S.IDG005CO /*Valido a Industria*/
                                          ) As SNPERMIS `;


      }

      whereSnPermissaoIndustriaRastreio = `
                                              AND (
                                                    Select 
                                                      CASE
                                                        WHEN Count(*) > 0 THEN 1
                                                        Else 0
                                                      END 
                                                    From G077 G077S 
                                                    Join G022 G022S On G022S.IDG022 = G077S.Idg022
                                                    Where G077S.Idg005 = G005.Idg005 /*Valido o Cliente*/
                                                          And G022S.Idg005 = G051S.IDG005CO /*Valido a Industria*/
                                                  ) in (${filterPermissaoRastreio})
                                              `;

      joinSnPermissaoIndustriaRastreio = ` INNER JOIN G051 G051S
                                              ON G005.IDG005 = NVL(G051S.IDG005RC, G051S.IDG005DE)
                                             INNER JOIN G022 G022
                                              ON G022.IDG022 in (${objWhereIndustriaRastreio}) AND G022.IDG005 = G051S.IDG005CO  `;

      groupSnPermissaoIndustriaRastreio = ' ,G051S.IDG005CO ';

      delete req.body['parameter[IDRESRAS][in][]'];
    }

    //remove filtro de permissão de clientes com envio rastreio
    delete req.body['parameter[SNPERRAS]'];


    //###############################################################################################################
    // tratativa para atender filtro por operação
    // faz um busca antes pegando todos os consignatários dos cte vinculado com a operação passada pelo filtro

    let arrayClientePorOperacao = '';
    let whereClientePorOperacao = '';
    let objClienteOperac = '';

    if (typeof req.body['parameter[IDOPERACAO][id]'] != undefined && req.body['parameter[IDOPERACAO][id]'] != null) {

      let idOperacaoIndustria = req.body['parameter[IDOPERACAO][id]'];

      await db.execute(
        {
          sql: ` SELECT DISTINCT G005.IDG005 FROM G051 G051
                  JOIN G022 G022 ON G022.IDG005 = G051.IDG005CO
                  JOIN G005 G005 ON G005.IDG005 = G022.IDG005
                  WHERE G022.IDG014 = ${idOperacaoIndustria}`,
          param: []
        })
        .then((result) => {
          objClienteOperac = result;
          return objClienteOperac;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      if (objClienteOperac != '') {

        arrayClientePorOperacao = objClienteOperac.map(function (item) {

          return item.IDG005;

        });

        whereClientePorOperacao = ` And G005.IDG005 in (${arrayClientePorOperacao}) `;

        // remove o parametro IDOPERACAO para não dar bind de where na função abaixo

        delete req.body['parameter[IDOPERACAO][id]'];
        delete req.body['parameter[IDOPERACAO][text]'];
        delete req.body['parameter[IDOPERACAO][dsoperac]'];
      }
    }
    //###############################################################################################################
    // tratativa para filtrar contatos que estão ou não marcado para receber rastreamento

    let whereSnEnvia = '';

    if (typeof req.body['parameter[SNENVRAS]'] != undefined && req.body['parameter[SNENVRAS]'] != null) {

      if (req.body['parameter[SNENVRAS]'] == '1') {

        // se filtrar somente os que são marcado para enviar rastreio
        whereSnEnvia = ` And Exists (Select * From G077 G077 WHERE G077.IDG005 = G005.IDG005)  `;

        // remove o parametro SNENVRAS para não dar bind de where na função abaixo
        delete req.body['parameter[SNENVRAS]'];

      } else if (req.body['parameter[SNENVRAS]'] == '0') {

        // se filtrar somente os que não é marcado para enviar rastreio
        whereSnEnvia = ` And Not Exists (Select * From G077 G077 WHERE G077.IDG005 = G005.IDG005)  `;

        // remove o parametro SNENVRAS para não dar bind de where na função abaixo
        delete req.body['parameter[SNENVRAS]'];

      } else {

        delete req.body['parameter[SNENVRAS]'];

      }
    }

    //###############################################################################################################
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G005', true);
    sqlWhere = sqlWhere + ` And G005.NMCLIENT != '.' `;

    let sqlWhereAcl = '';
    let sqlJoinAcl = '';
    let sqlCountAcl = ' COUNT(G005.IDG005) OVER () AS COUNT_LINHA, ';

    if (req.body.ACL != null && req.body.ACL != '') {

      sqlWhereAcl = await acl.montar({

        ids001: req.UserId,
        dsmodulo: "monitoria",
        nmtabela: [{
          G014: 'G014'

        }],

        esoperad: 'And'

      });

      if (sqlWhereAcl != '') {

        sqlJoinAcl = `
          Join G051 G051
            On (G051.IdG005DE = G005.IdG005)
          Join G022 G022
            On (G022.IdG005 = G051.IdG005CO)
          Join G014 G014
            On (G014.IdG014 = G022.IdG014)`;

        sqlCountAcl = `
          COUNT(G051.IDG005DE) OVER () AS COUNT_LINHA,
        `;
      }
    }

    return await db.execute({
      sql: `SELECT Distinct 
                    G005.IDG005,
                    G005.IDG003,
                    G005.IDS001,
                    G005.IDG040,
                    LTRIM(G005.NMCLIENT) as NMCLIENT,
                    G005.RSCLIENT,
                    G005.TPPESSOA,
                    G005.CJCLIENT,
                    G005.IECLIENT,
                    G005.IMCLIENT,
                    G005.DSENDERE,
                    G005.NRENDERE,
                    G005.DSCOMEND,
                    G005.BIENDERE,
                    G005.CPENDERE,
                    G005.NRLATITU,
                    G005.NRLONGIT,
                    G005.STCADAST,
                    G005.SNDELETE,
                    G005.NRDEPART,
                    G005.NRSELLER,
                    G005.DSEMAIL,
                    TO_CHAR(G005.DTCADAST, 'DD/MM/YYYY') DTCADAST,

                    G022.IDCLIOPE,
                    G022.IDEMPOPE,
                    G022.DSSHIPOI,
                    G014.DSOPERAC,
                    G002.NMESTADO,

                    /*LISTAGG (G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT)
                    OVER (PARTITION BY G008.IDG007) AS DSCONTAT,*/

                    ${sqlCountAcl}

                    G003.NMCIDADE,
                    Nvl(G005.SNRASTRE,0) As SNRASTRE,
                    Nvl(G005.SNSATISF,0) As SNSATISF,
                    S001.NMUSUARI

                    ${snPermissaoIndustriaRastreio}

              FROM  G005
             Inner Join G003 G003 On (G003.IdG003 = G005.IdG003)
             Left Join G002 G002 On (G003.IdG002 = G002.IdG002)
             Inner Join S001 S001 On (S001.IdS001 = G005.IdS001)

             ${joinSnPermissaoIndustriaRastreio}

             Left Join G020 G020
                On (G020.IDG005 = G005.IDG005)

              LEFT JOIN G022 ON
                (G022.IDG005 = G005.IDG005 And G022.SNDELETE = 0) 
              LEFT JOIN G014 ON
                G014.IDG014 = G022.IDG014

              Left Join G007 G007
                On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0)
              Left Join G008 G008
                On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0)
              Left Join G006 G006
                ON (G006.IDG006 = G007.IDG006 AND G006.STCADAST = 'A')
              Left Join G039 G039
                ON (G039.IDG039 = G007.IDG039 AND G006.STCADAST = 'A') ` +
        sqlJoinAcl +
        sqlWhere +
        sqlWhereAcl +
        whereSnEnvia +
        whereClientePorOperacao +
        whereSnPermissaoIndustriaRastreio +
        ` 
                Group By G005.IDG005,G005.IDG003,G005.IDS001,G005.IDG040,G005.NMCLIENT,
                      G005.RSCLIENT,G005.TPPESSOA,G005.CJCLIENT,G005.IECLIENT,G005.IMCLIENT,
                      G005.DSENDERE,G005.NRENDERE,G005.DSCOMEND,G005.BIENDERE,G005.CPENDERE,
                      G005.NRLATITU,G005.NRLONGIT,G005.STCADAST,G005.SNDELETE,G005.NRDEPART,
                      G005.NRSELLER,G005.DSEMAIL,G005.DTCADAST,G003.NMCIDADE,G005.SNRASTRE,
                      G005.SNSATISF,G002.NMESTADO, /*G008.IDG007, G008.DSCONTAT,*/
                      
                      G022.IDCLIOPE,
                      G022.IDEMPOPE,
                      G022.DSSHIPOI,
                      G014.DSOPERAC,

                      S001.NMUSUARI

                      ${groupSnPermissaoIndustriaRastreio}
                ` +
        sqlOrder +
        sqlPaginate,
      param: bindValues
    })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result, null, 4, 4));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.listarBusca = async function (req, res, next) {

    if (req.params.busca.length < 3) {
      return;
    }

    return await db.execute({
      sql: `SELECT
                    G005.IDG005,
                    G005.NMCLIENT,
                    G005.CJCLIENT,
                    G005.DSEMAIL,
                    COUNT(G005.IDG005) OVER () AS COUNT_LINHA,

                    G003.NMCIDADE
              FROM  G005
              INNER JOIN G003
                ON G003.IDG003 = G005.IDG003
              WHERE G005.SNDELETE = 0
              AND G005.NMCLIENT LIKE '%` + req.params.busca.toUpperCase() + `%' AND ROWNUM <= 50`,
      param: []
    })
      .then((result) => {
        return (utils.nmClientesId(result, null, 4, 4));
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Busca um dado na tabela G005.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscar = async function (req, res, next) {

    var id = req.params.id;

    return await db.execute({
      sql: `SELECT
                      G005.IDG005,
                      G005.NMCLIENT,
                      G005.RSCLIENT,
                      G005.TPPESSOA,
                      G005.CJCLIENT,
                      G005.IECLIENT,
                      G005.IMCLIENT,
                      G005.DSENDERE,
                      G005.NRENDERE,
                      G005.DSCOMEND,
                      G005.BIENDERE,
                      G005.CPENDERE,
                      G005.IDG003,
                      G005.NRLATITU,
                      G005.NRLONGIT,
                      G005.STCADAST,
                      G005.DTCADAST,
                      G005.IDS001,
                      G005.STENVOTI,
                      G005.SNDELETE,
                      G005.NRDEPART,
                      G005.NRSELLER,
                      G003.NMCIDADE,
                      S001.NMUSUARI,
                      G005.IDG028,
                      G028.NMARMAZE,
                      G040.DSGRUCLI,
                      G005.IDG040,
                      G005.DSEMAIL,
                      G005.SNESPECI,
                      G003.NMCIDADE || ' - ' || G002.CDESTADO As NMCIDEST,
                      NVL(G005.SNENVRAS,'0') as SNENVRAS, /* HABILITA OU NÃO O ENVIO DO RASTREAMENTO PARA O CLIENTE, DEFAULT NÃO */
                      COUNT(G005.IDG005) OVER () AS COUNT_LINHA
                FROM  G005
                INNER JOIN G003
                  ON G003.IDG003 = G005.IDG003
                  Inner Join G002 G002 on G003.IDG002 = G002.IDG002
                INNER JOIN S001
                  ON S001.IDS001 = G005.IDS001
                LEFT JOIN G040
                  ON G040.IDG040 = G005.IDG040
                LEFT JOIN G028
                  ON G028.IDG028 = G005.IDG028
                WHERE G005.SNDELETE = 0
                  AND IDG005 =` + id,
      param: [],
    })
      .then((result) => {
        return (result[0]);
      })
      .catch((err) => {
        throw err;
      });
  };

  /**
   * @description Busca um dado na tabela G005.
   *
   * @async
   * @function api/getClienteByCj
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.getClienteByCj = async function (req, res, next) {

    var id = req.params.id;

    return await db.execute({
      sql: `SELECT
                    G005.IDG005,
                    G005.NMCLIENT                    
                FROM  G005
                WHERE G005.SNDELETE = 0
                  AND CJCLIENT =  '${id}' `,
      param: [],
    })
      .then((result) => {
        //return (result[0]);
        return utils.construirObjetoRetornoBD(result)
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscaIndustriasCliente = async function (req, res, next) {

    var id = req.params.id;

    return await db.execute({
      sql: ` SELECT 
                G014.IDG014, 
                G014.DSOPERAC, 
                G005.IDG005, 
                G005.NMCLIENT,
                G005.CJCLIENT, 
                G005.IECLIENT,
                G077.IDG077,
                G077.SNRASTRE,
                G077.SNSATISF
              FROM G014 G014
              JOIN G022 G022 ON (G014.IDG014 = G022.IDG014)
              JOIN G005 G005 ON (G005.IDG005 = G022.IDG005)
              LEFT JOIN G077 G077 ON (G077.IDG005 = G005.IDG005)
              WHERE G005.IDG005 =` + id,
      param: [],
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.saveIndustriasCliente = async function (req, res, next) {

    let con = await this.controller.getConnection();

    let objPermissoes = req.body.PERMISSOES;
    let operationSuccess = true;
    let objAux = [];
    let cliente = req.body.CLIENTE;
    let IDG014 = null;

    let resultDelete = await con.execute({

      sql: `Delete From G077 G077 Where G077.IDG005 = `
        + cliente,
      param: []

    }).then((result) => {
      operationSuccess = operationSuccess && true;

    }).catch((err) => {
      operationSuccess = operationSuccess && false;

      throw err;
    });

    for (let i = 0; i < objPermissoes.length; ++i) {

      objAux = objPermissoes[i].split("_");
      IDG014 = objAux[1];

      await con.insert({
        tabela: `G077`,

        colunas: {
          IDG005: cliente,
          SNRASTRE: 1,
          SNSATISF: 1
        },

        key: `G077.IDG077`

      }).then((result) => {
        operationSuccess = operationSuccess && true;

      }).catch((err) => {
        operationSuccess = operationSuccess && false;

        throw err;
      });

    };

    if (operationSuccess) {
      con.close();
      return 'Permissões atribuidas com sucesso';
    } else {
      con.closeRollback();
      return 'Erro ao atualizar permissões';
    }

  };

  /**
   * @description Insere um dado na tabela G005.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvar = async function (req, res, next) {

    if (req.body.DSCOMEND == null) {
      req.body.DSCOMEND = '';
    }

    return await db.insert({
      tabela: `G005`,
      colunas: {
        IDG003: req.body.NMCIDEST.id,
        IDG040: req.body.IDG040,
        IDG028: req.body.IDG028,
        IDS001: req.body.IDS001,
        CJCLIENT: req.body.CJCLIENT.replace(/\D/g, ''),
        IECLIENT: req.body.IECLIENT,
        IMCLIENT: req.body.IMCLIENT,
        NRENDERE: req.body.NRENDERE,
        CPENDERE: req.body.CPENDERE.replace(/\D/g, ''),
        NRLATITU: req.body.NRLATITU,
        NRLONGIT: req.body.NRLONGIT,
        DTCADAST: new Date(),
        DSENDERE: req.body.DSENDERE.toUpperCase(),
        NMCLIENT: req.body.NMCLIENT.toUpperCase(),
        RSCLIENT: req.body.RSCLIENT.toUpperCase(),
        TPPESSOA: req.body.TPPESSOA.toUpperCase(),
        DSCOMEND: req.body.DSCOMEND.toUpperCase(),
        BIENDERE: req.body.BIENDERE.toUpperCase(),
        STCADAST: req.body.STCADAST,
        STENVOTI: req.body.STENVOTI,
        SNENVRAS: req.body.SNENVRAS,
        SNESPECI: req.body.SNESPECI,
        NRDEPART: req.body.NRDEPART,
        SnDelete: 0,
      },

      key: `G005.IDG005`


    }).then((result) => {
      return { id: result };

    }).catch((err) => {
      throw err;
    });

  };

  /**
   * @description Atualiza um dado da tabela G005.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizar = async function (req, res, next) {

    var id = req.params.id;

    return await db.update({
      tabela: `G005`,
      colunas: {
        IDG003: req.body.NMCIDEST.id,
        IDG040: req.body.IDG040,
        IDG028: req.body.IDG028,
        IDS001: req.body.IDS001,
        CJCLIENT: req.body.CJCLIENT.replace(/\D/g, ''),
        IECLIENT: req.body.IECLIENT,
        IMCLIENT: req.body.IMCLIENT,
        NRENDERE: req.body.NRENDERE,
        CPENDERE: req.body.CPENDERE.replace(/\D/g, ''),
        NRLATITU: req.body.NRLATITU,
        NRLONGIT: req.body.NRLONGIT,
        DSENDERE: req.body.DSENDERE.toUpperCase(),
        NMCLIENT: req.body.NMCLIENT.toUpperCase(),
        RSCLIENT: req.body.RSCLIENT.toUpperCase(),
        TPPESSOA: req.body.TPPESSOA.toUpperCase(),
        DSCOMEND: req.body.DSCOMEND.toUpperCase(),
        BIENDERE: req.body.BIENDERE.toUpperCase(),
        STCADAST: req.body.STCADAST,
        STENVOTI: req.body.STENVOTI,
        NRDEPART: req.body.NRDEPART,
        SNENVRAS: req.body.SNENVRAS,
        SNESPECI: req.body.SNESPECI,
      },

      condicoes: `G005.IDG005 = :id`,
      parametros: { id: id }

    }).then((result) => {
      return { response: "Cliente alterado com sucesso" };

    }).catch((err) => {
      throw err;
    });

  };

  api.atualizarPermissaoEmail = async function (req, res, next) {

    var id = req.params.id;

    return await db.update({
      tabela: `G005`,

      colunas: {
        SNRASTRE: req.body.SNRASTRE,
        SNSATISF: req.body.SNSATISF
      },

      condicoes: `G005.IDG005 = :id`,
      parametros: { id: id }

    }).then((result) => {
      return { response: "Cliente alterado com sucesso" };

    }).catch((err) => {
      throw err;
    });

  };

  /**
   * @description Exclui um dado na tabela G005.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluir = async function (req, res, next) {

    var id = req.body.IDG005;
    var usuario = req.body.USER;

    return await db.update({
      tabela: `G005`,
      colunas: {
        SnDelete: 1, 
        IDS001UP: usuario
      },
      condicoes: `G005.IDG005 = :id`,
      parametros: {
        id: id
      }

    }).then((result) => {
      return true;

    }).catch((err) => {
      throw err;
    });

  };

  /**
   * @description Busca Cliente por CNPJ e IE.
   *
   * @async
   * @function api/buscaParceiro
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscaParceiro = async function (req, res, next) {
    //AND  G005.CPENDERE = '${req.cpparcei}' AND  G005.SNDELETE = 0
    var where = '';
    if (req.sndelete != undefined && req.sndelete == 0) {
      where = ' AND  G005.SNDELETE = 0 ';
    }
    return await db.execute({
      sql: `SELECT
                G005.IDG005,
                G005.CJCLIENT,
                G005.IECLIENT
              FROM G005
             WHERE G005.CJCLIENT = '${req.cjparcei}'
               AND  LPAD(UPPER(G005.IECLIENT),15,0) = LPAD(UPPER('${req.ieparcei}'),15,0)
               ${where}`,
      param: [],

    }).then((result) => {

      if (Object.keys(result).length > 0) {
        return (result);
      } else {
        return (result);
      }

    }).catch((err) => {
      throw err;
    });
  }

  api.operacoesCliente = async function (req, res, next) {

    let objConn = await this.controller.getConnection(req.objConn);

    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G022', true);

    return await objConn.execute({
      sql: `SELECT  G022.IDG022 G022_IDG022,
                      G022.IDG005 G022_IDG005,
                      G005.NMCLIENT G005_NMCLIENT,
                      G022.IDG014 G022_IDG014,
                      G014.DSOPERAC G014_DSOPERAC,
                      G022.IDCLIOPE G022_IDCLIOPE,
                      G022.IDEMPOPE G022_IDEMPOPE,
                      G022.DSSHIPOI G022_DSSHIPOI,

                      Case
                          When G022.SNINDUST = '0' Then
                          'Não'
                          When G022.SNINDUST = '1' Then
                          'Sim'
                        End As G022_SNINDUST,

                      COUNT(G022.IDG022) OVER () AS COUNT_LINHA
                FROM G022
                INNER JOIN G014
                ON G014.IDG014 = G022.IDG014
                INNER JOIN G005
                ON G005.IDG005 = G022.IDG005`+
        sqlWhere +
        sqlOrder +
        sqlPaginate,
      param: bindValues

    }).then(async (result) => {
      await objConn.close();
      return (utils.construirObjetoRetornoBD(result));

    }).catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });
  }

  /**
   * @description Insere um dado na tabela G005.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvarOperacao = async function (req, res, next) {

    let objConn = await this.controller.getConnection();

    return await objConn.insert({

      tabela: `G022`,
      colunas: {
        DSSHIPOI: req.body.DSSHIPOI,
        SNINDUST: req.body.SNINDUST,
        IDCLIOPE: req.body.IDCLIOPE,
        IDEMPOPE: req.body.IDEMPOPE,
        IDG005: req.body.IDG005,
        IDG014: req.body.IDG014.id,
        SN4PL: req.body.IDG014.id == 5 ? 1 : 0,
        SNRASTRE: req.body.SNRASTRE,
        SNSATISF: req.body.SNSATISF
      },

      key: `G022.IDG022`

    }).then(async (result) => {
      await objConn.close();
      return { id: result };

    }).catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });

  };

  /**
 * @description Busca um dado na tabela G005.
 *
 * @async
 * @function api/buscar
 * @param {request} req - Possui as requisições para a função.
 * @param {response} res - A resposta gerada na função.
 * @param {next} next - Caso haja algum erro na rota.
 * @return {JSON} Retorna um objeto JSON.
 * @throws Caso falso, o número do log de erro aparecerá no console.
*/
  api.buscarOperacao = async function (req, res, next) {

    let objConn = await this.controller.getConnection();

    var id = req.params.id;

    return await objConn.execute({

      sql: `SELECT  G022.IDG022,
                    G022.IDG005,
                    G022.IDG014,
                    G014.DSOPERAC,
                    G022.IDCLIOPE,
                    G022.IDEMPOPE,
                    G022.DSSHIPOI,
                    G022.SNINDUST,
                    G005.NMCLIENT,
                    G022.SNRASTRE,
                    G022.SNSATISF 
              FROM G022
              INNER JOIN G014
              ON G014.IDG014 = G022.IDG014
              INNER JOIN G005
              ON G005.IDG005 = G022.IDG005
              WHERE G022.IDG022 =` + id,
      param: [],

    }).then(async (result) => {
      await objConn.close();
      return (result);

    }).catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });

  };

  /**
  * @description Atualiza um dado da tabela G005.
  *
  * @async
  * @function api/atualizar
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
 */
  api.updateOperacao = async function (req, res, next) {

    let objConn = await this.controller.getConnection(null, req.UserId);

    var id = req.params.id;

    let atualizaOperacNota;

    if (req.body.SNINDUST == 1) {

      let notasRemetente = await objConn.execute({

        sql: `SELECT DISTINCT
                   G043.IDG043,
                   G043.IDG005RE,
                   G043.IDG014,
                   G051.IDG051,
                   G051.IDG005RE
             FROM G043 G043 
               JOIN G052 G052 On (G043.IDG043 = G052.IDG043)
               JOIN G051 G051 On (G051.IDG051 = G052.IDG051)
             WHERE NVL(G043.IdG005RE, G051.IdG005CO) = ${req.body.IDG005} and G051.STCTRC <> 'C' and G043.SNDELETE = 0 AND NVL(G043.IDG014,0) <> 5
                  `,
        param: []

      }).then((result) => {
        return result

      }).catch((err) => {
        throw err;
      });


      if (notasRemetente.length > 0) {

        for (let i = 0; i < notasRemetente.length; i++) {
          atualizaOperacNota = await objConn.update({

            tabela: `G043`,
            colunas: {
              IDG014: req.body.IDG014.id
            },

            condicoes: `G043.IDG043 = :id`,
            parametros: {
              id: notasRemetente[i].IDG043
            }

          }).then(async (result) => {
            return result

          }).catch(async (err) => {
            await objConn.closeRollback();
            throw err;
          });

        }

      }

    }

    return await objConn.update({

      tabela: `G022`,
      colunas: {
        DSSHIPOI: req.body.DSSHIPOI,
        SNINDUST: req.body.SNINDUST,
        IDCLIOPE: req.body.IDCLIOPE,
        IDEMPOPE: req.body.IDEMPOPE,
        IDG014: req.body.IDG014.id,
        SN4PL: 1,
        SNRASTRE: req.body.SNRASTRE,
        SNSATISF: req.body.SNSATISF,

      },

      condicoes: `G022.IDG022 = :id`,
      parametros: {
        id: id
      }

    }).then(async (result) => {
      await objConn.close();
      return { response: "Operação alterada com sucesso" };

    }).catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });
  };

  /**
   * @description Exclui um dado na tabela G005.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.excluirOperacao = async function (req, res, next) {

    let objConn = await this.controller.getConnection(null, req.UserId);

    var id = req.params.id;

    return await objConn.update({

      tabela: `G022`,
      colunas: {
        SnDelete: 1
      },

      condicoes: `G022.IDG022 = :id`,
      parametros: {
        id: id
      }

    }).then(async (result) => {
      await objConn.close();
      return true;

    }).catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });

  };


  api.buscarCliente = async function (req, res, next) {

    var sqlCommand = `SELECT
                        G005.IDG005,
                        G005.IDS001,
                        G005.IDG040,
                        G005.IDG003,
                        G005.NMCLIENT,
                        G005.RSCLIENT,
                        G005.TPPESSOA,
                        G005.CJCLIENT,
                        G005.IECLIENT,
                        G005.IMCLIENT,
                        G005.DSENDERE,
                        G005.NRENDERE,
                        G005.DSCOMEND,
                        G005.BIENDERE,
                        G005.CPENDERE,
                        G005.NRLATITU,
                        G005.NRLONGIT,
                        G005.STCADAST,
                        G005.DTCADAST,
                        G005.SNDELETE,
                        G005.NRDEPART,
                        G005.NRSELLER,
                        G003.NMCIDADE,
                        S001.NMUSUARI
                      FROM G005
                      INNER JOIN G003
                        ON G003.IDG003 = G005.IDG003
                      INNER JOIN S001
                        ON S001.IDS001 = G005.IDS001
                      WHERE G005.SNDELETE = 0
                        AND G005.IDG005 = ${req}`;

    return await db.execute({
      sql: sqlCommand,
      param: [],

    }).then((result) => {
      return (result[0]);

    }).catch((err) => {
      throw err;
    });
  };


  api.listarClientesContatos = async function (req, res, next) {

    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G007', true);
    let sqlWhereAcl = '';
    let sqlJoinAcl = '';
    let sqlCountAcl = ' COUNT(G007.IDG007) OVER () AS COUNT_LINHA, ';

    if (req.body.ACL != null && req.body.ACL != '') {

      sqlWhereAcl = await acl.montar({
        ids001: req.UserId,
        dsmodulo: "monitoria",
        nmtabela: [{
          G014: 'G014'
        }],
        esoperad: 'And'
      });

      if (sqlWhereAcl != '') {
        sqlJoinAcl = `
          Join G051 G051
            On (G051.IdG005DE = G020.IdG005)
          Join G022 G022
            On (G022.IdG005 = G051.IdG005CO)
          Join G014 G014
            On (G014.IdG014 = G022.IdG014)`;

        sqlCountAcl = `
          COUNT(G051.IDG005DE) OVER () AS COUNT_LINHA,
        `;
      }
    }

    return await db.execute({

      sql: `SELECT Distinct G007.IDG007,
                              G007.NMCONTAT,
                              G006.IDG006,
                              NVL(G006.DSSETOR,'n.i') AS DSSETOR,
                              G039.IDG039,
                              NVL(G039.DSCARGO,'n.i') AS DSCARGO,
                              ${sqlCountAcl}
                              TO_CHAR(G007.DTCADAST, 'DD/MM/YYYY') DTCADAST,
                              S001.NMUSUARI || ' [' || S001.IDS001 || ']' AS NMUSUARI,
                              /*NVL((SELECT distinct G014.DSOPERAC FROM G014 G014 
                                JOIN G022 G022 ON G022.IDG014 = G014.IDG014
                                JOIN G020 G020 ON G020.IDG005 = G022.IDG005 AND G020.TPCONTAT = 'I'
                                WHERE G020.IDG007 = G007.IDG007),'n.i') AS DSOPERAC*/
                                LISTAGG (G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT)
                                OVER (PARTITION BY G008.IDG007) AS DSCONTAT
                             -- NVL(G008.DSCONTAT,'n.i') AS DSCONTAT
              FROM  G007
             INNER JOIN S001 
                ON S001.IDS001 = G007.IDS001
              Inner Join G020 G020
                  On (G020.IDG007 = G007.IDG007)
              Inner Join G005 G005 on G005.IDG005 = G020.IDG005 
              --Left Join G022 G022 on (G005.IDG005 = G022.IDG005)
              --Left Join G014 G014 on (G022.IDG014 = G014.IDG014)     
              Left Join G006 G006
                  ON (G006.IDG006 = G007.IDG006 AND G006.STCADAST = 'A')
              Left Join G039 G039
                  ON (G039.IDG039 = G007.IDG039 AND G006.STCADAST = 'A')
              Left Join G008 G008 on (G020.IDG007 = G008.IDG007 /*AND G006.DSSETOR = 'RTV'*/)
               ` +
        sqlJoinAcl +
        sqlWhere +
        sqlWhereAcl +

        `Group by G007.NMCONTAT,
                G006.IDG006,
                G006.DSSETOR,
                G039.IDG039,
                G039.DSCARGO,
                G007.IDG007,
                G007.DTCADAST,
                S001.NMUSUARI || ' [' || S001.IDS001 || ']',
                G008.DSCONTAT,
                G008.IDG007`+

        sqlOrder +
        sqlPaginate,
      param: bindValues

    }).then((result) => {
      return (utils.construirObjetoRetornoBD(result, req.body, 4, 4));

    }).catch((err) => {
      throw err;
    });
  };

  api.buscarClientesOperacao = async function (req, res, next) {

    return await objConn.execute({
      sql: ` SELECT
                    G005.IDG005,   G005.NMCLIENT, G005.RSCLIENT,
                    G005.TPPESSOA, G005.CJCLIENT, G005.IECLIENT,
                    005.IMCLIENT,  G005.DSENDERE, G005.NRENDERE,
                    G005.DSCOMEND, G005.BIENDERE, G005.CPENDERE,
                    G005.IDG003,   G005.NRLATITU, G005.NRLONGIT,
                    G005.STCADAST, G005.IDS001,   G005.SNDELETE,
                    G005.STENVOTI, G005.IDG040,   G005.NRDEPART,
                    G005.NRSELLER,
                    TO_CHAR(G005.DTCADAST, 'DD/MM/YYYY') AS DTCADAST
              FROM  G022
              INNER JOIN G005 
                ON G022.IDG005 = G005.IDG005
                AND G005.SNDELETE = 0
              WHERE G022.SNDELETE = 0 
                AND G022.IDG014 = ${req.params.id}`,
      param: [],
    })
      .then(async (result) => {
        await objConn.close();
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };



  api.insertContatosExcel = async function (req, res, next) {
    var emails = [];
    var Excel = require('exceljs');
    var success = 0;
    var error = 0;
    var files = req.files;
    var wb = new Excel.Workbook();
    var path = require('path');
    var operationSuccess = true;
    var db = await this.controller.getConnection();

    for (const file of files) {
      var filename = new Date().getTime();
      var filePath = path.resolve(process.cwd(), `${filename}.xlsx`);
      fs.writeFileSync(filePath, file.buffer);

      await wb.xlsx.readFile(filePath).then(async function () {
        var sh = wb.getWorksheet("clientes");
        console.log('qtd linhas: ', sh.rowCount);
        for (i = 1; i <= sh.rowCount; i++) {
          var a = sh.getRow(i).getCell(1).value; //cnpj
          var b = sh.getRow(i).getCell(2).value; //codigo do cliente
          var c = sh.getRow(i).getCell(3).value; //nome cliente
          var d = sh.getRow(i).getCell(4).value != 0 ? sh.getRow(i).getCell(4).value.replace(/,,/g, '') : 0; //emails

          console.log('>>>>>>>', a, b, c, d);
          var emailAux = d != 0 ? d.split(',') : '';
          for (const email of emailAux) {
            if (email != '' && email != null) {
              let resultCliente = await db.execute({
                sql: ` SELECT g005.IDG005,
                                  (SELECT count(g008.idg008)
                                    FROM g008 g008
                                    JOIN g007 g007
                                      ON g007.idg007 = g008.IDG007
                                    JOIN g020 g020
                                      ON g007.idg007 = g020.IDG007
                                      AND g020.idg005 = g005.idg005
                                    WHERE LOWER(dscontat) LIKE
                                          LOWER('${email}')) AS sninsere
                            from g005 g005 
                            where cjclient = '`+ a + `' 
                            AND IECLIENT = '`+ b +`' `,
                param: []
              })
                .then((result) => {
                  operationSuccess = operationSuccess && true;
                  return result;
                })
                .catch((err) => {
                  operationSuccess = operationSuccess && false;
                });

              if (operationSuccess && resultCliente.length == 0) {
                for (let j = 0; j < resultCliente.length; j++) {
                  console.log("Cliente ---> ", resultCliente[j].IDG005);
                  emails.push({ email, IDG005: resultCliente[j].IDG005 });
                }
              }
            }
          }
          if (emails.length > 0) {
            let insertG007 = await db.insert({
              tabela: `G007`,
              colunas: {
                NMCONTAT: c,
                DTNASCIM: null,
                IDG006: 1,
                SNCONATE: null,
                DTCADAST: new Date(),
                SNDELETE: 0,
                IDS001: 97
              },
              key: `G007.IDG007`
            })
              .then((result) => {
                operationSuccess = operationSuccess && true;
                return result;
              })
              .catch((err) => {
                operationSuccess = operationSuccess && false;
              });

            for (const client of emails) {
              let InsertG008 = await db.insert({
                tabela: `G008`,
                colunas: {
                  IDG007: insertG007,
                  DSCONTAT: client.email,
                  TPCONTAT: 'E',
                  DTCADAST: new Date(),
                  SNDELETE: 0,
                  IDS001: 97
                },
                key: `G008.IDG008`
              })
                .then((result) => {
                  operationSuccess = operationSuccess && true;
                  return result;
                })
                .catch((err) => {
                  operationSuccess = operationSuccess && false;
                });

              let insertG020 = await db.insert({
                tabela: 'G020',
                colunas: {
                  IDG007: insertG007,
                  IDG005: client.IDG005,
                  TPCONTAT: 'C'
                },
                key: 'IDG020'
              })
                .then((result) => {
                  operationSuccess = operationSuccess && true;
                  return result;
                })
                .catch((err) => {
                });
            }
          }
          let snErro = 1;
          if (operationSuccess) {
            await db.close();
            success++;
            snErro = 1;
          } else {
            await db.closeRollback();
            error++;
            snErro = 0;
          }
          logger.info(a, ' - ', snErro);
        }
      });
      fs.unlink(filePath, () => {
        console.log('planilha removida com sucesso!')
      });
    }
    logger.info('fim', success, error);
    return true;
  };


  api.listarClientesV2 = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G005', true);
      sqlWhere = sqlWhere + ` And G005.NMCLIENT != '.' `;

      let sqlWhereAcl = '';
      let sqlJoinAcl = '';
      let sqlCountAcl = ' COUNT(G005.IDG005) OVER () AS COUNT_LINHA, ';

      if (req.body.ACL != null && req.body.ACL != '') {

        sqlWhereAcl = await acl.montar({

          ids001: req.UserId,
          dsmodulo: "monitoria",
          nmtabela: [{
            G014: 'G014'

          }],

          esoperad: 'And'

        });

        if (sqlWhereAcl != '') {

          sqlJoinAcl = `
            Join G051 G051
              On (G051.IdG005DE = G005.IdG005)
            Join G022 G022
              On (G022.IdG005 = G051.IdG005CO)
            Join G014 G014
              On (G014.IdG014 = G022.IdG014)`;

          sqlCountAcl = `
            COUNT(G051.IDG005DE) OVER () AS COUNT_LINHA,
          `;
        }
      }

      let result = await con.execute({
        sql: `SELECT Distinct 
                      G005.IDG005,
                      G005.IDG003,
                      G005.IDS001,
                      G005.IDG040,
                      LTRIM(G005.NMCLIENT) as NMCLIENT,
                      G005.RSCLIENT,
                      G005.TPPESSOA,
                      G005.CJCLIENT,
                      G005.IECLIENT,
                      G005.IMCLIENT,
                      G005.DSENDERE,
                      G005.NRENDERE,
                      G005.DSCOMEND,
                      G005.BIENDERE,
                      G005.CPENDERE,
                      G005.NRLATITU,
                      G005.NRLONGIT,
                      G005.STCADAST,
                      G005.SNDELETE,
                      G005.NRDEPART,
                      G005.NRSELLER,
                      G005.DSEMAIL,
                      TO_CHAR(G005.DTCADAST, 'DD/MM/YYYY') DTCADAST,

                      G022.IDCLIOPE,
                      G022.IDEMPOPE,
                      G022.DSSHIPOI,
                      G022.SNRASTRE AS G022_SNRASTRE,
                      G022.SNSATISF AS G022_SNSATISF,

                      G014.DSOPERAC,

                      G002.NMESTADO,
                      G003.NMCIDADE,

                      ${sqlCountAcl}

                      Nvl(G005.SNRASTRE,0) As G005_SNRASTRE,
                      Nvl(G005.SNSATISF,0) As G005_SNSATISF,
                      S001.NMUSUARI,

                      (
                        SELECT DISTINCT
                              LISTAGG(G008X.DSCONTAT, ', ') WITHIN GROUP(ORDER BY G008X.DSCONTAT)
                              OVER (PARTITION BY G020X.IDG005)
                           FROM G020 G020X
                           JOIN G007 G007X ON (G007X.IDG007 = G020X.IDG007)
                           JOIN G008 G008X ON (G008X.IDG007 = G007X.IDG007)
                            AND G020X.IDG005 = G005.IDG005
                            AND G020X.TPCONTAT = 'C'
                            AND G007X.IDG006 <> 27
                            AND G007X.SNDELETE = 0
                            AND G008X.SNDELETE = 0
                            AND G008X.TPCONTAT = 'E'
                          GROUP BY G020X.IDG005, G008X.DSCONTAT
                      ) AS DSCONTAT


                FROM  G005 G005
              Inner Join G003 G003 On (G003.IdG003 = G005.IdG003)
              Left Join G002 G002 On (G003.IdG002 = G002.IdG002)
              Inner Join S001 S001 On (S001.IdS001 = G005.IdS001)


              Left Join G020 G020
                On (G020.IDG005 = G005.IDG005)

              LEFT JOIN G022 G022
              ON (G022.IDG005 = G005.IDG005 And G022.SNDELETE = 0) 

              LEFT JOIN G014 G014
              ON G014.IDG014 = G022.IDG014

              Left Join G007 G007
                On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0)

              Left Join G008 G008
                On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0)

              Left Join G006 G006
                ON (G006.IDG006 = G007.IDG006 AND G006.STCADAST = 'A')

              Left Join G039 G039
                ON (G039.IDG039 = G007.IDG039 AND G006.STCADAST = 'A') ` +

          sqlJoinAcl +
          sqlWhere +
          sqlWhereAcl +

          ` 
                Group By G005.IDG005,G005.IDG003,G005.IDS001,G005.IDG040,G005.NMCLIENT,
                      G005.RSCLIENT,G005.TPPESSOA,G005.CJCLIENT,G005.IECLIENT,G005.IMCLIENT,
                      G005.DSENDERE,G005.NRENDERE,G005.DSCOMEND,G005.BIENDERE,G005.CPENDERE,
                      G005.NRLATITU,G005.NRLONGIT,G005.STCADAST,G005.SNDELETE,G005.NRDEPART,
                      G005.NRSELLER,G005.DSEMAIL,G005.DTCADAST,G003.NMCIDADE,G005.SNRASTRE,
                      G005.SNSATISF,G002.NMESTADO,G022.SNRASTRE,G022.SNSATISF,
                      
                      G022.IDCLIOPE,
                      G022.IDEMPOPE,
                      G022.DSSHIPOI,
                      G014.DSOPERAC,

                      S001.NMUSUARI

                  ` +
          sqlOrder +
          sqlPaginate,
        param: bindValues
      })
        .then((result) => {
          return (utils.construirObjetoRetornoBD(result, req.body));
        })
        .catch((err) => {
          throw err;
        });

      await con.close();
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;

    }

  };


  api.UpdateClientesExcel = async function (req, res, next) {


    var Excel = require('exceljs');

    var wb = new Excel.Workbook();
    var path = require('path');
    var filePath = path.resolve(process.cwd(), 'Lista de clientes FMC CONSOLIDADO - envio tracking.xlsx');
    var that = this;
    wb.xlsx.readFile(filePath).then(async function () {
      var sh = wb.getWorksheet("CONSOLIDADO");
      var success = 0;
      var error = 0;
      // sh.getRow(1).getCell(2).value = 32;
      // wb.xlsx.writeFile("sample2.xlsx");
      // console.log("Row-3 | Cell-2 - "+sh.getRow(3).getCell(2).value);

      console.log('qtd linhas: ', sh.rowCount);
      //Get all the rows data [1st and 2nd column]
      for (i = 2; i <= sh.rowCount; i++) {
        let db = await that.controller.getConnection();
        let operationSuccess = true;
        // console.log(sh.getRow(i).getCell(1).value);
        // console.log(sh.getRow(i).getCell(2).value);


        var a = sh.getRow(i).getCell(1).value;
        var b = sh.getRow(i).getCell(2).value;
        var c = sh.getRow(i).getCell(3).value;
        var d = sh.getRow(i).getCell(4).value;
        var e = sh.getRow(i).getCell(5).value;
        var f = sh.getRow(i).getCell(6).value;
        //var i = sh.getRow(i).getCell(9).value;

        console.log('>>>>>>>', a, b, c, d, e, f, i);

        let resultCliente = await db.execute({
          sql: `  select distinct
                      g005.idg005, 
                      g022.idg022
                    from g005
                      inner join g022 on g022.idg005 = g005.idg005 and g022.snindust = 0 and g022.sndelete = 0 and g022.idg014 = 93
                      inner join g003 on g003.idg003 = g005.idg003
                      inner join g002 on g003.idg002 = g002.idg002
                    where g005.stcadast = 'A'
                    and g005.sndelete = 0
                    and g005.cjclient like '%${b}%'
                    and g005.ieclient like '%${c}%'`,
          param: []
        })
          .then((result) => {
            operationSuccess = operationSuccess && true;
            return result;
          })
          .catch((err) => {
            operationSuccess = operationSuccess && false;
          });

        if (operationSuccess && resultCliente.length > 0) {

          console.log("Cliente ---> ", resultCliente[0].IDG005);

          let updateG022 = await db.update({
            tabela: `G022`,

            colunas: {
              SNRASTRE: 1
            },

            condicoes: `G022.IDG022 = :id AND G022.IDG014 = 93 AND G022.IDG005 = :idg005`,
            parametros: {
              id: resultCliente[0].IDG022,
              idg005: resultCliente[0].IDG005
            }
          })
            .then((result) => {
              operationSuccess = operationSuccess && true;
              return result;
            })
            .catch((err) => {
              operationSuccess = operationSuccess && false;
            });



        }
        let snErro = 1;
        if (operationSuccess) {
          await db.close();
          success++;
          snErro = 1;
        } else {
          await db.closeRollback();
          error++;
          snErro = 0;
        }
        logger.info(f, ' - ', snErro);
      }


    });
    console.log('fim', success, error);
    logger.info('fim', success, error);
    return true;
  };


  return api;
};
