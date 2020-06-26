module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\  

    api.listarNotasCTe = async function (req, res, next) {

        var sql =
            `SELECT
                DISTINCT G051.IDG051,
                G051.CDCTRC,
                G051.NRCHADOC,
                G083.NRNOTA,
                --G083.IDG083,
                G005R.NMCLIENT NMREMETE,
                G005D.NMCLIENT NMDESTIN,
                TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY') DTEMINOT,
                NVL(QC.QTCANHOTO, 0) QTCANHOTO,
                NVL(QC.IDCANHOTOS, 0) IDCANHOTOS,
                CASE
                    WHEN (
                    SELECT
                        COUNT(DISTINCT g083x.idg083)
                    FROM
                        g052 G052x
                    INNER JOIN g051 G051x ON
                        g051x.idg051 = g052x.IDG051
                    INNER JOIN g043 g043x ON
                        g043x.idg043 = g052x.IDG043
                    INNER JOIN g083 g083x ON
                        g083x.idg083 = g052x.IDG083
                    WHERE
                        G043X.IDG043 = G043.IDG043
                        AND G051x.SNDELETE = 0
                        AND G043x.SNDELETE = 0
                        AND G083x.SNDELETE = 0) > 1 THEN g083.idg083
                    ELSE g043.idg043
                END AS IDG043,
                NVL(G043.SNAG, 0) AS ISAG,
                (
                    SELECT COUNT(DISTINCT g083x.idg083)
                FROM
                    g052 G052x
                INNER JOIN g051 G051x ON
                    g051x.idg051 = g052x.IDG051
                INNER JOIN g043 g043x ON
                    g043x.idg043 = g052x.IDG043
                INNER JOIN g083 g083x ON
                    g083x.idg083 = g052x.IDG083
                WHERE
                    G043X.IDG043 = G043.IDG043
                    AND G051x.SNDELETE = 0
                    AND G043x.SNDELETE = 0
                    AND G083x.SNDELETE = 0) AS TABELA,
                (
                SELECT
                    G046.IDG046
                FROM
                    G046 G046
                JOIN G048 G048 ON
                    G048.IDG046 = G046.IDG046
                JOIN G049 G049 ON
                    G049.IDG048 = G048.IDG048
                WHERE
                    G046.STCARGA <> 'C'
                    AND G049.IDG051 = G051.IDG051
                    AND G046.TPMODCAR IN (2,
                    3) FETCH FIRST ROW ONLY ) AS IS4PL
            FROM
                G051
            INNER JOIN G052 ON
                G052.IDG051 = G051.IDG051
            INNER JOIN G043 ON
                G043.IDG043 = G052.IDG043
                AND G043.SNDELETE = 0
            INNER JOIN G083 ON
                G052.IDG083 = G083.IDG083
                AND G083.SNDELETE = 0
            LEFT JOIN (
                SELECT
                    G082.PKS007,
                    LISTAGG(G082.IDG082, ',') WITHIN GROUP (ORDER BY G082.IDG082)
                    OVER (PARTITION BY G082.PKS007) AS IDCANHOTOS,
                    COUNT(*) QTCANHOTO
                FROM
                    G082 G082
                INNER JOIN S007 ON
                    S007.IDS007 = G082.IDS007
                    --AND S007.NMTABELA = 'G043'
                WHERE
                    G082.SNDELETE = 0
                    AND G082.TPDOCUME = 'CTO'
                GROUP BY
                    G082.PKS007, G082.IDG082 ) QC ON
                QC.PKS007 = (
                    CASE
                    WHEN (
                    SELECT
                        COUNT(DISTINCT g083x.idg083)
                    FROM
                        g052 G052x
                    INNER JOIN g051 G051x ON
                        g051x.idg051 = g052x.IDG051
                    INNER JOIN g043 g043x ON
                        g043x.idg043 = g052x.IDG043
                    INNER JOIN g083 g083x ON
                        g083x.idg083 = g052x.IDG083
                    WHERE
                        G043X.IDG043 = G043.IDG043
                        AND G051x.SNDELETE = 0
                        AND G043x.SNDELETE = 0
                        AND G083x.SNDELETE = 0) > 1 THEN g083.idg083
                    ELSE g043.idg043
                END
                )
            INNER JOIN G005 G005R ON
                G005R.IDG005 = G051.IDG005RE
            INNER JOIN G005 G005D ON
                G005D.IDG005 = G051.IDG005DE
            INNER JOIN G024 ON
                G024.IDG024 = G051.IDG024
                AND G024.SNDELETE = 0
            WHERE
                G051.SNDELETE = 0
                AND G051.STCTRC = 'A'
                AND G051.NRCHADOC = '${req.params.id}'
            ORDER BY
                G083.NRNOTA`;

        return await gdao.executar({ sql }, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\  

    api.getCanhotoById = async function (req, res, next) {

        var parm    = {};
        parm.fetchInfo = [{ column: 'CTDOCUME', type: 'BLOB' }];    
        parm.sql =
            `SELECT
                G082.CTDOCUME
            FROM G082 G082
            WHERE G082.IDG082 = '${req.params.id}'`;

        let result = await gdao.executar(parm, res, next).catch((err) => { throw err });
        if (result.length > 0) {
            let buff = null;
            let base64data = null;
            buff = new Buffer(result[0].CTDOCUME, 'base64');
            base64data = buff.toString('base64');
            result[0].CTDOCUME = base64data;
        } else {
            return []
        }
        return result

    }

    //-----------------------------------------------------------------------\\  

    return api;

}
