module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o frete calculado por carga
     * @function calculaFrete
     * @author Rafael Delfino Calzado
     * @since 09/05/2019
     *
     * @async 
     * @param  tpCalcFrete  Tipo do Cálculo do Frete
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.calculaFrete = async function (req, res, next) {

        try {

            var arCols1   = ['Q1.IDG046', 'Q1.IDG085'];
            var arCols2   = ['G046.IDG046', 'G085.IDG085'];
            var strCols   = '';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            if ((req.post.SNCARPAR == 'N') && (req.post.tpCalcFrete != 'C')) {

                var sqlAux   = `AND G085.TPTABELA = 'V' 
                                AND G086.IDG030 = G046.IDG030 `;

            } else {

                var sqlAux   = `AND G085.TPTABELA = 'P' 
                                AND EXISTS (
                                    SELECT IDG086 FROM G086 G086X
                                    WHERE
                                        G086X.IDG085 = G085.IDG085
                                        --AND G086X.NRPESO >= G046.PSCARGA
                                    GROUP BY
                                        G086X.IDG086,
                                        G086.NRPESO
                                    HAVING
                                        MIN(G086X.NRPESO) = G086.NRPESO ) `;
    
            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            switch (req.post.tpCalcFrete) {

                case 'T': //Transportador

                    arCols1.push('Q1.IDG024');
                    arCols1.push('Q1.NMTRANSP');
                    
                    arCols2.push('G024.IDG024');
                    arCols2.push('G024.NMTRANSP');
                   
                    var sqlInner = 
                        `INNER JOIN G024 -- TRANSPORTADORA
                            ON G024.IDG024 = G088.IDG024 `;

                    sqlAux += `AND G024.SNDELETE = 0
                               AND G024.IDG023 <> 2 -- EXCETO BRAVO`;
                    break;
                    
                //case 'C': //Client
                default:
                    var sqlInner = `AND G088.IDG005 = ORIGEM.IDG005OR `;
                    break;

            }

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var sql =  
                `SELECT 
                    ${arCols1.join()},
                    ${strCols}
                    ROUND(SUM(Q1.VRTARIFA), 2) VRFRETE

                FROM (                    
                    SELECT DISTINCT
                        ${arCols2.join()},

                        CASE
                        
                            WHEN ((G087.QTENTREG > 0) AND (ETAPA.TTETAPA >= G087.QTENTREG)) THEN 
                                (G087.VRTABELA * (ETAPA.TTETAPA - (G087.QTENTREG - 1))) 
                            
                            WHEN ((G087.QTENTREG = 0) AND (G087.TPAPLICA = 'F')) THEN G087.VRTABELA

                            WHEN ((G087.QTENTREG = 0) AND 
                                  (G087.TPAPLICA = 'P') AND 
                                  ((NVL(G087.VRMINCOB, 0) = 0) OR
                                   (G046.PSCARGA >= NVL(G087.VRMINCOB, 0)))) THEN
                                (G087.VRTABELA * G046.PSCARGA)

                            WHEN ((G087.QTENTREG = 0) AND 
                                  (G087.TPAPLICA = 'V') AND 
                                  ((NVL(G087.VRMINCOB, 0) = 0) OR
                                  (G046.VRCARGA > NVL(G087.VRMINCOB, 0)))) THEN 
                                (G087.VRTABELA * G046.VRCARGA)
                            
                            ELSE 0

                        END VRTARIFA

                    FROM G046 -- CARGA                    
                    
                    INNER JOIN (
                        SELECT IDG046, MIN(NRSEQETA) INICIO, MAX(NRSEQETA) FIM, COUNT(*) TTETAPA 
                        FROM G048 GROUP BY IDG046) ETAPA ON
                        ETAPA.IDG046 = G046.IDG046
                    
                    INNER JOIN G048 ORIGEM ON
                        ORIGEM.IDG046 = ETAPA.IDG046
                        AND ORIGEM.NRSEQETA = ETAPA.INICIO
                    
                    INNER JOIN G048 DESTINO ON
                        DESTINO.IDG046 = ETAPA.IDG046
                        AND DESTINO.NRSEQETA = ETAPA.FIM
                        
                    INNER JOIN G005 G005OR -- CLIENTE ORIGEM 
                        ON G005OR.IDG005 = ORIGEM.IDG005OR
                        
                    INNER JOIN G005 G005DE -- CLIENTE DESTINO
                        ON G005DE.IDG005 = DESTINO.IDG005DE
                    
                    INNER JOIN G086 -- DETALHE PREÇO
                        ON G086.TPTRANSP = NVL(DECODE(G046.TPTRANSP, 'G', 'V'), G046.TPTRANSP)
                        AND G086.IDG003OR = G005OR.IDG003
                        AND G086.IDG003DE = G005DE.IDG003                  

                    INNER JOIN G085 -- TABELA FRETE
                        ON G085.IDG085 = G086.IDG085
                                            
                    INNER JOIN G087 -- CÁLCULO PREÇO
                        ON G087.IDG086 = G086.IDG086
                                                                   
                    INNER JOIN G088 -- TABELA FRETE x CLIENTE
                        ON G088.IDG085 = G085.IDG085
                    
                    ${sqlInner}

                    WHERE 
                        G046.SNDELETE = 0
                        AND G046.IDG046 IN (${req.post.IDG046.join()})
                        AND CURRENT_DATE BETWEEN G085.DTINIVIG AND G085.DTFIMVIG                
                        ${sqlAux}
                    ) Q1

                    GROUP BY ${arCols1.join()}

                    ORDER BY VRFRETE`;

            var parm = { objConn: req.objConn, sql };

            await gdao.controller.setConnection(parm.objConn);
            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o somatório das previsões de frete
     * @function fretePanorama
     * @author Rafael Delfino Calzado
     * @since 24/05/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da pesquisa em um array
     * @throws {Object}     Retorna uma objecto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.fretePanorama = async function (req, res, next) {

        try {

            var sql = 
                `SELECT 
                    NVL(SUM(G046.VRFREREC), 0) VRFREREC,
                    NVL(SUM(G046.VRFREMIN), 0) VRFREMIN,
                    NVL(SUM(O005.VRFREPAG), 0) VRFREPAG

                FROM G046 -- CARGAS

                INNER JOIN O005 -- OFERECIMENTOS
                    ON O005.IDG046 = G046.IDG046
                    AND O005.STOFEREC = G046.STCARGA

                INNER JOIN O009 -- PARTICIPANTES
                    ON O009.IDO009 = O005.IDO009
                    AND O009.IDG024 = G046.IDG024

                WHERE 
                    G046.SNDELETE = 0
                    AND G046.STCARGA = '${req.params.status}'
                    AND G046.VRFREREC IS NOT NULL
                    AND G046.VRFREMIN IS NOT NULL
                    AND O005.VRFREPAG IS NOT NULL`;

            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;
}