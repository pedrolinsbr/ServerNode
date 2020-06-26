module.exports = function (app, cb) {

    const tmz  = app.src.utils.DataAtual;
    const util = app.src.utils.Formatador;
    const gdao = app.src.modGlobal.dao.GenericDAO;
    const dao  = app.src.modDelivery.dao.ClienteDAO;
    const mdl  = app.src.modDelivery.models.ClienteModel;    

    var api = {};

    //-----------------------------------------------------------------------\\

    api.insereCliente = async function (req, res, next) {        

        req.IDG003   = await api.buscaCidade(req, res, next).catch((err) => { throw err });
        req.DTCADAST = tmz.dataAtualJS();

        var objDado   = util.setSchema(mdl.G005, req);
        var objValida = util.validaEsquema(objDado.vlFields, mdl.G005.columns);

        if (objValida.blOK) {
            
            await gdao.controller.setConnection(req.objConn);
            objDado.objConn = req.objConn;
            
            await gdao.inserir(objDado, res, next).catch((err) => { throw err })

            .then((result) => { 
                objValida.IDG005 = result.id;
                objValida.IDG003 = objDado.vlFields.IDG003;
            });
                    
        }

        return objValida;        

    }

    //-----------------------------------------------------------------------\\

    api.buscaRevendedor = async function (req, res, next) {

        await gdao.controller.setConnection(req.objConn);

        return await dao.buscaRevendedor(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.buscaIdAG = async function (req, res, next) {

        await gdao.controller.setConnection(req.objConn);

        return await dao.buscaIdAG(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\    

    api.buscaCliente = async function (req, res, next) {

        await gdao.controller.setConnection(req.objConn);

        return await dao.buscaCliente(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.buscaClienteOperacao = async function (req, res, next) {

        await gdao.controller.setConnection(req.objConn);

        return await dao.buscaClienteOperacao(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\    

    api.buscaCidade = async function (req, res, next) {

        var id = null;

        if ((req.hasOwnProperty('NMCIDADE')) && (req.hasOwnProperty('CDESTADO'))) {

            await gdao.controller.setConnection(req.objConn);

            var rs = await dao.buscaCidade(req, res, next).catch((err) => { throw err });
            if (rs.length > 0) id = rs[0].IDG003;

        }

        return id;

    }

    //-----------------------------------------------------------------------\\

    return api;

}