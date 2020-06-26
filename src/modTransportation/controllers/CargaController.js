module.exports = function(app, cb) {

    var api = {};
    var dao = app.src.modTransportation.dao.CargaDAO;

    api.listar = async function(req, res, next) {
        await dao.listar(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.listarDocumentos = async function(req, res, next) {
        await dao.listarDocumentos(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.desmontarCarga = async function(req, res, next) {
        await dao.desmontarCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.cancelarCarga = async function(req, res, next) {
        await dao.cancelarCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.indicadoresCarga = async function(req, res, next) {
        await dao.indicadoresCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.validaCancelar = async function(req, res, next) {
        await dao.validaCancelar(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.validaMontarCarga4PL = async function(req, res, next) {
        await dao.validaMontarCarga4PL(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.atribuirVeiculoMotorista = async function(req, res, next) {
        await dao.atribuirVeiculoMotorista(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.atribuicaoMobileCarga = async function(req, res, next) {
        await dao.atribuicaoMobileCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }


    api.mapaCarga = async function(req, res, next) {
        await dao.mapaCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.mapaExpedicao = async function(req, res, next) {
        await dao.mapaExpedicao(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.listarAtribuirOutrosDocumentos = async function(req, res, next) {
        await dao.listarAtribuirOutrosDocumentos(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.deliverysCarga = async function(req, res, next) {
        await dao.deliverysCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.deliverysSelecionadasCarga = async function(req, res, next) {
        await dao.deliverysSelecionadasCarga(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.qtdSituacaoCargas = async function(req, res, next) {
        await dao.qtdSituacaoCargas(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }


    api.qtdTotal = async function(req, res, next) {
        await dao.qtdTotal(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getManifesto = async function(req, res, next) {
        await dao.getManifesto(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.savePrintLog = async function(req, res, next) {
        await dao.savePrintLog(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.listPrintLog = async function(req, res, next) {
        await dao.listPrintLog(req, res, next)
            .then((result1) => {

                res.json(result1.data);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };



    return api;
};