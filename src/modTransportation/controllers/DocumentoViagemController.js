module.exports = function(app, cb) {
    var api = {};
    var logger = app.config.logger;
    var dao = app.src.modTransportation.dao.DocumentoViagemDAO;
    const fs = require('fs');
    const utilsCA = app.src.utils.ConversorArquivos;
    var utils = app.src.utils.Utils;

    api.buscarAutor = async function(req, res, next) {
        await dao.buscarAutor(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                next(err);
            });
    };

    api.getEdiList = async function(req, res, next) {
        await dao.getEdiList(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.atualizarConfigEdi = async function(req, res, next) {
        await dao.atualizarConfigEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.desativarConfigEdi = async function(req, res, next) {
        await dao.desativarConfigEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.salvar = async function(req, res, next) {
        await dao.salvar(req, res, next)
            .then((result1) => {
                console.log("Resultado a enviar ao front: ", result1);
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.excluir = async function(req, res, next) {
        await dao.excluir(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.listar = async function(req, res, next) {
        await dao.listar(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };

    api.listarPendMotVei = async function(req, res, next) {
        await dao.listarPendMotVei(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };
    
    api.getDocsPendentesMounting = async function(req, res, next) {
        await dao.getDocsPendentesMounting(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };

    api.buscarPendTpVeicCli = async function(req, res, next) {
        await dao.buscarPendTpVeicCli(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };

    api.getDocumentoByAutor = async function(req, res, next) {
        await dao.getDocumentoByAutor(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };


    api.uploadDocumento = async function(req, res, next) {
        logger.info("Inicio upload ");
        await dao.saveUploadDoc(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    }

    api.downloadAnexo = async function(req, res, next) {
        await dao.downloadAnexo(req, res, next);
    };

    return api;
};