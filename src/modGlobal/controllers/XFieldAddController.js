module.exports = function (app, cb) {

    const dao  = app.src.modGlobal.dao.XFieldAddDAO;
    const gdao = dao.gdao;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.inserirValoresAdicionais = async function (req, res, next) {

        try {

            var parm       = {};
            parm.objConn   = req.objConn;
            parm.IDS007PK  = req.idTabela;
            parm.nmTabela  = req.nmTabela;
            parm.arCampos  = [];
            
            var arValores  = [];
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    
            await gdao.controller.setConnection(parm.objConn);
            var rs = await dao.buscarCamposAdicionais(parm, res, next);
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\        
    
            for (var a of rs) {
    
                if (req.hasOwnProperty(a.NMCAMPO)) { 
    
                    var objVrAdd = { IDS007PK: parm.IDS007PK, IDG075: a.IDG075, VRCAMPO: req[a.NMCAMPO] };
                    arValores.push(objVrAdd);
                    parm.arCampos.push(`'${a.NMCAMPO}'`);
    
                }
    
            }
    
            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\
    
            if (arValores.length > 0) {
    
                await gdao.controller.setConnection(parm.objConn);
                await dao.removerValoresAdicionais(parm, res, next);
    
                for (var objValor of arValores) {
        
                    objValor.objConn = parm.objConn;
                    await gdao.controller.setConnection(objValor.objConn);
                    await dao.inserirValoresAdicionais(objValor, res, next);
    
                }
    
            }
    
            return arValores;
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.tabelaPivot = async function (req, res, next) {
        
        try {
    
            await gdao.controller.setConnection(req.objConn);
            var arCampos = await dao.buscarCamposAdicionais(req, res, next);
    
            if (arCampos.length == 0 ) {

                var sql = null;

            } else {
    
                var nmCampos = [];

                for (var a of arCampos) 
                    nmCampos.push(`'${a.NMCAMPO}' ${a.NMCAMPO}`);        
    
                var sql = 
                    `SELECT * FROM 
                        (SELECT 
                            G076.IDS007PK ID, 
                            G076.VRCAMPO,
                            G075.NMCAMPO
                            
                        FROM G076 -- VALORES ADICIONAIS
                        
                        INNER JOIN G075 -- CAMPOS ADICIONAIS
                            ON G075.IDG075 = G076.IDG075
                            
                        INNER JOIN S007 -- TABELAS
                            ON S007.IDS007 = G075.IDS007 	
                            
                        WHERE 
                            G076.SNDELETE = 0
                            AND G075.SNDELETE = 0
                            AND S007.NMTABELA = '${req.nmTabela}')
                            
                    PIVOT             
                        (MAX(VRCAMPO) FOR NMCAMPO IN (${nmCampos.join()}))`;
            }
    
            return sql;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}