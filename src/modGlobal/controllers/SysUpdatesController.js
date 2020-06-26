/**
 * @module modGlobal/controllers/SysUpdatesController
 * 
 * @requires module:modGlobal/dao/SysUpdatesDAO
 * @requires module:utils/Formatador
*/
module.exports = function (app, cb) {

    var api = {};
    api.controller = app.config.ControllerBD;
    const dao   = app.src.modGlobal.dao.SysUpdatesDAO;
    const utils = app.src.utils.Formatador;

    //-----------------------------------------------------------------------\\    
    /**
     * Lista os registros da tabela com filtro
     * @function listar
     * @author Pedro Lins 
     * @since 15/02/2018
     *
     * @async 
     * @param  {Object} req Parâmetros da requisição
     * @return {Object}     Retorna um objeto com o array dos registros encontrados
     * @throws {Object}     Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\  

    api.listar = async function(req, res, next) {
        console.log("Funcao listar updates")
        await dao.listar(req, res, next)
            .then((result1) => {
                res.json(result1.data);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getListItensUpdates = async function(req, res, next) {
        console.log("Funcao getListItensUpdates")
        await dao.getListItensUpdates(req, res, next)
            .then((result1) => {
                
                res.json(result1.data);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };
    

    api.tiposUpdate = async function(req, res, next) {
        console.log("Funcao listar tiposUpdate")
        await dao.tiposUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getSistemas = async function(req, res, next) {
        console.log("Funcao listar getSistemas")
        await dao.getSistemas(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getModulos = async function(req, res, next) {
        console.log("Funcao listar getModulos")
        await dao.getModulos(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getUpdates = async function(req, res, next) {
        await dao.getUpdates(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getItensUpdate = async function(req, res, next) {
        await dao.getItensUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    
    api.getListUpdates = async function(req, res, next) {
        await dao.getListUpdates(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.itensUpdate = async function(req, res, next) {
        await dao.itensUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.salvarUpdate = async function(req, res, next) {
        await dao.salvarUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.salvarItemUpdate = async function(req, res, next) {
        await dao.salvarItemUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getItemUpdate = async function(req, res, next) {
        await dao.getItemUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.editarItemUpdate = async function(req, res, next) {
        await dao.editarItemUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.editaUpdate = async function(req, res, next) {
        await dao.editaUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.removeUpdate = async function(req, res, next) {
        await dao.removeUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    
    api.removeItemUpdate = async function(req, res, next) {
        await dao.removeItemUpdate(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.verificaVersao = async function(req, res, next) {
        await dao.verificaVersao(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    //-----------------------------------------------------------------------\\ 

    return api;
}
