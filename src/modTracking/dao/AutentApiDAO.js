module.exports = function (app, cb) {

    var api = {};
    api.controller = app.config.ControllerBD;

    var db = app.config.database;
    var utils = app.src.utils.FuncoesObjDB;
    const tmz = app.src.utils.DataAtual;
  
    /**
     * @description Verifica token de interface
     *
     * @function veriToken            
     * @param   {Object} req       
     * @param   {Object} req.headers       
     *
     * @returns {boolean} se válido verdadeiro
     * @throws  {error} exceção não tratada 
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.veriToken = async function (req, res, next) {
        var token = req.body.tokenApi || req.query.token || req.headers['x-access-token'];
        try {
            var con = await this.controller.getConnection();
            var [sqlWhere,bindValues] = utils.buildWhere({
                "tableName":"S030",
                "TOKEN":token,
                "S032.URL":req.path,
                "S001.SNDELETE":0
            },false);
            var res = await con.execute({
                sql:`Select 
                S030.IDS001,
                S030.IDS030,
                S032.IDS032,
                S025.DSMODULO
                From S030
                Inner Join S001
                    on S001.IDS001 = S030.IDS001
                Inner Join S031
                    on S031.IDS001 = S001.IDS001
                Inner Join S032
                    on S032.IDS032 = S031.IDS032
                Inner Join S025
                    on S025.IDS025 = S032.IDS025` + 
                sqlWhere,
                param: bindValues
            }).then((result) => {
                return result;
            }).catch((err) => {
                throw err;
            })
        } catch (err) {
            await con.closeRollback();
            throw err;
        }
        if (res.length == 1) {
            req.UserId = res[0].IDS001;
            req.TokenId = res[0].IDS030;
            req.UrlId = res[0].IDS032;
            req.UrlModulo = res[0].DSMODULO;

            await con.close();
            return true;
        }
        
        await con.close();
        return false;
    }

    /**
     * @description Gera um token para determinado usuário
     *
     * @function gerToken            
     * @param   {Object} req       
     * @param   {Object} req.body       
     *
     * @returns {Object} objeto com token
     * @throws  {error} exceção não tratada 
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.gerToken = async function(req,res,next){
        var hash = app.src.modMonitoria.controllers.HashController;        
        var con = await this.controller.getConnection();
        if(!req.body.IDS001){
            res.status(400).send({ nrlogerr: -1001, armensag: ['Campo de ID não encontrado na requisição'] });
            return
        }
        try{
            var [sqlWhere,bindValues] = utils.buildWhere({
                "tableName":"S001",
                "IDS001":req.UserId,
                "SNADMIN":1
            },true);

            var canUseInterface = await con.execute({
                sql:`SELECT IDS001 FROM S001` + sqlWhere,
                param: bindValues
            }).then((result) => {
                if(result.length == 0){
                    return false;
                }
                return true;
            }).catch((err) => {
                throw err;
            });
            await con.close();
        }catch(err){
            console.log(err);
        }
        if(canUseInterface){
            try {
                var hash = hash.encryptLogin(req.body.IDS001 + new Date());
                
    
                var [sqlWhere,bindValues] = utils.buildWhere({
                    "tableName":"S030",
                    "IDS001":req.body.IDS001
                },false);
                await con.execute({
                    sql:`DELETE FROM S030` + sqlWhere,
                    param: bindValues                
                }).then((result) => {
                    return result
                }).catch((err) => {
                    throw err;
                })
    
                await con.insert({
                    tabela: 'S030',
                    colunas: {
                        DTCRIACA: tmz.retornaData(tmz.tempoAtual("DD/MM/YYYY HH:mm:ss"), "DD/MM/YYYY HH:mm:ss") ,
                        token: hash,
                        IDS001: req.body.IDS001                             
                    },
                    key: 'IDS030'
                }).then((result) => {
                    return result;
                }).catch((err) => {
                    throw err;
                })
                await con.close();
            } catch (err) {
                await con.closeRollback();
                res.status(400).send({ nrlogerr: -1000, armensag: ['id de usuário inválido'] });
                return false;
            }
    
            return hash;
        }
        res.status(403).send({ nrlogerr: -1000, armensag: ['Não é um usuário de API'] });
        return;
    }
    /**
     * @description Vincula um array de url interfaces a um determinado token
     *
     * @function cadUrl            
     * @param   {Object} req       
     * @param   {Object} req.body       
     *
     * @returns {Object} objeto com token
     * @throws  {error} exceção não tratada 
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
    api.cadUrl = async function(req,res,next){
        try{
            var con = await this.controller.getConnection();
            var [sqlWhere,bindValues] = utils.buildWhere({
                "tableName":"S001",
                "IDS001":req.UserId,
                "SNADMIN":1
            },true);

            var canUseInterface = await con.execute({
                sql:`SELECT IDS001 FROM S001` + sqlWhere,
                param: bindValues
            }).then((result) => {
                if(result.length == 0){
                    return false;
                }
                return true;
            }).catch((err) => {
                throw err;
            });
            await con.close();
        }catch(err){
            console.log(err);
        }
        if(canUseInterface){
            try {
                    
                var [sqlWhere,bindValues] = utils.buildWhere({
                    "tableName":"S030",
                    "TOKEN":req.body.tokenApi
                },false);
                
                var userId = await con.execute({
                    sql:`Select IDS001 FROM S030` + sqlWhere,
                    param:bindValues
                }).then((result) => {
                    if (result.length == 1){
                        return result[0].IDS001
                    }
                    return false
                }).catch((err) => {
                    throw err;
                });
    
                await con.close();
            } catch (err) {
                throw err;
            }
            if(!userId){
                res.status(404).send({ nrlogerr: -1001, armensag: ['Token não encontrado'] });
                return;
            }
    
    
            var urlsErr = [];
            var urlsSuc = [];
            for (i in req.body.URLS){            
                const url = req.body.URLS[i];
                try {
    
                    [sqlWhere,bindValues] = utils.buildWhere({
                        "tableName":"S032",
                        "URL":url
                    },false);
                    var urlId = await con.execute({
                        sql:`SELECT IDS032 FROM S032` + sqlWhere,
                        param: bindValues
                    }).then((result) => {
                        if (result.length == 1){
                            return result[0].IDS032
                        }
                        return false
                    }).catch((err) => {
                        throw err;
                    });
    
                    await con.close();
                } catch (err) {
                    throw err;
                }
    
    
                if(urlId){
                    try {
                        await con.execute({
                            sql:`INSERT INTO S031(IDS001,IDS032)
                            VALUES(:IDS030,:IDS032)`,
                            param:{IDS030:userId,IDS032:urlId}
                        }).then((result) => {
                            return;
                        }).catch((err) => {
                            throw err;
                        })
                        await con.close();
                        urlsSuc.push({
                            url:url                        
                        });
                    } catch (err) {
                        urlsErr.push({
                            url:url,
                            erro:"Falha ao gravar no banco"
                        });
                    }
                }else{
                    urlsErr.push({
                        url:url,
                        erro:"URL não encontrada"
                    });                
                }
                
            }
            if(urlsErr.length > 0){
                res.status(400).send({"sucesso": urlsSuc,"falha": urlsErr});
                return;
            }
            return "sucesso";
        }

        res.status(403).send({ nrlogerr: -1000, armensag: ['Não é um usuário de API'] });
        return;

        
    }
  
    
  
    return api;
  
  };
  