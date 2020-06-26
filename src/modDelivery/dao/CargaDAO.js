module.exports = function (app, cb) {

    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;

	var api = {};

    //-----------------------------------------------------------------------\\	

    api.buscarDadosCarga = async function (req, res, next) {

        var sql_piv  = await fldAdd.tabelaPivot({ objConn: req.objConn, nmTabela: 'G043'}, res, next).catch((err) => { throw err });
            sql_piv  = `INNER JOIN (${sql_piv}) CA ON CA.ID = G043.IDG043`;

        req.sql = 
            `SELECT
                G046.IDG046,
                G046.IDG024,
                G046.IDG028,
                G046.IDG030,
                G046.IDS001,

                G046.IDG031M1,
                G046.IDG031M2,
                G046.IDG031M3,

                G046.IDG032V1,
                G046.IDG032V2,
                G046.IDG032V3,

                G046.CDVIAOTI,
                G046.TPCARGA,
                G046.QTDISPER,
                G046.QTVOLCAR,
                G046.VRPOROCU,
                
                G046.VRCARGA,
                G046.PSCARGA,
                G046.DSCARGA,
                G046.TPORIGEM,
                G046.TPMODCAR,
                G046.SNCARPAR,
                G046.SNESCOLT,
                G046.STCARGA,
                G046.DTCARGA,
                G046.DTAGENDA,
                G046.DTCOLORI,
                G046.DTCOLATU,
                G046.DTCOLATU,
                G046.DTPRESAI,
                G046.DTSAICAR,

                G048.IDG005OR,
                G048.IDG005DE,
                G048.STINTCLI,
                G048.STINTINV,
                G048.NRSEQETA,
                G048.QTDISPER,
                G048.QTDISTOD,
                G048.QTVOLCAR,
                G048.PSDELETA,
                G048.DTINIETA,
                G048.DTFINETA,
                G048.DTPREORI,
                G048.DTPREATU,
                G048.DTENTCON,

                G049.IDG043,
                G049.NRORDEM,

                CA.NRPROTOC

            FROM G046

            INNER JOIN G048 
                ON G048.IDG046 = G046.IDG046

            INNER JOIN G049
                ON G049.IDG048 = G048.IDG048

            INNER JOIN G043
                ON G043.IDG043 = G049.IDG043

            ${sql_piv}

            WHERE 
                G046.SNDELETE = 0
                AND G043.SNDELETE = 0
                AND G046.STCARGA = 'C'
                AND G043.STETAPA = 8
                AND G043.TPDELIVE = '3'
                AND G043.IDG014 = ${req.IDG014}
                AND G043.IDG043 = ${req.IDG043RF}
            `;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\	

    api.insereContatoCliente = async function (objDelivery, res, next) {

        try {

            var parm = { objConn: objDelivery.objConn };

            parm.sql  = `INSERT INTO A005 (IDA001, IDG043) `;
            parm.sql += `SELECT IDA001, ${objDelivery.IDG043} IDG043 FROM A005 WHERE IDG043 = ${objDelivery.IDG043RF}`;
            
            await gdao.controller.setConnection(parm.objConn);
            await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

   //-----------------------------------------------------------------------\\

    api.insereOferecimento = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql  = `INSERT INTO O005 (IDG046, IDG024, DTOFEREC, DTRESOFE, IDS001OF, IDS001RE, STOFEREC) `;
            parm.sql += `SELECT ${req.IDG046N} AS IDG046, IDG024, DTOFEREC, DTRESOFE, IDS001OF, IDS001RE, STOFEREC
                         FROM O005 WHERE IDG046 = ${req.IDG046}`;

            await gdao.controller.setConnection(parm.objConn);
            await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    api.atualizaCargaCTE = async function (req, res, next) {

        try {

            req.sql = 
                `UPDATE G051 SET STINTCLI = 3, IDG046 = ${req.IDG046} WHERE IDG051 IN 
                (SELECT G052.IDG051 FROM G052 WHERE G052.IDG043 = ${req.IDG043RF})`;

            await gdao.controller.setConnection(req.objConn);
            await gdao.executar(req, res, next);

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            req.sql = `UPDATE G052 SET IDG043 = ${req.IDG043} WHERE IDG043 = ${req.IDG043RF}`;

            await gdao.controller.setConnection(req.objConn);
            await gdao.executar(req, res, next);

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            req.sql = `UPDATE G049 SET IDG051 = (SELECT IDG051 FROM G052 WHERE IDG043 = ${req.IDG043})
                       WHERE IDG043 = ${req.IDG043}`;
                       
            await gdao.controller.setConnection(req.objConn);
            await gdao.executar(req, res, next);

        } catch (err) {

            throw err;

        }        

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}
