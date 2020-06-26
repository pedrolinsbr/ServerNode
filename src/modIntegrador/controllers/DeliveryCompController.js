module.exports = function (app, cb) {

    const dao = app.src.modIntegrador.dao.DeliveryCompDAO;

    var api = {};    

    //-----------------------------------------------------------------------\\
    
    api.listaDlvDetalhe = async function (req, res, next) {

        try {

            req.objConn = await dao.controller.getConnection();

            var rs = await dao.listaDlvDetalhe(req, res, next);

            await req.objConn.close();

            var cdStatus = (rs.length == 0) ? 400 : 200;
            
            res.status(cdStatus).send(rs);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.listaTimeLine = async function (req, res, next) {

        try {

            var rs = await dao.listaTimeLine(req, res, next);

            var cdStatus = (rs.length == 0) ? 400 : 200;
            
            res.status(cdStatus).send(rs);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;
}