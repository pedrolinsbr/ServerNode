module.exports = function (app, cb) {

    const db = app.src.modGlobal.controllers.dbGearController;

    var api = {};

    api.db = db;
    
    //-----------------------------------------------------------------------\\      
    /**
    * @description Lista componentes padrão disponíveis
    * @function listCompCad
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @async
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.listCompCad = async function (req) { 
    
        try { 
    
            var sql = 
                `SELECT 
                    G062.IDG062,
                    G062.NMCOMPAD,
                    G062.DSLEGEND
                FROM G062 -- COMPONENTE
                WHERE 
                    G062.SNDELETE = 0
                    AND G062.IDG062 NOT IN 
                    (
                        SELECT 
                            IDG062 
                        FROM G063 
                        WHERE
                            SNDELETE = 0 
                            AND IDG024 = ${req.params.id}
                    )
                ORDER BY G062.NMCOMPAD
                `;

            var objConn = await db.controller.getConnection(null, req.UserId);
            
            return await db.execute({ objConn, sql });
                
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
    * @description Lista componentes da 3PL
    * @function listComp3PL
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @async
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.listComp3PL = async function (req) { 
    
        try { 
    
            var sql = 
                `SELECT 
                    G063.IDG063,
                    G063.IDG024,
                    G062.IDG062,
                    G062.NMCOMPAD,
                    G062.DSLEGEND,
                    G063.NMCOMVAR

                FROM G062 -- COMPONENTE

                INNER JOIN G063 -- COMPONENTE x TRANSPORTADORA
                    ON G063.IDG062 = G062.IDG062

                WHERE 
                    G063.SNDELETE = 0
                    AND G063.IDG024 = ${req.params.id}

                ORDER BY G062.NMCOMPAD
                `;

            var objConn = await db.controller.getConnection(null, req.UserId);
            
            return await db.execute({ objConn, sql });
                
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
    * @description Remove componentes prévios de uma 3PL
    * @function removePrevComp
    * @author Rafael Delfino Calzado
    * @since 18/12/2019
    *
    * @async
    * @returns {Object}  Retorna um objeto com o resultado da operação
    * @throws  {Object}  Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\ 

    api.removePrevComp = async function (req) { 
    
        try { 

            var parm = { objConn: req.objConn };
    
            parm.sql = `DELETE FROM G063 WHERE IDG024 = ${req.post.IDG024}`;

            await db.controller.setConnection(parm.objConn);
            return await db.execute(parm);

        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\

    api.insertArComp = async function (req) { 
    
        try { 

            var arValores = [];
            var sql = '';
            var strAux = '';

            sql += `INSERT INTO G063 (IDG024, IDG062, NMCOMVAR) \n`;
            sql += 'WITH input_values AS ( \n';

            for (var v of req.post.arComp) {

                v.NMCOMVAR = String(v.NMCOMVAR).replace(/'/g, "");

                strAux  = 'SELECT ';
                strAux += `${req.post.IDG024}, ${v.IDG062}, '${v.NMCOMVAR}'`;
                strAux += ` FROM DUAL `;

                arValores.push(strAux);

            } 

            sql += arValores.join(' UNION ALL \n');

            sql += `) SELECT * FROM input_values`;

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            var parm = { objConn: req.objConn, sql };            

            await db.controller.setConnection(parm.objConn);
            return await db.execute(parm);
    
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\

    return api;

}
