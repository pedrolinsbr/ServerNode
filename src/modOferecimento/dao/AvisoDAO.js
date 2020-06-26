module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    api.controller = gdao.controller;
    api.alterar    = gdao.alterar;

    //-----------------------------------------------------------------------\\
    /**
     * Lista cargas oferecidas há mais de 60 minutos sem resposta
     * @function api/listaSemResposta
     * @author Rafael Delfino Calzado
     * @since 20/05/2019
     *
     * @async 
     * @return {Array}     Retorna resultado da pesquisa em um array
     * @throws {Object}    Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listaSemResposta = async function (req) {

        try {

            req.sql = 
                `SELECT G046.IDG046, O005.IDO005  
                    FROM G046 -- CARGAS

                    INNER JOIN O005 -- OFERECIMENTOS 
                        ON O005.IDG046 = G046.IDG046
                        AND O005.STOFEREC = G046.STCARGA 

                    INNER JOIN O009 -- PARTICIPANTES
                        ON O009.IDO009 = O005.IDO009
                        AND O009.IDG024 = G046.IDG024
                        
                    WHERE 
                        O005.STOFEREC = 'O' 
                        AND O005.SNENVIO = 1
                        AND O005.DTENVIO < CURRENT_DATE - INTERVAL '60' MINUTE`;

            await gdao.controller.setConnection(req.objConn);
            return await gdao.executar(req);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista cargas disponíveis para o oferecimento ao Transportador
     * @function api/listaAvisos
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @async 
     * @return {Array}     Retorna resultado da pesquisa em um array
     * @throws {Object}    Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listaAvisos = async function (req, res, next) {

        try {

            var sqlCore = api.getSQLCore(req.post.IDG046, req.post.STOFEREC);

            var arCols = 
                [
                    'Q.IDG046',
                    'Q.TPCARGA',
                    'Q.QTDISPER',
                    'Q.PSCARGA',
                    'Q.VRPOROCU',
                    'Q.VRCARGA',
                    'Q.DTCARGA',
                    'Q.DTCOLATU',
                    'Q.SNCARPAR',
                    'Q.TPTRANSP',
                    'Q.IDG024',
                    'Q.NMTRANSP',
                    'Q.IDG030',
                    'Q.DSTIPVEI',
                    'Q.QTCAPPES',
                    'Q.CDESTORC',
                    'Q.CDESTDEC',
                    'Q.NMCIDORC',
                    'Q.NMCIDDEC',
                    'Q.IDO005',
                    'Q.VRFREPAG',
                    'Q.IDG048',
                    'Q.NRSEQETA',
                    'Q.PSDELETA',
                    'Q.QTVOLCAR',
                    'Q.QTDISETA',
                    'Q.CDESTORP',
                    'Q.CDESTDEP',
                    'Q.NMCIDORP',
                    'Q.NMCIDDEP',
                    'Q.DTEAD',
                    'Q.TXEXIGEN'
                ];
    
            var arColsSel = arCols.slice(0);
            var l = arCols.length;
    
            arColsSel[l-25] = `TO_CHAR(Q.DTCOLATU, 'DD/MM/YYYY') DTCOLATU`;
            arColsSel[l-2]  = `TO_CHAR(Q.DTEAD, 'DD/MM/YYYY') DTEAD`;
    
            var sql = 
                `SELECT 
                    ${arColsSel.join()},
            
                    CASE 
                        WHEN Q.SNCARPAR = 'S' THEN 'LTL'
                        WHEN Q.SNCARPAR = 'N' THEN 'FTL' 
                        ELSE 'ITL' 
                    END TPOCUPAC,
                    
                    CASE 
                        WHEN Q.TPTRANSP = 'T' THEN 'TRANSFERÊNCIA' 
                        WHEN Q.TPTRANSP = 'V' THEN 'VENDA' 
                        WHEN Q.TPTRANSP = 'D' THEN 'DEVOLUÇÂO'
                        WHEN Q.TPTRANSP = 'G' THEN 'RETORNO AG' 
                        ELSE 'OUTRO' 
                    END TPOPERAC,
                
                    LISTAGG(G007.NMCONTAT || ' <' || G008.DSCONTAT ||'>', ',') WITHIN GROUP (ORDER BY G007.NMCONTAT) EMTRANSP
                
                FROM (${sqlCore}) Q 
                
                INNER JOIN G025 -- CONTATOS DA TRANSPORTADORA
                    ON G025.IDG024 = Q.IDG024 
                    
                INNER JOIN G007 -- CONTATOS
                    ON G007.IDG007 = G025.IDG007
                    
                INNER JOIN G008 -- TIPO DE CONTATO
                    ON G008.IDG007 = G007.IDG007
                    
                WHERE 
                    G007.SNDELETE = 0
                    AND G008.SNDELETE = 0
                    AND G008.TPCONTAT = 'O'
                
                GROUP BY 
                    ${arCols.join()}
                    
                ORDER BY 
                    Q.IDG046, Q.NRSEQETA`;
    
            var parm = { objConn: req.objConn, sql };
    
            await gdao.controller.setConnection(parm.objConn);

            return await gdao.executar(parm, res, next);            

        } catch (err) {

            throw err;

        }

    }
    
    //-----------------------------------------------------------------------\\

    api.getSQLCore = function (arID, stOferec) {

        var sqlAux = ((Array.isArray(arID)) && (arID.length > 0)) ? `AND G046.IDG046 IN (${arID.join()}) ` : ``;

        var arCols = 
            [
                'G046.IDG046',
                'G046.TPCARGA',
                'G046.QTDISPER',
                'G046.PSCARGA',
                'G046.VRPOROCU',
                'G046.VRCARGA',
                'G046.DTCARGA',
                'G046.DTCOLATU',
                'G046.SNCARPAR',
                'G046.TPTRANSP',          
                'G024.IDG024',
                'G024.NMTRANSP',        
                'G030.IDG030',
                'G030.DSTIPVEI',
                'G030.QTCAPPES',                
                'G002O.CDESTADO',
                'G002D.CDESTADO',
                'G003O.NMCIDADE',
                'G003D.NMCIDADE', 
                'O005.IDO005', 
                'O005.VRFREPAG',
                'G048.IDG048',
                'G048.NRSEQETA',
                'G048.PSDELETA',
                'G048.QTVOLCAR',
                'G048.QTDISPER',
                'G002PO.CDESTADO',
                'G002PD.CDESTADO',
                'G003PO.NMCIDADE',
                'G003PD.NMCIDADE',
                'QEXIGE.TXEXIGEN'
            ];

        var arColsSel = arCols.slice(0);
        var l = arCols.length;

        arColsSel[l-27]  = 'NVL(G046.VRPOROCU, 0) VRPOROCU',

        arColsSel[l-16] += ' CDESTORC',
        arColsSel[l-15] += ' CDESTDEC',
        arColsSel[l-14]  = 'UPPER(G003O.NMCIDADE) NMCIDORC'
        arColsSel[l-13]  = 'UPPER(G003D.NMCIDADE) NMCIDDEC',

        arColsSel[l-11]  = 'NVL(O005.VRFREPAG, 0) VRFREPAG',

        arColsSel[l-6]  += ' QTDISETA',    
        arColsSel[l-5]  += ' CDESTORP';
        arColsSel[l-4]  += ' CDESTDEP';
        arColsSel[l-3]   = 'UPPER(G003PO.NMCIDADE) NMCIDORP';
        arColsSel[l-2]   = 'UPPER(G003PD.NMCIDADE) NMCIDDEP';

        var sql = 
            `SELECT 
                ${arColsSel.join()},
                MIN(G043.DTENTCON) DTEAD
        
            FROM G046 -- CARGA 
            
            INNER JOIN G024 -- TRANSPORTADORA
                ON G024.IDG024 = G046.IDG024
            
            INNER JOIN G030 -- TIPO DO VEÍCULO
                ON G030.IDG030 = G046.IDG030
            
            INNER JOIN (SELECT IDG046, MIN(NRSEQETA) INICIO, MAX(NRSEQETA) FINAL FROM G048 GROUP BY IDG046) ETAPA
                ON ETAPA.IDG046 = G046.IDG046
            
            INNER JOIN G048 G048O -- ORIGEM
                ON G048O.IDG046 = G046.IDG046
                AND G048O.NRSEQETA = ETAPA.INICIO
            
            INNER JOIN G048 G048D -- DESTINO
                ON G048D.IDG046 = G046.IDG046
                AND G048D.NRSEQETA = ETAPA.FINAL
            
            INNER JOIN G005 G005O -- CLIENTE ORIGEM
                ON G005O.IDG005 = G048O.IDG005OR
            
            INNER JOIN G005 G005D -- CLIENTE DESTINO
                ON G005D.IDG005 = G048D.IDG005DE 
            
            INNER JOIN G003 G003O -- CIDADE ORIGEM
                ON G003O.IDG003 = G005O.IDG003
            
            INNER JOIN G003 G003D -- CIDADE DESTINO
                ON G003D.IDG003 = G005D.IDG003
            
            INNER JOIN G002 G002O -- UF ORIGEM
                ON G002O.IDG002 = G003O.IDG002
                
            INNER JOIN G002 G002D -- UF DESTINO
                ON G002D.IDG002 = G003D.IDG002
            
            INNER JOIN O005 -- OFERECIMENTOS
                ON O005.IDG046 = G046.IDG046
                AND O005.IDG024 = G046.IDG024
                AND O005.STOFEREC = G046.STCARGA
                    
            INNER JOIN G048 -- PARADAS
                ON G048.IDG046 = G046.IDG046
                
            INNER JOIN G005	G005PO -- CLIENTE PARADA ORIGEM
                ON G005PO.IDG005 = G048.IDG005OR
                
            INNER JOIN G005	G005PD -- CLIENTE PARADA DESTINO
                ON G005PD.IDG005 = G048.IDG005DE

            LEFT JOIN
            (
                SELECT G102.IDG005, LISTAGG(G097.DSVALUE, ';') WITHIN GROUP(ORDER BY G097.IDG097) TXEXIGEN
                FROM G102 -- CLIENTES ESPECIAIS 
                INNER JOIN G097 -- EXIGÊNCIAS
                    ON G097.IDG097 = G102.IDG097
                WHERE
                    G097.IDGRUPO = 5
                GROUP BY G102.IDG005                
            ) QEXIGE 
                ON QEXIGE.IDG005 = G048.IDG005DE             
            
            INNER JOIN G003 G003PO -- CIDADE PARADA ORIGEM
                ON G003PO.IDG003 = G005PO.IDG003
                
            INNER JOIN G003 G003PD -- CIDADE PARADA DESTINO
                ON G003PD.IDG003 = G005PD.IDG003
                
            INNER JOIN G002 G002PO -- UF PARADA ORIGEM
                ON G002PO.IDG002 = G003PO.IDG002
                
            INNER JOIN G002 G002PD -- UF PARADA DESTINO
                ON G002PD.IDG002 = G003PD.IDG002
                
            INNER JOIN G049 -- DELIVERIES x ETAPA
                ON G049.IDG048 = G048.IDG048
            
            INNER JOIN G043 -- DELIVERIES
                ON G043.IDG043 = G049.IDG043
            
            WHERE 
                G043.SNDELETE = 0               
                AND G046.SNDELETE = 0
                AND G046.QTDISPER IS NOT NULL 
                AND G046.VRCARGA IS NOT NULL 
                AND G046.PSCARGA IS NOT NULL 
                -- AND G046.VRPOROCU IS NOT NULL                 
                AND O005.STOFEREC = '${stOferec}'
                AND O005.SNENVIO = 0                

                ${sqlAux}
                
            GROUP BY
                ${arCols.join()}`;

        return sql;

    }

    //-----------------------------------------------------------------------\\

    return api;
}