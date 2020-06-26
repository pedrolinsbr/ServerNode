module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.buscaCanhoto = async function (req, res, next) {

        var parm = { objConn: req.objConn };

        //parm.fetchInfo = [{ column: 'CTDOCUME', type: 'BLOB' }];

        parm.sql = 
            `SELECT 
                G048.IDG046,
                G048.IDG048,
                G048.NRSEQETA,
                G043.IDG043,
                G043.CDDELIVE,
                G082.IDG082,
                G082.NMDOCUME,
                G082.TPDOCUME
                -- G082.CTDOCUME

            FROM G043 -- DELIVERY

            INNER JOIN G014 -- OPERACAO
                ON G014.IDG014 = G043.IDG014

            INNER JOIN G049 -- DELIVERY x ETAPA
                ON G049.IDG043 = G043.IDG043                

            INNER JOIN G048 -- ETAPA
                ON G048.IDG048 = G049.IDG048

            INNER JOIN G046 -- CARGA
                ON G046.IDG046 = G048.IDG046

            INNER JOIN G082 -- DIGITALIZAÇÕES
                ON G082.PKS007 = G043.IDG043
                AND G082.TPDOCUME = 'CTO'

            INNER JOIN S007 -- TABELAS
                ON S007.IDS007 = G082.IDS007
                AND S007.NMTABELA = 'G043'

            WHERE
                G046.STCARGA <> 'C' -- CANCELADA
                AND G046.TPMODCAR <> 1 -- 3PL
                AND G046.SNDELETE = 0
                AND G043.SNDELETE = 0
                AND G082.SNDELETE = 0
                AND G014.IDG097DO = 145 -- CHKRDC
                AND G043.TPDELIVE <> '5' -- AG
                AND G043.IDG043 = ${req.IDG043}
                
            ORDER BY 
                G082.DTDOCUME DESC
            OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`;

        return await gdao.executar(parm, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    return api;

}
