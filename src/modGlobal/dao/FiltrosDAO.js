/**
 * @module modGlobal/dao/FiltrosDAO
 *
 * @requires module:modGlobal/controllers/FiltrosController
 * @requires module:utils/FuncoesObjDB
 * @requires module:utils/DataAtual
 */
module.exports = function(app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var acl = app.src.modIntegrador.controllers.FiltrosController;


    var db = require(process.cwd() + '/config/database');

    /* TABELA DINAMICA G097 */
    api.buscarTabelaDinamica = async function(req, res, next) {

        /* ########## LEGENDA IDGRUPO ##########
         *
         * 1 - Tipo de Operação             (HC);
         * 2 - Tipo de Tolerância           (HC);
         * 3 - Tipo de Pesagem              (HC);
         * 4 - Tipo de Fluxo Veiculo        (HC);
         *
         */

        var IDGRUPO = req.body.IDGRUPO;
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        }

        if (strValue) {
            req.sql = `SELECT IDKEY   AS ID,
                        DSVALUE AS TEXT
                  FROM G097
                  WHERE IDGRUPO = ${IDGRUPO}
                  AND SNDELETE  = 0
                  AND UPPER(DSVALUE) LIKE UPPER('%${strValue}%')
                  ORDER BY IDKEY ASC`;
        } else {
            req.sql = `SELECT IDKEY   AS ID,
                        DSVALUE AS TEXT
                  FROM G097
                  WHERE IDGRUPO = ${IDGRUPO}
                  AND SNDELETE  = 0
                  ORDER BY IDKEY ASC`;
        }

        return await db.execute({
                sql: req.sql,
                param: [],
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    //função fora do default pois searchcombobox ñ suporta
    api.buscarArmazem = async function(req, res, next) {
        if (req.body.parameter != undefined && req.body.parameter.length < 2) {
            return;
        }

        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        var acl1 = '';
        var sqlAux = '';

        //# Não sabemos quem utiliza esse filtro. Portanto foi implementado acl apenas no transportation
        if (req.headers.dsmodulo != undefined && (req.headers.dsmodulo.toLowerCase() == 'transportation' /*|| req.headers.dsmodulo.toLowerCase() == 'hora-certa'*/ )) {
            
            if(req.body.parameterDep.CARGA){
                sqlAux = `
                JOIN G084 G084 ON G084.IDG028 = g028.IDG028 AND g084.idg024 IN (${req.body.parameterDep.CARGA})
                `;
            }
            
            acl1 = await acl.montar({
                ids001: user,
                dsmodulo: req.headers.dsmodulo,
                nmtabela: [{
                    G028: 'G028'
                }],
                //dioperad: ' ',
                esoperad: ' And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            }

        } else {
            acl1 = '';
        }

        return await db.execute({
                sql: `Select
                G028.NMARMAZE text,
                G028.IdG028 ID,
                G028.QTMINJAN
              From G028 G028
              ${sqlAux}
              Where
              G028.STCADAST = 'A' and G028.SnDelete = 0 And ROWNUM <= 50 And (Upper(G028.NMARMAZE) like Upper(:param))
                ${acl1}
              Order by text asc`,
                param: {
                    "param": "%" + req.body.parameter + "%"
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarTipoCarga = async function(req, res, next) {

        var strValue = req.body.parameter;
        var strWhere = (req.body.parameterDep.IDG028) ? req.body.parameterDep.IDG028 : false;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        if (strWhere) {
            req.sql = `Select H002.DsTipCar as text,
                        H002.Idh002 as id
                   From H002 H002
                   Join H025 H025 On H025.Idh002 = H002.Idh002
                  Where H002.SnDelete = 0
                    And H002.StCadast = 'A'
                    And Upper(H002.DsTipCar) Like Upper('%${strValue}%')
                    And H025.Idg028 In (${strWhere})
                    And H025.SnDelete = 0
               Order By id`;
        } else {
            req.sql = `Select H002.DsTipCar as text,
                        H002.Idh002 as id
                   From H002 H002
                  Where SnDelete = 0
                    And StCadast = 'A'
               Order By id`;
        }

        return await db.execute({
                sql: req.sql,
                param: [],
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarTransportadora = async function(req, res, next) {


        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        var acl1 = '';
        //# Não sabemos quem utiliza esse filtro. Portanto foi implementado acl apenas no transportation
        if (req.headers.dsmodulo != undefined && (req.headers.dsmodulo.toLowerCase() == 'transportation' /*|| req.headers.dsmodulo.toLowerCase() == 'hora-certa'*/ )) {

            acl1 = await acl.montar({
                ids001: user,
                dsmodulo: req.headers.dsmodulo,
                nmtabela: [{
                    G024: 'G024'
                }],
                //dioperad: ' ',
                esoperad: ' And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            } else {
                acl1 = ' join g024 g024x on g024x.idg024 = G024.idg024 ' + acl1;
            }

        } else {
            acl1 = '';
        }

        return await utils.searchComboBox("G024.IdG024",
            "G024.NMTRANSP || ' [' || FN_FORMAT_CNPJ_CPF(G024.CJTRANSP) || ' - ' || G024.IETRANSP || ' - ' || G024.IDLOGOS ||']'",
            "G024", ["G024.NMTRANSP", "G024.RSTRANSP", "G024.CJTRANSP", "G024.IETRANSP", "G024.IDLOGOS", "G024.NRLATITU", "G024.NRLONGIT"], req.body, true, undefined, false, acl1);
    };

    api.buscarFeriados = async function(req, res, next) {
        return await utils.searchComboBox("G054.IdG054",
            "G054.DSFERIAD",
            "G054", ["G054.DSFERIAD"], req.body);
    };

    api.buscarCampanha = async function(req, res, next) {
        return await utils.searchComboBox("G090.IdG090",
            "G090.DSCAMPAN",
            "G090", ["G090.DSCAMPAN"], req.body);
    };

    api.buscarTipoApontamento = async function(req, res, next) {
        return await utils.searchComboBox("G092.IdG092",
            "G092.DSAPONTA",
            "G092", ["G092.DSAPONTA", "G092.VRPONTUA"], req.body);
    };

    api.buscarGrupoTransportadora = async function(req, res, next) {
        return await utils.searchComboBox("G023.IdG023",
            "G023.DSGRUTRA",
            "G023", ["G023.DSGRUTRA"], req.body);
    };

    api.buscarTipoVeiculo = async function(req, res, next) {

        let snOferece = 'I';

        if (req.body.parameterDep.SIMNAOOFERECE != undefined &&
            req.body.parameterDep.SIMNAOOFERECE != null) {

            snOferece = req.body.parameterDep.SIMNAOOFERECE;
            //# A - Sim
            //# I - Não

        }

        if (snOferece == 'A') {

            var strValue = req.body.parameter;

            if (strValue) {
                strValue = strValue.toUpperCase();
            } else {
                return utils.array_change_key_case({});
            }

            var sql = `
              SELECT G030.IDG030 		AS 	id 
                  , G030.IDG030 		AS 	idg030
                  , G030.PCPESMIN  	AS 	pcpesmin
                  , G030.QTCAPPES 	AS	qtcappes
                  , G030.QTCAPVOL		AS	qtcapvol
                  , G030.DSTIPVEI || ' [' || G030.IDG030 || '] '	AS	text
                  , NVL(G030.NRCARRET,0)   AS 	nrcarret		
              FROM G030
             INNER JOIN I011 
                ON I011.IDG030 = G030.IDG030
             WHERE I011.SNDELETE = 0               
               AND G030.SNDELETE = 0
                AND Upper(G030.DSTIPVEI) LIKE '%${strValue}%'
              ORDER BY G030.QTCAPPES ASC
            `
            return await db.execute({
                    sql,
                    param: [],
                })
                .then((result) => {

                    return utils.array_change_key_case(result);

                })
                .catch((err) => {
                    throw err;
                });



        } else {
            delete req.body.parameterDep;
            return await utils.searchComboBox("G030.IDG030",
                "G030.DSTIPVEI",
                "G030", ["G030.DSTIPVEI", "G030.QTCAPPES", "G030.QTCAPVOL", "G030.PCPESMIN", "G030.PCMIN4PL", "G030.IDG030", "G030.NRCARRET"], req.body);
        }

    };

    api.buscarTipoVeiculoNeolog = async function(req, res, next) {
        return await utils.searchComboBox("G030.IDG030",
            "G030.IDVEIOTI",
            "G030", ["G030.IDVEIOTI"], req.body);
    };


    api.buscarTipoVeiculoSyngenta = async function(req, res, next) {
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }
        var sqlComplement = '';

        /*QUANDO CADASTRAR OS VEÍCULOS DE OUTRAS OPERAÇÕES APLICAR ACL E RETIRAR ESSE IF*/
        //if(parseInt(req.params.id) == 5){sqlComplement = `AND I011.IDG014 = 5`};

        var sql = `
            SELECT 	  G030.IDG030 		AS 	id 
                , G030.IDG030 		AS 	idg030
                , G030.PCPESMIN  	AS 	pcpesmin
                , G030.QTCAPPES 	AS	qtcappes
                , G030.QTCAPVOL		AS	qtcapvol
                , G030.DSTIPVEI 	AS	text	
                , NVL(G030.NRCARRET,0)   AS 	nrcarret	
            FROM G030
            INNER JOIN I011 
              ON I011.IDG030 = G030.IDG030
            WHERE I011.SNDELETE = 0
              AND G030.SNDELETE = 0
              AND G030.DSTIPVEI LIKE '${strValue}'
            ${sqlComplement}
          `
        return await db.execute({
                sql,
                param: [],
            })
            .then((result) => {

                return utils.array_change_key_case(result);

            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarRegra = async function(req, res, next) {
        return await utils.searchComboBox("O008.IDO008",
            "O008.DSREGRA",
            "O008", ["O008.DSREGRA"], req.body);
    };

    api.buscarOtimizador = async function(req, res, next) {
        return await utils.searchComboBox("O006.IDO006",
            "O006.NMOTIMIZ",
            "O006", ["O006.NMOTIMIZ"], req.body);
    };

    api.buscarMtRecusa = async function(req, res, next) {
        return await utils.searchComboBox("O004.IDO004",
            "O004.DSMOTIVO",
            "O004", ["O004.DSMOTIVO"], req.body);
    };

    api.buscarCargas = async function(req, res, next) {
        return await utils.searchComboBox("G046.IDG046",
            "G046.IDG046",
            "G046", ["G046.DSCARGA", "G046.CDVIAOTI", "G046.TPCARGA", "G046.STCARGA", "G046.PSCARGA", "G046.QTVOLCAR", "G046.QTDISPER", "G046.VRPOROCU", "G046.SNURGENT", "G046.SNCARPAR", "G046.SNESCOLT", "G046.DTCOLATU", "G046.DTCARGA", "G046.IDG028"], req.body);
    };

    api.buscarCluster = async function(req, res, next) {
        return await utils.searchComboBox("T005.IDT005",
            "T005.DSCLUSTE || ' [' || T005.IDT005 || ']'",
            "T005", ["T005.DSCLUSTE"], req.body);
    };

    api.buscarMotorista = async function(req, res, next) {
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        let acl1 = '';
        acl1 = await acl.montar({
            ids001: req.headers.ids001,
            dsmodulo: req.headers.dsmodulo,
            nmtabela: [{
                G024: 'G024'
            }],
            esoperad: 'And'
        });

        return await db.execute({
                sql: `Select G031.NMMOTORI as text,
                     G031.IDG031 as ID,
                     G031.CJMOTORI as CPF,
                     G031.NRREGMOT as CNH
                From G031 G031
                Join G024 G024 On (G024.IdG024 = G031.IdG024)
               Where /*(Upper(NMMOTORI) like Upper('%` + strValue + `%') or
                      Upper(RGMOTORI) like Upper('%` + strValue + `%') or
                      Upper(RGMOTORI) like Upper('%` + strValue + `%') or
                      IECLIENT like Upper('%` + strValue + `%'))
                 And*/ G031.SnDelete = 0 And G024.SnDelete = 0  ` + acl1,
                param: [],
            })
            .then((result) => {

                return utils.array_change_key_case(result);

            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotoristaSemAcl = async function(req, res, next) {
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase().replace(/(\.|\-)/g, '');
        } else {
            return utils.array_change_key_case({});
        }

        return await db.execute({
                sql: `SELECT
                /*G031.NMMOTORI AS text,*/
                G031.NMMOTORI || ' - ' || REPLACE(REPLACE(G031.CJMOTORI,'-'),'.') || ' [' || G031.IDG031 || '-' || G031.NRMATRIC || ']' as text ,
                G031.IDG031 AS ID,
                G031.CJMOTORI AS CPF,
                G031.NRREGMOT AS CNH
              FROM
                G031 G031
              JOIN G024 G024 ON
                ( G024.IdG024 = G031.IdG024 )
              WHERE
                ( UPPER(NMMOTORI) LIKE UPPER('%${strValue}%')
                OR UPPER(RGMOTORI) LIKE UPPER('%${strValue}%')
                OR UPPER(REPLACE(REPLACE(CJMOTORI,'-'),'.')) LIKE UPPER('%${strValue}%'))
                -- OR IECLIENT LIKE UPPER( '%${strValue}%' ))
                AND G031.SnDelete = 0
                AND G024.SnDelete = 0`,
                param: [],
            })
            .then((result) => {

                return utils.array_change_key_case(result);

            })
            .catch((err) => {
                throw err;
            });
    };

    api.listarMotoristas = async function(req, res, next) {


        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        var acl1 = '';
        //# Não sabemos quem utiliza esse filtro. Portanto foi implementado acl apenas no transportation
        if (req.headers.dsmodulo != undefined && req.headers.dsmodulo.toLowerCase() == 'transportation') {

            acl1 = await acl.montar({
                ids001: user,
                dsmodulo: req.headers.dsmodulo,
                nmtabela: [{
                    G024: 'G024'
                }],
                //dioperad: ' ',
                esoperad: ' And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            } else {
                acl1 = ' join g024 g024 on g024.idg024 = G031.idg024 ' + acl1;
            }

        } else {
            acl1 = '';
        }

        return await utils.searchComboBox("G031.IDG031",
            "UPPER(G031.NMMOTORI) || ' [' || G031.IDG031 || '-' || G031.NRMATRIC || ']'",
            "G031", ["G031.NMMOTORI", "G031.CJMOTORI", "G031.NRREGMOT", "G031.IDG031", "G031.RGMOTORI"], req.body, true, undefined, false, acl1);
    };

    api.buscarSetores = async function(req, res, next) {
        return await utils.searchComboBox("G006.IdG006",
            "G006.DSSETOR",
            "G006", ["G006.DSSETOR"], req.body);
    };

    api.buscarCargos = async function(req, res, next) {
        return await utils.searchComboBox("G039.IdG039",
            "G039.DSCARGO",
            "G039", ["G039.DSCARGO"], req.body);
    };

    api.buscarTomador = async function (req, res, next) {
        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        var acl1 = '';
        if (req.headers.dsmodulo != undefined && req.headers.dsmodulo.toLowerCase() == 'monitoria') {

            acl1 = await acl.montar({
                ids001: user,
                dsmodulo: req.headers.dsmodulo,
                nmtabela: [{
                    G014: 'G014'
                }],
                //dioperad: ' ',
                esoperad: 'And'
            });

            if (typeof acl1 == 'undefined' || acl1 == "" || acl1 == " And 1=0") {
                acl1 = '';
            } else {
                acl1 = ` Join G022 G022 On (G022.IdG005 = G005.IdG005 AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                        Join G014 G014 On G014.IdG014 = G022.IdG014 ` + acl1;
            }

        } else {
            acl1 = '';
        }

        return await utils.searchComboBox("G005.IdG005",
            "G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']'",
            "G005", ["G005.NMCLIENT", "G005.RSCLIENT", "G005.CJCLIENT", "G005.IECLIENT"], req.body, true, undefined, false, acl1);
    };

    api.buscarVeiculo = async function(req, res, next) {
        return await utils.searchComboBox("G032.IDG032",
            "G032.NRFROTA",
            "G032", ["G032.NRFROTA"], req.body);
    };

    api.buscarMotivoCancelamento = async function(req, res, next) {
        return await utils.searchComboBox("T013.IDT013",
            "T013.DSMOTIVO",
            "T013", ["T013.DSMOTIVO"], req.body);
    };

    api.buscarMotivoCancelamento2 = async function(req, res, next) {
        let sql = `select
                      T013.IDT013	as ID,
                      T013.DSMOTIVO as Text
                 from T013 T013
                  And SNDELETE = 0 
                  And T013.DSMOTIVO Like :parameter`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter.toUpperCase() + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarUsuario = async function(req, res, next) {
        return await utils.searchComboBox("S001.IDS001",
            "S001.NMUSUARI || ' - (' || S001.IDS001 || ')' ",
            "S001", ["S001.NMUSUARI"], req.body);
    };


    api.buscarUsuarioByEmail = async function(req, res, next) {
        return await utils.searchComboBox("S001.DSEMALOG",
            "S001.DSEMALOG || ' - (' || S001.IDS001 || ')' ",
            "S001", ["S001.DSEMALOG"], req.body);
    };

    api.buscarCargosUsuario = async function(req, res, next) {
        let sql = `Select 
                    G097.IDG097 id,
                    G097.DSVALUE text
                    From G097 G097 
                    Where G097.SnDelete = 0 --and ROWNUM <= 50 
                    and Upper(G097.DSVALUE) like Upper(:parameter) 
                    and (G097.IDGRUPO) = 7  
                    Order by 1 asc`

        return await db.execute({
            sql,
            param: {
                parameter: '%' + req.body.parameter +'%'
            }
        })
        .then((result) => {
            return utils.array_change_key_case(result);
        })
        .catch((err) => {
            throw err;
        });
    };

    api.buscarGestorFrotaUsuario = async function(req, res, next) {
        let sql = `Select 
                    S001.IDS001 id,
                    S001.NMUSUARI text
                    From S001
                    Join G097
                        ON S001.IDG097PR = G097.IDG097
                    
                    Where G097.SnDelete = 0  --and ROWNUM <= 50 
                    and Upper(S001.NMUSUARI) like Upper(:parameter) 
                    and (G097.IDGRUPO) = 7  
                    AND G097.IDKEY = 2
                    Order by 1 asc`

        return await db.execute({
            sql,
            param: {
                parameter: '%' + req.body.parameter +'%'
            }
        })
        .then((result) => {
            return utils.array_change_key_case(result);
        })
        .catch((err) => {
            throw err;
        });
    };


    api.buscarRotasTela = async function(req, res, next) {
        let sql = `Select 
                    T001.IDT001 id,
                      T001.dspraca || ' ['||T001.IDT001|| ']' text
                    From T001
                    
                    
                    Where T001.SnDelete = 0  
                    and Upper(T001.dspraca || ' ['||T001.IDT001|| ']') like Upper(:parameter) 
                    Order by 1 asc`

        return await db.execute({
            sql,
            param: {
                parameter: '%' + req.body.parameter +'%'
            }
        })
        .then((result) => {
            return utils.array_change_key_case(result);
        })
        .catch((err) => {
            throw err;
        });
    };



    api.buscarRotas = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue && req.body.parameterDep.IDT005 && (req.body.parameterDep.IDG024 || req.body.parameterDep.IDG024_CARGA)) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        var sql = ` 
    SELECT
          T001.DSPRACA || ' [' || T001.IDT001 || ']'  as text,
          T001.IDT001 as id
     From T001 T001
    Where T001.IDT005 = ${(req.body.parameterDep.IDT005 ? req.body.parameterDep.IDT005 : 0)}
      And (Upper(T001.DSPRACA) Like Upper('%${strValue}%')
      or T001.IDT001 Like '%${strValue}%')
      And T001.IDG024 = ${(req.body.parameterDep.IDG024 ? req.body.parameterDep.IDG024 : (req.body.parameterDep.IDG024_CARGA ? req.body.parameterDep.IDG024_CARGA : 0))} Order by T001.DSPRACA asc`;

        return await db.execute({
                sql,
                param: {},
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });

    };


    api.buscarNivel = async function(req, res, next) {
        return await utils.searchComboBox("O011.IDO011",
            "O011.DSNIVEL",
            "O011", ["O011.DSNIVEL"], req.body);
    };

    api.buscarTempoStatus = async function(req, res, next) {
        return await utils.searchComboBox("H015.IDH015",
            "H015.DSCONFIG",
            "H015", ["H015.DSCONFIG"], req.body);
    };

    api.buscarPais = async function(req, res, next) {
        return await utils.searchComboBox("G001.IDG001",
            "G001.NmPais",
            "G001", ["G001.NmPais", "G001.IDG001"], req.body);
    };

    api.buscarCliente = async function(req, res, next) {
        if (req.body.showCDUF) {
            let sql = `
      Select Distinct G005.IDG005 as id,
        G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' || ' - ' || G003.NMCIDADE || '-' || G002.CDESTADO as text
              
      From G005 G005
      join G003 G003 
        On (G003.IDG003 = G005.IDG003) 
      Join G002 G002 
        On (G003.IDG002 = G002.IDG002)
      Where G005.SNDELETE = 0
      AND (Upper(G005.NMCLIENT) Like Upper(:parameter)
      or Upper(G005.RSCLIENT) Like Upper(:parameter)
      or Upper(G005.NMCLIENT) Like Upper(:parameter)
      or Upper(G005.CJCLIENT) Like Upper(:parameter)
      or (G005.IDG005) Like (:parameter)
      or (G005.IECLIENT) Like (:parameter))`;

            return await db.execute({
                    sql,
                    param: {
                        parameter: req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                })
                .catch((err) => {
                    throw err;
                });
        } else if (req.body.remetrans = true) {
            sql = `select G005.RSCLIENT, NMCLIENT, G005.IDG005 as id,
      case
          when G005.RSCLIENT <> G005.NMCLIENT
          then G005.RSCLIENT || '[' || G005.NMCLIENT || ']' || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'
          when G005.RSCLIENT = G005.NMCLIENT
          then G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'
          else G005.RSCLIENT || '[' || G005.NMCLIENT || ']' || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'
          end as text
          
          from g005 G005
          
          Where (Upper(G005.NMCLIENT) Like Upper(:parameter)
          or Upper(G005.RSCLIENT) Like Upper(:parameter)
          or Upper(G005.NMCLIENT) Like Upper(:parameter)
          or Upper(G005.CJCLIENT) Like Upper(:parameter)) Order by G005.RSCLIENT asc`;
            return await db.execute({
                    sql,
                    param: {
                        parameter: req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                })
                .catch((err) => {
                    throw err;
                });


        } else {
            return await utils.searchComboBox("G005.IDG005",
                "G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'",
                "G005", ["G005.NMCLIENT", "G005.IDG005"], req.body);
        }
    };

    api.buscarGrupoCliente = async function(req, res, next) {
        return await utils.searchComboBox("G040.IDG040",
            "G040.DSGRUCLI",
            "G040", ["G040.DSGRUCLI"], req.body);
    };

    api.buscarCidade = async function(req, res, next) {
        return await utils.searchComboBox("G003.IDG003",
            "G003.NmCidade",
            "G003", ["G003.NmCidade", "G003.IDG003"], req.body);
    };

    api.buscarEstado = async function(req, res, next) {
        return await utils.searchComboBox("G002.IdG002",
            "G002.CdEstado || ' - ' || G002.NmEstado",
            "G002", ["G002.NmEstado", "G002.CdEstado", "G002.CdIdenUF"], req.body);
    };

    api.buscarUFEstado = async function(req, res, next) {
        return await utils.searchComboBox("G002.IdG002",
            "G002.CdEstado",
            "G002", ["G002.NmEstado", "G002.CdEstado", "G002.CdIdenUF"], req.body);
    };


    api.buscarOnu = async function(req, res, next) {
        return await utils.searchComboBox("G015.IDG015",
            "G015.DSONU",
            "G015", ["G015.DSONU", "G015.NRONU", "G015.IDG015"], req.body);
    };

    api.buscarOperacao = async function(req, res, next) {
        return await utils.searchComboBox("G014.IDG014",
            "G014.DSOPERAC",
            "G014", ["G014.DSOPERAC"], req.body);
    };

    api.buscarOperacaoIntegrador = async function(req, res, next) {
        let sql = `select
                      G014.IDG014	as ID,
                      G014.DSOPERAC as Text
                 from G014 G014
                Where G014.IDG014 IN (5)
                  And SNDELETE = 0 
                  And G014.DSOPERAC Like :parameter`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter.toUpperCase() + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarGrupoProduto = async function(req, res, next) {
        return await utils.searchComboBox("G038.IDG038",
            "G038.DSGRUPRO",
            "G038", ["G038.DSGRUPRO"], req.body);
    };

    api.buscarCategoria = async function(req, res, next) {
        return await utils.searchComboBox("G037.IDG037",
            "G037.DSCATEGO",
            "G037", ["G037.DSCATEGO"], req.body);
    };

    api.buscarUnidade = async function(req, res, next) {
        return await utils.searchComboBox("G009.IDG009",
            "G009.DSUNIDAD",
            "G009", ["G009.DSUNIDAD", "G009.CDUNIDAD", "G009.IDG009"], req.body);
    };

    api.buscarProdutoSyngenta = async function(req, res, next) {
        return await utils.searchComboBox("H022.IDH022",
            "H022.CDMATERI ||' - '||H022.DSMATERI",
            "H022", ["H022.DSMATERI", "H022.IDH022", "H022.CDMATERI"], req.body);
    };

    api.buscarProduto = async function(req, res, next) {
        return await utils.searchComboBox("G010.IDG010",
            "G010.DSREFFAB ||' - '||G010.DSPRODUT",
            "G010", ["G010.DSPRODUT", "G010.IDG010", "G010.DSREFFAB"], req.body);
    };

    api.buscarReasonCode = async function(req, res, next) {
        return await utils.searchComboBox("I007.IDI007",
            "I007.IDREACOD||' - '||I007.DSCONTEU",
            "I007", ["I007.IDI007", "I007.DSCONTEU", "I007.IDREACOD"], req.body);
    };

    api.buscarMotivosReasonCode = async function(req, res, next) {
        return await utils.searchComboBox("I015.IDI015",
            "I015.IDI015 || ' - ' || I015.DSOCORRE",
            "I015", ["I015.IDI015", "I015.DSOCORRE"], req.body);
    };

    api.buscarReferencia = async function(req, res, next) {
        return await utils.searchComboBox("I018.IDI018",
            "I018.IDI018 || ' - ' || I018.DSGRUMOT",
            "I018", ["I018.IDI018", "I018.DSGRUMOT"], req.body);
    };

    api.buscarAgendamento = async function(req, res, next) {
        return await utils.searchComboBox("H006.IDH006",
            "H006.IDH006",
            "H006", ["H006.IDH006", "H006.NRPLARE1", "H006.NRPLARE2", "H006.NRPLAVEI", ], req.body, false);
    };

    api.buscarNumeroCte = async function(req, res, next) {

        let sql = ``;

        if (req.params.idCarga != null && req.params.idCarga != undefined) {
            sql = `
      Select Distinct G052.IDG051 As id, -- IDG051
              G051.CDCTRC as text -- Número do CTe
        From G052 G052
        Join G051 G051
          On (G051.IDG051 = G052.IDG051)
        Join G043 G043
          On (G043.IDG043 = G052.IDG043)
        Join G049 G049
          On (G049.IDG043 = G043.IDG043)
        Join G048 G048
          On (G049.IDG048 = G048.IDG048)
        Join G046 G046
          On (G048.IDG046 = G046.IDG046)
       Where G051.CDCTRC Like :parameter And G046.IDG046 = ${req.params.idCarga}
       Order by G051.CDCTRC Asc`;
        } else {
            sql = `
      Select Distinct G052.IDG051 As id, -- IDG051
                      G051.CDCTRC as text -- Número do CTe
                 From G052 G052
                 Join G051 G051
                   On (G051.IDG051 = G052.IDG051)
                Where G051.CDCTRC like :parameter
                Order by G051.CDCTRC Asc`;
        }

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarCarga = async function(req, res, next) {
        let sql = ``;

        if (req.params.isHaveCTE == 1) {
            /*
              Força join na G051 pois na HOME monitoria mostra somente notas que 
              possui CTE
            */
            sql = `
        Select Distinct G046.IDG046 As id, -- ID da Carga
              G046.IDG046 As text -- ID da Carga     
          From G046 G046
          Join G048 G048 on G048.IDG046 = G046.IDG046
          Join G049 G049 on G049.IDG048 = G048.IDG048
          Join G051 G051 on G051.IDG051 = G049.IDG051
          Left Join G043 G043 on G043.IDG043 = G049.IDG043
          Where 
          --G043.NRCHADOC Is Not Null
          --AND 
          G046.IDG046 Like :parameter`;
        } else {
            sql = `
        Select Distinct G046.IDG046 As id, -- ID da Carga
              G046.IDG046 As text -- Número da Viagem
          From G043 G043
          Join G049 G049
            On (G049.IDG043 = G043.IDG043)
          Join G048 G048
            On (G049.IDG048 = G048.IDG048)
          Join G046 G046
            On (G048.IDG046 = G046.IDG046)
        Where --G043.NRCHADOC Is Not Null And
        G046.IDG046 Like :parameter`;
        }

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarUsuarioSac = async function(req, res, next) {
        let sql = `
    Select Distinct S001.IDS001 As id,
                    S001.NMUSUARI As text
      From S027 S027
      Join S026 S026
        On (S026.IDS026 = S027.IDS026)
      Join S025 S025
        On (S025.IDS025 = S026.IDS025)
      Join S001 S001
        On (S001.IDS001 = S027.IDS001)
    Where S025.IDS025 = 3
      And Upper(S001.NMUSUARI) Like Upper(:parameter)`;

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarNumeroNfe = async function(req, res, next) {
        let sql = ``;

        if (req.params.isHaveCTE == 1) {
            sql = `
      Select G043.IDG043 As id,
             G043.NRNOTA as text
        From G043 G043
        Join G052 G052
          On (G052.IDG043 = G043.IDG043)
       Where G043.NRCHADOC Is Not Null
         And G043.NRNOTA like :parameter
       Order by G043.NRNOTA Asc`;
        } else {
            sql = `
      Select G043.IDG043 As id,
             G043.NRNOTA as text
        From G043 G043
       Where G043.NRCHADOC Is Not Null
         And G043.NRNOTA like :parameter
       Order by G043.NRNOTa Asc`;
        }

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    }

    api.buscarAcoes = async function(req, res, next) {

        let DSVALUE = (req.body.DSVALUE) ? req.body.DSVALUE : '0';

        var sql =
            `Select Distinct
              S026.IDS026, -- menu, perfil
              S021.IDS022, -- cod menu
              S021.IDS023  -- acao

            From S027
            Inner Join S026 On S027.IDS026 = S026.IDS026
            Inner Join S021 On S026.IDS026 = S021.IDS026
              Where S026.TPGRUPO = 'M'
              And S021.IDS023 in (${req.body.idAcoes.join()})
              And S021.IDS022 = ${req.body.IDS022}
              And S027.IDS001 = ${req.body.IDS001}
              And S026.SNDELETE = 0

       Union All

       Select Distinct
              S026.IDS026, -- menu, perfil
              S021.IDS022, -- cod menu
              S021.IDS023  -- acao

            From S027
            Inner Join S026 On S027.IDS026 = S026.IDS026
            Inner Join S021 On S026.IDS026 = S021.IDS026
            Inner Join S028 On S028.IDS026 = S026.IDS026
              Where S026.TPGRUPO = 'A'
              And S021.IDS023 in (${req.body.idAcoes.join()})
              And S021.IDS022 = ${req.body.IDS022}
              And S027.IDS001 = ${req.body.IDS001}
              And S028.DSVALUE In (${DSVALUE})
              AND S026.SNDELETE = 0`;

        return await db.execute({
                sql,
                param: []
            })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                throw err;
            });
    }

    api.buscarAtendimentos = async function(req, res, next) {
        return await utils.searchComboBox("A001.IDA001",
            "A001.IDA001",
            "A001", ["A001.IDA001"], req.body, false);
    };

    api.Tela = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue && req.body.parameterDep.IDT005 && req.body.parameterDep.IDG024) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        var sql = ` 
    SELECT
          T001.DSPRACA || ' [' || T001.IDT001 || ']'  as text,
          T001.IDT001 as id
     From T001 T001
    Where T001.IDT005 = ${(req.body.parameterDep.IDT005 ? req.body.parameterDep.IDT005 : 0)}
      And (Upper(T001.DSPRACA) Like Upper('%${strValue}%')
      or T001.IDT001 Like '%${strValue}%')
      And T001.IDG024 = ${(req.body.parameterDep.IDG024 ? req.body.parameterDep.IDG024 : 0)} Order by T001.DSPRACA asc`;

        return await db.execute({
                sql,
                param: {},
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });

    };


    api.buscarHistoricoOcorrencia = async function(req, res, next) {
        return await utils.searchComboBox("G012.IDG012",
            "G012.DSHISTOR",
            "G012", ["G012.DSHISTOR"], req.body);
    };

    api.buscarOcorrenciasCarga = async function(req, res, next) {
        return await utils.searchComboBox("G067.IDG067",
            "G067.DSOCORRE",
            "G067", ["G067.DSOCORRE"], req.body);
    };

    api.buscarCidadeEstado = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        return await db.execute({
                sql: `Select G003.NMCIDADE || ' - ' || G002.CDESTADO as text,
                     G003.IDG003 as ID
                From G003 G003
               Inner Join G002 G002 on G003.IDG002 = G002.IDG002
               Where G003.SnDelete = 0
                 And G003.StCadast = 'A'
                 And Upper(G003.NMCIDADE) Like Upper(:parameter)`,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    //-----------------------------------------------------------------------\\
    /**
     * @description Realiza a busca para o filtro de grupo de fornecedores
     *
     * @async
     * @function filtroGrupoFornec
     * @returns {Object} Objecto para o single
     *
     * @author Ítalo Andrade Oliveira
     * @since 13/07/2018
     */
    api.buscarGrupoFornecedor = async function(req, res, next) {
        return await utils.searchComboBox("G036.IDG036",
            "G036.DSGRUFOR",
            "G036", ["G036.DSGRUFOR", "G036.IDG036"], req.body);
    }

    /**
     * @description Realiza a busca para o filtro de contatos
     *
     * @async
     * @function buscarContato
     * @returns {Object} Objecto para o single
     *
     * @author Ítalo Andrade Oliveira
     * @since 13/07/2018
     */
    api.buscarContato = async function(req, res, next) {
        return await utils.searchComboBox("G007.IDG007",
            "G007.NMCONTAT",
            "G007", ["G007.NMCONTAT", "G007.IDG007"], req.body);
    }

    api.motoristasCarga = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        return await db.execute({
                sql: `Select x.*,
                      Case
                        When x.Isvalcnh < 0 Or x.Isvalseg < 0 Or x.Isvenmop < 0 Or
                            x.Isvalexa < 0 Then
                        1
                        Else
                        0
                      End As disabled
                From (Select Idg031 As Id,
                              /*G031.Nmmotori As Text,*/
                              G031.Nmmotori || ' ['|| nvl(G031.NrMatric, 'n.i') || '] ' as text,
                              Dtvalcnh /*  Dt. Validade da CNH */,
                              Nvl2(Dtvalcnh,
                                  (Dtvalcnh - To_Date(Current_Date, 'DD/MM/YY')),
                                  -1) As Isvalcnh,
                              Dtvalseg /*  Dt. Validade cartão seguradora */,
                              Nvl2(Dtvalseg,
                                  (Dtvalseg - To_Date(Current_Date, 'DD/MM/YY')),
                                  -1) As Isvalseg,
                              Dtvenmop /*  Dt. Validade curso MOPP */,
                              Nvl2(Dtvenmop,
                                  (Dtvenmop - To_Date(Current_Date, 'DD/MM/YY')),
                                  -1) As Isvenmop,
                              Dtvalexa /*  Validade do exame médico */,
                              Nvl2(Dtvalexa,
                                  (Dtvalexa - To_Date(Current_Date, 'DD/MM/YY')),
                                  -1) As Isvalexa
                        From G031 G031
                        Where Sndelete = 0
                          And G031.StCadast = 'A'
                          And (Upper(G031.Nmmotori) Like Upper(:parameter)
                          or Upper(G031.NrMatric) Like Upper(:parameter)
                          or Upper(G031.Cjmotori) Like Upper(:parameter)

                        )

                          And G031.Idg024 In
                          (Select Idg024
                             From G024
                            Where Idg023 = (Select a.Idg023
                                              From G024 a
                                             Where a.Idg024 = :parameterDep))

                        ) x Order By Disabled, text Asc `,
                param: {
                    parameter: '%' + req.body.parameter + '%',
                    parameterDep: (req.body.parameterDep.IDG024 ? req.body.parameterDep.IDG024 : req.body.parameterDep.CARGA),
                   // parameterDep: req.body.parameterDep.IDG024
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };


    api.veiculoCarga = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        var sql = `Select x.*,
    Case
      When x.Islicamb < 0 Or x.Iscerreg < 0 Or x.Istestac < 0 Or
           x.Istesfum < 0 Or x.Isvalant < 0 Or x.Isaetbit < 0 Or
           x.Isliessp < 0 Or x.Isaetgo  < 0 Or x.Isaetmg  < 0 Or
           x.Isaetsp  < 0 Or x.Isvalex2 < 0 Or x.Isvale12 < 0 Or
           x.Isvalcap < 0 Or x.Isvalpil < 0 Or x.Ismasfac < 0 Or
           x.Isex12bi < 0 Or x.Ischelis < 0 /*Or x.Isvalcrl < 0*/ Then 
       1
      Else
       0
    End As Disabled
From (Select Dtlicamb /* Validade de Licença Ambiental  */,
            Nvl2(Dtlicamb,
                 (Dtlicamb - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Islicamb,
            Dtcerreg /* Val. certif. de reg. IBAMA */,
            Nvl2(Dtcerreg,
                 (Dtcerreg - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Iscerreg,
            Dttestac /* Validade Teste Tacografo */,
            Nvl2(Dttestac,
                 (Dttestac - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Istestac,
            Dttesfum /* Data de validade teste fumaça */,
            Nvl2(Dttesfum,
                 (Dttesfum - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Istesfum,
            Dtvalant /* Validade ANTT */,
            Nvl2(Dtvalant,
                 (Dtvalant - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalant,
            Dtaetbit /* Validade Licença AET DNIT */,
            Nvl2(Dtaetbit,
                 (Dtaetbit - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetbit,
            Dtliessp /* Validade da licença esp. SP */,
            Nvl2(Dtliessp,
                 (Dtliessp - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isliessp,
            Dtaetgo /* Validade Licença AET GO */,
            Nvl2(Dtaetgo,
                 (Dtaetgo - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetgo,
            Dtaetmg /* Validade Licença AET  MG */,
            Nvl2(Dtaetmg,
                 (Dtaetmg - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetmg,
            Dtaetsp /* Validade Licença AET SP */,
            Nvl2(Dtaetsp,
                 (Dtaetsp - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetsp,
            Dtvalex2 /* Validade do extintor de 2KG */,
            Nvl2(Dtvalex2,
                 (Dtvalex2 - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalex2,
            Dtvale12 /* Validade extintor 12KG */,
            Nvl2(Dtvale12,
                 (Dtvale12 - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvale12,
            Dtvalcap /* Validade do capacete  */,
            Nvl2(Dtvalcap,
                 (Dtvalcap - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalcap,
            Dtvalpil /* Validade da pilha da lanterna */,
            Nvl2(Dtvalpil,
                 (Dtvalpil - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalpil,
            Dtmasfac /* Validade da máscara semifacia  */,
            Nvl2(Dtmasfac,
                 (Dtmasfac - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Ismasfac,
            Dtex12bi /* Validade extintor 12KG bitrem */,
            Nvl2(Dtex12bi,
                 (Dtex12bi - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isex12bi,
            Dtchelis /* Data do Checklist */,
            Nvl2(Dtchelis,
                 (Dtchelis+30 - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Ischelis,
            Dtvalcrl /* Data do CRLV */,
            Nvl2(Dtvalcrl,
                (Dtvalcrl - To_Date(Current_Date, 'DD/MM/YY')),
                -1) As Isvalcrl, 
            G030.Qtcappes,
            G032.Dsveicul || ' ['|| nvl(G032.NrFrota, 'n.i') || ' - ' || G032.NrPlavei || '] - ' || G030.DSTIPVEI as text,
            G030.DSTIPVEI,
            G030.PCPESMIN,
            G030.QTCAPVOL,
            G032.IdG032 AS id,
            G032.Idg030,
            NVL(G030.NRCARRET,0) AS NRCARRET
       From G032 G032
       Join G030 G030
         On G030.Idg030 = G032.Idg030
      Where G030.Sndelete = 0
        And G032.Sndelete = 0
        And G032.StCadast = 'A'
        And G030.StCadast = 'A'
      /*And G030.Idg030 = :parameterDepTipo*/
        And G030.QTCAPPES >= (SELECT x.QTCAPPES FROM g030 x WHERE x.idg030 = :parameterDepTipo)
        And (Upper(G032.DSVEICUL) Like Upper(:parameter) or Upper(G032.NRFROTA) Like Upper(:parameter) or Upper(G032.NrPlavei) Like Upper(:parameter))

        And G032.Idg024 In
        (Select Idg024
           From G024
          Where Idg023 = (Select a.Idg023
                            From G024 a
                           Where a.Idg024 = :parameterDep))

     ) x	Order By Disabled, DSTIPVEI, text  Asc		`;

        return await db.execute({
                sql,

                param: {
                    parameter: '%' + req.body.parameter + '%',
                    parameterDep: (req.body.parameterDep.IDG024 ? req.body.parameterDep.IDG024 : req.body.parameterDep.IDG024_CARGA),
                    //parameterDep: req.body.parameterDep.IDG024,
                    parameterDepTipo: req.body.parameterDep.IDG030
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.veiculoCargaCavalo = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        var sql = `Select x.*,
    Case
      When x.Islicamb < 0 Or x.Iscerreg < 0 Or x.Istestac < 0 Or
           x.Istesfum < 0 Or x.Isvalant < 0 Or x.Isaetbit < 0 Or
           x.Isliessp < 0 Or x.Isaetgo  < 0 Or x.Isaetmg  < 0 Or
           x.Isaetsp  < 0 Or x.Isvalex2 < 0 Or x.Isvale12 < 0 Or
           x.Isvalcap < 0 Or x.Isvalpil < 0 Or x.Ismasfac < 0 Or
           x.Isex12bi < 0 Or x.Ischelis < 0 /*Or x.Isvalcrl < 0*/ Then
       1
      Else
       0
    End As Disabled
    From (Select (select Z.Islicamb
                    from (select /* Validade de Licença Ambiental da Carreta */
                          Nvl2(g032cr.Dtlicamb,
                                (g032cr.Dtlicamb - To_Date(Current_Date, 'DD/MM/YY')),
                                -1) as Islicamb
                            from g026 g026
                          inner join g032 g032cr
                              on g032cr.idg032 = G026.IdG032CR
                          where G026.IdG032CV = G032.Idg032
                            And G026.sndelete = 0
                          order by Nvl2(g032cr.Dtlicamb,
                                        (g032cr.Dtlicamb - To_Date(Current_Date, 'DD/MM/YY')),
                                        -1) asc) Z
                  where rownum = 1) as Islicamb,
            Dtcerreg /* Val. certif. de reg. IBAMA */,
            Nvl2(Dtcerreg,
                 (Dtcerreg - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Iscerreg,
            Dttestac /* Validade Teste Tacografo */,
            Nvl2(Dttestac,
                 (Dttestac - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Istestac,
            Dttesfum /* Data de validade teste fumaça */,
            Nvl2(Dttesfum,
                 (Dttesfum - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Istesfum,
            Dtvalant /* Validade ANTT */,
            Nvl2(Dtvalant,
                 (Dtvalant - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalant,
            Dtaetbit /* Validade Licença AET DNIT */,
            Nvl2(Dtaetbit,
                 (Dtaetbit - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetbit,
            Dtliessp /* Validade da licença esp. SP */,
            Nvl2(Dtliessp,
                 (Dtliessp - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isliessp,
            Dtaetgo /* Validade Licença AET GO */,
            Nvl2(Dtaetgo,
                 (Dtaetgo - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetgo,
            Dtaetmg /* Validade Licença AET  MG */,
            Nvl2(Dtaetmg,
                 (Dtaetmg - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetmg,
            Dtaetsp /* Validade Licença AET SP */,
            Nvl2(Dtaetsp,
                 (Dtaetsp - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isaetsp,
            Dtvalex2 /* Validade do extintor de 2KG */,
            Nvl2(Dtvalex2,
                 (Dtvalex2 - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalex2,
            Dtvale12 /* Validade extintor 12KG */,
            Nvl2(Dtvale12,
                 (Dtvale12 - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvale12,
            Dtvalcap /* Validade do capacete  */,
            Nvl2(Dtvalcap,
                 (Dtvalcap - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalcap,
            Dtvalpil /* Validade da pilha da lanterna */,
            Nvl2(Dtvalpil,
                 (Dtvalpil - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isvalpil,
            Dtmasfac /* Validade da máscara semifacia  */,
            Nvl2(Dtmasfac,
                 (Dtmasfac - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Ismasfac,
            Dtex12bi /* Validade extintor 12KG bitrem */,
            Nvl2(Dtex12bi,
                 (Dtex12bi - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Isex12bi,
            Dtchelis /* Data do Checklist */,
            Nvl2(Dtchelis,
                 (Dtchelis+30 - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Ischelis,
            Dtvalcrl /* Data do CRLV */,
            Nvl2(Dtvalcrl,
                (Dtvalcrl - To_Date(Current_Date, 'DD/MM/YY')),
                -1) As Isvalcrl, 
            G030.Qtcappes,
            G032.Dsveicul || ' ['|| nvl(G032.NrFrota, 'n.i') || ' - ' || G032.NrPlavei || ']  - [CR - '|| (select LISTAGG(G026.IdG032CR, ', ') WITHIN GROUP(ORDER BY G026.IdG032CR) from g026 g026 where G026.IdG032CV = G032.IdG032 And G026.sndelete = 0) || ']' as text,
            G030.DSTIPVEI,
            G030.PCPESMIN,
            G030.QTCAPVOL,
            G032.IdG032 AS id,
            G032.Idg030,
            NVL(G030.NRCARRET,0) AS NRCARRET
       From G032 G032
       Join G030 G030
         On G030.Idg030 = G032.Idg030
      Where G030.Sndelete = 0
        And G032.Sndelete = 0
        And G032.StCadast = 'A'
        And G030.StCadast = 'A'
        And G030.Idg030 = :parameterDepTipo
        And (Upper(G032.DSVEICUL) Like Upper(:parameter) or Upper(G032.NRFROTA) Like Upper(:parameter) or Upper(G032.NrPlavei) Like Upper(:parameter))
        And G032.TpCompos = 'C'
        And G032.Idg024 In
        (Select Idg024
           From G024
          Where Idg023 = (Select a.Idg023
                            From G024 a
                           Where a.Idg024 = :parameterDep))

     ) x	Order By Disabled, text  Asc		`;

        return await db.execute({
                sql,

                param: {
                    parameter: '%' + req.body.parameter + '%',
                    parameterDep: req.body.parameterDep.IDG024,
                    parameterDepTipo: req.body.parameterDep.IDG030
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.veiculoCargaCarreta = async function(req, res, next) {

        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }
        var where = '';
        if (req.body.parameterDep.IDVEICUL != undefined && req.body.parameterDep.IDVEICUL != null) {
            where = ` AND G032.IDG032 <> ${req.body.parameterDep.IDVEICUL}`;
        }

        var sql = `Select x.*,
    Case
      When x.Islicamb < 0 then
       1
      Else
       0
    End As Disabled
From (Select Dtlicamb /* Validade de Licença Ambiental  */,
            Nvl2(Dtlicamb,
                 (Dtlicamb - To_Date(Current_Date, 'DD/MM/YY')),
                 -1) As Islicamb,
            G030.Qtcappes,
            G032.Dsveicul || ' ['|| nvl(G032.NrFrota, 'n.i') || ' - ' || G032.NrPlavei || '] ' as text,
            G030.DSTIPVEI,
            G030.PCPESMIN,
            G030.QTCAPVOL,
            G032.IdG032 AS id,
            G032.Idg030,
            NVL(G030.NRCARRET,0) AS NRCARRET 
       From G032 G032
       Join G030 G030
         On G030.Idg030 = G032.Idg030
      Where G030.Sndelete = 0
        And G032.Sndelete = 0
        And G032.StCadast = 'A'
        And G030.StCadast = 'A'
        And G030.Idg030 = :parameterDepTipo
        And (Upper(G032.DSVEICUL) Like Upper(:parameter) or Upper(G032.NRFROTA) Like Upper(:parameter) or Upper(G032.NrPlavei) Like Upper(:parameter))
        And G032.TpCompos = 'R'
        ${where}
        And G032.Idg024 In
        (Select Idg024
           From G024
          Where Idg023 = (Select a.Idg023
                            From G024 a
                           Where a.Idg024 = :parameterDep))
        And not exists(Select g026.idg032cr from g026 g026 where g026.idg032cr = g032.idg032 and g026.sndelete = 0)
     ) x	Order By Disabled, text  Asc`;

        

        return await db.execute({
                sql,

                param: {
                    parameter: '%' + req.body.parameter + '%',
                    parameterDep: req.body.parameterDep.IDG024,
                    parameterDepTipo: req.body.parameterDep.IDG030
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotoristasCampanha = async function(req, res, next) {

        var strValue = req.body.parameter;
        var snSelect = true;

        if (strValue) {
            strValue = strValue.toUpperCase().replace(/(\.|\-)/g, '');
        } else {
            return utils.array_change_key_case({});
        }

        if (req.body.parameterDep.IDG090 == null || req.body.parameterDep.IDG090 == undefined) {
            snSelect = false;
            //return utils.array_change_key_case({});
        } else {
            snSelect = true;
        }

        let idg024 = await db.execute({
            sql:`SELECT IDG024 FROM S001 WHERE IDS001 = :IDS001 AND IDG097PR = 33`,
            param: {
                        IDS001: req.UserId
                   }
            })
            .then((res) => {
                if(res.length > 0){
                    res = res[0].IDG024 == 35 ? res[0].IDG024+', 1076' : res[0].IDG024;   
                }else{
                    res = null;
                }
                return res;
            })
            .catch((err) => {
                throw err;
            });

        var sql = `SELECT  
                      G099.IDG099 AS ID, 
                      G031.NMMOTORI || ' - ' || REPLACE(REPLACE(G031.CJMOTORI,'-'),'.') || ' [' || G031.IDG031 || '-' || G031.NRMATRIC || '] - ' || G090.DSCAMPAN || ' [' || G090.IDG090   || ']' AS TEXT 
               FROM G099 
              INNER JOIN G031 ON G031.IDG031 = G099.IDG031
              INNER JOIN G091 ON G091.IDG024 = G099.IDG024
              INNER JOIN g090 g090
                 ON g090.IDG090 = g091.IDG090
              WHERE 1=1 
                ${(snSelect ? ' and G091.IDG090 = '+ req.body.parameterDep.IDG090 : '')}
                AND (UPPER(G031.NMMOTORI) LIKE UPPER('%${strValue}%')
                 OR UPPER(G031.RGMOTORI) LIKE UPPER('%${strValue}%')
                 OR UPPER(REPLACE(REPLACE(G031.CJMOTORI,'-'),'.')) LIKE UPPER('%${strValue}%'))
                AND G031.SnDelete = 0
                ${idg024 != null ? 'AND G099.IDG024 in ('+idg024+')' : ''}`;

        return await db.execute({
                sql,
                param: {},
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMesAnoCampanha = async function(req, res, next) {

        await db.execute({
                sql: `ALTER SESSION SET NLS_DATE_LANGUAGE = 'Portuguese'`,
                param: []
            }).then((result) => {
                return result;
            })
            .catch((err) => {
                throw err;
            });

        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase().replace(/(\.|\-)/g, '');
        } else {
            return utils.array_change_key_case({});
        }


        var sql = `select y.id, y.text from (Select
                      to_char(add_months(trunc( TO_DATE((SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G),'MMYYYY') ,'mm'),rownum-1),'mm') ||
                      to_char(add_months(trunc( TO_DATE((SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G),'MMYYYY') ,'mm'),rownum-1),'yyyy') AS ID,
                      trim(to_char(add_months(trunc( TO_DATE((SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G),'MMYYYY') ,'mm'),rownum-1),'Month','nls_date_language =''brazilian portuguese''')) || ' de ' || to_char(add_months(trunc( TO_DATE((SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G),'MMYYYY') ,'mm'),rownum-1),'yyyy') as text
                  from user_tables 
                  where rownum <= months_between ( SYSDATE, 
                  to_date((SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G),'mmyyyy') 
                  ) + 1) Y
                  where upper(y.text) like upper(:parameter) `;

        return await db.execute({
                sql,

                param: {
                    parameter: '%' + strValue + '%'
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarFornecedores = async function(req, res, next) {
        return await utils.searchComboBox(
            "G034.IDG034",
            "G034.NMFORNEC",
            "G034", ["G034.IDG034", "G034.NMFORNEC"], req.body, false);
    };

    api.buscarMotivoAlteracaoData = async function(req, res, next) {
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        return await db.execute({
                sql: `SELECT I015.DSOCORRE || ' - ' || I015.IDI015 AS TEXT,
                     I015.IDI015 AS ID
              FROM I015
              INNER JOIN I019 
                ON I019.IDI015 = I015.IDI015
              INNER JOIN I017 
                ON I017.IDI015 = I015.IDI015
              INNER JOIN I007 
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE (Upper(I015.DSOCORRE) LIKE Upper(:parameter) OR Upper(I015.IDI015) LIKE Upper(:parameter))
                AND I019.IDI018 = 2 AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotivoEntrega = async function(req, res, next) {
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        return await db.execute({
                sql: `SELECT I015.DSOCORRE || ' - ' || I015.IDI015 AS TEXT,
                     I015.IDI015 AS ID
              FROM I015
              INNER JOIN I019 
                ON I019.IDI015 = I015.IDI015
              INNER JOIN I017 
                ON I017.IDI015 = I015.IDI015
              INNER JOIN I007 
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE (Upper(I015.DSOCORRE) LIKE Upper(:parameter) OR Upper(I015.IDI015) LIKE Upper(:parameter))
                AND I019.IDI018 = 1 AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };


    api.buscarMotivoFinalizar = async function(req, res, next) {
        var strValue = req.body.parameter;

        if (strValue) {
            strValue = strValue.toUpperCase();
        } else {
            return utils.array_change_key_case({});
        }

        return await db.execute({
                sql: `SELECT I015.DSOCORRE AS TEXT,
                        I007.IDI007 AS ID
              FROM I015
              INNER JOIN I019 
                ON I019.IDI015 = I015.IDI015
              INNER JOIN I017 
                ON I017.IDI015 = I015.IDI015
              INNER JOIN I007 
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE (Upper(I015.DSOCORRE) LIKE Upper(:parameter) OR Upper(I015.IDI015) LIKE Upper(:parameter))
                AND I019.IDI018 = 7 AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                },
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotivosCancelar = async function(req, res, next) {

        var sql = `SELECT DISTINCT I015.DSOCORRE || ' - ' || I015.IDI015 AS TEXT,
                              I015.IDI015 AS ID
              FROM I015
              INNER JOIN I019 
                ON I019.IDI015 = I015.IDI015
              LEFT JOIN I017 
                ON I017.IDI015 = I015.IDI015
              LEFT JOIN I007 
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE I019.IDI018 IN (3,4) AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`

        return await db.execute({
                sql,
                param: []
            })
            .then((result) => {
                return utils.array_change_key_case(result);;
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotivosConferencia = async function(req, res, next) {

        var sql = `SELECT DISTINCT I015.DSOCORRE || ' - ' || I015.IDI015 AS TEXT,
                              I015.IDI015 AS ID
              FROM I015
              INNER JOIN I019 
                ON I019.IDI015 = I015.IDI015
              LEFT JOIN I017 
                ON I017.IDI015 = I015.IDI015
              LEFT JOIN I007 
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE I019.IDI018 IN (6) AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`

        return await db.execute({
                sql,
                param: []
            })
            .then((result) => {
                return utils.array_change_key_case(result);;
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotivosReagendar = async function(req, res, next) {

        var sql = `SELECT DISTINCT I015.DSOCORRE || ' - ' || I015.IDI015 AS TEXT,
                              I015.IDI015 AS ID,
                              I007.IDI007
              FROM I015
              INNER JOIN I019 
                ON I019.IDI015 = I015.IDI015
              LEFT JOIN I017 
                ON I017.IDI015 = I015.IDI015
              LEFT JOIN I007 
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE I019.IDI018 IN (3,4) AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`

        return await db.execute({
                sql,
                param: []
            })
            .then((result) => {
                return utils.array_change_key_case(result);;
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarMotivosContatoCliente = async function(req, res, next) {

        var sql = `SELECT I015.IDI015 || ' - ' || I015.DSOCORRE AS TEXT,
                     I015.IDI015 AS ID,
                     I007.IDI007
              FROM I019
              INNER JOIN I018
                ON I018.IDI018 = I019.IDI018
              INNER JOIN I015
                ON I015.IDI015 = I019.IDI015
              INNER JOIN I017
                ON I017.IDI015 = I015.IDI015
              INNER JOIN I007
                ON I007.IDI007 = I017.IDI007
                AND I007.SNDELETE = 0
                AND I007.STCADAST <> 'I'
              WHERE I019.IDI018 IN (5) AND I015.SNDELETE = 0
              ORDER BY I015.IDI015 ASC`

        return await db.execute({
                sql,
                param: []
            })
            .then((result) => {
                return utils.array_change_key_case(result);;
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarGrupoOcorrencia = async function(req, res, next) {
        return await utils.searchComboBox("G070.IDG070",
            "G070.DSGRUPO",
            "G070", ["G070.DSGRUPO"], req.body);
    };

    api.buscarTipoVeiculoAtivo = async function(req, res, next) {
        let sql = `select
                      G030.IDG030	as ID,
                      G030.DSTIPVEI as Text,
                      G030.QTCAPPES,
                      G030.QTCAPVOL,
                      G030.STCADAST,
                      G030.DTCADAST,
                      G030.IDS001	,
                      G030.SNDELETE,
                      G030.IDVEIOTI,
                      G030.PCPESMIN,
                      G030.TPCOMBUS,
                      G030.TPCARVEI,
                      G030.DSMARCA
                      NVL(G030.NRCARRET,0) AS NRCARRET
                 from G030 G030
                Where G030.Stcadast = 'A'
                  And (Upper(G030.DSTIPVEI) Like Upper(:parameter)
                   or Upper(G030.IDG030) Like Upper(:parameter))
                  And idveioti Is Not Null`;

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarSeguradoras = async function(req, res, next) {
        return await utils.searchComboBox("G041.IDG041",
            "G041.RSSEGURA",
            "G041", ["G041.RSSEGURA"], req.body);
    };


    api.buscarTransportadoraBravo = async function(req, res, next) {

        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }
        acl1 = await acl.montar({
            ids001: user,
            dsmodulo: 'transportation',
            nmtabela: [{
                G024: 'G024'
            }],
            esoperad: 'And'
        });

        if (typeof acl1 == 'undefined') {
            acl1 = '';
        }


        let sql = `select
                        G024.IDG024	as ID,
                        G024.NMTRANSP || ' [' || FN_FORMAT_CNPJ_CPF(G024.CJTRANSP) || ' - ' || G024.IETRANSP || ' - ' || G024.IDLOGOS ||']' as Text,
                        G024.RSTRANSP,
                        G024.CJTRANSP,
                        G024.IETRANSP,
                        G024.IDLOGOS,
                        G024.NRLATITU,
                        G024.NRLONGIT,
                        G024.IDG003,
                        G003.NMCIDADE,
                        G002.CDESTADO
                   from G024 G024
                  Join G023 G023 on G024.IDG023 = G023.IDG023
                  Join G003 G003 on G024.IDG003 = G003.IDG003
                  Join G002 G002 on G003.IDG002 = G002.IDG002
                  Where G024.Stcadast = 'A'
                    And (Upper(G024.NMTRANSP) Like Upper(:parameter)
                     or Upper(G024.IDG024) Like Upper(:parameter)
                     or Upper(G024.IDLOGOS) Like Upper(:parameter)
                     or Upper(G024.RSTRANSP) Like Upper(:parameter)
                     )
                    And G024.idg023   = 2
                    And G024.sndelete = 0 
                    And G023.sndelete = 0 
                    ${acl1}`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };


    api.buscarTranspCampanhaBravo = async function(req, res, next) {

        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        var whereAux = '';
        if (req.body.parameterDep != undefined) {
            for (let i = 0; i < req.body.parameterDep.IDG091.length; i++) {
                whereAux = whereAux + req.body.parameterDep.IDG091[i].id + ",";
            }
            whereAux = ` and g024.idg024 in (${whereAux} 0) `;
        }

        let sql = `select
                        G024.IDG024	as ID,
                        G024.NMTRANSP || ' [' || FN_FORMAT_CNPJ_CPF(G024.CJTRANSP) || ' - ' || G024.IETRANSP || ' - ' || G024.IDLOGOS ||']' as Text,
                        G024.RSTRANSP,
                        G024.CJTRANSP,
                        G024.IETRANSP,
                        G024.IDLOGOS,
                        G024.NRLATITU,
                        G024.NRLONGIT,
                        G024.IDG003,
                        G003.NMCIDADE,
                        G002.CDESTADO
                   from G024 G024
                  Join G023 G023 on G024.IDG023 = G023.IDG023
                  Join G003 G003 on G024.IDG003 = G003.IDG003
                  Join G002 G002 on G003.IDG002 = G002.IDG002
                  Where G024.Stcadast = 'A'
                    And (Upper(G024.NMTRANSP) Like Upper(:parameter)
                     or Upper(G024.IDG024) Like Upper(:parameter))
                    And G023.SNTRAINT = 1
                    and G024.sndelete = 0 
                    and G023.sndelete = 0 
                    ${whereAux}`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };


    api.filtrarTabela = async function(req, res, next) {
        return await utils.searchComboBox(
            "S007.IDS007",
            "S007.NMTABELA || ' - ' || S007.DSTABELA",
            "S007", ["S007.DSTABELA", "S007.NMTABELA"], req.body, false, undefined, true);
    };


    api.nomeContato = async function(req, res, next) {
        return await utils.searchComboBox("G007.IDG007",
            "G007.NMCONTAT",
            "G007", ["G007.DTCADAST", "G007.DTNASCIM"], req.body, true);
    };


    api.buscarMateriais = async function(req, res, next) {
        return await utils.searchComboBox("H022.IDH022",
            "H022.DSMATERI", "H022", ["H022.DSMATERI"], req.body, true);
    };

    api.detalheContato = async function(req, res, next) {
        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        let sql = `SELECT G008.IDG008 as ID, 
                        lower(G008.DSCONTAT) as Text,
                        G007.NMCONTAT, 
                        G008.TPCONTAT                        
                  FROM G007 G007
                  JOIN G008 G008 ON G008.IDG007 = G007.IDG007
                  WHERE G007.SNDELETE = 0
                      AND G008.SNDELETE = 0 
                      And (Upper(G008.DSCONTAT) Like Upper(:parameter))
                      AND ROWNUM <= 50`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.responsavelRastreioIndustrias = async function(req, res, next) {
        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        let sql = `SELECT DISTINCT G005.CJCLIENT,
                        G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']' as Text, 
                        G005.IECLIENT, 
                        G005.NMCLIENT, 
                        G005.RSCLIENT, 
                        G005.TPPESSOA, 
                        G014.IDG014, 
                        G014.DSOPERAC,
                        G005.IDG005,
                        G022.IDG022 AS ID
                  FROM G005 G005
                  INNER JOIN G022 G022 ON G022.IDG005 = G005.IDG005 AND G022.SNINDUST = 1
                  INNER JOIN G014 G014 ON G014.IDG014 = G022.IDG014
                  WHERE G005.SNDELETE = 0
                        AND G014.STCADAST = 'A'
                        AND G014.SNDELETE = 0
                        AND G022.SNDELETE = 0
                        And (Upper(G005.RSCLIENT) Like Upper(:parameter)
                        or Upper(G005.NMCLIENT) Like Upper(:parameter)
                        or Upper(G005.CJCLIENT) Like Upper(:parameter))
                        AND ROWNUM <= 50
                        Order by G005.RSCLIENT ASC`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.clienteFinal = async function(req, res, next) {
        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        let sql = `SELECT DISTINCT G005.CJCLIENT,
                        G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']' as Text, 
                        G005.IECLIENT, 
                        G005.NMCLIENT, 
                        G005.RSCLIENT, 
                        G005.TPPESSOA,
                        G005.IDG005 AS ID 
                FROM G005 G005
                WHERE NOT EXISTS (SELECT * FROM G022 G022 WHERE G022.IDG005 = G005.IDG005 AND G022.SNDELETE = 0)
                      AND G005.SNDELETE = 0
                      And (Upper(G005.RSCLIENT) Like Upper(:parameter)
                      or Upper(G005.NMCLIENT) Like Upper(:parameter)
                      or Upper(G005.CJCLIENT) Like Upper(:parameter))
                      AND ROWNUM <= 50`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.setorContato = async function(req, res, next) {
        let sql = `SELECT G006.IDG006 AS ID,
                      G006.DSSETOR AS TEXT,
                      G006.DTCADAST 
                  FROM G006 G006
                  WHERE G006.STCADAST = 'A'
                  AND G006.SNDELETE = 0
                  AND ROWNUM <= 50
                  ORDER BY G006.DSSETOR ASC`;

        return await db.execute({
                sql,
                param: {

                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    api.contatoDetalhe = async function(req, res, next) {

        let operacao = req.params.operacao && req.params.operacao != '00' ? req.params.operacao : null;
        let sql = `SELECT G007.IDG007 AS ID,
                      G007.NMCONTAT || ' [' || NVL(G006.DSSETOR,'n.i') || ' - ' || NVL(G039.DSCARGO,'n.i') ||']' as Text 
                      FROM G007 G007
                      LEFT JOIN G039 G039 ON G039.IDG039 = G007.IDG039 AND G039.STCADAST = 'A'
                      LEFT JOIN G006 G006 ON G006.IDG006 = G007.IDG006 AND G006.STCADAST = 'A'
                WHERE G007.SNDELETE = 0
                      And (Upper(G007.NMCONTAT) Like Upper(:parameter))
                      AND ROWNUM <= 50
                ORDER BY G007.NMCONTAT ASC`;

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.contatoClienteIndustria = async function(req, res, next) {

        let sql;

        if (req.body.showCDUF) {
            sql = `SELECT DISTINCT G005.CJCLIENT,
                      G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' || ' - ' || G003.NMCIDADE || '-' || G002.CDESTADO as text,
                      G005.IECLIENT, 
                      FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || '/' || G005.IECLIENT AS CJCLIAUX,
                      G005.NMCLIENT, 
                      G005.RSCLIENT, 
                      G005.TPPESSOA,
                      G003.NMCIDADE,
                      G002.CDESTADO,
                      CASE
                        WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
                        ELSE 'Física' 
                      END as DSTPPESS, 
                      G005.IDG005 AS ID,
                      G014.IDG014 as IDG014
                  FROM G005 G005
                  join G022 G022 on(G022.IDG005 = G005.IDG005)
                  join G014 G014 on(G022.IDG014 = G014.IDG014 AND NVL(G022.SNINDUST,1) = 1)
                  join G003 G003 
                      On (G003.IDG003 = G005.IDG003) 
                    Join G002 G002 
                      On (G003.IDG002 = G002.IDG002)
                  WHERE EXISTS (SELECT * FROM G022 G022 WHERE G022.IDG005 = G005.IDG005 AND G022.SNDELETE = 0 AND NVL(G022.SNINDUST,1) = 1)
                    AND G005.SNDELETE = 0
                    And (Upper(G005.RSCLIENT) Like Upper(:parameter)
                    or Upper(G005.NMCLIENT) Like Upper(:parameter)
                    or Upper(G005.CJCLIENT) Like Upper(:parameter))
                    AND ROWNUM <= 50 `;

        } else {
            sql = `SELECT DISTINCT G005.CJCLIENT,
                      G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']' as Text, 
                      G005.IECLIENT, 
                      FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || '/' || G005.IECLIENT AS CJCLIAUX,
                      G005.NMCLIENT, 
                      G005.RSCLIENT, 
                      G005.TPPESSOA,
                      CASE
                        WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
                        ELSE 'Física' 
                      END as DSTPPESS, 
                      G005.IDG005 AS ID,
                      G014.IDG014 as IDG014
                  FROM G005 G005
                  join G022 G022 on(G022.IDG005 = G005.IDG005)

                  join G014 G014 on(G022.IDG014 = G014.IDG014 AND NVL(G022.SNINDUST,1) = 1)

                  WHERE EXISTS (SELECT * FROM G022 G022 WHERE G022.IDG005 = G005.IDG005 AND G022.SNDELETE = 0 AND NVL(G022.SNINDUST,1) = 1)
                    AND G005.SNDELETE = 0
                    And (Upper(G005.RSCLIENT) Like Upper(:parameter)
                    or Upper(G005.NMCLIENT) Like Upper(:parameter)
                    or Upper(G005.CJCLIENT) Like Upper(:parameter))
                    AND ROWNUM <= 50 `;
        }

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.contatoClienteFinal = async function(req, res, next) {
        let sql;
        if (req.body.showCDUF) {
            sql = `SELECT DISTINCT G005.CJCLIENT,
                      G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' || ' - ' || G003.NMCIDADE || '-' || G002.CDESTADO as text,
                      G005.IECLIENT, 
                      FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || '/' || G005.IECLIENT AS CJCLIAUX,
                      G005.NMCLIENT, 
                      G005.RSCLIENT, 
                      G005.TPPESSOA,
                      G003.NMCIDADE,
                      G002.CDESTADO,
                      CASE
                        WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
                        ELSE 'Física' 
                      END as DSTPPESS, 
                      G005.IDG005 AS ID 
                  FROM G005 G005
                    join G003 G003 
                      On (G003.IDG003 = G005.IDG003) 
                    Join G002 G002 
                      On (G003.IDG002 = G002.IDG002)
                    Join G022 G022 
                      On (G022.IDG005 = G005.IDG005 AND G022.SNDELETE = 0 AND G022.SNINDUST = 0)
                  WHERE
                    G005.SNDELETE = 0
                    And (Upper(G005.RSCLIENT) Like Upper(:parameter)
                    or Upper(G005.NMCLIENT) Like Upper(:parameter)
                    or Upper(G005.CJCLIENT) Like Upper(:parameter))
                    AND ROWNUM <= 50 `;
        } else {
            sql = `SELECT DISTINCT G005.CJCLIENT,
                      G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']' as Text, 
                      G005.IECLIENT, 
                      FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || '/' || G005.IECLIENT AS CJCLIAUX,
                      G005.NMCLIENT, 
                      G005.RSCLIENT, 
                      G005.TPPESSOA,
                      CASE
                        WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
                        ELSE 'Física' 
                      END as DSTPPESS, 
                      G005.IDG005 AS ID 
                  FROM G005 G005
                  WHERE NOT EXISTS (SELECT * FROM G022 G022 WHERE G022.IDG005 = G005.IDG005 AND G022.SNDELETE = 0 AND NVL(G022.SNINDUST,1) = 1)
                    AND G005.SNDELETE = 0
                    And (Upper(G005.RSCLIENT) Like Upper(:parameter)
                    or Upper(G005.NMCLIENT) Like Upper(:parameter)
                    or Upper(G005.CJCLIENT) Like Upper(:parameter))
                    AND ROWNUM <= 50 `;

        }

        return await db.execute({
                sql,
                param: {
                    parameter: '%' + req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarDescVeiculos = async function(req, res, next) {


        var user = null;
        if (req.UserId != null) {
            user = req.UserId;
        } else if (req.headers.ids001 != null) {
            user = req.headers.ids001;
        } else if (req.body.ids001 != null) {
            user = req.body.ids001;
        }

        var acl1 = '';
        //# Não sabemos quem utiliza esse filtro. Portanto foi implementado acl apenas no transportation
        if (req.headers.dsmodulo != undefined && req.headers.dsmodulo.toLowerCase() == 'transportation') {

            acl1 = await acl.montar({
                ids001: user,
                dsmodulo: req.headers.dsmodulo,
                nmtabela: [{
                    G024: 'G024'
                }],
                //dioperad: ' ',
                esoperad: ' And '
            });

            if (typeof acl1 == 'undefined') {
                acl1 = '';
            } else {
                acl1 = ' join g024 g024 on g024.idg024 = G032.idg024 ' + acl1;
            }

        } else {
            acl1 = '';
        }

        return await utils.searchComboBox("G032.IDG032",
            "G032.NRPLAVEI || ' [ ' || G032.NRFROTA || ' - ' || G032.DSRENAVA || ' - ' || G032.DSVEICUL || ' - ' || G032.NRCHASSI || ' ]'",
            "G032", ["G032.NRFROTA", "G032.NRPLAVEI", "G032.DSRENAVA", "G032.DSVEICUL", "G032.NRCHASSI"], req.body, true, undefined, false, acl1);
    };

    api.buscarFrota = async function(req, res, next) {
        let sql = `select
                      G032.NRFROTA
                from G032 G032
                Where G032.NRFROTA Like :parameter
                And G032.SNDELETE = 0 
                `;

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter.toUpperCase() + '%'
                }
            })
            .then((result) => {
                let result1 = [];
                if (result != 'undefined' || result.length > 0) {
                    result.forEach(element => {
                        let objResponse = { id: element.NRFROTA, text: element.NRFROTA };
                        result1.push(objResponse);
                    });
                    return utils.array_change_key_case(result1);
                } else {
                    return utils.array_change_key_case(result);
                }
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    api.buscarGrupoAtendimento = async function(req, res, next) {
        return await utils.searchComboBox("A016.IDA016",
            "A016.NMGRUPOC",
            "A016", ["A016.NMGRUPOC", "A016.IDA016"], req.body);
    }

    api.buscarContatoAtendimento = async function(req, res, next) {

        let sql = `
    Select Distinct G007.IDG007 as id,
      G007.NMCONTAT || ' - CONTATO' as text,
      2 as x
    From G007 G007
    Where G007.SNDELETE = 0
    AND G007.SNCONATE = 1
    AND (Upper(G007.NMCONTAT) Like Upper(:parameter))
    
    union all

    Select Distinct A016.IDA016 as id,
      A016.NMGRUPOC || ' - GRUPO' as text,
      1 as x
    From A016 A016
    JOIN A017 A017 ON (A016.IDA016 = A017.IDA016)
    JOIN G007 G007 ON (G007.IDG007 = A017.IDG007)
    Where A016.SNDELETE = 0
    AND G007.SNCONATE = 1
    AND (Upper(G007.NMCONTAT) Like Upper(:parameter))`;

        return await db.execute({
                sql,
                param: {
                    parameter: req.body.parameter + '%'
                }
            })
            .then((result) => {
                return utils.array_change_key_case(result);
            })
            .catch((err) => {
                throw err;
            });
    }


    api.buscarClienteAg = async function(req, res, next) {


        let sqlWhereAcl = await acl.montar({
            ids001: req.body.ids001,
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

        if (req.body.showCDUF) {
            let sql = `
      Select Distinct G005.IDG005 as id,
        G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']' || ' - ' || G003.NMCIDADE || '-' || G002.CDESTADO as text
              
      From G005 G005
      Left Join G022 G022
        On (G022.IdG005 = G005.IdG005 AND G022.SNINDUST = 1)
      Left Join G014 G014   
        On G014.IdG014 = G022.IdG014
      join G003 G003 
        On (G003.IDG003 = G005.IDG003) 
      Join G002 G002 
        On (G003.IDG002 = G002.IDG002)
      Where G005.SNDELETE = 0
      AND (Upper(G005.NMCLIENT) Like Upper(:parameter)
      or Upper(G005.RSCLIENT) Like Upper(:parameter)
      or Upper(G005.NMCLIENT) Like Upper(:parameter)
      or Upper(G005.CJCLIENT) Like Upper(:parameter)
      or (G005.IDG005) Like (:parameter)
      or (G005.IECLIENT) Like (:parameter)) ` + sqlWhereAcl;

            return await db.execute({
                    sql,
                    param: {
                        parameter: req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                })
                .catch((err) => {
                    throw err;
                });
        } else if (req.body.remetrans = true) {
            sql = `select G005.RSCLIENT, NMCLIENT, G005.IDG005 as id,
      case
          when G005.RSCLIENT <> G005.NMCLIENT
          then G005.RSCLIENT || '[' || G005.NMCLIENT || ']' || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'
          when G005.RSCLIENT = G005.NMCLIENT
          then G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'
          else G005.RSCLIENT || '[' || G005.NMCLIENT || ']' || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'
          end as text
          
          from g005 G005
          
          Where (Upper(G005.NMCLIENT) Like Upper(:parameter)
          or Upper(G005.RSCLIENT) Like Upper(:parameter)
          or Upper(G005.NMCLIENT) Like Upper(:parameter)
          or Upper(G005.CJCLIENT) Like Upper(:parameter)) Order by G005.RSCLIENT asc`;
            return await db.execute({
                    sql,
                    param: {
                        parameter: req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                })
                .catch((err) => {
                    throw err;
                });


        } else {
            return await utils.searchComboBox("G005.IDG005",
                "G005.NMCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT || ']'",
                "G005", ["G005.NMCLIENT", "G005.IDG005"], req.body);
        }
    }

    // # HORA CERTA # //
    api.buscarTipoOperacao = async function(req, res, next) {
        req.body.IDGRUPO = 1;
        return api.buscarTabelaDinamica(req, res, next);
    };

    api.buscarTipoPesagem = async function(req, res, next) {
        req.body.IDGRUPO = 3;
        return api.buscarTabelaDinamica(req, res, next);
    };

    api.buscarTipoFluxoVeiculo = async function(req, res, next) {
        req.body.IDGRUPO = 4;
        return api.buscarTabelaDinamica(req, res, next);
    };
    // # HORA CERTA # //

    /**Filtro clientes relacionados a EDI */
    api.buscarClientesEdi = async function(req, res, next) {

        console.log("Inicio buscar buscarClientesEdi");
        try {
            console.log("Parametros buscar (buscarClientesEdi): ", req.body.parameterDep.TPATOR);
            let sql = ` SELECT DISTINCT 
                  G014.IDG014 id, G014.DSOPERAC text, G094.SNATIVO 
                  FROM G014  
                  LEFT join G094 G094 ON G094.IDG014 = G014.IDG014 
                  LEFT join G022 G022 ON G022.IDG014 = G014.IDG014 and G022.SNINDUST=1 
                  where Upper(G014.DSOPERAC) Like Upper(:parameter) `
            return result = await db.execute({
                    sql,
                    param: {
                        parameter: '%' + req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                }).catch((err) => {
                    console.log("Erro:", err);
                    throw err;
                });

        } catch (err) {
            console.log("Erro:", err);
            throw new Error(err);
        }
    };

    api.buscarGrupos = async function(req, res, next) {
        return await utils.searchComboBox("S026.IDS026",
            "S026.TPGRUPO || ' - ' || S026.DSGRUPO",
            "S026", ["S026.TPGRUPO", "S026.DSGRUPO"], req.body);
    };

    api.buscarJanelas = async function(req, res, next) {
        return await utils.searchComboBox("H005.IDH005",
            "LPAD(H005.NRJANELA, 3, 0) || ' - ' || H005.DSJANELA",
            "H005", ["H005.DSJANELA", "H005.NRJANELA", "H005.IDH005"], req.body);
    };

    api.buscarCorVeiculo = async function(req, res, next) {
        req.body.IDGRUPO = 13;
        return api.buscarTabelaDinamica(req, res, next);
    };

    return api;

};