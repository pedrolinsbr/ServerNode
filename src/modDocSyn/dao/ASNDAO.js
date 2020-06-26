module.exports = function (app, cb) {

    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;

    var api  = {};    

    api.controller = gdao.controller;
    api.inserir    = gdao.inserir;
    api.alterar    = gdao.alterar;
    api.remover    = gdao.remover;

    //-----------------------------------------------------------------------\\

    api.changeShipmentStatus = async function (req, res, next) {
        
        req.sql = 
            `UPDATE G043 
                SET STETAPA = ${req.STETAPA}
                WHERE IDG043 IN
                    (SELECT G049.IDG043 
                    FROM G049 
                    INNER JOIN G048 
                        ON G048.IDG048 = G049.IDG048
                        AND G048.IDG046 = ${req.IDG046})`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw (err) });

    }

    //-----------------------------------------------------------------------\\

    api.getASNData = async function (req, res, next) {

        try {

            var arInteracao = [];

            var sql_aux = '';

            var sql_piv  = await fldAdd.tabelaPivot({ objConn: req.objConn, nmTabela: 'G043'}, res, next);
                sql_piv  = `LEFT JOIN (${sql_piv}) CA ON CA.ID = G043.IDG043`;

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            switch (req.stInteracao) {
                case 0: //PRE-ASN                
                    arInteracao.push(req.stInteracao);
                    arInteracao.push(7); //PRE-ASN REPLACE

                    sql_aux  = "AND G046.STCARGA IN ('S', 'T') ";
                    sql_aux += "AND G043.STETAPA IN (3,4) ";
                    break;

                case 1: //ASN
                    arInteracao.push(req.stInteracao);

                    sql_aux  = "AND G046.STCARGA = 'T' ";
                    sql_aux += "AND G046.DTSAICAR IS NOT NULL ";
                    sql_aux += "AND G043.STETAPA IN (4,5) "; 
                    break;

                case 3: //PRE-ASN DELETE
                case 4: //ASN DELETE
                    arInteracao.push(req.stInteracao);

                    sql_aux  = "AND G046.STCARGA = 'C' ";
                    sql_aux += "AND G046.DTCANCEL < CURRENT_DATE - INTERVAL '40' MINUTE ";
                    break;

                case 8: //ASN RECUSA
                    arInteracao.push(0);

                    sql_aux  = "AND G046.STCARGA = 'D' ";
                    sql_aux += "AND G046.TPTRANSP = 'R' ";
                    sql_aux += "AND G046.DTSAICAR IS NOT NULL ";
                    sql_aux += "AND G043.STETAPA = 25 "; 
                    sql_aux += "AND G043.TPDELIVE = '4' ";
                    sql_aux += "AND CA.SNFIMREC IS NOT NULL ";
                    break;                             
                    
                case 10: //PRE-ASN L.R. DEVOLUÇÃO
                    arInteracao.push(0);

                    sql_aux  = "AND G046.STCARGA = 'A' ";
                    sql_aux += "AND G046.TPTRANSP = 'D' ";
                    sql_aux += "AND G043.STETAPA = 22 ";
                    sql_aux += "AND G043.TPDELIVE = '3' ";
                    break;

                case 11: //PRE-ASN L.R. DEVOLUÇÃO - AGENDAMENTO
                    arInteracao.push(0);
                    
                    sql_aux  = "AND G046.STCARGA = 'S' ";
                    sql_aux += "AND G046.TPTRANSP = 'D' ";
                    sql_aux += "AND G043.STETAPA = 23 ";
                    sql_aux += "AND G043.TPDELIVE = '3' ";
                    break;                

                case 12: //ASN L.R. DEVOLUÇÃO
                    arInteracao.push(1);
                                
                    sql_aux  = "AND G046.STCARGA = 'T' ";
                    sql_aux += "AND G046.TPTRANSP = 'D' ";
                    sql_aux += "AND G046.DTSAICAR IS NOT NULL ";
                    sql_aux += "AND G043.STETAPA = 24 ";
                    sql_aux += "AND G043.TPDELIVE = '3' ";
                    break;

                case 13: //ASN L.R. DEVOLUÇÃO (GHOST SHIPMENT)
                    arInteracao.push(1);

                    sql_aux  = "AND G046.STCARGA IN ('T', 'D') ";
                    sql_aux += "AND G046.DTSAICAR IS NOT NULL ";
                    sql_aux += "AND G043.STETAPA = 25 ";
                    sql_aux += "AND G043.TPDELIVE = '3' ";
                    sql_aux += "AND G043.DTENTREG IS NOT NULL ";
                    break;
                
                case 14: //ASN RECUSA NA ORIGEM
                    arInteracao.push(0);

                    sql_aux  = "AND G046.STCARGA = 'D' ";
                    sql_aux += "AND G046.DTSAICAR IS NOT NULL ";
                    sql_aux += "AND G043.STETAPA = 5 ";
                    sql_aux += "AND G043.DTENTREG IS NOT NULL ";
                    sql_aux += "AND CA.SNRECORI = 1 ";
                    break;  
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            req.sql = 
                `SELECT
                    G046.IDG046 IDCARGA,
                    G046.PSCARGA WEIGHT,
                    G046.DTCOLORI,
                    G046.DTPRESAI DTAGP,
                    G046.DTSAICAR DTACP,                

                    G024.NMTRANSP,

                    CASE
                        WHEN VE01.NRPLAVEI IS NOT NULL THEN UPPER(VE01.NRPLAVEI)
                        WHEN G046.NRPLAVEI IS NOT NULL THEN UPPER(G046.NRPLAVEI)
                        ELSE 'ABC-1234'
                    END NRPLACA1,

                    UPPER(NVL(VE02.NRPLAVEI, G046.NRPLARE1))  NRPLACA2,
                    UPPER(NVL(VE03.NRPLAVEI, G046.NRPLARE2))  NRPLACA3,

                    NVL(ROUND(G046.QTVOLCAR, 2), 0) VOLUME,

                    CASE 
                        WHEN G046.SNCARPAR = 'N' THEN 'FTL'
                        ELSE 'LTL'
                    END CONTLOAD,
                                        
                    I011.IDTIPVEI IDVEICUL,

                    G048.IDG048,
                    G048.STINTCLI,
                    G048.NRSEQETA NRETAPA,
                    ROUND(NVL(G048.QTDISTOD, G048.QTDISPER), 0) DISTANCE,
                    
                    G048.DTINIETA,
                    G048.DTFINETA,
                    
                    G049.NRORDEM LOADORD,
                    
                    G043.IDG043,
                    G043.TPDELIVE,
                    G043.CDDELIVE,
                    G043.DTENTCON DTEAD,
                    G043.DTENTREG DTAAD,
                    G043.CDFILIAL,
                    
                    CASE
                        WHEN TO_NUMBER(G043.TPDELIVE) = 1 THEN NVL(G022D.DSSHIPOI, '-')
                        ELSE G043.IDEXTCLI
                    END IDDESTIN,

                    CASE
                        WHEN OPCID.IDTRAOPE IS NOT NULL THEN OPCID.IDTRAOPE
                        ELSE OPUF.IDTRAOPE
                    END IDTRANSF,

                    CA.NRPROTOC IDCASA,
                    
                    G045.NRORDITE ITEMORD,
                    ROUND(G045.PSBRUTO,2) ITEMWGT,
                        
                    G009P.CDUNIDAD WGUNIT,
                    G009M.CDUNIDAD QTUNIT,
                    
                    SUM(G050.QTPRODUT) ITEMQTD
        
                FROM G046 --CARGA

                INNER JOIN G024 --TRANSPORTADORA
                    ON G024.IDG024 = G046.IDG024
                    AND G024.SNDELETE = 0

                INNER JOIN I011 --TPVEICULO
                    ON I011.IDG030 = G046.IDG030
                    AND I011.SNDELETE = 0

                LEFT JOIN G032 VE01 -- VEICULO 1
                    ON VE01.IDG032 = G046.IDG032V1
                    AND VE01.SNDELETE = 0
                    
                LEFT JOIN G032 VE02 -- VEICULO 1
                    ON VE02.IDG032 = G046.IDG032V2
                    AND VE02.SNDELETE = 0
                    
                LEFT JOIN G032 VE03 -- VEICULO 3
                    ON VE03.IDG032 = G046.IDG032V3
                    AND VE03.SNDELETE = 0

                INNER JOIN G048 --PARADA
                    ON G048.IDG046 = G046.IDG046

                INNER JOIN G049 --RELDELIVE
                    ON G049.IDG048 = G048.IDG048

                INNER JOIN G043 --DH
                    ON G043.IDG043 = G049.IDG043
                    AND G043.SNDELETE = 0

                INNER JOIN G014 --OPERACAO
                    ON G014.IDG014 = G043.IDG014

                INNER JOIN G005 --CLIENTE
                    ON G005.IDG005 = G043.IDG005RE
                    AND G005.SNDELETE = 0

                INNER JOIN G003 --CIDADE
                    ON G003.IDG003 = G005.IDG003
                    AND G003.SNDELETE = 0

                INNER JOIN I014 CCUF
                    ON CCUF.IDG002 = G003.IDG002
                    AND CCUF.SNDELETE = 0

                INNER JOIN G056 OPUF -- OPERADOR DE TRANSPORTE UF
                    ON OPUF.IDG024 = CCUF.IDG024
                    AND OPUF.IDG014 = G043.IDG014
                    AND OPUF.SNDELETE = 0

                LEFT JOIN G022 G022D --DESTINO
                    ON  G022D.IDG005 = G043.IDG005DE
                    AND G022D.IDG014 = G043.IDG014
                    AND G022D.SNDELETE = 0
                    AND G022D.SNINDUST = 1 

                LEFT JOIN I014 CCID
                    ON CCID.IDG002 = G003.IDG002
                    AND CCID.IDG003 = G003.IDG003
                    AND CCID.SNDELETE = 0

                LEFT JOIN G056 OPCID -- OPERADOR DE TRANSPORTE CIDADE
                    ON OPCID.IDG024 = CCID.IDG024
                    AND OPCID.IDG014 = G043.IDG014
                    AND OPCID.SNDELETE = 0

                ${sql_piv}

                INNER JOIN G045 --DI
                    ON G045.IDG043 = G043.IDG043
                    AND G045.SNDELETE = 0

                INNER JOIN G009 G009M --MEDIDA
                    ON G009M.IDG009 = G045.IDG009UM
                    AND G009M.SNDELETE = 0

                INNER JOIN G009 G009P --PESO
                    ON G009P.IDG009 = G045.IDG009PS
                    AND G009P.SNDELETE = 0

                INNER JOIN G050 --DL
                    ON G050.IDG045 = G045.IDG045
                    AND G050.SNDELETE = 0

                WHERE
                    G046.SNDELETE = 0
                    AND G046.TPMODCAR <> 1 
                    AND G046.DTAGENDA IS NOT NULL
                    AND G046.DTCOLORI IS NOT NULL
                    AND G046.DTPRESAI IS NOT NULL
                    
                    AND G048.DTINIETA IS NOT NULL
                    AND G048.DTFINETA IS NOT NULL
                    
                    AND G048.STINTCLI IN (${arInteracao.join()})

                    AND G043.DTENTCON IS NOT NULL
                    AND G043.TPDELIVE <> '5' -- AG
                    AND G014.IDG097DO = 145 -- CHKRDC
                    
                    ${sql_aux}

                GROUP BY

                    G046.IDG046,
                    G046.PSCARGA,
                    G046.QTVOLCAR,
                    G046.DTCOLORI,
                    G046.DTPRESAI,
                    G046.DTSAICAR,
                    G046.SNCARPAR,
                    G046.NRPLAVEI,
                    G046.NRPLARE1,
                    G046.NRPLARE2,

                    G024.NMTRANSP,
                                    
                    I011.IDTIPVEI,

                    VE01.NRPLAVEI,
                    VE02.NRPLAVEI,
                    VE03.NRPLAVEI,

                    G048.IDG048,
                    G048.STINTCLI,
                    G048.NRSEQETA,
                    G048.QTDISPER,
                    G048.QTDISTOD,
                    G048.DTINIETA,
                    G048.DTFINETA,
                    
                    G049.NRORDEM,
                    
                    G043.IDG043,
                    G043.TPDELIVE,
                    G043.CDDELIVE,
                    G043.DTENTCON,
                    G043.DTENTREG,

                    G043.CDFILIAL,
                    G043.IDEXTCLI,

                    G022D.DSSHIPOI,		

                    OPUF.IDTRAOPE,
                    OPCID.IDTRAOPE,

                    CA.NRPROTOC,
                    
                    G045.NRORDITE,
                    G045.PSBRUTO,
                        
                    G009P.CDUNIDAD,
                    G009M.CDUNIDAD
                    
                ORDER BY
                    G046.IDG046,
                    G048.NRSEQETA,
                    G049.NRORDEM,
                    G043.IDG043,
                    G045.NRORDITE`;

            return await gdao.executar(req, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}