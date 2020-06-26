module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTracking.dao.QmNotificationDAO;

  api.receiveNotification = async function (req, res, next) {
    await dao.receiveNotification(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        return err;
        //err.stack = new Error().stack + `\r\n` + err.stack;
        //next(err);
      });


  };

  api.listaLogQm = async function (req, res, next) {
    await dao.listaLogQm(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        throw err;
      });


  };

  api.getXmlQmInFtp = async function () {
    await dao.getXmlQmInFtp()
      .then((result) => {

      })
      .catch((err) => {
        //console.log(err);
      });


  };

  api.gerCodOcorr = async function () {
    ///pego todos reason codes existentes
    try {
      this.controller = app.config.ControllerBD;
      var con = await this.controller.getConnection();
      var reasonCodes = await con.execute({
        sql: `SELECT * FROM I007`,
        param: []
      }).then((result) => {
        return result;
      }).catch((err) => {
        throw err;
      });
      await con.close()
    } catch (err) {
      await con.closeRollBack();
      throw err;
    }
    for (i in reasonCodes) {

      reasonCodes[i].codOcorr = ((parseInt(reasonCodes[i].IDREACOD.substr(0, 2)) - 1) * 1000) + i;
      await con.insert({
        tabela: 'I015',
        colunas: {
          IDI015: reasonCodes[i].codOcorr
        }
      }).then((result) => {
        return result;
      }).catch((err) => {
        if (err.errorNum != 1) {
          throw err;
        }

      })
      await con.close();
      await con.update({
        tabela: 'I007',
        colunas: {
          IDI015: reasonCodes[i].codOcorr
        },
        condicoes: 'I007.IDREACOD = :id',
        parametros: {
          id: reasonCodes[i].IDREACOD
        }
      }).then((result) => {
        return result;
      }).catch((err) => {
        throw err
      });
      await con.close();

    }
  }

  return api;

};