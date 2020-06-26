module.exports = function (app, cb) {

  var api = {};
  api.controller = app.config.ControllerBD;
  var utils = app.src.utils.FuncoesObjDB;
  var tmz = app.src.utils.DataAtual;
  
  var fnValidaDominio = app.src.modIntegrador.dao.ContatoClienteDAO;

  api.gravaLogEnvioCron = async function (params) {
    let con = await this.controller.getConnection();
    
    try {          
      let result = await con.insert({
        tabela: `G078`,
        colunas: {
          IDG051:   params.IDG051 ? params.IDG051 : null,
          DSEMAID:  params.DSEMAID,
          DSENVPAR: params.DSENVPAR,
          SNENVIAD: params.SNENVIAD,
          SNDELETE: 0,
          DTENVIA:  new Date(),
          TPSISENV: params.TPSISENV,
          TXOBSERV: params.TXOBSERV,
          DTPREENT: params.DTPREENT ? tmz.retornaData(params.DTPREENT, 'YYYY-MM-DD') : null,
          SNENVMAN: params.SNENVMAN ? params.SNENVMAN : null,
          IDS001: params.IDS001 ? params.IDS001 : null,
          IDG005DE: params.IDG005DE ? params.IDG005DE : null,
          G043LIST: params.G043LIST ? params.G043LIST : null
        },
        key: `G078.IDG078`
      })
      .then((result1) => {
          return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });      
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }    
  }

  api.atualizaLogDataPreEntEnvioCron = async function (params) {
    let con = await this.controller.getConnection();
    try {
      let result = await con.execute({
        sql: `        
        Update  G078 G078
            Set G078.DTPREENT = :DTPREENT
          Where G078.IDG078 = :IDG078`,
        param: {
          IDG078: params.IDG078,
          DTPREENT: tmz.retornaData(params.DTPREENT,'YYYY-MM-DD')
        }
      })
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });    
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }    
  }


  api.cteEnvioNpsClienteMonitoria = async function (req, res, next) {
    let con = await this.controller.getConnection();
    console.log("cteEnvioNpsClienteMonitoria DAO");

    let sql = `
          SELECT 
                DISTINCT G051.IDG051, 
                G043.DTENTREG  
            FROM G043 G043
            INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
            INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
            WHERE TO_DATE(G043.DTENTREG, 'DD/MM/YYYY') = (TO_DATE(SYSDATE, 'DD/MM/YYYY') -1)
      `

    try {
       let result = await con.execute(
          {
            sql: sql,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        await con.close();
        return result;

    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
        
  }

  api.cteEnvioClienteMonitoria = async function (req, res, next) {
    console.log("cteEnvioClienteMonitoria DAO");

    let con = await this.controller.getConnection();

    let resultNrNotaEmail = null;
    let resultRastreio = null;
    let arrayRetorno = [];
    let paramLogCron = {};
    let emailEnvioCte = null;

      let sql = `
                SELECT 
                      DISTINCT G051.CDCTRC,
                      G051.STCTRC,
                      G051.IDG051,
                      NVL(G005.SNENVRAS,0) AS SNENVRAS,
                      G077.IDG077,
                      G022.IDG014,
                      /*Case 
                        When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
                          To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'YYYY-MM-DD')
                        When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
                          Case 
                            When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
                            To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'YYYY-MM-DD')
                            Else
                            null
                          End
                        Else
                        null
                      End As DTPREENT*/

                      Case
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                    Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                    End as DTPREENT /* Data de Previsão de Entrega */

                FROM G043 G043
                INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                INNER JOIN G005 G005 ON G005.IDG005 = NVL(G051.IDG005CO,G051.IDG005DE)
                LEFT JOIN G049 G049 ON (G049.IDG051 = G051.IDG051 OR G049.IDG043 = G043.IDG043)
                LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
                /* VALIDA DESTINATÁRIO */
                INNER JOIN G077 G077 ON G077.IDG005 = G051.IDG005DE AND G077.SNRASTRE = 1
                INNER JOIN G022 G022 ON (G022.IDG022 = G077.IDG022 AND G022.IDG005 = G051.IDG005RE AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0)                 
                WHERE G043.SNDELETE = 0
                    AND G051.SNDELETE = 0
                    AND G043.DTENTREG IS NULL
                    --AND G051.CDRASTRE IS NULL
                    AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') >= TO_DATE('24/09/2018', 'DD/MM/YYYY')
                    AND G051.STCTRC = 'A'
                    AND G051.TPTRANSP = 'V'
                    AND NOT EXISTS (
                        SELECT G078.IDG078 
                          FROM G078 G078 
                          WHERE G078.IDG051 = G051.IDG051 
                                AND G078.TPSISENV = 'R'
                                AND G078.SNDELETE = 0
                                AND (G078.SNENVMAN IS NULL OR G078.SNENVMAN = 0)
                    )
                      --and G051.IDG005DE = 108007
                      
            `
      try {
        let result = await con.execute(
          {
            sql: sql,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            console.log(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        
        
        if (result != null && result != undefined && result.length > 0) {

          for (let i = 0; i < result.length; i++){

            if (result[i].SNENVRAS == 1 && (result[i].IDG077 != null || result[i].IDG077 != '')) {

              resultRastreio = await con.execute(
                {
                  sql: `
                  Select    X.*, 
                      Case
                      When X.NrHoras > 480 Then 0 Else 1 End As IsLibera,
                      TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
                      Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
                      TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
                      SYSTIMESTAMP,
                      IDG014
                  From 
                      (        
                          Select  G051.CDRASTRE,
                                  Case 
                                    When MAX(G043.DtEntreg) Is Not Null Then 
                                      480 * (To_Date(To_Char(current_date, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24') - To_Date(To_Char(MAX(G043.DtEntreg), 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24'))
                                    Else 
                                      0 
                                  End As NrHoras,
                                  G051.IDG051,
                                  G022.IDG014
                          From    G043 G043
                          INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                          INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                          INNER JOIN G022 G022 ON G022.IDG005 = G051.IDG005RE AND NVL(G022.SNINDUST,1) = 1
                          WHERE  G051.IDG051 =`+result[i].IDG051+` And G051.TPTRANSP = 'V'
                          GROUP BY G051.CDRASTRE, G051.IDG051, G043.DtEntreg, G022.IDG014
                      ) X`,
                  param: {
        
                  }
                })
                .then((result) => {
                  //console.log(result);
                  return result[0];
                })
                .catch((err) => {
                  console.log(err);
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                }); 
              
                if(resultRastreio){

                  if(result[i].IDG051 != undefined && result[i].IDG051 != null && resultRastreio.CDRASTRE == null) {
                    //console.log("entrou no update IDG051 CDRASTRE");
                    await con.execute({
                      sql: `        
                      Update  G051 G051
                          Set G051.CDRASTRE = :CDRASTRE
                        Where G051.IDG051 = :IDG051`,
                      param: {
                        IDG051: result[i].IDG051,
                        CDRASTRE: resultRastreio.CONVERTIDO
                      }
                    })
                      .then((result1) => {
                        return result1;
                      })
                      .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                      });
                  }  
                   
                  //await con.close();
          
                  //populando objeto de notas que é mostrado no corpo do e-mail de rastreio
                  resultNrNotaEmail = await con.execute(
                    {
                      sql: `
                      SELECT G051.IDG051, G051.CDCTRC, G043.IDG043, G043.NRNOTA, G043.CDDELIVE,  G043.NRCHADOC  
                            FROM G051 G051
                            INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
                            INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
                            WHERE G051.IDG051 = ${result[i].IDG051}
                                  AND G051.STCTRC = 'A'
                                  AND G051.SNDELETE = 0 
                                  AND G043.SNDELETE = 0 `,
                      param: {
        
                      }
                    })
                    .then((resultNota) => {
                      //console.log(resultNota);
                      return resultNota;
                    })
                    .catch((err) => {
                      console.log(err);
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });
                  
                  if (resultRastreio.ISLIBERA != undefined && resultRastreio.ISLIBERA != null && resultRastreio.ISLIBERA == 1) {
                    if (result[i].IDG014 != undefined && result[i].IDG014 != null && result[i].IDG014 == 5) {

                      emailEnvioCte = await con.execute(
                        {
                          sql: `
                          Select X.IDG051,
                                  X.CDCTRC,
                                  X.IDG005CO,
                                  X.IDG005DE,
                                  NVL2(DSEMAIL1, DSEMAIL1 || ',', null) || DSEMAIL2 as DSEMAIL
                            from (Select Distinct G051.IDG051,
                                                  G051.CDCTRC,
                                                  G051.IDG005CO,
                                                  G051.IDG005DE,
                                                  LISTAGG(G043.DSEMACLI, ',') WITHIN GROUP(ORDER BY G043.DSEMACLI) DSEMAIL1,
                                                  LISTAGG(G043.DSEMARTV, ',') WITHIN GROUP(ORDER BY G043.DSEMARTV) As DSEMAIL2
                                    From G051 G051
                                    Join G052 G052
                                      on G052.IDG051 = G051.IDG051
                                    Join G043 G043
                                      ON G043.IDG043 = G052.IDG043
                                    Where G051.IDG051 = :IDG051
                                      AND (G043.DSEMACLI IS NOT NULL OR G043.DSEMARTV IS NOT NULL)
                                    Group By G051.IDG051, G051.CDCTRC, G051.IDG005CO, G051.IDG005DE) X`,
                          param: {
                            IDG051: result[i].IDG051
                          }
                        })
                        .then((result) => {
                          let result2 = '';
                          if(result.length > 0){
                            if(result[0].DSEMAIL != ''){
                              //Removendo os e-mail duplicados
                              let emailAux = result[0].DSEMAIL;
                              let emailAux2 = emailAux.split(",");
                              let uniqueArray = [...new Set(emailAux2)];
                              result2 = result[0];
                              result2.DSEMAIL = uniqueArray.toString();
                              return result2;
                            }else{
                              //se não tiver e-mail cadastrado, apenas devolve o resultado
                              result2 = result[0];
                              result2.DSEMAIL = null;
                              return result2;
                            }
                          }else{
                            return result;
                          }
                          
                        })
                        .catch((err) => {
                          err.stack = new Error().stack + `\r\n` + err.stack;
                          throw err;
                        });
                      
                    } else {
                      emailEnvioCte = await con.execute(
                        {
                          sql: `
                           Select G051.IDG051,
                                   G051.CDCTRC,
                                   G051.IDG005CO,
                                   G051.IDG005DE,
                                   LISTAGG(G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT) As DSEMAIL
                              From G051 G051
                              Join G005 G005
                                On (G005.IDG005 = G051.IDG005DE)
                              Left Join G020 G020
                                On (G020.IDG005 = G005.IDG005)
                              Left Join G007 G007
                                On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0)
                              Left Join G008 G008
                                On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0 And G008.TPCONTAT = 'E')
                              Where G051.IDG051 = :IDG051
                                    AND G008.DSCONTAT IS NOT NULL
                              Group By G051.IDG051,G051.CDCTRC, G051.IDG005CO, 
                                       G051.IDG005DE`,
                          param: {
                            IDG051: result[i].IDG051
                          }
                        })
                        .then((result) => {
                          return result[0];
                        })
                        .catch((err) => {
                          err.stack = new Error().stack + `\r\n` + err.stack;
                          throw err;
                        });
                    }

                    arrayRetorno.push({
                      CDRASTRE: (resultRastreio.CDRASTRE != undefined && resultRastreio.CDRASTRE != null ? resultRastreio.CDRASTRE : (resultRastreio.CONVERTIDO != null ? resultRastreio.CONVERTIDO : null)),
                      IDG014: (result[i].IDG014 != undefined && result[i].IDG014 != null ? result[i].IDG014 : null),
                      ISLIBERA: (resultRastreio != undefined && resultRastreio != null ? resultRastreio.ISLIBERA : 0),
                      IDG051: (result[i].IDG051 != undefined && result[i].IDG051 != null ? result[i].IDG051 : 0),
                      NRNOTEMA: (resultNrNotaEmail != undefined && resultNrNotaEmail != null ? resultNrNotaEmail : null),
                      DTPREENT: (result[i].DTPREENT != undefined && result[i].DTPREENT != null ? result[i].DTPREENT : null),
                      emailEnvioCte: (emailEnvioCte != undefined && emailEnvioCte != null ? emailEnvioCte : null)
                    });
                    
                  } else {
                    //se der erro, grava log
                    paramLogCron.IDG051 = result[i].IDG051;
                    paramLogCron.DSEMAID = '';
                    paramLogCron.DSENVPAR = '';
                    paramLogCron.SNENVIAD = 0;
                    paramLogCron.TPSISENV = 'R';
                    paramLogCron.TXOBSERV = `Rastreio não liberado G051 ${result[i].IDG051}`;
                    paramLogCron.DTPREENT = objEnvioRastreio[i].DTPREENT;
                    await api.gravaLogEnvioCron(paramLogCron);
                  }
              }
              
            } else {
              paramLogCron.IDG051 = result[i].IDG051;
              paramLogCron.DSEMAID = '';
              paramLogCron.DSENVPAR = '';
              paramLogCron.SNENVIAD = 3;
              paramLogCron.TPSISENV = 'R';
              paramLogCron.TXOBSERV = `Cte sem permissão de envio pela indústria ou cliente G051 ${result[i].IDG051}`;
              paramLogCron.DTPREENT = result[i].DTPREENT;
              await api.gravaLogEnvioCron(paramLogCron);
            }
          }
          
        }
        
        
        
        
        
        
        
        
        await con.close();
        return arrayRetorno;
      } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  }

  api.cteEnvioSatisfacaoMonitoria = async function (req, res, next) {
    console.log("cteEnvioSatisfacaoMonitoria DAO");

    let con = await this.controller.getConnection();

      let sql = `
                SELECT 
                      DISTINCT G051.CDCTRC,
                        G051.STCTRC,
                        G051.IDG051,
                        G022.IDG014,
                        G051.DTEMICTR
              FROM G043 G043
              INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
              INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
              INNER JOIN G005 G005 ON G005.IDG005 = NVL(G051.IDG005CO,G051.IDG005DE)
              INNER JOIN G022 G022 ON (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
              INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)
              /*INNER JOIN G049 G049 ON (G049.IDG051 = G051.IDG051 OR G049.IDG043 = G043.IDG043)
              INNER JOIN G048 G048 ON G048.IDG048 = G049.IDG048
              INNER JOIN G046 G046 ON G046.IDG046 = G048.IDG046*/    
              WHERE G043.SNDELETE = 0
                    AND G051.SNDELETE = 0
                    AND G043.DTENTREG IS NOT NULL
                    AND TO_DATE(G051.dtemictr, 'DD/MM/YY') >= TO_DATE('01/01/2019', 'DD/MM/YYYY')
                    AND G051.STCTRC = 'A'
                    AND G051.TPTRANSP = 'V'
                    AND G022CL.SNSATISF = 1
                    AND G005.SNDELETE = 0
                    AND G022.SNDELETE = 0
                    --AND G046.STCARGA <> 'C'
                    AND NOT EXISTS (
                        SELECT G078.IDG078 
                           FROM G078 G078 
                           WHERE G078.IDG051 = G051.IDG051 
                                 AND Upper(G078.TPSISENV) = Upper('N')
                                 AND G078.SNDELETE = 0
                    )
                    
                ORDER BY G051.DTEMICTR DESC
            `
      try {
        let result = await con.execute(
          {
            sql: sql,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            console.log(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        await con.close();
        return result;
      } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  }

  api.cteEnvioAlteracaoDataPrevisaoEntrega = async function (req, res, next) {
    console.log("cteEnvioAlteracaoDataPrevisaoEntrega DAO");

    let con = await this.controller.getConnection();

      let sql = `
                  SELECT 
                    DISTINCT G051.CDCTRC,
                    G051.STCTRC,
                    G051.IDG051,
                    NVL(G005.SNENVRAS,0) AS SNENVRAS,
                    G077.IDG077,
                    G022.IDG014,
                    Case 
                      When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
                        To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'YYYY-MM-DD')
                      When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
                        Case 
                          When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
                          To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'YYYY-MM-DD')
                          Else
                          null
                        End
                      Else
                      null
                    End As DTPREENT,
                    (SELECT G078.IDG078 
                      FROM G078 G078 
                      WHERE G078.IDG051 = G051.IDG051 
                            AND G078.TPSISENV = 'R'
                            AND G078.SNDELETE = 0
                            AND G078.DTPREENT IS NOT NULL) AS IDG078
              FROM G043 G043
              INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
              INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
              INNER JOIN G005 G005 ON G005.IDG005 = NVL(G051.IDG005CO,G051.IDG005DE)
              LEFT JOIN G049 G049 ON (G049.IDG051 = G051.IDG051 OR G049.IDG043 = G043.IDG043)
              LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
              /* VALIDA DESTINATÁRIO */
              INNER JOIN G077 G077 ON G077.IDG005 = G051.IDG005DE AND G077.SNRASTRE = 1
              INNER JOIN G022 G022 ON G022.IDG022 = G077.IDG022 AND G022.IDG005 = G051.IDG005RE AND NVL(G022.SNINDUST,1) = 1                
              WHERE G043.SNDELETE = 0
                  AND G051.SNDELETE = 0
                  AND G043.DTENTREG IS NULL
                  AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') >= TO_DATE('24/09/2018', 'DD/MM/YYYY')
                  AND G051.STCTRC = 'A'
                  AND G051.TPTRANSP <> 'T'
                  /* Faz a validação se a data de previsão atual está diferente da data de previsão do último envio */
                  AND (Case 
                        When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
                          To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
                        When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
                          Case 
                            When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
                            To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
                            Else
                            null
                          End
                        Else
                        null
                      End ) <> (
                                SELECT TO_CHAR(G078.DTPREENT,'DD/MM/YYYY') as DTPREENT 
                                  FROM G078 G078 
                                  WHERE G078.IDG051 = G051.IDG051 
                                        AND G078.TPSISENV = 'R'
                                        AND G078.SNDELETE = 0
                                        AND G078.DTPREENT IS NOT NULL
                              )
                      
            `
      try {
        let result = await con.execute(
          {
            sql: sql,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            console.log(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        await con.close();
        return result;
      } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  }

  api.getCteAg = async function (req, res, next) {
    console.log("getCteAg DAO");

    let con = await this.controller.getConnection();

      let sql = `
      SELECT 
            DISTINCT G051.CDCTRC,
            G051.STCTRC,
            G051.IDG051,

            Case
              When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                  Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
              When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                  Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
              Else
                  Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
              End as DTPREENT /* Data de Previsão de Entrega */

      FROM G043 G043
      INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
      INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
      LEFT JOIN G049 G049 ON (G049.IDG051 = G051.IDG051 OR G049.IDG043 = G043.IDG043)
      LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048

      WHERE G043.SNDELETE = 0
          AND G051.SNDELETE = 0
          AND G043.DTENTREG IS NULL
          AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') >= TO_DATE('31/05/2019', 'DD/MM/YYYY')
          AND G051.STCTRC = 'A'
          AND G051.TPTRANSP = 'V'
          AND G051.CDRASTRE IS NULL
          AND G043.CDDELIVE IS NOT NULL AND G043.TPDELIVE = 5                 
            `
      try {
        let result = await con.execute(
          {
            sql: sql,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            console.log(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        await con.close();
        return result;
      } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  }


  api.cteEnvioClienteMonitoriaV2 = async function (req, res, next) {
    console.log("cteEnvioClienteMonitoriaV2 DAO");

    let con = await this.controller.getConnection();

    let resultNrNotaEmail = null;
    let resultRastreio = null;
    let arrayRetorno = [];
    let emailEnvioCte = null;
    let emailEnvioCteAux = [];
    let arrayNotas = [];
    let arrayCtes = [];
    let validaNotas = null;
    let validaDominio = {
      status: false,
      email: ''
    };

  /*SELECT PRINCIPAL*/
  /*Essa select pega todos os clientes que possuem entregas para receber rastreio de CTEs emitidos um dia anterior ao dia atual*/
  /*A linha poderá duplicar caso exista operações diferentes em meio as entregas*/

      let sql = `
      SELECT 
        DISTINCT 
        G022OP.IDG014 as IDG014,
        G022CL.SNRASTRE as SNRASTRE,
        G051.IDG005DE

      FROM G043 G043
      INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
      INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
      INNER JOIN G005 G005CO ON G005CO.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE)
      INNER JOIN G005 G005DE ON G005DE.IDG005 = G051.IDG005DE
      INNER JOIN G003 G003DE ON G003DE.IDG003 = G005DE.IDG003
      INNER JOIN G002 G002DE ON G002DE.IDG002 = G003DE.IDG002
      /* VALIDA DESTINATÁRIO */
      INNER JOIN G022 G022OP ON (G022OP.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE) AND NVL(G022OP.SNINDUST,1) = 1 AND G022OP.SNDELETE = 0) 
      INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022OP.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)
      WHERE G043.SNDELETE = 0
          AND G051.SNDELETE = 0
          AND G005CO.SNDELETE = 0
          AND G005DE.SNDELETE = 0
          AND G043.DTENTREG IS NULL
          AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') = (TO_DATE(TO_CHAR(CURRENT_DATE, 'DD/MM/YYYY'),'DD/MM/YYYY') - 1)
        --AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') > TO_DATE('01/05/2019', 'DD/MM/YYYY')
          AND G051.STCTRC = 'A'
          AND G051.IDG005DE = G043.IDG005DE
          AND G051.IDG005DE IS NOT NULL
          AND G043.IDG005DE IS NOT NULL
          AND G022CL.SNRASTRE = 1
          AND G051.TPTRANSP = 'V'
          --AND ROWNUM <= 10
                      
            `
      try {
        let result = await con.execute(
          {
            sql: sql,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            console.log(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        
        if (result != null && result != undefined && result.length > 0) {

          for (let i = 0; i < result.length; i++){

          /*Zerando as informações para cada linha encontrada na select principal*/

            arrayNotas = [];
            arrayCtes = [];
            resultRastreio = null;
            resultNrNotaEmail = null;
            emailEnvioCte = null;
            emailEnvioCteAux = [];
            validaNotas = null;
            validaDominio = {
              status: false,
              email: ''
            };

          /*Pega todos os CTes para entrega referentes ao cliente e operação encontrados na select principal*/

            resultRastreio = await con.execute(
              {
                sql: `
                Select    X.*,
                    TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
                    Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
                    TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
                    SYSTIMESTAMP
                From 
                    (        
                        Select  G051.CDRASTRE,

                        Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                            Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                            Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                            Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End as DTPREENT, /* Data de Previsão de Entrega */

                                G051.IDG051
                        From    G043 G043
                        INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                        INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                        INNER JOIN G005 G005 ON G005.IDG005 = NVL(G051.IDG005CO,G051.IDG005DE)

                        INNER JOIN G022 G022OP ON (G022OP.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE) AND NVL(G022OP.SNINDUST,1) = 1 AND G022OP.SNDELETE = 0) 
                        INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022OP.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)

                        WHERE  G051.IDG005DE =`+ result[i].IDG005DE +` AND G043.IDG005DE = `+ result[i].IDG005DE +` AND G022OP.IDG014 = `+ result[i].IDG014 +`

                        AND G043.SNDELETE = 0
                        AND G051.SNDELETE = 0
                        AND G043.DTENTREG IS NULL
                        AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') > TO_DATE('01/07/2019', 'DD/MM/YYYY')
                        --AND TO_DATE(G051.DTEMICTR, 'DD/MM/YY') > TO_DATE('01/05/2019', 'DD/MM/YYYY')
                        AND G051.STCTRC = 'A'
                        AND G051.TPTRANSP = 'V'
                        AND G022CL.SNRASTRE = 1

                        GROUP BY G051.CDRASTRE, G051.IDG051, G051.DTCALDEP, G043.DtEntreg, G043.DtEntcon, G043.Idg014
                    ) X`,
                param: {
      
                }
              })
              .then((result) => {
                return result;
              })
              .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              }); 
            
            if (resultRastreio != null && resultRastreio != undefined && resultRastreio.length > 0) {
                
              for (let j = 0; j < resultRastreio.length; j++) {
                /*Zerando as informações referentes ao e-mail(na delivery) e às deliverys encontradas para cada CTe*/
                resultNrNotaEmail = null;
                emailEnvioCte = null;

                if (resultRastreio[j].IDG051 != undefined && resultRastreio[j].IDG051 != null && resultRastreio[j].CDRASTRE == null) {
                  /*Inserir código de rastreio para CTes que não possuem o mesmo*/
                  await con.execute({
                    sql: `        
                    Update  G051 G051
                        Set G051.CDRASTRE = :CDRASTRE
                      Where G051.IDG051 = :IDG051`,
                    param: {
                      IDG051: resultRastreio[j].IDG051,
                      CDRASTRE: resultRastreio[j].CONVERTIDO
                    }
                  })
                    .then((result1) => {
                      return result1;
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });
                }
        
                /*Pega as notas de cada CTe do laço*/

                resultNrNotaEmail = await con.execute(
                  {
                    sql: `
                    SELECT DISTINCT 
                      G043.IDG043, 
                      G043.NRNOTA,
                      Nvl(TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY'),TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY')) AS DTEMINOT, 
                      TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY') as DTBLOQUE, /* Data de Bloqueio */
                      TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY') as DTDESBLO, /* Data de Desbloqueio */
                      TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') as DTENTREG,

                      (SELECT 
                          TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') as DTSAICAR
                        FROM G046 G046
                        JOIN G048 G048 ON (G046.IDG046 = G048.IDG046)
                        JOIN G049 G049 ON (G049.IDG048 = G048.IDG048)
                          
                        WHERE G049.IDG051 = G051.IDG051 AND G046.STCARGA <> 'C'
                        ORDER BY G046.IDG046 DESC FETCH FIRST ROW ONLY
                    )  AS DTSAICAR,

                      TO_CHAR(G051.DTCOLETA, 'YYYY-MM-DD') As DTCOLETA, /* Data Coleta */
                      G051.CDRASTRE,
                      

                      Case
                      When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                      When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                      Else
                          Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                      End as DTPREENT /* Data de Previsão de Entrega */
                    
                          FROM G043 G043
                          INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                          INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                          LEFT JOIN G083 G083 ON G052.IDG083 = G083.IDG083
                          WHERE G051.IDG051 = ${resultRastreio[j].IDG051} 
                          AND G043.DTENTREG IS NULL
                          AND NOT EXISTS (
                            SELECT G052.IDG043
                              FROM G052 G052
                              JOIN G051 G051 ON (G052.IDG051 = G051.IDG051)
                              WHERE G051.TPTRANSP = 'D'
                              AND G052.IDG043 = G043.IDG043
                        )`,
                    param: {
      
                    }
                  })
                  .then((resultNota) => {
                    return resultNota;
                  })
                  .catch((err) => {
                    console.log(err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                  });
                
              /*Caso seja um cliente com operação 4PL o e-mail é pego na delivery*/

                if (result[i].IDG014 != undefined && result[i].IDG014 != null && result[i].IDG014 == 5) {

                  emailEnvioCte = await con.execute(
                    {
                      sql: `
                      Select 
                          NVL2(DSEMAIL1, DSEMAIL1 || ',', null) || DSEMAIL2 as DSEMAIL
                      from (Select Distinct G051.IDG051,
                                          G051.CDCTRC,
                                          G051.IDG005CO,
                                          G051.IDG005DE,
                                          LISTAGG(G043.DSEMACLI, ',') WITHIN GROUP(ORDER BY G043.DSEMACLI) DSEMAIL1,
                                          LISTAGG(G043.DSEMARTV, ',') WITHIN GROUP(ORDER BY G043.DSEMARTV) As DSEMAIL2
                            From G051 G051
                            Join G052 G052
                              on G052.IDG051 = G051.IDG051
                            Join G043 G043
                              ON G043.IDG043 = G052.IDG043
                            Where G051.IDG051 = :IDG051
                              AND (G043.DSEMACLI IS NOT NULL OR G043.DSEMARTV IS NOT NULL)
                            Group By G051.IDG051, G051.CDCTRC, G051.IDG005CO, G051.IDG005DE) X`,
                      param: {
                        IDG051: resultRastreio[j].IDG051
                      }
                    })
                    .then((result) => {
                      let result2 = '';
                      if (result.length > 0) {
                        if (result[0].DSEMAIL != '') {
                          //Removendo os e-mail duplicados
                          let emailAux = result[0].DSEMAIL;
                          let emailAux2 = emailAux.split(",");
                          let uniqueArray = [...new Set(emailAux2)];
                          result2 = result[0];
                          result2.DSEMAIL = uniqueArray.toString();
                          return result2;
                        } else {
                          //se não tiver e-mail cadastrado, apenas devolve o resultado
                          result2 = result[0];
                          result2.DSEMAIL = null;
                          return result2;
                        }
                      } else {
                        return result;
                      }
                  
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });
              
                /*Monta o array de e-mails pegados na delivery*/

                  if (emailEnvioCte != null && emailEnvioCte != undefined && emailEnvioCte.DSEMAIL != null
                    && emailEnvioCte.DSEMAIL != undefined && emailEnvioCte.DSEMAIL != '') {
                    emailEnvioCteAux.push(emailEnvioCte.DSEMAIL);
                  }
                  
                  emailEnvioCte = null;
                      
                }

              /*Monta array de notas e ctes*/

                if (resultNrNotaEmail != null && resultNrNotaEmail != undefined && resultNrNotaEmail.length > 0) {
                  for (let arr = 0; arr < resultNrNotaEmail.length; arr++) {
                    arrayNotas.push(resultNrNotaEmail[arr]);
                    arrayCtes.push(resultRastreio[j].IDG051);
                  }
                }

              }

            /*Pega os e-mails daquele cliente cadastrados na nossa base de dados levando em conta os CTes encontrados preservando a operação*/

              let emailEnvioCteCliente = await con.execute(
                {
                  sql: `
                Select Distinct
                        G008.DSCONTAT As G008_DSCONTAT,
                        G008.TPCONTAT As G008_TPCONTAT
                  From G005 G005
                  Join G020 G020
                    On (G020.IDG005 = G005.IDG005)
                  Join G007 G007
                    On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0 And G007.IDG006 = 1 And NVL(G007.SNCONATE,0) <> 1)
                  Join G008 G008
                    On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0 And G008.TPCONTAT = 'E')
                  Where G005.IDG005 = :IDG005DE
                        AND G008.DSCONTAT IS NOT NULL
                        AND G005.SNDELETE = 0`,
                  param: {
                    IDG005DE: result[i].IDG005DE
                  }
                })
                .then((result1) => {
                  if (result1) {
                    let objRetorno = {
                      CONTATO: result1,
                      IDG006: null,
                      IDG014: result[i].IDG014
                    }
                    return objRetorno;
                  } else {
                    return result1[0];
                  }
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });
              
            /*Pega os e-mails RTV cadastrados na nossa base de dados levando em conta os CTes encontrados preservando a operação*/

              let emailEnvioCteRtv = await con.execute(
                {
                  sql: `
                Select Distinct
                    G008.DSCONTAT As G008_DSCONTAT,
                    G008.TPCONTAT As G008_TPCONTAT
                  From G051 G051
                  Join G005 G005
                    On (G005.IDG005 = G051.IDG005DE AND G005.SNDELETE = 0)
                  Join G022 G022OP
                    On (G022OP.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE) AND NVL(G022OP.SNINDUST,1) = 1 AND G022OP.SNDELETE = 0)
                  Join G020 G020
                    On (G020.IDG005 = G005.IDG005)
                  Join G007 G007
                    On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0 And G007.IDG006 = 27 And NVL(G007.SNCONATE,0) <> 1 And NVL(G007.IDG014,0) = G022OP.IDG014)
                  Join G008 G008
                    On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0 And G008.TPCONTAT = 'E')
                  Where G020.IDG005 = :IDG005DE
                        AND G051.IDG051 IN (`+ arrayCtes.join() +`)
                        AND G008.DSCONTAT IS NOT NULL`,
                  param: {
                    IDG005DE: result[i].IDG005DE
                  }
                })
                .then((result2) => {
                  if (result2) {
                    let objRetorno = {
                      CONTATO: result2,
                      IDG006: 27,
                      IDG014: result[i].IDG014
                    }
                    return objRetorno;
                  } else {
                    return result2[0];
                  }
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });

            /*Aplicação das validações de domínio*/
              
              if (emailEnvioCteCliente != null && emailEnvioCteCliente != undefined && emailEnvioCteCliente.CONTATO && emailEnvioCteCliente.CONTATO.length > 0) {
                validaDominio = await fnValidaDominio.validarEmails({ body: emailEnvioCteCliente });

                if (validaDominio.status) {

                  if (emailEnvioCteRtv != null && emailEnvioCteRtv != undefined && emailEnvioCteRtv.CONTATO && emailEnvioCteRtv.CONTATO.length > 0) {
                    validaDominio = await fnValidaDominio.validarEmails({ body: emailEnvioCteRtv });
                  } else {
                    validaDominio.status = true;
                  }

                  if (validaDominio.status) {
                    /*Junta os e-mails RTV e do cliente normal*/

                    emailEnvioCte = {
                      DSEMAIL: emailEnvioCteCliente.CONTATO.map(e => e.G008_DSCONTAT).join()
                    }

                    if (emailEnvioCteRtv != null && emailEnvioCteRtv != undefined && emailEnvioCteRtv.CONTATO && emailEnvioCteRtv.CONTATO.length > 0) {

                      emailEnvioCte.DSEMAIL += ',' + emailEnvioCteRtv.CONTATO.map(e => e.G008_DSCONTAT).join();

                    }

                  }

                }

              } else {
                validaDominio.status = true;
                emailEnvioCte = null;
              }

              /*Para casos syngenta os e-mails encontrados na delivery e os e-mails cadastrado na nossa base de dados são juntados*/
  
              if (result[i].IDG014 == 5) {
                if (emailEnvioCte != null && emailEnvioCte != undefined && emailEnvioCte.DSEMAIL != null && emailEnvioCte.DSEMAIL != '') {
                  emailEnvioCteAux.push(emailEnvioCte.DSEMAIL);
                }
                if (emailEnvioCteAux != null && emailEnvioCteAux != undefined && emailEnvioCteAux.length > 0) {
                  let auxUniqueEmails = emailEnvioCteAux.join();
                  let auxUniqueEmails2 = auxUniqueEmails.split(",");
                  let uniqueArrayEmails = [...new Set(auxUniqueEmails2)];
                  emailEnvioCte = { DSEMAIL: uniqueArrayEmails.toString() };
                } else {
                  emailEnvioCte = null;
                }
              }

            /*Faz uma busca das notas já enviadas para aquele cliente*/

              validaNotas = await con.execute(
                {
                  sql: `
                    SELECT DISTINCT
                     G078.G043LIST,
                     G078.IDG078
                      FROM G078 G078
                    WHERE G078.IDG005DE = :IDG005DE
                    AND G078.SNENVIAD = 1 
                    AND G078.TPSISENV = 'R'
                    AND G078.DSENVPAR IS NOT NULL
                    ORDER BY G078.IDG078 DESC `,
                  param: {
                    IDG005DE: result[i].IDG005DE
                  }
                })
                .then((result) => {
                  return result[0];
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });

            }

          /*Monta objeto com as informações necessárias para envio do rastreio para o cliente específico*/

            arrayRetorno.push({
              IDG014: (result[i].IDG014 != undefined && result[i].IDG014 != null ? result[i].IDG014 : null),
              arrayNotas: (arrayNotas != undefined && arrayNotas != null && arrayNotas.length > 0 ? arrayNotas : null),
              emailEnvioCte: (emailEnvioCte != undefined && emailEnvioCte != null ? emailEnvioCte : null),
              IDG005DE: (result[i].IDG005DE != undefined && result[i].IDG005DE != null ? result[i].IDG005DE : null),
              VALIDNOT: (validaNotas != undefined && validaNotas != null ? validaNotas : null),
              validaDominio: validaDominio
            });
          }

        }

        await con.close();
        return arrayRetorno;
      } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  }


  api.deliveryRetroativo = async function (req, res, next) {
    console.log("deliveryRetroativo DAO");

    let con = await this.controller.getConnection();

      let sql = `
      SELECT 
            G043.IDG043,
            G082.CTDOCUME,                    
            G082.STDOCUME,
            G082.TMDOCUME,
            G082.TPDOCUME,
            G082.NMDOCUME,
            G082.DSMIMETP  

      FROM G043 G043
      JOIN G082 G082
        ON G082.PKS007 = G043.IDG043
      
     

      WHERE       
        G082.SNDELETE = 0
        AND G043.SNDELETE = 0
        AND G082.IDS007 = 31
        AND G082.TPDOCUME = 'CTO'      
        AND ROWNUM <= 500   
        AND NVL(G043.FLAGTEMP, 0) = 1     
            `
           
            
      try {
        let result = await con.execute(
          {
            sql: sql,
            param: [] ,
            fetchInfo: [{
              column : "CTDOCUME", 
              type: "BLOB"
            }]
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            console.log(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        await con.close();
        return result;
      } catch (err) {
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  }



  return api;        

};
