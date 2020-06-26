/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
 */

/** 
 * @module dao/OcorrenciaCarga
 * @description G067.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
 */
module.exports = function (app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    var utilsCurl  = app.src.utils.Utils;
    api.controller = app.config.ControllerBD;
    const tmz = app.src.utils.DataAtual;


    /**
     * @description Listar um dado na tabela G067.
     *
     * @async
     * @function api/buscar
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */


    

    

    //Suporte Helpdesk SLA
    api.verificaSLA  = async function (req, res, next) { 
        try {
            logger.debug("Inicio envioOtimizadorManual");

            var con = await this.controller.getConnection(null, req.UserId);
			
			
			var objResult = {};
			//# Informações Deliverys
			var verificaDeliverys = await con.execute({
					sql: `
					SELECT G043.IDG043,
							G043.CDDELIVE,
							G043.DTLANCTO,
							G043.DTDELIVE,
							G043.TPDELIVE,
							G005DE.idg003, 
							'' as ROTAS
					FROM G043 G043
					INNER JOIN G005 G005DE
						ON G005DE.IDG005 = NVL(G043.IDG005RC,
												G043.IDG005DE)
					INNER JOIN G003 G003DE
						ON G003DE.IDG003 = G005DE.IDG003
					WHERE G043.IDG043 IN (${req.body.IDG043}) `,
	
					param: []
				}).then((res) => {
					return res;
				}).catch((err) => {
					throw err;
				});
				
				objResult.delivery = verificaDeliverys;

				if(verificaDeliverys.length > 0){
					
					for (let j = 0; j < verificaDeliverys.length; j++) {
	
						
						var dataSLA = null;
						var dataVenctoRot = null;
	
						var verificaDados = await con.execute({
							sql: `
								SELECT Z.IDG003,
										Z.IDG024,
										SUM(Z.SNDIA0) AS SNDIA0,
										SUM(Z.SNDIA1) AS SNDIA1,
										SUM(Z.SNDIA2) AS SNDIA2,
										SUM(Z.SNDIA3) AS SNDIA3,
										SUM(Z.SNDIA4) AS SNDIA4,
										SUM(Z.SNDIA5) AS SNDIA5,
										SUM(Z.SNDIA6) AS SNDIA6,
										Z.IDG043
								FROM (SELECT Y.*
										FROM (SELECT X.*,
														
														(T002SNDIA0 + T002SNDIA1 + T002SNDIA2 + T002SNDIA3 +
														T002SNDIA4 + T002SNDIA5 + T002SNDIA6) AS T002SN
												FROM (SELECT T002.*,
																T002.SNDIA0 AS T002SNDIA0,
																T002.SNDIA1 AS T002SNDIA1,
																T002.SNDIA2 AS T002SNDIA2,
																T002.SNDIA3 AS T002SNDIA3,
																T002.SNDIA4 AS T002SNDIA4,
																T002.SNDIA5 AS T002SNDIA5,
																T002.SNDIA6 AS T002SNDIA6,
																G043.IDG043
														
														FROM G043 G043
														
														INNER JOIN G005 G005DE
															ON G005DE.IDG005 =
																NVL(G043.IDG005RC,
																	G043.IDG005DE)
														INNER JOIN G003 G003DE
															ON G003DE.IDG003 = G005DE.IDG003
														
														INNER JOIN G002 G002DE
															ON G002DE.IDG002 = G003DE.IDG002
														
														INNER JOIN T002 T002
															ON T002.IDG003 = G005DE.IDG003
														
														INNER JOIN T001 T001
															ON T001.IDT001 = T002.IDT001
														
														INNER JOIN G005 G005RE
															ON G005RE.IDG005 = G043.IDG005RE
														
														JOIN G084 G084
															ON G005RE.IDG028 = G084.IDG028
															AND G084.IDG024 = T002.IDG024
														
														WHERE G043.IDG043 = ${verificaDeliverys[j].IDG043}
															AND T001.SNDELETE = 0
															AND T002.SNDELETE = 0
														
														) X) Y
										
										WHERE Y.T002SN >= 1
										
										ORDER BY T002SNDIA0 DESC,
												T002SNDIA1 DESC,
												T002SNDIA2 DESC,
												T002SNDIA3 DESC,
												T002SNDIA4 DESC,
												T002SNDIA5 DESC,
												T002SNDIA6 DESC) Z
								GROUP BY Z.IDG003,
										Z.IDG024,
										Z.IDG043 `,
							param: []
						}).then((res) => {
							return res;
						}).catch((err) => {
							throw err;
						});
						
						objResult.delivery[j].ROTAS = verificaDados;
						

						var dataProximaRota = 9;
						var dataAgora = new Date();
				
						if(verificaDados.length > 0){
							
							var diaAux = dataAgora.getDay();
	
							for (let k = 0; k < 7; k++) {
	
								if(verificaDados[0]['SNDIA'+diaAux] != 0){
									dataProximaRota = diaAux;
									break;
								}
	
								if(diaAux >= 6){
									diaAux = 0
								}else{
									diaAux++;
								}
	
							}
				
						}else{
							dataProximaRota = 9;
						}
				
						var qtdDiasAte = 0;

						objResult.delivery[j].DATAATUAL = dataAgora;
						objResult.delivery[j].DIAATUAL = dataAgora.getDay();
						objResult.delivery[j].DIASELECIONADOROTA = dataProximaRota;
						
						
						//# Caso não exista rota para a delivery, utiliza-se o dia atual
						if(dataProximaRota != 9){
	
							if(dataAgora.getDay() == dataProximaRota){ //# mesmo dia
								qtdDiasAte = 0;
					
							}else if(dataAgora.getDay() > dataProximaRota){ //# maior, vai virar a semana
								qtdDiasAte = (dataProximaRota - dataAgora.getDay());
								
							}else if(dataAgora.getDay() < dataProximaRota){ //# menor, mesma semana
								qtdDiasAte = (dataAgora.getDay() - 7 ) + dataProximaRota;
							}
							
							objResult.delivery[j].QTDDIASATEPROXIMA = qtdDiasAte;

							for (let i = 0; i < qtdDiasAte; i++) {
								dataAgora.setDate(dataAgora.getDate() + 1);
							}
						}
				
						dataVenctoRot = dataAgora;

						objResult.delivery[j].DATAVENCIMENTOROTA = dataVenctoRot;
	
						//# Mais um dia para a coleta
						dataAgora.setDate(dataAgora.getDate() + 1);

						objResult.delivery[j].DATACOLETA = dataAgora;


						/*

							cade o prazo ?

						
						
						*/

						objResult.delivery[j].DATASLA = dataAgora;


						//# Verifica dia útil
						dataAgora   = await utilsCurl.addDiasUteis(dataAgora, 0, verificaDeliverys[j].IDG003);
						dataSLA 	= dataAgora;

						objResult.delivery[j].DATASLAUTIL = dataAgora;
						
						

						/*

							SNOTIMAN: 1,
							STETAPA:  1,
							DTENTCON: dataSLA,
							DTENTCON: (dataSLA ? dtatu.retornaData(dataSLA, "DD/MM/YYYY HH:mm:ss") : null)	, 
							DTVENROT: dataVenctoRot,
						
						*/
				
						dataSLA = null;
						dataVenctoRot = null;
	
					}
	
				}else{
	
					res.status(500);
					await con.closeRollback();
					return { response: "Nenhuma delivery encontrada" };
	
				}
				
				await con.close();
				return objResult;
				
	
			}catch (err) {
				await con.closeRollback();
				err.stack = new Error().stack + `\r\n` + err.stack;
				logger.error("Erro:", err);
				throw err;
			}


    };

    return api;
};