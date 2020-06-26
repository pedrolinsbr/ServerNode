module.exports = function (app, cb) {

	const utils = app.src.utils.FuncoesObjDB;
	const gdao  = app.src.modGlobal.controllers.dbGearController;

	var api = {};

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista os CTe's que não concluíram entrega
    * @function listND
    * @author Rafael Delfino Calzado
    * @since 12/12/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\    

	api.listND = async function (req) {

		try {

			var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

            var arCols = 
                [
                    'G0513PL.IDG051',
                    'G0513PL.VRTOTFRE',
                    'G024.IDG024',
                    'G024.NMTRANSP',
                    'G005.IDG005',
                    'G005.NMCLIENT',
                    'G003.IDG003',
                    'G003.NMCIDADE',
                    'G002.IDG002',
                    'G002.CDESTADO',	
                    'G0514PL.IDG051',
                    'G0514PL.VRTOTFRE',
                    'G046.IDG046',
                    'G046.SNCARPAR',
                    'G046.STCARGA',
                    'G046.TPTRANSP'
                ];

            var arColsSel = arCols.slice(0);

            arColsSel[0]  += ' IDCTE3PL';
            arColsSel[1]  += ' VRFRE3PL';
            arColsSel[10] += ' IDCTE4PL';
            arColsSel[11] += ' VRFRE4PL';

            var sql =
                `SELECT 
                    ${arColsSel.join()},

                    UPPER(G003.NMCIDADE) || ' / ' || G002.CDESTADO NMCIDDES,
                    
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

                    NVL(QATENDE.TTDELIVE, 0) TTDELIVE,
                    NVL(QATENDE.TTATENDE, 0) TTATENDE,

                    COUNT(*) OVER() COUNT_LINHA  
                
                FROM G051 G0513PL -- CTE3PL
                
                INNER JOIN G024 -- EMISSOR
                    ON G024.IDG024 = G0513PL.IDG024
                
                INNER JOIN G005 -- DESTINATÁRIO
                    ON G005.IDG005 = G0513PL.IDG005RE
                    
                INNER JOIN G003 -- CIDADE DESTINO
                    ON G003.IDG003 = G005.IDG003
                    
                INNER JOIN G002 -- ESTADO DESTINO
                    ON G002.IDG002 = G003.IDG002
                
                INNER JOIN G064 -- CTE4PL x CTE3PL
                    ON G064.IDG051AT = G0513PL.IDG051
                    
                INNER JOIN G051 G0514PL -- CTE4PL
                    ON G0514PL.IDG051 = G064.IDG051AN
                    
                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG051 = G0514PL.IDG051
                    
                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043
                    
                INNER JOIN G048 -- ETAPA
                    ON G048.IDG048 = G049.IDG048
                    
                INNER JOIN G046 -- CARGA
                    ON G046.IDG046 = G048.IDG046

                INNER JOIN ( 
                    SELECT 
                        G046.IDG046,
                        COUNT(DISTINCT G049.IDG043) TTDELIVE,
                        COUNT(*) TTATENDE
                    FROM G046
                    INNER JOIN G048 
                        ON G048.IDG046 = G046.IDG046
                    INNER JOIN G049
                        ON G049.IDG048 = G048.IDG048
                    INNER JOIN A005
                        ON A005.IDG043 = G049.IDG043
                    GROUP BY
                        G046.IDG046
                ) QATENDE
                    ON QATENDE.IDG046 = G046.IDG046
                    
                LEFT JOIN G052 -- CTe x NFe
                    ON G052.IDG051 = G0514PL.IDG051
                    
                LEFT JOIN G083 -- NFe
                    ON G083.IDG083 = G052.IDG083
                    
                ${sqlWhere} 
                    AND G0513PL.SNDELETE = 0
                    AND G0513PL.STCTRC = 'A'
                    AND G0514PL.SNDELETE = 0
                    AND G0514PL.STCTRC = 'A'
                    AND G046.STCARGA <> 'C'
                    AND G046.TPMODCAR <> 1
                    --AND TO_CHAR(G046.DTCARGA, 'MM/YYYY') = TO_CHAR(CURRENT_DATE, 'MM/YYYY')
                
                GROUP BY 
                    ${arCols.join()}
                    
                HAVING
                    MIN(QATENDE.TTATENDE) > 0 
                    AND 
                    MIN(G043.DTENTREG) IS NULL 
                    AND
                    SUM(CASE WHEN G083.IDG043 IS NULL THEN 1 ELSE 0 END) = 0	
                    
                ${sqlOrder}
                ${sqlPaginate}
                `;

            var objConn = await gdao.controller.getConnection(null, req.UserId);

            var arRS = await gdao.execute({ sql, objConn, bindValues });

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\   
    /**
    * @description Lista chamados de ocorrências com as Deliveries do CTe
    * @function listCalls
    * @author Rafael Delfino Calzado
    * @since 12/12/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\  
        
    api.listCalls = async function (req, res, next) { 
    
        try { 
    
            var sql = 
                `SELECT 
                    G051.IDG051,
                    G051.CDCTRC,
                    G043.IDG043,
                    G043.CDDELIVE,
                    G043.NRNOTA,
                    A001.IDA001,
                    A001.NMSOLITE,
                    TO_CHAR(A001.DTREGIST, 'DD/MM/YYYY HH24:MI') DTREGIST,
                    DBMS_LOB.SUBSTR(A003.DSOBSERV, 4000, 1) DSOBSERV

                FROM G043 -- DELIVERY

                INNER JOIN G049 -- DELIVERY x ETAPA
                    ON G049.IDG043 = G043.IDG043 

                INNER JOIN G048 --ETAPA
                	ON G048.IDG048 = G049.IDG048
                	
                INNER JOIN G046 -- CARGA
                	ON G046.IDG046 = G048.IDG046

                INNER JOIN G051 -- CTE4PL
                    ON G051.IDG051 = G049.IDG051

                INNER JOIN A005 -- ATENDIMENTO x DELIVERY
                    ON A005.IDG043 = G049.IDG043

                INNER JOIN A001 -- ATENDIMENTO
                    ON A001.IDA001 = A005.IDA001

                INNER JOIN A003 -- DETALHE ATENDIMENTO
                    ON A003.IDA001 = A001.IDA001

                WHERE 
                    G043.SNDELETE = 0
                    AND G046.SNDELETE = 0 
                    AND G046.STCARGA <> 'C'
                    AND G046.TPMODCAR <> 1
                    AND A001.SNDELETE = 0
                    AND G049.IDG051 = ${req.params.id}

                ORDER BY
                    G043.IDG043,
                    A001.DTREGIST DESC
               `;

               var objConn = await gdao.controller.getConnection(null, req.UserId);

               return await gdao.execute({ sql, objConn });
   
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\

    return api;

}
