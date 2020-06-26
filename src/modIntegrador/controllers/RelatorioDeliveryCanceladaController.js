module.exports = function (app, cb) {
    
    const dao = app.src.modIntegrador.dao.RelatorioDeliveryCanceladaDAO;
    
    var api = {};
    //-----------------------------------------------------------------------\\


    api.listarRelatorioCanceladas = async function (req, res, next) {

        await dao.listarRelatorioCanceladas(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })
        .catch((err) => {
            res.status(500).send({ error: err.message });
        });

    }

    return api;
}