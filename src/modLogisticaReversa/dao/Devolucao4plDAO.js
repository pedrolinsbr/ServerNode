module.exports = function (app, cb) {

    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const utils  = app.src.utils.FuncoesObjDB;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;

    var api = {};

    api.controller = gdao.controller;
    
    //-----------------------------------------------------------------------\\

    api.setFlagASN = async function (req, res, next) {

        var parm = { objConn: req.objConn };

        parm.sql = 
            `MERGE INTO G048 E

            USING (   
                SELECT  
                    G048.IDG048,
                  
                    CASE
                        WHEN G048.STINTCLI = 2 THEN 1
                        ELSE 0
                    END STNEWINT
                  
                FROM G048
              
                INNER JOIN G049 
                    ON G049.IDG048 = G048.IDG048
                  
                WHERE 
                    G048.STINTCLI IN (1,2)
                    AND G049.IDG043 = ${req.IDG043}
            ) Q
            
            ON (E.IDG048 = Q.IDG048)
            WHEN MATCHED THEN UPDATE SET E.STINTCLI = Q.STNEWINT`;
        
        await gdao.controller.setConnection(parm.objConn);
        
        return await gdao.executar(parm, res, next).catch((err) => { throw err });        

    }

    //-----------------------------------------------------------------------\\

    api.selecionar3pl = async function (req, res, next) {

        req.sql = 
            `SELECT 
                G024.IDG024,
                G024.NMTRANSP,	
                G024.CJTRANSP,
                UPPER(G003T.NMCIDADE) || ' / ' || G002T.CDESTADO NMCIDTRA,
                CASE WHEN(I020.IDG003 IS NOT NULL) THEN 'LOCAL' END SNLOCAL
                
            FROM G046 -- CARGA
            
            INNER JOIN G048 -- CARREGAMENTO
                ON G048.IDG046 = G046.IDG046
                AND G048.NRSEQETA = 1
                
            INNER JOIN G005 -- CLIENTE ORIGEM
                ON G005.IDG005 = G048.IDG005OR
                
            INNER JOIN G003 -- CIDADE ORIGEM
                ON G003.IDG003 = G005.IDG003

            INNER JOIN I020 -- 3PL x LOCALIDADE	   
                ON I020.IDG002 = G003.IDG002
                AND ((I020.IDG003 = G003.IDG003) OR (I020.IDG003 IS NULL))
                
            INNER JOIN G024 -- 3PL
                ON G024.IDG024 = I020.IDG024

            INNER JOIN G003 G003T -- CIDADE 3PL
                ON G003T.IDG003 = G024.IDG003

            INNER JOIN G002 G002T -- ESTADO 3PL
                ON G002T.IDG002 = G003T.IDG002
                    
            WHERE 
                G046.SNDELETE = 0                
                AND G024.SNDELETE = 0    
                AND G024.STCADAST = 'A' -- ATIVO    
                AND G046.IDG046 = ${req.params.id}
                
            ORDER BY
                G024.NMTRANSP`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.cardsDevolucao4pl = async function (req, res, next) {

        var strFiltroAux = '';
        var strFiltroAux2 = '';

        // ---------------- FILTROS SIMPLES -------------- //
        if(req.body.IDG043 && (req.body.IDG043.length > 0)) strFiltroAux2 += `AND G043.IDG043 = '${req.body.IDG043}' `;
        if((req.body.G046_IDG046) && (req.body.G046_IDG046.length > 0)) strFiltroAux += `AND G046.IDG046 = '${req.body.G046_IDG046}' `;
        if((req.body.CDDELIVE) && (req.body.CDDELIVE.length > 0)) strFiltroAux2 += `AND G043.CDDELIVE = '${req.body.CDDELIVE}' `;
        // ---------------- FILTROS MULTI --------------- //
        // FILTRO MULTI TRANSPORTADORA
        if((req.body.G024_IDG024) && (req.body.G024_IDG024.in.length > 0)) strFiltroAux += `AND G024.IDG024 IN (${req.body.G024_IDG024.in.join()}) `;   
        // FILTRO MULTI REMETENTE
        if((req.body.G005RE_IDG005) && (req.body.G005RE_IDG005.in.length > 0)) strFiltroAux2 += `AND G005RE.IDG005 IN (${req.body.G005RE_IDG005.in.join()}) `;
        // FILTRO MULTI DESTINATARIO
        if((req.body.G005DE_IDG005) && (req.body.G005DE_IDG005.in.length > 0)) strFiltroAux2 += `AND G005DE.IDG005 IN (${req.body.G005DE_IDG005.in.join()}) `;
        
        if(strFiltroAux2 != ""){
            strFiltroAux += strFiltroAux2
        }

        req.sql = 
            `SELECT 
                    G046.STCARGA,
                    COUNT(*) TTREGISTRO
                                
                FROM G046 -- CARGAS

                LEFT JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024
            
                LEFT JOIN O005 -- OFERECIMENTOS
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
                    ON G005RE.IDG005 = G043.IDG005RE
                
                INNER JOIN G005 G005DE -- DESTINATÁRIO
                    ON G005DE.IDG005 = G043.IDG005DE

                INNER JOIN G003 G003RE -- CIDADE REMETENTE
                    ON G003RE.IDG003 = G005RE.IDG003
                    
                INNER JOIN G003 G003DE -- CIDADE DESTINATÁRIO
                    ON G003DE.IDG003 = G005DE.IDG003
                                
                WHERE
                    G046.SNDELETE = 0
                    AND G046.STCARGA IN ('R', 'O', 'X', 'A', 'S', 'T', 'D')
                    AND G046.TPTRANSP = 'D'
                    AND G046.TPMODCAR <> 1 -- CARGA 3PL 
                    AND G014.SN4PL = 1 -- CHKRDC
                    AND G043.SNDELETE = 0                    
                    AND G043.TPDELIVE = '3' -- DEVOLUCAO
                    AND G043.STETAPA BETWEEN 21 AND 25
                    ${strFiltroAux}
                    
                GROUP BY 
                    G046.STCARGA
                
            UNION 
            
            SELECT 
                'B' STCARGA,
                COUNT(*) TTREGISTRO
                
            FROM G043

            INNER JOIN G014 -- OPERACAO
                ON G014.IDG014 = G043.IDG014            
            
            INNER JOIN G005 G005RE -- REMETENTE
                ON G005RE.IDG005 = G043.IDG005RE
        
            INNER JOIN G005 G005DE -- DESTINATÁRIO
                ON G005DE.IDG005 = G043.IDG005DE
            
            WHERE 
                G014.SN4PL = 1 -- CHKRDC
                AND G043.SNDELETE = 0                
                AND G043.TPDELIVE = '3' -- DEVOLUCAO
                AND G043.STETAPA = 20
                ${strFiltroAux2}`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    api.listarDevolucao4pl = async function (req, res, next) {

        try {

            if(req.body['parameter[G046_STCARGA]'] == 'B') delete req.body['parameter[G046_STCARGA]'] == 'B';

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

            var strFiltro = '';

            if((req.body['parameter[IDG043]']) && (req.body['parameter[IDG043]'].length > 0)) strFiltro += `AND G043.IDG043 = '${req.body['parameter[IDG043]']}' `;
            if((req.body['parameter[IDG046]']) && (req.body['parameter[IDG046]'].length > 0)) strFiltro += `AND G046.IDG046 = '${req.body['parameter[IDG046]']}' `;
            if((req.body['parameter[CDDELIVE]']) && (req.body['parameter[CDDELIVE]'].length > 0)) strFiltro += `AND G043.CDDELIVE = '${req.body['parameter[CDDELIVE]']}' `;
            if((req.body['parameter[NMREMETE]']) && (req.body['parameter[NMREMETE]'].length > 0)) strFiltro += `AND UPPER(G005RE.NMCLIENT) LIKE UPPER ('%${req.body['parameter[NMREMETE]']}%') `;
            if((req.body['parameter[NMTRANSP]']) && (req.body['parameter[NMTRANSP]'].length > 0)) strFiltro += `AND UPPER(G024.NMTRANSP) LIKE UPPER ('%${req.body['parameter[NMTRANSP]']}%') `; 
            if((req.body['parameter[NMDESTIN]']) && (req.body['parameter[NMDESTIN]'].length > 0)) strFiltro += `AND UPPER(G005DE.NMCLIENT) LIKE UPPER ('%${req.body['parameter[NMDESTIN]']}%') `;  

            var sqlAux = '';
            var strOP = 'INNER';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            switch (req.body['parameter[G046_STCARGA]']) {

                case 'R': //Roteirizadas
                    sqlAux += `AND G043.STETAPA = 21 `;
                    strOP =`LEFT`;
                    break;

                case 'O': //Oferecidas
                    sqlAux += `AND G043.STETAPA = 22 `;
                    break;

                case 'X': //Recusadas
                    sqlAux += `AND G043.STETAPA = 22 `;
                    break;

                case 'A': //Aceitas
                    sqlAux += `AND G043.STETAPA = 22 `;
                    break;

                case 'S': //Agendadas
                    sqlAux += `AND G043.STETAPA = 23 `;
                    break;

                case 'T': //Transporte
                    sqlAux += `AND G043.STETAPA IN (24, 25) `;
                    break;

                case 'D': //Encerrado
                    sqlAux += `AND G043.STETAPA IN (24, 25)`;
                    break;

                //case 'B': //Backlog
                default:
                    sqlAux = `AND G043.STETAPA = 20 `;
                    strOP =`LEFT`;
                    break;
    
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var parm = { nmTabela: 'G043' };

            parm.objConn = await gdao.controller.getConnection();
            var sqlPivot = await fldAdd.tabelaPivot(parm, res, next);

            sqlPivot = `LEFT JOIN (${sqlPivot}) CA ON CA.ID = G043.IDG043`;
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            var arCols = [
                'G046.IDG046',
                'G046.VRCARGA',
                'G046.DTCARGA',
                'G046.DTAGENDA',
                'G043.DTLANCTO',
                'G046.DTPRESAI',
                'G046.DTSAICAR',
                'G046.PSCARGA',
                
                'G030.IDG030',
                'G030.DSTIPVEI',

                'G024.IDG024',
                'G024.NMTRANSP',
                'G024.CJTRANSP',

                'O005.IDO005',
                
                'G048.IDG048',
                'G048.NRSEQETA',
                'G048.DTPREATU',
                
                'G043.IDG043',
                'G043.CDDELIVE',
                'G043.NRNOTA',
                'G043.DTDELIVE',

                'I015.IDI015',
                'I015.DSOCORRE',
                
                'I007.IDI007',
                'I007.IDREACOD',

                'CA.NRPROTOC',

                'G005RE.NMCLIENT',
                'G003RE.NMCIDADE',
                'G002RE.CDESTADO',
                'G005DE.NMCLIENT',
                'G003DE.NMCIDADE',
                'G002DE.CDESTADO'
            ];

            var arColsSel = arCols.slice(0);
            var l = arColsSel.length;


            arColsSel[l-28] = ` TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY') DTLANCTO`
            arColsSel[l-27] = ` TO_CHAR(G046.DTPRESAI, 'DD/MM/YYYY') DTPRESAI`
            arColsSel[l-12] = ` TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') DTDELIVE`
            arColsSel[l-6] += ' NMREMETE';
            arColsSel[l-5] += ' NMCIDORI';
            arColsSel[l-3] += ' NMDESTIN';            
            arColsSel[l-1] += ' CDESTDES';

            parm.sql = 
                `SELECT 
                    ${arColsSel.join()},
                    
                    UPPER(G003RE.NMCIDADE) || '/' || UPPER(G002RE.CDESTADO) NMCIDREM,	
                    UPPER(G003DE.NMCIDADE) || '/' || UPPER(G002DE.CDESTADO) NMCIDDES,	
                    
                    COUNT(A001.IDA001) TTCONTAT,
                    COUNT(*) OVER() COUNT_LINHA
                
                FROM G043 -- DELIVERIES

                INNER JOIN G014 -- OPERACAO
                    ON G014.IDG014 = G043.IDG014
                
                INNER JOIN G005 G005RE -- REMETENTE
                    ON G005RE.IDG005 = G043.IDG005RE
                
                INNER JOIN G005 G005DE -- DESTINATÁRIO
                    ON G005DE.IDG005 = G043.IDG005DE
                
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

                ${sqlPivot}

                ${strOP} JOIN G049 -- DELIVERY x ETAPA
                    ON G049.IDG043 = G043.IDG043
                
                ${strOP} JOIN G048 -- ETAPA 
                    ON G048.IDG048 = G049.IDG048
                    
                ${strOP} JOIN G046 -- CARGA
                    ON G046.IDG046 = G048.IDG046
                    AND G046.SNDELETE = 0
                    AND G046.TPTRANSP = 'D'
                    AND G046.TPMODCAR <> 1 -- CARGA 3PL 
                
                ${strOP} JOIN G030 -- TIPO DE VEICULO
                    ON G030.IDG030 = G046.IDG030
                    
                ${strOP} JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024

                ${strOP} JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024

                LEFT JOIN A005 -- CONTATOS x DELIVERY
                    ON A005.IDG043 = G043.IDG043
                    
                LEFT JOIN A001 -- CONTATOS
                    ON A001.IDA001 = A005.IDA001
                    AND A001.IDA002 = 18 --REGISTRO PADRÃO
                    AND A001.SNDELETE = 0
                    
                    ${sqlWhere}
                    ${sqlAux}
                    AND G014.SN4PL = 1 -- CHKRDC
                    AND G043.TPDELIVE = '3' -- DEVOLUCAO
                    AND G043.STETAPA BETWEEN 20 AND 25

                GROUP BY ${arCols.join()}
                    
                ORDER BY 
                    G003RE.NMCIDADE, 
                    G002RE.CDESTADO, 
                    G005RE.NMCLIENT,
                    G005DE.NMCLIENT 

                ${sqlPaginate}`;

                parm.bindValues = bindValues;

            var objRet = await gdao.executar(parm, res, next);
    
            return utils.construirObjetoRetornoBD(objRet);    

        } catch (err) {

            throw err;

        }
    }

    //-----------------------------------------------------------------------\\

    api.alterarEtapaDelivery = async function (req, res, next) {

        var sql = `UPDATE G043 SET STETAPA = ${req.body.STETAPA} 
            WHERE IDG043 IN (${req.body.IDG043.join()})`;

        return await gdao.executar({ sql }, res, next).catch((err) =>{ throw err});

    }

    //-----------------------------------------------------------------------\\

	return api;
	
}