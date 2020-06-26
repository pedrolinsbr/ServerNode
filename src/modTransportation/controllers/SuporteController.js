module.exports = function(app, cb) {
    var api = {};
    var logger = app.config.logger;
    var dao = app.src.modTransportation.dao.SuporteDAO;

    api.getInfoByCarga = async function(req, res, next) {
        await dao.getInfoByCarga(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };
    api.getInfoByMdf = async function(req, res, next) {
        await dao.getInfoByMdf(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };


    api.getIndMdfVenc = async function(req, res, next) {
        await dao.getIndMdfVenc(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };

    api.getInfoCTE = async function(req, res, next) {
        await dao.getInfoCTE(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };
      
    return api;
};