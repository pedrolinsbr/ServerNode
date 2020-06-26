module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    api.controller = gdao.controller;
    api.inserir    = gdao.inserir;
    api.alterar    = gdao.alterar;
    api.remover    = gdao.remover;

    //-----------------------------------------------------------------------\\
    /**
     * Lista as cargas disponíveis para distribuição
     * @function api/listaCargaDist
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listaCargasDist = async function (req, res, next) {

        try {

            var arCols =
                [
                    'G046.IDG046',
                    'G046.IDG030',
                    'G046.IDG024',
                    'G046.TPTRANSP',
                    'G046.SNCARPAR',
                    'G046.PSCARGA',
                    'G005.IDG005',
                    'G003.IDG003',
                    'O008.IDO008',
                    'O008.IDG005 IDCLIENTE',
                    'O008.IDG003 IDCIDADE',
                    'O005.IDO009'
                ];

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    
            var sql = 
                `SELECT 
                    ${arCols.join()}
        
                FROM G046 -- CARGAS
                    
                INNER JOIN (SELECT IDG046, MAX(NRSEQETA) NRSEQETA FROM G048 GROUP BY IDG046) ETAPAF 
                    ON ETAPAF.IDG046 = G046.IDG046 
                                
                INNER JOIN G048 -- PARADA FINAL
                    ON G048.IDG046 = ETAPAF.IDG046
                    AND G048.NRSEQETA = ETAPAF.NRSEQETA
                
                INNER JOIN G005 -- CLIENTE DESTINO FINAL
                    ON G005.IDG005 = G048.IDG005DE
                
                INNER JOIN G003 -- CIDADE DESTINO FINAL
                    ON G003.IDG003 = G005.IDG003	                
                
                INNER JOIN O008 -- REGRA  
                    ON O008.IDG014 = G046.IDG014
                    AND O008.IDG028 = G046.IDG028
                    AND O008.IDG002 = G003.IDG002                    
                    AND O008.TPTRANSP = G046.TPTRANSP
                    AND O008.SNCARPAR = NVL(DECODE(G046.SNCARPAR, 'I', 'N'), G046.SNCARPAR)
                    AND (
                        ((O008.IDG005 = G005.IDG005) OR (O008.IDG005 IS NULL)) OR
                        ((O008.IDG003 = G003.IDG003) OR (O008.IDG003 IS NULL))                                             
                        )

                LEFT JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                        
                WHERE            
                    O008.SNDELETE = 0 
                    AND G046.SNDELETE = 0 
                    AND NVL(G046.SNVIRA,'N') = 'N' 
                    -- AND G046.IDG024 IS NULL 
                    -- AND G046.STCARGA = 'B'  
                    AND G046.IDG046 IN (${req.post.IDG046.join()})

                ORDER BY
                    G046.IDG046,
                    O008.IDO008`;

            var parm = { sql, objConn: req.objConn };

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);            

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as cargas disponíveis para distribuição
     * @function api/listaParticipa
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\
  
    api.listaParticipa = async function (req, res, next) {

        try {

            var op = (req.post.TPOFEREC == 'B') ? '>' : '>=';

            var strAux = (req.post.IDG030 == undefined) ? `` : `WHERE O010.IDG030 = ${req.post.IDG030} `;

            var sql = 
                `SELECT 
                    Q.IDO008,
                    Q.IDO009,
                    Q.PCATENDE,
                    Q.PSATUAL,
                    Q.PSTOTAL,
                    Q.PCATUAL,
                    Q.TTACEITE,
                    Q.TTRECUSA,
                    Q.PCRECUSA,
                    G024.IDG024,
                    G024.NMTRANSP,
                    O010.IDO010,
                    O010.IDG030,

                    CASE 
                        WHEN G024.IDG023 = 2 THEN 'S' ELSE 'N'
                    END SNBRAVO,

                    NVL(G024.PCPREFRE, (SELECT NVL(MAX(PCNIVEL), 100) FROM O011 WHERE SNDELETE = 0)) PCPREFRE 
                
                FROM (
            
                    SELECT 
                        O008.IDO008,
                        O009P.IDO009,                        
                        O009P.IDG024,
                        O009P.PCATENDE,
                        NVL(QP.PSATUAL, 0) PSATUAL,	
                        NVL(SUM(QP.PSATUAL) OVER (PARTITION BY O008.IDO008), 0) PSTOTAL,

                        CASE
                            WHEN (NVL(SUM(QP.PSATUAL) OVER (PARTITION BY O008.IDO008), 0) = 0) THEN 0
                            ELSE ROUND(((NVL(QP.PSATUAL, 0) / SUM(QP.PSATUAL) OVER (PARTITION BY O008.IDO008)) * 100), 2)
                        END PCATUAL,

                        NVL(QP.TTRECUSA, 0) TTRECUSA, 
                        NVL(QP.TTACEITE, 0) TTACEITE,   
                        
                        CASE 
                            WHEN ((NVL(QP.TTACEITE, 0) = 0) AND (NVL(QP.TTRECUSA, 0) = 0)) THEN 0   
                            WHEN ((NVL(QP.TTACEITE, 0) = 0) AND (NVL(QP.TTRECUSA, 0) > 0)) THEN 100 
                            ELSE ROUND(((NVL(QP.TTRECUSA, 0) / NVL(QP.TTACEITE, 0)) * 100), 2) 
                        END PCRECUSA
                        
                    FROM O008 -- REGRAS
                    
                    INNER JOIN O009 O009P -- PARTICIPANTES
                        ON O009P.IDO008 = O008.IDO008
                        
                    LEFT JOIN (
                    
                        SELECT 
                            O009.IDO009,
                            SUM (CASE WHEN (O005.STOFEREC = 'X') THEN 1 ELSE 0 END) TTRECUSA,
                            SUM (CASE WHEN ((O005.IDG024 = G046.IDG024) AND (O005.STOFEREC = 'S')) THEN 1 ELSE 0 END) TTACEITE,
                            SUM (CASE WHEN (O005.IDG024 = G046.IDG024) THEN G046.PSCARGA ELSE 0 END) PSATUAL
                        
                        FROM O009 
                        
                        INNER JOIN O005 
                            ON O005.IDO009 = O009.IDO009		
                            
                        INNER JOIN G046 
                            ON G046.IDG046 = O005.IDG046

                        WHERE 
                            G046.SNDELETE = 0
                            AND G046.STCARGA <> 'C'
                            AND O005.DTOFEREC >= TO_DATE('${req.post.strMesRef}-01', 'YYYY-MM-DD')
                    
                        GROUP BY
                            O009.IDO009
                
                    ) QP 
                        ON QP.IDO009 = O009P.IDO009
                
                    WHERE 
                        O008.SNDELETE = 0
                        AND O009P.PCATENDE ${op} 0
                        AND O008.IDO008 IN (${req.post.IDO008.join()})
                    
                ) Q 
                
                INNER JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = Q.IDG024

                INNER JOIN O010 -- FROTA PERMITIDA
                    ON O010.IDO009 = Q.IDO009
                
                ${strAux}

                ORDER BY 
                    Q.IDO008,
                    Q.PCATENDE DESC,
                    Q.IDG024`;

            var parm = { sql, objConn: req.objConn };

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);            

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna as exigências de clientes especiais
     * @function exigenciasClientes
     * @author Rafael Delfino Calzado
     * @since 30/09/2019
     *
     * @return {Array}      Retorna o resultado com o menor frete, se houver
     * @throws {Object}     Retorna o objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.exigenciaCliente = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };
            
            parm.sql = `
                SELECT 
                    G046.IDG046,
                    G048.IDG048,
                    G048.NRSEQETA,
                    G005.IDG005,
                    G005.NMCLIENT,
                    UPPER(G003.NMCIDADE) NMCIDADE,
                    G002.CDESTADO,
                    G097.IDG097,
                    G097.DSVALUE
                FROM G046 -- CARGAS
                INNER JOIN G048 -- ETAPAS
                    ON G048.IDG046 = G046.IDG046 	
                INNER JOIN G005 -- CLIENTES 
                    ON G005.IDG005 = G048.IDG005DE
                INNER JOIN G003 -- CIDADES
                    ON G003.IDG003 = G005.IDG003
                INNER JOIN G002 -- ESTADOS
                    ON G002.IDG002 = G003.IDG002
                INNER JOIN G102 -- EXIGENCIAS x CLIENTE
                    ON G102.IDG005 = G005.IDG005
                INNER JOIN G097 -- EXIGENCIAS
                    ON G097.IDG097 = G102.IDG097
                WHERE 
                   G046.IDG046 = ${req.id}
                ORDER BY  
                    G048.NRSEQETA,
                    G097.DSVALUE`;

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }
        
    }

    //-----------------------------------------------------------------------\\

    return api;
}
