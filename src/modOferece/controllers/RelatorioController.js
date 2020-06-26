module.exports = function (app, cb) {

    const dao = app.src.modOferece.dao.RelatorioDAO;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.distribuicao = async function (req, res, next) {

        await dao.listarDistribuicao(req, res, next)
            .then((result) => {

                var arSaida = [];

                if (result.length > 0) {

                    do {

                        var idRegra = result[0].IDO008;

                        var objRegra =
                            {
                                  IDO008: result[0].IDO008
                                , DSREGRA: result[0].DSREGRA
                                , LOADTRUCK: result[0].LOADTRUCK
                                , TPOPERAC: result[0].TPOPERAC
                                , CDESTADO: result[0].CDESTADO
                                , NMCIDADE: result[0].NMCIDADE
                                , NMCLIENT: result[0].NMCLIENT
                                , TTGERAL: result[0].TTGERAL
                                , ARDISTRI: []
                            };

                        do {

                            var objDist =
                                {
                                      IDO009: result[0].IDO009
                                    , NMTRANSP: result[0].NMTRANSP
                                    , PCATENDE: result[0].PCATENDE
                                    , TTCARGA: result[0].TTCARGA
                                    , PCREAL: ((result[0].TTCARGA / result[0].TTGERAL) * 100)
                                };

                            objRegra.ARDISTRI.push(objDist);

                            result.shift();

                        } while ((result.length > 0) && (idRegra == result[0].IDO008));

                        arSaida.push(objRegra);

                    } while (result.length > 0);

                }

                res.status(200).send(arSaida);
            })

            .catch((err) => {
                next(err);
            });
    }

    //-----------------------------------------------------------------------\\ 

    api.realizado = async function (req, res, next) {

        await dao.listarRealizado(req, res, next)
            .then((rs) => {

                var arSaida = [];

                if (rs.length > 0) {

                    do {

                        var idArmazem = rs[0].IDG028;
                        var idCidade  = rs[0].IDG003;

                        var objI = 
                            {                         
                                NMARMAZE: rs[0].NMARMAZE, 
                                CDESTADO: rs[0].CDESTADO,
                                NMCIDADE: rs[0].NMCIDADE,
                                TTGERAL:  rs[0].TTGERAL,
                                TTREGRA:  rs[0].TTREGRA,
                                ARREGRA:  [],
                                ARGERAL:  []
                            };


                        do {

                            var objG = 
                                {
                                    NMTRANSP: rs[0].NMTRANSR,
                                    TTCARGA:  rs[0].TTCARGA,
                                };

                            var objT = Object.assign({ PCPROP: parseFloat(((rs[0].TTCARGA / rs[0].TTGERAL) * 100).toFixed(2))}, objG);
                            var objR = Object.assign({ PCPROP: parseFloat(((rs[0].TTCARGA / rs[0].TTREGRA) * 100).toFixed(2))}, objG);

                            objI.ARGERAL.push(objT);
                            if (rs[0].BLREGRA == 1) objI.ARREGRA.push(objR);

                            rs.shift();

                        } while ((rs.length > 0) && 
                                 (idArmazem == rs[0].IDG028) && 
                                 (idCidade == rs[0].IDG003));

                        if (objI.ARREGRA.length == 0) objI.TTREGRA = 0;

                        arSaida.push(objI);

                    } while (rs.length > 0);    

                }

                res.status(200).send(arSaida);
                
            })

            .catch((err) => {
                next(err);
            });
    }

    //-----------------------------------------------------------------------\\ 

    api.recusada = async function (req, res, next) {

        await dao.listarRecusa(req, res, next)
        .catch((err) => { next(err) })
        .then((result) => {
            res.status(200).send(result);
        });
                
    }

    //-----------------------------------------------------------------------\\ 

    return api;
}