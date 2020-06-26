module.exports = function (app, cb) {

	const tmz = app.src.utils.DataAtual;
	const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
	var db = app.config.database;
	var utils = app.src.utils.FuncoesObjDB;
	var api = {};
	api.controller = app.config.ControllerBD;

	//-----------------------------------------------------------------------\\	

	api.cardsRecusa = async function (req, res, next) {
		const tplObjRet = [
			{
				label: "Transporte",
				indNum: null,
				bgColor: "#ef6c00",
				icon: "fas fa-truck",
				filtParam: "4"
			},
			{
				label: "Encerrado",
				indNum: null,
				bgColor: "#4caf50",
				icon: "fas fa-check",
				filtParam: "5"
			},
			{
				label: "Backlog",
				indNum: null,
				bgColor: "#ff5d5d",
				icon: "fas fa-bars",
				filtParam: "20"
			},
			{
				label: "Otimizando",
				indNum: null,
				bgColor: "#1e88e5",
				icon: "fas fa-cogs",
				filtParam: "23"
			},
/* 			{
				label: "Coleta agendada",
				indNum: null,
				bgColor: "#8e24aa",
				icon: "far fa-calendar-alt",
				filtParam: "24"
			} */
		]

		var objConn = await this.controller.getConnection();
		try {
			req.body.tableName = "DH";
			req.body.DH_STETAPA = { in: req.body.in };
			delete req.body.in;
			var [sqlWhere, bindValues] = utils.buildWhere(req.body, true);

			return await objConn.execute({
				sql: `SELECT DH.STETAPA, COUNT(*) QTSTATUS
                FROM G043 DH              
                ${sqlWhere ? sqlWhere + "AND TPDELIVE > 2 " : "WHERE TPDELIVE > 2"} 
                GROUP BY DH.STETAPA
                ORDER BY DH.STETAPA ASC`,
				param: bindValues
			}).then((res) => {
				let objRetorn = tplObjRet.map(d => {
					let resultFiltrado = res.filter(data => {
						return d.filtParam == data.STETAPA;
					})[0];

					if (resultFiltrado == null || resultFiltrado == undefined) {
						d.indNum = 0;
					} else {
						d.indNum = resultFiltrado.QTSTATUS;
					}

					return d;
				});

				return objRetorn;
			}).catch((err) => {
				throw err;
			});
			objConn.close();
		} catch (err) {
			objConn.closeRollback();
			throw err;
		}

    }

    //-----------------------------------------------------------------------\\
	/**
    * @description Realiza a busca dos dados da delivery
    *
    * @async
    * @function listar
    * @returns {Object} Retorna um objeto contendo todos os dados da delivery  
    *
    * @author Ítalo Andrade Oliveira
    * @since 18/07/2018
    */
    api.listar = async (req, res, next) => {

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G043', true);

        let sql = `SELECT
                    G043.IDG043,  
                    G043.IDS001,  
                    G043.IDG014,   
                    G043.IDG005RE,
                    G043.IDG005DE,
                    G043.IDG009PS,
                    G043.CDDELIVE,
                    G043.TPDELIVE,
                    G043.STDELIVE,
                    G043.SNINDSEG,
                    G043.STETAPA,
                    G043.STULTETA,
                    G043.SNLIBROT,
                    G043.CDPRIORI,
                    TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY hh:mm:ss') DTDELIVE,
                    TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY hh:mm:ss') DTLANCTO,
                    TO_CHAR(G043.DTFINCOL, 'DD/MM/YYYY hh:mm:ss') DTFINCOL,
                    TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY hh:mm:ss') DTENTCON,
                    G043.NRNOTA,
                    G043.NREMBSEC,
                    G043.PSBRUTO,
                    G043.PSLIQUID,
                    G043.VRVOLUME,
                    G043.VRDELIVE,
                    REMET.IDG005 AS REMET_IDG005,
                    REMET.NMCLIENT AS REMET_NMCLIENT,
                    DESTI.IDG005 AS DESTI_IDG005,
                    DESTI.NMCLIENT AS DESTI_NMCLIENT,
                    G009.DSUNIDAD AS G009_DSUNIDAD,
                    G009.CDUNIDAD AS G009_CDUNIDAD,
                    COUNT(G043.IDG043) OVER () AS COUNT_LINHA 
                FROM G043 --IDG005RE E IDG005DE
                    INNER JOIN G005 REMET ON
                        REMET.IDG005 = G043.IDG005RE
                    INNER JOIN G005 DESTI ON
                        DESTI.IDG005 = G043.IDG005DE 
                    INNER JOIN G009 ON
                    	G043.IDG009PS = G009.IDG009
                `
            + sqlWhere
            + sqlOrder
            + sqlPaginate;
        return await db.execute({
            sql,
            param: bindValues
        })
            .then((result) => {
                return (utils.construirObjetoRetornoBD(result, null, 4, 4));
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    }

    //-----------------------------------------------------------------------\\
	/**
    * @description Realiza a busca dos dados da delivery
    *
    * @async 
    * @function buscar
    * @returns {Object} Retorna um objeto contendo todos os dados da delivery  
    *
    * @author Ítalo Andrade Oliveira
    * @since 18/07/2018
    */
    api.buscar = async (req, res, next) => {

        let sql = `SELECT
                    G043.IDG043,
                    G043.IDS001,
                    G043.IDG005RE,
                    G043.IDG005DE,
                    G043.IDG009PS,
                    G043.CDDELIVE,
                    G043.TPDELIVE,
                    G043.STDELIVE,
                    G043.SNINDSEG,
                    G043.STETAPA,
                    G043.STULTETA,
                    G043.SNLIBROT,
                    G043.CDPRIORI,
                    G043.DTDELIVE, --TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') DTDELIVE,
                    G043.DTLANCTO, --TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY') DTLANCTO,
                    G043.DTFINCOL, --TO_CHAR(G043.DTFINCOL, 'DD/MM/YYYY') DTFINCOL,
                    G043.DTENTCON, --TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') DTENTCON,
                    G043.NRNOTA,
                    G043.NREMBSEC,
                    G043.PSBRUTO,
                    G043.PSLIQUID,
                    G043.VRVOLUME,
                    G043.VRDELIVE,
                    G045.IDG045 AS G045_IDG045,
                    G045.IDG010 AS G045_IDG010,
                    G045.IDG009PS AS G045_IDG009PS,
                    G045.IDG009UM AS G045_IDG009UM,
                    G045.NRORDITE AS G045_NRORDITE,
                    G045.NRONU AS G045_NRONU,
                    G045.VRUNIPRO AS G045_VRUNIPRO,
                    G050.IDG050 AS G050_IDG050,
                    G050.QTPRODUT AS G050_QTPRODUT,
                    G050.DSLOTE  AS G050_DSLOTE,
                    REMET.IDG005 AS REMET_IDG005,
                    REMET.NMCLIENT AS REMET_NMCLIENT,
                    DESTI.IDG005 AS DESTI_IDG005,
                    DESTI.NMCLIENT AS DESTI_NMCLIENT,
                    G009.DSUNIDAD AS G009_DSUNIDAD,
                    G009.CDUNIDAD AS G009_CDUNIDAD,
                    G043.IDG014,
                    G043.TPTRANSP,
                    G014.DSOPERAC AS G014_DSOPERAC 
                FROM G043 
                    INNER JOIN G045 ON 
                        G043.IDG043 = G045.IDG043
                    INNER JOIN G050 ON
                        G045.IDG045 = G050.IDG045
                    INNER JOIN G005 REMET ON
                        REMET.IDG005 = G043.IDG005RE
                    INNER JOIN G005 DESTI ON
                        DESTI.IDG005 = G043.IDG005DE
                    INNER JOIN G009 ON
                        G043.IDG009PS = G009.IDG009
                    INNER JOIN G014 ON
                        G043.IDG014 = G014.IDG014
                WHERE G043.IDG043 = ${req.params.id}`;

        return await db.execute({
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
    }

    return api;
}
