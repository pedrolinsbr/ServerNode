module.exports = function (app, cb) {

    const acl   = app.src.modIntegrador.controllers.FiltrosController;
    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Lista as cargas disponíveis para oferecimento
     * @function api/listar
     * @author Rafael Delfino Calzado
     * @since 06/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar = async function (req, res, next) {

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

        var sqlAcl = "";

        if (parseInt(req.body.filtroCargas) == 1) {
            var sqlAux = "AND G046.STCARGA IN ('B','R','O','X','A','S')";            
            
        } else {
            var sqlAux = "";

            if (req.body.IDS001 !== undefined) {
                sqlAcl = await acl.montar({
                    ids001: req.body.IDS001,
                    dsmodulo: 'OFERECIMENTO',
                    nmtabela: [{ G024: 'G024' }],
                    //dioperad: ' ',
                    esoperad: 'AND'
                });    
            }
        }
        
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
            ,	'G046.SNESCOLT'
            ,   'G046.TPTRANSP'
            ,   'G046.DTCOLATU'
            ,   'G046.DTCARGA'

            ,   'H002.DSTIPCAR'
                
            ,	'G030.IDG030'
            , 	'G030.DSTIPVEI'
            ,	'G030.QTCAPPES'
            
            ,	'G028.IDG028'
            ,	'G028.NMARMAZE'

            ,	'G024.IDG024'
            ,	'G024.NMTRANSP'

            ,   'G032.IDG032'
            ,   'G032.NRPLAVEI'
            ,   'G032.NRFROTA'
            
            ,   'G048D.DTPREATU'

            ,   'G003O.NMCIDADE'
            ,   'G003D.NMCIDADE'
            
            ,   "UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO"
            ,   "UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO"
        ];
                        
        var arColsSel = arCols.slice(0);
        var i = arColsSel.length;

        arColsSel[i-9]  = arColsSel[i-9] + ' G024_NMTRANSP';        
       
        arColsSel[i-4]  = arColsSel[i-4] + ' NMCIDORI';
        arColsSel[i-3]  = arColsSel[i-3] + ' NMCIDDES';

        arColsSel[i-2]  = arColsSel[i-2] + ' G003O_NMCIDADE';
        arColsSel[i-1]  = arColsSel[i-1] + ' G003D_NMCIDADE';

        var sql = 
                `SELECT ${arColsSel.join()}

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

                    ,   TO_CHAR(G046.DTCARGA, 'MM/DD/YYYY') DTCARGAF
                    ,   TO_CHAR(G046.DTCOLATU, 'MM/DD/YYYY') DTCOLETF
                    ,   TO_CHAR(G048D.DTPREATU, 'MM/DD/YYYY') DTENTREF

                    ,   CASE
                            WHEN G032.IDG032 IS NOT NULL THEN G032.NRFROTA
                            ELSE ''
                        END DSFROTA

                    ,   COUNT(G048.IDG048) QTPARADA
                    ,   COUNT(DISTINCT O005.IDO005) QTOFERECE
                    ,   COUNT(*) OVER() AS COUNT_LINHA

                FROM G046 -- CARGA 
                    
                INNER JOIN H002 -- TIPO DA CARGA
                    ON H002.IDH002 = G046.TPCARGA

                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030

                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028

                LEFT JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024
                    
                LEFT JOIN G032 -- FROTA
                    ON G032.IDG032 = G046.IDG032V1

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

                LEFT JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                        
                ${sqlWhere} ${sqlAux} ${sqlAcl}
                    AND G046.TPMODCAR IN (2,3) -- 4PL / MISTO

                GROUP BY ${arCols.join()} ${sqlOrder} ${sqlPaginate}`;

        var objRet = await gdao.executar({sql, bindValues}, res, next).catch((err) => { throw err });

        return utils.construirObjetoRetornoBD(objRet);
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as cargas a serem distribuídas sob as regras de distribuição
     * @function api/listarCargasDist
     * @author Rafael Delfino Calzado
     * @since 16/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarCargasDist = async function (req, res, next) {

        var arCols =
            [
                    'G046.IDG046'
                ,   'G046.IDG030'
                ,   'G005.IDG005'
                ,   'G003.IDG003'
                ,   'O008.IDO008'
                ,   'O008.IDG005'
                ,   'O008.IDG003'
                ,   'O009.IDO009'
                ,   'O009.PCATENDE'
                ,   'O009.IDG024'
            ];

        var arColsSel = arCols.slice(0);
        arColsSel[2] += ' IDCLIENTE';
        arColsSel[3] += ' IDCIDADE';

        var sql = 
                `SELECT ${arColsSel.join()}
      
                FROM G046
                
                INNER JOIN (SELECT IDG046, MAX(NRSEQETA) NRSEQETA FROM G048 GROUP BY IDG046) ETAPAF 
                    ON ETAPAF.IDG046 = G046.IDG046 
                                
                INNER JOIN G048 -- PARADA FINAL
                    ON G048.IDG046 = ETAPAF.IDG046
                    AND G048.NRSEQETA = ETAPAF.NRSEQETA
                
                INNER JOIN G005 -- CLIENTE DESTINO FINAL
                    ON G005.IDG005 = G048.IDG005DE
                
                INNER JOIN G003 -- CIDADE DESTINO FINAL
                    ON G003.IDG003 = G005.IDG003	
                
                INNER JOIN G002 -- UF DESTINO FINAL
                    ON G003.IDG002 = G002.IDG002
                
                INNER JOIN O008 -- REGRA  
                    ON O008.IDG028 = G046.IDG028
                    AND O008.IDG002 = G002.IDG002
                    AND O008.TPTRANSP = G046.TPTRANSP
                    AND O008.SNCARPAR = G046.SNCARPAR
                    AND ((O008.IDG003 = G003.IDG003) OR (O008.IDG003 IS NULL)) 
                    AND ((O008.IDG005 = G005.IDG005) OR (O008.IDG005 IS NULL))
                    
                INNER JOIN O009 -- REGRA x 3PL
                    ON O009.IDO008 = O008.IDO008
                    
                INNER JOIN O010 -- RESTRIÇÕES TPV
                    ON O010.IDO009 = O009.IDO009
                    AND O010.IDG030 = G046.IDG030
                                
                WHERE            
                    O008.SNDELETE = 0 AND
                    G046.SNDELETE = 0 AND 
                    G046.IDG024 IS NULL AND
                    G046.IDG028 IS NOT NULL AND
                    G046.STCARGA = 'B' AND 
                    G046.IDG046 IN (${req.body.IDG046})
                    
                GROUP BY ${arCols.join()}

                ORDER BY
                        O008.IDO008
                    ,   O009.IDO009
                    ,   O009.PCATENDE`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista o total de oferecimentos por transportadora 
     * @function api/listarTotalOferec
     * @author Rafael Delfino Calzado
     * @since 16/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarTotalOferec = async function (req, res, next) {

        var sql = 
                `SELECT 
                        O009.IDO008
                    ,   O009.IDO009
                    ,   COUNT(*) TTOFEREC

                FROM G046 -- CARGAS

                INNER JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                    AND O005.STOFEREC = 'A'

                INNER JOIN O009 -- REGRAS x 3PL
                    ON O009.IDO009 = O005.IDO009
                     
                WHERE 
                    G046.SNDELETE = 0
                    AND G046.STCARGA <> 'C'

                GROUP BY 
                        O009.IDO008
                    ,   O009.IDO009`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as quantidades de registros por situação da Carga
     * @function api/listarCabecalho
     * @author Rafael Delfino Calzado
     * @since 08/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarCabecalho = async function (req, res, next) {

        if (req.body.IDS001 === undefined) {
                        
            var sqlAux = '';
            var sqlAcl = '';

        } else { 

            var sqlAux = 
                `INNER JOIN G024 
                    ON G024.IDG024 = G046.IDG024
                
                INNER JOIN O005
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                    AND O005.STOFEREC = G046.STCARGA`;

            var sqlAcl = await acl.montar({
                ids001: req.body.IDS001,
                dsmodulo: 'OFERECIMENTO',
                nmtabela: [{ G024: 'G024' }],
                //dioperad: ' ',
                esoperad: 'AND'
            });
        }

        var sql =                     
                `SELECT 
                        G046.STCARGA
                    , 	COUNT(*) TTREGISTRO 
            
                FROM G046 -- CARGA 

                ${sqlAux}
            
                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030
        
                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028
        
                WHERE 
                    G046.SNDELETE = 0 AND
                    G046.TPMODCAR IN (2,3) AND -- 4PL / MISTO
                    G046.STCARGA IN ('B','R','O','X','A','S')
                    ${sqlAcl}
                    
                GROUP BY G046.STCARGA`;
           
        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as transportadoras disponíveis na regra atual para oferecimento
     * @function api/listar3PLRegra
     * @author Rafael Delfino Calzado
     * @since 08/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar3PLRegra = async function (req, res, next) {

        var arCols = 
            [
                    'G024.IDG024'
                ,   'G024.NMTRANSP'                
                ,   'O009.IDO009'
                ,   'O009.PCATENDE'
            ];

        var sql = 
                `SELECT ${arCols.join()}
                FROM G046
                
                INNER JOIN (SELECT IDG046, MAX(NRSEQETA) NRSEQETA FROM G048 GROUP BY IDG046) ETAPAF 
                    ON ETAPAF.IDG046 = G046.IDG046 
                                
                INNER JOIN G048 -- PARADA FINAL
                    ON G048.IDG046 = ETAPAF.IDG046
                    AND G048.NRSEQETA = ETAPAF.NRSEQETA
                
                INNER JOIN G005 -- CLIENTE DESTINO FINAL
                    ON G005.IDG005 = G048.IDG005DE
                
                INNER JOIN G003 -- CIDADE DESTINO FINAL
                    ON G003.IDG003 = G005.IDG003	
                
                INNER JOIN G002 -- UF DESTINO FINAL
                    ON G003.IDG002 = G002.IDG002
                
                INNER JOIN O008 -- REGRA  
                    ON O008.IDG028 = G046.IDG028
                    AND O008.IDG002 = G002.IDG002
                    AND O008.TPTRANSP = G046.TPTRANSP
                    AND O008.SNCARPAR = G046.SNCARPAR
                    AND ((O008.IDG003 = G003.IDG003) OR (O008.IDG003 IS NULL)) 
                    AND ((O008.IDG005 = G005.IDG005) OR (O008.IDG005 IS NULL))
                    
                INNER JOIN O009 -- REGRA x 3PL
                    ON O009.IDO008 = O008.IDO008

                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = O009.IDG024
                    
                INNER JOIN O010 -- RESTRIÇÕES TPV
                    ON O010.IDO009 = O009.IDO009     
                    AND O010.IDG030 = G046.IDG030
                
                WHERE 
                    O008.SNDELETE = 0 AND 
                    G046.IDG046 = ${req.params.id}
                
                GROUP BY ${arCols.join()}

                ORDER BY O009.PCATENDE DESC`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });     
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as transportadoras spot disponíveis para oferecimento
     * @function api/listar3PLSpot
     * @author Rafael Delfino Calzado
     * @since 08/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar3PLSpot = async function (req, res, next) {

        var sql =                     
                `SELECT 
                        G024.IDG024
                    ,   G024.NMTRANSP
                    ,   G024.CJTRANSP
                    ,   UPPER(G003.NMCIDADE) || ' / ' || G002.CDESTADO NMCIDTRA
                    ,   NULL AS IDO009
                    ,   NULL AS PCATENDE
                
                FROM G024

                INNER JOIN G003 -- CIDADE
                    ON G003.IDG003 = G024.IDG003

                INNER JOIN G002 -- ESTADO
                    ON G002.IDG002 = G003.IDG002
            
                WHERE 
                    G024.SNDELETE = 0 AND
                    G024.STCADAST = 'A' 

                ORDER BY G024.NMTRANSP`;
           
        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\    
    /**
     * Lista as etapas da carga especificada
     * @function api/listarEtapa
     * @author Rafael Delfino Calzado
     * @since 08/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarEtapa = async function (req, res, next) {

        var arCols = 
            [
                    'G048.IDG046'
                ,	'G048.IDG048'
                ,	'G048.IDG005OR'
                ,	'G048.IDG005DE'
                ,	'G048.NRSEQETA'
                , 	'G048.PSDELETA'
                ,	'G048.QTDISPER'
                ,	'G048.QTVOLCAR'
                ,   'G048.DTINIETA'
                ,   'G048.DTFINETA'
                ,   'G048.DTPREORI'
                ,   'G048.DTPREATU'
                , 	"UPPER(G003ORI.NMCIDADE) || ' / ' || G002ORI.CDESTADO"
                , 	"UPPER(G003DES.NMCIDADE) || ' / ' || G002DES.CDESTADO"
            ];

        var arColsSel = arCols.slice(0);

        var i = arColsSel.length;

        arColsSel[i-6]  = "TO_CHAR(G048.DTINIETA, 'DD/MM/YYYY') DTINIETA";
        arColsSel[i-5]  = "TO_CHAR(G048.DTFINETA, 'DD/MM/YYYY') DTFINETA";
        arColsSel[i-4]  = "TO_CHAR(G048.DTPREORI, 'DD/MM/YYYY') DTPREORI";
        arColsSel[i-3]  = "TO_CHAR(G048.DTPREATU, 'DD/MM/YYYY') DTPREATU";

        arColsSel[i-2] += ' NMCIDORI';
        arColsSel[i-1] += ' NMCIDDES';

        var sql =                     
                `SELECT 
                    ${arColsSel.join()},
                    TO_CHAR(MIN(G043.DTENTCON), 'DD/MM/YYYY') DTENTCON

                FROM G048 -- PARADAS
        
                INNER JOIN G005 G005ORI -- CLIENTE ORIGEM
                    ON G005ORI.IDG005 = G048.IDG005OR
                                            
                INNER JOIN G005 G005DES -- CLIENTE DESTINO
                    ON G005DES.IDG005 = G048.IDG005DE

                INNER JOIN G003 G003ORI -- CIDADE ORIGEM
                    ON G003ORI.IDG003 = G005ORI.IDG003                    

                INNER JOIN G003 G003DES -- CIDADE DESTINO
                    ON G003DES.IDG003 = G005DES.IDG003                
                
                INNER JOIN G002 G002ORI -- UF ORIGEM
                    ON G002ORI.IDG002 = G003ORI.IDG002

                INNER JOIN G002 G002DES -- UF DESTINO
                    ON G002DES.IDG002 = G003DES.IDG002

                INNER JOIN G049 -- DELIVERIES POR PARADA
                    ON G049.IDG048 = G048.IDG048

                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043
                
                WHERE 
                    G043.SNDELETE = 0 AND
                    G048.IDG046 = ${req.params.id}

                GROUP BY
                    ${arCols.join()}

                ORDER BY 
                    G048.NRSEQETA`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }        

    //-----------------------------------------------------------------------\\
    /**
    * Lista o histórico de oferecimentos da carga
    * @function api/listarHistOferec
    * @author Rafael Delfino Calzado
    * @since 13/03/2018
    *
    * @async 
    * @param  {object} req  - Parâmetros da pesquisa
    * @return {array}       - Retorna um array com o resultado da pesquisa
    * @throws {object}      - Retorna a descrição do erro
    */
    //-----------------------------------------------------------------------\\  

    api.listarHistOferec = async function (req, res, next) {

        var sql = 
                `SELECT 
                        G046.IDG046	
                    ,	G046.IDG024 IDTRANSP
                    ,   CASE
                            WHEN G046.IDG024 = O005.IDG024 THEN 'S'
                            ELSE 'N'
                        END SNATIVO
            
                    ,	O005.IDO005	
            
                    , 	TO_CHAR(O005.DTOFEREC, 'DD/MM/YYYY HH24:MI') DTOFEREC
                    , 	TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY HH24:MI') DTRESOFE
            
                    ,	CASE
                            WHEN O005.IDO009 IS NULL THEN 'S' 
                            ELSE 'N' 
                        END AS SNSPOT
                
                    ,	CASE 
                            WHEN O005.STOFEREC = 'B' THEN 'BACKLOG'
                            WHEN O005.STOFEREC = 'R' THEN 'ROTEIRIZADA'
                            WHEN O005.STOFEREC = 'O' THEN 'OFERECIDA'
                            WHEN O005.STOFEREC = 'X' THEN 'RECUSADA'
                            WHEN O005.STOFEREC = 'A' THEN 'ACEITA'
                            WHEN O005.STOFEREC = 'S' THEN 'AGENDADA'
                            WHEN O005.STOFEREC = 'T' THEN 'EM TRANSPORTE'
                            WHEN O005.STOFEREC = 'C' THEN 'CANCELADA'
                            ELSE 'OUTRO'
                        END AS DSOFEREC
                    
                    ,	G024.IDG024
                    ,	G024.NMTRANSP
                    
                    ,	G030.IDG030
                    ,	G030.DSTIPVEI
                    ,	G030.QTCAPPES
            
                    ,	O004.IDO004
                    ,	O004.DSMOTIVO
	
                FROM G046 -- CARGA
                                        
                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030

                INNER JOIN O005 -- OFERECIMENTO
                    ON O005.IDG046 = G046.IDG046                    
                    
                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = O005.IDG024

                LEFT JOIN O004 -- MOTIVO RECUSA
                    ON O004.IDO004 = O005.IDO004
                    
                WHERE G046.IDG046 = ${req.params.id}

                ORDER BY O005.DTOFEREC DESC`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }
    
    //-----------------------------------------------------------------------\\  
    /**
    * Lista os tipos de veículo
    * @function api/listarTPV
    * @author Rafael Delfino Calzado
    * @since 19/03/2018
    *
    * @async 
    * @param  {object} req  - Parâmetros da pesquisa
    * @return {array}       - Retorna um array com o resultado da pesquisa
    * @throws {object}      - Retorna a descrição do erro
    */
    //-----------------------------------------------------------------------\\  

    api.listarTPV = async function(req, res, next) {

        var strAux = (req.body.PSCARGA === undefined) ? `` : `AND QTCAPPES >= ${req.body.PSCARGA}`;

        var sql = 
            `SELECT 
                IDG030, DSTIPVEI, QTCAPPES 
            FROM G030 
            WHERE 
                SNDELETE = 0 AND 
                STCADAST = 'A'
                ${strAux}
            ORDER BY QTCAPPES`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }
    
    //-----------------------------------------------------------------------\\  
    /**
    * Lista os tipos de carga
    * @function api/listarTipoCarga
    * @author Rafael Delfino Calzado
    * @since 05/04/2018
    *
    * @async 
    * @param  {object} req  - Parâmetros da pesquisa
    * @return {array}       - Retorna um array com o resultado da pesquisa
    * @throws {object}      - Retorna a descrição do erro
    */
    //-----------------------------------------------------------------------\\  

    api.listarTipoCarga = async function(req, res, next) {

        var sql = 
                `SELECT 
                    IDH002, DSTIPCAR
                FROM H002
                WHERE 
                    SNDELETE = 0 AND 
                    STCADAST = 'A'
                ORDER BY 
                    DSTIPCAR`;
        
        return await gdao.executar({sql}, res, next).catch((err) => { throw err });                    
    }
    
    //-----------------------------------------------------------------------\\    

    return api;
}
