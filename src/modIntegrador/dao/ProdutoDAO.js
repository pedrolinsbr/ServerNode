module.exports = function (app, cb) {

	var api = {};
	api.controller = app.config.ControllerBD;
	var db = app.config.database;
	var utils = app.src.utils.FuncoesObjDB;

	/**
	 * @description Contém o SQL que requisita os dados da tabela G010.
	 *
	 * @async
	 * @function api/listar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.listarProduto = async function (req, res, next) {
		let con = await this.controller.getConnection(null, req.UserId);
		try{

		
		var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G010',true);

		
		let sql =  `Select 	DISTINCT 	G010.IdG010,
						G010.DsProdut  as "G010_DSPRODUT",
						G010.CdNcm 	   as "G010_NCM",
						G010.SnInflam  as "G010_SNINFLAM",
						G010.DsRefFab  as "G010_DSREFFAB",
						G010.TpOriPro  as "G010_TPORIPRO",
						G010.StEnvOti  as "G010_STENVOTI",
						G010.IdG015,
						G015.DSCLARIS  as "G015_DSCLARIS",
						G015.DSGRUEMB  as "G015_DSGRUEMB",
						G015.DSONU 	   as "G015_DSONU",
						G015.NRONU 	   as "G015_NRONU",
						G014.IDG014,
						G014.DSOPERAC  as "G014_DSOPERAC",
						G037.IDG037,
						G037.DSARMAZE  as "G037_DSARMAZE",
						G037.DSCATEGO  as "G037_DSCATEGO",
						G037.TPAPRESE  as "G037_TPAPRESE",
						G038.IDG038,
						G038.DSGRUPRO as "G038_DSGRUPRO",
						G010.STCADAST as "G010_STCADAST",
						G010.DTCADAST as "G010_DTCADAST",

						COUNT(G010.IDG010) OVER () AS COUNT_LINHA
				From G010
				Left Join G015 G015  on G015.IdG015 = G010.IdG015
				Left Join G014 G014  on G014.IdG014 = G010.IdG014
				Left Join G037 G037  on G037.IdG037 = G010.IdG037
				Left Join G038 G038  on G038.IdG038 = G010.IdG038
				Left Join G016 G016  on G016.IdG010 = G010.IdG010
				Left Join G011 G011  on G011.IdG011 = G016.IdG011
				Left Join G009 G009  on G009.IdG009 = G011.IdG009
				Left Join G013 G013  on G013.IdG010 = G010.IdG010
				Left Join G009 G009O on G009O.IdG009 = G013.IdG009Or
				Left Join G009 G009D on G009D.IdG009 = G013.IdG009De
							${sqlWhere}`;
			let resultCount = await con.execute(
				{	
					
					sql: ` select count(x.IdG010) as QTD from (` + sql + `) x `,
					param: bindValues
				})
				.then((result) => {
					return result[0];
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});
			
			let result = await con.execute(

				{
					sql: sql +
						sqlOrder +
						sqlPaginate,
					param: bindValues
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});
		
			if (result && result != null && result.length > 0) {
				
				result[0].COUNT_LINHA = resultCount.QTD;
			}
		
		result = (utils.construirObjetoRetornoBD(result));

		await con.close();
		return result;
		}catch (err) {
					
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;

		}
	};

	/**
	 * @description Insere um dado na tabela G010.
	 *
	 * @async
	 * @function api/salvar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.salvarProduto = async function (req, res, next) {
		return await db.insert({
			tabela: `G010`,
			colunas: {
				IDS001: req.body.IDS001,
				STCADAST: req.body.STCADAST,
				DTCADAST: new Date(),
				IDG015:   req.body.IDG015,
				IDG038:   req.body.IDG038,
				IDG037:   req.body.IDG037,
				IDG014:   req.body.IDG014,
				CDNCM:    req.body.CDNCM,
				SNINFLAM: req.body.SNINFLAM,
				TPORIPRO: req.body.TPORIPRO,
				STENVOTI: req.body.STENVOTI,
				DSREFFAB: req.body.DSREFFAB.toUpperCase(),
				DSPRODUT: req.body.DSPRODUT.toUpperCase()
			},
			key: `G010.IDG010`
		})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	/**
	 * @description Busca um dado na tabela G010.
	 *
	 * @async
	 * @function api/buscar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.buscarProduto = async function (req, res, next) {

		return await db.execute(
			{
				sql: `SELECT
									G010.IDG010,
									G010.IDG015,
									G010.IDS001,
									G010.IDG014,
									G010.IDG038,
									G010.IDG037,
									G010.DSPRODUT,
									G010.CDNCM,
									G010.SNINFLAM,
									G010.TPORIPRO,
									G010.STCADAST,
									G010.SNDELETE,
									G010.DSREFFAB,
									G010.STENVOTI,
									G015.DSONU,
									G014.DSOPERAC,
									G037.DSCATEGO,
									G038.DSGRUPRO
						FROM    G010
						LEFT JOIN G014 G014 ON G014.IDG014 = G010.IDG014
						LEFT JOIN G015 G015 ON G015.IDG015 = G010.IDG015
						LEFT JOIN G037 G037 ON G037.IDG037 = G010.IDG037
						LEFT JOIN G038 G038 ON G038.IDG038 = G010.IDG038
						WHERE   G010.IDG010 = ${req.params.id}
						AND G010.SNDELETE = 0`,
				param: [],
			})
			.then((result) => {
				return (result[0]);
			})
			.catch((err) => {
				throw err;
			});
	};

	api.verificaEmbPad = async function (req, res, next) {

		return await db.execute(
			{
				sql: `SELECT 
							G016.SNEMBPAD
					  FROM 	G016 
					  WHERE IDG010 = ${req.params.id}`,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	api.alteraEmbPad = async function (req, res, next) {
		var id = req.params.id;

		return await db.update({
						tabela: 'G016',
						colunas: {
						SNEMBPAD: req.body.SNEMBPAD
					 },
						condicoes: 'IDG011 = :id',
						parametros: {
						id: id
						}
					})
				.then((result) => {
					return {result};
				})
				.catch((err) => {
					throw err;
				});
	};
	

	/**
	 * @description Exclui um dado na tabela G010.
	 *
	 * @async
	 * @function api/excluir
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.excluirProduto = async function (req, res, next) {
		var id = req.params.id;
		return await
			db.update({
				tabela: `G010`,
				colunas: {
					SnDelete: 1
				},
				condicoes: `G010.IDG010 = :id`,
				parametros: {
					id: id
				}
			})
				.then((result) => {
					return {result};
				})
				.catch((err) => {
					throw err;
				});
	};

	/**
	 * @description Atualiza um dado da tabela G010.
	 *
	 * @async
	 * @function api/atualizar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.atualizarProduto = async function (req, res, next) {
		var id = req.params.id;
		return await db.update({
			tabela: `G010`,
			colunas: {
				STCADAST: req.body.STCADAST,
				IDG015:   req.body.IDG015,
				IDG038:   req.body.IDG038,
				IDG037:   req.body.IDG037,
				IDG014:   req.body.IDG014,
				CDNCM:    req.body.CDNCM,
				SNINFLAM: req.body.SNINFLAM,
				TPORIPRO: req.body.TPORIPRO,
				STENVOTI: req.body.STENVOTI,
				DSREFFAB: req.body.DSREFFAB.toUpperCase(),
				DSPRODUT: req.body.DSPRODUT.toUpperCase()
			},
			condicoes: `IDG010 = :id`,
			parametros: {
				id: id
			}
		}).then((result) => {
			return { response: "Produto atualizado com sucesso" };
		}).catch((err) => {
			throw err;
		});
	};

	api.buscarEmbalagensProduto = async function (req, res, next) {
		//Resolve questões de paginação:
		//Cria conexão com o banco manualmente
		let con = await this.controller.getConnection(null, req.UserId);
		try{

		//Puxa e armazena parametros, da tabela G011 no caso
		var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G011',true);

		//Armazena a SQL em si
		let sql =  `SELECT
									G011.IDG011  	as "G011_IDG011",   
									G011.IDG009  	as "G011_IDG009",   
									G011.QTALTURA 	as "G011_QTALTURA",
									G011.QTPROFUN 	as "G011_QTPROFUN", 
									G011.QTLARGUR 	as "G011_QTLARGUR", 
									G011.QTLASTRO 	as "G011_QTLASTRO",
									G011.QTCAMADA 	as "G011_QTCAMADA", 
									G011.PSBRUTO 	as "G011_PSBRUTO",  
									G011.PSLIQUID 	as "G011_PSLIQUID",
									G011.STCADAST 	as "G011_STCADAST",
									G016.SNEMBPAD   as "G016_SNEMBPAD",
									TO_CHAR(G011.DTCADAST, 'DD/MM/YYYY') AS DTCADAST
						FROM  G011 
						INNER JOIN  G016 
							ON G016.IDG011 = G011.IDG011
							${sqlWhere}`;
			//Com a conexão, o objeto criado resultCount tem os parametros sql e param
			let resultCount = await con.execute(
				{	
					//Faz o count via SQL usando o alias x.G011_IDG011 em QTD
					sql: ` select count(x.G011_IDG011) as QTD from (` + sql + `) x `,
					param: bindValues
				})
				.then((result) => {
					return result[0];
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});
			//Executa a SQL completa, com order, etc
			let result = await con.execute(

				{
					sql: sql +
						sqlOrder +
						sqlPaginate,
					param: bindValues
				})
				.then((result) => {
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});
			//Se result tiver alguma coisa, armazena contagem
			if (result && result != null && result.length > 0) {
				//result.Count pois QTD foi o alias usado acima
				result[0].COUNT_LINHA = resultCount.QTD;
			}
		//result recebe a propria informação de forma que o front consiga interpretar
		result = (utils.construirObjetoRetornoBD(result));

		await con.close();//Fecha conexão
		return result;//retorna
		}catch (err) {
					
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;

		}
	};

	api.salvarEmbalagensProduto = async function (req, res, next) {
		return await db.insert({
			tabela: 'G011',
			colunas: {
				IDG009: req.body.IDG009,
				QTALTURA: req.body.QTALTURA,
				QTPROFUN: req.body.QTPROFUN,
				QTLARGUR: req.body.QTLARGUR,
				QTLASTRO: req.body.QTLASTRO,
				QTCAMADA: req.body.QTCAMADA,
				PSBRUTO: req.body.PSBRUTO,
				PSLIQUID: req.body.PSLIQUID,
				DTCADAST: new Date(),
				IDS001: req.body.IDS001,
				STCADAST: req.body.STCADAST
		},
				key: 'IDG011'
		}).then((result) => {
			return (result);
		}).catch((err) => {
			throw err;
		});
	 };
	 
	 api.salvarRelacaoEmbalagemProduto = async function (req, res, next) {
		return await db.insert({
			tabela: 'G016',
			colunas: {
				IDG010: req.body.IDG010,
				IDG011: req.body.IDG011,
				SNEMBPAD: req.body.SNEMBPAD
			},
			key: 'IDG016'
		}).then((result) => {
        	return (result);
      	}).catch((err) => {
        	throw err;
      	});
	};
	
	api.atualizarRelacaoEmbalagemProduto = async function (req, res, next) {
    	var id = req.params.id;

		return await db.update({
			tabela: 'G016',
			colunas: {
				IDG010: req.body.IDG010,
				IDG011: req.body.IDG011,
				SNEMBPAD: req.body.SNEMBPAD
			},
			condicoes: 'IDG016 = :id',
			parametros: {
				id: id
			}
		}).then((result) => {
          return { response: "Embalagem do produto atualizada com sucesso." };
        }).catch((err) => {
          throw err;
        });
  	};

	api.listarRelacaoEmbalagemProduto = async function (req, res, next) {
		return await db.execute({
			sql: `SELECT
						G016.IDG016, 
						G016.IDG010, 
						G016.ID011, 
						G016.SNEMBPAD
				FROM  G016`,
			param: []
		}).then((result) => {
        	return (result);
      	}).catch((err) => {
			throw err;
		});
	};

	api.buscarEmbalagemProduto = async function (req, res, next) {
		
		return await db.execute({
			sql: `SELECT
							G011.IDG011, 
							G011.IDG009, 
							G011.QTALTURA, 
							G011.QTPROFUN,
							G011.QTLARGUR, 
							G011.QTLASTRO, 
							G011.QTCAMADA, 
							G011.PSBRUTO,
							G011.PSLIQUID, 
							G011.STCADAST,
							G016.SNEMBPAD,
							G009.DSUNIDAD
					FROM  G011
					INNER JOIN G016 
						ON G011.IDG011 = G016.IDG011
					INNER JOIN G009
						ON G011.IDG009 = G009.IDG009
					WHERE G011.IDG011 = ${req.params.id}`,
 			param: [],
		}).then((result) => {
			return (result);
		}).catch((err) => {
			return err;
		});
	};
	
	return api;
};
