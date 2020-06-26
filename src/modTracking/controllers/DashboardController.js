module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modTracking.dao.DashboardDAO;

    api.index = async function (req, res, next) {

        var deliveriesGrafico = await dao.deliveriesGrafico10dias(req, res, next).then(
            (result) => {
                return result;
            }
        ).catch(
            (err) => {
                return err;
            }
        );


        var totalDeliveriesSistema = await dao.totalDeliveriesSistema(req, res, next).then(
            (result) => {
                return result[0].total_deliveries;
            }
        ).catch(
            (err) => {
                return err;
            }
        )

        var totalDeliveriesEntregeForaPrazo = await dao.totalDeliveriesEntregeForaPrazo(req, res, next).then(
            (result) => {
                return result[0].total_deliveries;
            }
        ).catch(
            (err) => {
                return err;
            }
        )

        var totalDeliveriesEntregeDentroPrazo = await dao.totalDeliveriesEntregeDentroPrazo(req, res, next).then(
            (result) => {
                return result[0].total_deliveries;
            }
        ).catch(
            (err) => {
                return err;
            }
        )

        var deliveriesGrafico3 = await dao.deliveriesPorTransportadora(req, res, next).then(
            (result) => {
                return result;
            }
        ).catch(
            (err) => {
                return err;
            }
        );

        var total_cargas_por_transportadora = await dao.totalCargasPorTransportadora(req, res, next).then(
            (result) => {
                return result;
            }
        ).catch(
            (err) => {
                return err;
            }
        )

        var total_deliveries_por_transportadora = await dao.totalDeliveriesPorTransportadora(req, res, next).then(
            (result) => {
                return result;
            }
        ).catch(
            (err) => {
                return err;
            }
        )

        var total_deliveries_nao_entrege = totalDeliveriesSistema - (totalDeliveriesEntregeDentroPrazo + totalDeliveriesEntregeForaPrazo)

        return await res.json(
            {
                total_cargas_por_transportadora: total_cargas_por_transportadora,
                deliveriesGrafico3: deliveriesGrafico3,
                deliveriesGrafico1: deliveriesGrafico,
                total_deliveries_nao_entrege: total_deliveries_nao_entrege,
                total_deliveries_entrege_no_prazo: totalDeliveriesEntregeDentroPrazo,
                total_deliveries_entrege_fora_prazo: totalDeliveriesEntregeForaPrazo,
                total_deliveries_sistema: totalDeliveriesSistema,
                total_deliveries_por_transportadora: total_deliveries_por_transportadora
            }
        );
    }

    api.graficoDeliveriesDias = async function (req, res, next) {
        return await dao.deliveriesGrafico10dias(req, res, next).then(
            (result) => {
                return res.json(result);
            }
        ).catch(
            (err) => {
                return res.json(err);
            }
        );
    }

    api.graficoDeliveriesPorTransportadora = async function (req, res, next) {
        return await dao.deliveriesPorTransportadora(req, res, next).then(
            (result) => {
                return res.json(result);
            }
        ).catch(
            (err) => {
                return res.json(err);
            }
        );
    }

    api.totalCargasPorTransportadora = async function (req, res, next) {
        return await dao.totalCargasPorTransportadora(req, res, next).then(
            (result) => {
                return res.json(result);
            }
        ).catch(
            (err) => {
                return res.json(err);
            }
        )
    }

    api.transportadoras = async function (req, res, next) {
        return await dao.transportadoras(req, res, next).then(
            (result) => {
                return res.json(result);
            }
        ).catch(
            (err) => {
                return res.json(err);
            }
        );
    }

    api.totalDeliveriesPorTransportadora = async function (req, res, next) {
        return await dao.totalDeliveriesPorTransportadora(req, res, next).then(
            (result) => {
                return res.json(result);
            }
        ).catch(
            (err) => {
                return res.json(err);
            }
        )
    }

    return api;
}