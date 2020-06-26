module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modTracking.dao.DeliveryDAO;

    api.listarBusca = async function (req, res, next) {
        await dao.listarBusca(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });


    };
    api.rastreio = async function (req, res, next) {
        await dao.rastreio(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });


    };


    api.buscaDeliveryMobile = async function (req, res, next) {

        try { 

            var rs = await dao.buscaDeliveryMobile(req, res, next);

            var cdStatus = (rs.length == 0) ? 400:200;

            res.status(cdStatus).send(rs);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    return api;

};
