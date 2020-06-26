module.exports = function (app, cb) {

    const acl   = app.src.modIntegrador.controllers.FiltrosController;
    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Lista o id de um oferecimento
     * @function api/listarID
     * @author Rafael Delfino Calzado
     * @since 09/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarID = async function (req, res, next) {

        var sql =
                `SELECT O005.IDO005
                 FROM G046
                 INNER JOIN O005
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                 WHERE
                    G046.IDG046 = ${req.params.id}`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as cargas disponíveis para aceite
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

        var sqlAcl = await acl.montar({
            ids001: req.body.IDS001,
            dsmodulo: 'OFERECIMENTO',
            nmtabela: [{ G024: 'G024' }],
            //dioperad: ' ',
            esoperad: 'AND'
        });

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

        var arCols = [
                'G046.IDG046'
            ,   'G046.CDVIAOTI'
            ,	'G046.TPCARGA'
            ,	'G046.DSCARGA'
            ,	'G046.PSCARGA'
            ,	'G046.QTVOLCAR'
            ,	'G046.QTDISPER'
            ,	'G046.VRPOROCU'
            ,   'G046.VRCARGA'
            ,	'G046.SNURGENT'
            ,	'G046.SNCARPAR'
            ,	'G046.SNESCOLT'
            ,   'G046.TPTRANSP'
            ,   'G046.DTCOLATU'
            ,   'G046.DTCARGA'

            ,   'H002.IDH002'
            ,   'H002.DSTIPCAR'

            ,	'G024.IDG024'
            ,	'G024.NMTRANSP'

            ,	'G028.IDG028'
            ,	'G028.NMARMAZE'

            ,   'O005.IDO005'
            ,   'O005.STOFEREC'

            ,	'G030.IDG030'
            , 	'G030.DSTIPVEI'
            ,	'G030.QTCAPPES'

            ,   'G048D.DTFINETA'

            ,   'G003O.NMCIDADE'
            ,   'G003D.NMCIDADE'

            ,	"UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO"
            ,	"UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO"
        ];

        var i = arCols.length;
        var arColsSel = arCols.slice(0, i);

        

        arColsSel[i-4]  = arColsSel[i-4] + ' NMCIDORI';
        arColsSel[i-3]  = arColsSel[i-3] + ' NMCIDDES';

        arColsSel[i-2]  = arColsSel[i-2] + ' G003O_NMCIDADE';
        arColsSel[i-1]  = arColsSel[i-1] + ' G003D_NMCIDADE';

        arColsSel[i++]  = "TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY') DTCARGAF";
        arColsSel[i++]  = "TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY') DTCOLETF";
        arColsSel[i++]  = "TO_CHAR(G048D.DTFINETA, 'DD/MM/YYYY') DTFINALF";

        arColsSel[i++] =
            `CASE
                WHEN G046.SNCARPAR = 'S' THEN 'LTL'
                ELSE 'FTL'
            END TPOCUPAC`;

        arColsSel[i++] =
            `CASE
                WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA'
                WHEN G046.TPTRANSP = 'V' THEN 'VENDA'
                WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG'
                ELSE 'OUTRO'
            END TPOPERAC`;

        var sql =
                `SELECT ${arColsSel.join()}
                    ,   COUNT(G048.IDG048) QTPARADA
                    ,   COUNT(*) OVER() AS COUNT_LINHA

                FROM G046 -- CARGA

                INNER JOIN H002 -- TIPO DA CARGA
                    ON H002.IDH002 = G046.TPCARGA

                INNER JOIN G024 -- TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024

                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028

                INNER JOIN G030 -- TIPO DO VEÍCULO
                    ON G030.IDG030 = G046.IDG030

                INNER JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G046.IDG024
                    AND O005.STOFEREC = G046.STCARGA

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

                INNER JOIN G003 G003D -- CIDADE DO DESTINO
                    ON G003D.IDG003 = G005D.IDG003

                INNER JOIN G002 G002O -- UF DA ORIGEM
                    ON G002O.IDG002 = G003O.IDG002

                INNER JOIN G002 G002D -- UF DO DESTINO
                    ON G002D.IDG002 = G003D.IDG002

                INNER JOIN G048 -- PARADAS
                    ON G048.IDG046 = G046.IDG046

                ${sqlWhere} ${sqlAcl}
                    AND G046.STCARGA IN ('O', 'A')

                GROUP BY ${arCols.join()} ${sqlOrder} ${sqlPaginate}`;


        var rs = await gdao.executar({sql, bindValues}, res, next).catch((err) => { throw err });

        return utils.construirObjetoRetornoBD(rs);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista todos os tomadores da carga informada
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

    api.listarTomador = async function (req, res, next) {

        var sql =
                `SELECT
                        G046.IDG046
                    ,   G005.IDG005
                    ,	G005.NMCLIENT


                FROM G046 -- CARGAS

                INNER JOIN G048 -- PARADAS
                    ON G048.IDG046 = G046.IDG046

                INNER JOIN G049 -- DELIVERIES x PARADAS
                    ON G049.IDG048 = G048.IDG048

                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043
                    AND G043.SNDELETE = 0

                INNER JOIN G005 -- TOMADORES
                    ON G005.IDG005 = G043.IDG005RE
                    AND G043.SNDELETE = 0

                WHERE
                    G046.SNDELETE = 0 AND
                    G046.IDG046 = ${req.params.id}

                GROUP BY
                        G046.IDG046
                    ,   G005.IDG005
                    ,	G005.NMCLIENT

                ORDER BY
                    G005.NMCLIENT`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }

        //-----------------------------------------------------------------------\\
    /**
     * Lista todos os tomadores da carga informada
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

    api.listarTomador3PL = async function (req, res, next) {

        var sql =
                `SELECT
                        G046.IDG046
                    ,   G051.IDG005CO AS IDG005
                    ,	G005.NMCLIENT

                FROM G046 -- CARGAS

                INNER JOIN G048 -- PARADAS
                    ON G048.IDG046 = G046.IDG046

                INNER JOIN G049 -- DELIVERIES x PARADAS
                    ON G049.IDG048 = G048.IDG048

                INNER JOIN G051 -- CONHECIMENTOS
                    ON G049.IDG051 = G051.IDG051

                INNER JOIN G005 -- TOMADORES
                    ON G005.IDG005 = G051.IDG005CO
                    AND G051.SNDELETE = 0

                WHERE
                    G046.IDG046 = ${req.params.id}
                    AND G046.SNDELETE = 0
                GROUP BY
                        G046.IDG046
                    ,   G051.IDG005CO
                    ,	G005.NMCLIENT

                ORDER BY
                    G005.NMCLIENT`;


        return await gdao.executar({sql}, res, next).catch((err) => { throw err });

    }
    //-----------------------------------------------------------------------\\
    /**
     * Lista todos os tomadores da carga informada apenas os SNDELETE = 0
     * @function api/listar
     * @author Enos Vinícius
     * @since 16/05/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarTomadorDescarga = async function (req, res, next) {

        if (req.params) {
            var id = req.params.id;
        } else if (req.id) {
            var id = req.id;
        }

        var sql =
                `
                SELECT
                    H019.IDH006,
                    H019.IDG005,
                    G005.NMCLIENT
                FROM H019
                INNER JOIN G005
                    ON G005.IDG005 = H019.IDG005
                    AND H019.SNDELETE = 0
                    AND H019.IDH006 = ${id}`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista todos os tomadores da carga informada apenas os SNDELETE = 0
     * @function api/listar
     * @author Enos Vinícius
     * @since 16/05/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarTodosTomadores = async function (req, res, next) {

        if (req.params) {
            var id = req.params.id;
        } else if (req.id) {
            var id = req.id;
        }

        var sql =
                `
                SELECT
                    H019.IDH006,
                    H019.IDG005,
                    H019.SNDELETE,
                    G005.NMCLIENT
                FROM H019
                INNER JOIN G005
                    ON G005.IDG005 = H019.IDG005
                    AND H019.IDH006 = ${id}`;

        return await gdao.executar({sql}, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
    * Lista as cargas disponíveis para agendamento
    * @function api/listarAgenda
    * @author Rafael Delfino Calzado
    * @since 07/03/2018
    *
    * @async
    * @param  {object} req  - Parâmetros da pesquisa
    * @return {array}       - Retorna um array com o resultado da pesquisa
    * @throws {object}      - Retorna a descrição do erro
    */
    //-----------------------------------------------------------------------\\

    api.listarAgenda = async function (req, res, next) {

        try {

            var sqlAcl = await acl.montar({
                ids001: req.body.IDS001,
                dsmodulo: 'HORA-CERTA',
                nmtabela: [{ G024: 'G024' }, {G028: 'G028'}],
                //dioperad: ' ',
                esoperad: 'AND'
            });
    
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);
    
            var arCols = [
    
                'G046.IDG046',
                'G046.TPCARGA',
                'G046.TPORIGEM',
                'G046.CDVIAOTI',
                'G046.DSCARGA',
                'G046.PSCARGA',
                'G046.DTCARGA',
                'G046.DTCOLATU',
                'G046.TPTRANSP',
                'G046.SNCARPAR',
                'G046.VRCARGA',
                'G046.TPMODCAR',
    
                'G028.IDG028',
                'G028.NMARMAZE',
    
                'G030.IDG030',
                'G030.DSTIPVEI',
                'G030.QTCAPPES',
    
                'G024.IDG024',
                'G024.NMTRANSP',
    
                'G031.IDG031',
                'G031.CJMOTORI',
                'G031.RGMOTORI',
                'G031.NRCNHMOT',
                'G031.NMMOTORI',
    
                'G032.IDG032',
                'G032.NRPLAVEI',
    
                'H002.DSTIPCAR',
    
                'O005.IDO005',
                'O005.DTRESOFE'
            ];
    
            var arColsSel  = arCols.slice(0);
            var i = arColsSel.length;
            arColsSel[5]   = "ROUND(G046.PSCARGA, 2) PSCARGA";
            arColsSel[7]   = "TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY') DTCOLATU";
    
            var sql =
                `SELECT ${arColsSel.join()},
    
                    CASE
                        WHEN (O005.IDO005 IS NULL) THEN TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY')
                        ELSE TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY')
                    END DTRESPOS,
    
                    COALESCE(LISTAGG(G005.IDG005, ',') WITHIN GROUP (ORDER BY G043.IDG043), '-') IDTOMADO,
                    COALESCE(LISTAGG(G005.NMCLIENT, ',') WITHIN GROUP (ORDER BY G043.IDG043), '-') NMTOMADO,
                    COALESCE(LISTAGG(G043.NRNOTA, ',') WITHIN GROUP (ORDER BY G043.IDG043), '-') NRNFE,
    
                    COUNT(*) OVER() COUNT_LINHA
    
                FROM G046
    
                INNER JOIN H002 -- TIPO DE CARGA
                    ON H002.IDH002 = G046.TPCARGA
    
                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028
    
                INNER JOIN G030 -- TIPO VEICULO
                    ON G030.IDG030 = G046.IDG030
    
                INNER JOIN G024 -- TRANSP
                    ON G024.IDG024 = G046.IDG024
    
                LEFT JOIN G031 -- MOTORISTA
                    ON G031.IDG031 = G046.IDG031M1
    
                LEFT JOIN G032 -- VEÍCULO
                    ON G032.IDG032 = G046.IDG032V1
    
                LEFT JOIN O005 -- OFERECIMENTO
                    ON O005.IDG046 = G046.IDG046
                    AND O005.IDG024 = G024.IDG024
                    AND O005.STOFEREC = G046.STCARGA
    
                INNER JOIN G048 -- ETAPAS
                    ON G048.IDG046 = G046.IDG046
    
                INNER JOIN G049 -- DELIVERIES DA ETAPA
                    ON G049.IDG048 = G048.IDG048
    
                INNER JOIN G043	-- DELIVERIES
                    ON G043.IDG043 = G049.IDG043  

                INNER JOIN G005 -- TOMADOR
                    ON G005.IDG005 = G043.IDG005RE
    
                ${sqlWhere} ${sqlAcl}
                AND G046.STCARGA IN ('O','A') 
                AND ((G046.TPTRANSP NOT IN ('R', 'D') AND G046.TPMODCAR <> 1) OR (G046.TPMODCAR = 1))

                GROUP BY ${arCols.join()}
    
                ${sqlOrder} ${sqlPaginate}`;
    
            var rs = await gdao.executar({sql, bindValues}, res, next);
    
            return utils.construirObjetoRetornoBD(rs);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;
}
