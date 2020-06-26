module.exports = function (app, cb) {

    const fmt  = app.src.utils.Formatador;
    const mdl  = app.src.modOferecimento.models.AprovaModel;
    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de motivo de aprovação
     * @function api/checkMotivoAprova
     * @author Rafael Delfino Calzado
     * @since 22/04/2019
     *
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.checkMotivoAprova = function (req, res, next) {

        var parm = { post: req.body, model: mdl.motivoAprova.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Preenche o motivo para aprovação da carga fora da margem de lucro
     * @function api/insMotivoAprova
     * @author Rafael Delfino Calzado
     * @since 22/04/2019
     *
     * @async 
     * @return {Objeto}     Retorna o objeto com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.insMotivoAprova = async function (req, res, next) {

        try {

            var objDados = fmt.setSchema(mdl.motivoAprova, req.body);
            var objRet   = await gdao.alterar(objDados, res, next);
            
            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}