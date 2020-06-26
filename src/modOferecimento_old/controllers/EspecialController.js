module.exports = function (app, cb) {

    const dao   = app.src.modOferecimento.dao.EspecialDAO;
    const model = app.src.modOferecimento.models.EspecialModel;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Checa preenchimento do cadastro de exigências
     * @function checaExige
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @throws {Object}     Retorna uma objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.checaExige = function (req, res, next) {

        req.model = model.G097;
        api.checkForm(req, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Checa preenchimento do cadastro de exigências por cliente
     * @function checaExigeCliente
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @throws {Object}     Retorna uma objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.checaExigeCliente = function (req, res, next) {

        req.model = model.G102;
        api.checkForm(req, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Checa preenchimento dos dados necessários à requisição
     * @function checkForm
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @throws {Object}     Retorna uma objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.checkForm = function (req, res, next) {

        try {
            
            var objVal = dao.dbg.checkSchema(req.body, req.model.columns);

            if (objVal.blOK) 
                next();
            else 
                res.status(400).send({ message: objVal.strError });        

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista os Clientes com cadastro especial
     * @function listaCliEspecial
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaCliEspecial = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listaCliEspecial(req);
            res.send(arRS);            
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
    } 

    //-----------------------------------------------------------------------\\
    /**
     * Lista as exigências cadastradas
     * @function listaExige
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaExige = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listaExige(req);
            res.send(arRS);            
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
     * Insere e altera exigências
     * @function updExige
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.updExige = async function (req, res, next) {

        try {

            var objVal = dao.dbg.checkKeys(req.body, model.G097.key);

            var parm = req.body;

            parm.objConn = await dao.dbg.controller.getConnection(null, req.UserId);     

            if (objVal.blOK) {

                var nrRows = await dao.dbg.updateData(parm, model.G097);
                var objRet = { nrRows };

            } else {

                parm.IDKEY = await dao.maxIdKey(parm);

                var id = await dao.dbg.insertData(parm, model.G097);
                var objRet = { id };

            }

            await parm.objConn.close();

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }    

    //-----------------------------------------------------------------------\\
    /**
     * Lista as exigências disponíveis
     * @function listaExigeDisp
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaExigeDisp = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listaExigeDisp(req);
            res.send(arRS);            
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
    } 

    //-----------------------------------------------------------------------\\
    /**
     * Lista as exigências atribuídas
     * @function listaExigeCliente
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.listaExigeCliente = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listaExigeCliente(req);
            res.send(arRS);            
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
    } 

    //-----------------------------------------------------------------------\\
    /**
     * Insere exigências por cliente
     * @function insereExigeCliente
     * @author Rafael Delfino Calzado
     * @since 17/09/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.insereExigeCliente = async function (req, res, next) { 
    
        try { 
    
            var parm = { post: req.body };
            parm.objConn = await dao.dbg.controller.getConnection(null, req.UserId);

            await dao.removeExigeCliente(parm);
            if (parm.post.IDG097.length > 0) await dao.insereExigeCliente(parm);

            await parm.objConn.close();

            res.send({ blOK: true });
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
    } 

    //-----------------------------------------------------------------------\\
    
    return api;

}