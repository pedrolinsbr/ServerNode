module.exports = function (app, cb) {

  var api    = {};
  var dao    = app.src.modDashboard.dao.GestaoMovimentacaoDAO;

  api.buscaIndicadoresStatusAgendamento = async function (req, res, next) {
    try {

      let data = await dao.buscaIndicadoresStatusAgendamento(req, res, next);

      if (data.length > 0) {
        let arrIndicadores = [
          {// Agendado
            status    : 3,
            descricao : 'Agendado',
            carga     : data[0]['QTAGECAR'],
            descarga  : data[0]['QTAGEDES'],
            total     : data[0]['QTAGETOT'],
            peso      : parseFloat(data[0]['PSAGETOT'].toFixed(2))
          },
          {// Checkin
            status    : 4,
            descricao : 'Checkin',
            carga     : data[0]['QTCHECAR'],
            descarga  : data[0]['QTCHEDES'],
            total     : data[0]['QTCHETOT'],
            peso      : parseFloat(data[0]['PSCHETOT'].toFixed(2))
          },
          {// Entrou
            status    : 5,
            descricao : 'Entrou',
            carga     : data[0]['QTENTCAR'],
            descarga  : data[0]['QTENTDES'],
            total     : data[0]['QTENTTOT'],
            peso      : parseFloat(data[0]['PSENTTOT'].toFixed(2))
          },
          {// Iniciou Operação
            status  :  6,
            descricao : 'Iniciou Operação',
            carga     : data[0]['QTINICAR'],
            descarga  : data[0]['QTINIDES'],
            total     : data[0]['QTINITOT'],
            peso      : parseFloat(data[0]['PSINITOT'].toFixed(2))
          },
          {// Finalizou Operação
            status  :  7,
            descricao : 'Finalizou Operação',
            carga     : data[0]['QTFINCAR'],
            descarga  : data[0]['QTFINDES'],
            total     : data[0]['QTFINTOT'],
            peso      : parseFloat(data[0]['PSFINTOT'].toFixed(2))
          },
          {// Saiu
            status  :  8,
            descricao : 'Checkout',
            carga     : data[0]['QTSAICAR'],
            descarga  : data[0]['QTSAIDES'],
            total     : data[0]['QTSAITOT'],
            peso      : parseFloat(data[0]['PSSAITOT'].toFixed(2))
          },
          {// Faltou
            status  :  9,
            descricao : 'Faltou',
            carga     : data[0]['QTFALCAR'],
            descarga  : data[0]['QTFALDES'],
            total     : data[0]['QTFALTOT'],
            peso      : parseFloat(data[0]['PSFALTOT'].toFixed(2))
          },
          {// Atrasados
            status  :  0,
            descricao : 'Atrasados',
            carga     : data[0]['QTATRCAR'],
            descarga  : data[0]['QTATRDES'],
            total     : data[0]['QTATRTOT'],
            peso      : parseFloat(data[0]['PSATRTOT'].toFixed(2))
          },
        ];

        res.send(arrIndicadores);
      } else {
        res.send(400).send({ error: 'Lista de indicadores vazia!' });
      }

    } catch (error) {

      res.status(500).send({ error: error.message });

    }
  };

  api.buscaIndicadoresAgendamentosAtrasados = async function (req, res, next) {
    try {

      let data = await dao.buscaIndicadoresAgendamentosAtrasados(req, res, next);

      if (data.length > 0) {
        let totalAtrasados = data[0]['QTTRANSP'] + data[0]['QTARMAZE'];
        let arrIndicadores = [
          {// Armazém
            name  : 'Armazém',
            value : parseFloat(((data[0]['QTARMAZE'] * 100) / totalAtrasados).toFixed(2))
          },
          {// Transportadora
            name  : 'Transportadora',
            value : parseFloat(((data[0]['QTTRANSP']*100)/totalAtrasados).toFixed(2))
          }
        ];

        res.send(arrIndicadores);
      } else {
        res.send(400).send({ error: 'Lista de indicadores vazia!' });
      }

    } catch (error) {

      res.status(500).send({ error: error.message });

    }
  };

  api.buscaAgendamentosAtrasados = async function (req, res, next) {
    try {

      let data = await dao.buscaAgendamentosAtrasados(req, res, next);

      if (data.length > 0) {

        let arrAtrasadosTransp = data.filter(d => d['TPATRASO'] == 'TRANSP');
        let arrAtrasadosArmaze = data.filter(d => d['TPATRASO'] == 'ARMAZE');

        let totalAtrasados = arrAtrasadosTransp[0]['TOTATRAS'] + arrAtrasadosArmaze[0]['TOTATRAS'];

        let arrIndicadores = [
          {// Armazém
            name  : 'Armazém',
            value : parseFloat(((arrAtrasadosArmaze[0]['TOTATRAS'] * 100) / totalAtrasados).toFixed(2))
          },
          {// Transportadora
            name  : 'Transportadora',
            value : parseFloat(((arrAtrasadosTransp[0]['TOTATRAS'] * 100) / totalAtrasados).toFixed(2))
          }
        ];

        res.send({ arrAtrasadosTransp, arrAtrasadosArmaze, arrIndicadores, totalAtrasados });
      } else {
        res.send(400).send({ error: 'Lista de indicadores vazia!' });
      }

    } catch (error) {

      res.status(500).send({ error: error.message });

    }
  };

  api.buscaCapacidadeArmazem = async function (req, res, next) {
    try {

      let data = await dao.buscaCapacidadeArmazem(req, res, next);

      if (data.length > 0) {
        let objCapacidades = {
            totalMovimentCap: parseFloat(data[0]['TTPERSAF'].toFixed(2))
          , arrCapPorArmazem: data
        };

        res.send(objCapacidades);
      } else {
        res.send(400).send({ error: 'Lista de indicadores vazia!' });
      }

    } catch (error) {

      res.status(500).send({ error: error.message });

    }
  };

  return api;
};
