module.exports = function (app, cb) {

    const utilFMT = app.src.utils.Formatador;
    const mdl     = app.src.modGlobal.models.MenuAcoesModel;
    const dao     = app.src.modGlobal.dao.MenuAcoesDAO;

    var api = {};

   //-----------------------------------------------------------------------\\
    /**
        * @description Verifica o modelo de prenchimento de busca de ações
        *
        * @async 
        * @function checkModel
        * 
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.checkModel = function (req, res, next) {

        var parm = { post: req.body, model: mdl.acoes.columns };
        utilFMT.chkModelPost(parm, res, next);

    }
        
    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica se o menu tem ações disponíveis para o usuário
        *
        * @async 
        * @function buscaAcoes
        * 
		* @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.buscaAcoes = async function (req, res, next) {

        try {

            var arRS = await dao.buscaAcoes(req.body, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }
 
    //-----------------------------------------------------------------------\\  

    return api;

}
