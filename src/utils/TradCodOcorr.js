module.exports = function (app, cb) {

	var fn = {};

	//-----------------------------------------------------------------------\\  

	fn.codOcorrReasonCode =  async function (req) {
        
        this.controller = app.config.ControllerBD;
        var con = await this.controller.getConnection(req.objConn);
        try {
            var res = await con.execute({
                sql:`Select I007.IDI007,I007.IDI015 from I007 
                INNER JOIN I015
                    ON I015.IDI015 = I007.IDI015`,
                param:[]
            }).then((result) => {
                var objRet = {};
                for (var i = 0; i < result.length; i++){
                    objRet[result[i].IDI015.toString()] = result[i].IDI007;
                }
                return objRet;
            }).catch((err) => {
                throw err;
            })
        } catch (err) {
            await con.closeRollback();
            throw err;
        }
        await con.close();
		return res;
	}
  
	//-----------------------------------------------------------------------\\

	return fn;
}