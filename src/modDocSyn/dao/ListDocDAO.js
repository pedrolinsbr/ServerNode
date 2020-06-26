module.exports = function (app, cb) {

    const gdao  = app.src.modGlobal.controllers.dbGearController;
    const utils = app.src.utils.FuncoesObjDB;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Lista ASN/Invoice digitalizadas
     * @function api/listDocShipment
     * @author Rafael Delfino Calzado
     * @since 06/09/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\    

    api.listDocShipment = async function (req) {

        try {

            var arCols = 
            [
                'G048.IDG046',
                'G048.IDG048',
                'G048.NRSEQETA',
                'G082.IDG082',
                'G082.TPDOCUME',
                'G082.NMDOCUME',
                'G082.DTDOCUME',
                'G082.TMDOCUME',
                'G082.DSMIMETP'
            ];

            var arColsSel = arCols.slice(0);
            arColsSel[0] += ' G048_IDG046';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.post, 'G082', true);                    

            var sql = 
                `SELECT 
                    ${arColsSel.join()},
                    COUNT (*) OVER() COUNT_LINHA
                                    
                FROM G046 -- CARGA
                
                INNER JOIN G048 -- ETAPA  
                    ON G048.IDG046 = G046.IDG046              
                
                INNER JOIN G082 -- DOCUMENTOS 
                    ON G082.PKS007 = G048.IDG048
                    
                INNER JOIN S007 -- TABELAS
                    ON S007.IDS007 = G082.IDS007 

                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG048 = G048.IDG048 
                    
                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043

                ${sqlWhere}
                    AND G046.SNDELETE = 0
                    AND G046.TPMODCAR <> 1 -- 3PL                     
                    AND S007.NMTABELA = 'G048'
                    AND G082.TPDOCUME = '${req.post.TPDOCUME}'
                    AND G082.SNDELETE = 0
                    AND G043.SNDELETE = 0

                GROUP BY 
                    ${arCols.join()}

                ORDER BY 
                    G048.IDG046, G048.NRSEQETA, G082.IDG082
                ${sqlPaginate}`;

            var parm = { sql, bindValues };

            parm.objConn = await gdao.controller.getConnection(null, req.UserId);

            var arRS = await gdao.execute(parm);
            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista Milestones digitalizados
     * @function api/listDocMS
     * @author Rafael Delfino Calzado
     * @since 10/09/2019
     *
     * @async 
     * @return {Array}     Retorna um array com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\    

    api.listDocMS = async function (req) {

        try {

            var arCols = 
            [
                'G048.IDG046',
                'G048.IDG048',
                'G048.NRSEQETA',
                'I013.IDI013',
                'I013.STENVIO',
                'I013.STPROPOS',
                'I013.DTEVENTO',
                'I013.DTALTEVE',
                'I001.IDI001',
                'I001.DSEVENTO',
                'I007.IDI007',
                'I007.IDREACOD',
                'G082.IDG082',
                'G082.TPDOCUME',
                'G082.NMDOCUME',
                'G082.DTDOCUME',
                'G082.TMDOCUME',
                'G082.DSMIMETP'
            ];

            var arColsSel = arCols.slice(0);
            arColsSel[0] += ' G048_IDG046';
            arColsSel[4] += ' I013_STENVIO';
            arColsSel[5] += ' I013_STPROPOS';
            arColsSel[9] += ' I001_DSEVENTO';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.post, 'G082', true);                    

            var sql = 
                `SELECT ${arColsSel.join()}, 
                    TO_CHAR (I013.DTEVENTO, 'DD/MM/YYYY HH24:MI') DTMSTONE,
                    TO_CHAR (I013.DTALTEVE, 'DD/MM/YYYY HH24:MI') DTINFO,
                    COUNT (*) OVER() COUNT_LINHA
                                    
                FROM G046 -- CARGA
                                
                INNER JOIN G048 -- ETAPA
                    ON G048.IDG046 = G046.IDG046

                INNER JOIN I013 -- MILESTONE
                    ON I013.IDG048 = G048.IDG048

                INNER JOIN I001 -- TIPO DO MILESTONE
                    ON I001.IDI001 = I013.IDI001

                LEFT JOIN I007 -- REASON CODES
                    ON I007.IDI007 = I013.IDI007 
                
                INNER JOIN G082 -- DOCUMENTOS 
                    ON G082.PKS007 = I013.IDI013
                    
                INNER JOIN S007 -- TABELAS
                    ON S007.IDS007 = G082.IDS007 

                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG048 = G048.IDG048 
                    
                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043

                ${sqlWhere} 
                    AND G046.SNDELETE = 0
                    AND G046.STCARGA <> 'C' -- CANCELADA
                    AND G046.TPMODCAR <> 1 -- 3PL                     
                    AND S007.NMTABELA = 'I013'
                    AND G082.TPDOCUME = 'MLS'
                    AND G082.SNDELETE = 0
                    AND G043.SNDELETE = 0
                    AND I013.SNDELETE = 0

                GROUP BY 
                    ${arCols.join()}

                ORDER BY 
                    G048.IDG046, G048.NRSEQETA, I013.IDI013
                ${sqlPaginate}`;

            var parm = { sql, bindValues };

            parm.objConn = await gdao.controller.getConnection(null, req.UserId);

            var arRS = await gdao.execute(parm);
            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista POD Digitalizados
     * @function api/listDocPOD
     * @author Rafael Delfino Calzado
     * @since 15/10/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\    

    api.listDocPOD = async function (req) {

        try {

            var arCols = 
            [
                'G048.IDG046',
                'G048.IDG048',
                'G048.NRSEQETA',
                'G043.IDG043',
                'G043.CDDELIVE',
                'G082.IDG082',
                'G082.TPDOCUME',
                'G082.NMDOCUME',
                'G082.DTDOCUME',
                'G082.TMDOCUME',
                'G082.DSMIMETP'
            ];

            var arColsSel = arCols.slice(0);
            arColsSel[0] += ' G048_IDG046';

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.post, 'G082', true);                    

            var sql = 
                `SELECT 
                    ${arColsSel.join()},
                    COUNT (*) OVER() COUNT_LINHA
                                    
                FROM G046 -- CARGA
                
                INNER JOIN G048 -- ETAPA
                    ON G048.IDG046 = G046.IDG046

                INNER JOIN G049 -- DELIVERIES x ETAPA
                    ON G049.IDG048 = G048.IDG048 
                
                INNER JOIN G043 -- DELIVERIES
                    ON G043.IDG043 = G049.IDG043

                INNER JOIN G082 -- DOCUMENTOS 
                    ON G082.PKS007 = G043.IDG043
                    
                INNER JOIN S007 -- TABELAS
                    ON S007.IDS007 = G082.IDS007 

                ${sqlWhere}
                    AND G046.SNDELETE = 0
                    AND G046.STCARGA <> 'C' -- CANCELADA
                    AND G046.TPMODCAR <> 1 -- 3PL              
                    AND S007.NMTABELA = 'G043'
                    AND G082.TPDOCUME = 'POD'
                    AND G082.SNDELETE = 0
                    AND G043.SNDELETE = 0

                GROUP BY 
                    ${arCols.join()}

                ORDER BY 
                    G048.IDG046, G048.NRSEQETA, G082.IDG082
                ${sqlPaginate}`;

            var parm = { sql, bindValues };

            parm.objConn = await gdao.controller.getConnection(null, req.UserId);

            var arRS = await gdao.execute(parm);
            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\      

    return api;

}