/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 29/06/2018
 *
*/

/**
 * @module dao/gestaoRecurso
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



	api.listarFrota = async function (req, res, next) {

		logger.debug("Inicio listar");
		let con = await this.controller.getConnection(null, req.UserId);

		try {

			logger.debug("Parametros recebidos:", req.body);

			var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G032',false);

			logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

			let result = await con.execute(
				{
					sql: `  Select
					DTLICAMB /* Validade de Licença Ambiental  */, Nvl2(DTLICAMB, (DTLICAMB - To_Date(current_date, 'DD/MM/YY')), -1) As IsLICAMB,
					DTCERREG /* Val. certif. de reg. IBAMA */,     Nvl2(DTCERREG, (DTCERREG - To_Date(current_date, 'DD/MM/YY')), -1) As IsCERREG,
					DTTESTAC /* Validade Teste Tacografo */,       Nvl2(DTTESTAC, (DTTESTAC - To_Date(current_date, 'DD/MM/YY')), -1) As IsTESTAC,
					DTTESFUM /* Data de validade teste fumaça */,  Nvl2(DTTESFUM, (DTTESFUM - To_Date(current_date, 'DD/MM/YY')), -1) As IsTESFUM,
					DTVALANT /* Validade ANTT */,                  Nvl2(DTVALANT, (DTVALANT - To_Date(current_date, 'DD/MM/YY')), -1) As IsVALANT,
					DTAETBIT /* Validade Licença AET DNIT */,      Nvl2(DTAETBIT, (DTAETBIT - To_Date(current_date, 'DD/MM/YY')), -1) As IsAETBIT,
					DTLIESSP /* Validade da licença esp. SP */,    Nvl2(DTLIESSP, (DTLIESSP - To_Date(current_date, 'DD/MM/YY')), -1) As IsLIESSP,
					DTAETGO  /* Validade Licença AET GO */,        Nvl2(DTAETGO , (DTAETGO  - To_Date(current_date, 'DD/MM/YY')), -1) As IsAETGO,
					DTAETMG  /* Validade Licença AET  MG */,       Nvl2(DTAETMG , (DTAETMG  - To_Date(current_date, 'DD/MM/YY')), -1) As IsAETMG,
					DTAETSP  /* Validade Licença AET SP */,        Nvl2(DTAETSP , (DTAETSP  - To_Date(current_date, 'DD/MM/YY')), -1) As IsAETSP,
					DTVALEX2 /* Validade do extintor de 2KG */,    Nvl2(DTVALEX2, (DTVALEX2 - To_Date(current_date, 'DD/MM/YY')), -1) As IsVALEX2,
					DTVALE12 /* Validade extintor 12KG */,         Nvl2(DTVALE12, (DTVALE12 - To_Date(current_date, 'DD/MM/YY')), -1) As IsVALE12,
					DTVALCAP /* Validade do capacete  */,          Nvl2(DTVALCAP, (DTVALCAP - To_Date(current_date, 'DD/MM/YY')), -1) As IsVALCAP,
					DTVALPIL /* Validade da pilha da lanterna */,  Nvl2(DTVALPIL, (DTVALPIL - To_Date(current_date, 'DD/MM/YY')), -1) As IsVALPIL,
					DTMASFAC /* Validade da máscara semifacia  */, Nvl2(DTMASFAC, (DTMASFAC - To_Date(current_date, 'DD/MM/YY')), -1) As IsMASFAC,
					DTEX12BI /* Validade extintor 12KG bitrem */,  Nvl2(DTEX12BI, (DTEX12BI - To_Date(current_date, 'DD/MM/YY')), -1) As IsEX12BI,
					DTCHELIS /* Data do Checklist */,              Nvl2(DTCHELIS, (DTCHELIS+30 - To_Date(current_date, 'DD/MM/YY')), -1) As IsCHELIS,
					QTCAPPES,
					G032.IdG030,
					G032.dsveicul,
					'1' as snlibera
					From G032 G032
					Join G030 G030 On G030.IdG030 = G032.IdG030
				   Where G030.SnDelete = 0 
					 And G032.SnDelete = 0
					 
					`+
					sqlWhere + 
					sqlOrder +
					sqlPaginate,

					param: bindValues
				})
				.then((result) => {
					logger.debug("Retorno:", result);
					return result;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					logger.error("Erro:", err);
					throw err;
				});


				if(result.length > 0){
					for (let i = 0; i < result.length; i++) {
					  if(result[i].ISLICAMB < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISCERREG < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISTESTAC < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISTESFUM < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISVALANT < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISAETBIT < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISLIESSP < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISAETGO  < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISAETMG  < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISAETSP  < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISVALEX2 < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISVALE12 < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISVALCAP < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISVALPIL < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISMASFAC < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISEX12BI < 0) { result[i].SNLIBERA = 0; }
					  if(result[i].ISCHELIS < 0) { result[i].SNLIBERA = 0; }
					}
				  }

				

			await con.close();
			return (utils.construirObjetoRetornoBD(result));
			//logger.debug("Fim listar");
			//return result;

		} catch (err) {

			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;

		}

	};


	return api;
};
