module.exports = function (app, cb) {

    const tmz    = app.src.utils.DataAtual;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
    const cdao   = app.src.modLogisticaReversa.dao.CancelamentoDAO;
    const dao    = app.src.modLogisticaReversa.dao.Devolucao4plDAO;
    const ctl3pl = app.src.modLogisticaReversa.controllers.Devolucao3plController;
    
    var api = {};

    //-----------------------------------------------------------------------\\

    api.cancelarCargaDev = async function (req, res, next) {

        try {

            if ((req.body.IDG046) && (req.body.IDS001)) {

                var parm = { IDG046: req.body.IDG046, IDS001: req.body.IDS001, OBCANCEL: req.body.OBCANCEL};

                parm.DTCANCEL = tmz.formataData(tmz.dataAtualJS(), 'YYYY-MM-DD HH:mm:ss');
                parm.objConn  = await dao.controller.getConnection();

                await cdao.cancelarCargaDev(parm, res, next);

                await cdao.cancelarDeliveryDev(parm, res, next);

                await cdao.setASNDeleteFlag(parm, res, next);

                await cdao.insereEventoCancela(parm, res, next);
                
                await parm.objConn.close();

                res.status(200).send({ blOK: true, error: null });

            } else {

                res.status(400).send({ blOK: false, error: 'Parâmetros incorretos'})

            }

        } catch (err) {

            res.status(500).send({ error: err.message });

        }


    }

    //-----------------------------------------------------------------------\\

    api.inserirProtocolo = async function (req, res, next) {

        try {            

            if ((req.body.IDG043) &&
                (req.body.IDG046) &&
                (req.body.IDI007) &&
                (req.body.TTCONTAT) && 
                (req.body.NRPROTOC)) {

                var objConn = await dao.controller.getConnection();

                var parm = { objConn, nmTabela: 'G043' };
    
                parm.idTabela = req.body.IDG043;
                parm.NRPROTOC = req.body.NRPROTOC;
    
                var arValores = await fldAdd.inserirValoresAdicionais(parm, res, next);

                parm.IDG043 = parm.idTabela;
                await dao.setFlagASN(parm, res, next);
                
                parm.IDI007   = req.body.IDI007;
                parm.IDG046   = req.body.IDG046;
                parm.TTCONTAT = req.body.TTCONTAT;
                parm.DTREGIST = tmz.dataAtualJS();

                var objVal = await ctl3pl.insereMSCCD(parm, res, next);

                if (objVal.blOK) {
                    
                    var cdStatus = 200;
                    await objConn.close();
                    
                } else {

                    var cdStatus = 400;
                    await objConn.closeRollback();

                }

                res.status(cdStatus).send({ blOK: objVal.blOK, error: objVal.strErro });

            } else {

                res.status(400).send({ blOK: false, error: 'Parâmetros incorretos'})

            }
                
        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.selecionar3pl = async function (req, res, next) {

        try {

            var objRet = {};
            var rs = await dao.selecionar3pl(req, res, next);

            if (rs.length == 0) {

                var cdStatus = 400;
                objRet.error = 'Nenhum registro encontrado';

            } else {

                var cdStatus = 200;
                objRet.error = null;

            }

            objRet.rs = rs;

            res.status(cdStatus).send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.cardsDevolucao4pl = async function (req, res, next) {

        await dao.cardsDevolucao4pl(req, res, next)
        .then((result) => {
            result.map(d => {if(d.STCARGA === 'D' && d.TTREGISTRO > 0) d.TTREGISTRO = d.TTREGISTRO - 2});
            res.send(result);
        })
        .catch((err) => {
            res.status(500).send({ error: err.message });
        });

    }

    //-----------------------------------------------------------------------\\

    api.listarDevolucao4pl = async function (req, res, next) {

        await dao.listarDevolucao4pl(req, res, next)
        .then((result) => {
            res.status(200).send(result);
        })
  
        .catch((err) => {
            res.status(500).send({ error: err.message });
        });

    }

    //-----------------------------------------------------------------------\\

    api.alterarEtapaDelivery = async function (req, res, next) {

        await dao.alterarEtapaDelivery(req, res, next)
        .then((result) => {
            res.status(200).send({blOK: true});
        })
  
        .catch((err) => {
            res.status(500).send({ error: err.message });
        });        

    }

    //-----------------------------------------------------------------------\\
      
    return api;

}