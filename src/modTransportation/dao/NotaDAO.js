/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/Conhecimento
 * @description G046, .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

	var api        = {};
	var utils      = app.src.utils.FuncoesObjDB;
	var dicionario = app.src.utils.Dicionario;
	var dtatu      = app.src.utils.DataAtual;
	var acl        = app.src.modIntegrador.controllers.FiltrosController;
	var logger     = app.config.logger;
	api.controller = app.config.ControllerBD;

	/**
	 * @description Listar um dados da tabela G046.
	 *
	 * @async
	 * @function api/listar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */



	api.listar = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);
		var sqlWhereAux = '';
		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G043',true);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

			let result = await con.execute(
				{
					sql: ` Select Distinct G043.IDG043		,
					G043.CDDELIVE		,
					G043.SNLIBROT		,
					G043.DTLANCTO		,
					G043.IDS001  		,
					G043.DTDELIVE		,
					G043.TPDELIVE		,
					G043.STDELIVE		,
					G043.NRNOTA  		,
					G043.NRSERINF		,
					G043.DTEMINOT		,
					G043.NRCHADOC		,
					G043.DSMODENF		,
					G043.SNDELETE		,
					G043.IDG005RE		,
					G043.IDG005DE		,
					G043.DTFINCOL		,
					G043.CDPRIORI		,
					G043.TPTRANSP		,
					G043.CDFILIAL		,
					G043.PSBRUTO		,
					G043.PSLIQUID		,
					G043.NRDIVISA		,
					G043.STETAPA		,
					G043.VRDELIVE		,
					G043.NREMBSEC		,
					G043.SNINDSEG		,
					G043.VRALTURA		,
					G043.VRLARGUR		,
					G043.VRCOMPRI		,
					G043.CJDESTIN		,
					G043.IEDESTIN		,
					G043.IMDESTIN		,
					G043.IDG014		    ,
					G043.CDCLIEXT		,
					G043.VRVOLUME		,
					G043.IDG009PS		,
					G043.DTENTREG		,
					G043.STULTETA		,
					G043.DTENTCON		,
					G043.TXINSTRU		,
					G043.TXCANHOT		,
					G043.IDG043RF		,
					G043.IDI015		    ,
					G043.DSEMACLI		,
					G043.DSEMARTV		,
					G043.IDG005RC		,
					G043.CDRASTRE		,
					G043.DSINFCPL		,
					G043.DTBLOQUE		,
					G043.DTDESBLO		,
					G043.IDG005TO		,
					G043.IDG024TR		,
					G043.SNAG		    ,
					G043.SNOTIMAN		,
					G043.STLOGOS		,
					G043.IDG074		    ,
					G043.CDG46ETA		,
					G043.IDS001CA		,
					G043.DTCANCEL		,
					G043.DTAUXILI		,
					G043.IDEXTCLI		,
					G043.OBCANCEL		,

					' [' || G043.IDI015  || '] '  || I015.DSOCORRE as TPOCORRE,

					' [' || G043.IDG014  || '] '  || G014.DSOPERAC as STOPERA,


					g005RE.NMCLIENT AS NMCLIENTRE,
					g005DE.NMCLIENT AS NMCLIENTDE,
					g005RC.NMCLIENT AS NMCLIENTRC,
					S001.NMUSUARI

					From G043 G043 

					Left Join s001 s001 On s001.ids001 = g043.ids001
					Left Join i015 i015 On i015.idi015 = g043.idi015
					Left Join g014 g014 On g014.idg014 = g043.idg014

					Join g005 g005RE On g005RE.IDG005 = G043.IDG005RE
					Join g005 g005DE On g005DE.IDG005 = G043.IDG005DE 
					Join g005 g005RC On g005RC.IDG005 = G043.IDG005RC 
					`+
					sqlWhere + 
					sqlWhereAux +
					sqlOrder +
					sqlPaginate,

					param: bindValues
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};

	api.listarCarga = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G051',true);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);	
			let result = await con.execute(
				{
					sql: ` Select Distinct G051.IDG051		,
					G051.IDG005RE	,
					G051.IDG005DE	,
					G051.IDG005RC	,
					G051.IDG005EX	,
					G051.IDG005CO	,
					G051.IDG024		,
					G051.NRCHADOC	,
					G051.DSMODENF	,
					G051.NRSERINF	,
					G051.CDCTRC		,
					G051.VRTOTFRE	,
					G051.VRFRETEP	,
					G051.VRFRETEV	,
					G051.VRPEDAGI	,
					G051.VROUTROS	,
					G051.DTEMICTR	,
					G051.VRMERCAD	,
					G051.VRSECCAT	,
					G051.STCTRC		,
					G051.VRTOTPRE	,
					G051.VROPERAC	,
					G051.SNDELETE	,
					G051.VRBASECA	,
					G051.PCALIICM	,
					G051.VRICMS		,
					G051.BSISSQN	,
					G051.VRISSQN	,
					G051.VRISSQST	,
					G051.PCALIISS	,
					G051.VRDESCON	,
					G051.DTLANCTO	,
					G051.DSINFCPL	,
					G051.DTCALANT	,
					G051.DTCOLETA	,
					G051.DTENTPLA	,
					G051.DTCALDEP	,
					G051.DTAGENDA	,
					G051.DTCOMBIN	,
					G051.DTROTERI	,
					G051.CDCARGA	,
					G051.IDG059		,
					G051.STLOGOS	,
					G051.SNLOTACA	,
					G051.CDSATISF	,
					G051.IDG024AT	,
					G051.SNPRIORI	,
					G051.IDG046		,
					G051.NRPESO		,
					G043.NRNOTA,

					g005RE.NMCLIENT AS NMCLIENTRE,
					g005DE.NMCLIENT AS NMCLIENTDE,
					g005RC.NMCLIENT AS NMCLIENTRC,
					g005EX.NMCLIENT AS NMCLIENTEX,
					g005CO.NMCLIENT AS NMCLIENTCO,
					Case
						When G051.TPTRANSP = 'C' Then
						'Complemento'
						When G051.TPTRANSP = 'D' Then
						'Devolução'
						When G051.TPTRANSP = 'O' Then
						'Outros'
						When G051.TPTRANSP = 'S' Then
						'Substituto'
						When G051.TPTRANSP = 'T' Then
						'Transferência'
						When G051.TPTRANSP = 'V' Then
						'Venda'
						Else
						'Não Informado'
					End As TPTRANSP, /* Tipo de Operação */	
					g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,
					g024AT.NMTRANSP || ' [' || g024AT.idg024 || '-' || g024AT.idlogos || ']'  as NMTRANSPAT,
					COUNT(g051.IDG051) OVER () as COUNT_LINHA
					From g051 g051   
					Join G052 G052   On G052.idg051   = g051.idg051
					Join g005 g005RE On g005RE.IDG005 = g051.IDG005RE
					Join g005 g005DE On g005DE.IDG005 = g051.IDG005DE 
					Join g005 g005RC On g005RC.IDG005 = g051.IDG005RC 
					Join g005 g005EX On g005EX.IDG005 = g051.IDG005EX
					Join g005 g005CO On g005CO.IDG005 = g051.IDG005CO
					Join g024 g024   On g024.IDG024   = g051.IDG024
					join g024 g024AT On G024AT.IDG024 = G051.idg024at
					JOIN G046 G046 ON G046.IDG046 = G051.IDG046
					Left Join g052 g052 On g052.idg051 = g051.idg051
					Left Join g043 g043 On g043.idg043 = g052.idg043
					`+
					sqlWhere + 
					sqlOrder +
					sqlPaginate,

					param: bindValues
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});

			await con.close();
			logger.debug("Fim listar");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};


	/**
	 * @description Listar um dados da tabela G046.
	 *
	 * @async
	 * @function api/listarNfe
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */


	api.listarNfe = async function (req, res, next) {

		logger.debug("Inicio listarNfe");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G043', false);
			var conhecimentos = req.body['arIds'];
			if(typeof conhecimentos != "string"){
				conhecimentos = conhecimentos.join(",");
			}
			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
			let result = null;


			result = await con.execute(
				{
					sql: `select G043.IDG043	,
					G043.CDDELIVE,
					G043.SNLIBROT,
					G043.DTLANCTO,
					G043.IDS001	,
					G043.DTDELIVE,
					G043.TPDELIVE,
					G043.STDELIVE,
					G043.NRNOTA	,
					G043.NRSERINF,
					G043.DTEMINOT,
					G043.NRCHADOC,
					G043.DSMODENF,
					G043.SNDELETE,
					G043.IDG005RE,
					G043.IDG005DE,
					G043.DTFINCOL,
					G043.CDPRIORI,
					G043.TPTRANSP,
					G043.CDFILIAL,
					G043.PSBRUTO	,
					G043.PSLIQUID,
					G043.NRDIVISA,
					G043.STETAPA	,
					G043.VRDELIVE,
					G043.NREMBSEC,
					G043.SNINDSEG,
					G043.VRALTURA,
					G043.VRLARGUR,
					G043.VRCOMPRI,
					G043.CJDESTIN,
					G043.IEDESTIN,
					G043.IMDESTIN,
					G043.IDG014	,
					G043.CDCLIEXT,
					G043.VRVOLUME,
					G043.IDG009PS,
					G043.DTENTREG,
					G043.STULTETA,
					G043.DTENTCON,
					G043.TXINSTRU,
					G043.TXCANHOT,
					G043.IDG005TO,
					G043.IDG024TR,
					/*G043.DSINFCPL,*/
					G043.SNOTIMAN,
					G043.SNAG	,
					G043.DTBLOQUE,
					G043.DTDESBLO,
					G043.STLOGOS,
					G043.CDRASTRE,
					I015.DSOCORRE
					From G043 G043
					Join g052 g052 On g052.idg043 = G043.idg043
					Left Join I015 I015 On I015.IDI015 = G043.IDI015
					Where g052.idg051 in (${conhecimentos})
					/*and g046.STCARGA in ('T') */`+
									 /* sqlWhere +*/
										sqlOrder +
										sqlPaginate,
					param: {}
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return (utils.construirObjetoRetornoBD(result));
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});
			

			await con.close();
			logger.debug("Fim listarNfe");
			return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};


api.listarInfNotas = async function (req, res, next) {

	logger.debug("Inicio listar");
	let con = await this.controller.getConnection(null, req.UserId);

	try {

		logger.debug("Parametros recebidos:", req.body);

		let IDG051 =  req.body.IDG051;

		let result = await con.execute(
			{
				sql: `
				select g043.* from g051 g051
				join g052 g052 on g052.idg051 = g051.idg051
				join g043 g043 on g043.idg043 = g052.idg043
				 where G051.idg051 = ${IDG051}
				`,

				param: {}
			})
			.then((result) => {
				logger.debug("Retorno:", result);
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				logger.error("Erro:", err);
				throw err;
			});

		await con.close();
		logger.debug("Fim listar");
		return result;

	} catch (err) {

		await con.closeRollback();
		err.stack = new Error().stack + `\r\n` + err.stack;
		logger.error("Erro:", err);
		throw err;

	}

};

api.listarInfMovimento = async function (req, res, next) {

	logger.debug("Inicio listar");
	let con = await this.controller.getConnection(null, req.UserId);

	try {

		logger.debug("Parametros recebidos:", req.body);

		let IDG051 =  req.body.IDG051;

		let result = await con.execute(
			{
				sql: `   select distinct G046.idg046,  g046.stcarga, to_char(g046.dtcarga, 'DD/MM/YYYY HH24:MI') AS dtcarga, g046.dscarga,  g046.idcarlog,  G024.nmtransp || ' [' || g024.idg024 || '-' || g024.idlogos || ']' as nmtransp, g024.idlogos, g051.idg051
				from G051 G051
				join G046 G046 on G046.idG046 = G051.idG046
				join G048 G048 on G048.idg046 = G046.idg046
				join G049 G049 on G049.idg048 = G048.idg048 
                join G024 G024 on G024.idG024 = G046.idg024 
                where g051.idg051 = ${IDG051}
				`,

				param: {}
			})
			.then((result) => {
				logger.debug("Retorno:", result);
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				logger.error("Erro:", err);
				throw err;
			});

		await con.close();
		logger.debug("Fim listar");
		return result;

	} catch (err) {

		await con.closeRollback();
		err.stack = new Error().stack + `\r\n` + err.stack;
		logger.error("Erro:", err);
		throw err;

	}

};

	return api;
};
