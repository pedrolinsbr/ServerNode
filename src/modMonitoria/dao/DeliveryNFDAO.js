module.exports = function (app) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    api.controller = app.config.ControllerBD;
    const logger = app.config.logger;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
    var utilsCurl = app.src.utils.Utils;
    var fs = require('fs');
    var path = require('path');
    const parser = require('xml2json');
    const stream = require('stream');

    api.listar = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        console.log(req.body);

        let wherePrevisao = '';
        let whereOperac = '';
        let whereAG = '';
        let auxLeftCarga = '';
        let auxLeftAtend = '';
        let auxLeftAcl = '';

        if (req.body['parameter[DTPREENT]'] != undefined && req.body['parameter[DTPREENT]'] != null && req.body['parameter[DTPREENT]'] != '') {
            wherePrevisao = ` And ( Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End) = '${req.body['parameter[DTPREENT]']}' `;
            delete req.body['parameter[DTPREENT]'];
        } else {
            wherePrevisao = '';
        }

        if (req.body['parameter[TPOPERAC]'] != undefined && req.body['parameter[TPOPERAC]'] != null && req.body['parameter[TPOPERAC]'] != '') {
            if (req.body['parameter[TPOPERAC]'] == 1) {
                whereOperac = ` And NVL(G014.SN4PL,0) <> 1 `;
            } else if (req.body['parameter[TPOPERAC]'] == 2) {
                whereOperac = ` And NVL(G014.SN4PL,0) = 1 `;
            }
            auxLeftAcl = ` Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                    Left Join G014 G014   On G014.IdG014 = G022.IdG014 `;

            delete req.body['parameter[TPOPERAC]'];
        } else {
            whereOperac = '';
        }


        if (req.body['parameter[G043_SNAG]'] != undefined && req.body['parameter[G043_SNAG]'] != null && req.body['parameter[G043_SNAG]'] != '') {
            if (req.body['parameter[G043_SNAG]'] == '1') {
                whereAG = ` And (NVL(G043.TPDELIVE,0) <> 5 And G043.SNAG IS NULL) `;
            } else {
                whereAG = ` And (G043.TPDELIVE = 5 OR G043.SNAG IS NOT NULL) `;
            }
            delete req.body['parameter[G043_SNAG]'];
        }

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        sqlWhere = sqlWhere + `  And G051.SnDelete = 0 `;

        if (sqlOrder != null && sqlOrder != undefined && sqlOrder.trim() != '') {
            sqlOrder += ',';
        } else {
            sqlOrder = 'Order by ';
        }

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if ((sqlWhereAcl.includes('G024'))) {
            auxLeftCarga = ` Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
                  Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
                  Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
                  Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0) `;

        }

        if ((sqlWhereAcl.includes('G014'))) {

            if (auxLeftAcl == '') {
                auxLeftAcl = ` Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                    Left Join G014 G014   On G014.IdG014 = G022.IdG014 `;
            }

        }

        if ((req.body['parameter[G046_IDG024][in]'] != undefined && req.body['parameter[G046_IDG024][in]'] != null && req.body['parameter[G046_IDG024][in]'] != '') ||
            (req.body['parameter[G046_IDG046]'] != undefined && req.body['parameter[G046_IDG046]'] != null && req.body['parameter[G046_IDG046]'] != '')) {

            if (auxLeftCarga == '') {
                auxLeftCarga = ` Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
                    Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
                    Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C') `;
            }

        }

        if ((req.body['parameter[G032_NRFROTA][in]'] != undefined && req.body['parameter[G032_NRFROTA][in]'] != null && req.body['parameter[G032_NRFROTA][in]'] != '') ||
            (req.body['parameter[G032_IDG032][in]'] != undefined && req.body['parameter[G032_IDG032][in]'] != null && req.body['parameter[G032_IDG032][in]'] != '')) {

            if (auxLeftCarga == '') {
                auxLeftCarga = ` Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
                    Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
                    Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
                    Left Join G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3)) `;
            } else {
                auxLeftCarga += ` Left Join G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3)) `
            }

        }

        if (req.body['parameter[A005_IDA001]'] != undefined && req.body['parameter[A005_IDA001]'] != null && req.body['parameter[A005_IDA001]'] != '') {
            auxLeftAtend = ` Left Join A005 A005 On (A005.IDG043 = G043.IDG043) `;
        }

        if (req.body['parameter[A002_IDA008]'] != undefined && req.body['parameter[A002_IDA008]'] != null && req.body['parameter[A002_IDA008]'] != '') {

            if (auxLeftAtend == '') {
                auxLeftAtend = ` Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
                        Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                        Left Join A002 A002 On (A002.IDA002 = A001.IDA002) `;
            } else {
                auxLeftAtend += ` Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                          Left Join A002 A002 On (A002.IDA002 = A001.IDA002) `;
            }
        }

        try {
            let result = await con.execute({
                sql: `Select  Distinct G043.IDG043,
                        G051.IDG051,
                        G051.IDI015,
                        G043.IDG014,
                        G043.CDDELIVE,
                        G083.IDG083,
                        G051.QTDIAENT AS PRAZO,
                    
                        Nvl(G051.CDCTRC, '0') As G051_CDCTRC,
                        Nvl(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'), 'n.i.') As G051_DTEMICTR,
                        Nvl(G043.NRNOTA,G083.NRNOTA) As NRNOTA,
                        Nvl(TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY'),TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY')) AS DTEMINOT,
                        Nvl(TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY'), 'n.i.') AS DTBLOQUE,
                        Nvl(TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY'), 'n.i.') AS DTDESBLO,
                        Nvl(TO_CHAR(G043.DTENTMOB, 'DD/MM/YYYY'), 'n.i.') AS DTENTMOB,
                        Nvl(TO_CHAR(G043.DTCANHOT, 'DD/MM/YYYY'), 'n.i.') AS DTCANHOT,
                        Nvl(To_Char(G051.DTAGENDA, 'DD/MM/YYYY'), 'n.i.') As G051_DTAGENDA, /* Data Agendada */
                        Nvl(To_Char(G051.DTCOMBIN, 'DD/MM/YYYY'), 'n.i.') As G051_DTCOMBIN, /* Data Combinada */
                        Nvl(To_Char(G051.DTROTERI, 'DD/MM/YYYY'), 'n.i.') As G051_DTROTERI, /* Data Roteirizada */
                        G051.DTENTPLA,
                        TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY') AS DTCALDEP,
                        G024CTE.NMTRANSP AS G024CTE_NMTRANSP,

                        Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                          Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End as G051_DTPREENT, /* Data de Previsão de Entrega */

                        Nvl(G043.NRCHADOC,G083.NRCHADOC) As NRCHADOC,
                        G043.IDG005RE,
                        O_04.G005RE_NMCLIENTRE,
                        O_04.G005RE_RSCLIENTRE,
                        O_04.G005RE_CJCLIENTRE,
                        O_04.G003RE_NMCIDADERE,
                        O_04.G002RE_NMESTADORE,
                        G043.IDG005DE,
                        O_05.G005DE_NMCLIENTDE,
                        O_05.G005DE_RSCLIENTDE,
                        O_05.G005DE_CJCLIENTDE,
                        O_05.G003DE_NMCIDADEDE,
                        O_05.G003DE_IDG003,
                        O_05.G002DE_NMESTADODE,
                        Nvl(G043.DSMODENF,G083.DSMODENF) As DSMODENF, /* Modelo da Nota */
                        Nvl(G043.NRSERINF,G083.NRSERINF) As NRSERINF,/* Serie da Nota */
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
                          When G051.TPTRANSP = 'I' Then
                          'Industrialização'
                          Else
                          'n.i.'
                        End As G051_TPTRANSP, /* Tipo de Operação */
                        TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') AS DTDELIVE,
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.') As DTENTCON,
                        Nvl(TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY'), 'n.i.') As DTENTREG,
                        Nvl(TO_CHAR(G043.DTENTREG, 'HH24:MI:SS'), 'n.i.') As HRENTREG,

                        G051.IDG046 As G051_IDG046,
                        G051.IDG005CO,
                        G005CO.NMCLIENT As G005CO_NMCLIENTCO,

                        CASE 
                            WHEN C_01.QTD_CANHOTOS = 0 THEN
                            C_01_CTE.QTD_CANHOTOS
                            ELSE 
                            C_01.QTD_CANHOTOS
                        END AS QTD_CANHOTOS,

                        O_03.G046_STCARGA,
                        O_03.IDG046,
                        O_03.NMTRANSP_CARGA,

                        C_02.ate as A001_QTD_ATENDIMENTOS,
                        C_02.oco as A001_QTD_OCORRENCIAS,

                        C_08.DSOBSERV_BLOQ,

                        CASE 
                        	WHEN C_06.IDG043_REC IS NULL AND (O_03.TPMODCAR = 2 OR O_03.TPMODCAR = 3) THEN
                        	'Não'
                        	WHEN C_06.IDG043_REC IS NOT NULL AND (O_03.TPMODCAR = 2 OR O_03.TPMODCAR = 3) THEN
                            'Sim'
                            WHEN C_07.IDA001_REC IS NOT NULL AND (NVL(O_03.TPMODCAR,0) <> 2 OR NVL(O_03.TPMODCAR,0) <> 3) THEN
                            'Sim'
                            ELSE
                            'Não'
                        END AS IDG043_REC,

                        G043.SNAG, /* Indicador de AG */
                        Nvl(TO_CHAR(G051.DTCOLETA, 'DD/MM/YYYY'), 'n.i.') As DTCOLETA,
                        COUNT(DISTINCT G083.IDG083) OVER() as COUNT_LINHA
              From G052 G052
              Join G043 G043 On (G052.IDG043 = G043.IDG043)
              Join G051 G051 On (G052.IDG051 = G051.IDG051)
              Join G083 G083 On (G083.IDG083 = G052.IDG083)
              ${auxLeftAtend}
              ${auxLeftAcl}
              Left Join G005 G005CO On (G051.IDG005CO = G005CO.IDG005)
              ${auxLeftCarga}
              Join G024 G024CTE   On (G051.IDG024 = G024CTE.IDG024 And G024CTE.SnDelete = 0 And G024CTE.IDG023 = 2)

              cross apply
              (Select Count(G082.IDG082) AS QTD_CANHOTOS
                From G082 G082
                Where G082.TPDOCUME = 'CTO' AND G082.NMDOCUME IS NOT NULL AND G043.IDG043 = G082.PKS007 AND G082.IDS007 = 31 AND G082.SNDELETE = 0) C_01
            
                cross apply
                (SELECT COUNT(G051g.IDG051) AS QTD_CANHOTOS
                FROM G051 G051g
                WHERE G051g.IDG051= G051.IDG051
                AND G051g.CTDOCUME IS NOT NULL) C_01_CTE

              cross apply
              ( Select --distinct A001.IDA001, A002.IDA008
                COUNT(CASE A002.IDA008 WHEN 1 THEN 1 END) AS ATE,
                COUNT(CASE A002.IDA008 WHEN 2 THEN 1 END) AS OCO
                From A005 A005
                Join A001 A001
                  On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                Join A002 A002
                  On (A001.IDA002 = A002.IDA002)
                Where A005.IDG043 = G043.IDG043
                  --And A002.IDA008 = 2
              ) C_02

              outer apply   
              (SELECT 
                  Case
                    When G046X.STCARGA = 'A' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'B' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'E' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'F' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'S' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'R' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'O' Then
                    'Em Expedição'
                    When G046X.STCARGA = 'T' Then
                    'Em Transporte'
                    When G046X.STCARGA = 'X' Then
                    'Recusada'
                    When G046X.STCARGA = 'C' Then
                    'Cancelada'
                    When G046X.STCARGA = 'D' Then
                    'Entregue'
                    Else
                    'n.i.'
                  End As G046_STCARGA, G046X.IDG046, G024X.NMTRANSP AS NMTRANSP_CARGA,
                  G046X.TPMODCAR
                FROM G046 G046X
                  JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                  JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                  JOIN G024 G024X ON (G024X.IDG024 = G046X.IDG024)
                    
                  WHERE G049X.IDG051 = G051.IDG051 AND G046X.STCARGA <> 'C'
                  ORDER BY G046X.TPMODCAR DESC, G046X.IDG046 DESC FETCH FIRST ROW ONLY
              ) O_03

              outer apply (
                select G005RE.NMCLIENT As G005RE_NMCLIENTRE,
                        G005RE.RSCLIENT As G005RE_RSCLIENTRE,
                        G005RE.CJCLIENT As G005RE_CJCLIENTRE,
                        G003RE.NMCIDADE As G003RE_NMCIDADERE,
                        G002RE.NMESTADO As G002RE_NMESTADORE
                from G005 G005RE --On (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
                Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
                Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
                where G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE)
              ) O_04

              outer apply
              (select G005DE.NMCLIENT As G005DE_NMCLIENTDE,
                      G005DE.RSCLIENT As G005DE_RSCLIENTDE,
                      G005DE.CJCLIENT As G005DE_CJCLIENTDE,
                      G003DE.NMCIDADE As G003DE_NMCIDADEDE,
                      G003DE.IDG003 AS G003DE_IDG003,
                      G002DE.NMESTADO As G002DE_NMESTADODE 
                from  G005 G005DE --On (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
                Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
                Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
                where G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE)
              ) O_05

              cross apply
              ( Select distinct MAX(G052X.IDG043) AS IDG043_REC
                From G052 G052X
                Join G051 G051X
                  On (G051X.IDG051 = G052X.IDG051)
                Where G052X.IDG043 = G043.IDG043
                AND G051X.TPTRANSP = 'V'
                AND EXISTS (
                    SELECT G043X.IDG043
                      FROM G043 G043X
                      JOIN G052 G052Y ON (G052Y.IDG043 = G043X.IDG043)
                      JOIN G051 G051Y ON (G052Y.IDG051 = G051Y.IDG051)
                      WHERE G051Y.TPTRANSP = 'D'
                      AND G043X.NRCHADOC = G043.NRCHADOC
                )
              ) C_06

              cross apply
              ( Select Distinct MAX(A001X.IDA001) AS IDA001_REC
                From A005 A005X
                Join A001 A001X
                  On (A001X.IDA001 = A005X.IDA001 And A001X.SNDELETE = 0)
                Where A001X.STDATAS = 'R' AND A001X.IDA002 = 141 AND A005X.IDG043 = G043.IDG043
                AND NOT EXISTS (
                    SELECT A001Y.IDA001
                    From A005 A005Y
                    Join A001 A001Y
                      On (A001Y.IDA001 = A005Y.IDA001 And A001Y.SNDELETE = 0)
                    Where A001Y.IDA002 = 142 AND A005Y.IDG043 = G043.IDG043
                )
                FETCH FIRST ROW ONLY
              ) C_07

              cross apply
              ( Select Distinct 
                    MAX(A001Z.IDA001) AS IDA001_BLOQ,
                    MAX(dbms_lob.substr( A003Z.DSOBSERV, 4000, 1 )) as DSOBSERV_BLOQ
                From A005 A005Z
                Join A001 A001Z
                  On (A005Z.IDA001 = A001Z.IDA001 And A001Z.SNDELETE = 0)
                Join A003 A003Z
                  On (A003Z.IDA001 = A001Z.IDA001)
                Where A001Z.STDATAS IN ('B','S') 
                AND A005Z.IDG043 = G043.IDG043
                AND G043.DTDESBLO IS NULL
                FETCH FIRST ROW ONLY
              ) C_08

               ` +
                    sqlWhere + wherePrevisao + whereOperac + whereAG + sqlWhereAcl +
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
                G043.IDG005DE,
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
                G043.IDG014,
                G043.DTENTMOB,
                G043.DTCANHOT,
                G051.IDG046,
                G051.IDG005CO,
                G005CO.NMCLIENT,
                G043.SNAG,
                G024CTE.NMTRANSP,
                G083.DTEMINOT,
                G083.NRCHADOC,
                G083.NRSERINF,
                G083.DSMODENF,
                G083.IDG083,
                G051.QTDIAENT,
                G051.DTCOLETA,
                G083.NRNOTA,
                C_02.ate,
                C_02.oco,
                O_03.G046_STCARGA,
                O_03.IDG046,
                O_03.NMTRANSP_CARGA,
                O_03.TPMODCAR,
                C_01.QTD_CANHOTOS,
                O_04.G005RE_NMCLIENTRE,
                O_04.G005RE_RSCLIENTRE,
                O_04.G005RE_CJCLIENTRE,
                O_04.G003RE_NMCIDADERE,
                O_04.G002RE_NMESTADORE,
                
                O_05.G005DE_NMCLIENTDE,
                O_05.G005DE_RSCLIENTDE,
                O_05.G005DE_CJCLIENTDE,
                O_05.G003DE_NMCIDADEDE,
                O_05.G003DE_IDG003,
                O_05.G002DE_NMESTADODE,

                C_06.IDG043_REC,
                C_07.IDA001_REC,
                C_08.DSOBSERV_BLOQ

              ` +
                    sqlOrder + `G051.CDCTRC DESC` +
                    sqlPaginate,
                param: bindValues
            })
                .then((result) => {
                    return (utils.construirObjetoRetornoBD(result, req.body));
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

    api.listarWithoutCte = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        try {
            let result = await con.execute({
                sql: `Select  Distinct G043.IDG043,
                        G083.IDG083,
                        G043.CDDELIVE,
                        Nvl(G051.CDCTRC,'0') As G051_CDCTRC,
                        Nvl(TO_CHAR(G051.DTEMICTR,'DD/MM/YYYY'),'n.i.') As G051_DTEMICTR,
                        Nvl(Nvl(G043.NRNOTA,G083.NRNOTA),'0') As NRNOTA,
                        Nvl(Nvl(TO_CHAR(G043.DTEMINOT,'DD/MM/YYYY HH24:mi:ss'),TO_CHAR(G083.DTEMINOT,'DD/MM/YYYY HH24:mi:ss')),'n.i.') AS DTEMINOT,
                        
                        Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                          Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End as G051_DTPREENT, /* Data de Previsão de Entrega */

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
                          When G051.TPTRANSP = 'I' Then
                          'Industrialização'
                          Else
                          'n.i.'
                        End As G051_TPTRANSP, /* Tipo de Operação */
                        
                        Nvl(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC,
                        G043.IDG005RE,
                        G005RE.NMCLIENT As G005RE_NMCLIENTRE,
                        G005RE.CJCLIENT As G005RE_CJCLIENTRE,
                        G003RE.NMCIDADE As G003RE_NMCIDADERE,
                        G002RE.NMESTADO As G002RE_NMESTADORE,
                        G043.IDG005DE,
                        G005DE.NMCLIENT As G005DE_NMCLIENTDE,
                        G005DE.CJCLIENT As G005DE_CJCLIENTDE,
                        G003DE.NMCIDADE As G003DE_NMCIDADEDE,
                        G002DE.NMESTADO As G002DE_NMESTADODE,
                        Nvl(G043.DSMODENF,G083.DSMODENF) as DSMODENF, /* Modelo da Nota */
                        Nvl(G043.NRSERINF,G083.NRSERINF) as NRSERINF, /* Serie da Nota */
                        G043.TPDELIVE, /* Tipo da Nota */
                        TO_CHAR(G043.DTDELIVE ,'DD/MM/YYYY') AS DTDELIVE,
                        Nvl(TO_CHAR(G043.DTENTCON ,'DD/MM/YYYY'),'n.i.') As DTENTCON,
                        Nvl(TO_CHAR(G043.DTENTREG ,'DD/MM/YYYY'),'n.i.') As DTENTREG,
                        Nvl(G024CTE.NMTRANSP,'n.i.') As G024CTE_NMTRANSP,
                        --Nvl(G046.CDVIAOTI,0) As G046_CDVIAOTI,
                        Nvl(G051.IDG046, 0) As G051_IDG046,
                        G051.IDG005CO,
                        G051.IDG051,
                        G043.DTBLOQUE,
                        G043.DTDESBLO,
                        G014.IDG014,
                        G005CO.NMCLIENT As G005CO_NMCLIENTCO, 
                        (Select Count(*)
                          From A005 A005
                          Join A001 A001
                            On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                          Join A002 A002
                            On (A001.IDA002 = A002.IDA002)
                        Where A005.IDG043 = G043.IDG043
                          And A002.IDA008 = 1) As A001_QTD_ATENDIMENTOS,
                      (Select Count(*)
                          From A005 A005
                          Join A001 A001
                            On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                          Join A002 A002
                            On (A001.IDA002 = A002.IDA002)
                        Where A005.IDG043 = G043.IDG043
                          And A002.IDA008 = 2) As A001_QTD_OCORRENCIAS,
                      G043.SNAG, /* Indicador de AG */
                      COUNT(G043.IDG043) OVER() as COUNT_LINHA
                  From G043 G043
                  Left Join G052 G052 On (G052.IDG043 = G043.IDG043)
                  Left Join G051 G051 On (G052.IDG051 = G051.IDG051)
                  Left Join G083 G083 On (G043.IDG043 = G083.IDG043)
                  Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
                  Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                  Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                  Left Join A008 A008 On (A008.IDA008 = A002.IDA008)

                  Join G005 G005RE On (G005RE.IDG005 = Nvl(G043.IDG005RE,G051.IDG005RE))
                  Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
                  Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
                  Join G005 G005DE On (G005DE.IDG005 = Nvl(G043.IDG005DE,G051.IdG005DE))
                  Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
                  Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
                  Left Join G014 G014 On G014.IdG014 = G043.IdG014
                  Left Join G005 G005CO On (G051.IDG005CO = G005CO.IDG005)
                  Left Join G049 G049 On (G049.IDG043 = G043.IDG043)
                  Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                  Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                  Left Join G024 G024 On (G046.IDG024 = G024.IDG024)
                  Left Join G024 G024CTE   On (G051.IDG024 = G024CTE.IDG024 And G024CTE.SnDelete = 0 And G024CTE.IDG023 = 2) ` +
                    sqlWhere + ' And (Nvl(G043.NRCHADOC,G083.NRCHADOC) Is Not Null Or G043.CDDELIVE IS NOT NULL) ' + sqlWhereAcl +

                    ` Group by 
            G043.IDG043,
            G083.IDG083,
            G043.CDDELIVE,
            G051.CDCTRC,
            G051.DTEMICTR,
            G043.NRNOTA,
            G083.NRNOTA,
            G043.DTEMINOT,
            G083.DTEMINOT,
            G051.IDG051,
            G043.DTENTREG,
            G014.IDG014,
            G043.DTENTCON,
            G043.NRCHADOC,
            G083.NRCHADOC,
            G043.IDG005RE,
            G005RE.NMCLIENT,
            G005RE.CJCLIENT,
            G003RE.NMCIDADE,
            G002RE.NMESTADO,
            G043.IDG005DE,
            G005DE.NMCLIENT,
            G005DE.CJCLIENT,
            G003DE.NMCIDADE,
            G002DE.NMESTADO,
            G043.DSMODENF,
            G083.DSMODENF,
            G043.NRSERINF,
            G083.NRSERINF,
            G043.TPDELIVE, 
            G043.DTDELIVE,
            G024CTE.NMTRANSP,
            G051.IDG046,
            G051.IDG005CO,
            G051.IDG051,
            G051.TPTRANSP,
            G043.DTBLOQUE,
            G043.DTDESBLO,
            G005CO.NMCLIENT,
            G051.DTCALDEP,
            G043.SNAG ` +

                    sqlOrder +
                    sqlPaginate,
                param: bindValues
            })
                .then((result) => {
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

    api.listarCargaPorNfe = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }


        try {
            let result = await con.execute({
                sql: `
          Select  Distinct G043.IDG043,
                        G043.CDDELIVE,
                        Nvl(G051.CDCTRC,'0') As G051_CDCTRC,
                        Nvl(TO_CHAR(G051.DTEMICTR,'DD/MM/YYYY'),'n.i.') As G051_DTEMICTR,
                        Nvl(G043.NRNOTA,G083.NRNOTA) As NRNOTA,
                        Nvl(TO_CHAR(G043.DTEMINOT,'DD/MM/YYYY'), TO_CHAR(G083.DTEMINOT,'DD/MM/YYYY')) AS DTEMINOT,
                        NVL(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC,
                        G043.IDG005RE,
                        G005RE.NMCLIENT As G005RE_NMCLIENTRE,
                        G005RE.CJCLIENT As G005RE_CJCLIENTRE,
                        G003RE.NMCIDADE As G003RE_NMCIDADERE,
                        G002RE.NMESTADO As G002RE_NMESTADORE,
                        G043.IDG005DE,
                        G005DE.NMCLIENT As G005DE_NMCLIENTDE,
                        G005DE.CJCLIENT As G005DE_CJCLIENTDE,
                        G003DE.NMCIDADE As G003DE_NMCIDADEDE,
                        G002DE.NMESTADO As G002DE_NMESTADODE,
                        NVL(G043.DSMODENF,G083.DSMODENF) AS DSMODENF, /* Modelo da Nota */
                        NVL(G043.NRSERINF,G083.NRSERINF) AS NRSERINF, /* Serie da Nota */
                        G043.TPDELIVE, /* Tipo da Nota */
                        Nvl(TO_CHAR(G043.DTDELIVE ,'DD/MM/YYYY'),'n.i.') AS DTDELIVE,
                        Nvl(TO_CHAR(G043.DTENTCON ,'DD/MM/YYYY'),'n.i.') As DTENTCON,
                        Nvl(TO_CHAR(G043.DTENTREG ,'DD/MM/YYYY'),'n.i.') As DTENTREG,
                        Nvl(G024.NMTRANSP,'n.i.') As G024_NMTRANSP,
                        Nvl(G046.CDVIAOTI,0) As G046_CDVIAOTI,
                        G051.IDG005CO,
                        G051.IDG051,
                        G005CO.NMCLIENT As G005CO_NMCLIENTCO, 

                        Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                          Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                          Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End as G051_DTPREENT, /* Data de Previsão de Entrega */


                        (Select Count(*)
                          From A005 A005
                          Join A001 A001
                            On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                          Join A002 A002
                            On (A001.IDA002 = A002.IDA002)
                        Where A005.IDG043 = G043.IDG043
                          And A002.IDA008 = 1) As A001_QTD_ATENDIMENTOS,
                        (Select Count(*)
                           From A005 A005
                           Join A001 A001
                             On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                           Join A002 A002
                             On (A001.IDA002 = A002.IDA002)
                          Where A005.IDG043 = G043.IDG043
                            And A002.IDA008 = 2) As A001_QTD_OCORRENCIAS,
                      G043.SNAG, /* Indicador de AG */
                      COUNT(G043.IDG043) OVER() as COUNT_LINHA
                  From G043 G043
                  Left Join G005 G005RE On (G005RE.IDG005 = G043.IDG005RE)
                  Left Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
                  Left Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
                  Left Join G005 G005DE On (G005DE.IDG005 = G043.IDG005DE)
                  Left Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
                  Left Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
                  Join G052 G052 On (G052.IDG043 = G043.IDG043)
                  Join G051 G051 On (G052.IDG051 = G051.IDG051)
                  Left Join G083 G083 On (G052.IDG083 = G083.IDG083)
                  Left Join G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
                  Left Join G014 G014 On G014.IdG014 = G022.IdG014
                  Left Join G005 G005CO On (G051.IDG005CO = G005CO.IDG005)
                  Left Join G049 G049 On (G049.IDG043 = G043.IDG043)
                  Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                  Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                  Left Join G024 G024 On (G046.IDG024 = G024.IDG024)` +
                    sqlWhere + `And NVL(G043.NRCHADOC,G083.NRCHADOC) Is Not Null And G051.STCTRC = 'A'` + sqlWhereAcl +

                    ` Group By 
                    G043.IDG043,
                    G043.CDDELIVE,
                    G051.CDCTRC,
                    G051.DTEMICTR,
                    G043.NRNOTA,
                    G043.DTEMINOT,
                    G043.NRCHADOC,
                    G043.IDG005RE,
                    G005RE.NMCLIENT,
                    G005RE.CJCLIENT,
                    G003RE.NMCIDADE,
                    G002RE.NMESTADO,
                    G043.IDG005DE,
                    G005DE.NMCLIENT,
                    G005DE.CJCLIENT,
                    G003DE.NMCIDADE,
                    G002DE.NMESTADO,
                    G043.DSMODENF, 
                    G043.NRSERINF,
                    G043.TPDELIVE,
                    G043.DTDELIVE,
                    G043.DTENTCON,
                    G043.DTENTREG,
                    G024.NMTRANSP,
                    G046.CDVIAOTI,
                    G051.IDG005CO,
                    G005CO.NMCLIENT,
                    G043.SNAG,
                    G051.IDG051,
                    G043.IDG014,
                    G083.NRSERINF,
                    G083.DSMODENF,
                    G083.NRCHADOC,
                    G083.DTEMINOT,
                    G083.NRNOTA,
                    G051.DTCALDEP

                   ` +

                    sqlOrder +
                    sqlPaginate,
                param: bindValues
            })
                .then((result) => {
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

    api.getDatasToAtendimento = async function (req, res, next) {

        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        let whereAux = '';
        if (req.body.IDG083) {
            whereAux = ` and G083.IDG083 = ${req.body.IDG083} `;
        }

        try {
            let result = await con.execute({
                sql: `
          Select  Nvl(To_Char(G043.DTEMINOT,'DD/MM/YYYY'), To_Char(G083.DTEMINOT,'DD/MM/YYYY')) as DTEMINOT, /* Data de Emissão da Nota */
                  To_Char(G051.DTEMICTR,'DD/MM/YYYY') as DTEMICTR, /* Data de Emissão do CTE */
                  To_Char(G043.DTENTCON,'DD/MM/YYYY') as DTENTCON, /* Data SLA */
                  To_Char(G051.DTENTPLA,'DD/MM/YYYY') as DTENTPLA, /* Entrega Planejada */
                  To_Char(G043.DTENTMOB,'DD/MM/YYYY') as DTENTMOB, /* Entrega mobile */
                  To_Char(G043.DTENTRAS,'DD/MM/YYYY') as DTENTRAS, /* Entrega rastreador */
                  To_Char(G043.DTCANHOT,'DD/MM/YYYY') as DTCANHOT, /* data canhoto */
                  /*To_Char(Nvl(G051.DTCALDEP, Nvl(G051.DTENTPLA, G051.DTCALANT)),'DD/MM/YYYY') As DTPREENT,*/ /* Data de Previsão de Entrega */

                  Case
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                    Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                    End as DTPREENT, /* Data de Previsão de Entrega */

                  To_Char(Nvl(G051.DTCOLETA,Nvl(G046.DTCOLORI, G046.DTCOLATU)),'DD/MM/YYYY') As DTCOLETA, /* Data de Coleta */
                  To_Char(G051.DTAGENDA,'DD/MM/YYYY') As DTAGENDA, /* Data Agendada */
                  To_Char(G051.DTPRECOR,'DD/MM/YYYY') As DTPRECOR, /* Data Previsão de Entrega Corretiva */
                  To_Char(G051.DTCOMBIN,'DD/MM/YYYY') As DTCOMBIN, /* Data Combinada */
                  To_Char(G051.DTROTERI,'DD/MM/YYYY') As DTROTERI, /* Data de Roteirização */
                  To_Char(G043.DTENTREG,'DD/MM/YYYY') as DTENTREG, /* Data de Entrega */
                  To_Char(G051.DTCALDEP,'DD/MM/YYYY') as DTCALDEP, /* Data de Entrega */
                  G051.IDG051,
                  To_Char(G043.DTBLOQUE,'DD/MM/YYYY') as DTBLOQUE,
                  To_Char(G043.DTDESBLO,'DD/MM/YYYY') as DTDESBLO
            From G043 G043
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Left Join G083 G083
              On (G083.IDG043 = G043.IDG043)
            Left Join G051 G051
              On (G051.IDG051 = G052.IDG051 and G051.STCTRC <> 'C')
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
            Left Join G048 G048
              On (G048.IDG048 = G049.IDG048)
            Left Join G046 G046
              On (G046.IDG046 = G048.IDG046)
            Where G043.IDG043 = :IDG043 ${whereAux}
            Order by G051.IDG051 Asc`,
                param: {
                    IDG043: IDG043
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

    api.getStatusGeralNota = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select G043.DTBLOQUE, G043.DTDESBLO, G043.DTENTREG, G051.IDG046
          From G043 G043
          Left Join G052 G052 On (G052.IDG043 = G043.IDG043)
          Left Join G051 G051 On (G051.IDG051 = G052.IDG051)
          Where G043.IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
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

    api.getNotasVinculadasAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let A001 = req.body.IDA001;

        try {
            let result = await con.execute({
                sql: `
           Select A005.IDG043,
                  A005.IDA001,
                  Nvl(G083.NRNOTA,G043.NRNOTA) as NRNOTA,
                  G051.CDCTRC,
                  Nvl(To_Char(G043.DTEMINOT,'DD/MM/YYYY'),To_Char(G083.DTEMINOT,'DD/MM/YYYY')) as DTEMINOT,
                  Nvl(G043.DSMODENF,G083.DSMODENF) as DSMODENF,
                  Nvl(G043.NRSERINF,G083.NRSERINF) as NRSERINF,
                  G043.TPDELIVE
              From A005 A005
              Join A001 A001
                On (A005.IDA001 = A001.IDA001 And A001.SNDELETE = 0)
              Join G043 G043
                On (G043.IDG043 = A005.IDG043)
              Left Join G052 G052
                On (G052.IDG043 = G043.IDG043)
              Left Join G083 G083
                On (G052.IDG083 = G083.IDG083)
              Left Join G051 G051
                On (G052.IDG051 = G051.IDG051)
            Where A005.IDA001 = :A001`,
                param: {
                    A001: A001
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

    api.getInformacoesNotaFiscalSemAcl = async function (req, res, next) {
        let con = await this.controller.getConnection();

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, tableName: "G043" }, false);

        try {
            let result = await con.execute({
                sql: `
           Select Distinct G043.IDG043,
                  NVL(G043.NRNOTA, 0) AS NRNOTA, /* Número da Nota */
                  G043.DTEMINOT, /* Data Emissão */
                  G043.NRCHADOC, /* Chave de Acesso */
                  G043.DSMODENF, /* Modelo da Nota */
                  G043.NRSERINF, /* Serie da Nota */
                  G043.TPDELIVE, /* Tipo da Nota */
                  G043.PSBRUTO, /* Peso Bruto */
                  G043.PSLIQUID, /* Peso Liquido */
                  G051.CDCTRC, /* Número do CTE */
                  G051.DTEMICTR, /* Data de Emissão do CTE */
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
                  G043.DSINFCPL, /* Observação da Nota Fiscal */
                  G043.SNAG, /* Indicador de AG */
                  G051.IDG051
            From G043 G043
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
              On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1)
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

    api.getInformacoesNotaFiscal = async function (req, res, next) {

        let con = await this.controller.getConnection(null, req.UserId);

        var parm = { nmTabela: 'G043' };
        var sqlPivot = await fldAdd.tabelaPivot(parm, res, next);

        sqlPivot = `LEFT JOIN (${sqlPivot}) CA ON CA.ID = G043.IDG043`;

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G083_IDG083: req.body.IDG083, G051_IDG051: req.body.IDG051, tableName: "G043" }, false);
        try {
            let result = await con.execute({
                sql: `
           Select Distinct G043.IDG043,
                  Nvl(G043.NRNOTA, G083.NRNOTA) AS NRNOTA, /* Número da Nota */
                  Nvl(To_Char(G043.DTEMINOT,'DD/MM/YYYY'),To_Char(G083.DTEMINOT,'DD/MM/YYYY')) as DTEMINOT, /* Data Emissão */
                  Nvl(G043.NRCHADOC,G083.NRCHADOC) As NRCHADOC, /* Chave de Acesso */
                  Nvl(G043.DSMODENF,G083.DSMODENF) As DSMODENF, /* Modelo da Nota */
                  Nvl(G043.NRSERINF,G083.NRSERINF) As NRSERINF, /* Serie da Nota */
                  G043.TPDELIVE, /* Tipo da Nota */
                  Nvl(G043.PSBRUTO,G083.PSBRUTO) As PSBRUTO, /* Peso Bruto */
                  Nvl(G043.PSLIQUID,G083.PSLIQUID) As PSLIQUID, /* Peso Liquido */
                  G051.CDCTRC, /* Número do CTE */
                  To_Char(G051.DTEMICTR,'DD/MM/YYYY') as DTEMICTR, /* Data de Emissão do CTE */
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
                  G043.DSINFCPL, /* Observação da Nota Fiscal */
                  G043.SNAG, /* Indicador de AG */
                  G051.IDG051,
                  CA.STRECUSA AS STRECUSA,
                  CA.SNFIMREC AS SNFIMREC,
                  C_01.SNREC3PL
            From G043 G043
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
            Left Join G083 G083
              On (G043.IDG043 = G083.IDG043)
            Left Join G051 G051
              On (G052.IDG051 = G051.IDG051)
            Left Join G022 G022
              On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1)
            Left Join G014 G014
              On (G014.IdG014 = G022.IdG014)
            Left Join G024 G024
              On (G051.IDG024 = G024.IDG024)

            ${sqlPivot}

            cross apply
              ( Select Distinct MAX(A001X.IDA001) AS SNREC3PL
                From A005 A005X
                Join A001 A001X
                  On (A001X.IDA001 = A005X.IDA001 And A001X.SNDELETE = 0)
                Where A001X.STDATAS = 'R' AND A001X.IDA002 = 141 AND A005X.IDG043 = G043.IDG043
                AND NOT EXISTS (
                    SELECT A001Y.IDA001
                    From A005 A005Y
                    Join A001 A001Y
                      On (A001Y.IDA001 = A005Y.IDA001 And A001Y.SNDELETE = 0)
                    Where A001Y.IDA002 = 142 AND A005Y.IDG043 = G043.IDG043
                )
                FETCH FIRST ROW ONLY
              ) C_01

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
        let con = await this.controller.getConnection();

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G049_IDG048: req.body.IDG048, tableName: "G043" }, false);

        try {
            let result = await con.execute({
                sql: `
           Select Distinct G043.IDG043,
                  NVL(G043.NRNOTA, 0) AS NRNOTA, /* Número da Nota */
                  G043.CDDELIVE,
                  G043.DTENTREG,
                  G043.DTEMINOT, /* Data Emissão */
                  G043.NRCHADOC, /* Chave de Acesso */
                  G043.DSMODENF, /* Modelo da Nota */
                  G043.NRSERINF, /* Serie da Nota */
                  G043.TPDELIVE, /* Tipo da Nota */
                  G043.PSBRUTO, /* Peso Bruto */
                  G043.PSLIQUID, /* Peso Liquido */
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
                  G043.DSINFCPL, /* Observação da Nota Fiscal */
                  G043.SNAG, /* Indicador de AG */
                  G051.IDG051
            From G043 G043
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
              On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1)
            Left Join G014 G014
              On (G014.IdG014 = G022.IdG014)
            Left Join G024 G024
              On (G051.IDG024 = G024.IDG024)
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
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

    api.getInformacoesNotaFiscalFromParada = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G049_IDG048: req.body.IDG048, tableName: "G043" }, false);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        try {
            let result = await con.execute({
                sql: `
           Select Distinct G043.IDG043,
                  NVL(G043.NRNOTA, 0) AS NRNOTA, /* Número da Nota */
                  G043.DTEMINOT, /* Data Emissão */
                  G043.NRCHADOC, /* Chave de Acesso */
                  G043.DSMODENF, /* Modelo da Nota */
                  G043.NRSERINF, /* Serie da Nota */
                  G043.TPDELIVE, /* Tipo da Nota */
                  G043.PSBRUTO, /* Peso Bruto */
                  G043.PSLIQUID, /* Peso Liquido */
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
                  G043.DSINFCPL, /* Observação da Nota Fiscal */
                  G043.SNAG, /* Indicador de AG */
                  G051.IDG051
            From G043 G043
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
              On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1)
            Left Join G014 G014
              On (G014.IdG014 = G022.IdG014)
            Left Join G024 G024
              On (G051.IDG024 = G024.IDG024)
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
            ` + sqlWhere + sqlWhereAcl + ` And G043.NRCHADOC Is Not Null `,
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

    /** 
    * @update Alteracao para usar os itens das NF em funcao da g043 e g004 ao inves de g043 e 4045 
    * @author Pedro Lins
    * @since 18/12/2019 
    */
    api.getItensNotaFiscal = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ G043_IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G083_IDG083: req.body.IDG083, tableName: "G004" }, false);

        try {
            let result = await con.execute({
                sql: `
                Select G004.IDG004,
                    G004.DSPRODUT,
                    G004.QTPRODUT,
                    G004.VRUNIPRO,
                    G009.CDUNIDAD,
                    G009.DSUNIDAD,
                    G004.DSINFAD,
                    (G004.QTPRODUT * G004.VRUNIPRO) As VLTOTAL
                From G004 G004
                Left Join G009 G009
                On (G004.IDG009UM = G009.IDG009)
                Left Join G083 G083
                On (G083.IDG083 = G004.IDG083)
                Left Join G052 G052
                On (G052.IDG083 = G083.IDG083)
                Left Join G051 G051
                On (G051.IDG051 = G052.IDG051)
                Join G043 G043
                On (G043.IDG043 = G052.IDG043)
         ` + sqlWhere + ' AND G004.SNDELETE = 0 ',
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

    api.getInformacoesCTe = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({
            G052_IDG043: req.body.IDG043,
            G051_IDG051: req.body.IDG051,
            G049_IDG048: req.body.IDG048,
            tableName: "G052"
        }, false);
        
        try {
            let result = await con.execute({
                sql: `
           Select Distinct G052.IDG051, /* IDG051 */
                  G052.IDG043, /* Identificador da Nota */
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
                  G005CO.IDG005 As IDCJCLIENTCO, /* Id do tomador */
                  G051.NRCHADOC, /* Chave do CT-e */
                  G051.CDCTRC, /* Número do CTE */
                  G051.NRSERINF, /* Número de Serie Nota Fiscal */
                  G051.DSMODENF, /* Modelo da Nota Fiscal */
                  G051.DTEMICTR, /* Data de Emissão do Controle */
                  G051.VRMERCAD, /* Valor da Mercadoria */
                  G051.DSINFCPL, /* Observação do Conhecimento */
                  G051.StCtrc, /* Situação do Conhecimento */
                  G024.NMTRANSP AS NMTRANSP,
                  0 As SELECTED
              From G052 G052
              Join G051 G051
                On (G051.IDG051 = G052.IDG051)
              Join G024 G024
                On (G051.IDG024 = G024.IDG024 And G024.SnDelete = 0 And G024.IDG023 = 2)
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
                On (G049.IDG043 = G052.IDG043)
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
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.getEmailToRastreio = async function (req, res, next) {
        let con = await this.controller.getConnection(req.con, req.UserId);

        let IDG043 = req.body.IDG043;
        let IDG051 = req.body.IDG051;

        try {
            let result = await con.execute({
                sql: `
          Select G043.IDG043,
                 G051.IDG051,
                 G051.IDG005CO,
                 G051.IDG005DE,
                 LISTAGG(G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT) OVER (PARTITION BY G008.IDG007) As DSEMAIL,
                 G043.DTBLOQUE,
                 G043.DTDESBLO,
                 G051.CDCTRC,
                 G061.IDG061,
                 G043.DTENTREG,
                 G043.DSEMACLI,
                 G043.DSEMARTV,
                 CASE
                     WHEN G043.DSEMACLI IS NOT NULL AND G043.DSEMARTV IS NOT NULL
                          THEN CONCAT(G043.DSEMACLI,', ' || G043.DSEMARTV)
                     WHEN G043.DSEMACLI IS NOT NULL AND G043.DSEMARTV IS NULL
                          THEN G043.DSEMACLI
                     WHEN G043.DSEMACLI IS NULL AND G043.DSEMARTV IS NOT NULL
                           THEN G043.DSEMARTV
                     ELSE NULL
                  END as DSEMASYN,
                  G022.IDG014
            From G043 G043
            Join G052 G052
              On (G043.IDG043 = G052.IDG043)
            Join G051 G051
              On (G052.IDG051 = G051.IDG051)
            Join G005 G005
              On (G005.IDG005 = G051.IDG005DE)
            Left Join G020 G020
              On (G020.IDG005 = G005.IDG005)
            Left Join G022 G022   
                On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
            Left Join G007 G007
              On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0)
            Left Join G008 G008
              On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0 And G008.TPCONTAT = 'E')
            Left Join G061 G061
              On (G051.IDG051 = G061.IDG051)
            Where G043.IDG043 = :IDG043 AND G051.IDG051 = :IDG051
            Group By G043.IDG043, G051.IDG051, G051.IDG005CO, G051.IDG005DE, G043.DTBLOQUE, G043.DTDESBLO, G051.CDCTRC, G061.IDG061, G043.DTENTREG, G043.DSEMACLI, G043.DSEMARTV, G022.IDG014, G008.IDG007, G008.DSCONTAT`,
                param: {
                    IDG043: IDG043,
                    IDG051: IDG051
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

    api.getEmailToNpsFromCte = async function (req, params) {
        let con = await this.controller.getConnection(req.con, null);

        let IDG051 = params.IDG051;

        try {
            let result = await con.execute({
                sql: `
          select x.*,
            (select idg014 from g022 g022 where g022.idg005 = x.idg005 and (g022.idg014 = 5 or g022.idg014 = 93 or g022.idg014 = 71) and G022.SnDelete = 0 AND NVL(G022.SNINDUST,1) = 1) as IDG014
            from (
            Select DISTINCT 
                 G051.IDG051,
                 G051.IDG005CO,
                 G051.IDG005DE,
                 LISTAGG(G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT) As DSEMAIL,
                 G043.DTBLOQUE,
                 G043.DTDESBLO,
                 G051.CDCTRC,
                 G061.IDG061,
                 G043.DTENTREG,
                 g005RE.idg005

            From G043 G043
            Join G052 G052
              On (G043.IDG043 = G052.IDG043)
            Join G051 G051
              On (G052.IDG051 = G051.IDG051)
            Join G005 G005
              On (G005.IDG005 = G051.IDG005DE AND G005.SNDELETE = 0)
            Join G005 G005RE
              On (G005RE.IDG005 = G051.IDG005RE)  
            Left Join G020 G020
              On (G020.IDG005 = G005.IDG005 AND nvl(G020.TPCONTAT,'C') <> 'I')
            Left Join G007 G007
              On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0 and G007.Idg006 not in (27,29))
            Left Join G008 G008
              On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0 And G008.TPCONTAT = 'E')
            Left Join G061 G061
              On (G051.IDG051 = G061.IDG051)
            Where G051.IDG051 = :IDG051
            Group By G043.IDG043, G051.IDG051, G051.IDG005CO, G051.IDG005DE, G043.DTBLOQUE, 
            G043.DTDESBLO, G051.CDCTRC, G061.IDG061, G043.DTENTREG, g005RE.idg005) x`,
                param: {
                    IDG051: IDG051
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

    api.getEmailToRastreioCte = async function (params) {
        let con = await this.controller.getConnection();

        let IDG051 = params.IDG051;

        try {
            let result = await con.execute({
                sql: `
           Select G051.IDG051,
                   G051.CDCTRC,
                   G051.IDG005CO,
                   G051.IDG005DE,
                   LISTAGG(G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT) As DSEMAIL
              From G051 G051
              Join G005 G005
                On (G005.IDG005 = G051.IDG005DE)
              Left Join G020 G020
                On (G020.IDG005 = G005.IDG005)
              Left Join G007 G007
                On (G007.IDG007 = G020.IDG007 And G007.SnDelete = 0)
              Left Join G008 G008
                On (G008.IDG007 = G007.IDG007 And G008.SnDelete = 0 And G008.TPCONTAT = 'E')
              Where G051.IDG051 = :IDG051
                    AND G008.DSCONTAT IS NOT NULL
              Group By G051.IDG051,G051.CDCTRC, G051.IDG005CO, 
                       G051.IDG005DE`,
                param: {
                    IDG051: IDG051
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

    api.getEmailToRastreioCtePorDelivery = async function (params) {
        let con = await this.controller.getConnection();

        let IDG051 = params.IDG051;

        try {
            let result = await con.execute({
                sql: `
          Select X.IDG051,
                  X.CDCTRC,
                  X.IDG005CO,
                  X.IDG005DE,
                  X.IDG061,
                  X.DTENTREG,
                  NVL2(DSEMAIL1, DSEMAIL1 , null) as DSEMAIL
            from (Select Distinct G051.IDG051,
                                  G051.CDCTRC,
                                  G051.IDG005CO,
                                  G051.IDG005DE,
                                  G061.IDG061,
                                  G043.DTENTREG,
                                  LISTAGG(G043.DSEMACLI, ',') WITHIN GROUP(ORDER BY G043.DSEMACLI) DSEMAIL1
                                  --LISTAGG(G043.DSEMARTV, ',') WITHIN GROUP(ORDER BY G043.DSEMARTV) As DSEMAIL2
                    From G051 G051
                    Join G052 G052
                      on G052.IDG051 = G051.IDG051
                    Join G043 G043
                      ON G043.IDG043 = G052.IDG043
                    Left Join G061 G061
                      On (G051.IDG051 = G061.IDG051)
                    Where G051.IDG051 = :IDG051
                      AND (G043.DSEMACLI IS NOT NULL OR G043.DSEMARTV IS NOT NULL)
                    Group By G051.IDG051, G051.CDCTRC, G051.IDG005CO, G051.IDG005DE, G061.IDG061, G043.DTENTREG) X`,
                param: {
                    IDG051: IDG051
                }
            })
                .then((result) => {
                    let result2 = '';
                    if (result.length > 0) {
                        if (result[0].DSEMAIL != '') {
                            //Removendo os e-mail duplicados
                            let emailAux = result[0].DSEMAIL;
                            let emailAux2 = emailAux.split(",");
                            let uniqueArray = [...new Set(emailAux2)];
                            result2 = result[0];
                            result2.DSEMAIL = uniqueArray.toString();
                            return result2;
                        } else {
                            //se não tiver e-mail cadastrado, apenas devolve o resultado
                            result2 = result[0];
                            result2.DSEMAIL = null;
                            return result2;
                        }
                    } else {
                        return result;
                    }

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

    api.getNotaVinculadasCTe = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        let IDG043 = req.body.IDG043;
        let IDG051 = req.body.IDG051;
        let IDG083 = req.body.IDG083;

        if (IDG083 == undefined || IDG083 == null || IDG083 == '') {
            whereAux = '';
        } else {
            whereAux = ` and G052.IDG083 =  ${IDG083} `;
        }

        if (IDG043 != '' && IDG043 != null) {
            sqlWhere = ` And G052.IDG051 = (Select Max(Distinct G051.IDG051) as IDG051
                                        From G051 G051
                                        Join G052 G052
                                          On (G051.IDG051 = G052.IDG051)
                                      Where G052.IDG043 = ` + IDG043 + `  ${whereAux}  and rownum = 1)`;
        }

        if (IDG051 != '' && IDG051 != null && req.body.NT_CTE) {
            sqlWhere = ` And G052.IDG051 = ` + IDG051;
        }

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        try {
            let result = await con.execute({
                sql: `
           Select Distinct NVL(G043.NRNOTA,G083.NRNOTA) AS IDG043, /* Nº NF-e */
                  G043.VRVOLUME, /* Volume da Nota */
                  NVL(G043.PSLIQUID,G083.PSLIQUID) AS PSLIQUID, /* Peso Liquido */
                  NVL(G043.PSBRUTO,G083.PSBRUTO) AS PSBRUTO, /* Peso Bruto */
                  NVL(G043.DTEMINOT,G083.DTEMINOT) AS DTEMINOT, /* Data de Emissão */
                  G043.IDG005RE,
                  G043.IDG005DE,
                  NVL(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC
             From G052 G052
             Left Join G043 G043
               On (G043.IDG043 = G052.IDG043)
             Left Join G083 G083
              On (G052.IDG083 = G083.IDG083)
             Left Join G051 G051
               On (G051.IDG051 = G052.IDG051) 
             Left Join G022 G022
               On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0)
             Left Join G014 G014
               On (G014.IdG014 = G022.IdG014)
             Left Join G024 G024
               On (G024.IdG024 = G051.IdG024)
             Where 1 = 1 ` + sqlWhere + sqlWhereAcl,
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

    api.getInformacoesCarga = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlAux;

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G046_IDG046: req.body.IDG046, tableName: "G043" }, false);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if (req.body.IDG083 != null && req.body.IDG083 != undefined && req.body.IDG083) {
            sqlAux = 'Left ';
        } else {
            sqlAux = '';
        }

        try {
            let result = await con.execute({
                sql: `
           Select Distinct G046.DSCARGA, /* Descrição da Carga */
                  G046.CDVIAOTI, /* Número da Carga */
                  G046.TPMODCAR, /* Tipo Carga Modelo 1 - 3PL, 2 - 4PL, 3 - Mista */
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
                  End As TPTRANSP, /* Tipo de Operação */
                  G046.DTSAICAR As DTSAICAR, /* Data Saída  */
                  G046.DTPRESAI As DTPRESAI, /* Data Previsão Saída  */
                  G024.NMTRANSP, /* Nome Transportadora */
                  G046.IDG046, /* Identificador da Carga */
                  G043.DTBLOQUE, /* Data de Bloqueio */
                  G043.DTDESBLO, /* Data de Desbloqueio */
                  G046.DTCARGA, /* Data de Criação */
                  G051.CDCARGA,
                  G046.STCARGA,
                  G048.STINTCLI,
                  Nvl(TO_CHAR(G048.DTPREORI, 'DD/MM/YYYY'), null) AS DTPREORI
                  
             From G043 G043
             Join G052 G052
              On (G052.IDG043 = G043.IDG043)
             ${sqlAux} Join G051 G051
              On (G052.IDG051 = G051.IDG051)
             --Left Join G049 G049   On (G049.IDG043 = G043.IDG043 and G049.Idg051 is null) Or G049.IDG051 = G051.IDG051 
             /*Left Join G048 G048
               On (G049.IDG048 = G048.IDG048)*/
             /*Left Join G046 G046
               On (G048.IDG046 = G046.IDG046)*/
             Left Join G052 G052
               On (G052.IDG043 = G043.IDG043)
             Left Join G051 G051
               On (G051.IDG051 = G052.IDG051) 
             Left Join G022 G022
               On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1)
             Left Join G014 G014
               On (G014.IdG014 = G022.IdG014)
             /*Left Join G024 G024 
               On (G024.IdG024 = G051.IdG024)
              Left Join G024 G024 On (G051.IDG024 = G024.IDG024)*/
             Left Join G049 G049   On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
              Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
              Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
              Left Join G024 G024   On (G046.IDG024 = G024.IDG024)
            ` + sqlWhere + `and G046.STCARGA <> 'C'` + sqlWhereAcl,
                param: bindValues
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

    api.getParadasFromCarga = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ G048_IDG046: req.body.IDG046, tableName: "G048" }, false);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        try {
            let result = await con.execute({
                sql: `
          Select  G048.NRSEQETA,
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
                  G003DE.NMCIDADE || ' - ' || G002DE.CDESTADO As NMCIDADEDE,
                  G048.IDG048,
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
              ` + sqlWhereAcl,
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

    api.getInformacoesRastreamento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;
        let IDG051 = req.body.IDG051;
        let IDG083 = req.body.IDG083;

        try {
            let result = await con.execute({
                sql: `
          Select  TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY') as DTEMICTR, /* Data Emissão CTE */
                  NVL(TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY'), TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY')) as DTEMINOT, /* Data Emissão NFe */
                  TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') as DTENTCON, /* Data SLA */
                  G043.TXCANHOT,
                  TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') as DTSAICAR,
                  TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY') as DTBLOQUE, /* Data de Bloqueio */
                  TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY') as DTDESBLO, /* Data de Desbloqueio */
                  TO_CHAR(Nvl(G051.DTCOLETA,Nvl(G046.DTCOLORI, G046.DTCOLATU)), 'YYYY-MM-DD') As DTCOLETA, /* Data Coleta */

                  Case
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                    Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                    End as DTPREENT, /* Data de Previsão de Entrega */

                  TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') as DTENTREG,
                  G043.TPDELIVE,
                  G043.IDG043
            From G043 G043
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
            Left Join G048 G048
              On (G049.IDG048 = G048.IDG048)
            Left Join G046 G046
              On (G048.IDG046 = G046.IDG046)
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Left Join G083 G083
              On (G052.IDG083 = G083.IDG083)
            Left Join G051 G051
              On (G051.IDG051 = G052.IDG051)
            Where G043.IDG043 = :IDG043 and G051.IDG051 = :IDG051 and G083.IDG083 = :IDG083`,
                param: {
                    IDG043: IDG043,
                    IDG051: IDG051,
                    IDG083: IDG083
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

    api.getInformacoesTracking = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select  G060.IDG060,
                  ROWNUM,
                  G060.IDG043,
                  --G060.DTPOSICA,
                  TO_CHAR(G060.DTPOSICA,'DD/MM/YYYY HH24:MI:SS') as DTPOSICA,
                  G060.DSLOCALI,
                  G060.NRLATITU,
                  G060.NRLONGIT,
                  G043.DTBLOQUE,
                  G043.DTDESBLO
            From G060 G060
            Join G043 G043
              On (G043.IDG043 = G060.IDG043)
            Where G060.IDG043 = :IDG043 AND NVL(G060.TPINTEGR,0) <> 3
            Order By G060.DTPOSICA Desc`,
                param: {
                    IDG043: IDG043
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

    api.isEntregue = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            // - Verifica se a nota está entregue.
            let isEntregue = await con.execute({
                sql: `
          Select Count(1) As QTD
            From G043 G043
           Where G043.IDG043 = :IDG043
             And G043.DTENTREG Is Not Null`,
                param: {
                    IDG043: IDG043
                }
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - Já existe carga montada, então não é necessário inserir data de roteirização.
            let needDataRoteri = await con.execute({
                sql: `
          Select Sum(x.QTD) As QTD
            From (Select Count(1) As QTD
                    From G043 G043
                    Join G052 G052
                      On (G052.IdG043 = G043.IdG043)
                    Join G049 G049
                      On (G052.IdG051 = G049.IdG051)
                  Where G052.IdG043 = :IDG043
                  
                  Union All
                  
                  Select Count(1) As QTD
                    From G043 G043
                    Join G052 G052
                      On (G052.IdG043 = G043.IdG043)
                    Join G049 G049
                      On (G052.IdG043 = G049.IdG043)
                  Where G049.IdG043 = :IDG043) x`,
                param: {
                    IDG043: IDG043
                }
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            let IDS001 = 0;
            if (req.UserId != '' && req.UserId != null) {
                IDS001 = req.UserId;
            }

            // - Verifica se o usuário pertence ao grupo do Transporte
            // Ou do SAC pra saber se o mesmo pode movimentar atendimentos/alterar datas
            let canMovAtendimento = await con.execute({
                sql: `
            Select Count(S027.IdS001) As QTD
            From S027 S027
            Join S026 S026
              On (S026.IdS026 = S027.IdS026)
           Where S026.IdS026 in (179,320) 
             And S027.IdS001 = :IDS001`,
                param: {
                    IDS001: IDS001
                }
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - Cria o objeto para retornar na função.
            needDataRoteri.QTD = false;

            let retorno = {
                isEntregue: isEntregue.QTD,
                canMovAtendimento: canMovAtendimento.QTD,
                needDataRoteri: needDataRoteri.QTD
            }

            await con.close();
            return retorno;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.isEnviadoSatisfacao = async function (req, res, next) {
        let con = await this.controller.getConnection(req.con, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select Count(1) As QTD
          From G043 G043
          Join G052 G052
            On (G052.IDG043 = G043.IDG043)
          Join G051 G051
            On (G051.IDG051 = G052.IDG051) 
          Join G061 G061
            On (G061.IDG051 = G051.IDG051)
         Where G043.IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
                }
            })
                .then((result) => {
                    return result[0].QTD;
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

    api.getNumeroCteFromNfe = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select G051.IDG051
            From G043 G043
            Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Join G051 G051
              On (G051.IDG051 = G052.IDG051)
           Where G043.IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
                }
            })
                .then((result) => {
                    return result[0].IDG051;
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

    api.isValidSendRastreio = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select Case
                  When G043.DtEntreg Is Not Null Then 
                    72 * (To_Date(To_Char(current_date, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24') - To_Date(To_Char(G043.DtEntreg, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24'))
                  Else 
                    1 
                  End As VALIDO 
            From G043 G043
           Where IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
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

    api.enviarSatisfacao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select Case
                  When G043.DtEntreg Is Not Null Then 
                    72 * (To_Date(To_Char(current_date, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24') - To_Date(To_Char(G043.DtEntreg, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24'))
                  Else 
                    1 
                  End As VALIDO 
            From G043 G043
           Where IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
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

    api.salvarCteSatisfacao = async function (req, params) {
        let con = await this.controller.getConnection(req.con, req.UserId);

        try {
            let result = await con.insert({
                tabela: `G061`,
                colunas: {
                    IDG051: params.IDG051,
                    DTENVIO: new Date()
                },
                key: `G061.IDG061`
            })
                .then((result1) => {
                    return result1;
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

    api.getDashboardIndicadores = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        let sqlWhere = '';

        if (req.body.G043_DTEMINOT != null) {
            sqlWhere += ` And To_Date(G043.DTEMINOT, 'dd/mm/YY') Between To_Date('` + req.body.G043_DTEMINOT[0] + `','DD/MM/YYYY') AND To_Date('` + req.body.G043_DTEMINOT[1] + `','DD/MM/YYYY') `;
        }

        if (req.body.G014_IDG014 != null) {
            if (req.body.G014_IDG014.hasOwnProperty('in')) {
                if (req.body.G014_IDG014.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.join() + ')';
                }
            }
        }

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }
        
        try {
            let result = await con.execute({
                sql: `
          Select (X.QtAtivo+X.QtEntAtr+X.QtEntPra) As QtTotal, X.*, Round((X.QtEntPra * 100) / DECODE(((X.QtAtivo+X.QtEntAtr+X.QtEntPra) - X.QtAtivo),0,1,((X.QtAtivo+X.QtEntAtr+X.QtEntPra) - X.QtAtivo)), 2) As PcEntPra
          From
          (
          Select 
                  ( Select 
                              Count(Distinct G051.IdG051)
                              /* Distinct G043.Dtentcon, G051.DtCalAnt, G051.DtEntPla, G051.DtCalDep, G051.DtAgenda, G051.DtCombin, G043.DtEntreg, G051.* */
                    From      G043 G043
                    Join      G052 G052 On G052.IdG043 = G043.IdG043
                    Join      G051 G051 On G051.IdG051 = G052.IdG051
                    Left Join G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
                    Left Join G014 G014 On G014.IdG014 = G022.IdG014
                    /*Left Join G024 G024 On G024.IdG024 = G051.IdG024*/
                    Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
                    Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                    Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                    Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
                    Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
                              And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                              Or G043.DtBloque Is Null)
                              And G051.DtColeta Is Not Null
                  ) As QtTotal_2,

                  ( Select 
                              Count(Distinct ` + (req.body.VISAO == "CTE" ? 'G051.IdG051' : 'G043.IdG043') + `)
                              /* Distinct G043.Dtentcon, G051.DtCalAnt, G051.DtEntPla, G051.DtCalDep, G051.DtAgenda, G051.DtCombin, G043.DtEntreg, G051.* */

                    From      G043 G043
                    Join      G052 G052 On G052.IdG043 = G043.IdG043
                    Join      G051 G051 On G051.IdG051 = G052.IdG051
                    Left Join G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
                    Left Join G014 G014 On G014.IdG014 = G022.IdG014
                    /*Left Join G024 G024 On G024.IdG024 = G051.IdG024*/
                    Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
                    Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                    Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                    Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
                    Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
                              And G043.DtEntreg Is Null
                              And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                              Or G043.DtBloque Is Null)
                              And G051.DtColeta Is Not Null
                  ) As QtAtivo,  

                  ( Select  Count(Distinct ` + (req.body.VISAO == "CTE" ? 'X.IdG051' : 'X.IdG043') + `)
                    From
                    (   Select 
                                  Distinct G051.IdG051,
                                  G043.IdG043,
                                  To_Date(Nvl(G051.DtCombin, Nvl(G051.DtAgenda, Nvl(G051.DtCalDep, Nvl(G051.DtEntPla, Nvl(G051.DtCalAnt,G043.Dtentcon) ) ) ) ), 'dd/mm/YY') As DtPrevis,
                                  To_Date(G043.DtEntreg, 'dd/mm/YY') As DtEntreg 
                        From      G043 G043
                        Join      G052 G052 On G052.IdG043 = G043.IdG043
                        Join      G051 G051 On G051.IdG051 = G052.IdG051
                        Left Join G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
                        Left Join G014 G014 On G014.IdG014 = G022.IdG014
                        /*Left Join G024 G024 On G024.IdG024 = G051.IdG024*/
                        Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
                        Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                        Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                        Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
                        Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
                                  And G043.DtEntreg Is Not Null
                                  And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                  Or G043.DtBloque Is Null)
                                  And G051.DtColeta Is Not Null
                    ) X 
                    Where   X.DtEntreg > X.DtPrevis
                  ) As QtEntAtr,
                  
                  ( Select Count(Distinct ` + (req.body.VISAO == "CTE" ? 'X.IdG051' : 'X.IdG043') + `)
                    From
                    ( Select 
                                Distinct G051.IdG051,
                                G043.IdG043,
                                To_Date(Nvl(G051.DtCombin, Nvl(G051.DtAgenda, Nvl(G051.DtCalDep, Nvl(G051.DtEntPla, Nvl(G051.DtCalAnt,G043.Dtentcon) ) ) ) ), 'dd/mm/YY') As DtPrevis,
                                To_Date(G043.DtEntreg, 'dd/mm/YY') As DtEntreg 
                      From      G043 G043
                      Join      G052 G052 On G052.IdG043 = G043.IdG043
                      Join      G051 G051 On G051.IdG051 = G052.IdG051
                      Left Join G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
                      Left Join G014 G014 On G014.IdG014 = G022.IdG014
                      /*Left Join G024 G024 On (G024.IdG024 = G051.IdG024)*/
                      Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
                      Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                      Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                      Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
                      Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
                                And G043.DtEntreg Is Not Null
                                And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                Or G043.DtBloque Is Null)
                                And G051.DtColeta Is Not Null
                    ) X 
                    Where       X.DtEntreg <= X.DtPrevis
                  ) As QtEntPra

          From Dual
          ) X`,
                param: {

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

    api.getDashboardDiasEmAtraso = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        if (req.body.G043_DTEMINOT != null) {
            sqlWhere += ` And G043.DTEMINOT Between To_Date('` + req.body.G043_DTEMINOT[0] + `','DD/MM/YYYY') AND To_Date('` + req.body.G043_DTEMINOT[1] + `','DD/MM/YYYY') `;
        }

        if (req.body.G014_IDG014 != null) {
            if (req.body.G014_IDG014.hasOwnProperty('in')) {
                if (req.body.G014_IDG014.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.join() + ')';
                }
            }
        }

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        try {
            let result = await con.execute({
                sql: `
          Select  Count(X2.NrDias) As QtdDias, X2.NrDias
          From
                  (   Select 
                              Distinct ` + (req.body.VISAO == "CTE" ? 'X1.IdG051' : 'X1.IdG043') + `,
                              Case
                              When X1.NrDias > 4 Then 4
                                Else X1.NrDias
                              End As NrDias 
                      From 
                              (Select X.*,
                              (To_Date(To_Char(current_date, 'YYYY-MM-DD'), 'YYYY-MM-DD') - To_Date(To_Char(X.DtPrevis, 'YYYY-MM-DD'), 'YYYY-MM-DD')) As NrDias
                              From
                                    (   Select 
                                                Distinct 
                                                G051.IdG051,
                                                G043.IdG043,
                                                Nvl(G051.DtCombin, Nvl(G051.DtAgenda, Nvl(G051.DtCalDep, Nvl(G051.DtEntPla, Nvl(G051.DtCalAnt,G043.Dtentcon) ) ) ) ) As DtPrevis
                                    From        G043 G043
                                    Join        G052 G052 On G052.IdG043 = G043.IdG043
                                    Join        G051 G051 On G051.IdG051 = G052.IdG051
                                    Left Join   G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1 
                                    Left Join   G014 G014 On G014.IdG014 = G022.IdG014
                                    /*Left Join   G024 G024 On G024.IdG024 = G051.IdG024*/
                                    Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
                                    Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                                    Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                                    Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
                                    Where       1 = 1 ` + sqlWhere + sqlWhereAcl + `
                                                And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                                Or G043.DtBloque Is Null)
                                                And G043.DtEntreg Is Null
                                                And G051.DtColeta Is Not Null
                                    ) X
                              ) X1 
                      Where   X1.NrDias >= 1
                  ) X2
          Group By X2.NrDias
          Order By X2.NrDias`,
                param: {

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

    api.getDashboardEntregas = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        if (req.body.G043_DTEMINOT != null) {
            sqlWhere += ` And G043.DTEMINOT Between To_Date('` + req.body.G043_DTEMINOT[0] + `','DD/MM/YYYY') AND To_Date('` + req.body.G043_DTEMINOT[1] + `','DD/MM/YYYY') `;
        }

        if (req.body.G014_IDG014 != null) {
            if (req.body.G014_IDG014.hasOwnProperty('in')) {
                if (req.body.G014_IDG014.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.join() + ')';
                }
            }
        }

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        try {
            let result = await con.execute({
                sql: `
          Select  Count(X.DtEntreg) As QtEntreg, To_Char(X.DtEntreg,'DD/MM/YYYY') As DTENTREG
          From 
                  (   Select 
                                Distinct 
                                G051.IdG051, 
                                To_Date(To_Char(G043.DtEntreg, 'YYYY-MM-DD'), 'YYYY-MM-DD') As DtEntreg
                      From      G043 G043
                      Join      G052 G052 On G052.IdG043 = G043.IdG043
                      Join      G051 G051 On G051.IdG051 = G052.IdG051
                      Left Join G022 G022 On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
                      Left Join G014 G014 On G014.IdG014 = G022.IdG014
                      /*Left Join G024 G024 On G024.IdG024 = G051.IdG024*/
                      Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
                      Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
                      Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
                      Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
                      Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
                                And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                Or G043.DtBloque Is Null)
                                And G043.DtEntreg Is Not Null
                                And G051.DtColeta Is Not Null
                  ) X
          Group By X.DtEntreg
          Order By X.DtEntreg`,
                param: {

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

    api.getDashboardDemanda = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });

        if (req.body.G043_DTEMINOT != null) {
            sqlWhere += ` And G043.DTEMINOT Between To_Date('` + req.body.G043_DTEMINOT[0] + `','DD/MM/YYYY') AND To_Date('` + req.body.G043_DTEMINOT[1] + `','DD/MM/YYYY') `;
        }

        if (req.body.G014_IDG014 != null) {
            if (req.body.G014_IDG014.hasOwnProperty('in')) {
                if (req.body.G014_IDG014.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G014.IDG014 In  (' + req.body.G014_IDG014.in.join() + ')';
                }
            }
        }

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        try {
            let result = await con.execute({
                sql: `
          Select  To_char(X2.Dteminot,'DD/MM/YYYY') As DTEMINOT, X2.SnG051, Round(((X2.QtNotas / X2.QtTotal) * 100), 2) As  PcNotas, X2.QtTotal
          From (
                  Select  X1.*,
                          SUM(X1.QtNotas) OVER(PARTITION BY X1.Dteminot ORDER BY X1.Dteminot RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS QtTotal
                  From 
                        (
                        Select  Count(X.IdG043 || X.IdG051) As QtNotas,
                                X.SnG051, 
                                X.Dteminot
                        From
                        (   Select 
                            Distinct 
                                      Case 
                                      When G051.IdG051 Is Not Null Then 1
                                      Else 0 End As SnG051,
                                      G051.IdG051,  G043.IdG043,
                                      To_Date(To_Char(G043.Dteminot, 'YYYY-MM-DD'), 'YYYY-MM-DD') As Dteminot
                            From      G043 G043
                            Left Join G052 G052 On G052.IdG043 = G043.IdG043
                            Left Join G051 G051 On G051.IdG051 = G052.IdG051
                            Left Join G022 G022 On G022.IdG005 = G043.IdG005TO AND NVL(G022.SNINDUST,1) = 1
                            Left Join G014 G014 On G014.IdG014 = G022.IdG014
                            Left Join G024 G024 On G024.IdG024 = G051.IdG024
                            Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
                                      And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                      Or G043.DtBloque Is Null)
                        ) X
                  Group By X.SnG051, X.Dteminot
                  ) X1
                  Order By X1.Dteminot,X1.SnG051
          ) X2
          Order By X2.Dteminot,X2.SnG051`,
                param: {

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

    api.getRastreio = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //console.log('req', req.body);
        try {
            let result = await con.execute({
                sql: `
          Select 		X.*, 
              Case
              When X.NrHoras > 480 Then 0 Else 1 End As IsLibera,
              TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
              Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
              TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
              SYSTIMESTAMP
          From 
              (        
                  Select 	G043.CDRASTRE,
                          Case 
                            When G043.DtEntreg Is Not Null Then 
                            480 * (To_Date(To_Char(current_date, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24') - To_Date(To_Char(G043.DtEntreg, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24'))
                            Else 
                              0 
                          End As NrHoras,
                          G043.IDG043
                  From  	G043 G043
                  Where ` + (req.body.IDG043 != undefined && req.body.IDG043 != null ? ` G043.IDG043 =` + req.body.IDG043 : ` G043.CDRASTRE = '` + req.body.CDRASTRE + `'`) + `
              ) X`,
                param: {

                }
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (req.body.IDG043 != undefined && req.body.IDG043 != null && req.body.CDRASTRE == null) {
                await con.execute({
                    sql: `        
          Update  G043 G043
              Set G043.CDRASTRE = :CDRASTRE
            Where G043.IDG043 = :IDG043`,
                    param: {
                        IDG043: req.body.IDG043,
                        CDRASTRE: result.CONVERTIDO
                    }
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            }
            await con.close();

            return {
                CDRASTRE: (req.body.CDRASTRE != undefined && req.body.CDRASTRE != null ? req.body.CDRASTRE : result.CONVERTIDO),
                ISLIBERA: (result != undefined && result != null ? result.ISLIBERA : 0),
                IDG043: (result != undefined && result != null ? result.IDG043 : 0)
            };
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }

    // função para fazer envio do rastreio por CTE e não somente por nota
    api.getRastreioPorCTE = async function (params) {
        let con = await this.controller.getConnection();
        //console.log('getRastreioPorCTE ', params);
        let resultDelivery = null;
        let resultNrNotaEmail = null;
        let whereAuxNota = '';
        let whereAuxCte = '';
        let ISLIBERA = 0;
        let CDOPERAC = null;

        if (params.IDG043 != null && params.IDG043 != undefined) {
            whereAuxNota = ` And G043.IDG043 = ${params.IDG043} `;
        } else {
            whereAuxNota = '';
        }

        try {
            let result = await con.execute({
                sql: `
          Select    X.*, 
              Case
              When X.NrHoras > (480*10) Then 0 Else 1 End As IsLibera,
              TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
              Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
              TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
              SYSTIMESTAMP
          From 
              (        
                  Select  G051.CDRASTRE,
                          Case 
                            When MAX(G043.DtEntreg) Is Not Null Then 
                              480 * (To_Date(To_Char(current_date, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24') - To_Date(To_Char(MAX(G043.DtEntreg), 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24'))
                            Else 
                              0 
                          End As NrHoras,
                          G051.IDG051,
                          G051.IDG005DE,
                          G022.IDG014
                  From    G043 G043
                  INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                  INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                  INNER JOIN G022 G022 ON (G022.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE) AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0)
                  WHERE ` + (params.IDG051 != undefined && params.IDG051 != null ? ` G051.IDG051 =` + params.IDG051 : ` G051.CDRASTRE = '` + params.CDRASTRE + `'`) + ` And G051.TPTRANSP = 'V'
                  GROUP BY G051.CDRASTRE, G051.IDG051, G043.DtEntreg, G022.IDG014, G051.IDG005DE
              ) X`,
                param: {

                }
            })
                .then((result) => {
                    //console.log(result);
                    return result;
                })
                .catch((err) => {
                    console.log(err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (result != null && result != undefined && result.length > 0) {
                whereAuxCte = ' Where G051.IDG051 In  (' + result.map(e => e.IDG051).join() + ') ';

                if (params.IDG051 != undefined && params.IDG051 != null && params.CDRASTRE == null && result[0].CDRASTRE == null) {
                    //console.log("entrou no update IDG051 CDRASTRE");
                    await con.execute({
                        sql: `        
            Update  G051 G051
                Set G051.CDRASTRE = :CDRASTRE
              Where G051.IDG051 = :IDG051`,
                        param: {
                            IDG051: params.IDG051,
                            CDRASTRE: result[0].CONVERTIDO
                        }
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }

                if (params.CDRASTRE != undefined && params.CDRASTRE != null && params.IDG051 == null) {
                    resultDelivery = await con.execute({
                        sql: `
            SELECT DISTINCT G051.IDG051, G051.CDCTRC, G043.IDG043, G083.IDG083, NVL(G043.NRNOTA,G083.NRNOTA) AS NRNOTA, G043.CDDELIVE, NVL(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC
                  FROM G051 G051
                  INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
                  INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
                  INNER JOIN G083 G083 ON G083.IDG083 = G052.IDG083
                  ${whereAuxCte} ${whereAuxNota}
                        AND G051.STCTRC = 'A'
                        AND G051.SNDELETE = 0 
                        AND G043.SNDELETE = 0
                        AND G083.SNDELETE = 0`,
                        param: {

                        }
                    })
                        .then((resultNota) => {
                            //console.log(resultNota);
                            return resultNota;
                        })
                        .catch((err) => {
                            console.log(err);
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }
                //await con.close();

                //populando objeto de notas que é mostrado no corpo do e-mail de rastreio
                resultNrNotaEmail = await con.execute({
                    sql: `
              SELECT G051.IDG051, 
                      G051.CDCTRC, 
                      G051.CDRASTRE,
                      G043.IDG043, 
                      NVL(G043.NRNOTA,G083.NRNOTA) AS NRNOTA, 
                      G043.CDDELIVE, 
                      NVL(G043.NRCHADOC,G083.NRCHADOC) AS NRCHADOC,
                      Nvl(TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY'),TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY')) AS DTEMINOT, 
                      TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY') as DTBLOQUE, /* Data de Bloqueio */
                      TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY') as DTDESBLO, /* Data de Desbloqueio */
                      TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') as DTENTREG,

                      (SELECT 
                          TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') as DTSAICAR
                          FROM G046 G046
                          JOIN G048 G048 ON (G046.IDG046 = G048.IDG046)
                          JOIN G049 G049 ON (G049.IDG048 = G048.IDG048)
                            
                          WHERE G049.IDG051 = G051.IDG051 AND G046.STCARGA <> 'C'
                          ORDER BY G046.IDG046 DESC FETCH FIRST ROW ONLY
                      )  AS DTSAICAR,

                      TO_CHAR(G051.DTCOLETA, 'YYYY-MM-DD') As DTCOLETA, /* Data Coleta */

                      Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                            Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                            Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                            Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End as DTPREENT /* Data de Previsão de Entrega */


                    FROM G051 G051
                    INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
                    INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
                    INNER JOIN G083 G083 ON G083.IDG083 = G052.IDG083
                    ${whereAuxCte} ${whereAuxNota}
                          AND G051.STCTRC = 'A'
                          AND G051.SNDELETE = 0 
                          AND G043.SNDELETE = 0
                          AND G083.SNDELETE = 0`,
                    param: {

                    }
                })
                    .then((resultNota) => {
                        //console.log(resultNota);
                        return resultNota;
                    })
                    .catch((err) => {
                        console.log(err);
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                if (resultNrNotaEmail != null && resultNrNotaEmail != undefined && resultNrNotaEmail.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        if (resultNrNotaEmail[0].IDG051 == result[i].IDG051) {
                            ISLIBERA = result[i].ISLIBERA;
                            CDOPERAC = result[i].IDG014;
                            break;
                        }
                    }
                }
            }

            await con.close();

            return {
                CDRASTRE: (params.CDRASTRE != undefined && params.CDRASTRE != null ? params.CDRASTRE : (result[0].CDRASTRE != null ? result[0].CDRASTRE : result[0].CONVERTIDO)),
                CDOPERAC: (result[0] != undefined && result[0] != null ? CDOPERAC : null),
                ISLIBERA: (result[0] != undefined && result[0] != null ? ISLIBERA : 0),
                IDG051: (resultNrNotaEmail != undefined && resultNrNotaEmail != null ? resultNrNotaEmail[0].IDG051 : null),
                IDG043: (resultDelivery != undefined && resultDelivery != null ? resultDelivery : null),
                NRNOTEMA: (resultNrNotaEmail != undefined && resultNrNotaEmail != null ? resultNrNotaEmail : null)
            };
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }

    api.getSatisfacao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await con.execute({
                sql: `
          Select 		X.*, 
              Case
              When X.NrHoras > 24 Then 1 Else 1 End As IsLibera,
              TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
              Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
              TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
              SYSTIMESTAMP
          From 
              (        
                Select G051.CDSATISF,
                       Case 
                        When G043.DtEntreg Is Not Null Then 
                          1
                        Else
                          0
                       End As NrHoras,
                       G051.IDG051,
                       G043.IDG043,
                       G061.IDG061,
                       G061.NRNOTA,
                       G061.DTAVALIA,
                       G022.IDG014,
                       G061.DSCOMENT 
                  From G051 G051
                  Join G052 G052 
                    On (G052.IDG051 = G051.IDG051) 
                  Join G043 G043
                    On (G043.IDG043 = G052.IDG043)
                  Left Join G061
                    On (G061.IDG051 = G051.IDG051)
                  Left Join G022 G022 
                    On G022.IDG005 = G051.IDG005RE AND NVL(G022.SNINDUST,1) = 1
                  Where ` + (req.body.IDG043 != undefined && req.body.IDG043 != null ? ` G043.IDG043 =` + req.body.IDG043 : ` G051.CDSATISF = '` + req.body.CDSATISF + `'`) + `
              ) X`,
                param: []
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });


            if (!(result.NRNOTA)) {

                if (req.body.IDG051 != undefined && req.body.IDG043 != null && req.body.CDSATISF == null) {
                    await con.execute({
                        sql: `        
            Update  G051 G051
                Set G051.CDSATISF = :CDSATISF
              Where G051.IDG051 = :IDG051`,
                        param: {
                            IDG051: req.body.IDG051,
                            CDSATISF: result.CONVERTIDO
                        }
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }

            }

            if (!(result.NRNOTA)) {

           /*      if (req.body.UNSUB != null && req.body.UNSUB != '') {
                    await con.execute({
                        sql: `        
                            Update G022 Set SNSATISF = 0 
                            Where IDG005 = (Select G051.IDG005DE From G051 G051 Where G051.IDG051 = :IDG051)
                            And IDG014 = (Select Distinct G022.IDG014 From G051 G051
                                            Join G052 G052 On (G052.IDG051 = G051.IDG051)
                                            Join G043 G043 On (G052.IDG043 = G043.IDG043)
                                            Join G022 G022 On (G022.IDG005 = NVL(G051.IdG005CO, G043.IDG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                                            Where G051.IDG051 = :IDG051)
                            And SNINDUST = 0`,
                        param: {
                            IDG051: result.IDG051
                        }
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                } else { */
                    if (req.body.NRNOTA != null && req.body.NRNOTA != '') {
                        let changeNota = await con.update({
                            tabela: `G061`,
                            colunas: {
                                NRNOTA: req.body.NRNOTA,
                                DTAVALIA: new Date()
                            },
                            condicoes: `G061.IDG061 = :id`,
                            parametros: {
                                id: result.IDG061
                            }
                        })
                            .then((result1) => {
                                return result1;
                            })
                            .catch((err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                            });
                    }
                //}
            }


            await con.close();

            let nrNotas = await con.execute({
                sql: `Select Distinct NVL(G043.NRNOTA,G083.NRNOTA) AS NRNOTA
              From G043 G043
              Join G052 G052
                On (G052.IDG043 = G043.IDG043)
              Join G083 G083
                On (G052.IDG083 = G083.IDG083)
             Where G052.IDG051 = :IDG051`,
                param: {
                    IDG051: result.IDG051
                }
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            return {
                CDSATISF: (req.body.CDSATISF != undefined && req.body.CDSATISF != null ? req.body.CDSATISF : result.CONVERTIDO),
                ISLIBERA: (result != undefined && result != null ? result.ISLIBERA : 0),
                IDG043: (result != undefined && result != null ? result.IDG043 : 0),
                IDG051: (result != undefined && result != null ? result.IDG051 : 0),
                IDG061: (result != undefined && result != null ? result.IDG061 : 0),
                NRNOTA: (result != undefined && result != null ? result.NRNOTA : 0),
                G043_NRNOTA: (nrNotas != undefined && nrNotas != null ? nrNotas : 0),
                DTAVALIA: (result != undefined && result != null ? result.DTAVALIA : 0),
                IDG014: (result != undefined && result != null ? result.IDG014 : 0),
                DSCOMENT: (result != undefined && result != null ? result.DSCOMENT : 0)

            };
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }

    api.getSatisfacaoFromCte = async function (req, params) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await con.execute({
                sql: `
          Select    X.*, 
              Case
              When X.NrHoras > 24 Then 1 Else 1 End As IsLibera,
              TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
              Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
              TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
              SYSTIMESTAMP
          From 
              (        
                Select G051.CDSATISF,
                       Case 
                        When G043.DtEntreg Is Not Null Then 
                          1
                        Else
                          0
                       End As NrHoras,
                       G051.IDG051,
                       G043.IDG043,
                       G061.IDG061,
                       G061.NRNOTA,
                       G061.DTAVALIA
                  From G051 G051
                  Join G052 G052 
                    On (G052.IDG051 = G051.IDG051) 
                  Join G043 G043
                    On (G043.IDG043 = G052.IDG043)
                  Left Join G061
                    On (G061.IDG051 = G051.IDG051)
                  Where ` + (params.IDG051 != undefined && params.IDG051 != null ? ` G051.IDG051 =` + params.IDG051 : ` G051.CDSATISF = '` + params.CDSATISF + `'`) + `
              ) X`,
                param: []
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });


            if (!(result.NRNOTA)) {

                if (params.IDG051 != undefined && params.CDSATISF == null) {
                    await con.execute({
                        sql: `        
            Update  G051 G051
                Set G051.CDSATISF = :CDSATISF
              Where G051.IDG051 = :IDG051`,
                        param: {
                            IDG051: params.IDG051,
                            CDSATISF: result.CONVERTIDO
                        }
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }
            }

            if (!(result.NRNOTA)) {

              /*   if (params.UNSUB != null && params.UNSUB != '') {
                    await con.execute({
                        sql: `        
                        Update G022 Set SNSATISF = 0 
                        Where IDG005 = (Select G051.IDG005DE From G051 G051 Where G051.IDG051 = :IDG051)
                        And IDG014 = (Select Distinct G022.IDG014 From G051 G051
                                        Join G052 G052 On (G052.IDG051 = G051.IDG051)
                                        Join G043 G043 On (G052.IDG043 = G043.IDG043)
                                        Join G022 G022 On (G022.IDG005 = NVL(G051.IdG005CO, G043.IDG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                                        Where G051.IDG051 = :IDG051)
                        And SNINDUST = 0`,
                        param: {
                            IDG051: result.IDG051
                        }
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                } else { */
                    if (params.NRNOTA != null && params.NRNOTA != '') {
                        let changeNota = await con.update({
                            tabela: `G061`,
                            colunas: {
                                NRNOTA: params.NRNOTA,
                                DTAVALIA: new Date()
                            },
                            condicoes: `G061.IDG061 = :id`,
                            parametros: {
                                id: result.IDG061
                            }
                        })
                            .then((result1) => {
                                return result1;
                            })
                            .catch((err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                            });
                    }
               // }
            }

            //await con.close(); 

            let nrNotas = await con.execute({
                sql: `Select Distinct NVL(G043.NRNOTA,G083.NRNOTA) AS NRNOTA
              From G043 G043
              Join G052 G052
                On (G052.IDG043 = G043.IDG043)
              Join G083 G083
                On (G052.IDG083 = G083.IDG083)
             Where G052.IDG051 = :IDG051`,
                param: {
                    IDG051: result.IDG051
                }
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();

            return {
                CDSATISF: (params.CDSATISF != undefined && params.CDSATISF != null ? params.CDSATISF : result.CONVERTIDO),
                ISLIBERA: (result != undefined && result != null ? result.ISLIBERA : 0),
                IDG043: (result != undefined && result != null ? result.IDG043 : 0),
                IDG051: (result != undefined && result != null ? result.IDG051 : 0),
                IDG061: (result != undefined && result != null ? result.IDG061 : 0),
                NRNOTA: (result != undefined && result != null ? result.NRNOTA : 0),
                G043_NRNOTA: (nrNotas != undefined && nrNotas != null ? nrNotas : 0),
                DTAVALIA: (result != undefined && result != null ? result.DTAVALIA : 0)
            };
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }


    api.salvarSatisfacao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG051 = req.body.IDG051;
        let IDG061 = req.body.IDG061;
        let NRNOTA = req.body.NRNOTA;
        let DSCOMENT = req.body.DSCOMENT;
        let NMAVALIA = req.body.NMAVALIA;

        try {
            let result = await con.update({
                tabela: `G061`,
                colunas: {
                    NRNOTA: NRNOTA,
                    DSCOMENT: DSCOMENT,
                    NMAVALIA: NMAVALIA,
                    DTAVALIA: new Date()
                },
                condicoes: `G061.IDG061 = :id`,
                parametros: {
                    id: IDG061
                }
            })
                .then((result1) => {
                    return result1;
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

    api.getComentario = async function (req, res, next) {
        let con = await this.controller.getConnection();
        let IDG061 = req.body.IDG061;

        let sql = `
            SELECT 
              G061.DSCOMENT,
              G061.DSAVALID,
              G061.NRNOTA
            FROM G061 G061
            WHERE G061.IDG061 = ${IDG061}
        `;

        try {
            let result = await con.execute({
                sql: sql,
                param: []
            })
                .then((result) => {
                    console.log(result);
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

    api.salvarResposta = async function (req, res, next) {
        let con = await this.controller.getConnection();
        let IDG061 = req.body.IDG061;
        let DSAVALID = req.body.DSAVALID;
        let STAVALIA = req.body.STAVALIA;

        try {
            let result = await con.update({
                tabela: `G061`,
                colunas: {
                    DSAVALID: DSAVALID,
                    SNAVALID: 1,
                    DTRESPOS: new Date(),
                    STAVALIA: STAVALIA

                },
                condicoes: `G061.IDG061 = :id`,
                parametros: {
                    id: IDG061
                }
            })
                .then((result1) => {
                    return result1;
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

    api.getInformacoesRestricoesCarga = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sql = `
              SELECT
                G067.DSOCORRE G067_DSOCORRE,
                T004.STSITUAC T004_STSITUAC,
                TO_CHAR(T004.DTCADAST, 'dd/MM/yyyy') T004_DTCADAST,
                TO_CHAR(T004.DTVALIDA, 'dd/MM/yyyy') T004_DTVALIDA,
                T004.TXVALIDA T004_TXVALIDA
              FROM
                T004 T004
              INNER JOIN G067 G067 ON
                T004.IDG067 = G067.IDG067
              WHERE T004.IDG046 = ${req.body.IDG046}
              ORDER BY T004.DTCADAST
          `

        /* var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, G046_IDG046: req.body.IDG046, tableName: "G046" }, false); */

        try {
            let result = await con.execute({
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

    api.validaPermissaoRastreio = async function (req, res, next) {
        let con = await this.controller.getConnection();
        let IDG043 = req.body.IDG043;
        //let IDG005CO   = req.body.IDG005CO;

        let sql = `
                SELECT 
                     NVL(G051.IDG005DE, G043.IDG005DE) AS IDG005DE ,
                     G043.IDG043, 
                     G043.NRNOTA,
                     G051.CDCTRC,
                     G005.IDG005,
                     G005.NMCLIENT,
                     NVL(G005.SNENVRAS,0) AS SNENVRAS,
                     G077.IDG077 /* SE EXISTIR REGISTRO NA G077 ENTÃO O CLIENTE NÃO PODE RECEBER */
                  FROM G043 G043
                  INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                  INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                  INNER JOIN G005 G005 ON G005.IDG005 = NVL(G051.IDG005CO,G051.IDG005DE)
                  /* VALIDA DESTINATÁRIO */
                  LEFT JOIN G077 G077 ON G077.IDG005 = G051.IDG005DE AND G077.SNRASTRE = 1                  
                  WHERE G043.IDG043 = ${IDG043}  
          `

        try {
            let result = await con.execute({
                sql: sql,
                param: []
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

    api.listarPorCarga = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        console.log(req.body);
        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }
        try {
            let result = await con.execute({
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
          G048.IDG048,

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

          (select (COUNT(G048.IDG048)) FROM G048 G048C where G046.IDG046 = G048C.IDG046) as QTDPARA,

          G046.TPMODCAR,
          G046.TPTRANSP,
          NVL(G046.DTCOLATU,G046.DTCOLORI) as DTCOLETA,
                
          (select nvl(sum(idg024),0) from g048 g048A where g048A.idg046 = G046.idg046) as sncrodoc,
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
          

        Left Join g048 g048 On g048.idg046 = g046.idg046
        Left Join g049 g049 On g049.idg048 = g048.idg048
        Left Join g051 g051 On g051.idg051 = g049.idg051
        Left Join G022 G022 On (G022.IdG005 = G051.IdG005CO AND G022.SNINDUST = 1)
        Left Join G014 G014 On G014.IdG014 = G022.IdG014 
        
               ` +
                    sqlWhere + sqlWhereAcl +
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


    api.listarPorConhecimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        console.log(req.body);
        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }
        try {
            let result = await con.execute({
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
          Left Join G022 G022 On (G022.IdG005 = G051.IdG005CO AND G022.SNINDUST = 1)
          Left Join G014 G014 On G014.IdG014 = G022.IdG014 
               ` +
                    sqlWhere + sqlWhereAcl +
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


    api.listarAg = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        console.log(req.body);

        let wherePrevisao = '';
        let leftCargaAux = '';

        if (req.body['parameter[DTPREENT]'] != undefined && req.body['parameter[DTPREENT]'] != null && req.body['parameter[DTPREENT]'] != '') {
            wherePrevisao = `And ( Case
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                        Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                        End) = '${req.body['parameter[DTPREENT]']}'`;
            delete req.body['parameter[DTPREENT]'];
        } else {
            wherePrevisao = '';
        }

        if (req.body['parameter[G046_IDG046]'] == undefined || req.body['parameter[G046_IDG046]'] == null || req.body['parameter[G046_IDG046]'] == '') {
            leftCargaAux = ` LEFT JOIN G049 G049 ON ( G049.IDG043 = G043.IDG043 AND G049.IDG048 =                
                        (
                          SELECT
                          G049A.IDG048
                          FROM
                              G049 G049A
                                JOIN G048 G048A ON G048A.IDG048 = G049A.IDG048
                                JOIN G046 G046A ON G046A.IDG046 = G048A.IDG046
                        
                            WHERE G049A.IDG043 = G043.IDG043 
                            AND G046A.STCARGA <> 'C' 
                            AND G046A.TPMODCAR <> 1
                            
                          ORDER BY
                              G049A.IDG048 ASC FETCH FIRST ROW ONLY
                        ) 
                          
                      ) `;
        } else {
            leftCargaAux = ` LEFT JOIN G049 G049 ON ( G049.IDG043 = G043.IDG043) `;
        }

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        sqlWhere = sqlWhere + ` AND G043.TPDELIVE = 5 AND G043.CDDELIVE IS NOT NULL `;

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }
            ],
            esoperad: 'And'
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }
        try {
            let result = await con.execute({
                sql: `SELECT DISTINCT

              G083.IDG083,
              NVL(G083.NRNOTA, '0') AS NRNOTA,
              NVL(TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY'), 'n.i.') AS DTEMINOT,
              NVL(G083.NRCHADOC,G043.NRCHADOC) AS NRCHADOC,
              NVL(G083.DSMODENF,G043.DSMODENF), /* Modelo da Nota */
              NVL(G083.NRSERINF,G043.NRSERINF), /* Serie da Nota */
          
              G043.IDG043,
              G043.CDDELIVE,
              G043.IDG005RE,
              G043.TPDELIVE, /* Tipo da Nota */
              G043.IDG005DE,
              TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') AS DTDELIVE,
              NVL(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.') AS DTENTCON,
              NVL(TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY'), 'n.i.') AS DTENTREG,
              NVL(TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY'), 'n.i.') AS DTBLOQUE,
              NVL(TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY'), 'n.i.') AS DTDESBLO,
              G043.SNAG, /* Indicador de AG */
              NVL(TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY'), 'n.i.') AS DTLANCTO,

              G051.IDG051,
              NVL(G051.CDCTRC, '0') AS G051_CDCTRC,
              NVL(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'), 'n.i.') AS G051_DTEMICTR,
              NVL(TO_CHAR(G051.DTAGENDA, 'DD/MM/YYYY'), 'n.i.') AS G051_DTAGENDA, /* Data Agendada */
              NVL(TO_CHAR(G051.DTCOMBIN, 'DD/MM/YYYY'), 'n.i.') AS G051_DTCOMBIN, /* Data Combinada */
              NVL(TO_CHAR(G051.DTROTERI, 'DD/MM/YYYY'), 'n.i.') AS G051_DTROTERI, /* Data Roteirizada */
              G051.DTENTPLA,
              G051.DTCALDEP,
              NVL(G051.IDG046, 0) AS G051_IDG046,
              G051.IDG005CO,
              
              G014.IDG014,
          
              G005RE.NMCLIENT   AS G005RE_NMCLIENTRE,
              G005RE.RSCLIENT   AS G005RE_RSCLIENTRE,
              G005RE.CJCLIENT   AS G005RE_CJCLIENTRE,
              G003RE.NMCIDADE   AS G003RE_NMCIDADERE,
              G002RE.NMESTADO   AS G002RE_NMESTADORE,
              G005DE.NMCLIENT   AS G005DE_NMCLIENTDE,
              G005DE.RSCLIENT   AS G005DE_RSCLIENTDE,
              G005DE.CJCLIENT   AS G005DE_CJCLIENTDE,
              G003DE.NMCIDADE   AS G003DE_NMCIDADEDE,
              G002DE.NMESTADO   AS G002DE_NMESTADODE,
              G005CO.NMCLIENT   AS G005CO_NMCLIENTCO,

              NVL(G030.DSTIPVEI,'n.i.') AS DSTIPVEI,

              (G051.VRTOTFRE/G051.NRPESO) * G083.PSBRUTO AS VRFRETE,

              TO_CHAR(FN_DATA_SLA(G051.IDG051), 'DD/MM/YYYY') AS G051_DTPREENT, /* Data de Previsão de Entrega */
              
              CASE
                  WHEN G051.TPTRANSP = 'C' THEN 'Complemento'
                  WHEN G051.TPTRANSP = 'D' THEN 'Devolução'
                  WHEN G051.TPTRANSP = 'O' THEN 'Outros'
                  WHEN G051.TPTRANSP = 'S' THEN 'Substituto'
                  WHEN G051.TPTRANSP = 'T' THEN 'Transferência'
                  WHEN G051.TPTRANSP = 'V' THEN 'Venda'
                  WHEN G051.TPTRANSP = 'I' THEN 'Industrialização'
                  ELSE 'n.i.'
              END AS G051_TPTRANSP, /* Tipo de Operação */
          
              TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') AS G046_DTSAICAR, /*data de despacho*/
              TO_CHAR(G046.DTPRESAI, 'DD/MM/YYYY') AS G046_DTPRESAI, /*data previsão de despacho recalculada*/
              TO_CHAR(G046.DTSAIORI, 'DD/MM/YYYY') AS G046_DTSAIORI, /*data previsão de despacho original*/
              NVL(G046.IDG046,0) AS G046_IDG046,
              NVL(TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY'), 'n.i.') AS G046_DTCARGA, /* Data Roteirizada */

              CASE
                WHEN G046.SNCARPAR = 'S' THEN 'Fracionada'
                ELSE 'Fechada'
              END AS G046_SNCARPAR,

              NVL(G046.QTDISPER,0) AS G046_QTDISPER,

          
                CASE
                  WHEN G046.STCARGA = 'A' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'B' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'E' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'F' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'S' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'R' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'O' THEN 'Em Expedição'
                  WHEN G046.STCARGA = 'T' THEN 'Em Transporte'
                  WHEN G046.STCARGA = 'X' THEN 'Recusada'
                  WHEN G046.STCARGA = 'C' THEN 'Cancelada'
                  WHEN G046.STCARGA = 'D' THEN 'Entregue'
                  ELSE 'n.i.'
                END AS G046_STCARGA,

              NVL(G048.NRSEQETA,0) AS G048_NRSEQETA,
              G048.IDG048,

              (SELECT 
                A002.DSTPMOTI
                FROM A002 A002
                  Join A015 A015 On (A002.IDA002 = A015.IDA002 AND A015.IDI015 = G051.IDI015)
                  
                  WHERE A002.IDA008 = 1 
                  
                  FETCH FIRST ROW ONLY
              ) AS A002_DSTPMOTI,
              
              COUNT(G043.CDDELIVE) OVER() AS COUNT_LINHA
          FROM
              G043 G043
              LEFT JOIN G052 G052 ON ( G052.IDG043 = G043.IDG043 )
              LEFT JOIN G083 G083 ON ( G043.IDG043 = G083.IDG043 AND G083.SNDELETE = 0)
              LEFT JOIN G051 G051 ON ( G052.IDG051 = G051.IDG051 )
              
              LEFT JOIN G005 G005RE ON ( G005RE.IDG005 = NVL(G043.IDG005RE, G051.IDG005RE) )
              LEFT JOIN G003 G003RE ON ( G003RE.IDG003 = G005RE.IDG003 )
              LEFT JOIN G002 G002RE ON ( G002RE.IDG002 = G003RE.IDG002 )
              LEFT JOIN G005 G005DE ON ( G005DE.IDG005 = NVL(G043.IDG005DE, G051.IDG005DE) )
              LEFT JOIN G003 G003DE ON ( G003DE.IDG003 = G005DE.IDG003 )
              LEFT JOIN G002 G002DE ON ( G002DE.IDG002 = G003DE.IDG002 )
              LEFT JOIN G005 G005CO ON ( G051.IDG005CO = G005CO.IDG005 )

              Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
              Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
              Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
              Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
              
              LEFT JOIN G022 G022 ON ( G022.IDG005 = NVL(G051.IDG005CO, G043.IDG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
              LEFT JOIN G014 G014 ON G014.IDG014 = G022.IDG014
              
              ${leftCargaAux}

              LEFT JOIN G048 G048 ON ( G049.IDG048 = G048.IDG048 )
              LEFT JOIN G046 G046 ON ( G048.IDG046 = G046.IDG046 AND G046.TPMODCAR <> 1 AND G046.STCARGA <> 'C')

              LEFT JOIN G024 G024 ON ( G046.IDG024 = G024.IDG024 AND G024.SNDELETE = 0 )
              
              LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
              LEFT JOIN G030 G030 ON G046.IDG030 = G030.IDG030

               ` +
                    sqlWhere + wherePrevisao + sqlWhereAcl +
                    `
              GROUP BY
                G083.DSMODENF,
                G083.IDG083,
                G083.NRNOTA,
                G083.DTEMINOT,
                G083.NRCHADOC,
                G083.DSMODENF,
                G083.NRSERINF,
                G083.PSBRUTO,
                
                G043.IDG043,
                G043.CDDELIVE,
                G043.IDG005RE,
                G043.IDG005DE,
                G043.TPDELIVE,
                G043.DTENTCON,
                G043.DTDELIVE,
                G043.DTENTCON,
                G043.DTENTREG,
                G043.DTBLOQUE,
                G043.DTDESBLO,
                G043.IDG014,
                G043.SNAG,
                G043.DTLANCTO,
                G043.NRCHADOC,
                G043.DSMODENF,
                G043.NRSERINF,
                G043.DTEMINOT,
                
                G051.IDG051,
                G051.IDI015,
                G051.CDCTRC,
                G051.DTEMICTR,
                G051.DTAGENDA,
                G051.DTCOMBIN,
                G051.DTROTERI,
                G051.DTCALDEP,
                G051.DTENTPLA,
                G051.DTCALANT,
                G051.TPTRANSP,
                G051.IDG046,
                G051.IDG005CO,
                G051.VRTOTFRE,
                G051.NRPESO,
                
                G005RE.NMCLIENT,
                G005RE.RSCLIENT,
                G005RE.CJCLIENT,
                G005DE.NMCLIENT,
                G005DE.RSCLIENT,
                G005DE.CJCLIENT,
                G005CO.NMCLIENT,
                
                G003RE.NMCIDADE,
                G003DE.NMCIDADE,
                
                G002RE.NMESTADO,
                G002DE.NMESTADO,

                G046.DTSAICAR,
                G046.DTSAIORI,
                G046.DTPRESAI,
                G046.IDG046,
                G046.STCARGA,
                G046.SNCARPAR,
                G046.QTDISPER,
                G046.DTCARGA,

                G048.NRSEQETA,
                G048.IDG048,

                G030.DSTIPVEI,


                G014.IDG014

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


    api.getInformacoesNotaFiscalAg = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ IDG043: req.body.IDG043, G083_IDG083: req.body.IDG083, G051_IDG051: req.body.IDG051, tableName: "G043" }, false);


        try {
            let result = await con.execute({
                sql: `
           Select Distinct G043.IDG043,
                  G083.IDG083,
                  NVL(G083.NRNOTA, 0) AS NRNOTA, /* Número da Nota */
                  To_Char(G083.DTEMINOT,'DD/MM/YYYY') as DTEMINOT, /* Data Emissão */
                  NVL(G083.NRCHADOC,G043.NRCHADOC) as NRCHADOC, /* Chave de Acesso */
                  NVL(G083.DSMODENF,G043.DSMODENF) as DSMODENF, /* Modelo da Nota */
                  NVL(G083.NRSERINF,G043.NRSERINF) as NRSERINF, /* Serie da Nota */
                  G043.TPDELIVE, /* Tipo da Nota */
                  NVL(G083.PSBRUTO,G043.PSBRUTO) as PSBRUTO, /* Peso Bruto */
                  NVL(G083.PSLIQUID,G043.PSLIQUID) as PSLIQUID, /* Peso Liquido */
                  G051.CDCTRC, /* Número do CTE */
                  To_Char(G051.DTEMICTR,'DD/MM/YYYY') as DTEMICTR, /* Data de Emissão do CTE */
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
                  G043.DSINFCPL, /* Observação da Nota Fiscal */
                  G043.SNAG, /* Indicador de AG */
                  G051.IDG051
            From G043 G043
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Left Join G083 G083
              On (G052.IDG083 = G083.IDG083)
            Left Join G051 G051
              On (G052.IDG051 = G051.IDG051)
            Left Join G022 G022
              On (G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1)
            Left Join G014 G014
              On (G014.IdG014 = G022.IdG014)
            Left Join G024 G024
              On (G051.IDG024 = G024.IDG024)
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

    /** 
    * @update Alteracao para usar os itens das NF em funcao da g043 e g004 ao inves de g043 e 4045 
    * @author Pedro Lins
    * @since 18/12/2019 
    */
   
    api.getItensNotaFiscalAG = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, bindValues] = utils.buildWhere({ G043_IDG043: req.body.IDG043, G051_IDG051: req.body.IDG051, tableName: "G004" }, false);

        try {
            let result = await con.execute({
                sql: `
            Select G004.IDG004,
                G004.DSPRODUT,
                G004.QTPRODUT,
                G004.VRUNIPRO,
                G009.CDUNIDAD,
                G009.DSUNIDAD,
                G004.DSINFAD,
                (G004.QTPRODUT * G004.VRUNIPRO) As VLTOTAL
            From G004 G004
            Left Join G009 G009
            On (G004.IDG009UM = G009.IDG009)
            Left Join G083 G083
            On (G083.IDG083 = G004.IDG083)
            Left Join G052 G052
            On (G052.IDG083 = G083.IDG083)
            Left Join G051 G051
            On (G051.IDG051 = G052.IDG051)
            Join G043 G043
            On (G043.IDG043 = G052.IDG043)
     ` + sqlWhere + ' AND G004.SNDELETE = 0  ',
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


    api.getInformacoesRastreamentoAg = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG083 = req.body.IDG083;
        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select  TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY') as DTEMICTR, /* Data Emissão CTE */
                  TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY') as DTEMINOT, /* Data Emissão NFe */
                  TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') as DTENTCON, /* Data SLA */
                  NVL(G083.TXCANHOT,G043.TXCANHOT) AS TXCANHOT,
                  TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') as DTSAICAR,
                  TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY') as DTBLOQUE, /* Data de Bloqueio */
                  TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY') as DTDESBLO, /* Data de Desbloqueio */
                  TO_CHAR(Nvl(G051.DTCOLETA,Nvl(G046.DTCOLORI, G046.DTCOLATU)), 'YYYY-MM-DD') As DTCOLETA, /* Data Coleta */
                 

                  Case
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                    Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                    End as DTPREENT, /* Data de Previsão de Entrega */

                  TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') as DTENTREG,
                  NVL(G083.IDG043,G043.IDG043) AS IDG043
            From G043 G043
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            left Join G083 G083
              On (G052.IDG083 = G083.IDG083)
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
            Left Join G048 G048
              On (G049.IDG048 = G048.IDG048)
            Left Join G046 G046
              On (G048.IDG046 = G046.IDG046)
            Left Join G051 G051
              On (G051.IDG051 = G052.IDG051)
            Where G043.IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
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

    api.getDatasToAtendimentoAg = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG083 = req.body.IDG083;
        let IDG043 = req.body.IDG043;

        try {
            let result = await con.execute({
                sql: `
          Select  To_Char(G083.DTEMINOT,'DD/MM/YYYY') as DTEMINOT, /* Data de Emissão da Nota */
                  To_Char(G051.DTEMICTR,'DD/MM/YYYY') as DTEMICTR, /* Data de Emissão do CTE */
                  To_Char(G043.DTENTCON,'DD/MM/YYYY') as DTENTCON, /* Data SLA */
                  To_Char(G051.DTENTPLA,'DD/MM/YYYY') as DTENTPLA, /* Entrega Planejada */
                  /*To_Char(Nvl(G051.DTCALDEP, Nvl(G051.DTENTPLA, G051.DTCALANT)),'DD/MM/YYYY') As DTPREENT,*/ /* Data de Previsão de Entrega */

                  Case
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                    Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                    End as DTPREENT, /* Data de Previsão de Entrega */

                  To_Char(Nvl(G051.DTCOLETA,Nvl(G046.DTCOLORI, G046.DTCOLATU)),'DD/MM/YYYY') As DTCOLETA, /* Data de Coleta */
                  To_Char(G051.DTAGENDA,'DD/MM/YYYY') As DTAGENDA, /* Data Agendada */
                  To_Char(G051.DTPRECOR,'DD/MM/YYYY') As DTPRECOR, /* Data Previsão de Entrega Corretiva */
                  To_Char(G051.DTCOMBIN,'DD/MM/YYYY') As DTCOMBIN, /* Data Combinada */
                  To_Char(G051.DTROTERI,'DD/MM/YYYY') As DTROTERI, /* Data de Roteirização */
                  To_Char(G043.DTENTREG,'DD/MM/YYYY') as DTENTREG, /* Data de Entrega */
                  To_Char(G051.DTCALDEP,'DD/MM/YYYY') as DTCALDEP, /* Data de Entrega */
                  G051.IDG051,
                  To_Char(G043.DTBLOQUE,'DD/MM/YYYY') as DTBLOQUE,
                  To_Char(G043.DTDESBLO,'DD/MM/YYYY') as DTDESBLO
            From G043 G043
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Left Join G051 G051
              On (G051.IDG051 = G052.IDG051)
            Left Join G083 G083
              On (G083.IDG083 = G052.IDG083)
            Left Join G049 G049
              On (G049.IDG043 = G043.IDG043)
            Left Join G048 G048
              On (G048.IDG048 = G049.IDG048)
            Left Join G046 G046
              On (G046.IDG046 = G048.IDG046)
            Where G043.IDG043 = :IDG043`,
                param: {
                    IDG043: IDG043
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

    api.getInfoCTE = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let G051_NRCHADOC = req.body.NRCHADOC;

        try {
            let result = await con.execute({
                sql: `
           Select Distinct 
                  G005RE.NMCLIENT As NMCLIENTRE, /* Nome do Remetente */
                  G005RE.CJCLIENT As CJCLIENTRE, /* CNPJ do Remetente */
                  G005RE.IECLIENT AS IECLIENTRE,
                  G005DE.NMCLIENT As NMCLIENTDE, /* Nome do Destinatário */
                  G005DE.CJCLIENT As CJCLIENTDE, /* CNPJ do Destinatário */                  
                  G005DE.IECLIENT AS IECLIENTDE,
                  G051.NRSERINF, /* Número de Serie Nota Fiscal */
                  G051.DSMODENF, /* Modelo da Nota Fiscal */
                  TO_CHAR(G051.DTEMICTR,'DD/MM/YYYY') AS DTEMICTR, /* Data de Emissão do Controle */

                  G003RE.NMCIDADE || '-' || G002RE.CDESTADO AS CDESTADORE,
                  G003DE.NMCIDADE || '-' || G002DE.CDESTADO AS CDESTADODE,
                  G002VL.CDESTADO AS CDESTADOVL,

                  Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.') AS G051_DTPREENT,
                  G032.DSVEICUL,
                  G032.NRPLAVEI
            

              From G051 G051
              Left Join G005 G005RE
                On (G005RE.IDG005 = G051.IDG005RE)
              Left Join G005 G005DE
                On (G005DE.IDG005 = G051.IDG005DE)
              Left Join G049 G049
                On (G049.IDG051 = G051.IDG051)
              Left Join G048 G048
                On (G048.IDG048 = G049.IDG048)
              Left Join G046 G046
                On (G046.IDG046 = G048.IDG046)
              Left Join G032 G032
                On G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
              Left Join G003 G003VL
                On (G032.IDG003 = G003VL.IDG003)
              Left Join G002 G002VL
                On (G002VL.IDG002 = G003VL.IDG002)
              Left Join G003 G003RE
                On (G005RE.IDG003 = G003RE.IDG003)
              Left Join G002 G002RE
                On (G002RE.IDG002 = G003RE.IDG002)
              Left Join G003 G003DE
                On (G005DE.IDG003 = G003DE.IDG003)
              Left Join G002 G002DE
                On (G002DE.IDG002 = G003DE.IDG002)
              Where G051.NRCHADOC = ${G051_NRCHADOC}`,
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

    api.getCteInfoAg = async function (params) {

        let con = await this.controller.getConnection();

        let resultDelivery = null;
        let sqlAuxWhere;

        let sql = `
          Select  distinct  X.*, 
          TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS') as original,
          Trim(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX')) as convertido, 
          TO_NUMBER(TO_CHAR(TO_CHAR(SYSTIMESTAMP, 'FF6HH24YYMMDDMISS'), 'XXXXXXXXXXXXXXX'), 'XXXXXXXXXXXXXXX') as decrypt,
          SYSTIMESTAMP
          
          From 
          (        
              Select  G051.CDRASTRE,
                      G051.IDG051
              From    G043 G043
              INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
              INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
              WHERE  ` + (params.IDG051 != undefined && params.IDG051 != null ? ` G051.IDG051 =` + params.IDG051 : ` G051.CDRASTRE = '` + params.CDRASTRE + `'`) + `
              GROUP BY G051.CDRASTRE, G051.IDG051, G043.DtEntreg
          ) X               
              `
        try {
            let result = await con.execute({
                sql: sql,
                param: []
            })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    console.log(err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (result) {
                if (params.IDG051 != undefined && params.IDG051 != null && params.CDRASTRE == null) {
                    //console.log("entrou no update IDG051 CDRASTRE");
                    await con.execute({
                        sql: `        
              Update  G051 G051
                  Set G051.CDRASTRE = :CDRASTRE
                Where G051.IDG051 = :IDG051`,
                        param: {
                            IDG051: params.IDG051,
                            CDRASTRE: result[0].CONVERTIDO
                        }
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }

                if (params.CDRASTRE != undefined && params.CDRASTRE != null && params.IDG051 == null) {

                    if (params.NRNOTA != null && params.NRNOTA != undefined && params.NRNOTA != 0) {
                        sqlAuxWhere = ' AND G083.NRNOTA = ' + params.NRNOTA;
                    } else {
                        sqlAuxWhere = '';
                    }

                    //console.log("entrou no update IDG051 CDRASTRE");
                    resultDelivery = await con.execute({
                        sql: `
              SELECT G051.IDG051, G051.CDCTRC, G043.IDG043, G043.CDDELIVE, G083.IDG083, G083.NRCHADOC, G083.NRNOTA
                    FROM G051 G051
                    INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
                    INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
                    INNER JOIN G083 G083 ON G083.IDG083 = G052.IDG083
                    WHERE G051.IDG051 = ${result[0].IDG051} AND G043.CDDELIVE = '${params.CDDELIVE}'` + sqlAuxWhere + `
                          AND G051.STCTRC = 'A'
                          AND G051.SNDELETE = 0 
                          AND G043.SNDELETE = 0 `,
                        param: {

                        }
                    })
                        .then((resultNota) => {
                            //console.log(resultNota);
                            return resultNota;
                        })
                        .catch((err) => {
                            console.log(err);
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }


            }

            await con.close();

            return {
                CDRASTRE: (params.CDRASTRE != undefined && params.CDRASTRE != null ? params.CDRASTRE : result[0].CONVERTIDO),
                IDG051: (result != undefined && result != null ? result[0].IDG051 : 0),
                IDG043: (resultDelivery != undefined && resultDelivery != null ? resultDelivery : null)
            };


        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    }

    api.salvaDataCanhoto = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let G051_NRCHADOC = req.body.G051_NRCHADOC;
        let DTCANHOT = req.body.DTCANHOT;

        let result2;


        try {
            let result = await con.execute({
                sql: `
              Select Distinct
                  G043.IDG043
              FROM G051 G051
                Join G052 G052
                  On (G052.IDG051 = G051.IDG051)
                Join G043 G043
                  On (G043.IDG043 = G052.IDG043)
              Where G051.NRCHADOC = ${G051_NRCHADOC}`,
                param: []
            })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (result && result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    result2 = await con.execute({
                        sql: `
                Update G043 SET DTCANHOT = To_Date('${DTCANHOT}', 'DD/MM/YYYY') WHERE IDG043 = ${result[i].IDG043}
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
                }

            }

            await con.close();

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.salvarNotaAlterada = async function (req, res, next) {
        let con = await this.controller.getConnection();
        let IDG061 = req.body.IDG061;
        let DSAVALID = req.body.DSAVALID;
        let NRNOTA = req.body.NRNOTA;

        let sql = `
            UPDATE 
              G061 SET DSAVALID = '${DSAVALID}', SNAVALID = 1, NRNOTA = ${NRNOTA}
              where IDG061 = ${IDG061}
        `;

        try {
            let result = await con.execute({
                sql: sql,
                param: []
            })
                .then((result) => {
                    console.log(result);
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

    api.descadastroRastreio = async function (req, res, next) {
        let con = await this.controller.getConnection();
        let IDG005 = req.body.IDG005DE;
        let IDG014 = req.body.IDG014;
        let COMMENT = req.body.COMMENT;
        let sql = `
            UPDATE 
              G022 SET SNRASTRE = 0, DSUNSRAS = '${COMMENT}'
              where IDG005 = ${IDG005} AND IDG014 = ${IDG014}
        `;

        try {
            let result = await con.execute({
                sql: sql,
                param: []
            })
                .then((result) => {
                    console.log(result);
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


    api.danfeGeneratorByXml = async function (req, res, next) {
        let con = await this.controller.getConnection();

        let sql = `SELECT F004.TXXML AS TXXML 
            FROM G083 G083
            JOIN F004 F004 ON (G083.NRCHADOC = F004.NRCHADOC)
            WHERE G083.IDG083 = ${req.body.IDG083}
            AND F004.TPXML = 1`;

        try {
            let result = await con.execute({
                    sql,
                    param: [],
                    fetchInfo: "TXXML"
                })
                .then(async result => {
                    if (result && result.length > 0) {
                        let xml = result[0].TXXML;
                        let objXml = parser.toJson(xml);
                        return objXml;
                    } else {
                        return null;
                    }
                    
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

    }
    
    api.dacteGeneratorByXml = async function (req, res, next) {
        let con = await this.controller.getConnection();

		let sql = `SELECT F004.TXXML AS TXXML 
            FROM G051 G051
            JOIN F004 F004 ON (G051.NRCHADOC = F004.NRCHADOC)
            WHERE G051.IDG051 = ${req.body.IDG051}
            AND F004.TPXML = 2`;

        try {
            let result = await con.execute({
                sql,
                param: [],
                fetchInfo: "TXXML"
            })
                .then(async result => {
                    if (result && result.length > 0) {
                        let xml = result[0].TXXML;
                        let objXml = parser.toJson(xml);
                        return objXml;
                    } else {
                        return null;
                    }

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

    }

    api.downloadXmlDocs = async function (req, res, next) {
        let con = await this.controller.getConnection();

        const { NRCHADOC } = req.params;
        let TPXML = NRCHADOC.substr(44);
        let sql = `            
            SELECT F004.TXXML 
            FROM F004 F004
            WHERE F004.NRCHADOC = '${NRCHADOC.substr(0, 44)}'          
            AND F004.TPXML = ${TPXML}
        `;
        try {
            let result = await con.execute({
                sql,
                param: [],
                fetchInfo: "TXXML"
            })
                .then(async result => {
                    if (result && result.length > 0) {
                        let xml = result[0].TXXML;

                        var fileContents = Buffer.from(xml);
                        var readStream = new stream.PassThrough();
                        readStream.end(fileContents);
                        res.set('Content-disposition', 'attachment; filename=' + 'teste.xml');
                        res.set('Content-Type', 'text/xml');
                        readStream.pipe(res);
                    } else {
                        return null;
                    }
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

    }

    api.unsubSatisfacao = async function (req, res, next) {
        console.debug("Paramertos recebidos ", req.body)
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            let result = await con.execute({
            sql: `Select 
            G051.IDG051,
            G051.IDG005DE,
            G022.IDG022,
            G022.IDG014
            From G051 G051  
            Join G052 G052 On (G052.IDG051 = G051.IDG051) 
            Join G043 G043 On (G043.IDG043 = G052.IDG043)
            Join G022 G022 On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
            Where G051.CDSATISF = '` + req.body.CDSATISF + `' `,
                param: []
            }).then((result) => {
                    return result[0];
            }).catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

            if (req.body.UNSUB != null && req.body.UNSUB != '') {
                await con.execute({
                    sql: ` Update G022 Set SNSATISF = 0, DSUNSSAT= '${req.body.COMMENT}' Where IDG014 = ${result.IDG014} AND IDG005 = ${result.IDG005DE} `,
                    param: {}
                })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    logger.error("[Erro] - ", err)
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            }
            await con.close();
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    }   

    api.enableMailReceptionNPS = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let IDG022 = req.body.IDG022;
        let TPNPS = req.body.TPNPS;
        let ACAO = req.body.ACAO;
        let sql = "";
        if (TPNPS == 1 ){    
            sql = `Update G022 Set G022.SNRASTRE = :ACAO Where G022.IDG022 = :IDG022`;
        }else{
            sql = `Update G022 Set G022.SNSATISF = :ACAO Where G022.IDG022 = :IDG022`;
        }
        try {
            let result =  await con.execute({
                sql,
                param: {
                    ACAO: ACAO,
                    IDG022: IDG022
                }       
            })
                .then((result1) => {
                    return result1;
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

    api.getListUnsubMail = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        
        if (req.body['parameter[SNSATISF]'] == '2') { 
            delete req.body['parameter[SNSATISF]'];
        } 
        if (req.body['parameter[SNRASTRE]'] == '2') { 
            delete req.body['parameter[SNRASTRE]'];
        } 

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G022', false);
        try {

            let result = await con.execute({
                sql: `Select 
                G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' as NMCLIENT, 
                G005.CJCLIENT,
                G014.DSOPERAC, 
                G022.*,
                COUNT(G022.IDG022) OVER() as COUNT_LINHA 
                From G005 
                Join G022 G022 on G005.IDG005 = G022.IDG005 And G022.SNINDUST = 1 And G022.SNDELETE = 0 
                Left Join G014 G014 on G014.IDG014 = G022.IDG014 ` +
                sqlWhere +
                sqlPaginate,
                param: bindValues
            })
            .then((result) => {
                return utils.construirObjetoRetornoBD(result);
            })
            .catch((err) => {
                logger.error('[Erro] ', err)
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