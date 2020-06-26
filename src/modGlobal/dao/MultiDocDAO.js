module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    api.controller = gdao.controller;
    api.controllerV6 = app.config.ControllerBDV6;

    //-----------------------------------------------------------------------\\

    api.getInfoDoc = async function (req, res, next) {

        try {

            var strBlob = ``;
            var sqlAux = ``;
            var parm = {};

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            if (req.body.NMTABELA) {
                sqlAux += `AND S007.NMTABELA = '${req.body.NMTABELA}' `;
                if (req.body.PKS007) sqlAux += `AND G082.PKS007 = ${req.body.PKS007} `;
            }

            if (req.body.STDOCUME) sqlAux += `AND G082.STDOCUME = ${req.body.STDOCUME} `;
            if (req.body.TPDOCUME) sqlAux += `AND G082.TPDOCUME = '${req.body.TPDOCUME}' `;

            if (req.params.id) {
                sqlAux += `AND G082.IDG082 = ${req.params.id} `;
                parm.fetchInfo = [{ column: 'CTDOCUME', type: 'BLOB' }];
                strBlob = 'G082.CTDOCUME,';
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            parm.sql =
                `SELECT 
                    G082.IDG082,
                    G082.PKS007,
                    G082.STDOCUME,
                    G082.TMDOCUME,
                    G082.TPDOCUME,
                    G082.NMDOCUME,
                    G082.DSMIMETP,                    
                    TO_CHAR(G082.DTDOCUME, 'DD/MM/YYYY HH24:MI:SS') DTDOCUME,
                    ${strBlob}
    
                    S001.IDS001,
                    S001.NMUSUARI,
    
                    S007.IDS007,
                    S007.NMTABELA
    
                FROM G082
    
                INNER JOIN S001 -- USUÁRIOS
                    ON S001.IDS001 = G082.IDS001
    
                INNER JOIN S007 -- TABELAS
                    ON S007.IDS007 = G082.IDS007
    
                WHERE 
                    G082.SNDELETE = 0
                    ${sqlAux}`;

            return await gdao.executar(parm, res, next);


        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.getInfoDocCTE = async function (req, res, next) {
        try {
            const { PKS007 } = req.body;

            var parm = {};
            parm.fetchInfo = [{ column: 'CTDOCUME', type: 'BLOB' }];
            parm.sql = `
                SELECT 
                    g051.IDG051, 
                    g051.CTDOCUME, 
                    'photo.jpg' as NMDOCUME, 
                    'image/jpeg' as DSMIMETP,
                    ${PKS007 ? PKS007 : req.params.id} as PKS007
                FROM G051 G051
                JOIN G052 G052 ON (G052.IDG051 = G051.IDG051)
                JOIN G043 G043 ON (G043.IDG043 = G052.IDG043)
                WHERE G043.IDG043 = ${PKS007 ? PKS007 : req.params.id} And g051.CTDOCUME IS NOT NULL`;

            return await gdao.executar(parm, res, next);

        } catch (err) {
            throw err;
        }

    }

    //-----------------------------------------------------------------------\\

    api.findIdTableRef = async function (req, res, next) {

        var parm = { objConn: req.objConn }

        await gdao.controller.setConnection(parm.objConn);

        parm.sql = `SELECT IDS007 FROM S007 WHERE NMTABELA = '${req.NMTABELA}'`;

        return gdao.executar(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.saveDoc = async function (req, res, next) {

        try {

            await gdao.controller.setConnection(req.objConn);

            return await gdao.inserir(req, res, next)

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.generatePdfMobile = async function (req, res, next) {
        try {
            //GERAR O PDF DE CADA NOTA PELA IMAGEM DO CTE VINDO PELO REQ
            const { nfs } = req.body;
            let con = await this.controllerV6.openDB({ con: null, user: null });
            for (const [index, nf] of nfs.entries()) {
                let sql = `
                    UPDATE G043
                    SET DTENTMOB: dtEntreg, 
                    DTENTREG: dtEntreg, 
                    STETAPA: nf.tpDelive == 3 || nf.tpDelive == 4 ? 25 : 5 
                    WHERE IDG043 = ${nf.IDG043}
                `;
                await con.execute({ sql, param: [] })
                    .then(async result => {
                        return;
                    })
                    .catch(async (err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw (err);
                    });
                if (index + 1 === nfs.length) {
                    return;
                }
            }
        } catch (error) {

        }
    }

    return api;
}