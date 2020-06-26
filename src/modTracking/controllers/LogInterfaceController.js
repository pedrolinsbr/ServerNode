module.exports = function (app, cb) {

    var api = {};
    var logInterface =  app.src.utils.LogInterface; 

    api.listarLog = async function(req,res,next){
        await logInterface.listarLog(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }
    api.logDetalhado = async function(req,res,next){
        await logInterface.logDetalhado(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }
    
    return api;
}
