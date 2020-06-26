module.exports = function (app, cb) {
    
    const dao = app.src.modLogisticaReversa.dao.RelatorioDAO;
    
    var api = {};

    //-----------------------------------------------------------------------\\

    api.listarRelatorioDevolucao = async function (req, res, next) {

        try {

            var arRS = await dao.listarRelatorioDevolucao(req, res, next)
            res.status(200).send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.listarRelatorioRecusa = async function (req, res, next) {

        try {

            var arRS = await dao.listarRelatorioRecusa(req, res, next)
            res.status(200).send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\    

    return api;
}