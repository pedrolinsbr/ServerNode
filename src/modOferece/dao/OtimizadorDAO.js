module.exports = function (app, cb) {

    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\
    /**
     * Lista os tipos de veículos disponíveis para cadastro
     * @function api/listarTPV
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarTPV = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var sql = `
                    SELECT G030.IDG030, G030.DSTIPVEI, G030.QTCAPPES
                                    
                    FROM G030 -- TIPO DE VEICULO
                    
                    WHERE G030.STCADAST = 'A'
                    AND G030.SNDELETE = 0
                    AND G030.IDG030 NOT IN 
                        (SELECT IDG030 FROM O007 WHERE IDO006 = ${req})
                        
                    ORDER BY G030.QTCAPPES`;

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
     * Lista os tipos de veículos cadastrados no otimizador informado
     * @function api/listarTPVCad
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarTPVCad = async function (req, res, next) {

        var objConn = await this.controller.getConnection();

        var sql = `
                    SELECT 
                        G030.IDG030, 
                        G030.DSTIPVEI, 
                        G030.QTCAPPES,
                        O007.IDO006,
                        O007.IDO007,
                        O007.CDTIPVEI
                                    
                    FROM G030 -- TIPO DE VEICULO

                    INNER JOIN O007 -- TIPO DE VEICULO x OTIMIZADOR
                        ON O007.IDG030 = G030.IDG030
                    
                    WHERE O007.IDO006 = ${req}
                        
                    ORDER BY G030.QTCAPPES`;

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

    return api;
}