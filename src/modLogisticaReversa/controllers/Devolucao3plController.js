module.exports = function (app, cb) {

    const tmz    = app.src.utils.DataAtual;
    const fmt    = app.src.utils.Formatador;
    const dao    = app.src.modLogisticaReversa.dao.Devolucao3plDAO;
    const ctlms  = app.src.modDocSyn.controllers.MSController;
    const mdl    = app.src.modLogisticaReversa.models.ContatoModel;
    
    var api = {};

    //-----------------------------------------------------------------------\\

    api.checkConfirmaColeta = function (req, res, next) {

        var parm = { post: req.body, model: mdl.putConfirmaColeta.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\

    api.checkContato = function (req, res, next) {

        var parm = { post: req.body, model: mdl.postContato };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\

    api.checkEdicao = function (req, res, next) {

        var parm = { post: req.body, model: mdl.postEdicao.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\

    api.listarHistContato = async function (req, res, next) {

        try {

            var rs = await dao.listarHistContato(req, res, next);

            if (rs.length == 0) {
                var cdStatus = 400;
                var error = 'Nenhum registro encontrado';
                
            } else {
                var cdStatus = 200;
                var error = null;
            }

            res.status(cdStatus).send({ rs, error });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }
    }

    //-----------------------------------------------------------------------\\

    api.confirmarColeta = async function (req, res, next) {

        try {

            var parm = { IDG046: req.body.IDG046, STETAPA: 24 };
            parm.DTSAICAR = tmz.formataData(tmz.dataAtualJS(), 'DD-MM-YYYY HH:mm');

            parm.objConn = await dao.controller.getConnection();

            await dao.controller.setConnection(parm.objConn);
            await dao.confirmarColeta(parm, res, next);

            await dao.alteraDadosDelivery(parm, res, next);

            await parm.objConn.close();

            res.send({ blOK: true, error: null });
    
        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.editarDadosCarga = async function (req, res, next) {

        try {

            var parm = { post: req.body };

            parm.objConn = await dao.controller.getConnection();

            await api.atualizaDadosCarga(parm, res, next);

            await parm.objConn.close();

            res.send({ blOK: true });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    
    api.atualizaDadosCarga = async function (req, res, next) {

        try {

            req.post.DTPRESAI = tmz.retornaData(req.post.DTPRESAI, 'YYYY-MM-DD HH:mm');
            req.post.DTAGENDA = tmz.dataAtualJS();

            var objVal   = fmt.checaEsquema(req.post, mdl.carga.columns);
            var objDados = fmt.setSchema(mdl.carga, objVal.value);
            objDados.objConn = req.objConn;

            await dao.controller.setConnection(objDados.objConn);
            await dao.alterar(objDados, res, next);

            var objDados = { objConn: req.objConn, STETAPA: 23 };
            objDados.IDG046 = req.post.IDG046;
            objDados.IDI015 = req.post.IDI015;

            await dao.alteraDadosDelivery(objDados, res, next);    

            objDados.STINTCLI = 0;            
            await dao.alteraStatusParada(objDados, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereCabecalho = async function (req, res, next) {

        try {

            req.post.DTFIM    = req.post.DTREGIST;
            req.post.IDSOLIDO = req.post.IDS001RE;
            
            var objVal = fmt.checaEsquema(req.post, mdl.A001.columns);

            var objDados = { objConn: req.objConn, model: mdl.A001, value: objVal.value };

            return await this.insere(objDados, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereDetalheContato = async function (req, res, next) {

        try {

            req.post.DTMOVIME = tmz.dataAtualJS();
    
            var objVal = fmt.checaEsquema(req.post, mdl.A003.columns);

            var objDados = { objConn: req.objConn, model: mdl.A003, value: objVal.value };

            return await this.insere(objDados, res, next);
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.insereRelDelivery = async function (req, res, next) {

        try {

            var objVal = fmt.checaEsquema(req.post, mdl.A005.columns);
    
            var objDados = { objConn: req.objConn, model: mdl.A005, value: objVal.value };
    
            return await this.insere(objDados, res, next);    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    api.insereMSCCD = async function (req, res, next) {

        try {
            
            var parm       = { objConn: req.objConn, arDados: [] };
            var objMS      = { MSTYPE: 'CCD', IDG048: req.post.IDG048, DTALTEVE: req.post.DTREGIST };
            objMS.STPROPOS = (req.post.TTCONTAT == 0) ? 'C':'A';

            if (req.post.IDI007) objMS.IDI007 = req.post.IDI007;                

            parm.arDados.push(objMS);

            var objVal = await ctlms.insereMS(parm, res, next);

            objVal.blOK = (objVal.strErro == null);

            return objVal;

        } catch (err) {

            throw err;

        }

    }    

    //-----------------------------------------------------------------------\\

    api.registrarContato = async function (req, res, next) {

        try {

            var parm = { post: req.body };
            parm.objConn = await dao.controller.getConnection();

            var arRS = await dao.buscaDadosContato(parm, res, next);

            while (arRS.length > 0) {

                parm.post.DTREGIST = tmz.retornaData(parm.post.DTREGIST, 'YYYY-MM-DD HH:mm');

                parm.post.IDG046   = arRS[0].IDG046;
                parm.post.IDG048   = arRS[0].IDG048;
                parm.post.IDG024   = arRS[0].IDG024;
                parm.post.IDG043   = arRS[0].IDG043;
                parm.post.TTCONTAT = arRS[0].TTCONTAT;

                parm.post.IDA001   = await api.insereCabecalho(parm, res, next);

                await api.insereDetalheContato(parm, res, next);

                await api.insereRelDelivery(parm, res, next);

                await api.insereMSCCD(parm, res, next);

                if (parm.post.DTPRESAI === undefined) {
                    await dao.atualizaRC(parm, res, next);
                } else {
                    parm.post.IDG046 = [parm.post.IDG046];
                    await api.atualizaDadosCarga(parm, res, next);
                }

                arRS.shift();

            }

            await parm.objConn.close();
            
            res.send({ blOK: true });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 

    api.insere = async function (req, res, next) {

        try { 

            var objIns = fmt.setSchema(req.model, req.value);
            objIns.objConn = req.objConn;

            await dao.controller.setConnection(objIns.objConn);    
            var objRet = await dao.inserir(objIns, res, next);
    
            return objRet.id;
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    api.cardsDevolucao3pl = async function (req, res, next) {

        try {

            var rs = await dao.cardsDevolucao3pl(req, res, next)
            res.send(rs);
    
        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.listarDevolucao3pl = async function (req, res, next) {

        try {

            var rs = await dao.listarDevolucao3pl(req, res, next);
            res.send(rs);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}