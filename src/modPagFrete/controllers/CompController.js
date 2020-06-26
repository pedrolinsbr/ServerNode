module.exports = function (app, cb) {

    const gctl  = app.src.modGlobal.controllers.GenericController;
    const dao   = app.src.modPagFrete.dao.CompDAO;    
    const mdl   = app.src.modPagFrete.models.CompModel;

    var api = {};

    //-----------------------------------------------------------------------\\      
    /**
    * @description Lista componentes padrão
    * @function listarComponente
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.listarComponente = async function(req, res, next) {

        await dao.listarComponente(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });    

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Listar relação de componentes variáveis
    * @function buscarCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Object}  req.body parâmetros de pesquisa
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.buscarCompEmite = async function(req, res, next) {

        await dao.buscarCompEmite(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });    

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description edita a relação de componentes variáveis
    * @function editarCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Number}  id chave da tabela G063
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 
    
    api.editarCompEmite = async function(req, res, next) {

        await dao.editarCompEmite(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });    

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description remove relação de componentes variáveis
    * @function excluirCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Number}  id chave da tabela G063
    * @returns {Object}  Quantidade de linhas afetadas
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.excluirCompEmite = async function(req, res, next) {

        req.objModel = mdl.G063;

        await gctl.exclui(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });    

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Insere dados dos componentes variáveis da transportadora
    * @function inserirCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Object}  req.body campos
    * @returns {Object}  ID do novo registro
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.inserirCompEmite = async function (req, res, next) {

        req.body.SNDELETE = 0;
        req.objModel = mdl.G063;

        await gctl.insere(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });            

    }

    //-----------------------------------------------------------------------\\   
    /**
    * @description Altera dados do registro do componente variável
    * @function alterarCompEmite
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @async
    * @param   {Object}  req.body campos
    * @returns {Object}  Quantidade de linhas afetadas
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.alterarCompEmite = async function (req, res, next) {

        req.body.SNDELETE = 0;
        req.objModel = mdl.G063;

        await gctl.altera(req, res, next)

        .then((result) => {
            res.status(200).send(result);
        })

        .catch((err) => {
            next(err);
        });            

    }

    //-----------------------------------------------------------------------\\    

    return api;
}