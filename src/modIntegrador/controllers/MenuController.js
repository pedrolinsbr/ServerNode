var dao = require('../dao/MenuDAO');

module.exports = {

	atualizarMenu: async function (req, res, next) {
		await dao.atualizar(req).then((result) => {
			res.json({ "id": result });
		}).catch(function (err) {
			next(err);
		})
	},

	excluirMenu: async function (req, res, next) {
		await dao.excluir(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	},

	listarMenu: async function (req, res, next) {
		await dao.listar().then((result) => {
			res.json(result);
		}).catch(function (err) {
			throw err;
		})
	},

	menu: async function (req, res, next) {
		await dao.menu(req, res, next).then((result) => {
			res.json(result);
		}).catch(function (err) {
			throw err;
		})
	},

	menuAcoes: async function (req, res, next) {
		await dao.menuAcoes(req, res, next).then((result) => {
			res.json(result);
		}).catch(function (err) {
			throw err;
		})
	},

	salvarMenu: async function (req, res, next) {
		await dao.salvar(req).then((result) => {
			res.json({ "id": result });
		}).catch(function (err) {
			next(err);
		})
	}
}