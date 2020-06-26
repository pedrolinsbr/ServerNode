module.exports = function (app, cb) {

    const tmz     = app.src.utils.DataAtual;
    const utilFMT = app.src.utils.Formatador;
    const mdl     = app.src.modOferecimento.models.TransportadoraModel;
    const dao     = app.src.modOferecimento.dao.TransportadoraDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista transportadoras cadastradas
        *
        * @async 
        * @function listaTransp			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaTransp = async function (req, res, next) {

        try {

            var arRS = await dao.listaTransp(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica o modelo de preenchimento da Transportadora
        *
        * @async 
        * @function checkModelTransp
        * 
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.checkModelTransp = function (req, res, next) {

        var parm = { post: req.body, model: mdl.G024.columns };
        utilFMT.chkModelPost(parm, res, next);

    }
    
    //-----------------------------------------------------------------------\\
    /**
        * @description Insere/Atualiza dados da transportadora
        *
        * @async 
        * @function editaTransp
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\  

    api.editaTransp = async function (req, res, next) {

        try {

            var parm = req.body;
            parm.DTCADAST = tmz.dataAtualJS();
            
            var objDados = utilFMT.setSchema(mdl.G024, parm);
            objDados.UserID = objDados.vlFields.IDS001;

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
        * @description Lista porcentagem contratada da 3PL em cada Regra
        *
        * @async 
        * @function listaPC		
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 
    
    api.listaPC = async function(req, res, next) {

        try {

            var arRS = await dao.listaPC(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Remove logicamente a transportadora
        *
        * @async 
        * @function removeTransp		
        * 
        * @returns  {Object}  Retorna um objeto com o resultado da ação
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 
    
    api.removeTransp = async function (req, res, next) {

        try {

            var parm = { SNDELETE: 1 };
            parm[mdl.G024.key[0]] = req.params.id;

            var objDados    = utilFMT.setSchema(mdl.G024, parm);
            objDados.UserID = req.UserID;

            var objRet = await dao.alterar(objDados, res, next);

            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }
    
    //-----------------------------------------------------------------------\\ 
    /**
        * @description Filtra Grupo de Transportadora
        *
        * @async 
        * @function listaGTP
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 
    
    api.listaGTP = async function (req, res, next) {

        try {

            var arRS = await dao.listaGTP(req, res, next);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });            

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}