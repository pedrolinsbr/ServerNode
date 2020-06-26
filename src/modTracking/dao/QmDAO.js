module.exports = function (app, cb) {

    var api = {};
    api.controller = app.config.ControllerBD;
    
    //-----------------------------------------------------------------------\\

    api.buscaNF = async function (req, res, next) {

        var sql = 
            `SELECT 
                    G051.IDG051
                ,	G051.STINTCLI
                ,	G051.DTENTPLA
                ,	G005R.CJCLIENT CJREMETE
                ,	G024.CJTRANSP
                ,	G043.IDG043
                ,	G043.DTENTREG
	
            FROM G051 
                
            INNER JOIN G005 G005R
                ON G005R.IDG005 = G051.IDG005RE
                
            INNER JOIN G024 
                ON G024.IDG024 = G051.IDG024

            INNER JOIN G052 
                ON G052.IDG051 = G051.IDG051
                
            INNER JOIN G043 
                ON G043.IDG043 = G052.IDG043
                AND G043.SNDELETE = 0
                
            WHERE 
                G051.SNDELETE = 0
                AND G043.NRNOTA = ${req.NRNOTA} 
                AND G005R.CJCLIENT = '${req.CJCLIENT}'
                AND G024.CJTRANSP = '${req.CJTRANSP}'`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        var objConn = await this.controller.getConnection(req.objConn);

        return await objConn.execute({ sql, param: [] })

        .then(async (result) => {
            await objConn.close();
            return result;
        })

        .catch(async (err) => { 
            await objConn.closeRollback();
            throw err;
        });        

    }

    //-----------------------------------------------------------------------\\

    api.updDtPrevisao = async function (req, res, next) {

        var sql = 
            `UPDATE G051 SET 
                STINTCLI = 1, DTENTPLA = TO_DATE('${req.dtPrevisao}', 'DD/MM/YYYY HH24:MI')
             WHERE 
                ((STINTCLI IS NULL) OR (STINTCLI < 3))
                AND DTENTPLA <> TO_DATE('${req.dtPrevisao}', 'DD/MM/YYYY HH24:MI') 
                AND IDG051 = ${req.IDG051}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        var objConn = await this.controller.getConnection(req.objConn);

        return await objConn.execute({ sql, param: [], type: 'UPDATE' })

        .then(async (result) => {
            await objConn.close();
            return result;
        })

        .catch(async (err) => { 
            await objConn.closeRollback();
            throw err;
        });            

    }

    //-----------------------------------------------------------------------\\
    
    api.updDtEntrega = async function (req, res, next) {

        var sql = 
            `UPDATE G043 
             SET DTENTREG = TO_DATE('${req.dtEntrega}', 'DD/MM/YYYY HH24:MI') 
             WHERE DTENTREG IS NULL AND IDG043 = ${req.IDG043}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        var objConn = await this.controller.getConnection(req.objConn);

        return await objConn.execute({ sql, param: [], type: 'UPDATE' })

        .then(async (result) => {
            await objConn.close();
            return result;
        })

        .catch(async (err) => { 
            await objConn.closeRollback();
            throw err;
        });

    }

    //-----------------------------------------------------------------------\\

    api.updCTEEntrega = async function (req, res, next) {

        var sql = 
            `UPDATE G051 SET STINTCLI = 3 WHERE 
            ((STINTCLI IS NULL) OR (STINTCLI < 3)) AND IDG051 = ${req.IDG051}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        var objConn = await this.controller.getConnection(req.objConn);

        return await objConn.execute({ sql, param: [], type: 'UPDATE' })

        .then(async (result) => {
            await objConn.close();
            return result;
        })

        .catch(async (err) => { 
            await objConn.closeRollback();
            throw err;
        });            

    }

    //-----------------------------------------------------------------------\\     

    return api;

}