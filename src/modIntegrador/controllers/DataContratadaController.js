module.exports = function (app, cb) {

	var utils = app.src.utils.Utils;
	var api = {};

	api.dataContratada = async function (req, res, next) {

		var data = await utils.dataContratada(req.body.data, req.body.diasEntrega, req.body.diasColeta, req.body.origem, req.body.destino)
		return res.status(200).send(data);

	}

	api.timezoneBr = async function (req, res, next) {

		var timezone = await utils.timezoneBr();
		return res.status(200).send(timezone);

	}

	return api;
}