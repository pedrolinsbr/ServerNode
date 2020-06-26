/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de cargas
 * @author Desconhecido
 * @since 01/08/2018
 *
*/

/**
 * @module dao/Mobile
 * @description G046.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

	var api        = {};
	var utils      = app.src.utils.FuncoesObjDB;
	var utilsCurl  = app.src.utils.Utils;
	var dicionario = app.src.utils.Dicionario;
	var dtatu      = app.src.utils.DataAtual;
	var acl        = app.src.modIntegrador.controllers.FiltrosController;
	var logger     = app.config.logger;
	api.controller = app.config.ControllerBD;
	

	/**
	 * @description Listar dados da tabela G046.
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

		try {

			logger.debug("Parametros recebidos:", req.body);

			var snDesLog = req.body['parameter[SNDESLOG][id]'];

			var snVira = req.body['parameter[G046_SNVIRA][id]'];

			delete req.body['parameter[SNDESLOG][id]'];
			delete req.body['parameter[SNDESLOG][text]']

			delete req.body['parameter[G046_SNVIRA][id]'];
            delete req.body['parameter[G046_SNVIRA][text]'];


			if(snDesLog == undefined){
				snDesLog = 0;
			}

			if (snVira == undefined) {
                snVira = 0;
            }


			var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G046',true);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

			

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


			var sqlWhereAux = "";

			if (snDesLog == 1) {
				sqlWhereAux += " AND G046.IDCARLOG is not null ";
			}else if (snDesLog == 2) {
				sqlWhereAux += " AND G046.IDCARLOG is null ";
			}else if (snDesLog) {
				sqlWhereAux += " ";
			}

			if (snVira == 2) { // nao
                sqlWhereAux += " AND G046.SNVIRA = 'N' ";
            } else if (snVira == 1) { //sim
                sqlWhereAux += " AND G046.SNVIRA = 'S' ";
            } else if (snVira == 0) { //todos
                sqlWhereAux += " ";
            }


			// STATUS CARGA
			var G046_STCARGA = [];
			if (bindValues.G046_STCARGA) {

				for (var key in bindValues.G046_STCARGA) {

					G046_STCARGA[key] = "'"+bindValues.G046_STCARGA[key]['id']+"'";

				}

				G046_STCARGA = G046_STCARGA.join(',');

				sqlWhereAux += " AND G046.STCARGA in ("+G046_STCARGA+") ";

				sqlWhere = sqlWhere.replace("G046.STCARGA = :G046_STCARGA And", "");
				delete bindValues.G046_STCARGA;

			}


			let	sql= `select y.*, y.QTNOTENT || '/' || y.QTNOTAS as QTREAXENT from (Select distinct
								G046.Idg046,
								G046.Dscarga,
								G046.Idg031m1,
								G046.Idg031m2,
								G046.Idg031m3,
								G046.Idg032v1,
								G046.Idg032v2,
								G046.Idg032v3,
								G046.Idg024,
								G046.Cdviaoti,
								G046.Snescolt,
								G046.Dtcarga,
								G046.Dtsaicar,
								G046.Dtpresai,
								G046.Pscarga,
								G046.Vrcarga,
								G046.Ids001,
								G046.Sndelete,
								G046.Qtvolcar,
								G046.Tpcarga,
								G046.Qtdisper,
								G046.Vrporocu,
								G046.Idg030,
								G046.Dtagenda,
								G046.Stcarga,
								G046.Stintcli,
								G046.Sncarpar,
								G046.Obcancel,
								G046.Ids001ca,
								G046.Dtcancel,
								G046.Snurgent,
								G046.Idg028,
								g046.snvira,

								G028.Nmarmaze   || ' [' || G046.Idg028  || ']'  as Nmarmaze,

								G046.Dtcolori,
								G046.Dtcolatu,
								G046.Tporigem,
								G046.Stenvlog,

								S001.Nmusuari   || ' [' || S001.idS001  || ']'  as Nmusuari,

								G030.Dstipvei,
								S001ca.Nmusuari As Nmusuarica,
								G031m1.NMMOTORI || ' [' || G031m1.IDG031 || '-' || G031m1.NRMATRIC || ']' as NMMOTORI1 ,
								G031m2.Nmmotori As Nmmotori2,
								G031m3.Nmmotori As Nmmotori3,
								G032v1.Dsveicul || ' [' || G032v1.idg032   || '-' || G032v1.nrfrota   || ']' As Dsveiculv1,
								/*G032v1.Dsveicul As Dsveiculv1,*/
								G032v2.Dsveicul As Dsveiculv2,
								G032v3.Dsveicul As Dsveiculv3,
								S001GF.NMUSUARI aS IDS001GF,
								G046.DTPSMANU,
								G046.STPROXIM,
								G046.IDG034,
								G046.VRPERCAR,
								G046.IDCARLOG,

								G046.dtinivia,
								G046.dtfimvia,

								g024.NMTRANSP   || ' [' || g024.idg024   || '-' || g024.idlogos   || ']'  as NMTRANSP,

								(Select Count(A001.IDA001)
								From A005 A005
								Join A001 A001
									On (A001.IDA001 = A005.IDA001)
								Join A002 A002
									On (A001.IDA002 = A002.IDA002)
								Where A005.IDG043 in (Select G049.IDG043
									From G049 G049
									Join g048 g048 On g048.idg048 = g049.idg048
									Where g048.IDG046 in (G046.Idg046))
									And A002.IDA008 = 2) As QTDOCOR,

									(Select count(G049.IDG043)
									From G049 G049
									Join g048 g048 On g048.idg048 = g049.idg048 AND g048.idg046 = G046.Idg046) AS QTNOTAS,
									
									(Select count(G049.IDG043)
									From G049 G049
									Join g048 g048 On g048.idg048 = g049.idg048 AND g048.idg046 = G046.Idg046
									Join g043 g043 On g043.idg043 = g049.idg043
									Where g043.DTENTMOB IS NOT null) AS QTNOTENT,
									
									(SELECT count(G082.IDG082) 
			                          FROM G082 G082
			                          Join g043 g043 On g043.idg043 = G082.PKS007
			                          Join G049 G049 On g043.idg043 = g049.idg043
			                          Join g048 g048 On g048.idg048 = g049.idg048 AND g048.idg046 = G046.Idg046
			                         WHERE G082.PKS007 = g049.idg043
			                           /*AND G082.IDS001 = 1159*/
			                           AND G082.IDS007 = 31 
			                           AND G082.TPDOCUME = 'CTO'
									   AND G082.SNDELETE = 0) AS QTNOTCAN,
									   
									   (select s043x.NRVERSAO from m001 m001x 
										Join G031 G031x on G031x.IDG031 = M001x.IDG031
										Left Join s043 s043x on (s043x.IDS043 = M001x.IDS043) 
										WHERE G031M1.IDG031 = M001x.IDG031 
										AND m001x.SNDELETE = 0 
										and STQRCODE = 'U'
										and rownum <= 1) AS NRVERSAO,
										
										(select m001x.DTENTSYN 
										   from m001 m001x 
										  WHERE G031M1.IDG031 = M001x.IDG031 AND rownum <= 1) AS DTENTSYN,


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

							Left Join S001 S001GF
								On S001GF.Ids001 = G032V1.IDS001GF
								

							Left Join g048 g048 On g048.idg046 = g046.idg046
							Left Join g049 g049 On g049.idg048 = g048.idg048
							Left Join g051 g051 On g051.idg051 = g049.idg051
							left Join g043 g043 On g043.idg043 = g049.idg043

							Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
							Left Join A001 A001 On (A001.IDA001 = A005.IDA001)
							Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
							Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
							

								
							`+ sqlWhere + acl1 + sqlWhereAux + ` and g046.snmobile = 'S' and g046.stcarga in ('S', 'D', 'T') 
							
							/*and tpmodcar = 1*/
							
							Order by g046.idg046 desc) y `;

							let resultCount = await con.execute(
								{
									sql: ` select count(x.IDG046) as QTD from (`+sql +`) x `,
									param: bindValues
								})
								.then((result) => {
									logger.debug("Retorno:", result);
									return result[0];
								})
								.catch((err) => {
									err.stack = new Error().stack + `\r\n` + err.stack;
									logger.error("Erro:", err);
									throw err;
								});
				

				let result = await con.execute(	

					{			sql:sql +
                    /*sqlOrder +*/
                    sqlPaginate,
          param: bindValues
        })
				.then((result) => {
					logger.debug("Retorno:", result);
					if(result.length > 0){
						result[0].COUNT_LINHA = resultCount.QTD;
					}
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
	 * @description Quantidade de situação de cargas
	 *
	 * @async
	 * @function api/validaCancelar
	 * @param {request} req - Possui as requisições para a função.
	 * @param {response} res - A resposta gerada na função.
	 * @param {next} next - Caso haja algum erro na rota.
	 * @return {JSON} Retorna um objeto JSON.
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	 */

	api.qtdSituacaoMobile = async function (req, res, next) {

		logger.debug("Inicio quantidade situação mobile");
		let con = await this.controller.getConnection(null, req.UserId);

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
			  esoperad: 'And'
			});

			if(typeof acl1 == 'undefined'){
				acl1 = '';
			}

			var id = req.body.IDG046;
			logger.debug("Parametros buscar:", req.body);

			let result = await con.execute(
			{
				sql: `Select (select Count(*) 
				from g046 g046
				join g024 g024 on g024.idg024 = g046.idg024
				where g046.SNMOBILE = 'S'  
				and g046.stcarga in ('S', 'D', 'T')  
				${acl1}
				/*and g046.tpmodcar = 1*/) as Total,

				(select Count(*)
				from g046 g046
				join g024 g024 on g024.idg024 = g046.idg024
			 where g046.SNMOBILE = 'S'
				 and g046.dtinivia is null
				 and g046.dtfimvia is null
				 and g046.stcarga = 'S'  
				 ${acl1}
				 /*and g046.tpmodcar = 1*/) as Aguardando,


				(select Count(*)
					 from g046 g046
					 join g024 g024 on g024.idg024 = g046.idg024
					where g046.SNMOBILE = 'S'
						and g046.dtinivia is not null
						and g046.dtfimvia is null
						and g046.stcarga = 'T'  
						${acl1}
						/*and g046.tpmodcar = 1*/) as Inicio,

				(select Count(*)
					 from g046 g046
					 join g024 g024 on g024.idg024 = g046.idg024
					where g046.SNMOBILE = 'S'
						and g046.dtinivia is not null
						and g046.dtfimvia is not null
						and g046.stcarga = 'D'  
						${acl1}
						/*and g046.tpmodcar = 1*/) as Fim
	 From dual
					`,

				param: []
			})
			.then((result) => {
				return result;
				})
				.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
				});
				
				await con.close();
				console.log("Fim quantidade de situação do mobile")
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
