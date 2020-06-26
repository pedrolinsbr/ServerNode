var utils = require('../../utils/FuncoesObjDB')
var db = require('../../../config/database');

module.exports = {

	/**
	 * @description Atualiza um dado da tabela S022.
	 *
	 * @async
	 * @function atualizar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	atualizarMenu: async function (req, res, next) {
		var id = req.params.id;

		return await
			db.update({
				tabela: 'G031',
				colunas: {
					DSMENU: req.body.dsMenu
					, IDS021: req.body.idS021
					, IDMENPAI: req.body.idMenPai
					, NRNIVEL: req.body.nrNivel
					, NRORDEM: req.body.nrOrdem
					, TPMENU: req.body.tpMenu
					, SNDELETE: req.body.snDelete
				},
				condicoes: 'IDS022 = :id',
				parametros: {
					id: id
				}
			})
				.then((result) => {

					return { response: "Menu atualizado com sucesso" };
				})
				.catch((err) => {
					throw err;
				});
	},

	/**
	 * @description Exclui um dado na tabela S022.
	 *
	 * @async
	 * @function excluir
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/

	excluirMenu: async function (req, res, next) {
		var id = req.params.id;

		return await
			db.update({
				tabela: 'S022',
				colunas: {
					SnDelete: 1
				},
				condicoes: 'IdS022 = :id',
				parametros: {
					id: id
				}
			})
				.then((result) => {
					return { response: "Menu deletado com sucesso" }
				})
				.catch((err) => {
					throw err;
				});
	},

	/**
	* @description Lista dados na tabela S022.
	*
	* @async
	* @function salvar
	* @param {request} req - Possui as requisições para a função.
	* @param {response} res - A resposta gerada na função.
	* @param {next} next - Caso haja algum erro na rota.
	* @return {JSON} Retorna um objeto JSON.
	* @throws Caso falso, o número do log de erro aparecerá no console.
	*/

	listarMenu: async function (req, res, next) {
		return await db.execute(
			{
				sql: `Select 
											S022.IdS022, S022.DsMenu, S022.IdMenPai, S022.NrNivel,
											S022.NrOrdem, S022.TpMenu,
							From    S022 S022
							Where   S022.SnDelete = 0`,
				param: []
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				throw err;
			});
	},

	menu: async function (req, res, next) {
		let arMenu = [];
		let arResult = [];
		let arAux = [];

		let isAdmin = await db.execute(
			{
				sql: `  Select S001.SnAdmin
								From S001 S001
								Where S001.IdS001 = :ids001`,
				param: {
					ids001: req.body.ids001
				}
			})
			.then((result) => {
				return result[0].SNADMIN;
			})
			.catch((err) => {
				throw err;
			});

		if (isAdmin) {
			arMenu = await db.execute(
				{
					sql: `  Select X.IdS022, X.DsMenu, X.DsTitulo, X.IdMenPai, X.DsIcone, X.DsCaminh
									From
											(   Select  Distinct S022.IdS022, S022.DsMenu, S022.DsTitulo, S022.IdMenPai,
																	S022.NrNivel, S022.NrOrdem, S022.DsIcone, S022.DsCaminh
													From    S026 S026 /* Grupos */
																	Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
																	Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos */
																	Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
																	Join S027 S027 On (S027.IdS026 = S026.IdS026) /* Grupos/Usuários */
													Where   S026.TpGrupo in ('M', 'A') And
																	S026.SnDelete = 0 And
																	S022.SnDelete = 0 And
																	S025.SnDelete = 0 And
																	S021.SnVisAdm in (0,1) And
																	S027.IdS001 = :ids001 And
																	Upper(S025.DsModulo) = Upper(:dsmodulo)
													Order By Nvl(S022.IdMenPai, 0), S022.NrNivel, S022.NrOrdem ) X
									Start With Nvl(X.IdMenPai, 0) = 0
									Connect By Prior X.IdS022 = Nvl(X.IdMenPai, 0)
									ORDER SIBLINGS BY X.NRORDEM`,
					param: {
						dsmodulo: req.body.dsmodulo,
						ids001: req.body.ids001
					}
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					throw err;
				});
		} else {

			arMenu = await db.execute(
				{
					sql: `  Select X.IdS022, X.DsMenu, X.DsTitulo, X.IdMenPai, X.DsIcone, X.DsCaminh
									From
											(   Select  Distinct S022.IdS022, S022.DsMenu, S022.DsTitulo, S022.IdMenPai,
																	S022.NrNivel, S022.NrOrdem, S022.DsIcone, S022.DsCaminh
													From    S027 S027 /* Grupos/Usuários */
																	Join S001 S001 On (S001.IdS001 = S027.IdS001) /* Usuários */
																	Join S026 S026 On (S026.IdS026 = S027.IdS026) /* Grupos */
																	Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
																	Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos */
																	Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
													Where   S026.TpGrupo in ('M', 'A') And
																	S001.StUsuari = 'A' And
																	S001.SnDelete = 0 And
																	S026.SnDelete = 0 And
																	S022.SnDelete = 0 And
																	S025.SnDelete = 0 And
																	S021.SnVisAdm = 0 And
																	S027.IdS001 = :ids001 And
																	Upper(S025.DsModulo) = Upper(:dsmodulo)
													Order By Nvl(S022.IdMenPai, 0), S022.NrNivel, S022.NrOrdem ) X
									Start With Nvl(X.IdMenPai, 0) = 0
									Connect By Prior X.IdS022 = Nvl(X.IdMenPai, 0)
									ORDER SIBLINGS BY X.NRORDEM`,
					param: {
						ids001: req.body.ids001,
						dsmodulo: req.body.dsmodulo
					}
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					throw err;
				});
		}

		for (item in arMenu) {
			var obResult = {};

			obResult.IDS022 = arMenu[item].IDS022;
			obResult.state = (arMenu[item].DSCAMINH === null ? '' : arMenu[item].DSCAMINH);
			obResult.name = (arMenu[item].DSMENU === null ? '' : arMenu[item].DSMENU);
			obResult.title = (arMenu[item].DSTITULO === null ? '' : arMenu[item].DSTITULO);
			obResult.type = 'link';
			obResult.icon = (arMenu[item].DSICONE === null ? '' : arMenu[item].DSICONE);

			if (arMenu[item].IDMENPAI === null) {
				
				if (arAux.length !== 0) {
					arResult[arResult.length - 1].children = arAux;
					arResult[arResult.length - 1].type = 'sub';
				}

				arResult.push(obResult);
				arAux = [];

			} else {
				arAux.push(obResult);
			}
		}

		if (arAux.length !== 0) {
			arResult[arResult.length - 1].children = arAux;
			arResult[arResult.length - 1].type = 'sub';
		}
		
		return arResult;
	},

	menuAcoes: async function (req, res, next) {
		let arMenu = [];
		
		let isAdmin = await db.execute(
			{
				sql: `  Select S001.SnAdmin
                    From S001 S001
                    Where S001.IdS001 = :IDS001`,
				param: {
					IDS001: req.body.IDS001
				}
			})
			.then((result) => {
				return result[0].SNADMIN;
			})
			.catch((err) => {
				throw err;
			});

		if (isAdmin) {
			arMenu = await db.execute(
				{
					sql: `  Select  Distinct S023.IdS023 as CdAcao, S023.DsAcao
									From    S026 S026 /* Grupos */
													Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
													Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos/Ações */
													Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
													Join S023 S023 On (S023.IdS023 = S021.IdS023) /* Ações */
									Where   S026.TpGrupo in ('M', 'A') And
													S026.SnDelete = 0 And
													S022.SnDelete = 0 And
													S025.SnDelete = 0 And
													S021.SnVisAdm in (0,1) And
													S022.IdS022 = :IDS022 And
													Upper(S025.DsModulo) = Upper(:DSMODULO)
									Order By S023.IdS023`,
					param: {
						DSMODULO: req.body.DSMODULO,
						IDS022: req.body.IDS022
					}
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					throw err;
				});
		} else {
			arMenu = await db.execute(
				{
					sql: `  Select  Distinct S023.IdS023 as CdAcao, S023.DsAcao
                        From    S027 S027 /* Grupos/Usuários */
                                Join S001 S001 On (S001.IdS001 = S027.IdS001) /* Usuários */
                                Join S026 S026 On (S026.IdS026 = S027.IdS026) /* Grupos */
                                Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
                                Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos/Ações */
                                Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
                                Join S023 S023 On (S023.IdS023 = S021.IdS023) /* Ações */
                        Where   S026.TpGrupo in ('M', 'A') And
                                S001.StUsuari = 'A' And
                                S001.SnDelete = 0 And
                                S026.SnDelete = 0 And
                                S022.SnDelete = 0 And
                                S025.SnDelete = 0 And
                                S021.SnVisAdm = 0 And
                                S027.IdS001 = :IDS001 And
                                S022.IdS022 = :IDS022 And
                                Upper(S025.DsModulo) = Upper(:DSMODULO)
                        Order By S023.IdS023`,
					param: {
						IDS001: req.body.IDS001,
						DSMODULO: req.body.DSMODULO,
						IDS022: req.body.IDS022
					}
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					throw err;
				});
		}

		return arMenu;
	},

	/**
	* @description Insere um dado na tabela S022.
	*
	* @async
	* @function api/salvar
	 * @param {request} req - Possui as requisições para a função.
	* @param {response} res - A resposta gerada na função.
	* @param {next} next - Caso haja algum erro na rota.
	* @return {JSON} Retorna um objeto JSON.
	* @throws Caso falso, o número do log de erro aparecerá no console.
	*/

	salvarMenu: async function (req, res, next) {
		return await db.insert(
			{
				tabela: 'S022',
				colunas: {
					DSMENU: req.body.dsMenu
					, IDS021: req.body.idS021
					, IDMENPAI: req.body.idMenPai
					, NRNIVEL: req.body.nrNivel
					, NRORDEM: req.body.nrOrdem
					, TPMENU: req.body.tpMenu
					, SNDELETE: req.body.snDelete
				},
				key: 'IDS022'
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				throw err;
			});
	}

}