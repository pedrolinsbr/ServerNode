module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Lista cargas disponíveis para o oferecimento ao Transportador
     * @function api/listarAvisos
     * @author Rafael Delfino Calzado
     * @since 12/03/2018
     *
     * @async 
     * @param {object}  req - Parâmetros da requisição
     * @return {result}     - Retorna resultado da pesquisa em um array
     * @throws {err}        - Retorna um objeto de erro caso ocorra
     */
    //-----------------------------------------------------------------------\\

    api.listarAvisos = async function (req, res, next) {

        var sqlCore = api.getSQLCore(req, res, next);

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
                'Q.IDG028',
                'Q.NMARMAZE',
                'Q.IDG030',
                'Q.DSTIPVEI',
                'Q.QTCAPPES',
                'Q.CDESTORC',
                'Q.CDESTDEC',
                'Q.NMCIDORC',
                'Q.NMCIDDEC',
                'Q.IDO005',
                'Q.IDG048',
                'Q.NRSEQETA',
                'Q.PSDELETA',
                'Q.QTVOLCAR',
                'Q.QTDISETA',
                'Q.CDESTORP',
                'Q.CDESTDEP',
                'Q.NMCIDORP',
                'Q.NMCIDDEP',                
                'Q.DTEAD'

            ];

        var arColsSel = arCols.slice(0);
        var l = arCols.length;

        arColsSel[l-25] = `TO_CHAR(Q.DTCOLATU, 'DD/MM/YYYY') DTCOLATU`;
        arColsSel[l-1]  = `TO_CHAR(Q.DTEAD, 'DD/MM/YYYY') DTEAD`;

        var sql = 
            `SELECT 
                ${arColsSel.join()},
        
                CASE 
                    WHEN Q.SNCARPAR = 'S' THEN 'LTL' 
                    ELSE 'FTL' 
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
            
            INNER JOIN G025 -- CONTATOS DA TRANSPORADORA
                ON G025.IDG024 = Q.IDG024 
                
            INNER JOIN G007 -- CONTATOS
                ON G007.IDG007 = G025.IDG007
                
            INNER JOIN G008 -- TIPO DE CONTATO
                ON G008.IDG007 = G007.IDG007
                
            WHERE 
                G007.SNDELETE = 0
                AND G008.SNDELETE = 0
            
            GROUP BY 
                ${arCols.join()}
                
            ORDER BY 
                Q.IDG046, Q.NRSEQETA`;

        var parm = { objConn: req.objConn, sql };

        return await gdao.executar(parm, res, next).catch((err) => { throw err });

    }
    
    //-----------------------------------------------------------------------\\

    api.getSQLCore = function (req, res, next) {

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
                'G028.IDG028',
                'G028.NMARMAZE',               
                'G030.IDG030',
                'G030.DSTIPVEI',
                'G030.QTCAPPES',                
                'G002O.CDESTADO',
                'G002D.CDESTADO',
                'G003O.NMCIDADE',
                'G003D.NMCIDADE', 
                'O005.IDO005', 
                'G048.IDG048',
                'G048.NRSEQETA',
                'G048.PSDELETA',
                'G048.QTVOLCAR',
                'G048.QTDISPER',
                'G002PO.CDESTADO',
                'G002PD.CDESTADO',
                'G003PO.NMCIDADE',
                'G003PD.NMCIDADE'
            ];

        var arColsSel = arCols.slice(0);
        var l = arCols.length;

        arColsSel[l-14] = 'G002O.CDESTADO CDESTORC',
        arColsSel[l-13] = 'G002D.CDESTADO CDESTDEC',
        arColsSel[l-12] = 'UPPER(G003O.NMCIDADE) NMCIDORC'
        arColsSel[l-11] = 'UPPER(G003D.NMCIDADE) NMCIDDEC',

        arColsSel[l-5]  = 'G048.QTDISPER QTDISETA',    
        arColsSel[l-4]  = 'G002PO.CDESTADO CDESTORP';
        arColsSel[l-3]  = 'G002PD.CDESTADO CDESTDEP';
        arColsSel[l-2]  = 'UPPER(G003PO.NMCIDADE) NMCIDORP';
        arColsSel[l-1]  = 'UPPER(G003PD.NMCIDADE) NMCIDDEP';


        var sql = 
            `SELECT 
                ${arColsSel.join()},
                MIN(G043.DTENTCON) DTEAD
        
            FROM G046 -- CARGA 
            
            INNER JOIN G024 -- TRANSPORTADORA
                ON G024.IDG024 = G046.IDG024
            
            LEFT JOIN G028 -- ARMAZEM
                ON G028.IDG028 = G046.IDG028
            
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
                G046.SNDELETE = 0                
                AND G043.SNDELETE = 0
                
                AND G046.QTDISPER IS NOT NULL 
                AND G046.VRCARGA IS NOT NULL 
                AND G046.PSCARGA IS NOT NULL 
                AND G046.VRPOROCU IS NOT NULL 
            
                AND G046.STCARGA = 'R' 
            
                AND G046.QTDISPER IS NOT NULL 
                AND G046.VRCARGA IS NOT NULL 
                AND G046.PSCARGA IS NOT NULL 
                AND G046.VRPOROCU IS NOT NULL 
                            
                AND G046.IDG046 IN (${req.body.IDG046})
                
            GROUP BY
                ${arCols.join()}`;

        return sql;

    }

    //-----------------------------------------------------------------------\\

    return api;
}