module.exports = function (app, cb) {

    var api = {};
    var db = app.config.database;

    api.itens = async function (req, res, next) {
    
        var idDelivery = req.params.id;

        return await db.execute(
            {
                sql: `Select 
                            G045.IDG045, G045.IDG043, G045.IDG010, G045.VRUNIPRO,
                            G045.NRORDITE, G045.DSREFFAB, G045.NRONU, G045.DSPRODUT, 
                            G045.IDG009PS, G045.PSBRUTO, G045.IDG009UM, G045.VRVOLUME
              From G045 G045
              Where G045.IDG043 = `+idDelivery + ` AND SNDELETE = 0`,
                param: []
            })

            .then((result) => {
                return (result);
            })

            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    }

    return api;

};
