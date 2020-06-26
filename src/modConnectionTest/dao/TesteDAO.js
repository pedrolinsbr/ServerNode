module.exports = function (app) {
    var api = {};
    api.controller = app.config.ControllerBDV6;

    api.testeConnection = async function (req, res, next) {
        try {
            let con = await this.controller.openDB({ con: null, user: null });
            await this.controller.addNivel({ con });
            let sql = `
                SELECT *
                FROM S025
            `;
            await con.execute({ sql, param: [] })
                .then(async result => {
                    return result;
                })
                .catch(async (err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw (err);
                });
            await con.execute({ sql, param: [] })
                .then(async result => {
                    return result;
                })
                .catch(async (err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw (err);
                });

            return true;
        } catch (error) {
            console.log(error)
        }
    }


    return api;
}