module.exports = function (app, cb) {

	var api = {};
    api.controller = {};
    const tmz = app.src.utils.DataAtual;
    var utils = app.src.utils.FuncoesObjDB;
    
	//-----------------------------------------------------------------------\\  

    /**
     * @description Grava log de APIs para cliente externo, APIs chamadas de interface
     *
     * @function gravaLog            
     * @param   {Object} objLog    
     * @param   {Object} req.objConn conexão DBV4    
     * @param   {number} req.UserId usuário que enviou xml
     * @param   {number} req.UrlId usuário que enviou xml
     *
     * @returns {Object} Retorna json com paradas e suas deliveries
     * @throws  {Error} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
	api.gravaLog = async function (req,objLog) {
        
        this.controller = app.config.ControllerBD;
        var erro = false;

        var con = await this.controller.getConnection(req.objConn);
        //gravo log geral
        try {
            var detGerId = await con.insert({
                tabela: 'S033',
                colunas: {
                    IDS032: req.UrlId,
                    IDS001: req.UserId,
                    STATREQ: objLog.STATREQ,
                    DTGERLOG: tmz.dataAtualJS()
                },
                key: 'IDS033'
            }).then((result) => {
                return result;
            }).catch((err) =>{
                throw err;
            })
           
        } catch (err) {
            var erro = err;
        }

        for(var i = 0; i<objLog.detalhes.length; i++){
            const logDetalhe = objLog.detalhes[i];
            try {
                await con.insert({
                    tabela:'S034',
                    colunas:{
                        IDS033:detGerId,
                        DTGERLOG: tmz.dataAtualJS(),
                        TXTMENSAG:logDetalhe.TXTMENSAG,
                        STATDETA:logDetalhe.STATDETA
                    },
                    key:'IDS034'
                }).then((result) => {
                    return result;
                }).catch((err) => {
                    throw err;
                });
            } catch (err) {
                var erro = err;
            }

        }
        if(!erro){
            await con.close();
            return true;
        }
        await con.closeRollback();
        throw erro;
    }
    
    /**
     * @description responde a requisição da datagrid
     *
     * @function listarLog            
     * @param   {Object} req    
     * @param   {Object} req.body    
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.listarLog = async function(req,res,next){
        var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'S033',false);
        var sqlAclInterface = "";
        if(!req.UserIsAdmin){
            sqlAclInterface = ` And S033.IDS001 = ${req.UserId} `;
        }

        try {
            this.controller = app.config.ControllerBD;
            var con = await this.controller.getConnection();
            var result = con.execute({
                sql:`Select
                S033.IDS033 S033_IDS033,
                S033.IDS001 S033_IDS001,
                S033.STATREQ S033_STATREQ,
                TO_CHAR(S033.DTGERLOG, 'DD/MM/YYYY HH24:MI:SS') S033_DTGERLOG,
                S033.IDS032 S033_IDS032,
                PATH.URL PATH_URL ,
                USERS.NMUSUARI USERS_NMUSUARI,
                COUNT(S033.IDS033) OVER () as COUNT_LINHA
                FROM S033
                Inner Join S032 PATH
                    ON PATH.IDS032 = S033.IDS032
                Inner Join S001 USERS
                     ON USERS.IDS001 = S033.IDS001
                ` + sqlWhere + sqlAclInterface + sqlOrder + sqlPaginate,
                param:bindValues
            }).then((result) => {
                return (utils.construirObjetoRetornoBD(result));
            }).catch((err) => {
                // return err;
                throw err;
            })
            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            throw err;
        }

    }

    /**
     * @description responde a requisição da datagrid
     *
     * @function logDetalhado            
     * @param   {Object} req    
     * @param   {Object} req.body    
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.logDetalhado = async function(req,res,next){
        req.body["parameter[IDS033]"] = req.params.id;
        var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'S034',false);
        try {
            var sqlAclInterface = "";
            if(!req.UserIsAdmin){
                sqlAclInterface = ` And S033.IDS001 = ${req.UserId} `;
            }
            this.controller = app.config.ControllerBD;
            var con = await this.controller.getConnection();
            var result = con.execute({
                sql:`Select
                S034.IDS034,
                TO_CHAR(S034.DTGERLOG, 'dd/mm/yyyy HH24:mi:ss') DTGERLOG,
                S034.TXTMENSAG,
                S034.STATDETA,
                COUNT(S034.IDS034) OVER () as COUNT_LINHA
                FROM S034
                INNER JOIN S033
                    ON S033.IDS033 = S034.IDS033` + sqlWhere + sqlAclInterface + sqlOrder + sqlPaginate,
                param:bindValues
            }).then((result) => {
                return (utils.construirObjetoRetornoBD(result));
            }).catch((err) => {
                throw err;
            })
            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
        }

    }

	return api;
}
