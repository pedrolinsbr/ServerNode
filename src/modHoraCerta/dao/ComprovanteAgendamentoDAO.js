module.exports = function (app, cb) {

	var api = {};
	var utils = app.src.utils.FuncoesObjDB;
	var db = require(process.cwd() + '/config/database');


	api.gerarComprovanteCarga = async function (req, res, next) {
		var id = req.params.id;
		console.log("meu id:  " + id);
		return await db.execute(
			{
				sql: `SELECT
          	  	H006.IDH006,
          	  	H006.STAGENDA,
            	 	H006.TPMOVTO,
            	 	H006.QTPESO,
                H006.IDG046,
            	 	H006.TXOBSAGE,
            	 	G024.NMTRANSP,
            	 	G031.NMMOTORI,
          	  	G031.RGMOTORI,
          	   	G030.DSTIPVEI,
          	   	G032.NRPLAVEI,
          	   	H002.DSTIPCAR,
          	   	H007.HOINICIO,
          	   	H007.HOFINAL,
          	   	H005.NRJANELA,
          	   	S001.NMUSUARI
            	FROM H006 H006
            		JOIN G024 G024
            			ON ( H006.IDG024 = G024.IDG024 )
            		LEFT JOIN G031 G031
            			ON ( H006.IDG031 = G031.IDG031 )
            		LEFT JOIN G030 G030
            			ON ( H006.IDG030 = G030.IDG030 )
            		LEFT JOIN G032 G032
            			ON ( H006.IDG032 = G032.IDG032 )
            		JOIN H002 H002
            			ON ( H006.IDH002 = H002.IDH002 )
            		JOIN H003 H003
            			ON ( H006.IDH003 = H003.IDH003 )
            		JOIN G005 G005
            			ON ( H006.IDG005 = G005.IDG005 )
            		JOIN G028 G028
            			ON ( H006.IDG028 = G028.IDG028 )
            		JOIN H007 H007
            			ON ( H007.IDH006 = H006.IDH006 )
            		JOIN H005 H005
            			ON ( H005.IDH005 = H007.IDH005 )
            		JOIN S001 S001
            			ON ( H006.IDS001 = S001.IDS001 )
            	WHERE
								H006.SNDELETE = 0 and 
								H006.IDH006 = `+ id,
				param: [],
			})
			.then((result) => {
				if (result.length > 0) {
					return (result[0]);
				}
				else {
					return result;
				}
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	};


	api.buscarDeliveriesCarga = async function (req, res, next) {
		var id = req.params.idCarga;
		console.log("meu id:  " + id);

		return await db.execute(
			{
				sql: `SELECT
            		G046.IDG046,							                    -- ID AGENDAMENTO
            		G046.DSCARGA,							                    -- DESCRICAO DA CARGA
            		G046.PSCARGA,							                    -- PESO TOTAL DA CARGA
            		G047.NRORDEM,							                    -- NRO SEQUENCIAL DA CARGA
            		G043.NRNOTA,							                    -- NUMERO DA NOTA
            		G005_DESTINO.NMCLIENT AS DEST_CLIENTE,        -- NOME DO CLIENTE DESTINATARIO
            		G005_DESTINO.CPENDERE AS DEST_CEP,	          -- CEP DO DESTINATARIO
            		G003_DESTINO.NMCIDADE AS DEST_CIDADE,	        -- CIDADE DESTINATARIO
            		G002_DESTINO.NMESTADO AS DEST_ESTADO,	        -- ESTADO DESTINATARIO
            		G005_ORIGEM.NMCLIENT  AS ORIG_CLIENTE,        -- CLIENTE ORIGEM
            		G005_ORIGEM.CPENDERE  AS ORIG_CEP,	          -- CEP ORIGEM
            		G003_ORIGEM.NMCIDADE  AS ORIG_CIDADE,         -- CIDADE ORIGEM
            		G002_ORIGEM.NMESTADO  AS ORIG_ESTADO	        -- ESTADO ORIGEM
            	FROM G046 G046
            	JOIN G047 G047
            		ON ( G047.IDG046 = G046.IDG046 )
            	JOIN G043 G043
            		ON ( G043.IDG043 = G047.IDG043 )
              JOIN DELIVERY_HEADER DELIVERY_HEADER
            			ON ( DELIVERY_HEADER.ID = G047.IDG043 )
            	JOIN G005 G005_DESTINO
            		ON ( DELIVERY_HEADER.SHIP_TO_CODE = G005_DESTINO.IDG005 )
            	JOIN G003 G003_DESTINO
            		ON ( G005_DESTINO.IDG003 = G003_DESTINO.IDG003 )
            	JOIN G002 G002_DESTINO
            		ON ( G003_DESTINO.IDG002 = G002_DESTINO.IDG002 )
            	JOIN G005 G005_ORIGEM
            		ON ( DELIVERY_HEADER.SELLER = G005_ORIGEM.IDG005 )
            	JOIN G003 G003_ORIGEM
            		ON ( G005_ORIGEM.IDG003 = G003_ORIGEM.IDG003 )
            	JOIN G002 G002_ORIGEM
            		ON ( G003_ORIGEM.IDG002 = G002_ORIGEM.IDG002 )
							WHERE	
							G046.SNDELETE = 0	and 
							G046.IDG046 = `+ id,
				param: [],
			})
			.then((result) => {
				return (result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	};

	api.gerarComprovanteAgendamento = async function (req, res, next) {
		var id = req.params.id;
		
		var sql = `Select
								H006.IDH006,        				-- ID DO AGENDAMENTO
								(SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046 
										FROM H024  
										WHERE H024.IDH006 = H006.IDH006 
										AND H024.SNDELETE = 0
								) AS IDG046,								-- ID DA CARGA
								(
									SELECT LISTAGG(TPOPERAC, ', ') WITHIN GROUP(ORDER BY TPOPERAC) TPOPERAC
									FROM (
													Select Distinct
														Case
																	When Nvl(H024.TPOPERAC, 1) = 1  Then 'Importação' 
																	When Nvl(H024.TPOPERAC, 1) = 2  Then 'Recebimento de Granel Líquido' 
																	When Nvl(H024.TPOPERAC, 1) = 3  Then 'Recebimento de Carga Seca' 
																	When Nvl(H024.TPOPERAC, 1) = 4  Then 'Transferências' 
																	When Nvl(H024.TPOPERAC, 1) = 5  Then 'Embalagens' 
																	When Nvl(H024.TPOPERAC, 1) = 6  Then 'Exportação' 
																	When Nvl(H024.TPOPERAC, 1) = 7  Then 'Vendas' 
																	When Nvl(H024.TPOPERAC, 1) = 8  Then 'Entrada de Terceiros' 
																	When Nvl(H024.TPOPERAC, 1) = 9  Then 'Toller' 
																	When Nvl(H024.TPOPERAC, 1) = 10 Then 'Expedição/Diversos'
																	When Nvl(H024.TPOPERAC, 1) = 11 Then 'Air Liquide'
																	When Nvl(H024.TPOPERAC, 1) = 12 Then 'Gás GLP'
																	When Nvl(H024.TPOPERAC, 1) = 13 Then 'Devolução'
																	When Nvl(H024.TPOPERAC, 1) = 14 Then 'Recusa'
																	When Nvl(H024.TPOPERAC, 1) = 15 Then 'Retorno'
																End
															as TPOPERAC
													From H024
													Where H024.IDH006 = H006.IDH006
													And H024.SNDELETE = 0
												)
								) AS H024_TPOPERAC,					-- TIPO DE OPERAÇÃO CARGA
								H006.TPOPERAC,							-- TIPO DE OPERAÇÃO AGENDAMENTO
								H006.STAGENDA,              -- STATUS
                H006.TPMOVTO,               -- TIPO DE MOVIMENTAÇÃO
                H006.QTPESO,                -- QUANTIDADE
								H006.TXOBSAGE,              -- OBSERVACAO DO AGENDAMENTO
								H006.NRNFCARG,			    		-- ID DA CARGA MONTADA
								H006.CDLACRE,			    			-- LACRE DO AGENDAMENTO
								H006.CDCONTAI,			    		-- CONTAINER DO AGENDAMENTO
                G024.NMTRANSP,              -- TRANSPORTADORA
                G031.NMMOTORI,              -- NOME DO MOTORISTA
                G031.RGMOTORI,              -- GR DO MOTORISTA
                G030.DSTIPVEI,              -- DESCRICAO DO TIPO DO VEICULO
                G032.NRFROTA AS FROTA,      -- NRO DA FROTA
                H006.NRPLAVEI,
                H002.DSTIPCAR,              -- DSCRICAO DO TIPO DA CARGA
                --H007.HOINICIO,            -- HORA INICIO DO AGENDAMENTO
                H007.HOFINAL,               -- HORA FINAL DO AGENDAMENTO
                H005.NRJANELA,              -- CODIGO DA JANELA
                G005.NMCLIENT  AS ORIG_CLIENTE,  -- TOMADOR
                G005F.DSEMAIL,						  -- TOMADOR
                S001.NMUSUARI,              -- NOME USUARIO DO AGENDAMENTO
								G028.NMARMAZE,
								G028.IDG028,
                TO_CHAR(H006.DTCADAST, 'dd/mm/yyyy HH24:mi:ss') as DTCADAST,
                TO_CHAR(H007.HOINICIO, 'dd/mm/yyyy HH24:mi:ss') as HOINICIO,

                -- Adicionando horario antes
                CASE
                  WHEN H006.IDG028 = 270 THEN
                    TO_CHAR(H007.HOINICIO - (1/24*2), 'HH24:mi')
                  ELSE
                    TO_CHAR(H007.HOINICIO - (1/24*1), 'HH24:mi')
                END HOANTES,
                CASE
                  WHEN H006.IDG028 = 270 THEN
                    TO_CHAR(H007.HOINICIO - (1/24*1.5), 'HH24:mi')
                  ELSE
                    TO_CHAR(H007.HOINICIO - (1/24*0.5), 'HH24:mi')
                END HOATE,

                TO_CHAR(H007.HOINICIO, 'dd/mm/yyyy') as DTINICIO,

                Case 
                    When H006.TpMovto = 'C' Then 'Expedição'
                    else
                        'Recebimento'
                  End      
                   as TpMovto,

                Case 
                    When Nvl(H006.StAgenda, 1) = 0 Or H007.StHorari = 'B' Then 'Inativo' 
                    When Nvl(H006.StAgenda, 1) = 1 Then 'Livre' 
                    When Nvl(H006.StAgenda, 1) = 2 Then 'Pré-reservado' 
                    When Nvl(H006.StAgenda, 1) = 3 Then 'Reservado' 
                    When Nvl(H006.StAgenda, 1) = 4 Then 'Chegou na portaria' 
                    When Nvl(H006.StAgenda, 1) = 5 Then 'Entrou na portaria' 
                    When Nvl(H006.StAgenda, 1) = 6 Then 'Iniciou a operação' 
                    When Nvl(H006.StAgenda, 1) = 7 Then 'Check-out' 
                    When Nvl(H006.StAgenda, 1) = 8 Then 'Saiu na portaria' 
                    When Nvl(H006.StAgenda, 1) = 9 Then 'Faltou' 
                    When Nvl(H006.StAgenda, 1) = 10 Then 'Cancelado'
                    else
                        ''
                  End      
				   as DsStaAge,
				   (SELECT LISTAGG(H022.DSMATERI || '- QTD: ' || H023.QTMATERI, ' | ') WITHIN GROUP(ORDER BY H022.DSMATERI) FROM H023 INNER JOIN H022 ON H023.IDH022 = H022.IDH022 WHERE H006.IDH006 = H023.IDH006) AS PRODUTOS

              From H006 H006
                Left Join G024 G024
                  On ( H006.IDG024 = G024.IDG024 )
                Left Join G031 G031
									On ( H006.IDG031 = G031.IDG031 )
								Left Join G030 G030
                  On ( H006.IDG030 = G030.IDG030 )
								Left Join G032 G032
									On ( H006.NRPLAVEI = G032.NRPLAVEI )
								Left Join H002 H002
                  On ( H006.IDH002 = H002.IDH002 )
								Left Join H003 H003
                  On ( H006.IDH003 = H003.IDH003 )
								Left Join G005 G005
									On ( H006.IDG005 = G005.IDG005 )
								Left Join G005 G005F
                  On ( H006.FORNECED = G005F.IDG005 )	
								Left Join G028 G028
                  On ( H006.IDG028 = G028.IDG028 )
								Left Join H007 H007
                  On ( H007.IDH006 = H006.IDH006 )
								Left Join H005 H005
                  On ( H005.IDH005 = H007.IDH005 )
								Left Join G046 G046
                  On ( H006.IDG046 = G046.IDG046 )
								Left Join S001 S001
                  On(H006.IDS001 = S001.IDS001)
              Where
                H006.SNDELETE = 0 and 
								H006.IDH006 = ${id}
								Order By HOINICIO ASC`

		return await db.execute(
			{
				sql,
				param: [],
			})
			.then((result) => {
				if (result.length > 0) {
					return (result[0]);
				}
				else {
					return result;
				}
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	};

	return api;
};
