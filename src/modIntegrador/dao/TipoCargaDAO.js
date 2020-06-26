module.exports = function (app, cb) {

	var api = {};
	var db = require(process.cwd() + '/config/database');
	var utils = app.src.utils.FuncoesObjDB;

	api.listarTipoCarga = async function (req, res, next) {

		var params = req.query;
		var arrOrder = [];

		if (params.order != null) {
			params.order.forEach(function (order) {
				arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
			})
			arrOrder = arrOrder.join();
		} else {
			arrOrder = ' H002.IdH002';
		}

		return await db.execute(
			{
				sql: `
              Select
                     H002.IdH002,
                     H002.DsTipCar, 
                     H002.StCadast,
                     TO_CHAR(H002.DTCADAST,'DD/MM/YYYY') DTCADAST,
                     H002.IdS001,
                     H002.SNDELETE,
                     S001.NmUsuari, 
                     COUNT(H002.IdH002) OVER () as count_linha
              From   H002 H002
                     Join S001 S001 on (S001.IdS001 = H002.IdS001)
              Where  H002.SnDelete = 0
              Order By `+ arrOrder,
				param: []
			})
		.then((result) => {
			return (utils.construirObjetoRetornoBD(result));
		})
		.catch((err) => {
			throw err;
		});
	};

	api.buscarTipoCarga = async function (req, res, next) {
		var id = req.params.id;

		return await db.execute(
			{
				sql: `Select
                     H002.IdH002,
                     H002.DsTipCar, 
                     H002.StCadast,
                     H002.DtCadast,
                     H002.IdS001,
                     H002.SnDelete,
                     S001.NmUsuari, 
                     COUNT(H002.IdH002) OVER () as count_linha
              From   H002 H002
                     Join S001 S001 on (S001.IdS001 = H002.IdS001)
              Where  H002.SnDelete = 0  AND
                     H002.IdH002 = ` + id,
				param: [],
			})
		.then((result) => {
			return (result[0]);
		})
		.catch((err) => {
			throw err;
		});
	};

	api.salvarTipoCarga = async function (req, res, next) {

		return await db.insert({
			tabela: 'H002',
			colunas: {
				DsTipCar: req.body.DSTIPCAR.toUpperCase(),
				StCadast: 'A',
				DtCadast: new Date(),
				IdS001: req.body.IDS001,
				SnDelete: 0
			},
			key: 'IdH002'
		})
		.then((result) => {
			return result;
		})
		.catch((err) => {
			throw err;
		});
	};

	api.atualizarTipoCarga = async function (req, res, next) {
		var id = req.params.id;

		return await
			db.update({
				tabela: 'H002',
				colunas: {
					DsTipCar: req.body.DSTIPCAR.toUpperCase(),
					StCadast: req.body.STCADAST.toUpperCase(),
				},
				condicoes: 'IdH002 = :id',
				parametros: {
					id: id
				}
			})
		.then((result) => {
			return { response: "Ocorrencia atualizada com sucesso" };
		})
		.catch((err) => {
			throw err;
		});
	};

	api.excluirTipoCarga = async function (req, res, next) {
		var id = req.params.id;

		return await
			db.update({
				tabela: 'H002',
				colunas: {
					SnDelete: 1
				},
				condicoes: 'IdH002 = :id',
				parametros: {
					id: id
				}
			})
		.then((result) => {
			return { response: "Excluído com sucesso" }
		})
		.catch((err) => {
			throw err;
		});
	};
	api.buscarFiltroTipoCarga = async function (req, res, next) {
		return await utils.searchComboBox("H002", "H002.DSTIPCAR", req.body.parameter);
	};

	return api;
};
