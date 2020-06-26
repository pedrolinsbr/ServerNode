
module.exports = function (app, cb) {

    const dao = app.src.modTracking.dao.AppDAO;

    var api = {};

    //-----------------------------------------------------------------------\\  

	api.listarNotasCTe = async function (req, res, next) {

        try {

            var rs = await dao.listarNotasCTe(req, res, next);

            res.send(rs);
    
        } catch (err) {

            res.status(500).send({ error: err.message });

        }


    }

	api.getCanhotoById = async function (req, res, next) {

        try {

            var rs = await dao.getCanhotoById(req, res, next);

            res.send(rs);
    
        } catch (err) {

            res.status(500).send({ error: err.message });

        }


    }

    //-----------------------------------------------------------------------\\  

    return api;

}
