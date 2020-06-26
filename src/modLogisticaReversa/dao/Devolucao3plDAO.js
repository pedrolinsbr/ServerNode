module.exports = function (app, cb) {

    const gdao  = app.src.modGlobal.dao.GenericDAO;
    const utils = app.src.utils.FuncoesObjDB;
    const acl   = app.src.modIntegrador.controllers.FiltrosController;
    
    var api = {};
    
    api.controller  = gdao.controller;
    api.inserir     = gdao.inserir;
    api.alterar     = gdao.alterar;

    //-----------------------------------------------------------------------\\

    api.alteraDadosDelivery = async function (req, res, next) {

        try {

            var sqlAux = `SET STETAPA = ${req.STETAPA}`;
            sqlAux += (req.IDI015) ? `, IDI015 = ${req.IDI015}` : ``;

            var sql = 
                `UPDATE G043 ${sqlAux}
                    
                WHERE IDG043 IN
                    (SELECT G049.IDG043 
                    FROM G049 
                    INNER JOIN G048 
                        ON G048.IDG048 = G049.IDG048
                        AND G048.IDG046 IN (${req.IDG046.join()}))`;
            
            var parm = { objConn: req.objConn, sql };

            await gdao.controller.setConnection(parm.objConn);            

            return await gdao.executar(parm, res, next);
            
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.buscaDadosContato = async function (req, res, next) {

        try {

            var arCols = 
                [
                    'G046.IDG046',
                    'G046.IDG024', 
                    'G048.IDG048', 
                    'G049.IDG043'
                ];

            var parm = { objConn: req.objConn };

            parm.sql = 
                `SELECT 
                    ${arCols.join()},
                    COUNT(A001.IDA001) TTCONTAT

                 FROM G046 -- CARGAS

                 INNER JOIN G048 -- ETAPAS
                    ON G048.IDG046 = G046.IDG046                    

                INNER JOIN G049 -- ETAPAS x DELIVERIES
                    ON G049.IDG048 = G048.IDG048

                LEFT JOIN A005 -- CONTATOS x DELIVERY
                    ON A005.IDG043 = G049.IDG043
                    
                LEFT JOIN A001 -- CONTATOS
                    ON A001.IDA001 = A005.IDA001
                    AND A001.IDA002 = 18 -- REGISTRO PADRÃO
                    AND A001.SNDELETE = 0

                WHERE 
                    G046.SNDELETE = 0
                    AND G046.TPTRANSP = 'D'
                    AND G046.IDG046 IN (${req.post.IDG046.join()})

                GROUP BY ${arCols.join()}

                ORDER BY 
                    G046.IDG046, 
                    G048.IDG048`;

            await gdao.controller.setConnection(parm.objConn);
            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.atualizaRC = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };
        
            parm.sql = `UPDATE G043 SET IDI015 = ${req.post.IDI015} WHERE IDG043 = ${req.post.IDG043}`;
    
            await gdao.controller.setConnection(parm.objConn);            

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.listarHistContato = async function (req, res, next) {

        try {

            if (req.UserId) {
                var sqlAcl = await acl.montar({
                    ids001: req.UserId,
                    dsmodulo: 'Logistica-Reversa',
                    nmtabela: [{ G024: 'G024' }],
                    //dioperad: ' ',
                    esoperad: 'AND'
                });
    
            } else {
                var sqlAcl = '';
            }
    
            req.sql = 
                `SELECT	
                    G024.IDG024,
                    G024.NMTRANSP,
                
                    S001.IDS001,
                    S001.NMUSUARI,
                
                    A001.NMSOLITE,
                    TO_CHAR(A001.DTREGIST, 'DD/MM/YYYY HH24:MI') DTREGIST,
                    
                    DBMS_LOB.SUBSTR(A003.DSOBSERV, 4000, 1) DSOBSERV, -- CLOB FIELD
    
                    I015.IDI015,
                    I015.DSOCORRE
                    
                FROM A001 -- CONTATO
                
                INNER JOIN A003 -- DETALHE DO CONTATO
                    ON A003.IDA001 = A001.IDA001
                                
                INNER JOIN A005 -- CONTATO x DELIVERY
                    ON A005.IDA001 = A001.IDA001
                                    
                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = A001.IDG024
                    
                INNER JOIN S001 -- USUÁRIO
                    ON S001.IDS001 = A003.IDS001RE
    
                LEFT JOIN I015 -- REASON CODE
                    ON I015.IDI015 = A003.IDI015
                    
                WHERE 
                    A001.SNDELETE = 0
                    AND A001.IDA002 = 18 -- REGISTRO PADRÃO
                    AND A005.IDG043 = ${req.params.id}
                    ${sqlAcl}
                    
                ORDER BY A001.IDA001 DESC`;
    
            return await gdao.executar(req, res, next);
    
        } catch (err) {

            throw err;

        }

    }
    
    //-----------------------------------------------------------------------\\    

    api.confirmarColeta = async function (req, res, next) {

        try { 

            var sql = 
                `UPDATE G046 SET 
                    STCARGA = 'T', 
                    DTSAICAR = TO_DATE('${req.DTSAICAR}', 'DD-MM-YYYY HH24:MI')
                WHERE IDG046 IN (${req.IDG046.join()})`;
            
            var parm = { objConn: req.objConn, sql };

            return await gdao.executar(parm, res, next);
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.alteraStatusParada = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql = `UPDATE G048 SET STINTCLI = ${req.STINTCLI} WHERE IDG046 IN (${req.IDG046.join()})`;

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.listarDevolucao3pl = async function(req, res, next) {

        try {

            var userId = req.UserId || 1;

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

            var sqlAcl = await acl.montar({
                ids001: userId,
                dsmodulo: 'Logistica-Reversa',
                nmtabela: [{ G024: 'G024' }],
                //dioperad: ' ',
                esoperad: 'AND'
            });
    
            var arCols = 
                [
                    'G046.IDG046',
                    'G046.DTCARGA',
                    'G046.DTAGENDA',
                    'G046.DTPRESAI',
                    'G046.DTSAICAR',
                    'G046.PSCARGA',
                    'G046.VRCARGA',
                    'G046.SNCARPAR',
                    'G046.TPTRANSP',

                    'G048.STINTCLI',

                    'O005.IDO005', 
                    
                    'G043.IDG043',
                    'G043.CDDELIVE',
                    'G043.NRNOTA',
                    
                    'I015.IDI015',
                    'I015.DSOCORRE',

                    'I007.IDI007',
                    'I007.IDREACOD',
                    
                    'G030.IDG030',
                    'G030.DSTIPVEI',
                
                    'G024.IDG024',
                    'G024.NMTRANSP',
                
                    'G003RE.IDG003',
                    'G003RE.NMCIDADE',
                    'G002RE.CDESTADO',
                    'G003DE.IDG003',
                    'G003DE.NMCIDADE',
                    'G002DE.CDESTADO',

                    'G005RE.IDG005',
                    'G005RE.NMCLIENT',
                    'G005RE.CJCLIENT'
                ];

            var sqlAux = '';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            switch (req.body['parameter[STCARGA]']) {

                case 'O': //Oferecidas
                    sqlAux += `AND G046.STCARGA = 'O' `;
                    break;

                case 'X': //Recusadas
                    sqlAux += `AND G046.STCARGA = 'X' `;
                    break;

                case 'A': //Aceitas
                    sqlAux += `AND G046.STCARGA = 'A' `;
                    break;

                case 'S': //Agendadas
                    sqlAux += `AND G046.STCARGA = 'S' `;
                    break;

                case 'T': //Transporte
                    sqlAux += `AND G046.STCARGA = 'T' `;
                    break;
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var sql = 
                `SELECT 
                    G046.IDG046,
                    TO_CHAR(G046.DTCARGA,  'DD/MM/YYYY HH24:MI')    DTCARGA,
                    TO_CHAR(G046.DTAGENDA, 'DD/MM/YYYY HH24:MI')    DTAGENDA,
                    TO_CHAR(G046.DTPRESAI, 'DD/MM/YYYY HH24:MI')    DTPRESAI,
                    TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY HH24:MI')    DTSAICAR,
                    ROUND (G046.PSCARGA, 2)  PSCARGA,
                    ROUND (G046.VRCARGA, 2)  VRCARGA,
                    G046.SNCARPAR,
                    G046.TPTRANSP,

                    CASE
                        WHEN G046.SNCARPAR = 'S' THEN 'LTL' 
                        ELSE 'FTL'
                    END TPOCUPAC,
                
                    CASE
                        WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                        WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
                        WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO' 
                        ELSE 'OUTRO'
                    END TPOPERAC,

                    O005.IDO005, 

                    G048.STINTCLI STENVASN,            
                
                    G043.IDG043,
                    G043.CDDELIVE,
                    G043.NRNOTA,

                    I015.IDI015,
                    I015.DSOCORRE,

                    I007.IDI007,
                    I007.IDREACOD,

                    G030.IDG030,
                    G030.DSTIPVEI   G030_DSTIPVEI,
                
                    G024.IDG024,
                    G024.NMTRANSP   G024_NMTRANSP,

                    G003RE.IDG003 IDG003RE,
                    G003DE.IDG003 IDG003DE,
                    UPPER(G003RE.NMCIDADE) || '/' || G002RE.CDESTADO G003RE_NMCIDADE,
                    UPPER(G003DE.NMCIDADE) || '/' || G002DE.CDESTADO G003DE_NMCIDADE,

                    G005RE.IDG005 IDG005RE,
                    G005RE.NMCLIENT G005RE_NMCLIENT,
                    G005RE.CJCLIENT CJCLIREM,
                
                    COUNT(A001.IDA001) TTCONTAT,
                    
                    COUNT(*) OVER() COUNT_LINHA
                
                FROM G046 -- CARGAS
                
                INNER JOIN G030 -- TIPO DE VEICULO
                    ON G030.IDG030 = G046.IDG030
                    
                INNER JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024

                INNER JOIN O005 -- OFERECIMENTO 
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G024.IDG024
                
                INNER JOIN G048 -- ETAPA
                    ON G048.IDG046 = G046.IDG046
                
                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG048 = G048.IDG048
                
                INNER JOIN G043 -- DELIVERY
                    ON G043.IDG043 = G049.IDG043

                INNER JOIN G014 -- OPERACAO
                    ON G014.IDG014 = G043.IDG014
                
                INNER JOIN G005 G005RE -- REMETENTE
                    ON G005RE.IDG005 = G048.IDG005OR
                
                INNER JOIN G005 G005DE -- DESTINATÁRIO
                    ON G005DE.IDG005 = G048.IDG005DE
                
                INNER JOIN G003 G003RE -- CIDADE REMETENTE
                    ON G003RE.IDG003 = G005RE.IDG003
                    
                INNER JOIN G003 G003DE -- CIDADE DESTINATÁRIO
                    ON G003DE.IDG003 = G005DE.IDG003	
                
                INNER JOIN G002 G002RE -- ESTADO REMETENTE
                    ON G002RE.IDG002 = G003RE.IDG002
                    
                INNER JOIN G002 G002DE -- ESTADO DESTINATÁRIO
                    ON G002DE.IDG002 = G003DE.IDG002

                LEFT JOIN I015 -- OCORRENCIA BRAVO
                    ON I015.IDI015 = G043.IDI015

                LEFT JOIN I007 -- REASON CODE
                    ON I007.IDI015 = I015.IDI015
                
                LEFT JOIN A005 -- CONTATOS x DELIVERY
                    ON A005.IDG043 = G043.IDG043
                    
                LEFT JOIN A001 -- CONTATOS
                    ON A001.IDA001 = A005.IDA001
                    AND A001.IDA002 = 18 --REGISTRO PADRÃO
                    AND A001.SNDELETE = 0
                
                    ${sqlWhere}
                    AND G046.STCARGA IN ('O', 'X', 'A', 'S', 'T')
                    AND G046.TPTRANSP = 'D' -- DEVOLUÇÃO CARGA
                    AND G046.TPMODCAR <> 1 -- CARGA 3PL 
                    AND G014.SN4PL = 1 -- CHKRDC
                    AND G043.TPDELIVE = '3' -- DEVOLUÇÃO DELIVERY                    
                    AND G043.STETAPA BETWEEN 20 AND 25
                
                    ${sqlAcl}

                GROUP BY 
                    ${arCols.join()}

                ORDER BY G043.CDDELIVE DESC
                ${sqlPaginate}`;

            var objRet = await gdao.executar({sql, bindValues}, res, next);

            return utils.construirObjetoRetornoBD(objRet);    

        } catch (err) {

            throw err;
        }
    }

    //-----------------------------------------------------------------------\\

    api.cardsDevolucao3pl = async function (req, res, next) {

        try {

            var userId = req.UserId || 1;

            var sqlAcl = await acl.montar({
                ids001: userId,
                dsmodulo: 'Logistica-Reversa',
                nmtabela: [{ G024: 'G024' }],
                //dioperad: ' ',
                esoperad: 'AND'
            });
    
            var strFiltroAux = '';
    
            // FILTROS SINGLE
            if((req.body.values.IDG046) && (req.body.values.IDG046.length > 0)) strFiltroAux += `AND G046.IDG046 = '${req.body.values.IDG046}' `;
            if((req.body.values.G043_CDDELIVE) && (req.body.values.G043_CDDELIVE.length > 0)) strFiltroAux += `AND G043.CDDELIVE = '${req.body.values.G043_CDDELIVE}' `;
            // FILTRO MULTI TRANSPORTADORA
            if((req.body.values.G024_IDG024) && (req.body.values.G024_IDG024.in.length > 0)) strFiltroAux += `AND G024.IDG024 IN (${req.body.values.G024_IDG024.in.join()}) `;   
            // FILTRO MULTI ORIGEM
            if((req.body.values.G003RE_IDG003) && (req.body.values.G003RE_IDG003.in.length > 0)) strFiltroAux += `AND G003RE.IDG003 IN (${req.body.values.G003RE_IDG003.in.join()}) `;
            // FILTRO MULTI DESTINO
            if((req.body.values.G003DE_IDG003) && (req.body.values.G003DE_IDG003.in.length > 0)) strFiltroAux += `AND G003DE.IDG003 IN (${req.body.values.G003DE_IDG003.in.join()}) `;
            // FILTRO MULTI REMETENTE
            if((req.body.values.G005RE_IDG005) && (req.body.values.G005RE_IDG005.in.length > 0)) strFiltroAux += `AND G005RE.IDG005 IN (${req.body.values.G005RE_IDG005.in.join()}) `;
    
            req.sql = 
                `SELECT 
                    G046.STCARGA,
                    COUNT(*) TTREGISTRO
                                
                FROM G046 -- CARGAS
    
                INNER JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024
                
                INNER JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024    
                
                INNER JOIN G048 -- ETAPA 
                    ON G048.IDG046 = G046.IDG046
                
                INNER JOIN G049 -- DELIVERY x ETAPA
                    ON G049.IDG048 = G048.IDG048
                    
                INNER JOIN G043 -- CARGA
                    ON G043.IDG043 = G049.IDG043

                INNER JOIN G014 -- OPERACAO
                    ON G014.IDG014 = G043.IDG014
    
                INNER JOIN G005 G005RE -- REMETENTE
                    ON G005RE.IDG005 = G048.IDG005OR
                
                INNER JOIN G005 G005DE -- DESTINATÁRIO
                    ON G005DE.IDG005 = G048.IDG005DE
                
                INNER JOIN G003 G003RE -- CIDADE REMETENTE
                    ON G003RE.IDG003 = G005RE.IDG003
                    
                INNER JOIN G003 G003DE -- CIDADE DESTINATÁRIO
                    ON G003DE.IDG003 = G005DE.IDG003	
                                
                WHERE
                    G046.SNDELETE = 0
                    AND G046.STCARGA IN ('O', 'X', 'A', 'S', 'T')
                    AND G046.TPTRANSP = 'D'
                    AND G046.TPMODCAR <> 1 -- CARGA 3PL 
                    AND G014.SN4PL = 1 -- CHKRDC
                    AND G043.SNDELETE = 0
                    AND G043.TPDELIVE = '3' -- DEVOLUCAO
                    AND G043.STETAPA BETWEEN 21 AND 25
                    ${strFiltroAux}
                    ${sqlAcl}
                    
                GROUP BY 
                    G046.STCARGA`;
    
            return await gdao.executar(req, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

	return api;
	
}