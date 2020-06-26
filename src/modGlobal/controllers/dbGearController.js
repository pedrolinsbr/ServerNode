module.exports = function (app, cb) {

    const joi = require('joi');

    var api = {};
    api.controller = app.config.ControllerBD;

    //-----------------------------------------------------------------------\\

    api.putConditions = function (parm) {

        try {

            var arSQL  = [];
            var strTmp = '';

            for (var k in parm.vlKey) {

                var v = parm.vlKey[k];
                strTmp = (Array.isArray(v)) ? `${k} IN (${v.join()})` : `${k} = ${v}`;
                arSQL.push(strTmp);

            }
        
            return arSQL.join(' AND ');
        
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insert = async function (req) {

        try {

            var objIns = { tabela: req.table, colunas: req.vlFields };

            if (Array.isArray(req.key)) objIns.key = req.key[0];

            var objResult = await req.objConn.insert(objIns);
            await req.objConn.close();

            return { id: objResult };

        } catch (err) {

            await req.objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.update = async function (req) {

        try {

            var objUpd = 
                {
                    tabela:     req.table,
                    colunas:    req.vlFields,
                    condicoes:  this.putConditions(req),
                    parametros: {}
                };

            var objResult = await req.objConn.update(objUpd);
            await req.objConn.close();

            return { nrRows: objResult };
    
        } catch (err) {

            await req.objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;            
            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.execute = async function (req) {

        try {

            var objExecute = { sql: req.sql, fetchInfo: req.fetchInfo };
            objExecute.param = (req.bindValues !== undefined) ? req.bindValues : [];
    
            var arType = req.sql.replace(/\n+/g, ' ').replace(/\s+/g, ' ').split(' ');
            objExecute.type = arType[0].toUpperCase();
    
            var objResult = await req.objConn.execute(objExecute);
            await req.objConn.close();
            
            return objResult;

        } catch (err) {

            await req.objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insertData = async function (parm, model) {

		try {

            var objData = this.setSchema(parm, model);
            objData.objConn = parm.objConn;
            
            await this.controller.setConnection(objData.objConn);
            return await this.insert(objData).then((result) => { return result.id });

		} catch (err) {

			throw err;

		}

	}    

    //-----------------------------------------------------------------------\\

    api.updateData = async function (parm, model) {

		try {

            var nrRows  = null;
            var newParm = Object.assign({ post: parm });

            var objVal = this.checkKeys(newParm.post, model.key);

            if (objVal.blOK) {

                var objData = this.setSchema(parm, model);
                objData.objConn = parm.objConn;
                
                await this.controller.setConnection(objData.objConn);                
                nrRows = await this.update(objData).then((result) => { return result.nrRows });

            }            

            return nrRows;

		} catch (err) {

			throw err;

		}

	}    

    //-----------------------------------------------------------------------\\

    api.deleteData = async function (parm, model) {

        try {

            var objData = this.setSchema(parm, model);
            
            parm.sql = `DELETE FROM ${model.table} WHERE ${this.putConditions(objData)}`;

            await this.controller.setConnection(parm.objConn);
            await this.execute(parm);

            return { blOK: true };

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    api.thereIsAttribute = function (objAnalysis, objAttributes) {

        try {

            var objResponse = {};

            for (var i in objAnalysis) 
                if (objAttributes[i]) objResponse[i] = objAnalysis[i];
                
            return objResponse;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.validateSchema = function (objAnalysis, objSchema) {

        try {

            var objVal = joi.validate(objAnalysis, objSchema.columns, { stripUnknown: true });
            delete objVal.value.objConn;
            
            return objVal.value;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.setSchema = function (objAnalysis, objSchema) {

        try {

            var objFormatted 	  = Object.assign({}, objSchema);
            objFormatted.vlFields = this.validateSchema(objAnalysis, objSchema);
            objFormatted.vlKey    = {};
            
            if (Array.isArray(objFormatted.key)) { 
    
                for (var key of objFormatted.key) {
    
                    if (objFormatted.vlFields.hasOwnProperty(key)) {
                        objFormatted.vlKey[key] = objFormatted.vlFields[key];
                        delete objFormatted.vlFields[key];
                    }	
    
                }
    
            }

            return objFormatted;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.checkSchema = function (objAnalysis, objSchema) {
        
        try {

            var objVal = joi.validate(objAnalysis, objSchema, { stripUnknown: true });
            objVal.blOK = (objVal.error == null);
    
            if (!objVal.blOK)  {
                var objError = objVal.error.details[0].context;
                objVal.strError = `${objError.key} - ${objError.label}`;
            }
    
            return objVal;

        } catch (err) {

            throw err;

        }
        
    }

    //-----------------------------------------------------------------------\\

    api.checkKeys = function (objAnalysis, arKeys) {
        
        var objVal = { blOK: false, strError: 'No keys found' };

        for (var key of arKeys) {
            
            objVal.blOK = (typeof(objAnalysis[key]) != 'undefined');

            if (!objVal.blOK) {
                objVal.strError = `Key ${key} not found`;
                break;
            }

        }

        return objVal;

    }

    //-----------------------------------------------------------------------\\   

    return api;

}
