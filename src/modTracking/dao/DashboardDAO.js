/**
 * @module dao/DashboardDAO
 * @description Dao para o dashboard do Tracking.
 * @author Vanessa Souto
 * @since 27/02/2018
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires dao/DashboardDAO
*/

var moment = require('moment');

module.exports = function (app, cb) {

    var api = {};
    var db = app.config.database;

    /*
    * Delivery não entrege, dentro do prazo da DT CONTRATUAL (DTENTCON)
    * DTENTCON é maior que data de hoje
    * */

    api.deliveriesNEntregeNoPrazo = async function (req, res, next) {

        var hoje = moment().format('YYYY-MM-DD');

        return await db.execute(
            {
                sql: `SELECT
                G043.IDG043, G043.CDDELIVE, G043.DTDELIVE, G043.TPDELIVE,
                G043.STDELIVE, G043.NRNOTA, G043.DTEMINOT, G043.DTFINCOL,
                G043.STETAPA, G043.DTENTREG, G043.STULTETA, G043.DTENTCON
            FROM
                G043 G043
            WHERE
                TRUNC( G043.DTENTCON ) >= TO_DATE( '${hoje}', 'yyyy-mm-dd' )
                AND G043.DTENTREG IS NULL
                AND G043.SNDELETE = 0`,

                param: []
            })
            .then((result) => {

                return result;
            })
            .catch((err) => {

                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });
    }


    api.deliveriesGrafico10dias = async function (req, res, next) {
        var dataFinal = await moment().format('YYYY-MM-DD');
        var dataInicial = await moment().subtract(30, 'days').format('YYYY-MM-DD');

        if (typeof req.body.data_inicial !== 'undefined' && req.body.data_inicial !== '') {
            dataInicial = req.body.data_inicial;
            dataFinal = req.body.data_final;
        }

        return await db.execute(
            {
                sql: `SELECT
                G043.IDG043, G043.CDDELIVE, TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') DTDELIVE, G043.TPDELIVE,
                G043.STDELIVE, G043.STETAPA, TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') DTENTREG, TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') DTENTCON
            FROM
                G043 G043
            WHERE
                TO_DATE( G043.DTDELIVE ) BETWEEN TO_DATE( '${dataInicial}', 'yyyy-mm-dd')
                AND TO_DATE( '${dataFinal}', 'yyyy-mm-dd')
                AND G043.SNDELETE = 0 
                AND G043.STDELIVE != 'D'
                ORDER BY G043.DTENTCON`,
                param: []
            })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });
    }

    /*
    * Deliveries não entrege, em atraso
    * Delivery não entrege, fora do prazo da DT CONTRATUAL (DTENTCON)
    * DTENTCON é anterior que data de hoje
    * */

    api.deliveriesNEntregeForaPrazo = async function (req, res, next) {

        var hoje = moment().format('YYYY-MM-DD');

        return await db.execute(
            {
                sql: `SELECT
                G043.IDG043, G043.CDDELIVE, G043.DTDELIVE, G043.TPDELIVE,
                G043.STDELIVE, G043.NRNOTA, G043.DTEMINOT, G043.DTFINCOL,
                G043.STETAPA, G043.DTENTREG, G043.STULTETA, G043.DTENTCON
            FROM
                G043 G043
            WHERE
                TRUNC( G043.DTENTCON ) <= TO_DATE( '${hoje}', 'yyyy-mm-dd' )
                AND G043.DTENTREG IS NULL
                AND G043.SNDELETE = 0`,

                param: []
            })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });

    }

    api.totalDeliveriesSistema = async function (req, res, next) {
        return await db.execute(
            {
                sql: `SELECT
                count(*) "total_deliveries"
            FROM
                G043 G043
            WHERE
                G043.SNDELETE = 0`,

                param: []
            })
            .then((result) => {
                //console.log(result);
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });
    }

    api.deliveriesEntregeForaPrazo = async function () {

        return await db.execute(
            {
                sql: `SELECT
                G043.IDG043, G043.CDDELIVE, G043.DTDELIVE, G043.TPDELIVE,
                G043.STDELIVE, G043.NRNOTA, G043.DTEMINOT, G043.DTFINCOL,
                G043.STETAPA, G043.DTENTREG, G043.STULTETA, G043.DTENTCON
            FROM
                G043 G043
            WHERE
                G043.DTENTCON <= G043.DTENTREG
                AND G043.DTENTREG IS NOT NULL
                AND G043.SNDELETE = 0`,

                param: []
            })
            .then((result) => {
                //console.log(result);
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });
    }

    api.totalDeliveriesEntregeForaPrazo = async function () {
        return await db.execute(
            {
                sql: `SELECT
                count(*) "total_deliveries"
            FROM
                G043 G043
            WHERE
             G043.DTENTCON <= G043.DTENTREG
                AND G043.DTENTREG IS NOT NULL	
                AND G043.SNDELETE = 0`,

                param: []
            })
            .then((result) => {
                //console.log(result);
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });
    }
    api.totalDeliveriesEntregeDentroPrazo = async function () {
        return await db.execute(
            {
                sql: `SELECT
                count(*) "total_deliveries"
            FROM
                G043 G043
            WHERE
             G043.DTENTCON >= G043.DTENTREG
                AND G043.DTENTREG IS NOT NULL	
                AND G043.SNDELETE = 0`,

                param: []
            })
            .then((result) => {
                //console.log(result);
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
                //err.stack = new Error().stack + `\r\n` + err.stack;
                //throw err;
            });
    }

    /*
    * Análise das Cargas por transportadora
    * */

    api.deliveriesPorTransportadora = async function (req, res, next) {
        if (typeof req.body.transp_id == 'undefined' || req.body.transp_id == '') {
            req.body.transp_id = 9
        }

        var dataFinal = await moment().format('YYYY-MM-DD');
        var dataInicial = await moment().subtract(30, 'days').format('YYYY-MM-DD');

        if (typeof req.body.data_inicial !== 'undefined' && req.body.data_inicial !== '') {
            dataInicial = req.body.data_inicial;
            dataFinal = req.body.data_final;
        }

        //console.log('transp_id', req.body.transp_id);

        return await db.execute(
            {
                sql: `SELECT
                        G043.DTENTREG, G043.DTENTCON
                    FROM
                        G046
                    INNER JOIN G048 ON
                        G048.IDG046 = G046.IDG046
                    INNER JOIN G049 ON
                        G049.IDG048 = G048.IDG048
                    INNER JOIN G043 ON
                        G043.IDG043 = G049.IDG043
                    WHERE
                        TO_DATE( G043.DTDELIVE ) BETWEEN TO_DATE( '${dataInicial}', 'yyyy-mm-dd')
                        AND TO_DATE( '${dataFinal}', 'yyyy-mm-dd')
                        AND G046.SNDELETE = 0
                        AND G046.IDG024 = ${req.body.transp_id}
                        AND G043.SNDELETE = 0
                        AND G043.STDELIVE != 'D'
                    GROUP BY
                        G043.IDG043,
                        G043.DTENTREG,
                        G043.DTENTCON`,
                param: []
            })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
            });
    }

    api.transportadoras = async function (req, res, next) {
        return await db.execute(
            {
                sql: `SELECT 
                        G024.IDG024, G024.NMTRANSP 
                    FROM G024 G024 
                    WHERE G024.SNDELETE = 0 
                    ORDER BY G024.NMTRANSP`,
                param: []
            })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
            });
    }

    api.totalCargasPorTransportadora = async function (req, res, next) {

        var dataFinal = await moment().format('YYYY-MM-DD');
        var dataInicial = await moment().subtract(30, 'days').format('YYYY-MM-DD');

        if (typeof req.body.data_inicial !== 'undefined' && req.body.data_inicial !== '') {
            dataInicial = req.body.data_inicial;
            dataFinal = req.body.data_final;
        }

        //console.log('dataInicial', dataInicial);
        //console.log('dataFinal', dataFinal);

        return await db.execute(
            {
                sql: `SELECT
                        G024.IDG024,
                        G024.NMTRANSP,
                        (
                            SELECT
                                COUNT( G046.IDG046 )
                                FROM G046 G046
                            WHERE
                                G046.IDG024 = G024.IDG024
                                AND TO_DATE( G046.DTCARGA ) BETWEEN TO_DATE( '${dataInicial}', 'yyyy-mm-dd')
                                AND TO_DATE( '${dataFinal}', 'yyyy-mm-dd')
                                AND G046.SNDELETE = 0
                        ) AS TOTAL_CARGAS
                        FROM
                            G024 G024 
                        WHERE G024.SNDELETE = 0
                        ORDER BY G024.NMTRANSP`,
                param: []
            })
            .then((result) => {
                //console.log(result);
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
            });
    }

    api.totalDeliveriesPorTransportadora = async function(req, res, next){
        var dataFinal = await moment().format('YYYY-MM-DD');
        var dataInicial = await moment().subtract(30, 'days').format('YYYY-MM-DD');

        if (typeof req.body.data_inicial !== 'undefined' && req.body.data_inicial !== '') {
            dataInicial = req.body.data_inicial;
            dataFinal = req.body.data_final;
        }

        //console.log('dataInicial totalDeliverie', dataInicial);
        //console.log('dataFinal totalDeliverie', dataFinal);

        return await db.execute(
            {
                sql: `SELECT 
                            G024.IDG024
                        ,    G024.NMTRANSP
                        ,    COUNT(DISTINCT (G043.IDG043)) TOTAL_DELIVERIES
                    
                    FROM G046 --CARGA
                    
                    INNER JOIN G024 -- TRANSP
                        ON G024.IDG024 = G046.IDG024
                    
                    INNER JOIN G048 -- PARADAS
                        ON G048.IDG046 = G046.IDG046
                    
                    INNER JOIN G049 -- DELIVERIES x PARADA
                        ON G049.IDG048 = G048.IDG048
                    
                    INNER JOIN G043 -- DELIVERIES
                        ON G043.IDG043 = G049.IDG043
                        
                    WHERE 
                    TO_DATE( G043.DTDELIVE ) BETWEEN TO_DATE( '${dataInicial}', 'yyyy-mm-dd')
                    AND TO_DATE( '${dataFinal}', 'yyyy-mm-dd')
                    AND G043.SNDELETE = 0
                    AND G046.SNDELETE = 0    
                    GROUP BY 
                            G024.IDG024
                        ,   G024.NMTRANSP
                    ORDER BY
                            G024.NMTRANSP`,
                param: []
            })
            .then((result) => {
                //console.log('total Deliveries por Transp',result);
                return result;
            })
            .catch((err) => {
                //console.log(err);
                return err;
            });
    }

    return api;

}