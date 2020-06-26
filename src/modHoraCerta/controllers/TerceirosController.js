module.exports = function (app, cb) {
  var api = {};
  var daoSalvar  = app.src.modHoraCerta.dao.SalvarDAO;
  var daoAg2     = app.src.modHoraCerta.dao.Agendamento2DAO;

  api.salvar = async function (req, res, next) {
    try {
      let msgErro = null;
      let blOk    = false;
      req.objConn = await daoSalvar.controller.getConnection();

      if (req.body.IDG031 === undefined || req.body.IDG031 === null || req.body.IDG031 === '') {
        req.body.dadosCarga = {
            CJMOTORI: req.body['CJMOTORI'].replace('.','').replace('.','').replace('-','')
          , NMMOTORI: req.body['NMMOTORI']
          , RGMOTORI: req.body['RGMOTORI']
          , NRCNHMOT: req.body['NRCNHMOT']
          , IDG024  : { id: 15 }
        }

        let motorista = await daoAg2.salvarMotorista(req, res, next); 
        blOk = (motorista.id !== undefined);

        if (blOk) { req.body.IDG031 = motorista.id; };
      } else {
        blOk = true;
      }

      if (req.body.UPDTMOTO) {
        let updatemotorista = await daoAg2.atualizarMotorista(req, res, next).then((result) => 'Ok');
        blOk = (updatemotorista == 'Ok');
        if (!blOk) { msgErro = `Falha ao atualizar cadastro motorista!`; };
      }

      if (blOk) {
        var terceiro = await daoSalvar.inserirTerceiros(req, res, next);
        blOk = (terceiro.id !== undefined);

        if (!blOk) { msgErro = `Falha ao salvar cadastro de terceiros!`; };
      } else {
        msgErro = `Falha ao salvar motorista!`;
      }

      if (blOk) {
        await req.objConn.close();
        res.json(terceiro.id);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }

    } catch (err) {

      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});

    }
  }

  return api;
};
