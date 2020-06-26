module.exports = function (app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    api.controller = app.config.ControllerBD;
    var moment = require('moment');
    const gdao = app.src.modGlobal.dao.GenericDAO;

    api.buscarDistrib = async function (req, res, next) {

        let sqlWhereAcl = await acl.montar({
            ids001: req.headers.ids001,
            dsmodulo: "dashboard",
            nmtabela: [
                {
                    G014: 'G014'
                }
            ],
            esoperad: 'And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        await this.controller.setConnection(req.objConn);

        req.sql = `
                SELECT DISTINCT
                      G043.NRNOTA
                    , G051.CDCTRC  
                    , NVL(G046.IDG046,G051.CDCARGA) as G046_IDG046                    
                    , G043.PSBRUTO                    
                    , G043.VRDELIVE
                    , G005RE.RSCLIENT AS NMCLIENT
                    , NVL(G024.NMTRANSP, G024X.NMTRANSP) AS NMTRANSP
                    , G003RE.NMCIDADE || ' - ' || G002RE.CDESTADO AS G003RE_NMCIDADE
                    , G003.NMCIDADE || ' - ' || G002.CDESTADO AS G003DE_NMCIDADE
                    , G005DE.NMCLIENT AS G005DE_NMCLIENT
                    , G043.DTEMINOT AS DTEMINOT
                    , G051.DTEMICTR AS DTEMICTR
                    , G051.DTCOLETA AS DTSAICAR
                    , G043.DTENTCON AS DTENTCON 
                    , G051.DTCOMBIN AS DTCOMBIN
                    , G051.DTAGENDA AS DTAGENDA
                    , fn_data_sla(G051.IDG051) as DTPREVISTA
                    , G043.DTENTREG AS DTENTREG
                      -- DELIVERY
                    , G043.IDG043                    
                    , G043.IDG014                                                            
                    , G043.DTBLOQUE
                    , G043.DTDESBLO                                     
                    , G043.TPDELIVE
                    , G014.DSOPERAC
                        -- CARGA                    
                    , G051.IDG051                                                                                                 
                    , G051.DTCALDEP AS DTCALDEP
                    , G051.DTENTPLA AS DTENTPLA
                    , G051.DTCALANT AS DTCALANT                    
                        -- TRANSPORTADORA
                    , NVL(G024.IDG024, G024X.IDG024) AS IDG024
                    , NVL(G024.IDG024, G024X.IDG024) AS IDG024                    
                        -- ORIGEM / DESTINO                    
                    , G005DE.IDG005 AS G005DE_IDG005                    
                    , G003RE.NMCIDADE	 AS ORIGEM_CIDADE
                    , G003.NMCIDADE AS DESTINO_CIDADE
                    , G002RE.CDESTADO AS ORIGEM_UF
                    , G002.CDESTADO AS DESTINO_UF                                        
                    , Q.VRCAMPO 
                    , (Select X.SNSAVPER FROM
						(Select I015.SNSAVPER From I013
						LEFT JOIN I007 ON I007.IDI007 = I013.IDI007 --REASON CODE
						LEFT JOIN I017 ON I017.IDI007 = I007.IDI007 -- MOTIVO X REASON CODE
						LEFT JOIN I015 ON I015.IDI015 = I017.IDI015 -- MOTIVO
						Where I013.IDG048 = NVL(G048.IDG048, 0) --MILESTONES
						order by I013.IDI013 desc) X Where rownum = 1
						) AS SNSAVPER

                        FROM G043 G043                    
                        
                            INNER JOIN G052 G052 ON (G052.IDG043 = G043.IDG043)
                            
                            INNER JOIN G051 G051 ON (G052.IDG051 = G051.IDG051)
                            
                            INNER JOIN G024 G024X ON (G051.IDG024 = G024X.IDG024) AND G024X.SNDELETE = 0 -- TRANSPORTADORA
                            
                            LEFT JOIN G005 G005RE ON (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE)) -- REMETENTE
                            
                            LEFT JOIN G005 G005DE ON (G005DE.IDG005 = Nvl(G043.IDG005DE, G051.IDG005DE)) -- DESTINATARIO
                            
                            LEFT JOIN G003 ON G003.IDG003 = G005DE.IDG003 AND G003.SNDELETE = 0 -- CIDADE DESTINO DESTINatário
                            
                            LEFT JOIN G002 ON G002.IDG002 = G003.IDG002 AND G002.SNDELETE = 0 -- UF DESTINO
                            
                            LEFT JOIN G005 G005RE ON (G005RE.IDG005 = Nvl(G043.IDG005RE, G051.IDG005RE)) -- ORIGEM // REMETENTE
                            
                            LEFT JOIN G003 G003RE ON G003RE.IDG003 = G005RE.IDG003 AND G003RE.SNDELETE = 0 -- CIDADE REMETENTE
                            
                            LEFT JOIN G002 G002RE ON G002RE.IDG002 = G003RE.IDG002 AND G002RE.SNDELETE = 0 -- UF REMETENTE
                            
                            LEFT JOIN G014 G014 ON (G043.IDG014 = G014.IDG014) -- OPERACAO
                            
                            LEFT JOIN G046 ON G046.IDG046 = G051.IDG046 AND G046.SNDELETE = 0 -- CARGA
                            
                            LEFT JOIN G024 G024 ON (G046.IDG024 = G024.IDG024) -- TRANSPORTADORA 
                            
                            LEFT JOIN G048 ON G048.IDG046 = G046.IDG046 -- PARADA

                            JOIN G049 ON G049.IDG048 = G048.IDG048 and G049.IDG043 = G043.IDG043
                            
                            LEFT JOIN G045 ON G045.IDG043 = G043.IDG043 AND G045.SNDELETE = 0 AND G043.SNDELETE = 0 -- ITENS

                            LEFT JOIN (
								SELECT G076.IDS007PK, G076.VRCAMPO
								FROM G076 
								INNER JOIN G075 
									ON G075.IDG075 = G076.IDG075
								WHERE 
									G075.SNDELETE = 0 AND 
									G076.SNDELETE = 0 AND 
									G075.NMCAMPO = 'CDGRUCLI'
							) Q ON Q.IDS007PK = G043.IDG043
                            
                                -- ALL WHERES
                                WHERE G043.SNDELETE = 0
                                AND G051.TPTRANSP = 'V'
                                AND G051.SNDELETE = 0
                                AND G051.STCTRC = 'A'
                                ${sqlWhereAcl}
                                ${req.body.aux}
                                ${req.body.current}
                                ${req.body.date}

                                GROUP BY
                                  G043.IDG043
                                , G043.DTEMINOT
                                , G043.NRNOTA
                                , G043.IDG014
                                , G043.DTENTCON
                                , G043.DTENTREG
                                , G043.DTBLOQUE
                                , G043.DTDESBLO
                                , G043.PSBRUTO
                                , G043.TPDELIVE
                                , G014.DSOPERAC
                                , G005RE.RSCLIENT
                                , G043.VRDELIVE
                                , G024.NMTRANSP
                                , G051.DTCALDEP
                                , G051.DTENTPLA
                                , G051.DTCALANT
                                , G051.DTCOLETA
                                , G051.DTEMICTR
                                , G051.IDG051
                                , G051.CDCTRC
                                , G051.CDCARGA
                                , G005DE.IDG005 
                                , G005DE.NMCLIENT
                                , G003RE.NMCIDADE
                                , G002RE.CDESTADO
                                , G003.NMCIDADE
                                , G002.CDESTADO
                                , G046.IDG046
                                , G051.DTCOMBIN
                                , G051.DTAGENDA
                                , G046.STCARGA
                                , G024.NMTRANSP
                                , G024X.NMTRANSP
                                , G024.IDG024
                                , G024X.IDG024
                                , Q.VRCAMPO
                                , G048.IDG048`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    };


    api.buscarProdutosDistrib = async function (req, res, next) {

        let sqlWhereAcl = await acl.montar({
            ids001: req.headers.ids001,
            dsmodulo: "dashboard",
            nmtabela: [
                {
                    G014: 'G014'
                }
            ],
            esoperad: 'And '
        });
        if (typeof sqlWhereAcl == 'undefined') {
            sqlWhereAcl = '';
        }

        let DTINIPER = (req.body.DTINIPER)? req.body.DTINIPER : '2018-01-01 00:00:00';
        let DTFINPER = (req.body.DTFINPER)? req.body.DTFINPER : '2018-02-01 00:00:00';

        await this.controller.setConnection(req.objConn);

        req.sql = `SELECT G045.IDG045
                        , G045.DSPRODUT
                        , G050.QTPRODUT
                        , G009.CDUNIDAD
                        , G045.IDG043
                     FROM G045 G045
               INNER JOIN G050 G050 ON G050.IDG045 = G045.IDG045 AND G050.SNDELETE = 0
               INNER JOIN G009 G009 ON G009.IDG009 = G045.IDG009PS
                    WHERE G045.SNDELETE = 0
                      AND G045.IDG043 IN (  SELECT DISTINCT G043.IDG043
                                                       FROM G043 G043
                                                 INNER JOIN G052 G052 ON (G052.IDG043 = G043.IDG043)
                                                 INNER JOIN G051 G051 ON (G052.IDG051 = G051.IDG051)
                                                  LEFT JOIN G014 G014 ON (G043.IDG014 = G014.IDG014)
                                                      WHERE G043.SNDELETE = 0
                                                        AND G043.DTEMINOT >=  TO_DATE('${DTINIPER}', 'YYYY-MM-DD HH24:MI:SS')
                                                        AND G043.DTEMINOT <   TO_DATE('${DTFINPER}', 'YYYY-MM-DD HH24:MI:SS')
                                                        AND G043.DTENTREG IS NULL
                                                        ${sqlWhereAcl}
                                                        AND G051.TPTRANSP = 'V'
                                                        AND G051.SNDELETE = 0
                                                        AND G051.STCTRC = 'A'
                                                   GROUP BY G043.IDG043
                                         )
                 GROUP BY G045.IDG045
                        , G045.DSPRODUT
                        , G050.QTPRODUT
                        , G009.CDUNIDAD
                        , G045.IDG043`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    };

    return api;
};
