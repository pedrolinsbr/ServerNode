module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const db = app.src.modGlobal.controllers.dbGearController;
    var api = {};

    //-----------------------------------------------------------------------\\
    /**
    * @description Lista as cargas agendadas para hoje que aguardam sincronia de documentos
    * @function listSync4PL
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\    

    api.listSync4PL = async function (req, res, next) { 
    
        try { 
    
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

            var arCols = 
                [
                    'G046.IDG046',
                    'G046.STCARGA',
                    'G046.TPTRANSP',
                    'G046.SNCARPAR',
                    'G046.PSCARGA',
                    'G046.VRCARGA',
                    'G046.QTDISPER',
                    'G046.QTDISBAS',
                    'G028.IDG028',
                    'G028.NMARMAZE',
                    'G024.IDG024',
                    'G024.NMTRANSP',
                    'G002O.IDG002',
                    'G002O.CDESTADO',
                    'G003O.IDG003',
                    'G003O.NMCIDADE',
                    'G002D.IDG002',
                    'G002D.CDESTADO',
                    'G003D.IDG003',
                    'G003D.NMCIDADE',
                    'QSTAAGE.IDH006',
                    'QSLOT.HOINICIO',
                    'QSLOT.HOFINAL'
                ];

            var arColsSel = arCols.slice(0);
            var l = arColsSel.length;

            arColsSel[l-11] += ' IDESTORI';
            arColsSel[l-10] += ' CDESTORI';
            arColsSel[l-9]  += ' IDCIDORI';
            arColsSel[l-8]   = "UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO NMCIDORI";

            arColsSel[l-7]  += ' IDESTDES';
            arColsSel[l-6]  += ' CDESTDES';
            arColsSel[l-5]  += ' IDCIDDES';
            arColsSel[l-4]   = "UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO NMCIDDES";

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var sql = 
                `SELECT
                    ${arColsSel.join()},                        

                    CASE
                        WHEN G046.SNCARPAR = 'S' THEN 'LTL'
                        WHEN G046.SNCARPAR = 'N' THEN 'FTL'
                        ELSE 'ITL'
                    END TPLOAD,

                    CASE
                        WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA'
                        WHEN G046.TPTRANSP = 'V' THEN 'VENDA'
                        WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO'
                        WHEN G046.TPTRANSP = 'R' THEN 'RECUSA'
                        WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG'
                        ELSE 'OUTRO'
                    END DSTPTRA,

                    CASE
                        WHEN G046.STCARGA = 'B' THEN 'BACKLOG'	
                        WHEN G046.STCARGA = 'P' THEN 'PRÉ-APROVAÇÃO'	
                        WHEN G046.STCARGA = 'R' THEN 'DISTRIBUÍDA'
                        WHEN G046.STCARGA = 'O' THEN 'OFERECIDA'
                        WHEN G046.STCARGA = 'X' THEN 'RECUSADA'
                        WHEN G046.STCARGA = 'A' THEN 'ACEITA'
                        WHEN G046.STCARGA = 'S' THEN 'AGENDADA'
                        WHEN G046.STCARGA = 'T' THEN 'TRANSPORTE'
                        WHEN G046.STCARGA = 'C' THEN 'CANCELADA'
                        WHEN G046.STCARGA = 'E' THEN 'OCORRÊNCIA'
                        WHEN G046.STCARGA = 'F' THEN 'PRÉ-CARGA'
                        WHEN G046.STCARGA = 'D' THEN 'ENTREGUE'
                        ELSE 'OUTRO'
                    END DSSTACAR,

                    COUNT(DISTINCT G051.IDG051) QTDCTE,
                    COUNT(G049.IDG043) TTDLV,
                    COUNT(G052.IDG083) TTNFE,
                    SUM(CASE WHEN G049.IDG051 IS NOT NULL THEN 1 ELSE 0 END) TTDLVCTE,
                    COUNT(*) OVER() COUNT_LINHA 	
        
                FROM G046 -- CARGA
        
                INNER JOIN G028 -- ARMAZEM
                    ON G028.IDG028 = G046.IDG028
        
                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = G046.IDG024
        
                INNER JOIN 
                (
                    SELECT 
                        IDG046,
                        MIN(NRSEQETA) INICIO,
                        MAX(NRSEQETA) FIM

                    FROM G048

                    GROUP BY
                        IDG046
                ) ETAPA 
                    ON ETAPA.IDG046 = G046.IDG046

                INNER JOIN G048 G048O -- ETAPA ORIGEM
                    ON G048O.IDG046 = G046.IDG046
                    AND G048O.NRSEQETA = ETAPA.INICIO

                INNER JOIN G048 G048D -- ETAPA DESTINO
                    ON G048D.IDG046 = G046.IDG046
                    AND G048D.NRSEQETA = ETAPA.FIM

                INNER JOIN G005 G005O -- CLIENTE ORIGEM
                    ON G005O.IDG005 = G048O.IDG005OR
        
                INNER JOIN G005 G005D -- CLIENTE DESTINO 
                    ON G005D.IDG005 = G048D.IDG005DE
        
                INNER JOIN G003 G003O -- CIDADE DA ORIGEM
                    ON G003O.IDG003 = G005O.IDG003
        
                INNER JOIN G003 G003D -- CIDADE DESTINO
                    ON G003D.IDG003 = G005D.IDG003
            
                INNER JOIN G002 G002O -- UF ORIGEM
                    ON G002O.IDG002 = G003O.IDG002
            
                INNER JOIN G002 G002D -- UF DESTINO
                    ON G002D.IDG002 = G003D.IDG002
        
                INNER JOIN 
                (
                    SELECT
                        H024.IDG046,
                        MAX(H006.IDH006) IDH006

                    FROM H024 -- AGENDAMENTOS

                    INNER JOIN H006  -- STATUS DO AGENDAMENTO
                        ON H006.IDH006 = H024.IDH006
                    
                    WHERE
                        H024.SNDELETE = 0
                        AND H006.SNDELETE = 0
                        AND H006.TPMOVTO = 'C'
                        AND H006.STAGENDA NOT IN (9,10) -- FALTOU, CANCELADO
                
                    GROUP BY 
                        H024.IDG046 
                ) QSTAAGE 
                    ON QSTAAGE.IDG046 = G046.IDG046
        
                INNER JOIN 
                (
                    SELECT
                        H007.IDH006,
                        MAX(H007.IDH007) IDH007,
                        MAX(H007.HOINICIO) HOINICIO,
                        MAX(H007.HOFINAL) HOFINAL

                    FROM H007 -- SLOTS
            
                    WHERE
                        H007.SNDELETE = 0
                
                    GROUP BY
                        H007.IDH006 
                ) QSLOT 
                    ON QSLOT.IDH006 = QSTAAGE.IDH006

                INNER JOIN G048 -- ETAPA 
                    ON G048.IDG046 = G046.IDG046

                INNER JOIN G049 -- DELIVERY x ETAPA 
                    ON G049.IDG048 = G048.IDG048

                LEFT JOIN G052 -- CTE x NF
                    ON G052.IDG051 = G049.IDG051
                    AND G052.IDG043 = G049.IDG043

                LEFT JOIN G051 -- CTE
                    ON G051.IDG051 = G052.IDG051

                LEFT JOIN G083 -- NF
                    ON G083.IDG083 = G052.IDG083

                ${sqlWhere}
                    AND G024.IDG023 <> 2 -- 3PL NÃO BRAVO
                    AND G046.STCARGA <> 'C'
                    -- AND TRUNC(G046.DTCOLATU) = TRUNC(CURRENT_DATE)
                    AND (
                            (G051.IDG051 IS NULL) OR 
                                ((G051.SNDELETE = 0) AND 
                                (G051.STCTRC = 'A'))
                        )
                    AND (
                            (G083.IDG083 IS NULL) OR 
                            (G083.SNDELETE = 0)
                        )

                GROUP BY
                    ${arCols.join()}

                HAVING 

                    SUM(CASE 
                        WHEN G051.IDG051 IS NULL THEN 1 ELSE 0
                    END) > 0 OR 
                    
                    SUM(CASE 
                        WHEN G083.IDG083 IS NULL THEN 1 ELSE 0
                    END) > 0                           
        
                ORDER BY 
                    QSLOT.HOFINAL                
            
                ${sqlPaginate}`;

            var objConn = await db.controller.getConnection(null, req.UserId);

            var arRS = await db.execute({ objConn, sql, bindValues });

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) { 
    
            throw err;
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
    * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
    * @function detailSync4PL
    * @author Rafael Delfino Calzado
    * @since 11/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\    

    api.detailSync4PL = async function (req, res, next) {

        try {

            var sql = 
                `SELECT
                    G046.IDG046,
                    G046.PSCARGA,
                    G046.VRCARGA,
                    G046.SNCARPAR,
                    G046.QTDISPER,

                    G024.IDG024,
                    G024.NMTRANSP,

                    G051.IDG051,
                    G051.CDCTRC,
                    TO_CHAR(G051.DTEMICTR, 'DD/MM/YYYY') DTEMICTR,
                    G051.NRCHADOC NRCHACTE,
                    G051.STCTRC,
                    NVL(G051.VRTOTFRE, 0) VRTOTFRE,

                    G005.IDG005,
                    G005.NMCLIENT,

                    G043.IDG043,
                    G043.CDDELIVE,
                    G043.VRDELIVE,
                    G043.PSBRUTO,
                    TO_CHAR(G043.DTDELIVE, 'DD/MM/YYYY') DTDELIVE,

                    G083.IDG083,
                    G083.IDF004,
                    G083.NRNOTA,
                    G083.VRNOTA,
                    G083.NRCHADOC NRCHANFE,
                    TO_CHAR(G083.DTEMINOT, 'DD/MM/YYYY') DTEMINOT,
                    
                    CASE 
                        WHEN G046.SNCARPAR = 'S' THEN 'FTL'
                        WHEN G046.SNCARPAR = 'N' THEN 'FTL'
                        ELSE 'ITL'
                    END TPLOAD,

                    CASE   
                        WHEN G046.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                        WHEN G046.TPTRANSP = 'V' THEN 'VENDA' 
                        WHEN G046.TPTRANSP = 'D' THEN 'DEVOLUÇÃO' 
                        WHEN G046.TPTRANSP = 'R' THEN 'RECUSA' 
                        WHEN G046.TPTRANSP = 'G' THEN 'RETORNO AG' 
                        ELSE 'OUTRO'
                    END DSTPTRA,

                    UPPER(G003O.NMCIDADE) || ' / ' || G002O.CDESTADO NMCIDORI,
                    UPPER(G003D.NMCIDADE) || ' / ' || G002D.CDESTADO NMCIDDES

                FROM G046 -- CARGA 	

                INNER JOIN G024 ON -- 3PL
                    G024.IDG024 = G046.IDG024
                
                INNER JOIN (SELECT IDG046, MIN(NRSEQETA) INICIO, MAX(NRSEQETA) FIM FROM G048 GROUP BY IDG046) ETAPA
                    ON ETAPA.IDG046 = G046.IDG046

                INNER JOIN G048 G048O -- ETAPA ORIGEM
                    ON G048O.IDG046 = G046.IDG046
                    AND G048O.NRSEQETA = ETAPA.INICIO

                INNER JOIN G048 G048D -- ETAPA DESTINO
                    ON G048D.IDG046 = G046.IDG046 
                    AND G048D.NRSEQETA = ETAPA.FIM

                INNER JOIN G005 G005O -- CLIENTE ORIGEM
                    ON G005O.IDG005 = G048O.IDG005OR

                INNER JOIN G005 G005D -- CLIENTE DESTINO 
                    ON G005D.IDG005 = G048D.IDG005DE

                INNER JOIN G003 G003O -- CIDADE DA ORIGEM
                    ON G003O.IDG003 = G005O.IDG003

                INNER JOIN G003 G003D -- CIDADE DESTINO
                    ON G003D.IDG003 = G005D.IDG003

                INNER JOIN G002 G002O -- UF ORIGEM
                    ON G002O.IDG002 = G003O.IDG002

                INNER JOIN G002 G002D -- UF DESTINO
                    ON G002D.IDG002 = G003D.IDG002	                     

                INNER JOIN G048 -- ETAPAS 
                    ON G048.IDG046 = G046.IDG046
                    
                INNER JOIN G049 -- DELIVERIES x ETAPAS
                    ON G049.IDG048 = G048.IDG048

                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043
                    
                LEFT JOIN G051 -- CTE 
                    ON G051.IDG051 = G049.IDG051
                
                LEFT JOIN G005 -- DESTINATARIO
                    ON G005.IDG005 = G051.IDG005DE    	
                
                LEFT JOIN G052 -- NF x CTE
                    ON G052.IDG051 = G051.IDG051
                    
                LEFT JOIN G083 -- NF 
                    ON G083.IDG083 = G052.IDG083
                    AND G083.SNDELETE = 0

                WHERE
                    G046.SNDELETE = 0
                    AND G043.SNDELETE = 0
                    AND (
                        (G051.IDG051 IS NULL) OR 
                        (
                            (G051.SNDELETE = 0) AND 
                            (G051.STCTRC = 'A')
                        )
                    )
                    AND (
                        (G083.IDG083 IS NULL) OR 
                        (G083.SNDELETE = 0)
                    )
                    AND G046.IDG046 = ${req.params.id}

                ORDER BY 
                    G051.IDG051
                `;

            var objConn = await db.controller.getConnection(null, req.UserId);

            return await db.execute({ objConn, sql });
            
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Download XML do Documento
    * @function getXML
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\      

    api.getXML = async function (req) {

        try {

            var { NRCHADOC } = req.params;
            var TPXML = NRCHADOC.substr(44);
            var parm = { fetchInfo: "TXXML" };

            parm.sql = 
                `SELECT 
                    F004.TXXML 
                FROM F004 F004
                WHERE 
                    F004.NRCHADOC = '${NRCHADOC.substr(0, 44)}'          
                    AND F004.TPXML = ${TPXML}
                `;

            parm.objConn = await db.controller.getConnection(null, req.UserId);

            return await db.execute(parm);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    

    return api;

}
