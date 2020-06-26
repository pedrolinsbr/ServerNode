module.exports = function (app, cb) {

    const strTbl = 'S001';
    const strKey = 'IDS001';

    var log = app.config.logger;
    var tmz = app.src.utils.DataAtual;

    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\
    /**
     * Lista todos ou um registro específico da tabela
     * @function api/listar
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param {req}     - Parâmetros da requisição
     * @return {result} - Retorna resultado da pesquisa em um array
     * @throws {err}    - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listar = async function (req, res, next) {
        var objConn = await this.controller.getConnection();
        var aux = (req.params.id === undefined) ?  '' : ` WHERE ${strKey} = ${req.params.id}`;

        try {
            return await objConn.execute({
                sql: `SELECT * FROM ${strTbl}${aux}`,
                param: []
            })

            .then((result) => {
                log.debug('Listar ok');
                objConn.close();
                return result;
            })

        } catch (err) {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }

    //-----------------------------------------------------------------------\\
    /**
     * Remove um registro específico da tabela
     * @function api/remover
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param {req}     - Parâmetros da requisição
     * @return {result} - Retorna um objeto com um boolean true em caso de sucesso
     * @throws {err}    - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.remover = async function (req, res, next) {
        var objConn = await this.controller.getConnection();

        try {
            return await objConn.execute({
                sql: `DELETE FROM ${strTbl} WHERE ${strKey} = ${req.params.id}`,
                param: []
            })

            .then((result) => {
                objConn.close();
                return { ok: true };
            })

        } catch (err) {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Altera um registro específico da tabela
     * @function api/alterar
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param {req}     - Parâmetros da requisição
     * @return {result} - Retorna um objeto com o número de registros afetados
     * @throws {err}    - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.alterar = async function (req, res, next) {
        var objConn = await this.controller.getConnection();

        try {
            return await objConn.update({
                tabela:     strTbl,
                condicoes:  `${strKey} = :id`,
                parametros: { id: req.body[strKey] },

                colunas: {
                        NMUSUARI:   req.body.NMUSUARI
                    ,   DSEMALOG:   req.body.DSEMALOG
                }
            })

            .then((result) => {
                objConn.close();
                return { nrRows: result };
            })

        } catch (err) {            
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Insere um registro na tabela 
     * @function api/inserir
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param {req}     - Parâmetros da requisição
     * @return {result} - Retorna um objeto com o ID do registro inserido
     * @throws {err}    - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.inserir = async function (req, res, next) {
        var objConn = await this.controller.getConnection();

        try {
            return await objConn.insert({
                tabela: strTbl,
                key:    strKey,

                colunas: {
                        NMUSUARI:   req.body.NMUSUARI
                    ,   DSEMALOG:   req.body.DSEMALOG
                    ,   DSSENHA:    'dGVzdGU='
                    ,   STUSUARI:   'A'
                    ,   QTACEINV:   0
                    ,   SNADMIN:    0
                    ,   DTCADAST:   tmz.dataAtualJS()
                }
            })

            .then((result) => {
                objConn.close();
                return { id: result };
            })

        } catch (err) {
            err.stack = new Error().stack + `\r\n` + err.stack;            
            throw err;
        } 

    }

    api.socorroS037 = async function () {
        var objConn = await this.controller.getConnection();
        let retorno = null;
        let tabela = 'G083';
        let chave = '786296';
        try {
            retorno = await objConn.execute({
                sql: `Select S037.*
                From S037 S037
                Join S007 S007
                  On S007.IDS007 = S037.IDS007
               Where S007.NMTABELA = '${tabela}'
                 And S037.Dschave = '${chave}'
                 And S037.DsAcao = 2
               Order By S037.DtRegist`,
                param: []
            })

            .then((result) => {
                log.debug('Listar ok');
                objConn.close();
                return result;
            })
            
            console.log(retorno);
            for (key in retorno) {
                let array = retorno[key].DSDETALH.split('\r\n');
                delete array[array.length-1];
                let update = '';
                for (key2 in array) {
                    let aux = array[key2].split(';');
                    let sigla = aux[0].substring(0, 2);
                    let valor = aux[1];
                    if (aux[1] == '' || aux[1] == ' ') {
                        valor = 'null';
                    } else if (sigla == 'DT' && aux[key2].length == 19) {
                        valor = "To_Date('"+valor+"', 'YYYY-MM-DD HH24:MI:SS')";
                    } else {
                        valor = "'"+valor+"'";
                    }
                    update = update + aux[0] + " = " + valor + ", ";
                }
                update = update.substring(0, update.length - 2);
                console.log(`UPDATE ${tabela} SET ${update} WHERE ID${tabela} = ${chave};`);
            }


        } catch (err) {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }
    //api.socorroS037();

    //-----------------------------------------------------------------------\\     

    return api;
}  
