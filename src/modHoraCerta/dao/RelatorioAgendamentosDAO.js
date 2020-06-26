module.exports = function (app, cb) {

	var api = {};

	const db 			= app.config.database;
	const utils 	= app.src.utils.FuncoesObjDB;
	const logger 	= app.config.logger;
  const acl  		= app.src.modIntegrador.controllers.FiltrosController;
	
	api.controller = app.config.ControllerBD;

	/**
   * @description Constrói dinamicamente a estrutura SQL das pesagens e seus horários.
   *
   * @async
   * @function montarSQLRelatorio
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 16/05/2018
  */
	api.montarSQLRelatorio = async function (req, res, next) {
	
		var select = '';
		var resultado = '';

		var pivotPeso = `
		PIVOT (
            MAX(QTPESO)
            FOR PESO IN ('PESO1' PESO1, 'PESO2' PESO2, 'PESO3' PESO3, 'PESO4' PESO4, 'PESO5' PESO5, 'PESO6' PESO6)
				  )`;

		var pivotHora = `
		PIVOT (
            MAX(DTCADAST)
            FOR HORA IN ('HORA1' HORA1, 'HORA2' HORA2, 'HORA3' HORA3, 'HORA4' HORA4, 'HORA5' HORA5, 'HORA6' HORA6)
					)`;
					
		var pivotPesoManual = `
		PIVOT (
						MAX(PSMANUAL)
						FOR PESOMANUAL IN ('PESOMANUAL1' PESOMANUAL1, 'PESOMANUAL2' PESOMANUAL2, 'PESOMANUAL3' PESOMANUAL3, 'PESOMANUAL4' PESOMANUAL4, 'PESOMANUAL5' PESOMANUAL5, 'PESOMANUAL6' PESOMANUAL6)
					)`;

		var pivotUsuario = `
		PIVOT (
						MAX(USUARIO)
						FOR NMUSER IN ('NMUSER1' NMUSER1, 'NMUSER2' NMUSER2, 'NMUSER3' NMUSER3, 'NMUSER4' NMUSER4, 'NMUSER5' NMUSER5, 'NMUSER6' NMUSER6)
					)`;

		var pivotBalancaPesagem = `
		PIVOT (
						MAX(NRBALPES)
						FOR BALPESAGEM IN ('BALPESAGEM1' BALPESAGEM1, 'BALPESAGEM2' BALPESAGEM2, 'BALPESAGEM3' BALPESAGEM3, 'BALPESAGEM4' BALPESAGEM4, 'BALPESAGEM5' BALPESAGEM5, 'BALPESAGEM6' BALPESAGEM6)
					)`;

		for (let count = 1; count < 7; count ++){

			select = `
			(
				SELECT COALESCE(PESO${count},0) FROM 
				(
					SELECT IDH006, QTPESO, 'PESO' || ROWNUM AS PESO FROM 
					(
						SELECT H021.IDH006, H021.QTPESO
						FROM H021 
						WHERE H021.SNDELETE = 0 AND H021.IDH006 = H006.IDH006
						ORDER BY H021.IDH021
						OFFSET 0 ROWS FETCH NEXT 6 ROWS ONLY
					)
				)
				${pivotPeso}
			) PESAGEM${count}, 
			(
				SELECT HORA${count} FROM 
				(
					SELECT IDH006, DTCADAST, 'HORA' || ROWNUM AS HORA FROM 
					(
						SELECT H021.IDH006, H021.DTCADAST 
						FROM H021 
						WHERE H021.IDH006 = H006.IDH006 AND H021.SNDELETE = 0
						ORDER BY H021.IDH021
						OFFSET 0 ROWS FETCH NEXT 6 ROWS ONLY
					)
				)
				${pivotHora}
			) HORARIOPESAGEM${count},
			(
				SELECT 
					CASE
						WHEN PESOMANUAL${count} = 1 THEN 'SIM'
						WHEN PESOMANUAL${count} = 0 THEN 'NÃO'
					END PESOMANUAL${count} FROM 
				(
					SELECT IDH006, PSMANUAL, 'PESOMANUAL' || ROWNUM AS PESOMANUAL FROM 
					(
						SELECT H021.IDH006, H021.PSMANUAL 
						FROM H021
						WHERE H021.IDH006 = H006.IDH006 AND H021.SNDELETE = 0
						ORDER BY H021.IDH021
						OFFSET 0 ROWS FETCH NEXT 6 ROWS ONLY
					)
				)
				${pivotPesoManual}
			) PSMANUAL${count},
			(
				SELECT NMUSER${count} FROM
				(
					SELECT IDH006, USUARIO, 'NMUSER' || ROWNUM AS NMUSER FROM 
					(
						SELECT H021.IDH006, S001.NMUSUARI USUARIO
						FROM H021
						INNER JOIN S001 ON S001.IDS001 = H021.IDS001
						WHERE H021.IDH006 = H006.IDH006 AND H021.SNDELETE = 0
						ORDER BY H021.IDH021
						OFFSET 0 ROWS FETCH NEXT 6 ROWS ONLY
					)
				)
				${pivotUsuario}
			) USUARIO${count},
			(
				SELECT 
					CASE
						WHEN BALPESAGEM${count} = 1 THEN '01 - Entrada'
						WHEN BALPESAGEM${count} = 2 THEN '02 - Saída'
					END BALPESAGEM${count} FROM 
				(
					SELECT IDH006, NRBALPES, 'BALPESAGEM' || ROWNUM AS BALPESAGEM FROM 
					(
						SELECT H021.IDH006, H021.NRBALPES 
						FROM H021
						WHERE H021.IDH006 = H006.IDH006 AND H021.SNDELETE = 0
						ORDER BY H021.IDH021
						OFFSET 0 ROWS FETCH NEXT 6 ROWS ONLY
					)
				)
				${pivotBalancaPesagem}
			) NRBALPES${count},`;

			resultado += select;

		}

		return resultado;

	}

	api.montarSQLOrWhere = async function (value) {

		let sqlOrWhere = ``;

		sqlOrWhere += `AND (H024.IDG046 IN (${value}) OR H006.IDG046 IN (${value}))`;

		return sqlOrWhere;

	}

	api.relatorioAgendamento = async function (req, res, next) {

		logger.debug("Iniciado consulta de relatorio");

		var sqlAcl = "";
		var sqlAclClient = "";
		var sqlAcl4pl = "";
		var IDS001;

		//BUSCAR ID DO USUARIO
		if (req.body.IDS001 !== undefined) {
      IDS001 = req.body.IDS001;
    } else if (req.headers.ids001 !== undefined) {
      IDS001 = req.headers.ids001;
    }

		if (IDS001 !== undefined) {

      sqlAcl = await acl.montar({
        ids001: IDS001,
        dsmodulo: 'HORA-CERTA',
        nmtabela: [{ G024: 'G024' }, {G028: 'G028'}, , {G005: 'G005'}],
        //dioperad: ' ',
        esoperad: 'AND'
			});

			sqlAclClient = await acl.montar({
					ids001: IDS001,
					dsmodulo: 'HORA-CERTA',
					nmtabela: [{G005:'G005'}],
					//dioperad: ' ',
					esoperad: 'AND'
			});

			if (sqlAclClient === ' AND 1=0') { sqlAclClient = ''; }

			/* Verifica se é usuário 4PL */
			sqlAclOperac = await acl.montar({
					ids001: IDS001,
					dsmodulo: 'HORA-CERTA',
					nmtabela: [{G014:'G014'}],
					//dioperad: ' ',
					esoperad: 'AND'
			});

			if (sqlAclOperac !== ' AND 1=0' && sqlAclOperac !== '') {

				let sn4pl = false;
				let sql4pl = `Select Distinct G014.Sn4pl From G014 Where G014.SnDelete = 0 ${sqlAclOperac}`;

				let res4pl = await db.execute(
					{
						sql: sql4pl,
						param: [],
					})
					.then((result) => {
						return (result);
					})
					.catch((err) => {
						err.stack = new Error().stack + `\r\n` + err.stack;
						logger.error("Erro:", err);
						throw err;
					});

				for (let r of res4pl) {
					if (r.SN4PL == 1) {
						sn4pl = true;
					}
				}

				if (sn4pl) {
					sqlAcl4pl = ` AND ( ( ( ( ( H006.TPMOVTO = 'C' AND
																			H024.IDG046 IS NOT NULL
																		) AND G046.TPMODCAR = 2
																	) OR H006.TPMOVTO = 'D'
																) AND
																H006.IDG028 In ( SELECT IDG028 FROM G028 WHERE SNARMBRA = 1 )
															) OR (
																H006.IDG028 In ( SELECT IDG028 FROM G028 WHERE SNARMBRA = 0 )
															)
														)`;
				}
			}
			/* Verifica se é usuário 4PL */

		} else {

			sqlAcl = ' AND 1 = 0';

		}

		var sqlOrWhere = ``;

		if (req.body['parameter[H006_IDG046][in]'] && req.body['parameter[H024_IDG046][in]']) {
			sqlOrWhere = await api.montarSQLOrWhere(req.body['parameter[H024_IDG046][in]']);

			delete req.body['parameter[H006_IDG046][in]'];
			delete req.body['parameter[H024_IDG046][in]'];

		} else if (req.body['parameter[H006_IDG046][in][]'] && req.body['parameter[H024_IDG046][in][]']) {
			sqlOrWhere = await api.montarSQLOrWhere(req.body['parameter[H024_IDG046][in][]']);

			delete req.body['parameter[H006_IDG046][in][]'];
			delete req.body['parameter[H024_IDG046][in][]'];

		}

		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'H006', true);

		sqlWhere = sqlWhere.replace(
			"And H007.HOINICIO Between :H007_HOINICIO0 AND :H007_HOINICIO1",
			"And (H007.HOINICIO Between :H007_HOINICIO0 AND :H007_HOINICIO1 Or CAN.HOINICIO Between :H007_HOINICIO0 AND :H007_HOINICIO1 )"
		);

		sqlWhere = sqlWhere.replace("H006.NRPLAVEI", "REPLACE(UPPER(H006.NRPLAVEI),'-')");
		sqlWhere = sqlWhere.replace(":H006_NRPLAVEI", "REPLACE(UPPER(:H006_NRPLAVEI),'-')");

		sqlWhere = sqlWhere.replace("H006.NRPLARE1", "REPLACE(UPPER(H006.NRPLARE1),'-')");
		sqlWhere = sqlWhere.replace(":H006_NRPLARE1", "REPLACE(UPPER(:H006_NRPLARE1),'-')");

		sqlWhere = sqlWhere.replace("H006.NRPLARE2", "REPLACE(UPPER(H006.NRPLARE2),'-')");
		sqlWhere = sqlWhere.replace(":H006_NRPLARE2", "REPLACE(UPPER(:H006_NRPLARE2),'-')");

		var sql_pivot = await api.montarSQLRelatorio();

		var query = `
				SELECT

				  H006.IDH006						                  H006_IDH006				      --ID DO AGENDAMENTO
				, H006.TPMOVTO						                H006_TPMOVTO			      --TIPO DE OPERACAO
				, H006.DTCADAST         		            	G046_DTCADAST           --DATA DE CADASTRO
				, H006.STAGENDA					                  H006_STAGENDA           --STATUS AGENDAMENTO
				, H006.TXOBSAGE					                  H006_TXOBSAGE           --OBSERVAÇÃO AGENDAMENTO
				, H006.NUMNAM					                    H006_NUMNAM             --NÚMERO DA NAM
				, H006.DTNAM					                    H006_DTNAM              --DATA DE INSERÇÃO DA NAM
				, H006.NRPLAVEI						                H006_NRPLAVEI			      --PLACA DO VEICULO
				, H006.NRPLARE1						                H006_NRPLARE1			      --REBOQUE 1
				, H006.NRPLARE2						                H006_NRPLARE2			      --REBOQUE 2
				, H006.NRNFCARG						                H006_NRNFCARG			      --NUMERO DA NOTA FISCAL DA CARGA
				, H006.QTPESO					                  	H006_QTPESO				      --PESO DO AGENDAMENTO
				, H006.QTSLOTS						                H006_QTSLOTS			      --QUATIDADE DE SLOTS UTILIZADOS
				, H006.QTTEMPRE						                H006_QTTEMPRE			      --TEMPO GASTO PARA CARREGAMENTO
				, H006.IDBOX                              H006_IDBOX              --NUMERO DO ID DO BOX
				
				, CASE
						WHEN H006.TPMOVTO = 'C' THEN
							H024.IDG046
						WHEN H006.TPMOVTO = 'D' THEN
							H006.IDG046
					END H024_IDG046 					              						            --ID DA CARGA
				
				, CASE
            WHEN H006.STAGENDA = 1 THEN 'LIVRE'
            WHEN H006.STAGENDA = 2 THEN 'PRÉ-RESERVADO'
            WHEN H006.STAGENDA = 3 THEN 'RESERVADO'
            WHEN H006.STAGENDA = 4 THEN 'CHEGOU'
            WHEN H006.STAGENDA = 5 THEN 'ENTROU'
            WHEN H006.STAGENDA = 6 THEN 'INICIOU OPERAÇÃO'
            WHEN H006.STAGENDA = 7 THEN 'FINALIZOU OPERAÇÃO'
            WHEN H006.STAGENDA = 8 THEN 'SAIU' 
            WHEN H006.STAGENDA = 9 THEN 'FALTOU' 
            WHEN H006.STAGENDA = 10 THEN 'CANCELADO' 
            WHEN H006.STAGENDA = 12 THEN 'BALANÇA' 
            WHEN H006.STAGENDA = 13 THEN 'BALANÇA' 
					END AS SITUACAO

				, CASE 
						WHEN H024.IDG046 IS NULL THEN H006.NTFISCA1
						WHEN H024.IDG046 IS NOT NULL THEN H024.NTFISCA1
					END H006_NTFISCA1

				, CASE 
						WHEN H024.IDG046 IS NULL THEN H006.NTFISCA2
						WHEN H024.IDG046 IS NOT NULL THEN H024.NTFISCA2
					END H006_NTFISCA2

				, CASE 
						WHEN H024.IDG046 IS NULL THEN
							(SELECT G097.DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H006.TPOPERAC)
						WHEN H024.IDG046 IS NOT NULL THEN 
							(SELECT G097.DSVALUE FROM G097 WHERE G097.IDGRUPO = 1 AND G097.IDKEY = H024.TPOPERAC)
					END H006_TPOPERAC

				, CASE
            WHEN H024.IDG046 IS NULL THEN H006.QTPESO
            WHEN H024.IDG046 IS NOT NULL THEN G046.PSCARGA
				  END G046_PSCARGA

				, CASE
            WHEN H024.IDG046 IS NULL THEN 
            (
              SELECT 
                LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005 
              FROM 
              (
                SELECT DISTINCT G005.NMCLIENT
                FROM H019 
                INNER JOIN G005 
                ON H019.IDG005 = G005.IDG005 
                WHERE H019.IDH006 = H006.IDH006 
									AND H019.SNDELETE = 0
									${sqlAclClient}
              )
            ) 
            WHEN H024.IDG046 IS NOT NULL THEN
            (
              SELECT 
                LISTAGG(NMCLIENT, ', ') WITHIN GROUP(ORDER BY NMCLIENT) IDG005 
              FROM
              (
                SELECT DISTINCT G005.NMCLIENT
                FROM H019 
                INNER JOIN G005 
                  ON H019.IDG005 = G005.IDG005
                WHERE H019.IDG046 = H024.IDG046
									AND H019.SNDELETE = 0
									${sqlAclClient}
              )
					  )
				  END G005_IDG005 
				
				, H005.NRJANELA	|| ' - ' || H005.DSJANELA H005_NRJANELA			      --JANELA DO AGENDAMENTO

				, G046.DSCARGA                            G046_DSCARGA            --DESCRICAO DA CARGA
				, G046.TPMODCAR                           G046_TPMODCAR           --MODELO DE CARGA

				, G030.DSTIPVEI                           G030_TIPOVEI            --TIPO DE VEICULO

				, MIN(H007.HOINICIO)			                H007_HOINICIO			      --HORA INICIAL DO AGENDAMENTO
				, MAX(H007.HOFINAL)				                H007_HOFINAL			      --HORA FINAL DO AGENDAMENTO
				, TO_CHAR(MIN(H007.HOINICIO), 'HH24:mi')  H007_HORAINIC			      --HORA INICIAL DO AGENDAMENTO
				, TO_CHAR(MAX(H007.HOFINAL), 'HH24:mi')   H007_HORAFINA			      --HORA FINAL DO AGENDAMENTO

				, UAG.NMUSUARI									          UAG_NMUSUARI			      --USUARIO DO AGENDAMENTO

				, G028.IDG028 					                  G028_IDG028 			      --ID DO ARMAZEM
				, G028.NMARMAZE					                  G028_NMARMAZE			      --NOME DO ARMAZEM

				, G024.IDG024	  					              	G024_IDG024	  		    	--ID DA TRANSPORTADORA

				, G024.NMTRANSP						                G024_NMTRANSP			      --NOME DA TRANSPORTADORA
				, G032.DSVEICUL                           G032_DSVEICUL           --DESCRIÇÂO VEICULO
				, G032.NRFROTA                            G032_NRFROTA            --FROTA

				, G031.IDG031 						                G031_IDG031 			      --ID DO MOTORISTA
				, G031.NMMOTORI						                G031_NMMOTORI			      --NOME DO MOTORISTA
				, G031.NRCNHMOT						                G031_NRCNHMOT			      --CNH DO MOTORISTA
				, G031.CJMOTORI					                  G031_CJMOTORI			      --CPF DO MOTORISTA
				, G031.RGMOTORI						                G031_RGMOTORI			      --RG DO MOTORISTA

				, CASE
            WHEN H022.TPMATERI = 'CS' THEN 'Carga Seca'
            WHEN H022.TPMATERI = 'GL' THEN 'Granel Liquido'
            WHEN H022.TPMATERI = 'EM' THEN 'Embalagens'
            WHEN H022.TPMATERI = 'TO' THEN 'Toller'
				  END TPMATERI

				, FORN.NMCLIENT AS FORNECEDOR
				, H007AT.SITUACAO AS ATRASADO
				
				, H021.NMUSUARI
				, H021.DSMOTLIB																										--MOTIVO LIBERAÇÃO COM DIVERGÊNCIA
				, H021TP.NMUSUARI													 H021TP_NMUSUARI				--USUARIO TRANSFERENCIA DE PESAGEM
				, UAT.NMUSUARI AS USATRE
				
				, (
						SELECT LISTAGG(I015.DSOCORRE, '; ') WITHIN GROUP (ORDER BY I015.DSOCORRE) DSOCORRE
						FROM H008 
						INNER JOIN I015 ON I015.IDI015 = H008.IDI015
						WHERE 
							H008.IDH006 = H006.IDH006 AND
							H008.STAGENDA = 10
					) MOTCAN_DSOCORRE

				, (
						SELECT LISTAGG(I015.DSOCORRE, '; ') WITHIN GROUP (ORDER BY I015.DSOCORRE) DSOCORRE
						FROM H008 
						INNER JOIN I015 ON I015.IDI015 = H008.IDI015
						WHERE 
							H008.IDH006 = H006.IDH006 AND
							H008.STAGENDA = 11
				  ) MOTREAG_DSOCORRE

				, ( 
						SELECT 
              COUNT(*) 
            FROM H006 H6 
            INNER JOIN H008 H8 
              ON H8.IDH006 = H006.IDH006 
            WHERE H6.IDH006 = H006.IDH006 
              AND H8.STAGENDA = 11
				  ) CON_QTREAGEN

				, ( 
						SELECT 
              CASE 
                WHEN MAX(H017.IDH017) IS NULL THEN 'Não' 
                ELSE 'Sim' 
              END 
            FROM H017 
            WHERE H017.IDH006 = H006.IDH006 
              AND H017.SNDELETE = 0
				  ) LSNOTAS -- NOTAS ANEXADAS

				, ( 
						SELECT 
              LISTAGG(H022.DSMATERI || '- QTD: ' || H023.QTMATERI, ' | ') WITHIN GROUP(ORDER BY H022.DSMATERI) 
            FROM H023 
            INNER JOIN H022 
              ON H023.IDH022 = H022.IDH022 
            WHERE H006.IDH006 = H023.IDH006
				  ) AS PRODUTOS

				, ${sql_pivot}

				--Já existe vírgula no final do sql_pivot
				COUNT(*) OVER() AS COUNT_LINHA

				FROM H006

				LEFT JOIN H024 ON H024.IDH006 = H006.IDH006

				LEFT JOIN G046 ON (H024.IDG046 = G046.IDG046 OR H006.IDG046 = G046.IDG046)

				LEFT JOIN H007 ON H006.IDH006 = H007.IDH006

				LEFT JOIN H019 ON H019.IDH006 = H006.IDH006

				LEFT JOIN G028 ON H006.IDG028 = G028.IDG028

				LEFT JOIN G024 ON H006.IDG024 = G024.IDG024

				LEFT JOIN G031 ON H006.IDG031 = G031.IDG031

				LEFT JOIN H005 ON H007.IDH005 = H005.IDH005

				LEFT JOIN S001 UAT ON UAT.IDS001		 = H006.IDS001TQ -- USUÁRIO DE ATRELAMENTO

				LEFT JOIN S001 UAG ON H006.IDS001		 = UAG.IDS001

				LEFT JOIN G032 ON H006.NRPLAVEI = G032.NRPLAVEI

				LEFT JOIN G030 ON G030.IDG030 = H006.IDG030

				LEFT JOIN G005 ON H019.IDG005 = G005.IDG005

				LEFT JOIN G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1

				LEFT JOIN G014 ON G014.IDG014 = G022.IDG014

				LEFT JOIN G005 FORN ON FORN.IDG005 = H006.FORNECED

				LEFT JOIN H008 CAN  ON H006.IDH006 = CAN.IDH006 AND CAN.STAGENDA = 10 --STATUS CANCELADO

				LEFT JOIN
          (
            SELECT
              MAX(H023.IDH022),
              H023.IDH022,
              H023.IDH006
            FROM H023
            GROUP BY
              H023.IDH022,
              H023.IDH006
          ) H023
          ON H023.IDH006 = H006.IDH006

        LEFT JOIN
          (
            SELECT
              H022.IDH022,
              H022.TPMATERI
            FROM H022
          ) H022
          ON H022.IDH022 = H023.IDH022

        LEFT JOIN
          (
            SELECT
            	AGENDAMENTO.IDH006,
						CASE
							WHEN AGENDAMENTO.HOINICIO < CHECKIN.HOINICIO
								THEN 'ATRASADO'
							WHEN AGENDAMENTO.HOINICIO > CHECKIN.HOINICIO
								THEN 'ADIANTADO'
						END SITUACAO
						FROM H006

						LEFT JOIN (
									SELECT MIN(IDH008), IDH006, STAGENDA, MIN(HOINICIO) AS HOINICIO
									FROM H008
									WHERE STAGENDA = 3
									GROUP BY IDH006, STAGENDA
									) AGENDAMENTO
							ON AGENDAMENTO.IDH006 = H006.IDH006

						LEFT JOIN (
								SELECT MIN(IDH008), IDH006, STAGENDA, MIN(HOINICIO) AS HOINICIO
								FROM H008
								WHERE STAGENDA = 4
								GROUP BY IDH006, STAGENDA
								) CHECKIN
						ON CHECKIN.IDH006 = H006.IDH006

          ) H007AT
          ON H007AT.IDH006 = H006.IDH006

        LEFT JOIN
          (
            SELECT
		          H006.IDH006,
		          MAX(H021.IDH021),
		          I015.IDI015||' - '||I015.DSOCORRE AS DSMOTLIB,
		          S001.NMUSUARI
		        FROM H006
		        INNER JOIN H021
		          ON H021.IDH006 = H006.IDH006
		        INNER JOIN S001
		          ON H021.USERLIBE = S001.IDS001
		        INNER JOIN I015
		          ON I015.IDI015 = H021.IDI015
		        GROUP BY
		          H006.IDH006,
		          S001.NMUSUARI,
		          I015.IDI015,
		          I015.DSOCORRE
          ) H021
					ON H021.IDH006 = H006.IDH006

				LEFT JOIN
					(
						SELECT
							H006.IDH006,
							MAX(H021.IDH021),
							S001.NMUSUARI
						FROM H006
						INNER JOIN H021
							ON H021.IDH006 = H006.IDH006
						INNER JOIN S001
							ON H021.IDS001TP = S001.IDS001
						GROUP BY
						   H006.IDH006,
						   S001.NMUSUARI
					) H021TP
					ON H021TP.IDH006 = H006.IDH006

				${sqlWhere} ${sqlOrWhere} ${sqlAcl} ${sqlAcl4pl}

				GROUP BY
					  H006.IDH006						    --ID DO AGENDAMENTO
					, H006.TPMOVTO						  --TIPO DE OPERACAO
					, H006.DTCADAST         		--DATA DE CADASTRO
					, H006.NRPLAVEI						  --PLACA DO VEICULO
					, H006.NRPLARE1						  --REBOQUE 1
					, H006.NRPLARE2						  --REBOQUE 2
					, H006.NRNFCARG						  --NUMERO DA NOTA FISCAL DA CARGA
					, H006.QTPESO						    --PESO DA CARGA
					, H006.QTSLOTS						  --QUATIDADE DE SLOTS UTILIZADOS
					, H006.QTTEMPRE						  --TEMPO GASTO PARA CARREGAMENTO
					, H006.STAGENDA						  --SITUACAO DE AGENDAMENTO
					, H006.TXOBSAGE             --OBSERVAÇÃO DE AGENDAMENTO
					, H006.NUMNAM               --NÚMERO DA NAM
					, H006.DTNAM                --DATA DE INSERÇÃO DA NAM
					, H006.TPOPERAC	            --TIPO DE OPERAÇÃO
					, H006.LSNOTAS              --NºS NOTAS FISCAIS
					, H006.IDBOX                --Nº DO BOX
					, H006.NTFISCA1							--NOTA FISCAL 1
					, H006.NTFISCA2							--NOTA FISCAL 2

					, H005.NRJANELA						  --NÚMERO JANELA DO AGENDAMENTO
					, H005.DSJANELA						  --DESCRIÇÃO JANELA DO AGENDAMENTO

					, H024.TPOPERAC             --TIPO DE OPERAÇÃO
					, H024.IDG046   				    --ID DA CARGA
					, H006.IDG046   				    --ID DA CARGA
					
					, G028.IDG028 					  	--ID DO ARMAZEM
					, G028.NMARMAZE						  --NOME DO ARMAZEM

					, G024.IDG024	  					  --ID DA TRANSPORTADORA
					, G024.NMTRANSP						  --NOME DA TRANSPORTADORA

					, G032.DSVEICUL             --DESCRIÇÃO DO VEICULO
					, G032.NRFROTA              --FROTA
					, H024.NTFISCA1
					, H024.NTFISCA2

					, G031.IDG031 						  --ID DO MOTORISTA
					, G031.NMMOTORI						  --NOME DO MOTORISTA
					, G031.CJMOTORI						  --CPF DO MOTORISTA
					, G031.RGMOTORI						  --RG DO MOTORISTA
					, G031.NRCNHMOT						  --CNH DO MOTORISTA

					, UAG.NMUSUARI						  --USUARIO DO AGENDAMENTO
					, FORN.NMCLIENT
					, UAT.NMUSUARI

					, G046.DSCARGA              --DESCRIÇÃO DA CARGA
					, G046.PSCARGA              --PESO DA CARGA
					, G046.TPMODCAR             --MODELO DE CARGA

					, H021.NMUSUARI             --USUARIO DA SOLICITAÇÃO
					, H021.DSMOTLIB							--MOTIVO LIBERAÇÃO COM DIVERGÊNCIA
					, H021TP.NMUSUARI						--USUARIO TROCA DE PESAGEM

					, G030.DSTIPVEI             --TIPO DE VEÍCULO

					, H022.TPMATERI

          , H007AT.SITUACAO

					${sqlOrder}
					${sqlPaginate}`;


		var sql_relatorio = `
			SELECT a.*
						, O03.AGE_DTCHECKIN         --DATA AGENDADO
						, O03.AGE_OBCHECKIN         --OBSERVACAO DO AGENDADO
						, O03.UAO_NMUSUARI          --NOME DO USUARIO AGENDADO

						, O04.CHE_DTCHECKIN         --DATA CHECKIN
						, O04.CHE_OBCHECKIN         --OBSERVACAO DO CHECKIN
						, O04.UCH_NMUSUARI          --NOME DO USUARIO CHECKIN

						, O12.SEN_DTSOLENT          --DATA SOLICITACAO DE ENTRADA
						, O12.SEN_OBSOLENT          --OBSERVACAO DA SOLICITACAO DE ENTRADA
						, O12.USE_NMUSUARI          --NOME DO USUARIO SOLICITACAO DE ENTRADA

						, O05.ENT_DTENTROU	        --DATA ENTROU
						, O05.ENT_OBENTROU	        --OBSERVACAO DO ENTROU
						, O05.UEN_NMUSUARI	        --USUARIO DO ENTROU

						, O06.INI_DTINICIOP         --DATA INICIOU OPERACAO
						, O06.INI_OBINICIOP         --OBSERVACAO INICIOU OPERACAO
						, O06.UIN_NMUSUARI          --USUARIO INICIOU OPERACAO

						, O07.FIN_DTFINAOP	        --DATA FINALIZOU OPERACAO
						, O07.FIN_OBFINAOP	        --OBSERVACAO FINALIZOU OPERACAO
						, O07.UFI_NMUSUARI	        --USUARIO FINALIZOU OPERACAO

						, O14.ICO_DTINICON	        --DATA INICIOU CONFERENCIA
						, O14.ICO_OBINICON	        --OBSERVACAO INICIOU CONFERENCIA
						, O14.UIC_NMUSUARI	        --USUARIO INICIOU CONFERENCIA

						, O16.FCO_DTFINCON	        --DATA FINALIZOU CONFERENCIA
						, O16.FCO_OBFINCON	        --OBSERVACAO FINALIZOU CONFERENCIA
						, O16.UFC_NMUSUARI	        --USUARIO FINALIZOU CONFERENCIA

						, O08.SAI_DTSAIU		        --DATA SAIU
						, O08.SAI_OBSAIU		        --OBSERVACAO SAIU
						, O08.USA_NMUSUARI		      --USUARIO  SAIU
				
						, O09.FAL_DTFALTOU          --DATA FALTOU
						, O09.UFA_NMUSUARI		      --USUARIO FALTOU

						, O10.CAN_DTCANCEL          --DATA CANCELOU
						, O10.UCA_NMUSUARI		      --USUARIO CANCELOU

			FROM ( ${query} ) a

			CROSS APPLY (
				SELECT MAX(AGE.HOOPERAC) as AGE_DTCHECKIN,
							 MAX(AGE.TXOBSERV) as AGE_OBCHECKIN,
							 MAX(UAO.NMUSUARI) as UAO_NMUSUARI,
							 '1'							 as O03AUX
					FROM H008 AGE
					JOIN S001 UAO ON AGE.IDS001 = UAO.IDS001
				 WHERE AGE.IDH006   = a.H006_IDH006
					 AND AGE.STAGENDA = 3
			)O03 --AGENDADO

			CROSS APPLY (
				SELECT MAX(CHE.HOOPERAC) as CHE_DTCHECKIN,
							 MAX(CHE.TXOBSERV) as CHE_OBCHECKIN,
							 MAX(UCH.NMUSUARI) as UCH_NMUSUARI,
							 '1'							 as O04AUX
					FROM H008 CHE
					JOIN S001 UCH ON CHE.IDS001 = UCH.IDS001
				 WHERE CHE.IDH006   = a.H006_IDH006
					 AND CHE.STAGENDA = 4
					 AND CHE.NRSEQMOV > (SELECT MAX(ACH.NRSEQMOV)
																 FROM H008 ACH
																WHERE ACH.IDH006 = a.H006_IDH006
																	AND ACH.STAGENDA IN (3))
			) O04 --CHECKIN

			CROSS APPLY (
				SELECT MAX(SEN.HOOPERAC) as SEN_DTSOLENT,
							 MAX(SEN.TXOBSERV) as SEN_OBSOLENT,
							 MAX(USE.NMUSUARI) as USE_NMUSUARI,
							 '1'							 as O12AUX
					FROM H008 SEN
					JOIN S001 USE ON SEN.IDS001 = USE.IDS001
				 WHERE SEN.IDH006   = a.H006_IDH006
					 AND SEN.STAGENDA = 12
					 AND SEN.NRSEQMOV > (SELECT MAX(ASE.NRSEQMOV)
																 FROM H008 ASE
																WHERE ASE.IDH006 = a.H006_IDH006
																	AND ASE.STAGENDA IN (3,4))
			)O12 --SOLICITOU ENTRADA

			CROSS APPLY (
				SELECT MAX(ENT.HOOPERAC) as ENT_DTENTROU,
							 MAX(ENT.TXOBSERV) as ENT_OBENTROU,
							 MAX(UEN.NMUSUARI) as UEN_NMUSUARI,
							 '1'							 as O05AUX
					FROM H008 ENT
					JOIN S001 UEN ON ENT.IDS001 = UEN.IDS001
				 WHERE ENT.IDH006   = a.H006_IDH006
					 AND ENT.STAGENDA = 5
					 AND ENT.NRSEQMOV > (SELECT MAX(AEN.NRSEQMOV)
																 FROM H008 AEN
																WHERE AEN.IDH006 = a.H006_IDH006
																	AND AEN.STAGENDA IN (3,4,12))
			)O05 --ENTROU

			CROSS APPLY (
				SELECT MAX(INI.HOOPERAC) as INI_DTINICIOP,
							 MAX(INI.TXOBSERV) as INI_OBINICIOP,
							 MAX(UIN.NMUSUARI) as UIN_NMUSUARI,
							 '1'							 as O06AUX
					FROM H008 INI
					JOIN S001 UIN ON INI.IDS001 = UIN.IDS001
				 WHERE INI.IDH006   = a.H006_IDH006
					 AND INI.STAGENDA = 6
					 AND INI.NRSEQMOV > (SELECT MAX(AIN.NRSEQMOV)
																 FROM H008 AIN
															  WHERE AIN.IDH006 = a.H006_IDH006
																	AND AIN.STAGENDA IN (3,4,12,5))
			)O06 --INICIOU OPERAÇÃO

			CROSS APPLY (
				SELECT MAX(FIN.HOOPERAC) as FIN_DTFINAOP,
							 MAX(FIN.TXOBSERV) as FIN_OBFINAOP,
							 MAX(UFI.NMUSUARI) as UFI_NMUSUARI,
							 '1'							 as O07AUX
					FROM H008 FIN
					JOIN S001 UFI ON FIN.IDS001 = UFI.IDS001
				 WHERE FIN.IDH006   = a.H006_IDH006
					 AND FIN.STAGENDA = 7
					 AND FIN.NRSEQMOV > (SELECT MAX(AFI.NRSEQMOV)
																 FROM H008 AFI
																WHERE AFI.IDH006 = a.H006_IDH006
																	AND AFI.STAGENDA IN (3,4,12,5,6))
			)O07 --FINALIZOU OPERAÇÃO

			CROSS APPLY (
				SELECT MAX(ICO.HOOPERAC) as ICO_DTINICON,
							 MAX(ICO.TXOBSERV) as ICO_OBINICON,
							 MAX(UIC.NMUSUARI) as UIC_NMUSUARI,
							 '1'							 as O14AUX
					FROM H008 ICO
					JOIN S001 UIC ON ICO.IDS001 = UIC.IDS001
				 WHERE ICO.IDH006   = a.H006_IDH006
					 AND ICO.STAGENDA = 14
			)O14 --INICIOU CONFERÊNCIA

			CROSS APPLY (
				SELECT MAX(FCO.HOOPERAC) as FCO_DTFINCON,
							 MAX(FCO.TXOBSERV) as FCO_OBFINCON,
							 MAX(UFC.NMUSUARI) as UFC_NMUSUARI,
							 '1'							 as O16AUX
					FROM H008 FCO
					JOIN S001 UFC ON FCO.IDS001 = UFC.IDS001
				WHERE FCO.IDH006   = a.H006_IDH006
					AND FCO.STAGENDA = 16
			)O16 --FINALIZOU CONFERÊNCIA

			CROSS APPLY (
				SELECT MAX(SAI.HOOPERAC) as SAI_DTSAIU,
							 MAX(SAI.TXOBSERV) as SAI_OBSAIU,
							 MAX(USA.NMUSUARI) as USA_NMUSUARI,
							 '1'							 as O08AUX
					FROM H008 SAI
					JOIN S001 USA ON SAI.IDS001 = USA.IDS001
				 WHERE SAI.IDH006   = a.H006_IDH006
					 AND SAI.STAGENDA = 8
					 AND SAI.NRSEQMOV > (SELECT MAX(ACH.NRSEQMOV)
																 FROM H008 ACH
																WHERE ACH.IDH006 = a.H006_IDH006
																	AND ACH.STAGENDA IN (3,4,12,5,6,7))
			)O08 --SAIU

			CROSS APPLY (
				SELECT MAX(FAL.HOOPERAC) as FAL_DTFALTOU,
							 MAX(UFA.NMUSUARI) as UFA_NMUSUARI,
							 '1'							 as O09AUX
					FROM H008 FAL
					JOIN S001 UFA ON FAL.IDS001 = UFA.IDS001
				 WHERE FAL.IDH006   = a.H006_IDH006
					 AND FAL.STAGENDA = 9
			)O09 --FALTOU

			CROSS APPLY (
				SELECT MAX(CAN.HOOPERAC) as CAN_DTCANCEL,
							 MAX(UCA.NMUSUARI) as UCA_NMUSUARI,
							 '1'							 as O10AUX
					FROM H008 CAN
					JOIN S001 UCA ON CAN.IDS001 = UCA.IDS001
				 WHERE CAN.IDH006   = a.H006_IDH006
					 AND CAN.STAGENDA = 10
			)O10 --CANCELADO
		`;

		return await db.execute({
			sql:sql_relatorio,
			param: bindValues,
    })

		.then((result) => {
			return utils.construirObjetoRetornoBD(result, req.body);
    })
    .catch((err) => {
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;
		});
	};

	api.relatorioReagendamento = async function (req, res, next) {
		logger.debug("Iniciado consulta de relatorio");

		let DATA_ATUAL 		= req.body['parameter[DTATUAL]'];
		let DATA_ANTERIOR = req.body['parameter[DTANTER]'];

		delete req.body['parameter[DTATUAL]'];
		delete req.body['parameter[DTANTER]'];

		var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'H008', false);

		var sql_relatorio = `
			SELECT  H006.IDH006																																			H006_IDH006
						, H006.TPMOVTO																																		H006_TPMOVTO
						, G028.NMARMAZE																																		G028_NMARMAZE
						, G024.NMTRANSP																																		G024_NMTRANSP
						, H006.STAGENDA																																		H006_STAGENDA
						, H008.HOOPERAC																																		H008_HOOPERAC
						, S001.NMUSUARI																																		S001_NMUSUARI
						, (SELECT MIN(H008C.HOINICIO)
								 FROM H008 H008C
								WHERE H008C.HOOPERAC = (SELECT MIN(H008B.HOOPERAC)
																					FROM H008 H008B
																				 WHERE H008B.IDH006 = H006.IDH006)
							)																																								H008_HOINICIO
						, H008R.HOOPERAC																																	H008R_HOOPERAC
						, H008R.NMUSUARI																																	H008R_NMUSUARI
						, H008R.DSOCORRE																																	H008R_DSOCORRE
						, H008R.HOINICIO																																	H008R_HOINICIO
						, (SELECT MIN(H007.HOINICIO) FROM H007 H007 WHERE H007.IDH006 = H006.IDH006)			H007_HOINICIO
						, H006.NRPLAVEI																																		H006_NRPLAVEI
						, G032A.NRFROTA																																		G032A_NRFROTA

						, COUNT(*) OVER() AS COUNT_LINHA

					FROM H008 H008
					JOIN H006 H006 ON H006.IDH006 = H008.IDH006
					JOIN G028 G028 ON G028.IDG028 = H006.IDG028
					JOIN G024 G024 ON G024.IDG024 = H006.IDG024
					JOIN S001 S001 ON S001.IDS001 = H008.IDS001

					JOIN (SELECT  H008.IDH006
											, H008.HOOPERAC
											, H008.HOINICIO
											, S001.NMUSUARI
											, I015.DSOCORRE
									 FROM H008 H008
									 JOIN S001 S001 ON S001.IDS001 = H008.IDS001
									 JOIN I015 I015 ON I015.IDI015 = H008.IDI015
									WHERE H008.STAGENDA = 11
										AND TO_CHAR(H008.HOINICIO, 'DD/MM/YYYY') = '${DATA_ATUAL}'
							 ) H008R ON H008R.IDH006 = H008.IDH006

					CROSS APPLY ( SELECT MAX(G032.NRFROTA) NRFROTA FROM G032 G032 WHERE G032.NRPLAVEI = H006.NRPLAVEI ) G032A

				WHERE H008.STAGENDA = 3
					AND H008.NRSEQMOV = 1
					AND TO_CHAR(H008.HOINICIO, 'DD/MM/YYYY') = '${DATA_ANTERIOR}'

		 GROUP BY H006.IDH006
						, H006.TPMOVTO
						, G028.NMARMAZE
						, G024.NMTRANSP
						, H006.STAGENDA
						, H008.HOOPERAC
						, S001.NMUSUARI
						, H008R.HOOPERAC 
						, H008R.NMUSUARI
						, H008R.DSOCORRE
						, H008R.HOINICIO
						, H006.NRPLAVEI
						, G032A.NRFROTA

			${sqlOrder} ${sqlPaginate}`;

		return await db.execute({
			sql:sql_relatorio,
			param: bindValues,
    })
		.then((result) => {
			return utils.construirObjetoRetornoBD(result);
    })
    .catch((err) => {
			err.stack = new Error().stack + `\r\n` + err.stack;
			logger.error("Erro:", err);
			throw err;
		});
	}

	return api;

}