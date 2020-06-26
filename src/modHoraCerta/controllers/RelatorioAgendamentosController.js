module.exports = function (app, cb) {

	var fs = require('fs');
	var api = {};
	
	const dao  = app.src.modHoraCerta.dao.RelatorioAgendamentosDAO;
	
	api.montarSQLRelatorio = async function (req, res, next) {
	  await dao.montarSQLRelatorio(req, res, next)
		.then((result) => {
		  res.json(result);
		})
		.catch((err) => {
		  next(err);
		});
	};

	api.relatorioAgendamento = async function (req, res, next) {
		let agendamentos = [];
		await dao.relatorioAgendamento(req, res, next)
		  .then((result) => {
				agendamentos = result;
		  })
		  .catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
		  });

		res.json(agendamentos);
	};

	api.relatorioReagendamento = async function (req, res, next) {
		await dao.relatorioReagendamento(req, res, next)
		  .then((result) => {
				res.json(result);
		  })
		  .catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
		  });
	};

	return api;

};