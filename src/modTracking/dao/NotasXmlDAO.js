module.exports = function (app, cb) {

      var api = {};
      var db = app.config.database;
      var utils = app.src.utils.FuncoesObjDB;
      var dicionario = app.src.utils.Dicionario;

      api.listarNotasXml = async function (req, res, next) {
        var sqlWhere = null;
        var sqlJoin = null;

        var tabDeliveries = dicionario.nomeTabela("Deliveries");
        var tabClient = dicionario.nomeTabela("Cliente");

        if(req.method == "POST"){
          [sqlWhere,sqlJoin] = utils.buildWhere(req.body.filtros);  
        }else{
          [sqlWhere,sqlJoin] = utils.buildWhere(["G043"],true);
        }

        return await db.execute(
          {
            sql: `SELECT DISTINCT
                        DELIVERY.IDG043,
                        DELIVERY.DTENTREG,
                        DELIVERY.CDDELIVE,
                        DELIVERY.STETAPA,
                        DELIVERY.NRNOTA,
                        TO_CHAR(DELIVERY.DTDELIVE, 'DD/MM/YYYY') DTDELIVE,
                        TO_CHAR(DELIVERY.DTENTREG, 'DD/MM/YYYY') DTENTREG,

                        REMETENTE.CJCLIENT,
                        REMETENTE.NMCLIENT,
                        REMETENTE.NMCLIENT NMREMETENTE,
                        TO_CHAR(PARADA.DTPREATU, 'DD-MM-YYYY') DTPREATU,
                        PARADA.DTENTCON,

                        TO_CHAR(PARADA.DTENTCON, 'DD/MM/YYYY') DTENTCONF,
                        TO_CHAR(PARADA.DTPREATU, 'DD/MM/YYYY') DTPREATUF,

                        TO_CHAR(CARGA.DTSAICAR, 'DD/MM/YYYY HH24:mi:ss') DTSAICARF,
                        CARGA.DTSAICAR,

                        DELIVERY.CJDESTIN,
                        DESTINATARIO.NMCLIENT NMDESTINATARIO,
                        DESTINATARIO.CJCLIENT AS CNPJ,
                        DE_CTE.IDG051 IDG051

                  FROM G043 DELIVERY

                  INNER JOIN G005 DESTINATARIO
                    ON DESTINATARIO.IDG005 = DELIVERY.IDG005DE

                  INNER JOIN G005 REMETENTE

                    ON REMETENTE.IDG005 = DELIVERY.IDG005RE

                  INNER JOIN G049 RELCARGA
                    ON RELCARGA.IDG043 = DELIVERY.IDG043

                  INNER JOIN G048 PARADA
                    ON PARADA.IDG048 = RELCARGA.IDG048

                  INNER JOIN G046 CARGA
                    ON CARGA.IDG046 = PARADA.IDG046
                  
                  INNER JOIN G052 DE_CTE
                    ON DE_CTE.IDG043 = DELIVERY.IDG043 

                  WHERE
                  DELIVERY.STETAPA = 3 OR
                  DELIVERY.STETAPA = 4 OR
                  DELIVERY.STETAPA = 5 OR
                  DELIVERY.STETAPA = 6 AND
                  --DELIVERY.SNLIBROT = 1
                  DELIVERY.SNDELETE = 0
      
                  AND (DELIVERY.DTENTREG IS NULL) OR
                  (TRUNC(DELIVERY.DTENTREG) > TRUNC(SYSDATE - 30))`,


                  param: []
          })
          .then((result) => {
            return (result);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
      }


  api.listarNotasXmlOrdenado = async function (diasEntrega, diasCte) {
    return await db.execute(
      {
        sql: `SELECT DISTINCT
                        DELIVERY.IDG043,
                        (TO_DATE(CURRENT_DATE, 'DD/MM/YYYY') -  TO_DATE(DELIVERY.DTENTREG, 'DD/MM/YYYY')) AS DIFERENCA_ENTREGA,
                        (TO_DATE(CURRENT_DATE, 'DD/MM/YYYY') -  TO_DATE(CONHECIMENTO.DTEMICTR, 'DD/MM/YYYY')) AS DIFERENCA_EMISSAO,
                        DELIVERY.DTENTREG AS DELIVERY_DTENTREG,
                        DELIVERY.CDDELIVE,
                        DELIVERY.STETAPA,
                        DELIVERY.NRNOTA,
                        TO_CHAR(DELIVERY.DTDELIVE, 'DD/MM/YYYY') DTDELIVE,
                        TO_CHAR(DELIVERY.DTENTREG, 'DD/MM/YYYY') DTENTREG,

                        REMETENTE.CJCLIENT,
                        REMETENTE.NMCLIENT,
                        REMETENTE.NMCLIENT NMREMETENTE,
                        TO_CHAR(PARADA.DTPREATU, 'DD-MM-YYYY') DTPREATU,
                        TO_CHAR(PARADA.DTPREATU, 'DD/MM/YYYY') DATA_ENTREGA,
                        TO_CHAR(DELIVERY.DTENTCON, 'DD/MM/YYYY') ENTREGA_CONTRATUAL,
                        PARADA.DTENTCON,

                        TO_CHAR(PARADA.DTENTCON, 'DD/MM/YYYY') DTENTCONF,
                        TO_CHAR(PARADA.DTPREATU, 'DD/MM/YYYY') DTPREATUF,

                        TO_CHAR(CARGA.DTSAICAR, 'DD/MM/YYYY HH24:mi:ss') DTSAICARF,
                        CARGA.DTSAICAR,

                        DELIVERY.CJDESTIN,
                        DESTINATARIO.NMCLIENT NMDESTINATARIO,
                        REMETENTE.CJCLIENT AS CNPJ,
                        DE_CTE.IDG051 IDG051,
                        CONHECIMENTO.DTEMICTR AS CTE_EMISSAO

                  FROM G043 DELIVERY

                  INNER JOIN G005 DESTINATARIO
                    ON DESTINATARIO.IDG005 = DELIVERY.IDG005DE

                  INNER JOIN G005 REMETENTE

                    ON REMETENTE.IDG005 = DELIVERY.IDG005RE

                  INNER JOIN G049 RELCARGA
                    ON RELCARGA.IDG043 = DELIVERY.IDG043

                  INNER JOIN G048 PARADA
                    ON PARADA.IDG048 = RELCARGA.IDG048

                  INNER JOIN G046 CARGA
                    ON CARGA.IDG046 = PARADA.IDG046
                  
                  INNER JOIN G052 DE_CTE
                    ON DE_CTE.IDG043 = DELIVERY.IDG043 
                    
                  LEFT JOIN G051 CONHECIMENTO
                    ON DE_CTE.IDG051 = CONHECIMENTO.IDG051
                    
                  

                  WHERE     DELIVERY.STETAPA IN(3,4,5,6) 
                  AND       DELIVERY.SNDELETE = 0      
                  AND       ((DELIVERY.DTENTREG IS NULL)         
                        OR        (TRUNC(DELIVERY.DTENTREG) > TRUNC(SYSDATE - 30)))
                  AND       ((DELIVERY.DTENTCON IS NOT NULL) OR (PARADA.DTPREATU IS NOT NULL))
                  AND       (DELIVERY.NRNOTA IS NOT NULL)
                  AND       (TO_DATE(CURRENT_DATE, 'DD/MM/YYYY') -  NVL(TO_DATE(DELIVERY.DTENTREG, 'DD/MM/YYYY'), TO_DATE(CURRENT_DATE, 'DD/MM/YYYY'))) < ` + diasEntrega +`      
                  AND       (TO_DATE(CURRENT_DATE, 'DD/MM/YYYY') -  TO_DATE(CONHECIMENTO.DTEMICTR, 'DD/MM/YYYY')) < ` + diasCte +`
                  AND       CARGA.SNDELETE = 0

                        
                  ORDER BY CNPJ
`,


        param: []
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

      return api;

    };
