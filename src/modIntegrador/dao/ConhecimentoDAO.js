/**
 * @description Possui os métodos Listar, Salvar, Atualizar, Buscar e Deletar da tabela G051 - Conhecimento.
 * @author Filipe Freitas Tozze
 * @since 29/11/2017
*/

/**
 * @module dao/Conhecimento
 * @description Função para realizar o CRUD da tabela G051 - Conhecimento.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Conhecimento
*/
module.exports = function (app, cb) {

	var api = {};
	var utils = app.src.utils.FuncoesObjDB;
	var db = app.config.database;

	/**
	* @description Contém o SQL que requisita os dados da tabela G051.
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

		var params = req.query;
		var arrOrder = [];

		if (params.order != null) {
			params.order.forEach(function (order) {
				arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
			})
			arrOrder = arrOrder.join();
		} else {
			arrOrder = 'G051.IDG051';
		}

		return await db.execute(
			{
				sql: `SELECT 
								G051.IDG051,
								G051.IDG005RE,
								G051.IDG005DE,
								G051.IDG005RC,
								G051.IDG005EX,
								G051.IDG005CO,
								G051.IDG024,
								G051.NRCHADOC,
								G051.DSMODENF,
								G051.NRSERINF,
								G051.CDCTRC,
								G051.VRTOTFRE,
								G051.VRFRETEP,
								G051.VRFRETEV,
								G051.VRPEDAGI,
								G051.VROUTROS,
								G051.DTEMICTR,
								G051.VRMERCAD,
								G051.VRSECCAT,
								G051.STCTRC,
								G051.VRTOTPRE,
								G051.VROPERAC,
								G051.VRBASECA,
								G051.PCALIICM,
								G051.VRICMS,
								G051.BSISSQN,
								G051.VRISSQN,
								G051.VRISSQST,
								G051.PCALIISS,
								G051.VRDESCON,								
								COUNT(G051.IDG051) OVER () AS COUNT_LINHA
							FROM  G051 
							WHERE G051.SNDELETE = 0
							ORDER BY ` + arrOrder,
				param: []
			})
			.then((result) => {
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				throw err;
			});
	};

	/**
	* @description Contém o SQL que insere os dados da tabela G051.
	*
	* @async
	* @function api/listar
	* @param {request} req - Possui as requisições para a função.
	* @param {response} res - A resposta gerada na função.
	* @param {next} next - Caso haja algum erro na rota.
	* @return {JSON} Retorna um objeto JSON.
	* @throws Caso falso, o número do log de erro aparecerá no console.
	*/
	api.salvar = async function (req, res, next) {

		await db.execute(
			{
				sql: `ALTER SESSION SET TIME_ZONE = '+00:00'`,
				param: []
			});

		return await db.insert({
			tabela: 'G051',
			colunas: {
				IDG005RE: 	req.IDG005RE,
				IDG005DE: 	req.IDG005DE,
				IDG005RC: 	req.IDG005RC,
				IDG005EX: 	req.IDG005EX,
				IDG005CO: 	req.IDG005CO,
				IDG024: 	req.IDG024,
				NRCHADOC: 	req.NRCHADOC,
				DSMODENF: 	req.DSMODENF,
				NRSERINF: 	req.NRSERINF,
				CDCTRC: 	req.CDCTRC,
				VRTOTFRE: 	req.VRTOTFRE,
				VRFRETEP: 	req.VRFRETEP,
				VRFRETEV: 	req.VRFRETEV,
				VRPEDAGI: 	req.VRPEDAGI,
				VROUTROS: 	req.VROUTROS,
				VRSECCAT: 	req.VRSECCAT,
				VROPERAC: 	req.VROPERAC,
				DTEMICTR: 	req.DTEMICTR,
				VRMERCAD: 	req.VRMERCAD,
				STCTRC: 	req.STCTRC,
				VRTOTPRE: 	req.VRTOTPRE,
				VRBASECA: 	req.VRBASECA,                         
				PCALIICM: 	req.PCALIICM,
				VRICMS: 	req.VRICMS,
				BSISSQN: 	req.BSISSQN,
				VRISSQN: 	req.VRISSQN,
				VRISSQST: 	req.VRISSQST,
				PCALIISS: 	req.PCALIISS,
				VRDESCON: 	req.VRDESCON,
				DSINFCPL:	req.DSINFCPL,
				DTENTPLA:	req.DTENTPLA,
				TPTRANSP:	req.TPTRANSP,
				SNLOTACA:	req.SNLOTACA,
				IDG059:		req.IDG059,
				STINTCLI:	req.STINTCLI,
				IDG024AT: 	req.IDG024AT,
				NRPESO: 	req.NRPESO,
				IDG046:     req.IDG046,
				DTCOLETA:   req.DTCOLETA,
				NRINTSUB:   req.NRINTSUB,
				QTDIAENT:   req.QTDIAENT,
				CDOCORRE:   req.CDOCORRE
			},
			key: 'IDG051'
		})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	/**
* @description Vincular delivery ao conhecimento tabela G052 gravando na G051 e G043.
*
* @async
* @function api/listar
* @param {request} req - Possui as requisições para a função.
* @param {response} res - A resposta gerada na função.
* @param {next} next - Caso haja algum erro na rota.
* @return {JSON} Retorna um objeto JSON.
* @throws Caso falso, o número do log de erro aparecerá no console.
*/
	api.vincularDeliveryAoConhecimento = async function (req, res, idg83) {

		return await db.execute(
			{
				sql: `INSERT INTO G052 (IDG051, IDG043, IDG083) VALUES ('${req.idg051}', '${req.idg043}', '${idg83}')`,
				param: []
			})
			.then((result) => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	};

	api.vincularDeliveryAoConhecimentoUpdate = async function (req, res, idg83) {

		return await db.execute(
			{
				sql: `UPDATE G052 SET IDG083 = '${idg83}' WHERE IDG051 = '${req.idg051}' AND IDG043 = '${req.idg043}'`,
				param: []
			})
			.then((result) => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	};

	api.buscarCTEpersonalizado = async function (busca) {
		return await db.execute(
			{
				sql: `SELECT 
									CTE.IDG051 AS ID_CONHECIMENTO,
									CTE.IDG024 AS ID_TRANSPORTADORA,
									CTE.CDCTRC AS NR_CONHECIMENTO,
									CTE.NRSERINF AS SERIE,
									CTE.DSMODENF AS MODELO
							FROM G051 CTE
							WHERE 
									CTE.CDCTRC   = '${busca.nrConhe}' AND
									CTE.NRSERINF = '${busca.serie}'   AND
									CTE.DSMODENF = '${busca.modelo}'  AND        
									CTE.SNDELETE =  0`,
				param: []
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				throw err;
			});
	}

	api.cancelar = async function (id_conhecimento) {
		return await db.execute(
			{
				sql: `UPDATE 
									G051
							SET STCTRC = 'C'
							WHERE IDG051 = ${id_conhecimento}
								AND	G051.SNDELETE = 0`,
				param: []
			})
			.then((result) => {
				return true;
			})
			.catch((err) => {
				throw err;
			});
	}

	api.removeVinculoConhecimento = async function (id_conhecimento) {

        return await db.execute(
            {
                sql: `UPDATE 
                            G049
                            SET IDG051 = ''
                            WHERE IDG051 = ${id_conhecimento}`,
                param: []
            })
            .then((result) => {
                return true;
            })
            .catch((err) => {
                throw err;
            });
	}
	
	api.validaSeExiteCte = async function (req, res, next) {
		var validaCte = await db.execute({
			sql: `SELECT G051.IDG051
					FROM G051 G051
				  WHERE G051.CDCTRC = '${req.body.cdctrc}'
				  AND G051.NRSERINF =  '${req.body.nrserinf}'
				  AND G051.DSMODENF = '${req.body.dsmodenf}'
				  AND G051.IDG024 = (SELECT G024.IDG024 FROM G024 G024 WHERE G024.IDLOGOS = '${req.body.cdempres}'  and G024.Idg023 = 2)`,
			param: []
		}).then((result) => {
			if(result.length == 1){
				return result[0];
			}else{
				return null;
			}
			
		}).catch((err) => {
			throw err;
			})
		
		return validaCte;
		
	}

	api.atualizaCteInterface = async function (validaCteExistente, req) {
	
		await db.execute(
			{
				sql: `ALTER SESSION SET TIME_ZONE = '+00:00'`,
				param: []
			});

		return await db.update({
			tabela: 'G051',
			colunas: {
				IDG024:   req.IDG024,
				NRCHADOC: req.NRCHADOC,
				DSMODENF: req.DSMODENF,
				NRSERINF: req.NRSERINF,
				CDCTRC:   req.CDCTRC,
				VRTOTFRE: req.VRTOTFRE,
				VRFRETEP: req.VRFRETEP,
				VRFRETEV: req.VRFRETEV,
				VRPEDAGI: req.VRPEDAGI,
				VROUTROS: req.VROUTROS,
				VRSECCAT: req.VRSECCAT,
				VROPERAC: req.VROPERAC,
				DTEMICTR: req.DTEMICTR,
				VRMERCAD: req.VRMERCAD,
				STCTRC:   req.STCTRC,
				DSINFCPL: req.DSINFCPL,
				DTENTPLA: req.DTENTPLA,
				TPTRANSP: req.TPTRANSP,
				SNLOTACA: req.SNLOTACA,
				IDG059:	  req.IDG059,
				STINTCLI: req.STINTCLI,
				IDG024AT: req.IDG024AT,
				NRPESO:   req.NRPESO,
				IDG046:   req.IDG046,
				DTCOLETA: req.DTCOLETA,
				NRINTSUB: req.NRINTSUB,
				PSLOTACA: req.PSLOTACA,
				CDOCORRE: req.CDOCORRE,
			},
			condicoes: 'IDG051 = ' + validaCteExistente.IDG051 ,
		})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				throw err;
			});
	};

	api.validaSeExiteVinculoNotaCte = async function (req, res, idg83) {

		var validaCte = await db.execute({
			sql: `SELECT G052.IDG051, G052.IDG043, G052.IDG083
					FROM G052 G052
				  WHERE G052.IDG051 = ${req.idg051} 
							AND G052.IDG043 = ${req.idg043}
							AND G052.IDG083 = ${idg83}`,
			param: []
		}).then((result) => {
			return result;
		}).catch((err) => {
			throw err;
			})
		
		return validaCte;
		
	}

	api.etapaPorConhecimento = async function (id_conhecimento) {
		return await db.execute({
			sql: `  SELECT DISTINCT
					  G048.IDG048 AS ID_PARADA,
					  G049.IDG049 AS ID_DELIV_PARADA,
					  G043.IDG043 AS ID_DELIVERY,
					  G051.IDG051 AS ID_CONHECIMENTO
	
					FROM
					  G051 G051
	
					JOIN
					  G052 G052
					  ON G052.IDG051 = G051.IDG051
	
					JOIN
					  G043 G043
					  ON G043.IDG043 = G052.IDG043
	
					JOIN
					  G049 G049
					  ON G049.IDG043 = G043.IDG043
	
					JOIN
					  G048 G048
					  ON G048.IDG048 = G049.IDG048
	
					WHERE
					  G051.IDG051 = ${id_conhecimento}  AND
					  G051.SNDELETE = 0`,
			param: []
		  })
		  .then((result) => {
			return result;
		  })
		  .catch((err) => {
			throw err;
		  });
	  }

	  api.mudarFlagInvoice = async function (req, res, next) {

		//------------------------------------------\\

		switch (req.stInteracao) {
			case 1: //CRIAÇÃO
				req.idEvento = 15;
				break;
				
			case 3: //CANCELAMENTO
				req.idEvento = 27;
				break;

			default:
				req.idEvento = 0;				
				break;
		}

		if (req.idEvento > 0) await api.salvarEvento(req, res, next);

		//------------------------------------------\\

		await db.update({
			tabela: 'G048',
			colunas: { STINTINV: req.stInteracao },
			condicoes: `IDG048 = ${req.idParada} AND STINTINV = ` + (req.stInteracao - 1),
			parametros: {}
		})

		.catch((err) => {
			throw err;
		});
	}

	api.salvarEvento = async function (req, res, next) {
		var data = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');

		await db.execute({
			sql: `INSERT INTO I008 (IDG043, DTEVENTO, IDI001)
							SELECT IDG043, TO_DATE('${data}', 'YYYY-MM-DD HH24:MI:SS'), 
							${req.idEvento} FROM G049 WHERE IDG048 = ${req.idParada}`,
			param: []
		})

		.catch((err) => {
			throw err;
		});
	}

	api.vincularCteComCarga = async function (idConhecimento, idDeliverys) {
		
		var envOti = await db.execute({
			sql: `UPDATE G049
					SET IDG051 = ${idConhecimento}
				  WHERE IDG043 in (${idDeliverys}) 
				  AND IDG051 IS NULL `,
			param: [],
			type: "UPDATE"
		}).then((result) => {
			return result;
		}).catch((err) => {
			throw err;
		})

		return true;
	}

	api.buscaTranspPorCj = async function (req, res, next) {
		return await db.execute(
		{
		  sql: `SELECT 
					  G024.IDG024, 
					  G024.CJTRANSP, 
					  G024.IETRANSP 
				FROM G024
				WHERE G024.CJTRANSP = '${req.cjtransp}'
				  AND G024.IETRANSP = '${req.ietransp}'`,
		  param: [],
		})
		.then((result) => {
		  if(Object.keys(result).length > 0){
			return (result[0]);
		  }else{
			return (result);
		  }
		  
		})
		.catch((err) => {
		  throw err;
		}); 
	}

	api.verificarVinculoCte = async function (objDelivery, res, next) {
		return await db.execute({
			sql: `select count(distinct G049.IDG043) as qtd_nf, count(distinct G046.IDG046 ) as qtd_carga,
			             G046.IDG046,g049.IDG051
						from G049 G049
						join G048 G048
							on G048.IDG048 = G049.IDG048
						join G046 G046
							on G046.IDG046 = G048.IDG046
						join G043 G043
							on G043.IDG043 = G049.IDG043
					where G043.idg043 in (${objDelivery})
						AND LENGTH(G043.CDdelive) = 11
						and g049.IDG051 is not null
						and G046.SnDelete = 0
						and G043.SnDelete = 0
						and G046.StCarga <> 'C'
					Group by G046.IDG046,g049.IDG051`,
			param: []
		}).then((result) => {
			return (result);
		})
		.catch((err) => {
			throw err;
		});
		
	}

	return api;
}