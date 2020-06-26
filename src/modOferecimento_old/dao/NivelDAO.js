module.exports = function (app, cb) {

    const utils  = app.src.utils.FuncoesObjDB;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
    const gdao   = app.src.modGlobal.dao.GenericDAO;	

    var api = {};
    api.controller = app.config.ControllerBD;
    api.alterar    = gdao.alterar;
    api.inserir    = gdao.inserir;
    
    //-----------------------------------------------------------------------\\
    /**
        * @description Pesquisa os níveis de aprovação de acordo com os filtros da grid
        *
        * @async 
        * @function lista
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.lista = async function (req, res, next) {

        try {

            if (req.method == 'POST') {

                var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'O011', true);

            } else {

                var sqlWhere    = `WHERE O011.IDO011 = ${req.params.id}`;
                var sqlOrder    = ``;
                var sqlPaginate = ``;
                var bindValues  = [];

            }

            var sql = 
                `SELECT 
                    O011.IDO011, 
                    O011.PCNIVEL, 
                    O011.DSNIVEL, 
                    COUNT(*) OVER() COUNT_LINHA 
                FROM O011 
                ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

            var arRS = await gdao.executar({sql, bindValues}, res, next);

            if (req.method == 'POST')
                return utils.construirObjetoRetornoBD(arRS);
            else 
                return arRS;

        } catch (err) {

            throw err;
        
        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Pesquisa o nível de aprovação por usuário
        *
        * @async 
        * @function listaUsuario
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna um objecto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.listaUsuario = async function (req, res, next) {

        try {

            if (req.method == 'POST') {

                var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S001', true);

            } else {

                var sqlWhere    = `WHERE S001.IDS001 = ${req.params.id}`;
                var sqlOrder    = ``;
                var sqlPaginate = ``;
                var bindValues  = [];

            }

            var parm = { nmTabela: 'S001' };

            parm.objConn = await gdao.controller.getConnection();
            await gdao.controller.setConnection(parm.objConn);

            var sqlCA = await fldAdd.tabelaPivot(parm, res, next);
            sqlCA = `INNER JOIN (${sqlCA}) CA ON CA.ID = S001.IDS001`;

            parm.sql = 
                `SELECT 
                    S001.IDS001, 
                    S001.NMUSUARI, 
                    O011.IDO011 O011_IDO011,
                    O011.DSNIVEL, 
                    O011.PCNIVEL,
                    COUNT(*) OVER() COUNT_LINHA

                FROM S001 

                ${sqlCA}
	
                INNER JOIN O011 
                    ON O011.IDO011 = CA.IDO011
                    AND O011.SNDELETE = 0
	
                ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;

            parm.bindValues = bindValues;
            var arRS = await gdao.executar(parm, res, next);

            if (req.method == 'POST')
                return utils.construirObjetoRetornoBD(arRS);
            else
                return arRS;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere usuário em um nível de aprovação
        *
        * @async 
        * @function insUsuario
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna um objeto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.insUsuario = async function (req, res, next) {

        try {

            var parm       = {};            
            parm.nmTabela  = 'S001';
            parm.idTabela  = req.post.IDS001;
            parm.IDO011    = req.post.IDO011;

            parm.objConn  = await gdao.controller.getConnection(null, req.UserId);

            var arValores = await fldAdd.inserirValoresAdicionais(parm, res, next);

            await parm.objConn.close();

            return arValores;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description remove usuário em um nível de aprovação
        *
        * @async 
        * @function removeUsuario
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da operação
        * @throws   {Object}  Retorna um objeto com o erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 24/04/2019
    */
    //-----------------------------------------------------------------------\\       

    api.removeUsuario = async function (req, res, next) {

        try {

            var parm       = {};           
            parm.nmTabela  = 'S001'; 
            parm.idTabela  = req.params.id;
            parm.IDO011    = null;

            parm.objConn  = await gdao.controller.getConnection(null, req.UserId);

            var objRet = await fldAdd.inserirValoresAdicionais(parm, res, next);

            await parm.objConn.close();

            return objRet;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\      


    return api;

}