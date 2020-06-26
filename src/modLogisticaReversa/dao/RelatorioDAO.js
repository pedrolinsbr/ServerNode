module.exports = function (app, cb) {

    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const utils  = app.src.utils.FuncoesObjDB;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
    const acl   = app.src.modIntegrador.controllers.FiltrosController;

    var api = {};
    //-----------------------------------------------------------------------\\
    
    api.listarRelatorioDevolucao = async function (req, res, next) {

        try {

            var usuario = req.body['parameter[IDS001]'];

            delete req.body['parameter[IDS001]'];

            var sqlAcl = await acl.montar({
                ids001: usuario,
                dsmodulo: 'Logistica-Reversa',
                nmtabela: [{ G024: 'G024' }],
                //dioperad: ' ',
                esoperad: 'AND'
            });

            if(req.body['parameter[G046_TPMODCAR][id]'] == '0'){
                delete req.body['parameter[G046_TPMODCAR][id]'];
                delete req.body['parameter[G046_TPMODCAR][text]'];
            }

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var parm = { nmTabela: 'G043' };

            parm.objConn = await gdao.controller.getConnection();
            var sqlPivot = await fldAdd.tabelaPivot(parm, res, next);

            sqlPivot = `LEFT JOIN (${sqlPivot}) CA ON CA.ID = G043.IDG043`;
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            var arCols = [
                'CCD.DTALTEVE',
                'REASONCODE1_CCD.IDREACOD',
                'ALTERACAO_CCD.DTALTEVE',
                'REASONCODE2_CCD.IDREACOD',
                'EPC.DTALTEVE',
                'ALTERACAO_EPC.DTALTEVE',
                'REASONCODE_EPC.IDREACOD',
                'ERO.DTALTEVE',
                'ALTERACAO_ERO.DTALTEVE',
                'REASONCODE_ERO.IDREACOD',
                'RPC.DTALTEVE',
                'RPC.DTEVENTO',
                'REASONCODE_RPC.IDREACOD',
                'RRO.DTALTEVE',
                'RRO.DTEVENTO',
                'REASONCODE_RRO.IDREACOD',

                'G046.IDG046',
                'G046.DTCARGA',
                'G046.DTAGENDA',
                'G046.STCARGA',
                'G043.STETAPA',
                'G043.TPDELIVE',
                'G051.CDCTRC',
                'G051.STCTRC',
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
                'G043.DTLANCTO',
                'G043.VRDELIVE',

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

            arColsSel[l-53] = ` TO_CHAR(CCD.DTALTEVE, 'DD/MM/YYYY') DT_CCD`;
            arColsSel[l-52] += ' REASONCODE1_CCD';
            arColsSel[l-51] = ` TO_CHAR(ALTERACAO_CCD.DTALTEVE, 'DD/MM/YYYY') DTALTERACAO_CCD`;            
            arColsSel[l-50] += ' REASONCODE2_CCD';
            arColsSel[l-49] = ` TO_CHAR(EPC.DTALTEVE, 'DD/MM/YYYY')  DT_EPC`;
            arColsSel[l-48] = ` TO_CHAR(ALTERACAO_EPC.DTALTEVE, 'DD/MM/YYYY') DTALTERACAO_EPC`;
            arColsSel[l-47] += ' REASONCODE_EPC';            
            arColsSel[l-46] = ` TO_CHAR(ERO.DTALTEVE, 'DD/MM/YYYY') DT_ERO`;
            arColsSel[l-45] = ` TO_CHAR(ALTERACAO_ERO.DTALTEVE, 'DD/MM/YYYY') DTALTERACAO_ERO`;
            arColsSel[l-44] += ' REASONCODE_ERO';
            arColsSel[l-43] = ` TO_CHAR(RPC.DTALTEVE, 'DD/MM/YYYY') DT_RPC`;            
            arColsSel[l-42] = ` TO_CHAR(RPC.DTEVENTO, 'DD/MM/YYYY') DTEVENTO_RPC`;
            arColsSel[l-41] += ' REASONCODE_RPC';
            arColsSel[l-40] = ` TO_CHAR(RRO.DTALTEVE, 'DD/MM/YYYY') DT_RRO`;
            arColsSel[l-39] = ` TO_CHAR(RRO.DTEVENTO, 'DD/MM/YYYY') DTEVENTO_RRO`;            
            arColsSel[l-38] += ' REASONCODE_RRO';
            arColsSel[l-29] = ` TO_CHAR(G046.DTPRESAI, 'DD/MM/YYYY') DTPRESAI`
            arColsSel[l-14] = ` TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') DTDELIVE`
            arColsSel[l-13] = ` TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY') DTLANCTO`
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
                
                LEFT JOIN G005 G005RE -- REMETENTE
                    ON G005RE.IDG005 = G043.IDG005RE
                
                LEFT JOIN G005 G005DE -- DESTINATÁRIO
                    ON G005DE.IDG005 = G043.IDG005DE
                
                LEFT JOIN G003 G003RE -- CIDADE REMETENTE
                    ON G003RE.IDG003 = G005RE.IDG003
                    
                LEFT JOIN G003 G003DE -- CIDADE DESTINATÁRIO
                    ON G003DE.IDG003 = G005DE.IDG003	
                
                LEFT JOIN G002 G002RE -- ESTADO REMETENTE
                    ON G002RE.IDG002 = G003RE.IDG002
                    
                LEFT JOIN G002 G002DE -- ESTADO DESTINATÁRIO
                    ON G002DE.IDG002 = G003DE.IDG002	

                LEFT JOIN I015 -- OCORRENCIA BRAVO
                    ON I015.IDI015 = G043.IDI015

                LEFT JOIN I007 -- REASON CODE
                    ON I007.IDI015 = I015.IDI015                                    

                ${sqlPivot}

                LEFT JOIN G049 -- DELIVERY x ETAPA
                    ON G049.IDG043 = G043.IDG043
                
                LEFT JOIN G048 -- ETAPA 
                    ON G048.IDG048 = G049.IDG048
                    
                LEFT JOIN G046 -- CARGA
                    ON G046.IDG046 = G048.IDG046
                    AND G046.SNDELETE = 0
                    AND G046.TPTRANSP = 'D'

                LEFT JOIN G051 -- CTE
                    ON G051.IDG051 = G049.IDG051
                
                LEFT JOIN G030 -- TIPO DE VEICULO
                    ON G030.IDG030 = G046.IDG030
                    
                LEFT JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024

                LEFT JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024

                LEFT JOIN A005 -- CONTATOS x DELIVERY
                    ON A005.IDG043 = G043.IDG043
                    
                LEFT JOIN A001 -- CONTATOS
                    ON A001.IDA001 = A005.IDA001
                    AND A001.SNDELETE = 0

                --MILESTONES E REASON CODES
                --CCD-------------------------------------------------------------------------
                LEFT JOIN(SELECT 
                        IDG048, 
                        MIN(IDI013) PRIMEIRO,
                        MAX(IDI013) ALTERACAO
                        FROM I013 
                        WHERE IDI001 = 33 
                            AND SNDELETE = 0
                        GROUP BY IDG048) ID_CCD
                    ON ID_CCD.IDG048 = G048.IDG048
                                
                LEFT JOIN I013 CCD
                    ON CCD.IDI013 = ID_CCD.PRIMEIRO	
                    AND CCD.SNDELETE = 0
                        
                LEFT JOIN I013 ALTERACAO_CCD
                    ON ALTERACAO_CCD.IDI013 = ID_CCD.ALTERACAO
                    AND ALTERACAO_CCD.STPROPOS = 'A'
                    AND ALTERACAO_CCD.SNDELETE = 0
                    
                LEFT JOIN I007 REASONCODE1_CCD
                    ON REASONCODE1_CCD.IDI007 = CCD.IDI007 
                    
                LEFT JOIN I007 REASONCODE2_CCD
                    ON REASONCODE2_CCD.IDI007 = ALTERACAO_CCD.IDI007                                

                --EPC-----------------------------------------------------------------------
                LEFT JOIN(SELECT 
                        IDG048, 
                        MIN(IDI013) PRIMEIRO,
                        MAX(IDI013) ALTERACAO
                        FROM I013 
                        WHERE IDI001 = 34
                            AND SNDELETE = 0
                        GROUP BY IDG048) ID_EPC
                    ON ID_EPC.IDG048 = G048.IDG048
                        
                LEFT JOIN I013 EPC
                    ON EPC.IDI013 = ID_EPC.PRIMEIRO		
                    AND EPC.SNDELETE = 0
                        
                LEFT JOIN I013 ALTERACAO_EPC
                    ON ALTERACAO_EPC.IDI013 = ID_EPC.ALTERACAO	
                    AND ALTERACAO_EPC.STPROPOS = 'A'
                    AND ALTERACAO_EPC.SNDELETE = 0
                    
                LEFT JOIN I007 REASONCODE_EPC
                    ON REASONCODE_EPC.IDI007 = ALTERACAO_EPC.IDI007

                --ERO-----------------------------------------------------------------------
                LEFT JOIN(SELECT 
                        IDG048, 
                        MIN(IDI013) PRIMEIRO,
                        MAX(IDI013) ALTERACAO
                        FROM I013 
                        WHERE IDI001 = 35
                            AND SNDELETE = 0
                        GROUP BY IDG048) ID_ERO
                    ON ID_ERO.IDG048 = G048.IDG048
                        
                LEFT JOIN I013 ERO
                    ON ERO.IDI013 = ID_ERO.PRIMEIRO		
                    AND ERO.SNDELETE = 0
                        
                LEFT JOIN I013 ALTERACAO_ERO
                    ON ALTERACAO_ERO.IDI013 = ID_ERO.ALTERACAO	
                    AND ALTERACAO_ERO.STPROPOS = 'A'
                    AND ALTERACAO_ERO.SNDELETE = 0
                    
                LEFT JOIN I007 REASONCODE_ERO
                    ON REASONCODE_ERO.IDI007 = ALTERACAO_ERO.IDI007
                            
                --RPC------------------------------------------------------
                LEFT JOIN(SELECT 
                        IDG048, 
                        MAX(IDI013) IDI013
                        FROM I013 
                        WHERE IDI001 = 36 
                            AND SNDELETE = 0
                        GROUP BY IDG048) ID_RPC
                    ON ID_RPC.IDG048 = G048.IDG048		
                        
                LEFT JOIN I013 RPC
                    ON RPC.IDI013 = ID_RPC.IDI013	
                    AND RPC.SNDELETE = 0
                    
                LEFT JOIN I007 REASONCODE_RPC
                    ON REASONCODE_RPC.IDI007 = RPC.IDI007
                    
                --RRO------------------------------------------------
                LEFT JOIN(SELECT 
                        IDG048, 
                        MAX(IDI013) IDI013
                        FROM I013 
                        WHERE IDI001 = 37
                            AND SNDELETE = 0
                        GROUP BY IDG048) ID_RRO
                    ON ID_RRO.IDG048 = G048.IDG048	
                
                LEFT JOIN I013 RRO
                    ON RRO.IDI013 = ID_RRO.IDI013	
                    AND RRO.SNDELETE = 0
                    
                LEFT JOIN I007 REASONCODE_RRO
                    ON REASONCODE_RRO.IDI007 = RRO.IDI007    
                
                    ${sqlWhere}
                    AND G014.SN4PL = 1 -- CHKRDC
                    AND G043.TPDELIVE = '3' -- DEVOLUCAO
                    AND G043.STETAPA BETWEEN 20 AND 25
                    AND G046.STCARGA IN (NULL, 'R', 'O', 'X', 'A', 'S', 'T', 'D')

                    ${sqlAcl}


                GROUP BY ${arCols.join()}
                    
                ORDER BY 
                    G046.STCARGA

                ${sqlPaginate}`;

                parm.bindValues = bindValues;

            var objRet = await gdao.executar(parm, res, next);
    
            return utils.construirObjetoRetornoBD(objRet);    

        } catch (err) {

            throw err;

        }
    }

    //-----------------------------------------------------------------------\\

    api.listarRelatorioRecusa = async function (req, res, next) {

        try {

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', false);

            var parm =  { nmTabela: 'G043' };

            parm.objConn = await gdao.controller.getConnection();
            var sqlPivot = await fldAdd.tabelaPivot(parm, res, next);

            sqlPivot = `LEFT JOIN (${sqlPivot}) CA ON CA.ID = G043.IDG043`;
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var arCols =
            [
                'G043.IDG043',
                'G043.CDDELIVE',
                'G043.NRNOTA',
                'G043.STETAPA',    
                'G043.DTDELIVE',
                'G043.DTLANCTO',
                'G043.DTENTREG',
                
                'G005RE.IDG005',   // IDG005RE,
                'G005RE.NMCLIENT', // NMREMETE,
            
                'G005DE.IDG005',   // IDG005DE,
                'G005DE.NMCLIENT', //NMDESTIN,    
                
                'CA.NRPROTOC',
                
                'G046.IDG046',
                'G046.STCARGA',
                'G046.DTPRESAI',
                'G046.DTSAICAR',
                
                'G048.IDG048',
                    
                'G024.IDG024',
                'G024.NMTRANSP',
                
                'G051.IDG051',
                'G051.CDCTRC',
                'G051.DTEMICTR',
                'G051.STCTRC'
            ];

            var arColsSel  = arCols.slice(0);

            arColsSel[7]  += ' IDG005RE';
            arColsSel[8]  += ' NMREMETE';
            arColsSel[9]  += ' IDG005DE';
            arColsSel[10] += ' NMDESTIN';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var sqlMaxMS = this.queryMaxMS();

            parm.sql = 
                `SELECT ${arColsSel.join()},
                
                CASE 
                    WHEN G051.STCTRC = 'A' THEN 'Ativo'
                    WHEN G051.STCTRC = 'C' THEN 'Cancelado'
                    ELSE ''
                END DSSTCTE,
                
                CASE 
                    WHEN G043.STETAPA =  7 THEN 'A Cancelar'
                    WHEN G043.STETAPA =  8 THEN 'Cancelada'
                    WHEN G043.STETAPA = 21 THEN 'Otimizando'
                    WHEN G043.STETAPA = 24 THEN 'Transporte'
                    WHEN G043.STETAPA = 25 THEN 'Encerrado'
                    ELSE 'Outro'
                END DSETAPA,
                
                MAX(QMS.CCD) CCD,
                MAX(QMS.EPC) EPC,
                MAX(QMS.ERO) ERO,
                MAX(QMS.RPC) RPC,
                MAX(QMS.RRO) RRO,
                
                COUNT(*) OVER() COUNT_LINHA
                    
            FROM G043 -- DELIVERIES
            
            INNER JOIN G005 G005RE -- REMETENTE
                ON G005RE.IDG005 = G043.IDG005RE 
                
            INNER JOIN G005 G005DE -- DESTINATARIO
                ON G005DE.IDG005 = G043.IDG005DE 
            
            INNER JOIN G049 -- DELIVERIES x ETAPAS
                ON G049.IDG043 = G043.IDG043
            
            INNER JOIN G048 -- ETAPAS	
                ON G048.IDG048 = G049.IDG048	
                
            INNER JOIN G046 -- CARGAS 
                ON G046.IDG046 = G048.IDG046
                
            LEFT JOIN G024 -- 3PL	
                ON G024.IDG024 = G046.IDG024
                
            LEFT JOIN G051 -- CTE
                ON G051.IDG051 = G049.IDG051

            ${sqlPivot}
                
            LEFT JOIN (${sqlMaxMS}) QMS 
                ON QMS.IDG048 = G048.IDG048		
                
            ${sqlWhere}
                AND G043.SNDELETE = 0
                AND G043.TPDELIVE = '4'	
                AND G046.SNDELETE = 0
                AND G046.TPTRANSP = 'R'

            
            GROUP BY ${arCols.join()}
            
            ${sqlPaginate}`;

            parm.bindValues = bindValues;

            var arRS = await gdao.executar(parm, res, next);

            return utils.construirObjetoRetornoBD(arRS);    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.queryMaxMS = function () {

        var sql = 
            `SELECT * FROM
                (
                    SELECT 	
                        I013.IDI013,
                        I013.IDG048,
                        I013.IDI001,
                        I013.DTALTEVE
                        
                    FROM I013 -- MS
                    INNER JOIN 
                    (
                        SELECT 
                            MAX(MI013.IDI013) IDI013 
                        FROM I013 MI013
                        WHERE MI013.SNDELETE = 0
                        GROUP BY 
                            MI013.IDG048, 
                            MI013.IDI001
                    ) QMAXMS ON QMAXMS.IDI013 = I013.IDI013                
                ) PIVOT (
                    MAX(DTALTEVE) FOR IDI001 IN (
                        '33' CCD, 
                        '34' EPC,
                        '35' ERO,
                        '36' RPC,
                        '37' RRO
                    )
                )`;
            
        return sql;

    } 

    //-----------------------------------------------------------------------\\

    return api;

}