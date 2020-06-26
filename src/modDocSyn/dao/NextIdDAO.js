module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};
    api.controller = gdao.controller;
   
   //-----------------------------------------------------------------------\\

    api.getMessageID = async function (req, res, next) {

        var strSeq = (req.sequence == undefined) ? 'NEXTIDMESSAGE' : req.sequence;

        var sql = `SELECT ${strSeq.toUpperCase()}.NEXTVAL ID FROM DUAL`;
       
        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await req.objConn.execute({ sql, param: []})

        .then(async (result) => {
            await req.objConn.close();
            return result[0].ID;            
        })

        .catch(async (err) => {
            await req.objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

    }

   //-----------------------------------------------------------------------\\

   api.getInstantID = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };
            parm.sql = `SELECT LAST_NUMBER ID FROM USER_SEQUENCES WHERE SEQUENCE_NAME = '${req.sequence}'`;
            
            var arRS = await gdao.executar(parm, res, next);

            return arRS[0].ID;

        } catch (err) {

            throw err;

        }

   }

   //-----------------------------------------------------------------------\\

   api.insereEventoEtapa = async function (req, res, next) {
   
        req.sql = `INSERT INTO I008 (IDG043, IDI001, DTEVENTO)
                   SELECT IDG043, ${req.IDI001}, 
                   TO_DATE('${req.DTEVENTO}', 'YYYY-MM-DD HH24:MI:SS')
                   FROM G049 WHERE IDG048 = ${req.IDG048}`;

       //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

       return await gdao.executar(req, res, next).catch((err) => { throw (err) });

    }

    //-----------------------------------------------------------------------\\   

    api.insereEventoDelivery = async function (req, res, next) {
   
        req.sql = `INSERT INTO I008 (IDG043, IDI001, DTEVENTO) VALUES 
                   (${req.IDG043}, ${req.IDI001}, TO_DATE('${req.DTEVENTO}', 'YYYY-MM-DD HH24:MI:SS'))`;

       //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

       return await gdao.executar(req, res, next).catch((err) => { throw (err) });

    }

    //-----------------------------------------------------------------------\\   

    return api;
}