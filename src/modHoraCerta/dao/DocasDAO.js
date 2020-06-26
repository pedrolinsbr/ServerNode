module.exports = function (app, cb) {

    var api = {};
    var db = require(process.cwd() + '/config/database');
    var utils = app.src.utils.FuncoesObjDB;
    var log = app.config.logger;


    api.listar = async function (req, res, next) {

        var params = req.query;
        var strStart = (req.query.start != undefined ? req.query.start : 0);
        var strLength = (req.query.length != undefined ? req.query.length : 10);
        var arrOrder = [];

        if (params.order != null) {
            params.order.forEach(function (order) {
                arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
            })
            arrOrder = arrOrder.join();
        } else {
            arrOrder = ' H012.IdH012';
        }

        return await db.execute(
            {
                // sql: 'select * from G018 where SnDelete = 0',
                sql: `
              Select
                     H012.IdH012,
                     H012.DsDoca,
                     H012.StCadast,
                     TO_CHAR(H012.DTCADAST,'DD/MM/YYYY') DTCADAST,
                     H012.IdS001,
                     H012.SNDELETE,
                     S001.NmUsuari,
                     G028.NmArmaze,
                     COUNT(H012.IdH012) OVER () as count_linha
              From   H012 H012
                     Join S001 S001 on (S001.IdS001 = H012.IdS001)
                     Join G028 G028 on (G028.IdG028 = H012.IdG028)
              Where  H012.SnDelete = 0
              Order By `+ arrOrder + `
                     Offset `+ strStart + ` rows
                     Fetch next `+ strLength + ` rows only`,
                param: []
            })
            .then((result) => {
                console.log(result);
                return (utils.construirObjetoRetornoBD(result));
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    api.buscar = async function (req, res, next) {
        var id = req.params.id;

        return await db.execute(
            {
                sql: `
                Select
                       H012.IdH012,
                       H012.DsDoca,
                       H012.StCadast,
                       TO_CHAR(H012.DTCADAST,'DD/MM/YYYY') DTCADAST,
                       H012.IdS001,
                       H012.SNDELETE,
                       S001.NmUsuari,
                       G028.NmArmaze,
                       COUNT(H012.IdH012) OVER () as count_linha
                From   H012 H012
                       Join S001 S001 on (S001.IdS001 = H012.IdS001)
                       Join G028 G028 on (G028.IdG028 = H012.IdG028)
                Where  H012.SnDelete = 0  AND
                     H012.IdH012 = ` + id ,
                param: [],
            })
            .then((result) => {
                return (result[0]);
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    api.salvar = async function (req, res, next) {
      console.log("+++++++++++++++++++++++++++++++++");
      console.log("+++++++++++++++++++++++++++++++++");
      console.log("+++++++++++++++++++++++++++++++++");
      console.log(req.body);
      console.log("+++++++++++++++++++++++++++++++++");
      console.log("+++++++++++++++++++++++++++++++++");
      console.log("+++++++++++++++++++++++++++++++++");
        return await db.insert({
            tabela: 'H012',
            colunas: {
                //IdH012
                DsDoca: req.body.DSDOCA,
                StCadast: req.body.STCADAST,
                DtCadast: new Date(),
                IdG028: req.body.IDG028,
                IdS001: req.body.IDS001,
                SnDelete : 0
            },
            key: 'IdH012'
        })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    api.atualizar = async function (req, res, next) {
        var id = req.params.id;
        console.log("+++++++++++++++++++++++++++++++++");
        console.log("+++++++++++++++++++++++++++++++++");
        console.log("+++++++++++++++++++++++++++++++++");
        console.log(req.body);
        console.log("+++++++++++++++++++++++++++++++++");
        console.log("+++++++++++++++++++++++++++++++++");
        console.log("+++++++++++++++++++++++++++++++++");

        return await
            db.update({
                tabela: 'H012',
                colunas: {
                    DsDoca: req.body.DSDOCA,
                    StCadast: req.body.STCADAST,
                    IdG028: req.body.IDG028,
                    IdS001: req.body.IDS001,
                },
                condicoes: 'IdH012 = :id',
                parametros: {
                    id: id
                }
            })
                .then((result) => {
                    return { response: "Doca atualizada com sucesso" };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });
    };

    api.excluir = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'H012',
                colunas: {
                    SnDelete: 1
                },
                condicoes: 'IdH012 = :id',
                parametros: {
                    id: id
                }
            })
                .then((result) => {
                    return { response: "Excluído com sucesso" }
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    //erro(err);
                    throw err;
                });
    };

    return api;
};
