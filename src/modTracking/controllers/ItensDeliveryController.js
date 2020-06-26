module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modTracking.dao.ItensDeliveryDAO;

    api.itens = async function (req, res, next) {
        await dao.itens(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };
    return api;
};
