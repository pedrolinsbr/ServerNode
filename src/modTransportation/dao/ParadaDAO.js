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

			var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G048',false);

			if (sqlWhere == ''){
				sqlWhere = `Where G048.IDG046 = ${req.body.IDG046} `;
			}else{
				sqlWhere += `and G048.IDG046 = ${req.body.IDG046} `;
			}

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

			let result = await con.execute(
				{
					sql: ` Select Distinct G048.IDG048,
					G048.IDG046,
					G048.NRSEQETA,
					G048.PSDELETA,
					G048.QTDISPER,
					G048.IDG005OR,
					G048.IDG005DE,
					G048.DTPREORI,
					G048.DTPREATU,
					G048.DTINIETA,
					G048.DTFINETA,
					G048.IDINTOPE,
					G048.STINTCLI,
					G048.QTVOLCAR,
					G048.STINTINV,
					G048.IDG024,
					G048.QTDISTOD,

					G046.DTCOLATU,

					G043.IDG043,

					G051.IDG051,
					G051.CDCTRC,
					G051.DTENTPLA,
					G051.STCTRC,
					G051.DTEMICTR,
					G051.NRSERINF,
					G051.NRPESO,
					G051.VRMERCAD,
					G051.NRCHADOC,

					' [' || g002DE.CDESTADO || ']'||  g002DE.nmestado as nmestadoDE,
					g003DE.nmcidade as nmcidadeDE,

					(select min(G043.DTENTCON) from G043 G043
                    join G049 G049 On G049.IDG043 = G043.IDG043
                   where G049.IDG048 = G048.IDG048) As DTENTCON,

					(select min(G043.DTENTREG) from G043 G043
                    join G049 G049 On G049.IDG043 = G043.IDG043
									 where G049.IDG048 = G048.IDG048) As dtentreg,
									 
									 FN_DATA_SLA(G051.IDG051) As DTSLA,

					g005OR.NMCLIENT AS NMCLIENTOR,
					g005DE.NMCLIENT AS NMCLIENTDE,

					g024.NMTRANSP   || ' [' || g024.idg024   || ']'  as NMTRANSP,
					g024AT.NMTRANSP || ' [' || g024AT.idg024 || ']'  as NMTRANSPAT,

					COUNT(g048.IDG048) OVER () as COUNT_LINHA
					From g048 g048 
				
					Join g005 g005OR On g005OR.IDG005 = g048.IDG005OR
					Join g005 g005DE On g005DE.IDG005 = g048.IDG005DE 

					Join g003 g003DE On g003DE.IDG003 = g005DE.idg003
					Join g002 g002DE On g002DE.IDG002 = g003DE.idg002

					left Join G046 G046   On G046.idg046   = g048.idg046
					left Join G049 G049   On G049.idg048   = g048.idg048
					left Join G051 G051   On G051.idg051   = g049.idg051
				
					Join g024 g024   On g024.IDG024   = g051.IDG024
					LEFT Join g024 g024AT   On g024AT.IDG024   = g048.IDG024
					`+
					sqlWhere + ` order by g048.idg048 `+
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


api.listarInfParada = async function (req, res, next) {

	logger.debug("Inicio listar");
	let con = await this.controller.getConnection(null, req.UserId);

	try {

		logger.debug("Parametros recebidos:", req.body);



		let result = await con.execute(
			{
				sql: ` Select Distinct G051.IDG051	,
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
				G051.TPTRANSP	,
				G051.CDCARGA	,
				G051.IDG046		,
				G051.IDG059		,
				G051.STLOGOS	,
				G051.SNLOTACA	,
				G051.CDSATISF	,
				G051.IDG024AT	,
				G051.SNPRIORI	,
				G051.NRPESO		,

				g005RE.NMCLIENT AS NMCLIENTRE,
				g005DE.NMCLIENT AS NMCLIENTDE,
				g005RC.NMCLIENT AS NMCLIENTRC,
				g005EX.NMCLIENT AS NMCLIENTEX,
				g005CO.NMCLIENT AS NMCLIENTCO,

				g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,

				g024AT.NMTRANSP || ' [' || g024AT.idg024 || '-' || g024AT.idlogos || ']'  as NMTRANSPAT, G032.DSVEICUL,G031.NMMOTORI,G031.NRMATRIC,

				g005RE.dsendere as dsendereRE,
				g005RE.biendere as biendereRE,
				g005RE.nrlatitu as nrlatituRE,
				g005RE.nrlongit as nrlongitRE,
				g005RE.CJCLIENT as CJCLIENTRE,
				g002RE.nmestado as nmestadoRE,
				g005RE.cpendere as cpendereRE,
				g003RE.nmcidade as nmcidadeRE,
				g003RE.cdmunici as cdmuniciRE,
				g005RE.ieclient as ieclientRE,

				g005DE.dsendere as dsendereDE,
				g005DE.biendere as biendereDE,
				g005DE.nrlatitu as nrlatituDE,
				g005DE.nrlongit as nrlongitDE,
				g005DE.CJCLIENT as CJCLIENTDE,
				g002DE.nmestado as nmestadoDE,
				g005DE.cpendere as cpendereDE,
				g003DE.nmcidade as nmcidadeDE,
				g003DE.cdmunici as cdmuniciDE,
				g005DE.ieclient as ieclientDE,


				g005RC.dsendere as dsendereRC,
				g005RC.biendere as biendereRC,
				g005RC.nrlatitu as nrlatituRC,
				g005RC.nrlongit as nrlongitRC,
				g005RC.CJCLIENT as CJCLIENTRC,
				g002RC.nmestado as nmestadoRC,
				g005RC.cpendere as cpendereRC,
				g003RC.nmcidade as nmcidadeRC,
				g003RC.cdmunici as cdmuniciRC,
				g005RC.ieclient as ieclientRC,


				g005EX.dsendere as dsendereEX,
				g005EX.biendere as biendereEX,
				g005EX.nrlatitu as nrlatituEX,
				g005EX.nrlongit as nrlongitEX,
				g005EX.CJCLIENT as CJCLIENTEX,
				g002EX.nmestado as nmestadoEX,
				g005EX.cpendere as cpendereEX,
				g003EX.nmcidade as nmcidadeEX,
				g003EX.cdmunici as cdmuniciEX,
				g005EX.ieclient as ieclientEX,

				g005CO.dsendere as dsendereCO,
				g005CO.biendere as biendereCO,
				g005CO.nrlatitu as nrlatituCO,
				g005CO.nrlongit as nrlongitCO,
				g005CO.CJCLIENT as CJCLIENTCO,
				g002CO.nmestado as nmestadoCO,
				g005CO.cpendere as cpendereCO,
				g003CO.nmcidade as nmcidadeCO,
				g003CO.cdmunici as cdmuniciCO,
				g005CO.ieclient as ieclientCO,


				COUNT(g051.IDG051) OVER () as COUNT_LINHA
				From g051 g051   
				Join G052 G052   On G052.idg051   = g051.idg051
				/*Join g043 g043   on G052.idg043   = g043.idg043 
				 And g043.dtentreg Is Null */
				Join g005 g005RE On g005RE.IDG005 = g051.IDG005RE
				Join g005 g005DE On g005DE.IDG005 = g051.IDG005DE 
				Join g005 g005RC On g005RC.IDG005 = g051.IDG005RC 
				Join g005 g005EX On g005EX.IDG005 = g051.IDG005EX
				Join g005 g005CO On g005CO.IDG005 = g051.IDG005CO

				Join g003 g003RE On g003RE.IDG003 = g005RE.idg003
				Join g003 g003DE On g003DE.IDG003 = g005DE.idg003
				Join g003 g003RC On g003RC.IDG003 = g005RC.idg003
				Join g003 g003EX On g003EX.IDG003 = g005EX.idg003
				Join g003 g003CO On g003CO.IDG003 = g005CO.idg003

				Join g002 g002RE On g002RE.IDG002 = g003RE.idg002
				Join g002 g002DE On g002DE.IDG002 = g003DE.idg002
				Join g002 g002RC On g002RC.IDG002 = g003RC.idg002
				Join g002 g002EX On g002EX.IDG002 = g003EX.idg002
				Join g002 g002CO On g002CO.IDG002 = g003CO.idg002

				Join g024 g024   On g024.IDG024   = g051.IDG024
				Join g024 g024AT On g024AT.IDG024 = g051.IDG024AT


				join G046 G046 on G046.idG046 = G051.idG046
				left join g032 g032 on G046.idg032v1 = G032.idg032
				left join g031 g031 on G046.idg031m1 = G031.idg031
				where g051.idg051=${ req.body.IDG051}
				
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

api.listarInfProdutos = async function (req, res, next) {

	logger.debug("Inicio listar");
	let con = await this.controller.getConnection(null, req.UserId);

	try {

		logger.debug("Parametros recebidos:", req.body);

		let IDG043 =  req.body.IDG043;

		let result = await con.execute(
			{
				sql: `
				select 
					G045.IDG045,
					G045.IDG043,
					g045.vrunipro,
					G045.NRORDITE,
					g045.IDG009PS,
					g045.PSBRUTO,
					g045.IDG009UM,
					g045.VRVOLUME,
					g045.DSINFAD,
					g045.CDLOCVEN,
                    
					--g010.IDG015,
					g010.CDNCM,
					g010.SNINFLAM,
					g010.TPORIPRO,
					g010.DTCADAST,
					--g010.IDG014,
					--g010.IDG038,
					--g010.STENVOTI,
					--g010.IDG037,
                    
					nvl(g010.dsprodut, g045.dsprodut) as dsprodut,
					nvl(g010.DSREFFAB, g045.DSREFFAB) as DSREFFAB,
					nvl(g015.NRONU,g045.NRONU) as NRONU,
					g009PS.CDUNIDAD as IDG009PS,
					g009UM.CDUNIDAD as IDG009UM

					from g051 g051

					inner join g052 g052 on g052.idg051 = g051.idg051
					inner join g043 g043 on g043.idg043 = g052.idg043
					inner join g045 g045 On g045.idg043 = g043.idg043
                    inner join g009 g009UM on g045.idg009UM = g009UM.idg009
                    inner join g009 g009PS on g045.idg009PS = g009PS.idg009
					left  join g010 g010 On g010.IDG010 = g045.IDG010 and G010.IDG010<>0 and g010.sndelete = 0
					left  join g015 g015 on g015.idg015 = g010.idg015
					where G043.idg043 = ${IDG043} and g045.sndelete = 0
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



api.listarNotaRaioX = async function (req, res, next) {
	let con = await this.controller.getConnection(null, req.UserId);
	//console.log(req.body);

	let wherePrevisao = '';
	
	if(req.body['parameter[DTPREENT]'] != undefined && req.body['parameter[DTPREENT]'] != false){
		wherePrevisao = `And (Case 
							When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) > CURRENT_DATE Then
								To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
							When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
								Case 
									When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
										To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
									Else
										'n.i.'
								End
							Else
								'n.i.'
						End) = '${req.body['parameter[DTPREENT]']}'`;
		delete req.body['parameter[DTPREENT]'];
	}else{
		wherePrevisao = '';
	}

	//Filtro para visualizar todas as transportadoras da nota ou apenas a ultima
	// let SNTRANSP = req.body['parameter[SNTRANSP]'];

	// let auxWhere;

	// delete req.body['parameter[SNTRANSP]'];

	//filtra,ordena,pagina

	var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

	// if(SNTRANSP == 1){
	//   sqlWhere = sqlWhere + `  And G051.SnDelete = 0 And G051.StCtrc = 'A' And G024.SnDelete = 0 `;
	//   auxWhere = '';
	// }else{
	//   sqlWhere = sqlWhere + `  And G051.SnDelete = 0 And G051.StCtrc = 'A' `;
	//   auxWhere = 'And G024.SnDelete = 0';
	// }

	sqlWhere = sqlWhere + `  And G051.SnDelete = 0 And G051.StCtrc = 'A' `;


	var user = null;
	if(req.UserId != null){
	  user = req.UserId;
	}else if(req.headers.ids001 != null){
	  user = req.headers.ids001;
	}else if(req.body.ids001 != null){
	  user = req.body.ids001;
	}


	var acl1 = '';
	acl1 = await acl.montar({
	  ids001: user,
	  dsmodulo: 'transportation',
	  nmtabela: [{
		G024: 'G024'
	  }],
	  //dioperad: ' ',
	  esoperad: 'And '
	});

	if(typeof acl1 == 'undefined'){
		acl1 = '';
	}


	try {
		let result = await con.execute(
			{
				sql: `Select  Distinct G043.IDG043,
											G051.IDG051,
											G051.IDI015,
											G014.IDG014,
											G043.CDDELIVE,
											--G046.IDG024 As TRANSP_CARGA,
											--G046.IDG046 As G046_IDG046,
											Nvl(G051.CDCTRC, '0') As G051_CDCTRC,
											Nvl(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'), 'n.i.') As G051_DTEMICTR,
											Nvl(G043.NRNOTA, '0') As NRNOTA,
											Nvl(TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY'), 'n.i.') AS DTEMINOT,
											Nvl(TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY'), 'n.i.') AS DTBLOQUE,
											Nvl(TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY'), 'n.i.') AS DTDESBLO,
											Nvl(To_Char(G051.DTAGENDA, 'DD/MM/YYYY'), 'n.i.') As G051_DTAGENDA, /* Data Agendada */
											Nvl(To_Char(G051.DTCOMBIN, 'DD/MM/YYYY'), 'n.i.') As G051_DTCOMBIN, /* Data Combinada */
											Nvl(To_Char(G051.DTROTERI, 'DD/MM/YYYY'), 'n.i.') As G051_DTROTERI, /* Data Roteirizada */
											G051.DTENTPLA,
										 
											Case
												When(
												Case 
													When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
													To_Date(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
													When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
													Case 
														When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
														To_Date(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
													End
												End) < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null Then
													Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
												Else
												Case 
													When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
													To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
													When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
													Case 
														When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
														To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
													Else
														'n.i.'
													End
												Else
													'n.i.'
												End 
											End As G051_DTPREENT, /* Data de Previsão de Entrega */

											G043.NRCHADOC,
											G043.IDG005RE,
											G005RE.NMCLIENT As G005RE_NMCLIENTRE,
											G005RE.RSCLIENT As G005RE_RSCLIENTRE,
											G005RE.CJCLIENT As G005RE_CJCLIENTRE,
											G003RE.NMCIDADE As G003RE_NMCIDADERE,
											G002RE.NMESTADO As G002RE_NMESTADORE,
											G043.IDG005DE,
											G005DE.NMCLIENT As G005DE_NMCLIENTDE,
											G005DE.RSCLIENT As G005DE_RSCLIENTDE,
											G005DE.CJCLIENT As G005DE_CJCLIENTDE,
											G003DE.NMCIDADE As G003DE_NMCIDADEDE,
											G002DE.NMESTADO As G002DE_NMESTADODE,
											G043.DSMODENF, /* Modelo da Nota */
											G043.NRSERINF, /* Serie da Nota */
											G043.TPDELIVE, /* Tipo da Nota */
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
												'n.i.'
											End As G051_TPTRANSP, /* Tipo de Operação */
											TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') AS DTDELIVE,
											Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.') As DTENTCON,
											Nvl(TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY'), 'n.i.') As DTENTREG,
											/*Case
												When G051.CDCARGA Is Not Null and G024.NMTRANSP Is Null Then
												'CARGA GERADA PELO LOGOS'
												When G051.CDCARGA Is Null and G024.NMTRANSP Is Null Then
												'NF SEM CARGA'
												Else
												G024.NMTRANSP
											End As G024_NMTRANSP,*/
											--Nvl(G046.CDVIAOTI, 0) As G046_CDVIAOTI,
											Nvl(G051.IDG046, 0) As G051_IDG046,
											G051.IDG005CO,
											G005CO.NMCLIENT As G005CO_NMCLIENTCO,
										 (SELECT * FROM (
											 SELECT 
												G046.IDG046
												FROM G046 G046
													LEFT JOIN G048 G048 ON (G046.IDG046 = G048.IDG046)
													LEFT JOIN G049 G049 ON (G049.IDG048 = G048.IDG048)
													
													WHERE G049.IDG051 = G051.IDG051 AND (G046.TPMODCAR = 2 OR G046.TPMODCAR = 3) AND G046.STCARGA <> 'C'
													ORDER BY G046.DTCARGA DESC
											) X WHERE ROWNUM <= 1) AS G046_IDG046,
											(Select Count(*)
												From A005 A005
												Join A001 A001
													On (A001.IDA001 = A005.IDA001)
												Join A002 A002
													On (A001.IDA002 = A002.IDA002)
												Where A005.IDG043 = G043.IDG043
													And A002.IDA008 = 1) As A001_QTD_ATENDIMENTOS,
											(Select Count(*)
												From A005 A005
												Join A001 A001
													On (A001.IDA001 = A005.IDA001)
												Join A002 A002
													On (A001.IDA002 = A002.IDA002)
												Where A005.IDG043 = G043.IDG043
													And A002.IDA008 = 2) As A001_QTD_OCORRENCIAS,
											G043.SNAG, /* Indicador de AG */
											COUNT(G043.IDG043) OVER() as COUNT_LINHA
						From G043 G043
						Join G052 G052 On (G052.IDG043 = G043.IDG043)
						Join G051 G051 On (G052.IDG051 = G051.IDG051)

						Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
						Left Join A001 A001 On (A001.IDA001 = A005.IDA001)
						Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
						Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
						
						Left Join G005 G005RE On (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
						Left Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
						Left Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
						Left Join G005 G005DE On (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
						Left Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
						Left Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
						Left Join G022 G022   On ( ((G022.IdG005 = G051.IdG005CO) or (G022.IdG005 = G043.IdG005RE)) AND NVL(G022.SNINDUST,1) = 1)
						Left Join G014 G014   On G014.IdG014 = G022.IdG014
						Left Join G005 G005CO On (G051.IDG005CO = G005CO.IDG005)
						--Left Join G046 G046   On (G051.IDG046 = G046.IDG046)
						--Left Join G024 G024   On (G046.IDG024 = G024.IDG024)
						/* O LEFT ABAIXO FAZ CASE QUE PEGA CTE E SE NÃO TIVER PEGA O NOTA */
						--Left Join G049 G049   On (G049.IDG043 = G043.IDG043 and G049.Idg051 is null) Or G049.IDG051 = G051.IDG051
						Left Join G049 G049   On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
						Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
						Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
						Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
						LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
						LEFT JOIN G032 G032 ON G032.IDG030 = G030.IDG030

						 `+
						sqlWhere + wherePrevisao + acl1 +
						`
						Group By 
							g043.dsmodenf,
							G043.IDG043,
							G051.IDG051,
							G051.IDI015,
							G043.CDDELIVE,
							G051.CDCTRC,
							G051.DTEMICTR,
							G043.NRNOTA,
							G043.DTEMINOT,
							G043.DTBLOQUE,
							G043.DTDESBLO,
							G051.DTAGENDA,
							G051.DTCOMBIN,
							G051.DTROTERI,
							G043.NRCHADOC,
							G043.IDG005RE,
							G005RE.NMCLIENT,
							G005RE.RSCLIENT,
							G005RE.CJCLIENT,
							G003RE.NMCIDADE,
							G002RE.NMESTADO,
							G043.IDG005DE,
							G005DE.NMCLIENT,
							G005DE.RSCLIENT,
							G005DE.CJCLIENT,
							G003DE.NMCIDADE,
							G002DE.NMESTADO,
							G043.DSMODENF, 
							G043.NRSERINF, 
							G043.TPDELIVE, 
							G051.DTCALDEP,
							G051.DTENTPLA,
							G051.DTCALANT,
							G043.DTENTCON,
							G051.TPTRANSP,
							G043.DTDELIVE,
							G043.DTENTCON,
							G043.DTENTREG,
							--G024.NMTRANSP,
							--G046.CDVIAOTI,
							G051.IDG046,
							G051.IDG005CO,
							G005CO.NMCLIENT,
							G014.IDG014,
							G043.SNAG/*,
							G051.CDCARGA,
							G046.IDG046*/


						` +
						sqlOrder +
						sqlPaginate,
							param: bindValues
			})
			.then((result) => {
				// Alterar a Ordenação depois de você testar
				// ` Order By G043.DTEMINOT Desc `
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				console.log(err);
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
			await con.close(); 
			return result;
	} catch (err) {
		await con.closeRollback();
		err.stack = new Error().stack + `\r\n` + err.stack;
		throw err;
	}
};

api.listarPorCargaRaioX = async function (req, res, next) {
	let con = await this.controller.getConnection(null, req.UserId);
	//console.log(req.body);
	//filtra,ordena,pagina
	var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);
	try {

		var user = null;
		if(req.UserId != null){
		  user = req.UserId;
		}else if(req.headers.ids001 != null){
		  user = req.headers.ids001;
		}else if(req.body.ids001 != null){
		  user = req.body.ids001;
  		}
		  
		//user = 1399;
		
		var acl1 = '';
		acl1 = await acl.montar({
		  ids001: user,
		  dsmodulo: 'transportation',
		  nmtabela: [{
			G024: 'G024'
		  }],
		  //dioperad: ' ',
		  esoperad: 'And '
		});

		if(typeof acl1 == 'undefined'){
			acl1 = '';
		}


		let result = await con.execute(
			{
				sql: `Select distinct
				G046.Idg046,
				G046.Dscarga,
				G046.Idg024,
				G046.Dtcarga,
				G046.Dtsaicar,
				G046.Dtpresai,
				G046.Ids001,
				G046.Sndelete,
				G046.Tpcarga,
				G046.Idg030,
				G046.Dtagenda,
				G046.Stintcli,
				G046.Sncarpar,
				G046.Obcancel,
				G046.Ids001ca,
				G046.Dtcancel,
				G046.Snurgent,
				G046.Idg028,
				--G048.IDG048,

				G028.Nmarmaze   || ' [' || G046.Idg028  || ']'  as Nmarmaze,

				G046.Dtcolori,
				G046.Dtcolatu,
				G046.Tporigem,
				G046.Stenvlog,

				S001.Nmusuari   || ' [' || S001.idS001  || ']'  as Nmusuari,

				G030.Dstipvei,
				G031m1.Nmmotori As Nmmotori1,
				G032v1.Dsveicul As Dsveiculv1,
				G046.DTPSMANU,
				G046.IDG034,
				G046.IDCARLOG,

				(select (COUNT(G048C.IDG048)) FROM G048 G048C where G046.IDG046 = G048C.IDG046) as QTDPARA,

				G046.TPMODCAR,
				G046.TPTRANSP,
				NVL(G046.DTCOLATU,G046.DTCOLORI) as DTCOLETA,
				(select nvl(sum(idg024),0) from g048 g048A where g048A.idg046 = G046.idg046) as SNCRODOC,
				g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,

				Count(G046.Idg046) Over() As COUNT_LINHA
			From G046 G046
			Left Join G024 G024
				On G024.Idg024 = G046.Idg024
			Left Join S001 S001
				On S001.Ids001 = G046.Ids001
			Left Join G030 G030
				On G030.Idg030 = G046.Idg030
			Left Join S001 S001ca
				On S001ca.Ids001 = G046.Ids001ca
			Left Join G028 G028
				On G028.Idg028 = G046.Idg028

			Left Join G031 G031m1
				On G031m1.Idg031 = G046.Idg031m1
			Left Join G031 G031m2
				On G031m2.Idg031 = G046.Idg031m2
			Left Join G031 G031m3
				On G031m3.Idg031 = G046.Idg031m3

			Left Join G032 G032v1
				On G032v1.Idg032 = G046.Idg032v1
			Left Join G032 G032v2
				On G032v2.Idg032 = G046.Idg032v2
			Left Join G032 G032v3
				On G032v3.Idg032 = G046.Idg032v3	
				

			Join g048 g048 On g048.idg046 = g046.idg046
			Join g049 g049 On g049.idg048 = g048.idg048
			Join g051 g051 On g051.idg051 = g049.idg051
			
						 `+
						sqlWhere +
						acl1 +
						sqlOrder +
						sqlPaginate,
							param: bindValues
			})
			.then((result) => {
				// Alterar a Ordenação depois de você testar
				// ` Order By G043.DTEMINOT Desc `
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
			await con.close(); 
			return result;
	} catch (err) {
		await con.closeRollback();
		err.stack = new Error().stack + `\r\n` + err.stack;
		throw err;
	}
};

api.listarPorConhecimentoRaioX = async function (req, res, next) {
	let con = await this.controller.getConnection(null, req.UserId);
	//console.log(req.body);
	//filtra,ordena,pagina
	var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);
	
	try {


		var user = null;
		if(req.UserId != null){
		  user = req.UserId;
		}else if(req.headers.ids001 != null){
		  user = req.headers.ids001;
		}else if(req.body.ids001 != null){
		  user = req.body.ids001;
		}
		  
  
		var acl1 = '';
		acl1 = await acl.montar({
		  ids001: user,
		  dsmodulo: 'transportation',
		  nmtabela: [{
			G024: 'G024'
		  }],
		  //dioperad: ' ',
		  esoperad: 'And '
		});

		if(typeof acl1 == 'undefined'){
			acl1 = '';
		}

		let result = await con.execute(
			{
				sql: `Select Distinct G051.IDG051		,
				G051.NRCHADOC	,
				G051.DSMODENF	,
				G051.NRSERINF	,
				G051.CDCTRC		,
				G051.VRTOTFRE	,
				G051.VRFRETEP	,
				G051.DTEMICTR	,
				G051.VRMERCAD	,
				G051.STCTRC		,
				G051.SNDELETE	,
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
				G051.STLOGOS	,
				G051.IDG024AT	,
				G051.SNPRIORI	,
				G051.IDG046,
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
				Join G046 G046 ON G046.IDG046 = G051.IDG046
					`+
				sqlWhere +
				acl1 +
				sqlOrder +
				sqlPaginate,
					param: bindValues
			})
			.then((result) => {
				// Alterar a Ordenação depois de você testar
				// ` Order By G043.DTEMINOT Desc `
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
			await con.close(); 
			return result;
	} catch (err) {
		await con.closeRollback();
		err.stack = new Error().stack + `\r\n` + err.stack;
		throw err;
	}
};

	return api;
};
