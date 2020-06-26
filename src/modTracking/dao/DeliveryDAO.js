module.exports = function (app, cb) {

  var api = {};
  var db = app.config.database;
  var utils = app.src.utils.FuncoesObjDB;
  var conversor = app.src.utils.ConversorArquivos;
  var dicionario = app.src.utils.Dicionario;

  /**
     * @description responde a requisição da datagrid
     *
     * @function listarBusca            
     * @param   {Object} req    
     * @param   {Object} req.body    
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
  api.listarBusca = async function (req, res, next) {
    var sqlCanhot = ""
    switch (req.body["parameter[G043_TXCANHOT]"]) {
      case "0":
        sqlCanhot = "G043.TXCANHOT IS null";
        break;
      case "1":
        sqlCanhot = "G043.TXCANHOT IS NOT null";
        break;
    }
    delete req.body["parameter[G043_TXCANHOT]"];

    //verifico filtro de dias entregue
    var sqlEntHaQtDias = "";
    if (req.body["parameter[ENTHAQTSDIAS]"]) {
      entHaQtDias = req.body["parameter[ENTHAQTSDIAS]"];
      delete req.body["parameter[ENTHAQTSDIAS]"]
      sqlEntHaQtDias = `AND(
                          (
                            G043.DTENTREG IS NULL
                          )
                          OR(
                            TRUNC( G043.DTENTREG )> TRUNC( SYSDATE - ${entHaQtDias} )
                          )

                        )`; 
    }

    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, "G052", false);

    var acl = app.src.modIntegrador.controllers.FiltrosController;
    let sqlWhereAcl = await acl.montar({
      ids001: req.UserId,
      dsmodulo: "tracking",
      nmtabela: [{
        G024: 'TRANSPORTADORA'
      }],
      //dioperad: ' ',
      esoperad: 'And'
    });
    if (sqlWhereAcl == " And ") {
      sqlWhereAcl = "";
    }

    if (sqlWhere == "" && (sqlCanhot != "" || sqlWhereAcl != "")) {
      sqlWhere = "Where ";
    } else if (sqlCanhot != "") {
      sqlCanhot = "And " + sqlCanhot;
    }
    if ((sqlWhere.length == 6) && !sqlCanhot && sqlWhereAcl) {
      sqlWhereAcl = sqlWhereAcl.substr(4)
    }

    return await db.execute({
        sql: `SELECT
            G051.IDG051 G051_IDG051,
            G052.IDG043 G052_IDG043,
            G051.CDCTRC G051_CDCTRC,
            REMETENTE.NMCLIENT REMETENTE_NMCLIENT,
            DESTINATARIO.NMCLIENT DESTINATARIO_NMCLIENT,
            G043.NRNOTA G043_NRNOTA,
            G043.STETAPA G043_STETAPA,
            G043.CDDELIVE G043_CDDELIVE,
            G043.TXCANHOT G043_TXCANHOT,
            G024.NMTRANSP G024_NMTRANSP,
            TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY') G043_DTEMINOT,
            TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') G043_DTENTCON,
            TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') G043_DTENTREG,
            COUNT(G051.IDG051) OVER () as COUNT_LINHA
          FROM
            G052 G052
          INNER JOIN G051 G051 ON
            (G052.IDG051 = G051.IDG051)
          INNER JOIN G043 G043 ON
            (G052.IDG043 = G043.IDG043)
          INNER JOIN G049 ON 
          	(G049.IDG043 = G043.IDG043)
          INNER JOIN G048 ON 
          	(G048.IDG048 = G049.IDG048)
          INNER JOIN G046 ON
            (G046.IDG046 = G048.IDG046)
          INNER JOIN G005 REMETENTE ON
            (REMETENTE.IDG005 = G051.IDG005RE)
          INNER JOIN G005 DESTINATARIO ON
            (DESTINATARIO.IDG005 = G051.IDG005DE)
          INNER JOIN G024 ON
            (G024.IDG024 = G046.IDG024)
          ${sqlWhere} ${sqlCanhot} ${sqlWhereAcl} 
            AND G043.SNDELETE = 0
            AND G051.SNDELETE = 0
            AND G046.STCARGA != 'C'
            AND G046.SNDELETE = 0
            AND G051.STCTRC = 'A'
            AND G043.STETAPA IN (3,4,5,6)
            ${sqlEntHaQtDias} ` + sqlOrder + sqlPaginate,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  api.rastreio = async function (req, res, next) {
    var CDCLIEXT = req.params.CDCLIEXT;


    if (req.method == "POST") {
      var [sqlWhere, bindValues] = utils.buildWhere(req.body.parameter, false);
    } else {
      var filtros = {
          "DELIVERY.CDCLIEXT": CDCLIEXT,
          "tableName": "DELIVERY"
        }
        [sqlWhere, bindValues] = utils.buildWhere(filtros, false);
    }


    return await db.execute({
        sql: `SELECT 
                    DELIVERY.CDCLIEXT,
                    TO_CHAR(DELIVERY.DTEMINOT, 'DD/MM/YYYY') DTEMINOT,
                    TO_CHAR(DELIVERY.DTENTREG, 'DD/MM/YYYY') DTENTREG,
                    DELIVERY.STDELIVE,
                    DELIVERY.STETAPA,
                    DELIVERY.STULTETA,
                    TO_CHAR(CONHECIMENTO.DTEMICTR, 'DD/MM/YYYY') DTEMICTR,
                    NVL(TO_CHAR(PARADA.DTPREATU, 'DD/MM/YYYY'), TO_CHAR(PARADA.DTPREORI, 'DD/MM/YYYY')) PREVISAOENTREGA,
                    PARADA.IDG048
                    FROM G043 DELIVERY
                    INNER JOIN G049 
                        ON (G049.IDG043 = DELIVERY.IDG043)
                    INNER JOIN G048  PARADA 
                        ON (PARADA.IDG048= G049.IDG048)
                    INNER JOIN G052 
                        ON (G052.IDG043 = DELIVERY.IDG043)
                    INNER JOIN G051 CONHECIMENTO 
                        ON (CONHECIMENTO.IDG051 = G052.IDG051)
            ` + sqlWhere,
        param: bindValues
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  api.buscaDeliveryMobile = async function (req, res, next) {
    const { ISAG, IDG043 } = req.body;
    let IDG043_IDG083 = ``;
    if(ISAG > 1) {
      IDG043_IDG083 = `AND G083.IDG083 = ${IDG043}`;
    } else {
      IDG043_IDG083 = `AND G043.IDG043 = ${IDG043}`;
    }
    var sql = `
        SELECT	
            DISTINCT
            --G051.IDG051,
            G051.CDCTRC,          
            TO_CHAR(G051.DTENTPLA, 'DD/MM/YYYY') DTENTPLA,          
            --G024.IDG024,
            --G024.CJTRANSP,
            -- G024.NMTRANSP,          
            --G005R.IDG005   IDREMETE,
            G005R.NMCLIENT NMREMETE,
            --G005R.CJCLIENT CJREMETE,          
            --G005D.IDG005   IDDESTIN,
            G005D.NMCLIENT NMDESTIN,
            --G005D.CJCLIENT CJDESTIN,          
            G083.IDG043,
            G083.NRNOTA,
            --G083.NRCHADOC,
            --G043.STETAPA,
            --G043.CDDELIVE,          
            TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY') DTEMINOT
            --TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') DTENTCON,
            --TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') DTENTREG          
            --NVL(QC.QTCANHOTO, 0) QTCANHOTO          
        FROM G051          
        INNER JOIN G052
          ON G052.IDG051 = G051.IDG051
          AND G051.SNDELETE = 0                
        INNER JOIN G043
          ON G043.IDG043 = G052.IDG043
          AND G043.SNDELETE = 0          
        INNER JOIN G005 G005R
          ON G005R.IDG005 = G051.IDG005RE          
        INNER JOIN G005 G005D
          ON G005D.IDG005 = G051.IDG005DE        
        INNER JOIN G024 
          ON G024.IDG024 = G051.IDG024
          AND G024.SNDELETE = 0        
    -- LEFT JOIN ( 
    --   SELECT PKS007, COUNT(*) QTCANHOTO        
    --   FROM G082         
    --    INNER JOIN S007 
    --      ON S007.IDS007 = G082.IDS007
    --       AND S007.NMTABELA = 'G043'          
    --     WHERE 
    --       G082.SNDELETE = 0
    --   AND G082.TPDOCUME = 'CTO'          
    --    GROUP BY G082.PKS007        
    --  ) QC
    --  ON QC.PKS007 = G043.IDG043 
        INNER JOIN G083 G083 ON G083.IDG043 = G043.IDG043
        WHERE  	  	
        G051.STCTRC = 'A'
        ${IDG043_IDG083}`;
    return await db.execute({ sql, param: [] }).catch((err) => { throw err; });

  }

  return api;

};