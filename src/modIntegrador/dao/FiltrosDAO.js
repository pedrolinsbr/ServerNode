module.exports = function (app) {

	var api = {};
	var db = require(process.cwd() + '/config/database');
	var log = app.config.logger;

	api.isAdmin = async function (obFiltros) {

		let isAdmin = await db.execute(
			{
				sql: `
					Select S001.SnAdmin
					From S001 S001 
					Where S001.SnAdmin = 1 And S001.IdS001 = :ids001 And S001.IDS001RT Is Null`,
				param: {
					ids001: obFiltros.ids001
				},
			})
			.then((result) => {
				return result[0].SNADMIN;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});

		return isAdmin;
	}

	api.montar = async function (obFiltros) {
		let arTabela = [];

		/* let isAdmin = await db.execute(
				{
						sql: `
						Select S001.SnAdmin
						From S001 S001 
						Where S001.SnAdmin = 1 And S001.IdS001 = :ids001`,
						param: {
								ids001: obFiltros.ids001
						},
				})
				.then((result) => {
						return result[0].SNADMIN;
				})
				.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						throw err;
				});
		if (isAdmin) {
				return true;
		} else { */
		for (value in obFiltros.nmtabela) {
			arTabela.push(Object.keys(obFiltros.nmtabela[value])[0]);
		}

		let ids001 = await db.execute(
			{
				sql: `
					Select S001.IDS001RT
					From S001 S001 
					Where S001.IdS001 = :ids001`,
				param: {
					ids001: obFiltros.ids001
				},
			})
			.then((result) => {
				return result[0].IDS001RT;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
		if (ids001 == null) {
			ids001 = obFiltros.ids001;
		}

		return await db.execute(
			{
				sql: `
							Select S007.NmTabela, S010.NmAtribu, LISTAGG(S028.DsValue, ',') WITHIN GROUP (ORDER BY S028.DsValue) as DsValue
							From    S027 S027 /* Grupos/Usuários */
											Join S026 S026 On (S026.IdS026 = S027.IdS026) /* Grupos */
											Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
											Join S028 S028 On (S028.IdS026 = S026.IdS026) /* Filtros */
											Join S007 S007 On (S007.IdS007 = S028.IdS007) /* Tabelas */
											Join S010 S010 On (S010.IdS007 = S007.IdS007) /* Atributos da tabela */
											Join S013 S013 On (S013.IdS007 = S007.IdS007 And S013.IdS010 = S010.IdS010) /* Atributos PK */
							Where   Upper(S025.DsModulo) = Upper(:dsmodulo) And 
											S027.IdS001 = :ids001 And
											S007.NmTabela In ('`+ arTabela.join("','") + `') And
											S026.SnDelete = 0 And 
											S025.SnDelete = 0
							Group By S007.NmTabela, S010.NmAtribu`,
				param: {
					dsmodulo: obFiltros.dsmodulo,
					ids001: ids001
				},
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	};

	return api;
}