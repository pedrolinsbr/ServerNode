/**
 * @description Possui as funções necessárias para o funcionamento do módulo MDF-e
 * @author Brenda Oliveira
 * @since 10/06/2019
 *
*/

/**
 * @module dao/Mdfe
 * @description Don't not .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

    var api        = {};
    const utils    = app.src.utils.FuncoesObjDB;
    const dtatu    = app.src.utils.DataAtual;
    const logger   = app.config.logger;
    const gdao     = app.src.modGlobal.dao.GenericDAO;
    const acl      = app.src.modIntegrador.controllers.FiltrosController;
    api.controller = gdao.controller;

  /**
   * @description BUsca Indicadores do MDF-e.
   *
   * @async
   * @function api/tp/mdfe/indicadoresMdfe
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.indicadoresMdfe = async function(req,res,next){
    var tplObjRet = [] ;

    var objConn = await this.controller.getConnection(req.objConn, req.UserId);
    
    try {

        var aclInf = await acl.montar({
          ids001:   req.UserId,
          dsmodulo: 'transportation',
          nmtabela: [{
                      G024: 'G024'
                    }],
          esoperad: 'And '
        });

        if(typeof aclInf == 'undefined'){
          aclInf = '';
        }

        var result = await objConn.execute({
            sql:`WITH G046X AS
            (SELECT count(DISTINCT G046.IDG046) AS STNAOPRO
               FROM G046 G046
              INNER JOIN G048 G048
                 ON G048.IDG046 = G046.IDG046
              INNER JOIN G049 G049
                 ON G049.IDG048 = G048.IDG048
              INNER JOIN G024 G024
                 ON G024.IDG024 = G046.IDG024
                AND G024.IDG023 = 2
              INNER JOIN G051 G051
                 ON G051.IDG051 = G049.IDG051
              INNER JOIN G043 G043
                 ON G043.IDG043 = G049.IDG043
              WHERE G051.SNDELETE = 0
                AND G051.STCTRC = 'A'
                AND G043.SNDELETE = 0
                AND G046.STCARGA not in ('C','E')
                AND G046.IDG031M1 IS NOT NULL
                AND G046.IDG032V1 IS NOT NULL
                AND G051.DSMODENF <> 'NF'
                AND G046.DTCARGA >= TO_DATE('20/06/2019', 'DD/MM/YYYY')
                AND G048.IDF001 IS NULL
                ${aclInf}),
           G046Y AS
            (SELECT COUNT(DISTINCT G046.IDG046) AS STAGUDOC
               FROM G046 G046
              INNER JOIN G048 G048
                 ON G048.IDG046 = G046.IDG046
              INNER JOIN G049 G049
                 ON G049.IDG048 = G048.IDG048
              INNER JOIN G024 G024
                 ON G024.IDG024 = G046.IDG024
                AND G024.IDG023 = 2
              WHERE G049.IDG051 IS NULL
                AND G046.DTCARGA >= TO_DATE('20/06/2019', 'DD/MM/YYYY')
                AND NOT EXISTS
              (SELECT F003.IDG046 FROM F003 F003 WHERE F003.IDG046 = G046.IDG046)
                AND NOT EXISTS (SELECT G051.IDG051
                       FROM G052 G052
                      INNER JOIN G051 G051
                         ON G051.IDG051 = G052.IDG051
                      INNER JOIN G043 G043
                         ON G043.IDG043 = G052.IDG043
                      WHERE G051.SNDELETE = 0
                        AND G051.STCTRC = 'A'
                        AND G043.SNDELETE = 0
                        AND G051.IDG051 = G049.IDG051)
              ${aclInf})
           
           SELECT (SELECT STAGUDOC FROM G046Y) AS STAGUDOC,
                  (SELECT STNAOPRO FROM G046X) AS STNAOPRO,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'N' 
                          ${aclInf}) AS STNAOENV,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'P'
                          ${aclInf}) AS STPENDEN,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'C'
                          ${aclInf}) AS STCANCEL,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'A'
                          ${aclInf}) AS STAUTORI,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'E'
                          ${aclInf}) AS STERRO,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'R'
                          ${aclInf}) AS STENCERR,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'M'
                          ${aclInf}) AS STSOLENC,
                  (SELECT COUNT(DISTINCT F001.IDF001)
                     FROM F001 F001
                    INNER JOIN G024 G024
                       ON G024.IDG024 = F001.IDG024
                    WHERE F001.STMDF = 'L'
                          ${aclInf}) AS STSOLCAN,
                  (SELECT (SELECT COUNT(F001.IDF001) 
                             FROM F001 
                            INNER JOIN G024 G024
                               ON G024.IDG024 = F001.IDG024
                            WHERE F001.STMDF <> 'I' ${aclInf}) +
                          (SELECT STNAOPRO FROM G046X) + (SELECT STAGUDOC FROM G046Y)
                     FROM DUAL) AS STTODOS
             FROM DUAL
           `,
                            param:[]
        }).then((res) => {
            tplObjRet = [
              {
                  label:"Aguard.",
                  indNum:res[0].STAGUDOC,
                  bgColor:"rgb(169,169,245)",
                  //icon:"far fa-file",
                  filtParam:"G"
              },
              {
                  label:"Não proc.",
                  indNum:res[0].STNAOPRO,
                  bgColor:"rgb(93, 199, 215)",
                  //icon:"fas fa-bars",
                  filtParam:"O"
              },
              {
                  label:"Não enviado",
                  indNum:res[0].STNAOENV,
                  bgColor:"#4e7ec7",
                  //icon:"fas fa-tasks",
                  filtParam:"N"
             },
              {
                  label:"Pendente",
                  indNum:res[0].STPENDEN,
                  bgColor:"rgb(249, 168, 37)",
                  //icon:"far fa-calendar-check",
                  filtParam:"P"
              },
              {
                  label:"Autorizado",
                  indNum:res[0].STAUTORI,
                  bgColor:"rgb(76, 175, 80)",
                  //icon:"fas fa-handshake",
                  filtParam:"A"
              },
              {
                label:"Erro",
                indNum:res[0].STERRO,
                bgColor:"rgb(239, 108, 0)",
                //icon:"fas fa-exclamation-triangle",
                filtParam:"E"
              }, {
                label:"Sol. Ence.",
                indNum:res[0].STSOLENC,
                bgColor:"rgb(77,77,255)",
                //icon:"fas fa-th-list",
                filtParam:"M"
              },
              {
                label:"Sol. Canc.",
                indNum:res[0].STSOLCAN,
                bgColor:"rgb(135,31,120)",
                //icon:"fas fa-times-circle",
                filtParam:"L"
              },
              {
                label:"Encerrado",
                indNum:res[0].STENCERR,
                bgColor:"rgb(11,59,11)",
                //icon:"fas fa-check",
                filtParam:"R"
              },
              {
                  label:"Cancelado",
                  indNum:res[0].STCANCEL,
                  bgColor:"rgb(204, 62, 83)",
                  //icon:"fas fa-ban",
                  filtParam:"C"
              },
              {
                  label:"Todos",
                  indNum:res[0].STTODOS,
                  bgColor:"rgb(96, 125, 139)",
                  //icon:"fas fa-box",
                  filtParam:"T"
              }
              
            ];
            return tplObjRet;

        }).catch((err) => {
            throw err;
        });
        
        objConn.close();
        return result;

    } catch (err) {
        objConn.closeRollBack();
        throw err;
    }


  }

  /**
   * @description Busca todos as cargas e MDF-e de acordo com a requisição.
   *
   * @async
   * @function api/tp/mdfe/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.listar = async function(req,res,next){
    
    try {

            var objConn     = await this.controller.getConnection();
            var sqlWhereAux = '';
            var sqlJoin     = '';
            var sqlColumns  = '';
            var sqlGoupBy   = '';
            var sqlColumnsX = '';
            var sqlGoupByX  = '';
            var reqAux      = req;
            var sql         = '';  
            var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'X',false);

            var aclInf = await acl.montar({
              ids001:   req.UserId,
              dsmodulo: 'transportation',
              nmtabela: [{
                          G024: 'G024'
                        }],
              esoperad: 'And '
            });
    
            if(typeof aclInf == 'undefined'){
              aclInf = '';
            }

            sqlWhere = '';

            if(req.body['parameter[STMDF]'] == 'O'){//Não processado

                sqlJoin     = ` INNER JOIN G051 G051 ON G051.IDG051 = G049.IDG051
                                INNER JOIN G043 G043 ON G043.IDG043 = G049.IDG043
                                INNER JOIN G032 G032 ON G032.IDG032 = G046.IDG032V1
                                INNER JOIN G031 G031 ON G031.IDG031 = G046.IDG031M1
                                LEFT JOIN F003 F003 ON F003.IDG046  = G046.IDG046 
                                LEFT JOIN F001 F001 ON F001.IDF001  = F003.IDF001 AND F001.STMDF <> 'I' `;

                  sqlWhere += `   G051.SNDELETE = 0 
                                  AND G051.STCTRC   = 'A' 
                                  AND G051.DSMODENF <> 'NF'
                                  AND G043.SNDELETE = 0 
                                  AND G046.IDG031M1 IS NOT NULL
                                  AND G046.IDG032V1 IS NOT NULL
                                  AND G046.STCARGA not in ('C','E')
                                  AND G048.IDF001 IS NULL`;
                sqlColumns   = `, 'O' as STMDF`;
                sqlColumnsX  = `, 'O' as STMDF`;

            }else if(req.body['parameter[STMDF]'] == 'G'){//Aguardando documentos
                sqlColumns   = `, 'G' as STMDF`;
                sqlColumnsX  = `, 'G' as STMDF`;
                sqlWhere = `    G049.IDG051 IS NULL 
                                AND NOT EXISTS (SELECT F003.IDG046 FROM F003 F003 WHERE F003.IDG046 = G046.IDG046)
                                AND NOT EXISTS (SELECT G051.IDG051 FROM G052 G052
                                  INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                                  INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
                                  WHERE G051.SNDELETE = 0 
                                    AND G051.STCTRC   = 'A' 
                                    AND G043.SNDELETE = 0 
                                    AND G051.IDG051 = G049.IDG051) `;
                sqlJoin     = `LEFT JOIN G032 G032 ON G032.IDG032 = G046.IDG032V1
                              LEFT JOIN G031 G031 ON G031.IDG031 = G046.IDG031M1
                              LEFT JOIN F003 F003 ON F003.IDG046 = G046.IDG046 
                              LEFT JOIN F001 F001 ON F001.IDF001 = F003.IDF001 AND F001.STMDF <> 'I'`;
            
            }else if(req.body['parameter[STMDF]'] != 'T' && req.body['parameter[STMDF]'] != ''){
                
                sqlWhere += ` G051.SNDELETE = 0 
                                AND G043.SNDELETE = 0 
                                AND G046.IDG031M1 IS NOT NULL
                                AND G046.IDG032V1 IS NOT NULL
                                AND G051.DSMODENF <> 'NF'
                                AND F001.STMDF = '${req.body['parameter[STMDF]']}' `;
                sqlJoin      = ` INNER JOIN G032 G032 ON G032.IDG032 = G046.IDG032V1
                                INNER JOIN G031 G031 ON G031.IDG031 = G046.IDG031M1
                                INNER JOIN G051 G051 ON G051.IDG051 = G049.IDG051
                                INNER JOIN G043 G043 ON G043.IDG043 = G049.IDG043
                                INNER JOIN F003 F003 ON F003.IDG046 = G046.IDG046 
                                INNER JOIN F001 F001 ON F001.IDF001 = F003.IDF001
                                INNER JOIN F002 F002
                                   ON F002.IDF001 = F001.IDF001 AND F002.NRSEQUEN = (SELECT MAX(F.NRSEQUEN) FROM F002 F WHERE F.IDF001 = F001.IDF001)
                                INNER JOIN G002 G002
                                   ON G002.IDG002 = F002.IDG002
                                INNER JOIN S001 S001C
                                   ON S001C.IDS001 = F001.IDS001
                                LEFT JOIN S001 S001E
                                   ON S001E.IDS001 = F001.IDS001CA`;

                sqlColumns  = ` ,F001.NRMDF, F001.NRCHAMDF, F001.DTMANIFE, F001.STMDF, F001.IDF001, F001.TPLOCOLE,
                                REPLACE(F001.DSERRO,'''','') AS DSERRO, F001.DSCANCEL, G002.CDESTADO, S001C.NMUSUARI || ' [' || S001C.IDS001 || ']' AS NMUSUARIC,
                                CASE WHEN F001.STMDF = 'R' OR F001.STMDF = 'C' THEN NVL2(S001E.NMUSUARI, S001E.NMUSUARI || ' [' || S001E.IDS001 || ']','Automático') ELSE '' END AS NMUSUARIE,
                                F001.DTCADAST, F001.DTMANCAN`;

                sqlGoupBy  = ` ,F001.NRMDF, F001.NRCHAMDF, F001.DTMANIFE, F001.STMDF, F001.IDF001,F001.TPLOCOLE,
                                F001.DSERRO, F001.DSCANCEL, G002.CDESTADO, S001C.NMUSUARI || ' [' || S001C.IDS001 || ']',  
                                CASE WHEN F001.STMDF = 'R' OR F001.STMDF = 'C' THEN NVL2(S001E.NMUSUARI, S001E.NMUSUARI || ' [' || S001E.IDS001 || ']','Automático') ELSE '' END,
                                F001.DTCADAST, F001.DTMANCAN `;

                sqlColumnsX  = ` ,X.NRMDF, X.NRCHAMDF, X.DTMANIFE, X.STMDF, X.IDF001, X.TPLOCOLE,
                                 X.DSERRO, X.DSCANCEL, X.CDESTADO, X.NMUSUARIC, X.NMUSUARIE,
                                 X.DTCADAST, X.DTMANCAN `;

                sqlGoupByX   = ` ,X.NRMDF, X.NRCHAMDF, X.DTMANIFE, X.STMDF, X.IDF001,X.TPLOCOLE,
                                 X.DSERRO, X.DSCANCEL, X.CDESTADO, X.NMUSUARIC, X.NMUSUARIE,
                                 X.DTCADAST, X.DTMANCAN `;

            }

            //CD Origem
            if(req.body['parameter[IDG024][id]'] != '' && req.body['parameter[IDG024][id]'] != undefined){
                sqlWhereAux += ` AND X.IDG024 = ${req.body['parameter[IDG024][id]']} `;
            }
   
            //Carga
            if(req.body['parameter[IDG046][in]'] != '' && req.body['parameter[IDG046][in]'] != undefined){
                sqlWhereAux += ` AND X.IDG046 IN (${req.body['parameter[IDG046][in]']}) `;
            }
            
            //Número do MDF-e
            if(req.body['parameter[NRMDF][in]'] != '' && req.body['parameter[NRMDF][in]'] != undefined){
                sqlWhereAux += ` AND X.NRMDF IN (${req.body['parameter[NRMDF][in]']}) `;
            }

            //Chave do MDF-e
            if(req.body['parameter[NRCHAMDF][in]'] != '' && req.body['parameter[NRCHAMDF][in]'] != undefined){
                sqlWhereAux += ` AND X.NRCHAMDF IN (${req.body['parameter[NRCHAMDF][in]']}) `;
            }

            //Carga Logos
            if(req.body['parameter[IDCARLOG][in]'] != '' && req.body['parameter[IDCARLOG][in]'] != undefined){
              sqlWhereAux += ` AND X.IDCARLOG IN (${req.body['parameter[IDCARLOG][in]']}) `;
            }

            //Veículo
            if(req.body['parameter[IDG032][0][id]'] != '' && req.body['parameter[IDG032][0][id]'] != undefined){
              var idg032 = '' ;
              var i      = 0;
              do{

                idg032 += req.body['parameter[IDG032]['+i+'][id]']+',';
                i++;

              }while(req.body['parameter[IDG032]['+i+'][id]'] != undefined);

              idg032 = idg032.substring(0,(idg032.length - 1));

              sqlWhereAux += ` AND X.IDG032V1 IN (${idg032}) `;
            }

            //Motorista
            if(req.body['parameter[IDG031M1][0][id]'] != '' && req.body['parameter[IDG031M1][0][id]'] != undefined){
              var idg031 = '' ;
              var i      = 0;
              do{

                idg031 += req.body['parameter[IDG031M1]['+i+'][id]']+',';
                i++;

              }while(req.body['parameter[IDG031M1]['+i+'][id]'] != undefined);

              idg031 = idg031.substring(0,(idg031.length - 1));

              sqlWhereAux += ` AND X.IDG031M1 IN (${idg031}) `;
            }

            //Data da carga
            if (bindValues.X_DTCARGA0 && bindValues.X_DTCARGA1) {
                
                var moment = require('moment');
                moment.locale('pt-BR');
                
                var c0 = moment(bindValues.X_DTCARGA0).format('l');
                var c1 = moment(bindValues.X_DTCARGA1).format('l');

                sqlWhereAux += ` AND TO_DATE(X.DTCARGA, 'dd/mm/yy') >= to_date( '${c0}', 'dd/mm/yyyy') 
                                 AND TO_DATE(X.DTCARGA, 'dd/mm/yy') <= to_date( '${c1}', 'dd/mm/yyyy')`;
            }

            //Data do MDF-e
            if (bindValues.X_DTMANIFE0 && bindValues.X_DTMANIFE1) {
                
                var moment = require('moment');
                moment.locale('pt-BR');
                
                var m0 = moment(bindValues.X_DTMANIFE0).format('l');
                var m1 = moment(bindValues.X_DTMANIFE1).format('l');

                sqlWhereAux += ` AND TO_DATE(X.DTMANIFE, 'dd/mm/yy') >= to_date( '${m0}', 'dd/mm/yyyy') 
                                 AND TO_DATE(X.DTMANIFE, 'dd/mm/yy') <= to_date( '${m1}', 'dd/mm/yyyy') `;
            }
    
    
            if(req.body['parameter[STMDF]'] != 'T' && req.body['parameter[STMDF]'] != ''){
              
                   sql = `SELECT 
                                X.IDG046, 
                                X.DSCARGA, 
                                X.IDCARLOG, 
                                X.DTCARGA,
                                X.IDG032V1,
                                X.IDG031M1,
                                X.idg024, 
                                X.NMTRANSP 
                                ${sqlColumnsX},
                                X.NMMOTORI1,
                                X.DSVEICULV1,
                                COUNT(X.IDG046) OVER () as COUNT_LINHA
                          FROM 
                          (SELECT DISTINCT G046.IDG046, 
                                          G046.DSCARGA, 
                                          G046.IDCARLOG, 
                                          G046.DTCARGA,
                                          G046.IDG032V1,
                                          G046.IDG031M1,
                                          G024.idg024, 
                                          G024.NMTRANSP || ' [' || G024.idg024   || '-' || G024.idlogos || ']'  as NMTRANSP 
                                          ${sqlColumns},
                                          G031.NMMOTORI || ' [' || G031.IDG031   || '-' || G031.NRMATRIC  || ']' AS NMMOTORI1,
                                          G032.DSVEICUL || ' [' || G032.IDG032   || '-' || G032.NRFROTA   || ']' AS DSVEICULV1
                          FROM G046 G046
                          INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                          INNER JOIN G049 G049 ON G049.IDG048 = G048.IDG048 
                          INNER JOIN G024 G024 ON G024.IDG024 = G046.IDG024 AND G024.IDG023 = 2
                          ${sqlJoin}        
                          WHERE G046.DTCARGA >= TO_DATE('20/06/2019','DD/MM/YYYY') 
                            AND ${sqlWhere} 
                                ${aclInf}
                          GROUP BY G046.IDG046, 
                                   G046.DSCARGA, 
                                   G046.IDCARLOG,
                                   G046.DTCARGA,
                                   G046.IDG032V1, 
                                   G046.IDG031M1,
                                   G024.idg024, 
                                   G024.NMTRANSP || ' [' || G024.idg024   || '-' || G024.idlogos  || ']' ,
                                   G031.NMMOTORI || ' [' || G031.IDG031   || '-' || G031.NRMATRIC || ']',
                                   G032.DSVEICUL || ' [' || G032.IDG032   || '-' || G032.NRFROTA  || ']' 
                                   ${sqlGoupBy})X
                                   WHERE 1 = 1 ${sqlWhereAux}
                          GROUP BY  X.IDG046, 
                                    X.DSCARGA, 
                                    X.IDCARLOG, 
                                    X.DTCARGA,
                                    X.IDG032V1,
                                    X.IDG031M1,
                                    X.idg024, 
                                    X.NMTRANSP 
                                    ${sqlGoupByX},
                                    X.NMMOTORI1,
                                    X.DSVEICULV1`+
                          sqlOrder+
                          sqlPaginate;
            }else{//todos
                        sql = `SELECT X.IDG046,
                                      X.DSCARGA,
                                      X.IDCARLOG,
                                      X.DTCARGA,
                                      X.IDG032V1,
                                      X.IDG031M1,
                                      X.idg024,
                                      X.NMTRANSP,
                                      X.NMMOTORI1 ,
                                      X.DSVEICULV1,
                                      X.NRMDF,
                                      X.NRCHAMDF,
                                      to_date(X.DTMANIFE, 'DD/MM/YY HH24:MI:SS') as DTMANIFE,
                                      X.STMDF,
                                      X.IDF001,
                                      X.TPLOCOLE,
                                      X.DSERRO,
                                      X.DSCANCEL,
                                      X.CDESTADO,
                                      X.NMUSUARIC,
                                      X.NMUSUARIE,
                                      X.DTCADAST,
                                      X.DTMANCAN,
                                      COUNT(X.IDG046) OVER () as COUNT_LINHA
                        FROM (/*NÃO PROCESSADO*/
                          SELECT DISTINCT G046.IDG046,
                                           G046.DSCARGA,
                                           G046.IDCARLOG,
                                           G046.DTCARGA,
                                           G046.IDG032V1,
                                           G046.IDG031M1,
                                           G024.idg024,
                                           G024.NMTRANSP || ' [' || G024.idg024 || '-' ||
                                           G024.idlogos || ']' as NMTRANSP,
                                           null AS NRMDF,
                                           null AS NRCHAMDF,
                                           null AS DTMANIFE,
                                           'O' AS STMDF,
                                           null AS IDF001,
                                           null AS TPLOCOLE,
                                           null AS DSERRO,
                                           null AS DSCANCEL,
                                           null AS CDESTADO,
                                           G031.NMMOTORI || ' [' || G031.IDG031 || '-' ||
                                           G031.NRMATRIC || ']' AS NMMOTORI1,
                                           G032.DSVEICUL || ' [' || G032.IDG032 || '-' ||
                                           G032.NRFROTA || ']' AS DSVEICULV1,
                                           '' AS NMUSUARIC,
                                           '' AS NMUSUARIE,
                                           null As DTCADAST,
                                           null As DTMANCAN
                            FROM G046 G046
                           INNER JOIN G048 G048
                              ON G048.IDG046 = G046.IDG046
                           INNER JOIN G049 G049
                              ON G049.IDG048 = G048.IDG048
                           INNER JOIN G024 G024
                              ON G024.IDG024 = G046.IDG024
                             AND G024.IDG023 = 2
                           INNER JOIN G032 G032
                              ON G032.IDG032 = G046.IDG032V1
                           INNER JOIN G031 G031
                              ON G031.IDG031 = G046.IDG031M1
                           INNER JOIN G051 G051
                              ON G051.IDG051 = G049.IDG051
                           INNER JOIN G043 G043
                              ON G043.IDG043 = G049.IDG043
                           WHERE G051.SNDELETE = 0
                             AND G051.STCTRC = 'A'
                             AND G043.SNDELETE = 0
                             AND G046.STCARGA not in ('C','E')
                             AND G046.IDG031M1 IS NOT NULL
                             AND G046.IDG032V1 IS NOT NULL
                             AND G051.DSMODENF <> 'NF'
                             AND G048.IDF001 IS NULL
                             AND G046.DTCARGA >= TO_DATE('20/06/2019', 'DD/MM/YYYY')
                             ${aclInf}
                          
                          union all
                          /*STATUS MDF-E*/
                          SELECT DISTINCT G046.IDG046,
                                           G046.DSCARGA,
                                           G046.IDCARLOG,
                                           G046.DTCARGA,
                                           G046.IDG032V1,
                                           G046.IDG031M1,
                                           G024.idg024,
                                           G024.NMTRANSP || ' [' || G024.idg024 || '-' ||
                                           G024.idlogos || ']' as NMTRANSP,
                                           F001.NRMDF,
                                           F001.NRCHAMDF,
                                           TO_DATE(F001.DTMANIFE, 'DD/MM/YY HH24:MI') AS DTMANIFE,
                                           NVL(F001.STMDF, 'O') AS STMDF,
                                           F001.IDF001,
                                           F001.TPLOCOLE,
                                           REPLACE(F001.DSERRO, '''', '') AS DSERRO,
                                           F001.DSCANCEL,
                                           G002.CDESTADO,
                                           G031.NMMOTORI || ' [' || G031.IDG031 || '-' ||
                                           G031.NRMATRIC || ']' AS NMMOTORI1,
                                           G032.DSVEICUL || ' [' || G032.IDG032 || '-' ||
                                           G032.NRFROTA || ']' AS DSVEICULV1,
                                           S001C.NMUSUARI || ' [' || S001C.IDS001 || ']' AS NMUSUARIC,
                                           CASE WHEN F001.STMDF = 'R' OR F001.STMDF = 'C' THEN NVL2(S001E.NMUSUARI, S001E.NMUSUARI || ' [' || S001E.IDS001 || ']','Automático') ELSE '' END AS NMUSUARIE,
                                           F001.DTCADAST,
                                           F001.DTMANCAN
                               FROM G046 G046
                           INNER JOIN G048 G048
                              ON G048.IDG046 = G046.IDG046
                           INNER JOIN G049 G049
                              ON G049.IDG048 = G048.IDG048
                           INNER JOIN G024 G024
                              ON G024.IDG024 = G046.IDG024
                             AND G024.IDG023 = 2
                           INNER JOIN G032 G032
                              ON G032.IDG032 = G046.IDG032V1
                           INNER JOIN G031 G031
                              ON G031.IDG031 = G046.IDG031M1
                           INNER JOIN G051 G051
                              ON G051.IDG051 = G049.IDG051
                           INNER JOIN G043 G043
                              ON G043.IDG043 = G049.IDG043
                           INNER JOIN F003 F003
                              ON F003.IDG046 = G046.IDG046
                           INNER JOIN F001 F001
                              ON F001.IDF001 = F003.IDF001
                             AND F001.STMDF <> 'I'
                           INNER JOIN F002 F002
                              ON F002.IDF001 = F001.IDF001
                             AND F002.NRSEQUEN =
                                 (SELECT MAX(F.NRSEQUEN)
                                    FROM F002 F
                                   WHERE F.IDF001 = F001.IDF001)
                           INNER JOIN G002 G002
                              ON G002.IDG002 = F002.IDG002
                           INNER JOIN S001 S001C
                              ON S001C.IDS001 = F001.IDS001
                            LEFT JOIN S001 S001E
                              ON S001E.IDS001 = F001.IDS001CA
                           WHERE G051.SNDELETE = 0 
                             AND G043.SNDELETE = 0
                             AND G046.IDG031M1 IS NOT NULL
                             AND G046.IDG032V1 IS NOT NULL
                             AND G051.DSMODENF <> 'NF'
                             AND G046.DTCARGA >= TO_DATE('20/06/2019', 'DD/MM/YYYY')
                             ${aclInf}
                          
                          union all
                          /*AGUARDANDO DOCUMENTAÇÃO*/
                          SELECT DISTINCT G046.IDG046,
                                           G046.DSCARGA,
                                           G046.IDCARLOG,
                                           G046.DTCARGA,
                                           G046.IDG032V1,
                                           G046.IDG031M1,
                                           G024.idg024,
                                           G024.NMTRANSP || ' [' || G024.idg024 || '-' ||
                                           G024.idlogos || ']' as NMTRANSP,
                                           null AS NRMDF,
                                           null AS NRCHAMDF,
                                           null AS DTMANIFE,
                                           'G' AS STMDF,
                                           null AS IDF001,
                                           null AS TPLOCOLE,
                                           null AS DSERRO,
                                           null AS DSCANCEL,
                                           null AS CDESTADO,
                                           G031.NMMOTORI || ' [' || G031.IDG031 || '-' ||
                                           G031.NRMATRIC || ']' AS NMMOTORI1,
                                           G032.DSVEICUL || ' [' || G032.IDG032 || '-' ||
                                           G032.NRFROTA || ']' AS DSVEICULV1,
                                           '' AS NMUSUARIC,
                                           '' AS NMUSUARIE,
                                           null As DTCADAST,
                                           null As DTMANCAN
                            FROM G046 G046
                           INNER JOIN G048 G048
                              ON G048.IDG046 = G046.IDG046
                           INNER JOIN G049 G049
                              ON G049.IDG048 = G048.IDG048
                           INNER JOIN G024 G024
                              ON G024.IDG024 = G046.IDG024
                             AND G024.IDG023 = 2
                            LEFT JOIN G032 G032
                              ON G032.IDG032 = G046.IDG032V1
                            LEFT JOIN G031 G031
                              ON G031.IDG031 = G046.IDG031M1
                           WHERE G046.DTCARGA >= TO_DATE('20/06/2019', 'DD/MM/YYYY')
                             AND G049.IDG051 IS NULL
                             AND NOT EXISTS (SELECT F003.IDG046
                                    FROM F003 F003
                                   WHERE F003.IDG046 = G046.IDG046)
                             AND NOT EXISTS (SELECT G051.IDG051
                                    FROM G052 G052
                                   INNER JOIN G051 G051
                                      ON G051.IDG051 = G052.IDG051
                                   INNER JOIN G043 G043
                                      ON G043.IDG043 = G052.IDG043
                                   WHERE G051.SNDELETE = 0
                                     AND G051.STCTRC = 'A'
                                     AND G043.SNDELETE = 0
                                     AND G051.IDG051 = G049.IDG051)
                              ${aclInf}
                         ) X
                         WHERE 1 = 1 ${sqlWhereAux}
                         GROUP BY X.IDG046,
                         X.DSCARGA,
                         X.IDCARLOG,
                         X.DTCARGA,
                         X.IDG032V1,
                         X.IDG031M1,
                         X.idg024,
                         X.NMTRANSP,
                         X.NMMOTORI1 ,
                         X.DSVEICULV1,
                         X.NRMDF,
                         X.NRCHAMDF,
                         X.DTMANIFE,
                         X.STMDF,
                         X.IDF001,
                         X.TPLOCOLE,
                         X.DSERRO,
                         X.DSCANCEL,
                         X.CDESTADO,
                         X.NMUSUARIC,
                         X.NMUSUARIE,
                         X.DTCADAST,
                         X.DTMANCAN `+
                          sqlOrder+
                          sqlPaginate;
            }

            

            return await objConn.execute({sql:sql,param:[]
            }).then((res) => {
                objConn.close();
                return (utils.construirObjetoRetornoBD(res, reqAux.body));
                
            }).catch((err) => {
                objConn.closeRollBack();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
        
    } catch (err) {
        objConn.closeRollBack();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
    }

  };

  /**
   * @description Busca o percurso que a carga irá fazer de acordo com o local de coleta
   *
   * @async
   * @function api/tp/mdfe/listarPercurso
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.listarPercurso = async function(req,res,next){
    var objConn    = await this.controller.getConnection();

    var sqlColumns = ``;
    var sqlJoin    = ``;
    var sqlGoupBy  = ``;
    var sqlWhere   = ``;

    if(req.body.obj.TPLOCOLE.id == 1){//Filial
      sqlGoupBy  = `  G002OR.IDG002, G002OR.CDESTADO`;
      sqlColumns = `  G002OR.IDG002   AS CDUFOR,
                      G002OR.CDESTADO As UFOR /* Estado da Origem */`;
      sqlJoin    = `  INNER Join G003 G003OR /* Cidade Origem */
                        On (G003OR.IDG003 = G024.IDG003)
                      INNER Join G002 G002OR /* Estado Origem */
                        On (G002OR.IDG002 = G003OR.IDG002)`;

    }else if(req.body.obj.TPLOCOLE.id == 2){//Cliente
      sqlGoupBy  = ` G002RE.IDG002, G002RE.CDESTADO`;
      sqlColumns = ` G002RE.IDG002   AS CDUFOR,
                     G002RE.CDESTADO As UFOR /* Estado da Origem */`;
      sqlJoin    = `INNER Join G048 G048RE /* Paradas Remetente */
                            On (G048RE.IDG046 = G046.IDG046 
                           And G048RE.NRSEQETA = 1)
                    INNER JOIN G049 G049RE 
                           ON G049RE.IDG048 = G048RE.IDG048     
                    INNER JOIN G051 G051RE 
                        ON G051RE.IDG051 = G049RE.IDG051
                    INNER JOIN G005 G005RE /* Cliente Remetente */
                          ON (G005RE.IDG005 = NVL(G051RE.IDG005EX, G051RE.IDG005RE))
                    INNER Join G003 G003RE /* Cidade Remetente */
                            On (G003RE.IDG003 = G005RE.IDG003)
                    INNER Join G002 G002RE /* Estado Remetente */
                            On (G002RE.IDG002 = G003RE.IDG002)`;

    }

    if(req.body.obj.STMDF != 'R'){
      sqlWhere = ` AND G048.IDF001 IS NULL `;
    }

    return await objConn.execute({
        sql: `select distinct G046.IDG046,
                              G046.IDG024, /*Carga*/
                              G046.IDCARLOG,
                              G002DE.IDG002   AS CDUFDE,
                              G002DE.CDESTADO As UFDE, /* Estado da Destinatário */
                              LISTAGG (G048.IDG048, ', ') WITHIN GROUP( ORDER BY G048.IDG048) As IDG048, /* Paradas */
                              G031M1.NMMOTORI || ' CPF:' || G031M1.CJMOTORI || ' [' || G031M1.idg031   || '-' || G031M1.nrmatric   || ']' As NMMOTORIM1,
                              NVL2(G031M2.NMMOTORI, G031M2.NMMOTORI || ' CPF:' || G031M2.CJMOTORI || ' [' || G031M2.idg031   || '-' || G031M2.nrmatric   || ']', null) As NMMOTORIM2,
                              NVL2(G031M3.NMMOTORI, G031M3.NMMOTORI || ' CPF:' || G031M3.CJMOTORI || ' [' || G031M3.idg031   || '-' || G031M3.nrmatric   || ']', null) As NMMOTORIM3,
                              G032V1.DSVEICUL || ' PLACA: ' || G032V1.NRPLAVEI || ' ['|| G032V1.IDG032 ||']' AS DSVEICULV1,
                              NVL2(G032V2.DSVEICUL, G032V2.DSVEICUL || ' PLACA: ' || G032V2.NRPLAVEI || ' ['|| G032V2.IDG032 ||']', null) AS DSVEICULV2,
                              NVL2(G032V3.DSVEICUL, G032V3.DSVEICUL || ' PLACA: ' || G032V3.NRPLAVEI || ' ['|| G032V3.IDG032 ||']', null) AS DSVEICULV3,
                              ${sqlColumns}
                    from g046 g046
              INNER Join G048 G048 /* Paradas */
                      On (G048.IDG046 = G046.IDG046)
              INNER JOIN G049 G049
                      ON G049.IDG048 = G048.IDG048
              INNER JOIN G052 G052
                      ON G052.IDG051 = G049.IDG051
                      AND G052.IDG043 = G049.IDG043
              INNER JOIN G051 G051
                      ON G051.IDG051 = G052.IDG051
              INNER JOIN G043 G043
                      ON G043.IDG043 = G052.IDG043
              INNER Join G005 G005DE /* Cliente Destinatário */
                      On (G005DE.IDG005 = G048.IDG005DE)
              INNER Join G003 G003DE /* Cidade do Destinatário */
                      On (G003DE.IDG003 = G005DE.IDG003)
              INNER Join G002 G002DE /* Estado do Destinatário*/
                      On (G002DE.IDG002 = G003DE.IDG002)
              INNER Join G024 G024 /* Transportadora */
                      On (G024.IDG024 = G046.IDG024)
              INNER Join G031 G031M1
                      On G031M1.IDG031 = G046.IDG031M1
              LEFT Join G031 G031M2
                      On G031M1.IDG031 = G046.IDG031M2
              LEFT Join G031 G031M3
                      On G031M1.IDG031 = G046.IDG031M3
              INNER Join G032 G032V1
                      On G032V1.IDG032 = G046.IDG032V1
              LEFT  Join G032 G032V2
                      On G032V2.IDG032 = G046.IDG032V2
              LEFT  Join G032 G032V3
                      On G032V3.IDG032 = G046.IDG032V3       
              ${sqlJoin}
              where g046.idg046 in (${req.body.obj.IDG046}) 
                AND G051.DSMODENF <> 'NF'
                ${sqlWhere}
              GROUP BY G046.IDG046,
              G046.IDCARLOG,
              G046.IDG024,
              G002DE.IDG002,
              G002DE.CDESTADO,
              G031M1.NMMOTORI || ' CPF:' || G031M1.CJMOTORI || ' [' || G031M1.idg031   || '-' || G031M1.nrmatric   || ']',
              NVL2(G031M2.NMMOTORI, G031M2.NMMOTORI || ' CPF:' || G031M2.CJMOTORI || ' [' || G031M2.idg031   || '-' || G031M2.nrmatric   || ']', null),
              NVL2(G031M3.NMMOTORI, G031M3.NMMOTORI || ' CPF:' || G031M3.CJMOTORI || ' [' || G031M3.idg031   || '-' || G031M3.nrmatric   || ']', null),
              G032V1.DSVEICUL || ' PLACA: ' || G032V1.NRPLAVEI || ' ['|| G032V1.IDG032 ||']',
              NVL2(G032V2.DSVEICUL, G032V2.DSVEICUL || ' PLACA: ' || G032V2.NRPLAVEI || ' ['|| G032V2.IDG032 ||']', null),
              NVL2(G032V3.DSVEICUL, G032V3.DSVEICUL || ' PLACA: ' || G032V3.NRPLAVEI || ' ['|| G032V3.IDG032 ||']', null),        
              ${sqlGoupBy}
                  `,
        param:[]
    }).then((res) => {
        objConn.close();
        return res;
        
    }).catch((err) => {
        objConn.closeRollBack();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
    });
  };

  /**
   * @description Cadastra as informações MDF-e
   *
   * @async
   * @function api/tp/mdfe/salvarMdfe
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.salvarMdfe = async function (req, res, next) {

    
      try{

        var objConn    = await this.controller.getConnection(null, req.body.USERID);
        var insertF001 = null;
        var obs        = '';
        var sqlCtes    = '';
        var idf001Aux  = '';
        var idcarlog   = '';
        
        for (let k = 0; k < req.body.QTD; k++) {
          
          /**Colocar todos os UFs do percurso do MDF-e dentro de uma variável */
          let estados = req.body['PERCURSO0']['UFINICIO'].text+', ';
          for (let b = 1; b <= 8; b++) {
  
            if(req.body['PERCURSO'+k]['UF'+b] != null){
             estados += req.body['PERCURSO'+k]['UF'+b].text+', '
            }
  
          }
          estados += req.body['PERCURSO'+k]['UFFINAL'].text;

          /**Busca todos os CTEs das paradas */
          sqlCtes = await objConn.execute(
          {
            sql: `SELECT DISTINCT G051.Idg051, G051.CDCTRC
                    FROM G048 G048
                  INNER JOIN G049 G049
                      ON G049.IDG048 = G048.IDG048 
                  INNER JOIN G051 G051
                      ON G051.IDG051 = G049.IDG051
                  WHERE G051.DSMODENF <> 'NF' AND G048.IDG048 IN (${req.body['PERCURSO'+k].IDG048})`,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          /**Coloca todos os CTCTRCs do MDF-e dentro de uma variável */
          let infCtes = '';
          for(let i = 0; i < sqlCtes.length; i++){
            infCtes += sqlCtes[i].CDCTRC+', ';
          }

          infCtes = infCtes.substr(0,(infCtes.length - 2));

          idcarlog = req.body['PERCURSO'+k].IDCARLOG != null && req.body['PERCURSO'+k].IDCARLOG != undefined ? '/ Carga Logos: '+req.body['PERCURSO'+k].IDCARLOG : '';
          obs      = req.body['PERCURSO'+k].OBS != null && req.body['PERCURSO'+k].OBS != undefined ? req.body['PERCURSO'+k].OBS+ ' Carga Evolog: '+req.body['PERCURSO'+k].IDG046 + idcarlog : 'Carga Evolog: '+req.body['PERCURSO'+k].IDG046 + idcarlog ;
          obs     += ' - CTEs: '+infCtes;
          obs     += ' - Percurso: '+estados;

          /** Insere as informações do manisfesto */
          insertF001 = await objConn.insert({
            tabela: 'F001',
            colunas: {
              IDG024  : req.body['PERCURSO'+k].IDG024,
              IDS001  : req.body.USERID,
              STMDF   :  'N',
              DTCADAST: dtatu.dataAtualJS(),
              TPLOCOLE: req.body['PERCURSO'+k].TPLOCOLE,
              DSMDF   : obs,
            },
            key: 'IDF001'
          })
          .then((result) => {
              return (result);
          })
          .catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
          });

          for(let i = 0; i < sqlCtes.length; i++){
            /** Víncula as cargas e os CTEs ao manifesto */
            await objConn.insert({
              tabela: 'F003',
              colunas: {
                IDF001: 	insertF001,
                IDG046: 	req.body['PERCURSO'+k].IDG046,
                IDG051:   sqlCtes[i].IDG051,
              },
              key: 'IDF003'
            })
            .then((result) => {
                return (result);
            })
            .catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
          }
          

          /** Cadastra o estado inicial(carregamento) do percurso do manifesto */
          await objConn.insert({
            tabela: 'F002',
            colunas: {
              IDF001  : 	insertF001,
              IDG002  : 	req.body['PERCURSO'+k]['UFINICIO'].id,
              NRSEQUEN: 	1, 
            }
          })
          .then((result) => {
            return true;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          /** Cadastra os estados do percurso do manifesto */
          var z = 1;
          for (let i = 1; i <= 8; i++) {

            if(req.body['PERCURSO'+k]['UF'+i] != null){
              await objConn.insert({
                tabela: 'F002',
                colunas: {
                  IDF001  : 	insertF001,
                  IDG002  : 	req.body['PERCURSO'+k]['UF'+i].id,
                  NRSEQUEN: 	z+1, 
                }
              })
              .then((result) => {
                  z++;
                  return true;
              })
              .catch((err) => {
                objConn.closeRollBack();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
            }

          }

          /** Cadastra o estado final(descarregamento) do percurso do manifesto */
          await objConn.insert({
            tabela: 'F002',
            colunas: {
              IDF001  : 	insertF001,
              IDG002  : 	req.body['PERCURSO'+k]['UFFINAL'].id,
              NRSEQUEN: 	z+1, 
            }
          })
          .then((result) => {
            return true;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

           /** Vincular na parada o código do manifesto */
           await objConn.execute(
            {
              sql: `UPDATE G048 
              SET IDF001 = ${insertF001} 
            WHERE IDG048 in (${req.body['PERCURSO'+k].IDG048})`,
              param: []
            })
            .then((result) => {
              return true;
            })
            .catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });

            idf001Aux += insertF001+',';

        }

        await objConn.close();

        idf001Aux = idf001Aux.substring(0,(idf001Aux.length - 1));

        res.status(200);
        resposta = { response: `MDF-e ${idf001Aux} gerado(s) com sucesso.`  };
        res.json(resposta); 

      } catch (err) {
        objConn.closeRollBack();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }

  };
  
  /**
   * @description Busca as informações do percurso do MDF-e
   *
   * @async
   * @function api/tp/mdfe/buscarMdfe
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.buscarMdfe = async function(req,res,next){
    
    var objConn    = await this.controller.getConnection();

    var sqlColumns = ``;
    var sqlJoin    = ``;
    var sqlGoupBy  = ``;

    if(req.body.obj.TPLOCOLE.id == 1){//Filial
      sqlGoupBy  = `  ,G002OR.IDG002, G002OR.CDESTADO`;
      sqlColumns = `  ,G002OR.IDG002   AS CDUFOR,
                      G002OR.CDESTADO As UFOR /* Estado da Origem */`;
      sqlJoin    = `  JOIN G024 G024 
                        ON G024.IDG024 = F001.IDG024
                      Join G003 G003OR /* Cidade Origem */
                        On (G003OR.IDG003 = G024.IDG003)
                      Join G002 G002OR /* Estado Origem */
                        On (G002OR.IDG002 = G003OR.IDG002)`;

    }else if(req.body.obj.TPLOCOLE.id == 2){//Cliente
      sqlGoupBy  = ` ,G002RE.IDG002, G002RE.CDESTADO`;
      sqlColumns = ` ,G002RE.IDG002   AS CDUFOR,
                     G002RE.CDESTADO As UFOR /* Estado da Origem */`;

      sqlJoin   = ` Join G048 G048RE /* Paradas Remetente */
                          On (G048RE.IDG046 = F003.IDG046 
                        And G048RE.NRSEQETA = 1)
                     JOIN G049 G049RE 
                        ON G049RE.IDG048 = G048RE.IDG048     
                     JOIN G051 G051RE 
                      ON G051RE.IDG051 = G049RE.IDG051
                     JOIN G005 G005RE /* Cliente Remetente */
                        ON (G005RE.IDG005 = NVL(G051RE.IDG005EX, G051RE.IDG005RE))
                     Join G003 G003RE /* Cidade Remetente */
                          On (G003RE.IDG003 = G005RE.IDG003)
                     Join G002 G002RE /* Estado Remetente */
                          On (G002RE.IDG002 = G003RE.IDG002)`;

    }

    return await objConn.execute({
        sql: `SELECT  F001.IDF001,
                      F001.TPLOCOLE,
                      F001.DSMDF,
                      F001.IDG024,
                      F002.IDG002,
                      G002.CDESTADO,
                      F002.NRSEQUEN,
                      LISTAGG (X.IDG048, ', ') WITHIN GROUP( ORDER BY X.IDG048) AS IDG048,
                      F003.IDG046,
                      G046.IDCARLOG,
                      G046.DSCARGA,
                      G031M1.NMMOTORI || ' CPF:' || G031M1.CJMOTORI || ' [' || G031M1.idg031   || '-' || G031M1.nrmatric   || ']' As NMMOTORIM1,
                      NVL2(G031M2.NMMOTORI, G031M2.NMMOTORI || ' CPF:' || G031M2.CJMOTORI || ' [' || G031M2.idg031   || '-' || G031M2.nrmatric   || ']', null) As NMMOTORIM2,
                      NVL2(G031M3.NMMOTORI, G031M3.NMMOTORI || ' CPF:' || G031M3.CJMOTORI || ' [' || G031M3.idg031   || '-' || G031M3.nrmatric   || ']', null) As NMMOTORIM3,
                      G032V1.DSVEICUL || ' PLACA: ' || G032V1.NRPLAVEI || ' ['|| G032V1.IDG032 ||']' AS DSVEICULV1,
                      NVL2(G032V2.DSVEICUL, G032V2.DSVEICUL || ' PLACA: ' || G032V2.NRPLAVEI || ' ['|| G032V2.IDG032 ||']', null) AS DSVEICULV2,
                      NVL2(G032V3.DSVEICUL, G032V3.DSVEICUL || ' PLACA: ' || G032V3.NRPLAVEI || ' ['|| G032V3.IDG032 ||']', null) AS DSVEICULV3
                      ${sqlColumns},
                      
                      COUNT(F001.IDF001) OVER() AS COUNT
                FROM (
                      
                      SELECT DISTINCT G048.IDG048, G048.IDF001
                      
                        FROM G048 G048
                      
                        WHERE G048.IDF001 IN (${req.body.obj.IDF001})) X
                INNER JOIN F001 F001
                   ON F001.IDF001 = X.IDF001
                INNER JOIN F003 F003
                   ON F003.IDF001 = F001.IDF001
                INNER JOIN G046 G046
                   ON G046.IDG046 = F003.IDG046
                INNER JOIN F002 F002
                   ON F002.IDF001 = F003.IDF001
                INNER JOIN G002 G002
                   ON G002.IDG002 = F002.IDG002
                INNER Join G031 G031M1
                   On G031M1.IDG031 = G046.IDG031M1
                 LEFT Join G031 G031M2
                   On G031M1.IDG031 = G046.IDG031M2
                 LEFT Join G031 G031M3
                   On G031M1.IDG031 = G046.IDG031M3
                INNER Join G032 G032V1
                   On G032V1.IDG032 = G046.IDG032V1
                 LEFT Join G032 G032V2
                   On G032V2.IDG032 = G046.IDG032V2
                 LEFT Join G032 G032V3
                   On G032V3.IDG032 = G046.IDG032V3 
                ${sqlJoin}
                GROUP BY F001.IDF001,
                        F001.TPLOCOLE,
                        F001.DSMDF,
                        F001.IDG024,
                        F002.IDG002,
                        G002.CDESTADO,
                        F002.NRSEQUEN,
                        F003.IDG046,
                        G046.IDCARLOG,
                        G046.DSCARGA,
                        G031M1.NMMOTORI || ' CPF:' || G031M1.CJMOTORI || ' [' || G031M1.idg031   || '-' || G031M1.nrmatric   || ']',
                        NVL2(G031M2.NMMOTORI, G031M2.NMMOTORI || ' CPF:' || G031M2.CJMOTORI || ' [' || G031M2.idg031   || '-' || G031M2.nrmatric   || ']', null),
                        NVL2(G031M3.NMMOTORI, G031M3.NMMOTORI || ' CPF:' || G031M3.CJMOTORI || ' [' || G031M3.idg031   || '-' || G031M3.nrmatric   || ']', null),
                        G032V1.DSVEICUL || ' PLACA: ' || G032V1.NRPLAVEI || ' ['|| G032V1.IDG032 ||']',
                        NVL2(G032V2.DSVEICUL, G032V2.DSVEICUL || ' PLACA: ' || G032V2.NRPLAVEI || ' ['|| G032V2.IDG032 ||']', null),
                        NVL2(G032V3.DSVEICUL, G032V3.DSVEICUL || ' PLACA: ' || G032V3.NRPLAVEI || ' ['|| G032V3.IDG032 ||']', null)
                        ${sqlGoupBy}
                ORDER BY F002.NRSEQUEN ASC`,
        param:[]
    }).then((res) => {
        objConn.close();
        return res;
        
    }).catch((err) => {
        objConn.closeRollBack();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
    });
  };

  /**
   * @description Atualiza as informações do MDF-e 
   *
   * @async
   * @function api/tp/mdfe/atualizarMdfe
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.atualizarMdfe = async function (req, res, next) {

    
    try{

      let valida     = await this.validarMDFe(req, res, next);
      var objConn    = await this.controller.getConnection(null, req.body.USERID);
      var insertF001 = req.body.IDF001;

      if(valida[0].STMDF == 'E'){
        var idcarlog   = req.body.IDCARLOG != null && req.body.IDCARLOG != undefined ? '/ Carga Logos: '+req.body.IDCARLOG : '';
        var obs        = req.body.OBS != null && req.body.OBS != undefined ? req.body.OBS : 'Carga Evolog: '+req.body.IDG046 + idcarlog;
      
        /** Trocar o status do MDF-e*/
        await objConn.execute(
          {
            sql: `UPDATE F001 
                  SET STMDF = 'N', TPLOCOLE = ${req.body.TPLOCOLE}, DSMDF = '${obs}', DSERRO = ''
                  WHERE IDF001 in (${insertF001})`,
            param: []
          })
          .then((result) => {
            return true;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          /**Apagar o percurso */
          await objConn.execute(
            {
              sql: `DELETE FROM F002
                    WHERE IDF001 in (${insertF001})`,
              param: []
            })
            .then((result) => {
              return true;
            })
            .catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });

          /** Cadastra o estado inicial(carregamento) do percurso do manifesto */
          await objConn.insert({
            tabela: 'F002',
            colunas: {
              IDF001  : 	insertF001,
              IDG002  : 	req.body['UFINICIO'].id,
              NRSEQUEN: 	1, 
            }
          })
          .then((result) => {
            return true;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          /** Cadastra os estados do percurso do manifesto */
          var z = 1;
          for (let i = 1; i <= 8; i++) {

            if(req.body['UF'+i] != null){
              await objConn.insert({
                tabela: 'F002',
                colunas: {
                  IDF001  : 	insertF001,
                  IDG002  : 	req.body['UF'+i].id,
                  NRSEQUEN: 	z+1, 
                }
              })
              .then((result) => {
                  z++;
                  return true;
              })
              .catch((err) => {
                objConn.closeRollBack();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
            }

          }

          /** Cadastra o estado final(descarregamento) do percurso do manifesto */
          await objConn.insert({
            tabela: 'F002',
            colunas: {
              IDF001  : 	insertF001,
              IDG002  : 	req.body['UFFINAL'].id,
              NRSEQUEN: 	z+1, 
            }
          })
          .then((result) => {
            return true;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

        await objConn.close();
        res.status(200);
        resposta = { response: `MDF-e ${insertF001} foi atualizado com sucesso e será reenviado.`  };
        res.json(resposta); 

      }else{
        await objConn.close();
        res.status(403);
        resposta = { response: `MDF-e ${insertF001} não pode ser editado, pois o status dele é diferente de "Erro".`  };
        res.json(resposta); 
      }

      

    } catch (err) {
      objConn.closeRollBack();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

  };

  /**
   * @description Busca o xml do MDF-e
   *
   * @async
   * @function api/tp/mdfe/downloadXmlMdfe
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.buscarXML = async function (req, res, next) {
    
    try{

      var parm    = {};
      parm.fetchInfo = [{ column: 'TXXMLMDF', type: 'BLOB' }];
      parm.sql = 
      `SELECT IDF001, NRCHAMDF, TXXMLMDF FROM F001 
      WHERE IDF001 in (${req.params.id})`;
      return await gdao.executar(parm, res, next);

  } catch (err) {
    err.stack = new Error().stack + `\r\n` + err.stack;
    throw err;
  }
  };

  /**
   * @description Salva a troca de status do MDF-e (Sol. Encerramento (M) e Sol. Cancelamento (L))
   *
   * @async
   * @function /api/tp/mdfe/salvarTrocaStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.salvarTrocaStatus = async function (req, res, next) {

    try{

      var objConn    = await this.controller.getConnection();
      var insertF001 = req.body.IDF001;
      let valida     = await this.validarMDFe(req, res, next);
      var msg      = '';
      var sqlWhere = '';

      if(req.body.STMDF == 'M'){
        msg = 'encerramento';
        sqlWhere = ` , DSCANCEL = ''`;
      }else if(req.body.STMDF == 'L'){
        msg      = 'cancelamento';
        sqlWhere = ` , DSCANCEL = '${req.body.DSCANCEL}'`;
      }

      if(valida[0].STMDF == 'A' || valida[0].STMDF == 'M' || valida[0].STMDF == 'L'){
        /** Trocar o status do MDF-e*/
        await objConn.execute(
          {
            sql: `UPDATE F001 
                  SET STMDF = '${req.body.STMDF}', DSERRO = '', IDS001CA = ${req.body.USERID} ${sqlWhere}
                  WHERE IDF001 in (${insertF001})`,
            param: []
          })
          .then((result) => {

            return true;

          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          await objConn.close();

          res.status(200);
          resposta = { response: `Solicitação de ${msg} do MDF-e ${insertF001} foi realizado com sucesso.`  };
          res.json(resposta); 
      }else{
        await objConn.close();
        res.status(403);
        resposta = { response: `O ${msg} do MDF-e ${insertF001} não pode ser realizado, pois o status dele é diferente de "Autorizado".` };
        res.json(resposta); 
      }

      } catch (err) {
        objConn.closeRollBack();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }
  };

    /**
   * @description Validar se a carga pode gerar MDF-e
   *
   * @async
   * @function api/tp/mdfe/validarCarga
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.validarCarga = async function (req, res, next) {

    
    try{

      var objConn    = await this.controller.getConnection(null, req.body.USERID);
      let idg046     = req.body.obj.IDG046;
      let idg032     = req.body.obj.IDG032V1;
      let idg024     = req.body.obj.IDG024;
      let idg031     = req.body.obj.IDG031M1;
      let msg        = '';

      /**Valida se as deliveries estão ativas */
      sqlDeliveries = await objConn.execute(
        {
          sql: `SELECT COUNT(G043.IDG043) AS QTD 
                  FROM G046
                INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                INNER JOIN G049 G049 ON G049.IDG048 = G048.IDG048 
                INNER JOIN G052 G052 ON G052.IDG051 = G049.IDG051 
                                    AND G052.IDG043 = G049.IDG043
                INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043 
                WHERE G046.IDG046 = ${idg046}
                  AND NVL(G043.STETAPA,0) IN (7,8)`,
          param: []
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        if(sqlDeliveries[0].QTD > 0){
          msg = `Existe deliverie(s) cancelada(s) nesta carga.`
        }

        if(msg == ''){

          /**Existe MDF-e não encerrado para esta placa, tipo de emitente, motorista e UF descarregamento */
          sqlCargas = await objConn.execute(
          {
            sql: `SELECT LISTAGG(X.NRMDF, ', ') WITHIN GROUP(ORDER BY X.NRMDF) AS QTD, X.NMTRANSP
            
            FROM (
                    SELECT DISTINCT F001.NRMDF, G024.NMTRANSP
                    FROM F001 F001
                  INNER JOIN F003 F003
                      ON F001.IDF001 = F003.IDF001
                  INNER JOIN F002 F002
                      ON F002.IDF001 = F001.IDF001 AND F002.NRSEQUEN = (SELECT MAX(X.NRSEQUEN) FROM F002 X WHERE X.IDF001 = F001.IDF001)
                  INNER JOIN G046 G046
                      ON G046.IDG046 = F003.IDG046
                  INNER JOIN G048 G048
                      ON G048.IDG046 = G046.IDG046
                  INNER JOIN G005 G005
                      ON G005.IDG005 = G048.IDG005DE
                  INNER JOIN G003 G003
                      ON G003.IDG003 = G005.IDG003
                  INNER Join G024 G024 
                      On (G024.IDG024 = F001.IDG024)
                  WHERE F001.IDG024 = ${idg024}
                    AND G046.IDG032V1 = ${idg032}
                    AND G046.IDG031M1 = ${idg031}
                    AND G048.IDF001 IS NOT NULL
                    AND F002.IDG002 IN (SELECT DISTINCT G003X.IDG002
                    FROM G046 G046X
                  INNER JOIN G048 G048X
                      ON G048X.IDG046 = G046X.IDG046
                  INNER JOIN G005 G005X
                      ON G005X.IDG005 = G048X.IDG005DE
                  INNER JOIN G003 G003X
                      ON G003X.IDG003 = G005X.IDG003
                  WHERE G046X.IDG046 = ${idg046} AND G048X.IDF001 IS NULL)
                    AND F001.STMDF NOT IN ('R', 'C', 'I'))X
            GROUP BY X.NMTRANSP`,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          if(sqlCargas.length > 0){
            msg = `Existe MDF-e não encerrado para esta placa, motorista, emitente e UF descarregamento.
             No qual, o Nr. MDF-e é ${sqlCargas[0].QTD} e a Transportadora é ${sqlCargas[0].NMTRANSP}.`
          }

        }

        if(msg == ''){

          /**Existe MDF-e não encerrado para esta placa */
          sqlCargas = await objConn.execute(
            {
              sql: `SELECT LISTAGG(X.NRMDF, ', ') WITHIN GROUP(ORDER BY X.NRMDF) AS QTD, X.NMTRANSP
              
              FROM (
                      SELECT DISTINCT F001.NRMDF, G024.NMTRANSP
                      FROM F001 F001
                    INNER JOIN F003 F003
                        ON F001.IDF001 = F003.IDF001
                    INNER JOIN F002 F002
                        ON F002.IDF001 = F001.IDF001 AND F002.NRSEQUEN = (SELECT MAX(X.NRSEQUEN) FROM F002 X WHERE X.IDF001 = F001.IDF001)
                    INNER JOIN G046 G046
                        ON G046.IDG046 = F003.IDG046
                    INNER JOIN G048 G048
                        ON G048.IDG046 = G046.IDG046
                    INNER JOIN G005 G005
                        ON G005.IDG005 = G048.IDG005DE
                    INNER JOIN G003 G003
                        ON G003.IDG003 = G005.IDG003
                    INNER Join G024 G024 
                        On (G024.IDG024 = F001.IDG024)
                    WHERE G046.IDG032V1 = ${idg032}
                      AND G048.IDF001 IS NOT NULL
                      AND F001.STMDF NOT IN ('R', 'C', 'I'))X
              GROUP BY X.NMTRANSP`,
              param: []
            })
            .then((result) => {
              return result;
            })
            .catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
    
            if(sqlCargas.length > 0){
              msg = `Existe MDF-e não encerrado para esta placa, Nr. MDF-e ${sqlCargas[0].QTD}.`
            }

        }

        await objConn.close();

        res.status(200);
        resposta = { response: msg  };
        res.json(resposta); 

    } catch (err) {
      objConn.closeRollBack();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

  };

  /**
   * @description Validar se o MDF-e pode ser alterado
   *
   * @async
   * @function 
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.validarMDFe = async function (req, res, next) {
  
    try{

      let objConn    = await this.controller.getConnection();
      let insertF001 = req.body.IDF001;
      return await objConn.execute({
        sql: `SELECT STMDF FROM F001 WHERE IDF001 = ${insertF001}`,
        param:[]
      }).then((res) => {
          objConn.close();
          return res;
          
      }).catch((err) => {
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      });


    } catch (err) {
      objConn.closeRollBack();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

  };

    /**
   * @description Validar se o MDF-e pode ser alterado
   *
   * @async
   * @function 
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Brenda Oliveira.
   */
  api.validarPdfMdfe = async function (req, res, next) {
  
    try{

      let objConn    = await this.controller.getConnection();
      let insertF001 = req.body.IDF001;
      return await objConn.execute({
        sql: `Select count(IdF001) qtd
                From F001 
              Where nrchamdf <> Substr(BlobToVarchar(TxXmlMdf), (InStr(Upper(BlobToVarchar(TxXmlMdf)), 'ID="MDFE') + 8), 44)
              and txxmlmdf is not null
              and IDF001 = ${insertF001}`,
        param:[]
      }).then((res) => {
          objConn.close();
          return res;
          
      }).catch((err) => {
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      });


    } catch (err) {
      objConn.closeRollBack();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

  };

  return api;

}