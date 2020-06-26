/**
 * @description Possui os métodos responsaveis por alimentar gráficos do dassboard de Transferencia
 * @author Germano / Adryell
 * @since 01/10/2018
 *
*/

/**
 * @module dao/Gestao-de-CD
 * @description .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu = app.src.utils.DataAtual;
  var acl = app.src.modIntegrador.controllers.FiltrosController;
  var logger = app.config.logger;
  api.controller = app.config.ControllerBD;
  const gdao = app.src.modGlobal.dao.GenericDAO;

  var SNAG = ` And G043.SNAG IS NULL 
                AND nvl(G043.TPDELIVE,0) <> 5`;

  /**
   * @description Lista NOTAS EM TRANSITO.
   *
   * @async
   * @function api/emTransito
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.reconheceReceitaGeral = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {
      let sqlWhereAcl = await acl.montar({
        ids001: req.headers.ids001,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if(typeof sqlWhereAcl == 'undefined'){
        sqlWhereAcl = '';
      }
      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

      var sqlPivot = `
                    (SELECT * FROM 
                      (SELECT 
                          G076.IDS007PK ID, 
                          G076.VRCAMPO,
                          G075.NMCAMPO
                          
                      FROM G076 -- VALORES ADICIONAIS
                      
                      INNER JOIN G075 -- CAMPOS ADICIONAIS
                          ON G075.IDG075 = G076.IDG075
                          
                      INNER JOIN S007 -- TABELAS
                          ON S007.IDS007 = G075.IDS007 	
                          
                      WHERE 
                          G076.SNDELETE = 0
                          AND G075.SNDELETE = 0
                          AND S007.NMTABELA = 'G043')
                          
                    PIVOT             
                      (MAX(VRCAMPO) FOR NMCAMPO IN ('STRECUSA' STRECUSA)))
      `;

      var sql = `
                SELECT DISTINCT
                COUNT(G043.IDG043) OVER() TOTAL,  
                G043.IDG043,
                G043.NRNOTA,
                G043.VRDELIVE,
                G043.PSBRUTO,
                G043.DTEMINOT,
                G043.DTENTREG,
                G043.DTBLOQUE, 
                G043.DTDESBLO,
                G043.DTENTCON AS DTENTCON,
                RECUSA.STRECUSA,

                to_date(G051.dtcombin, 'DD/MM/YY') as dtcombin,
                to_date(g051.dtagenda, 'DD/MM/YY') as dtagenda,
                fn_data_sla(G051.IDG051) as DTPREVISTA,
                G051.DTEMICTR,
                G051.CDCTRC,

                G005RE.RSCLIENT AS NMCLIENT,
                G005DE.NMCLIENT AS G005DE_NMCLIENT,

                G003.IDG003,
                G003RE.NMCIDADE,
                G003RE.NMCIDADE || ' - ' || G002RE.CDESTADO AS G003RE_NMCIDADE,
                G003DE.NMCIDADE || ' - ' || G002DE.CDESTADO AS G003DE_NMCIDADE,

                G002.IDG002,
                G002.NMESTADO AS NOMEESTADO,
                G002DE.CDESTADO AS NMESTADO,
                G002DE.CDESTADO AS UF_DE,

                G046.IDG046,
                G046.PSCARGA,

                G014.SNFATDAS,

                nvl(G028.NMARMAZE, G003.NMCIDADE)  AS NMARMAZE,

                NVL(G024.NMTRANSP, G024X.NMTRANSP) AS NMTRANSP,

                Case
                When G051.CDCARGA Is Not Null and G024.NMTRANSP Is Null Then
                0
                When G051.CDCARGA Is Null and G024.NMTRANSP Is Null Then
                -1
                Else
                G024.IDG024
                End As IDG024,

                Case
                  When G051.CDCARGA Is Not Null and G028.NMARMAZE Is Null Then
                    0
                  When G051.CDCARGA Is Null and G028.NMARMAZE Is Null Then
                    -1
                  Else
                    G028.IDG028
                End As IDG028
                  
              FROM G043 G043

              LEFT JOIN (
                SELECT 
                  A005.IDG043, 
                  COUNT(*) TOTAL_ATEND
                    FROM A005
                      INNER JOIN A001 
                        ON A001.IDA001 = A005.IDA001
                        WHERE A001.SNDELETE = 0
                        AND A001.IDA002 = 141 --RECUSA 3PL
                        GROUP BY A005.IDG043
              ) QTD_ATEND ON QTD_ATEND.IDG043 = G043.IDG043
              
              Inner Join G052 G052 On (G052.IDG043 = G043.IDG043)

              Inner Join G051 G051 On (G052.IDG051 = G051.IDG051)
              
              INNER JOIN G005 ON G005.IDG005 = G051.IDG005RE

              INNER JOIN G005 G005DE ON G005DE.IDG005 = G051.IDG005DE -- DESTINO

              INNER JOIN G005 G005RE ON (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE)) -- REMETENTE
                
              INNER JOIN G003 ON G003.IDG003 = G005.IDG003  -- CIDADE

              INNER JOIN G003 G003DE ON G003DE.IDG003 = G005DE.IDG003 -- CIDADE DESTINO

              INNER JOIN G003 G003RE ON G003RE.IDG003 =  G005RE.IDG003 -- CIDADE ORIGEM
                  
              INNER JOIN G002 ON G002.IDG002 = G003.IDG002 -- UF
                  
              INNER JOIN G002 G002DE ON G002DE.IDG002 = G003DE.IDG002 -- UF DESTINO

              INNER JOIN G002 G002RE ON G002RE.IDG002 = G003RE.IDG002 AND G002RE.SNDELETE = 0 -- UF REMETENTE

              LEFT JOIN G046 ON G046.IDG046 = G051.IDG046 AND G046.SNDELETE = 0 -- CARGA
                  
              LEFT JOIN G024 G024 On (G046.IDG024 = G024.IDG024) -- TRANSPORTADORA 

              INNER JOIN G024 G024X ON (G051.IDG024 = G024X.IDG024) AND G024X.SNDELETE = 0 -- TRANSPORTADORA

              LEFT JOIN G028 G028 On (G046.IDG028 = G028.IDG028) -- ARMAZEM 

              INNER JOIN G022 G022 ON G005.IDG005 = G022.IDG005

              LEFT JOIN G014 G014 On (G022.IDG014 = G014.IDG014) -- OPERACAO 

              LEFT JOIN(${sqlPivot}) RECUSA ON (G043.IDG043 = RECUSA.ID) -- RECUSA

              ${sqlWhere}
              And NVL(G051.TPTRANSP,'0') = 'V' 
              ${SNAG}
              ${sqlWhereAcl}
              AND RECUSA.STRECUSA IS NULL
              AND NVL(QTD_ATEND.TOTAL_ATEND, 0) = 0
              AND G022.SNINDUST = 1
              AND G022.SNDELETE = 0
              ${req.body.auxIDG005}
              ${req.body.auxIDG014}
              ${req.body.auxDTEMINOT}
              AND G051.IDG005CO IN (SELECT G.IDG005
                                    FROM G005 G
                                    JOIN G022 G1
                                    ON G1.IDG005 = G.IDG005
                                    WHERE G1.SNINDUST = 1
                                    AND G1.SNDELETE = 0
                                    AND G.SNDELETE = 0
                                    AND G1.IDG014 = G014.IDG014)
              --AND TO_CHAR(G051.DTEMICTR, 'YYYY-MM') = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
              AND G051.SNDELETE = 0
              AND G051.STCTRC   = 'A'
              ORDER BY IDG043 DESC
                `
      let result = await con.execute(
        {
          sql,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

       for( let i of result){
        switch (i.NMARMAZE.toUpperCase()){
          case  "CUIABÁ":
            i.NMARMAZE = "CD CUIABÁ DEDICADO"  
            break
          case "APARECIDA DE GOIÂNIA":
            i.NMARMAZE = "CD APARECIDA DE GOIÂNIA QUÍMICO"  
            break
          case "ITUVERAVA":
            i.NMARMAZE = "CD APARECIDA DE GOIÂNIA QUÍMICO"  
            break
          case "CARAZINHO":
              i.NMARMAZE = "CD CARAZINHO"
              break
          case "FRANCO DA ROCHA":
              i.NMARMAZE = "CD PAULÍNIA"
              break
          case "UBERABA":
              i.NMARMAZE = "CD UBERABA"
              break
        }
      } 

      await con.close();
      logger.debug("Fim listar");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  api.buscarUsuario = async function (req, res, next) {

    let sqlWhereAcl = await acl.montar({
      ids001: req.headers.ids001,
      dsmodulo: "dashboard",
      nmtabela: [
        {
          G014: 'G014'
        }
      ],
      esoperad: 'And '
    });
    if (typeof sqlWhereAcl == 'undefined') {
      sqlWhereAcl = '';
    }

    req.sql = `
            SELECT IDG014 
              FROM G014 
                WHERE G014.SNDELETE = 0
                ${sqlWhereAcl}          
  `

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

   /**
   * @description Lista NOTAS EM TRANSITO.
   * @async
   * @function api/emTransito
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.reconheceReceitaGrid = async function (req, res, next) {
    
    logger.debug("Inicio listar");
    let con = await this.controller.getConnection();

    try {

      let sqlWhereAcl = await acl.montar({
        ids001: req.UserId,
        dsmodulo: "dashboard",
        nmtabela: [
          {
            G014: 'G014'
          }
        ],
        esoperad: 'And '
      });
      if(typeof sqlWhereAcl == 'undefined'){
        sqlWhereAcl = '';
      }

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        var sql = `
            SELECT 
              G043.IDG043,
              G043.NRNOTA,
              G043.DTEMINOT,
              G043.VRDELIVE,
              G043.PSBRUTO,
              G043.DTENTCON,
              G043.DTENTREG,
              G051.CDCTRC as G051_CDCTRC,
              
              G046.IDG046,
              
              G005RE.RSCLIENT AS NMCLIENT,
              G005DE.NMCLIENT AS G005DE_NMCLIENT,
              G003RE.NMCIDADE || ' - ' || G002RE.CDESTADO AS G003RE_NMCIDADE,
              G003.NMCIDADE || ' - ' || G002.CDESTADO AS G003DE_NMCIDADE,
              
              G051.DTCOLETA AS DTSAICAR,
              G051.DTEMICTR,
              G051.IDG051,
              G051.CDCTRC,
              G051.DTCOMBIN AS G051_DTCOMBIN,
              G051.DTAGENDA AS G051_DTAGENDA,
              
              Case
              When G051.CDCARGA Is Not Null and G024.NMTRANSP Is Null Then
              0
              When G051.CDCARGA Is Null and G024.NMTRANSP Is Null Then
              -1
              Else
              G024.IDG024
              End As IDG024,
                Case
                When G051.CDCARGA Is Not Null and G024.NMTRANSP Is Null Then
                'CARGA GERADA PELO LOGOS'
                When G051.CDCARGA Is Null and G024.NMTRANSP Is Null Then
                'NF SEM CARGA'
                Else
                G024.NMTRANSP
                End As G024_NMTRANSP,
              
              Case 
              When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
                  To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
              When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
                  Case 
                  When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
                  To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
                  Else
                  'n.i.'
                  End
              Else
              'n.i.'
              End As DTPREVISTA,
              
              COUNT(G043.idG043) OVER () as COUNT_LINHA
              
            FROM G043 G043
            
            Inner Join G052 G052 On (G052.IDG043 = G043.IDG043)
            Inner Join G051 G051 On (G052.IDG051 = G051.IDG051)
             
            left JOIN G005 G005DE -- DESTINATÁRIO
              ON (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
                
            LEFT JOIN G003 -- CIDADE ORIGEM
              ON G003.IDG003 = G005DE.IDG003
              AND G003.SNDELETE = 0
                
            LEFT JOIN G002 -- UF ORIGEM
              ON G002.IDG002 = G003.IDG002 
              AND G002.SNDELETE = 0
                
            LEFT JOIN G005 G005RE -- ORIGEM // REMETENTE
              ON (G005RE.IDG005 = Nvl(G051.IDG005EX, G051.IDG005RE))
              --AND G005RE.SNDELETE = 0
                
            LEFT JOIN G003 G003RE -- CIDADE REMETENTE
              ON G003RE.IDG003 = G005RE.IDG003
              AND G003RE.SNDELETE = 0

            LEFT JOIN G002 G002RE -- UF REMETENTE
              ON G002RE.IDG002 = G003RE.IDG002 
              AND G002RE.SNDELETE = 0
            
            /* INNER JOIN G024 -- UF ORIGEM
            ON (G051.IDG024 = G024.IDG024)
            AND G024.SNDELETE = 0 */

            LEFT JOIN G046 -- CARGA
              ON G046.IDG046 = G051.IDG046
              AND G046.SNDELETE = 0
              
            Left Join G024 G024   On (G046.IDG024 = G024.IDG024)
      
            Left Join G014 G014   On (G043.IDG014 = G014.IDG014)

              ${sqlWhere}
              ${sqlWhereAcl}
              ${SNAG}
                AND G043.TPDELIVE = '2'
                AND G043.IDG014 IN (93)
                AND TO_CHAR(G043.DTEMINOT, 'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY')
                AND G043.NRNOTA IS NOT NULL
                AND G051.TPTRANSP <> 'D'
                AND G051.STCTRC = 'A'
          
              ${sqlOrder} ${sqlPaginate}
          `;

        let result = await con.execute({sql, param: bindValues})
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      await con.close();
      logger.debug("Fim listar");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };
    
  return api;
};
