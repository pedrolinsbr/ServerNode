module.exports = function (app, cb) {

  const utils = app.src.utils.FuncoesObjDB;
  const gdao = app.src.modGlobal.controllers.dbGearController;

  var api = {};

  //-----------------------------------------------------------------------\\
  /**
  * @description Lista 
  * @function listPrecoFrete
  * @author Marcos Henrique de Carvalho
  * @since 04/12/2019
  *
  * @async
  * @returns {Array} Array com resultado da pesquisa
  * @throws  {Object} Objeto descrevendo o erro
  */
  //-----------------------------------------------------------------------\\    

  api.listPrecoFrete = async function (req, res, next) {

    try {

      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G085', false);
      let dtInit = '';
      let dtFim = '';
      if (bindValues.G085_DTINIVIG0) {
        let beginDate = bindValues.G085_DTINIVIG0.beginDate;
        let endDate = bindValues.G085_DTINIVIG0.endDate;
        dtInit = `${beginDate.year}-${beginDate.month}-${beginDate.day}`;
        dtFim = `${endDate.year}-${endDate.month}-${endDate.day}`;
        sqlWhere = sqlWhere.replace("G085.DTINIVIG in ( :G085_DTINIVIG0)", `G085.DTINIVIG BETWEEN TO_DATE('${dtInit}', 'YYYY-MM-DD') AND TO_DATE('${dtFim}', 'YYYY-MM-DD')`);
        delete bindValues.G085_DTINIVIG0;
      }
      if (bindValues.G085_DTFIMVIG0) {
        let beginDate = bindValues.G085_DTFIMVIG0.beginDate;
        let endDate = bindValues.G085_DTFIMVIG0.endDate;
        dtInit = `${beginDate.year}-${beginDate.month}-${beginDate.day}`;
        dtFim = `${endDate.year}-${endDate.month}-${endDate.day}`;
        sqlWhere = sqlWhere.replace("G085.DTFIMVIG in ( :G085_DTFIMVIG0)", `G085.DTFIMVIG BETWEEN TO_DATE('${dtInit}', 'YYYY-MM-DD') AND TO_DATE('${dtFim}', 'YYYY-MM-DD')`);
        delete bindValues.G085_DTFIMVIG0;
      }

      var sql =
        `SELECT
            Q.*,
            COUNT(*) OVER() COUNT_LINHA 
            FROM (
              SELECT 
              G085.IDG085,
              G085.DSPREFRE, 
              G085.DTINIVIG, 
              G085.DTFIMVIG, 
              G085.TPTABELA,
              G086.TPTRANSP
            FROM G085 G085
            INNER JOIN G086 G086 ON G086.IDG085 = G085.IDG085
            LEFT JOIN G003 G003O ON G003O.IDG003 = G086.IDG003OR
            LEFT JOIN G003 G003D ON G003D.IDG003 = G086.IDG003DE
            JOIN G088 G088 ON G088.IDG085 = G085.IDG085
            ${sqlWhere}                      
            GROUP BY 
            G085.IDG085,
            G085.DSPREFRE, 
            G085.DTINIVIG, 
            G085.DTFIMVIG, 
            G085.TPTABELA,
            G086.TPTRANSP               
        ) Q 
        ORDER BY Q.IDG085              
        ${sqlPaginate}
        `;
      var objConn = await gdao.controller.getConnection(null, req.UserId);
      var arRS = await gdao.execute({ objConn, sql, bindValues });
      return utils.construirObjetoRetornoBD(arRS);
    } catch (err) {
      throw err;
    }

  }

  //-----------------------------------------------------------------------\\
  /**
  * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
  * @function listClientTransp
  * @author Marcos Henrique de Carvalho
  * @since 04/12/2019
  *
  * @async
  * @returns {Array} Array com resultado da pesquisa
  * @throws  {Object} Objeto descrevendo o erro
  */
  //-----------------------------------------------------------------------\\    
  api.listClientTransp = async function (req, res, next) {

    try {
      const IDG085 = req.params.id;
      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G088', false);
      var objConn = await gdao.controller.getConnection(null, req.UserId);

      var sql = `
            SELECT 
              G088.IDG088,
              G005.NMCLIENT,
              G005.IDG005
            FROM G088 G088
            INNER JOIN G085 G085 ON G085.IDG085 = G088.IDG085
            INNER JOIN G005 G005 ON G005.IDG005 = G088.IDG005
            WHERE G085.IDG085 = ${IDG085}             
        `;

      var arClient = await gdao.execute({ objConn, sql, bindValues });

      sql = `
            SELECT 
              G088.IDG088,
              G024.NMTRANSP,
              G024.IDG024
            FROM G088 G088
            INNER JOIN G085 G085 ON G085.IDG085 = G088.IDG085
            INNER JOIN G024 G024 ON G024.IDG024 = G088.IDG024
            WHERE G085.IDG085 = ${IDG085}  
          `;
      var arTransp = await gdao.execute({ objConn, sql, bindValues });
      let data = { arClient, arTransp }
      return utils.construirObjetoRetornoBD(data);

    } catch (err) {

      throw err;

    }

  }
  //-----------------------------------------------------------------------\\
  /**
  * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
  * @function listCidadeDestino
  * @author Marcos Henrique de Carvalho
  * @since 04/12/2019
  *
  * @async
  * @returns {Array} Array com resultado da pesquisa
  * @throws  {Object} Objeto descrevendo o erro
  */
  //-----------------------------------------------------------------------\\    
  api.listCidadeDestino = async function (req, res, next) {

    try {
      var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G086', false);
      var objConn = await gdao.controller.getConnection(null, req.UserId);

      var sql = `
        SELECT
          DISTINCT
          Q.*,
          COUNT(*) OVER() COUNT_LINHA 
              FROM (
                SELECT 	                
                --G014.DSOPERAC, -- TIPO OPERACAO
                G030.DSTIPVEI, -- TIPO VEICULO
                G086.IDG086,
                G086.TPDIAS, -- TIPO DE DIAS
                G086.NRPESO AS NRPESO, -- PESO
                G086.QTDIACOL AS QTDIACOL, -- QTD DIAS COLETA
                G086.QTDIENLO AS QTDIENLO, -- QTD DIAS ENTREGA LOCAL
                G086.QTDIAENT, -- QTD DIAS FRACIONADAS
                G086.HOFINOTI, -- HORARIO FINAL RECEBIMENTO
                G003O.NMCIDADE AS IDG003OR, -- CIDADE ORIGEM
                G003D.NMCIDADE AS IDG003DE -- CIDADE DESTINO                
              FROM G086 G086
              INNER JOIN G085 G085 ON G085.IDG085 = G086.IDG085
              LEFT JOIN G014 G014 ON G014.IDG014 = G085.IDG014
              LEFT JOIN G003 G003O ON G003O.IDG003 = G086.IDG003OR
              LEFT JOIN G003 G003D ON G003D.IDG003 = G086.IDG003DE
              LEFT JOIN G030 G030 ON G030.IDG030 = G086.IDG030
              ${sqlWhere}
              GROUP BY
                G014.DSOPERAC, -- TIPO OPERACAO
                G030.DSTIPVEI, -- TIPO VEICULO
                G086.IDG086,
                G086.TPDIAS, -- TIPO DE DIAS
                G086.NRPESO, -- PESO
                G086.QTDIACOL, -- QTD DIAS COLETA
                G086.QTDIENLO, -- QTD DIAS ENTREGA LOCAL
                G086.QTDIAENT,
                G086.HOFINOTI, -- HORARIO FINAL RECEBIMENTO
                G003O.NMCIDADE, -- CIDADE ORIGEM
                G003D.NMCIDADE                
              ) Q 
        ORDER BY Q.IDG086             
      `;

      var arRS = await gdao.execute({ objConn, sql, bindValues });


      if (arRS.length > 0) {
        for (const g086 of arRS) {
          sql = `
            SELECT 
              G087.IDG087,
              G087.DSDETFRE, -- DESCRICAO
              G087.TPAPLICA, -- TIPO APLICACAO
              G087.VRMINCOB AS VRMINCOB, -- VALOR MIN COBRANCA
              G087.QTENTREG, -- QTD DE ENTREGA
              G087.VRTABELA AS VRTABELA --VALOR DA TABELA
            FROM G087 G087
            WHERE G087.IDG086 = ${g086.IDG086}
          `;
          var arG087 = await gdao.execute({ objConn, sql });
          g086.details = arG087;
        }
      }

      return utils.construirObjetoRetornoBD(arRS);

    } catch (err) {

      throw err;

    }

  }

  //-----------------------------------------------------------------------\\
  /**
  * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
  * @function editarTabelaFrete
  * @author Marcos Henrique de Carvalho
  * @since 04/12/2019
  *
  * @async
  * @returns {Array} Array com resultado da pesquisa
  * @throws  {Object} Objeto descrevendo o erro
  */
  //-----------------------------------------------------------------------\\    
  api.editarTabelaFrete = async function (req, res, next) {

    try {
      const { IDG085, DTINIVIG, DTFIMVIG } = req.body;
      var con = await gdao.controller.getConnection(null, req.UserId);

      var sql = `
        UPDATE G085
        SET DTINIVIG = TO_DATE('${DTINIVIG}', 'YYYY-MM-DD'), DTFIMVIG = TO_DATE('${DTFIMVIG}', 'YYYY-MM-DD')
        WHERE IDG085 = ${IDG085}  
      `;
      let result = await con.execute({ sql, param: {} }).catch(err => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      throw err;
    }
  }

  //-----------------------------------------------------------------------\\
  /**
  * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
  * @function addClientTranps
  * @author Marcos Henrique de Carvalho
  * @since 04/12/2019
  *
  * @async
  * @returns {Array} Array com resultado da pesquisa
  * @throws  {Object} Objeto descrevendo o erro
  */
  //-----------------------------------------------------------------------\\    
  api.addClientTranps = async function (req, res, next) {

    try {
      const { IDG085, id, array } = req.body;
      var con = await gdao.controller.getConnection(null, req.UserId);

      let query = '';
      let cliente = id == 'IDG005' && true;
      let transp = id == 'IDG024' && true;
      array.map((item, index) => {
        query += `          
            SELECT ${IDG085}, ${cliente ? item.id : null}, ${transp ? item.id : null} ${index + 1 == array.length ? 'FROM DUAL' : 'FROM DUAL UNION ALL'}                     
        `;
      })
      var sql = `
        INSERT INTO G088 (IDG085, IDG005, IDG024) 
        WITH names AS (
        ${query}
        )
        SELECT * FROM names
      `;
      let result = await con.execute({ sql, param: {} }).catch(err => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      throw err;
    }
  }

  //-----------------------------------------------------------------------\\
  /**
  * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
  * @function removeClientTranspG088
  * @author Marcos Henrique de Carvalho
  * @since 04/12/2019
  *
  * @async
  * @returns {Array} Array com resultado da pesquisa
  * @throws  {Object} Objeto descrevendo o erro
  */
  //-----------------------------------------------------------------------\\    
  api.removeClientTranspG088 = async function (req, res, next) {

    try {
      const { id } = req.params;
      var con = await gdao.controller.getConnection(null, req.UserId);

      var sql = `
        DELETE FROM G088
        WHERE IDG088 = ${id}  
      `;
      let result = await con.execute({ sql, param: {} }).catch(err => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      throw err;
    }
  }

  return api;

}
