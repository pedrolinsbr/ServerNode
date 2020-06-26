module.exports = function (app, cb) {

    var api = {};
    
    var gdao = app.src.modGlobal.dao.GenericDAO;
    var tmz  = app.src.utils.DataAtual;
    var fmt  = app.src.utils.Formatador;

    var mdlMult = app.src.modGlobal.models.MultiDocModel;

    //-----------------------------------------------------------------------\\

    api.saveDoc = async function (req, res, next) { 
        
        try { 

            var parm = 
            {
                TPDOCUME:   req.TPDOCUME,
                DSMIMETP:   req.DSMIMETP,
                DTDOCUME:   tmz.dataAtualJS(),
                IDS001:     req.IDS001,
                IDS007:     req.IDS007,
                PKS007:     req.PKS007,
                NMDOCUME:   req.NMDOCUME,
                TMDOCUME:   req.buffer.length,
                CTDOCUME:   Buffer.from(req.buffer, 'utf8')
            };

            var objVal = fmt.checaEsquema(parm, mdlMult.G082.columns);
            
            if (objVal.blOK) {

                var objDados      = { objConn: req.objConn };
                objDados.table    = mdlMult.G082.table;
                objDados.key      = mdlMult.G082.key[0];
                objDados.vlFields = objVal.value;

                await gdao.controller.setConnection(objDados.objConn);
                await gdao.inserir(objDados, res, next);

            }

            return { blOK: objVal.blOK };

        } catch (err) { 

            throw err; 

        } 

    } 

    //-----------------------------------------------------------------------\\

    return api;

}