module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    api.controller = gdao.controller;

    //-----------------------------------------------------------------------\\    
    /**
        * @description Retorna o SQL para a pesquisa de deliveries a serem recusadas
        *
        * @function getListSQL
        *
        * @returns  {String}    Retorna o comando SQL
        *
        * @author Rafael Delfino Calzado
        * @since 29/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.getListSQL = function (id) {

        var sql = 
            `SELECT G043.IDG043
                    
            FROM G043 -- DELIVERY

            INNER JOIN G014
                ON G014.IDG014 = G043.IDG014
            
            INNER JOIN G049 -- DELIVERY x ETAPA
                ON G049.IDG043 = G043.IDG043
            
            INNER JOIN G048 -- ETAPA
                ON G048.IDG048 = G049.IDG048

            INNER JOIN G046 -- CARGA
                ON G046.IDG046 = G048.IDG046
                
            WHERE 
                G046.SNDELETE = 0
                AND G046.STCARGA = 'B'
                AND G046.DTSAICAR IS NULL
                AND G014.IDG097DO = 145 -- CHKRDC
                AND G043.SNDELETE = 0
                AND G043.STETAPA = 2 -- OFERECIMENTO
                AND G043.DTENTREG IS NULL 
                AND G046.IDG046 = ${id}`;

        return sql;

    }

    //-----------------------------------------------------------------------\\    
    /**
        * @description Busca todas as deliveries a serem recusadas na carga indicada
        *
        * @async 
        * @function recusaCargaOrigem
        *
        * @returns  {Array}     Retorna um array com o resultado da pesquisa
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 29/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaDeliveries = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };

            parm.sql = this.getListSQL(req.IDG046);

            await gdao.controller.setConnection(parm.objConn);
            return gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    
    /**
        * @description Finaliza todas as deliveries da carga indicada
        *
        * @async 
        * @function finalizaDelivery
        *
        * @returns  {Object}    Retorna um objeto com o resultado da operação
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 29/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.finalizaDelivery = async function (req, res, next) {

        try {

            var sqlAux = this.getListSQL(req.IDG046);

            var sql = 
                `MERGE INTO G043 D USING (${sqlAux}) Q 
                    ON (Q.IDG043 = D.IDG043) 
                    WHEN MATCHED THEN UPDATE SET
                         D.DTENTREG = TO_DATE('${req.DTENTREG}', 'YYYY-MM-DD HH24:MI:SS'), STETAPA = 5`;

            var parm = { objConn: req.objConn, sql };

            await gdao.controller.setConnection(parm.objConn);
            return await gdao.executar(parm, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    
    /**
        * @description Encerra a carga informando a data de saída do momento
        *
        * @async 
        * @function finalizaCarga
        *
        * @returns  {Object}    Retorna um objeto com o resultado da operação
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 29/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.finalizaCarga = async function (req, res, next) {

        try {

            var sql = 
                `UPDATE G046 SET 
                     STCARGA   = 'D',
                     IDG024    =  6, -- TRANSPORTADORA PADRÃO
                     DTAGENDA  = TO_DATE('${req.DTENTREG}', 'YYYY-MM-DD HH24:MI:SS'),
                     DTSAICAR  = TO_DATE('${req.DTENTREG}', 'YYYY-MM-DD HH24:MI:SS')
                 
                WHERE 
                    SNDELETE = 0
                    AND DTSAICAR IS NULL
                    AND STCARGA = 'B'	
                    AND IDG046 = ${req.IDG046}`;

            var parm = { objConn: req.objConn, sql };                    

            await gdao.controller.setConnection(parm.objConn);
            return await gdao.executar(parm, res, next);        

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}