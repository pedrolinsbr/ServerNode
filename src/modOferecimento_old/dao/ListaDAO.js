module.exports = function (app, cb) {

    const utils  = app.src.utils.FuncoesObjDB;
    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const acl    = app.src.modIntegrador.controllers.FiltrosController;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;

    var api = {};
    api.controller = gdao.controller;

    //-----------------------------------------------------------------------\\
    /**
     * Lista e filtra as cargas na tela de Oferecimento
     * @function api/listaCargas
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\

    api.listaCargas = async function (req, res, next) {

        try {
    
            var sqlAcl   = '';
            var sqlPivot = '';
            var strLucro = '';
            var sqlAll   = "AND G046.STCARGA IN ('B','R','O','X','A','S','P','T','D','C') ";

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);
    
            if (parseInt(req.body.filtroCargas) != 1) {
                
                if (req.UserId !== undefined) {
                    sqlAcl = await acl.montar({
                        ids001:   req.UserId,
                        dsmodulo: 'OFERECIMENTO',
                        nmtabela: [{ G024: 'G024' }],             
                        esoperad: 'AND'
                    });    
                }

                if (!sqlAcl) sqlAcl = '';
    
            }

            var sqlAux = (sqlAcl == '') ? sqlAll : sqlAcl ;

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var arCols = [                
                'G046.IDG046',
                'G046.CDVIAOTI',
                'G046.TPCARGA',
                'G046.STCARGA',
                'G046.DSCARGA',           
                'G046.PSCARGA',
                'G046.VRCARGA',
                'G046.VRFREREC',
                'G046.VRFREMIN',
                'G046.QTVOLCAR',
                'G046.QTDISPER',
                'G046.VRPOROCU',
                'G046.SNURGENT',
                'G046.SNCARPAR',           
                'G046.SNESCOLT',
                'G046.TPTRANSP',
                'G046.DTCOLATU',
                'G046.DTCARGA',
    
                'H002.DSTIPCAR',
                    
                'G030.IDG030',
                'G030.DSTIPVEI',
                'G030.QTCAPPES',
                
                'G028.IDG028',
                'G028.NMARMAZE',
    
                'G024.IDG024',
                'G024.NMTRANSP',

                'G024SV.IDG024',
                'G024SV.NMTRANSP',

                'CE.TTCLIESP',
                
                'G048D.DTPREATU',
    
                'G003O.NMCIDADE',
                'G003D.NMCIDADE',
                
                "UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO",
                "UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO",

                'O005.IDO005',
                'O005.SNENVIO',
                'O005.DTENVIO',
                'O005.VRFREPAG',
                'O005.DSMOTPRE'
            ];
                        
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            var x = 0;
            var blOk = (bindValues.G046_STCARGA == 'P') && (req.UserId);

            if (blOk) {

                x += 2;
                arCols.push('O011.PCNIVEL');

                sqlPivot = await fldAdd.tabelaPivot({ objConn: req.objConn, nmTabela: 'S001'}, res, next);
                sqlPivot = 
                    `LEFT JOIN (${sqlPivot}) CA ON CA.ID = ${req.UserId}
                     LEFT JOIN O011 ON O011.IDO011 = CA.IDO011`;

                strLucro = 
                    `CASE 
                        WHEN (
                              (NVL(G046.VRFREREC, 0) = 0) OR 
                              (NVL(O005.VRFREPAG, 0) = 0) OR
                              (O011.PCNIVEL IS NULL)) THEN 'N'

                        WHEN (O011.PCNIVEL <= ((G046.VRFREREC / O005.VRFREPAG) * 100)) THEN 'S'
                        
                    END SNAPROVA`;

            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var arColsSel = arCols.slice(0);
            
            if (blOk) arColsSel.push(strLucro);
            
            var i = arColsSel.length;

            arColsSel[i-x-14] += ' G024_NMTRANSP';
            arColsSel[i-x-13] += ' IDG024SV';
            arColsSel[i-x-12] += ' G024SV_NMTRANSP';
            arColsSel[i-x-11]  = 'NVL(CE.TTCLIESP, 0) TTCLIESP';

            arColsSel[i-x-9]  += ' NMCIDORI';
            arColsSel[i-x-8]  += ' NMCIDDES';
            arColsSel[i-x-7]  += ' G003O_NMCIDADE';
            arColsSel[i-x-6]  += ' G003D_NMCIDADE';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var sql = 
                `SELECT 
                    ${arColsSel.join()},

                    CASE 
                    	WHEN G024.IDG024 IS NULL THEN 'NÃO DISTRIBUÍDA'
                    	ELSE G024.NMTRANSP || ' (' || G024.IDG024 || ')' 
                    END IDTRANSP,
    
                    CASE
                        WHEN G046.SNCARPAR = 'S' THEN 'LTL' 
                        ELSE 'FTL'
                    END LOADTRUCK,
    
                    CASE
                        WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                        WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
                        WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                        WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG' 
                        ELSE 'OUTRO'
                    END TPOPERAC,

                    CASE 
                        WHEN ((NVL(G046.VRFREREC, 0) = 0) OR (NVL(O005.VRFREPAG, 0) = 0)) THEN 0
                        ELSE ROUND (((G046.VRFREREC / O005.VRFREPAG) * 100), 2)
                    END PCLUCRO,

                    CASE 
                        WHEN NVL(G046.VRFREMIN, 0) < NVL(O005.VRFREPAG, 0) THEN 'NÃO'
                        ELSE 'SIM'
                    END SNPAGMIN, 
    
                    TO_CHAR(G046.DTCARGA, 'MM/DD/YYYY') DTCARGAF,
                    TO_CHAR(G046.DTCOLATU, 'MM/DD/YYYY') DTCOLETF,
                    TO_CHAR(G048D.DTPREATU, 'MM/DD/YYYY') DTENTREF,

                    COUNT(G048.IDG048) QTPARADA,
                    COUNT(DISTINCT OFE.IDO005) QTOFERECE,
                    COUNT(*) OVER() AS COUNT_LINHA
    
                FROM G046 -- CARGA 
                    
                INNER JOIN H002 -- TIPO DA CARGA
                    ON H002.IDH002 = G046.TPCARGA
    
                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030
    
                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028
    
                LEFT JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024

                LEFT JOIN G024 G024SV -- TRANSPORTADORA SUGERIDA
                    ON G024SV.IDG024 = G046.IDG024SV

                LEFT JOIN ( 
                    SELECT G048.IDG046, COUNT(DISTINCT(G102.IDG005)) TTCLIESP
                    FROM G048 
                    INNER JOIN G102 
                        ON G102.IDG005 = G048.IDG005DE
                    GROUP BY G048.IDG046
                ) CE -- CLIENTES ESPECIAIS
                    ON CE.IDG046 = G046.IDG046                    
    
                INNER JOIN (SELECT IDG046, MIN(NRSEQETA) INICIO, MAX(NRSEQETA) FINAL FROM G048 GROUP BY IDG046) ETAPA
                    ON ETAPA.IDG046 = G046.IDG046                    
    
                INNER JOIN G048 G048O -- ORIGEM
                    ON G048O.IDG046 = G046.IDG046
                    AND G048O.NRSEQETA = ETAPA.INICIO
    
                INNER JOIN G048 G048D -- DESTINO
                    ON G048D.IDG046 = G046.IDG046
                    AND G048D.NRSEQETA = ETAPA.FINAL
    
                INNER JOIN G005 G005O -- CLIENTE ORIGEM
                    ON G005O.IDG005 = G048O.IDG005OR
    
                INNER JOIN G005 G005D -- CLIENTE DESTINO 
                    ON G005D.IDG005 = G048D.IDG005DE
    
                INNER JOIN G003 G003O -- CIDADE DA ORIGEM
                    ON G003O.IDG003 = G005O.IDG003
    
                INNER JOIN G003 G003D -- CIDADE DESTINO
                    ON G003D.IDG003 = G005D.IDG003
    
                INNER JOIN G002 G002O -- UF ORIGEM
                    ON G002O.IDG002 = G003O.IDG002
                    
                INNER JOIN G002 G002D -- UF DESTINO
                    ON G002D.IDG002 = G003D.IDG002
                                                
                INNER JOIN G048 -- PARADAS
                    ON G048.IDG046 = G046.IDG046 

                ${sqlPivot}

                LEFT JOIN O005 -- OFERECIMENTO ATIVO
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                
                LEFT JOIN O005 OFE -- HISTÓRICOS DE OFERECIMENTO
                    ON OFE.IDG046 = G046.IDG046
                        
                    ${sqlWhere} 
                    ${sqlAux} 
                    AND G046.TPMODCAR IN (2,3) -- 4PL / MISTO
                    AND NVL(G046.SNVIRA,'N') = 'N'
    
                GROUP BY 
                    ${arCols.join()} 
                
                ${sqlOrder} ${sqlPaginate}`;
    
            var parm = { sql, bindValues, objConn: req.objConn };

            var arRS = await gdao.executar(parm, res, next);
    
            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as quantidades de registros por situação da Carga
     * @function api/listaCabecalho
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @async 
     * @return {Array}     Retorna resultado da pesquisa em um array
     * @throws {Object}    Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\

    api.listaCabecalho = async function (req, res, next) {

        try {

            if (req.params.id == 1) {
                        
                var sqlAux = '';
                var sqlAcl = '';
    
            } else { 
    
                var sqlAux = `INNER JOIN G024 ON G024.IDG024 = G046.IDG024`;
    
                var sqlAcl = await acl.montar({
                    ids001: req.UserId,
                    dsmodulo: 'OFERECIMENTO',
                    nmtabela: [{ G024: 'G024' }],
                    esoperad: 'AND'
                });
            }
    
            var sql =                     
                `SELECT 
                    G046.STCARGA,
                    COUNT(*) TTREGISTRO 
            
                FROM G046 -- CARGA 
    
                ${sqlAux}
            
                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030
        
                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028
        
                WHERE 
                    G046.SNDELETE = 0 AND
                    G046.TPMODCAR IN (2,3) AND -- 4PL / MISTO
                    NVL(G046.SNVIRA,'N') = 'N' AND
                    G046.STCARGA IN ('B','R','O','X','A','S','P')
                    ${sqlAcl}
                    
                GROUP BY G046.STCARGA`;
               
            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
     * Lista históricos de oferecimento da carga indicada
     * @function api/listaHistorico
     * @author Rafael Delfino Calzado
     * @since 22/04/2019
     *
     * @async 
     * @return {Array}     Retorna resultado da pesquisa em um array
     * @throws {Object}    Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\
    
    api.listaHistorico = async function (req, res, next) {

        try {

            var sql = 
                `SELECT 
                    G046.IDG046,
                    G046.IDG024 IDTRANSP,
                    CASE
                        WHEN G046.IDG024 = O005.IDG024 THEN 'S'
                        ELSE 'N'
                    END SNATIVO,
            
                    O005.IDO005,
                    O005.SNENVIO,
                    O005.DSMOTPRE,
                    O005.DSRESSRV,
            
                    TO_CHAR(O005.DTOFEREC, 'DD/MM/YYYY HH24:MI') DTOFEREC,
                    TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY HH24:MI') DTRESOFE,
                    TO_CHAR(O005.DTENVIO,  'DD/MM/YYYY HH24:MI') DTENVIO,
            
                    CASE
                        WHEN O005.TPOFEREC = 'B' THEN 'BID'
                        WHEN O005.TPOFEREC = 'S' THEN 'SAVE'
                        WHEN O005.TPOFEREC = 'O' THEN 'SPOT'
                        ELSE 'OUTRO'
                    END AS TPMODELO,

                    CASE 
                        WHEN O005.STOFEREC = 'B' THEN 'BACKLOG'
                        WHEN O005.STOFEREC = 'R' THEN 'DISTRIBUÍDA'
                        WHEN O005.STOFEREC = 'O' THEN 'OFERECIDA'
                        WHEN O005.STOFEREC = 'X' THEN 'RECUSADA'
                        WHEN O005.STOFEREC = 'A' THEN 'ACEITA'
                        WHEN O005.STOFEREC = 'S' THEN 'AGENDADA'
                        WHEN O005.STOFEREC = 'P' THEN 'PRÉ-APROVAÇÃO'
                        WHEN O005.STOFEREC = 'T' THEN 'EM TRANSPORTE'
                        WHEN O005.STOFEREC = 'C' THEN 'CANCELADA'
                        ELSE 'OUTRO'
                    END AS DSOFEREC,
                    
                    G024.IDG024,
                    G024.NMTRANSP,
                    
                    G030.IDG030,
                    G030.DSTIPVEI,
                    G030.QTCAPPES,

                    S001A.IDS001,
                    NVL(S001A.NMUSUARI, '-') NMUSURES,
            
                    O004.IDO004,
                    O004.DSMOTIVO

                FROM G046 -- CARGA
                                        
                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030

                INNER JOIN O005 -- OFERECIMENTO
                    ON O005.IDG046 = G046.IDG046
                    
                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = O005.IDG024

                LEFT JOIN S001 S001A -- USUÁRIO AGENDAMENTO
                    ON S001A.IDS001 = O005.IDS001RE 

                LEFT JOIN O004 -- MOTIVO RECUSA
                    ON O004.IDO004 = O005.IDO004
                    
                WHERE G046.IDG046 = ${req.params.id}

                ORDER BY O005.IDO005 DESC`;

            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}
