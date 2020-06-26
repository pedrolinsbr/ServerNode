module.exports = function (app, cb) {

    const dbg = app.src.modGlobal.controllers.dbGearController;
    const model = app.src.modOferecimento.models.NivelModel;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.checkForm = function (req, res, next) {

        try {

            var objVal   = { strError: 'Model name not found' };
            var nmModel  = req.body.nmModel;
            var objModel = model[nmModel];
    
            objVal.blOK = ((typeof(nmModel) == 'string') && (typeof(objModel) == 'object'));
    
            if (objVal.blOK)
                objVal = dbg.checkSchema(req.body, objModel.columns);

            if (objVal.blOK) 
                next();
            else 
                res.status(400).send({ message: objVal.strError });        

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.checkKeys = function (req, res, next) {

        try {

            var objVal   = { strError: 'Model name not found' };
            var nmModel  = req.body.nmModel;
            var objModel = model[nmModel];
    
            objVal.blOK = ((typeof(nmModel) == 'string') && (typeof(objModel) == 'object'));
    
            if (objVal.blOK) 
                objVal = dbg.checkKeys(req.body, objModel.key);

            if (objVal.blOK) 
                next();
            else 
                res.status(400).send({ message: objVal.strError });        

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.insere = async function (req, res, next) {

        try {

            var parm = req.body;

            parm.objConn = await dbg.controller.getConnection();            

            var id = await dbg.insertData(parm, model[req.body.nmModel]);

            await parm.objConn.close();

            res.send({ id });

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }

    //-----------------------------------------------------------------------\\        

    api.altera = async function (req, res, next) {

        try {

            var parm = req.body;

            parm.objConn = await dbg.controller.getConnection();            

            var nrRows = await dbg.updateData(parm, model[req.body.nmModel]);

            await parm.objConn.close();

            res.send({ nrRows });

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }

    //-----------------------------------------------------------------------\\    

    api.remove = async function (req, res, next) {

        try {

            var parm = req.body;

            parm.objConn = await dbg.controller.getConnection();

            var objResult = await dbg.deleteData(parm, model[req.body.nmModel]);

            await parm.objConn.close();

            res.send(objResult);

        } catch (err) {

            res.status(500).send({ message: err.message });

        }

    }

    //-----------------------------------------------------------------------\\    

    return api;
}
