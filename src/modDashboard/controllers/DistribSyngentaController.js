module.exports = function (app, cb) {

    var api = {};
    var dao = app.src.modDashboard.dao.DistribSyngentaDAO;

    var moment = require('moment');

    api.buscarDistrib = async function (req, res, next) {

        try {
            req.objConn = await dao.controller.getConnection();

            let result = { distrib: [] };

            req.body.current = `AND TO_CHAR(G043.DTEMINOT,'YYYY-MM') =  TO_CHAR(CURRENT_DATE, 'YYYY-MM')`;

            req.body.date = ``;

            if (req.body.dataInicial && req.body.dataFinal) {
                req.body.date = `AND TRUNC(G043.DTEMINOT) >= TO_DATE('${req.body.dataInicial}' , 'YYYY-MM-DD')
                               AND TRUNC(G043.DTEMINOT) <= TO_DATE('${req.body.dataFinal}' , 'YYYY-MM-DD')`
                req.body.current = ``;
            }

            let day;
            let month;
            let year;
            let nextMonth;

            if (req.body.dataProdutos) {
                let dia = String(req.body.dataProdutos.day);
                let mes = String(req.body.dataProdutos.month);
                let ano = String(req.body.dataProdutos.year);
                let data = moment(`${ano}-${mes}-${dia}`).format('YYYY-MM-DD')
                day = moment(data).format('DD');
                month = moment(data).format('MM');
                year = moment(data).format('YYYY');
                nextMonth = moment(data).add(1, 'months').format('MM');
            } else {
                day = moment().format('DD');
                month = moment().format('MM');
                year = moment().format('YYYY');
                nextMonth = moment().add(1, 'months').format('MM');
            }


            req.body.aux = "AND G043.DTENTREG IS NOT NULL"
            let distribEntregue = await dao.buscarDistrib(req, res, next);
            result.distrib = distribEntregue;

            req.body.aux = "AND G043.DTENTREG IS NULL"
            let distribTransito = await dao.buscarDistrib(req, res, next);
            for (let t of distribTransito) {
                result.distrib.push(t);
            }

            let produtos = [];

            req.body.DTINIPER = `${year}-${month}-01 00:00:00`;
            req.body.DTFINPER = `${year}-${month}-08 00:00:00`;

            let listProd1 = await dao.buscarProdutosDistrib(req, res, next);
            produtos = [...produtos, ...listProd1];

            if (parseInt(day) > 7) {
                req.body.DTINIPER = `${year}-${month}-08 00:00:00`;
                req.body.DTFINPER = `${year}-${month}-15 00:00:00`;

                let listProd2 = await dao.buscarProdutosDistrib(req, res, next);
                produtos = [...produtos, ...listProd2];
            }

            if (parseInt(day) > 14) {
                req.body.DTINIPER = `${year}-${month}-15 00:00:00`;
                req.body.DTFINPER = `${year}-${month}-22 00:00:00`;

                let listProd3 = await dao.buscarProdutosDistrib(req, res, next);
                produtos = [...produtos, ...listProd3];
            }

            if (parseInt(day) > 21) {

                req.body.DTINIPER = `${year}-${month}-22 00:00:00`;
                req.body.DTFINPER = `${year}-${nextMonth}-01 00:00:00`;

                let listProd4 = await dao.buscarProdutosDistrib(req, res, next);
                produtos = [...produtos, ...listProd4];
            }

            result.distrib.map(distrib => {
                return distrib.PRODUTOS = produtos.filter(produto => { return produto.IDG043 == distrib.IDG043; });
            });

            res.status(200).send(result);

        } catch (err) {
            res.status(500).send({ message: `Erro ao buscar dados` });
        }

    }

    return api;
}
