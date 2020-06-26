module.exports = function (app, cb) {

	var api = {};
	var dao = app.src.modIntegrador.dao.FiltrosDAO;

	api.montar = async function (obFiltros) {

		if (process.env.TOKEN == 0 && process.env.APP_ENV != 'PRD' && (process.env.APP_ENV == 'QAS' || process.env.APP_ENV == 'DEV')) {
			return '';
		}

		if (obFiltros.dsmodulo === undefined || obFiltros.dsmodulo === "") {

			if (obFiltros.dioperad != undefined) {
				return ' 1=0 ' + obFiltros.dioperad + ' ';
			}

			if (obFiltros.esoperad != undefined) {
				return ' ' + obFiltros.esoperad + ' 1=0 ';
			}

			return ' 1=0 ';
		}

		if (!(obFiltros.snAdmin !== undefined && obFiltros.snAdmin === false)) {
			let isAdmin = await dao.isAdmin(obFiltros)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
				});

			if (isAdmin) {
				return '';
			}
		}

		return await dao.montar(obFiltros)
			.then((result) => {

				let arResult = [];

				for (value in result) {
					arResult.push(result[value]['NMTABELA'] + '.' + result[value]['NMATRIBU'] + ' In (' + result[value]['DSVALUE'] + ')');
				}

				if (arResult.length == 0) {
					arResult.push('1=0');
				}

				arResult = arResult.join(' And ');

				if (obFiltros.dioperad != undefined) {
					arResult = arResult + ' ' + obFiltros.dioperad + ' ';
				}

				if (obFiltros.esoperad != undefined) {
					arResult = ' ' + obFiltros.esoperad + ' ' + arResult;
				}

				return arResult;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
			});
	};

	return api;
};