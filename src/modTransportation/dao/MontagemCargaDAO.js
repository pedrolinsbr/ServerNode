/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 07/05/2018
 *
*/

/**
 * @module dao/MontagemCarga
 * @description Don't not .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  const dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var publishReleasedTripController = app.src.modIntegrador.wsdl.publishReleasedTripController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;
  var db = app.config.database;
  var utilsCA = app.src.utils.ConversorArquivos;
  const localTZ = process.env.LOCAL_TIMEZONE;
  var utilsCurl  = app.src.utils.Utils;
  const utilsFMT  = app.src.utils.Formatador;

  /**
   * @description Listar um dados da tabela G028.
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

    var filtros = "";

    if( req.body.G043_IDG005RE != undefined ){   filtros =  filtros +`  And DH.IDG005RE IN (${req.body.G043_IDG005RE.id}) ` };
    if( req.body.G043_IDG005DE != undefined ){   filtros =  filtros + ` And DH.IDG005DE IN (${req.body.G043_IDG005DE.id}) ` };
    if( req.body.G043_IDG043 != undefined ){
      filtros =  filtros + ` And DH.IDG043 IN (${req.body.G043_IDG043}) `;
    }

		var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'DH',true);
		return await db.execute(
			{

				sql: `SELECT
						DH.IDG043 IDG043,
						DH.CDDELIVE,
						DEST.NMCLIENT AS DESTINATARIO,
						REMET.NMCLIENT AS REMETENTE,
						DH.PSBRUTO,
						DH.VRDELIVE,
						DH.NRNOTA,

						DH.SNLIBROT SNLIBROT,
						DH.STETAPA 	STETAPA,
						DH.STULTETA	STULTETA,
						DH.STDELIVE STDELIVE,
						DH.CDPRIORI CDPRIORI,
						DH.SNINDSEG SNINDSEG,
						DH.TXINSTRU TXINSTRU,
						DH.TXCANHOT TXCANHOT,
						TO_CHAR(DH.DTDELIVE, 'DD/MM/YYYY') DTDELIVE,
						DH.DTLANCTO,
						TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY') DTENTCON,
						TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY') DTENTREG,
            TO_CHAR(DH.DTEMINOT, 'DD/MM/YYYY') DTEMINOT,
            DH.IDG005RE,
            DH.IDG005DE,
            G002RE.CDESTADO || ' - ' || G003RE.NMCIDADE as NMG003RE,
            G002DE.CDESTADO || ' - ' || G003DE.NMCIDADE as NMG003DE,

            NVL(REMET.NRLATITU, G003RE.NRLATITU) as NRLATITURE,
            NVL(REMET.NRLONGIT, G003RE.NRLONGIT) as NRLONGITRE,

            NVL(DEST.NRLATITU, G003DE.NRLATITU) as NRLATITUDE,
            NVL(DEST.NRLONGIT, G003DE.NRLONGIT) as NRLONGITDE,



            /*G003RE.NRLATITU as NRLATITURE,
            G003RE.NRLONGIT as NRLONGITRE,

            G003DE.NRLATITU as NRLATITUDE,
            G003DE.NRLONGIT as NRLONGITDE,*/

						(SELECT COUNT(G058.IDG058)
						FROM G058 G058
					 WHERE G058.IDG005RE = DH.IDG005RE
						 AND G058.IDG005DE = DH.IDG005DE
						 AND G058.SNDELETE = 0) AS SNVIRA,
						COUNT(DH.IDG043) OVER () as COUNT_LINHA
					FROM G043 DH
					INNER JOIN G005 REMET ON (REMET.IDG005 = DH.IDG005RE)
          INNER JOIN G005 DEST ON (DEST.IDG005 = DH.IDG005DE)

          INNER JOIN G003 G003RE ON (REMET.IDG003 = G003RE.IDG003)
          INNER JOIN G003 G003DE ON (DEST.IDG003  = G003DE.IDG003)

          INNER JOIN G002 G002RE ON (G003RE.IDG002  = G002RE.IDG002)
          INNER JOIN G002 G002DE ON (G003DE.IDG002  = G002DE.IDG002)

          ${sqlWhere} AND DH.SNOTIMAN = 1 AND DH.STETAPA = 0 ${filtros}
          ${sqlOrder}`,
				param: bindValues
			})
			.then((result) => {
				return (utils.construirObjetoRetornoBD(result));
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
  }

  /**
   * @description Salvar um dado na tabela G028.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvar = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros buscar:", req.body);

      let arcarga = req.body.ARCARGA;
      let deliveries = await con.execute(
      {
        sql: ` Select
                    'EVO' || Lpad(G043.Idg005re, 7, '0') As Idg005re,
                    'EVO' || Lpad(G043.Idg005de, 7, '0') As Idg005de,
                    G043.Idg005re as Idg005reDel,
                    G043.Idg005de as Idg005deDel,
                    sum(G043.Psbruto) As Psbruto,
                    sum(G043.Vrvolume) As Vrvolume,
                    min(G043.Dtentcon) As Dtentcon,
                    (
                    SELECT LISTAGG(G043B.idg043, ',')
                    WITHIN GROUP (ORDER BY G043B.idg043)

                    From G043 G043B
                    Where G043B.Idg005re = G043.Idg005re And G043B.Idg005de = G043.Idg005de And Idg043 In (${req.body.IDG043})) As idsg043
              From G043 G043
              Where Idg043 In (${req.body.IDG043})
              Group By Idg005re, Idg005de` ,
        param: {}
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      let xml = `
      <tripReleaseRequests>
      <tripReleaseRequest>
        <identifier>null</identifier>
        <vehicleId>${req.body.IDG030}</vehicleId>
        <nameViagem>${req.body.NMVIAGEM}</nameViagem>
        <loads>
          <load>
            <identifier></identifier>
            <loadMode>2</loadMode>
            <distance>${req.body.DISTANCE}</distance>
            <stops>`;

      let element = null;
      let xmlStops = null;
      let xmlStopsHead = null;
      let cargaTela = null;
      let IDG005RE = null;
      let IDG005DE = null;
      let headCreate = false;
      for (let index = 0; index < deliveries.length; index++) {
        element = deliveries[index];
          if (element.IDSG043.indexOf(arcarga[0].IDG043) != -1) {
            IDG005RE = element.IDG005REDEL;
            xmlStopsHead = `
                <stop>
                  <identifier></identifier>
                  <localitySourceId>${element.IDG005RE}</localitySourceId>
                  <sequenceOnLoad>1</sequenceOnLoad>
                  <subStops>
                    <subStop>
                      <identifier>${element.DTENTCON}</identifier>
                      <arrivalTime>${element.DTENTCON}</arrivalTime>
                      <departureTime>${element.DTENTCON}</departureTime>
                      <loadedShipmentUnits>
                        <shipmentUnit>
                          <identifier></identifier>
                          <weight></weight>
                          <volume></volume>
                          <deliveryUnitList>
                            <deliveryUnit>
                              <orderSourceId></orderSourceId>
                            </deliveryUnit>
                          </deliveryUnitList>
                        </shipmentUnit>
                      </loadedShipmentUnits>
                    </subStop>
                  </subStops>
                </stop>`;
          }
          if (headCreate == false) {
            IDG005DE = element.IDG005DEDEL;
            xmlStops = xmlStops + `
                <stop>
                <localitySourceId>${element.IDG005DE}</localitySourceId>
                  <sequenceOnLoad>${arcarga[index].NRORDEM + 1}</sequenceOnLoad>
                  <subStops>
                    <subStop>
                    <identifier>${element.DTENTCON}</identifier>
                    <arrivalTime>${element.DTENTCON}</arrivalTime>
                    <departureTime>${element.DTENTCON}</departureTime>
                      <identifier></identifier>
                      <unloadedShipmentUnits>
                        <shipmentUnit>
                          <identifier></identifier>
                          <weight>${element.PSBRUTO}</weight>
                          <volume>${element.VRVOLUME}</volume>
                          <deliveryUnitList>
                             `;

            let IDSG043 = element.IDSG043.split(',');

            for (let k = 0; k < IDSG043.length; k++) {
                  xmlStops = xmlStops +`<deliveryUnit> <orderSourceId>${IDSG043[k] + '_11_' + IDSG043[k]}</orderSourceId></deliveryUnit>`;
            }
            xmlStops = xmlStops +`

                          </deliveryUnitList>
                        </shipmentUnit>
                      </unloadedShipmentUnits>
                    </subStop>
                  </subStops>
                </stop>`;
          }

        }
        xml = xml + xmlStopsHead + xmlStops + `
            </stops>
          </load>
        </loads>
      </tripReleaseRequest>
    </tripReleaseRequests>`;

      //console.log(xml);
      json = require('xml2json').toJson(xml, { object: true });
      let resCarga = await publishReleasedTripController.processarXMLOtimizador(json, false);
      let cargaCriada = resCarga[0].idg046;
      let vira = await con.execute(
        {
          sql: ` Select G058.IDG058,
                        G058.IDG005RE,
                        G058.IDG005DE,
                        G058.SNDELETE,
                        G058.STCADAST,
                        G058.DTCADAST,
                        G058.IDS001,
                        G058.IDG024
                   From G058 G058
                  Where G058.IDG005RE = `+ IDG005RE + `
                    And G058.IDG005DE = `+ IDG005DE + `
                    And G058.STCADAST = 'A'
                    And G058.SNDELETE = 0 `,
          param: {},
        })
        .then((result) => {

          logger.debug("Retorno:", result);
          return (result);

        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      if (vira.length > 0) {
        let dadosVira = null;
        for (let i = 0; i < vira.length; i++) {
          dadosVira = vira[i];

          resCarga = await
          con.update({
            tabela: 'G046',
            colunas: {
              STCARGA: 'A',
              IDG024: dadosVira.IDG024

            },
            condicoes: ` IDG046 in (`+cargaCriada+`)`
          })
            .then((result1) => {
            logger.debug("Retorno:", result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
              });
          resCargaHis =  await db.insert({
            tabela: 'O005',
            colunas: {
              IDG024 : dadosVira.IDG024,
              IDG046 : cargaCriada,
              DTOFEREC: new Date(),
              DTRESOFE: new Date(),
              IDS001OF: 4,
              IDS001RE: 4,
              STOFEREC: 'A'
            },
            key: 'Ido005'
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
      await con.close();
      logger.debug("Fim salvar");
      return {response: "Carga "+cargaCriada+" criada com sucesso!"};
    } catch (err) {
      //console.log(err);
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };

  /**
   * @description Delete um dado na tabela G028.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluir = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("ID selecionados");
      var ids = req.body.IDG043;

    let result = await
      con.update({
        tabela: 'G043',
        colunas: {
          SNOTIMAN: 0
        },
        condicoes: ` IDG043 in (`+ids+`)`
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.delete') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });

      await con.close();
      logger.debug("Fim excluir");
      return result;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }

  };

  /**
   * @description BUsca Indicadores da Mountagem de carga.
   *
   * @async
   * @function api/tp/montagemCarga/indicadores
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @author Adryell Batista.

   */
    api.indicadoresMountingLoad = async function(req,res,next){
        var tplObjRet = [] ;
        //return tplObjRet;

        var objConn = await this.controller.getConnection(req.objConn, req.UserId);
				try {
						var result = await objConn.execute({
                sql:`
                SELECT
                  ( SELECT
                    COUNT( G051.Idg051 )
                  FROM
                    G051 G051
                    --CTE
                  LEFT JOIN G052 G052 ON
                    G051.IDG051 = G052.IDG051
                  INNER JOIN G043 G043 ON
                    G052.IDG043 = G043.IDG043
                  WHERE
                    G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND G051.Dtcombin IS NOT NULL ) AS Lscombin,
                  ( SELECT
                    COUNT( G051.Idg051 )
                  FROM
                    G051 G051
                    --CTE
                  LEFT JOIN G052 G052 ON
                    G051.IDG051 = G052.IDG051
                  INNER JOIN G043 G043 ON
                    G052.IDG043 = G043.IDG043
                  WHERE
                    G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND G051.Dtagenda IS NOT NULL ) AS Lsagenda,
                  /*( SELECT
                    COUNT(*)
                  FROM
                    G043 G043
                    -- NF
                  LEFT JOIN G052 G052 ON
                    G052.IDG043 = G043.Idg043
                    -- NF COM CTE
                  LEFT JOIN G051 G051 ON
                    G051.Idg051 = G052.Idg051
                    -- CTE
                  WHERE
                    1 = 1
                    AND G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND G043.Cdpriori IN ( 1, 2 )) AS Lspriori,*/
                  ( SELECT
                    COUNT(*)
                  FROM
                    G043 G043
                    -- NF
                  LEFT JOIN G052 G052 ON
                    G052.Idg043 = G043.Idg043
                    -- NF COM CTE
                  LEFT JOIN G051 G051 ON
                    G051.Idg051 = G052.Idg051
                    -- CTE
                  WHERE
                    1 = 1
                    AND G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND ( NVL( NVL( G051.Dtcombin, G051.Dtagenda ), G043.Dtentcon ) - TO_DATE( CURRENT_DATE, 'DD/MM/YY' )) < 0 ) AS Lsvencid,
                 /* ( SELECT
                    COUNT(Distinct G051.idG051)
                  FROM
                    G043 G043
                    -- NF
                   JOIN G052 G052 ON
                    G052.Idg043 = G043.Idg043
                    -- NF COM CTE
                   JOIN G051 G051 ON
                    G051.Idg051 = G052.Idg051
                    -- CTE
                  WHERE
                    1 = 1
                    AND G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND ( NVL( NVL( G051.Dtcombin, G051.Dtagenda ), G043.Dtentcon ) - TO_DATE( CURRENT_DATE, 'DD/MM/YY' )) >= 0
                    --) XX
                ) AS Lsnaoven,*/
                  ( SELECT
                    COUNT( G051.Idg051 )
                  FROM
                    G051 G051
                    --CTE
                  LEFT JOIN G052 G052 ON
                    G051.IDG051 = G052.IDG051
                  INNER JOIN G043 G043 ON
                    G052.IDG043 = G043.IDG043
                  WHERE
                    G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND ( NVL( G051.Dtroteri, CURRENT_DATE ) - TO_DATE( CURRENT_DATE, 'DD/MM/YY' )) < 0 ) AS Lsrotmen,
                  ( SELECT
                    COUNT( G051.Idg051 )
                  FROM
                    G051 G051
                    --CTE
                  LEFT JOIN G052 G052 ON
                    G051.IDG051 = G052.IDG051
                  INNER JOIN G043 G043 ON
                    G052.IDG043 = G043.IDG043
                  WHERE
                    G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    AND ( NVL( G051.Dtroteri, CURRENT_DATE ) - TO_DATE( CURRENT_DATE, 'DD/MM/YY' )) = 0 ) AS Lsrotigu,
                  ( SELECT
                    COUNT( G051.Idg051 )
                  FROM
                    G051 G051
                    --CTE
                  LEFT JOIN G052 G052 ON
                    G051.IDG051 = G052.IDG051
                  INNER JOIN G043 G043 ON
                    G052.IDG043 = G043.IDG043
                  WHERE
                    G043.IDG024TR = ${req.params.IDG024TR}
                    And G043.dtentreg Is Null
                    And G051.Dtroteri Is Not Null
                    AND ( NVL( G051.Dtroteri, CURRENT_DATE ) - TO_DATE( CURRENT_DATE, 'DD/MM/YY' )) > 0 ) AS Lsrotmai
                FROM
                  Dual
        `,
								param:[]
						}).then((res) => {

              /*
                LSAGENDA:13
                LSCOMBIN:1
                LSNAOVEN:367
                LSPRIORI:8
                LSROTIGU:0
                LSROTMAI:1088
                LSROTMEN:2
                LSVENCID:3315
              */


                tplObjRet = [

                  {
                    label:"Agendados",
                    indNum:res[0].LSAGENDA,
                    bgColor:"rgb(93, 199, 215)",
                    icon:"far fa-calendar-alt",
                    filtParam:"0"
                },
                
                /*{
                    label:"Prioridade 4pl",
                    indNum:res[0].LSPRIORI,
                    bgColor:"#4e7ec7",
                    icon:"far fa-building",
                    filtParam:"2"
               },*/

                // {
                //     label:"Não Vencidos",
                //     indNum:res[0].LSNAOVEN,
                //     bgColor:"rgba(91, 193, 123, 0.94)",
                //     icon:"far fa-calendar-check",
                //     filtParam:"2"
                // },

                {
                    label:"Rot. para fazer",
                    indNum:res[0].LSROTIGU,
                    bgColor:"rgb(21, 156, 151)",
                    icon:"fas fa-map-marker-alt",
                    filtParam:"2"
                },
                {
                    label:"Combinados",
                    indNum:res[0].LSCOMBIN,
                    bgColor:"rgba(249, 156, 37, 0.7)",
                    icon:"fas fa-handshake",
                    filtParam:"1"
                },
                {
                    label:"Rot. Bloqueada",
                    indNum:res[0].LSROTMAI,
                    bgColor:"rgb(243, 129, 146)",
                    icon:"fas fa-ban",
                    filtParam:"2"
                },
                {
                    label:"Rot. Vencida",
                    indNum:res[0].LSROTMEN,
                    bgColor:"rgb(204, 62, 83)",
                    icon:"far fa-calendar-times",
                    filtParam:"2"
                },
                {
                    label:"Vencidos",
                    indNum:res[0].LSVENCID,
                    bgColor:"rgb(255, 17, 52)",
                    icon:"far fa-clock",
                    filtParam:"2"
                }
              ];

              return tplObjRet;

						}).catch((err) => {
								throw err;
						});
						objConn.close();
						return result;

				} catch (err) {
						objConn.closeRollBack();
						throw err;
				}


  	}

    api.indicadoresMountingLoad4pl = async function(req,res,next){
      var tplObjRet = [] ;
      //return tplObjRet;

      var objConn = await this.controller.getConnection(req.objConn, req.UserId);
      try {
          var result = await objConn.execute({
              sql:`
              SELECT x.*, nvl((x.LSPRAROT - x.LSVENCID - x.LSBLOQUE), 0) AS LSNOPRAZ FROM ( 
                SELECT 

                (SELECT COUNT(*)
                   FROM G043 G043
                  WHERE 1 = 1
                    And G043.DTENTREG IS NULL
                    And G043.SNOTIMAN = 1
                    And G043.STETAPA = 1
                    And (G043.DtBloque Is Not Null And  G043.DtDesBlo Is Null)
                    ) AS LSBLOQUE,

  
                (SELECT COUNT(*)
                   FROM G043 G043
                  WHERE 1 = 1
                    And G043.DTENTREG IS NULL
                    And G043.SNOTIMAN = 1
                    And g043.STETAPA = 1
                    And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                    Or G043.DtBloque Is Null)
                    ) AS LSPRAROT, 
                    
              (SELECT COUNT(*)
               FROM G043 G043
              WHERE 1 = 1
                AND G043.DTENTREG IS NULL
                    And G043.SNOTIMAN = 1
                    And g043.STETAPA = 1
                    And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                    Or G043.DtBloque Is Null)
                    And G043.DTVENROT - TO_DATE(CURRENT_DATE,'DD/MM/YY') < 0) AS LSVENCID
      
           FROM DUAL ) X
      `,
              param:[]
          }).then((res) => {

              tplObjRet = [
              {
                  label:"Total",
                  indNum:res[0].LSPRAROT,
                  bgColor:"rgb(93, 199, 215)",
                  icon:"far fa-calendar-alt",
                  filtParam:"0"
              },
              {
                  label:"Rotas Vencidas",
                  indNum:res[0].LSVENCID,
                  bgColor:"rgb(255, 17, 52)",
                  icon:"far fa-clock",
                  filtParam:"2"
              },
              {
                label:"Rotas no prazo",
                indNum:res[0].LSNOPRAZ,
                bgColor:"rgba(91, 193, 123, 0.94)",
                icon:"far fa-calendar-check",
                filtParam:"2"
              },
              {
                label:"Rotas bloqueadas",
                indNum:res[0].LSBLOQUE,
                bgColor:"rgba(255, 172, 47, 0.94)",
                icon:"far fa-times-circle",
                filtParam:"2"
              }
            ];

            return tplObjRet;

          }).catch((err) => {
              throw err;
          });

          objConn.close();
          return result;

      } catch (err) {
          objConn.closeRollBack();
          throw err;
      }


  }


 //# VISÃO 1

  api.listarDocumentos = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    try {
      //var id = req.body.IDT001;
      var visao = req.body.visao;
      var ArColumn = "";

      var lsDocumentos = [];
      lsDocumentos['ctrc'] = null;
      lsDocumentos['delivery'] = null;

      if(visao == 1){

        ArColumn = ",";
        lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoUm]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoUm]'] : "");
        lsDocumentos['delivery'] = (req.body['parameter[lsDocumentos][delivery][visaoUm]'] != "" ? req.body['parameter[lsDocumentos][delivery][visaoUm]'] : "");
      
      }else if(visao == 2){

        ArColumn = "NmCidade,CdEstado";
        lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoDois]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoDois]'] : req.body['parameter[lsDocumentos][ctrc][visaoUm]']);
        lsDocumentos['delivery'] = (req.body['parameter[lsDocumentos][delivery][visaoDois]'] != "" ? req.body['parameter[lsDocumentos][delivery][visaoDois]'] : req.body['parameter[lsDocumentos][delivery][visaoUm]']);
      
      }else if(visao == 3){

        ArColumn = "NmCidade,CdEstado,Nmcliede";
        lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoTres]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoTres]'] : req.body['parameter[lsDocumentos][ctrc][visaoDois]']);
        lsDocumentos['delivery'] = (req.body['parameter[lsDocumentos][delivery][visaoTres]'] != "" ? req.body['parameter[lsDocumentos][delivery][visaoTres]'] : req.body['parameter[lsDocumentos][delivery][visaoDois]']);
      
      }else if(visao == 4){

        ArColumn = "NmCidade,CdEstado,Nmclieco,Idg005co,Nmcliede";
        lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoQuatro]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoQuatro]'] : req.body['parameter[lsDocumentos][ctrc][visaoTres]']);
        lsDocumentos['delivery'] = (req.body['parameter[lsDocumentos][delivery][visaoQuatro]'] != "" ? req.body['parameter[lsDocumentos][delivery][visaoQuatro]'] : req.body['parameter[lsDocumentos][delivery][visaoTres]']);
      
      }

      if(lsDocumentos['ctrc']){
        if(lsDocumentos['ctrc'][0] == ","){
          lsDocumentos['ctrc'] = lsDocumentos['ctrc'].substr(1, lsDocumentos['ctrc'].length);
        }
      }else{
        lsDocumentos['ctrc'] = "";
      }


      if(lsDocumentos['delivery']){
        if(lsDocumentos['delivery'][0] == ","){
          lsDocumentos['delivery'] = lsDocumentos['delivery'].substr(1, lsDocumentos['delivery'].length);
        }
      }else{
        lsDocumentos['delivery'] = "";
      }



      var sqlWhereAuxCTRC = "";
      var sqlWhereAuxDelivery = "";
      var sqlTpDocumento = "";
      var sqlDelivery = "";
      var sqlCtrc = "";
      var sqlJoinDelivery = "";

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G051',false);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);


      if(bindValues){

        // CTRC
        var G051_IDG024 = [];
        if (bindValues.G051_IDG024) {
          for (var key in bindValues.G051_IDG024) {
            G051_IDG024[key] = bindValues.G051_IDG024[key]['id'];
          }
          G051_IDG024 = G051_IDG024.join(',');

          sqlWhereAuxCTRC     += " AND nvl(G051.IDG024AT,G051.IDG024) in ("+G051_IDG024+") ";
          sqlWhereAuxDelivery += " AND G084.idg024 in ("+G051_IDG024+") ";

        }


        //CTRC
        /*
        if (bindValues.G051_IDG024) {
          sqlWhereAuxCTRC += " AND nvl(G051.IDG024AT,G051.IDG024) in ("+bindValues.G051_IDG024+") ";

          sqlWhereAuxDelivery += " AND G084.idg024 in ("+bindValues.G051_IDG024+") ";
        
        }*/

        // TIPO TRANSPORTE
        var G051_TPTRANSP = [];
        var G051_TPTRANSP_G043 = [];
        if (bindValues.G051_TPTRANSP) {
          var j = 0;
          for (var key in bindValues.G051_TPTRANSP) {

            G051_TPTRANSP[key] = "'"+bindValues.G051_TPTRANSP[key]['id']+"'";

            if(bindValues.G051_TPTRANSP[key]['id'] == "V"){
              G051_TPTRANSP_G043[j] = 2;
              j++;
            }else if(bindValues.G051_TPTRANSP[key]['id'] == "T"){
              G051_TPTRANSP_G043[j] = 1;
              j++;
            }else if(bindValues.G051_TPTRANSP[key]['id'] == "G"){
              G051_TPTRANSP_G043[j] = 5;
              j++;
            }

          }

          G051_TPTRANSP = G051_TPTRANSP.join(',');
          G051_TPTRANSP_G043 = G051_TPTRANSP_G043.join(',');
 
          sqlWhereAuxCTRC += " AND G051.TPTRANSP in ("+G051_TPTRANSP+") ";

          sqlWhereAuxDelivery += " AND G043.TPDELIVE in ("+G051_TPTRANSP_G043+") ";
          
          //# delivery status
          // 1 - tranferencia
          // 2 - venda
          // 3 - devolução
          // 4 - recusa

        }

        // ESTADOS
        var G051_IDG002 = [];
        if (bindValues.G051_IDG002) {
          for (var key in bindValues.G051_IDG002) {
            G051_IDG002[key] = bindValues.G051_IDG002[key]['id'];
          }
          G051_IDG002 = G051_IDG002.join(',');
          sqlWhereAuxCTRC     += " AND G003DE.IDG002 in ("+G051_IDG002+") ";
          sqlWhereAuxDelivery += " AND G003DE.IDG002 in ("+G051_IDG002+") ";
        }


        // CALENDARIZACAO
        var G051_ARCALEND = [];
        if (bindValues.G051_ARCALEND) {
          
          for (var key in bindValues.G051_ARCALEND) {
            G051_ARCALEND[key] = "'"+bindValues.G051_ARCALEND[key]['id']+"'";
          }
          G051_ARCALEND = G051_ARCALEND.join(',');
          
          //#vencidos
          if(bindValues.G051_ARCALEND[0].id == 1){ 
            sqlWhereAuxDelivery += " AND (to_char(G043.DTVENROT, 'DD/MM/YYYY') in ("+G051_ARCALEND+") OR to_date(G043.DTVENROT, 'DD/MM/YYYY') < to_date(CURRENT_DATE, 'DD/MM/YYYY') ) ";
          }else{
            sqlWhereAuxDelivery += " AND to_char(G043.DTVENROT, 'DD/MM/YYYY') in ("+G051_ARCALEND+") ";
          }
        }

        // Operacao
        var G051_IDG014 = [];
        if (bindValues.G051_IDG014) {
          for (var key in bindValues.G051_IDG014) {
            G051_IDG014[key] = bindValues.G051_IDG014[key]['id'];
          }
          G051_IDG014 = G051_IDG014.join(',');
          //sqlWhereAuxCTRC     += " AND G003DE.IDG002 in ("+G051_IDG014+") ";
          sqlWhereAuxDelivery += " AND G043.IDG014 in ("+G051_IDG014+") ";
        }

        //CIDADES
        var G051_IDG003 = [];
        if (bindValues.G051_IDG003) {
          for (var key in bindValues.G051_IDG003) {
            G051_IDG003[key] = bindValues.G051_IDG003[key]['id'];
          }
          G051_IDG003 = G051_IDG003.join(',');
          sqlWhereAuxCTRC     += " AND G003DE.IDG003 in ("+G051_IDG003+") ";
          sqlWhereAuxDelivery += " AND G003DE.IDG003 in ("+G051_IDG003+") ";
        }

        //ROTAS
        if (bindValues.G051_IDT001) {
          sqlWhereAuxCTRC     += " AND T002.IDT001 in ("+bindValues.G051_IDT001+") ";
          sqlWhereAuxDelivery += " AND T002.IDT001 in ("+bindValues.G051_IDT001+") ";
        }

        //DESTINATARIO
        if (bindValues.G051_IDG005DE) {
          sqlWhereAuxCTRC     += " AND G005DE.IDG005 in ("+bindValues.G051_IDG005DE+") ";
          sqlWhereAuxDelivery += " AND G005DE.IDG005 in ("+bindValues.G051_IDG005DE+") ";
        }

        //TOMADOR
        if (bindValues.G051_IDG005C0) {
          sqlWhereAuxCTRC     += " AND G051.IDG005CO in ("+bindValues.G051_IDG005C0+") ";
          sqlWhereAuxDelivery += " AND G043.IDG005RE in ("+bindValues.G051_IDG005C0+") ";
        }

        //REMETENTE
        if (bindValues.G051_IDG005RE) {
          sqlWhereAuxCTRC     += " AND G051.IDG005RE in ("+bindValues.G051_IDG005RE+") ";
          sqlWhereAuxDelivery += " AND G043.IDG005RE in ("+bindValues.G051_IDG005RE+") ";
        }


        //CTRC
        if (bindValues.G051_IDG051) {
          sqlWhereAuxCTRC += " AND G051.CDCTRC in ("+bindValues.G051_IDG051+") ";
        }


        //CODIGO DELIVERY
        if (bindValues.G051_CDDELIVE) {
          sqlWhereAuxDelivery += " AND G043.CDDELIVE in ("+bindValues.G051_CDDELIVE+") ";
        }


        //DELIVERY
        if (bindValues.G051_IDG043) {
          sqlWhereAuxDelivery += " AND G043.IDG043 in ("+bindValues.G051_IDG043+") ";
        }


        //NOTA
        if (bindValues.G051_NRNOTA) {
          sqlWhereAuxCTRC += " AND G043.NRNOTA in ("+bindValues.G051_NRNOTA+") ";
        }


        //CDPRIORI
        if (bindValues.G051_SNPRIORI== "1") {
          sqlWhereAuxDelivery += " And G043.Cdpriori In (1, 2) ";
        }else if(bindValues.G051_SNPRIORI== "2"){
          sqlWhereAuxDelivery += " And G043.Cdpriori not In (1, 2) ";
        }



        // DTENTCON
        if (bindValues.G051_DTENTCON0 && bindValues.G051_DTENTCON1) {
      
          var moment = require('moment');
          moment.locale('pt-BR');
          
          var d0 = moment(bindValues.G051_DTENTCON0).format('l');
          var d1 = moment(bindValues.G051_DTENTCON1).format('l');

          sqlWhereAuxCTRC     += ` And Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) >= 
          to_date( '${d0}', 'dd/mm/yyyy') AND Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) <= 
          to_date( '${d1}', 'dd/mm/yyyy') `;
          
          sqlWhereAuxDelivery += ` And G043.DtEntCon >= 
          to_date( '${d0}', 'dd/mm/yyyy')  And G043.DtEntCon <= 
          to_date( '${d1}', 'dd/mm/yyyy') `;
        }

        // NOTLIBER
        if (bindValues.G051_NOTLIBER) {
          if(bindValues.G051_NOTLIBER == 1){
            sqlWhereAuxCTRC     += ` And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
            Or G043.DtBloque Is Null) `;
          
            sqlWhereAuxDelivery += ` And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
            Or G043.DtBloque Is Null) `;
          }else if(bindValues.G051_NOTLIBER == 2){
            sqlWhereAuxCTRC     += ` And (G043.DtBloque Is Not Null And  G043.DtDesBlo Is Null) `;
          
            sqlWhereAuxDelivery += `And  (G043.DtBloque Is Not Null And  G043.DtDesBlo Is Null) `;
          }
        }

      }


      //Cluster
      // if (bindValues.G051_IDT005) {
      //   sqlWhereAuxDelivery += " AND T005.IDT005 in ("+bindValues.G051_IDT005+") ";
      // }


      //CALENDARIZAÇÃO
      var padraoRotAux = "";
      if (bindValues.G051_IDT005) {
        var auxDiasT001 = "";
        var auxDiasT002 = "";

        padraoRotAux = ` and c.IDT005 = ${bindValues.G051_IDT005} `;
        if(bindValues.G051_CALENDARIO){
          for(pos in bindValues.G051_CALENDARIO){
            //console.log(bindValues.G051_CALENDARIO[pos].id);
            auxDiasT001 = auxDiasT001 + " OR  T1.SNDIA"+bindValues.G051_CALENDARIO[pos].id + "=1 ";
            auxDiasT002 = auxDiasT002 + " OR  T2.SNDIA"+bindValues.G051_CALENDARIO[pos].id + "=1 ";
            
          }

          sqlWhereAuxCTRC     += ` AND (T002.IDT001 in (
          select distinct T1.idT001
            from T001 T1
            join T002 T2
              on T1.idT001 = T2.idT001
           where 1=1 
             AND (1=0 ${auxDiasT001}) 
             and (1=0 ${auxDiasT002})
             AND T1.IDT005 = ${bindValues.G051_IDT005}
             AND T1.IDG024 = ${bindValues.IDG024_CARGA}) 
              OR nvl(T002.IDT001,0) = 0)`;

          sqlWhereAuxDelivery += ` AND (T002.IDT001 in (
          select distinct T1.idT001
            from T001 T1
            join T002 T2
              on T1.idT001 = T2.idT001
           where 1=1 
             AND (1=0 ${auxDiasT001}) 
             AND (1=0 ${auxDiasT002})
             AND T1.IDT005 = ${bindValues.G051_IDT005}
             AND T1.IDG024 = ${bindValues.IDG024_CARGA}) 
              OR nvl(T002.IDT001,0) = 0)`;
        }else{

          sqlWhereAuxCTRC     += ` AND (T002.IDT001 in (
          select T1.idT001
            from T001 T1
            join T002 T2
              on T1.idT001 = T2.idT001
           where T1.IDT005 = ${bindValues.G051_IDT005}
             AND T1.IDG024 = ${bindValues.IDG024_CARGA}) 
              OR nvl(T002.IDT001,0) = 0)`;

          sqlWhereAuxDelivery += ` AND (T002.IDT001 in (
          select T1.idT001
            from T001 T1
            join T002 T2
              on T1.idT001 = T2.idT001
           where T1.IDT005 = ${bindValues.G051_IDT005}
             AND T1.IDG024 = ${bindValues.IDG024_CARGA}) 
              OR nvl(T002.IDT001,0) = 0)`;

        }
      }
      


        //CDDELIVE
        if (bindValues.G051_CDDELIVE) {
          sqlWhereAuxCTRC += " AND G043.CDDELIVE in ("+bindValues.G051_CDDELIVE+") ";
        }


        //G0769
        if (bindValues.G051_G0769) {
          sqlWhereAuxDelivery += ` And Exists (select g076a.ids007PK 
                                         from g076 g076a 
                                        where g076a.idg075 in (9) 
                                          and g076a.vrcampo in (${bindValues.G051_G0769}) 
                                          and g076a.ids007pk = G043.idg043 ) `;
        }

        //G07610
        if (bindValues.G051_G07610) {
          sqlWhereAuxDelivery += ` And Exists (select g076b.ids007PK 
                                         from g076 g076b 
                                        where g076b.idg075 in (10) 
                                          and g076b.vrcampo in (${bindValues.G051_G07610}) 
                                          and g076b.ids007pk = G043.idg043 ) `;
        }

        //VRCAMPO
        if (bindValues.G051_VRCAMPO) {
          sqlWhereAuxDelivery += ` And Exists (select g045.idg043 
                                         from g045 g045 
                                        where g045.cdlocven in (${bindValues.G051_VRCAMPO}) 
                                          and g045.idg043 = G043.idg043 ) `;
        }

        if(bindValues.G051_SNVIRA == "1"){
          sqlJoinDelivery = ` join g058 g058
          on g058.idg005re = G043.idg005re
         and g058.idg005de = nvl(G043.IDG005RC,G043.IDG005DE) `;
        }

      //console.log(sqlWhereAuxCTRC, sqlWhereAuxDelivery);


      sqlDelivery = `

      Select distinct
             D.IdT001,
             D.DsPraca,
             D.PsBruto,
             D.PsLotaca,
             D.DtEntCon,
             D.DTENT4PL,
             D.VrMercad,
             D.IdG051,
             D.cdctrc,
             D.IDG043,
             D.NRNOTA,

             ${( visao == 2 ?`
             D.NmCidade , 
             D.CdEstado , 
              `:``)
             }

             ${( visao == 3 ?`
             D.NmCidade , 
             D.CdEstado , 
             D.Nmcliede,
              `:``)
             }

             ${( visao == 4 ?`
             D.NmCidade , 
             D.CdEstado , 
             D.Nmclieco , 
             D.Idg005co,
             D.Nmcliede,
              `:``)
             }


             D.CDDELIVE,
             D.EMITRANS,
             D.DTVENROT
      From (
              Select  DISTINCT 
              NVL(NVL(T002.IDT001, T003.IDT001), 0) AS IDT001,
              (SELECT T001.DsPraca
                FROM T001 T001
               WHERE T001.IDT001 = NVL(T002.IDT001, T003.IDT001)
                 AND T001.IDG024 = NVL(T002.IDG024, T003.IDG024)
                 AND T001.SNDELETE = 0) AS DsPraca,
              G043.PsBruto,
              G043.PsBruto as PsLotaca,
              G043.DtEntCon,
              G043.DTENT4PL,
              G043.DTVENROT,
              G043.Vrdelive AS VrMercad,
              NULL AS IdG051,
              NULL AS cdctrc,
              G043.IdG043,
              to_char(G043.NrNota) as NrNota,
              G005co.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005co.CJCLIENT) || ' - ' || G005co.IECLIENT || ']' AS Nmclieco,
              G005co.Idg005 AS IdG005co,
              G005DE.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT) || ' - ' || G005DE.IECLIENT || ']' AS Nmcliede,
              G043.CDDELIVE,
              null as EMITRANS
              


            ${utils.columnSqlAux("G003DE.NmCidade As ", ArColumn.split(",")[0])}
            ${utils.columnSqlAux("G002DE.CdEstado As ", ArColumn.split(",")[1])}

            FROM
            G043 G043
            -- NF
          INNER JOIN G005 G005DE ON
            G005DE.IDG005 = nvl(G043.IDG005RC,G043.IDG005DE)
            -- DESTINATARIO
          INNER JOIN G003 G003DE ON
            G003DE.IdG003 = G005DE.IdG003
            -- CIDADE/DESTINATARIO
          INNER JOIN G002 G002DE ON
            G002DE.IdG002 = G003DE.IdG002
            -- ESTADO/DESTINATARIO
          INNER JOIN G005 G005RE ON
            G005RE.IDG005 = G043.IDG005RE
            -- REMETENTE
          INNER JOIN G003 G003RE ON
            G003RE.IdG003 = G005RE.IdG003
            -- REMETENTE/DESTINATARIO
          INNER JOIN G002 G002RE ON
            G002RE.IdG002 = G003RE.IdG002
            -- ESTADO/REMETENTE
          LEFT JOIN T002 T002 ON
             T002.IdG024 = ${bindValues.IDG024_CARGA}
            AND T002.IDG003 = G005DE.IDG003
            AND T002.IDT002 = (
            SELECT
              b.IDT002
            FROM
              t002 b
              join t001 c
              on c.IDT001 = b.IDT001
              ${padraoRotAux}
              and c.SNDELETE = 0
            WHERE
              b.IDG003 = T002.IDG003
              AND b.SNDELETE = 0
              AND b.IdG024 = T002.IdG024
              AND Rownum = 1)
              AND T002.SNDELETE = 0
          LEFT JOIN T003 T003 ON
            T003.IdG024 = G043.IdG024TR
            AND T003.IDG005 = G005DE.IDG005
            AND T003.SNDELETE = 0
          LEFT JOIN G005 G005co ON
            G005co.Idg005 = G043.Idg005re
            -- CONSIGNATÁRIO

            LEFT JOIN  G084 G084 ON
            G005RE.IDG028 = G084.IDG028

          ${(sqlJoinDelivery)}

          WHERE /*NOT EXISTS (
            SELECT
              *
            FROM
              G052 G052
            WHERE
              G052.IdG043 = G043.IdG043)
            AND */G043.SnDelete = 0
            /*AND G043.DtEntCon IS NOT NULL*/
            AND G043.CdDelive IS NOT NULL
            AND G043.SNOTIMAN = 1
            AND G043.STETAPA in (1) -- O CERTO É FICAR NA STETAPA 1 (OTIMIZANDO). MUDAR NA ROTA DO BOTÃO ROTEIRIZAÇÃO MANUAL
            AND G043.STDELIVE <> 'D'

            And Not Exists (Select *
              From G049 G049, G048 G048, G046 G046
             Where G049.Idg043 = G043.Idg043
               And G048.Idg048 = G049.Idg048
               And G046.Idg046 = G048.Idg046
               And G046.Stcarga <> 'C'
               And G046.Sndelete = 0
               and g046.tpmodcar in (2,3))


            ${(lsDocumentos['delivery'] != "" ? `And G043.IdG043 In (`+lsDocumentos['delivery']+`) ` : '')}
            ${sqlWhereAuxDelivery} )D`;


      sqlCtrc = `
                  Select X0.IdT001,
                        X0.DsPraca,
                        X0.PsBruto,
                        X0.PsLotaca,
                        X0.DtEntCon,
                        X0.DtEnt4PL,
                        X0.VrMercad,
                        X0.IdG051,
                        X0.cdctrc,
                        X0.IDG043,
                        LISTAGG(X0.NRNOTA, ', ') WITHIN GROUP(ORDER BY X0.NRNOTA) AS NRNOTA, 
                        
                        ${( visao == 2 ?`
                        X0.NmCidade , 
                        X0.CdEstado , 
                         `:``)
                        }
           
                        ${( visao == 3 ?`
                        X0.NmCidade , 
                        X0.CdEstado , 
                        X0.Nmcliede,
                         `:``)
                        }
           
                        ${( visao == 4 ?`
                        X0.NmCidade , 
                        X0.CdEstado , 
                        X0.Nmclieco , 
                        X0.Idg005co,
                        X0.Nmcliede,
                         `:``)
                        }
                        
                        
                        Null As CDDELIVE,
                        X0.EMITRANS,
                        X0.DTVENROT
                  From (
                        Select Distinct 
                              Nvl(Nvl(T002.IDT001, T003.IDT001), 0) As IDT001,
                                      G051.IdG024,
                              (Select  T001.DsPraca
                                From T001 T001
                              Where T001.IDT001 = Nvl(T002.IDT001, T003.IDT001)
                                And T001.IDG024 = Nvl(T002.IDG024, T003.IDG024)) As DsPraca,
                              Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) As DtEntCon,
                              G043.DtEnt4pl,
                              G051.NRPESO as PsBruto,
                              nvl(G051.PsLotaca, G051.NRPESO) as PsLotaca,
                              G051.VrMercad,
                              G051.IdG051,
                              G051.cdctrc,
                              null As IdG043,
                              G043.NRNOTA,
                              G051.Idg005co,
                              /*G005co.Nmclient As Nmclieco,*/
                              G005co.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005co.CJCLIENT) || ' - ' || G005co.IECLIENT ||']' As Nmclieco,
                              G005DE.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT) || ' - ' || G005DE.IECLIENT ||']' As Nmcliede,
                              G003DE.NmCidade As NmCidade,
                              G002DE.CdEstado As CdEstado,
                              G024.NMTRANSP || ' [' || g024.idg024   || '-' || g024.idlogos   || ']' as EMITRANS,
                              null as DTVENROT
                              
                          From G051 G051 --CTE
                          Join G052 G052
                            On G052.IdG051 = G051.IdG051 -- NF COM CTE
                          Join G043 G043
                            On G043.IdG043 = G052.IdG043 -- NF
                          and G043.DtEntreg is null
                    Left Join G005 G005DE
                            On G005DE.IDG005 = NVL(G051.IDG005RC, G051.IDG005DE) -- DESTINATARIO

                          Join G003 G003DE
                            On G003DE.IdG003 = G005DE.IdG003 -- CIDADE/DESTINATARIO

                          Join G002 G002DE
                            On G002DE.IdG002 = G003DE.IdG002 -- ESTADO/DESTINATARIO

                          Join G024 G024
                            On G024.idg024 = G051.idg024

                    Left Join G005 G005RC
                            On G005RC.IDG005 = G051.IDG005RC -- DESTINATARIO

                    Left Join T002 T002
                            On T002.IdG024 = nvl(G051.IdG024At, G051.IdG024) 
                          And T002.IDG003 = Nvl(G005RC.IDG003, G005DE.IDG003)
                          And T002.IDT002 = (Select b.IDT002 From t002 b 
                            join t001 c
                            on c.IDT001 = b.IDT001
                            ${padraoRotAux}
                            and c.SNDELETE = 0
                            Where b.IDG003 = T002.IDG003 
                              AND b.IdG024 = nvl(G051.IdG024At, G051.IdG024) 
                              AND b.SNDELETE = 0
                              AND b.IdG024 = T002.IdG024
                              AND Rownum = 1)
                              AND T002.SNDELETE = 0
                    Left Join G003 G003T2
                            On G003T2.IdG003 = T002.IdG003
                    Left Join G002 G002T2
                            On G002T2.IdG002 = G003T2.IdG002
                          Left Join T003 T003
                            On T003.IdG024 = nvl(G051.IdG024AT,G051.IdG024)
                           And T003.IDG005 = Nvl(G005RC.IDG005, G005DE.IDG005)
                    Left Join G005 G005T3
                            On G005T3.IdG005 = T003.IdG005
                    Left Join G003 G003T3
                            On G003T3.IdG003 = G005T3.IdG003
                    Left Join G002 G002T3
                            On G002T3.IdG002 = G003T3.IdG002
                    Left Join G005 G005co
                            On G005co.Idg005 = G051.Idg005co -- CONSIGNATÁRIO
                        Where G051.IDG046 is null
                          And G051.StCtrc <> 'C'
                          ${(lsDocumentos['ctrc'] != "" ? `And g051.IdG051 In (`+lsDocumentos['ctrc']+`)` : '')}
                          And g051.SnDelete = 0
                          And g051.cdcarga is null
                          And G043.Sndelete = 0
                          /*
                          And G005T3.SNDELETE = 0
                          And G003T3.SNDELETE = 0
                          And G002T3.SNDELETE = 0
                          */ 
                          And NOT EXISTS (
                            SELECT
                              *
                            FROM
                              G052 G052x 
                              JOIN G043 G043x
                              ON G052x.IDG043 = G043x.IDG043
                            WHERE
                              G052x.IdG043 = G043.IDG043 
                              AND to_char(substr(G043x.cddelive,0,1)) NOT IN ('0','1','2','3','4','5','6','7','8','9') 
                              AND G043x.STETAPA = 1
                              AND G052x.IDG051 = G051.IDG051)     
                          And G043.dtentcon = (Select Min(dtentcon)
                                                  From G043 a 
                                                  Join G052 b On b.idg043 = a.idg043 
                                                Where b.IdG051 = G051.IdG051 ) 
                            ${sqlWhereAuxCTRC}
                    )X0
                    Group By  X0.IdT001,
                              X0.DsPraca,
                              X0.PsBruto,
                              X0.PsLotaca,
                              X0.DtEntCon,
                              X0.Dtent4pl,
                              X0.DTVENROT,
                              X0.VrMercad,
                              X0.IdG051,
                              x0.cdctrc,
                              X0.IDG043,
                              X0.NmCidade , X0.CdEstado , X0.Nmclieco , X0.Idg005co , X0.Nmcliede, X0.EMITRANS`;

     //console.log('=====================' ,sqlDelivery);
      /*
      //# TPDOCUME
      0 - Todos
      1 - Delivery
      2 - CTRC
      */
      //console.log('===================================:',bindValues.G051_TPDOCUME);

      if (bindValues.G051_TPDOCUME == 0) {
        sqlTpDocumento = `(${sqlCtrc})
                            Union
                          (${sqlDelivery})`;

      }else if(bindValues.G051_TPDOCUME == 1){
        sqlTpDocumento = sqlDelivery;

      }else if(bindValues.G051_TPDOCUME == 2){
        sqlTpDocumento = sqlCtrc;

      }


      sqlOrder = sqlOrder.replace(/G051./g, 'X3.');

      sqlAux = `  Select X3.*,
      (X3.DtEntCon - To_Date(current_date, 'DD/MM/YY')) As QtDiaVen
 From (Select X2.IdT001,
              X2.DsPraca,
              nvl(Sum(X2.PsBruto),0) As PsBruto,
              nvl(Sum(X2.PsLotaca),0) As PsLotaca,
              Min(X2.DtEntCon) As DtEntCon,
              Min(X2.Dtent4pl) As Dtent4pl,
              Min(X2.DTVENROT) As DTVENROT,
              Sum(X2.VrMercad) As VrMercad,
              Sum(X2.QtCte) As QtCte,
              Sum(X2.QtNfe) As QtNfe,
               LISTAGG(X2.DsCte, ',') WITHIN Group(Order By X2.DsCte) As DsCte,
               LISTAGG(X2.DsNfe, ',') WITHIN Group(Order By X2.DsNfe) As DsNfe,
               LISTAGG(X2.cdctrc, ',') WITHIN Group(Order By X2.cdctrc) As cdctrc 
              ${utils.columnSqlAux("X2.", ArColumn)}
              ${(visao == 4 ? ", X2.IdG051, X2.IdG043, X2.NRNOTA, X2.CDDELIVE, X2.EMITRANS":"")}
         From (Select X1.IdT001,
                      X1.DsPraca,
                      Sum(X1.PsBruto) As PsBruto,
                      Sum(X1.PsLotaca) As PsLotaca,
                      X1.DtEntCon,
                      X1.Dtent4pl,
                      X1.DTVENROT,
                      Sum(X1.VrMercad) As VrMercad,
                      Count(X1.IdG051) As QtCte,
                      Count(X1.IdG043) As QtNfe,
                       LISTAGG(X1.IdG051, ',') WITHIN Group(Order By X1.IdG051) As DsCte,
                       LISTAGG(X1.IdG043, ',') WITHIN Group(Order By X1.IdG043) As DsNfe,
                       LISTAGG(X1.cdctrc, ',') WITHIN Group(Order By X1.cdctrc) As cdctrc
                      ${utils.columnSqlAux("X1.", ArColumn)}
                      ${(visao == 4 ? ", X1.IdG051, X1.IdG043, X1.NRNOTA, X1.CDDELIVE, X1.EMITRANS":"")}
                 From (Select X.IdT001,
                              X.DsPraca,
                              Sum(X.PsBruto) As PsBruto,
                              Sum(X.PsLotaca) As PsLotaca,
                              X.DtEntCon,
                              X.Dtent4pl,
                              X.DTVENROT,
                              Sum(X.VrMercad) As VrMercad,
                              X.IdG051,
                              x.cdctrc,
                              X.IdG043,
                              X.NRNOTA,
                              X.CDDELIVE,
                              X.EMITRANS

                              ${utils.columnSqlAux("X.", ArColumn)}
                         From (
                              ${sqlTpDocumento}
                              ) X

                        Group By X.IdT001, X.DsPraca, X.DtEntCon, X.Dtent4pl, X.DTVENROT,  X.IdG051, X.IdG043, X.NRNOTA, X.CDDELIVE, X.EMITRANS, X.CDCTRC ${utils.columnSqlAux("X.", ArColumn)}) X1
                Group By ${(visao == 4 ? "X1.IdG051, X1.IdG043, X1.NRNOTA, X1.CDDELIVE, X1.EMITRANS, X1.cdctrc,":"")} X1.IdT001, X1.DsPraca, X1.DtEntCon,  X1.Dtent4pl, X1.DTVENROT ${utils.columnSqlAux("X1.", ArColumn)}) X2
        Group By ${(visao == 4 ? "X2.IdG051, X2.IdG043, X2.NRNOTA, X2.CDDELIVE, X2.EMITRANS, X2.cdctrc,":"")} X2.IdT001, X2.DsPraca ${utils.columnSqlAux("X2.", ArColumn)}) X3

/*Order By IdT001*/` + sqlOrder;


      //  console.log('================================================');

        //console.log(sqlAux);

      //  console.log('================================================');

      let result = await con.execute(
      {
        sql: sqlAux,
        param: {},
        debug: true
        });
        

     // console.log(result);
      var sqlAuxIndicadores = null;
      for (let key in result) {

        if(result[key].NRNOTA != null){
          let listarNotas = result[key].NRNOTA.split(",");
          let notas       = '';
          let auxIndex    = 0;

          if(listarNotas.length > 5){

            for (let index = 0; index < listarNotas.length; index++) {
              const element = listarNotas[index];
              notas += element.concat(', ');
              auxIndex++;
              if(auxIndex == 5){
                notas = notas.concat('<br/>');
                auxIndex = 0;
              }
            }
            result[key].NRNOTA = notas.substr(0,(notas.length - 2));
          }
        }

          sqlAuxIndicadores = `Select
          (Select XMLAGG(XMLELEMENT(E,G051.CDCTRC, ', ').EXTRACT('//text()') ORDER BY G051.IdG051).GetClobVal()
             From G051 G051 --CTE
            Where G051.IdG051 In (`+(result[key].DSCTE != null ? result[key].DSCTE : 0)+`)
              And G051.DtCombin Is Not Null) As LsCombin,
          (Select XMLAGG(XMLELEMENT(E,x.CDCTRC, ', ').EXTRACT('//text()') ORDER BY x.CDCTRC).GetClobVal()
             From 
             (Select Distinct G051.CDCTRC 
             From G051 G051 --CTE
             Join G052 G052
               On G052.IdG051 = G051.IdG051 -- NF COM CTE
            Where G051.IdG051 In (`+(result[key].DSCTE != null ? result[key].DSCTE : 0)+`)
              And G051.DtAgenda Is Not Null ) x
            ) As LsAgenda,
          (Select XMLAGG(XMLELEMENT(E,Nvl(G051.CDCTRC, G043.IdG043), ', ').EXTRACT('//text()') ORDER BY Nvl(G051.CDCTRC, G043.IdG043)).GetClobVal()
              From G043 G043 -- NF
              Left Join G052 G052
                On G052.IdG043 = G043.IdG043 -- NF COM CTE
              Left Join G051 G051
                On G051.IdG051 = G052.IdG051 -- CTE
            Where G043.IdG043 In (`+(result[key].DSNFE != null ? result[key].DSNFE : 0)+`)      
              And G043.Cdpriori In (1, 2)
              And 1 = 1 /* alterar para montagem com delivery*/
              ) As LsPriori,
              (Select  XMLAGG(XMLELEMENT(E,y.id, ', ').EXTRACT('//text()') ORDER BY y.id).GetClobVal()
              From 
          (Select distinct Nvl(G051.CDCTRC, G043.IdG043) As Id
              From G043 G043 -- NF
              Left Join G052 G052
                On G052.IdG043 = G043.IdG043 -- NF COM CTE
              Left Join G051 G051
                On G051.IdG051 = G052.IdG051 -- CTE
            Where /*(G051.IdG051 In (`+(result[key].DSCTE != null ? result[key].DSCTE : 0)+`)
                    Or G043.IdG043 In (`+(result[key].DSNFE != null ? result[key].DSNFE : 0)+`)
                  )*/
                  G051.IdG051 In (`+(result[key].DSCTE != null ? result[key].DSCTE : 0)+`)
              And (Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) - To_Date(current_date, 'DD/MM/YY')) < 0) y )
              As LsVencid,
          (Select XMLAGG(XMLELEMENT(E,Nvl(G051.IdG051, G043.IdG043), ', ').EXTRACT('//text()') ORDER BY Nvl(G051.IdG051, G043.IdG043)).GetClobVal()
              From G043 G043 -- NF
              Left Join G052 G052
                On G052.IdG043 = G043.IdG043 -- NF COM CTE
              Left Join G051 G051
                On G051.IdG051 = G052.IdG051 -- CTE
            Where /*(G051.IdG051 In (`+(result[key].CDCTRC != null ? result[key].CDCTRC : 0)+`)
                    Or G043.IdG043 In (`+(result[key].DSNFE != null ? result[key].DSNFE : 0)+`)
                  )*/
                  G051.IdG051 In (`+(result[key].CDCTRC != null ? result[key].CDCTRC : 0)+`)
              And (Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) - To_Date(current_date, 'DD/MM/YY')) >= 0 --) XX
           ) As LsNaoVen,
           (Select XMLAGG(XMLELEMENT(E,G051.CDCTRC, ', ').EXTRACT('//text()') ORDER BY IdG051).GetClobVal()
             From G051 G051 --CTE
            Where G051.IdG051 In (`+(result[key].CDCTRC != null ? result[key].CDCTRC : 0)+`)
              And (Nvl(G051.DtRoteri,current_date) - To_Date(current_date, 'DD/MM/YY')) < 0
           ) As LsRotMen,
           (Select XMLAGG(XMLELEMENT(E,G051.CDCTRC, ', ').EXTRACT('//text()') ORDER BY IdG051).GetClobVal()
             From G051 G051 --CTE
            Where G051.IdG051 In (`+(result[key].CDCTRC != null ? result[key].CDCTRC : 0)+`)
                  And (Nvl(G051.DtRoteri,current_date) - To_Date(current_date, 'DD/MM/YY')) = 0
           ) As LsRotIgu,
           (Select XMLAGG(XMLELEMENT(E,G051.CDCTRC, ', ').EXTRACT('//text()') ORDER BY IdG051).GetClobVal()
             From G051 G051 --CTE
            Where G051.IdG051 In (`+(result[key].CDCTRC != null ? result[key].CDCTRC : 0)+`)
                  And (Nvl(G051.DtRoteri,current_date) - To_Date(current_date, 'DD/MM/YY')) > 0
           ) As LsRotMai,

           (Select XMLAGG(XMLELEMENT(E,G043.IDG043, ', ').EXTRACT('//text()') ORDER BY IdG043).GetClobVal()
           From G005 G005 --Cliente
           join g043 g043 on g005.idg005 = nvl(g043.idg005rc, g043.idg005de)
          Where G043.IdG043 In (`+(result[key].DSNFE != null ? result[key].DSNFE : 0)+`)
            And G005.SneSpeci = 'S'
         ) As LsEspeci,

         (Select XMLAGG(XMLELEMENT(E,Nvl(G051.IdG051, G043.IdG043), ', ').EXTRACT('//text()') ORDER BY Nvl(G051.IdG051, G043.IdG043)).GetClobVal()
         From G043 G043 -- NF
         Join G052 G052
           On G052.IdG043 = G043.IdG043 -- NF COM CTE
         Join G051 G051
           On G051.IdG051 = G052.IdG051 -- CTE
       Where G051.IdG051 In (`+(result[key].DSCTE != null ? result[key].DSCTE : 0)+`)
        And  (G043.DtBloque Is Not Null And  G043.DtDesBlo Is Null)) as LsBLOQUE


           From dual`;

         

       // console.log(sqlAuxIndicadores);
        let indicadores = await con.execute(
          {
            sql: sqlAuxIndicadores,
            param: {},
            fetchInfo:     ["LSAGENDA",
                            "LSCOMBIN",
                            "LSNAOVEN",
                            "LSVENCID",
                            "LSPRIORI",
                            "LSESPECI",
                            "LSROTMEN",
                            "LSROTIGU",
                            "LSROTMAI",
                            "LSBLOQUE"]
          });
          if(indicadores[0]){
            if(indicadores[0].LSAGENDA != null){
              indicadores[0].LSAGENDA = indicadores[0].LSAGENDA.trim();
              indicadores[0].LSAGENDA = indicadores[0].LSAGENDA.substr(0, indicadores[0].LSAGENDA.length - 1);
            }
            if(indicadores[0].LSCOMBIN != null){
              indicadores[0].LSCOMBIN = indicadores[0].LSCOMBIN.trim();
              indicadores[0].LSCOMBIN = indicadores[0].LSCOMBIN.substr(0, indicadores[0].LSCOMBIN.length - 1);
            }
            if(indicadores[0].LSNAOVEN != null){
              indicadores[0].LSNAOVEN = indicadores[0].LSNAOVEN.trim();
              indicadores[0].LSNAOVEN = indicadores[0].LSNAOVEN.substr(0, indicadores[0].LSNAOVEN.length - 1);
            }
            if(indicadores[0].LSVENCID != null){
              indicadores[0].LSVENCID = indicadores[0].LSVENCID.trim();
              indicadores[0].LSVENCID = indicadores[0].LSVENCID.substr(0, indicadores[0].LSVENCID.length - 1);
            }
            if(indicadores[0].LSPRIORI != null){
              indicadores[0].LSPRIORI = indicadores[0].LSPRIORI.trim();
              indicadores[0].LSPRIORI = indicadores[0].LSPRIORI.substr(0, indicadores[0].LSPRIORI.length - 1);
            }
            if(indicadores[0].LSESPECI != null){
              indicadores[0].LSESPECI = indicadores[0].LSESPECI.trim();
              indicadores[0].LSESPECI = indicadores[0].LSESPECI.substr(0, indicadores[0].LSESPECI.length - 1);
            }
            if(indicadores[0].LSROTMEN != null){
              indicadores[0].LSROTMEN = indicadores[0].LSROTMEN.trim();
              indicadores[0].LSROTMEN = indicadores[0].LSROTMEN.substr(0, indicadores[0].LSROTMEN.length - 1);
            }
            if(indicadores[0].LSROTIGU != null){
              indicadores[0].LSROTIGU = indicadores[0].LSROTIGU.trim();
              indicadores[0].LSROTIGU = indicadores[0].LSROTIGU.substr(0, indicadores[0].LSROTIGU.length - 1);
            }
            if(indicadores[0].LSROTMAI != null){
              indicadores[0].LSROTMAI = indicadores[0].LSROTMAI.trim();
              indicadores[0].LSROTMAI = indicadores[0].LSROTMAI.substr(0, indicadores[0].LSROTMAI.length - 1);
            }
            if(indicadores[0].LSBLOQUE != null){
              indicadores[0].LSBLOQUE = indicadores[0].LSBLOQUE.trim();
              indicadores[0].LSBLOQUE = indicadores[0].LSBLOQUE.substr(0, indicadores[0].LSBLOQUE.length - 1);
            }
          }
        result[key] = Object.assign(result[key], indicadores[0]);
        //console.log(result[key]);
      }

      await con.close();
      return (utils.construirObjetoRetornoBD(result));
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
  }




 //# Paradas

 api.listarParadas = async function (req, res, next) {
  let con = await this.controller.getConnection(null, req.UserId);
  try {

    logger.debug("Parametros recebidos:", req.body);

    var lsDocumentos = [];
    var CdOrigem = req.body.cdo;
    lsDocumentos['ctrc'] = null;
    lsDocumentos['delivery'] = null;

    lsDocumentos['ctrc'] = (req.body.doc.ctrc.visaoQuatro != "" ? req.body.doc.ctrc.visaoQuatro :
             (req.body.doc.ctrc.visaoTres != "" ? req.body.doc.ctrc.visaoTres :
             (req.body.doc.ctrc.visaoDois != "" ? req.body.doc.ctrc.visaoDois :
             (req.body.doc.ctrc.visaoUm   != "" ? req.body.doc.ctrc.visaoUm : ""))));

    if(lsDocumentos['ctrc']){
      if(lsDocumentos['ctrc'][0] == ","){
        lsDocumentos['ctrc'] = lsDocumentos['ctrc'].substr(1, lsDocumentos['ctrc'].length);
      }
    }else{
      lsDocumentos['ctrc'] = "0";
    }

    lsDocumentos['delivery'] = (req.body.doc.delivery.visaoQuatro != "" ? req.body.doc.delivery.visaoQuatro :
             (req.body.doc.delivery.visaoTres != "" ? req.body.doc.delivery.visaoTres :
             (req.body.doc.delivery.visaoDois != "" ? req.body.doc.delivery.visaoDois :
             (req.body.doc.delivery.visaoUm   != "" ? req.body.doc.delivery.visaoUm : ""))));

    if(lsDocumentos['delivery']){
      if(lsDocumentos['delivery'][0] == ","){
        lsDocumentos['delivery'] = lsDocumentos['delivery'].substr(1, lsDocumentos['delivery'].length);
      }
    }else{
      lsDocumentos['delivery'] = "0";
    }



    sqlAux = `   Select Nmcidare,
                        Cdestare,
                        Nmcidade,
                        Cdestade,
                        Sum(Psbruto) As Psbruto,
                        Sum(Vrmercad) As Vrmercad,
                        Regexp_Replace(Listagg(x.Idg051, ', ') Within
                   Group(Order By x.Idg051),
                   '([^,]+)(,\\1)+',
                   '\\1') As Lscte,

                   Regexp_Replace(Listagg(x.cdctrc, ', ') Within
                   Group(Order By x.cdctrc),
                   '([^,]+)(,\\1)+',
                   '\\1') As Lsctrc,

                   Regexp_Replace(Listagg(x.Dstipvei, ', ') Within
                   Group(Order By x.Dstipvei),
                   '([^,]+)(,\\1)+',
                   '\\1') As LsDstipvei,



									 		NrlatituDe,
						          NrlongitDe,

						          NrlatituRe,
                      NrlongitRe,
                      
						          NrlatituCi,
						          NrlongitCi,

											Idg005re,
                      Idg005de,

											Nmcliere,
                      Nmcliede,

                      '' as CDEMPDES,
                      '' as NMEMPDES,

                      '' as distance,
                      '' as duration,

                      '' as NrlatituEm,
                      '' as NrlongitEm,

                      '' as CHILD,

											Idg003re,
                      Idg003de,

                      DSENDERE,

                      Vrmaxcar,

                      

                      current_date AS DTENTCON	, /*Data de entrega contratual*/

                      /*Dtvencto,*/ /*Data de entrega manilha */

                      Idg005co,

                      Nmclieco,

                      dstipveiret,

                      nrordcar,


    Listagg(x.Idg043, ', ') Within Group(Order By x.Idg043) As Lsnfe
From (
  
  
  
  Select G051.Idg005re,
            nvl(G005re.Rsclient, G005re.Nmclient) As Nmcliere,
            G003re.Nmcidade As Nmcidare,
            G002re.Cdestado As Cdestare,
            Nvl(G051.Idg005rc, G051.Idg005de) As Idg005de,
            /*nvl(G005de.Rsclient,G005de.Nmclient) As Nmcliede,*/

            nvl(G005de.Rsclient,G005de.Nmclient) || ' [' || FN_FORMAT_CNPJ_CPF(G005de.CJCLIENT) || ' - ' || G005de.IECLIENT || ' / ' ||  G005de.IDG005 || ' ]' As Nmcliede,

            G003de.Nmcidade As Nmcidade,
            G002de.Cdestado As Cdestade,
            G051.Idg051,
            G051.cdctrc,
            Null As Idg043,

            /*Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) As Dtvencto	, */

						nvl(G005de.Nrlatitu, G003de.Nrlatitu) As NrlatituDe,
						nvl(G005de.Nrlongit, G003de.Nrlongit) As NrlongitDe,

						nvl(G005re.Nrlatitu, G003re.Nrlatitu) As NrlatituRe,
            nvl(G005re.Nrlongit, G003re.Nrlongit) As NrlongitRe,

						G003de.Nrlatitu As NrlatituCi,
						G003de.Nrlongit As NrlongitCi,


						G003de.idg003 As idg003de,
            G003re.idg003 As idg003re,
            
            G005de.DSENDERE || ', ' || G005de.NRENDERE || ' - ' || G005de.BIENDERE as DSENDERE,

						(	Select min(G047.Vrmaxcar)
              From G022 G022
              Join G014 G014
                On G014.Idg014 = G022.Idg014
              Join G047 G047
                On G014.Idg014 = G047.Idg014
             Where G047.Sndelete = 0
               And G047.Stcadast = 'A'
               And G022.Idg005 = G005de.Idg005
               And G022.Sndelete = 0
               And G022.SnIndust = 1
               And G047.Idg047 =
               (Select Max(a.Idg047) From G047 a Where a.Idg014 = G047.Idg014 )) As Vrmaxcar,


               (  Select Listagg(c.dstipvei, ', ') Within Group(Order By c.dstipvei) As dstipvei
               From G065 a
               Join G005 b
                 On b.IdG005 = a.IdG005
               Join G030 c
                 On c.IdG030 = a.IdG030
                 
              Where a.Sndelete = 0
                And a.Stcadast = 'A'
                And a.Idg005 = G005de.Idg005) As dstipveiret,

            G051.NRPESO as PsBruto,

            G051.Vrmercad,

            G030de.Dstipvei,

            G051.Idg005co,
            
            T002.nrordcar,

            G005co.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005co.CJCLIENT) || ' - ' || G005co.IECLIENT ||']' As Nmclieco

       From G051 G051
       Join G052 G052
         On G052.Idg051 = G051.Idg051 -- NF COM CTE
       Join G043 G043
         On G043.Idg043 = G052.Idg043 -- NF
       Left Join G005 G005de
         On G005de.Idg005 = Nvl(G051.Idg005rc, G051.Idg005de) -- DESTINATARIO
       Left Join G003 G003de
         On G003de.Idg003 = G005de.Idg003
       Left Join G002 G002de
         On G002de.Idg002 = G003de.Idg002
       Left Join G005 G005re
         On G005re.Idg005 = nvl(G051.IdG005ex, G051.Idg005re) -- REMETENTE

       Left Join G005 G005co
         On G005co.Idg005 = G051.Idg005co -- CONSIGNATÁRIO

       Left Join G003 G003re
         On G003re.Idg003 = G005re.Idg003
       Left Join G002 G002re
         On G002re.Idg002 = G003re.Idg002
        
       Left Join G065 G065de
         On G065de.IdG005 = G005de.IdG005
        and G065de.STCADAST = 'A'
        and G065de.SnDelete = 0

       Left Join G030 G030de
         On G030de.IdG030 = G065de.IdG030


       Left Join T002 T002
         On T002.IdG024 = G051.IdG024
        And T002.IDG003 = G005DE.IDG003
        And T002.IDT002 = (Select b.IDT002 From t002 b 
                             join t001 c
                               on c.IDT001 = b.IDT001
                              and c.SNDELETE = 0
                            Where b.IDG003 = T002.IDG003 
                              And b.IdG024 = nvl(G051.IdG024At, G051.IdG024) 
                              And Rownum = 1)
        
       Left Join G003 G003T2
              On G003T2.IdG003 = T002.IdG003
       Left Join G002 G002T2
              On G002T2.IdG002 = G003T2.IdG002
       Left Join T003 T003
              On T003.IdG024 = nvl(G051.IdG024AT,G051.IdG024)
             And T003.IDG005 = G005DE.IDG005


      Where 1 = 1
      And g051.cdcarga is null
      And G043.dtentcon =  (Select Min(dtentcon)
      From G043 a 
      Join G052 b On b.idg043 = a.idg043 
     Where b.IdG051 = G051.IdG051 )

     ${(lsDocumentos['ctrc'] != "" ? `And g051.IdG051 In (`+lsDocumentos['ctrc']+`)` : '')}





     Union






     Select G043.Idg005re,
            nvl(G005re.Rsclient, G005re.Nmclient) As Nmcliere,
            G003re.Nmcidade As Nmcidare,
            G002re.Cdestado As Cdestare,
            nvl(G043.IDG005RC,G043.IDG005DE) as Idg005de,
            /*nvl(G005de.Rsclient,G005de.Nmclient) As Nmcliede,*/
            
            nvl(G005de.Rsclient,G005de.Nmclient) || ' [' || FN_FORMAT_CNPJ_CPF(G005de.CJCLIENT) || ' - ' || G005de.IECLIENT || ' / ' ||  G005de.IDG005 ||' ]' As Nmcliede,

            G003de.Nmcidade As Nmcidade,
            G002de.Cdestado As Cdestade,
            Null            As Idg051,
            null as cdctrc,
            G043.Idg043,

            /*G043.DtEntCon As Dtvencto,*/

						nvl(G005de.Nrlatitu, G003de.Nrlatitu) As NrlatituDe,
						nvl(G005de.Nrlongit, G003de.Nrlongit) As NrlongitDe,

						nvl(G005re.Nrlatitu, G003re.Nrlatitu) As NrlatituRe,
            nvl(G005re.Nrlongit, G003re.Nrlongit) As NrlongitRe,

						G003de.Nrlatitu As NrlatituCi,
						G003de.Nrlongit As NrlongitCi,

						G003de.idg003 As idg003de,
            G003re.idg003 As idg003re,
            
            G005de.DSENDERE || ', ' || G005de.NRENDERE || ' - ' || G005de.BIENDERE as DSENDERE,

						(	Select min(G047.Vrmaxcar)
              From G022 G022
              Join G014 G014
                On G014.Idg014 = G022.Idg014
              Join G047 G047
                On G014.Idg014 = G047.Idg014
             Where G047.Sndelete = 0
               And G047.Stcadast = 'A'
               And G022.Idg005 = G005de.Idg005
               And G022.Sndelete = 0
               And G022.SnIndust = 1
               And G047.Idg047 =
               (Select Max(a.Idg047) From G047 a Where a.Idg014 = G047.Idg014 )) As Vrmaxcar,


               (  Select Listagg(c.dstipvei, ', ') Within Group(Order By c.dstipvei) As dstipvei
               From G065 a
               Join G005 b
                 On b.IdG005 = a.IdG005
               Join G030 c
                 On c.IdG030 = a.IdG030
                 
              Where a.Sndelete = 0
                And a.Stcadast = 'A'
                And a.Idg005 = G005de.Idg005) As dstipveiret,


            G043.Psbruto,
            G043.Vrdelive As Vrmercad,
            G030de.Dstipvei,

            G005co.Idg005 as Idg005co,

            T002.nrordcar,

            G005co.Nmclient || ' [' ||
                FN_FORMAT_CNPJ_CPF(G005co.CJCLIENT) || ' - ' ||
                G005co.IECLIENT || ']' As Nmclieco

       From G043 G043 -- NF
       Left Join G005 G005de
         On G005de.Idg005 = nvl(G043.IDG005RC,G043.IDG005DE) -- DESTINATARIO
       Left Join G003 G003de
         On G003de.Idg003 = G005de.Idg003
       Left Join G002 G002de
         On G002de.Idg002 = G003de.Idg002
       Left Join G005 G005re
         On G005re.Idg005 = G043.Idg005re -- REMETENTE
       Left Join G003 G003re
         On G003re.Idg003 = G005re.Idg003
       Left Join G002 G002re
         On G002re.Idg002 = G003re.Idg002

       Left Join G005 G005co
         On G005co.Idg005 = G043.Idg005re -- CONSIGNATÁRIO

         Left Join G065 G065de
         On G065de.IdG005 = G005de.IdG005
       and G065de.STCADAST = 'A'
       and G065de.SnDelete = 0
 
       Left Join G030 G030de
         On G030de.IdG030 = G065de.IdG030


         LEFT JOIN T002 T002 
           ON
         T002.IdG024 = ${CdOrigem}
        AND T002.IDG003 = G005DE.IDG003
        AND T002.IDT002 = (
        SELECT
          b.IDT002
        FROM
          t002 b
          join t001 c
            on c.IDT001 = b.IDT001
           and c.SNDELETE = 0
        WHERE
          b.IDG003 = T002.IDG003
          AND Rownum = 1)
          AND T002.SNDELETE = 0
      LEFT JOIN T003 T003 ON
        T003.IdG024 = G043.IdG024TR
        AND T003.IDG005 = G005DE.IDG005
        AND T003.SNDELETE = 0


      /*Where Not Exists
      (Select * From G049 G049 Where G049.Idg043 = G043.Idg043)*/
      /*(Select * From G052 G052 Where G052.Idg043 = G043.Idg043)*/

        Where /* XXXXXXXXXXXXXXXXXXXXXXXXXXXXX ANALISAR XXXXXXXXXXXXXXXXXXXXXXXNot Exists
        (Select * From G049 G049, G048 G048, G046 G046 Where G049.Idg043 = G043.Idg043 and G048.IdG048 = G049.IdG048 and G046.IdG046 = G048.IdG046 and G046.StCarga <> 'C' and G046.SnDelete = 0 )
         And Not Exists
      (Select * From G052 G052, G051 G051 Where G052.Idg043 = G043.Idg043 and G051.SnDelete = 0 and G051.StCtrc <> 'C')
        And */G043.Sndelete = 0
        /*And G043.Dtentcon Is Not Null*/
        And G043.Cddelive Is Not Null
        ${(lsDocumentos['delivery'] != "" ? `And G043.IdG043 In (`+lsDocumentos['delivery']+`)` : '')}
     ) x
Group By x.Idg005re,
       x.Nmcliere,
       x.Nmcidare,
       x.Cdestare,
       x.Idg005de,
       x.Nmcliede,
       x.Nmcidade,
       x.Cdestade,
       x.NrlatituDe,
       x.NrlongitDe,
       x.NrlatituRe,
       x.NrlongitRe,
       x.NrlatituCi,
       x.NrlongitCi,
       x.Idg003re,
       x.Idg003de,
       x.Vrmaxcar,
       x.DSENDERE,
       x.Dstipvei,
       x.Idg005co,
       x.Nmclieco, 
       x.dstipveiret,
       x.nrordcar 
       
       order by x.nrordcar `;


       
    //console.log(sqlAux);
    let result = await con.execute(
    {
      sql: sqlAux,
      param: {}
    });

    let resultAux = null;
    let sqlAuxComp = null;
    let sqlAuxComp2 = null;
    for (let j = 0; j < result.length; j++) {

      sqlAuxComp = 
      `
      Select distinct G051.Idg005re,
             /*G005re.Nmclient As Nmcliere,*/

             nvl(G005re.Rsclient,G005re.Nmclient) || ' [' || FN_FORMAT_CNPJ_CPF(G005re.CJCLIENT) || ' - ' || G005re.IECLIENT || ' / ' ||  G005re.IDG005 || ' ]' As Nmcliere,

             G003re.Nmcidade As Nmcidare,
             G002re.Cdestado As Cdestare,
             G051.Idg051,
             G051.Cdctrc,
             Null            As Idg043,
             
             Nvl(Nvl(G051.Dtcombin, G051.Dtagenda), G043.Dtentcon) As Dtvencto,
             
             Nvl(G005re.Nrlatitu, G003re.Nrlatitu) As Nrlatiture,
             Nvl(G005re.Nrlongit, G003re.Nrlongit) As Nrlongitre,
             
             G003re.Idg003 As Idg003re,
             
             (Select Distinct min(G047.Vrmaxcar)
                From G022 G022
                Join G014 G014
                  On G014.Idg014 = G022.Idg014
                Join G047 G047
                  On G014.Idg014 = G047.Idg014
               Where G047.Sndelete = 0
                 And G047.Stcadast = 'A'
                 And G022.Idg005 = G005de.Idg005
                 And G022.SnIndust = 1
                 And Rownum = 1) As Vrmaxcar,
             
             G051.Nrpeso     As Psbruto,
             G051.Vrmercad,
             G051.Idg005co,
             G005co.Nmclient As Nmclieco,
             

             (Select G047.Vrmaxesc
             From G022 G022
             Join G047 G047
               On G022.Idg014 = G047.Idg014
           Where G047.Sndelete = 0
             And G047.Stcadast = 'A'
             And G022.Sndelete = 0
             And G022.Idg005 = (G051.Idg005co) 
             And G022.SnIndust = 1
             And G047.Idg047 =
                 (Select Max(a.Idg047) From G047 a Where a.Idg014 = G047.Idg014 ) ) as vrapoesc,

            (Select G047.Vrmaxcar
              From G022 G022
              Join G047 G047
                On G022.Idg014 = G047.Idg014
            Where G047.Sndelete = 0
              And G047.Stcadast = 'A'
              And G022.Sndelete = 0
              And G022.Idg005 = (G051.Idg005co) 
              And G022.SnIndust = 1
              And G047.Idg047 =
              (Select Max(a.Idg047) From G047 a Where a.Idg014 = G047.Idg014 )) As vraponor

      
        From G051 G051
        Join G052 G052
          On G052.Idg051 = G051.Idg051 -- NF COM CTE
        Join G043 G043
          On G043.Idg043 = G052.Idg043 -- NF
        Join G005 G005de
          On G005de.Idg005 = Nvl(G051.Idg005rc, G051.Idg005de) -- DESTINATARIO
        Join G003 G003de
          On G003de.Idg003 = G005de.Idg003
        Join G002 G002de
          On G002de.Idg002 = G003de.Idg002
        Join G005 G005re
          On G005re.Idg005 = Nvl(G051.Idg005ex, G051.Idg005re) -- REMETENTE
      
        Join G005 G005co
          On G005co.Idg005 = G051.Idg005co -- CONSIGNATÁRIO
      
        Join G003 G003re
          On G003re.Idg003 = G005re.Idg003
        Join G002 G002re
          On G002re.Idg002 = G003re.Idg002
       Where 1 = 1
            
         And G043.Dtentcon = (Select Min(Dtentcon)
                                From G043 a
                                Join G052 b
                                  On b.Idg043 = a.Idg043
                               Where b.Idg051 = G051.Idg051)
            
         And G051.Idg051 In (${(result[j].LSCTE ? result[j].LSCTE : 0)})
      
      Union
      Select G043.Idg005re,
             /*G005re.Nmclient As Nmcliere,*/
             
             nvl(G005re.Rsclient,G005re.Nmclient) || ' [' || FN_FORMAT_CNPJ_CPF(G005re.CJCLIENT) || ' - ' || G005re.IECLIENT || ' / ' ||  G005re.IDG005 || ' ]' As Nmcliere,

             G003re.Nmcidade As Nmcidare,
             G002re.Cdestado As Cdestare,
             Null            As Idg051,
             Null            As Cdctrc,
             G043.Idg043,
             
             G043.Dtentcon As Dtvencto,
             
             Nvl(G005re.Nrlatitu, G003re.Nrlatitu) As Nrlatiture,
             Nvl(G005re.Nrlongit, G003re.Nrlongit) As Nrlongitre,
             
             G003re.Idg003 As Idg003re,
             
             (Select G047.Vrmaxcar
                From G022 G022
                Join G014 G014
                  On G014.Idg014 = G022.Idg014
                Join G047 G047
                  On G014.Idg014 = G047.Idg014
               Where G047.Sndelete = 0
                 And G047.Stcadast = 'A'
                 And G022.Idg005 = G005de.Idg005
                 And G022.SnIndust = 1
                 And Rownum = 1) As Vrmaxcar,
             
             G043.Psbruto,
             G043.Vrdelive   As Vrmercad,
             
             G005co.Idg005   As Idg005co,
             G005co.Nmclient As Nmclieco,
             


             (Select G047.Vrmaxesc
              From G022 G022
              Join G047 G047
                On G022.Idg014 = G047.Idg014
            Where G047.Sndelete = 0
              And G047.Stcadast = 'A'
              And G022.Sndelete = 0
              And G022.Idg005 = (G005co.Idg005) 
              And G022.SnIndust = 1
              And G047.Idg047 =
                  (Select Max(a.Idg047) From G047 a Where a.Idg014 = G047.Idg014 ) ) as vrapoesc,
 
             (Select G047.Vrmaxcar
               From G022 G022
               Join G047 G047
                 On G022.Idg014 = G047.Idg014
             Where G047.Sndelete = 0
               And G047.Stcadast = 'A'
               And G022.Sndelete = 0
               And G022.Idg005 = (G005co.Idg005) 
               And G022.SnIndust = 1
               And G047.Idg047 =
               (Select Max(a.Idg047) From G047 a Where a.Idg014 = G047.Idg014 )) As vraponor

      
        From G043 G043 -- NF
        Join G005 G005de
          On G005de.Idg005 = nvl(G043.IDG005RC,G043.IDG005DE) -- DESTINATARIO
        Join G003 G003de
          On G003de.Idg003 = G005de.Idg003
        Join G002 G002de
          On G002de.Idg002 = G003de.Idg002
        Join G005 G005re
          On G005re.Idg005 = G043.Idg005re -- REMETENTE
        Join G003 G003re
          On G003re.Idg003 = G005re.Idg003
        Join G002 G002re
          On G002re.Idg002 = G003re.Idg002
      
        Join G005 G005co
          On G005co.Idg005 = G043.Idg005re -- CONSIGNATÁRIO
      
       Where 
              /* Não mostrar as delivery que já possuem carga
               Not Exists (Select *
                From G049 G049, G048 G048, G046 G046
               Where G049.Idg043 = G043.Idg043
                 And G048.Idg048 = G049.Idg048
                 And G046.Idg046 = G048.Idg046
                 And G046.Stcarga <> 'C'
                 And G046.Sndelete = 0) And*/
              Not Exists (Select *
                From G052 G052, G051 G051
               Where G052.Idg043 = G043.Idg043
                 And G051.Sndelete = 0
                 And G051.Stctrc <> 'C')
         And G043.Sndelete = 0
         /*And G043.Dtentcon Is Not Null*/
         And G043.Cddelive Is Not Null
         And G043.Idg043 In (${(result[j].LSNFE ? result[j].LSNFE : 0)}) `;
         //console.log(sqlAuxComp);
      let resultAux = await con.execute(
        {
          sql: sqlAuxComp,
          param: {}
        });
      
      result[j].CHILD = resultAux;

    }


    sqlAuxComp2 = `
    SELECT x.* FROM ( 
      SELECT  SUM(G051.NRPESO) AS PSBRUTO,
              SUM(G051.VRMERCAD) AS VRMERCAD,
              count(*) AS QTD,
              G051.TPTRANSP
          
          FROM G051 G051
            WHERE G051.Idg051 In (${(lsDocumentos['ctrc'] ? lsDocumentos['ctrc'] : 0)})
        GROUP BY G051.TPTRANSP
            
      Union
    
      SELECT  SUM(G043.PSBRUTO)  AS PSBRUTO,
              SUM(G043.VRDELIVE) AS VRMERCAD,
              count(*) AS QTD,
      
              CASE G043.TPDELIVE
                WHEN '1' THEN
                'T'
                WHEN '2' THEN
                'V'
                WHEN '5' THEN
                'G'
                WHEN '3' THEN
                'D'
                WHEN '4' THEN
                'R'
                ELSE
                'X'
              END AS TPTRANSP

    FROM G043 G043

    WHERE NOT EXISTS (SELECT *
        FROM G052 G052,
          G051 G051
        WHERE G052.IDG043 = G043.IDG043
        AND G051.SNDELETE = 0
        AND G051.STCTRC <> 'C')

    AND G043.SNDELETE = 0
    AND G043.CDDELIVE IS NOT NULL
    AND G043.IDG043 IN (${(lsDocumentos['delivery'] ? lsDocumentos['delivery'] : 0)})
    GROUP BY G043.TPDELIVE 
    ) x
    ORDER BY x.psbruto `;
    
    let resultAux2 = await con.execute(
    {
      sql: sqlAuxComp2,
      param: {}
    });

    if(result.length >= 1 && resultAux2.length >= 1){
      result[0].CHILD2 = resultAux2[0];
    }
  
    await con.close();
    return (utils.construirObjetoRetornoBD(result));
  } catch (err) {
    await con.closeRollback();
    err.stack = new Error().stack + `\r\n` + err.stack;
    logger.error("Erro:", err);
    throw err;
  }



}




  api.validarCarga = async function (req, res, next) {

    let con = await this.controller.getConnection(null, req.UserId);

    //# Param recebidos 
    //////////////////////////////////////////////////////////////////////////////////

    //# Tipo Veiculo
    let idg030 = req.body.valida.IDG030;// 2027;

    //# Veiculo
    let idg032 = req.body.valida.IDG032;//[1010];

    //# Motorista
    let idg031 = req.body.valida.IDG031;//[2027];

    //# Cliente
    let idg005 = req.body.valida.IDG005;//[100092,1];

    //# Peso total
    let psbruto = req.body.valida.PSBRUTO;//1200;

    //# Valor total
    let vrmercad = req.body.valida.VRMERCAD;//0;

    //# Remetente
    //let idg005re = req.body.valida.IDG005RE;//[100092,1];

    //# Escolta
    let snescolt = req.body.valida.SNESCOLT;// N;

    //# documentos
    let lsdocume = req.body.valida.LSDOCUME;// "[125,251,1221]";

    //# tipo de carga
    let tpmodcar = req.body.valida.TPMODCAR;// "1,2,3";

    if(tpmodcar == undefined ){
      if(req.body.valida.LSDOCUME.IDG043 != "" && req.body.valida.LSDOCUME.IDG051 != ""){
        tpmodcar = 3;// mista
      }else if(req.body.valida.LSDOCUME.IDG043 != "" && req.body.valida.LSDOCUME.IDG051 == ""){
        tpmodcar = 2;// 4PL
      }else if(req.body.valida.LSDOCUME.IDG043 == "" && req.body.valida.LSDOCUME.IDG051 != ""){
        tpmodcar = 1;// 3PL
      }
    }



    //# Fim param recebidos 
    //////////////////////////////////////////////////////////////////////////////////

    //# Atribuição parametro escolta
    //snescolt = 'N';

    if(snescolt == 'N'){
      snescolt = 0;
    }else if( snescolt == 'S'){
      snescolt = 1;
    }else{
      snescolt = 2; // forçando  validacao para erro; 
    }



    //# Tratativas
    //////////////////////////////////////////////////////////////////////////////////

    //# Veiculo
    idg032 = idg032.join(",");
    //# Motorista
    idg031 = idg031.join(",");
    //# Cliente
    idg005 = idg005.join(",");


    if(idg032 == ""){
      idg032 = 0;
    }

    if(idg031 == ""){
      idg031 = 0;
    }

    if(idg005 == ""){
      idg005 = 0;
    }

    
    //# Percentual minimo da carga
    let pcocupac = 0;

    //# Fim tratativas
    //////////////////////////////////////////////////////////////////////////////////


    //# Objeto validação
    let objValidation = {idg030:1,    //# tipo veículo
                         idg032:1,    //# motorista
                         idg031:1,    //# veículo
                         idg005:1,    //# cliente
                         psbruto:0,   //# peso
                         vrmercad:0,  //# valor
                         pcocupac:0,  //# % ocupação
                         lsdocume:[], //#
                         pcpsfalta:0, //# % peso faltando
                         pcpsesto:0,  //# % peso estouro
                         pcvresto:0,   //# % valor estouro
                         tpmodcar:tpmodcar, //# tipo de carga
                         idg014:null
                        };

    //# idg030 OK
    //# idg032 OK
    //# idg031 OK
    //# idg005 OK
    //# psbruto OK
    //# idg005re OK


    //#########################
    // -1 = NEUTRO
    //  0 = OCORRÊNCIA
    //  1 = LIBERADO
    //#########################

    try {

      //# Validação veiculo
      //////////////////////////////////////////////////////////////////////////////////
      let result = await con.execute(
      {
          sql: `
          Select
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
          G032.IdG030
          From G032 G032
          Join G030 G030 On G030.IdG030 = G032.IdG030
         Where G030.SnDelete = 0 
           And G032.SnDelete   = 0
           And IdG032 in (` + idg032 + `) `,
        param: {}
        });

      if(result.length > 0){
        for (let i = 0; i < result.length; i++) {
          if(result[i].ISLICAMB < 0) { objValidation.idg032 = 0; }
          if(result[i].ISCERREG < 0) { objValidation.idg032 = 0; }
          if(result[i].ISTESTAC < 0) { objValidation.idg032 = 0; }
          if(result[i].ISTESFUM < 0) { objValidation.idg032 = 0; }
          if(result[i].ISVALANT < 0) { objValidation.idg032 = 0; }
          if(result[i].ISAETBIT < 0) { objValidation.idg032 = 0; }
          if(result[i].ISLIESSP < 0) { objValidation.idg032 = 0; }
          if(result[i].ISAETGO  < 0) { objValidation.idg032 = 0; }
          if(result[i].ISAETMG  < 0) { objValidation.idg032 = 0; }
          if(result[i].ISAETSP  < 0) { objValidation.idg032 = 0; }
          if(result[i].ISVALEX2 < 0) { objValidation.idg032 = 0; }
          if(result[i].ISVALE12 < 0) { objValidation.idg032 = 0; }
          if(result[i].ISVALCAP < 0) { objValidation.idg032 = 0; }
          if(result[i].ISVALPIL < 0) { objValidation.idg032 = 0; }
          if(result[i].ISMASFAC < 0) { objValidation.idg032 = 0; }
          if(result[i].ISEX12BI < 0) { objValidation.idg032 = 0; }
          if(result[i].ISCHELIS < 0) { objValidation.idg032 = 0; }
        }
      }else{
        objValidation.idg032 = -1;
      }

      //# Frim validação veiculo
      //////////////////////////////////////////////////////////////////////////////////


      //# Validação motorista
      //////////////////////////////////////////////////////////////////////////////////
      let result2 = await con.execute(
      {
          sql: `
          Select --IdG031,
          DTVALCNH	/*	Dt. Validade da CNH */            , Nvl2(DTVALCNH, (DTVALCNH - To_Date(current_date, 'DD/MM/YY')), -1) As ISVALCNH,
          DTVALSEG	/*	Dt. Validade cartão seguradora */ , Nvl2(DTVALSEG, (DTVALSEG - To_Date(current_date, 'DD/MM/YY')), -1) As ISVALSEG,
          DTVENMOP	/*	Dt. Validade curso MOPP */        , Nvl2(DTVENMOP, (DTVENMOP - To_Date(current_date, 'DD/MM/YY')), -1) As ISVENMOP,
          DTVALEXA	/*	Validade do exame médico */       , Nvl2(DTVALEXA, (DTVALEXA - To_Date(current_date, 'DD/MM/YY')), -1) As ISVALEXA
          From G031 G031
          Where SnDelete = 0 And IdG031 in (`+ idg031 +`) `,
        param: {}
      });

      if(result2.length > 0){
        for (let i = 0; i < result2.length; i++) {
          if(result2[i].ISVALCNH < 0) { objValidation.idg031 = 0; }
          if(result2[i].ISVALSEG < 0) { objValidation.idg031 = 0; }
          if(result2[i].ISVENMOP < 0) { objValidation.idg031 = 0; }
          if(result2[i].ISVALEXA < 0) { objValidation.idg031 = 0; }
        }
      }else{
        objValidation.idg031 = -1;
      }

      //# Fim validação motorista
      //////////////////////////////////////////////////////////////////////////////////


      //# Validação apolice
      //////////////////////////////////////////////////////////////////////////////////
      let result5 = null;


      let idTransp;
      if(req.body.valida.IDG024_CARGA.id != null ){  
        idTransp = req.body.valida.IDG024_CARGA.id 
      } else{ 
        idTransp = req.body.valida.IDG024_CARGA
      }

      //# Buscar apolice transportadora BRAVO
      let verificaTransp = await con.execute(
        {
            sql: `
            SELECT G024.IDG024
              FROM G024 G024
            WHERE G024.SNDELETE = 0
              AND G024.IDLOGOS IS NOT NULL
              AND G024.IDG023 = 2
              AND G024.IDG024 = :id  `,
          param: {
            id: (req.body.valida.IDG024_CARGA.id != null ? req.body.valida.IDG024_CARGA.id : req.body.valida.IDG024_CARGA)
          }
        });

        if(verificaTransp.length <= 0){
          idTransp = 32;
        }


      //# Buscar apolice transportadora BRAVO
      let result6 = await con.execute(
        {
            sql: `
            Select g069.Vraponor,  g069.Vrapoesc
              From g069 g069
            Where g069.Sndelete = 0
              And g069.Stcadast = 'A'
              And g069.idg024 = :id `,
          param: {
            id: idTransp
          }
        });
      if(result6.length <= 0){
        // logger.error("Erro buscar apolice transportadora BRAVO", id);
        res.status(500);

        return {response: "Não foram encontrados parâmetros gerais de carga para essa transportadora"}; //# forcando erro;
      }

      if(lsdocume != undefined){

        let ctrc = "";
        let delivery = "";

        if(lsdocume.IDG051 != ""){
          ctrc = lsdocume.IDG051;
        }else{
          ctrc = "99999999999999999999";
        }

        if(lsdocume.IDG043 != ""){
          delivery = lsdocume.IDG043;
        }else{
          delivery = "99999999999999999999";
        }


        var sqlDocumentosValida = `
        
           Select Sum(Nrpeso) As Peso,
                  Sum(Vrmercad) As Valor,
                  Idg005to As Idg005co,
                  Vrmaxcar,
                  Vrmaxesc,
                  Idg014

              From (Select Nrpeso,
                          Vrmercad,
                          G047.Vrmaxcar,
                          G047.Vrmaxesc,
                          G047.Idg014,
                          
                          Case
                            When G047.Idg014 Is Not Null Then
                              Idg005co
                            Else
                              9999999999
                          End As Idg005to
                    
                      From G051
                    
                      Left Join G022 G022
                        On G022.Idg005 = G051.Idg005co
                       And G022.SnIndust = 1
                       And G022.Sndelete = 0
                      Left Join G047 G047
                        On G022.Idg014 = G047.Idg014
                      And G047.Sndelete = 0
                      And G047.Stcadast = 'A'
                      And G047.Idg047 = (Select Max(a.Idg047)
                                            From G047 a
                                          Where a.Idg014 = G047.Idg014
                                          /*And dtvenapo >= to_date(current_date, 'dd/mm/yy')*/
                                          )
                    Where Idg051 In (${ctrc})
                    
                    Union All
                    
                    Select Psbruto as Nrpeso,
                          Vrdelive as Vrmercad,
                          G047.Vrmaxcar,
                          G047.Vrmaxesc,
                          G047.Idg014,
                          
                          Case
                            When G047.Idg014 Is Not Null Then
                              Idg005re
                            Else
                              9999999999
                          End As Idg005to
                    
                      From G043
                    
                      Left Join G022 G022
                        On G022.Idg005 = G043.Idg005re
                       And G022.SnIndust = 1
                       And G022.Sndelete = 0
                      Left Join G047 G047
                        On G022.Idg014 = G047.Idg014
                      And G047.Sndelete = 0
                      And G047.Stcadast = 'A'
                      And G047.Idg047 = (Select Max(a.Idg047)
                                            From G047 a
                                          Where a.Idg014 = G047.Idg014
                                          /*And dtvenapo >= to_date(current_date, 'dd/mm/yy')*/
                                          )
                    Where idg043 In (${delivery})
                    
                    ) n
            Group By n.Idg014, n.Idg005to, n.Vrmaxcar, n.Vrmaxesc

        `;

        let resultDocumentos = await con.execute(
          {
              sql: sqlDocumentosValida ,
            param: {}
          });

          var pcvresto = 0;
          var pcvrestoAux = 0;
          for (let y = 0; y < resultDocumentos.length; y++) {
            
            objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO, 0]; // ocorrencia 

            let resultApolice = await con.execute(
              {
                  sql: `
                  Select G047.Vrmaxcar,  G047.Vrmaxesc, G022.Idg005
                  From G022 G022
                  Join G047 G047
                    On G022.Idg014 = G047.Idg014
                Where G047.Sndelete = 0
                  And G022.SnIndust = 1
                  And G047.Stcadast = 'A'
                  And G022.Idg005 In (${resultDocumentos[y].IDG005CO}) `,
                param: {}
              });

              if(resultApolice.length > 0){

                if(resultApolice[0].VRMAXCAR < resultDocumentos[y].VALOR && snescolt === 0) { 
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,0];// ocorrencia
                  pcvrestoAux = ((resultDocumentos[y].VALOR * 100) / resultApolice[0].VRMAXCAR);

                }else if(resultApolice[0].VRMAXESC < resultDocumentos[y].VALOR && snescolt === 1){
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,0]; // ocorrencia
                  pcvrestoAux = ((resultDocumentos[y].VALOR * 100) / resultApolice[0].VRMAXESC);
                }else if(snescolt === 2){
                  //# forcando ocorrencia;
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,0]; // ocorrencia
                  pcvrestoAux = 0;

                }else{
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,1];
                }

                
              }else{

                //# Buscar apolice transportadora BRAVO
                if(result6[0].VRAPONOR < resultDocumentos[y].VALOR && snescolt === 0){
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,0]; // ocorrencia
                  pcvrestoAux = ((resultDocumentos[y].VALOR * 100) / result6[0].VRAPONOR);

                }else if(result6[0].VRAPOESC < resultDocumentos[y].VALOR && snescolt === 1){
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,0]; // ocorrencia
                  pcvrestoAux = ((resultDocumentos[y].VALOR * 100) / result6[0].VRAPOESC);

                }else if(snescolt === 2){
                  //# forcando ocorrencia;
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,0]; // ocorrencia
                  pcvrestoAux = 0;

                }else{
                  objValidation.lsdocume[y] = [resultDocumentos[y].IDG005CO,1]; // liberado

                } 
              }
              if(pcvrestoAux > pcvresto){
                pcvresto = pcvrestoAux;
              }
              objValidation.pcvresto = parseFloat((pcvresto).toFixed(2));

              pcvrestoAux = 0;

          }

          objValidation.vrmercad = 1;
          
          for (let p = 0; p < objValidation.lsdocume.length; p++) {
            if(objValidation.lsdocume[p][1] == 0){
              objValidation.vrmercad = 0;
            }
          }

      //# Frim validação apolice
      //////////////////////////////////////////////////////////////////////////////////






      //# Validação tipo de veiculo, peso e ocupação
      //#	Restrições para tipos de veículos (cadastradas no cliente de destino);
      //# Caso não tenha tipo de veiculo, não é possivel calcular valor, peso e porcentagem minima;
      //////////////////////////////////////////////////////////////////////////////////
      if(idg030){

        result3 = await con.execute(
          {
              sql: `
              Select Count(G065.idg065) as QTD
              From G065 G065
             Where G065.Idg005 In (
               
            
             Select Distinct x.*
             From (Select Nvl(Idg005ex, Idg005de) As Idg005de
                     From G051
                    Where Idg051 In (${ctrc})
                   Union All
                   Select Idg005de
                     From G043
                    Where Idg043 In (${delivery})) x		


               )
               And G065.Idg030   = :idg030
               And G065.Sndelete = 0
               And G065.Stcadast = 'A' `,
            param: {
              idg030: idg030
            }
          });

          //# Caso vier resultado há restrição
          if(result3[0].QTD >= 1){
            objValidation.idg030 = 0; // ocorrencia
          }else{
            objValidation.idg030 = 1; // liberado
          }

        result4 = await con.execute(
          {
              sql: `
              Select G030.Qtcappes, G030.Pcpesmin, G030.Idg030, G030.PCMIN4PL
              From G030 G030
             Where G030.Sndelete = 0
               And G030.Stcadast = 'A'
               And IDG030 = :idg030`,
            param: {
              idg030: idg030,
            }
          });

          //# Caso vier resultado há restrição
          if(result4.length > 0){

            //# Caso seja 4PL, valor min está definido em outro campo
            if(tpmodcar == 2){
              result4[0].PCPESMIN = result4[0].PCMIN4PL;
            }

            var pcpsesto = 0;
            pcpsesto = parseFloat( ((psbruto*100) / result4[0].QTCAPPES).toFixed(2) );

            //# CAPACIDADE DO VEICULO
            if(result4[0].QTCAPPES == undefined || result4[0].QTCAPPES == null || result4[0].QTCAPPES < psbruto){
              objValidation.psbruto  = 0; // ocorrencia
            }else if(result4[0].QTCAPPES >= psbruto){
              objValidation.psbruto  = 1; // liberado
            }else{
              objValidation.psbruto  = 0; // ocorrencia
            }

            objValidation.pcpsesto = pcpsesto;//para calculo ocorrencia

            //# Caso nao tenho valor de capacidade ou não tenha percentual minimo
            if(result4[0].QTCAPPES){
              
              // Calculando a porcentagem de ocupação              
              pcocupac = parseFloat( ((psbruto*100) / result4[0].QTCAPPES).toFixed(2) );
              
              var pcpsfalta = 0;
              pcpsfalta = pcocupac;
              //# PORCENTAGEM MINIMA DE OCUPAÇÃO
              if(result4[0].PCPESMIN == undefined || result4[0].PCPESMIN == null || pcocupac < result4[0].PCPESMIN){
                objValidation.pcocupac  = 0; // ocorrencia
              }else if(pcocupac >= result4[0].PCPESMIN ){
                objValidation.pcocupac  = 1; // liberado
              }else{
                objValidation.pcocupac  = 0; // ocorrencia
              }
              objValidation.pcpsfalta = pcpsfalta; //para calculo ocorrencia
            }else{
              objValidation.pcocupac  = 0; // ocorrencia
              objValidation.pcpsfalta = 0; //para calculo ocorrencia
            }

          }else{
            objValidation.psbruto  = 0; // ocorrencia
            objValidation.pcocupac = 0; // ocorrencia
          }

      }else{
        objValidation.idg030   = -1; // neutro
        objValidation.psbruto  = -1; // neutro
        objValidation.pcocupac = -1; // neutro
        objValidation.idg005   = -1; // neutro
      }
      //# Fim validação tipo de veiculo, peso e ocupação
      //////////////////////////////////////////////////////////////////////////////////





      resultG014 = await con.execute(
        {
            sql: `
            SELECT *
            FROM (SELECT SUM(NRPESO) AS PESO,
                   SUM(VRMERCAD) AS VALOR,
                   IDG014
                
                FROM (SELECT NRPESO,
                       VRMERCAD,
                       G022.IDG014
                    
                    FROM G051
                    
                    JOIN G022 G022
                      ON G022.IDG005 = G051.IDG005CO
                     AND G022.SNINDUST = 1
                     AND G022.SNDELETE = 0
                    JOIN G005 G005
                      ON G022.IDG005 = G005.IDG005
                   WHERE IDG051 IN (${ctrc})
                    
                    UNION ALL
                    
                    SELECT PSBRUTO     AS NRPESO,
                       VRDELIVE    AS VRMERCAD,
                       G022.IDG014
                    
                    FROM G043
                    
                    JOIN G022 G022
                      ON G022.IDG005 = G043.IDG005RE
                     AND G022.SNINDUST = 1
                     AND G022.SNDELETE = 0
                    JOIN G005 G005
                      ON G022.IDG005 = G005.IDG005
                   WHERE IDG043 IN (${delivery})
                    
                    ) N
               GROUP BY N.IDG014) J
           ORDER BY J.PESO DESC `,
          param: []
        });

        //# Caso vier operação
        if(resultG014.length > 0){
          objValidation.idg014 = resultG014[0].IDG014; // operação
        }else{
          objValidation.idg014 = null; // sem operação
        }
























      }else{
        //#nnnn
      }








      //////////////////////////////////////////////////////////

      //  NÃO MONTA CARGA:
      //  Data motorista vencidas; OK
      //  Data veículo vencidas; OK

      //  OCORRÊNCIA:
      //	Estouro de valor limite máximo para carga - Apólice Individualmente; OK 
      //	Estouro de limite peso para o veículo; OK
      //	Peso e valor não atingem o índice mínimo estipulado para carga; OK

      //  ALERTA:
      //	Existe MDF-e sem encerrar;

      //////////////////////////////////////////////////////////


      await con.close();
      //console.log(objValidation);
      return objValidation;

    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
  };
  //api.validarCarga(null, null, null);



  /**
   * @description Salvar um dado na tabela G028.
   *
   * @async
   * @function api/salvarCarga
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarCarga = async function (req, res, next) {

    logger.debug("Inicio salvarCarga");
    let con = await this.controller.getConnection(null, req.UserId);
   
    /*

          Select * From g046 -- salvar
          Select * From g048 -- salvar
          Select * From g049 -- salvar
          Select * From g051 -- atualizar

    */


    try {

      logger.debug("Parametros buscar:", req.body);

      var objCarga = req.body.grid;
      var objForm  = req.body.form;
      var objApi   = req.body.api;
      var stCarga  = "F";
      var stProxim = "E";
      var idOcorre = "";
      var idg014   = null;

      var arClientes    = [];
      var arMotoristas  = [];
      var arVeiculos    = [];
      var arNFE         = "";
      var arCTE         = "";
      var tpModCar      = "";
      var snGeraOcorre  = true;
     /*
      * Coloca em um array todos os destinatários 
      */
      for(let item of objCarga){
        arClientes.push(item.IDG005DE);

        if(item.LSCTE != null){
          arCTE += item.LSCTE + ',';
        }

        if(item.LSNFE != null){
          arNFE += item.LSNFE + ',';
        }

      }
      
      if(arCTE != ""){
        arCTE = arCTE.substr(0, arCTE.length-1);
      }

      if(arNFE != ""){
        arNFE = arNFE.substr(0, arNFE.length-1);
      }


      if(arCTE != "" && arNFE != ""){
        //# mista
        tpModCar = 3;
      }else if(arCTE != "" && arNFE == ""){
        //# 3PL
        tpModCar = 1;
      }else if(arCTE == "" && arNFE != ""){
        //# 4PL
        tpModCar = 2;
      }else{
        tpModCar = "";
      }


      var aux = null;
      var dateAux = objForm.DTPRESAI.date; //# data privisão de saída
      let timeAux = objForm.DTPRESAIH; //# dtprevisao hhmm

      var dateColetaAux = objForm.DTCOLETA.date; //# data coleta

      aux = objForm.IDG031M1 ? arMotoristas.push(objForm.IDG031M1.id) : null;
      aux = objForm.IDG031M2 ? arMotoristas.push(objForm.IDG031M2.id) : null;
      aux = objForm.IDG031M3 ? arMotoristas.push(objForm.IDG031M3.id) : null;

      aux = objForm.IDG032V1 ? arVeiculos.push(objForm.IDG032V1.id) : null;
      aux = objForm.IDG032V2 ? arVeiculos.push(objForm.IDG032V2.id) : null;
      aux = objForm.IDG032V3 ? arVeiculos.push(objForm.IDG032V3.id) : null;

      req.body.valida = {
        IDG030:(objForm.IDG030 ? objForm.IDG030.id : null), 
        IDG032:arVeiculos, 
        IDG031:arMotoristas, 
        IDG005:arClientes, 
        PSBRUTO:(objForm.PSCARGA ? objForm.PSCARGA : null), 
        VRMERCAD:(objForm.VRCARGA ? objForm.VRCARGA : null),
        LSDOCUME:{IDG051: arCTE, IDG043: arNFE},
        IDG024_CARGA: objForm.IDG024_CARGA,
        SNESCOLT: objForm.SNESCOLT.id,
        TPMODCAR: tpModCar
      };

      var objValidation = await api.validarCarga(req, res, next);

      //# Validação operação carga
      if(objValidation.idg014 != null){
        idg014 = objValidation.idg014;
      }


      //# ocorrência mostrada para 3PL,
      //# caso for carga mista, a regra 3PL prevalece

      if(tpModCar == 1 || tpModCar == 2 || tpModCar == 3){

        //# sendo 4PL e LTL, nao possui restrição
        if(!(tpModCar == 2 && objForm.SNCARPAR.id == 'S')){

          //# Estouro de peso
          if(objValidation.psbruto == 0){
            stCarga = "E";
            idOcorre = idOcorre + '1,';
          }

          //# Estouro de apólice
          if(objValidation.vrmercad == 0){
            stCarga = "E";
            idOcorre = idOcorre + '2,';
          }

          //# Mínimo de peso
          if(objValidation.pcocupac == 0){
            stCarga = "E";
            idOcorre = idOcorre + '3,';
          }
        }
      
      }

      var IDG030Aux = null;
      var IDG031M1Aux = null;
      var IDG031M2Aux = null;
      var IDG031M3Aux = null;
      var IDG032V1Aux = null;
      var IDG032V2Aux = null;
      var IDG032V3Aux = null;
      var IDG024Aux = null;
      var IDG024Oco = null;
      var SNESCOLTAux = null;

      IDG024Aux   = (objForm.IDG024_CARGA ? objForm.IDG024_CARGA.id : null);
      IDG024Oco   = (objForm.IDG024_CARGA ? objForm.IDG024_CARGA.id : null);
      IDG030Aux   = (objForm.IDG030 ? objForm.IDG030.id : null);

      //# oferecimento = A;
      //# Pre carga    = I;
      if(objForm.SIMNAOOFERECE == "A"){
        stProxim = "B"; // OFERENCIMENTO
        IDG030Aux = (objForm.IDG030 ? objForm.IDG030.id : null);
        IDG024Aux = null;
        if(IDG030Aux == null){
          return false; //# Forcando erro;
        }


      }else if(objForm.SIMNAOOFERECE == "I"){
        stProxim = "F"; // PRECARGA
        IDG030Aux = (objForm.IDG030 ? objForm.IDG030.id : null);

        IDG031M1Aux = (objForm.IDG031M1 ? objForm.IDG031M1.id : null);
        IDG031M2Aux = (objForm.IDG031M2 ? objForm.IDG031M2.id : null);
        IDG031M3Aux = (objForm.IDG031M3 ? objForm.IDG031M3.id : null);
        IDG032V1Aux = (objForm.IDG032V1 ? objForm.IDG032V1.id : null);
        IDG032V2Aux = (objForm.IDG032V2 ? objForm.IDG032V2.id : null);
        IDG032V3Aux = (objForm.IDG032V3 ? objForm.IDG032V3.id : null);
        SNESCOLTAux = (objForm.SNESCOLT ? objForm.SNESCOLT.id : null);

        if((IDG031M1Aux != null && IDG032V1Aux != null) || 
           (IDG031M2Aux != null && IDG032V2Aux != null) || 
           (IDG031M3Aux != null && IDG032V3Aux != null)){

          stProxim = "A";

        }

      }

      // CASO NAO TENHA OCORRENCIA, SITUACAO ATUAL É A PROXIMA
      if(stCarga != "E"){
        stCarga = stProxim;
      }



      //# LOGISTICA REVERSA
      if(objForm.SIMNAOLOGISTICA != undefined){
        stCarga = "S";
      }

      //# LOGISTICA REVERSA DEVOLUCAO
      if(objForm.SIMNAODEVOLUCAO != undefined && objForm.TPTRANSP.id == 'D'){
        stCarga = "R";
        IDG024Aux = null;
        //IDG030Aux = null;
      }

      //# LOGISTICA REVERSA RECUSA
      if(objForm.SIMNAODEVOLUCAO != undefined && objForm.TPTRANSP.id == 'R'){
        stCarga = "T";
        IDG024Aux = (objForm.IDG024 ? objForm.IDG024.id : null);
        IDG030Aux = (objForm.IDG030 ? objForm.IDG030.id : null);
      }
      

      if(timeAux == ""){
        timeAux = {
          hour: 8,
          minute: 0
        };
      }
      if(objForm.DTPRESAIH == ""){
        objForm.DTPRESAIH = {
          hour: 8,
          minute: 0
        };
      } 
        

      //console.log(timeAux);

      let resCarga =  await con.insert({
        tabela: 'G046',
        colunas: {

          DSCARGA: objForm.DSCARGA ,/* Cicade origem x cidade destino - Descrição carga*/
          DTCARGA: new Date() ,/*Data da carga*/

          //# Datas atribuidas via campo obrigatorio
          DTCOLORI: new Date(dateColetaAux.year, (dateColetaAux.month -1), dateColetaAux.day, 0,0,0,0),/*Data coleta original*/
          DTCOLATU: new Date(dateColetaAux.year, (dateColetaAux.month -1), dateColetaAux.day, 0,0,0,0),/*Data coleta atual*/

          DTPSMANU: new Date(dateAux.year, (dateAux.month -1), dateAux.day, timeAux.hour, timeAux.minute,0,0),/*Data previsão de saida*/
          STPROXIM: stProxim,/*Proxima etapa da carga*/
          VRPERCAR: 100,/*Percentual de perfomance*/

          PSCARGA: objForm.PSCARGA ,/*Peso da carga*/
          VRCARGA: objForm.VRCARGA ,/*Valor da carga*/

          IDS001:  (req.UserId? req.UserId : 1),//objForm.IDS001 ,/*Usuário do Cadastro*/
          TPCARGA: objForm.TPCARGA.id ,/*Defu = 2 - Tipo de carga*/
          QTDISPER: objForm.QTDISPER	,/*Distância da carga*/
          QTDISBAS: (objForm.QTDISBAS != undefined ? objForm.QTDISBAS : 0)	,/*Distância da volta base*/
          VRPOROCU: objForm.VRPOROCU	,/*% Ocupação*/ //ANALISE
          STCARGA:  stCarga ,/*Status da Carga*/
          SNCARPAR: objForm.SNCARPAR.id	,/*Campo FTL/ LTL - Carga Parcial*/
          IDG028: (objForm.IDG028 ? objForm.IDG028.id : null),/*Local de coleta (obrigatorio oferecimento) - Armazém*/
          TPMODCAR: tpModCar, /*Tipo de carga 3PL/4PL/MISTA*/
          /* Continha */
          //DTCOLORI: new Date(objForm.DTCOLORI)	,/*Data da Coleta original*/
          //DTCOLATU: new Date(objForm.DTCOLATU)	,/*Data da Coleta atualizada*/

          DTAGENDA: (objForm.DTAGENDA === '' ? new Date() : objForm.DTAGENDA? new Date(objForm.DTAGENDA) : null), /*Data agendamento - Logistica Reversa*/
          DTPRESAI: (objForm.DTPRESAI ? new Date(objForm.DTPRESAI.date.year, (objForm.DTPRESAI.date.month -1), objForm.DTPRESAI.date.day, objForm.DTPRESAIH.hour, objForm.DTPRESAIH.minute,0,0) : null	),/*Não utilizar (criar novo) - usado no hc -> Usado no logistica reversa*/
          TPORIGEM: 1	,/* hardcode*/

          /* Atribuir caso 3pl */
          IDG031M1:  IDG031M1Aux	,/*Motorista 1*/
          IDG031M2:  IDG031M2Aux	,/*Motorista 2*/
          IDG031M3:  IDG031M3Aux	,/*Motorista 3*/
          IDG032V1:  IDG032V1Aux	,/*Veículo 1*/
          IDG032V2:  IDG032V2Aux	,/*Veículo 2*/
          IDG032V3:  IDG032V3Aux	,/*Veículo 3*/
          
          SNESCOLT: SNESCOLTAux, /*Com escolta?*/

          IDG024: IDG024Aux,    /*TRANSPORTADORA*/

          /* OFERECIMENTO */
          IDG030: IDG030Aux,/*Caso bravo, pegar do veiculo se tiver - Tipo de veículo*/

          IDG014: idg014,

          /* NÃO UTILIZADOS */
          //STENVLOG: req.body.STENVLOG	,/*Status envio logos*/
          //OBCANCEL: req.body.OBCANCEL	,/*Observação do Cancelamento*/
          //IDS001CA: req.body.IDS001CA	,/*Usuário do Cancelamento*/
          //DTCANCEL: req.body.DTCANCEL	,/*Data do Cancelamento*/
          //SNURGENT: req.body.SNURGENT	,/**/
          
          //SNDELETE: req.body.SNDELETE	,/*Registro excluído?*/
          
          //CDVIAOTI: req.body.CDVIAOTI	,/*Número da Viagem otimizador */
          //QTVOLCAR: req.body.QTVOLCAR	,/*Não temosVolume m³*/
          //DTSAICAR: req.body.DTSAICAR	,/*Data saída da carga*/
          //STINTCLI: req.body.STINTCLI	,/*Status integração com o cliente*/

          SNMOBILE: (objForm.SNMOBILE ? objForm.SNMOBILE.id : null), /* Enviar para mobile? */
          TPTRANSP: (objForm.TPTRANSP ? objForm.TPTRANSP.id : null)  /* Tipo de Transporte */

        },
        key: 'IdG046'
      })
        .then((result1) => {
          return (result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });


        let contParadas = 0;
        let lsNotasInseridas = "";
        let dtpreatu = null;
        let dtpreori = null;
        let distance2 = null;

        for (let index = 0; index < objCarga.length; index++) {


          dtpreatu = null;
          //dtpreori = null;

          //# se for LTL nao salvar previsão
          if(objForm.SNCARPAR.id == 'S' && (tpModCar == 2 || tpModCar == 3)){

            if(objForm.SIMNAOLOGISTICA != undefined || objForm.SIMNAODEVOLUCAO != undefined){
              dtpreatu = new Date(objCarga[index].DTPREATU);
            }else{
              dtpreatu = null;
            }

          }else{
            dtpreatu = new Date(objCarga[index].DTPREATU);
          }
          
          // dtpreatu = null;
          // dtpreori = null;

          //# só faz o calculo da previsão de antrega atualizada quando não for crossdoking  
          // if(objCarga[index].CDEMPDES == null){
          //   dtpreatu = new Date(objCarga[index].DTPREATU);
          // }

          //# se for 3PL: preori = preaatu
          // if(tpModCar == 1){
          //   dtpreori = dtpreatu;
          // }else{
          //   dtpreori = new Date(objCarga[index].DTPREORI);
          // }

          if(objCarga[index].DISTANCE2 == undefined){

            if (objForm.IDG024_CARGA.nrlatitu == undefined) {

              distance2 = objCarga[index].DISTANCE;

            } else {

              distance2 = await utilsCurl.calcularDistancia(objForm.IDG024_CARGA.nrlatitu+','+objForm.IDG024_CARGA.nrlongit, objCarga[index].NRLATITUDE+','+objCarga[index].NRLONGITDE);
            
            }
            
          }else{
            distance2 = objCarga[index].DISTANCE2;
          }

          let resParadas =  await con.insert({
          tabela: 'G048',
          colunas: {

            IDG046	: resCarga, /*Carga*/
            NRSEQETA: (index + 1)	, /*Sequencial da etapa*/
            PSDELETA: objCarga[index].PSBRUTO	, /*Peso da deliveries da etapa*/
            QTDISPER: (objCarga[index].DISTANCE / 1000), /*Distancia percorrida da etapa*/
            QTDISTOD: distance2, /*Distancia percorrida da origem ao destino*/
            IDG005OR: objCarga[index].IDG005RE	, /*Cliente origem*/
            IDG005DE: objCarga[index].IDG005DE	, /*Cliente destino*/

            /* DTENTCON menor da delivery se nao, menor dtentcon do conhecimento */
            DTENTCON: (req.body.DTENTCON ? dtatu.retornaData(req.body.DTENTCON, "DD/MM/YYYY HH:mm:ss") : null)	, /*Data de entrega contratual -> Logistica Reversa o If*/

            /* continha */
            //DTPREORI: dtpreori, //new Date(objCarga[index].DTPREORI)	, /*Previsão de entrega original*/
            //DTPREATU: dtpreatu, //new Date(objCarga[index].DTPREATU)	, /*Data previsão de entrega atualizada*/

            DTPREORI: new Date(objCarga[index].DTPREORI)	, /*Previsão de entrega original*/
            DTPREATU: dtpreatu, //new Date(objCarga[index].DTPREATU)	, /*Data previsão de entrega atualizada*/

            /* tempo fixo parada e outro para tonelada */
            DTINIETA: new Date(objCarga[index].DTINIETA)	, /*Início da etapa*/
            DTFINETA: new Date(objCarga[index].DTFINETA)	, /*Fim da etapa*/

            //IDINTOPE: req.body.IDINTOPE	, /*Shipment*/

            STINTCLI: 0	, /*Status interacao*/
            STINTINV: 0	, /**/
            QTVOLCAR: 0	, /*Volume m³*/

            // crosdoking
            IDG024: objCarga[index].CDEMPDES,
          },
          key: 'IdG048'
        })
          .then((result1) => {
            return (result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });


          //# DELIVERY
          if(objCarga[index].LSNFE != null){


            var Moment = require('moment');
            //var moment = require('moment-timezone');
            Moment.locale('pt-BR');
            var MomentRange = require('moment-range');
            var moment = MomentRange.extendMoment(Moment);


            lsNotasInseridas = lsNotasInseridas + objCarga[index].LSNFE + ",";

            let listaNfesDiasSla = await con.execute(
              {
                sql: ` select CASE tpdelive
                                WHEN '1' THEN
                                'T'
                                WHEN '2' THEN
                                'V'
                                WHEN '5' THEN
                                'V'
                                WHEN '3' THEN
                                'D'
                                WHEN '4' THEN
                                'R'
                                ELSE
                                'X'
                              END as tptransp,
                              g043.IDG014,
                              g005de.IDG003 as IDG003DE,
                              g005re.IDG003 as IDG003RE,
                              to_char(g043.dtlancto, 'DD/MM/YYYY') as dtlancto,
                              to_char(nvl(g043.dtvenrot, current_date), 'DD/MM/YYYY') as dtvenrot,

                              (SELECT COUNT(*)
                                 FROM G014 G014
                                 JOIN G097 G097 
                                   ON G097.IDG097 = G014.IDG097DO
                                  AND G097.IDG097 = 145
                                WHERE G014.IDG014 = G043.IDG014) AS SNDEVSYN

                        from g043 g043
                        join g005 g005re
                          on g043.idg005re = g005re.idg005
                        join g005 g005de
                          on nvl(G043.IDG005RC,G043.IDG005DE) = g005de.idg005
                      WHERE G043.IDG043 IN (${objCarga[index].LSNFE})`,
                param: []
              })
              .then((result) => {
                logger.debug("Retorno:", result);
                return (result);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });

            var dataSla = null;
            var dataSla4pl = null;
            var dtAuxSla4pl = null;
            var qtdDias = 0 ;
            
            var IDG003RE = null;
            var IDG003DE = null;
            var TPTRANSP = null;

            for (let k = 0; k < listaNfesDiasSla.length; k++) {

              IDG003RE = null;
              IDG003DE = null;
              dataSla = null;
              dataSla4pl = null;
              dtAuxSla4pl = null;
              qtdDias = 0 ;

              //# caso recusa é tratado como venda, mas alterna o remetente x destinatario
              if(listaNfesDiasSla[k].TPTRANSP == 'R'){
                IDG003RE = listaNfesDiasSla[k].IDG003DE;
                IDG003DE = listaNfesDiasSla[k].IDG003RE;
                TPTRANSP = 'V';
              }else{
                IDG003RE = listaNfesDiasSla[k].IDG003RE;
                IDG003DE = listaNfesDiasSla[k].IDG003DE;
                TPTRANSP = listaNfesDiasSla[k].TPTRANSP;
              }

              dataSla = moment({ year: req.body.form.DTCOLETA.date.year, month: (req.body.form.DTCOLETA.date.month - 1), day: req.body.form.DTCOLETA.date.day,
                hour: 00, minute: 00 });

              //# Data de vencimento sla 4pl
              dtAuxSla4pl = listaNfesDiasSla[k].DTVENROT;
              dtAuxSla4pl = dtAuxSla4pl.split("/");
              dataSla4pl = moment({ year: parseInt(dtAuxSla4pl[2]), month: (parseInt(dtAuxSla4pl[1]) - 1), day: dtAuxSla4pl[0],
                  hour: 00, minute: 00 });

              //# 1 dia para coleta
              dataSla4pl.add(1, 'days');
              //#######################################

        
              sql = ` SELECT
                            NVL(QTDIAENT, 0) QTDIAENT,
                            NVL(QTDIACOL, 0) QTDIACOL,
                            NVL(QTDIENLO, 0) QTDIENLO,
                            NVL(QTDIENIT, 0) QTDIENIT,
                            COALESCE(TO_CHAR(HOFINOTI, 'HH24:MI'), '23:59') HOFINOTI
        
                          FROM G053
                          WHERE
                            SNDELETE     = 0
                            AND IDG014   =  ${listaNfesDiasSla[k].IDG014}
                            AND IDG003OR =  ${IDG003RE}
                            AND IDG003DE =  ${IDG003DE}
                            AND TPTRANSP = '${TPTRANSP}' `;
        
              let resultParamDias = await con.execute({ sql, param: [] })
              .then((result) => {
                return result;
              })
              .catch((err) => {
                con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
        
              if(resultParamDias.length > 0 ){
                if(req.body.form.SNCARPAR.id == 'N'){ //# FTL
                  qtdDias = resultParamDias[0].QTDIENLO;
                }else if(req.body.form.SNCARPAR.id == 'S'){ //# LTL
                  qtdDias = resultParamDias[0].QTDIAENT;
                }else{// # ITL
                  qtdDias = resultParamDias[0].QTDIENIT;
                }
              }else{
                qtdDias = 0;
                if(listaNfesDiasSla[k].TPTRANSP != 'D'){
                  res.status(500);
                  return {response: "Cidade tarifa não cadastrado para os parâmetros informados!"};
                }
              }

              //# deliverys de devolução e syngenta
              if ((listaNfesDiasSla[k].TPTRANSP == 'D') && (listaNfesDiasSla[k].SNDEVSYN >= 1)) {

                var dtAuxSla = listaNfesDiasSla[k].DTLANCTO;
                dtAuxSla = dtAuxSla.split("/");
                dataSla = null;

                qtdDias = 0;
                dataSla = moment({ year: parseInt(dtAuxSla[2]), month: (parseInt(dtAuxSla[1]) - 1), day: dtAuxSla[0],
                  hour: 00, minute: 00 });
                dataSla.add(22, 'days');

              }

              //# SLA 3PL
              dataSla    = await utilsCurl.addDiasUteis(dataSla.toDate(), qtdDias, listaNfesDiasSla[k].IDG003DE);    

              //# SLA 4PL
              dataSla4pl = await utilsCurl.addDiasUteis(dataSla4pl.toDate(), qtdDias, listaNfesDiasSla[k].IDG003DE);    
                  
              
              let updateDataEntregaContratual = await con.execute(
              {
                sql:`update g043
                        set dtentcon = to_date('${dataSla.format('L')} 12:00:00', 'DD/MM/YYYY HH24:mi:ss'),
                            dtent4pl = to_date('${dataSla4pl.format('L')} 12:00:00', 'DD/MM/YYYY HH24:mi:ss')
                      where idg043 in (${objCarga[index].LSNFE})`,
                param: []
              })
              .then((result) => {
                logger.debug("Retorno:", result);
                return (result);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
          
            }


            // ****** VERIFICAR SE EXISTE CTE LIGADO A DELIVERY   ************//
            let listaCtes = await con.execute(
            {
              sql: `SELECT G052.IDG051, G052.IDG043 FROM G052
                    WHERE G052.IDG043 IN (${objCarga[index].LSNFE})`,
              param: []
            })
            .then((result) => {
              logger.debug("Retorno:", result);
              return (result);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
            
            let notasEmCtes = []
            if(listaCtes.length > 0){
              let ctes = '';
              for(let i=0; i< listaCtes.length;i++ ){
                if(i == (listaCtes.length-1)){
                  ctes += ' ' + listaCtes[i].IDG051;
                }else{
                  ctes += ' ' + listaCtes[i].IDG051 + ' , ';
                }
              }
               notasEmCtes = await con.execute(
                {
                  sql: `SELECT G052.IDG051, 
                               G052.IDG043 
                          FROM G052 G052
                          JOIN G051 G051 on G051.IDG051 = G052.IDG051
                         WHERE G052.IDG051 IN (${ctes}) 
                           AND G051.STCTRC = 'A' `,
                  param: []
                })
                .then((result) => {
                  logger.debug("Retorno:", result);
                  return (result);
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });
            }

          var strDelivery = objCarga[index].LSNFE.toString();

          var IDG043S =  strDelivery.split(",");
          
          let validate = false;
          for (  let i of notasEmCtes ) {
              validate = false;
            for(let j = 0; j < IDG043S.length; j++){
              if(IDG043S[j] == i.IDG043){
                validate = true
              }
            }
            if(!validate){
              res.status(500);
              return {response: "Todas as Deliverys ligadas ao CTE devem estar na carga!"};
            }

          }
                    // ****** ||||||||||||||||||   ************//



            let resultPrimeiraCargaNota = null;
            let listaCteDelivery = null;
            let idCteDelivery = null;

          for (let j = 0; j < IDG043S.length; j++) {
            contParadas += 1;          

            listaCteDelivery = await con.execute(
            {
              sql: `SELECT G052.IDG051, G052.IDG043 FROM G052
                    WHERE G052.IDG043 IN (${IDG043S[j]}) order by G052.IDG051 desc`,
              param: []
            })
            .then((result) => {
              logger.debug("Retorno:", result);
              return (result);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });

            if (listaCteDelivery.length >= 1) {
              idCteDelivery = listaCteDelivery[0].IDG051;
            } else { 
              idCteDelivery = null;
            }


            let resDocParadas =  await con.insert({
              tabela: 'G049',
              colunas: {

                IDG043	: IDG043S[j],  /*Delivery*/
                IDG048  : resParadas,  /*Etapa da carga*/
                NRORDEM : contParadas, /*Ordem de entrega delivery*/
                IDG051  : idCteDelivery,  /*CTE*/

              },
              key: 'IDG049'
            })
              .then((result1) => {
                return (result1);
              })
              .catch((err) => {
                contParadas -= 1;
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });
            
              if(!(objForm.SIMNAODEVOLUCAO != undefined && (objForm.TPTRANSP.id == 'D' || objForm.TPTRANSP.id == 'R'))){
                IDG043S[j] = IDG043S[j].trim()          
              }

            resultPrimeiraCargaNota = await con.execute(
              {
                sql: `   select g043.CDG46ETA
                           from g043 g043 
                          where g043.idg043 = ${IDG043S[j]} ` ,
                param: {}
              })
              .then((result) => {
                logger.debug("Retorno:", result);
                return result[0];
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });


              //# Verificando só delivery ja passou em alguma carga
              if(resultPrimeiraCargaNota.CDG46ETA != "" && resultPrimeiraCargaNota.CDG46ETA != null){ 
                //# Ignora caso já tenha algo preenchido;
              }else{
                let stetapa = 2
                if(!(objForm.SIMNAODEVOLUCAO != undefined && (objForm.TPTRANSP.id == 'D' || objForm.TPTRANSP.id == 'R'))){
                  IDG043S[j] = IDG043S[j].trim()          
                }
                let cdg46eta = utilsFMT.formataShipment({ idCarga: resCarga, nrEtapa: (index + 1) });
                console.log(cdg46eta);

                switch(objForm.TPTRANSP.id){
                  case 'D':
                    stetapa = 21;
                    break;
                  case 'R':
                    stetapa = 24;
                    break;
                } 
                let resCdg46eta = await
                con.update({
                  tabela: 'G043',
                  colunas: {
                    cdg46eta: cdg46eta,
                    stetapa: stetapa
                  },
                  condicoes: ` IDG043 in (`+IDG043S[j]+`) `
                })
                  .then((result1) => {
                  logger.debug("Retorno:", result1);
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  logger.error("Erro:", err);
                  throw err;
                });
              }
            }
          }


          if(objCarga[index].LSCTE != null){
            var IDG051S = objCarga[index].LSCTE.split(",");
            let resultNotasConhecimento = null;
            for (let j = 0; j < IDG051S.length; j++) {
              
              resultNotasConhecimento = await con.execute(
              {
                sql: `   select distinct g052.idg043 
                           from g051 g051 
                           join g052 g052 
                             on g052.idg051 = g051.idg051 
                          where g051.idg051 = ${IDG051S[j].trim()} ` ,
                param: {}
              })
              .then((result) => {
                logger.debug("Retorno:", result);
                return result;
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });


            //# Caso vier resultado há notas
            if(resultNotasConhecimento.length > 0){

              for (let index = 0; index < resultNotasConhecimento.length; index++) {
                contParadas += 1;
                let resDocParadas =  await con.insert({
                  tabela: 'G049',
                  colunas: {

                    IDG043	: resultNotasConhecimento[index].IDG043,  /*Notas*/
                    IDG048  : resParadas,  /*Etapa da carga*/
                    NRORDEM : contParadas, /*Ordem de entrega delivery*/
                    IDG051  : IDG051S[j].trim(),  /*CTE*/

                  },
                  key: 'IDG049'
                  })
                  .then((result1) => {
                    return (result1);
                  })
                  .catch((err) => {
                    contParadas -= 1;
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
                
              }
            }
            
          }

          let resConhecimento = await
          con.update({
            tabela: 'G051',
            colunas: {
              IDG046: resCarga

            },
            condicoes: ` IDG051 in (`+objCarga[index].LSCTE+`) `
          })
            .then((result1) => {
            logger.debug("Retorno:", result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });

        }
        }
      /// fim paradas;


      //console.log(lsNotasInseridas);

      //#Verificação mais de um remetente
      if(lsNotasInseridas){

        resultNotasRemetente = await con.execute(
          {
            sql: `select count(x.idg005re) as qtd
                    from (
                  select distinct 
                         G043.idg005re
                    from G043 G043
                   where G043.idg043 in (${lsNotasInseridas.trim().substr(0, lsNotasInseridas.length -1)})) x ` ,
            param: {}
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            return result;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

        //# Removido a pedido do Eric no dia 13/03/2019
        //# Caso vier resultado há mais de um remetente na mesma carga
        // if(resultNotasRemetente.length >= 1){
        //   if(resultNotasRemetente[0].QTD > 1){
        //     res.status(500);
        //     return {response: "A carga possui mais de uma origem!"};
        //   }
        // }
      


        let vira = await con.execute(
          {
            sql: `select distinct G043.idg005re, nvl(G043.IDG005RC,G043.IDG005DE) as IDG005DE, g058.idg058, g058.idg024
                    from G043 G043
                    join g058 g058
                      on g058.idg005re = G043.idg005re
                     and g058.idg005de = nvl(G043.IDG005RC,G043.IDG005DE)
                   where G043.idg043 in (${lsNotasInseridas.trim().substr(0, lsNotasInseridas.length -1)}) ` ,
            param: {}
          })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });


          
        if (vira.length > 0) {

          let dadosVira = null;
          let snCargaVira = true;

          for (let i = 0; i < vira.length; i++) {
            dadosVira = vira[i];
            if(vira[i].IDG058 == null){
              snCargaVira = false;
            }
          }


          if(snCargaVira){
            
            //# Vira não gera ocorrência
            snGeraOcorre = false;

            let resCargaVira = await
            con.update({
              tabela: 'G046',
              colunas: {
                STCARGA: 'A',
                SNVIRA: 'S',
                IDG024: dadosVira.IDG024

              },
              condicoes: ` IDG046 in (`+resCarga+`)`
            })
              .then((result1) => {
              logger.debug("Retorno:", result1);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });

                
            let resCargaHisVira =  await con.insert({
              tabela: 'O005',
              colunas: {
                IDG024 : dadosVira.IDG024,
                IDG046 : resCarga,
                DTOFEREC: new Date(),
                DTRESOFE: new Date(),
                IDS001OF: 4,
                IDS001RE: 4,
                STOFEREC: 'A'
              },
              key: 'Ido005'
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
      }


      // let verificaOrigemDestino = await con.execute(
      //   {
      //     sql: `select

      //             nvl(g003.NRLATITU, g003.NRLATITU) || ',' ||
      //             nvl(g003.NRLONGIT, g003.NRLONGIT) As ORIGEM,
                  
      //             nvl(G005DE.NRLATITU, G003DE.NRLATITU) || ',' ||
      //             nvl(G005DE.NRLONGIT, G003DE.NRLONGIT) As DESTINO,
                  
      //             g024.idg024,
      //             g005DE.idg005,
      //             g046.idg046
                  
      //             from g046 g046
      //             join g024 g024
      //               on g024.idg024 = g046.idg024
      //             join g003 g003
      //               on g003.idg003 = g024.idg003
                
      //             Join G048 G048DE
      //               On (G048DE.IDG046 = G046.IDG046 And
      //                   G048DE.NRSEQETA =
      //                   (Select Max(G048DE_2.NRSEQETA)
      //                       From G048 G048DE_2
      //                     Where G048DE_2.IDG046 = G048DE.IDG046))
                
      //             Join G005 G005DE
      //               On (G005DE.IDG005 = G048DE.IDG005DE)
      //             Join G003 G003DE
      //               On (G003DE.IDG003 = G005DE.IDG003)
                
      //             where g046.idg046 = ${resCarga}
      //               and g046.idg024 is not null ` ,
      //     param: {}
      //   })
      // .then((result) => {
      //   logger.debug("Retorno:", result);
      //   return result;
      // })
      // .catch((err) => {
      //   err.stack = new Error().stack + `\r\n` + err.stack;
      //   throw err;
      // });

      // if (verificaOrigemDestino.length > 0) {

      //   let distanciaBase = await utilsCurl.calcularDistancia(verificaOrigemDestino[0].ORIGEM, verificaOrigemDestino[0].DESTINO);

      //   let resCargaDistanciaBase = await
      //   con.update({
      //     tabela: 'G046',
      //     colunas: {
      //       QTDISBAS: parseInt(distanciaBase),
      //     },
      //     condicoes: ` IDG046 in (`+resCarga+`)`
      //   })
      //     .then((result1) => {
      //     logger.debug("Retorno:", result1);
      //   })
      //   .catch((err) => {
      //     err.stack = new Error().stack + `\r\n` + err.stack;
      //     logger.error("Erro:", err);
      //     throw err;
      //   });
      // }

      
      if(snGeraOcorre){

        //# LOGISTICA REVERSA
        if(objForm.SIMNAOLOGISTICA != undefined || objForm.SIMNAODEVOLUCAO != undefined){
          idOcorre = [];
        }


        if(idOcorre.length > 0){

          idOcorre = idOcorre.substr(0, idOcorre.length-1).split(',');
          var calculoOcorrencia = 0;
          var sendOcorre=[];
          var nameOcorre=[];
          for (let c = 0; c < idOcorre.length; c++) {
           
            /*//#
              // 1 - Estouro de peso -> Quanto maior o percentual do estouro para mais pessoas será enviado a ocorrência; 
              // 2 - Estoura Apólice -> Quanto maior o percentual do estouro para mais pessoas será enviado a ocorrência; 
              // 3 - Percentual mínimo de peso não atingido -> Quanto menor o percentual para mais pessoas será enviado a ocorrência;
              //   
            */
            if(idOcorre[c] == 1){
              calculoOcorrencia = objValidation.pcpsesto;
              nameOcorre[idOcorre[c]] = 'restrição do peso total da carga';
            }else if(idOcorre[c] == 2){
              calculoOcorrencia = objValidation.pcvresto;
              nameOcorre[idOcorre[c]] = 'restrição da apólice';
            }else if(idOcorre[c] == 3){
              calculoOcorrencia = objValidation.pcpsfalta;
              nameOcorre[idOcorre[c]] = 'percentual mínimo de peso não atingido';
            }
            let resultUserOcorrencia = await con.execute(
              {
                sql: `Select G071.*, G071.Ids001oc, Pcparam
                        From G070 G070
                        Join G071 G071
                          On G071.Idg070 = G070.Idg070
                       Where G070.Idg024 = `+IDG024Oco+`
                         And G070.Sndelete = 0
                         And G071.Sndelete = 0
                         And G071.Stcadast = 'A'
                         And G071.TpModCar = `+tpModCar+`
                         And G071.IDG067   = `+idOcorre[c],
                param: []
              })
              .then((result) => {
                logger.debug("Retorno:", result);
                return (result);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
              });

              if(resultUserOcorrencia.length <= 0 ){
                await con.closeRollback();
                res.status(500);
                return {response: "Não há configuração de ocorrência para a transportadora informada"};
              }

              for (let y = 0; y < resultUserOcorrencia.length; y++) {
                sendOcorre[idOcorre[c]] = 0;

                if(idOcorre[c] != 3){

                  if((resultUserOcorrencia[y].PCPARAM + 100) <= calculoOcorrencia){
                    let resOcorre =  await con.insert({
                      tabela: 'T004',
                      colunas: {
              
                        IDG046:	resCarga,
                        STSITUAC:	"P"		,
                        IDS001: resultUserOcorrencia[y].IDS001OC,
                        DTVALIDA: null,
                        DTCADAST: new Date(),
                        TXVALIDA: null,		
                        IDG067: idOcorre[c],	
                        IDG012: null	
                      },
                      key: 'IdT004'
                    })
                    .then((result1) => {
                      sendOcorre[idOcorre[c]] += 1;
                      return (result1);
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });
                    }

                }else if(idOcorre[c] == 3){

                  if(calculoOcorrencia <= resultUserOcorrencia[y].PCPARAM){
                    let resOcorre =  await con.insert({
                      tabela: 'T004',
                      colunas: {
              
                        IDG046:	resCarga,
                        STSITUAC:	"P"		,
                        IDS001: resultUserOcorrencia[y].IDS001OC,
                        DTVALIDA: null,
                        DTCADAST: new Date(),
                        TXVALIDA: null,		
                        IDG067: idOcorre[c],	
                        IDG012: null	
                      },
                      key: 'IdT004'
                    })
                    .then((result1) => {
                      sendOcorre[idOcorre[c]] += 1;
                      return (result1);
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });
                  }
              }

              }
          }
          for (let w = 0; w < idOcorre.length; w++) {
            if(sendOcorre[idOcorre[w]] == 0 ){
              res.status(500);
              return {response: "Não há usuário vinculado para aprovação de ocorrências com o tipo '"+nameOcorre[idOcorre[w]]+"' - Cód.: "+ idOcorre[w]};
            }
          }
        }

      }

      //# verificação se as deliverys selecionadas ja possuem carga 4PL ativa
      if(lsNotasInseridas && tpModCar != 1){

        resultNotasComCarga = await con.execute(
          {
            sql: `select count(*) as qtd from(
                  select distinct g046.idg046 
                    from g046 g046 
                    join g048 g048 on g048.idg046 = g046.idg046
                    join g049 g049 on g049.idg048 = g048.idg048
                   where g049.idg043 in (${lsNotasInseridas.trim().substr(0, lsNotasInseridas.length -1)})
                     and g046.stcarga  <> 'C'
                     and g046.sndelete = 0
                     and g046.tpmodcar <> 1 )` ,
            param: {}
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            return result;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          if(resultNotasComCarga.length >= 1){
            if(resultNotasComCarga[0].QTD > 1){
              res.status(500);
              await con.closeRollback();
              return {response: "Carga criada anteriormente com uma ou mais deliverys selecionadas"};
            }
          }

        }


      //await con.close();
      logger.debug("Fim salvarCarga");



      // Processo para sincronização entre Logos x Evolog
      //let host = 'srvaplsl01.bravo.com.br';
      //let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/criar';

      let host = 'srvaplsl01.bravo.com.br';
      let path = '/'+ process.env.APP_ENV.toLocaleLowerCase() +'/evologos/public/evolog/logos/criar';
      let postObj = {
          'idg046' : resCarga
      };
      await con.close();
      logger.debug("path:"+path);

      // var a = await utilsCurl.curlHttpPost(host, path, postObj);
      return {response: "Carga "+resCarga+" criada com sucesso!", IDG046: resCarga};

    } catch (err) {
      //console.log(err);
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

  };



  api.validacaoDatas = async function(req,res,next){


    logger.debug("Inicio validacaoDatas");
    let con = await this.controller.getConnection(null, req.UserId);

    let idTransp = req.body.form.IDG024_CARGA.id;
    let verificaTransp = await con.execute(
      {
          sql: `
          SELECT G024.IDG024
            FROM G024 G024
          WHERE G024.SNDELETE = 0
            AND G024.IDLOGOS IS NOT NULL
            AND G024.IDG023 = 2
            AND G024.IDG024 = :id  `,
        param: {
          id: req.body.form.IDG024_CARGA.id
        }
      });

      if(verificaTransp.length <= 0){
        idTransp = 32;
      }

    var sql = ` Select G069.* 
                  From G069 G069 
                 Where G069.Stcadast = 'A'
                   And G069.SnDelete = 0
                   And G069.idg024 = ${idTransp} `;

    let resultParam = await con.execute({ sql, param: [] })
      .then((result) => {
        //con.close();
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });


    var VRPOROCU = 0;
    var DTCOLORI = new Date();
    var DTCOLATU = new Date();

    var vrOcupacao = 1;
    objParametros = resultParam;
    // var objParametros = {
    //   "HRPARADA":45,
    //   "HRTOLDIS":5,
    //   "KMCARREG":55,
    //   "KMDESCAR":60,
    //   "HRMAXENT":18,
    //   "HRMINENT":8
    // };

    //   HRPARADA:     [45], //MINUTOS A CONSIDERAR EM CADA PARADA PARA CALCULO DE DISTANCIA
    //   HRTOLDIS:     [5],  //MINUTOS A CONSIDERAR POR TONELADA EM CADA PARADA PARA CÁLCULO DE DISTÂNCIA
    //   KMCARREG:     [55], //KM/H A CONSIDERAR NO CÁLCULO DE DISTÂNCIA PARA VEÍCULOS CARREGADOS
    //   KMDESCAR:     [60], //KM/H A CONSIDERAR NO CÁLCULO DE DISTÂNCIA PARA VEÍCULOS DESCARREGADOS
    //   HRMAXENT:     [18], //HORÁRIO MÁXIMO PERMITIDO PARA ENTREGA
    //   HRMINENT:     [8]   //ENTREGAS PERMITIDA SOMENTE APÓS AS

    //# ocupacao
    if(req.body.form.IDG030 != null){
      if(req.body.form.IDG030.qtcappes != undefined){
        vrOcupacao = req.body.form.IDG030.qtcappes;
      }

      VRPOROCU = ((req.body.form.PSCARGA * 100)/ vrOcupacao);

      req.body.form.VRPOROCU = Math.round(VRPOROCU);

    }else{
      req.body.form.VRPOROCU = 0;
    }

    var date = req.body.form.DTPRESAI.date;

    //# datacoleta
    req.body.form.DTCOLORI = new Date(date.year,date.month-1,date.day);
    req.body.form.DTCOLATU = new Date(date.year,date.month-1,date.day);

    var kmAux = 0;
    var tempoTotal;
    var data = null;


    var Moment = require('moment');
    //var moment = require('moment-timezone');
    Moment.locale('pt-BR');
    var MomentRange = require('moment-range');
    var moment = MomentRange.extendMoment(Moment);

    data = moment({ year: req.body.form.DTPRESAI.date.year, month: (req.body.form.DTPRESAI.date.month - 1), day: req.body.form.DTPRESAI.date.day,
                        hour: req.body.form.DTPRESAIH.hour, minute: req.body.form.DTPRESAIH.minute });

    var dtinietaAux = null;
    var dtfinetaAux = null;
    var sqlDias     = null;
    
    //# dt
    for (let i = 0; i < req.body.grid.length; i++) {
      
      req.body.grid[i].DTINIETA = data.toDate(); /*Início da etapa*/

      if(i==0){
        dtinietaAux = data.toDate();
      }

      var dataAuxDia = data;
      var kmDistancia = (req.body.grid[i].DISTANCE / 1000);
      var tempoPorPesoParada  = (req.body.grid[i].PSBRUTO / 1000) * objParametros.HRTOLDIS;
      var tempo       = ((60 * kmDistancia)/objParametros.KMCARREG);

      data.add(tempo, 'minutes');
      data.add(tempoPorPesoParada, 'minutes');

      var tempoEtapa = tempo/780; //(13 horas ou 780 minutos)
      if(tempoEtapa.toFixed(0) > 0){

        //# Adiciona pernoite, 11 horas
        data.add(((tempoEtapa * 11) * 60), 'minutes');

        //# Adiciona horario de almoço, 1 hora
        data.add(((tempoEtapa * 1) * 60), 'minutes');

      }

      while(data.hours() >= 18 || data.hours() < 8){
        data.add(1, 'minutes');
      }

      //# Previsões G048
      var dataAuxPrev = null;
      dataAuxPrev     = data;
      dataAuxPrev     = await utilsCurl.addDiasUteis(dataAuxPrev.toDate(), 0, req.body.grid[i].IDG003DE);
      req.body.grid[i].DTPREORI = dataAuxPrev.toDate();
      req.body.grid[i].DTPREATU = dataAuxPrev.toDate();

      //# Adiciona tempo descarregamento 45 min
      data.add(objParametros.HRPARADA, 'minutes');

      data   = await utilsCurl.addDiasUteis(data.toDate(), 0, req.body.grid[i].IDG003DE);
      
      req.body.grid[i].DTFINETA = data.toDate(); /*Fim da etapa*/

      if(i == (req.body.grid.length - 1)){
        dtfinetaAux =  data.toDate();
      }

      var x = moment({ year: 2020, month: 1, day: 1,
        hour: 0, minute: 0 });
      x.add(tempo + tempoPorPesoParada, 'minutes');
      req.body.grid[i].QTTEMPKM = x; /*TEMPO EM MINUTOS*/

    }

    var fin = moment(dtfinetaAux).format('DD/MM/YYYY');
    var ini = moment(dtinietaAux).format('DD/MM/YYYY');
    var qtdDias = moment(fin,'DD/MM/YYYY').diff(moment(ini,'DD/MM/YYYY'),'days');
    if(qtdDias > 4){
      req.body.form.ALEDTENT = 0;
    }else{
      req.body.form.ALEDTENT = 1;
    }
    con.close();
    return req.body;

}

  /**
	 * @description Retorna um array caso exista dados relacionados as cargas que estão tentando ser inclusas
	 * @author Ítalo Andrade Oliveira
	 * @since 20/08/2018
	 *
	 * @async
	 * @function buscaCargasAntesInserir
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */

  api.buscaCargasAntesInserir = async function (req, res, next) {
    let sql = `SELECT 
                G049.IDG043,
                G049.IDG051,
                G046.SNDELETE AS G046_SNDELETE,
                G046.STCARGA AS G046_STCARGA,
                G051.CDCTRC AS G051_CDCTRC
              FROM G049 G049
                INNER JOIN G048 G048 ON
                  G049.IDG048 = G048.IDG048
                INNER JOIN G046 G046 ON
                  G048.IDG046 = G046.IDG046
                LEFT JOIN G051 G051 ON
                  G049.IDG051 = G051.IDG051
              WHERE
                G046.SNDELETE = 0 AND 
                `;
    let where = ``;
    if (req.body.arrIDG043ver.length > 0 && req.body.arrIDG051ver.length > 0) {
      where = `G049.IDG043 IN (${req.body.arrIDG043ver})
        OR G049.IDG051 IN (${req.body.arrIDG051ver})`
    } else {
      where = req.body.arrIDG043ver.length > 0 ? `G049.IDG043 IN (${req.body.arrIDG043ver})` : `G049.IDG051 IN (${req.body.arrIDG051ver})`;
    }

    return await db.execute({
      sql: sql + where,
      param: []
    })
      .then(result => {
        return result;
      })
      .catch(err => {
        //await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

  }




  api.salvarReprocessarCarga = async function (req, res, next) {
    
    logger.debug("Inicio salvarReprocessarCarga");
    let con = await this.controller.getConnection(null, req.UserId);

    try {


      var objCarga = req.body.grid;
      var idCarga = req.body.idg046;
      var deliveryNew = req.body.new;
      var arG043 = "";
      var sql = '';

      for (let i = 0; i < req.body.grid.length; i++) {
        arG043 = arG043 + req.body.grid[i].IDG043 + ",";
      }

      arG043 = arG043.substr(0, arG043.length-1);




      let deliveriesValores = await con.execute(
        {
          sql: ` select sum(G043.Psbruto) As Psbruto,
                        sum(G043.Vrvolume) As Vrvolume,
                        sum(G043.vrdelive) as vrdelive     
                   from g043 g043 where idg043 in (${arG043}) ` ,
          param: {}
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result[0];
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });




      sql = `  UPDATE G046
                  SET PSCARGA = ${deliveriesValores.PSBRUTO},
                      VRCARGA = ${deliveriesValores.VRDELIVE}
                WHERE IDG046 in (${idCarga}) `;

      let resCarga = await con.execute({ sql, param: [] })
      .then((result) => {
        logger.debug("Retorno:", result);
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });


      
      let deliveries = await con.execute(
        {
          sql: `select x.* from (
            select (SELECT LISTAGG(G043B.idg043, ',') WITHIN GROUP(ORDER BY G043B.idg043)
                      From G043 G043B
                     Where G043B.Idg005re = G043.Idg005re
                       And nvl(G043B.Idg005rc, G043B.Idg005de) = nvl(G043.Idg005rc, G043.Idg005de)
                       And Idg043 In (${arG043})) As idsg043
              from g043 g043
             where g043.idg043 in (${arG043})
             Group By g043.Idg005re, g043.Idg005rc, g043.Idg005de
             ) x ` ,
          param: {}
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        for (let j = 0; j < deliveries.length; j++) {
          let parada = await con.execute(
            {
              sql: `select g048.idg048, 
                           sum(G043.Psbruto) As Psbruto,
                           sum(G043.Vrvolume) As Vrvolume
                      from g048 g048
                      join g049 g049
                        on g049.idg048 = g048.idg048
                       and g049.idg043 in (${deliveries[j].IDSG043})
                      join g043 g043
                        on g049.idg043 = g043.idg043
                  Group By g048.idg048 ` ,
              param: {}
            })
            .then((result) => {
              logger.debug("Retorno:", result);
              return result[0];
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });


            deliverySplit=deliveries[j].IDSG043.split(',');

            for (let k = 0; k < deliverySplit.length; k++) {
            
              for (let m = 0; m < deliveryNew.length; m++) {
                const element = deliveryNew[m];
              
                if(deliverySplit[k] == deliveryNew[m].IDG043){
                  console.log(deliverySplit[k], deliveryNew[m].IDG043);
                  let resDocParadas =  await con.insert({
                    tabela: 'G049',
                    colunas: {
      
                      IDG043	: deliverySplit[k],  /*Delivery*/
                      IDG048  : parada.IDG048,  /*Etapa da carga*/
                      NRORDEM : k, /*Ordem de entrega delivery*/
                      IDG051  : null,  /*CTE*/
      
                    },
                    key: 'IDG049'
                  })
                    .then((result1) => {
                      return (result1);
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });


                    sql = `  UPDATE G043
                                SET STETAPA = 3
                              WHERE IDG043 in (${deliverySplit[k]}) `;

                    let resDelivery = await con.execute({ sql, param: [] })
                    .then((result) => {
                      logger.debug("Retorno:", result);
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });

                }
              }
            }

            sql = `  UPDATE G048
                        SET PSDELETA = ${parada.PSBRUTO},
                            QTVOLCAR = ${parada.VRVOLUME},
                            STINTCLI = 0
                      WHERE IDG046 in (${parada.IDG048}) `;

            let resCarga = await con.execute({ sql, param: [] })
            .then((result) => {
              logger.debug("Retorno:", result);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });


        }


      
      await con.close();
      logger.debug("Fim salvarReprocessarCarga");

      return { response: "Inclusão concluida com sucesso " };

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }

	};

    /**
   * @description Traz o armazem de coleta associado a uma transportadora
   *
   * @async
   * @function api/tp/montagemCarga/getArmazemColeta
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  
  api.getArmazemColeta = async function (req, res, next) {

    logger.debug("Inicio get Armazem Coleta");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G084',false);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select G084.IDG024,
                        G084.IDG028 as id,
                        G028.nmarmaze as text
                   From G084 G084
                   Join G024 G024 ON G024.IDG024 = G084.IDG024
                   Join G028 G028 ON G028.IDG028 = G084.IDG028 `+
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
      logger.debug("Fim get Armazem Coleta");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
  * @description Sugere um tipo de veiculo baseado no peso bruto da carga.
  *
  * @async
  * @function api/tp/montagemCarga/getCapacidadePeso
  * @param {request} req - Possui as requisições para a função.
  * @param {response} res - A resposta gerada na função.
  * @param {next} next - Caso haja algum erro na rota.
  * @return {JSON} Retorna um objeto JSON.
  * @throws Caso falso, o número do log de erro aparecerá no console.
  */
    
  api.getCapacidadePeso = async function (req, res, next) {

    logger.debug("Inicio get Capacidade de peso");

    let snOferece = 'I';
    let con = await this.controller.getConnection(null, req.UserId);

    if(req.body.SIMNAOOFERECE != undefined && req.body.SIMNAOOFERECE != null){
      snOferece = req.body.SIMNAOOFERECE;
      //# A - Sim
      //# I - Não
    }

    try {

      if(snOferece == 'A'){

      logger.debug("Parametros recebidos:", req.body);
      
      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G030',true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      
      sqlOrder = ' order by G030.QTCAPPES asc';
      
      let result = await con.execute(
        {
        sql: `
               SELECT G030.IDG030 as id,
                      G030.DSTIPVEI as text,
                      G030.Qtcappes, 
                      G030.Pcpesmin, 
                      G030.Idg030, 
                      G030.PCMIN4PL		
                 FROM G030 G030
           INNER JOIN I011 ON I011.IDG030 = G030.IDG030 `+
              sqlWhere + ` 
                  AND I011.SNDELETE = 0               
                  AND G030.SNDELETE = 0
                  AND G030.QTCAPPES >= ${req.body.pesoBruto}` +
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
        logger.debug("Fim get Capacidade Peso");
        return result;

      }else{

        logger.debug("Parametros recebidos:", req.body);

        var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G030',true);
        
        logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
        
        
        sqlOrder = ' order by G030.QTCAPPES asc';
        let result = await con.execute(
          {
            sql: ` Select G030.IDG030 as id,
                          G030.DSTIPVEI as text,
                          G030.Qtcappes, 
                          G030.Pcpesmin, 
                          G030.Idg030, 
                          G030.PCMIN4PL	
                     From G030 G030 `+
                      sqlWhere + ` and G030.QTCAPPES >= ${req.body.pesoBruto} ` +
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
        logger.debug("Fim get Capacidade Peso");
        return result;
          
      }   
    } catch (err) {
    
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  }


  api.recalculoPrazoEntrega = async function(req,res,next){
    var utils = app.src.utils.Utils;
    logger.debug("Inicio validacaoDatas");
    let con = await this.controller.getConnection(null, req.UserId);

    var Moment = require('moment');
    Moment.locale('pt-BR');
    var MomentRange = require('moment-range');
    var moment = MomentRange.extendMoment(Moment);

    let cargasObj = await con.execute(
      {
        sql: `
          select distinct g046.*
            from g046 g046
            join g048 g048
              on g048.idg046 = g046.idg046
            join g049 g049
              on g049.idg048 = g048.idg048
            join g051 g051
              on g049.idg051 = g051.idg051
            join g043 g043
              on g043.idg043 = g049.idg043
            join g024 g024
              on g024.idg024 = g046.idg024
           where g046.sndelete = 0
             and g024.sndelete = 0
             and g024.idlogos is not null
             and g024.idg023 = 2
             and g046.stcarga = 'T'  
             and g046.idg046 = 1037182
             and g043.dtentreg is null
        order by g046.idg046 desc`,
        param: []
      });

    for (let j = 0; j < cargasObj.length; j++) {

      let idTransp = cargasObj[j].IDG024;
      let verificaTransp = await con.execute(
        {
          sql: `
            SELECT G024.IDG024
              FROM G024 G024
            WHERE G024.SNDELETE = 0
              AND G024.IDLOGOS IS NOT NULL
              AND G024.IDG023 = 2
              AND G024.IDG024 = :id  `,
          param: {
            id: cargasObj[j].IDG024
          }
        });

      if(verificaTransp.length <= 0){
        idTransp = 32;
      }

      var sql = `Select G069.* 
                   From G069 G069 
                  Where G069.Stcadast = 'A'
                    And G069.SnDelete = 0
                    And G069.idg024   = ${idTransp} `;

      let resultParam = await con.execute({ sql, param: [] })
      .then((result) => {
        //con.close();
        return result[0];
      })
      .catch((err) => {
        con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });


      objParametros = resultParam;

      //   HRPARADA:     [45], //MINUTOS A CONSIDERAR EM CADA PARADA PARA CALCULO DE DISTANCIA
      //   HRTOLDIS:     [5],  //MINUTOS A CONSIDERAR POR TONELADA EM CADA PARADA PARA CÁLCULO DE DISTÂNCIA
      //   KMCARREG:     [55], //KM/H A CONSIDERAR NO CÁLCULO DE DISTÂNCIA PARA VEÍCULOS CARREGADOS
      //   KMDESCAR:     [60], //KM/H A CONSIDERAR NO CÁLCULO DE DISTÂNCIA PARA VEÍCULOS DESCARREGADOS
      //   HRMAXENT:     [18], //HORÁRIO MÁXIMO PERMITIDO PARA ENTREGA
      //   HRMINENT:     [8]   //ENTREGAS PERMITIDA SOMENTE APÓS AS
  
      //# ocupacao
  
      var data = null;
      dataAux = new Date();

      data = moment({ year: dataAux.getFullYear(), 
                     month: dataAux.getMonth(), 
                       day: dataAux.getDate(),
                      hour: dataAux.getHours(), 
                    minute: dataAux.getMinutes() });
  
      var dtinietaAux = null;
      var dtfinetaAux = null;

      let entregasObj = await con.execute(
        {
          sql: `
          select distinct 
                 g046.*, 
                 g048.*, 
                 g051.IDG005rc,
                 (SELECT * FROM (SELECT G060.NRLATITU || ',' || G060.NRLONGIT AS LATLONG FROM G060 G060 WHERE G060.IDG043 = G043.IDG043 ORDER BY G060.IDG060 DESC) WHERE ROWNUM <=1) AS LATLONGOR,
                 nvl(G005.NRLATITU, G003.NRLATITU) || ',' || nvl(G005.NRLONGIT,G003.NRLONGIT) AS LATLONGDE,
                 G024.NRLATITU || ',' || G024.NRLONGIT AS LATLONGTR,
                 G028.NRLATITU || ',' || G028.NRLONGIT AS LATLONGAR,
                 (select listagg(REPLACE(a.idg043, '-'), ',') within group(order by a.idg043)
                 from g043 a
                 join g049 b
                   on b.idg043 = a.idg043
                 join g048 c
                   on c.idg048 = b.idg048
                where c.idg048 = g048.idg048) as idg043s
            from g046 g046
            join g048 g048
              on g048.idg046 = g046.idg046
            join g049 g049
              on g049.idg048 = g048.idg048
            join g051 g051
              on g049.idg051 = g051.idg051
            join g043 g043
              on g043.idg043 = g049.idg043
            JOIN G005 G005 
              ON G005.IDG005 = g051.IDG005rc
            JOIN G003 G003 
              ON G003.IDG003 = G005.IDG003
            JOIN G024 G024 
              ON G024.IDG024 = G046.IDG024
            JOIN G028 G028 
              ON G028.IDG028 = G046.IDG028
           where g046.sndelete = 0
             and g046.stcarga = 'T'
             AND G043.DTENTREG IS NULL
             AND g046.idg046 = :id
           order by g046.idg046, g048.nrseqeta`,
          param: {
            id: cargasObj[j].IDG046
          }
        });

      //# dt
      var countParada = 0;
      var clientParada = null;
      for (let i = 0; i < entregasObj.length; i++) {
        countParada  = countParada+1;

        if(i==0){
          dtinietaAux = data.toDate();
        }
        if(countParada == 1){

          var latLongAux = "";

          if(entregasObj[i].LATLONGOR != null){
            latLongAux = entregasObj[i].LATLONGOR;
          }else{
            latLongAux = entregasObj[i].LATLONGAR;
          }
          //latLongAux
          var kmDistancia  = await utils.calcularDistancia(latLongAux, entregasObj[i].LATLONGDE);
          
        }else{
          var kmDistancia = (entregasObj[i].QTDISPER / 1000);
        }

        var tempoPorPesoParada  = (entregasObj[i].PSDELETA / 1000) * objParametros.HRTOLDIS;
        var tempo       = ((60 * kmDistancia )/objParametros.KMCARREG);

        /*
        var tempoTotal = tempo+tempoPorPesoParada;
        
        while(tempoTotal >= 1){
          data.add(1, 'minutes');

          if(data.hours() >= 18){
            data.add((11 * 60), 'minutes');
            while(data.hours() >= 18 || data.hours() < 6){
              data.add(1, 'minutes');
            }
          }
          tempoTotal = (tempoTotal - 1);
        }

        while(data.hours() < 8){
          data.add(1, 'minutes');
        }

        if(clientParada != entregasObj[i].IDG005RC){
          //# Adiciona tempo descarregamento 45 min
          data.add(objParametros.HRPARADA, 'minutes');
        }

        data.add(tempoPorPesoParada, 'minutes');

        data   = await utilsCurl.addDiasUteis(data.toDate(), 0, entregasObj[i].IDG003DE);
        */


        /* //###################################################### */
        data.add(tempo, 'minutes');

        var tempoEtapa = tempo/780; //(13 horas ou 780 minutos)
        //var tempoEtapa = tempo/600; //(10 horas ou 600 minutos)
        if(tempoEtapa.toFixed(0) > 0){

          //for (let k = 0; k < tempoEtapa.toFixed(0); k++) {

            //# Adiciona pernoite, 11 horas
            data.add(((tempoEtapa * 11) * 60), 'minutes');

            //# Adiciona horario de almoço, 1 hora
            data.add(((tempoEtapa * 1) * 60), 'minutes');
            
          //}
        }
        
        while(data.hours() >= 18 || data.hours() < 8){
          data.add(1, 'minutes');
        }



        data   = await utilsCurl.addDiasUteis(data.toDate(), 0, entregasObj[i].IDG003DE);
        

        //####################################################
        //# Itens para verificar:
        //# - Quais colunas salvar esse recaulculo?
        //# - para quais cargas vão ser feito esse recalculo?
        //# - Testar OK
        //####################################################
        
        // let resUpdateEntrega = await
        // con.update({
        //   tabela: 'G048',
        //   colunas: {
        //     DTPREATU: new Date(data)
        //   },
        //   condicoes: ` IDG048 in (`+entregasObj[i].IDG048+`)`
        // })
        //   .then((result1) => {
        //   logger.debug("Retorno:", result1);
        // })
        // .catch((err) => {
        //   err.stack = new Error().stack + `\r\n` + err.stack;
        //   logger.error("Erro:", err);
        //   throw err;
        // });


        var a = null;
        //var x = moment({ year: 2020, month: 1, day: 1, hour: 0, minute: 0 });
        //x.add(tempo + tempoPorPesoParada, 'minutes');
        //entregasObj[i].QTTEMPKM = x; /*TEMPO EM MINUTOS*/

        if(clientParada != entregasObj[i].IDG005RC && entregasObj.length > 1){
          //# Adiciona tempo descarregamento 45 min
          data.add(objParametros.HRPARADA, 'minutes');
          data.add(tempoPorPesoParada, 'minutes');
        }

        clientParada = entregasObj[i].IDG005RC;
      }

    }

    con.close();
    return entregasObj;
  }

  return api;
};
