/**
 * @module integrador/dao/CargasDAO
 * @description Consultas SQL de Cargas
 * 
 * @requires utils/DataAtual
 * @requires config/database
 * @requires utils/FuncoesObjDB
 * @requires config/ControllerBD
*/
module.exports = function (app, cb) {

  var api   = {};
  var utils = app.src.utils.FuncoesObjDB;
  var tmz   = app.src.utils.DataAtual;
  var db    = app.config.database;
  const fldAdd = app.src.modGlobal.controllers.XFieldAddController;  
  const gdao   = app.src.modGlobal.dao.GenericDAO;

  api.controller = app.config.ControllerBD;

  /**
   * @description
   *
   * @async
   * @function buscar   
   * @param {Object} req Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires module:integrador/dao/CargasDAO~returnCarga
   * @requires utils/FuncoesObjDB~construirObjetoRetornoBD
   * 
   * @author Igor Pereira da Silva
   * @since 21/06/2018
  */
  api.buscarCarga = async function (req, res, next) {
    var resCarga = await api.returnCarga(req);

    resCarga = utils.construirObjetoRetornoBD(resCarga);
    return await resCarga;
  };

  /**
   * @description
   *
   * @async
   * @function buscarDeliveries   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.params
   * @param {Object} req.params.id ID da parada
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @author Igor Pereira da Silva
   * @since 21/06/2018
  */
  api.buscarDeliveries = async function (req, res, next) {
    var idParadas = req.params.id;
    var resDeliveries = await api.returnDeliveries(idParadas);

    resDeliveries = utils.construirObjetoRetornoBD(resDeliveries);

    return resDeliveries;
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela G045.
   *
   * @async
   * @function buscarParadas   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.params
   * @param {Object} req.params.id ID da carga
   * 
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * 
   * @author Igor Pereira da Silva
   * @since 21/06/2018
  */
  api.buscarParadas = async function (req, res, next) {
    var id = req.params.id;
    var resParada = await api.returnParadas(id);

    resParada = utils.construirObjetoRetornoBD(resParada);
    return resParada;
  };

  /**
   * @description
   *
   * @async
   * @function cargaFracionada   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.params
   * @param {Object} req.params.id ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Igor Pereira da Silva
   * @since 18/06/2018
  */
  api.cargaFracionada = async function (req, res, next) {
    var id = req.params.id;
    
    var con = await this.controller.getConnection();

      return await con.update({
        tabela: 'G046',
        colunas: {
          SNCARPAR: req.body.SNCARPAR,
        },
        condicoes: 'IDG046 = :id',
        parametros: {
          id: id
        }
      }).then(async (result) => {
        await con.close();  
        return {response: req.__('tr.sucesso.update')};
      }).catch(async (err) => {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
     
  };
  /**
   * @description
   *
   * @async
   * @function envLog   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.params
   * @param {Object} req.params.id ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Igor Pereira da Silva
   * @since 28/06/2018
  */
  api.envLog = async function (req, res, next) {
    var id = req.params.id;
    
    var con = await this.controller.getConnection();

      return await con.update({
        tabela: 'G046',
        colunas: {
          STENVLOG: req.body.STENVLOG,
        },
        condicoes: 'IDG046 = :id',
        parametros: {
          id: id
        }
      }).then(async (result) => {
        await con.close();  
        return {response: req.__('tr.sucesso.update')};
      }).catch(async (err) => {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
     
  };

  /**
   * @description Retorna os dados da carga
   *
   * @async
   * @function returnCarga   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.params
   * @param {Object} req.params.id ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Igor Pereira da Silva e Luiz Gustavo Borges Bosco 
   * @since 21/06/2018
  */
  api.returnCarga = async function (req) {

    try {

      if(req.params.id){
        req.body["parameter[CARGA_IDG046]"] = req.params.id;
      } 
      
      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'CARGA',true);
      var objConn = await this.controller.getConnection();
      var parm = { nmTabela: 'G043', objConn };
      parm.objConn = await gdao.controller.getConnection();
      var sqlAux = await fldAdd.tabelaPivot(parm, null, null).catch((err) => { throw err });

      return await objConn.execute({
        sql: `SELECT 
                  CARGA.IDG046          CARGA_IDG046,
                  G048.NRSEQETA         G048_NRSEQETA,

                  CASE
                    WHEN CARGA.STCARGA = 'B' THEN 'BACKLOG'
                    WHEN CARGA.STCARGA = 'R' THEN 'ROTEIRIZADA'
                    WHEN CARGA.STCARGA = 'O' THEN 'OFERECIDA'
                    WHEN CARGA.STCARGA = 'X' THEN 'RECUSADA'
                    WHEN CARGA.STCARGA = 'A' THEN 'ACEITA'
                    WHEN CARGA.STCARGA = 'S' THEN 'AGENDADA'
                    WHEN CARGA.STCARGA = 'T' THEN 'TRANSPORTE'
                    WHEN CARGA.STCARGA = 'C' THEN 'CANCELADA'
                    WHEN CARGA.STCARGA = 'E' THEN 'OCORRÊNCIA'
						        WHEN CARGA.STCARGA = 'F' THEN 'PRÉ CARGA'
                    WHEN CARGA.STCARGA = 'D' THEN 'ENTREGUE'
                    ELSE ''
                  END 									CARGA_STCARGA,

                  CARGA.CDVIAOTI       CARGA_CDVIAOTI,
                  CARGA.VRCARGA        CARGA_VRCARGA,
                  CARGA.PSCARGA        CARGA_PSCARGA,
                  CARGA.SNCARPAR       CARGA_SNCARPAR,
                  CARGA.QTVOLCAR       CARGA_QTVOLCAR,
                  CARGA.VRPOROCU       CARGA_VRPOROCU,
                  CARGA.STENVLOG       CARGA_STENVLOG,

                  CASE 
                      WHEN CARGA.TPMODCAR = 1 THEN '3PL'
                      WHEN CARGA.TPMODCAR = 2 THEN '4PL'
                      WHEN CARGA.TPMODCAR = 3 THEN 'MISTA'
                      ELSE ''
                  END CARGA_TPMODCAR,
            
                  CASE 
                      WHEN CARGA.TPCARGA = 1 THEN 'ESTIVADA'
                      WHEN CARGA.TPCARGA = 2 THEN 'PALETIZADA'
                      ELSE 'MISTA'
                  END CARGA_TPCARGA,
              
                  TO_CHAR(CARGA.DTPRESAI, 'DD/MM/YYYY HH24:MI:SS') CARGA_DTPRESAI,
                  TO_CHAR(CARGA.DTSAICAR, 'DD/MM/YYYY HH24:MI:SS') CARGA_DTSAICAR,
                  TO_CHAR(CARGA.DTAGENDA, 'DD/MM/YYYY HH24:MI:SS') CARGA_DTAGENDA,
                  TO_CHAR(CARGA.DTCARGA, 'DD/MM/YYYY HH24:MI:SS') CARGA_DTCARGA,

              	  ROUND(NVL(G048.QTDISTOD, G048.QTDISPER), 0)  CARGA_QTDISPER,
            
                  TRANSP.NMTRANSP        TRANSP_NMTRANSP,
                  TPVEIC.DSTIPVEI        TPVEIC_DSTIPVEI,

                  CASE
                       WHEN G032V1.NRPLAVEI IS NOT NULL THEN UPPER(G032V1.NRPLAVEI)
                       WHEN CARGA.NRPLAVEI IS NOT NULL THEN UPPER(CARGA.NRPLAVEI)
                       ELSE ''
                   END AGENDAMENTO_NRPLAVEI,

                  CASE 
                    WHEN CAMPOSADD.SNRECORI IS NULL THEN 'NÃO'
                    ELSE 'SIM'
                  END								CAMPOSADD_SNRECORI,

                  COUNT(CARGA.IDG046) OVER () as COUNT_LINHA
          
          FROM G046 CARGA

          INNER JOIN G048
          ON G048.IDG046 = CARGA.IDG046
            
          INNER JOIN G049
            ON G049.IDG048 = G048.IDG048
            
          LEFT JOIN G043
            ON G043.IDG043 = G049.IDG043
          
          LEFT JOIN G024 TRANSP
              ON TRANSP.IDG024 = CARGA.IDG024

          LEFT JOIN G032 G032V1
              ON G032V1.IDG032 = CARGA.IDG032V1
              
          LEFT JOIN G030 TPVEIC
              ON TPVEIC.IDG030 = CARGA.IDG030 
            
          --CAMPOS ADICIONAIS----------------------------------------------------------------------------------------------------
          LEFT JOIN (${sqlAux}) CAMPOSADD ON
            CAMPOSADD.ID = G043.IDG043

          LEFT JOIN 
              (SELECT H006.IDG046, MAX(H006.IDH006) IDH006, COUNT(*) TOTAL_AGENDAMENTO
                FROM H006
                WHERE H006.STAGENDA <> 10
                AND H006.SNDELETE = 0
                GROUP BY H006.IDG046 HAVING COUNT(*) > 0 
              ) ULTAGENDA
            ON ULTAGENDA.IDG046 = CARGA.IDG046
        
          LEFT JOIN H006 AGENDAMENTO
            ON AGENDAMENTO.IDH006 = ULTAGENDA.IDH006
          
          ${sqlWhere}
          AND G043.TPDELIVE NOT IN (3,4)

          GROUP BY 
              CARGA.IDG046
            , CARGA.STCARGA
            , CARGA.CDVIAOTI
            , CARGA.VRCARGA
            , CARGA.PSCARGA
            , CARGA.SNCARPAR
            , CARGA.VRPOROCU
            , CARGA.NRPLAVEI
            , CARGA.STENVLOG
            , CARGA.TPCARGA
            , CARGA.DTPRESAI
            , CARGA.DTSAICAR
            , CARGA.DTAGENDA
            , CARGA.DTCARGA
            , CARGA.QTVOLCAR
            , CARGA.TPMODCAR

            , G048.QTDISPER
            , G048.QTDISTOD
            , G048.QTVOLCAR
            , G048.NRSEQETA

            , G032V1.NRPLAVEI

            , TRANSP.NMTRANSP

            , TPVEIC.DSTIPVEI

          ${sqlOrder}
          ${sqlPaginate}`,
  
        param: bindValues,
      }).then((result) => {
        objConn.close();
        return result;
      }).catch((err) => {
        objConn.closeRollback();
        throw err;
      });
    } catch (error) {
      throw error;
    }    
  }

  /**
   * @description Seleciona os dados da parada pelo ID da carga
   *
   * @async
   * @function returnParadas   
   * @param {Object} idCargas Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Igor Pereira da Silva
   * @since 21/06/2018
  */
  api.returnParadas = async function (idCargas) {
    var filtros = {
      "IDG046": idCargas,
      "tableName": "G048"
    }
    var [sqlWhere, bindValues] = utils.buildWhere(filtros);
   
    try {
      var con = await this.controller.getConnection();
      return await con.execute({
        sql: `SELECT 
                G048.IDG048,
                G048.IDG046,
                G048.IDINTOPE,
                G048.IDG005OR,
                G048.IDG005DE,
                G048.NRSEQETA,
                G048.PSDELETA,
                G048.QTDISPER,
                G048.STINTCLI,
                G048.QTVOLCAR,
                TO_CHAR(MAX(G043.DTENTREG) ,'DD/MM/YYYY HH24:MI') AS DTENTREG,
                TO_CHAR(G048.DTPREORI ,'DD/MM/YYYY HH24:MI') AS DTPREORI,
                TO_CHAR(G048.DTPREATU ,'DD/MM/YYYY HH24:MI') AS DTPREATU,
                TO_CHAR(G048.DTENTCON ,'DD/MM/YYYY HH24:MI') AS DTENTCON,
                TO_CHAR(G048.DTINIETA ,'DD/MM/YYYY HH24:MI') AS DTINIETA,
                TO_CHAR(G048.DTFINETA ,'DD/MM/YYYY HH24:MI') AS DTFINETA,
  
                IDG005OR.NMCLIENT ORIGEM, 
                IDG005DE.NMCLIENT DESTINO, 
  
                COUNT(G048.IDG048) OVER () AS COUNT_LINHA
                
              FROM  G048

              INNER JOIN G046
                ON G046.IDG046 = G048.IDG046
                AND G046.SNDELETE = 0
  
              INNER JOIN G005 IDG005OR
                ON (IDG005OR.IDG005 = G048.IDG005OR)
  
              INNER JOIN G005 IDG005DE
                ON (IDG005DE.IDG005 = G048.IDG005DE)
                
              INNER JOIN G049
                ON G049.IDG048 = G048.IDG048

              INNER JOIN G043
                ON G043.IDG043 = G049.IDG043
                AND G043.TPDELIVE NOT IN (3,4)
                AND G043.STDELIVE <> 'D'
                AND G043.SNDELETE = 0

              ${sqlWhere}

              GROUP BY 
                G048.IDG048,
                G048.IDG046,
                G048.IDINTOPE,
                G048.IDG005OR,
                G048.IDG005DE,
                G048.NRSEQETA,
                G048.PSDELETA,
                G048.QTDISPER,
                G048.STINTCLI,
                G048.QTVOLCAR,
                G048.DTPREORI ,
                G048.DTPREATU ,
                G048.DTENTCON ,
                G048.DTINIETA ,
                G048.DTFINETA ,
                IDG005OR.NMCLIENT,
                IDG005DE.NMCLIENT`,
        param: bindValues,
      }).then((result) => {
        con.close();
        return result;
      }).catch((err) => {
        con.closeRollback();
        throw err;
      });
    }catch(error){
      throw error;
    }
    
  }

  /**
   * @description Seleciona as deliveries a partir do ID da parada (IDG048)
   *
   * @async
   * @function buscar   
   * @param {Object} idParadas ID da tabela G048
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Igor Pereira da Silva
   * @since 21/06/2018
  */
  api.returnDeliveries = async function (idParadas) {
    var filtros = {
      "G049.IDG048": idParadas,
      "tableName": "G043"
    }
    var [sqlWhere, bindValues] = utils.buildWhere(filtros);

    try {
      var con = await this.controller.getConnection();

      return await con.execute({
        sql: `SELECT 
                G043.IDG043,
                G043.CDDELIVE,
                G043.SNLIBROT,
                G043.IDS001,
                G043.TPDELIVE,
                G043.STDELIVE,
                G043.NRNOTA,
                G043.NRSERINF,
                G043.NRCHADOC,
                G043.DSMODENF,
                G043.SNDELETE,
                G043.IDG005RE,
                G043.IDG005DE,
                G043.CDPRIORI,
                G043.CDFILIAL,
                G043.PSBRUTO,
                G043.PSLIQUID,
                G043.NRDIVISA,
                G043.STETAPA,
                G043.VRDELIVE,
                G043.NREMBSEC,
                G043.SNINDSEG,
                G043.VRALTURA,
                G043.VRLARGUR,
                G043.VRCOMPRI,
                G043.CJDESTIN,
                G043.IEDESTIN,
                G043.IMDESTIN,
                G043.IDG014,
                G043.CDCLIEXT,
                G043.VRVOLUME,
                G043.IDG009PS,
                G043.STULTETA,
  
                TO_CHAR(G043.DTLANCTO ,'DD/MM/YYYY')   DTLANCTO,
                TO_CHAR(G043.DTDELIVE ,'DD/MM/YYYY')   DTDELIVE,
                TO_CHAR(G043.DTEMINOT ,'DD/MM/YYYY')   DTEMINOT,
                TO_CHAR(G043.DTENTREG ,'DD/MM/YYYY')   DTENTREG,
                TO_CHAR(G043.DTENTCON ,'DD/MM/YYYY')   DTENTCON,
  
                COUNT(G043.IDG043) OVER () AS COUNT_LINHA

              FROM  G043

              INNER JOIN G049
                ON (G049.IDG043 =  G043.IDG043)

            ${sqlWhere}
            AND G043.SNDELETE = 0
            AND G043.TPDELIVE NOT IN (3,4)
            AND G043.STDELIVE <> 'D'`,
        param: bindValues,
      }).then((result) => {
        con.close();
        return result;
      }).catch((err) => {
        con.closeRollback();
        throw err;
      });
    } catch (error) {
      throw error;
    }
    
  }

  /**
   * @description Insere a data de cancelamento e o usuário que fez o cancelamento da carga, remove a data de saida e muda o status da carga para C
   *
   * @async
   * @function cancelarCarga
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Object} req.body.carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * @requires utils/DataAtual~tempoAtual
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 02/2018
  */
  api.cancelarCarga = async function (req, res, next) {
    var objConn = await this.controller.getConnection(req.objConn, req.UserId);
    var dataFormatada = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');
    var motivoCancelamento = req.IDT013.id;
    var usuarioCancelamento = req.IDS001;

    var sql = `UPDATE G046 
               SET STCARGA = 'C',
               DTCANCEL = TO_DATE('${dataFormatada}', 'YYYY-MM-DD HH24:MI:SS'),
               IDS001CA = ${usuarioCancelamento},
               IDT013 = '${motivoCancelamento}'
               WHERE IDG046 = ${req.IDG046}`;

    return await objConn.execute({ sql, param: [] })
      .then(async (result) => {
        await objConn.close();
        return result;
      })
      .catch(async (err) => {
        await objConn.closeRollback();
        throw err;
      });
  }

  /**
   * @description Move as deliveries para Cancelada se ela estiver em A Cancelar ou para Backlog se estiver em outra etapa
   *
   * @async
   * @function cancelarDeliveryCarga
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {number} req.body.CARGA ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 03/2018
  */
  api.cancelarDeliveryCarga = async function (req, res, next) {

    var objConn = await this.controller.getConnection(req.objConn, req.UserId);

    if (req.opcao == 1) {
      var etapa = 0;
      var operador = '<';
    } else {
      var etapa = 8;
      var operador = '=';
    }

    var strBusca = `SELECT
                        G043.IDG043    
                    FROM G043 -- DELIVERY

                    INNER JOIN G049 -- DELIVERY x ETAPA
                      ON G049.IDG043 = G043.IDG043
                      
                    INNER JOIN G048 -- ETAPA
                        ON G048.IDG048 = G049.IDG048
                        
                    WHERE G048.IDG046 = ${req.IDG046}`;

    var sql = `UPDATE G043 
                SET STETAPA = ${etapa}, 
                    CDG46ETA = NULL,
                    SNOTIMAN = 0
                WHERE STETAPA ${operador} 7
                  AND IDG043 IN (${strBusca})`;

    return await objConn.execute({ sql, param: [] })
      .then(async (result) => {
        await objConn.close();
        return true;
      })
      .catch(async (err) => {
        await objConn.closeRollback();
        throw err;
      });
  }

  /**
   * @description Gera evento na delivery quando a carga em que ela estava atribuida é cancelada
   *
   * @async
   * @function eventoCargaCancelada   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.CARGA ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * @requires utils/DataAtual~formataData
   * @requires utils/DataAtual~dataAtualJS
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 04/2018
  */
  api.eventoCargaCancelada = async function (req, res, next) {

    var objConn = await this.controller.getConnection(req.objConn);

    var dataAtual = tmz.formataData(tmz.dataAtualJS(), 'YYYY-MM-DD HH:mm:ss');


    var sql = `INSERT INTO I008 
                    (IDG043, IDI001, DTEVENTO)

                SELECT 
                G049.IDG043, 29 IDI001, TO_DATE('${dataAtual}', 'YYYY-MM-DD HH24:MI:SS') DTEVENTO

                FROM G049 

                INNER JOIN G043 ON 
                G043.IDG043 = G049.IDG043
                AND G043.SNDELETE = 0

                INNER JOIN G048 ON 
                G048.IDG048 = G049.IDG048

                WHERE G048.IDG046 = ${req.IDG046}`;

    return await objConn.execute({ sql, param: [] })
    .then(async (result) => {
      await objConn.close();
      return true;
    })
    .catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });
            
  }
  
  /**
   * @description Muda o status da coluna STINTCLI para gerar ASN Delete
   *
   * @async
   * @function gerarAsnDelete   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.CARGA ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 03/2018
  */
  api.gerarAsnDelete = async function (req, res, next) {

    var objConn = await this.controller.getConnection(req.objConn);

    var sql = 
        `UPDATE (
            SELECT 
                IDG048
              ,	STINTCLI
              ,	CASE
                  WHEN (STINTCLI = 2) THEN 4
                  ELSE 3
                END STDELETE
                
            FROM G048 -- ETAPAS 
            WHERE
              STINTCLI IN (0,1,2) AND 
              IDG046 = ${req.IDG046} 
          ) L SET L.STINTCLI = L.STDELETE`;

    return await objConn.execute({ sql, param: [] })
    .then(async (result) => {
      await objConn.close();
      return true;
    })
    .catch(async (err) => {
      await objConn.closeRollback();
      throw err;
    });

  }

  /**
   * @description Atualiza o status que indica o envio da ASN
   *
   * @async
   * @function updateStatusASN   
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.CARGA ID da carga
   * @param {Number} req.body.STINTCLI Status que define qual documento deve ser gerado
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 03/2018
  */
  api.updateStatusASN = async function (req, res, next) {		 

    var objConn = await this.controller.getConnection(objConn);

    await objConn.update({
      tabela: 'G048',
      colunas: {
        STINTCLI: req.body.STINTCLI
      },
      condicoes: 'IDG046 = :id',
      parametros: {
        id: req.body.CARGA
      }

    }).then((result) => {
      objConn.close();  
      return {response: req.__('tr.sucesso.update')};

    }).catch((err) => {
      objConn.closeRollback();  
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    });

  }

  /**
   * @description Verifica a etapa da delivery antes de fazer o cancelamento da carga
   *
   * @async
   * @function verificaEtapaDelivery   
   * @param {Object} req Possui as requisições para a função.
   * @param {Number} req.IDG046 ID da carga
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 16/07/2018
  */
 api.verificaEtapaDelivery = async function (req, res, next) {		 

  var objConn = await this.controller.getConnection(req.objConn);
  var sql = `SELECT 
                G046.IDG046, 
                G043.IDG043,
                G043.STETAPA
            FROM G043
            INNER JOIN G049 ON G049.IDG043 = G043.IDG043
            INNER JOIN G048 ON G048.IDG048 = G049.IDG048
            INNER JOIN G046 ON G046.IDG046 = G048.IDG046
            WHERE G046.IDG046 = ${req.IDG046}
              AND G043.STETAPA > 2`;

  return await objConn.execute({ sql, param: [] })
    .then(async (result) => {
        await objConn.close();  
        return result;
    })
    .catch(async (err) => {
        await objConn.closeRollback();  
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
    });
  }

  api.buscarMilestone = async function (req, res, next) {		 

    var objConn = await this.controller.getConnection(req.objConn);
    var idParada = req.body.idParada;
    var sql = 
              `SELECT 
              CARGA.IDG046    		IDCARGA

            , PARADA.IDG048     		IDPARADA
            , PARADA.NRSEQETA   		NRETAPA

            , CIDORI.NMCIDADE   		NMCIDORI
            , CIDDES.NMCIDADE   		NMCIDDES

            , EVENTO.DSEVENTO			DSEVENTO

            , REASONCODE.IDREACOD 		IDREACOD
            , REASONCODE.IDI007


            , MSTONE.IDI013				IDMSTONE
            , MSTONE.IDI001				IDEVENTO
            , MSTONE.STENVIO			STENVIO
            , MSTONE.STPROPOS			STMSTONE

            , TO_CHAR(MSTONE.DTALTEVE, 'YYYYMMDD') || 'T' || TO_CHAR(MSTONE.DTALTEVE, 'HH24:MI:SS') DTALTEVE
            , TO_CHAR(MSTONE.DTALTEVE, 'DD/MM/YYYY HH24:MI') DTALTERA
            , TO_CHAR(MSTONE.DTEVENTO, 'DD/MM/YYYY HH24:MI') DTEVENTO

                FROM G046 CARGA 

                INNER JOIN G048 PARADA 
                  ON PARADA.IDG046 = CARGA.IDG046

                INNER JOIN G005 ORIGEM
                  ON ORIGEM.IDG005 = PARADA.IDG005OR

                INNER JOIN G005 DESTINO
                  ON DESTINO.IDG005 = PARADA.IDG005DE
                  
                INNER JOIN G003 CIDORI
                  ON CIDORI.IDG003 = ORIGEM.IDG003

                INNER JOIN G003 CIDDES
                  ON CIDDES.IDG003 = DESTINO.IDG003							
                  
                INNER JOIN I013 MSTONE
                  ON MSTONE.IDG048 = PARADA.IDG048
                  
                INNER JOIN I001 EVENTO
                  ON EVENTO.IDI001 = MSTONE.IDI001
                  
                LEFT JOIN I007 REASONCODE
                  ON REASONCODE.IDI007 = MSTONE.IDI007							
                  
                WHERE CARGA.SNDELETE = 0
                  AND MSTONE.SNDELETE = 0							
                  AND MSTONE.STPROPOS IN ('C', 'A', 'R')
                  AND MSTONE.STENVIO = 1 
                  AND PARADA.IDG048 = ${idParada}
                  
                ORDER BY CARGA.IDG046, PARADA.NRSEQETA, 
                PARADA.IDG048, MSTONE.DTEVENTO`;
  
    return await objConn.execute({ sql, param: [] })
      .then(async (result) => {
          await objConn.close();  
          return result;
      })
      .catch(async (err) => {
          await objConn.closeRollback();  
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      });
    }

    api.countCargaNotaPorDelivery = async function (objDelivery) {
      return await db.execute(
        {
          sql: `select count(distinct G049.IDG043) as qtd_nf, count(distinct G046.IDG046 ) as qtd_carga, G046.IDG046
              from G049 G049
              join G048 G048 on G048.IDG048= G049.IDG048
              join G046 G046 on G046.IDG046 = G048.IDG046
              join G043 G043 on G043.IDG043 = G049.IDG043
              where 
                  to_number(SUBSTR(G043.CDdelive, 2, 20)) in (${objDelivery})
                  AND LENGTH(G043.CDdelive) = 11
                  and g049.IDG051 is null
                  and G046.SnDelete = 0
                                and G043.SnDelete = 0
                  and G046.StCarga <> 'C'
                  Group by G046.IDG046`,
          param: []
        })
  
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          throw err;
        });
    }


    api.countCargaNotaPorIdDelivery = async function (objDelivery) {
      objDelivery = objDelivery.length == 0 ? '0' : objDelivery;
      return await db.execute(
        {
          sql: `select count(distinct G049.IDG043) as qtd_nf, count(distinct G046.IDG046 ) as qtd_carga, 
                G046.IDG046, listagg(G046.IDG046,',') within group (order by G046.IDG046) AS cargas
              from G049 G049
              join G048 G048 on G048.IDG048= G049.IDG048
              join G046 G046 on G046.IDG046 = G048.IDG046
              join G043 G043 on G043.IDG043 = G049.IDG043
              where 
                  G043.idg043 in (${objDelivery})
                  AND LENGTH(G043.CDdelive) = 11
                  and g049.IDG051 is null
                  and G046.SnDelete = 0
                  and G043.SnDelete = 0
                  and nvl(G043.StEtapa,0) NOT IN (7,8)
                  and G046.StCarga <> 'C'
                  Group by G046.IDG046`,
          param: []
        })
  
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          throw err;
        });
    }

    api.cargaPorIdDelivery = async function (objDelivery) {
      return await db.execute(
        {
          sql: `select listagg(G046.IDG046,',') within group (order by G046.IDG046) AS cargas
          from G049 G049
          join G048 G048
            on G048.IDG048 = G049.IDG048
          join G046 G046
            on G046.IDG046 = G048.IDG046
          join G043 G043
            on G043.IDG043 = G049.IDG043
         where G043.idg043 in (${objDelivery})
           AND LENGTH(G043.CDdelive) = 11
           and G046.SnDelete = 0
           and G043.SnDelete = 0
           and G046.StCarga <> 'C'`,
          param: []
        })
  
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          throw err;
        });
    }


  return api;

};

