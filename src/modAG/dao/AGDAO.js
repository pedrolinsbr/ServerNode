module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    api.controller = gdao.controller;

    //-----------------------------------------------------------------------\\

    api.consultaDelivery = async function (req, res, next) {

        req.sql = 
            `SELECT 
                IDG043, CDDELIVE, STETAPA 
            FROM G043 
            WHERE 
                SNDELETE = 0 AND 
                STETAPA = 0 AND 
                TPDELIVE = '5' AND
                CDDELIVE = '${req.CDDELIVE}'`;

        await gdao.controller.setConnection(req.objConn);

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }


    //-----------------------------------------------------------------------\\

    api.cancelaDelivery = async function (req, res, next) {

        req.sql = 
            `UPDATE G043 
                SET STETAPA = 8 
            WHERE 
                SNDELETE = 0 AND 
                STETAPA = 0 AND 
                TPDELIVE = '5' AND
                IDG043 = ${req.IDG043}`;

        await gdao.controller.setConnection(req.objConn);

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    api.cancelaItemDelivery = async function (req, res, next) {

        req.sql = 
            `UPDATE G045 
                SET SNDELETE = 1 
            WHERE 
                SNDELETE = 0 AND 
                TPDELIVE = '5' AND
                IDG043 = ${req.IDG043} 
                AND NRORDITE IN (${req.NRORDITE.join()})`;

        await gdao.controller.setConnection(req.objConn);

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\    
    
    api.buscaVendaAG = async function (req, res, next) {

        req.objConn = await gdao.controller.getConnection();

        var arCols = 
            [
                'G046.IDG046',		
                'G046.QTDISPER QTDISTOT',
                'G046.SNCARPAR',
                "TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY') DTCARGA",
                "TO_CHAR(G046.DTCOLORI, 'DD/MM/YYYY') DTAGP",
                "TO_CHAR(G046.DTSAICAR, 'DD/MM/YYYY') DTACP",

                'G024.NMTRANSP',
                'G024.RSTRANSP',
                'G024.TPPESSOA',
                'G024.CJTRANSP',
                'G024.IETRANSP',
                'G024.DSENDERE',
                'G024.NRENDERE',
                'G024.DSCOMEND',
                'G024.BIENDERE',
                'G024.CPENDERE',

                'G007.NMCONTAT',
                'G008E.DSCONTAT EMTRANSP',
                'G008T.DSCONTAT TLTRANSP',

                'G003TP.CDMUNICI',

                'G030.DSTIPVEI',

                'G048.IDG048',
                'G048.NRSEQETA',
                'G048.QTDISPER QTDISETA',
                
                'G043.IDG043',
                'G043.STETAPA',
                'G046.STCARGA',
                'G043.CDDELIVE',
                "TO_CHAR(FN_DATA_SLA(G051.IDG051), 'DD/MM/YYYY') DTEAD",
                "TO_CHAR(G043.DTENTREG, 'DD/MM/YYYY') DTAAD",

                'G051.VRTOTFRE',
                'G051.IDG051',
                'G051.CDRASTRE'
            ];

        req.sql =
            `SELECT 
                ${arCols.join()},
                CASE 
                    WHEN G046.SNCARPAR = 'N' THEN 'FECHADA'
                    ELSE 'FRACIONADA'
                END SNCARPAR
                    
            FROM G046 -- CARGAS

            LEFT JOIN G024 -- TRANSPORTADORA
                ON G024.IDG024 = G046.IDG024
                AND G024.SNDELETE = 0

            LEFT JOIN G003 G003TP -- CIDADE TRANSPORTADORA
                ON G003TP.IDG003 = G024.IDG003
                AND G003TP.SNDELETE = 0
            
            INNER JOIN G030 -- TIPO DE VEÍCULOS
                ON G030.IDG030 = G046.IDG030
                --AND G030.SNDELETE = 0
            
            INNER JOIN G048 -- ETAPAS
                ON G048.IDG046 = G046.IDG046
                AND G046.SNDELETE = 0
                
            INNER JOIN G049 -- DELIVERIES x ETAPA
                ON G049.IDG048 = G048.IDG048
            
            INNER JOIN G043 -- DELIVERIES
                ON G043.IDG043 = G049.IDG043
                AND G043.SNDELETE = 0

            INNER JOIN G014 -- OPERACAO
                ON G014.IDG014 = G043.IDG014 

            LEFT JOIN G052 -- DELIVERIES x CTE
                ON G052.IDG043 = G043.IDG043

            LEFT JOIN G051 G051
                ON G051.IDG051 = G052.IDG051
                AND G051.SNDELETE = 0
                AND G051.STCTRC = 'A'

            LEFT JOIN (
                SELECT IDG024, MIN(IDG007) IDG007 FROM G025 GROUP BY IDG024
            ) G025M -- CONTATO UNICO TRANSPORTADORA
                ON G025M.IDG024 = G024.IDG024

            LEFT JOIN G007 -- CONTATOS
                ON G007.IDG007 = G025M.IDG007
                AND G007.SNDELETE = 0
                
            LEFT JOIN G008 G008E -- EMAIL DE CONTATO
                ON G008E.IDG007 = G007.IDG007
                AND G008E.SNDELETE = 0
                AND G008E.TPCONTAT = 'E'

            LEFT JOIN G008 G008T -- TELEFONE DE CONTATO
                ON G008T.IDG007 = G007.IDG007
                AND G008T.SNDELETE = 0
                AND G008T.TPCONTAT = 'T'
                
            WHERE 
                G046.SNDELETE = 0                
                AND G046.STCARGA  <> 'C' 
                AND G046.TPMODCAR <> 1
                AND G048.STINTINV = 0
                AND G043.TPDELIVE = '5' -- VENDA AG
                AND G014.SN4PL = 1 -- CHKRDC 
                AND NVL(G043.SNAG,0) <> 2
                
            ORDER BY 
                    G046.IDG046
                ,	G048.IDG048
                ,   G051.IDG051`;
            
            /* Data: 15/02/2019
             * Antes a previsão de entrega era assim TO_CHAR(NVL(G051.DTENTPLA, G043.DTENTCON), 'DD/MM/YYYY') DTEAD
             * alterei para TO_CHAR(G043.DTENTCON, 'DD/MM/YYYY') DTEAD a pedido do Ênio, tb foi solicitado
             * alterar a data a previsão de despacho TO_CHAR(G046.DTPRESAI, 'DD/MM/YYYY') DTAGP para
             * TO_CHAR(G046.DTCOLORI, 'DD/MM/YYYY') DTAGP
             */

            await req.objConn.close();
            
        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\

    api.marcarVendaAG = async function (req, res, next) {

        try{

            req.objConn = await gdao.controller.getConnection();

            req.sql =
            `SELECT 
                    G043.IDG043,
                    G043.CDDELIVE,
                    G051.IDG051,
                    G043.STETAPA,
                    G046.STCARGA  
                FROM G046 -- CARGAS
                
                INNER JOIN G030 -- TIPO DE VEÍCULOS
                    ON G030.IDG030 = G046.IDG030
                    --AND G030.SNDELETE = 0
                
                INNER JOIN G048 -- ETAPAS
                    ON G048.IDG046 = G046.IDG046
                    AND G046.SNDELETE = 0
                    
                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG048 = G048.IDG048
                
                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043
                    AND G043.SNDELETE = 0

                INNER JOIN G052 -- DELIVERIES x CTE
                    ON G052.IDG043 = G043.IDG043

                INNER JOIN G051 G051
                    ON G051.IDG051 = G052.IDG051
                    AND G051.SNDELETE = 0
                    AND G051.STCTRC = 'A'
                    
                WHERE G043.CDDELIVE = '${req.delivery}' 
                 AND G046.STCARGA <> 'C' `;
                
            var result = await gdao.executar(req, res, next).catch((err) => { throw err });

            if(result.length > 0 && (result[0].STETAPA == 5 || result[0].STCARGA == 'D')){

                req.sql = 
                `UPDATE G043 
                    SET SNAG = 2 
                WHERE 
                    CDDELIVE = '${req.delivery}'`;

                //await gdao.controller.setConnection(req.objConn);
                await gdao.executar(req, res, next).catch((err) => { throw err });
            }

            await req.objConn.close();

            return result;

        }catch(err){
            await req.objConn.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    }

    return api;

}