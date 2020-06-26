module.exports = function (app, cb) {
    var api = {};
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    api.controller = app.config.ControllerBD;

    api.buscar = async function (req, res, next) {

        let con = await this.controller.getConnection(null, req.UserId);
        let verificaDeliverys = await con.execute({
            sql: `
          begin SP_CON_G043_CALEND_COUNT(${req.body.aux}); end; `,

            param: [],
            fetchInfo: [{
                type: "SP"
            }]
        }).then((res) => {
            return res;
        }).catch((err) => {
            throw err;
        });

        await con.close();
        return verificaDeliverys;

    }

    return api;
}