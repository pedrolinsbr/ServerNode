module.exports = function (app, cb) {
    var api = {};
    var dao = app.src.modDashboard.dao.pibEtmsDAO;
    var moment = require('moment');

    api.buscarIndicadores = async function (req, res, next) {
        try {
            req.body.aux = 0;
            let retorno = await dao.buscar(req, res, next);

            res.status(200).send(retorno);
        } catch (err) {
            res.status(500).send(err);
        }
    };

    api.buscarDados = async function (req, res, next) {
        try {
            req.body.aux = 1;
            let retorno = await dao.buscar(req, res, next);

            res.status(200).send(retorno);
        } catch (err) {
            res.status(500).send(err);
        }
    };

    api.buscarGraficos = async function (req, res, next) {
        try {
            req.body.aux = 2;
            let result = await dao.buscar(req, res, next);

            let retornoDelivery = [
                { TPTRANSP: 'V', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] }, //DELIVERY
                { TPTRANSP: 'LG', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] },
                { TPTRANSP: 'G', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] },
                { TPTRANSP: 'T', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] },
            ];

            let retornoTonelada = [
                { TPTRANSP: 'V', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] }, //DELIVERY
                { TPTRANSP: 'LG', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] },
                { TPTRANSP: 'G', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] },
                { TPTRANSP: 'T', grafico: [{ name: 'No Prazo', value: 0 }, { name: 'Vencido', value: 0 }] },
            ];

            for (let i of retornoDelivery) {
                let aux = result.filter(d => { return d.TPTRANSP_CUSTOM == i.TPTRANSP });
                if (aux.length > 0) {
                    for (let j of aux) {
                        switch (j.SNVENCTO) {
                            case 0:
                                i.grafico[0].value = j.QTDG043;
                                break;
                            case 1:
                                i.grafico[1].value = j.QTDG043;
                                break;
                        };
                    };
                };
            };

            for (let i of retornoTonelada) {
                let aux = result.filter(d => { return d.TPTRANSP_CUSTOM == i.TPTRANSP });
                if (aux.length > 0) {
                    for (let j of aux) {
                        switch (j.SNVENCTO) {
                            case 0:
                                i.grafico[0].value = j.PSBRUTO.toFixed(0);
                                break;
                            case 1:
                                i.grafico[1].value = j.PSBRUTO.toFixed(0);
                                break;
                        };
                    };
                };
            };

            let retorno = [...retornoDelivery, ...retornoTonelada];

            for (let i of retorno) {
                i.total = (parseFloat(i.grafico[0].value) + parseFloat(i.grafico[1].value)).toFixed(0);
            }

            res.status(200).send(retorno);
        } catch (err) {
            res.status(500).send(err);
        }
    };

    api.buscarCalendario = async function (req, res, next) {
        try {
            req.body.aux = 3;
            let result = await dao.buscar(req, res, next);

            let retorno = [];

            for (let i of result) {

                let aux = {
                    name: i.DTVENROT,
                    series: [
                        { name: 'Deliveries', value: i.QTDG043 },
                        { name: 'Toneladas', value: i.PSBRUTO }
                    ]
                }

                retorno.push(aux);

            }

            res.status(200).send(retorno);
        } catch (err) {
            res.status(500).send(err);
        }
    };

    api.buscarBarra = async function (req, res, next) {
        try {
            req.body.aux = 4;
            let result = await dao.buscar(req, res, next);

            let retorno = [
                { TPTRANSP: 'V', grafico: [] },
                { TPTRANSP: 'LG', grafico: [] },
                { TPTRANSP: 'G', grafico: [] },
                { TPTRANSP: 'T', grafico: [] }
            ];

            for (let i of retorno) {
                let aux = result.filter(d => { return d.TPTRANSP_CUSTOM == i.TPTRANSP });
                if (aux.length > 0) {
                    for (let j of aux) {
                        i.grafico.push({ name: j.NMTRANSP, value: j.PSBRUTO });
                    }
                    // for (let j of aux) {
                    //     let inserir = true;
                    //     for (let g of i.grafico) {
                    //         if (g.name == j.NMTRANSP) {
                    //             g.value = g.value + j.PSBRUTO;
                    //             inserir = false;
                    //         };
                    //     };
                    //     if (inserir) i.grafico.push({ name: j.NMTRANSP, value: j.PSBRUTO });
                    // };
                };
            };

            res.status(200).send(retorno);
        } catch (err) {
            res.status(500).send(err);
        }
    };


    return api;
}