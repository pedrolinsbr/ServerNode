module.exports = function (app) {
    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var tmz = app.src.utils.DataAtual;
    api.controller = app.config.ControllerBD;
    var fieldAdd = app.src.modGlobal.controllers.XFieldAddController;
    var utilsCurl = app.src.utils.Utils;

    var emailEnviar = app.src.modMonitoria.controllers.EmailController;

    var Moment = require('moment');
    var MomentRange = require('moment-range');

    var acl = app.src.modIntegrador.controllers.FiltrosController;

    var cancelaEntrega = app.src.modDocSyn.controllers.MSController;

    var deliveryRota = app.src.modIntegrador.dao.DeliveryDAO;


    api.getIndicadoresEmAberto = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: 'And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        let visaoCliente = '';

        if (sqlWhereAcl != '' && sqlWhereAcl != null) {
            visaoCliente = ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) ';
        }

        let sqlWhere = '';

        if (req.body.G083_DTEMINOT != null) {
            sqlWhere += ` And G083.DTEMINOT Between To_Date('` + req.body.G083_DTEMINOT[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G083_DTEMINOT[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        /*if (req.body.G043_NRNOTA != null) {
        	sqlWhere += ' And G043.NRNOTA = ' + req.body.G043_NRNOTA;
        }*/

        if (req.body.G083_NRNOTA != null) {
            let arrayNotas = [];
            let tamanhoNota = req.body.G083_NRNOTA.in.length;

            for (let i = 0; i < tamanhoNota; i++) {
                arrayNotas[i] = req.body.G083_NRNOTA.in[i];
            }

            sqlWhere += ' And G083.NRNOTA in (' + arrayNotas + ')';
        }


        if (req.body.G051_CDCTRC != null) {
            let arrayCtrc = [];
            let tamanhoCtrc = req.body.G051_CDCTRC.in.length;

            for (let i = 0; i < tamanhoCtrc; i++) {
                arrayCtrc[i] = req.body.G051_CDCTRC.in[i];
            }

            sqlWhere += ' And G051.CDCTRC in (' + arrayCtrc + ')';
        }


        if (req.body.G051_STCTRC != null && req.body.G051_STCTRC != '') {
            sqlWhere += ` And G051.STCTRC Like ('` + req.body.G051_STCTRC + `')`;
        }

        if (req.body.G043_DTBLOQUE != null && req.body.G043_DTBLOQUE != '') {
            if (req.body.G043_DTBLOQUE.hasOwnProperty('null')) {
                if (req.body.G043_DTBLOQUE.null) {
                    sqlWhere += ` And G043.DTBLOQUE Is Null`;
                } else {
                    sqlWhere += ` And G043.DTBLOQUE Is Not Null`;
                }
            }

        }

        if (req.body.G043_DTDESBLO != null && req.body.G043_DTDESBLO != '') {
            if (req.body.G043_DTDESBLO.hasOwnProperty('null')) {
                if (req.body.G043_DTDESBLO.null) {
                    sqlWhere += ` And G043.DTDESBLO Is Null`;
                } else {
                    sqlWhere += ` And G043.DTDESBLO Is Not Null`;
                }
            }
        }

        if (req.body.G051_CDCARGA != null) {
            let arrayCargas = [];
            let tamanhoCarga = req.body.G051_CDCARGA.in.length;

            for (let i = 0; i < tamanhoCarga; i++) {
                arrayCargas[i] = req.body.G051_CDCARGA.in[i];
            }

            sqlWhere += ' And G051.CDCARGA in (' + arrayCargas + ')';
        }

        if (req.body.G051_IDG051 != null) {
            sqlWhere += ' And G051.IDG051 = ' + req.body.G051_IDG051.id;
        }

        if (req.body.G046_IDG046 != null) {
            sqlWhere += ' And G046.IDG046 = ' + req.body.G046_IDG046;
        }

        if (req.body.G051_IDG024 != null) {
            if (req.body.G051_IDG024.hasOwnProperty('in')) {
                if (req.body.G051_IDG024.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G051.IDG024 In  (' + req.body.G051_IDG024.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G051.IDG024 In  (' + req.body.G051_IDG024.in.join() + ')';
                }
            }
        }

        if (req.body.G046_IDG024 != null) {
            if (req.body.G046_IDG024.hasOwnProperty('in')) {
                if (req.body.G046_IDG024.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G046.IDG024 In  (' + req.body.G046_IDG024.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G046.IDG024 In  (' + req.body.G046_IDG024.in.join() + ')';
                }
            }
        }

        if (req.body.G043_IDG005DE != null) {
            if (req.body.G043_IDG005DE.hasOwnProperty('in')) {
                if (req.body.G043_IDG005DE.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G043.IDG005DE In  (' + req.body.G043_IDG005DE.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G043.IDG005DE In  (' + req.body.G043_IDG005DE.in.join() + ')';
                }
            }
        }

        if (req.body.G043_IDG005RE != null) {
            if (req.body.G043_IDG005RE.hasOwnProperty('in')) {
                if (req.body.G043_IDG005RE.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G043.IDG005RE In  (' + req.body.G043_IDG005RE.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G043.IDG005RE In  (' + req.body.G043_IDG005RE.in.join() + ')';
                }
            }
        }

        if (req.body.G051_IDG005CO != null) {
            if (req.body.G051_IDG005CO.hasOwnProperty('in')) {
                if (req.body.G051_IDG005CO.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G051.IDG005CO In  (' + req.body.G051_IDG005CO.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G051.IDG005CO In  (' + req.body.G051_IDG005CO.in.join() + ')';
                }
            }
        }

        if (req.body.G043_SNAG != null && req.body.G043_SNAG != '') {
            if (typeof req.body.G043_SNAG === 'object') {
                sqlWhere += ' And G043.SNAG Is Null';
            } else {
                sqlWhere += ' And G043.SNAG > 0';
            }
        }


        if (req.body.G051_TPTRANSP != null && req.body.G051_TPTRANSP != '') {
            if (req.body.G051_TPTRANSP.hasOwnProperty('in')) {
                sqlWhere += ` And G051.TPTRANSP In ('` + req.body.G051_TPTRANSP.in.join("', '") + `')`;
            }
        }


        if (req.body.G043_DTENTREG != null && req.body.G043_DTENTREG != '') {
            if (req.body.G043_DTENTREG.hasOwnProperty('null')) {
                if (req.body.G043_DTENTREG.null) {
                    sqlWhere += ` And G043.DTENTREG Is Null`;
                } else {
                    sqlWhere += ` And G043.DTENTREG Is Not Null`;
                }
            }

        }
        if (req.body.A008_IDA008 != null) {
            sqlWhere += ' And A008.IDA008 = ' + req.body.A008_IDA008;
        }

        if (req.body.A005_IDA001 != null) {
            sqlWhere += ' And A005.IDA001 = ' + req.body.A005_IDA001;
        }

        if (req.body.G043_CDDELIVE != null) {
            sqlWhere += ' And G043.CDDELIVE = ' + `'` + req.body.G043_CDDELIVE + `'`;
        }

        if (req.body.G043_DTBLOQUE != null && req.body.G043_DTBLOQUE != '') {
            if (req.body.G043_DTBLOQUE.hasOwnProperty('null')) {
                if (req.body.G043_DTBLOQUE.null) {
                    sqlWhere += ` And G043.DTBLOQUE Is Null`;
                } else {
                    sqlWhere += ` And G043.DTBLOQUE Is Not Null`;
                }
            }

        }

        if (req.body.G043_DTDESBLO != null && req.body.G043_DTDESBLO != '') {
            if (req.body.G043_DTDESBLO.hasOwnProperty('null')) {
                if (req.body.G043_DTDESBLO.null) {
                    sqlWhere += ` And G043.DTDESBLO Is Null`;
                } else {
                    sqlWhere += ` And G043.DTDESBLO Is Not Null`;
                }
            }

        }

        if (req.body.G051_IDI015 != null && req.body.G051_IDI015 != '') {
            if (req.body.G051_IDI015.hasOwnProperty('null')) {
                if (req.body.G051_IDI015.null) {
                    sqlWhere += ` And G051.IDI015 Is Null`;
                } else {
                    sqlWhere += ` And G051.IDI015 Is Not Null`;
                }
            }

        }

        if (req.body.G051_IDG005RE != null) {
            if (req.body.G051_IDG005RE.hasOwnProperty('in')) {
                if (req.body.G051_IDG005RE.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G051.IDG005RE In  (' + req.body.G051_IDG005RE.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G051.IDG005RE In  (' + req.body.G051_IDG005RE.in.join() + ')';
                }
            }
        }


        if (req.body.DTENTREG != null) {
            sqlWhere += ` And G043.DTENTREG Between To_Date('` + req.body.DTENTREG[0] + `','DD/MM/YYYY') AND To_Date('` + req.body.DTENTREG[1] + `','DD/MM/YYYY')`;
        }

        if (req.body.G032_NRFROTA != null) {
            if (req.body.G032_NRFROTA.hasOwnProperty('in')) {
                if (req.body.G032_NRFROTA.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G032.NRFROTA In  (' + req.body.G032_NRFROTA.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G032.NRFROTA In  (' + req.body.G032_NRFROTA.in.join() + ')';
                }
            }
        }

        if (req.body.G032_IDG032 != null) {
            if (req.body.G032_IDG032.hasOwnProperty('in')) {
                if (req.body.G032_IDG032.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G032.IDG032 In  (' + req.body.G032_IDG032.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G032.IDG032 In  (' + req.body.G032_IDG032.in.join() + ')';
                }
            }
        }

        if (req.body.G051_DTAGENDA != null) {
            sqlWhere += ` And G051.DTAGENDA = '` + req.body.G051_DTAGENDA + `'`;
        }

        // if (req.body.DTPREENT != null) {
        // 	sqlWhere += `And ( Case
        // 								When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 Then
        // 								Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
        // 								Else
        // 								Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
        // 								End) = '` + req.body.DTPREENT + `'` ;
        // }



        try {
            let result = await con.execute({
                sql: `
					Select (Select Count(distinct(A005.IDG043 || A001.IDA001))
										From A001 A001
										Join A002 A002
											On (A001.IDA002 = A002.IDA002)
										Join S001 S001 
                                            On S001.IdS001 = A001.IdSolido
                                        ${joinVisaoClient}
										Join A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento ) */
											On (A002.IDA008 = A008.IDA008)
										Join A005 A005
											On (A005.IDA001 = A001.IDA001)
										Left Join G043 G043
											On (G043.IDG043 = A005.IDG043)
										Left Join G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051)  */
											On (A005.IDG043 = G052.IDG043)
										Left Join G051 G051 /* Conhecimento do Transporte  */
                                            On (G051.IDG051 = G052.IDG051)
                                        Join G083 G083
											On (G083.IDG083 = G052.IDG083)
										Left Join G049 G049   
											On (G049.IDG043 = G043.IDG043 )
										Left Join G048 G048
										   On (G049.IDG048 = G048.IDG048)
										Left Join G046 G046
										   On (G048.IDG046 = G046.IDG046)
										/*Join A003 A003
											On (A003.IDA001 = A001.IDA001 And A003.IDA003 = 
																							(Select Max(A003_2.IDA003)
																								From A003 A003_2
																								Where A003_2.IDA001 = A003.IDA001))
										Join A006 A006
											On (A006.IDA006 = A003.IDA006)*/
										Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
										Left Join G014 G014
											On (G014.IDG014 = G022.IDG014)
										Left Join G024 G024   
											On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
										/*LEFT JOIN G030 G030 
											ON G030.IDG030 = G046.IDG030*/
										LEFT JOIN G032 G032 
											ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
									Where A002.IDA008 = 1 And A001.SNDELETE = 0 And A001.DTFIM Is Null And G051.SnDelete = 0 And G051.StCtrc = 'A'
									And G043.SNDELETE = 0 ` + sqlWhere + sqlWhereAcl + visaoCliente + `) As QTD_ATENDIMENTOS,
                                    /*            
									(Select NVL(AVG(Distinct G061.NRNOTA) * 10, 0)
										From G061 G061
										Left Join G051 G051 
											On (G051.IDG051 = G061.IDG051)
										Left Join G052 G052 
											On (G061.IDG051 = G052.IDG051)
										Left Join G043 G043
                                            On (G043.IDG043 = G052.IDG043)
                                        Join G083 G083
											On (G083.IDG083 = G052.IDG083)
										Left Join A005 A005
												On (A005.IDG043 = G043.IDG043)
										Left Join A001 A001
												On (A005.IDA001 = A001.IDA001 And A001.SNDELETE = 0)
										Left Join A002 A002
                                                On (A001.IDA002 = A002.IDA002)
                                        ${joinVisaoClient}
										Left Join A008 A008
												On (A002.IDA008 = A008.IDA008)
										Left Join G049 G049   
											On (G049.IDG043 = G043.IDG043)
										Left Join G048 G048
										   On (G049.IDG048 = G048.IDG048)
										Left Join G046 G046
										   On (G048.IDG046 = G046.IDG046)
										Left Join G024 G024   
											On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
										Left Join G022 G022 
											On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
										Left Join G014 G014
											On (G014.IDG014 = G022.IDG014)
										LEFT JOIN G032 G032 
											ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
									Where G061.NRNOTA is not null ` + sqlWhere + sqlWhereAcl + `) As SATISFACAO, */


								(Select Count(distinct(A005.IDG043 || A001.IDA001))
										From A001 A001
										Join A002 A002
											On (A001.IDA002 = A002.IDA002)
										Join A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento )  */
											On (A002.IDA008 = A008.IDA008)
										Join A005 A005
											On (A005.IDA001 = A001.IDA001)
										Join S001 S001 
                                            On S001.IdS001 = A001.IdSolido
                                        ${joinVisaoClient}
										Left Join G043 G043
											On (G043.IDG043 = A005.IDG043)
										Left Join G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051)  */
											On (A005.IDG043 = G052.IDG043)
										Left Join G051 G051 /* Conhecimento do Transporte  */
                                            On (G051.IDG051 = G052.IDG051)
                                        Join G083 G083
											On (G083.IDG083 = G052.IDG083)
										Left Join G049 G049
										   On (G049.IDG043 = G043.IDG043)
										Left Join G048 G048
										   On (G049.IDG048 = G048.IDG048)
										Left Join G046 G046
										   On (G048.IDG046 = G046.IDG046)
										/*Join A003 A003
											On (A003.IDA001 = A001.IDA001 And A003.IDA003 = 
																							(Select Max(A003_2.IDA003)
																								From A003 A003_2
																								Where A003_2.IDA001 = A003.IDA001))
										Join A006 A006
											On (A006.IDA006 = A003.IDA006)*/
										Left Join G022 G022   
											On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
										Left Join G014 G014
											On (G014.IDG014 = G022.IDG014)
										Left Join G024 G024   
											On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
										/*LEFT JOIN G030 G030
											ON G030.IDG030 = G046.IDG030*/
										LEFT JOIN G032 G032 
											ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
									Where A002.IDA008 = 2 And A001.SNDELETE = 0 And A001.DTFIM Is Null And G051.SnDelete = 0 And G051.StCtrc = 'A'
									And G043.SNDELETE = 0` + sqlWhere + sqlWhereAcl + visaoCliente + `) As QTD_OCORRENCIAS,
									(
									Select (/*X.QtAtivo+*/X.QtEntAtr+X.QtEntPra) As QtTotal
                  From
          (
          Select ( Select Count(Distinct G043.IdG043)
                     From      G043 G043
                     Join      G052 G052 On G052.IdG043 = G043.IdG043
                     Join      G051 G051 On G051.IdG051 = G052.IdG051
                     Join      G083 G083 On (G083.IDG083 = G052.IDG083)
					 Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
					 Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
					 Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                     Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                     ${joinVisaoClient}
					 Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
              		 Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
              		 Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
									 Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
										 Left Join G014 G014 On G014.IdG014 = G022.IdG014
										 Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
										 --LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
										 LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
                    Where 1 = 1 ` + sqlWhere + sqlWhereAcl + `
                              And G043.DtEntreg Is Null
                              /*And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                              Or G043.DtBloque Is Null)*/
                              --And G051.DtColeta Is Not Null
                  ) As QtAtivo,  

                  ( Select  Count(Distinct (X.IdG043 || X.IDG051))
                    From
                    (   Select 
                                  Distinct G051.IdG051,
                                  G043.IdG043,
                                  To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') As DtPrevis,
                                  To_Date(G043.DtEntreg, 'dd/mm/YY') As DtEntreg 
                        From      G043 G043
                        Join      G052 G052 On G052.IdG043 = G043.IdG043
                        Join      G051 G051 On G051.IdG051 = G052.IdG051
                        Join G083 G083 On (G083.IDG083 = G052.IDG083)
						Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
					 	Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
					 	Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                        Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                        ${joinVisaoClient}
						Left Join G049 G049   On (G049.IDG043 = G043.IDG043 )
              			Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
              			Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
										Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
												Left Join G014 G014 On G014.IdG014 = G022.IdG014
												Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
												--LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
												LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
                        Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
																	And G043.DtEntreg Is Not Null
																	And G051.SnDelete = 0 And G051.StCtrc = 'A'
																	And G043.SNDELETE = 0
                                  /*And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                  Or G043.DtBloque Is Null)*/
                                  --And G051.DtColeta Is Not Null
                    ) X 
                    Where   X.DtEntreg > X.DtPrevis
                  ) As QtEntAtr,
                  
                  ( Select Count(Distinct (X.IdG043 || X.IDG051))
                    From
                    ( Select 
                                Distinct G051.IdG051,
                                G043.IdG043,
                                To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') As DtPrevis,
                                To_Date(G043.DtEntreg, 'dd/mm/YY') As DtEntreg
                      From      G043 G043
                      Join      G052 G052 On G052.IdG043 = G043.IdG043
                      Join      G051 G051 On G051.IdG051 = G052.IdG051
                      Join      G083 G083 On (G083.IDG083 = G052.IDG083)
					  Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
					  Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
					  Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                      Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                      ${joinVisaoClient}
					  Left Join G049 G049   On (G049.IDG043 = G043.IDG043 )
              		  Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
              		  Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
										Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
											Left Join G014 G014 On G014.IdG014 = G022.IdG014
											Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
											--LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
										  LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
                      Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
																And G043.DtEntreg Is Not Null
																And G051.SnDelete = 0 And G051.StCtrc = 'A'
																And G043.SNDELETE = 0
                                /*And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
                                Or G043.DtBloque Is Null)*/
                                --And G051.DtColeta Is Not Null
                    ) X 
                    Where       X.DtEntreg <= X.DtPrevis
                  ) As QtEntPra

          From Dual
					) X	) As QTD_ENTREGAS,
					
					(Select (/*XCTE.QtAtivoCTE+*/XCTE.QtEntAtrCTE+XCTE.QtEntPraCTE) As QtTotalCTE
					From
							(Select 
									( Select Count(Distinct G051.IdG051)
											 From      G043 G043
											 Join      G052 G052 On G052.IdG043 = G043.IdG043
                                             Join      G051 G051 On G051.IdG051 = G052.IdG051
                                             Join G083 G083 On (G083.IDG083 = G052.IDG083)
											 Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
											 Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
											 Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                                             Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                                             ${joinVisaoClient}
											 Left Join G049 G049   On (G049.IDG043 = G043.IDG043 )
											 Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
											 Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
											 Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
											 Left Join G014 G014 On G014.IdG014 = G022.IdG014
											 Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
											 --LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
											 LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
											Where 1 = 1  ` + sqlWhere + sqlWhereAcl + `
																And G043.DtEntreg Is Null
																And G051.SnDelete = 0 And G051.StCtrc = 'A'
																And G043.SNDELETE = 0
																/*And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
																Or G043.DtBloque Is Null)*/
																--And G051.DtColeta Is Not Null
										) As QtAtivoCTE,  
			
										( Select  Count(Distinct XCTE.IdG051) From
											(Select 
														Distinct G051.IdG051,
														G043.IdG043,
														To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') As DtPrevis,
														To_Date(G043.DtEntreg, 'dd/mm/YY') As DtEntreg 
															From      G043 G043
															Join      G052 G052 On G052.IdG043 = G043.IdG043
                                    Join      G051 G051 On G051.IdG051 = G052.IdG051
                                    Join G083 G083 On (G083.IDG083 = G052.IDG083)
									Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
									 Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
									 Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                                    Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                                    ${joinVisaoClient}
									Left Join G049 G049   On (G049.IDG043 = G043.IDG043 )
													Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
													Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
													Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
															Left Join G014 G014 On G014.IdG014 = G022.IdG014
															Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
															--LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
															LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
															Where     1 = 1  ` + sqlWhere + sqlWhereAcl + `
																				And G043.DtEntreg Is Not Null
																				And G051.SnDelete = 0 And G051.StCtrc = 'A'
																				And G043.SNDELETE = 0
																				/*And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
																				Or G043.DtBloque Is Null)*/
																				--And G051.DtColeta Is Not Null
											 ) XCTE Where   XCTE.DtEntreg > XCTE.DtPrevis
													
										 ) As QtEntAtrCTE,
												
										( Select Count(Distinct XCTE.IdG051) From
											( Select 
																			Distinct G051.IdG051,
																			G043.IdG043,
																			To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') As DtPrevis,
																			To_Date(G043.DtEntreg, 'dd/mm/YY') As DtEntreg 
														From      G043 G043
														Join      G052 G052 On G052.IdG043 = G043.IdG043
                                    Join      G051 G051 On G051.IdG051 = G052.IdG051
                                    Join G083 G083 On (G083.IDG083 = G052.IDG083)
									Left Join A005 A005 On (A005.IDG043 = G043.IDG043)
									Left Join A001 A001 On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
									Left Join A002 A002 On (A002.IDA002 = A001.IDA002)
                                    Left Join A008 A008 On (A008.IDA008 = A002.IDA008)
                                    ${joinVisaoClient}
									Left Join G049 G049   On (G049.IDG043 = G043.IDG043 )
													Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
													Left Join G046 G046   On (G048.IDG046 = G046.IDG046)
													Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
															Left Join G014 G014 On G014.IdG014 = G022.IdG014
															Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)
															--LEFT JOIN G030 G030 ON G030.IDG030 = G046.IDG030
															LEFT JOIN G032 G032 ON G032.IDG032 = NVL(G046.IDG032V1, NVL(G046.IDG032V2, G046.IDG032V3))
														Where     1 = 1  ` + sqlWhere + sqlWhereAcl + `
																			And G043.DtEntreg Is Not Null
																			And G051.SnDelete = 0 And G051.StCtrc = 'A'
																			And G043.SNDELETE = 0
																			/*And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
																			Or G043.DtBloque Is Null)*/
																			--And G051.DtColeta Is Not Null
																			
											) XCTE Where  XCTE.DtEntreg <= XCTE.DtPrevis
										) As QtEntPraCTE

								From Dual
								) XCTE ) as QTD_ENTREGAS_CTE

					From Dual`,
                param: []
            })
                .then(async (result) => {
                    let result2 = await con.execute({
                        sql: `
                            SELECT DISTINCT
                                G061.IDG061, 
                                G061.NRNOTA NOTA,
                                G061.DSCOMENT,
                                G051.IDG051
            
                            FROM G051 G051
            
                            INNER JOIN G061 G061 ON (G061.IDG051 = G051.IDG051)
            
                            INNER JOIN G005 G005 ON (G005.IDG005 = G051.IDG005DE)
            
                            INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003) 
            
                            INNER JOIN G002 G002 ON (G003.IDG002 = G002.IDG002)
            
                            INNER JOIN G052 G052 ON (G052.IDG051 = G051.IDG051)
                            
                            INNER JOIN G043 G043 ON (G052.IDG043 = G043.IDG043)
            
                            INNER JOIN G083 G083 On (G083.IDG043 = G043.IDG043)

                            LEFT JOIN A005 A005 ON (A005.IDG043 = G043.IDG043)

                            ${joinVisaoClient}

                            LEFT JOIN G022 G022 ON (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
            
                            LEFT JOIN G014 G014 ON (G014.IDG014 = G022.IDG014)
                            
                            LEFT JOIN G049 G049 ON (G049.IDG043 = G043.IDG043 )
            
                            LEFT JOIN G048 G048 ON (G048.IDG048 = G049.IDG048)
                            
                            LEFT JOIN G046 G046 ON (G046.IDG046 = G048.IDG046)
                            
                            LEFT JOIN G024 G024 ON (G024.IDG024 = G046.IDG024 AND G024.SNDELETE = 0)
                    
                            WHERE G051.SNDELETE = 0
                            AND G061.DTAVALIA IS NOT NULL
                            AND G061.NRNOTA IS NOT NULL
                            ${sqlWhere} ${sqlWhereAcl}
                        `,
                        param: []
                    })
                        .then((notas) => {
                            let promotores = notas.filter(data => data.NOTA > 8).length;
                            let detratores = notas.filter(data => data.NOTA < 7).length;
                            result[0].SATISFACAO = Math.round(((promotores / notas.length) - (detratores / notas.length)) * 100);
                            return result;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
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

    api.getTiposDeAcao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let result = await con.execute({
            sql: `
				 Select  A008.IDA008,
								 A008.DSACAO
					 From  A008 A008
					Where  A008.SNDELETE = 0`,
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
    }

    api.getAllMotivos = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let result = await con.execute({
            sql: `
			Select A002.IDA002, 
                       A002.IDA008,
                       A002.SNVISCLI,
						 INITCAP(A002.DSTPMOTI) AS DSTPMOTI
			  From A002 A002
			 Where A002.SNDELETE = 0
			 ORDER BY A002.DSTPMOTI ASC`,
            param: []
        })
        .then((result) => {
            return result;
        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

        let resultConfig = await api.getConfig(con, req.UserId);

        result.map((res) => {
            res['ARCONFIG'] = resultConfig.filter(rConf => rConf.IDA002 == res.IDA002);
            return res;
        });

        await con.close();
        return result;
    }

    api.listar = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'A001', true);

        let result = await con.execute({
            sql: `Select
								A001.IDA001,
								S001.NMUSUARI,
								'Aberto' AS SITUACAO,
								A001.DTREGIST,
								A001.DTFIM,
								A008.DSACAO,
								A002.DSTPMOTI,
								G043.IDG043,
								G051.CDCTRC,
								COUNT(A001.IdA001) OVER () as COUNT_LINHA
						From A001 A001
						INNER JOIN S001 S001 ON (S001.IDS001 = A001.IDSOLIDO)
						INNER JOIN A002 A002 ON (A002.IDA002 = A001.IDA002)
						INNER JOIN A008 A008 ON (A002.IDA008 = A008.IDA008)
						INNER JOIN A005 A005 ON (A005.IDA001 = A001.IDA001)
						INNER JOIN G043 G043 ON (A005.IDG043 = G043.IDG043)
						INNER JOIN G052 G052 ON (A005.IDG043 = G052.IDG043)
						INNER JOIN G051 G051 ON (G051.IDG051 = G052.IDG051)` +
                sqlWhere +
                sqlOrder +
                sqlPaginate,
            param: bindValues,
            debug: true
        })
            .then((result) => {
                return (utils.construirObjetoRetornoBD(result));
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
        await con.close();
        for (let i of result.data) {
            i.TEMPO = i.DTFIM - i.DTREGIST;
            i.DTFIM = tmz.formataData(i.DTFIM, 'DD/MM/YYYY HH:mm:ss');
            i.DTREGIST = tmz.formataData(i.DTREGIST, 'DD/MM/YYYY HH:mm:ss');
            i.TEMPO = tmz.msToHMS(i.TEMPO);

        }
        return result;
    };

    api.listarByNfe = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //filtra,ordena,pagina

        let SNDELETE = 0;
        let sqlNotas = '';

        if (req.body['parameter[A001_SNDELETE]'] != null && req.body['parameter[A001_SNDELETE]'] != undefined && req.body['parameter[A001_SNDELETE]'] != '') {
            SNDELETE = req.body['parameter[A001_SNDELETE]'];
            delete req.body['parameter[A001_SNDELETE]'];
        }

        if (req.body['parameter[SNNOTA]'] != null && req.body['parameter[SNNOTA]'] != undefined && req.body['parameter[SNNOTA]'] != false) {
            sqlNotas = ' Nvl(G043.NRNOTA,G083.NRNOTA) AS NUMNOTA, ';
            delete req.body['parameter[SNNOTA]'];
        } else {
            sqlNotas = '';
        }


        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'A001', true);

        bindValues.A001_SNDELETE = SNDELETE;

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }
        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }
        let result = await con.execute({
            sql: ` 
				Select Distinct A001.IDA001,
										Case
											When A008.IDA008 = 1 Then
											A008.DSACAO ||
											' <i class="fas fa-comments" style="color: #4DADF7;"></i>'
											Else
											A008.DSACAO ||
											' <i class="fas fa-exclamation-triangle" style="color: red;"></i>'
										End As A008_DSACAO,
										S001.NMUSUARI As S001_NMUSUARI,
										A006.DSSITUAC As A006_DSSITUAC,
										Nvl(G014.DSOPERAC,'n.i.') As G014_DSOPERAC,
										G014.IDG014 As G014_IDG014,
										To_Char(A001.DTREGIST, 'DD/MM/YYYY HH24:MI') As DTREGIST,
										(Select LISTAGG(Nvl(G043.NRNOTA,G083.NRNOTA), ', ') WITHIN GROUP(ORDER BY G043.NRNOTA)
											 From G052 G052
											 Join G043 G043
												 On (G052.IDG043 = G043.IDG043)
											Where G052.IDG051 = G051.IDG051) As NRNOTAS,
										Nvl(To_Char(A001.DTFIM, 'DD/MM/YYYY HH24:MI'),'-') As DTFIM,
										/* cálculo para saber a quanto tempo ( em horas ) um atendimento estão aberto */
										Case /* Verifico se o retorno da quantidade de horas retornadas é 0, Porque 0 * 24 sempre será zero, então precisava realizar o cálculo diferente. */
											When Trunc(Nvl(A001.DTFIM, CURRENT_DATE) -
																Add_Months(A001.DTREGIST,
																						Months_Between(Nvl(A001.DTFIM, CURRENT_DATE),
																													A001.DTREGIST))) = 0 Then 
											/* Se for 0, cálculo as horas dessa forma: */
											Lpad(Trunc(24 *
																	Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1)),
														2,
														0) || ':' || /* Concatena os Minutos */
											Lpad(Trunc(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 
																					1) * 24,
																			1) * 60),
														2,
														0) || ':' || /* Concatena os Segundos */
											Lpad(Mod(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1) * 24,
																		1) * 60,
																1) * 60,
														2,
														0)
											Else /* Se não for 0 o retorno da quantidade de horas ( No caso, quando der mais de um dia ) */
											/* Faço cálculo das horas abaixo:  */
											Lpad(Trunc(Nvl(A001.DTFIM, CURRENT_DATE) -
																	Add_Months(A001.DTREGIST,
																						Months_Between(Nvl(A001.DTFIM, CURRENT_DATE),
																														A001.DTREGIST))) * 24,
														2,
														0) || ':' || /* Concateno os minutos  */
											Lpad(Trunc(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST,
																					1) * 24,
																			1) * 60),
														2,
														0) || ':' || /* Concateno os segundos  */
											Lpad(Mod(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1) * 24,
																		1) * 60,
																1) * 60,
														2,
														0)
										End As TEMPO, /* Fim do Tempo  */
										A002.DSTPMOTI AS A002_DSTPMOTI,
										
										${sqlNotas}
										
										Count(A001.IdA001) Over() As COUNT_LINHA
							From A001 A001 /* Atendimentos  */
							Join S001 S001 /* Usuários  */
                                On (S001.IDS001 = A001.IDSOLIDO)
                            ${joinVisaoClient}
							Join A002 A002 /* Motivos do atendimento  */
								On (A002.IDA002 = A001.IDA002)
							Join A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento )  */
								On (A002.IDA008 = A008.IDA008)
							Join A005 A005 /* Tabela que une um atendimento (A001) a uma NF-e (G043)  */
								On (A005.IDA001 = A001.IDA001)
							Join G043 G043 /* NF-e  */
								On (A005.IDG043 = G043.IDG043)
							Left Join G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051)  */
								On (A005.IDG043 = G052.IDG043)
							Left Join G083 G083 /* NF-e  */
								On (G052.IDG083 = G083.IDG083)
							Left Join G051 G051 /* Conhecimento do Transporte  */
								ON (G051.IDG051 = G052.IDG051)
							Left Join G049 G049
								On (G049.IDG043 = G043.IDG043)
							Left Join G048 G048   
								On (G049.IDG048 = G048.IDG048)
							Left Join G046 G046   
								On (G048.IDG046 = G046.IDG046)
							Join A003 A003
								On (A003.IDA001 = A001.IDA001 And A003.IDA003 = 
																(Select Max(A003_2.IDA003)
																		From A003 A003_2
																	Where A003_2.IDA001 = A003.IDA001))
							Join A006 A006
								On (A006.IDA006 = A003.IDA006)
							Left Join G022 G022
                On (G022.IDG005 = G051.IDG005CO and G022.SNINDUST = 1 and G022.SNDELETE = 0)
              Left Join G014 G014
								On (G014.IDG014 = G022.IDG014)
							Left Join G024 G024   
								On (G046.IDG024 = G024.IDG024)` +
                sqlWhere + ` AND G051.STCTRC = 'A' ` + sqlWhereAcl +

                ` GROUP BY 
						A001.IDA001,
						A008.IDA008,
						A008.DSACAO,
						S001.NMUSUARI,
						A006.DSSITUAC,
						G014.DSOPERAC,
						G014.IDG014,
						A001.DTREGIST,
						G043.NRNOTA,
						G083.NRNOTA,
						A001.DTFIM,
						A002.DSTPMOTI,
						G051.IDG051 ` +

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
    };

    api.listarRelatorioAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let wherePrevisao;
        //filtra,ordena,pagina
        if (req.body['parameter[DTPREENT]'] != undefined && req.body['parameter[DTPREENT]'] != null && req.body['parameter[DTPREENT]'] != '') {
            wherePrevisao = `And (Case
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
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        sqlWhere = sqlWhere + `  And G051.STCTRC <> 'C' `;

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        let result = await con.execute({
            sql: ` 
				Select distinct
										(G043.IDG043 || A001.IDA001) As IDG043,
										G043.NRNOTA, /* Número da Nota */
										G051.CDCTRC As G051_CDCTRC, /* Número do CTe  */
										Nvl(G005RE.NMCLIENT,'n.i.') As G005RE_NMCLIENTRE, /* Nome do Remetente ( Filial e Remetente )  */
										FN_FORMAT_CNPJ_CPF(G005RE.CJCLIENT) As G005RE_CJCLIENTRE, /* CNPJ do Remetente ( Filial e Remetente )  */
										Nvl(G003RE.NMCIDADE,'n.i.') As G003RE_NMCIDADERE, /* Nome da Cidade do Remetente ( Filial e Remetente )  */
										Nvl(G002RE.NMESTADO,'n.i.') As G002RE_NMESTADORE, /* Nome do Estado do Remetente ( Filial e Remetente ) */
										Nvl(G005DE.NMCLIENT,'n.i.') As G005DE_NMCLIENTDE, /* Nome do Destinatário */
										Nvl(FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT),'n.i.') As G005DE_CJCLIENTDE, /* CNPJ do Destinatário */
										Nvl(G003DE.NMCIDADE,'n.i.') As G003DE_NMCIDADEDE, /* Nome da Cidade do Destinatário */
										Nvl(G002DE.NMESTADO,'n.i.') As G002DE_NMESTADODE, /* Nome do Estado do Destinatário */
										Nvl(G005RC.NMCLIENT,'n.i.') As G005RC_NMCLIENTRC, /* Nome do Recebedor */
										Nvl(FN_FORMAT_CNPJ_CPF(G005RC.CJCLIENT),'n.i.') As G005RC_CJCLIENTRC, /* CNPJ do Recebedor */
										Nvl(G003RC.NMCIDADE,'n.i.') As G003RC_NMCIDADERC, /* Nome da Cidade do Recebedor */
										Nvl(G002RC.NMESTADO,'n.i.') As G002RC_NMESTADORC, /* Nome do Estado do Recebedor */
										Nvl(G005EX.NMCLIENT,'n.i.') As G005EX_NMCLIENTEX, /* Nome do Expedidor */
										Nvl(FN_FORMAT_CNPJ_CPF(G005EX.CJCLIENT),'n.i.') As G005EX_CJCLIENTEX, /* CNPJ do Expedidor */
										Nvl(G003EX.NMCIDADE,'n.i.') As G003EX_NMCIDADEEX, /* Nome da Cidade do Expedidor */
										Nvl(G002EX.NMESTADO,'n.i.') As G002EX_NMESTADOEX, /* Nome do Estado do Expedidor */
										Nvl(G005CO.NMCLIENT,'n.i.') As G005CO_NMCLIENTCO, /* Nome do Tomador */
										Nvl(FN_FORMAT_CNPJ_CPF(G005CO.CJCLIENT),'n.i.') As G005CO_CJCLIENTCO, /* CNPJ do Tomador */
										Nvl(G003CO.NMCIDADE,'n.i.') As G003CO_NMCIDADECO, /* Nome da Cidade do Tomador */
										Nvl(G002CO.NMESTADO,'n.i.') As G002CO_NMESTADOCO, /* Nome do Estado do Tomador */
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
										End As G051_TPTRANSP, /* Tipo de Operação */
										Nvl(A001.IDA001,0) As A001_IDA001, /* Protocolo do Atendimento */
										Nvl(To_Char(A001.DTREGIST, 'DD/MM/YYYY HH24:MI'),'n.i.') As A001_DTREGIST, /* Data de Abertura */
                                        Nvl(To_Char(A001.DTFIM,'DD/MM/YYYY HH24:MI'),'-') As A001_DTFIM, /* Data de Fechamento */
                                        A006.DSSITUAC AS A006_DSSITUAC,
										Nvl(To_Char(G051.DTROTERI,'DD/MM/YYYY'),'-') As G051_DTROTERI, /* Data de Roteirização */
										Nvl(To_Char(G051.DTAGENDA, 'DD/MM/YYYY'), 'n.i.') As G051_DTAGENDA, /* Data Agendada */
										/* Cálculo para saber a quanto tempo ( em horas ) um atendimento está aberto */
										Case /* Verifico se o retorno da quantidade de horas retornadas é 0, Porque 0 * 24 sempre será zero, então precisava realizar o cálculo diferente. */
											When Trunc(Nvl(A001.DTFIM, CURRENT_DATE) -
																Add_Months(A001.DTREGIST,
																						Months_Between(Nvl(A001.DTFIM, CURRENT_DATE),
																													A001.DTREGIST))) = 0 Then
											/* Se for 0, cálculo as horas dessa forma: */
											Lpad(Trunc(24 *
																	Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1)),
														2,
														0) || ':' || /* Concatena os Minutos */
											Lpad(Trunc(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST,
																					1) * 24,
																			1) * 60),
														2,
														0) || ':' || /* Concatena os Segundos */
											Lpad(Mod(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1) * 24,
																		1) * 60,
																1) * 60,
														2,
														0)
											Else /* Se não for 0 o retorno da quantidade de horas ( No caso, quando der mais de um dia ) */
											/* FaÃ§o cálculo das horas abaixo: */
											Lpad(Trunc(Nvl(A001.DTFIM, CURRENT_DATE) -
																	Add_Months(A001.DTREGIST,
																						Months_Between(Nvl(A001.DTFIM, CURRENT_DATE),
																														A001.DTREGIST))) * 24,
														2,
														0) || ':' || /* Concateno os minutos */
											Lpad(Trunc(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST,
																					1) * 24,
																			1) * 60),
														2,
														0) || ':' || /* Concateno os segundos */
											Lpad(Mod(Mod(Mod(Nvl(A001.DTFIM, CURRENT_DATE) - A001.DTREGIST, 1) * 24,
																		1) * 60,
																1) * 60,
														2,
														0)
										End As A001_TEMPO, /* Fim do Tempo */
										/* Calculo para saber a previsao de entrega */
										Case
                                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                                            Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                                        When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                                            Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                                        Else
                                            Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                                        End as DTPREENT, /* Data de Previsão de Entrega */

										NVL(dbms_lob.substr( A003.DSOBSERV, 4000, 1 ),' ') as DSOBSERV, /* Conteúdo da Ultima Movimentação */
										Nvl(A002.DSTPMOTI,'n.i.') As A002_DSTPMOTI, /* Motivo do Atendimento */
										S001.NMUSUARI As S001_NMUSUARI, /* Criador do Atendimento */
									Count(A001.IDA001) Over() As COUNT_LINHA
							From G043 G043 /* Nota Fiscal */
							Join G052 G052 /* Vínculo NFe e CTe */
								On (G052.IDG043 = G043.IDG043)
							Join G051 G051 /* Controle do Transporte */
								On (G051.IDG051 = G052.IDG051)
                            Left Join G022 G022   
                                On (G022.IDG005 = G051.IDG005CO AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                            Left Join G014 G014
								On (G014.IDG014 = G022.IDG014)
							Left Join G049 G049   
								On (G049.IDG043 = G043.IDG043 )
							Left Join G048 G048   
								On (G049.IDG048 = G048.IDG048)
							Left Join G046 G046   
								On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
							Left Join G024 G024   
								On (G046.IDG024 = G024.IDG024)
							Join G005 G005RE /* Remetente */
								On (G005RE.IDG005 = G051.IDG005RE)
							Join G003 G003RE /* Estado do Remetente */
								On (G003RE.IDG003 = G005RE.IdG003)
							Join G002 G002RE /* Cidade do Remetente */
								On (G002RE.IDG002 = G003RE.IdG002)
							Join G005 G005DE /* Destinatário */
								On (G005DE.IDG005 = G051.IDG005DE)
							Join G003 G003DE /* Estado do Destinatário */
								On (G003DE.IDG003 = G005DE.IDG003)
							Join G002 G002DE /* Cidade do Destinatário */
								On (G002DE.IDG002 = G003DE.IDG002)
							Join G005 G005RC /* Recebedor */
								On (G005RC.IDG005 = G051.IDG005RC)
							Join G003 G003RC /* Estado do Recebedor */
								On (G003RC.IDG003 = G005RC.IDG003)
							Join G002 G002RC /* Cidade do Recebedor */
								On (G002RC.IDG002 = G003RC.IDG002)
							Join G005 G005EX /* Expedidor */
								On (G005EX.IDG005 = G051.IDG005EX)
							Join G003 G003EX /* Estado do Expedidor */
								On (G003EX.IDG003 = G005EX.IDG003)
							Join G002 G002EX /* Cidade do Expedidor */
								On (G002EX.IDG002 = G003EX.IDG002)
							Join G005 G005CO /* Tomador */
								On (G005CO.IDG005 = G051.IDG005CO)
							Join G003 G003CO /* Estado do Tomador */
								On (G003CO.IDG003 = G005CO.IDG003)
							Join G002 G002CO /* Cidade do Tomador */
								On (G002CO.IDG002 = G003CO.IDG002)
							Join A005 A005 /* Vínculo do Atendimento com a Nota Fiscal */
								On (A005.IDG043 = G043.IDG043)
							Join A001 A001 /* Atendimento  */
								On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
							Join A002 A002 /* Motivo do Atendimento */
								On (A002.IDA002 = A001.IDA002)
							Join A003 A003 /* Movimentações do Atendimento */
								On (A003.IDA001 = A001.IDA001 And
										A003.IDA003 =
                                        (Select Max(A003.IDA003) From A003 Where A003.IDA001 = A001.IDA001))
                            Join A006 A006
                                On (A006.IDA006 = A003.IDA006)
							Join S001 S001 /* Usuário */
                                On (A001.IDSOLIDO = S001.IDS001)
                            ${joinVisaoClient}
							 ` +
                sqlWhere + wherePrevisao + sqlWhereAcl +

                ` Group By
				G043.IDG043, 
				A001.IDA001,
				G043.NRNOTA,
				G051.CDCTRC,
				G005RE.NMCLIENT,
				G005RE.CJCLIENT,
				G003RE.NMCIDADE,
				G002RE.NMESTADO,
				G005DE.NMCLIENT,
				G005DE.CJCLIENT,
				G003DE.NMCIDADE,
				G002DE.NMESTADO,
				G005RC.NMCLIENT,
				G005RC.CJCLIENT,
				G003RC.NMCIDADE,
				G002RC.NMESTADO,
				G005EX.NMCLIENT,
				G005EX.CJCLIENT,
				G003EX.NMCIDADE,
				G002EX.NMESTADO,
				G005CO.NMCLIENT,
				G005CO.CJCLIENT,
				G003CO.NMCIDADE,
				G002CO.NMESTADO,
                G051.TPTRANSP,
                G051.DTCALDEP,
				A001.IDA001,
				A001.DTREGIST,
				A001.DTFIM,
				G051.DTROTERI,
				G051.DTAGENDA,
				G051.IDG051,
				G043.DTENTREG, 
				G014.IDG014,
				G043.DTENTCON,
				dbms_lob.substr( A003.DSOBSERV, 4000, 1 ),
                A002.DSTPMOTI,
                A006.DSSITUAC,
				S001.NMUSUARI

				` +
                sqlOrder +
                sqlPaginate,
            param: bindValues,
            fetchInfo: "DSOBSERV"
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
    };

    api.listarRelatorioPerformance = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            

            if (req.body['parameter[TPMODCAR]'] != undefined && req.body['parameter[TPMODCAR]'] != null && req.body['parameter[TPMODCAR]'] != '') {
                if (req.body['parameter[TPMODCAR]'] == 1) {
                    whereOperac = ` And (SELECT 
                        G046X.TPMODCAR as TPMODCAR
                       FROM G046 G046X
                         JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                         JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                         WHERE G049X.IDG043 = G043.IDG043 AND G046X.STCARGA <> 'C'
                         ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
                     ) = 1 `;
                } else if (req.body['parameter[TPMODCAR]'] == 2) {
                    whereOperac = ` And (SELECT 
                        G046X.TPMODCAR as TPMODCAR
                       FROM G046 G046X
                         JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                         JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                         WHERE G049X.IDG043 = G043.IDG043 AND G046X.STCARGA <> 'C'
                         ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
                     ) = 2 `;
                }else if (req.body['parameter[TPMODCAR]'] == 3) {
                    whereOperac = ` And (SELECT 
                        G046X.TPMODCAR as TPMODCAR
                       FROM G046 G046X
                         JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                         JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                         WHERE G049X.IDG043 = G043.IDG043 AND G046X.STCARGA <> 'C'
                         ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
                     ) = 3 `;
                }else{
                    whereOperac = '' 
                }
       
                delete req.body['parameter[TPMODCAR]'];
            } else {
                whereOperac = '';
            } 

            //filtra,ordena,pagina
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);
            
            sqlWhere = sqlWhere + whereOperac +  `  And G051.SnDelete = 0 `;

            let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
                esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1) OR (A001.IDA001 IS NULL)) And '
            });

            if (typeof sqlWhereAcl == 'undefined') {
                sqlWhereAcl = '';
            }

            if (typeof (req.UserId) == 'undefined') {
                joinVisaoClient = '';
            }

            let sql = ` 
			Select Distinct G043.IDG043,
							G083.IDG083,
							G014.IDG014,
							G051.QTDIAENT AS PRAZO,
							Nvl(G083.NRNOTA,G043.NRNOTA) AS NRNOTA, /* Número da Nota */
							Nvl(G051.CDCTRC,0) As G051_CDCTRC, /* Número do CTe */

                            Nvl(G024EM.NMTRANSP,'n.i.') As G024EM_NMTRANSP, /* Nome da Transportadora Emissora*/
                            Nvl(G024EM.IDLOGOS,0) As G024EM_IDLOGOS, /*Empresa Logos*/

							Nvl(To_Char(G083.DTEMINOT,'DD/MM/YYYY'),To_Char(G043.DTEMINOT,'DD/MM/YYYY')) As DTEMINOT, /* Data de Emissão da NFe */
							Nvl(To_Char(G051.DTEMICTR,'DD/MM/YYYY'),'n.i.') As DTEMICTR, /* Data de Emissão do CTe */
							Nvl(To_Char(G051.DTCOLETA,'DD/MM/YYYY'),'n.i.') As DTCOLETA, /* Data de Coleta */
							Nvl(To_Char(G043.DTENTCON,'DD/MM/YYYY'),'n.i.') As DTENTCON, /* Data SLA */
							Nvl(To_Char(G043.DTENTREG,'DD/MM/YYYY'),'n.i.') As DTENTREG, /* Data Entrega */
							Nvl(To_Char(G051.DTAGENDA,'DD/MM/YYYY'),'n.i.') As G051_DTAGENDA, /* Data Agendada */
							Nvl(TO_CHAR(G043.DTBLOQUE,'DD/MM/YYYY'),'n.i.') AS DTBLOQUE, /* Data de Bloqueio */
							Nvl(TO_CHAR(G043.DTDESBLO,'DD/MM/YYYY'),'n.i.') AS DTDESBLO, /* Data de Desbloqueio */
							Nvl(To_Char(G051.DTROTERI,'DD/MM/YYYY'),'-') As G051_DTROTERI, /* Data de Roteirização */
							Nvl(To_Char(G083.PSBRUTO, 'FM999G999G999D90', 'nls_numeric_characters='',.'''),To_Char(G043.PSBRUTO, 'FM999G999G999D90', 'nls_numeric_characters='',.''')) As PSBRUTO, /* Peso da Nota */
							'R$ ' || To_Char(G043.VRDELIVE, 'FM999G999G999D90', 'nls_numeric_characters='',.''') As VRDELIVE, /* Valor da Nota */
							Nvl(To_Char(Nvl(G051.DTCALDEP, G051.DTCALANT),'DD/MM/YYYY'),'n.i.') As DTREPROG, /* Data Reprogramada */
							
							Case
                            When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                                Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                            When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G014.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                                Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                            Else
                                Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                            End as DTPREENT, /* Data de Previsão de Entrega */

                            
							Nvl(G005RE.NMCLIENT,'n.i.') As G005RE_NMCLIENTRE, /* Nome do Remetente ( Filial e Remetente ) */
							FN_FORMAT_CNPJ_CPF(G005RE.CJCLIENT) As G005RE_CJCLIENTRE, /* CNPJ do Remetente ( Filial e Remetente ) */
							Nvl(G003RE.NMCIDADE,'n.i.') As G003RE_NMCIDADERE, /* Nome da Cidade do Remetente ( Filial e Remetente )  */
							Nvl(G002RE.NMESTADO,'n.i.') As G002RE_NMESTADORE, /* Nome do Estado do Remetente ( Filial e Remetente ) */
							Nvl(G005DE.NMCLIENT,'n.i.') As G005DE_NMCLIENTDE, /* Nome do Destinatário */
							Nvl(FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT),'n.i.') As G005DE_CJCLIENTDE, /* CNPJ do Destinatário */
							Nvl(G003DE.NMCIDADE,'n.i.') As G003DE_NMCIDADEDE, /* Nome da Cidade do Destinatário */
							G003DE.IDG003 AS G003DE_IDG003,
							Nvl(G002DE.NMESTADO,'n.i.') As G002DE_NMESTADODE, /* Nome do Estado do Destinatário */
							Nvl(G005RC.NMCLIENT,'n.i.') As G005RC_NMCLIENTRC, /* Nome do Recebedor */
							Nvl(FN_FORMAT_CNPJ_CPF(G005RC.CJCLIENT),'n.i.') As G005RC_CJCLIENTRC, /* CNPJ do Recebedor */
							Nvl(G003RC.NMCIDADE,'n.i.') As G003RC_NMCIDADERC, /* Nome da Cidade do Recebedor */
							Nvl(G002RC.NMESTADO,'n.i.') As G002RC_NMESTADORC, /* Nome do Estado do Recebedor */
							Nvl(G005EX.NMCLIENT,'n.i.') As G005EX_NMCLIENTEX, /* Nome do Expedidor */
							Nvl(FN_FORMAT_CNPJ_CPF(G005EX.CJCLIENT),'n.i.') As G005EX_CJCLIENTEX, /* CNPJ do Expedidor */
							Nvl(G003EX.NMCIDADE,'n.i.') As G003EX_NMCIDADEEX, /* Nome da Cidade do Expedidor */
							Nvl(G002EX.NMESTADO,'n.i.') As G002EX_NMESTADOEX, /* Nome do Estado do Expedidor */
							Nvl(G005CO.NMCLIENT,'n.i.') As G005CO_NMCLIENTCO, /* Nome do Tomador */
							Nvl(FN_FORMAT_CNPJ_CPF(G005CO.CJCLIENT),'n.i.') As G005CO_CJCLIENTCO, /* CNPJ do Tomador */
							Nvl(G003CO.NMCIDADE,'n.i.') As G003CO_NMCIDADECO, /* Nome da Cidade do Tomador */
							Nvl(G002CO.NMESTADO,'n.i.') As G002CO_NMESTADOCO, /* Nome do Estado do Tomador */
                            
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
							End As G051_TPTRANSP,  
                            
							C_03.S001_NMUSUARI,
							C_03.A001_IDA001,
							C_03.A001_DTREGIST,
							C_03.A001_DTFIM,
							C_03.DSOBSERV,
							C_03.A002_DSTPMOTI,
							
							C_01.ate as A001_QTD_ATENDIMENTOS,
							C_01.oco as A001_QTD_OCORRENCIAS,
							O_04.NRFROTA AS G032_NRFROTA,
							O_02.IDG046 AS G046_IDG046,
                            CASE 
                                WHEN O_05.TPMODCAR = 1 THEN '3PL'
                                WHEN O_05.TPMODCAR = 2 THEN '4PL'
                                WHEN O_05.TPMODCAR = 3 THEN 'MISTA'
                                ELSE '' End TPMODCAR,
							Count(G043.IdG043) Over() As COUNT_LINHA
					From G052 G052
					Join G043 G043
					 On (G052.IDG043 = G043.IDG043)
					Join G051 G051 
						On (G052.IDG051 = G051.IDG051)
					Join G083 G083 
						On (G083.IDG083 = G052.IDG083)
					Left Join G022 G022   
						On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
					Left Join G014 G014
						On (G014.IDG014 = G022.IDG014)
                    Left Join G049 G049   
						On (G049.IDG043 = G043.IDG043 )
					Left Join G048 G048
						On (G048.IDG048 = G049.IDG048)
					Left Join G046 G046
						On (G046.IDG046 = G048.IDG046)
					Left Join G024 G024
						On (G024.IDG024 = G046.IDG024 And G024.SnDelete = 0)
					Join G024 G024EM
						On (G024EM.IDG024 = G051.IDG024 And G024EM.SnDelete = 0 And G024EM.IDG023 = 2)
					Left Join G005 G005RE /* Remetente */
						On (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
					Left Join G003 G003RE /* Estado do Remetente */
						On (G003RE.IDG003 = G005RE.IdG003)
					Left Join G002 G002RE /* Cidade do Remetente */
						On (G002RE.IDG002 = G003RE.IdG002)
					Left Join G005 G005DE /* Destinatário */
						On (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
					Left Join G003 G003DE /* Estado do Destinatário */
						On (G003DE.IDG003 = G005DE.IDG003)
					Left Join G002 G002DE /* Cidade do Destinatário */
						On (G002DE.IDG002 = G003DE.IDG002)
					Left Join G005 G005RC /* Recebedor */
						On (G005RC.IDG005 = G051.IDG005RC)
					Left Join G003 G003RC /* Estado do Recebedor */
						On (G003RC.IDG003 = G005RC.IDG003)
					Left Join G002 G002RC /* Cidade do Recebedor */
						On (G002RC.IDG002 = G003RC.IDG002)
					Left Join G005 G005EX /* Expedidor */
						On (G005EX.IDG005 = G051.IDG005EX)
					Left Join G003 G003EX /* Estado do Expedidor */
						On (G003EX.IDG003 = G005EX.IDG003)
					Left Join G002 G002EX /* Cidade do Expedidor */
						On (G002EX.IDG002 = G003EX.IDG002)
					Left Join G005 G005CO /* Tomador */
						On (G005CO.IDG005 = G051.IDG005CO)
					Left Join G003 G003CO /* Estado do Tomador */
						On (G003CO.IDG003 = G005CO.IDG003)
					Left Join G002 G002CO /* Cidade do Tomador */
						On (G002CO.IDG002 = G003CO.IDG002)
                    Left Join A005 A005 /* Vínculo do Atendimento com a Nota Fiscal */
						On (A005.IDG043 = G043.IDG043)
                    Left Join A001 A001 /* Atendimento  */
						On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
					Left Join A002 A002 /* Motivo do Atendimento */
						On (A002.IDA002 = A001.IDA002)
					Left Join S001 S001 /* Usuário */
                        On (A001.IDSOLIDO = S001.IDS001 AND S001.SNDELETE = 0)
                    ${joinVisaoClient}
                        
            cross apply
              ( Select 
                COUNT(CASE A002.IDA008 WHEN 1 THEN 1 END) AS ATE,
                COUNT(CASE A002.IDA008 WHEN 2 THEN 1 END) AS OCO
                From A005 A005
                Join A001 A001
                  On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
                Join A002 A002
                  On (A001.IDA002 = A002.IDA002)
                Where A005.IDG043 = G043.IDG043
                 
              ) C_01
              
            outer apply                
                  (SELECT 
                     G046X.IDG046 as IDG046
                    FROM G046 G046X
                      JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                      JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                      WHERE G049X.IDG043 = G043.IDG043 AND G046X.STCARGA <> 'C'
                      ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
                  ) O_02
              
            cross apply
              ( Select Distinct
                    LISTAGG (S001X.NMUSUARI, ', ') WITHIN GROUP (ORDER BY A001X.IDA001) as S001_NMUSUARI,
                    LISTAGG (A001X.IDA001, ', ') WITHIN GROUP (ORDER BY A001X.IDA001) as A001_IDA001,
                    LISTAGG (To_Char(A001X.DTREGIST,'DD/MM/YYYY HH24:MI'), ', ') WITHIN GROUP (ORDER BY A001X.IDA001) as A001_DTREGIST,
                    LISTAGG (To_Char(A001X.DTFIM,'DD/MM/YYYY HH24:MI'), ', ') WITHIN GROUP (ORDER BY A001X.IDA001) as A001_DTFIM,
                    LISTAGG (dbms_lob.substr( A003X.DSOBSERV, 4000, 1 ), ' @#$ ') WITHIN GROUP (ORDER BY A001X.IDA001) as DSOBSERV,
                    LISTAGG (A002X.DSTPMOTI, ', ') WITHIN GROUP (ORDER BY A001X.IDA001) as A002_DSTPMOTI
                From A001 A001X
                Join A005 A005X On (A001X.IDA001 = A005X.IDA001)
                Join S001 S001X On (S001X.IDS001 = A001X.IDSOLIDO)
                JOIN A003 A003X ON (A003X.IDA001 = A001X.IDA001)
                JOIN A002 A002X ON (A002X.IDA002 = A001X.IDA002)
                Where A005X.IDG043 = G043.IDG043 AND A001X.SNDELETE = 0
              ) C_03

            outer apply
                (SELECT 
                    G024Y.IDLOGOS || '/' || G032Y.NRFROTA as NRFROTA
                FROM G046 G046Y
                    JOIN G032 G032Y ON (G032Y.IDG032 = Nvl(G046Y.IDG032V1, Nvl(G046Y.IDG032V2, G046Y.IDG032V3)) )
                    JOIN G024 G024Y ON (G032Y.IDG024 = G024Y.IDG024 AND G024Y.SNDELETE = 0)

                    WHERE G046Y.IDG046 = O_02.IDG046
                ) O_04
            
            outer apply                
                (SELECT 
                   G046X.TPMODCAR as TPMODCAR 
                  FROM G046 G046X
                    JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                    JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                    WHERE G049X.IDG043 = G043.IDG043 AND G046X.STCARGA <> 'C'
                    ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
                ) O_05  ` +
                sqlWhere + sqlWhereAcl +

                `Group by G043.IDG043,
							G043.NRNOTA,
							G051.CDCTRC,
							--G024.NMTRANSP,
                            G024EM.NMTRANSP,
                            G024EM.IDLOGOS,
							--G046.IDG046,
							G043.DTEMINOT,
							G051.DTEMICTR,
							G051.DTCOLETA,
							--G046.DTCOLORI, 
							--G046.DTCOLATU, 
							G043.DTENTCON,
							G043.DTENTREG, 
							G051.DTAGENDA, 
							G043.DTBLOQUE,
							G043.DTDESBLO,
							G051.DTROTERI,
							G043.PSBRUTO,
							G043.VRDELIVE,
							G051.DTCALDEP,
							G051.DTCALANT,
							G051.IDG051,
							G043.DTENTREG,
              G043.DTENTCON,
							G005RE.NMCLIENT,
							G005RE.CJCLIENT,
							G003RE.NMCIDADE,
							G002RE.NMESTADO,
							G005DE.NMCLIENT, 
							G005DE.CJCLIENT,
							G003DE.NMCIDADE,
							G002DE.NMESTADO, 
							G005RC.NMCLIENT, 
							G005RC.CJCLIENT, 
							G003RC.NMCIDADE, 
							G002RC.NMESTADO,
							G005EX.NMCLIENT,
							G005EX.CJCLIENT,
							G003EX.NMCIDADE,
							G002EX.NMESTADO,
							G005CO.NMCLIENT,
							G005CO.CJCLIENT,
							G003CO.NMCIDADE,
							G002CO.NMESTADO,
							G083.NRNOTA,
							G083.DTEMINOT,
							G083.PSBRUTO,
							G083.IDG083,
							G014.IDG014,
							G051.TPTRANSP,					
							G003DE.IDG003,
							G051.QTDIAENT,
							C_03.S001_NMUSUARI,
							C_03.A001_IDA001,
							C_03.A001_DTREGIST,
							C_03.A001_DTFIM,
							C_03.DSOBSERV,
							C_03.A002_DSTPMOTI,
							C_01.ate, 
							C_01.oco,
							O_04.NRFROTA, 
                            O_02.IDG046,
                            O_05.TPMODCAR `;

            console.log('sql ',sql)
            let resultCount = await con.execute({
                sql: ` select count( distinct x.IDG083) as QTD from (` + sql + `) x `,
                param: bindValues
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            
            var reqAux = req;
            let result = await con.execute(

                {
                    sql: sql +
                        sqlOrder +
                        sqlPaginate,
                    param: bindValues
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (result && result != null && result.length > 0) {

                if (result.length > 0) {
                    result[0].COUNT_LINHA = resultCount.QTD;
                }
            }

            result = (utils.construirObjetoRetornoBD(result, reqAux.body, true));


            await con.close();
            return result;
        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;

        }
    };

    api.listarRelatorioAlteracaoDatas = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'A005', false);

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        let result = await con.execute({
            sql: ` 
			Select distinct  (G043.IDG043 || A001.IDA001) As IDG043, /* Identificador da Nota */
							G043.NRNOTA As G043_NRNOTA, /* Número da Nota */
							A001.IDA001 As A001_IDA001, /* Protocolo de Atendimento */
							Nvl(G051.CDCTRC, 0) As G051_CDCTRC, /* Número do CTE */
							A001.IDSOLIDO As A001_IDSOLIDO, /* Quem alterou a Data */
							S001.NMUSUARI As S001_NMUSUARI, /* Nome de quem alterou a data */
							G005RE.RSCLIENT As G005RE_RSCLIENTRE,
							G005DE.RSCLIENT As G005DE_RSCLIENTDE,
							G005RE.NMCLIENT As G005RE_NMCLIENTRE,
							G005DE.NMCLIENT As G005DE_NMCLIENTDE,
							G003RE.NMCIDADE As G003RE_NMCIDADERE,
							G002RE.NMESTADO As G002RE_NMESTADORE,
							G003DE.NMCIDADE As G003DE_NMCIDADEDE,
							G002DE.NMESTADO As G002DE_NMESTADODE,
							G005CO.NMCLIENT As G005CO_NMCLIENTCO,
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
							End As G051_TPTRANSP, /* Tipo de Operação */
							Nvl(G024.NMTRANSP, 'n.i.') As G024_NMTRANSP,
							Nvl(G046.CDVIAOTI, 0) As G046_CDVIAOTI,
							Nvl(TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY'), 'n.i.') AS DTEMINOT,
							Nvl(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'), 'n.i.') As G051_DTEMICTR,
							Nvl(TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY'), 'n.i.') As DTENTREG,
							Nvl(TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY'), 'n.i.') AS DTBLOQUE,
							Nvl(TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY'), 'n.i.') AS DTDESBLO,

							/*Case
							When(
								Case 
									When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
									To_Date(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
									When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
									Case 
										When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
										To_Date(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
									End
								End) < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null Then
									Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
								Else
								Case 
									When Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON) >= To_Date(CURRENT_DATE,'DD/MM/YYYY') Then
									To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT,G043.DTENTCON),'DD/MM/YYYY')
									When G051.DTCALDEP Is Not Null Or G051.DTENTPLA Is Not Null Or G051.DTCALANT Is Not Null Then
									Case 
										When Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)) > CURRENT_DATE Then
										To_Char(Greatest(Nvl(G051.DTCALDEP,SYSDATE - 365 * 1000),Nvl(G051.DTENTPLA,SYSDATE - 365 * 1000), Nvl(G051.DTCALANT,SYSDATE - 365 * 1000)),'DD/MM/YYYY')
									Else
										'n.i.'
									End
								Else
									'n.i.'
								End 
							End As G051_DTPREENT,*/ /* Data de Previsão de Entrega */

							Case
                            When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                                Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                            When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                                Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                            Else
                                Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                            End as G051_DTPREENT, /* Data de Previsão de Entrega */

							Nvl(To_Char(A001.DTREGIST, 'DD/MM/YYYY HH24:MI'),'n.i.') As A001_DTREGIST, /* Data Que Alterou a Data */
							Nvl(To_Char(G051.DTAGENDA, 'DD/MM/YYYY'), 'n.i.') As G051_DTAGENDA, /* Data Agendada */
							Nvl(To_Char(G051.DTCOMBIN, 'DD/MM/YYYY'), 'n.i.') As G051_DTCOMBIN, /* Data Combinada */
							Nvl(To_Char(G051.DTROTERI, 'DD/MM/YYYY'), 'n.i.') As G051_DTROTERI, /* Data Roteirizada */
							NVL(dbms_lob.substr( A003.DSOBSERV, 4000, 1 ),' ') as DSOBSERV, /* Conteúdo da Ultima Movimentação */
							Nvl(To_Char(G043.DTENTCON, 'DD/MM/YYYY'),'n.i.') As G043_DTENTCON,
							Case
								When A001.STDATAS = 'A' Then
									'Agendada'
								When A001.STDATAS = 'C' Then
									'Combinada'
								When A001.STDATAS = 'E' Then
									'Entrega'
								When A001.STDATAS = 'B' Then
									'Bloqueio'
								When A001.STDATAS = 'D' Then
									'Desbloqueio'
								When A001.STDATAS Is Null Then
									'n.i.'
							End As A001_STDATAS, /* Qual Data foi alterada */
							Count(G043.IdG043) Over() As COUNT_LINHA
					From A005 A005
					Join A001 A001
						On (A005.IDA001 = A001.IDA001 And A001.SNDELETE = 0 And (A001.SNDTALTE = 1 OR A001.IDA002 = 46)) /*Alteração de Datas */
					Join A002 A002
						On (A002.IDA002 = A002.IDA002)
					Join G043 G043
						On (G043.IDG043 = A005.IDG043)
					Join A003 A003
						On (A003.IDA001 = A001.IDA001 And
							A003.IDA003 = (Select Max(A003_2.IDA003)
																From A003 A003_2
																Where A003_2.IDA001 = A001.IDA001))
					Left Join G052 G052
						On (G052.IDG043 = G043.IDG043)
					Left Join G051 G051
						On (G052.IDG051 = G051.IDG051)
					Left Join G022 G022 
						On G022.IdG005 = G051.IdG005CO AND NVL(G022.SNINDUST,1) = 1
					Left Join G014 G014
						On (G014.IDG014 = G022.IDG014)
					Join G005 G005RE
					  	On (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
				  	Left Join G003 G003RE
					  	On (G003RE.IDG003 = G005RE.IdG003)
					Left Join G002 G002RE
					  	On (G002RE.IDG002 = G003RE.IdG002)
					Join G005 G005DE
					  	On (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
					Left Join G003 G003DE
						On (G003DE.IDG003 = G005DE.IdG003)
					Left Join G002 G002DE
						On (G002DE.IDG002 = G003DE.IdG002)
					Left Join G005 G005CO
						On (G051.IDG005CO = G005CO.IDG005)
					Left Join G049 G049   
						On (G049.IDG043 = G043.IDG043 )
					Left Join G048 G048
						On (G049.IDG048 = G048.IDG048)
					Left Join G046 G046
						On (G048.IDG046 = G046.IDG046)
					Left Join G024 G024 
						On (G024.IdG024 = G046.IdG024)
					Join S001 S001
                        On (S001.IDS001 = A001.IDSOLIDO)
                    ${joinVisaoClient}` +
                sqlWhere + sqlWhereAcl +
                sqlOrder +
                sqlPaginate,
            param: bindValues,
            fetchInfo: "DSOBSERV"

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
    };

    api.salvarNovoAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    NMSOLITE: req.body.NMSOLITE,
                    TFSOLITE: req.body.TFSOLITE,
                    DTREGIST: new Date(),
                    SNDELETE: 0,
                    SNDTALTE: req.body.REFDATA
                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // Insere as informações dos itens da configuração do motivo escolhido
            if (req.body.ARCONFIG && req.body.ARCONFIG.length > 0) {
                for (let i = 0; i < req.body.ARCONFIG.length; i++) {
                    await api.inserirInfoConfig(idAtendimento, req.body.ARCONFIG[i], con, req.UserId);
                }
            }

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 1, req.body.IDSOLIDO, (req.body.IDS001DE ? req.body.IDS001DE.id : ''), con, req.UserId);

            // - Faz o Vínculo do atendimento com a nota-fiscal
            await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);

            //Parte chave do código, SNUPLOAD true significa que há anexos, nesse caso, a etapa do email é ignorada e acontece
            //dentro da função de upload, caso contrário, o envio do email segue normalmente por aqui
         if (req.body.NMGRUPOC.length > 0 && req.body.NMGRUPOC != '' && req.body.NMGRUPOC != null && req.body.NMGRUPOC != undefined && !req.body.SNUPLOAD) {
                await api.enviarAtendimento(req.body.NMGRUPOC, con, req.UserId, idAtendimento, req.body.IDG043, 'Aberto', req.headers.origin);
            }

            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.salvarFinalizarNovoAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let validaMotivo = null;

        if (req.body.SNSYNGENTA == 1) {

            validaMotivo = await con.execute({
                sql: `
					SELECT 
						A015.IDA015, 
						A015.IDA002, 
						A015.IDI015 
					FROM A015 A015 
					WHERE A015.IDA002 = ${req.body.IDA002}`,
                param: []
            })
                .then((result) => {
                    return (result);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            if (validaMotivo.length != 1) {
                res.status(400).send({ msg: 'Motivo não encontrado no 4PL ' });
                return false;
            }

        }


        let STDATAS = '';

        // - É alteração de Datas
        if ((req.body.DTAGENDA != null && req.body.DTAGENDA != undefined && req.body.DTAGENDA != '') ||
            (req.body.DTCOMBIN != '' && req.body.DTCOMBIN != null && req.body.DTCOMBIN != undefined)) {
            // - Alteração de Data Agendada
            if (req.body.DTAGENDA != null && req.body.DTAGENDA != "") {
                STDATAS = 'A';
            }

            // - Alteração de Data Combinada
            if (req.body.DTCOMBIN != null && req.body.DTCOMBIN != "") {
                STDATAS = 'C';
            }
        } else if (req.body.IDA002 == 47) {
            if (req.body.MANTESLA != null && req.body.MANTESLA != undefined && req.body.MANTESLA != '') {
                STDATAS = 'S';
            } else {
                STDATAS = 'B';
            }
        } else if (req.body.IDA002 == 48) {
            STDATAS = 'D';
        } else if (req.body.DTENTREG != undefined && req.body.DTENTREG != null && req.body.DTENTREG != '' && req.body.SNSYNGENTA != 1) {
            STDATAS = 'E';
        } else if (req.body.DTCALDEP != undefined && req.body.DTCALDEP != null && req.body.DTCALDEP != '' && req.body.SNSYNGENTA != 1) {
            STDATAS = 'L';
        }

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    NMSOLITE: req.body.NMSOLITE,
                    TFSOLITE: req.body.TFSOLITE,
                    DTREGIST: new Date(),
                    DTFIM: new Date(),
                    SNDELETE: 0,
                    STDATAS: STDATAS,
                    SNDTALTE: req.body.REFDATA 

                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // Insere as informações dos itens da configuração do motivo escolhido
            if (req.body.ARCONFIG && req.body.ARCONFIG.length > 0) {
                for (let i = 0; i < req.body.ARCONFIG.length; i++) {
                    await api.inserirInfoConfig(idAtendimento, req.body.ARCONFIG[i], con, req.UserId);
                }
            }

            // - Faz a criação da movimentação
            // await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 1, req.body.IDSOLIDO, '', con, req.UserId);

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 4, req.body.IDSOLIDO, '', con, req.UserId);

            // - Declaro uma váriavel pra retornar alguma validação.
            let retorno = '';
            // - Alteração de Data
            // if (req.body.IDA002 == 46) {
            // 	if (req.body.DTAGENDA != null || req.body.DTCOMBIN != null || req.body.DTROTERI != null) {
            // 		// - Faz a alteração de Datas
            // 		await api.alterarDatas(req.body.IDG051, req.body.DTAGENDA, req.body.DTCOMBIN, req.body.DTROTERI, req.body.DTBLOQUE, req.body.DTDESBLO, con, req.UserId);
            // 	}
            // } else if (req.body.IDA002 == 47 || req.body.IDA002 == 48) {
            // 	// - É bloqueio de nota-fiscal.
            // 	retorno = await api.manageBloqueiosNotaFiscal(req.body.IDA002, req.body.IDG043, con, req.UserId);
            // }


            if ((req.body.DTAGENDA != null && req.body.DTAGENDA != "" && req.body.DTAGENDA != undefined) ||
                (req.body.DTCOMBIN != null && req.body.DTCOMBIN != "" && req.body.DTCOMBIN != undefined) ||
                (req.body.DTROTERI != null && req.body.DTROTERI != "" && req.body.DTROTERI != undefined) ||
                (req.body.DTCALDEP != null && req.body.DTCALDEP != "" && req.body.DTCALDEP != undefined)) {
                // - Faz a alteração de Datas

                await api.alterarDatas(req.body.IDG051, req.body.DTAGENDA, req.body.DTCOMBIN, req.body.DTROTERI, req.body.DTCALDEP, req.body.DTBLOQUE, req.body.DTDESBLO, con, req.UserId, req.body.SNSYNGENTA, validaMotivo, idAtendimento);

            }

            if (req.body.IDA002 == 47 || req.body.IDA002 == 48) {
                // - É bloqueio ou desbloqueio de nota-fiscal.
                retorno = await api.manageBloqueiosNotaFiscal(req.body.IDA002, req.body.IDG043, req.body.MANTESLA, con, req.UserId);

                let valida4PL = await con.execute({
                    sql: ` select g043.idg014, g043.idg043 from g043 g043 where g043.idg043 = ${req.body.IDG043}`,
                    param: []
                })
                .then((result) => {
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

                if (valida4PL.IDG014 == 5 && req.body.IDA002 == 48){
                    req.conexao = con;
                    //var retornoB = await deliveryRota.envioOtimizadorManual(req, res, next);
                }
            }

            if (req.body.DTENTREG != undefined && req.body.DTENTREG != null && req.body.DTENTREG != '' && req.body.SNSYNGENTA != 1) {
                await api.alterarDataEntrega3PL(req.body.IDG051, req.body.IDG043, req.body.DTENTREG, con, req.UserId, idAtendimento);
            }

            if (retorno.INTEGRADOR == 1) {
                await con.closeRollback();
                return {
                    integrador: 1
                };
            } else {
                // - Faz o Vínculo do atendimento com a nota-fiscal
                // - Verifica a váriavel retorno 
                if (req.body.IDA002 == 47 || req.body.IDA002 == 48) {
                    if (retorno.IDG051 != 0) {
                        let notasFiscais = await api.getNotasByCte(retorno.IDG051, con, req.UserId);
                        if (Array.isArray(notasFiscais) && notasFiscais.length > 0) {
                            let arrayNotas = [];
                            for (let i = 0; i < notasFiscais.length; i++) {
                                // - Realiza o insert da S021 do submenu
                                arrayNotas.push(notasFiscais[i].IDG043);
                            }
                            await api.criarVinculoNotaFiscal(idAtendimento, arrayNotas, con, req.UserId);
                        }
                    } else {
                        await api.criarVinculoNotaFiscal(idAtendimento, retorno.IDG043, con, req.UserId);
                    }
                } else if (req.body.IDA002 == 143 && req.body.IDG046) {
                    let nfCarga = [];
                    let nfCargaAux = await api.getNfCarga(req.body.IDG046, con, req.UserId);
                    nfCargaAux.map(e => nfCarga.push(e.IDG043));
                    await api.criarVinculoNotaFiscal(idAtendimento, nfCarga, con, req.UserId);
                } else {
                    await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);
                }
            }

            //Parte chave do código, SNUPLOAD true significa que há anexos, nesse caso, a etapa do email é ignorada e acontece
            //dentro da função de upload, caso contrário, o envio do email segue normalmente por aqui
            if (req.body.NMGRUPOC != undefined) {
                if (req.body.NMGRUPOC.length > 0 && req.body.NMGRUPOC != '' && req.body.NMGRUPOC != null && !req.body.SNUPLOAD) {
                   await api.enviarAtendimento(req.body.NMGRUPOC, con, req.UserId, idAtendimento, req.body.IDG043, 'Finalizado', req.headers.origin);
                }
            }



            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.criarMovimentacao = async function (IDA001, DSOBSERV, IDA006, IDS001RE, IDS001DE, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        try {
            let result2 = await con.insert({
                tabela: `A003`,
                colunas: {
                    IDA001: IDA001,
                    DSOBSERV: DSOBSERV,
                    IDA006: IDA006,
                    IDS001RE: IDS001RE,
                    IDS001DE: IDS001DE,
                    DTMOVIME: new Date()
                }
            })
            await con.close();
            return result2;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.inserirInfoConfig = async function (IDA001, ARCONFIG, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        try {
            let result2 = await con.insert({
                tabela: `G076`,
                colunas: {
                    IDG075: ARCONFIG.IDG075,
                    IDS007PK: IDA001,
                    VRCAMPO: ARCONFIG.VRCAMPO,
                    SNDELETE: 0
                }
            })
            await con.close();
            return result2;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.alterarDatas = async function (IDG051, DTAGENDA, DTCOMBIN, DTROTERI, DTCALDEP, DTBLOQUE, DTDESBLO, con1, userId, SNSYNGENTA, motivosReasonAtendimento, IDA001) {

        let con = await this.controller.getConnection(con1, userId);

        let STLOGOS = '';
        // - Se for data agendada
        if (DTAGENDA != null && DTAGENDA != '') {
            STLOGOS = 'A'
        }
        // - Se for data combinada
        if (DTCOMBIN != null && DTCOMBIN != '') {
            STLOGOS = 'C'
        }

        // - Se for data planejada
        if (DTCALDEP != null && DTCALDEP != '') {
            STLOGOS = null;
        }

        dataHoje = new Date();

        let hora = dataHoje.getHours();
        let minuto = dataHoje.getMinutes();
        let segundo = dataHoje.getSeconds();

        let result3;

        try {

            let result2;
            let objCtes = [];
            console.log("typeof IDG051 ", typeof IDG051);
            if (typeof IDG051 == "number" || typeof IDG051 == "string") {
                objCtes[0] = IDG051;
            } else {
                objCtes = IDG051;
            }

            for (let i = 0; i < objCtes.length; i++) {
                result2 = await con.execute({
                    sql: `        
						Update G051 G051
							Set ` + (DTAGENDA ? ` G051.DTAGENDA = To_Date('${DTAGENDA} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),` : '') +
                        `` + (DTROTERI ? ` G051.DTROTERI = To_Date('${DTROTERI} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),` : '') +
                        `` + (DTCOMBIN ? ` G051.DTCOMBIN = To_Date('${DTCOMBIN} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),` : '') +
                        `` + (DTCALDEP ? ` G051.DTCALDEP = To_Date('${DTCALDEP} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),` : '') +
                        `` + (DTCALDEP ? ` G051.STLOGOS = G051.STLOGOS ` : `G051.STLOGOS = '${STLOGOS}' `) + `
						Where G051.IDG051 = ${objCtes[i]}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                if (SNSYNGENTA == 1) {
                    let result4 = await con.execute({
                        sql: `        
						Update G051 G051
							Set 
									G051.STINTCLI = 1,
									G051.IDI015 = ${motivosReasonAtendimento[0].IDI015}
						Where G051.IDG051 = ${objCtes[i]}`,
                        param: []
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
            if (STLOGOS == 'A') {
                result3 = await con.execute({
                    sql: `        
					Update A001 A001
						 Set A001.DTALTER1 = To_Date('${DTAGENDA} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),
						 A001.DTALTER2 = To_Date('${DTROTERI} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS')
					 Where A001.IDA001 = ${IDA001}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            } else if (STLOGOS == 'C') {
                result3 = await con.execute({
                    sql: `        
					Update A001 A001
						 Set A001.DTALTER1 = To_Date('${DTCOMBIN} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),
						 A001.DTALTER2 = To_Date('${DTROTERI} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS')
					 Where A001.IDA001 = ${IDA001}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            } else if (DTCALDEP != null && DTCALDEP != '') {
                result3 = await con.execute({
                    sql: `        
                Update A001 A001
                     Set A001.DTALTER1 = To_Date('${DTCALDEP} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS')
                 Where A001.IDA001 = ${IDA001}`,
                    param: []
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
            return result2;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.alterarDataEntrega3PL = async function (IDG051, IDG043, DTENTREG, con1, userId, IDA001, CDCARGA) {

        let con = await this.controller.getConnection(con1, userId);

        dataHoje = new Date();

        let hora = dataHoje.getHours();
        let minuto = dataHoje.getMinutes();
        let segundo = dataHoje.getSeconds();

        try {

            let objNotas = [];
            let atualizaNotas;

            if (typeof IDG043 == "number" || typeof IDG043 == "string") {
                objNotas[0] = IDG043;
            } else {
                objNotas = IDG043;
            }

            for (let i = 0; i < objNotas.length; i++) {
                atualizaNotas = await con.execute({
                    sql: `        
					Update G043 G043
						Set  G043.DTENTREG = To_Date('${DTENTREG} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),
							G043.STLOGOS = 'E'
					Where G043.IDG043 = ${objNotas[i]}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            }

            let result3 = await con.execute({
                sql: `        
				Update A001 A001
						Set A001.DTALTER1 = To_Date('${DTENTREG} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS')
					Where A001.IDA001 = ${IDA001}`,
                param: []
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (CDCARGA != null && CDCARGA != undefined && CDCARGA != '') {

                let buscaNotaEntreg = await con.execute({
                    sql: `  
					SELECT count(g043.idg043) as QTD
					FROM g043 g043
					JOIN G049 G049
						ON G049.IDG043 = G043.IDG043
					JOIN G048 G048
						ON G048.IDG048 = G049.IDG048
						AND g048.idg046 = ${CDCARGA}
					WHERE g043.DTENTREG IS null  `,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                if (buscaNotaEntreg[0].QTD == 0) {
                    let alteraStatusCarga = await con.execute({
                        sql: `        
						Update G046 G046
							Set  G046.STCARGA = 'D'
						Where G046.IDG046 = ${CDCARGA}`,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch(async (err) => {
                            await con.closeRollback();
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                    //logger.info(`UPDATE NA CARGA G046`);
                }
            }

            await con.close();
            return atualizaNotas;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.salvarMovimentacao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let statusAtend = 'Aberto';

        try {
            let result = await con.insert({
                tabela: `A003`,
                colunas: {
                    IDA001: req.body.IDA001,
                    DSOBSERV: req.body.DSOBSERV,
                    IDA006: req.body.IDA006,
                    IDS001RE: req.body.IDS001RE,
                    IDS001DE: (req.body.IDS001DE != undefined ? req.body.IDS001DE.id : ''),
                    DTMOVIME: new Date()
                },
                key: `A003.IDA003`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - É finalização de atendimento
            if (req.body.IDA006 == 4) {
                statusAtend = 'Finalizado';
                // - Realizar update de DTFIM
                let idAtendimento = req.body.IDA001;
                let result2 = await con.update({
                    tabela: `A001`,
                    colunas: {
                        DTFIM: new Date()
                    },
                    condicoes: `A001.IDA001 = :IDA001`,
                    parametros: {
                        IDA001: idAtendimento
                    }
                }).then((result1) => {
                    return result1;
                })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            }

            //Parte chave do código, SNUPLOAD true significa que há anexos, nesse caso, a etapa do email é ignorada e acontece
            //dentro da função de upload, caso contrário, o envio do email segue normalmente por aqui
            if (req.body.NMGRUPOC != undefined) {
                if (req.body.NMGRUPOC.length > 0 && req.body.NMGRUPOC != '' && req.body.NMGRUPOC != null && !req.body.SNUPLOAD) {
                    await api.enviarAtendimento(req.body.NMGRUPOC, con, req.UserId, req.body.IDA001, null, statusAtend, req.headers.origin);
                }
            }


            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.salvarEditaMovimentacao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);


        try {
            let result = await con.update({
                tabela: `A003`,
                colunas: {
                    DSOBSERV: req.body.DSOBSERVMOD,
                },
                condicoes: `A003.IDA003 = :IDA003`,
                parametros: {
                    IDA003: req.body.IDA003
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

    api.manageBloqueiosNotaFiscal = async function (IDA002, IDG043, MANTESLA, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        let objRetorno = {
            IDG051: 0,
            IDG043: 0,
            INTEGRADOR: 1
        };

        let IDG051 = await api.haveCte(IDG043, con, userId);

        // - Verifico se a Nota possui CT-e
        if (IDG051 != null && IDG051 != '' && IDG051 != undefined) {

            // - Seto o IDG051 no Objeto de Retorno
            objRetorno.IDG051 = IDG051;

            // - Se tiver CTe
            let cidadeTarifaDAO = app.src.modMonitoria.dao.CidadeTarifaDAO;
            let req = {};
            req.body = {};
            req.body.idg051 = IDG051;
            req.body.stlogos = (IDA002 == 47 ? 'B' : 'D');
            //variavel que vai verificar se existe algum atendimento de bloqueio feito para manter SLA
            req.body.manteSla = MANTESLA;

            // - Se for desbloqueio passa a data utilizada como parâmetro.
            if (IDA002 == 48) {
                req.body.dtdesblo = tmz.tempoAtual('DD/MM/YYYY', false);
            }
            // - Passa conexão.
            req.body.con = con1;
            // - Verifico se há dias úteis e feriados cadastrados no integrador.
            ST_BLO_DES = await cidadeTarifaDAO.getDiasEntrega(req, null, null)
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    next(err);
                });

            // - Modificação devido ao Go-Live do Transportation
            // - Permitir o bloqueio de notas fiscais independente do cadastro de dias úteis.
            // - Thiago Henrique do Prado - 24/08/2018
            if (IDA002 != 48) {
                ST_BLO_DES = true;
            }

            if (ST_BLO_DES) {
                // - Pode alterar
                let notasFiscais = await api.getNotasByCte(IDG051, con, userId);
                if (Array.isArray(notasFiscais) && notasFiscais.length > 0) {
                    for (let i = 0; i < notasFiscais.length; i++) {
                        // - Realiza o insert da S021 do submenu
                        await api.setDatasBloqueiosNotaFiscal(IDA002, notasFiscais[i].IDG043, con, userId);
                    }
                }

                objRetorno.INTEGRADOR = 0;
            } else {
                // - não pode alterar
                await con.closeRollback();
                objRetorno.INTEGRADOR = 1;
            }
        } else {
            // - não tem CT-e, faz a alteração apenas na nota fiscal selecionada.
            // Aqui faz a validação do Marco
            let ST_BLO_DES = false;

            objRetorno.IDG043 = IDG043;

            let cidadeTarifaDAO = app.src.modMonitoria.dao.CidadeTarifaDAO;
            let req = {};
            req.body = {};
            req.body.idg043 = IDG043;
            req.body.stlogos = (IDA002 == 47 ? 'B' : 'D');
            //variavel que vai verificar se existe algum atendimento de bloqueio feito para manter SLA
            req.body.manteSla = MANTESLA

            if (IDA002 == 48) {
                req.body.dtdesblo = tmz.tempoAtual('DD/MM/YYYY', false);
            }
            req.body.con = con1;
            ST_BLO_DES = await cidadeTarifaDAO.getDiasEntrega(req, null, null)
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    next(err);
                });
            if (IDA002 != 48) {
                ST_BLO_DES = true;
            }
            if (ST_BLO_DES) {
                // - Faz a alteração da Data de Bloqueio ou Desbloqueio na tabela de Nota Fiscal
                await api.setDatasBloqueiosNotaFiscal(IDA002, IDG043, con, userId);

                objRetorno.INTEGRADOR = 0;
            } else {
                // - Faz a criação da movimentação
                await con.closeRollback();
                objRetorno.INTEGRADOR = 1;
            }
        }

        return objRetorno;
    };

    api.setDatasBloqueiosNotaFiscal = async function (IDA002, IDG043, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        let STLOGOS = '';

        // - Verifico se é bloqueio
        if (IDA002 == 47) {
            STLOGOS = 'B';
        } else {
            // - Então é desbloqueio
            STLOGOS = 'D';
        }

        try {
            let result = await con.update({
                tabela: `G043`,
                colunas: {
                    DTBLOQUE: (IDA002 == 47 ? new Date() : ''),
                    DTDESBLO: (IDA002 == 48 ? new Date() : ''),
                    STLOGOS: (IDA002 == 47 ? 'B' : 'D')
                },
                condicoes: `G043.IDG043 = :IDG043`,
                parametros: {
                    IDG043: IDG043
                }
            }).then((result1) => {
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

    api.criarVinculoNotaFiscal = async function (IDA001, IDG043, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);
        let result = [];

        if (Array.isArray(IDG043) && IDG043.length > 0) {
            try {
                for (let i = 0; i < IDG043.length; i++) {
                    let value = (typeof IDG043[i] === 'object' ? IDG043[i].IDG043 : IDG043[i]);
                    result[i] = await con.insert({
                        tabela: `A005`,
                        colunas: {
                            IDG043: IDG043[i],
                            IDA001: IDA001
                        }
                    })
                        .then((result1) => {
                            result[i] = result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }
            } catch (err) {
                await con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            }
        } else if (Number.isInteger(IDG043) || (!isNaN(IDG043) && Number.isInteger(parseInt(IDG043, 10)))) {
            try {
                result = await con.insert({
                    tabela: `A005`,
                    colunas: {
                        IDG043: IDG043,
                        IDA001: IDA001
                    }
                })
                    .then((result1) => {
                        result = result1;
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            } catch (err) {
                await con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            }
        }
        await con.close();
        return result;
    };

    api.getInformacoesAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDA001 = req.body.IDA001;

        try {
            let result = await con.execute({
                sql: `
					Select  A001.IDA001,
									A001.IDSOLIDO,
									A001.NMSOLITE,
									A001.TFSOLITE,       
									A008.IDA008,
									A003.IDS001DE,
									S001.NMUSUARI,
									A001.IDA002,
									A001.SNDTALTE       
						From A001 A001 
						Join A002 A002 
							On (A001.IDA002 = A002.IDA002)
						Join A008 A008
							On (A002.IDA008 = A008.IDA008) 
						Join A003 A003
							On (A003.IDA001 = A001.IDA001)
						Left Join S001 S001
							On (A003.IDS001DE = S001.IDS001)
						Where A001.IDA001 = :IDA001`,
                param: {
                    IDA001: IDA001
                }
            })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            
            let config = await api.getConfig(con, req.UserId, IDA001);

            (config && config.length > 0) ? Object.assign(result[0], { 'ARCONFIG': config }) : [];
            
            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.listarMovNotificacoes = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        let IDS001 = req.body.IDS001;

        try {
            let result = await con.execute({
                sql: `
					Select A001.IDA001, A003.IDS001DE, A002.DSTPMOTI, A008.DSACAO
						From A001 A001
						Join A003 A003
							On (A003.IDA001 = A001.IDA001 And
								A003.IDA003 = (Select Max(A003_2.IDA003)
																	From A003 A003_2
																	Where A003_2.IDA001 = A001.IDA001))
						Join A002 A002
							On (A002.IDA002 = A001.IDA002)
						Join A008 A008
							On (A008.IDA008 = A002.IDA008)
						Join A005 A005
							On (A005.IDA001 = A001.IDA001)
						Join S001 S001 
                            On S001.IdS001 = A001.IdSolido
                        ${joinVisaoClient}
            Join G043 G043
              On (G043.IDG043 = A005.IDG043)
            Left Join G052 G052
              On (G052.IDG043 = G043.IDG043)
            Left Join G051 G051
              On (G051.IDG051 = G052.IDG051)
            Left Join G022 G022
              On (G022.IDG005 = G051.IDG005CO)
            Left Join G014 G014
							On (G014.IDG014 = G022.IDG014)
						Left Join G024 G024 
						  On (G024.IdG024 = G051.IdG024)
					 Where A003.IDS001DE = :IDS001
						 And A001.DTFIM Is Null And A001.SNDELETE = 0` + sqlWhereAcl,
                param: {
                    IDS001: IDS001
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

    api.listarAvaliacoesPesquisa = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let whereClass = '';
        if (req.body['parameter[G061_CLASS]'] != undefined && req.body['parameter[G061_CLASS]'] != null && req.body['parameter[G061_CLASS]'] != '') {
            if (req.body['parameter[G061_CLASS]'] == 'P') {
                whereClass = ` And G061.NRNOTA > 8 `;
            } else if (req.body['parameter[G061_CLASS]'] == 'N') {
                whereClass = ` And G061.NRNOTA > 6 And G061.NRNOTA < 9 `;
            } else {
                whereClass = ` And G061.NRNOTA < 7 `;
            }
            delete req.body['parameter[G061_CLASS]'];
        } else {
            whereClass = '';
        }

        let whereOperac = ';'
        if (req.body['parameter[TPOPERAC]'] != undefined && req.body['parameter[TPOPERAC]'] != null && req.body['parameter[TPOPERAC]'] != '') {
            if (req.body['parameter[TPOPERAC]'] == 1) {
                whereOperac = ` And G014.SN4PL <> 1 `;
            } else if (req.body['parameter[TPOPERAC]'] == 2) {
                whereOperac = ` And G014.SN4PL = 1 `;
            }
            delete req.body['parameter[TPOPERAC]'];
        } else {
            whereOperac = '';
        }

        let whereStNPS = '';
        if (req.body['parameter[STNPS]'] != undefined && req.body['parameter[STNPS]'] != null && req.body['parameter[STNPS]'] != '') {
            switch (req.body['parameter[STNPS]']) {
                case 'R' : // Respondido
                    whereStNPS = ` And G061.NRNOTA IS NOT NULL And G061.DTAVALIA IS NOT NULL`;
                    break;
                case 'NR': // Não respondido
                    whereStNPS = ` And G061.NRNOTA IS NUll And G061.DTAVALIA IS NULL And G078.IDG078 IS NOT NULL`;
                    break;
                case 'NE': // Não Enviado
                    whereStNPS = ` And G078.IDG078 IS NULL`;
                    break;
                default:
                    whereStNPS = '';
                    break;
            }
            delete req.body['parameter[STNPS]'];
        }

        let whereSnSatisf = '';
        if (req.body['parameter[G022_SNSATISF]'] && req.body['parameter[G022_SNSATISF]'] != 1) {
            whereSnSatisf = (req.body['parameter[G022_SNSATISF]'] == 0) ? ` And G022CL.SNSATISF != 1` : '';
            delete req.body['parameter[G022_SNSATISF]'];
        }

        let whereQtdContat = '';
        let auxRelation = '';
        let whereTpContat = '';
        if ((req.body['parameter[QTDCONTAT]'] != undefined && req.body['parameter[QTDCONTAT]'] != null && req.body['parameter[QTDCONTAT]'] != '') ||
            (req.body['parameter[SNNPSCON]'] != undefined && req.body['parameter[SNNPSCON]'] != null && req.body['parameter[SNNPSCON]'] != '')) {

            let whereTpContatAux = '';
            let whereClientNPs = '';

            if (req.body['parameter[QTDCONTAT]'] != undefined && req.body['parameter[QTDCONTAT]'] != null && req.body['parameter[QTDCONTAT]'] != '') {
                whereTpContatAux = ` AND G008X.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                whereQtdContat = ` ${req.body['parameter[QTDCONTAT]'] == 0 ? ` AND G020X.IDG005 IS NULL ` : ` AND G020X.QTDCONTAT >= ${req.body['parameter[QTDCONTAT]']} `} `;
                whereTpContat = ` AND G008.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                delete req.body['parameter[QTDCONTAT]'];
                delete req.body['parameter[G008_TPCONTAT]'];

                if (req.body['parameter[SNNPSCON]'] != undefined && req.body['parameter[SNNPSCON]'] != null && req.body['parameter[SNNPSCON]'] != '') {
                    whereClientNPs = req.body['parameter[SNNPSCON]'] == 1 ? ' AND G007X.IDG006 = 28 ' : ' AND G007X.IDG006 <> 28 ';
                    delete req.body['parameter[SNNPSCON]'];
                }


            } else {
                whereQtdContat = req.body['parameter[SNNPSCON]'] == 1 ? ' AND G020X.QTDCONTAT > 0 ' : ' AND G020X.IDG005 IS NULL ';
                whereClientNPs = ' AND G007X.IDG006 = 28 ';
                delete req.body['parameter[SNNPSCON]'];
            }

            auxRelation = `
                LEFT JOIN 
                (SELECT G020X.IDG005, COUNT(DISTINCT G008X.DSCONTAT) AS QTDCONTAT
                    FROM G020 G020X
                        INNER JOIN G007 G007X ON G007X.IDG007 = G020X.IDG007 AND G007X.SNDELETE = 0 AND G007X.IDG006 <> 27
                        INNER JOIN G008 G008X ON G008X.IDG007 = G007X.IDG007 AND G008X.SNDELETE = 0
                    WHERE G020X.TPCONTAT = 'C'
                    ${whereClientNPs}
                    ${whereTpContatAux}
                    GROUP BY G020X.IDG005
                ) G020X ON G020X.IDG005 = G005.IDG005
            `;
        }

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G061', false);

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

        let sql = `
		Select  
			DISTINCT	
						G061.IDG061,
						G061.DSAVALID As G061_DSAVALID,

						Case
							When G061.STAVALIA = 'B' Then
							'Não Iniciado'
							When G061.STAVALIA = 'E' Then
							'Em Tratativa'
							When G061.STAVALIA = 'T' Then
							'Tratado'
							Else
							'n.i.'
                        End As G061_STAVALIA,
                        
                        Case
							When G061.NRNOTA < 7 Then
							'DETRATOR'
							When G061.NRNOTA = 7 Then
                            'NEUTRO'
                            When G061.NRNOTA = 8 Then
							'NEUTRO'
							When G061.NRNOTA > 8 Then
							'PROMOTOR'
							Else
							'n.i.'
						End As G061_CLASS,

						Nvl(TO_CHAR(G061.DTRESPOS, 'DD/MM/YYYY'),'n.i.') AS DTRESPOS,
						G051.CDCTRC As G051_CDCTRC, /* Número do CTE*/
						G005.NMCLIENT As G005_NMCLIENT, /* Razão Social do Cliente */
						To_Char(G061.DTENVIO,'DD/MM/YYYY') As G061_DTENVIO, /* Data que foi enviada */
						To_Char(G061.DTAVALIA,'DD/MM/YYYY') As G061_DTAVALIA, /* Data que foi avaliado */
						G061.DSCOMENT As G061_DSCOMENT, /* Comentário */
						G061.NRNOTA As G061_NRNOTA, /* Nota Utilizada */
						G002.CDESTADO, /* Estado */
						G005.TPPESSOA, /* Tipo de pessoa */
						CASE
							WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
							ELSE 'Física' 

						END as DSTPPESS,
                        G051.IDG051,
                        LISTAGG (Nvl(G043.NRNOTA,G083.NRNOTA), '/') WITHIN GROUP (ORDER BY G043.NRNOTA)
                        OVER (PARTITION BY G052.IDG051) AS G043_NRNOTA,
						Nvl(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'),'n.i.') AS DTEMICTR,
						G005CO.NMCLIENT AS G005CO_NMCLIENT,

                        (
							SELECT DISTINCT
			      				LISTAGG(G008.DSCONTAT, ', ') WITHIN GROUP(ORDER BY G008.DSCONTAT)
                                OVER (PARTITION BY G020.IDG005)
					     	FROM G020 G020
					     	JOIN G007 G007 ON (G007.IDG007 = G020.IDG007)
					     	JOIN G008 G008 ON (G008.IDG007 = G007.IDG007)
					     	 AND G020.IDG005   = G005.IDG005
					     	 AND G020.TPCONTAT = 'C'
					     	 AND G007.IDG006 <> 27
					     	 AND G007.SNDELETE = 0
                             AND G008.SNDELETE = 0
                             ${whereTpContat}
                             GROUP BY G020.IDG005, G008.DSCONTAT
						) DSEMAIL,

                        G024CTE.NMTRANSP AS G024CTE_NMTRANSP,
                        
                        O_01.G024_NMTRANSP,
						
						COUNT(DISTINCT G051.IDG051) OVER() AS COUNT_LINHA
			From G051 G051
			Join G005 G005 On (G005.IDG005 = G051.IDG005DE)
			Join G005 G005CO On (G005CO.IDG005 = G051.IDG005CO AND G005CO.SNDELETE = 0)
			join G003 G003 On (G003.IDG003 = G005.IDG003)
			Join G002 G002 On (G003.IDG002 = G002.IDG002)
            Join G052 G052 On (G052.IDG051 = G051.IDG051)
            Join G083 G083 On (G052.IDG083 = G083.IDG083)
			Join G043 G043 On (G043.IDG043 = G052.IDG043)
			Left Join G061 G061 On (G061.IDG051 = G051.IDG051)
			Left Join G078 G078 On (G078.IDG051 = G051.IDG051 and G078.SNENVIAD = 1)

			Join G022 G022 On (G022.IDG005 = NVL(G051.IDG005CO, G043.IDG005RE)  AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0)
            Join G022 G022CL On (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)

			Left Join G014 G014	On (G014.IDG014 = G022.IDG014)
            Left Join G024 G024CTE On (G024CTE.IdG024 = G051.IdG024)
            Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
            Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
            Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
            Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0)

            ${auxRelation}

            outer apply   
              (SELECT 
                G024X.NMTRANSP AS G024_NMTRANSP
                FROM G046 G046X
                  JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
                  JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
                  JOIN G024 G024X ON (G024X.IDG024 = G046X.IDG024)
                    
                  WHERE G049X.IDG051 = G051.IDG051 AND G046X.STCARGA <> 'C'
                  ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
              ) O_01

            ${sqlWhere}
            ${whereClass}
            ${whereOperac}
            ${whereStNPS}
            ${whereSnSatisf}
            ${whereQtdContat}
            And G043.DTENTREG IS NOT NULL
            And G051.TPTRANSP = 'V'
            And G051.STCTRC = 'A'
            And G051.SNDELETE = 0
            AND G005.STCADAST = 'A'
			${sqlWhereAcl}
			GROUP BY G061.IDG061, G051.CDCTRC, G005.NMCLIENT, G078.DSENVPAR, G061.DTENVIO, G061.DTAVALIA, G061.DSCOMENT, G061.NRNOTA, G002.CDESTADO, G005.TPPESSOA, G051.IDG051, G043.NRNOTA, 
			G005CO.NMCLIENT, O_01.G024_NMTRANSP, G024CTE.NMTRANSP, G051.DTEMICTR, G061.DSAVALID, G061.DTRESPOS, G061.STAVALIA, G083.NRNOTA, G052.IDG051, G005.IDG005
			${sqlOrder} ${sqlPaginate}`;
        try {
            let result = await con.execute({
                sql,
                param: bindValues
            })
                .then((result) => {
                    console.log(result);
                    return (utils.construirObjetoRetornoBD(result, req.body));
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

    api.listNpsByClient = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let whereClass = '';
        if (req.body['parameter[G061_CLASS]'] != undefined && req.body['parameter[G061_CLASS]'] != null && req.body['parameter[G061_CLASS]'] != '') {
            if (req.body['parameter[G061_CLASS]'] == 'P') {
                whereClass = ` And G061.NRNOTA > 8 `;
            } else if (req.body['parameter[G061_CLASS]'] == 'N') {
                whereClass = ` And G061.NRNOTA > 6 And G061.NRNOTA < 9 `;
            } else {
                whereClass = ` And G061.NRNOTA < 7 `;
            }
            delete req.body['parameter[G061_CLASS]'];
        } else {
            whereClass = '';
        }

        let whereOperac = ';';
        if (req.body['parameter[TPOPERAC]'] != undefined && req.body['parameter[TPOPERAC]'] != null && req.body['parameter[TPOPERAC]'] != '') {
            if (req.body['parameter[TPOPERAC]'] == 1) {
                whereOperac = ` And G014.SN4PL <> 1 `;
            } else if (req.body['parameter[TPOPERAC]'] == 2) {
                whereOperac = ` And G014.SN4PL = 1 `;
            }
            delete req.body['parameter[TPOPERAC]'];
        } else {
            whereOperac = '';
        }

        let whereStNPS = '';
        if (req.body['parameter[STNPS]'] != undefined && req.body['parameter[STNPS]'] != null && req.body['parameter[STNPS]'] != '') {
            switch (req.body['parameter[STNPS]']) {
                case 'R' : // Respondido
                    whereStNPS = ` And G061.NRNOTA IS NOT NULL And G061.DTAVALIA IS NOT NULL`;
                    break;
                case 'NR': // Não respondido
                    whereStNPS = ` And G061.NRNOTA IS NUll And G061.DTAVALIA IS NULL And G078.IDG078 IS NOT NULL`;
                    break;
                case 'NE': // Não Enviado
                    whereStNPS = ` And G078.IDG078 IS NULL`;
                    break;
                default:
                    whereStNPS = '';
                    break;
            }
            delete req.body['parameter[STNPS]'];
        }

        let whereSnSatisf = '';
        if (req.body['parameter[G022_SNSATISF]'] && req.body['parameter[G022_SNSATISF]'] != 1) {
            whereSnSatisf = (req.body['parameter[G022_SNSATISF]'] == 0) ? ` And G022CL.SNSATISF != 1` : '';
            delete req.body['parameter[G022_SNSATISF]'];
        }

        let whereQtdContat = '';
        let whereTpContat = '';
        let whereTpContatAux = '';
        let whereClientNPs = '';
        if ((req.body['parameter[QTDCONTAT]'] != undefined && req.body['parameter[QTDCONTAT]'] != null && req.body['parameter[QTDCONTAT]'] != '') ||
            (req.body['parameter[SNNPSCON]'] != undefined && req.body['parameter[SNNPSCON]'] != null && req.body['parameter[SNNPSCON]'] != '')) {

            if (req.body['parameter[QTDCONTAT]'] != undefined && req.body['parameter[QTDCONTAT]'] != null && req.body['parameter[QTDCONTAT]'] != '') {
                whereTpContatAux = ` AND G008X.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                whereQtdContat = ` ${req.body['parameter[QTDCONTAT]'] == 0 ? ` AND G020X.IDG005 IS NULL ` : ` AND G020X.QTDCONTAT >= ${req.body['parameter[QTDCONTAT]']} `} `;
                whereTpContat = ` AND G008.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                delete req.body['parameter[QTDCONTAT]'];
                delete req.body['parameter[G008_TPCONTAT]'];

                if (req.body['parameter[SNNPSCON]'] != undefined && req.body['parameter[SNNPSCON]'] != null && req.body['parameter[SNNPSCON]'] != '') {
                    whereClientNPs = req.body['parameter[SNNPSCON]'] == 1 ? ' AND G007X.IDG006 = 28 ' : ' AND G007X.IDG006 <> 28 ';
                    delete req.body['parameter[SNNPSCON]'];
                }

            } else {
                whereQtdContat = req.body['parameter[SNNPSCON]'] == 1 ? ' AND G020X.QTDCONTAT > 0 ' : ' AND G020X.IDG005 IS NULL ';
                whereClientNPs = ' AND G007X.IDG006 = 28 ';
                delete req.body['parameter[SNNPSCON]'];
            }

        } else {
            whereClientNPs = ' AND G007X.IDG006 = 28 ';
        }

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'X', false);

        sqlWhere += ` 
            AND G005.STCADAST = 'A'
            AND G043.SNDELETE = 0
            AND G043.DTENTREG IS NOT NULL
            AND G051.SNDELETE = 0
            AND G051.TPTRANSP = 'V'
            AND G051.STCTRC = 'A' `;

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

        let sql = `
        SELECT X.* FROM (  
            SELECT DISTINCT 
                G005.IDG005,
                G005.NMCLIENT, 
                G005.CJCLIENT, 
                G005.IECLIENT,
                G005.IMCLIENT,
                G005.IDLOGOS,
                G003.NMCIDADE ||'-'|| G002.CDESTADO AS NMCIDADE,
                COUNT(DISTINCT G051.IDG051) AS ENTREGAS,
                COUNT(DISTINCT G078.IDG078) AS ENVIOS,
                COUNT(DISTINCT G061X.IDG061) AS RESPOSTAS,
                LISTAGG (G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT) OVER (PARTITION BY G005.IDG005) AS EMAILS,

                Case
                    When NVL(G020X.QTDNPS,0) = 0 Then
                    'Não'
                    Else
                    'Sim'
                End As SNNPSCON,

                COUNT(DISTINCT G005.IDG005) OVER() AS COUNT_LINHA
            FROM G005 G005
            INNER JOIN G003 G003 ON G003.IDG003 = G005.IDG003
            INNER JOIN G002 G002 ON G002.IDG002 = G003.IDG002
            INNER JOIN G051 G051 ON G051.IDG005DE = G005.IDG005
            INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
            INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
            INNER JOIN G022 G022 On (G022.IDG005 = NVL(G051.IDG005CO, G043.IDG005RE)  AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0)
            INNER JOIN G014 G014 ON G014.IDG014 = G022.IDG014
            INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)
            LEFT JOIN G061 G061 ON G061.IDG051 = G051.IDG051
            LEFT JOIN G061 G061X ON G061X.IDG051 = G051.IDG051 AND G061X.NRNOTA IS NOT NULL AND G061X.DTAVALIA IS NOT NULL
            LEFT JOIN G049 G049 ON G049.IDG051 = G051.IDG051
            LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
            LEFT JOIN G046 G046 ON G046.IDG046 = G048.IDG046 AND NVL(G046.STCARGA,'J') <> 'C'
            LEFT JOIN G020 G020 ON G020.IDG005 = G005.IDG005 AND G020.TPCONTAT = 'C'
            LEFT JOIN G007 G007 ON G007.IDG007 = G020.IDG007 AND G007.SNDELETE = 0 AND G007.IDG006 <> 27
            LEFT JOIN G008 G008 ON G008.IDG007 = G007.IDG007 AND G008.SNDELETE = 0 ${whereTpContat}
            LEFT JOIN G078 G078 ON G078.IDG051 = G051.IDG051 AND G078.SNENVIAD = 1 AND TPSISENV = 'N'

            LEFT JOIN 
            (SELECT G020X.IDG005, COUNT(DISTINCT G008X.DSCONTAT) AS QTDCONTAT,
                COUNT(CASE G007X.IDG006 WHEN 28 THEN 1 END) AS QTDNPS
                FROM G020 G020X
                    INNER JOIN G007 G007X ON G007X.IDG007 = G020X.IDG007 AND G007X.SNDELETE = 0 AND G007X.IDG006 <> 27
                    INNER JOIN G008 G008X ON G008X.IDG007 = G007X.IDG007 AND G008X.SNDELETE = 0
                WHERE G020X.TPCONTAT = 'C'
                ${whereClientNPs}
                ${whereTpContatAux}
                GROUP BY G020X.IDG005
            ) G020X ON G020X.IDG005 = G005.IDG005


            ${sqlWhere} ${sqlWhereAcl} ${whereClass} ${whereOperac} ${whereStNPS} ${whereSnSatisf} ${whereQtdContat}

            GROUP BY
            G005.IDG005,
            G005.NMCLIENT, 
            G005.CJCLIENT, 
            G005.IECLIENT,
            G005.IDLOGOS,
            G005.IMCLIENT,
            G008.DSCONTAT,
            G003.NMCIDADE,
            G002.CDESTADO,
            G020X.QTDNPS ) X

            ${sqlOrder} 
            ${sqlPaginate}`;
        try {
            let result = await con.execute({
                sql,
                param: bindValues
            })
                .then((result) => {
                    console.log(result);
                    return (utils.construirObjetoRetornoBD(result, req.body));
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

    api.listaStEmail = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let sql = `SELECT G005.IDG005
                            , G005.NMCLIENT
                            , G014.IDG014
                            , G014.DSOPERAC
                            , G022.SNSATISF
                            , G022.SNRASTRE
                            , NVL(G022.DSUNSSAT, G022.DSUNSRAS) MOTIVO
                         FROM G005 G005
                         JOIN G022 G022 ON G022.IDG005 = G005.IDG005
                         JOIN G014 G014 ON G014.IDG014 = G022.IDG014
                        WHERE G005.IDG005 = ${req.body.IDG005}`;

            let result = await con.execute({
                sql,
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
    }

    api.getMovimentacoesAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection();

        let IDA001 = req.body.IDA001;

        try {
            let result = await con.execute({
                sql: `
					Select  A003.IDA003,
									A001.IDA001,
									ROWNUM,
									A003.DSOBSERV,
									Nvl(To_Char(A003.DTMOVIME,'DD/MM/YYYY HH24:MI'), '-') As DTMOVIME,
									A003.IDS001RE,
									S001RE.NMUSUARI As NMUSUARIRE,
									A003.IDS001DE,
									S001DE.NMUSUARI As NMUSUARIDE,
									A003.IDA006,
									A006.DSSITUAC,
									(SELECT 
										a003.ida003
									   FROM a003
										 JOIN a001 a001max ON (a001max.IDa001 = a003.IDa001)
										 
										 
										 WHERE A001max.IDA001 = A001.IDA001
										 ORDER BY a003.ida003 DESC FETCH FIRST ROW ONLY
									 ) AS ULTIMOID,

									CASE
										WHEN A001.STDATAS = 'A' AND A001.DTALTER1 IS NOT NULL THEN
										 'Data Agendada alterada para ' || To_Char(A001.DTALTER1,'DD/MM/YYYY') || ' e Data Roterizada alterada para ' || To_Char(A001.DTALTER2,'DD/MM/YYYY')
										WHEN A001.STDATAS = 'C' AND A001.DTALTER1 IS NOT NULL THEN
										 'Data Combinada alterada para ' || To_Char(A001.DTALTER1,'DD/MM/YYYY') || ' e Data Roterizada alterada para ' || To_Char(A001.DTALTER2,'DD/MM/YYYY')
										WHEN A001.STDATAS = 'E' AND A001.DTALTER1 IS NOT NULL THEN
										 'Data de Entrega alterada para ' || To_Char(A001.DTALTER1,'DD/MM/YYYY')
										WHEN (A001.STDATAS = 'P' OR A001.STDATAS = 'L') AND A001.DTALTER1 IS NOT NULL THEN
                                         'Data Planejada alterada para ' || To_Char(A001.DTALTER1,'DD/MM/YYYY')
                                        WHEN A001.STDATAS = 'N' THEN
                                         'Data de Entrega removida'
										ELSE ''
									END as TXTINFO

						From A003 A003
						Join A001 A001
							On (A001.IDA001 = A003.IDA001)
						Join S001 S001RE
							On (S001RE.IDS001 = A003.IDS001RE)
						Left Join S001 S001DE
							On (S001DE.IDS001 = A003.IDS001DE)
						Join A006 A006
							On (A006.IDA006 = A003.IDA006)
						Where A001.IDA001 = :IDA001
						Order By A003.IDA003 ASC`,
                param: {
                    IDA001: IDA001
                },
                fetchInfo: "DSOBSERV"
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

    api.getClientesCockpit = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let sqlWhereAclAT = '';
        let sqlWhereAclOC = '';

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
            esoperad: ' And ((NVL(S001.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001.SNBRAVO = 1)) And '
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
            sqlWhereAclAT = '';
            sqlWhereAclOC = '';
        } else {
            sqlWhereAclAT = sqlWhereAcl;
            sqlWhereAclOC = sqlWhereAcl;
        }


        if (sqlWhereAcl != null && sqlWhereAcl != '') {
            sqlWhereAclAT = sqlWhereAclAT.replace('A002.', 'A002_AT.');
            sqlWhereAclAT = sqlWhereAclAT.replace('G014.', 'G014_AT.');
            sqlWhereAclAT = sqlWhereAclAT.replace('G024.', 'G024_AT.');

            sqlWhereAclOC = sqlWhereAclOC.replace('A002.', 'A002_OC.');
            sqlWhereAclOC = sqlWhereAclOC.replace('G014.', 'G014_OC.');
            sqlWhereAclOC = sqlWhereAclOC.replace('G024.', 'G024_OC.');
        }

        let sqlWhereAT = '';
        let sqlWhereOC = '';

        if (req.body.A008_IDA008 != null) {
            sqlWhereAT += ' And A008_AT.IDA008 In (' + req.body.A008_IDA008.in + ')';
            sqlWhereOC += ' And A008_OC.IDA008 In (' + req.body.A008_IDA008.in + ')';
        }

        if (req.body.G043_IDG043 != null) {
            sqlWhereAT += ' And G043_AT.IDG043 = ' + req.body.G043_IDG043.id;
            sqlWhereOC += ' And G043_OC.IDG043 = ' + req.body.G043_IDG043.id;
        }

        if (req.body.G051_IDG051 != null) {
            sqlWhereAT += ' And G051_AT.IDG051 = ' + req.body.G051_IDG051.id;
            sqlWhereOC += ' And G051_OC.IDG051 = ' + req.body.G051_IDG051.id;
        }

        if (req.body.G046_IDG046 != null) {
            sqlWhereAT += ' And G046.IDG046 = ' + req.body.G046_IDG046.id;
            sqlWhereOC += ' AAnd G046.IDG046 = ' + req.body.G046_IDG046.id;
        }

        if (req.body.G043_IDG024TR != null) {
            sqlWhereAT += ' And G043_AT.IDG024TR = ' + req.body.G043_IDG024TR.id;
            sqlWhereOC += ' AAnd G043_OC.IDG024TR = ' + req.body.G043_IDG024TR.id;
        }

        if (req.body.G043_IDG005DE != null) {
            sqlWhereAT += ' And G043_AT.IDG005DE = ' + req.body.G043_IDG005DE.id;
            sqlWhereOC += ' And G043_OC.IDG005DE = ' + req.body.G043_IDG005DE.id;
        }

        if (req.body.G043_IDG005RE != null) {
            sqlWhereAT += ' And G043_AT.IDG005RE = ' + req.body.G043_IDG005RE.id;
            sqlWhereOC += ' And G043_OC.IDG005RE = ' + req.body.G043_IDG005RE.id;
        }

        if (req.body.A001_DTREGIST != null) {
            sqlWhereAT += ` And A001_AT.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI')`;
            sqlWhereOC += ` And A001_OC.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        try {
            let result = await con.execute({
                sql: `
					Select Distinct G014.IDG014, G014.DSOPERAC, (Select Count(1)
																						From A001 A001_OC
																						Join A002 A002_OC
																							On (A002_OC.IDA002 = A001_OC.IDA002)
																						Join A008 A008_OC /* Tipos de Ação ( Ocorrência ou Atendimento ) */
								              												On (A002_OC.IDA008 = A008_OC.IDA008)
																						Join A005 A005_OC
																							On (A005_OC.IDA001 = A001_OC.IDA001)
																						Join G043 G043_OC
																							On (G043_OC.IDG043 = A005_OC.IDG043)
																						Join G052 G052_OC
																							On (G052_OC.IDG043 = G043_OC.IDG043) 
																						Join G051 G051_OC 
																							On (G051_OC.IDG051 = G052_OC.IDG051)
																						Join G022 G022_OC
																							On (G022_OC.IDG005 = G051_OC.IDG005CO)
																						Join G014 G014_OC
																							On (G014_OC.IDG014 = G022_OC.IDG014)
																						Join G024 G024_OC
							  															On (G024_OC.IdG024 = G051_OC.IdG024)
																						Left Join G049 G049_OC
																							On (G049_OC.IDG043 = G043_OC.IDG043)
																						Left Join G048 G048_OC
																							On (G049_OC.IDG048 = G048_OC.IDG048)
																						Left Join G046 G046_OC
																						  On (G048_OC.IDG046 = G046_OC.IDG046)
																						Where A001_OC.DTFIM Is Null
																							And A002_OC.IDA008 = 2
																							And G014_OC.IDG014 = G014.IDG014
																							And A001_OC.SNDELETE = 0 ` + sqlWhereOC + sqlWhereAclOC + `) As QTD_OCORRENCIAS,
																					(Select Count(1)
																						From A001 A001_AT
																						Join A002 A002_AT
																							On (A002_AT.IDA002 = A001_AT.IDA002)
																						Join A008 A008_AT /* Tipos de Ação ( Ocorrência ou Atendimento ) */
																							On (A002_AT.IDA008 = A008_AT.IDA008)
																						Join A005 A005_AT
																							On (A005_AT.IDA001 = A001_AT.IDA001)
																						Join G043 G043_AT
																							On (G043_AT.IDG043 = A005_AT.IDG043)
																						Join G052 G052_AT
																							On (G052_AT.IDG043 = G043_AT.IDG043) 
																						Join G051 G051_AT 
																							On (G051_AT.IDG051 = G052_AT.IDG051)
																						Join G022 G022_AT
																							On (G022_AT.IDG005 = G051_AT.IDG005CO)
																						Join G014 G014_AT
																							On (G014_AT.IDG014 = G022_AT.IDG014)
																						Join G024 G024_AT
							  															On (G024_AT.IdG024 = G051_AT.IdG024)
																						Left Join G049 G049_AT
																							On (G049_AT.IDG043 = G043_AT.IDG043)
																						Left Join G048 G048_AT
																							On (G049_AT.IDG048 = G048_AT.IDG048)
																						Left Join G046 G046_AT
																						  On (G048_AT.IDG046 = G046_AT.IDG046)
																						Where A001_AT.DTFIM Is Null
																							And A002_AT.IDA008 = 1
																							And G014_AT.IDG014 = G014.IDG014
																							And A001_AT.SNDELETE = 0 ` + sqlWhereAT + sqlWhereAclAT + `) As QTD_ATENDIMENTOS
									From G043 G043
									Join G052 G052
										On (G052.IDG043 = G043.IDG043)
									Join G051 G051
										On (G051.IDG051 = G052.IDG051)
									/*Join A005 A005
										On (A005.IDG043 = G043.IDG043)
									Join A001 A001
										On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0)
									Join A002 A002
									  On (A002.IDA002 = A001.IDA002)*/
									Join G022 G022 
										On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
									Join G014 G014
										On (G014.IDG014 = G022.IDG014)
									Join G024 G024
										On (G024.IdG024 = G051.IdG024)
								 Where 1=1 ` + sqlWhereAcl,
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

    api.getAtendentesCockpit = async function (req, res, next) {
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
            esoperad: ' And ((NVL(S001.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001.SNBRAVO = 1)) And '
        });

        let sqlWhere = '';

        if (req.body.A008_IDA008 != null) {
            sqlWhere += ' And A008.IDA008 In (' + req.body.A008_IDA008.in + ')';
        }

        if (req.body.G043_IDG043 != null) {
            sqlWhere += ' And G043.IDG043 = ' + req.body.G043_IDG043.id;
        }

        if (req.body.G051_IDG051 != null) {
            sqlWhere += ' And G051.IDG051 = ' + req.body.G051_IDG051.id;
        }

        if (req.body.G046_IDG046 != null) {
            sqlWhere += ' And G046.IDG046 = ' + req.body.G046_IDG046.id;
        }

        if (req.body.G043_IDG024TR != null) {
            sqlWhere += ' And G043.IDG024TR = ' + req.body.G043_IDG024TR.id;
        }

        if (req.body.G043_IDG005DE != null) {
            sqlWhere += ' And G043.IDG005DE = ' + req.body.G043_IDG005DE.id;
        }

        if (req.body.G043_IDG005RE != null) {
            sqlWhere += ' And G043.IDG005RE = ' + req.body.G043_IDG005RE.id;
        }

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        try {
            let result = await con.execute({
                sql: `
					Select Distinct S001.IDS001,
                          S001.NMUSUARI,
                          (Select Count(1)
                            From A001 A001
                            Join A002 A002
                              On (A002.IDA002 = A001.IDA002)
                            Join A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento ) */
								              On (A002.IDA008 = A008.IDA008)
                            Join A005 A005
                              On (A005.IDA001 = A001.IDA001)
                            Left Join G043 G043
                              On (G043.IDG043 = A005.IDG043)
                            Left Join G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051) */
                              On (A005.IDG043 = G052.IDG043)
                            Left Join G051 G051 /* Conhecimento do Transporte */
                              On (G051.IDG051 = G052.IDG051)
                            Left Join G049 G049
                              On (G049.IDG043 = G043.IDG043)
                            Left Join G048 G048
                              On (G049.IDG048 = G048.IDG048)
                            Left Join G046 G046
                              On (G048.IDG046 = G046.IDG046)
                            Join A003 A003
                              On (A003.IDA001 = A001.IDA001 And A003.IDA003 = 
                                                                (Select Max(A003_2.IDA003)
                                                                   From A003 A003_2
                                                                  Where A003_2.IDA001 = A003.IDA001))
                            Join A006 A006
                              On (A006.IDA006 = A003.IDA006)
                            Left Join G022 G022
                              On (G022.IDG005 = G051.IDG005CO)
                            Left Join G014 G014
															On (G014.IDG014 = G022.IDG014)
														Left Join G024 G024
														  On (G024.IdG024 = G051.IdG024)                           
                            Where A001.IDSOLIDO = S001.IDS001
                              And A001.DTFIM Is Null
															And A002.IDA008 = 2
															And A001.SNDELETE = 0` + sqlWhere + sqlWhereAcl + `) As QTD_OCORRENCIAS,
                          (Select Count(1)
                            From A001 A001
                            Join A002 A002
                              On (A002.IDA002 = A001.IDA002)
                            Join A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento ) */
								              On (A002.IDA008 = A008.IDA008)
                            Join A005 A005
                              On (A005.IDA001 = A001.IDA001)
                            Left Join G043 G043
                              On (G043.IDG043 = A005.IDG043)
                            Left Join G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051) */
                              On (A005.IDG043 = G052.IDG043)
                            Left Join G051 G051 /* Conhecimento do Transporte */
                              On (G051.IDG051 = G052.IDG051)
                            Left Join G049 G049
                              On (G049.IDG043 = G043.IDG043)
                            Left Join G048 G048
                              On (G049.IDG048 = G048.IDG048)
                            Left Join G046 G046
                              On (G048.IDG046 = G046.IDG046)
                            Join A003 A003
                              On (A003.IDA001 = A001.IDA001 And A003.IDA003 = 
                                                                (Select Max(A003_2.IDA003)
                                                                   From A003 A003_2
                                                                  Where A003_2.IDA001 = A003.IDA001))
                            Join A006 A006
                              On (A006.IDA006 = A003.IDA006)
                            Left Join G022 G022
                              On (G022.IDG005 = G051.IDG005CO)
                            Left Join G014 G014
															On (G014.IDG014 = G022.IDG014)
														Left Join G024 G024 
														  On (G024.IdG024 = G051.IdG024)                         
                            Where A001.IDSOLIDO = S001.IDS001
                              And A001.DTFIM Is Null
															And A002.IDA008 = 1
															And A001.SNDELETE = 0` + sqlWhere + sqlWhereAcl + `) As QTD_ATENDIMENTOS
            From S001 S001
            Join S027 S027
              On (S027.IDS001 = S001.IDS001 And S027.IDS026 in (30))
            Join A001 A001_PAI
              On (A001_PAI.IDSOLIDO = S001.IDS001)
          Where S001.SNDELETE = 0 `,
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

    api.getEmailUsuario = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await await con.execute({
                sql: `        
        Select S001.DSEMALOG From S001 S001 Where S001.IDS001 = ` + req.body.IDS001DE.id,
                param: []
            })
            await con.close();
            return result[0];
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.haveCte = async function (IDG043, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        if (Array.isArray(IDG043) && IDG043.length > 0) {
            IDG043 = IDG043.join();
        }

        try {
            let result = await await con.execute({
                sql: `        
        Select Distinct G051.IDG051
					From G051 G051
					Join G052 G052
						On (G051.IDG051 = G052.IDG051)
				Where G052.IDG043 in (` + IDG043 + `)`,
                param: []
            })
            await con.close();
            if (Array.isArray(result) && result.length > 0) {
                if (result[0].hasOwnProperty('IDG051')) {
                    return result[0].IDG051;
                } else {
                    return null;
                }
            } else {
                return null;
            }

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.getNotasByCte = async function (IDG051, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        try {
            let result = await await con.execute({
                sql: `        
        Select Distinct G043.IDG043
					From G052 G052
					Join G043 G043
						On (G043.IDG043 = G052.IDG043)
				 Where G052.IDG051 = ` + IDG051,
                param: []
            })
            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.getNfCarga = async function (IDG046, con1, userId) {
        await this.controller.setConnection(con1);
        let con = await this.controller.getConnection(con1, userId);

        try {
            let result = await await con.execute({
                sql: `        
                SELECT DISTINCT
                    G043.IDG043
                FROM G043 G043
                    INNER JOIN G049 G049 ON G049.IDG043 = G043.IDG043
                    INNER JOIN G048 G048 ON G048.IDG048 = G049.IDG048
                    INNER JOIN G046 G046 ON G046.IDG046 = G048.IDG046
                    INNER JOIN G052 G052 ON G052.IDG043 = G043.IDG043
                    INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                    LEFT JOIN G083 G083 ON G083.IDG083 = G052.IDG083
                
                WHERE G043.SNDELETE = 0
                AND NVL(G043.NRCHADOC,G083.NRCHADOC) IS NOT NULL
                AND G051.STCTRC = 'A'
                AND G046.IDG046 = ${IDG046}`,
                param: []
            })
            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.getDashboardAtendimentoPorAtendente = async function (req, res, next) { // OK
        let con = await this.controller.getConnection(null, req.UserId);

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        let sqlWhere = 'And A001.SNDELETE = 0';

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI') `;
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

        try {
            let result = await con.execute({
                sql: `
					Select 		Count(A001.IdA001) As Qtd, S001.NmUsuari/*, Nvl(G014.DsOperac, 'N.I') As DsOperac*/
					From 			A001 A001
					Join			A002 A002 On A001.IdA002 = A002.IdA002
                    Join 			S001 S001 On S001.IdS001 = A001.IdSolido
                    ${joinVisaoClient}
					Join 			A005 A005 On A005.IdA001 = A001.IdA001
					Join 			G043 G043 On G043.IdG043 = A005.IdG043
					Join 			G052 G052 On G052.IdG043 = G043.IdG043
					Join 			G051 G051 On G051.IdG051 = G052.IdG051
					Left Join G022 G022 On G022.IdG005 = G051.IdG005CO 
					Left Join G014 G014 On G014.IdG014 = G022.IdG014
					/*Left Join G024 G024 On G024.IdG024 = G051.IdG024*/
					Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
					Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
					Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
					Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
					Where 		1 = 1 ` + sqlWhere + sqlWhereAcl + `
					Group By 	S001.NmUsuari/*, Nvl(G014.DsOperac, 'N.I')*/
					Order By 	/*Nvl(G014.DsOperac, 'N.I'), */S001.NmUsuari`,
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

    api.getDashboardTempoAtendimento = async function (req, res, next) { // OK
        let con = await this.controller.getConnection(null, req.UserId);

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        let sqlWhere = '';

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI') `;
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

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        try {
            let result = await con.execute({
                sql: `
					Select Count(X1.NrHoras) As Qtd, X1.NrHoras
					From 
					( 
						Select 
											Case 
												When X.NrHoras > 8 Then 8
												Else X.NrHoras
											End As NrHoras,
											X.DtRegist, 
											X.DtFim,
											X.DsOperac
						From 
						(
									Select 
														24 * (To_Date(To_Char(A001.DtFim, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24') - To_Date(To_Char(A001.DtRegist, 'YYYY-MM-DD hh24'), 'YYYY-MM-DD hh24')) As NrHoras,
														A001.DtRegist, 
														A001.DtFim, 
														Nvl(G014.DsOperac, 'N.I') As DsOperac
									From 			A001 A001
									Join			A002 A002 On A002.IdA002 = A001.IdA002
                                    Join 			S001 S001 On S001.IdS001 = A001.IdSolido
                                    ${joinVisaoClient}
									Join 			A005 A005 On A005.IdA001 = A001.IdA001
									Join 			G043 G043 On G043.IdG043 = A005.IdG043
									Join 			G052 G052 On G052.IdG043 = G043.IdG043
									Join 			G051 G051 On G051.IdG051 = G052.IdG051
									Left Join G022 G022 On G022.IdG005 = G051.IdG005CO 
									Left Join G014 G014 On G014.IdG014 = G022.IdG014
									/*Left Join G024 G024 On G024.IdG024 = G051.IdG024*/
									Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
									Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
									Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
									Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
									Where 		A001.DtRegist Is Not Null And A001.SNDELETE = 0
														And A001.DtFim Is Not Null ` + sqlWhere + sqlWhereAcl + `
						) X
					) X1
					Group By X1.NrHoras
					Order By X1.NrHoras`,
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

    api.getDashboardAbertoXFinalizado = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        let sqlWhere = 'And A001.SNDELETE = 0';

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI') `;
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

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        try {
            let result = await con.execute({
                sql: `
					Select Count(X.IdA001) As Qtd, X.NmUsuari, X.DsOperac, X.DsMovime 
					From 
					(
										Select 		A001.IdA001, S001.NmUsuari, Nvl(G014.DsOperac, 'N.I') As DsOperac,
															(	Select X.* 
																From (
																				/* Select Case When A003.IDA006 <> 4 Then 1 Else A003.IDA006 End */
																				Select Case When A003.IDA006 <> 4 Then 'Aberto' Else 'Finalizado' End
																				From A003 A003
																				Where A003.IdA001 = A001.IdA001 And RowNum = 1
																				Order By A003.IDA003 Desc
																			) X
															) As DsMovime
										From 			A001 A001
                                        Join 			S001 S001 On S001.IdS001 = A001.IdSolido
                                        ${joinVisaoClient}
										Join			A002 A002 On A002.IdA002 = A001.IdA002
										Join 			A005 A005 On A005.IdA001 = A001.IdA001
										Join 			G043 G043 On G043.IdG043 = A005.IdG043
										Join 			G052 G052 On G052.IdG043 = G043.IdG043
										Join 			G051 G051 On G051.IdG051 = G052.IdG051
										Left Join G022 G022 On G022.IdG005 = G051.IdG005CO 
										Left Join G014 G014 On G014.IdG014 = G022.IdG014
										Left Join G024 G024 On G024.IdG024 = G051.IdG024
										Where 		1 = 1 ` + sqlWhere + sqlWhereAcl + `
					) X
					Group By 	X.NmUsuari, X.DsOperac, X.DsMovime
					Order By 	X.DsOperac, X.NmUsuari`,
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

    api.getDashboardSituacaoAtendimento = async function (req, res, next) { // OK
        let con = await this.controller.getConnection(null, req.UserId);

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        let sqlWhere = 'And A001.SNDELETE = 0';

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI') `;
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

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        try {
            let result = await con.execute({
                sql: `
					Select 		Count(X.IdA001) As Qtd, /* X.DsOperac, */ X.DsMovime 
					From 
					(
										Select 		A001.IdA001, /* Nvl(G014.DsOperac, 'N.I') As DsOperac, */
															(	Select X.* 
																From (
																				/* Select Case When A003.IDA006 <> 4 Then 1 Else A003.IDA006 End */
																				Select Case When A003.IDA006 <> 4 Then 'Aberto' Else 'Finalizado' End
																				From A003 A003
																				Where A003.IdA001 = A001.IdA001 And RowNum = 1
																				Order By A003.IDA003 Desc
																			) X    
															) As DsMovime
										From 			A001 A001
                                        Join 			S001 S001 On S001.IdS001 = A001.IdSolido
                                        ${joinVisaoClient}
										Join			A002 A002 On A002.IdA002 = A001.IdA002
										Join 			A005 A005 On A005.IdA001 = A001.IdA001
										Join 			G043 G043 On G043.IdG043 = A005.IdG043
										Join 			G052 G052 On G052.IdG043 = G043.IdG043
										Join 			G051 G051 On G051.IdG051 = G052.IdG051
										Left Join G022 G022 On G022.IdG005 = G051.IdG005CO 
										Left Join G014 G014 On G014.IdG014 = G022.IdG014
										/*Left Join G024 G024 On (G024.IdG024 = G051.IdG024)*/
										Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
										Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
										Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
										Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
										Where 	  1 = 1 	` + sqlWhere + sqlWhereAcl + `
					) X
					Group By 	/* X.DsOperac, */ X.DsMovime
					/* Order By 	X.DsOperac */`,
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

    api.getDashboardAcaoXMotivo = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = 'And A001.SNDELETE = 0';

        let joinVisaoClient = ` Join S001 S001X On (S001X.IDS001 = ${req.UserId}) `;

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
            esoperad: ' And ((NVL(S001X.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001X.SNBRAVO = 1)) And '
        });

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI') `;
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

        if (typeof (req.UserId) == 'undefined') {
            joinVisaoClient = '';
        }

        try {
            let result = await con.execute({
                sql: `
					Select 	Count(X.DsAcao || ' - ' || X.DsTpMoti) As QtValue, (X.DsAcao || ' - ' || X.DsTpMoti) As DsValue, X.DsAcao
					From
									(		Select    
																Case 
																	When A008.IdA008 = 1 Then
																		'AT'
																	When A008.IdA008 = 2 Then
																		'OC'
																	Else
																		A008.DsAcao
																End As DsAcao,
																Upper(A002.DsTpMoti) As DsTpMoti ,A001.IdA001
											From      A001 A001
											Join      A002 A002 On A002.IdA002 = A001.IdA002
											Join      A008 A008 On A008.IdA008 = A002.IdA008
                                            Join      S001 S001 On S001.IdS001 = A001.IdSolido
                                            ${joinVisaoClient}
											Join      A005 A005 On A005.IdA001 = A001.IdA001
											Join      G043 G043 On G043.IdG043 = A005.IdG043
											Join      G052 G052 On G052.IdG043 = G043.IdG043
											Join      G051 G051 On G051.IdG051 = G052.IdG051
											Left Join G022 G022 On G022.IdG005 = G051.IdG005CO 
											Left Join G014 G014 On G014.IdG014 = G022.IdG014
											/*Left Join G024 G024 On (G024.IdG024 = G051.IdG024)*/
											Left Join G049 G049 On (G049.IDG043 = G043.IDG043 and G049.IDG051 = G051.IDG051) Or G049.IDG051 = G051.IDG051
											Left Join G048 G048 On (G049.IDG048 = G048.IDG048)
											Left Join G046 G046 On (G048.IDG046 = G046.IDG046)
											Left Join G024 G024 On (G024.IdG024 = G046.IdG024)
											Where     1 = 1 ` + sqlWhere + sqlWhereAcl + `
									) X 
					Group By (X.DsAcao || ' - ' || X.DsTpMoti), X.DsAcao
					Order By X.DsAcao`,
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

    api.visualizarAnexo = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDA001 = req.body.IDA001;

        let result = await con.execute({
            sql: `
					Select A004.NMANEXO, 
					   		A004.TPEXTENS,
							A004.IDA004,
							A004.TPCONTEN,
							A004.AQANEXO
					  From A004 A004
					  Join A003 A003 On(A003.IDA001 = ${IDA001} And A004.IDA003 = A003.IDA003)
					  
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
        return result;
    }

    api.downloadAnexo = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDA004 = req.body.IDA004;

        let result = await con.execute({
            sql: `
					Select A004.NMANEXO, 
							A004.TPCONTEN,
							A004.AQANEXO
					  From A004 A004
					  Where A004.IDA004 = ${IDA004}
					  
					  `,
            param: [],
            fetchInfo: [{
                column: "AQANEXO",
                type: "BLOB"
            }]
        })
            .then((result) => {

                return result[0];
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        await con.close();
        res.writeHead(200, {
            'Content-Type': result.TPCONTEN,
            'Content-Transfer-Encoding': 'Binary',
            'Content-Disposition': 'attachment; filename=' + result.NMANEXO //,
            //'Content-Length': result.AQANEXO.length
        });
        res.end(result.AQANEXO);


        //return result;
    }

    api.salvarFinalizarNovoAtendimentoReasonCode = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        // verifica data entrega planejada no banco
        let validaMotivo = await con.execute({
            sql: `
				SELECT 
					A015.IDA015, 
					A015.IDA002, 
					A015.IDI015 
				FROM A015 A015 
				WHERE A015.IDA002 = ${req.body.IDA002}`,
            param: []
        })
            .then((result) => {
                return (result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
        if (validaMotivo.length != 1) {
            res.status(400).send({ msg: 'Motivo não encontrado no 4PL ' });
            return false;
        }

        let idNrNota = null;
        if (req.body.IDG043.length > 0) {
            idNrNota = req.body.IDG043[0];
        } else {
            idNrNota = req.body.IDG043;
        }

        let objCtes = []
        if (typeof req.body.IDG051 == "number" || typeof req.body.IDG051 == "string") {
            objCtes[0] = req.body.IDG051;
        } else {
            objCtes = req.body.IDG051;
        }

        let STDATAS = '';

        // - É alteração de Datas Planejada
        if (req.body.DTENTPLA != '' && req.body.DTENTPLA != null) {

            STDATAS = 'P';
        } else if (req.body.DTENTREG != '' && req.body.DTENTREG != null) {
            // valida se é informação de data entrega

            for (let j = 0; j < objCtes.length; j++) {

                let validaDoc = await con.execute({
                    sql: `
					SELECT DISTINCT
							G046.IDG046, 
							G048.IDG048, 
							G048.STINTCLI, 
							G048.STINTINV,
							I013.IDI001,
							I013.STENVIO
					FROM G046
					JOIN G048 ON (G046.IDG046 = G048.IDG046)
					JOIN G049 ON (G049.IDG048 = G048.IDG048)
					JOIN I013 ON (I013.IDG048 = G048.IDG048)
					WHERE G046.IDG046 = ${req.body.CDCARGA} AND G049.IDG051 = ${objCtes[j]} `,
                    param: []
                })
                    .then((result) => {
                        return (result);
                    })
                    .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                let milestone = null;
                let invoice = null;
                let asn = null;

                if (validaDoc != null && validaDoc != undefined && validaDoc.length > 0) {

                    milestone = validaDoc[0].STENVIO;
                    invoice = validaDoc[0].STINTINV;
                    asn = validaDoc[0].STINTCLI;

                }

                if (invoice == 0) {
                    await con.closeRollback();
                    //Não foi possivel alterar a data de entrega pois o invoice não foi enviado
                    res.status(400).send('1');
                    return false;
                } else if (asn == 0) {
                    await con.closeRollback();
                    //Não foi possivel alterar a data de entrega pois está pendente de Pré ASN
                    res.status(400).send('2');
                    return false;
                } else {
                    STDATAS = 'E';
                }

                let notas = [];

                if (req.body.IDG043.length > 0) {
                    notas = req.body.IDG043;
                } else {
                    notas[0] = req.body.IDG043;
                }

                for (let i = 0; i < notas.length; i++) {

                    let buscaStatusNota = await con.execute({
                        sql: `        
						SELECT TPDELIVE, DTENTREG FROM G043 G043 WHERE G043.IDG043 = ${notas[i]}`,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch(async (err) => {
                            await con.closeRollback();
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });


                    if (milestone == 0) {
                        if (buscaStatusNota[0].TPDELIVE == 1 || buscaStatusNota[0].TPDELIVE == 2) {
                            if (validaDoc[0].IDI001 == 16) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Previsão de coleta
                                res.status(400).send('3');
                                return false;
                            } else if (validaDoc[0].IDI001 == 17) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Previsão de entrega
                                res.status(400).send('4');
                                return false;
                            } else if (validaDoc[0].IDI001 == 19) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Confirmação de coleta
                                res.status(400).send('5');
                                return false;
                            }
                        } else if (buscaStatusNota[0].TPDELIVE == 3 || buscaStatusNota[0].TPDELIVE == 4) {
                            if (validaDoc[0].IDI001 == 33) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Contato com o cliente
                                res.status(400).send('6');
                                return false;
                            } else if (validaDoc[0].IDI001 == 34) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Previsão de entrega no cliente
                                res.status(400).send('7');
                                return false;
                            } else if (validaDoc[0].IDI001 == 35) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Previsão de entrega no CD
                                res.status(400).send('8');
                                return false;
                            } else if (validaDoc[0].IDI001 == 36) {
                                await con.closeRollback();
                                //Não foi possivel alterar a data de entrega pois não foi enviado o milestone de Confirmação de coleta no cliente
                                res.status(400).send('9');
                                return false;
                            }
                        }

                    }
                }
            }

        } else {
            // se não entrar em nenhuma das situações retorna erro
            res.status(400).send({ msg: 'Erro na tratativa das datas ' });
            return false;
        }

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    NMSOLITE: req.body.NMSOLITE,
                    TFSOLITE: req.body.TFSOLITE,
                    DTREGIST: new Date(),
                    DTFIM: new Date(),
                    SNDELETE: 0,
                    STDATAS: STDATAS,
                    SNDTALTE: req.body.REFDATA

                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // Insere as informações dos itens da configuração do motivo escolhido
            if (req.body.ARCONFIG && req.body.ARCONFIG.length > 0) {
                for (let i = 0; i < req.body.ARCONFIG.length; i++) {
                    await api.inserirInfoConfig(idAtendimento, req.body.ARCONFIG[i], con, req.UserId);
                }
            }

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 4, req.body.IDSOLIDO, '', con, req.UserId);

            // - Declaro uma váriavel pra retornar alguma validação.
            let retorno = '';



            if (retorno.INTEGRADOR == 1) {
                await con.closeRollback();
                return {
                    integrador: 1
                };
            } else {
                // - Faz o Vínculo do atendimento com a nota-fiscal
                // - Verifica a váriavel retorno 
                await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);

            }

            if ((req.body.DTENTREG != null && req.body.DTENTREG != '' && req.body.DTENTREG != undefined) ||
                (req.body.DTENTPLA != null && req.body.DTENTPLA != '' && req.body.DTENTPLA != undefined)) {
                // - Faz a alteração de Datas
                await api.alterarDatasReasonCode(req.body.IDG051, req.body.DTENTREG, req.body.DTENTPLA, validaMotivo[0].IDI015, STDATAS, req.body.IDG043, req.body.CDCARGA, con, req.UserId, idAtendimento);

            }

            if (req.body.NMGRUPOC.length > 0 && req.body.NMGRUPOC != '' && req.body.NMGRUPOC != null && req.body.NMGRUPOC != undefined) {
                await api.enviarAtendimento(req.body.NMGRUPOC, con, req.UserId, idAtendimento, req.body.IDG043, 'Finalizado', req.headers.origin);
            }

            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.alterarDatasReasonCode = async function (IDG051, DTENTREG, DTENTPLA, IDA002, STDATAS, IDG043, CDCARGA, con1, userId, IDA001) {

        let con = await this.controller.getConnection(con1, userId);

        let STLOGOS = '';
        // STDATAS = E => Alteração de Data de Entrega
        // STDATAS = P => Alteração de Data Planejada
        if (STDATAS == 'E') {
            STLOGOS = 'E';
        } else if (STDATAS == 'P') {
            STLOGOS = 'P';
        } else {
            await con.closeRollback();
            return false;
        }

        let objCtes = []
        if (typeof IDG051 == "number" || typeof IDG051 == "string") {
            objCtes[0] = IDG051;
        } else {
            objCtes = IDG051;
        }

        //######################################################################################
        //Faz o De/Para entre os motivos do atendimento para os motivos reason code da syngenta
        //######################################################################################
        let motivosReasonAtendimento = IDA002;


        let result2 = null;
        try {
            // se for data de entrega
            if (STLOGOS == 'E') {
                // ALTERA DATA DE ENTREGA, STATUS DO LOGOS E A ETAPA PARA TODAS AS NOTAS SELECIONADAS
                let objNotas = [];
                let nrEtapa = null;
                console.log("typeof IDG043 ", typeof IDG043);
                if (typeof IDG043 == "number" || typeof IDG043 == "string") {
                    objNotas[0] = IDG043;
                } else {
                    objNotas = IDG043;
                }

                dataEntreg = new Date();

                let hora = dataEntreg.getHours();
                let minuto = dataEntreg.getMinutes();
                let segundo = dataEntreg.getSeconds();

                for (let i = 0; i < objNotas.length; i++) {

                    let buscaStatusDaNota = await con.execute({
                        sql: `        
						SELECT TPDELIVE, DTENTREG FROM G043 G043 WHERE G043.IDG043 = ${objNotas[i]}`,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch(async (err) => {
                            await con.closeRollback();
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });


                    // Se TPDELIVE for 3 ou 4, a delivery é recusa ou devolução, por isso muda etapa para 25
                    if (buscaStatusDaNota[0].TPDELIVE == 3 || buscaStatusDaNota[0].TPDELIVE == 4) {
                        nrEtapa = 25;
                    } else {
                        nrEtapa = 5;
                    }

                    let atualizaNotas = await con.execute({
                        sql: `        
						Update G043 G043
							Set  G043.DTENTREG = To_Date('${DTENTREG} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS'),
								G043.STLOGOS = '${STLOGOS}',
								G043.STETAPA = ${nrEtapa}
						Where G043.IDG043 = ${objNotas[i]}`,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch(async (err) => {
                            await con.closeRollback();
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });


                }

                //Salva data que foi alterada pelo atendimento
                let salvaDataEntregaAlterada = await con.execute({
                    sql: `        
					Update A001 A001
						 Set A001.DTALTER1 = To_Date('${DTENTREG} ${hora}:${minuto}:${segundo}', 'DD/MM/YYYY HH24:MI:SS')
					 Where A001.IDA001 = ${IDA001}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

                // INFORMA MOTIVO DA DATA DE ENTREGA E MUDA STATUS

                if (CDCARGA != null && CDCARGA != undefined && CDCARGA != '') {

                    let buscaNotaEntreg = await con.execute({
                        sql: `  
						SELECT count(g043.idg043) as QTD
						FROM g043 g043
						JOIN G049 G049
							ON G049.IDG043 = G043.IDG043
						JOIN G048 G048
							ON G048.IDG048 = G049.IDG048
							AND g048.idg046 = ${CDCARGA}
						WHERE g043.DTENTREG IS null  `,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch(async (err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });

                    if (buscaNotaEntreg[0].QTD == 0) {
                        let alteraStatusCarga = await con.execute({
                            sql: `        
							Update G046 G046
								Set  G046.STCARGA = 'D'
							Where G046.IDG046 = ${CDCARGA}`,
                            param: []
                        })
                            .then((result1) => {
                                return result1;
                            })
                            .catch(async (err) => {
                                await con.closeRollback();
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                            });
                        //logger.info(`UPDATE NA CARGA G046`);
                    }
                }

                // INFORMA MOTIVO DA DATA DE ENTREGA E MUDA STATUS
                for (let j = 0; j < objCtes.length; j++) {
                    result2 = await con.execute({
                        sql: `        
						Update G051 G051
							Set  G051.IDI015 = ${motivosReasonAtendimento},
									G051.STINTCLI = 3
						Where G051.IDG051 = ${objCtes[j]}`,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });

                }


            } else if (STLOGOS == 'P') {

                dataPlanejada = new Date();

                let hora2 = dataPlanejada.getHours();
                let minuto2 = dataPlanejada.getMinutes();
                let segundo2 = dataPlanejada.getSeconds();

                // se for data planejada
                for (let i = 0; i < objCtes.length; i++) {


                    result2 = await con.execute({
                        sql: `        
					Update G051 G051
						Set  G051.DTENTPLA = To_Date('${DTENTPLA} ${hora2}:${minuto2}:${segundo2}', 'DD/MM/YYYY HH24:MI:SS'),
								G051.STINTCLI = 1,
								G051.IDI015 = ${motivosReasonAtendimento},
								G051.STLOGOS = '${STLOGOS}'
					Where G051.IDG051 = ${objCtes[i]}`,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch((err) => {
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }

                //Salva data que foi alterada pelo atendimento
                let salvaDataPlanAlterada = await con.execute({
                    sql: `        
					Update A001 A001
						 Set A001.DTALTER1 = To_Date('${DTENTPLA} ${hora2}:${minuto2}:${segundo2}', 'DD/MM/YYYY HH24:MI:SS')
					 Where A001.IDA001 = ${IDA001}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

            }

            await con.close();
            return result2;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.getAllMotivos4PL = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let result = await con.execute({
            sql: `
				SELECT A002.IDA002, 
                        A002.IDA008,
                        A002.SNVISCLI,
						INITCAP(A002.DSTPMOTI) AS DSTPMOTI,
						A015.IDA015,
						A015.IDI015
				FROM A015 A015
				JOIN A002 A002 ON A002.IDA002 = A015.IDA002
				WHERE A002.SNDELETE = 0
				ORDER BY A002.DSTPMOTI ASC `,
            param: []
        })
        .then((result) => {
            return result;
        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

        let resultConfig = await api.getConfig(con, req.UserId);

        result.map((res) => {
            res['ARCONFIG'] = resultConfig.filter(rConf => rConf.IDA002 == res.IDA002);
            return res;
        });

        await con.close();
        return result;
    }

    api.getConfig = async function (con1, userId, IDA001 = 0) {
        let con = await this.controller.getConnection(con1, userId);
        let whereAtend = '';
        let VRCAMPO = '';
        let auxRelation = '';

        if (IDA001 != 0) {
            whereAtend = ` AND G076.IDS007PK = ${IDA001} `;
            VRCAMPO = ' G076.VRCAMPO, ';
            auxRelation = ' JOIN G076 G076 ON G076.IDG075 = G075.IDG075 ';
        }

        try {
          let result = await con.execute(
          {
                  sql: ` SELECT ${VRCAMPO}
                            G075.IDVALUCO AS IDA002,
                            G075.IDG075,
                            G075.TPINPUT,
                            G075.TMCAMPO,
                            G075.SNOBRIGA,
                            G075.TPLOGIST,
                            G075.SNCAMPO,
                            G075.NMLABEL
                       FROM G075 G075
                        ${auxRelation}
                      WHERE G075.SNDELETE = 0
                        AND G075.IDS007   = 17
                        AND G075.IDS007CO = 18
                        AND G075.SNCAMPO = 1
                        AND NVL(G075.TPINPUT,'') <> 'D'
                        ${whereAtend}`,
            param: [],
          })
          .then((result) => {
            return (result);
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

    api.deleteAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let result1 = await con.execute({
            sql: `
				Delete from A003 where A003.IDA001 = ${req.body.IDA001}`,
            param: []
        })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        let result2 = await con.execute({
            sql: `
				Delete from A005 where A005.IDA001 = ${req.body.IDA001}`,
            param: []
        })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        let result3 = await con.execute({
            sql: `
				Delete from A001 where A001.IDA001 = ${req.body.IDA001}`,
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
        return result3;

    }

    api.salvarFinalizarNovoAtendimentoRecusa = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        if (req.body.SNSYNGENTA == 1) {
            // verifica data entrega planejada no banco
            let validaMotivo = await con.execute({
                sql: `
                    SELECT 
                        A015.IDA015, 
                        A015.IDA002, 
                        A015.IDI015 
                    FROM A015 A015 
                    WHERE A015.IDA002 = ${req.body.IDA002}`,
                param: []
            })
                .then((result) => {
                    return (result);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            if (validaMotivo.length != 1) {
                res.status(400).send({ msg: 'Motivo não encontrado no 4PL ' });
                return false;
            }
        }

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    NMSOLITE: req.body.NMSOLITE,
                    TFSOLITE: req.body.TFSOLITE,
                    DTREGIST: new Date(),
                    DTFIM: new Date(),
                    SNDELETE: 0,
                    STDATAS: 'R',
                    SNDTALTE: req.body.REFDATA

                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // Insere as informações dos itens da configuração do motivo escolhido
            if (req.body.ARCONFIG && req.body.ARCONFIG.length > 0) {
                for (let i = 0; i < req.body.ARCONFIG.length; i++) {
                    await api.inserirInfoConfig(idAtendimento, req.body.ARCONFIG[i], con, req.UserId);
                }
            }

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 4, req.body.IDSOLIDO, '', con, req.UserId);

            // - Declaro uma váriavel pra retornar alguma validação.
            let retorno = '';

            // - Faz o Vínculo do atendimento com a nota-fiscal
            // - Verifica a váriavel retorno 
            await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);

            if (req.body.NMGRUPOC.length > 0 && req.body.NMGRUPOC != '' && req.body.NMGRUPOC != null && req.body.NMGRUPOC != undefined) {
                await api.enviarAtendimento(req.body.NMGRUPOC, con, req.UserId, idAtendimento, req.body.IDG043, 'Finalizado', req.headers.origin);
            }

            let operationSuccess = true;
            /* Após criar atendimento, começa o processo de alteração das informações para recusa */

            if (req.body.SNSYNGENTA == 1) {
                let objNotas = [];
                //console.log(typeof req.body.IDG043);
                // quando for recusa somente de uma nota, monto um array recebendo a única nota na posição zero
                if (typeof req.body.IDG043 == "number" || typeof req.body.IDG043 == "string") {
                    objNotas[0] = req.body.IDG043;
                } else {
                    objNotas = req.body.IDG043;
                }
                let operationSuccess = true;
                let msg = ``;
                let objEnvio = {};
                objEnvio.nmTabela = 'G043';
                objEnvio.NRPROTOC = req.body.NRPROTOC;
                objEnvio.objConn = con;
                //se realmente foi recusada depois do contato com a Syngenta, seta STRECUSA = 1
                if (req.body.SNDEVNOT == 'S') {
                    objEnvio.STRECUSA = 1;
                }

                try {
                    for (let i = 0; i < objNotas.length; i++) {
                        objEnvio.idTabela = objNotas[i];
                        await fieldAdd.inserirValoresAdicionais(objEnvio, res, next)
                            .then((result1) => {
                                operationSuccess = operationSuccess && true;

                            })
                            .catch((err) => {
                                operationSuccess = operationSuccess && false;
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                next(err);
                            });
                        // se inseriu os valores, altero status da parada
                        if (operationSuccess) {
                            let returnParada = await api.alteraStatusParadasRecusa(objEnvio.idTabela, req.body.CDCARGA, objEnvio.objConn, req.UserId);
                            operationSuccess = operationSuccess && returnParada;
                            console.log(operationSuccess);
                        }
                    }

                } catch (err) {
                    operationSuccess = operationSuccess && false;
                    await con.closeRollback();
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                }
            }

            if (operationSuccess) {
                msg = "Nota(s) recusada(s) com sucesso.";
                await con.close();
                return { success: true, msg: msg, idAtendimento: idAtendimento };
            } else {
                if (msg == '') {
                    msg = "Ocorreu um erro ao recusar nota(s).";
                }
                await con.closeRollback();
                return { success: false, msg: msg, idAtendimento: null };
            }

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    }

    api.alteraStatusParadasRecusa = async function (IDG043, IDG046, con1, userId) {

        let con = await this.controller.getConnection(con1, userId);
        let operationSuccess = true;
        //verifica data entrega planejada no banco
        let validaEtapaNf = await con.execute({
            sql: `
				SELECT 
					G048.IDG048 
				FROM G046 G046
				INNER JOIN G048 G048 ON G048.IDG046 = G046.IDG046
				INNER JOIN G049 G049 ON G049.IDG048 = G048.IDG048
				INNER JOIN G043 G043 ON G043.IDG043 = G049.IDG043
				WHERE G043.IDG043 = ${IDG043}
					AND G046.IDG046 = ${IDG046}`,
            param: []
        })
            .then((result) => {
                return (result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        if (validaEtapaNf.length == 1) {
            let alteraEtapa = await con.execute({
                sql: `
					UPDATE G048 SET STINTCLI = 1 WHERE IDG048 =  ${validaEtapaNf[0].IDG048}`,
                param: []
            })
                .then((result2) => {
                    operationSuccess = operationSuccess && true;
                })
                .catch((err) => {
                    operationSuccess = operationSuccess && false;
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
        } else {
            operationSuccess = operationSuccess && false;
        }

        return operationSuccess;

    }


    api.salvarFinalizarNovoAtendimentoMotivoQM = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        // verifica data entrega planejada no banco
        let validaMotivo = await con.execute({
            sql: `
				SELECT 
					A015.IDA015, 
					A015.IDA002, 
					A015.IDI015 
				FROM A015 A015 
				WHERE A015.IDA002 = ${req.body.IDA002}`,
            param: []
        })
            .then((result) => {
                return (result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
        if (validaMotivo.length != 1) {
            res.status(400).send({ msg: 'Motivo não encontrado no 4PL ' });
            return false;
        }


        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    NMSOLITE: req.body.NMSOLITE,
                    TFSOLITE: req.body.TFSOLITE,
                    DTREGIST: new Date(),
                    DTFIM: new Date(),
                    SNDELETE: 0,
                    STDATAS: 'Q',
                    SNDTALTE: req.body.REFDATA

                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 4, req.body.IDSOLIDO, '', con, req.UserId);

            // - Declaro uma váriavel pra retornar alguma validação.
            let retorno = '';



            // - Faz a alteração de Datas
            await api.inserirMotivosQM(req.body.IDG051, validaMotivo[0].IDI015, req.body.IDG043, req.body.CDCARGA, con, req.UserId);


            if (retorno.INTEGRADOR == 1) {
                await con.closeRollback();
                return {
                    integrador: 1
                };
            } else {
                // - Faz o Vínculo do atendimento com a nota-fiscal
                // - Verifica a váriavel retorno 
                await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);

            }

            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.inserirMotivosQM = async function (IDG051, IDA002, IDG043, CDCARGA, con1, userId) {

        let con = await this.controller.getConnection(con1, userId);

        //######################################################################################
        //Faz o De/Para entre os motivos do atendimento para os motivos reason code da syngenta
        //######################################################################################
        let motivosReasonAtendimento = IDA002;

        let result2 = null;
        let operationSuccess = true;
        try {

            // ALTERA DATA DE ENTREGA, STATUS DO LOGOS E A ETAPA PARA TODAS AS NOTAS SELECIONADAS
            let objNotas = [];
            let nrEtapa = null;
            console.log("typeof IDG043 ", typeof IDG043);
            if (typeof IDG043 == "number" || typeof IDG043 == "string") {
                objNotas[0] = IDG043;
            } else {
                objNotas = IDG043;
            }

            for (let i = 0; i < objNotas.length; i++) {

                let atualizaNotas = await con.execute({
                    sql: `        
					Update G043 G043
						Set G043.IDI015 = ${motivosReasonAtendimento}
					Where G043.IDG043 = ${objNotas[i]}`,
                    param: []
                })
                    .then((result1) => {
                        operationSuccess = operationSuccess && true;

                    })
                    .catch(async (err) => {
                        operationSuccess = operationSuccess && false;
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

            }

            // INFORMA MOTIVO NO CTE
            let atualizaCte = await con.execute({
                sql: `        
				Update G051 G051
					Set  G051.IDI015 = ${motivosReasonAtendimento}
				Where G051.IDG051 = ${IDG051}`,
                param: []
            })
                .then((result1) => {
                    operationSuccess = operationSuccess && true;
                    //return result1;
                })
                .catch((err) => {
                    operationSuccess = operationSuccess && false;
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (operationSuccess) {
                await con.close();
                result2 = { success: true, msg: "Motivos inserido com sucesso." }
            } else {
                await con.closeRollback();
                result2 = { success: false, msg: "Ocorreu um erro ao inserir motivo" }
            }


            return result2;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };

    api.deleteMovimentacao = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let result1 = await con.execute({
            sql: `
				Delete from A003 where A003.IDA003 = ${req.body.IDA003}`,
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
        return result1;

    }

    api.buscaUltimoMotivo = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;


        let result1 = await con.execute({
            sql: ` 
				Select Distinct A001.IDA001,
										A002.DSTPMOTI AS A002_DSTPMOTI,
										A002.IDA002 AS A002_IDA002
							From A001 A001 /* Atendimentos  */
							Join A002 A002 /* Motivos do atendimento  */
								On (A002.IDA002 = A001.IDA002)
							Join A005 A005 /* Tabela que une um atendimento (A001) a uma NF-e (G043)  */
								On (A005.IDA001 = A001.IDA001)
							Join G043 G043 /* NF-e  */
								On (A005.IDG043 = G043.IDG043)
					WHERE G043.IDG043 = ${IDG043} AND A001.SNDELETE = 0
					Order by A001.IDA001 Desc
						`,
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
        return result1;
    };

    api.listarEnvioRastreio = async function (req, res, next) {

        let con = await this.controller.getConnection(null, req.UserId);
        let auxRelation = `
            Join G005 G005 On (G005.IDG005 = G078.IDG005DE AND G005.SNDELETE = 0)
            Join G003 G003   On (G003.IDG003 = G005.IDG003)
            Join G002 G002   On (G002.IDG002 = G003.IDG002)
            cross apply
            ( Select  regexp_substr(G078.G043LIST,'[^,]+', 1, level) AS IDG043 from dual
                        connect by regexp_substr(G078.G043LIST, '[^,]+', 1, level) is not null
            ) C_01
            Join G043 G043 ON (G043.IDG043 = C_01.IDG043)
            Join G052 G052 ON (G052.IDG043 = G043.IDG043)
            Join G051 G051 ON (G051.IDG051 = G052.IDG051)
        `;

        if (req.body['parameter[G078_SNENVMAN][null]'] == "false") {
            auxRelation = ` 
                Join G051 G051 ON (G051.IDG051 = G078.IDG051)
                Join G052 G052 ON (G052.IDG051 = G051.IDG051)
                Join G043 G043 ON (G043.IDG043 = G052.IDG043)
                Join G005 G005 ON (G005.IDG005 = G051.IDG005 AND G005.SNDELETE = 0)
                Join G003 G003   ON (G003.IDG003 = G005.IDG003)
                Join G002 G002   ON (G002.IDG002 = G003.IDG002)
            `;
        }

        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G078', true);

        sqlWhere += ` And G078.SNENVIAD = 1 And G078.TPSISENV = 'R' And G051.TPTRANSP = 'V' AND G005.STCADAST = 'A' `;

        let sqlWhereAcl = await acl.montar({
            ids001: req.UserId,
            dsmodulo: "monitoria",
            nmtabela: [{
                G014: 'G014'
            },
            {
                G024: 'G024'
            }],
            esoperad: 'And'
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        let sql = `Select DISTINCT
                            G078.IDG078,
                            NVL(G078.G043LIST, LISTAGG(G043.IDG043, ',') WITHIN GROUP (ORDER BY G043.IDG043)
                            OVER (PARTITION BY G078.IDG078)) AS G043LIST,
                            G078.DSENVPAR,
                            G078.DTENVIA,
                            G005.NMCLIENT AS NMCLIENTDE,
                            G005.CJCLIENT AS CJCLIENTDE,
                            G005.IECLIENT AS IECLIENTDE,
                            G014.DSOPERAC AS DSOPERAC,
                            G003.NMCIDADE,
                            G002.NMESTADO,
                            LISTAGG(G043.NRNOTA, ', ') WITHIN GROUP (ORDER BY G043.NRNOTA)
                            OVER (PARTITION BY G078.IDG078) As NRNOTA,
                            LISTAGG(G051.CDCTRC, ', ') WITHIN GROUP (ORDER BY G051.CDCTRC)
                            OVER (PARTITION BY G078.IDG078) As CDCTRC,
                            COUNT(DISTINCT G078.IDG078) OVER () as COUNT_LINHA
                        From G078 G078
                        ${auxRelation}
                        INNER JOIN G022 G022 ON (G022.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE) AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0) 
                        INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)
                        Join G014 G014 ON (G014.IdG014 = G022.IdG014)
                        Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
                        Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
                        Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
                        Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0) 

                        ${sqlWhere} ${sqlWhereAcl}

                        GROUP BY 
                        G078.IDG078,
                        G078.DSENVPAR,
                        G078.DTENVIA,
                        G005.NMCLIENT,
                        G005.CJCLIENT,
                        G005.IECLIENT,
                        G043.NRNOTA,
                        G078.G043LIST,
                        G014.DSOPERAC,
                        G043.IDG043,
                        G051.CDCTRC,
                        G003.NMCIDADE,
                        G002.NMESTADO

                        ${sqlOrder} ${sqlPaginate}`;

        let result = await con.execute({
            sql: sql,
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
    };

    api.listRastreioByClient = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G005', false);

        sqlWhere += ` 
            AND G005.STCADAST = 'A'
            AND G043.SNDELETE = 0
            AND G051.SNDELETE = 0
            AND G051.TPTRANSP = 'V'
            AND G051.STCTRC = 'A' `;

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

        let auxRelation = `
            LEFT JOIN G078 G078 ON G078.IDG005DE = G005.IDG005 AND G078.SNENVIAD = 1 AND TPSISENV = 'R'
        `;

        if (req.body['parameter[G078_SNENVMAN][null]'] == "false") {
            auxRelation = ` 
                LEFT JOIN G078 G078 ON G078.IDG051 = G051.IDG051 AND G078.SNENVIAD = 1 AND TPSISENV = 'R'
            `;
        }

        let sql = `
            SELECT DISTINCT 
                G005.IDG005,
                G005.NMCLIENT, 
                G005.CJCLIENT, 
                G005.IECLIENT,
                G005.IMCLIENT,
                G003.NMCIDADE ||'-'|| G002.CDESTADO AS NMCIDADE,
                COUNT(DISTINCT G078.IDG078) AS ENVIOS,
                LISTAGG (G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT) OVER (PARTITION BY G005.IDG005) AS EMAILS,
                COUNT(DISTINCT G005.IDG005) OVER() AS COUNT_LINHA
            FROM G005 G005
            INNER JOIN G003 G003 ON G003.IDG003 = G005.IDG003
            INNER JOIN G002 G002 ON G002.IDG002 = G003.IDG002
            INNER JOIN G051 G051 ON G051.IDG005DE = G005.IDG005
            INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
            INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
            INNER JOIN G022 G022 ON (G022.IDG005 = NVL(G051.IDG005CO,G051.IDG005RE) AND NVL(G022.SNINDUST,1) = 1 AND G022.SNDELETE = 0)
            INNER JOIN G014 G014 ON G014.IDG014 = G022.IDG014
            INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)
            LEFT JOIN G049 G049 ON G049.IDG051 = G051.IDG051
            LEFT JOIN G048 G048 ON G048.IDG048 = G049.IDG048
            LEFT JOIN G046 G046 ON G046.IDG046 = G048.IDG046
            LEFT JOIN G020 G020 ON G020.IDG005 = G005.IDG005 AND G020.TPCONTAT = 'C'
            LEFT JOIN G007 G007 ON G007.IDG007 = G020.IDG007 AND G007.SNDELETE = 0
            LEFT JOIN G008 G008 ON G008.IDG007 = G007.IDG007 AND G008.SNDELETE = 0 AND G008.TPCONTAT = 'E'
            ${auxRelation}

            ${sqlWhere} ${sqlWhereAcl}

            GROUP BY
            G005.IDG005,
            G005.NMCLIENT, 
            G005.CJCLIENT, 
            G005.IECLIENT,
            G005.IMCLIENT,
            G008.DSCONTAT,
            G003.NMCIDADE,
            G002.CDESTADO

            ${sqlOrder} 
            ${sqlPaginate}`;
        try {
            let result = await con.execute({
                sql,
                param: bindValues
            })
                .then((result) => {
                    console.log(result);
                    return (utils.construirObjetoRetornoBD(result, req.body));
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

    api.removeAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDA001 = req.body.IDA001;
        let DSREMOTI = req.body.DSREMOTI;
        console.log("ID: " + IDA001);
        console.log("MOTIVO: " + DSREMOTI);
        try{
            //Exclui atendimento e seta o motivo da exclusão
            let result = await con.execute({
                sql: ` Update A001 Set SNDELETE = 1, DSREMOTI = '${DSREMOTI}'	Where A001.IDA001 = ${IDA001} `,
                param: []
            })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            //Verifica o tipo do atendimento 
            let result_tipo = await con.execute({
                sql: ` Select STDATAS from A001 Where A001.IDA001 = ${IDA001} `,
                param: []
                }).then((result) => {
                        return result[0];
                }).catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                });
            
            //Limpar data combinada caso delete o atendimento e STDATAS = C       
            if(result_tipo.STDATAS == 'C'){            
                let result_data = await con.execute({
                    sql: ` UPDATE G051 SET G051.DTCOMBIN = null where G051.IDG051 = 
                    (SELECT G051.IDG051 FROM G051 
                    INNER JOIN G052 ON G052.IDG051 = G051.IDG051
                    INNER JOIN G043 ON G052.IDG043 = G043.IDG043
                    INNER JOIN A005 ON A005.IDG043 = G043.IDG043 
                    WHERE A005.IDA001 = ${IDA001}) `,
                    param: []
                }).then((result_data) => {
                    return result_data;
                })
                .catch((err) => {
                    logger.console.error("[ERRO] Erro ao limpar data combinada ", err);                
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
            }
                 
            await con.close();
            return result;
        }catch(err){
            logger.error('[ERROR] ', err)
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
        
    };

    api.listarGrupos = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'A016', true);

        sqlOrder = 'Order By A016.DTCADAST';

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

        let result = await con.execute({
            sql: ` 
						Select Distinct A016.IDA016,
							A016.NMGRUPOC,
							TO_CHAR(A016.DTCADAST, 'DD/MM/YYYY') as DTCADAST,
							COUNT(A016.IDA016) OVER () as COUNT_LINHA
						FROM A016 A016
							 ` +
                sqlWhere + sqlWhereAcl +
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
    };

    api.salvarGrupo = async function (req, res, next) {
        let con = await this.controller.getConnection();

        let IDS001 = req.body.IDS001;
        let NMGRUPOC = req.body.NMGRUPOC;

        try {

            let result = await con.insert({
                tabela: 'A016',
                colunas: {
                    NMGRUPOC: NMGRUPOC,
                    DTCADAST: new Date(),
                    IDS001: IDS001
                },
                key: 'Ida016'
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

    api.removerGrupo = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDA016 = req.body.IDA016;

        let result = await con.execute({
            sql: ` 
						Update A016 Set SNDELETE = 1 Where A016.IDA016 = ${IDA016}
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
        return result;

    };

    api.inserirContatoAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection();

        let operationSuccess = true;
        let objDetalheContato = req.body.G008_DSCONTAT;
        let objGrupos = req.body.OBJGRUPOS ? req.body.OBJGRUPOS : null;

        var contato = await con.insert({
            tabela: 'G007',
            colunas: {
                IDS001: req.body.IDS001,
                NMCONTAT: req.body.NMCONTAT,
                IDG006: req.body.IDG006,
                DTCADAST: new Date(),
                SNCONATE: 1
            },
            key: 'IDG007'
        })
            .then((result) => {
                operationSuccess = operationSuccess && true;
                return result;
            })
            .catch((err) => {
                throw err;
            });

        for (let itemGrupo = 0; itemGrupo < objGrupos.length; itemGrupo++) {

            let relacionamentoGrupo = await con.insert({
                tabela: 'A017',
                colunas: {
                    IDG007: contato,
                    IDA016: objGrupos[itemGrupo]
                }
            })
                .then((result) => {
                    operationSuccess = operationSuccess && true;
                    return result;
                })
                .catch((err) => {
                    throw err;
                });

        }

        for (let i = 0; i < objDetalheContato.length; i++) {
            let detalheContato = await con.insert({
                tabela: 'G008',
                colunas: {
                    IDG007: contato,
                    DSCONTAT: objDetalheContato[i].G008_DSCONTAT,
                    TPCONTAT: req.body.G008_TPCONTAT,
                    DTCADAST: new Date(),
                    SNDELETE: 0,
                    IDS001: req.body.IDS001
                },
                key: 'IDG008'
            })
                .then((result) => {
                    operationSuccess = operationSuccess && true;
                })
                .catch((err) => {
                    throw err;
                });
        }

        if (!operationSuccess) {
            await con.closeRollback();
            return { success: false, idg007: contato, msg: "Erro ao criar detalhe do contato" }
        } else {
            await con.close();
            return { success: true, idg007: contato, msg: "Contato criado com sucesso." }
        }

    };

    api.buscaInfoContatoAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection();

        var id = req.body.IDG007;
        objRetorno = {};
        objRetorno.nomeContato = await con.execute({
            sql: `SELECT 
                     G007.IDG007,
                     G007.IDS001, 
                     G007.NMCONTAT
  
              FROM   G007
              WHERE  G007.IDG007 = ${id} AND G007.SNCONATE = 1
                AND G007.SNDELETE = 0`,
            param: []
        })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                throw err;
            });

        objRetorno.contato = await con.execute({
            sql: `SELECT  G008.IDG008, 
                        G008.IDG007, 
                        G008.DSCONTAT 
                FROM G008 G008 
                WHERE G008.IDG007 = ${id} 
                AND G008.SNDELETE = 0 `,
            param: []
        })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                throw err;
            });

        objRetorno.grupos = await con.execute({
            sql: `SELECT DISTINCT 
                          A016.NMGRUPOC as Text, 
                          A016.IDA016 AS ID
                      FROM A016 A016
											INNER JOIN A017 A017 ON A016.IDA016 = A017.IDA016
											INNER JOIN G007 G007 ON G007.IDG007 = A017.IDG007
                        AND G007.SNDELETE = 0
                        AND G007.SNCONATE = 1
                        And G007.IDG007 = ${id} `,
            param: []
        })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });

        await con.close();
        return objRetorno;

    };

    api.listarContatosAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G007', true);

        let sqlCount = ' COUNT(G007.IDG007) OVER () AS COUNT_LINHA, ';

        let result = await con.execute({

            sql: `SELECT Distinct G007.IDG007,
                              G007.NMCONTAT,
                              ${sqlCount}
                              TO_CHAR(G007.DTCADAST, 'DD/MM/YYYY') DTCADAST,
                              LISTAGG (G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT)
                              OVER (PARTITION BY G008.IDG007) AS DSCONTAT
                             -- NVL(G008.DSCONTAT,'n.i') AS DSCONTAT
              FROM  G007 G007

              inner Join G008 G008 on (G008.IDG007 = G007.IDG007)

               ` +
                sqlWhere + ` AND G007.SNCONATE = 1 ` +

                `Group by G007.NMCONTAT,
                G007.IDG007,
                G007.DTCADAST,
                G008.DSCONTAT,
                G008.IDG007` +

                sqlOrder +
                sqlPaginate,
            param: bindValues

        }).then((result) => {
            return (utils.construirObjetoRetornoBD(result, null, 4, 4));

        }).catch((err) => {
            throw err;
        });

        await con.close();
        return result;

    };


    api.alterarContatoAtendimento = async function (req, res, next) {
        let con = await this.controller.getConnection();

        let objDetalheContato = req.body.G008_DSCONTAT;
        let objGrupos = req.body.OBJGRUPOS ? req.body.OBJGRUPOS : null;
        let operationSuccess = true;

        let resultDelete = await con.execute({
            sql: `        
      Delete From A017 A017 Where A017.IDG007 = ` + req.body.IDG007,
            param: []
        })
            .then((result) => {
                operationSuccess = operationSuccess && true;
            })
            .catch((err) => {
                operationSuccess = operationSuccess && false;
                throw err;
            });

        if (operationSuccess) {

            for (let itemGrupo = 0; itemGrupo < objGrupos.length; itemGrupo++) {

                let relacionamentoGrupo = await con.insert({
                    tabela: 'A017',
                    colunas: {
                        IDG007: req.body.IDG007,
                        IDA016: objGrupos[itemGrupo]
                    }
                })
                    .then((result) => {
                        operationSuccess = operationSuccess && true;
                        return result;
                    })
                    .catch((err) => {
                        throw err;
                    });

            }

        }

        //remove os detalhe do contato
        let resultDeleteContato = await con.execute({
            sql: `        
      Delete From G008 G008 Where G008.IDG007 = ` + req.body.IDG007,
            param: []
        })
            .then((result) => {
                operationSuccess = operationSuccess && true;
            })
            .catch((err) => {
                operationSuccess = operationSuccess && false
                throw err;
            });

        if (operationSuccess) {
            for (let i = 0; i < objDetalheContato.length; i++) {
                // após remover tudo referente ao usuário, faz um novo insert dele
                let result = await con.insert({
                    tabela: `G008`,
                    colunas: {
                        IDG007: req.body.IDG007,
                        DSCONTAT: objDetalheContato[i].G008_DSCONTAT,
                        TPCONTAT: req.body.G008_TPCONTAT,
                        DTCADAST: new Date(),
                        SNDELETE: 0,
                        IDS001: req.body.IDS001
                    },
                    key: `G008.IDG008`
                })
                    .then((result) => {
                        operationSuccess = operationSuccess && true;
                    })
                    .catch((err) => {
                        operationSuccess = operationSuccess && false;

                        throw err;
                    });
            }
        }

        await con.update({
            tabela: 'G007',
            colunas: {
                IDS001: req.body.IDS001,
                NMCONTAT: req.body.NMCONTAT,
                IDG006: req.body.IDG006,
                SNCONATE: 1
            },
            condicoes: `IDG007 = ${req.body.IDG007}`

        })
            .then((result) => {
                operationSuccess = operationSuccess && true;
            })
            .catch((err) => {
                operationSuccess = operationSuccess && false;
                throw err;
            });

        if (!operationSuccess) {
            await con.closeRollback();
            return { success: false, msg: "Erro ao alterar contato" }
        } else {
            await con.close();
            return { success: true, msg: "Contato alterado com sucesso." }
        }
    };



    api.enviarAtendimento = async function (arrayContatos, con1, userId, idAtendimento, IDG043, statusAtendimento, origin, buf = null, ext = null) {
        let con = await this.controller.getConnection(con1, userId);

        let emails = '';
        let buscaContato;
        let buscaInfoNotas;
        let objNotas = [];
        let objNotasByAtend;

        if ((IDG043 == null || IDG043 == "null") && idAtendimento != null) {
            objNotasByAtend = await con.execute({
                sql: `
						Select distinct 
							A005.IDG043
						From A005 A005
						WHERE A005.IDA001 = ${idAtendimento}
				`,
                param: []
            })
                .then((result1) => {
                    return result1;
                })
                .catch(async (err) => {
                    await con.closeRollback();
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (objNotasByAtend.length > 1) {
                for (let i = 0; i < objNotasByAtend.length; i++) {
                    objNotas.push(objNotasByAtend[i].IDG043);
                }
            } else {
                objNotas[0] = objNotasByAtend[0].IDG043;
            }


        } else {
            if (typeof IDG043 == "number" || typeof IDG043 == "string") {
                objNotas[0] = IDG043;
            } else {
                objNotas = IDG043;
            }

        }


        for (let i = 0; i < arrayContatos.length; i++) {

            if (arrayContatos[i].x == 2) {

                buscaContato = await con.execute({
                    sql: `
							Select distinct 
								G008.DSCONTAT
							From G008 G008
							WHERE G008.IDG007 = ${arrayContatos[i].id}
					`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });

            } else {
                buscaContato = await con.execute({
                    sql: `        
					Select distinct 
								G008.DSCONTAT
							From G008 G008
							JOIN A017 A017 ON (A017.IDG007 = G008.IDG007)
							WHERE A017.IDA016 = ${arrayContatos[i].id}`,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
            }

            for (let i = 0; i < buscaContato.length; i++) {
                emails += buscaContato[i].DSCONTAT + ',';
            }

        }

        let buscaInfoAtendimento = await con.execute({
            sql: `
					Select distinct 
						A001.IDA001,
						A002.DSTPMOTI,
						A008.DSACAO
					FROM A001 A001
					Join A002 A002 On A002.IDA002 = A001.IDA002
					Join A008 A008 On A008.IDA008 = A002.IDA008
					WHERE A001.IDA001 = ${idAtendimento}
			`,
            param: []
        })
            .then((result1) => {
                return result1;
            })
            .catch(async (err) => {
                await con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        let buscaInfoMovimentação = await con.execute({
            sql: `
					Select
						ROWNUM,
						NVL(dbms_lob.substr( A003.DSOBSERV, 4000, 1 ),' ') as DSOBSERV,
						Nvl(To_Char(A003.DTMOVIME,'DD/MM/YYYY HH24:MI'), '-') As DTMOVIME,
						S001RE.NMUSUARI As NMUSUARIRE,
						S001DE.NMUSUARI As NMUSUARIDE,
						A006.DSSITUAC
					From A003 A003
					Join A001 A001
						On (A001.IDA001 = A003.IDA001)
					Join S001 S001RE
						On (S001RE.IDS001 = A003.IDS001RE)
					Left Join S001 S001DE
						On (S001DE.IDS001 = A003.IDS001DE)
					Join A006 A006
						On (A006.IDA006 = A003.IDA006)
					Where A001.IDA001 = ${idAtendimento}
					Order By A003.IDA003 ASC
			`,
            param: []
        })
            .then((result1) => {
                return result1;
            })
            .catch(async (err) => {
                await con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

        buscaInfoNotas = await con.execute({
            sql: `
		SELECT DISTINCT 
					Nvl(G043.NRNOTA,G083.NRNOTA) as NRNOTA,
					Nvl(To_Char(G043.DTEMINOT,'DD/MM/YYYY'), To_Char(G083.DTEMINOT,'DD/MM/YYYY')) As DTEMINOT,
					G051.CDCTRC,
					G005RE.NMCLIENT As G005RE_NMCLIENTRE,
					G003RE.NMCIDADE As G003RE_NMCIDADERE,
					G002RE.NMESTADO As G002RE_NMESTADORE,
					G005DE.NMCLIENT As G005DE_NMCLIENTDE,
					G003DE.NMCIDADE As G003DE_NMCIDADEDE,
					G002DE.NMESTADO As G002DE_NMESTADODE,
					--nvl(G014.DSOPERAC, G005RE.NMCLIENT)  AS G014_DSOPERAC,
					Nvl(TO_CHAR(G043.PSBRUTO,'FM999G999G999D90', 'nls_numeric_characters='',.'''), TO_CHAR(G083.PSBRUTO,'FM999G999G999D90', 'nls_numeric_characters='',.''')) as PSBRUTO,
					TO_CHAR(G043.VRDELIVE,'FM999G999G999D90', 'nls_numeric_characters='',.''') as VRDELIVE,
					G005CO.NMCLIENT As G005CO_NMCLIENTCO
				FROM G043 G043
					Join G052 G052 On (G043.IDG043 = G052.IDG043)
					Join G051 G051 On (G051.IDG051 = G052.IDG051)

					Left Join G083 G083 On (G052.IDG083 = G083.IDG083)
					Left Join G005 G005RE On (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE))
					Left Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
					Left Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
					Left Join G005 G005DE On (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE))
					Left Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
					Left Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
					Left Join G005 G005CO On (G051.IDG005CO = G005CO.IDG005)
					Left Join G022 G022 On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
					Left Join G014 G014 On (G014.IDG014 = G022.IDG014)
				Where G043.IDG043 in (${objNotas.length > 1 ? objNotas.join() : objNotas[0]})
		`,
            param: []
        })
            .then((result1) => {
                return result1;
            })
            .catch(async (err) => {
                await con.closeRollback();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });


        var emailEnviar = app.src.modMonitoria.controllers.EmailController;
        //Se buf e ext forem nulos, não há anexos no atendimento
        await emailEnviar.sendAtendimento(emails, buscaInfoAtendimento, origin, userId, buscaInfoMovimentação, buscaInfoNotas, statusAtendimento, idAtendimento, buf, ext);



    }

    api.cancelarRecusa = async function (req, res, next) {
        let con = await this.controller.getConnection();

        let operationSuccess = true;
        let nrEtapa = null;
        console.log(req.body);

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    DTREGIST: new Date(),
                    DTFIM: new Date(),
                    SNDELETE: 0
                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, '', 4, req.body.IDSOLIDO, '', con, req.UserId);

            // - Faz o Vínculo do atendimento com a nota-fiscal
            await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);

            if (req.body.SNSYNGENTA) {

                buscaStatusAtual = await con.execute({
                    sql: `        
                    SELECT
                     G076.IDG076
                     from G076 G076
                     WHERE G076.IDG075 = 11 AND
                     G076.SNDELETE = 0 AND
                     G076.IDS007PK = ${req.body.IDG043} `,
                    param: []
                })
                    .then((result1) => {
                        return result1;
                    })
                    .catch(async (err) => {
                        await con.closeRollback();
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                    });
    
                await con.update({
                    tabela: 'G076',
                    colunas: {
                        VRCAMPO: 0
                    },
                    condicoes: `IDG076 = ${buscaStatusAtual[0].IDG076}`
    
                })
                    .then((result) => {
                        operationSuccess = operationSuccess && true;
                    })
                    .catch((err) => {
                        operationSuccess = operationSuccess && false;
                        throw err;
                    });
    
                if (operationSuccess) {
    
                    buscaInfoDelivery = await con.execute({
                        sql: `        
                        SELECT
                         G043.DTENTREG,
                         G043.TPDELIVE
                         from G043 G043
                         WHERE G043.IDG043 = ${req.body.IDG043} AND
                         G043.SNDELETE = 0 `,
                        param: []
                    })
                        .then((result1) => {
                            return result1;
                        })
                        .catch(async (err) => {
                            await con.closeRollback();
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
    
                    if (buscaInfoDelivery[0].TPDELIVE == 1 || buscaInfoDelivery[0].TPDELIVE == 2) {
                        nrEtapa = 4;
                    } else {
                        nrEtapa = 24;
                    }
    
    
                    if (buscaInfoDelivery[0].DTENTREG == null) {
    
                        await con.update({
                            tabela: 'G043',
                            colunas: {
                                STETAPA: nrEtapa
                            },
                            condicoes: `IDG043 = ${req.body.IDG043}`
    
                        })
                            .then((result) => {
                                operationSuccess = operationSuccess && true;
                            })
                            .catch((err) => {
                                operationSuccess = operationSuccess && false;
                                throw err;
                            });
    
                    }
    
                }
            }

            if (operationSuccess) {
                await con.close();
                return result;
            } else {
                await con.closeRollback();
            }

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }


    }

    api.listarVinculoAtendentes = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await con.execute({
                sql: `
					SELECT DISTINCT 
							A018.IDG014,
							A018.IDS001,
							A018.IDA018,
							S001.NMUSUARI,
							LISTAGG (G014.DSOPERAC, ', ') WITHIN GROUP (ORDER BY G014.DSOPERAC)
							OVER (PARTITION BY A018.IDS001) AS DSOPERAC
					FROM A018 A018
					JOIN S001 S001 ON A018.IDS001 = S001.IDS001
					JOIN G014 G014 ON G014.IDG014 = A018.IDG014
					
					WHERE G014.SNDELETE = 0 AND S001.SNDELETE = 0`,
                param: []

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

    api.vinculaAtendente = async function (req, res, next) {
        let con = await this.controller.getConnection();

        try {
            let result = await con.insert({
                tabela: `A018`,
                colunas: {
                    IDS001: req.body.IDS001,
                    IDG014: req.body.IDG014
                },
                key: `A018.IDA018`
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

    api.removerVinculoAtend = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDA018 = req.body.IDA018;

        try {
            let result = await con.execute({
                sql: ` 
							Delete From A018 Where A018.IDA018 = ${IDA018}
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
            return result;

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }


    api.getAtendentesCockpitConfig = async function (req, res, next) {
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
            esoperad: ' And ((NVL(S001.SNBRAVO,0) <> 1 AND A002.SNVISCLI = 1) OR (S001.SNBRAVO = 1)) And '
        });

        let sqlWhere = '';
        let sqlWhere_oc = '';

        if (req.body.A008_IDA008 != null) {
            sqlWhere += ' And A008.IDA008 In (' + req.body.A008_IDA008.in + ')';
            sqlWhere_oc += ' And a008_oc.IDA008 In (' + req.body.A008_IDA008.in + ')';
        }

        if (req.body.G043_IDG043 != null) {
            sqlWhere += ' And G043.IDG043 = ' + req.body.G043_IDG043.id;
            sqlWhere_oc += ' And g043_oc.IDG043 = ' + req.body.G043_IDG043.id;
        }

        if (req.body.G051_IDG051 != null) {
            sqlWhere += ' And G051.IDG051 = ' + req.body.G051_IDG051.id;
            sqlWhere_oc += ' And g051_oc.IDG051 = ' + req.body.G051_IDG051.id;
        }

        if (req.body.G046_IDG046 != null) {
            sqlWhere += ' And G046.IDG046 = ' + req.body.G046_IDG046.id;
            sqlWhere_oc += ' And g046_oc.IDG046 = ' + req.body.G046_IDG046.id;
        }

        if (req.body.G043_IDG024TR != null) {
            sqlWhere += ' And G043.IDG024TR = ' + req.body.G043_IDG024TR.id;
            sqlWhere_oc += ' And g043_oc.IDG024TR = ' + req.body.G043_IDG024TR.id;
        }

        if (req.body.G043_IDG005DE != null) {
            sqlWhere += ' And G043.IDG005DE = ' + req.body.G043_IDG005DE.id;
            sqlWhere_oc += ' And g043_oc.IDG005DE = ' + req.body.G043_IDG005DE.id;
        }

        if (req.body.G043_IDG005RE != null) {
            sqlWhere += ' And G043.IDG005RE = ' + req.body.G043_IDG005RE.id;
            sqlWhere_oc += ' And g043_oc.IDG005RE = ' + req.body.G043_IDG005RE.id;
        }

        if (req.body.A001_DTREGIST != null) {
            sqlWhere += ` And A001.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI')`;
            sqlWhere_oc += ` And a001_oc.DTREGIST Between To_Date('` + req.body.A001_DTREGIST[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.A001_DTREGIST[1] + `','DD/MM/YYYY HH24:MI')`;

        }

        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        try {
            let result = await con.execute({
                sql: `
					Select Distinct A018.IDS001,
													S001.NMUSUARI,
													G014.IDG014,
                          (Select Count(1)
													FROM a001 a001_oc
													JOIN a002 a002_oc ON ( a002_oc.ida002 = a001_oc.ida002 )
													JOIN a008 a008_oc /* Tipos de Ação ( Ocorrência ou Atendimento ) */ ON ( a002_oc.ida008 = a008_oc.ida008 )
													JOIN a005 a005_oc ON ( a005_oc.ida001 = a001_oc.ida001 )
													JOIN g043 g043_oc ON ( g043_oc.idg043 = a005_oc.idg043 )
													JOIN g052 g052_oc ON ( g052_oc.idg043 = g043_oc.idg043 )
													JOIN g051 g051_oc ON ( g051_oc.idg051 = g052_oc.idg051 )
													JOIN g022 g022_oc ON ( g022_oc.idg005 = g051_oc.idg005co )
													JOIN g014 g014_oc ON ( g014_oc.idg014 = g022_oc.idg014 )
													JOIN g024 g024_oc ON ( g024_oc.idg024 = g051_oc.idg024 )
													LEFT JOIN g049 g049_oc ON ( g049_oc.idg043 = g043_oc.idg043 )
													LEFT JOIN g048 g048_oc ON ( g049_oc.idg048 = g048_oc.idg048 )
													LEFT JOIN g046 g046_oc ON ( g048_oc.idg046 = g046_oc.idg046 )
											WHERE
													g014_oc.idg014 = g014.idg014
													AND a001_oc.dtfim IS NULL
													AND a002_oc.ida008 = 2
													AND a001_oc.sndelete = 0` + sqlWhere_oc + sqlWhereAcl + `) As QTD_OCORRENCIAS,
                          (Select Count(1)
                            From A001 A001
                            Join A002 A002
                              On (A002.IDA002 = A001.IDA002)
                            Join A008 A008 /* Tipos de Ação ( Ocorrência ou Atendimento ) */
								              On (A002.IDA008 = A008.IDA008)
                            Join A005 A005
                              On (A005.IDA001 = A001.IDA001)
                            Join G043 G043
                              On (G043.IDG043 = A005.IDG043)
                            Join G052 G052 /* Tabela que une a NF-e (G043) com CT-e (G051) */
                              On (A005.IDG043 = G052.IDG043)
                            Join G051 G051 /* Conhecimento do Transporte */
                              On (G051.IDG051 = G052.IDG051)
                            Left Join G049 G049
                              On (G049.IDG043 = G043.IDG043)
                            Left Join G048 G048
                              On (G049.IDG048 = G048.IDG048)
                            Left Join G046 G046
                              On (G048.IDG046 = G046.IDG046)
                            /*Join A003 A003
                              On (A003.IDA001 = A001.IDA001 And A003.IDA003 = 
                                                                (Select Max(A003_2.IDA003)
                                                                   From A003 A003_2
                                                                  Where A003_2.IDA001 = A003.IDA001))
                            Join A006 A006
                              On (A006.IDA006 = A003.IDA006)*/
														Join G022 G022
															On (G022.IDG005 = G051.IDG005CO)
														Join G014 G014_AT
															On G014_AT.IdG014 = G022.IdG014
														Left Join G024 G024 
														  On (G024.IdG024 = G051.IdG024)                         
                            Where G014_AT.IDG014 = G014.IDG014
                              And A001.DTFIM Is Null
															And A002.IDA008 = 1
															And A001.SNDELETE = 0` + sqlWhere + sqlWhereAcl + `) As QTD_ATENDIMENTOS
						From A018 A018
						Join S001 S001
							On (A018.IDS001 = S001.IDS001)
						Join G014 G014
							On (G014.IDG014 = A018.IDG014)
          Where S001.SNDELETE = 0 `,
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

    api.salvarAtendimentoDataCanhot = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    DTREGIST: new Date(),
                    SNDELETE: 0,
                    DTFIM: new Date(),
                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 4, req.body.IDSOLIDO, '', con, req.UserId);

            let resultNotas = await con.execute({
                sql: `
              Select Distinct
                  G043.IDG043
              FROM G051 G051
                Join G052 G052
                  On (G052.IDG051 = G051.IDG051)
                Join G043 G043
                  On (G043.IDG043 = G052.IDG043)
              Where G051.NRCHADOC = ${req.body.G051_NRCHADOC}`,
                param: []
            })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (resultNotas && resultNotas.length > 0) {
                for (let i = 0; i < resultNotas.length; i++) {
                    result2 = await con.execute({
                        sql: `
									Update G043 SET DTCANHOT = To_Date('${req.body.DTCANHOT}', 'DD/MM/YYYY') WHERE IDG043 = ${resultNotas[i].IDG043}
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

                    // - Faz o Vínculo do atendimento com a nota-fiscal
                    await api.criarVinculoNotaFiscal(idAtendimento, resultNotas[i].IDG043, con, req.UserId);
                }

            }

            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.listarTransferencia = async function (req, res, next) {

        let con = await this.controller.getConnection(null, req.UserId);
        let whereProdutos = '';

        if (req.body['parameter[G045_DSPRODUT]'] != undefined && req.body['parameter[G045_DSPRODUT]'] != null && req.body['parameter[G045_DSPRODUT]'] != '') {
            whereProdutos = ` And UPPER(G045.DSPRODUT) LIKE UPPER('%${req.body['parameter[G045_DSPRODUT]']}%') `;
            delete req.body['parameter[G045_DSPRODUT]'];
        }

        //filtra,ordena,pagina
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        sqlWhere = sqlWhere + `  And G051.SnDelete = 0 And G051.TPTRANSP = 'T' `;

        let leftAuxTransp = '';
        let leftAuxOperac = '';

        if (req.body['parameter[G014_IDG014][id]'] != undefined && req.body['parameter[G014_IDG014][id]'] != null && req.body['parameter[G014_IDG014][id]'] != '') {
            leftAuxOperac = ` Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
                    Left Join G014 G014   On G014.IdG014 = G022.IdG014 `;
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
            leftAuxTransp = ` Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
												Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
												Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
												Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0) `;
        }

        if ((sqlWhereAcl.includes('G014'))) {
            if (leftAuxOperac == '') {
                leftAuxOperac = ` Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
                    Left Join G014 G014   On G014.IdG014 = G022.IdG014 `;
            }
        }

        let result = await con.execute({
            sql: `
				Select Distinct 
					G043.NRNOTA,--NF
					To_Char(G043.DTEMINOT,'DD/MM/YYYY') As DTEMINOT,--DATA NF
					To_Char(G043.DTENTCON,'DD/MM/YYYY') As DTENTCON,--PRAZO CONTRATO
					To_Char(G043.DTENTREG,'DD/MM/YYYY') As DTENTREG, --DATA ENTREGA
					
					TO_CHAR(G051.DTCOLETA, 'DD/MM/YYYY') As DTCOLETA, --DATA(COLETA)
					G051.CDCTRC,--CTE
					
					Case
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') < To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.')
                    When To_date(fn_data_sla(G051.IDG051),'DD/MM/YYYY') < To_Date(CURRENT_DATE,'DD/MM/YYYY') And G043.DTENTREG Is Null and G043.IDG014 <> 5 And To_Date(G051.DTCALDEP,'DD/MM/YYYY') > To_Date(G043.DTENTCON,'DD/MM/YYYY') Then
                        Nvl(TO_CHAR(G051.DTCALDEP, 'DD/MM/YYYY'), 'n.i.')
                    Else
                        Nvl(TO_CHAR(fn_data_sla(G051.IDG051),'DD/MM/YYYY'),'n.i.')
                    End as DTPREENT, --PREVISÃO ESTIMADA DE CHEGADA NO CD 
					
					O_01.NRFROTA AS G032_NRFROTA,--FROTA
					O_01.IDG046 AS G046_IDG046,--CARGA
					O_01.NMARMAZE AS NMARMAZE,--EMPRESA
					
					C_02.A001_IDA001,--ATENDIMENTO/OCORRÊNCIA
					
					C_03.G003RE_NMCIDADERE || ' - ' || C_03.G002RE_CDESTADORE as G003RE_NMCIDADERE,	--ORIGEM*
					C_04.G003DE_NMCIDADEDE || ' - ' || C_04.G002DE_CDESTADODE as G003DE_NMCIDADEDE,	--DESTINO*
					
					
					G045.DSREFFAB,--SKU
					G045.DSPRODUT,--DESCRIÇÃO
					To_Char(G045.PSBRUTO, 'FM999G999G999D90', 'nls_numeric_characters='',.''') || G009.CDUNIDAD As PSBRUTO, --PESO
					G050.QTPRODUT,--QTD
					
					'' as MOVIMENTO,
					'' as PREVISÃO_DE_ENTRADA_SAP,
					'' as ENTRADA_SAP,
					'' as OBSERVACAO,

					COUNT(G043.IDG043) OVER() as COUNT_LINHA
				
				From G043 G043
				Join G052 G052
						On (G052.IDG043 = G043.IDG043)
				Join G051 G051
						On (G051.IDG051 = G052.IDG051)
				Left Join G045 G045
						On (G045.IDG043 = G043.IDG043 AND G045.SNDELETE = 0)
				Left Join G050 G050 
						On (G050.IDG045 = G045.IDG045)
				Left Join G009 G009 
						On (G045.IDG009UM = G009.IDG009)
				${leftAuxTransp}
				${leftAuxOperac}

				outer apply   
					(SELECT 
						 G032X.NRFROTA,
						 G046X.IDG046,
						 G028X.NMARMAZE
						FROM G046 G046X
							JOIN G048 G048X ON (G046X.IDG046 = G048X.IDG046)
							JOIN G049 G049X ON (G049X.IDG048 = G048X.IDG048)
							JOIN G032 G032X ON (G032X.IDG032 = Nvl(G046X.IDG032V1, Nvl(G046X.IDG032V2, G046X.IDG032V3)) )
							JOIN G028 G028X ON (G046X.IDG028 = G028X.IDG028)
								
							WHERE G049X.IDG043 = G043.IDG043 AND G046X.STCARGA <> 'C'
							ORDER BY G046X.IDG046 DESC FETCH FIRST ROW ONLY
					) O_01
				
				cross apply
					( Select Distinct
								max(A001X.IDA001) AS A001_IDA001
						From A001 A001X
						Join A005 A005X On (A001X.IDA001 = A005X.IDA001)
						Where A005X.IDG043 = G043.IDG043 AND A001X.SNDELETE = 0
						FETCH FIRST ROW ONLY
					) C_02
					
				cross apply 
					(select max(G003RE.NMCIDADE) As G003RE_NMCIDADERE,
									max(G002RE.CDESTADO) As G002RE_CDESTADORE
						from G005 G005RE
						Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
						Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
						where G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE)
					) C_03
		
				cross apply
					(select max(G003DE.NMCIDADE) As G003DE_NMCIDADEDE,
									max(G002DE.CDESTADO) As G002DE_CDESTADODE 
						from  G005 G005DE
						Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
            Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
						where G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE)
					) C_04	

					` + sqlWhere + whereProdutos + sqlWhereAcl + `

				Group By
					G043.NRNOTA,
					G043.IDG043,
					G043.DTEMINOT,
					G043.DTENTCON,
					G043.DTENTREG,
					G043.IDG014,
					G051.DTCOLETA,
					G051.CDCTRC,
                    G051.IDG051,
                    G051.DTCALDEP,
					O_01.NRFROTA,
					O_01.IDG046,
					O_01.NMARMAZE,
					C_02.A001_IDA001,
					C_03.G003RE_NMCIDADERE,
					C_03.G002RE_CDESTADORE,
					C_04.G003DE_NMCIDADEDE,
					C_04.G002DE_CDESTADODE,
					G045.DSREFFAB,
					G045.DSPRODUT,
					G050.QTPRODUT,
					G045.PSBRUTO,
					G009.CDUNIDAD
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
    };


    api.buscaManterSla = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let IDG043 = req.body.IDG043;

        let result1 = await con.execute({
            sql: ` 
				Select Distinct A001.IDA001,
								A001.STDATAS
							From A001 A001 /* Atendimentos  */
							Join A005 A005 /* Tabela que une um atendimento (A001) a uma NF-e (G043)  */
								On (A005.IDA001 = A001.IDA001)
					WHERE A005.IDG043 = ${IDG043} AND A001.SNDELETE = 0 AND A001.STDATAS = 'S'
						`,
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
        return result1;
    };

    api.salvarRemocaoEntrega = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            let result = await con.insert({
                tabela: `A001`,
                colunas: {
                    IDA002: req.body.IDA002,
                    IDSOLIDO: req.body.IDSOLIDO,
                    NMSOLITE: req.body.NMSOLITE,
                    TFSOLITE: req.body.TFSOLITE,
                    DTREGIST: new Date(),
                    DTFIM: new Date(),
                    SNDELETE: 0,
                    STDATAS: 'N',
                    SNDTALTE: 1

                },
                key: `A001.IDA001`
            })
                .then((result1) => {
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            // - ID do Atendimento que foi criado
            let idAtendimento = result;

            // - Faz a criação da movimentação
            await api.criarMovimentacao(idAtendimento, req.body.DSOBSERV, 4, req.body.IDSOLIDO, '', con, req.UserId);

            // - Declaro uma váriavel pra retornar alguma validação.
            let retorno = '';
            let objNotas = [];
            let resultCancelamento = '';

            if (typeof req.body.IDG043 == "number" || typeof req.body.IDG043 == "string") {
                objNotas[0] = req.body.IDG043;
            } else {
                objNotas = req.body.IDG043;
            }

            for (let i = 0; i < objNotas.length; i++) {
                req.params.id = objNotas[i];
                req.body.atendimento = true;
                resultCancelamento = await cancelaEntrega.cancelaEntrega(req, res, next);
            }

            if (retorno.INTEGRADOR == 1) {
                await con.closeRollback();
                return {
                    integrador: 1
                };
            } else {
                // - Faz o Vínculo do atendimento com a nota-fiscal
                // - Verifica a váriavel retorno 
                await api.criarVinculoNotaFiscal(idAtendimento, req.body.IDG043, con, req.UserId);
            }

            await con.close();
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    };


    api.fluxoTransportadora = async function (req, res, next) {

        let con = await this.controller.getConnection(null, req.UserId);

        try {

            //filtra,ordena,pagina
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);

            sqlWhere = sqlWhere + `  And G043.SnDelete = 0 `;

            let leftAuxTransp = '';
            let leftAuxOperac = '';

            if (req.body['parameter[G014_IDG014][id]'] != undefined && req.body['parameter[G014_IDG014][id]'] != null && req.body['parameter[G014_IDG014][id]'] != '') {
                leftAuxOperac = ` Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
                        Left Join G014 G014   On G014.IdG014 = G022.IdG014 `;
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
                leftAuxTransp = ` Left Join G049 G049   On (G049.IDG043 = G043.IDG043)
                                                    Left Join G048 G048   On (G049.IDG048 = G048.IDG048)
                                                    Left Join G046 G046   On (G048.IDG046 = G046.IDG046 AND G046.STCARGA <> 'C')
                                                    Left Join G024 G024   On (G046.IDG024 = G024.IDG024 And G024.SnDelete = 0) `;
            }

            if ((sqlWhereAcl.includes('G014'))) {
                if (leftAuxOperac == '') {
                    leftAuxOperac = ` Left Join G022 G022   On (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1)
                        Left Join G014 G014   On G014.IdG014 = G022.IdG014 `;
                }
            }

            let sql = `
                    Select Distinct
                        LISTAGG(Nvl(G043.NRNOTA,G083.NRNOTA), '/') WITHIN GROUP(ORDER BY G043.NRNOTA)
                        OVER (PARTITION BY G052.IDG051) as NRNOTA,--NF

                        G051.CDCTRC As G051_CDCTRC, --CTE
                        G051.NRSERINF As G051_NRSERINF, --SÉRIE
                        Nvl(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'), 'n.i.') As G051_DTEMICTR, --DATA EMISSÃO CTE
                        Nvl(TO_CHAR(G051.DTEMIFAT, 'DD/MM/YYYY'), 'n.i.') As G051_DTEMIFAT,
                        Nvl(TO_CHAR(G051.DTVENFAT, 'DD/MM/YYYY'), 'n.i.') As G051_DTVENFAT,
                        Nvl(G051.NRCHADOC, '0') As G051_NRCHADOC, --CHAVE CTE
                        G051.VRMERCAD As G051_VRMERCAD,
                        G051.VRFRETEP As G051_VRFRETEP,
                        G051.VRTOTFRE As G051_VRTOTFRE,
                        G051.VRPEDAGI As G051_VRPEDAGI,
                        G051.VRBASECA As G051_VRBASECA,
                        G051.VRICMS As G051_VRICMS,
                        G051.IDG051 As IDG051,
                        G051.NRPESO As G051_NRPESO,
                        G051.VRTOTPRE As G051_VRTOTPRE,
                        G051.DSINFCPL As G051_DSINFCPL,
                        G051.VRFRETEV As G051_VRFRETEV,
                        Case
                            When Nvl(G051.VRFRETEV,0) = 0 Then
                            G051.VROUTROS
                            When Nvl(G051.VRFRETEV,0) <> 0 Then
                            G051.VRFRETEV
                            Else
                            0
                        End As FRETE_VALOR,
                        --Nvl(G051.VRFRETEV,G051.VROUTROS) As FRETE_VALOR,
                        Nvl(G051.NRFATURA,0) As G051_NRFATURA,
                        Nvl(G051.IDG059,0) As G051_IDG059,
                        Nvl(G051.PCALIICM,0) As G051_PCALIICM,
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
                        End As G051_TPTRANSP, --TIPO OPERAÇÃO 
                        
                        G024CTE.NMTRANSP AS G024CTE_NMTRANSP, --NOME TRANPOSRTADORA FILIAL
                        FN_FORMAT_CNPJ_CPF(G024CTE.CJTRANSP) AS G024CTE_CJTRANSP, --CNPJ TRANPOSRTADORA FILIAL
                        
                        C_01.G003RE_NMCIDADERE || ' - ' || C_01.G002RE_CDESTADORE as G003RE_NMCIDADERE,	--ORIGEM
                        C_01.G005RE_CJCLIENT as G005RE_CJCLIENT,--CNPJ ORIGEM
                        C_02.G003DE_NMCIDADEDE || ' - ' || C_02.G002DE_CDESTADODE as G003DE_NMCIDADEDE,	--DESTINO
                        C_02.G005DE_CJCLIENT as G005DE_CJCLIENT,--CNPJ DESTINO
                        C_03.G005CO_CJCLIENT as G005CO_CJCLIENT,--CNPJ TOMADOR
                        C_04.DSPRODUT as DSPRODUT,
                        C_04.QTD as QTD,

                        COUNT(G051.IDG051) OVER() as COUNT_LINHA
                    
                    From G051 G051
                    Join G052 G052
                        On (G052.IDG051 = G051.IDG051)
                    Join G043 G043
                        On (G052.IDG043 = G043.IDG043)
                    Join G083 G083
                        On (G052.IDG083 = G083.IDG083)
                    Join G024 G024CTE
                        On (G051.IDG024 = G024CTE.IDG024 And G024CTE.SnDelete = 0 And G024CTE.IDG023 = 2)
                    ${leftAuxTransp}
                    ${leftAuxOperac}
                        
                    cross apply 
                        (select max(G003RE.NMCIDADE) As G003RE_NMCIDADERE,
                                max(G002RE.CDESTADO) As G002RE_CDESTADORE,
                                max(FN_FORMAT_CNPJ_CPF(G005RE.CJCLIENT)) As G005RE_CJCLIENT
                            from G005 G005RE
                            Join G003 G003RE On (G003RE.IDG003 = G005RE.IdG003)
                            Join G002 G002RE On (G002RE.IDG002 = G003RE.IdG002)
                            where G005RE.IDG005 = Nvl(G051.IDG005RE,G043.IDG005RE)
                        ) C_01

                    cross apply
                        (select max(G003DE.NMCIDADE) As G003DE_NMCIDADEDE,
                                max(G002DE.CDESTADO) As G002DE_CDESTADODE,
                                max(FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT)) As G005DE_CJCLIENT
                            from  G005 G005DE
                            Join G003 G003DE On (G003DE.IDG003 = G005DE.IdG003)
                            Join G002 G002DE On (G002DE.IDG002 = G003DE.IdG002)
                            where G005DE.IDG005 = Nvl(G051.IDG005DE,G043.IDG005DE)
                        ) C_02	

                    cross apply
                        (select max(FN_FORMAT_CNPJ_CPF(G005CO.CJCLIENT)) As G005CO_CJCLIENT
                            from  G005 G005CO
                            where G005CO.IDG005 = Nvl(G051.IDG005CO,G043.IDG005TO)
                        ) C_03
                        
                    outer apply
                        (select NVL(G010.DSPRODUT,G045.DSPRODUT) as DSPRODUT,
                                G045.PSBRUTO as PSBRUTO,
                                sum(G050.QTPRODUT) As QTD
                            from  G043 G043
                            join G052 G052 on (G043.IDG043 = G052.IDG043)
                            join G045 G045 on (G043.IDG043 = G045.IDG043)
                            join G050 G050 on (G050.IDG045 = G045.IDG045)
                            left join G010 G010 on (G045.IDG010 = G010.IDG010)
                            where G052.IDG051 = G051.IDG051
                            group by G010.DSPRODUT,G045.DSPRODUT,G045.PSBRUTO,G050.QTPRODUT
                            order by G045.PSBRUTO desc fetch first row only
                        ) C_04

                        ` + sqlWhere + sqlWhereAcl + `

                    Group By
                        G043.NRNOTA,
                        G083.NRNOTA,
                        G051.IDG051,
                        G051.CDCTRC,
                        G051.NRSERINF,
                        G051.DTEMICTR,
                        G051.NRCHADOC,
                        G051.TPTRANSP,
                        G051.VRMERCAD,
                        G051.VRFRETEP,
                        G051.VRTOTFRE,
                        G051.VRPEDAGI,
                        G051.VRBASECA,
                        G051.VRICMS,
                        G051.NRFATURA,
                        G051.IDG059,
                        G051.PCALIICM,
                        G051.VRTOTPRE,
                        G051.NRPESO,
                        G051.DSINFCPL,
                        G051.DTEMIFAT,
                        G051.DTVENFAT,
                        G051.VRFRETEV,
                        G051.VROUTROS,
                        G052.IDG051,
                        G024CTE.NMTRANSP,
                        G024CTE.CJTRANSP,
                        C_01.G003RE_NMCIDADERE,
                        C_01.G002RE_CDESTADORE,
                        C_01.G005RE_CJCLIENT,
                        C_02.G003DE_NMCIDADEDE,
                        C_02.G002DE_CDESTADODE,
                        C_02.G005DE_CJCLIENT,
                        C_03.G005CO_CJCLIENT,
                        C_04.DSPRODUT,
                        C_04.QTD`;

            let resultCount = await con.execute({
                sql: ` select count(x.IDG051) as QTD from (` + sql + `) x `,
                param: bindValues
            })
                .then((result) => {
                    return result[0];
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            var reqAux = req;
            let result = await con.execute(

                {
                    sql: sql +
                        sqlOrder +
                        sqlPaginate,
                    param: bindValues
                })
                .then((result) => {
                    return result;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            if (result && result != null && result.length > 0) {

                if (result.length > 0) {
                    result[0].COUNT_LINHA = resultCount.QTD;
                }
            }

            result = (utils.construirObjetoRetornoBD(result, reqAux.body));

            await con.close();
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;

        }
    };

    api.getDashboardsNps = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        if (req.body.G051_DTEMICTR != null) {
            sqlWhere += ` And G051.DTEMICTR Between To_Date('` + req.body.G051_DTEMICTR[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G051_DTEMICTR[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        if (req.body.G061_DTAVALIA != null) {
            sqlWhere += ` And G061.DTAVALIA Between To_Date('` + req.body.G061_DTAVALIA[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G061_DTAVALIA[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        if (req.body.G002_IDG002 != null) {
            sqlWhere += ` And G002.IDG002 =  ` + req.body.G002_IDG002.id;
        }

        if (req.body.G005_IDG005 != null) {
            if (req.body.G005_IDG005.hasOwnProperty('in')) {
                if (req.body.G005_IDG005.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G005.IDG005 In  (' + req.body.G005_IDG005.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G005.IDG005 In  (' + req.body.G005_IDG005.in.join() + ')';
                }
            }
        }

        if (req.body.G005_TPPESSOA != null) {
            sqlWhere += ` And G005.TPPESSOA = '` + req.body.G005_TPPESSOA + `'`;
        }

        if (req.body.G051_CDCTRC != null) {
            let arrayCtrc = [];
            let tamanhoCtrc = req.body.G051_CDCTRC.in.length;

            for (let i = 0; i < tamanhoCtrc; i++) {
                arrayCtrc[i] = req.body.G051_CDCTRC.in[i];
            }

            sqlWhere += ' And G051.CDCTRC in (' + arrayCtrc + ')';
        }

        if (req.body.G061_CLASS != undefined && req.body.G061_CLASS != null && req.body.G061_CLASS != '') {
            if (req.body.G061_CLASS == 'P') {
                sqlWhere += ` And G061.NRNOTA > 8 `;
            } else if (req.body.G061_CLASS == 'N') {
                sqlWhere += ` And G061.NRNOTA > 6 And G061.NRNOTA < 9 `;
            } else {
                sqlWhere += ` And G061.NRNOTA < 7 `;
            }
        }

        if (req.body.G061_STAVALIA != null) {
            sqlWhere += ` And G061.STAVALIA = '` + req.body.G061_STAVALIA + `'`;
        }

        if (req.body.TPOPERAC != undefined && req.body.TPOPERAC != null && req.body.TPOPERAC != '') {
            if (req.body.TPOPERAC == 1) {
                sqlWhere += ` And G014.SN4PL <> 1 `;
            } else if (req.body.TPOPERAC == 2) {
                sqlWhere += ` And G014.SN4PL = 1 `;
            }
        }

        if (req.body.G022_SNSATISF != undefined && req.body.G022_SNSATISF != null && req.body.G022_SNSATISF != '') {
            if (req.body.G022_SNSATISF == 1) {
                sqlWhere += ` And G022CL.SNSATISF = 1 `;
            } else if (req.body.G022_SNSATISF == 0) {
                sqlWhere += ` And G022CL.SNSATISF = 0 `;
            }
        }

        let auxRelation = '';
        if ((req.body.QTDCONTAT != undefined && req.body.QTDCONTAT != null && req.body.QTDCONTAT != '') || 
            (req.body.SNNPSCON != undefined && req.body.SNNPSCON != null && req.body.SNNPSCON != '')) {

            let whereTpContatAux = '';
            let whereClientNPs = '';

            if (req.body.QTDCONTAT != undefined && req.body.QTDCONTAT != null && req.body.QTDCONTAT != '') {
                whereTpContatAux = ` AND G008X.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                sqlWhere += ` ${req.body.QTDCONTAT == 0 ? ` AND G020X.IDG005 IS NULL ` : ` AND G020X.QTDCONTAT >= ${req.body.QTDCONTAT} `} `;

                if (req.body.SNNPSCON != undefined && req.body.SNNPSCON != null && req.body.SNNPSCON != '') {
                    whereClientNPs = ' AND G007X.IDG006 = 28 ';
                }
            } else {
                sqlWhere += req.body.SNNPSCON == 1 ? ' AND G020X.QTDCONTAT > 0 ' : ' AND G020X.IDG005 IS NULL ';
                whereClientNPs = ' AND G007X.IDG006 = 28 ';
            }

            auxRelation = `
                LEFT JOIN 
                (SELECT G020X.IDG005, COUNT(DISTINCT G008X.DSCONTAT) AS QTDCONTAT
                    FROM G020 G020X
                        INNER JOIN G007 G007X ON G007X.IDG007 = G020X.IDG007 AND G007X.SNDELETE = 0 AND G007X.IDG006 <> 27
                        INNER JOIN G008 G008X ON G008X.IDG007 = G007X.IDG007 AND G008X.SNDELETE = 0
                    WHERE G020X.TPCONTAT = 'C'
                    ${whereClientNPs}
                    ${whereTpContatAux}
                    GROUP BY G020X.IDG005
                ) G020X ON G020X.IDG005 = G005.IDG005
            `;
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

        let sql = `      
            SELECT DISTINCT
                G061.IDG061,
                G061.NRNOTA NOTA,
                G061.DSCOMENT,
                G051.IDG051

            FROM G051 G051

                INNER JOIN G061 G061 ON (G061.IDG051 = G051.IDG051)

                INNER JOIN G005 G005 ON (G005.IDG005 = G051.IDG005DE)

                INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003) 

                INNER JOIN G002 G002 ON (G003.IDG002 = G002.IDG002)

                INNER JOIN G052 G052 ON (G052.IDG051 = G051.IDG051)
                
                INNER JOIN G043 G043 ON (G052.IDG043 = G043.IDG043)

                INNER JOIN G083 G083 On (G083.IDG043 = G043.IDG043)

                ${auxRelation}

                INNER JOIN G022 G022 ON (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)

                INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)

                INNER JOIN G014 G014 ON (G014.IDG014 = G022.IDG014)
                
                LEFT JOIN G049 G049 ON (G049.IDG043 = G043.IDG043 )

                LEFT JOIN G048 G048 ON (G048.IDG048 = G049.IDG048)
                
                LEFT JOIN G046 G046 ON (G046.IDG046 = G048.IDG046)
                
				LEFT JOIN G024 G024 ON (G024.IDG024 = G046.IDG024 AND G024.SNDELETE = 0)
        
                WHERE G051.SNDELETE = 0
                AND G061.DTAVALIA IS NOT NULL
                AND G061.NRNOTA IS NOT NULL
                And G043.DTENTREG IS NOT NULL
                ${sqlWhere}
                ${sqlWhereAcl}`;


        try {
            let result = await con.execute({
                sql,
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


    api.getEntregas = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        if (req.body.G051_DTEMICTR != null) {
            sqlWhere += ` And G051.DTEMICTR Between To_Date('` + req.body.G051_DTEMICTR[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G051_DTEMICTR[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        if (req.body.G061_DTAVALIA != null) {
            sqlWhere += ` And G061.DTAVALIA Between To_Date('` + req.body.G061_DTAVALIA[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G061_DTAVALIA[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        if (req.body.G002_IDG002 != null) {
            sqlWhere += ` And G002.IDG002 =  ` + req.body.G002_IDG002.id;
        }

        if (req.body.G005_IDG005 != null) {
            if (req.body.G005_IDG005.hasOwnProperty('in')) {
                if (req.body.G005_IDG005.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G005.IDG005 In  (' + req.body.G005_IDG005.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G005.IDG005 In  (' + req.body.G005_IDG005.in.join() + ')';
                }
            }
        }

        if (req.body.G005_TPPESSOA != null) {
            sqlWhere += ` And G005.TPPESSOA = '` + req.body.G005_TPPESSOA + `'`;
        }

        if (req.body.G051_CDCTRC != null) {
            let arrayCtrc = [];
            let tamanhoCtrc = req.body.G051_CDCTRC.in.length;

            for (let i = 0; i < tamanhoCtrc; i++) {
                arrayCtrc[i] = req.body.G051_CDCTRC.in[i];
            }

            sqlWhere += ' And G051.CDCTRC in (' + arrayCtrc + ')';
        }

        if (req.body.G061_CLASS != undefined && req.body.G061_CLASS != null && req.body.G061_CLASS != '') {
            if (req.body.G061_CLASS == 'P') {
                sqlWhere += ` And G061.NRNOTA > 8 `;
            } else if (req.body.G061_CLASS == 'N') {
                sqlWhere += ` And G061.NRNOTA > 6 And G061.NRNOTA < 9 `;
            } else {
                sqlWhere += ` And G061.NRNOTA < 7 `;
            }
        }

        if (req.body.G061_STAVALIA != null) {
            sqlWhere += ` And G061.STAVALIA = '` + req.body.G061_STAVALIA + `'`;
        }

        if (req.body.TPOPERAC != undefined && req.body.TPOPERAC != null && req.body.TPOPERAC != '') {
            if (req.body.TPOPERAC == 1) {
                sqlWhere += ` And G014.SN4PL <> 1 `;
            } else if (req.body.TPOPERAC == 2) {
                sqlWhere += ` And G014.SN4PL = 1 `;
            }
        }

        if (req.body.G022_SNSATISF != undefined && req.body.G022_SNSATISF != null && req.body.G022_SNSATISF != '') {
            if (req.body.G022_SNSATISF == 1) {
                sqlWhere += ` And G022CL.SNSATISF = 1 `;
            } else if (req.body.G022_SNSATISF == 0) {
                sqlWhere += ` And G022CL.SNSATISF = 0 `;
            }
        }

        let auxRelation = '';
        if ((req.body.QTDCONTAT != undefined && req.body.QTDCONTAT != null && req.body.QTDCONTAT != '') || 
            (req.body.SNNPSCON != undefined && req.body.SNNPSCON != null && req.body.SNNPSCON != '')) {

            let whereTpContatAux = '';
            let whereClientNPs = '';

            if (req.body.QTDCONTAT != undefined && req.body.QTDCONTAT != null && req.body.QTDCONTAT != '') {
                whereTpContatAux = ` AND G008X.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                sqlWhere += ` ${req.body.QTDCONTAT == 0 ? ` AND G020X.IDG005 IS NULL ` : ` AND G020X.QTDCONTAT >= ${req.body.QTDCONTAT} `} `;

                if (req.body.SNNPSCON != undefined && req.body.SNNPSCON != null && req.body.SNNPSCON != '') {
                    whereClientNPs = ' AND G007X.IDG006 = 28 ';
                }
            } else {
                sqlWhere += req.body.SNNPSCON == 1 ? ' AND G020X.QTDCONTAT > 0 ' : ' AND G020X.IDG005 IS NULL ';
                whereClientNPs = ' AND G007X.IDG006 = 28 ';
            }

            auxRelation = `
                LEFT JOIN 
                (SELECT G020X.IDG005, COUNT(DISTINCT G008X.DSCONTAT) AS QTDCONTAT
                    FROM G020 G020X
                        INNER JOIN G007 G007X ON G007X.IDG007 = G020X.IDG007 AND G007X.SNDELETE = 0 AND G007X.IDG006 <> 27
                        INNER JOIN G008 G008X ON G008X.IDG007 = G007X.IDG007 AND G008X.SNDELETE = 0
                    WHERE G020X.TPCONTAT = 'C'
                    ${whereClientNPs}
                    ${whereTpContatAux}
                    GROUP BY G020X.IDG005
                ) G020X ON G020X.IDG005 = G005.IDG005
            `;
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

        let sql = `      
            SELECT 
                COUNT(DISTINCT G051.IDG051) AS ENTREGAS

            FROM G043 G043

                INNER JOIN G052 G052 ON (G052.IDG043 = G043.IDG043)
                
                INNER JOIN G051 G051 ON (G052.IDG051 = G051.IDG051)

                INNER JOIN G005 G005 ON (G005.IDG005 = G051.IDG005DE)

                INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003) 

                INNER JOIN G002 G002 ON (G003.IDG002 = G002.IDG002)

                ${auxRelation}

                LEFT JOIN G061 G061 ON (G061.IDG051 = G051.IDG051)
                
                INNER JOIN G022 G022 ON (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)

                INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)

                INNER JOIN G014 G014 ON (G014.IDG014 = G022.IDG014)
                
                LEFT JOIN G049 G049 ON (G049.IDG043 = G043.IDG043 )

                LEFT JOIN G048 G048 ON (G048.IDG048 = G049.IDG048)
                
                LEFT JOIN G046 G046 ON (G046.IDG046 = G048.IDG046)
                
				LEFT JOIN G024 G024 ON (G024.IDG024 = G046.IDG024 AND G024.SNDELETE = 0)
            
                WHERE G051.SNDELETE = 0
                AND G043.SNDELETE = 0
                AND G051.TPTRANSP = 'V'
                AND G043.DTENTREG IS NOT NULL
                ${sqlWhere}
                ${sqlWhereAcl}`;


        try {
            let result = await con.execute({
                sql,
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


    api.npsPorFilial = async function (req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);

        let sqlWhere = '';

        if (req.body.G051_DTEMICTR != null) {
            sqlWhere += ` And G051.DTEMICTR Between To_Date('` + req.body.G051_DTEMICTR[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G051_DTEMICTR[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        if (req.body.G061_DTAVALIA != null) {
            sqlWhere += ` And G061.DTAVALIA Between To_Date('` + req.body.G061_DTAVALIA[0] + `','DD/MM/YYYY HH24:MI') AND To_Date('` + req.body.G061_DTAVALIA[1] + `','DD/MM/YYYY HH24:MI')`;
        }

        if (req.body.G002_IDG002 != null) {
            sqlWhere += ` And G002.IDG002 =  ` + req.body.G002_IDG002.id;
        }

        if (req.body.G005_IDG005 != null) {
            if (req.body.G005_IDG005.hasOwnProperty('in')) {
                if (req.body.G005_IDG005.in[0].hasOwnProperty('id')) {
                    sqlWhere += ' And G005.IDG005 In  (' + req.body.G005_IDG005.in.map(e => e.id).join() + ')';
                } else {
                    sqlWhere += ' And G005.IDG005 In  (' + req.body.G005_IDG005.in.join() + ')';
                }
            }
        }

        if (req.body.G005_TPPESSOA != null) {
            sqlWhere += ` And G005.TPPESSOA = '` + req.body.G005_TPPESSOA + `'`;
        }

        if (req.body.G051_CDCTRC != null) {
            let arrayCtrc = [];
            let tamanhoCtrc = req.body.G051_CDCTRC.in.length;

            for (let i = 0; i < tamanhoCtrc; i++) {
                arrayCtrc[i] = req.body.G051_CDCTRC.in[i];
            }

            sqlWhere += ' And G051.CDCTRC in (' + arrayCtrc + ')';
        }

        if (req.body.G061_CLASS != undefined && req.body.G061_CLASS != null && req.body.G061_CLASS != '') {
            if (req.body.G061_CLASS == 'P') {
                sqlWhere += ` And G061.NRNOTA > 8 `;
            } else if (req.body.G061_CLASS == 'N') {
                sqlWhere += ` And G061.NRNOTA > 6 And G061.NRNOTA < 9 `;
            } else {
                sqlWhere += ` And G061.NRNOTA < 7 `;
            }
        }

        if (req.body.G061_STAVALIA != null) {
            sqlWhere += ` And G061.STAVALIA = '` + req.body.G061_STAVALIA + `'`;
        }

        if (req.body.TPOPERAC != undefined && req.body.TPOPERAC != null && req.body.TPOPERAC != '') {
            if (req.body.TPOPERAC == 1) {
                sqlWhere += ` And G014.SN4PL <> 1 `;
            } else if (req.body.TPOPERAC == 2) {
                sqlWhere += ` And G014.SN4PL = 1 `;
            }
        }

        if (req.body.G022_SNSATISF != undefined && req.body.G022_SNSATISF != null && req.body.G022_SNSATISF != '') {
            if (req.body.G022_SNSATISF == 1) {
                sqlWhere += ` And G022CL.SNSATISF = 1 `;
            } else if (req.body.G022_SNSATISF == 0) {
                sqlWhere += ` And G022CL.SNSATISF = 0 `;
            }
        }

        let auxRelation = '';
        if ((req.body.QTDCONTAT != undefined && req.body.QTDCONTAT != null && req.body.QTDCONTAT != '') || 
            (req.body.SNNPSCON != undefined && req.body.SNNPSCON != null && req.body.SNNPSCON != '')) {

            let whereTpContatAux = '';
            let whereClientNPs = '';

            if (req.body.QTDCONTAT != undefined && req.body.QTDCONTAT != null && req.body.QTDCONTAT != '') {
                whereTpContatAux = ` AND G008X.TPCONTAT = '${req.body['parameter[G008_TPCONTAT]']}' `;
                sqlWhere += ` ${req.body.QTDCONTAT == 0 ? ` AND G020X.IDG005 IS NULL ` : ` AND G020X.QTDCONTAT >= ${req.body.QTDCONTAT} `} `;

                if (req.body.SNNPSCON != undefined && req.body.SNNPSCON != null && req.body.SNNPSCON != '') {
                    whereClientNPs = ' AND G007X.IDG006 = 28 ';
                }
            } else {
                sqlWhere += req.body.SNNPSCON == 1 ? ' AND G020X.QTDCONTAT > 0 ' : ' AND G020X.IDG005 IS NULL ';
                whereClientNPs = ' AND G007X.IDG006 = 28 ';
            }

            auxRelation = `
                LEFT JOIN 
                (SELECT G020X.IDG005, COUNT(DISTINCT G008X.DSCONTAT) AS QTDCONTAT
                    FROM G020 G020X
                        INNER JOIN G007 G007X ON G007X.IDG007 = G020X.IDG007 AND G007X.SNDELETE = 0 AND G007X.IDG006 <> 27
                        INNER JOIN G008 G008X ON G008X.IDG007 = G007X.IDG007 AND G008X.SNDELETE = 0
                    WHERE G020X.TPCONTAT = 'C'
                    ${whereClientNPs}
                    ${whereTpContatAux}
                    GROUP BY G020X.IDG005
                ) G020X ON G020X.IDG005 = G005.IDG005
            `;
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

        let sql = `
        SELECT DISTINCT
        Y.NMTRANSP,
        Y.TOTAL,
        Y.PROMOTORES,
        Y.NEUTROS,
        Y.DETRATORES,
        COUNT(DISTINCT G051.IDG051) AS ENTREGAS FROM (
        
        SELECT
            X.NMTRANSP,
            X.IDG024,
            COUNT(X.IDG061) AS TOTAL,
            COUNT(CASE WHEN X.NRNOTA > 8 THEN 1 END) AS PROMOTORES,
            COUNT(CASE WHEN (X.NRNOTA = 7 OR X.NRNOTA = 8) THEN 1 END) AS NEUTROS,
            COUNT(CASE WHEN X.NRNOTA < 7 THEN 1 END) AS DETRATORES
        FROM 
            (SELECT DISTINCT
                G061.IDG061,
                G061.NRNOTA,
                G024CTE.NMTRANSP,
                G024CTE.IDG024
            FROM G051 G051

                INNER JOIN G061 G061 ON (G061.IDG051 = G051.IDG051)

                INNER JOIN G005 G005 ON (G005.IDG005 = G051.IDG005DE)

                INNER JOIN G003 G003 ON (G003.IDG003 = G005.IDG003) 

                INNER JOIN G002 G002 ON (G003.IDG002 = G002.IDG002)

                INNER JOIN G052 G052 ON (G052.IDG051 = G051.IDG051)
                
                INNER JOIN G043 G043 ON (G052.IDG043 = G043.IDG043)
                
                INNER JOIN G024 G024CTE ON (G051.IDG024 = G024CTE.IDG024 AND G024CTE.IDG023 = 2)
                
                ${auxRelation}

                INNER JOIN G022 G022 ON (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)

                INNER JOIN G022 G022CL ON (G022CL.IDG005 = G051.IDG005DE AND NVL(G022CL.SNINDUST,0) = 0 AND G022.IDG014 = G022CL.IDG014 AND G022CL.SNDELETE = 0)

                INNER JOIN G014 G014 ON (G014.IDG014 = G022.IDG014)
                
                LEFT JOIN G049 G049 ON (G049.IDG043 = G043.IDG043 )

                LEFT JOIN G048 G048 ON (G048.IDG048 = G049.IDG048)
                
                LEFT JOIN G046 G046 ON (G046.IDG046 = G048.IDG046)
                
				LEFT JOIN G024 G024 ON (G024.IDG024 = G046.IDG024 AND G024.SNDELETE = 0)

            WHERE G051.SNDELETE = 0
                AND G061.DTAVALIA IS NOT NULL
                AND G061.NRNOTA IS NOT NULL
                AND G043.DTENTREG IS NOT NULL
                 ${sqlWhere}
                 ${sqlWhereAcl}) X
                
            GROUP BY X.NMTRANSP, X.IDG024) Y 
        
            INNER JOIN G051 G051 ON G051.IDG024 = Y.IDG024

            INNER JOIN G061 G061 ON (G061.IDG051 = G051.IDG051)
        
            INNER JOIN G052 G052 ON G052.IDG051 = G051.IDG051
        
            INNER JOIN G043 G043 ON G052.IDG043 = G043.IDG043

            INNER JOIN G005 G005 ON (G005.IDG005 = G051.IDG005DE)
            
            LEFT JOIN G022 G022 ON (G022.IdG005 = NVL(G051.IdG005CO, G043.IdG005RE) AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
    
            LEFT JOIN G014 G014 ON (G014.IDG014 = G022.IDG014)
            
            LEFT JOIN G049 G049 ON (G049.IDG043 = G043.IDG043)
    
            LEFT JOIN G048 G048 ON (G048.IDG048 = G049.IDG048)
            
            LEFT JOIN G046 G046 ON (G046.IDG046 = G048.IDG046)
            
            LEFT JOIN G024 G024 ON (G024.IDG024 = G046.IDG024 AND G024.SNDELETE = 0)

            ${auxRelation}
            
            WHERE G051.SNDELETE = 0
                AND G043.SNDELETE = 0
                AND G043.DTENTREG IS NOT NULL
                AND G051.TPTRANSP = 'V'
                AND G051.IDG024 = Y.IDG024
                ${sqlWhere}
                ${sqlWhereAcl}
                
            GROUP BY Y.NMTRANSP,
                    Y.TOTAL,
                    Y.PROMOTORES,
                    Y.NEUTROS,
                    Y.DETRATORES`;


        try {
            let result = await con.execute({
                sql,
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

    api.getRelatorioAg = async function (req, res, next) {
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

        var [sqlWhereX, sqlOrderX, sqlPaginateX, bindValuesX] = utils.retWherePagOrd(req.body, 'X', true);

        var[sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        sqlWhere = sqlWhere + ` AND G043.TPDELIVE = 5 AND G043.CDDELIVE IS NOT NULL `;
        sqlOrderX = sqlOrderX + `, X.nrordite asc `;

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
                sql: `SELECT * FROM (SELECT DISTINCT
                    NVL(
                    (select listagg(y.nrnota, ',')
                    WITHIN
                    GROUP(ORDER BY y.nrnota) from g083 y where y.idg043 = g043.idg043), '0') as nrnota,
                        G051.VRTOTFRE AS VRTOTFRE,
                        case when g051.idg051 is not null then
                        TRIM((G051.VRTOTFRE /
                             (SELECT SUM(G4.PSBRUTO)
                                FROM G051 G1
                               INNER JOIN G052 G2
                                  ON G2.IDG051 = G1.IDG051
                               INNER JOIN G043 G3
                                  ON G3.IDG043 = G2.IDG043
                               INNER JOIN G045 G4
                                  ON G4.IDG043 = G3.IDG043
                               WHERE G3.SNDELETE = 0
                                 AND G1.IDG051 = G051.IDG051)) * (SELECT SUM(X.PSBRUTO)
                                 FROM G045 X
                                WHERE X.IDG043 = G043.IDG043
                                  AND X.NRORDITE = G045.NRORDITE))
                             ELSE null END AS VRFRETE,
                        G050.QTPRODUT,
                        G045.DSPRODUT,
                        G045.nrordite,
                        G043.IDG043,
                        G043.CDDELIVE,
                        G043.IDG005RE,
                        G043.TPDELIVE, /* Tipo da Nota */
                        G043.IDG005DE,
                        G043.STETAPA,
                        TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') AS DTDELIVE,
                        NVL(TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY'), 'n.i.') AS DTENTCON,
                        NVL(TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY'), 'n.i.') AS DTENTREG,
                        NVL(TO_CHAR(G043.DTBLOQUE, 'DD/MM/YYYY'), 'n.i.') AS DTBLOQUE,
                        NVL(TO_CHAR(G043.DTDESBLO, 'DD/MM/YYYY'), 'n.i.') AS DTDESBLO,
                        G043.SNAG, /* Indicador de AG */
                        NVL(TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY'), 'n.i.') AS DTLANCTO,
            
                        G051.IDG051,
                        NVL(G051.CDCTRC, '0') AS CDCTRC,
                        NVL(TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY'), 'n.i.') AS DTEMICTR,
                        NVL(TO_CHAR(G051.DTAGENDA, 'DD/MM/YYYY'), 'n.i.') AS DTAGENDA, /* Data Agendada */
                        NVL(TO_CHAR(G051.DTCOMBIN, 'DD/MM/YYYY'), 'n.i.') AS DTCOMBIN, /* Data Combinada */
                        NVL(TO_CHAR(G051.DTROTERI, 'DD/MM/YYYY'), 'n.i.') AS DTROTERI, /* Data Roteirizada */
                        G051.DTENTPLA,
                        G051.DTCALDEP,
                        G051.IDG005CO,
                        G014.IDG014,
                    
                        G005RE.NMCLIENT   AS NMCLIENTRE,
                        G005RE.RSCLIENT   AS RSCLIENTRE,
                        G005RE.CJCLIENT   AS CJCLIENTRE,
                        G003RE.NMCIDADE   AS NMCIDADERE,
                        G002RE.NMESTADO   AS NMESTADORE,
                        G005DE.NMCLIENT   AS NMCLIENTDE,
                        G005DE.RSCLIENT   AS RSCLIENTDE,
                        G005DE.CJCLIENT   AS CJCLIENTDE,
                        G003DE.NMCIDADE   AS NMCIDADEDE,
                        G002DE.NMESTADO   AS NMESTADODE,
                        G005CO.NMCLIENT   AS NMCLIENTCO,
            
                        NVL(G030.DSTIPVEI,'n.i.') AS DSTIPVEI,
                        
                        TO_CHAR(FN_DATA_SLA(G051.IDG051), 'DD/MM/YYYY') AS DTPREENT, /* Data de Previsão de Entrega */
                        
                        CASE
                            WHEN G051.TPTRANSP = 'C' THEN 'Complemento'
                            WHEN G051.TPTRANSP = 'D' THEN 'Devolução'
                            WHEN G051.TPTRANSP = 'O' THEN 'Outros'
                            WHEN G051.TPTRANSP = 'S' THEN 'Substituto'
                            WHEN G051.TPTRANSP = 'T' THEN 'Transferência'
                            WHEN G051.TPTRANSP = 'V' THEN 'Venda'
                            WHEN G051.TPTRANSP = 'I' THEN 'Industrialização'
                            ELSE 'n.i.'
                        END AS TPTRANSP, /* Tipo de Operação */

                        NVL2(G024.NMTRANSP, G024.NMTRANSP || ' [' || g024.idg024   || '-' || g024.idlogos   || ']', null) AS NMTRANSP_CARGA,
                    
                        TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') AS DTSAICAR, /*data de despacho*/
                        TO_CHAR(G046.DTCOLORI, 'DD/MM/YYYY') AS DTCOLORI, /*data previsão de despacho*/
                        NVL(G046.IDG046,0) AS IDG046,
                        NVL(TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY'), 'n.i.') AS DTCARGA, /* Data Roteirizada */
            
                        CASE
                        WHEN G046.SNCARPAR = 'S' THEN 'Fracionada'
                        ELSE 'Fechada'
                        END AS SNCARPAR,
                        NVL(G046.QTDISPER,0) AS QTDISPER,
                        G046.STCARGA,
                        NVL(G048.NRSEQETA,0) AS NRSEQETA,
                        G048.IDG048,
            
                        (SELECT 
                        A002.DSTPMOTI
                        FROM A002 A002
                            Join A015 A015 On (A002.IDA002 = A015.IDA002 AND A015.IDI015 = G051.IDI015)
                            
                            WHERE A002.IDA008 = 1 
                            
                            FETCH FIRST ROW ONLY
                        ) AS DSTPMOTI,
                        
                        COUNT(G043.CDDELIVE) OVER() AS COUNT_LINHA
                    FROM
                        G043 G043
                        INNER JOIN G045 G045 ON ( G045.IDG043 = G043.IDG043 )
                        INNER JOIN G010 G010 ON ( G010.IDG010 = G045.IDG010 )
                        INNER JOIN G050 G050 ON ( G050.IDG045 = G045.IDG045 )
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

                        ` + sqlWhere + wherePrevisao + sqlWhereAcl + `
                    GROUP BY
                        G050.QTPRODUT,
                        G045.DSPRODUT,
                        G045.nrordite,
                        G045.PSBRUTO,
                        
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
                        G043.STETAPA,

                        G083.NRNOTA,
                        
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

                        G024.NMTRANSP,
                        g024.idg024, 
                        g024.idlogos,

                        G046.DTSAICAR,
                        G046.DTCOLORI,
                        G046.IDG046,
                        G046.STCARGA,
                        G046.SNCARPAR,
                        G046.QTDISPER,
                        G046.DTCARGA,

                        G048.NRSEQETA,
                        G048.IDG048,

                        G030.DSTIPVEI,


                        G014.IDG014)X

                    ` +
                            sqlOrderX +
                            sqlPaginate,
                            param: bindValues
            })
            .then((result) => {
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


    return api;
};