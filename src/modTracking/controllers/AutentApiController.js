module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modTracking.dao.AutentApiDAO;
  
    api.veriToken = async function (req, res, next) {
      await dao.veriToken(req, res, next)
        .then((result) => {
            if (result){
                next();
            }else{
                return res.status(403).send({ nrlogerr: -902, armensag: ['Token inválido'] });
            }
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
  
     
    }

    api.gerToken = async function (req, res, next) {
        await dao.gerToken(req, res, next)
          .then((result) => {
              if(result){
                return res.json(result);
              }              
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });
    
       
    }

    api.cadUrl = async function (req, res, next) {
        await dao.cadUrl(req, res, next)
          .then((result) => {
              if(result){
                return res.json(result);
              }              
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });
    
       
    }
    
    return api;
    
};
  