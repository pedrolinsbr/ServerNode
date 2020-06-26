module.exports = function(app, cb) {
    var api = {};
    var logger = app.config.logger;
    var dao = app.src.modTransportation.dao.SlaDeliveryDAO;
     


    api.verificaSLA = async function(req, res, next) {
        await dao.verificaSLA(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };
      
    return api;
};