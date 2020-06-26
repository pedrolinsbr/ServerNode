module.exports = function (app, cb) {

  var api = {};

  const dao = app.src.modIntegrador.dao.ContingenciaDAO;
  const utilsCA  = app.src.utils.ConversorArquivos;
  const utilsFMT = app.src.utils.Formatador;
  const tmz      = app.src.utils.DataAtual;

  api.listarContingencia = async function (req, res, next) {

    var strDtFmt = 'YYYY-MM-DD HH:mm:ss';

    var results = await dao.listarContingencia(req, res, next).catch((err) => {
        next(err);
    });

    for (row of results.data) {

      if (!row.CARGA_IDG046) {

        row.SHIPMENT = '';

      } else {

        row.SHIPMENT = utilsFMT.formataShipment({ idCarga: row.CARGA_IDG046 })
        + "-" + utilsCA.LPad(row.CARGA_NRSEQETA, '0', 2);

      }

      row.DT_AGP   = row.DT_AGP ? tmz.formataData(row.DT_AGP, strDtFmt).replace(' ', 'T') : '';
      row.DT_EAD   = row.DT_EAD ? tmz.formataData(row.DT_EAD, strDtFmt).replace(' ', 'T') : '';
      row.DT_AAD   = row.DT_AAD ? tmz.formataData(row.DT_AAD, strDtFmt).replace(' ', 'T') : '';
      row.DT_CCD   = row.DT_CCD ? tmz.formataData(row.DT_CCD, strDtFmt).replace(' ', 'T') : '';
      row.DT_EPC   = row.DT_EPC ? tmz.formataData(row.DT_EPC, strDtFmt).replace(' ', 'T') : '';
      row.DT_ERO   = row.DT_ERO ? tmz.formataData(row.DT_ERO, strDtFmt).replace(' ', 'T') : '';

    }

    res.json(results);

  }

  return api;
};