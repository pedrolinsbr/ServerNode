module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;	

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Relatório de Distribuição de Cargas por Regra de Oferecimento
     * @function relDistribuicao
     * @author Rafael Delfino Calzado
     * @since 29/05/2019
     *
     * @returns {Array}      Retorna um array com o resultado da pesquisa
     * @throws  {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.relDistribuicao = async function (req, res, next) {

        try {

            var strFiltro = '';

            if ((req.body.NMTRANSP) && (req.body.NMTRANSP.length > 0))  strFiltro += `AND UPPER(G024.NMTRANSP) LIKE UPPER('%${req.body.NMTRANSP}%') `;
            if ((req.body.NMARMAZE) && (req.body.NMARMAZE.length > 0))  strFiltro += `AND UPPER(G028.NMARMAZE) LIKE UPPER('%${req.body.NMARMAZE}%') `;
            if ((req.body.DSTIPVEI) && (req.body.DSTIPVEI.length > 0))  strFiltro += `AND UPPER(G030.DSTIPVEI) LIKE UPPER('%${req.body.DSTIPVEI}%') `;
            if ((req.body.DSREGRA) && (req.body.DSREGRA.length > 0))    strFiltro += `AND UPPER(O008.DSREGRA) LIKE UPPER('%${req.body.DSREGRA}%') `;        
            if ((req.body.CDDEST) && (req.body.CDDEST.length > 0))      strFiltro += `AND UPPER(G003.NMCIDADE) LIKE UPPER('%${req.body.CDDEST}%') `;        
            if ((req.body.CLDEST) && (req.body.CLDEST.length > 0))      strFiltro += `AND UPPER(G005.NMCLIENT) LIKE UPPER('%${req.body.CLDEST}%') `;
            if ((req.body.UFDEST) && (req.body.UFDEST.length > 0))      strFiltro += `AND G002.CDESTADO = '${req.body.UFDEST}' `;     
            if ((req.body.TPOPERAC) && (req.body.TPOPERAC.id != null))  strFiltro += `AND O008.TPTRANSP = '${req.body.TPOPERAC.id}' `;   
            if ((req.body.LOADTRUCK)&& (req.body.LOADTRUCK.id != null)) strFiltro += `AND O008.SNCARPAR = '${req.body.LOADTRUCK.id}' `;   
    
            if (req.body.DTINI) strFiltro += `AND TRUNC(O005.DTOFEREC) >= TO_DATE('${req.body.DTINI}', 'DD/MM/YYYY') `;
            if (req.body.DTFIN) strFiltro += `AND TRUNC(O005.DTOFEREC) <= TO_DATE('${req.body.DTFIN}', 'DD/MM/YYYY') `;

                var sql = 
                    `SELECT 
                        O008.IDO008,
                        O008.DSREGRA,
                        O008.SNCARPAR,
                        O008.TPTRANSP,
                        G002.IDG002,
                        G002.CDESTADO,
                        G003.IDG003,
                        G003.NMCIDADE,
                        G005.IDG005,
                        G005.NMCLIENT,
                        O009.IDO009,
                        O009.PCATENDE,
                        G024.IDG024,
                        G024.NMTRANSP,
                    
                        CASE
                            WHEN O008.SNCARPAR = 'S' THEN 'LTL' 
                            ELSE 'FTL'
                        END LOADTRUCK,
                        
                        CASE
                            WHEN O008.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                            WHEN O008.TPTRANSP = 'V' THEN 'VENDA' 
                            WHEN O008.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                            WHEN O008.TPTRANSP = 'G' THEN 'RETORNO AG'  
                            ELSE 'OUTRO'
                        END TPOPERAC,
                        
                        COUNT(G046.IDG046) TTCARGA,
                        ROUND(SUM(G046.PSCARGA), 2) PSCARGA,	
                        SUM(COUNT(G046.IDG046)) OVER(PARTITION BY O008.IDO008) TTGERAL,	
                        ROUND(SUM(SUM(G046.PSCARGA)) OVER(PARTITION BY O008.IDO008), 2) PSTOTAL
                
                    FROM O008 -- REGRAS
                    
                    INNER JOIN G028 -- ARMAZEM
                        ON G028.IDG028 = O008.IDG028
                        
                    INNER JOIN G002 -- UF
                        ON G002.IDG002 = O008.IDG002
                        
                    LEFT JOIN G003 -- CIDADE
                        ON G003.IDG003 = O008.IDG003
                        
                    LEFT JOIN G005 -- CLIENTE
                        ON G005.IDG005 = O008.IDG005
                    
                    INNER JOIN O009 -- REGRAS x 3PL
                        ON O009.IDO008 = O008.IDO008
                            
                    INNER JOIN O005 -- OFERECIMENTO
                        ON O005.IDO009 = O009.IDO009
                        
                    INNER JOIN G046 -- CARGAS
                        ON G046.IDG046 = O005.IDG046
                        AND G046.IDG024 = O009.IDG024
                        
                    INNER JOIN G024 -- 3PL     
                        ON G024.IDG024 = G046.IDG024
                    
                    INNER JOIN G030 -- TIPO VEÍCULO
                        ON G030.IDG030 = G046.IDG030
                        
                    WHERE 
                        O008.SNDELETE = 0    
                        AND G046.SNDELETE = 0
                        AND G046.STCARGA <> 'C'
                        ${strFiltro}
                        
                    GROUP BY 
                        O008.IDO008,
                        O008.DSREGRA,
                        O008.SNCARPAR,
                        O008.TPTRANSP,
                        G002.IDG002,
                        G002.CDESTADO,
                        G003.IDG003,
                        G003.NMCIDADE,
                        G005.IDG005,
                        G005.NMCLIENT,
                        O009.IDO009,
                        O009.PCATENDE,
                        G024.IDG024,
                        G024.NMTRANSP
                    
                    ORDER BY 
                        G002.CDESTADO,
                        O008.IDO008, 
                        O009.PCATENDE DESC`;

                return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista de Oferecimentos realizados
     * @function relOferecimento
     * @author Rafael Delfino Calzado
     * @since 27/08/2019
     *
     * @returns {Array}      Retorna um array com o resultado da pesquisa
     * @throws  {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.relOferecimento = async function (req, res, next) {

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

            var sql = 
                `SELECT 
                    G046.IDG046,
                    G046.TPTRANSP,
                    G046.SNCARPAR,
                    G046.PSCARGA,
                    G046.VRFREREC,
                    G046.VRFREMIN,
                    
                    G028.IDG028,
                    G028.NMARMAZE,

                    G024.IDG024, 
                    G024.NMTRANSP,
                    
                    G046.IDG024SV,
                    G024SV.NMTRANSP NMTRASUG,
                    
                    O005.IDG024 ID3PLOFE, 
                    O005.TPOFEREC,
                    O005.VRFREPAG,
                    
                    TO_CHAR(O005.DTOFEREC, 'DD/MM/YYYY HH24:MI') DTOFEREC,
                    TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY HH24:MI') DTRESOFE,
                    O005.STOFEREC,
                    NVL(O005.DSMOTPRE, 'n.i.') DSMOTPRE,

                    G030.IDG030,
                    UPPER(G030.DSTIPVEI) DSTIPVEI,
                    G030.QTCAPPES,
                    
                    G005D.IDG005 IDG005DE,
                    G005D.NMCLIENT NMDEST,
                    
                    O004.IDO004,
                    NVL(O004.DSMOTIVO, 'n.i.') DSMOTIVO,

                    CASE 
                        WHEN O005.IDG024 = G046.IDG024 THEN 'SIM'
                        ELSE 'NÃO'
                    END SNATIVO,
                
                    CASE
                        WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA'
                        WHEN G046.TPTRANSP = 'V' THEN 'VENDA'
                        WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                        WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG'		
                        ELSE 'OUTROS'	
                    END TPOPERAC,
                    
                    CASE
                        WHEN G046.SNCARPAR = 'S' THEN 'LTL'
                        ELSE 'FTL'	
                    END TPOCUPA,
                    
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
                    
                    CASE 
                        WHEN NVL(G046.VRFREMIN, 0) < NVL(O005.VRFREPAG, 0) THEN 'NÃO'
                        ELSE 'SIM'
                    END SNPAGMIN,

                    COUNT(*) OVER() AS COUNT_LINHA
                                                    
                FROM G046 -- CARGAS

                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028
                
                INNER JOIN (
                    SELECT IDG046, MIN(NRSEQETA) INICIO, MAX(NRSEQETA) FIM FROM G048 GROUP BY IDG046
                ) ETAPAS 
                    ON ETAPAS.IDG046 = G046.IDG046                    
                    
                INNER JOIN G048 G048D -- ETAPA FINAL
                    ON G048D.IDG046 = G046.IDG046
                    AND G048D.NRSEQETA = ETAPAS.FIM
                    
                INNER JOIN G005 G005D -- CLIENTE FINAL
                    ON G005D.IDG005 = G048D.IDG005DE
                
                INNER JOIN G030 -- VEICULO
                    ON G030.IDG030 = G046.IDG030
                
                INNER JOIN O005 -- OFERECIMENTOS 
                    ON O005.IDG046 = G046.IDG046
                
                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = O005.IDG024
                    
                LEFT JOIN G024 G024SV -- 3PL SUGERIDA 
                    ON G024SV.IDG024 = G046.IDG024SV
                    
                LEFT JOIN O004 -- MOTIVO DE RECUSA
                    ON O004.IDO004 = O005.IDO004
                    
                ${sqlWhere}
                AND G046.STCARGA <> 'C'
                    
                ${sqlOrder} 
                ${sqlPaginate}`;
    
            var parm = { sql, bindValues };
                
            var arRS = await gdao.executar(parm, res, next);

            return utils.construirObjetoRetornoBD(arRS, req.body);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}
