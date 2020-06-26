module.exports = function (app, cb) {
  var api = {};
  
  api.mkBuscarAgendamento = async function (req, res, next){

    result = [
      {
          "IDH006": 111164,
          "DT": "24/04/2019",
          "HOINICIO": "07:20",
          "CHECKIN": "08:23",
          "IDG028": 11,
          "NMARMAZE": "CD DPA FÁBRICA SYNGENTA PAULÍNIA",
          "TPBALANC": 0,
          "STAGENDA": 6,
          "IDH002": 2,
          "TPPESAGE": 4,
          "DSTIPCAR": "PALETIZADA",
          "TPMOVTO": "C",
          "IDG024": 6,
          "NMTRANSP": "BRAVO PAULÍNIA",
          "QTSLOTS": 1,
          "NRNFCARG": "null",
          "IDG030": 41,
          "DSTIPVEI": "VANDERLEIA 34 T",
          "IDG005": null,
          "QTPESO": 31253.3,
          "PESCOMP1": null,
          "PESCOMP2": null,
          "NRPLAVEI": "QOY-4559",
          "IDG031": 4843,
          "IDH003": null,
          "IDG032": null,
          "NRPLARE1": "null",
          "NRPLARE2": "null",
          "TXOBSAGE": "crossdoking",
          "SNIMPMAP": null,
          "NRREGIST": null,
          "NRTUSAP": null,
          "IDS001": 439,
          "CARGAS": [
            {"IDG046": "102030", "PSCARGA":10000, "TOMADOR": ["SYNGENTA PAULINIA", "SYNGENTA UBERABA"], "NOTAS":["0001", "0002"], "PRODUTOS":["PRODUTO 1", "PRODUTO 2"], "TPOPERAC": 4, "TXOBSAGE": "OBS 1" },
            {"IDG046": "102040", "PSCARGA":10000,  "TOMADOR": ["SYNGENTA PAULINIA"], "NOTAS":["0003"], "PRODUTOS":["PRODUTO 3"], "TPOPERAC": 4, "TXOBSAGE": "OBS 2" },
            {"IDG046": "102050", "PSCARGA":11243.3,  "TOMADOR": ["SYNGENTA UBERABA"], "NOTAS":["0004"],  "PRODUTOS":[ "PRODUTO 4"], "TPOPERAC": 4,  "TXOBSAGE": "OBS 3" }
            ],
          "LSNOTAS": null,
          "IDBOX": null,
          "NUMNAM": null,
          "DSCARGA": "Paulínia - SP X Aparecida de Goiânia - GO",
          "DTPSMANU": "2019-04-25T01:00:00.000Z",
          "TPMODCAR": 2,
          "QTTEMPRE": 60,
          "CJMOTORI": "35512311840",
          "NRREGMOT": "0353116306",
          "RGMOTORI": "48619039",
          "NMMOTORI": "LEANDRO COSTA DE OLIVEIRA",
          "DSVEICUL": "MB ACTROS 2546",
          "NRFROTA": "769",
          "NRJANELA": 3,
          "FORNECED": null,
          "ID_FORNECED": null,
          "UNIDRECE": null,
          "CDLACRE": null,
          "CDCONTAI": null,
          "TOMADOR": "SYNGENTA PAULINIA BR25/ 13T - LEPA",
          "OBSAGEN": null,
          "OBSCHEC": null,
          "OBSENTR": null,
          "OBSINOP": null,
          "OBSFNOP": null,
          "OBSSAIU": null,
          "TPMATERI": null,
          "AUTORIZA": null,
          "PRSERVIC": null,
          "QTDPSENT": 1,
          "QTDPSSAI": 0,
          "LIBERASAI": null
      }
  ]
    res.json(result);
  }
  
  return api;
};
