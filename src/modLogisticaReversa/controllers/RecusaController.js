module.exports = function (app, cb) {

    var dao = app.src.modLogisticaReversa.dao.RecusaDAO;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
  
  
    var api = {};
  
    //-----------------------------------------------------------------------\\  

api.cardsRecusa = async function (req, res, next) {
    await dao.cardsRecusa(req, res, next)
      .then(result => {
        let temp = [5, 21, 22, 23]; // []

        temp = temp.map((dataMap) => {
          return result.filter(dataFilter => {
            return dataFilter.filtParam == dataMap
          })[0];
        });

        result = temp;
        res.json(result);
      })
      .catch(err => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  
	/**
    * @description Realiza a busca dos dados da delivery
    *
    * @async 
    * @function listar
    * @returns {Object} Retorna um objeto contendo todos os dados da delivery  
    *
    * @author Ítalo Andrade Oliveira
    * @since 19/07/2018
    */
    api.listar = async (req, res, next) => {
        await dao.listar(req, res, next)
            .then(result => {
                res.status(200).send(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }
}

    //-----------------------------------------------------------------------\\
	/**
    * @description Realiza a busca dos dados da delivery
    *
    * @async 
    * @function buscar
    * @returns {Object} Retorna um objeto contendo todos os dados da delivery, contendo dentro deles os itens e lotes 
    *
    * @author Ítalo Andrade Oliveira
    * @since 18/07/2018
    */
    api.buscar = async (req, res, next) => {

        return await dao.buscar(req, res, next)
            .then((result) => {
                let listaG045 = [];
                let listaRetorno = [];
                let corrente;
                for (let i = 0; i < result.length; i++) {
                    corrente = result[i];

                    if (listaG045.length == 0) {
                        listaG045.push({
                            IDG043: corrente.IDG043,
                            IDG045: corrente.G045_IDG045,
                            IDG010: corrente.G045_IDG010,
                            IDG009PS: corrente.G045_IDG009PS,
                            IDG009UM: corrente.G045_IDG009UM,
                            NRORDITE: corrente.G045_NRORDITE,
                            NRONU: corrente.G045_NRONU,
                            VRUNIPRO: corrente.G045_VRUNIPRO.toFixed(2),
                            selecionado: false,
                            novoLote: false,
                            cancelado: false,
                        });
                    } else {
                        let procurarDado = listaG045.filter(d => {
                            return d.IDG045 == corrente.G045_IDG045;
                        });
                        if (procurarDado.length > 0) {

                        } else {
                            listaG045.push({
                                IDG043: corrente.IDG043,
                                IDG045: corrente.G045_IDG045,
                                IDG010: corrente.G045_IDG010,
                                IDG009PS: corrente.G045_IDG009PS,
                                IDG009UM: corrente.G045_IDG009UM,
                                NRORDITE: corrente.G045_NRORDITE,
                                NRONU: corrente.G045_NRONU,
                                VRUNIPRO: corrente.G045_VRUNIPRO.toFixed(2),
                                selecionado: false,
                                novoLote: false,
                                cancelado: false,
                            });
                        }
                    }
                }

                for (let i = 0; i < listaG045.length; i++) {
                    corrente = listaG045[i];
                    listaG045[i].lote = result.filter(d => {
                        return d.G045_IDG045 == corrente.IDG045
                    }).map(d => {
                        return {
                            IDG043: corrente.IDG043,
                            IDG045: corrente.IDG045,
                            IDG050: d.G050_IDG050,
                            QTPRODUT: d.G050_QTPRODUT,
                            DSLOTE: d.G050_DSLOTE,
                            cancelado: false,
                            parcial: false,
                            qtdRecusado: d.G050_QTPRODUT
                        };
                    })
                }

                listaRetorno.push({
                    IDG043: result[0].IDG043,
                    IDS001: result[0].IDS001,
                    IDG014: result[0].IDG014,
                    IDG005RE: result[0].IDG005RE,
                    IDG005DE: result[0].IDG005DE,
                    IDG009PS: result[0].IDG009PS,
                    CDDELIVE: result[0].CDDELIVE,
                    TPDELIVE: result[0].TPDELIVE,
                    STDELIVE: result[0].STDELIVE,
                    SNINDSEG: result[0].SNINDSEG,
                    STETAPA: result[0].STETAPA,
                    STULTETA: result[0].STULTETA,
                    SNLIBROT: result[0].SNLIBROT,
                    CDPRIORI: result[0].CDPRIORI,
                    DTDELIVE: result[0].DTDELIVE,
                    DTLANCTO: result[0].DTLANCTO,
                    DTFINCOL: result[0].DTFINCOL,
                    DTENTCON: result[0].DTENTCON,
                    NRNOTA: result[0].NRNOTA,
                    NREMBSEC: result[0].NREMBSEC,
                    PSBRUTO: result[0].PSBRUTO,
                    PSLIQUID: result[0].PSLIQUID,
                    VRVOLUME: result[0].VRVOLUME,
                    VRDELIVE: result[0].VRDELIVE.toFixed(2),
                    G009_DSUNIDAD: result[0].G009_DSUNIDAD, 
                    G009_CDUNIDAD: result[0].G009_CDUNIDAD, 
                    REMET_IDG005: result[0].REMET_IDG005,
                    REMET_NMCLIENT: result[0].REMET_NMCLIENT,
                    DESTI_IDG005: result[0].DESTI_IDG005,
                    DESTI_NMCLIENT: result[0].DESTI_NMCLIENT,
                    G014_DSOPERAC: result[0].G014_DSOPERAC,
                    TPTRANSP: result[0].TPTRANSP,
                    item: listaG045
                })


                res.status(200).send(listaRetorno);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    return api;
}
