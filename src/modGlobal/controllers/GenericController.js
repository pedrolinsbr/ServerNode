/**
 * @module modGlobal/controllers/GenericController
 * 
 * @requires module:modGlobal/dao/GenericDAO
 * @requires module:utils/Formatador
*/
module.exports = function (app, cb) {

    var api = {};

    const dao   = app.src.modGlobal.dao.GenericDAO;
    const utils = app.src.utils.Formatador;

    //-----------------------------------------------------------------------\\    
    /**
     * Lista os registros da tabela com filtro
     * @function lista
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o array dos registros encontrados
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\  

    api.lista = async function (req, res, next) {
        
        var objSchema = req.objModel;
        
        req.table   = objSchema.table;
        req.columns = Object.keys(objSchema.columns);

        return await dao.listar(req, res, next)
        .catch((err) => {
            next(err);
        });                
    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista a informção do registro com o ID informado
     * @function edita
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o registro encontrado
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\  

    api.edita = async function (req, res, next) {

        var objSchema = req.objModel;
        var params    = { vlKey: {} }

        params.table   = objSchema.table;
        params.key     = objSchema.key;        
        params.columns = Object.keys(objSchema.columns);
        params.vlKey[params.key[0]] = req.params.id;        

        return await dao.editar(params, res, next)
        .catch((err) => {
            next(err);
        });                
    }

    //-----------------------------------------------------------------------\\
    /**
     * Insere um registro específico da tabela
     * @function insere
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o número de registros afetados
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\    

    api.insere = async function (req, res, next) {
        
        var objSchema = utils.setSchema(req.objModel, req.body);

        var objVer = utils.validaEsquema(req.body, objSchema.columns);

        if (objVer.blOK) {
            
            return await dao.inserir(objSchema, res, next)
            .catch((err) => {
                next(err);
            });

        } else {
            res.status(500).send({ arOcorre: [objVer.strErro] });
        }
    }

    //-----------------------------------------------------------------------\\
    /**
     * Altera um registro específico da tabela
     * @function altera
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o número de registros afetados
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\    

    api.altera = async function (req, res, next) {

        var objSchema = utils.setSchema(req.objModel, req.body);

        if ((utils.validateSchema(objSchema)) &&
            (objSchema.vlKey.hasOwnProperty(objSchema.key[0]))) {
            
            return await dao.alterar(objSchema, res, next)
            .catch((err) => {
                next(err);    
            });
            
        } else {
            res.status(500).send({ arOcorre: ['Campos inválidos'] });
        }
    }

    //-----------------------------------------------------------------------\\
    /**
     * Soft Delete em um registro específico da tabela
     * @function exclui
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o número de registros afetados
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\    

    api.exclui = async function (req, res, next) {

        try {

            var objSchema = req.objModel;
            objSchema.vlKey[objSchema.key[0]] = req.params.id;
            objSchema.vlFields['SNDELETE'] = 1;        
            
            return await dao.alterar(objSchema, res, next);    

        } catch (err) {

            throw err;

        }
 
    }

    //-----------------------------------------------------------------------\\
    /**
     * Hard Delete em um registro específico da tabela
     * @function remove
     * @author Rafael Delfino Calzado
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o número de registros afetados
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\    

    api.remove = async function (req, res, next) {

        var objSchema = req.objModel;
        objSchema.vlKey[objSchema.key[0]] = req.params.id;

        return await dao.remover(objSchema, res, next)
        .catch((err) => {
            next(err);    
        });
    }

    //-----------------------------------------------------------------------\\ 

    return api;
}
