/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 * 
*/

/** 
 * @module dao/Relatorio
 * @description G058, .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela G046.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.listar = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      delete req.body['parameter[G024_IDG023][id]'];
      
      //Armazer a informação de NOTLIBER para verificar e construir SQLWhere expecífico
      var notLiber = req.body['parameter[NOTLIBER][id]'];

      //Deleter os req.body para que retWherePagOrd não crie where e bind usando NOTLIBER como referência
      delete req.body['parameter[NOTLIBER][id]'];
      delete req.body['parameter[NOTLIBER][text]'];

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G051',true);


      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      //Verificar notas liberadas
      if (notLiber) {
        if(notLiber == 1){//Caso vier "Sim"
          sqlWhere     += ` And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
          Or G043.DtBloque Is Null) `;
          
        }else if(notLiber == 2){//Caso vier "Não"
          sqlWhere     += ` And (G043.DtBloque Is Not Null And  G043.DtDesBlo Is Null) `;
        }
      }
      
        
      let	sql = `  SELECT DISTINCT G051.CDCTRC, 
                                   G051.NRPESO, 
                                   G051.VRMERCAD,
                                   G051.TPTRANSP, 
                                   G051.IDG005RE, 
                                   G051.IDG051,
                                   G051.DTLANCTO,
                                   G051.DTEMICTR,
                                   FN_DATA_SLA(G051.IDG051) AS DTSLA,

                                   CASE
                                   WHEN G043.DTBLOQUE IS NULL AND G043.DTDESBLO IS NULL THEN
                                   '1'
                                   WHEN G043.DTBLOQUE IS NOT NULL AND
                                     G043.DTDESBLO IS NOT NULL THEN
                                   '1'
                                   WHEN G043.DTBLOQUE IS NOT NULL AND G043.DTDESBLO IS NULL THEN
                                   '0'
                                   END AS NRLIB,

                                   G024EM.NMTRANSP || ' [' || G024EM.IDG024 || '-' || G024EM.IDLOGOS || ']' AS NMTRANSP,  
                                   G005RE.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005RE.CJCLIENT) || ' - ' || G005RE.IECLIENT ||']' As Nmcliere, 
      COUNT(G051.IDG051) OVER() AS COUNT_LINHA
      FROM G051 G051
      JOIN G052 G052
        ON G052.IDG051 = G051.IDG051
      JOIN G043 G043
        ON G043.IDG043 = G052.IDG043 -- NF
       AND G043.DTENTREG IS NULL
    
      JOIN G024 G024EM
        ON G024EM.IDG024 = G051.IDG024
    
      JOIN G024 G024
        ON G024.IDG024 = NVL(G051.IDG024AT, G051.IDG024)

      JOIN G005 G005RE
        ON G005RE.IDG005 = NVL(G051.IDG005EX, G051.IDG005RE) 
    
      ${sqlWhere} 

       AND G051.IDG046 IS NULL
       AND G051.TPTRANSP IS NOT NULL
       AND G051.STCTRC <> 'C'
       AND G051.SNDELETE = 0
       AND G051.CDCARGA IS NULL
       AND G043.SNDELETE = 0
       AND NOT EXISTS
     (SELECT *
              FROM G052 G052X
              JOIN G043 G043X
                ON G052X.IDG043 = G043X.IDG043
             WHERE G052X.IDG043 = G043.IDG043
               AND TO_CHAR(SUBSTR(G043X.CDDELIVE, 0, 1)) NOT IN
                   ('0', '1', '2', '3', '4', '5', '6', '7', '8', '9')
               AND G043X.STETAPA = 1
               AND G052X.IDG051 = G051.IDG051)
       AND G043.DTENTCON = (SELECT MIN(DTENTCON)
                              FROM G043 A
                              JOIN G052 B
                                ON B.IDG043 = A.IDG043
                             WHERE B.IDG051 = G051.IDG051)
                  
                `;
          
          let resultCount = await con.execute(
          {
            sql: ` select count(*) as QTD from (`+ sql +`) x `,
            param: bindValues //Se não remover lá em cima, dá problema aqui também
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            return result[0];
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });

          
          let result = await con.execute(	

            {sql:sql +
            sqlOrder +
            sqlPaginate,
          param: bindValues
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            if(result.length > 0){
              result[0].COUNT_LINHA = resultCount.QTD;
            }
            return result;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });

          result = (utils.construirObjetoRetornoBD(result, req.body));

        await con.close();
        logger.debug("Fim listar");
        return result;

      } catch (err) {
  
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
  
      }
        
    };


  /**
   * @description Listar um dado na tabela G058.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.buscar = async function (req, res, next) {
    
    logger.debug("Inicio buscar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDG046;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: ` Select G046.IDG046,
                      G046.DSCARGA,
                      G046.IDG031M1,
                      G046.IDG031M2,
                      G046.IDG031M3,
                      G046.IDG032V1,
                      G046.IDG032V2,
                      G046.IDG032V3,
                      G046.IDG024,
                      G046.CDVIAOTI,
                      G046.SNESCOLT,
                      G046.DTCARGA,
                      G046.DTSAICAR,
                      G046.DTPRESAI,
                      G046.PSCARGA,
                      G046.VRCARGA,
                      G046.IDS001,
                      G046.SNDELETE,
                      G046.QTVOLCAR,
                      G046.TPCARGA,
                      G046.QTDISPER,
                      G046.VRPOROCU,
                      G046.IDG030,
                      G046.DTAGENDA,
                      G046.STCARGA,
                      G046.STINTCLI,
                      G046.SNCARPAR,
                      G046.OBCANCEL,
                      G046.IDS001CA,
                      G046.DTCANCEL,
                      G046.IDG028,
                      G046.SNURGENT,
                      G046.TPORIGEM,
                      G046.DTCOLATU,
                      G046.DTCOLORI,
                      G046.STENVLOG,
                      G046.DTPSMANU,
                      G046.IDG034,
                      G046.STPROXIM,
                      G046.VRPERCAR,
                      G046.IDCARLOG,
                      G046.NRPLARE1,
                      G046.NRPLARE2,
                      G046.NRPLAVEI,
                      G046.SNMOBILE,
                      G046.TPTRANSP,
                      G046.DTINIVIA,
                      G046.DTFIMVIA,
                      G046.TPMODCAR,
                      COUNT(G046.IdG046) OVER () as COUNT_LINHA
                From G046 G046
                Where G046.IdG046   = : id
                  And G046.SnDelete = 0`,
        param: {
          id: id
        }
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result[0]);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      await con.close();
      logger.debug("Fim buscar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
      
  };

  return api;
};
