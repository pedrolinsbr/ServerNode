module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;

    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\
    /**
     * Lista fretes por armazéns e destinos
     * @function api/listarRealizado
     * @author Rafael Delfino Calzado
     * @since 25/04/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarRealizado = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var strFiltro = '';

        if ((req.body.NMARMAZE) && (req.body.NMARMAZE.length > 0)) strFiltro += `AND UPPER(G028.NMARMAZE) LIKE UPPER('%${req.body.NMARMAZE}%') `;
        if ((req.body.NMTRANSP) && (req.body.NMTRANSP.length > 0)) strFiltro += `AND UPPER(G024.NMTRANSP) LIKE UPPER('%${req.body.NMTRANSP}%') `;
        if ((req.body.CDDEST) && (req.body.CDDEST.length > 0))     strFiltro += `AND UPPER(G003D.NMCIDADE) LIKE UPPER('%${req.body.CDDEST}%') `;        
        if ((req.body.CLDEST) && (req.body.CLDEST.length > 0))     strFiltro += `AND UPPER(G005D.NMCLIENT) LIKE UPPER('%${req.body.CLDEST}%') `;
        if ((req.body.UFDEST) && (req.body.UFDEST.length > 0))     strFiltro += `AND G002D.CDESTADO = '${req.body.UFDEST}' `;        

        if (req.body.DTINI) strFiltro += `AND O005.DTRESOFE >= TO_DATE('${req.body.DTINI}', 'DD/MM/YYYY') `;
        if (req.body.DTFIN) strFiltro += `AND O005.DTRESOFE <= TO_DATE('${req.body.DTFIN}', 'DD/MM/YYYY') `;


        var arCols = 
            [
                    'Q.IDG028'
                ,	'Q.NMARMAZE'
                
                ,	'Q.IDG002'
                ,	'Q.CDESTADO'
                
                ,	'Q.IDG003'
                ,	'Q.NMCIDADE'
                
                ,	'Q.BLREGRA'
                
                ,	'Q.IDG024'
                ,	'Q.NMTRANSP'                
            ];

        var sql =
            `SELECT 
                    ${arCols.join()}

                ,   CASE
                        WHEN (Q.BLREGRA = 0) THEN Q.NMTRANSP || ' (SPOT)'
                        ELSE Q.NMTRANSP
                    END NMTRANSR

                ,	COUNT(*) TTCARGA
                ,   SUM(COUNT(*)) OVER(PARTITION BY Q.IDG028, Q.IDG003, Q.BLREGRA) TTREGRA
                ,	SUM(COUNT(*)) OVER(PARTITION BY Q.IDG028, Q.IDG003) TTGERAL                
        
            FROM (	
                SELECT 
                        G028.IDG028
                    ,	G028.NMARMAZE
                    
                    ,	G002D.IDG002
                    ,	G002D.CDESTADO
                    
                    ,	G003D.IDG003
                    ,	G003D.NMCIDADE
            
                    ,	CASE 
                            WHEN O005.IDO009 IS NULL THEN 1
                            ELSE 0
                        END BLREGRA
                    
                    ,	G024.IDG024
                    ,	G024.NMTRANSP	
                    
                    ,	G046.IDG046
                    
                FROM G046 --CARGAS
                
                INNER JOIN G028 --ARMAZEM
                    ON G028.IDG028 = G046.IDG028
                
                INNER JOIN G024 --TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024	
                    
                INNER JOIN O005 --OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                    AND O005.STOFEREC = 'A'
                    
                INNER JOIN (SELECT IDG046, MAX(NRSEQETA) NRSEQETA FROM G048 GROUP BY IDG046) ETAPAF
                    ON ETAPAF.IDG046 = G046.IDG046
                
                INNER JOIN G048 G048D -- DESTINO
                    ON G048D.IDG046 = G046.IDG046
                    AND G048D.NRSEQETA = ETAPAF.NRSEQETA
                
                INNER JOIN G005 G005D -- CLIENTE DESTINO
                    ON G005D.IDG005 = G048D.IDG005DE                            
                    
                INNER JOIN G003 G003D -- CIDADE DESTINO
                    ON G003D.IDG003 = G005D.IDG003                
                    
                INNER JOIN G002 G002D -- UF DESTINO
                    ON G002D.IDG002 = G003D.IDG002
                
                WHERE 
                    G046.SNDELETE = 0 
                    ${strFiltro}
            ) Q
    
            GROUP BY 
                ${arCols.join()}
                
            ORDER BY 
                    Q.NMARMAZE
                ,	Q.CDESTADO
                ,	Q.NMCIDADE
                ,   Q.BLREGRA DESC
                ,	Q.IDG024`;

        return await objConn.execute({ sql, param: [] })

        .then(async (result) => {
            await objConn.close();
            return result;
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw (err);
        });                
    }

    //-----------------------------------------------------------------------\\
    /**
    * Lista a distribuição de cargas por regra
    * @function api/listarDistribuicao
    * @author Rafael Delfino Calzado
    * @since 12/03/2018
    * 
    *
    * @async 
    * @param  {object} req  - Parâmetros da pesquisa
    * @return {array}       - Retorna um array com o resultado da pesquisa
    * @throws {object}      - Retorna a descrição do erro
    * 
    */
    //-----------------------------------------------------------------------\\  

    api.listarDistribuicao = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var strFiltro = '';

        if ((req.body.NMTRANSP) && (req.body.NMTRANSP.length > 0)) strFiltro += `AND UPPER(G024.NMTRANSP) LIKE UPPER('%${req.body.NMTRANSP}%') `;
        if ((req.body.NMARMAZE) && (req.body.NMARMAZE.length > 0)) strFiltro += `AND UPPER(G028.NMARMAZE) LIKE UPPER('%${req.body.NMARMAZE}%') `;
        if ((req.body.DSTIPVEI) && (req.body.DSTIPVEI.length > 0)) strFiltro += `AND UPPER(G030.DSTIPVEI) LIKE UPPER('%${req.body.DSTIPVEI}%') `;
        if ((req.body.DSREGRA) && (req.body.DSREGRA.length > 0))   strFiltro += `AND UPPER(O008.DSREGRA) LIKE UPPER('%${req.body.DSREGRA}%') `;        
        if ((req.body.CDDEST) && (req.body.CDDEST.length > 0))     strFiltro += `AND UPPER(G003.NMCIDADE) LIKE UPPER('%${req.body.CDDEST}%') `;        
        if ((req.body.CLDEST) && (req.body.CLDEST.length > 0))     strFiltro += `AND UPPER(G005.NMCLIENT) LIKE UPPER('%${req.body.CLDEST}%') `;
        if ((req.body.UFDEST) && (req.body.UFDEST.length > 0))     strFiltro += `AND G002.CDESTADO = '${req.body.UFDEST}' `;     
        if ((req.body.TPOPERAC) && (req.body.TPOPERAC.id != null))  strFiltro += `AND O008.TPTRANSP = '${req.body.TPOPERAC.id}' `;   
        if ((req.body.LOADTRUCK)&& (req.body.LOADTRUCK.id != null)) strFiltro += `AND O008.SNCARPAR = '${req.body.LOADTRUCK.id}' `;   

        if (req.body.DTINI) strFiltro += `AND O005.DTRESOFE >= TO_DATE('${req.body.DTINI}', 'DD/MM/YYYY') `;
        if (req.body.DTFIN) strFiltro += `AND O005.DTRESOFE <= TO_DATE('${req.body.DTFIN}', 'DD/MM/YYYY') `;
        
        var arCols = 
            [
                    'O008.IDO008'
                ,	'O008.DSREGRA'
                ,   'O008.SNCARPAR'
                ,   'O008.TPTRANSP'

                ,   'G002.IDG002'
                ,   'G002.CDESTADO'

                ,   'G003.IDG003'
                ,   'G003.NMCIDADE'

                ,   'G005.IDG005'
                ,   'G005.NMCLIENT'
                
                ,	'O009.IDO009'
                ,	'O009.PCATENDE'
                
                ,	'G024.IDG024'
                ,	'G024.NMTRANSP'
            ];

        var sql = 
                `SELECT ${arCols.join()}

                ,   CASE
                        WHEN O008.SNCARPAR = 'S' THEN 'LTL' 
                        ELSE 'FTL'
                    END LOADTRUCK

                ,   CASE
                        WHEN O008.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                        WHEN O008.TPTRANSP = 'V' THEN 'VENDA' 
                        WHEN O008.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                        WHEN O008.TPTRANSP = 'G' THEN 'RETORNO AG'  
                        ELSE 'OUTRO'
                    END TPOPERAC

                    ,   COUNT(*) TTCARGA
                    ,   SUM(COUNT(*)) OVER(PARTITION BY O008.IDO008) TTGERAL
            
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
                    AND O005.STOFEREC = 'A'      
                
                INNER JOIN G024 -- 3PL     
                    ON G024.IDG024 = O005.IDG024
                    
                INNER JOIN G046 -- CARGAS
                    ON G046.IDG046 = O005.IDG046
                    AND G046.IDG024 = O005.IDG024

                INNER JOIN G030 -- TIPO VEÍCULO
                    ON G030.IDG030 = G046.IDG030
                    
                WHERE 
                    O008.SNDELETE = 0 AND
                    G046.SNDELETE = 0 AND
                    G046.STCARGA <> 'C'
                    ${strFiltro}
                
                GROUP BY ${arCols.join()}
                    
                ORDER BY O008.IDO008, O009.PCATENDE DESC`;

        return await objConn.execute({ sql, param: [] })

        .then(async (result) => {                
            await objConn.close();
            return result;
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        });
    }

    //-----------------------------------------------------------------------\\    
    /**
    * @description Lista as cargas recusadas
    * 
    * @function api/carga/recusada
    * 
    * @async 
    * @param  {Object} req  - Parâmetros da pesquisa
    * @return {Array}       - Retorna um array com o resultado da pesquisa
    * @throws {Object}      - Retorna a descrição do erro
    * 
    * @author 
    * @since 
    * 
    * @author Ítalo Andrade Oliveira
    * @description Modifiquei o nome do Alias dos campos: O005.DTRESOFE de DTRECUSA para O005_DTRESOFE, G024.NMTRANSP de NMTRANSP para G024_NMTRANSP, O004.DSMOTIVO de  DSMOTIVO para O004_DSMOTIVO
    * @since 10/07/2018
    */
    //-----------------------------------------------------------------------\\    

    api.listarRecusa = async function (req, res, next) {

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

        var objConn = await this.controller.getConnection();

        var arCols = [                
                'G046.IDG046'
            ,   'G046.CDVIAOTI'
            ,	'G046.TPCARGA'
            ,	'G046.STCARGA'
            ,	'G046.DSCARGA'
            ,	'G046.PSCARGA'
            ,   'G046.VRCARGA'
            ,	'G046.QTVOLCAR'
            ,	'G046.QTDISPER'
            ,	'G046.VRPOROCU'
            ,	'G046.SNURGENT'
            ,	'G046.SNCARPAR'
            ,   'G046.TPTRANSP'
            ,	'G046.SNESCOLT'
          //,   'G046.DTCOLATU'
          //,   'G046.DTCARGA'
            ,	"TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY HH24:MI') DTCOLATU"
            ,	"TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY HH24:MI') DTCARGA"

            ,   'H002.DSTIPCAR'
                
            ,	'G030.IDG030'
            , 	'G030.DSTIPVEI'
            ,	'G030.QTCAPPES'
            
            ,	'G028.IDG028'
            ,	'G028.NMARMAZE'

            ,	'G024.IDG024'
            ,	'G024.NMTRANSP G024_NMTRANSP'

            /*
            ,   'G032.IDG032'
            ,   'G032.NRPLAVEI'
            ,   'G032.DSVEICUL'
            */

            ,   "UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO G003O_NMCIDADE"
            ,   "UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO G003D_NMCIDADE"
            
            ,	"TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY HH24:MI') O005_DTRESOFE" //Data de Recusa

            ,   "O004.DSMOTIVO O004_DSMOTIVO"
        ];        

        var sql = `SELECT ${arCols.join()}

                ,   CASE
                    WHEN G046.SNCARPAR = 'S' THEN 'LTL' 
                    ELSE 'FTL'
                END LOADTRUCK

                ,   CASE
                    WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                    WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
                    WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                    WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG' 
                    ELSE 'OUTRO'
                END TPOPERAC

                ,   COUNT(*) OVER() AS COUNT_LINHA

            FROM G046 -- CARGAS

            INNER JOIN H002 -- TIPO DA CARGA
                ON H002.IDH002 = G046.TPCARGA

            INNER JOIN G030 -- TIPO DO VEÍCULO
                ON G030.IDG030 = G046.IDG030

            INNER JOIN G028 -- ARMAZEM
                ON G028.IDG028 = G046.IDG028
            
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

            INNER JOIN O005 -- OFERCIMENTOS 
                ON O005.IDG046 = G046.IDG046
                    
            INNER JOIN G024 -- TRANSPORTADORA
                ON G024.IDG024 = O005.IDG024
                
            LEFT JOIN O004 -- MOTIVOS 
                ON O004.IDO004 = O005.IDO004
                
            ${sqlWhere}
            AND G046.TPMODCAR IN (2,3) -- 4PL / MISTO
            AND G046.STCARGA <> 'C'
            AND O005.STOFEREC = 'X'
            ${sqlOrder} ${sqlPaginate}`;


        return await objConn.execute({ sql, param: bindValues })

        .then(async (result) => {                
            await objConn.close();
            return utils.construirObjetoRetornoBD(result);
        })

        .catch(async (err) => {
            await objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw(err);
        });
    }

    //-----------------------------------------------------------------------\\    

    return api;
}