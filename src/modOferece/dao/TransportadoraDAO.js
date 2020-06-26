module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    var acl        = app.src.modIntegrador.controllers.FiltrosController;
    var api = {};
    api.controller = app.config.ControllerBD;


    //-----------------------------------------------------------------------\\
    /**
     * Edita o registro específico de uma transportadora
     * @function api/editar
     * @author Rafael Delfino Calzado
     * @since 02/04/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.editar = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var sql = api.getSqlTransp() + ` WHERE G024.IDG024 = ${req.params.id}`;

        return await objConn.execute({sql, param: []})

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
     * Lista as transportadoras cadastradas
     * @function api/listar
     * @author Rafael Delfino Calzado
     * @since 23/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar = async function (req, res, next) {

        //ACL
        var user = null;
        if(req.UserId != null){
        user = req.UserId;
        }else if(req.headers.ids001 != null){
        user = req.headers.ids001;
        }else if(req.body.ids001 != null){
        user = req.body.ids001;
        }

        //Para testes!!!!!!!!
        //user = 1399;
        
        var acl1 = '';
        acl1 = await acl.montar({
        ids001: user,
        dsmodulo: 'transportation',
        nmtabela: [{
        G024: 'G024'
        }],
        //dioperad: ' ',
        esoperad: 'And '
        });

        if(typeof acl1 == 'undefined'){
        acl1 = '';
        }

        var objConn = await this.controller.getConnection();

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G024', true);

        var sql = api.getSqlTransp() + `${sqlWhere} ${acl1} ${sqlOrder} ${sqlPaginate}`;

        return await objConn.execute({sql, param: bindValues})

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
    /**
     * Lista as frações de representatividade da transportadora
     * @function api/listarPCAtende
     * @author Rafael Delfino Calzado
     * @since 23/03/2018
     *
     * @async
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarPCAtende = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var sql =
                `SELECT
                        O008.IDO008
                    ,	O008.DSREGRA
                    ,	O009.PCATENDE

                FROM O008 -- REGRAS

                INNER JOIN O009 -- REGRAS x 3PL
                    ON O009.IDO008 = O008.IDO008

                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = O009.IDG024

                WHERE
                    O008.SNDELETE = 0 AND
                    G024.IDG024 = ${req.params.id}

                ORDER BY O009.PCATENDE`;


        return await objConn.execute({sql, param: []})

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
     * Lista os grupos de transportadora
     * @function api/listarGTP
     * @author Rafael Delfino Calzado
     * @since 23/03/2018
     *
     * @async
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarGTP = async function (req, res, next) {
        return await utils.searchComboBox('IDG023', 'DSGRUTRA', 'G023', ['IDG023', 'DSGRUTRA'], req.body);
    }

    //-----------------------------------------------------------------------\\

    api.getSqlTransp = function () {

        var strSQL =
            `SELECT
                    G024.IDG024
                ,	G024.NMTRANSP
                ,	G024.RSTRANSP
                ,	G024.CJTRANSP
                ,	G024.IETRANSP
                ,	G024.IMTRANSP
                ,   G024.STCADAST
                ,   G024.NRLATITU
                ,   G024.NRLONGIT
                ,   G024.DSENDERE
                ,   G024.BIENDERE
                ,   G024.NRENDERE
                ,   G024.CPENDERE
                ,   G024.DSCOMEND
                ,   G024.IDLOGOS
                ,   G024.PCPREFRE
                ,   G023.IDG023
                ,	UPPER(G023.DSGRUTRA) DSGRUTRA

                ,   G024.TPPESSOA
                ,	CASE
                        WHEN (G024.TPPESSOA = 'F') THEN 'FÍSICA'
                        ELSE 'JURÍDICA'
                    END TIPOPESSOA

                ,	G003.IDG003
                ,	UPPER(G003.NMCIDADE) || ' / ' ||G002.CDESTADO G003_NMCIDADE
                ,   COUNT(*) OVER () AS COUNT_LINHA

            FROM G024 -- TRANSPORTADORA

            INNER JOIN G023 -- GRUPO TRANSPORTADORA
                ON G023.IDG023 = G024.IDG023

            INNER JOIN G003 -- CIDADES
                ON G003.IDG003 = G024.IDG003

            INNER JOIN G002 -- UF
                ON G002.IDG002 = G003.IDG002`;

        return strSQL;
    }

    //-----------------------------------------------------------------------\\

    return api;
}
