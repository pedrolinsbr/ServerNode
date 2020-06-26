module.exports = function (app) {
	
	var api = {};
	api.controller = app.config.ControllerBD;

	api.getViagens = async function (req, res, next) {
		let con = await this.controller.getConnection(null);
		
		let IDG046 = 1039075;

		try {
			let result = await con.execute({
				sql: `
				/*SELECT * FROM (*/
				Select Distinct G046.IDG046, /* Código da Carga */
								G046.DTCARGA,
								G046.CDVIATRA, /* Código viagem trafegus */
								G046.VRCARGA, /* Valor Total da Carga */
								G046.PSCARGA, /* Peso da Carga */
								G046.DSCARGA, /* Peso da Carga */
								G046.QTDISPER, /* Distância da Carga */
								G024.CJTRANSP, /* CNPJ da Transportadora */
								G046.DTPRESAI,

								G003OR.CDMUNICI AS IBGEOR, 
								G003DE.CDMUNICI AS IBGEDE, 

								/* 4PL:27 e 3PL:26*/

								CASE g046.TPMODCAR 
									WHEN 1 THEN '26'
									ELSE '40' 
								END AS PGR_VIAGEM,
								

								/*7 AS PGR_VIAGEM,*/
									
								G048DE.IDG048,
								/* Motoristas e Veículos */

								REPLACE(REPLACE(REPLACE(REPLACE(G031_1.CJMOTORI,'-'),'.'),'_'),'+') As CJMOTORI0, /* CPF do Motorista 1 */
								G031_1.CJMOTORI As CJMOTORI1, /* CPF do Motorista 1 */
								G031_2.CJMOTORI As CJMOTORI2, /* CPF do Motorista 2 */
								G031_3.CJMOTORI As CJMOTORI3, /* CPF do Motorista 3 */


								REPLACE(REPLACE(nvl(G032_1.NRPLAVEI,G046.NRPLAVEI),'-'),' ') As NRPLAVEI0, /* Número da Placa 1 */
								REPLACE(REPLACE(nvl(G032_1.NRPLAVEI,G046.NRPLAVEI),'-'),' ') As NRPLAVEI1, /* Número da Placa 1 */
								REPLACE(G032_2.NRPLAVEI,'-') As NRPLAVEI2, /* Número da Placa 2 */
								REPLACE(G032_3.NRPLAVEI,'-') As NRPLAVEI3, /* Número da Placa 3 */

								(select listagg(REPLACE(REPLACE(a.NRPLAVEI,'-'),' '), ',') within group (order by a.NRPLAVEI) from g032 a join g026 b on b.idg032cr = a.idg032 where b.idg032cv = G032_1.idg032) as dsplacar,
								
								(REPLACE(REPLACE(G046.NRPLARE1,'-'),' ') ||',' || REPLACE(REPLACE(G046.NRPLARE2,'-'),' ')) as dsplacar2,

								/* Origem */
								G024.IDG003     As IDG003OR, /* Código da Cidade */
								G028.NMARMAZE   As NMCIDADEOR, /* Nome da Cidade */
								G024.DSENDERE   As DSENDEREOR, /* Descrição do Endereço da Origem */
								G024.NRENDERE   As NRENDEREOR, /* Número da Origem */
								G024.DSCOMEND   As DSCOMENDOR, /* Complemento da Origem */
								G024.BIENDERE   As BIENDEREOR, /* Bairro da Origem */
								G024.CPENDERE   As CPENDEREOR, /* Cep da Origem */
								G002OR.CDESTADO As CDESTADOOR, /* Estado da Origem */
								G001OR.NMPAIS   As NMPAISOR, /* Nome do País Origem */
								G028.NRLATITU   As NRLATITUOR, /* Latitude Origem */
								G028.NRLONGIT   As NRLONGITOR, /* Longitude Origem */

								/* Destinatário */
								G005DE.IDG003   As IDG003DE, /* Código da Cidade Destinatário */
								G003DE.NMCIDADE As NMCIDADEDE, /* Nome da Cidade Destinatário */
								G005DE.DSENDERE As DSENDEREDE, /* Descrição do Endereço da Destinatário */
								G005DE.NRENDERE As NRENDEREDE, /* Número da Destinatário */
								G005DE.DSCOMEND As DSCOMENDDE, /* Complemento da Destinatário */
								G005DE.BIENDERE As BIENDEREDE, /* Bairro da Destinatário */
								G005DE.CPENDERE As CPENDEREDE, /* Cep da Destinatário */
								G002DE.CDESTADO As CDESTADODE, /* Estado da Destinatário */
								G001DE.NMPAIS   As NMPAISDE, /* Nome do País Destinatário */
								nvl(G005DE.NRLATITU, G003DE.NRLATITU) As NRLATITUDE, /* Latitude Destinatário */
								nvl(G005DE.NRLONGIT, G003DE.NRLONGIT) As NRLONGITDE /* Longitude Destinatário */

				From G046 G046 /* Carga */
				Join G048 G048 /* Paradas */
					On (G048.IDG046 = G046.IDG046)
				Join G048 G048DE /* Paradas Destinatário */
					On (G048DE.IDG046 = G046.IDG046 And
					G048DE.NRSEQETA =
					(Select Max(G048DE_2.NRSEQETA)
						From G048 G048DE_2
						Where G048DE_2.IDG046 = G048DE.IDG046))
				Join G005 G005DE /* Cliente Destinatário */
					On (G005DE.IDG005 = G048DE.IDG005DE)
				Join G003 G003DE /* Cidade do Destinatário */
					On (G003DE.IDG003 = G005DE.IDG003)
				Join G002 G002DE /* Estado do Destinatário*/
					On (G002DE.IDG002 = G003DE.IDG002)
				Join G001 G001DE /* País Destinatário */
					On (G001DE.IDG001 = G002DE.IDG001)
				Left Join G049 G049 
					On (G049.IDG048 = G048.IDG048)
				Join G024 G024 /* Transportadora */
					On (G024.IDG024 = G046.IDG024)
				Join G023 G023
					On (G023.IDG023 = G024.IDG023)
				Join G003 G003OR /* Cidade Origem */
					On (G003OR.IDG003 = G024.IDG003)
				Join G002 G002OR /* Estado Origem */
					On (G002OR.IDG002 = G003OR.IDG002)
				Join G001 G001OR /* País Origem */
					On (G001OR.IDG001 = G002OR.IDG001)
				Left Join G032 G032_1 /* Veículos 1 */
					On (G032_1.IDG032 = G046.IDG032V1)
				Left Join G032 G032_2 /* Veículos 2 */
					On (G032_2.IDG032 = G046.IDG032V2)
				Left Join G032 G032_3 /* Veículos 3 */
					On (G032_3.IDG032 = G046.IDG032V3)
				Left Join G031 G031_1 /* Motoristas 1 */
					On (G031_1.IDG031 = G046.IDG031M1)
				Left Join G031 G031_2 /* Motoristas 2 */
					On (G031_2.IDG031 = G046.IDG031M2)
				Left Join G031 G031_3 /* Motoristas 3 */
					On (G031_3.IDG031 = G046.IDG031M3)
				Join G028 G028 /* Armazém */
					On (G028.IDG028 = G046.IDG028)

				Where /*G046.IDG046 = :id
				And G023.SNTRAINT = 1
				And*/ G046.STCARGA in ('S', 'T')
				/*and G046.tpmodcar = 1
				  and G031_1.CJMOTORI is not null*/
				and G046.CDVIATRA is null
				AND G046.DTCARGA >= to_Date('10/06/2019', 'DD/MM/YYYY')
				and REPLACE(nvl(G032_1.NRPLAVEI,G046.NRPLAVEI),'-') not in ('ABC1234', 'AAA0101', 'AAA0000')
				and REPLACE(REPLACE(G031_1.CJMOTORI,'.'),'-') not in ('11111111145')
				and G024.IDG024 in (27,1014) /*GRANELEIRO - primeiro teste*/
				
				/*AND g046.idg046 IN (1043512,
					1043508,
					1043574,
					1043575)*/
				
				Group BY 
					G046.IDG046, /* Código da Carga */
					G046.CDVIATRA, /* Código viagem trafegus */
					G046.VRCARGA, /* Valor Total da Carga */
					G046.PSCARGA, /* Peso da Carga */
					G046.DSCARGA, /* Peso da Carga */
					G046.QTDISPER, /* Distância da Carga */
					G024.CJTRANSP, /* CNPJ da Transportadora */
					G046.DTPRESAI,
					g046.TPMODCAR,
					G048DE.IDG048,
					G031_1.CJMOTORI, /* CPF do Motorista 1 */
					G031_2.CJMOTORI, /* CPF do Motorista 2 */
					G031_3.CJMOTORI, /* CPF do Motorista 3 */
					G032_1.NRPLAVEI,
					G046.NRPLAVEI, /* Número da Placa 1 */
					G032_1.NRPLAVEI,
					G046.NRPLAVEI, /* Número da Placa 1 */
					G032_2.NRPLAVEI, /* Número da Placa 2 */
					G032_3.NRPLAVEI, /* Número da Placa 3 */
					G046.NRPLARE1,
					G046.NRPLARE2,
					G024.IDG003 , /* Código da Cidade */
					G003OR.NMCIDADE , /* Nome da Cidade */
					G024.DSENDERE , /* Descrição do Endereço da Origem */
					G024.NRENDERE , /* Número da Origem */
					G024.DSCOMEND , /* Complemento da Origem */
					G024.BIENDERE , /* Bairro da Origem */
					G024.CPENDERE , /* Cep da Origem */
					G002OR.CDESTADO , /* Estado da Origem */
					G001OR.NMPAIS  , /* Nome do País Origem */
					G028.NRLATITU  , /* Latitude Origem */
					G028.NRLONGIT  , /* Longitude Origem */
					G005DE.IDG003, /* Código da Cidade Destinatário */
					G003DE.NMCIDADE, /* Nome da Cidade Destinatário */
					G005DE.DSENDERE, /* Descrição do Endereço da Destinatário */
					G005DE.NRENDERE, /* Número da Destinatário */
					G005DE.DSCOMEND, /* Complemento da Destinatário */
					G005DE.BIENDERE, /* Bairro da Destinatário */
					G005DE.CPENDERE , /* Cep da Destinatário */
					G002DE.CDESTADO , /* Estado da Destinatário */
					G001DE.NMPAIS , /* Nome do País Destinatário */
					G005DE.NRLATITU, 
					G003DE.NRLATITU, /* Latitude Destinatário */
					G005DE.NRLONGIT, 
					G003DE.NRLONGIT,  /* Longitude Destinatário */
					G032_1.IDG032,

					G003OR.CDMUNICI,
					G003DE.CDMUNICI,
					G028.NMARMAZE,
					G046.DTCARGA
					
				Having Count(G049.Idg043) = (Select Count(G043.Idg043)
																			From G049 G049
																	Join G048 G048
																			On G049.Idg048 = G048.Idg048
																	Join G046  G046x
																			on G046x.idg046 = G048.idg046
																			and G046x.stcarga <> 'C'
																	join G043
																			on G043.idg043 = G049.Idg043
																	Join G052 G052
																			On G052.Idg043 = G043.Idg043
																	Join G051 G051
																			On G051.Idg051 = G052.Idg051
																			And G051.Stctrc = 'A'
																			And G051.Sndelete = 0
																	Where G048.Idg046 = G046.Idg046) /*) x WHERE rownum = 2 */`,
				param: []
				// param: {
				// 	id:IDG046
				// }
			})
			.then((result) => {
				return result;
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

	api.getDestinosViagens = async function (idg046) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute({
				sql: `
				Select Distinct 
						/* Destinatário */
						G005DE.IDG003   As IDG003DE, /* Código da Cidade Destinatário */
						G003DE.NMCIDADE As NMCIDADEDE, /* Nome da Cidade Destinatário */
						G005DE.DSENDERE As DSENDEREDE, /* Descrição do Endereço da Destinatário */
						G005DE.NRENDERE As NRENDEREDE, /* Número da Destinatário */
						G005DE.DSCOMEND As DSCOMENDDE, /* Complemento da Destinatário */
						G005DE.BIENDERE As BIENDEREDE, /* Bairro da Destinatário */
						G005DE.CPENDERE As CPENDEREDE, /* Cep da Destinatário */
						G002DE.CDESTADO As CDESTADODE, /* Estado da Destinatário */
						G001DE.NMPAIS   As NMPAISDE, /* Nome do País Destinatário */
						nvl(G005DE.NRLATITU, G003DE.NRLATITU) As NRLATITUDE, /* Latitude Destinatário */
						nvl(G005DE.NRLONGIT, G003DE.NRLONGIT) As NRLONGITDE, /* Longitude Destinatário */
						G048DE.NRSEQETA,
						G003DE.CDMUNICI,
						G048DE.IDG048
				From G046 G046 /* Carga */
				Join G048 G048DE /* Paradas */
					On (G048DE.IDG046 = G046.IDG046)
				Join G005 G005DE /* Cliente Destinatário */
					On (G005DE.IDG005 = G048DE.IDG005DE)
				Join G003 G003DE /* Cidade do Destinatário */
					On (G003DE.IDG003 = G005DE.IDG003)
				Join G002 G002DE /* Estado do Destinatário*/
					On (G002DE.IDG002 = G003DE.IDG002)
				Join G001 G001DE /* País Destinatário */
					On (G001DE.IDG001 = G002DE.IDG001)
				Left Join G049 G049 
					On (G049.IDG048 = G048DE.IDG048)
					Where G046.IDG046 = :id 
						and G048DE.NRSEQETA NOT IN (Select Max(G048AX.NRSEQETA)
						From G048 G048AX
					Where G048AX.IDG046 = G046.IDG046)
					ORDER BY G048DE.NRSEQETA`,
				param: {
					id:idg046
				}
			})
			.then((result) => {
				return result;
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

	api.getInfoCtrc = async function (idg048) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute({
				sql: `
				  SELECT G051.CDCTRC, 
						 G051.VRMERCAD, 
						 G005.CJCLIENT, 
						 G051.IDG051 
				    FROM g048 g048 
					JOIN G049 G049 ON G049.IDG048 = g048.IDG048
					JOIN G051 G051 ON G051.IDG051 = G049.IDG051
					JOIN G005 G005 ON G005.IDG005 = nvl(G051.IDG005RC, G051.IDG005DE)
				   WHERE g048.idg048 IN (`+idg048+`)`,
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
			return result;
		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	};

	api.getInfoNf = async function (idg051) {
		let con = await this.controller.getConnection(null);
		try {
			let result = await con.execute({
				sql: `
					SELECT G043.NRNOTA, 
						   G043.IDG043, 
						   G043.VRDELIVE, 
						   fn_data_sla(G051.IDG051) AS DTSLA 
					  FROM G052 G052 
					  JOIN G051 G051 ON G051.IDG051 = G052.IDG051
					  JOIN G043 G043 ON G043.IDG043 = G052.IDG043
					 WHERE G052.IDG051 IN (`+idg051+`)`,
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
			return result;
		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	};

	api.getTransportadora = async function (CJTRANSP) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute(
				{
					sql: `
          Select G024.NMTRANSP,
									G024.CJTRANSP,
									G024.SNDELETE,
									G024.RSTRANSP,
									G024.IETRANSP,									
									G024.DSENDERE, /* Descrição do Endereço da Origem */
									G024.NRENDERE, /* Número da Origem */
									G024.DSCOMEND, /* Complemento da Origem */
									G024.BIENDERE, /* Bairro da Origem */
									G024.CPENDERE, /* Cep da Origem */
									G003.NMCIDADE,
									G002.CDESTADO, /* Estado da Origem */
									G001.NMPAIS, /* Nome do País Origem */
									G024.NRLATITU, /* Latitude Origem */
									G024.NRLONGIT /* Longitude Origem */
							From G024 G024
							Left Join G003 G003 /* Cidade Origem */
								On (G003.IDG003 = G024.IDG003)
							Left Join G002 G002 /* Estado Origem */
								On (G002.IDG002 = G003.IDG002)
							Left Join G001 G001 /* País Origem */
								On (G001.IDG001 = G002.IDG001)
						Where Trim(G024.CJTRANSP) Like Trim(:CNPJ) And G024.SnDelete = 0`,
          param: {
            CNPJ: CJTRANSP
          }
				})
				.then((result) => {
					return result[0];
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

  api.getMotorista1 = async function (CJMOTORI) {
	let con = await this.controller.getConnection(null);
	
	try {
		let result = await con.execute(
			{
				sql: `
				Select G031.NMMOTORI,
						G031.CJMOTORI,
						G031.SNDELETE,							
						G031.DSENDERE, /* Descrição do Endereço da Origem */
						G031.NRENDERE, /* Número da Origem */
						G031.DSCOMEND, /* Complemento da Origem */
						G031.BIENDERE, /* Bairro da Origem */
						G031.CPENDERE, /* Cep da Origem */
						G003.NMCIDADE,
						G002.CDESTADO, /* Estado da Origem */
						G001.NMPAIS /* Nome do País Origem */
				From G031 G031
				Left Join G003 G003 /* Cidade Origem */
					On (G003.IDG003 = G031.IDG003)
				Left Join G002 G002 /* Estado Origem */
					On (G002.IDG002 = G003.IDG002)
				Left Join G001 G001 /* País Origem */
					On (G001.IDG001 = G002.IDG001)
			Where Trim(G031.CJMOTORI) Like Trim(:CNPJ) And G031.SnDelete = 0`,
	  param: {
		CNPJ: CJMOTORI
	  }
			})
			.then((result) => {
				return result[0];
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

	api.getVeiculo1 = async function (NRPLACA) {
		let con = await this.controller.getConnection(null);

		try {
		let result = await con.execute(
		{
			sql: `
			Select 
									G032.IDG032,
									REPLACE(G032.NRPLAVEI, '-') AS PLACA,
									G032.DSRENAVA AS RENAVAN,
									G032.NRCHASSI AS CHASSI,
									/*G024.CJTRANSP*/'00950001001179' AS DOCUMENTO_TRANSPORTADOR,
										G032.DSVEICUL AS MODELO,
									G003.CDMUNICI AS CIDADE_EMPLACAMENTO,
									G002.CDESTADO AS SIGLA_ESTADO,
									G001.NMPAIS   AS PAIS
				From 			G032 G032 
				Left Join G024 On G024.IDG024 = G032.IDG024
				Left Join G030 On G030.IDG030 = G032.IDG030
				Left Join G003 On G003.IDG003 = G032.IDG003
				Left Join G002 On G002.IDG002 = G003.IDG002
				Left Join G001 On G001.IDG001 = G002.IDG001
				Where REPLACE(Trim(G032.NRPLAVEI), '-') Like REPLACE(Trim(:PLACA), '-') And G032.SnDelete = 0`,
		param: {
		PLACA: NRPLACA
		}
		})
		.then((result) => {
			return result[0];
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

	api.getVeiculos = async function (IDG032LIST) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute(
				{
					sql: `
          Select 
										-- G032.IDG032,
										G032.NRPLAVEI AS PLACA,
										G032.DSRENAVA AS RENAVAN,
										G032.NRCHASSI AS CHASSI,
										G024.CJTRANSP AS DOCUMENTO_TRANSPORTADOR,
										 G032.DSVEICUL AS MODELO,
										G003.CDMUNICI AS CIDADE_EMPLACAMENTO,
										G002.CDESTADO AS SIGLA_ESTADO,
										G001.NMPAIS   AS PAIS
					From 			G032 G032 
					Left Join G024 On G024.IDG024 = G032.IDG024
					Left Join G030 On G030.IDG030 = G032.IDG030
					Left Join G003 On G003.IDG003 = G032.IDG003
					Left Join G002 On G002.IDG002 = G003.IDG002
					Left Join G001 On G001.IDG001 = G002.IDG001
					Where 		G032.IDG032 In (`+IDG032LIST+`)`,
					param: []
          /* param: {
            IDG032LIST: IDG032LIST
          } */
				})
				.then((result) => {
					let resultado = [];

					for (let value in result) {
						let valor = {};
						valor.placa                    	= result[value].PLACA.replace(" ", "");
						valor.renavan            				= result[value].RENAVAN;
						valor.chassi 										= result[value].CHASSI;
						valor.documento_transportador 	= result[value].DOCUMENTO_TRANSPORTADOR;
						//valor.modelo						 				= result[value].MODELO;
						//valor.cidade_emplacamento 			=	result[value].CIDADE_EMPLACAMENTO;
						valor.sigla_estado 							= result[value].SIGLA_ESTADO;
						valor.pais 											= result[value].PAIS;
						resultado.push(valor);
					}
					return resultado;
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
	
	api.getMotoristas = async function (IDG031LIST) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute(
				{
					sql: `
          Select  
										G031.CJMOTORI,
										G031.NMMOTORI,
										G031.RGMOTORI,
										G031.DSENDERE,
										G031.CPENDERE,
										G031.NRENDERE,
										G031.DSCOMEND,
										G031.BIENDERE,
										G003.CDMUNICI,
										G002.CDESTADO,
										G001.NMPAIS,
										G031.DTVALCNH,
										G024.CJTRANSP
					From 			G031
					Left Join G024 On G024.IDG024 = G031.IDG024
					Left Join G003 On G003.IDG003 = G031.IDG003
					Left Join G002 On G002.IDG002 = G003.IDG002
					Left Join G001 On G001.IDG001 = G002.IDG001
					Where  		G031.IDG031 In (`+IDG031LIST+`) `,
					param: []
          /* param: {
            IDG032LIST: IDG032LIST
          } */
				})
				.then((result) => {
					let resultado = [];

					for (let value in result) {
						let valor = {};
						valor.cpf_motorista						=	result[value].CJMOTORI;
						valor.nome										=	result[value].NMMOTORI;
						valor.rg											=	result[value].RGMOTORI;
						valor.logradouro							=	result[value].DSENDERE;
						valor.cep											=	result[value].CPENDERE;
						valor.numero									=	result[value].NRENDERE;
						valor.complemento							=	result[value].DSCOMEND;
						valor.bairro									=	result[value].BIENDERE;
						valor.cidade									=	result[value].CDMUNICI;
						valor.sigla_estado						=	result[value].CDESTADO;
						valor.pais										=	result[value].NMPAIS;
						valor.validade_cnh						=	result[value].DTVALCNH;
						valor.documento_transportador =	result[value].CJTRANSP;

						resultado.push(valor);
					}
					return resultado;
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

	api.getMotoristas = async function (IDG031LIST) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute(
				{
					sql: `
          Select 
										--G031.IDG031,  
										G031.CJMOTORI,
										G031.NMMOTORI,
										G031.RGMOTORI,
										G031.DSENDERE,
										G031.CPENDERE,
										G031.NRENDERE,
										G031.DSCOMEND,
										G031.BIENDERE,
										G003.CDMUNICI,
										G002.CDESTADO,
										G001.NMPAIS,
										G031.DTVALCNH,
										G024.CJTRANSP
					From 			G031
					Left Join G024 On G024.IDG024 = G031.IDG024
					Left Join G003 On G003.IDG003 = G031.IDG003
					Left Join G002 On G002.IDG002 = G003.IDG002
					Left Join G001 On G001.IDG001 = G002.IDG001
					Where  		G031.IDG031 In (`+IDG031LIST+`) `,
					param: []
          /* param: {
            IDG032LIST: IDG032LIST
          } */
				})
				.then((result) => {
					let resultado = [];

					for (let value in result) {
						let valor = {};
						valor.cpf_motorista						=	result[value].CJMOTORI;
						valor.nome										=	result[value].NMMOTORI;
						valor.rg											=	result[value].RGMOTORI;
						valor.logradouro							=	result[value].DSENDERE;
						valor.cep											=	result[value].CPENDERE;
						valor.numero									=	result[value].NRENDERE;
						valor.complemento							=	result[value].DSCOMEND;
						valor.bairro									=	result[value].BIENDERE;
						valor.cidade									=	result[value].CDMUNICI;
						valor.sigla_estado						=	result[value].CDESTADO;
						valor.pais										=	result[value].NMPAIS;
						valor.validade_cnh						=	result[value].DTVALCNH;
						valor.documento_transportador =	result[value].CJTRANSP;

						resultado.push(valor);
					}
					return resultado;
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

	api.getTransportadoras = async function (IDG024LIST) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute(
				{
					sql: `
          Select
										CJTRANSP,
										NMTRANSP,
										RSTRANSP,
										IETRANSP,
										DSENDERE,
										CPENDERE,
										NRENDERE,
										DSCOMEND,
										BIENDERE
					From      G024
          Left Join G003 On G003.IDG003 = G024.IDG003
          Left Join G002 On G002.IDG002 = G003.IDG002
          Left Join G001 On G001.IDG001 = G002.IDG001
          Where     G024.IDG024 In (`+IDG024LIST+`) `,
					param: []
          /* param: {
            IDG032LIST: IDG032LIST
          } */
				})
				.then((result) => {
					let resultado = [];

					for (let value in result) {
						let valor = {};
						
						valor.documento_transportador =	result[value].CJTRANSP;
						valor.nome =	result[value].NMTRANSP;
						valor.razao_social =	result[value].RSTRANSP;
						valor.ie_rg =	result[value].IETRANSP;
						valor.logradouro =	result[value].DSENDERE;
						valor.cep =	result[value].CPENDERE;
						valor.numero =	result[value].NRENDERE;
						valor.complemento =	result[value].DSCOMEND;
						valor.bairro =	result[value].BIENDERE;

						resultado.push(valor);
					}
					return resultado;
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

  api.setEventos = async function (obj) {
	
		let con = await this.controller.getConnection(null);
		let resultNotas = null;
		let resultNotasEventos = null;

		/*
			"id_evento": 43457,
			"tipo_evento": 113,
			"descricao_tipo_evento": "EVENTO DE MACRO DE INICIO DE PERNOITE",
			"descricao": "INICIO DE PERNOITE.",
			"placa": 9,
			"numero_terminal": "ONX0001",
			"tecnologia": "ONIXSAT",
			"data_cadastro": "2018-10-08 09:41:11",
			"data_bordo": "2018-10-02 11:34:29",
			"posicao": "0.600 KM DE PT. EXPRESSO CHAPECO -CHAPECO/SC",
			"latitude": "-27.1125032348",
			"longitude": "-52.5643014908",
			"codigo_viagem": 9511
		*/

		try {

			var idEvento = 0;
			var aux = null;
			var objReturn = {};

			for (let i = 0; i < obj.eventos.length; i++) {

				idEvento = (obj.eventos[i].id_evento > idEvento ? obj.eventos[i].id_evento : idEvento);
				console.log('tipo_evento', obj.eventos[i].tipo_evento);

				//# Caso evento seja uma data de entrega
				if(obj.eventos[i].tipo_evento == '007' ){

					console.log('codigo_viagem', obj.eventos[i].codigo_viagem);
					
					resultNotas = await con.execute(
					{
						sql: `
							SELECT G043.idg043 
							FROM G046 G046
							JOIN G048 g048 ON g048.idg046 = g046.idg046
							JOIN G049 g049 ON g049.idg048 = g048.idg048
							JOIN G043 g043 ON g043.idg043 = g049.idg043
							WHERE G046.idg046 = :IdViagem	
							AND G043.dtentreg IS NULL`,
						param: {
							IdViagem: obj.eventos[i].codigo_viagem
						}
					})
					.then((result) => {
						return result;
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						throw err;
					});


					for (let j = 0; j < resultNotas.length; j++) {

						resultNotasEventos = await con.update({
						tabela: 'G043',
						colunas: {
							STETAPA : 5,
							DTENTREG: obj.eventos[i].data_bordo,
							STLOGOS : 'E',
			
						},
						condicoes: ` IDG043 in (`+dresultNotas[j].IDG043+`)  and DTENTREG is null`
						})
						.then((result1) => {
							return (result1);
						})
						.catch((err) => {
							err.stack = new Error().stack + `\r\n` + err.stack;
							throw err;
						});
					}

				//# Caso evento seja uma data de inicio de viagem
				}else if(obj.eventos[i].tipo_evento == '35'){
					//# EVENTO DE MACRO DE INICIO DE VIAGEM
					resultNotasEventos = await con.update({
						tabela: 'G046',
						colunas: {
							DTINITRA: new Date(obj.eventos[i].data_bordo)
						},
						condicoes: ` CDVIATRA in (`+obj.eventos[i].codigo_viagem+`)  and DTINITRA is null`
						})
						.then((result1) => {
							return (result1);
						})
						.catch((err) => {
							err.stack = new Error().stack + `\r\n` + err.stack;
							throw err;
						});

				//# Caso evento seja uma data de fim de viagem
				}else if(obj.eventos[i].tipo_evento == '141' || obj.eventos[i].tipo_evento == '330'){

					resultNotasEventos = await con.update({
						tabela: 'G046',
						colunas: {

							DTFIMTRA: new Date(obj.eventos[i].data_bordo)
			
						},
						condicoes: ` CDVIATRA in (`+obj.eventos[i].codigo_viagem+`) and DTFIMTRA is null`
						})
						.then((result1) => {
							return (result1);
						})
						.catch((err) => {
							err.stack = new Error().stack + `\r\n` + err.stack;
							throw err;
						});

				}

			}

			objReturn = {
				IDS032:12,
				IDS001:169,
				STATREQ:"Sucesso",
				STATDETA: "S",
				TXMENSAG: "Sucesso",
				CDRETORN: idEvento
			};
			aux = await this.setMovInterface(objReturn);

			await con.close();
			return true;

		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	};

	api.setCodigoTrafegus = async function (IDG046, CDVIATRA) {
		try {

			let con = await this.controller.getConnection(null);
			let resultCarga = null;

			resultCarga = await con.update({
				tabela: 'G046',
				colunas: {
					CDVIATRA : CDVIATRA,
				},
				condicoes: ` IDG046 in (`+IDG046+`)`
				})
				.then((result1) => {
					return (result1);
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});

			await con.close();
			return resultCarga;
		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}

	api.setPosicaoVeiculo = async function (idg032, posicao) {
		try {

			let con = await this.controller.getConnection(null);
			let resultVeiculo = null;

			resultVeiculo = await con.update({
				tabela: 'G032',
				colunas: {
					CDPOSTRA : posicao.idPosicao,
				},
				condicoes: ` IDG032 in (`+idg032+`)`
				})
				.then((result1) => {
					return (result1);
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});

			await con.close();
			return resultVeiculo;
		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}

	api.setCodigoPosicaoVeiculoTrafegus = async function (idg032, posicao) {
		try {

			let con = await this.controller.getConnection(null);
			let resultPosicao = null;
			let resultNotas   = null;
			let ctrl = app.src.modIntegrador.dao.TrafegusController;
			let aux  = null;
			let dslocali = "";
			var utils = app.src.utils.Utils;



			//console.log('IdViagem', posicao.IdViagem);

			resultNotas = await con.execute(
			{
				sql: `
					SELECT G043.idg043, 								
							nvl(G005.NRLATITU, G003.NRLATITU) As NRLATITUDE,
							nvl(G005.NRLONGIT, G003.NRLONGIT) As NRLONGITDE,
							G003.NMCIDADE As NMCIDADEDE,
							G003.NMCIDADE As NMCIDADEDE,
							G002.CDESTADO AS CDESTADODE
					FROM G046 G046
					JOIN G048 g048 ON g048.idg046 = g046.idg046
					JOIN G049 g049 ON g049.idg048 = g048.idg048
					JOIN G043 g043 ON g043.idg043 = g049.idg043
					JOIN G005 G005 ON G005.idg005 = g043.idg005de
					JOIN G003 G003 ON G003.idg003 = g005.idg003
					JOIN G002 G002 ON G002.idg002 = g003.idg002
					WHERE G046.cdviatra = :id	
						AND G043.dtentreg is null`,
				param: {
					id: posicao.IdViagem
				}
			})
			.then((result) => {
				return result;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});


			for (let j = 0; j < resultNotas.length; j++) {
				dslocali = "";
				aux = await utils.calcularDistancia(posicao.Latitude+','+posicao.Longitude, resultNotas[j].NRLATITUDE+','+resultNotas[j].NRLONGITDE);

				dslocali = "A "+parseInt(aux)+"KM de "+resultNotas[j].NMCIDADEDE+"-"+resultNotas[j].CDESTADODE;


				resultPosicao = await con.insert({
				tabela: 'G060',
				colunas: {
	
					IDG043    : resultNotas[j].IDG043, 
					DTPOSICA  : new Date(posicao.DataBordo),  
					NRLATITU  : posicao.Latitude, 
					NRLONGIT  : posicao.Longitude, 
					DSLOCALI  : dslocali, 
					IDG032    : idg032,
					TPINTEGR  : "2"
	
				},
				key: 'IDG060'
				})
				.then((result1) => {
					return (result1);
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});
			}


			await con.close();
			return resultPosicao;

		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}


	api.setMovInterface = async function (obj) {
		try {

			let con = await this.controller.getConnection(null);
			let resultS033, resultS034  = null;

			resultS033 = await con.insert({
				tabela: 'S033',
				colunas: {
					IDS032 : obj.IDS032,
					IDS001 : obj.IDS001,
					STATREQ : obj.STATREQ,
					CDRETORN: obj.CDRETORN,
					DTGERLOG : new Date(),
				},
					key: 'IDS033'
				})
				.then((result1) => {
					return (result1);
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});

				resultS034 = await con.insert({
					tabela: 'S034',
					colunas: {
						IDS033 : resultS033,
						STATDETA : obj.STATDETA,
						TXTMENSAG : obj.TXMENSAG,
						CDRETORN: obj.CDRETORN,
						DTGERLOG : new Date(),
					},
						key: 'IDS034'
					})
					.then((result1) => {
						return (result1);
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						throw err;
					});
					
			await con.close();
			return true;

		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
	}



	api.getltimoMovimento = async function (ids032) {
		let con = await this.controller.getConnection(null);
		
		try {
			let result = await con.execute(
				{
					sql: `SELECT max(CDRETORN) as CDRETORN  FROM s033 WHERE cdretorn IS NOT NULL  AND ids032 = :ids032`,
           param: {
            ids032: ids032
          } 
				})
				.then((result) => {
					return result[0].CDRETORN;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					throw err;
				});

			await con.close();
			console.log('ult',result);
			return result;

		} catch (err) {
			await con.closeRollback();
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
  };

	return api;
}