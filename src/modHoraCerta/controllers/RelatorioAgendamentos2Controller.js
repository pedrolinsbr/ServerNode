module.exports = function (app, cb) {

	var fs = require('fs');
	var api = {};

	const dao  = app.src.modHoraCerta.dao.RelatorioAgendamentos2DAO;

	api.relatorioFaturamento = async function (req, res, next) {
		await dao.relatorioFaturamento(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioTransporte = async function (req, res, next) {
		await dao.relatorioTransporte(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioQualidade = async function (req, res, next) {
		await dao.relatorioQualidade(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioLogistica = async function (req, res, next) {
		await dao.relatorioLogistica(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioPesagem = async function (req, res, next) {
		await dao.relatorioPesagem(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioDPA = async function (req, res, next) {
		await dao.relatorioDPA(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioTransportadora = async function (req, res, next) {
		await dao.relatorioTransportadora(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.relatorioBravo = async function (req, res, next) {
		await dao.relatorioBravo(req, res, next)
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