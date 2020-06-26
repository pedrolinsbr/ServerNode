module.exports = function (app, cb) {

    const tmz  = app.src.utils.DataAtual;
    const fmt  = app.src.utils.Formatador;
    const mdl  = app.src.modOferecimento.models.MotivoModel;
    const mdla = app.src.modOferecimento.models.AprovaModel;
    const dao  = app.src.modOferecimento.dao.MotivoDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
        * @description Pesquisa os dados dos motivos de acordo com os filtros da grid
        *
        * @async 
        * @function lista
        * 
        * @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.lista = async function (req, res, next) {

        try {

            var rs = await dao.lista(req, res, next);
            res.send(rs);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica o modelo de preenchimento de motivos
        *
        * @async 
        * @function checkModel
        * 
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\

    api.checkModel = function (req, res, next) {

        var parm = { post: req.body, model: mdl.O004.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica o preenchimento do motivo de recusa 
        *
        * @function checkMotivoRecusa
        * 
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 23/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.checkMotivoRecusa = function (req, res, next) {

        var parm = { post: req.body, model: mdl.postRecusa.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere/Atualiza dados do motivo
        *
        * @async 
        * @function edita
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.edita = async function (req, res, next) {

        try {

            var parm = req.body;
            parm.DTCADAST = tmz.dataAtualJS();
            
            var objDados = fmt.setSchema(mdl.O004, parm);
            objDados.UserId = objDados.vlFields.IDS001;

            if (Object.keys(objDados.vlKey).length == 0) {

                var objRet = await dao.inserir(objDados, res, next);                

            } else {

                var objRet = await dao.alterar(objDados, res, next);
            
            }

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Remove o motivo selecionado 
        *
        * @async 
        * @function remove
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.remove = async function (req, res, next) {

        try {

            var parm = { SNDELETE: 1 };
            parm[mdl.O004.key[0]] = req.params.id;

            var objDados = fmt.setSchema(mdl.O004, parm);
            var objRet   = await dao.alterar(objDados, res, next);

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Insere motivo de recusa no oferecimento indicado
        *
        * @async 
        * @function insMotivoRecusa
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 02/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.insMotivoRecusa = async function (req, res, next) {

        try {

            var objConn = await dao.controller.getConnection(null, req.UserId);
            var parm = req.body;
            
            var objDados = fmt.setSchema(mdl.recusa, parm);
            objDados.objConn = objConn;

            await dao.controller.setConnection(objDados.objConn);
            await dao.alterar(objDados, res, next);

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\            

            parm.STCARGA = 'B';
            parm.IDG024  = null;

            objDados = fmt.setSchema(mdla.statusCarga, parm);
            objDados.objConn = objConn;

            await dao.controller.setConnection(objDados.objConn);
            await dao.alterar(objDados, res, next);

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\            

            await objConn.close();

            res.send({ blOK:true });

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\  

    return api;

}
