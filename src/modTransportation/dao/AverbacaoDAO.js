/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de Apolice
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/Apolice
 * @description G047.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;
  var parser = require('jstoxml');


  /**
   * @description Listar um dados da tabela G047.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.indicadores = async function (req, res, next) {

    logger.debug("Inicio indicadores");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);


      let whereAux = `
      
        AND g051.DTEMICTR >= (sysdate-2)
        AND g051.STCTRC   = 'A'
        AND G051.SNDELETE = 0
        /*AND G051.NRCHADOC IS NOT NULL*/

      `;

      let result1 = await con.execute(
        {
          sql: ` 
          
          /* CTRC */

          SELECT COUNT(G051.IDG051) AS QTD 
            FROM G051 G051 
           WHERE 1 = 1
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result2 = await con.execute(
        {
          sql: ` 
          
          /* CTRC com XML*/

          SELECT COUNT(G051.IDG051) AS QTD
            FROM G051 G051
            JOIN F004 F004
              ON (F004.NRCHADOC = G051.NRCHADOC OR
                  G051.IDF004 = F004.IDF004)
           WHERE 1 = 1
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result3 = await con.execute(
      {
        sql: ` 
        
        /* CTRC com XML averbados */

        SELECT COUNT(G051.IDG051) AS QTD
          FROM G051 G051
          JOIN F004 F004
            ON (F004.NRCHADOC = G051.NRCHADOC OR G051.IDF004 = F004.IDF004)
        WHERE 1 = 1
          AND G051.NRPROAVE IS NOT NULL

        `+ whereAux,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });



    let result4 = await con.execute(
      {
        sql: ` 
        
        /* CTRC com XML não averbados */

        SELECT COUNT(G051.IDG051) AS QTD
          FROM G051 G051
          JOIN F004 F004
            ON (F004.NRCHADOC = G051.NRCHADOC OR G051.IDF004 = F004.IDF004)
         WHERE 1 = 1
           AND G051.NRPROAVE IS NULL

        `+ whereAux,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result5 = await con.execute(
        {
          sql: ` 
          
          /* CTRC com erro averbacao */

          SELECT COUNT(G051.IDG051) AS QTD
            FROM G051 G051
            JOIN F004 F004
              ON (F004.NRCHADOC = G051.NRCHADOC OR
                  G051.IDF004 = F004.IDF004)
           WHERE 1 = 1
             AND NVL(G051.STAVERBA,
                'N') = 'E'
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result11 = await con.execute(
        {
          sql: ` 
          
          /* CTRC */

          SELECT COUNT(G051.IDG051) AS QTD 
            FROM G051 G051 
           WHERE 1 = 1
             AND G051.NRCHADOC IS NULL
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result22 = await con.execute(
        {
          sql: ` 
          
          /* CTRC com XML*/

          SELECT COUNT(G051.IDG051) AS QTD
            FROM G051 G051
            JOIN F004 F004
              ON (F004.NRCHADOC = G051.NRCHADOC OR
                  G051.IDF004 = F004.IDF004)
           WHERE 1 = 1
             AND G051.NRCHADOC IS NULL
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result33 = await con.execute(
      {
        sql: ` 
        
        /* CTRC com XML averbados */

        SELECT COUNT(G051.IDG051) AS QTD
          FROM G051 G051
          JOIN F004 F004
            ON (F004.NRCHADOC = G051.NRCHADOC OR G051.IDF004 = F004.IDF004)
        WHERE 1 = 1
          AND G051.NRPROAVE IS NOT NULL
          AND G051.NRCHADOC IS NULL

        `+ whereAux,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });



    let result44 = await con.execute(
      {
        sql: ` 
        
        /* CTRC com XML não averbados */

        SELECT COUNT(G051.IDG051) AS QTD
          FROM G051 G051
          JOIN F004 F004
            ON (F004.NRCHADOC = G051.NRCHADOC OR G051.IDF004 = F004.IDF004)
         WHERE 1 = 1
           AND G051.NRPROAVE IS NULL
           AND G051.NRCHADOC IS NULL

        `+ whereAux,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });


      let result55 = await con.execute(
        {
          sql: ` 
          
          /* CTRC com erro averbacao */

          SELECT COUNT(G051.IDG051) AS QTD
            FROM G051 G051
            JOIN F004 F004
              ON (F004.NRCHADOC = G051.NRCHADOC OR
                  G051.IDF004 = F004.IDF004)
           WHERE 1 = 1
             AND NVL(G051.STAVERBA,
                'N') = 'E'
            AND G051.NRCHADOC IS NULL
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });




      let objResult = [
          {
              label:"Total "+result1,
              indNum:(result1-result11)+'/'+result11,
              bgColor:"rgb(93, 199, 215)",
              icon:"fas fa-list",
              filtParam:"0"
          },
          {
              label:"XML "+result2,
              indNum:(result2-result22)+'/'+result22,
              bgColor:"rgb(78, 126, 199)",
              icon:"fas fa-file-code",
              filtParam:"2"
          },
          {
            label:"Averbados "+result3,
            indNum:(result3-result33)+'/'+result33,
            bgColor:"rgba(91, 193, 123, 0.94)",
            icon:"far fa-money-bill-alt",
            filtParam:"2"
          },
          {
            label:"Pendentes "+result4,
            indNum:(result4-result44)+'/'+result44,
            bgColor:"rgba(255, 172, 47, 0.94)",
            icon:"fas fa-ellipsis-h",
            filtParam:"2"
          }
          
        ];

        if(result5 > 0){
          objResult.push({
            label:"Erro "+result5,
            indNum:(result5-result55)+'/'+result55,
            bgColor:"rgb(255, 0, 0)",
            icon:"far fa-times-circle",
            filtParam:"2"
          });
        }
      

      
      

      

      await con.close();
      logger.debug("Fim indicadores");
      return objResult;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description Listar um dados da tabela G047.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.notificacao = async function (req, res, next) {

    logger.debug("Inicio notificacao");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      let whereAux = `
      
      AND g051.DTEMICTR >= (sysdate-2)
      AND g051.STCTRC   = 'A'
      AND G051.SNDELETE = 0
      /*AND G051.NRCHADOC IS NOT NULL*/

      `;

      /*
      let result1 = await con.execute(
        {
          sql: ` 
          
          --CTRC com XML averbados no periodo

          select DTAVERBA from 
          (
          SELECT max(G051.DTAVERBA) as DTAVERBA
            FROM g051 g051
          --JOIN f004 f004 ON f004.idf004 = g051.idf004
          JOIN f004 f004 ON (f004.NRCHADOC = g051.NRCHADOC or g051.idf004 = f004.idf004)
          WHERE 1 = 1
          AND nvl(g051.staverba,'N') = 'S'
          
          ${whereAux} 
          ) x where x.DTAVERBA >= CURRENT_DATE - 600 /(24 * 60 * 60)
          

          `,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      */

      let result2 = await con.execute(
        {
          sql: ` 
          
          /* CTRC sem averbacao em 30 minutos depois da emissão */

          SELECT COUNT(G051.IDG051) AS QTD
            FROM G051 G051
            JOIN F004 F004
              ON (F004.NRCHADOC = G051.NRCHADOC OR G051.IDF004 = F004.IDF004)
           WHERE 1 = 1
             AND G051.NRPROAVE IS NULL
             AND G051.DTEMICTR <= CURRENT_DATE + 1800 / (24 * 60 * 60)
             AND G051.DTEMICTR >= (SYSDATE - 2)
          
          `+ whereAux,
          param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result[0].QTD;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      let objResult = {
        pendentes: result2
      };


      await con.close();
      logger.debug("Fim notificacao");
      return objResult;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Listar um dado na tabela G047.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.getCteXml = async function (tpUser) {

    logger.debug("Inicio getCteXml");
    let con = await this.controller.getConnection();

    try {

      //# AT&M - Usuario referente a interface, possui dois devido ao cnpj da empresa 81
      //# 1 - bravo
      //# 2 - bravolog

      let whereAux = "";

      if(tpUser == 1){
        whereAux = " AND g051.idg024 not in (37) "; //# sem ibipora
      }else{
        whereAux = " AND g051.idg024 in (37) "; //# com ibipora
      }

      let result = await con.execute(
      {
        sql: ` 
          SELECT F004.IDF004, 
                 F004.NRCHADOC, 
                 F004.TXXML, 
                 F004.DTLANCTO, 
                 F004.TPXML,
                 G051.IDG051
            FROM G051 G051
            JOIN F004 F004 ON (F004.NRCHADOC = G051.NRCHADOC OR G051.IDF004 = F004.IDF004)
           WHERE 1 = 1
             AND NVL(G051.STAVERBA,'N') IN ('N', 'E')
             /*AND G051.NRPROAVE = '5AL11I529K4P5V4L185F9O7C5ER2SQVSTXR'*/
             /*AND G051.NRCHADOC  IS NOT NULL*/
             AND G051.STCTRC <> 'C'
             /*AND G051.nrchadoc = '43200200950001001411570000000088351803066518'*/
             AND ROWNUM <= 50
             AND trunc(G051.DTEMICTR) >= trunc(SYSDATE-2)
             ${whereAux}
        ORDER BY G051.DTEMICTR DESC 
        `,
        param: {},
        fetchInfo: ["TXXML"]
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      await con.close();
      logger.debug("Fim getCteXml");

      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };



  /**
   * @description Listar um dado na tabela G047.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.updateCte = async function (obj, resultSend) {

    logger.debug("Inicio updateCte");
    let con = await this.controller.getConnection();
    try {

      var id = obj.IDG051;

      // var resultCte = await con.execute({
      //   sql: ` SELECT NVL(MAX(IDG108),0) AS IDG108 FROM G108 G108 WHERE G108.NRAVERBA = '${obj.NRAVERBA}' `,
      //   param: {}
      //   }).then((res) => {
      //       return res[0];
      //   }).catch((err) => {
      //       throw err;
      //   });

        //# não averbado anteriormente
        //if (resultCte.IDG108 == 0) {

          let result = await
          con.insert({
          tabela: 'G108',
          colunas: {

            IDG051:   obj.IDG051,
            DTCADAST: new Date(),
            NRAVERBA: obj.NRAVERBA,
            CJSEGURA: obj.CJSEGURA,
            NMSEGURA: obj.NMSEGURA,
            NRAPOLIC: obj.NRAPOLIC,
            VRAVERBA: obj.VRAVERBA,
            TPRESSEG: 1,
            CJRESSEG: null,
          
          },
          key: 'IDG108'
        })
          .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
          });
        //}


          let result2 = await
          con.update({
            tabela: 'G051',
            colunas: {
  
              STAVERBA: obj.STAVERBA,
              DTAVERBA: new Date (obj.DTAVERBA),
              NRPROAVE: obj.NRPROAVE,
  
            },
            condicoes: 'IdG051 = :id',
            parametros: {
              id: id
            }
          })
            .then((result1) => {
            return result1;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
            });


        let objReturn = {
          IDS032:14,
          IDS001:169,
          STATREQ:"Sucesso - "+obj.IDG051,
          STATDETA: "S",
          TXMENSAG: JSON.stringify(resultSend),
          CDRETORN: null
        };

      let aux = await this.setMovInterface(objReturn, con);

      await con.close();
      logger.debug("Fim updateCte");
      return true;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };



    /**
   * @description Listar um dado na tabela G047.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.getDadosCIOT = async function () {

    logger.debug("Inicio getDadosCIOT");
    let con = await this.controller.getConnection();

    try {

      let objDadosCarga = await con.execute(
      {
        sql: ` 
        SELECT G046.IDG046,
        G024.CJTRANSP,
        G024.IETRANSP,
        G024.RSTRANSP,
        
        G003OR.CDMUNICI AS IBGEOR,
        G003DE.CDMUNICI AS IBGEDE,
        
        REPLACE(REPLACE(NVL(G032_1.NRPLAVEI,
                  G046.NRPLAVEI),
                '-'),
            ' ') AS NRPLAVEI0, /* Número da Placa 1 */
        REPLACE(REPLACE(NVL(G032_1.NRPLAVEI,
                  G046.NRPLAVEI),
                '-'),
            ' ') AS NRPLAVEI1, /* Número da Placa 1 */
        REPLACE(G032_2.NRPLAVEI,
            '-') AS NRPLAVEI2, /* Número da Placa 2 */
        REPLACE(G032_3.NRPLAVEI,
            '-') AS NRPLAVEI3, /* Número da Placa 3 */
        
        (SELECT LISTAGG(REPLACE(REPLACE(A.NRPLAVEI,
                        '-'),
                    ' '),
                ',') WITHIN GROUP(ORDER BY A.NRPLAVEI)
         FROM G032 A
         JOIN G026 B
         ON B.IDG032CR = A.IDG032
        WHERE B.IDG032CV = G032_1.IDG032) AS DSPLACAR,
        
        (REPLACE(REPLACE(G046.NRPLARE1,
               '-'),
           ' ') || ',' || REPLACE(REPLACE(G046.NRPLARE2,
                           '-'),
                       ' ')) AS DSPLACAR2,
        
        /* Origem */
        G024.IDG003     AS IDG003OR, /* Código da Cidade */
        G028.NMARMAZE   AS NMCIDADEOR, /* Nome da Cidade */
        G024.DSENDERE   AS DSENDEREOR, /* Descrição do Endereço da Origem */
        G024.NRENDERE   AS NRENDEREOR, /* Número da Origem */
        G024.DSCOMEND   AS DSCOMENDOR, /* Complemento da Origem */
        G024.BIENDERE   AS BIENDEREOR, /* Bairro da Origem */
        G024.CPENDERE   AS CPENDEREOR, /* Cep da Origem */
        G002OR.CDESTADO AS CDESTADOOR, /* Estado da Origem */
        G001OR.NMPAIS   AS NMPAISOR, /* Nome do País Origem */
        G028.NRLATITU   AS NRLATITUOR, /* Latitude Origem */
        G028.NRLONGIT   AS NRLONGITOR, /* Longitude Origem */
        
        /* Destinatário */
        G005DE.IDG003 AS IDG003DE, /* Código da Cidade Destinatário */
        G003DE.NMCIDADE AS NMCIDADEDE, /* Nome da Cidade Destinatário */
        G005DE.DSENDERE AS DSENDEREDE, /* Descrição do Endereço da Destinatário */
        G005DE.NRENDERE AS NRENDEREDE, /* Número da Destinatário */
        G005DE.DSCOMEND AS DSCOMENDDE, /* Complemento da Destinatário */
        G005DE.BIENDERE AS BIENDEREDE, /* Bairro da Destinatário */
        G005DE.CPENDERE AS CPENDEREDE, /* Cep da Destinatário */
        G002DE.CDESTADO AS CDESTADODE, /* Estado da Destinatário */
        G001DE.NMPAIS AS NMPAISDE, /* Nome do País Destinatário */
        NVL(G005DE.NRLATITU,
          G003DE.NRLATITU) AS NRLATITUDE, /* Latitude Destinatário */
        NVL(G005DE.NRLONGIT,
          G003DE.NRLONGIT) AS NRLONGITDE /* Longitude Destinatário */
   
     FROM G046 G046
   
     JOIN G024 G024
     ON G024.IDG024 = G046.IDG024
      AND G024.IDG023 = 2
   
     JOIN G048 G048DE /* Paradas Destinatário */
     ON (G048DE.IDG046 = G046.IDG046 AND
        G048DE.NRSEQETA =
        (SELECT MAX(G048DE_2.NRSEQETA)
          FROM G048 G048DE_2
         WHERE G048DE_2.IDG046 = G048DE.IDG046))
     JOIN G005 G005DE /* Cliente Destinatário */
     ON (G005DE.IDG005 = G048DE.IDG005DE)
     JOIN G003 G003DE /* Cidade do Destinatário */
     ON (G003DE.IDG003 = G005DE.IDG003)
     JOIN G002 G002DE /* Estado do Destinatário*/
     ON (G002DE.IDG002 = G003DE.IDG002)
     JOIN G001 G001DE /* País Destinatário */
     ON (G001DE.IDG001 = G002DE.IDG001)
   
     JOIN G003 G003OR /* Cidade Origem */
     ON (G003OR.IDG003 = G024.IDG003)
     JOIN G002 G002OR /* Estado Origem */
     ON (G002OR.IDG002 = G003OR.IDG002)
     JOIN G001 G001OR /* País Origem */
     ON (G001OR.IDG001 = G002OR.IDG001)
   
     JOIN G028 G028 /* Armazém */
     ON (G028.IDG028 = G046.IDG028)
   
     LEFT JOIN G032 G032_1 /* Veículos 1 */
     ON (G032_1.IDG032 = G046.IDG032V1)
     LEFT JOIN G032 G032_2 /* Veículos 2 */
     ON (G032_2.IDG032 = G046.IDG032V2)
     LEFT JOIN G032 G032_3 /* Veículos 3 */
     ON (G032_3.IDG032 = G046.IDG032V3)
   
    WHERE 1 = 1
      AND G046.STCARGA IN ('A',
               'T',
               'S')
      AND G046.IDG046 = 1109991
        `,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      if(objDadosCarga.length > 0 ){

        let objModel = [];

        //# CNPJ da contratante 
        objModel["viagem.contratante.documento.numero"] = objDadosCarga[0].CJCLIENTEMB; //#OK

        // objModel["viagem.unidade.documento.tipo"] = "(1 cnpj , 2 cpf)";
        // objModel["viagem.unidade.documento.numero"] = "cnpj ou cpf";

        //# Quantidade de favorecidos
        objModel["viagem.favorecido.qtde"] = 1; //#OK

        //# Dados favorecido
        //# Tipo favorecido - 1 contratado, 2 sub con, 3 motorista ... tab 15
        objModel["viagem.favorecido1.tipo"] = 1; //#OK

        objModel["viagem.favorecido1.documento.qtde"] = 1; //#OK

        // Tipo de cocumento - 1 cnpj, 2 cpf, 3 rg [..] - tab2
        objModel["viagem.favorecido1.documento1.tipo"] = 1; //#OK
        objModel["viagem.favorecido1.documento1.numero"] = objDadosCarga[0].CJTRANSP; //#OK 
  
        
        objModel["viagem.favorecido1.nome"] = objDadosCarga[0].NMTRANSP;  //#OK 
        //objModel["viagem.favorecido1.data.nascimento"] = objDadosCarga[0].DTNASCIM;
        objModel["viagem.favorecido1.endereco.logradouro"] = objDadosCarga[0].DSENDERE;  //#OK 
        objModel["viagem.favorecido1.endereco.numero"] = objDadosCarga[0].NRENDERE;  //#OK 
        objModel["viagem.favorecido1.endereco.bairro"] = objDadosCarga[0].BIENDERE;  //#OK 
        objModel["viagem.favorecido1.endereco.cep"] = objDadosCarga[0].CPENDERE;  //#OK 
        
        objModel["viagem.favorecido1.telefone.ddd"] = objDadosCarga[0].NRTELDDD;  //#OK 
        objModel["viagem.favorecido1.telefone.numero"] = objDadosCarga[0].NRTELEFO; //#OK 
        
        
        //# Meio de pagamento 1- Cartao, 2- conta deposito
        objModel["viagem.favorecido1.meio.pagamento"] = 2;
        
        objModel["viagem.favorecido1.conta.banco"] = " ";
        objModel["viagem.favorecido1.conta.agencia"] = " ";
        objModel["viagem.favorecido1.conta.agencia.digito"] = "  ";
        objModel["viagem.favorecido1.conta.numero"] = " ";
        objModel["viagem.favorecido1.conta.tipo"] = " ";

        
        //# Dados 
        objModel["viagem.favorecido1.empresa.nome"] = objDadosCarga[0].NMTRANSP;
        objModel["viagem.favorecido1.empresa.cnpj"] = objDadosCarga[0].CJTRANSP;

        //# Empresa 81 com cnpj diferente - PR
        if(objDadosCarga[0].IDG024 == 37){
          objModel["viagem.favorecido1.empresa.rntrc"] = "12074070";
        }else{
          objModel["viagem.favorecido1.empresa.rntrc"] = "00081771";
        }
        
        //# Código unico validacao pamcard
        objModel["viagem.id.cliente"] = objDadosCarga[0].IDG046;
        
        //# Placa veículo
        objModel["viagem.veiculo.placa"] = objDadosCarga[0].NRPLAVEI;

        //# Data de saida
        objModel["viagem.data.partida"] = objDadosCarga[0].DTPSMANU;

        //# Data término
        objModel["viagem.data.termino"] = objDadosCarga[0].DTPSMANU;


        //# Veiculos
        objModel["viagem.veiculo.qtde"] = objDadosCarga[0].DTPSMANU;

        objModel["viagem.veiculoN.placa"] = objDadosCarga[0].DTPSMANU;
        objModel["viagem.veiculoN.rntrc"] = objDadosCarga[0].DTPSMANU;

        objModel["viagem.distancia.km"] = objDadosCarga[0].DTPSMANU;

        objModel["viagem.carga.tipo"] = objDadosCarga[0].DTPSMANU;

        objModel["viagem.carga.natureza"] = objDadosCarga[0].DTPSMANU;

        objModel["viagem.carga.peso"] = objDadosCarga[0].DTPSMANU;


        //# Documento informado
        //# Tabela 1
        objModel["viagem.documento.qtde"] = 1;
        objModel["viagem.documento1.tipo"] = 1;
        objModel["viagem.documento1.numero"] = objDadosCarga[0].IDG046;


        //# Pessoa fiscal
        objModel["viagem.documento1.pessoafiscal.qtde"] = 1;
        objModel["viagem.documento1.pessoafiscal.tipo"] = 3; // Consignatario

        objModel["viagem.documento1.pessoafiscal1.tipo"] = 10101010; 





        //# Código IBGE
        objModel["viagem.origem.cidade.ibge"] = objDadosCarga[0].IBGEOR;
        objModel["viagem.destino.cidade.ibge"] = objDadosCarga[0].IBGEDE;

        //# lat/long origem
        objModel["viagem.origem.cidade.latitude"] = objDadosCarga[0].NRLATITUOR;
        objModel["viagem.origem.cidade.longitude"] = objDadosCarga[0].NRLONGITOR;
        
        //# lat/long destino
        objModel["viagem.destino.cidade.latitude"] = objDadosCarga[0].NRLATITUDE;
        objModel["viagem.destino.cidade.longitude"] = objDadosCarga[0].NRLONGITDE;
        
        //# Categoria do veículo
        objModel["viagem.veiculo.categoria"] = objDadosCarga[0].CDCATEGO;
        
        //# Frete
        objModel["viagem.frete.valor.bruto"] = 0;//objDadosCarga[0].xxxx;

        objModel["viagem.frete.item.qtde"] = 0;//objDadosCarga[0].xxxx;
        objModel["viagem.frete.item1.tipo"] = 0;//objDadosCarga[0].xxxx;
        objModel["viagem.frete.item1.tarifa.quantidade"] = 0;//objDadosCarga[0].xxxx;
        objModel["viagem.frete.item1.valor"] = 0;//objDadosCarga[0].xxxx;

        objModel["viagem.parcela.qtde"] = 0;
        
        let objXml = {arg0:[]};
        objXml.arg0.push({context:'InsertFreightContract'});

        for (let keyValue in objModel) {
          //console.log(keyValue, objModel[keyValue]);
          objXml.arg0.push({fields:{key:keyValue, value:objModel[keyValue]}});
        }

        //let xml = parser.toXML(objXml);

        return xml;
      }else{
        return 'sem cargas..';
      }



      await con.close();
      logger.debug("Fim getDadosCIOT");

      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };





    /**
   * @description Listar um dado na tabela G047.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.getDadosEncerramentoCIOT = async function () {

    logger.debug("Inicio getDadosEncerramentoCIOT");
    let con = await this.controller.getConnection();

    try {

      let objDadosCarga = await con.execute(
      {
        sql: ` 
        select * from g030
        `,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      if(objDadosCarga.length > 0 ){

        let objModel = [];

        //# CNPJ da contratante 
        objModel["viagem.contratante.documento.numero"] = objDadosCarga[0].XXXXX; 
        objModel["viagem.unidade.documento.tipo "]      = objDadosCarga[0].XXXXX; 
        objModel["viagem.unidade.documento.numero"]     = objDadosCarga[0].XXXXX; 
        objModel["viagem.id.cliente"]                   = objDadosCarga[0].XXXXX; 
        objModel["viagem.id "]                          = objDadosCarga[0].XXXXX; 
        objModel["viagem.antt.ciot.numero"]             = objDadosCarga[0].XXXXX; 
        objModel["viagem.frete.valor.bruto"]            = objDadosCarga[0].XXXXX; 
        objModel["viagem.frete.item.qtde"]              = objDadosCarga[0].XXXXX; 
        objModel["viagem.frete.itemN.tipo"]             = objDadosCarga[0].XXXXX; 
        objModel["viagem.frete.itemN.valor"]            = objDadosCarga[0].XXXXX; 
        objModel["viagem.carga.peso"]                   = objDadosCarga[0].XXXXX; 

        let objXml = {arg0:[]};
        objXml.arg0.push({context:'CloseFreightContract'});

        for (let keyValue in objModel) {
          //console.log(keyValue, objModel[keyValue]);
          objXml.arg0.push({fields:{key:keyValue, value:objModel[keyValue]}});
        }

        //let xml = parser.toXML(objXml);

        return xml;
      }else{
        return 'sem encerramentos..';
      }



      await con.close();
      logger.debug("Fim getDadosEncerramentoCIOT");

      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };





      /**
   * @description Listar um dado na tabela G047.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.getDadosCancelamentoCIOT = async function () {

    logger.debug("Inicio getDadosCancelamentoCIOT");
    let con = await this.controller.getConnection();

    try {

      let objDadosCarga = await con.execute(
      {
        sql: ` 
        select * from g030
        `,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

      if(objDadosCarga.length > 0 ){

        let objModel = [];

        //# CNPJ da contratante 
        objModel["viagem.contratante.documento.numero"] = objDadosCarga[0].XXXXX; 
        objModel["viagem.unidade.documento.tipo"]       = objDadosCarga[0].XXXXX; 
        objModel["viagem.unidade.documento.numero"]     = objDadosCarga[0].XXXXX; 
        objModel["viagem.id"]                           = objDadosCarga[0].XXXXX; 
        objModel["viagem.id.cliente"]                   = objDadosCarga[0].XXXXX; 
        objModel["viagem.antt.ciot.numero"]             = objDadosCarga[0].XXXXX; 
        objModel["viagem.antt.cancelamento.motivo"]     = objDadosCarga[0].XXXXX; 

        let objXml = {arg0:[]};
        objXml.arg0.push({context:'CancelTrip'});

        for (let keyValue in objModel) {
          //console.log(keyValue, objModel[keyValue]);
          objXml.arg0.push({fields:{key:keyValue, value:objModel[keyValue]}});
        }

        //let xml = parser.toXML(objXml);

        return xml;
      }else{
        return 'sem encerramentos..';
      }



      await con.close();
      logger.debug("Fim getDadosCancelamentoCIOT");

      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };



    /**
   * @description Atualizar um dado na tabela G047, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.updateCteError = async function (obj, resultSend) {

    logger.debug("Inicio updateCteError");
    let con = await this.controller.getConnection();
    try {

      var id = obj.IDG051;

      let result = await
        con.update({
          tabela: 'G051',
          colunas: {

            STAVERBA: obj.STAVERBA

          },
          condicoes: 'IdG051 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
          });


        let objReturn = {
          IDS032:14,
          IDS001:169,
          STATREQ:"Erro - "+obj.IDG051+ ' - ' + obj.DSERRO,
          STATDETA: "E",
          TXMENSAG: JSON.stringify(resultSend),
          CDRETORN: null
        };

      let aux = await this.setMovInterface(objReturn, con);

      await con.close();
      logger.debug("Fim updateCteError");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };


  /**
   * @description Atualizar um dado na tabela G047, .
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */

	api.setMovInterface = async function (obj, con) {
		try {

			//let con = await this.controller.getConnection(con);
			let resultS033, resultS034  = null;

			resultS033 = await con.insert({
				tabela: 'S033',
				colunas: {
					IDS032 : obj.IDS032,
					IDS001 : obj.IDS001,
					STATREQ : obj.STATREQ,
					CDRETORN: obj.CDRETORN,
					DTGERLOG : new Date(),
				},
					key: 'IDS033'
				})
				.then((result1) => {
					return (result1);
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});

				resultS034 = await con.insert({
					tabela: 'S034',
					colunas: {
						IDS033 : resultS033,
						STATDETA : obj.STATDETA,
						TXTMENSAG : obj.TXMENSAG,
						CDRETORN: obj.CDRETORN,
						DTGERLOG : new Date(),
					},
						key: 'IDS034'
					})
					.then((result1) => {
						return (result1);
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						throw err;
					});
					
			await con.close();
			return true;

		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}


  return api;
};
