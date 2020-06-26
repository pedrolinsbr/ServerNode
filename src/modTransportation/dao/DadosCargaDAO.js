module.exports = function (app) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var utilsCurl  = app.src.utils.Utils;

    api.controller = app.config.ControllerBD;

    api.getInformacoesCargaSemAcl = async function (req, res, next) {

     

        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G046_IDG046: req.body.IDG046, tableName: "G046" }, false);

        try {
            let result = await con.execute(
                {
                    sql: `
           Select
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
                G046.SNMOBILE,
                G046.Dtcarga,
                G046.Dtsaicar,
                G046.Dtpresai,
                G046.Dtpsmanu,
                G046.Pscarga,
                G046.Vrcarga,
                G046.Ids001,
                G046.Sndelete,
                G046.Qtvolcar,
                G046.Tpcarga,
                G046.Qtdisper,
                G046.Vrporocu,
                G046.VRPERCAR,
                G046.Idg030,
                G046.Dtagenda,
                G046.Stcarga,
                G046.Stintcli,
                G046.Sncarpar,
                G046.Obcancel,
                G046.Ids001ca,
                G046.Dtcancel,
                G046.Snurgent,
                G028.Nmarmaze || ' [ ' || G046.Idg028 || ' ] ' as Idg028,
                G046.Dtcolori,
                G046.Dtcolatu,
                G046.Tporigem,
                G046.Stenvlog,
                G046.TpTransp,
                G046.TpModCar,
                G024.Nmtransp,
                S001.Nmusuari,
                G030.Dstipvei,
                G046.IDCARLOG,
                G046.DTINIVIA,
                G046.DTFIMVIA,

                

                (select H006.IDG031 || ' - ' || G031.Nmmotori  from H006 H006
                join G031 G031 on G031.idG031 = H006.IDG031
                where H006.IDG046 = G046.IDG046 and rownum <= 1)As DSIDG031Hm1,

                (select H006.IDG032 || ' - ' || G032.Dsveicul  from H006 H006
                join G032 G032 on G032.NRPLAVEI = H006.NRPLAVEI
                where H006.IDG046 = G046.IDG046 and rownum <= 1)As DSIDG032HV1,


								(
									select
									nvl(G005DE.NRLATITU, G003DE.NRLATITU) || ',' ||
									nvl(G005DE.NRLONGIT, G003DE.NRLONGIT) As DESTINO
									
									 from g046 g046x
								 
									 Join G048 G048DE
										 On (G048DE.IDG046 = G046x.IDG046 And
												G048DE.NRSEQETA =
												(Select Max(G048DE_2.NRSEQETA)
														From G048 G048DE_2
													 Where G048DE_2.IDG046 = G048DE.IDG046))
								 
									 Join G005 G005DE
										 On (G005DE.IDG005 = G048DE.IDG005DE)
									 Join G003 G003DE
										 On (G003DE.IDG003 = G005DE.IDG003)
								 
									where g046x.idg046 = g046.idg046
										and g046x.idg024 is not null

								) as destino,


								(
									select
									nvl(g003.NRLATITU, g003.NRLATITU) || ',' ||
									nvl(g003.NRLONGIT, g003.NRLONGIT) As ORIGEM
									 from g046 g046x
									 join g024 g024x
										 on g024x.idg024 = g046x.idg024
									 join g003 g003
										 on g003.idg003 = g024x.idg003
									where g046x.idg046 = g046.idg046
										and g046x.idg024 is not null

								) as origem,

								g046.qtdisbas,
								'' as QTDISTOT,


                S001ca.Nmusuari As Nmusuarica,
                G031m1.Nmmotori As Nmmotori1,
                G031m2.Nmmotori As Nmmotori2,
                G031m3.Nmmotori As Nmmotori3,
                G032v1.Dsveicul As Dsveiculv1,
                G032v2.Dsveicul As Dsveiculv2,
                G032v3.Dsveicul As Dsveiculv3,

                Count(G046.Idg046) Over() As Count_Linha
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
            ` + sqlWhere ,

                    param: bindValues
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if(result.length > 0){
              for (let j = 0; j < result.length; j++) {
                if(result[j].ORIGEM != null && result[j].DESTINO != null){
                  result[j].QTDISBAS = await utilsCurl.calcularDistancia(result[j].ORIGEM, result[j].DESTINO);
                }
                result[j].QTDISTOT = result[j].QTDISBAS + result[j].QTDISPER;
              }
            }

            await con.close();
            return result[0];
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.getParadasFromCargaSemAcl = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ G048_IDG046: req.body.IDG046, tableName: "G048" }, false);


        try {
            let result = await con.execute(
                {
                    sql: `
          Select  distinct G048.NRSEQETA,
                  G048.PSDELETA,
                  G048.QTDISPER,
                  G048.IDG005OR,
                  G048.IDG005DE,
                  G005OR.RSCLIENT AS RSCLIENTOR,
                  G005OR.CJCLIENT AS CJCLIENTOR,
                  G003OR.NMCIDADE || ' - ' || G002OR.CDESTADO As NMCIDADEOR,
                  G002OR.CDESTADO AS CDESTADOOR,
                  G005DE.RSCLIENT AS RSCLIENTDE,
                  G005DE.CJCLIENT AS CJCLIENTDE,

                  nvl(G005OR.NRLONGIT,G003OR.NRLONGIT) AS NRLONGITOR,
                  nvl(G005OR.NRLATITU,G003OR.NRLATITU) AS NRLATITUOR,

                  nvl(G005DE.NRLONGIT,G003DE.NRLONGIT) AS NRLONGITDE,
                  nvl(G005DE.NRLATITU,G003DE.NRLATITU) AS NRLATITUDE,

                  G003DE.NRLONGIT AS NRLONGITCI,
                  G003DE.NRLATITU AS NRLATITUCI,

                  (select min(G043.DTENTREG) from G043 G043
                    join G049 G049 On G049.IDG043 = G043.IDG043
                   where G049.IDG048 = G048.IDG048) As dtentregparad,

                   (select min(G043.DTENTMOB) from G043 G043
                   join G049 G049 On G049.IDG043 = G043.IDG043
                  where G049.IDG048 = G048.IDG048) As dtentmobparad,

                  G048.DTENTMOB as dtentcroparad,

                  G003DE.NMCIDADE || ' - ' || G002DE.CDESTADO As NMCIDADEDE,
                  G048.IDG048,
                  G048.IDG024,
                  G024.NMTRANSP,
                  G024.CJTRANSP,
                  G024.IETRANSP,
                  G024EM.IDLOGOS,

                  G024.NRLATITU AS NRLATITUTR, 
                  G024.NRLONGIT AS NRLONGITTR,
                  
                  G024EM.NRLATITU AS NRLATITUEM, 
                  G024EM.NRLONGIT AS NRLONGITEM,

                  0 As SELECTED
              From G048 G048
              Join G005 G005DE
                On (G005DE.IDG005 = G048.IDG005DE)
              Join G003 G003DE
                On (G005DE.IDG003 = G003DE.IDG003)
              Join G002 G002DE
                On (G002DE.IDG002 = G003DE.IDG002)
              Join G005 G005OR
                On (G005OR.IDG005 = G048.IDG005OR)
              Join G003 G003OR
                On (G005OR.IDG003 = G003OR.IDG003)
              Join G002 G002OR
                On (G002OR.IDG002 = G003OR.IDG002)
         Left Join G046 G046 
                On G046.IDG046 = G048.IDG046
         Left Join G024 G024 
                On G024.IDG024 = G046.IDG024
         Left Join G024 G024EM 
                On G024EM.IDg024 = G048.IDg024
               
              ` + sqlWhere + ` ORDER BY G048.IDG048 `,
                    param: bindValues
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


    api.getInformacoesCTeSemAcl = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere(
            {
                G051_IDG051: req.body.IDG051,
                G049_IDG048: req.body.IDG048, tableName: "G052"
            }, false);

        try {
            let result = await con.execute(
                {
                    sql: `
       Select Distinct G052.IDG051, /* IDG051 */
              /*G052.IDG043,  Identificador da Nota */
              G005RE.NMCLIENT As NMCLIENTRE, /* Nome do Remetente */
              G005RE.CJCLIENT As CJCLIENTRE, /* CNPJ do Remetente */
              G005DE.NMCLIENT As NMCLIENTDE, /* Nome do Destinatário */
              G005DE.CJCLIENT As CJCLIENTDE, /* CNPJ do Destinatário */
              G005RC.NMCLIENT As NMCLIENTRC, /* Nome do Recebedor */
              G005RC.CJCLIENT As CJCLIENTRC, /* CNPJ do Recebedor */
              G005EX.NMCLIENT As NMCLIENTEX, /* Nome do Expedidor */
              G005EX.CJCLIENT As CJCLIENTEX, /* CNPJ do Expedidor */
              G005CO.NMCLIENT As NMCLIENTCO, /* Nome do Tomador */
              G005CO.CJCLIENT As CJCLIENTCO, /* CNPJ do Tomador */
               
              (select min(G043.DTENTREG) from G043 G043
              join G049 G049 On G049.IDG043 = G043.IDG043
              where G043.IDG043 = G052.IDG043) As dtentregcte, /* Data de Entrega Cte */

              (select min(G043.DTENTMOB) from G043 G043
              join G049 G049 On G049.IDG043 = G043.IDG043
              where G043.IDG043 = G052.IDG043) As dtentMOBcte, /* Data de Entrega mobile Cte */

              FN_DATA_SLA(g051.idg051) AS dtentconcte,

              (select min(G043.DTENTCON) from G043 G043
              join G049 G049 On G049.IDG043 = G043.IDG043
              where G043.IDG043 = G052.IDG043) As DTSLACTE, /* Data de Entrega contratual Cte */


              G051.NRCHADOC, /* Chave do CT-e */
              G051.CDCTRC, /* Número do CTE */
              G051.NRSERINF, /* Número de Serie Nota Fiscal */
              G051.DSMODENF, /* Modelo da Nota Fiscal */
              G051.DTEMICTR, /* Data de Emissão do Controle */
              G051.VRMERCAD, /* Valor da Mercadoria */
              G051.DSINFCPL, /* Observação do Conhecimento */
              0 As SELECTED
          From G052 G052
          Join G051 G051
            On (G051.IDG051 = G052.IDG051)
          Join G005 G005RE
            On (G005RE.IDG005 = G051.IDG005RE)
          Left Join G005 G005DE
            On (G005DE.IDG005 = G051.IDG005DE)
          Left Join G005 G005RC
            On (G005RC.IDG005 = G051.IDG005RC)
          Left Join G005 G005EX
            On (G005EX.IDG005 = G051.IDG005EX)
          Left Join G005 G005CO
            On (G005CO.IDG005 = G051.IDG005CO)
          Left Join G049 G049
            On (G049.IDG051 = G051.IDG051)
          ` + sqlWhere ,
                    param: bindValues
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


    api.getInformacoesNotaFiscalSemAcl = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, tableName: "G043" }, false);

        // let sqlWhereAcl = await acl.montar({
        //   ids001: req.UserId,
        //   dsmodulo: "monitoria",
        //   nmtabela: [{
        //     G014: 'G014'
        //   }],
        //   esoperad: 'And'
        // });

        try {
            let result = await con.execute(
                {
                    sql: `
       Select Distinct G043.IDG043,
              NVL(NVL(G043.NRNOTA,G083.NRNOTA), 0) AS NRNOTA, /* Número da Nota */
              NVL(G043.DTEMINOT,G083.DTEMINOT) AS DTEMINOT, /* Data Emissão */
              NVL(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC, /* Chave de Acesso */
              NVL(G043.DSMODENF,G083.DSMODENF) AS DSMODENF, /* Modelo da Nota */
              NVL(G043.NRSERINF,G083.NRSERINF) AS NRSERINF, /* Serie da Nota */
              G043.TPDELIVE, /* Tipo da Nota */
              NVL(G043.PSBRUTO,G083.PSBRUTO) AS PSBRUTO, /* Peso Bruto */
              NVL(G043.PSLIQUID,G083.PSLIQUID) AS PSLIQUID, /* Peso Liquido */
              G051.CDCTRC, /* Número do CTE */
              G051.DTEMICTR, /* Data de Emissão do CTE */
              NVL(G043.DTENTREG,G083.DTENTREG) AS DTENTREG, /* Data de Entrega*/
              G043.DTENTMOB AS DTENTMOB, /* Data de Entrega Mobile*/

              FN_DATA_SLA(g051.idg051) AS DTSLA,

              (select min(G043.DTENTCON) from G043 G043
              join G049 G049 On G049.IDG043 = G043.IDG043
              where G043.IDG043 = G052.IDG043) As dtentconcte, /* Data de Entrega contratual Cte */

              Nvl(G005RE.RSCLIENT,G005RE.NMCLIENT) As NMCLIENTRE, /* Emissor */
              G005RE.CJCLIENT As CJCLIENTRE, /* CNPJ Emissor */
              G005RE.IECLIENT As IECLIENTRE, /* Inscrição Estadual */
              G003RE.NMCIDADE As NMCIDADERE,
              G002RE.CDESTADO As CDESTADORE, /* Estado  */
              Nvl(G005DE.RSCLIENT,G005DE.NMCLIENT) As NMCLIENTDE, /* Destino */
              G005DE.CJCLIENT As CJCLIENTDE, /* CNPJ Destinatário */
              G005DE.IECLIENT As IECLIENTDE, /* Inscrição Estadual */
              G003DE.NMCIDADE As NMCIDADEDE,
              G002DE.CDESTADO As CDESTADODE, /* Estado */
              G024.NMTRANSP AS NMTRANSP, /* Transportadora */
              G024.CJTRANSP AS CJTRANSP, /* CNPJ da Transportadora */
              NVl(G043.DSINFCPL,G083.DSINFCPL) AS DSINFCPL, /* Observação da Nota Fiscal */
              G043.SNAG, /* Indicador de AG */
              G051.IDG051
        From G043 G043
        Left Join G083 G083 
          On (G043.IDG043 = G083.IDG043)
        Left Join G005 G005RE
          On (G005RE.IDG005 = G043.IDG005RE)
        Left Join G003 G003RE
          On (G003RE.IDG003 = G005RE.IdG003)
        Left Join G002 G002RE
          On (G002RE.IDG002 = G003RE.IdG002)
        Left Join G005 G005DE
          On (G005DE.IDG005 = G043.IDG005DE)
        Left Join G003 G003DE
          On (G003DE.IDG003 = G005DE.IdG003)
        Left Join G002 G002DE
          On (G002DE.IDG002 = G003DE.IdG002)
        Left Join G052 G052
          On (G052.IDG043 = G043.IDG043)
        Left Join G051 G051
          On (G052.IDG051 = G051.IDG051)
        Left Join G022 G022
          On (G022.IdG005 = G051.IdG005CO)
        Left Join G014 G014
          On (G014.IdG014 = G022.IdG014)
        Left Join G024 G024
          On (G051.IDG024 = G024.IDG024)
        ` + sqlWhere,
                    param: bindValues
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
            logger.error("Erro:", err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.getInformacoesNotaFiscalFromParadaSemAcl = async function (req, res, next) {
		let con = await this.controller.getConnection(null, req.UserId);

    var [sqlWhere,bindValues] = utils.buildWhere({IDG043:req.body.IDG043, G051_IDG051: req.body.IDG051, G049_IDG048: req.body.IDG048, tableName:"G043"},false);

    // let sqlWhereAcl = await acl.montar({
    //   ids001: req.UserId,
    //   dsmodulo: "monitoria",
    //   nmtabela: [{
    //     G014: 'G014'
    //   }],
    //   esoperad: 'And'
    // });

		try {
			let result = await con.execute(
				{
					sql: `
           Select Distinct G043.IDG043,
                  NVL(NVL(G043.NRNOTA,G083.NRNOTA), 0) AS NRNOTA, /* Número da Nota */
                  G043.CDDELIVE,
                  G043.DTENTREG,
                  G043.DTENTMOB,
                  NVL(G043.DTEMINOT,G083.DTEMINOT) AS DTEMINOT, /* Data Emissão */
                  NVL(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC,  /* Chave de Acesso */
                  NVL(G043.DSMODENF,G083.DSMODENF) AS DSMODENF, /* Modelo da Nota */
                  NVL(G043.NRSERINF,G083.NRSERINF) AS NRSERINF, /* Serie da Nota */
                  G043.TPDELIVE, /* Tipo da Nota */
                  NVL(G043.PSBRUTO,G083.PSBRUTO) AS PSBRUTO, /* Peso Bruto */
                  NVL(G043.PSLIQUID,G083.PSLIQUID) AS PSLIQUID, /* Peso Liquido */
                  G051.CDCTRC, /* Número do CTE */
                  G051.DTEMICTR, /* Data de Emissão do CTE */
                  Nvl(G005RE.RSCLIENT,G005RE.NMCLIENT) As NMCLIENTRE, /* Emissor */
                  G005RE.CJCLIENT As CJCLIENTRE, /* CNPJ Emissor */
                  G005RE.IECLIENT As IECLIENTRE, /* Inscrição Estadual */
                  G002RE.CDESTADO As CDESTADORE, /* Estado  */
                  Nvl(G005DE.RSCLIENT,G005DE.NMCLIENT) As NMCLIENTDE, /* Destino */
                  G005DE.CJCLIENT As CJCLIENTDE, /* CNPJ Destinatário */
                  G005DE.IECLIENT As IECLIENTDE, /* Inscrição Estadual */
                  G002DE.CDESTADO As CDESTADODE, /* Estado */
                  G024.NMTRANSP AS NMTRANSP, /* Transportadora */
                  G024.CJTRANSP AS CJTRANSP, /* CNPJ da Transportadora */
                  NVl(G043.DSINFCPL,G083.DSINFCPL) AS DSINFCPL, /* Observação da Nota Fiscal */
                  G043.SNAG, /* Indicador de AG */
                  G051.IDG051
            From G043 G043
            Left Join G083 G083 
              On (G043.IDG043 = G083.IDG043)
            Left Join G005 G005RE
              On (G005RE.IDG005 = G043.IDG005RE)
            Left Join G003 G003RE
              On (G003RE.IDG003 = G005RE.IdG003)
            Left Join G002 G002RE
              On (G002RE.IDG002 = G003RE.IdG002)
            Left Join G005 G005DE
              On (G005DE.IDG005 = G043.IDG005DE)
            Left Join G003 G003DE
              On (G003DE.IDG003 = G005DE.IdG003)
            Left Join G002 G002DE
              On (G002DE.IDG002 = G003DE.IdG002)
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Left Join G051 G051
              On (G052.IDG051 = G051.IDG051)
            Left Join G022 G022
              On (G022.IdG005 = G051.IdG005CO)
            Left Join G014 G014
              On (G014.IdG014 = G022.IdG014)
            Left Join G024 G024
              On (G051.IDG024 = G024.IDG024)
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
             ` + sqlWhere + ` and not exists (
              select g043x.idg043 from g043 g043x
          inner join g052 g052x on g043x.idg043 = g052x.idg043 
          inner join g051 g051x on g051x.idg051  = g052x.idg051 
          where to_char(substr(G043x.cddelive,0,1)) between '0' and '9' 
          and g043x.idg043 = g043.idg043) ` ,
          param: bindValues
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
      logger.error("Erro:", err);
			err.stack = new Error().stack + `\r\n` + err.stack;
			throw err;
		}
  };


  api.getInformacoesRestricoesCarga = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    let sql = `
              SELECT
                T004.IDT004 T004_IDT004,
                G067.IDG067 || ' - ' || G067.DSOCORRE G067_DSOCORRE,
                T004.STSITUAC T004_STSITUAC,
                TO_CHAR(T004.DTCADAST, 'dd/MM/yyyy') T004_DTCADAST,
                TO_CHAR(T004.DTVALIDA, 'dd/MM/yyyy') T004_DTVALIDA,
                T004.TXVALIDA T004_TXVALIDA,
                T004.IDS001 || ' - ' || S001.NMUSUARI as T004_NMUSUARI

              FROM
                T004 T004
              INNER JOIN G067 G067 ON
                T004.IDG067 = G067.IDG067

                join s001 s001 on s001.ids001 = t004.ids001

              WHERE T004.IDG046 = ${req.body.IDG046}
              ORDER BY T004.DTCADAST
          `

    /* var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G046_IDG046: req.body.IDG046, tableName: "G046" }, false); */

    try {
      let result = await con.execute(
        {
          sql: sql,
          param: [],
          fetchInfo: ["T004_TXVALIDA"]
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

	api.getCanhoto = async function (req, res, next) {
		let con = await this.controller.getConnection(null, req.UserId);

		let IDG046 = req.body.IDG046;

		let result = await con.execute({
				sql: `
        SELECT g082.*, g043.nrnota,
                       g043.DTENTMOB
          FROM g082 g082
          JOIN G043 G043 on g082.pks007 = g043.idg043
         WHERE g082.pks007 IN (SELECT g043.idg043 AS qtd
                            FROM g043 g043
                            JOIN G049 G049
                              ON G049.IDG043 = G043.IDG043
                            JOIN G048 G048
                              ON G048.IDG048 = G049.IDG048
                             AND g048.idg046 = :id
                           WHERE g043.DTENTMOB IS NOT NULL) 
					  
					  `,
				param: {id:IDG046} ,
				fetchInfo: [{
					column : "CTDOCUME", 
					type: "BLOB"
				}]
			})
			.then((result) => {
				
				return result;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});

    await con.close();

    let buff = null;
    let base64data = null;

    for (let i = 0; i < result.length; i++) {
      buff = new Buffer(result[i].CTDOCUME, 'base64');
      base64data = buff.toString('base64');
      result[i].CTDOCUME64 = base64data;
      delete result[i].CTDOCUME;
    }
    return result;
	}


    return api;
};
