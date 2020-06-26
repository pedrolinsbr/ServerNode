module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.inserir = async function (req, res, next ) {
        return await gdao.inserir(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    api.lastRC = async function (req, res, next) {

        //if (ACP == AGP) IDI007 = null;
        //if (AAD == EAD) IDI007 = null;
        //if (AAD < EAD) IDI007 = 50.50.50.54

        req.sql = 
            `SELECT 
                    H006.IDH006
                ,	H006.IDG046
                ,	H008.IDH008
                ,	I007.IDI007
                ,	I007.IDREACOD
        
            FROM H006 --AGENDAMENTOS 
            
            INNER JOIN H008 -- HISTÓRICO DE AGENDAMENTOS
                ON H008.IDH006 = H006.IDH006
                AND H008.SNDELETE = 0 
            
            INNER JOIN I017 -- REASON CODE
                ON I017.IDI015 = H008.IDI015
                AND I017.SNDELETE = 0 

            INNER JOIN G014 -- OPERACAO
                ON G014.IDG014 = I017.IDG014

            INNER JOIN I007
                ON I007.IDI007 = I017.IDI007
            
            WHERE 
                G014.IDG097DO = 145 -- CHKRDC
                AND H006.SNDELETE = 0
                AND H008.STAGENDA = 11
                AND H006.IDG046 = ${req.IDG046}
                
            ORDER BY H008.IDH008 DESC 
            OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.updStatusMS = async function (req, res, next) {

        req.sql = `UPDATE I013 SET STENVIO = 1 WHERE IDI013 = ${req.IDI013}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });
        
    }

    //-----------------------------------------------------------------------\\

    api.updStatusCTE = async function (req, res, next) {

        req.sql = `UPDATE G051 SET STINTCLI = ${req.STINTCLI} WHERE IDG051 = ${req.IDG051}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });    
        
    }

    //-----------------------------------------------------------------------\\    

    api.sentRedoMS = async function (req, res, next) {

        req.sql = `UPDATE H008 SET STENVIO = 1 WHERE IDH008 = ${req.IDH008}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });
        
    }

    //-----------------------------------------------------------------------\\    

    api.getMSData = async function (req, res, next) {

        req.sql = 
            `SELECT 
                    G046.IDG046    		    IDCARGA
                
                ,   G048.IDG048     		IDETAPA
                ,   G048.NRSEQETA   		NRETAPA
                
                ,   G003.NMCIDADE   		CITYNAME
                
                ,	I007.IDREACOD			REASCODE
                
                ,   I013.IDI013
                ,   I013.IDI001			    IDMSTYPE
                ,   I013.STPROPOS           MSPURPOS
                
                ,   I013.DTALTEVE           MSDATE
                
                ,   I013.DTEVENTO           DTCREATE
    
            FROM G046 -- CARGA 
            
            INNER JOIN G048 -- ETAPA
                ON G048.IDG046 = G046.IDG046
            
            INNER JOIN G005 -- CLIENTE DE DESTINO
                ON G005.IDG005 = G048.IDG005DE
            
            INNER JOIN G003 -- CIDADE DE DESTINO
                ON G003.IDG003 = G005.IDG003
            
            INNER JOIN I013 -- MILESTONE
                ON I013.IDG048 = G048.IDG048
            
            LEFT JOIN I007 -- REASONCODE
                ON I007.IDI007 = I013.IDI007
            
            WHERE 
                G046.SNDELETE = 0
                AND G048.STINTCLI > 0
                AND I013.SNDELETE = 0
                AND I013.STENVIO = 0
                AND I013.STPROPOS IN ('C', 'A', 'R')`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.getTrackingData = async function (req, res, next) {

        try {

            var sqlMSEnt = `SELECT IDG048, COUNT(*) TTMSENT FROM I013 WHERE IDI001 IN (21, 37) GROUP BY IDG048`;

            var arCols1 = 
            [
                'G051.IDG051',
                'G051.STINTCLI',
                'G048.IDG048',
                'QATENDE.DTATENDE',
                'I017.IDI007'
            ];
    
            var arCols2 =
            [
                'FN_DATA_SLA(G051.IDG051) DTULTEAD',
                'MIN(G043.DTENTCON) DTPRIEAD',
                'MIN(G043.DTENTREG) DTAAD', 
                'TRUNC(FN_DATA_SLA(G051.IDG051)) ULTEAD',
                'TRUNC(MIN(G043.DTENTCON)) PRIEAD',
                'TRUNC(MIN(G043.DTENTREG)) AAD',
                'MIN(G043.TPDELIVE) TPDELIVE',
                'NVL(QMSENT.TTMSENT,0) TTMSENT'
            ];
        
            var arColsSel1 = arCols1.map((a) => { return 'MS' + a.substr(a.indexOf('.')) });
            var arColsSel2 = arCols2.map((a) => { return 'MS.' + a.substr(a.indexOf(' ') + 1) });

            var sqlMon = this.sqlMonitoria();
    
            req.sql = 
                `
                WITH MS AS (
                    SELECT 
		                ${arCols1.join()},                   
                        ${arCols2.join()}

                    FROM G051 -- CTE
    
                    INNER JOIN G052 -- CTE x DELIVERY
                        ON G052.IDG051 = G051.IDG051
    
                    INNER JOIN G049 -- ETAPA x DELIVERY
                        ON G049.IDG043 = G052.IDG043
    
                    INNER JOIN G048 -- ETAPA
                        ON G048.IDG048 = G049.IDG048
                        
                    INNER JOIN G046 -- CARGA 
                        ON G046.IDG046 = G048.IDG046 
        
                    INNER JOIN G043 -- DELIVERY
                        ON G043.IDG043 = G049.IDG043

                    INNER JOIN G014 -- OPERACAO
                        ON G014.IDG014 = G043.IDG014

                    LEFT JOIN (${sqlMSEnt}) QMSENT -- MS AAD/RRO
                        ON QMSENT.IDG048 = G048.IDG048                        
                        
                    LEFT JOIN (${sqlMon}) QATENDE
                        ON QATENDE.IDG048 = G048.IDG048
                        
                    LEFT JOIN I017 -- MOTIVOS
                        ON I017.IDI015 = G051.IDI015
                        AND I017.IDG014 = G043.IDG014
                        AND I017.SNDELETE = 0
    
                    WHERE
                        G051.SNDELETE = 0                       
                        AND G051.STCTRC <> 'C'                
                        AND G051.STINTCLI IN (1,3)
                        AND G046.SNDELETE = 0 
                        AND G046.STCARGA <> 'C'
                        AND G046.TPMODCAR <> 1  
                        AND G048.STINTCLI > 0 
						AND G043.SNDELETE = 0                        
                        AND G043.DTENTCON IS NOT NULL                        
                        AND G043.TPDELIVE <> '5' -- AG
                        AND G014.IDG097DO = 145 -- CHKRDC
					    
                    
                    GROUP BY 
                        ${arCols1.join()}
                )
                
                SELECT 
                    ${arColsSel1.join()},
                    ${arColsSel2.join()} 
                    
                FROM MS WHERE 
                    (
                        MS.STINTCLI = 1 AND 
                        MS.ULTEAD IS NOT NULL AND
                        ((MS.ULTEAD >= MS.PRIEAD) OR (MS.ULTEAD = MS.DTATENDE))
                    ) 
                    OR 
                    (
                        MS.STINTCLI = 3 AND 
                        MS.AAD IS NOT NULL AND 
                        ((MS.AAD <= MS.PRIEAD) OR (MS.IDI007 IS NOT NULL))
                    )                
                `;
    
            return await gdao.executar(req, res, next);    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.sqlMonitoria = function() {

        var sql = 
            `SELECT 
                G049.IDG048,
                A001.IDA001,
                A001.STDATAS,
                TRUNC(A001.DTALTER1) DTATENDE
                    
            FROM G049 
                
            INNER JOIN A005 
                ON A005.IDG043 = G049.IDG043
                    
            INNER JOIN A001 
                ON A001.IDA001 = A005.IDA001
                
            INNER JOIN (
                SELECT 
                    G049Q.IDG048,
                    MAX(A005Q.IDA001) IDA001 
                FROM A005 A005Q 
                INNER JOIN G049 G049Q
                    ON G049Q.IDG043 = A005Q.IDG043
                GROUP BY G049Q.IDG048 
            ) Q1 
                ON Q1.IDG048 = G049.IDG048
                AND Q1.IDA001 = A001.IDA001
                
            WHERE 
                A001.SNDELETE = 0
                AND A001.STDATAS IN ('P', 'C', 'A')
                AND A001.DTALTER1 IS NOT NULL`;


        return sql;
    }

    //-----------------------------------------------------------------------\\

    api.cancelaEntregaCarga = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql = 
                `UPDATE G046 
                    SET STCARGA = 'T' 
                WHERE 
                    STCARGA = 'D'  
                    AND IDG046 IN 
                        (SELECT G048.IDG046 
                        FROM G048
                        INNER JOIN G049 
                            ON G049.IDG048 = G048.IDG048	
                        WHERE
                            G049.IDG043 = ${req.IDG043})`;

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\       
        
    api.cancelaEntregaDelivery = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql = 
                `UPDATE G043 SET 
                    DTENTREG = NULL, 
        
                    STETAPA = 
                        CASE 
                            WHEN TPDELIVE < 3 THEN 4 
                            WHEN CDDELIVE IS NULL THEN STETAPA /*QUANDO FOR 3PL*/
                            ELSE 24
                        END
                WHERE 
                    (STETAPA IN (5,25) OR NVL(IDG014,0) <> 5) /*ENTRAR 3PL TAMBÉM*/
                    AND DTENTREG IS NOT NULL 
                    AND IDG043 = ${req.IDG043}`;

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.cancelaMSAAD = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql = 
                `INSERT INTO I013 (IDG048, IDI001, STPROPOS, DTALTEVE, DTEVENTO)  
                SELECT 
                    049.IDG048, 
                    21 IDI001, 
                    'R' STPROPOS, 
                    CURRENT_DATE DTALTEVE, 
                    CURRENT_DATE DTEVENTO 
                FROM G049 
                INNER JOIN G043 
                    ON G043.IDG043 = G049.IDG043
                INNER JOIN G014
                    ON G014.IDG014 = G043.IDG014
                WHERE 
                    G014.IDG097DO = 145 -- CHKRDC
                    AND G043.STETAPA IN (5,25) 
                    AND G043.IDG043 = ${req.IDG043}`;

            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }
        
    }

    //-----------------------------------------------------------------------\\

    return api;

}