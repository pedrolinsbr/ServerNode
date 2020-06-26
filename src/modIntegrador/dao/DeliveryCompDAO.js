module.exports = function (app, cb) {

    const gdao   = app.src.modGlobal.dao.GenericDAO;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;

    var api = {};

    api.controller = gdao.controller;

    //-----------------------------------------------------------------------\\

    api.listaDlvDetalhe = async function (req, res, next) {

        try {

            var arCols =
            [
                'G043.IDG043', 
                'G043.CDDELIVE',
                'G043.NRNOTA',
                'G043.CDPRIORI',
                'G043.SNINDSEG',
                
                'G005RE.NMCLIENT',
                'G005DE.NMCLIENT',
                
                'G043.DSEMACLI',
                'G043.DSEMARTV',
                'G043.TXINSTRU',	
                
                'G043.DTLANCTO',
                'G043.DTEMINOT',
                'G043.DTENTREG',
                'G043.STETAPA',
                
                'CA.STTEMPER',
                'CA.SNPALETI',
                'CA.CDGRUCLI',
                'CA.CDGRUPRE',
                
                'G045.IDG045',
                'G045.NRORDITE',
                'G045.CDLOCVEN',
            
                'G010.DSREFFAB',
                'G010.DSPRODUT',
                
                'G046.IDG046',
                'G046.PSCARGA',
                'G046.VRPOROCU',
                'G046.QTDISPER',
                'G046.SNCARPAR',
                'G046.NRPLAVEI',
                'G046.DTAGENDA',
                'G046.DTCOLATU',
                'G046.DTSAICAR',
                
                'G030.DSTIPVEI',
                
                'G048.DTPREATU',
            ];

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        var parm = { objConn: req.objConn };
        await gdao.controller.setConnection(parm.objConn);

        var sqlPivot = await fldAdd.tabelaPivot({ objConn: parm.objConn, nmTabela: 'G043' }, res, next);
            sqlPivot = `LEFT JOIN (${sqlPivot}) CA ON CA.ID = G043.IDG043`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        parm.sql = 
            `
            SELECT 
                ${arCols.join()},
                
                G005RE.NMCLIENT NMCLIREM,
                G005DE.NMCLIENT NMCLIDES,
                
                TO_CHAR(G043.DTLANCTO, 'DD/MM/YYYY HH24:MI') DTCADAST,
                TO_CHAR(G043.DTEMINOT, 'DD/MM/YYYY HH24:MI') DTEMISSA,
                TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY HH24:MI') DTCNFENT,
                
                TO_CHAR(G046.DTAGENDA, 'DD/MM/YYYY HH24:MI') DTAGENDF,
                TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY HH24:MI') DTPRECOL,
                TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY HH24:MI') DTCNFCOL,
                
                TO_CHAR(G048.DTPREATU, 'DD/MM/YYYY HH24:MI') DTPREENT,
                    
                CASE 
                    WHEN G043.STETAPA IN (0,20) THEN 'BACKLOG'
                    WHEN G043.STETAPA IN (1,21) THEN 'OTIMIZANDO'
                    WHEN G043.STETAPA IN (2,22) THEN 'AGENDADO'
                    WHEN G043.STETAPA IN (3,23) THEN 'OFERECENDO'
                    WHEN G043.STETAPA IN (4,24) THEN 'TRANSPORTE'
                    WHEN G043.STETAPA IN (5,25) THEN 'ENCERRADO'
                    WHEN G043.STETAPA IN (7)    THEN 'A CANCELAR'
                    WHEN G043.STETAPA IN (8)    THEN 'CANCELADO'
                END DSETAPA,
                
                CASE 
                    WHEN G046.SNCARPAR = 'S' THEN 'LTL'
                    ELSE 'FTL'
                END TPOCUPAC,

                CASE
                    WHEN G043.SNINDSEG = 'S' THEN 'SIM'
                    WHEN G043.SNINDSEG = 'N' THEN 'NÃO'
                END SNINDSEG,
                
                SUM(G050.QTPRODUT) TTPRODUT
            
            FROM G043	
                
            INNER JOIN G005 G005RE -- REMETENTE DELIVERY
                ON G005RE.IDG005 = G043.IDG005RE
                
            INNER JOIN G005 G005DE -- DESTINATARIO DELIVERY
                ON G005DE.IDG005 = G043.IDG005DE
                
            LEFT JOIN G049 -- DELIVERY x ETAPA
                ON G049.IDG043 = G043.IDG043 
                
            LEFT JOIN G048 -- ETAPA
                ON G048.IDG048 = G049.IDG048
                
            LEFT JOIN G046 -- CARGA
                ON G046.IDG046 = G048.IDG046
                AND G046.STCARGA <> 'C'
                AND G046.SNDELETE = 0
                
            LEFT JOIN G030 -- VEICULO 
                ON G030.IDG030 = G046.IDG030

            ${sqlPivot}
            
            INNER JOIN G045 -- ITENS DA DELIVERY 
                ON G045.IDG043 = G043.IDG043
                AND G045.SNDELETE = 0
                
            INNER JOIN G010 -- PRODUTOS
                ON G010.IDG010 = G045.IDG010	
                
            INNER JOIN G050 
                ON G050.IDG045 = G045.IDG045
                AND G050.SNDELETE = 0
                
            WHERE 
                G043.SNDELETE = 0		
                AND G043.IDG043 = ${req.params.id}
                
            GROUP BY	
                ${arCols.join()}

            ORDER BY 
                G045.NRORDITE`;


            return await gdao.executar(parm, res, next);


        } catch (err) {

            throw err;

        }        

    }

    //-----------------------------------------------------------------------\\

    api.listaTimeLine = async function (req, res, next) {

        var sql = 
            `SELECT 
                I001.DSEVENTO,
                TO_CHAR(I008.DTEVENTO, 'DD/MM/YYYY HH24:MI') DTEVENTO
            
            FROM I008 -- EVENTOS DA DELIVERY 
        
            INNER JOIN I001 -- EVENTOS 
                ON I001.IDI001 = I008.IDI001
            
            WHERE 
                I008.SNDELETE = 0
                AND I008.IDG043 = ${req.params.id}
            
            ORDER BY
                I008.DTEVENTO DESC`;

        return await gdao.executar({ sql }, res, next).catch((err) => { throw err });
            
    }

    //-----------------------------------------------------------------------\\

    return api;

}