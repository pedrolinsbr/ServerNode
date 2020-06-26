module.exports = function (app, cb) {

    var api = {};
    var db = require(process.cwd() + '/config/database');
    var utils = app.src.utils.FuncoesObjDB;
    api.controller = app.config.ControllerBD;

    const gdao = app.src.modGlobal.dao.GenericDAO;

    api.listar = async function (req, res, next) {

        let con = await this.controller.getConnection();

        try {

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'T013', true);

            let result = await con.execute(
                {
                    sql: `
                    SELECT IDT013,
                        DSMOTIVO, 
                        TO_CHAR(T013.DTCADAST, 'DD/MM/YYYY') DTCADAST,

                        CASE WHEN T013.TPMOTIVO = 1 THEN 'Delivery'
                        WHEN T013.TPMOTIVO = 2 THEN 'Carga'
                        ELSE '' END AS TPMOTIVO,

                        CASE WHEN T013.STCADAST = 'A' THEN 'Ativo'
                        WHEN T013.STCADAST = 'I' THEN 'Inativo'
                        ELSE '' END AS STCADAST,

                        COUNT(T013.IDT013) OVER () as COUNT_LINHA

                        FROM T013 
                            ${sqlWhere}` +
                            sqlOrder +
                            sqlPaginate,
                        param: bindValues
                })
                .then((result) => {
                    return (utils.construirObjetoRetornoBD(result));
                })
                .catch((err) => {
                    throw err;
                });

            await con.close();
            return result;

        } catch (err) {

            await con.closeRollback();
            throw err;

        }
    };

    api.buscar = async function (req, res, next) {
        let con = await this.controller.getConnection();

        try {

            var id = req.params.id;
            id = parseInt(id);

            let result = await con.execute(
                {
                    sql: ` SELECT IDT013,
                                  DSMOTIVO,
                                  TPMOTIVO,
                                  STCADAST
                                    FROM T013
                                    WHERE T013.IDT013 = :id
                                    AND T013.SNDELETE = 0`,
                    param: {
                        id: id
                    }
                })
                .then((result) => {
                    return (result[0]);
                })
                .catch((err) => {
                    throw err;
                });

            await con.close();
            return result;

        } catch (err) {

            await con.closeRollback();
            throw err;
        }
    };

    api.inserir = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		objBanco = {
			table:    'T013'
		  , key:      ['IDT013']
		  , vlFields:  {
            DSMOTIVO : req.body.DSMOTIVO,
            TPMOTIVO:  req.body.TPMOTIVO,
            IDS001: req.body.IDS001,
            STCADAST: req.body.STCADAST
          }
		  }

		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });

    }
    
    api.atualizar = async function (req, res, next) {

        req.sql =
            `UPDATE T013
                SET DSMOTIVO = '${req.body.DSMOTIVO}',
                    TPMOTIVO = ${req.body.TPMOTIVO},
                    STCADAST = '${req.body.STCADAST}'
                WHERE IDT013 = ${req.body.IDT013}`;

        return await gdao.executar(req, res, next).catch((err) => { throw (err) });
    }

    api.remover = async function (req, res, next) {

        var id = req.params.id;

        req.sql =
            `UPDATE T013
                SET SNDELETE = 1
                WHERE IDT013 = ${id}`;

        return await gdao.executar(req, res, next).catch((err) => { throw (err) });
    }


    return api;
}