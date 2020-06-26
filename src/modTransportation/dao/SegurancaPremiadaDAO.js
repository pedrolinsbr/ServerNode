/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 * 
*/

/** 
 * @module dao/SegurancaPremiada
 * @description 
 * @param {application} 
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
     * @description Buscar o endereço dos motoristas por campanha
     *
     * @async
     * @function 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.buscarEnderecos = async function (req, res, next) {
  
     
      let objConn = await this.controller.getConnection();
  
      try {

        return await objConn.execute({
          sql:` SELECT DISTINCT INITCAP(G031.NMMOTORI) AS NMMOTORI, 
                INITCAP(G031.DSENDERE) AS DSENDERE, INITCAP(G031.BIENDERE) AS BIENDERE, 
                CASE WHEN NVL(G031.NRENDERE,0) = 0  THEN 'S/N' ELSE G031.NRENDERE END AS NRENDERE, 
                G031.DSCOMEND, G031.CPENDERE, G003.NMCIDADE, G002.CDESTADO
                  FROM G031
                INNER JOIN G099
                    ON G099.IDG031 = G031.IDG031
                INNER JOIN G091
                    ON G091.IDG024 = G099.IDG024
                INNER JOIN G003 
                    ON G003.IDG003 = G031.IDG003
                INNER JOIN G002
                    ON G002.IDG002 = G003.IDG002
                WHERE ((G099.DTDEMMOT IS NULL AND g099.TPCONTRA = 'F') OR (g099.TPCONTRA = 'T')) and G091.IDG090 = ${req.params.id}`,
          param:[]
        }).then((res) => {
            objConn.close();
            return res;
            
        }).catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });
    
      
      } catch (err) {
  
        await objConn.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      
      }
      
    };

       /**
     * @description Lista todos os motoristas do relatório.
     *
     * @async
     * @function /api/tp/segurancapremiada/listar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.buscarMotoristaEnderecos = async function(req,res,next){
    
      try {

        var objConn     = await this.controller.getConnection();
        var sqlWhereAux = '';
        var periodoIni  = '';
        var periodoFim  = '';
        var sqlWith     = '';
        var dataAux     = '';
        var dataMesAno  = '';
  
        /**Período inicial da campanha */
        periodoIni = `(SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G WHERE G.IDG090 = ${req.params.id} AND G.SNDELETE = 0)`;

        /**Período final da campanha */
        periodoFim = `(SELECT TO_CHAR(MAX(G2.DTAPONTA), 'MMYYYY')
                        FROM G093 G2
                      WHERE G2.IDG090 = ${req.params.id}
                        AND G2.SNDELETE = 0
                        AND NVL(G2.SNCOMPUT, 'N') = 'S'
                        AND NVL(G2.STLANCAM, '0') IN (1, 2))`;
        

        /**
         * Essa SQL é responsável por listar todos os meses entre o mês de início e o final.
         * Lembrando que o formato das informações são MMYYYY.
         * 
         */
        sqlMeses = await objConn.execute(
          {
            sql: `Select
                        to_char(add_months(trunc( TO_DATE(${periodoIni},'MMYYYY') ,'mm'),rownum-1),'mm') AS mes,
                        to_char(add_months(trunc( TO_DATE(${periodoIni},'MMYYYY') ,'mm'),rownum-1),'yyyy') AS ano
                    from user_tables 
                    where rownum <= months_between (TO_DATE(NVL(${periodoFim},${periodoIni}),'mmyyyy'), 
                    to_date(${periodoIni},'mmyyyy') 
                    ) + 1`,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

        /**
         * O for abaixo irá montar uma SQL, para cada mês da campanha que o usuário deseja pesquisar.
         * 
         */
        sqlWith = ` WITH VERIFICACAO AS( `; 
        for(let i = 0; i < sqlMeses.length; i++){

          /**Data inicial do mês e ano da busca */
          dataAux    = ` TO_DATE('01/${sqlMeses[i].MES}/${sqlMeses[i].ANO}','DD/MM/YYYY') `;
          /**Mês e ano da busca */
          dataMesAno = sqlMeses[i].MES+''+sqlMeses[i].ANO;

          /**
           * Colunas: MESCOR     -> Mês da busca
           *          PONTMENSAL -> Pontuação total do mês da busca
           *          QTDMES     -> Significa se o mês será contado no total de meses final, se for:
           *                        1 - Motorista trabalhou >= os dias mínimos exigidos pela campanha
           *                        0 - Motorista não trabalhou o mínimo de dias exigidos pela campanha
           *          IDG099     -> Código do motorista na campanha
           *          IDG031     -> Código do motorista no cadastro dos mesmos
           *          IDG024     -> Código da transportadora do motorista
           *          DIASTRA    -> Quantidade de dias que o motorista trabalhou no mês da busca
           *          QTDIASTR   -> Quantidade mínima de dias de trabalho do motorista no mês, exigido pela campanha
           *          QTDDIAS    -> Calcula os dias que o motorista ficou afastado no mês de busca
           * Obs....: Referente a  PONTMENSAL (Pontuação total do mês da busca), será pesquisado apenas lançamentos computados(G093.SNCOMPUT = 'S')
           *          e que já estão com o status de fechado (G093.STLANCAM = 1) ou retificado (G093.STLANCAM = 2)
           *          
           */
          sqlWith += ` SELECT T.*,to_CHAR(LAST_DAY(${dataAux}), 'MM') AS MESCOR,CASE WHEN T.DIASTRA >= T.QTDIASTR THEN
                          (NVL((SELECT SUM(G093Y.VRPONTUA)
                            FROM G093 G093Y
                            inner join g092 g092Y
                              on g092Y.idg092 = g093Y.idg092
                            WHERE G093Y.IDG099 =  T.IDG099
                              and G092Y.TPAPONTA = '+'
                              and G093Y.SNDELETE = 0
                              and NVL(G093Y.SNCOMPUT,'N') = 'S'
                              and NVL(G093Y.STLANCAM,'0') IN (1,2)
                              and to_CHAR(G093Y.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) + 1000) -
                              NVL((SELECT SUM(G093X.VRPONTUA)
                            FROM G093 G093X
                          inner join g092 g092X
                              on g092X.idg092 = g093X.idg092
                          WHERE G093X.IDG099 = T.IDG099
                            and G092X.TPAPONTA = '-'
                            and G093X.SNDELETE = 0
                            and NVL(G093X.SNCOMPUT,'N') = 'S'
                            and NVL(G093X.STLANCAM,'0') IN (1,2)
                            and to_CHAR(G093X.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) 
                          ELSE
                            0 END AS PONTMENSAL,
                          CASE
                              WHEN T.DIASTRA >= T.QTDIASTR THEN
                              1
                              ELSE
                              0
                          END AS QTDMES
                            FROM (SELECT DISTINCT G099.IDG099, G099.IDG031,G099.IDG024,
                  
                                  ((select case
                                    when to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                        G099Y.dtadmmot >
                                        TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD')) then
                                    TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD'))
                                    else
                                    to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                    G099Y.dtadmmot
                                  end as dias_trabalhados
                            from G099 G099Y
                            WHERE G099Y.IDG099 = G099.IDG099)-
                        (SELECT NVL(case
                                    when X.QTDDIAS > TO_CHAR(LAST_DAY(${dataAux}), 'DD') THEN
                                    TO_CHAR(LAST_DAY(${dataAux}), 'DD')
                                    ELSE
                                    TO_CHAR(X.QTDDIAS)
                                  END,0) AS QTDTRA
                            FROM (
                                  
                                  SELECT SUM(
                                              
                                              ((case
                                                when TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                              'MM') > to_number(${sqlMeses[i].MES}) then
                                                  TO_DATE(LAST_DAY(${dataAux}), 'DD/MM/YY')
                                                else
                                                  TO_DATE(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                          'DD/MM/YY')
                                              end) - (CASE
                                                WHEN TO_CHAR(G100.DTINICIO, 'MM') < to_number(${sqlMeses[i].MES}) THEN
                                                  ${dataAux}
                                                ELSE
                                                  TO_DATE(G100.DTINICIO, 'DD/MM/YY')
                                              END))) + 2 AS QTDDIAS
                                  
                                    FROM G100
                                    WHERE G100.IDG099 = G099.IDG099
                                      AND 7 BETWEEN TO_CHAR(G100.DTINICIO, 'MM') AND
                                          TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                  'MM')
                                  
                                  ) X)) AS DIASTRA, G090.QTDIASTR
                    FROM G099
                  INNER JOIN G031
                      ON G031.IDG031 = G099.IDG031
                  INNER JOIN G091
                      ON G091.IDG024 = G099.IDG024
                  INNER JOIN G090
                      ON G090.IDG090 = G091.IDG090
                  WHERE G091.IDG090 = ${req.params.id}
                        ${sqlWhereAux}
                        AND NOT EXISTS (SELECT G099N.IDG099 FROM G099 G099N WHERE G099N.IDG099 = G099.IDG099 AND G099N.TPCONTRA = 'F' AND G099N.DTDEMMOT IS NOT NULL)
                    )T`;
            if(sqlMeses[i+1] != undefined){
              sqlWith += ` UNION ALL `;
            }
        }

        sqlWith += ` ) `; 
  
        return await objConn.execute({
              sql:`${sqlWith}
              select

                  Y.IDG099,
                  Y.NMMOTORI,
                  Y.DSENDERE,
                  Y.BIENDERE,
                  Y.NRENDERE,
                  Y.DSCOMEND,
                  Y.CPENDERE,
                  Y.NMCIDADE,
                  Y.CDESTADO,
                  Y.NMTRANSP,
                  TRIM(TO_CHAR(Y.VLMDTOTA, '999999990D99')) as VLMDTOTA,
                  Y.QTDPASSOS,
                  DENSE_RANK() OVER(PARTITION BY Y.idg090 ORDER BY Y.VLMDTOTA desc) AS nrclassi

                from (SELECT X.IDG099,
                            INITCAP(G031.NMMOTORI) AS NMMOTORI,
                            INITCAP(G031.DSENDERE) AS DSENDERE,
                            INITCAP(G031.BIENDERE) AS BIENDERE,
                            CASE WHEN NVL(G031.NRENDERE,0) = 0  THEN 'S/N' ELSE G031.NRENDERE END AS NRENDERE,
                            G031.DSCOMEND,
                            G031.CPENDERE,
                            G003.NMCIDADE,
                            G002.CDESTADO,
                            
                            G024.NMTRANSP || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']' AS NMTRANSP,
                            CASE
                              WHEN X.QTDMESTOT = 0 THEN
                                0.00
                              ELSE
                                to_number(TRIM(ROUND((X.VLTOTAL / X.QTDMESTOT), 2)))
                            END AS VLMDTOTA,
                            X.QTDPASSOS,
                            X.IDG090
                        FROM (SELECT DISTINCT G099.IDG099,
                                              G099.IDG031,
                                              G091.IDG024,
                                              G090.idg090,
                                              round(months_between(last_day(G090.DTFIM),
                                                                  trunc(current_date, 'MM'))) as qtdPassos,
                                              SUM(G099.PONTMENSAL) AS VLTOTAL,
                                              SUM(G099.QTDMES) AS QTDMESTOT
                              
                                FROM VERIFICACAO G099
                              INNER JOIN G091
                                  ON G091.IDG024 = G099.IDG024
                              INNER JOIN G090
                                  ON G090.IDG090 = G091.IDG090
                              GROUP BY G099.IDG099,
                                        G099.IDG031,
                                        G091.IDG024,
                                        G090.idg090,
                                        round(months_between(last_day(G090.DTFIM),
                                                            trunc(current_date, 'MM')))) X
                      INNER JOIN G031
                          ON G031.IDG031 = X.IDG031
                      INNER JOIN G099
                          ON G099.IDG031 = G031.IDG031
                      INNER JOIN G024
                          ON G024.IDG024 = X.IDG024
                      INNER JOIN G003
                          ON G003.IDG003 = G031.IDG003
                      INNER JOIN G002
                          ON G002.IDG002 = G003.IDG002
                      WHERE ((G099.DTDEMMOT IS NULL AND g099.TPCONTRA = 'F') OR
                            (g099.TPCONTRA = 'T'))) Y
                        ORDER BY 13 ASC`,
                            param:[]
          }).then((res) => {
              objConn.close();
              return res;
              
          }).catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
          });
          
      } catch (err) {
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      }
  
    };

   /**
     * @description Lista todos os motoristas do relatório.
     *
     * @async
     * @function /api/tp/segurancapremiada/listar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.listar = async function(req,res,next){
    
      try {

        let objConn     = await this.controller.getConnection(req.objConn, req.UserId);
        let motorista   = req.body['parameter[IDG099][id]'] == undefined ? null : req.body['parameter[IDG099][id]'];
        let sqlWhereAux = '';
        let periodoIni  = '';
        let periodoFim  = '';
        let sqlWith     = '';
        let dataAux     = '';
        let dataMesAno  = '';

        let idg024 = await this.validarFilial(req.UserId);
  
        var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'Z',false);
        
        /*Busca por motorista*/
        if(motorista != null){
    
             sqlJoin    = ` INNER JOIN G092 ON G092.IDG092 = G093.IDG092
                            INNER JOIN G093 ON G093.IDG099 = G099.IDG099  `;
    
            sqlColumns  = ` , G092.DSAPONTA, G093.VRPONTUA, G093.DTAPONTA, G093.DSOBSERV, G092.TPAPONTA`;
  
            sqlWhereAux = ` AND G099.IDG099 = ${motorista} `;
    
        }
       
       /* 
        * Mês início
        * Caso o usuário não selecionar nenhum mês de início, o sistema colocará o mês inicial da campanha.
        * Lembrando que o formato dessa informação é MMYYYY.
        */
        if(req.body['parameter[MESINI][id]'] != '' && req.body['parameter[MESINI][id]'] != undefined){
          periodoIni = `'${req.body['parameter[MESINI][id]']}'`;
        }else{
          periodoIni = `(SELECT to_CHAR(MIN(G.DTINICIO),'MMYYYY') AS DTINICIO FROM G090 G WHERE G.SNDELETE = 0)`;
        }
        
        /* 
        * Mês final
        * Caso o usuário não selecionar nenhum mês final para a busca, o sistema colocará o mês final da campanha.
        * Lembrando que o formato dessa informação é MMYYYY.
        */
        if(req.body['parameter[MESFIM][id]'] != '' && req.body['parameter[MESFIM][id]'] != undefined){
          periodoFim = `'${req.body['parameter[MESFIM][id]']}'`;
        }else{
          periodoFim = `(SELECT CASE WHEN TO_CHAR(MAX(G.DTFIM),'YYYYMM') > TO_CHAR(CURRENT_DATE,'YYYYMM') THEN TO_CHAR(CURRENT_DATE,'MMYYYY') ELSE
                          TO_CHAR(MAX(G.DTFIM),'MMYYYY') END AS DTFIM FROM G090 G WHERE G.SNDELETE = 0)`;
        }

        /**
         * Essa SQL é responsável por listar todos os meses entre o mês de início e o final.
         * Lembrando que o formato das informações são MMYYYY.
         * 
         */
        sqlMeses = await objConn.execute(
          {
            sql: `Select
                        to_char(add_months(trunc( TO_DATE(${periodoIni},'MMYYYY') ,'mm'),rownum-1),'mm') AS mes,
                        to_char(add_months(trunc( TO_DATE(${periodoIni},'MMYYYY') ,'mm'),rownum-1),'yyyy') AS ano
                    from user_tables 
                    where rownum <= months_between (TO_DATE(${periodoFim},'mmyyyy'), 
                    to_date(${periodoIni},'mmyyyy') 
                    ) + 1`,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

        /**
         * O for abaixo irá montar uma SQL, para cada mês da campanha que o usuário deseja pesquisar.
         * 
         */
        sqlWith = ` WITH VERIFICACAO AS( `; 
        for(let i = 0; i < sqlMeses.length; i++){

          /**Data inicial do mês e ano da busca */
          dataAux    = ` TO_DATE('01/${sqlMeses[i].MES}/${sqlMeses[i].ANO}','DD/MM/YYYY') `;
          /**Mês e ano da busca */
          dataMesAno = sqlMeses[i].MES+''+sqlMeses[i].ANO;

          /**
           * Colunas: MESCOR     -> Mês da busca
           *          PONTMENSAL -> Pontuação total do mês da busca
           *          QTDMES     -> Significa se o mês será contado no total de meses final, se for:
           *                        1 - Motorista trabalhou >= os dias mínimos exigidos pela campanha
           *                        0 - Motorista não trabalhou o mínimo de dias exigidos pela campanha
           *          IDG099     -> Código do motorista na campanha
           *          IDG031     -> Código do motorista no cadastro dos mesmos
           *          IDG024     -> Código da transportadora do motorista
           *          DIASTRA    -> Quantidade de dias que o motorista trabalhou no mês da busca
           *          QTDIASTR   -> Quantidade mínima de dias de trabalho do motorista no mês, exigido pela campanha
           *          QTDDIAS    -> Calcula os dias que o motorista ficou afastado no mês de busca
           *          
           */
          sqlWith += ` SELECT T.*,to_CHAR(LAST_DAY(${dataAux}), 'MM') AS MESCOR,CASE WHEN T.DIASTRA >= T.QTDIASTR THEN
                          (NVL((SELECT SUM(G093Y.VRPONTUA)
                            FROM G093 G093Y
                            inner join g092 g092Y
                              on g092Y.idg092 = g093Y.idg092
                            WHERE G093Y.IDG099 =  T.IDG099
                              and G092Y.TPAPONTA = '+'
                              and G093Y.SNDELETE = 0
                              and NVL(G093Y.SNCOMPUT,'S') = 'S'
                              and NVL(G093Y.STLANCAM,'0') IN (0,1,2)
                              and to_CHAR(G093Y.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) + 1000) -
                              NVL((SELECT SUM(G093X.VRPONTUA)
                            FROM G093 G093X
                          inner join g092 g092X
                              on g092X.idg092 = g093X.idg092
                          WHERE G093X.IDG099 = T.IDG099
                            and G092X.TPAPONTA = '-'
                            and G093X.SNDELETE = 0
                            and NVL(G093X.SNCOMPUT,'S') = 'S'
                            and NVL(G093X.STLANCAM,'0') IN (0,1,2)
                            and to_CHAR(G093X.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) 
                          ELSE
                            0 END AS PONTMENSAL,
                          CASE
                              WHEN T.DIASTRA >= T.QTDIASTR THEN
                              1
                              ELSE
                              0
                          END AS QTDMES
                            FROM (SELECT DISTINCT G099.IDG099, G099.IDG031,G099.IDG024,
                  
                                  ((select case
                                    when to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                        G099Y.dtadmmot >
                                        TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD')) then
                                    TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD'))
                                    else
                                    to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                    G099Y.dtadmmot
                                  end as dias_trabalhados
                            from G099 G099Y
                            WHERE G099Y.IDG099 = G099.IDG099)-
                        (SELECT NVL(case
                                    when X.QTDDIAS > TO_CHAR(LAST_DAY(${dataAux}), 'DD') THEN
                                    TO_CHAR(LAST_DAY(${dataAux}), 'DD')
                                    ELSE
                                    TO_CHAR(X.QTDDIAS)
                                  END,0) AS QTDTRA
                            FROM (
                                  
                                  SELECT SUM(
                                              
                                              ((case
                                                when TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                              'MM') > to_number(${sqlMeses[i].MES}) then
                                                  TO_DATE(LAST_DAY(${dataAux}), 'DD/MM/YY')
                                                else
                                                  TO_DATE(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                          'DD/MM/YY')
                                              end) - (CASE
                                                WHEN TO_CHAR(G100.DTINICIO, 'MM') < to_number(${sqlMeses[i].MES}) THEN
                                                  ${dataAux}
                                                ELSE
                                                  TO_DATE(G100.DTINICIO, 'DD/MM/YY')
                                              END))) + 2 AS QTDDIAS
                                  
                                    FROM G100
                                    WHERE G100.IDG099 = G099.IDG099
                                      AND 7 BETWEEN TO_CHAR(G100.DTINICIO, 'MM') AND
                                          TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                  'MM')
                                  
                                  ) X)) AS DIASTRA, G090.QTDIASTR
                    FROM G099
                  INNER JOIN G031
                      ON G031.IDG031 = G099.IDG031
                  INNER JOIN G091
                      ON G091.IDG024 = G099.IDG024
                  INNER JOIN G090
                      ON G090.IDG090 = G091.IDG090
                  WHERE G091.IDG090 = ${req.body['parameter[IDG090][id]']}
                        ${sqlWhereAux}
                        AND NOT EXISTS (SELECT G099N.IDG099 FROM G099 G099N WHERE G099N.IDG099 = G099.IDG099 AND G099N.TPCONTRA = 'F' AND G099N.DTDEMMOT IS NOT NULL)
                    )T`;
            if(sqlMeses[i+1] != undefined){
              sqlWith += ` UNION ALL `;
            }
        }

        sqlWith += ` ) `; 
  
        var reqAux = req;
  
        return await objConn.execute({
              sql:`${sqlWith}
              select
                      Z.IDG099,
                      Z.IDG024,
                      Z.NMMOTORI,
                      Z.NMTRANSP,
                      Z.VLMDTOTA,
                      Z.QTDMESTOT,
                      Z.VLTOTAL,
                      Z.nrclassi,
                      Z.COUNT_LINHA
                from (SELECT   X.IDG099,
                              X.IDG024,
                              X.NMMOTORI,
                              X.NMTRANSP,
                              TRIM(TO_CHAR(X.VLMDTOTA,'999999990D99')) as VLMDTOTA,
                              X.QTDMESTOT,
                              X.VLTOTAL,
                              DENSE_RANK() OVER(PARTITION BY X.idg090 ORDER BY X.VLMDTOTA desc) AS nrclassi,
                              COUNT(X.IDG099) OVER() as COUNT_LINHA
                        FROM (SELECT Y.IDG099,
                                    Y.IDG024,
                                    Y.NMMOTORI,
                                    Y.NMTRANSP,
                                    Y.IDG090,
                                    CASE
                                      WHEN Y.QTDMESTOT = 0 THEN
                                        0.00
                                      ELSE
                                        to_number(TRIM(ROUND((Y.VLTOTAL / Y.QTDMESTOT), 2)))
                                    END AS VLMDTOTA,
                                    Y.QTDMESTOT,
                                    TRIM(TO_CHAR(Y.VLTOTAL, '999999990D99')) as VLTOTAL
                                FROM (SELECT DISTINCT G099.IDG099,
                                                      G024.IDG024,
                                                      G031.NMMOTORI,
                                                      G024.NMTRANSP || ' [' || G024.IDG024 || '-' ||
                                                      G024.IDLOGOS || ']' AS NMTRANSP,
                                                      G090.idg090,
                                                      SUM(G099.PONTMENSAL) AS VLTOTAL,
                                                      SUM(G099.QTDMES) AS QTDMESTOT
                                        FROM VERIFICACAO G099
                                      INNER JOIN G031
                                          ON G031.IDG031 = G099.IDG031
                                      INNER JOIN G091
                                          ON G091.IDG024 = G099.IDG024
                                      INNER JOIN G024
                                          ON G024.IDG024 = G091.IDG024
                                      INNER JOIN G090
                                          ON G090.IDG090 = G091.IDG090
                                      GROUP BY G099.IDG099,
                                                G024.IDG024,
                                                G031.NMMOTORI,
                                                G024.NMTRANSP || ' [' || G024.IDG024 || '-' ||
                                                G024.IDLOGOS || ']',
                                                G090.idg090) Y
                              group by Y.IDG099,
                                        Y.IDG024,
                                        Y.NMMOTORI,
                                        Y.NMTRANSP,
                                        Y.VLTOTAL,
                                        Y.QTDMESTOT,
                                        Y.idg090) X) Z`+
                                              sqlOrder+
                                              sqlPaginate,
                                              param:[]
        }).then((res) => {
              objConn.close();
              if(idg024 != null){
                   res = res.map( function( elem, index ) {
                    if(!idg024.includes(elem.IDG024)){
                      res[index].NMMOTORI = 'xxxxxxxxxxxxxxxxxxxxxxxx';
                      res[index].NMTRANSP = 'xxxxxxxxxxxxxxxxxxxxxxxx';
                    }
                    return res[index];
                });
                
              }

              return (utils.construirObjetoRetornoBD(res, reqAux.body));
              
          }).catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
          });
          
      } catch (err) {
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      }
  
    };

   /**
     * @description Busca todos os lançamentos de um determinado motorista.
     *
     * @async
     * @function /api/tp/segurancapremiada/buscaLancMotorista
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.buscaLancMotorista = async function(req,res,next){
    
      try {

        let objConn     = await this.controller.getConnection(req.objConn, req.UserId);
        let motorista   = req.body.obj.IDG099;
        let periodoIni  = '';
        let periodoFim  = '';
        let sqlWith     = '';
        let dataAux     = '';
        let dataMesAno  = '';

        let idg024 = await this.validarFilial(req.UserId);

        if(idg024 != null && !idg024.includes(req.body.obj.IDG024)){
          objConn.close();
          return { message: 'Este motorista não pertence a sua filial.' };
        }

        let sqlOrder = ` ORDER BY X.DTAPONTA DESC, X.IDG092`;
       
        /* 
        * Mês início
        * Caso o usuário não selecionar nenhum mês de início, o sistema colocará o mês inicial da campanha.
        * Lembrando que o formato dessa informação é MMYYYY.
        */
        if(req.body.obj.MESINI != null && req.body.obj.MESINI.id != '' && req.body.obj.MESINI.id != undefined){
          periodoIni = `'${req.body.obj.MESINI.id}'`;
        }else{
          periodoIni = `(SELECT to_CHAR(G.DTINICIO,'MMYYYY') AS DTINICIO FROM G090 G WHERE G.SNDELETE = 0 AND G.IDG090 = ${req.body.obj.IDG090.id})`;
        }
        
       /* 
        * Mês final
        * Caso o usuário não selecionar nenhum mês final para a busca, o sistema colocará o mês final da campanha.
        * Lembrando que o formato dessa informação é MMYYYY.
        */
        if(req.body.obj.MESFIM != null && req.body.obj.MESFIM.id != '' && req.body.obj.MESFIM.id != undefined){
          periodoFim = `'${req.body.obj.MESFIM.id}'`;
        }else{
          periodoFim = `(SELECT CASE WHEN TO_CHAR(G.DTFIM,'YYYYMM') > TO_CHAR(CURRENT_DATE,'YYYYMM') THEN TO_CHAR(CURRENT_DATE,'MMYYYY') ELSE
                          TO_CHAR(G.DTFIM,'MMYYYY') END AS DTFIM FROM G090 G WHERE G.SNDELETE = 0 AND G.IDG090 = ${req.body.obj.IDG090.id})`;
        }

       /**
         * Essa SQL é responsável por listar todos os meses entre o mês de início e o final.
         * Lembrando que o formato das informações são MMYYYY.
         * 
         */
        sqlMeses = await objConn.execute(
          {
            sql: `Select
                        to_char(add_months(trunc( TO_DATE(${periodoIni},'MMYYYY') ,'mm'),rownum-1),'mm') AS mes,
                        to_char(add_months(trunc( TO_DATE(${periodoIni},'MMYYYY') ,'mm'),rownum-1),'yyyy') AS ano
                    from user_tables 
                    where rownum <= months_between (TO_DATE(${periodoFim},'mmyyyy'), 
                    to_date(${periodoIni},'mmyyyy') 
                    ) + 1`,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

        /**
         * O for abaixo irá montar uma SQL, para cada mês da campanha que o usuário deseja pesquisar.
         * 
         */
        sqlWith = ` WITH VERIFICACAO AS( `; 
        for(let i = 0; i < sqlMeses.length; i++){

          /**Data inicial do mês e ano da busca */
          dataAux    = ` TO_DATE('01/${sqlMeses[i].MES}/${sqlMeses[i].ANO}','DD/MM/YYYY') `;
           /**Mês e ano da busca */
          dataMesAno = sqlMeses[i].MES+''+sqlMeses[i].ANO;

          /**
           * Colunas: MESCOR     -> Mês da busca
           *          PONTMENSAL -> Pontuação total do mês da busca
           *          QTDMES     -> Significa se o mês será contado no total de meses final, se for:
           *                        1 - Motorista trabalhou >= os dias mínimos exigidos pela campanha
           *                        0 - Motorista não trabalhou o mínimo de dias exigidos pela campanha
           *          IDG099     -> Código do motorista na campanha
           *          IDG031     -> Código do motorista no cadastro dos mesmos
           *          IDG024     -> Código da transportadora do motorista
           *          DIASTRA    -> Quantidade de dias que o motorista trabalhou no mês da busca
           *          QTDIASTR   -> Quantidade mínima de dias de trabalho do motorista no mês, exigido pela campanha
           *          QTDDIAS    -> Calcula os dias que o motorista ficou afastado no mês de busca
           *          
           */
          sqlWith += ` SELECT T.*,to_CHAR(LAST_DAY(${dataAux}), 'MM') AS MESCOR,to_CHAR(LAST_DAY(${dataAux}), 'YYYY') AS ANOCOR, CASE WHEN T.DIASTRA >= T.QTDIASTR THEN
                          (NVL((SELECT SUM(G093Y.VRPONTUA)
                            FROM G093 G093Y
                            inner join g092 g092Y
                              on g092Y.idg092 = g093Y.idg092
                            WHERE G093Y.IDG099 =  T.IDG099
                              and G092Y.TPAPONTA = '+'
                              and G093Y.SNDELETE = 0
                              and NVL(G093Y.SNCOMPUT,'S') = 'S'
                              and NVL(G093Y.STLANCAM,'0') IN (0,1,2)
                              and to_CHAR(G093Y.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) + 1000) -
                              NVL((SELECT SUM(G093X.VRPONTUA)
                            FROM G093 G093X
                          inner join g092 g092X
                              on g092X.idg092 = g093X.idg092
                          WHERE G093X.IDG099 = T.IDG099
                            and G092X.TPAPONTA = '-'
                            and G093X.SNDELETE = 0
                            and NVL(G093X.SNCOMPUT,'S') = 'S'
                            and NVL(G093X.STLANCAM,'0') IN (0,1,2)
                            and to_CHAR(G093X.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) 
                          ELSE
                            0 END AS PONTMENSAL FROM (SELECT DISTINCT G099.IDG099, G099.IDG031,G099.DTADMMOT, G099.DTDEMMOT,G099.IDG024,
                  
                                  ((select case
                                    when to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                        G099Y.dtadmmot >
                                        TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD')) then
                                    TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD'))
                                    else
                                    to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                    G099Y.dtadmmot
                                  end as dias_trabalhados
                            from G099 G099Y
                            WHERE G099Y.IDG099 = G099.IDG099)-
                        (SELECT NVL(case
                                    when X.QTDDIAS > TO_CHAR(LAST_DAY(${dataAux}), 'DD') THEN
                                    TO_CHAR(LAST_DAY(${dataAux}), 'DD')
                                    ELSE
                                    TO_CHAR(X.QTDDIAS)
                                  END,0) AS QTDTRA
                            FROM (
                                  
                                  SELECT SUM(
                                              
                                              ((case
                                                when TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                              'MM') > to_number(${sqlMeses[i].MES}) then
                                                  TO_DATE(LAST_DAY(${dataAux}), 'DD/MM/YY')
                                                else
                                                  TO_DATE(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                          'DD/MM/YY')
                                              end) - (CASE
                                                WHEN TO_CHAR(G100.DTINICIO, 'MM') < to_number(${sqlMeses[i].MES}) THEN
                                                  ${dataAux}
                                                ELSE
                                                  TO_DATE(G100.DTINICIO, 'DD/MM/YY')
                                              END))) + 2 AS QTDDIAS
                                  
                                    FROM G100
                                    WHERE G100.IDG099 = G099.IDG099
                                      AND 7 BETWEEN TO_CHAR(G100.DTINICIO, 'MM') AND
                                          TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                  'MM')
                                  
                                  ) X)) AS DIASTRA, G090.QTDIASTR
                    FROM G099
                  INNER JOIN G031
                      ON G031.IDG031 = G099.IDG031
                  INNER JOIN G091
                      ON G091.IDG024 = G099.IDG024
                  INNER JOIN G090
                      ON G090.IDG090 = G091.IDG090
                  WHERE G091.IDG090 = ${req.body.obj.IDG090.id}
                        AND G099.IDG099 = ${motorista}
                        AND NOT EXISTS (SELECT G099N.IDG099 FROM G099 G099N WHERE G099N.IDG099 = G099.IDG099 AND G099N.TPCONTRA = 'F' AND G099N.DTDEMMOT IS NOT NULL)
                    )T`;
            if(sqlMeses[i+1] != undefined){
              sqlWith += ` UNION ALL `;
            }
        }

        sqlWith += ` ) `; 

        return await objConn.execute({
              sql:`${sqlWith}
              SELECT 
              
                X.IDG099,
                X.NMMOTORI,
                X.NMTRANSP,
                X.DSAPONTA,
                X.TPAPONTA,
                X.VRPONTUA,
                X.DTAPONTA,
                X.SNCOMPUT,
                X.Stlancam,
                X.DSCAMPAN,
                X.DTINICIO,
                X.DTFIM,
                X.PTINICIO,
                X.PTMENSAL,
                X.DSPREMIA,
                X.VLTOTAL,
                X.IDG092,
                X.DTADMMOT, 
                X.DTDEMMOT,
                CASE WHEN X.idg092 NOT IN (17,0,19,18) THEN (SELECT X.VRPONTUA/G092.VRPONTUA FROM G092 G092 WHERE G092.IDG092 = X.idg092) ELSE 1 END QTDAPONT

              FROM (SELECT  
                Z.IDG099,
                Z.NMMOTORI,
                Z.NMTRANSP,
                Z.DSAPONTA,
                Z.TPAPONTA,
                TO_CHAR(ROUND(SUM(Z.VRPONTUA), 2), '999999990D99') AS VRPONTUA,
                Z.DTAPONTA,
                Z.SNCOMPUT,
                Z.Stlancam,
                Z.DSCAMPAN,
                Z.DTINICIO,
                Z.DTFIM,
                Z.PTINICIO,
                Z.PTMENSAL,
                Z.DSPREMIA,
                Z.VLTOTAL,
                Z.IDG092,
                Z.DTADMMOT, 
                Z.DTDEMMOT
              FROM (SELECT DISTINCT G093.IDG093,G099.IDG099,
                initcap(G031.NMMOTORI) as NMMOTORI,
                initcap(G024.NMTRANSP) || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']' AS NMTRANSP,
                G092.DSAPONTA,
                G092.TPAPONTA,
                TO_CHAR(ROUND(G093.VRPONTUA, 2), '999999990D99') AS VRPONTUA,
                G093.DTAPONTA,
                G093.SNCOMPUT,
                G093.Stlancam,
                G090.DSCAMPAN,
                G090.DTINICIO,
                G090.DTFIM,
                G090.PTINICIO,
                G090.PTMENSAL,
                G090.DSPREMIA,
                G093.IDG092,
                G099.DTADMMOT, 
                G099.DTDEMMOT,
                SUM(G099.PONTMENSAL) AS VLTOTAL
          FROM VERIFICACAO G099
          INNER JOIN G031
              ON G031.IDG031 = G099.IDG031
          INNER JOIN G091
              ON G091.IDG024 = G099.IDG024
          INNER JOIN G024
              ON G024.IDG024 = G091.IDG024
          INNER JOIN G090
              ON G090.IDG090 = G091.IDG090
          INNER JOIN G093
              ON G093.IDG090 = G090.IDG090 AND G093.IDG099 = G099.IDG099 AND G093.SNDELETE = 0
          INNER JOIN G092
              ON G092.IDG092 = G093.IDG092
          WHERE G093.SNDELETE = 0 --and NVL(G093Y.STLANCAM,'0') IN (0,1,2)
          GROUP BY G093.IDG093,
                G099.IDG099,
                initcap(G031.NMMOTORI),
                initcap(G024.NMTRANSP) || ' [' || G024.IDG024 || '-' || G024.IDLOGOS || ']',
                G092.DSAPONTA,
                G092.TPAPONTA,
                TO_CHAR(ROUND(G093.VRPONTUA, 2), '999999990D99'),
                G093.DTAPONTA,
                G093.SNCOMPUT,
                G093.Stlancam,
                G090.DSCAMPAN,
                G090.DTINICIO,
                G090.DTFIM,
                G090.PTINICIO,
                G090.PTMENSAL,
                G090.DSPREMIA,
                G093.IDG092,
                G099.DTADMMOT, 
                G099.DTDEMMOT
      
                UNION ALL
      
              SELECT 0 AS IDG093,G099.IDG099,
               initcap(G031.NMMOTORI) as NMMOTORI,
               initcap(G024.NMTRANSP) || ' [' || G024.IDG024 || '-' ||
               G024.IDLOGOS || ']' AS NMTRANSP,
               'Pontuação Mensal' AS DSAPONTA,
               '+' as TPAPONTA,
               case
                 when g099.diastra >= g099.qtdiastr then
                  '1000'
                 else
                  '0'
               end as VRPONTUA,
               TO_DATE('01/' || g099.MESCOR || '/' || G099.ANOCOR,
                       'DD/MM/YYYY') as DTAPONTA,
                  CASE WHEN TABLE_SNCOMPUT.SNCOMPUT IS NULL AND TO_DATE(CURRENT_DATE,'DD/MM/YYYY') > LAST_DAY( TO_DATE('01/' || g099.MESCOR || '/' || G099.ANOCOR,'DD/MM/YYYY')) 
                       THEN 
                        'S' 
                       ELSE 
                        TABLE_SNCOMPUT.SNCOMPUT 
                       END AS SNCOMPUT,
               0 as Stlancam,
               G090.DSCAMPAN,
               G090.DTINICIO,
               G090.DTFIM,
               G090.PTINICIO,
               G090.PTMENSAL,
               G090.DSPREMIA,
               0 AS IDG092,
               G099.DTADMMOT, 
               G099.DTDEMMOT,
               SUM(G099.PONTMENSAL) AS VLTOTAL
          FROM VERIFICACAO G099
         INNER JOIN G031
            ON G031.IDG031 = G099.IDG031
         INNER JOIN G091
            ON G091.IDG024 = G099.IDG024
         INNER JOIN G024
            ON G024.IDG024 = G091.IDG024
         INNER JOIN G090
            ON G090.IDG090 = G091.IDG090
         OUTER APPLY (SELECT G093.SNCOMPUT   
              FROM G093 
             WHERE TO_CHAR(G093.DTAPONTA, 'MM') = G099.MESCOR AND G093.IDG090 = G090.IDG090
               AND G093.SNDELETE = 0
               AND ROWNUM = 1) TABLE_SNCOMPUT
         group by G099.IDG099,
                  initcap(G031.NMMOTORI),
                  initcap(G024.NMTRANSP) || ' [' || G024.IDG024 || '-' ||
                  G024.IDLOGOS || ']',
                  case
                    when g099.diastra >= g099.qtdiastr then
                     '1000'
                    else
                    '0'
                  end,
                  TO_DATE('01/' || g099.MESCOR || '/' || G099.ANOCOR,
                          'DD/MM/YYYY'),
                  G099.MESCOR,
                  TABLE_SNCOMPUT.SNCOMPUT,
                  G090.DSCAMPAN,
                  G090.DTINICIO,
                  G090.DTFIM,
                  G090.PTINICIO,
                  G090.PTMENSAL,
                  G090.DSPREMIA,
                  G099.DTADMMOT, 
                  G099.DTDEMMOT)Z
                  GROUP BY Z.IDG099,
                Z.NMMOTORI,
                Z.NMTRANSP,
                Z.DSAPONTA,
                Z.TPAPONTA,
                Z.DTAPONTA,
                Z.SNCOMPUT,
                Z.Stlancam,
                Z.DSCAMPAN,
                Z.DTINICIO,
                Z.DTFIM,
                Z.PTINICIO,
                Z.PTMENSAL,
                Z.DSPREMIA,
                Z.VLTOTAL,
                Z.IDG092,
                Z.DTADMMOT, 
                Z.DTDEMMOT) X `+
              sqlOrder,
              param:[]
          }).then((res) => {
              objConn.close();
              return res;
              
          }).catch((err) => {
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
          });
          
      } catch (err) {
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      }
  
    }


    /**
     * @description Fechar os lançamentos do mês
     *
     * @async
     * @function /api/tp/segurancapremiada/fecharLancamentos
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.fecharLancamentos = async function(req,res,next){
    
      try {

          var objConn     = await this.controller.getConnection();
          let sqlWhereAux = req.body.IDG090 == null ? '' : ` G090.IDG090 = ${req.body.IDG090} AND `;
          let sqlWith     = '';
          let dataAux     = '';
          let dataMesAno  = '';
        

          /**Data inicial do mês e ano da busca */
          dataAux    = ` TO_DATE('01/${req.body.CDMES.id.substr(0,2)}/${req.body.CDMES.id.substr(2,req.body.CDMES.id.length)}','DD/MM/YYYY') `;
          /**Mês e ano da busca */
          dataMesAno = req.body.CDMES.id;

            /**
             * Colunas: MESCOR     -> Mês da busca
             *          PONTMENSAL -> Pontuação total do mês da busca
             *          QTDMES     -> Significa se o mês será contado no total de meses final, se for:
             *                        1 - Motorista trabalhou >= os dias mínimos exigidos pela campanha
             *                        0 - Motorista não trabalhou o mínimo de dias exigidos pela campanha
             *          IDG099     -> Código do motorista na campanha
             *          IDG031     -> Código do motorista no cadastro dos mesmos
             *          IDG024     -> Código da transportadora do motorista
             *          DIASTRA    -> Quantidade de dias que o motorista trabalhou no mês da busca
             *          QTDIASTR   -> Quantidade mínima de dias de trabalho do motorista no mês, exigido pela campanha
             *          QTDDIAS    -> Calcula os dias que o motorista ficou afastado no mês de busca
             *          
           *          
             *          
             */
            sqlWith = ` SELECT T.*,to_CHAR(LAST_DAY(${dataAux}), 'MM') AS MESCOR,CASE WHEN T.DIASTRA >= T.QTDIASTR THEN
                          (NVL((SELECT SUM(G093Y.VRPONTUA)
                            FROM G093 G093Y
                            inner join g092 g092Y
                              on g092Y.idg092 = g093Y.idg092
                            WHERE G093Y.IDG099 =  T.IDG099
                              and G092Y.TPAPONTA = '+'
                              and G093Y.SNDELETE = 0
                              and NVL(G093Y.SNCOMPUT,'N') = 'N'
                              and to_CHAR(G093Y.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) + 1000) -
                              NVL((SELECT SUM(G093X.VRPONTUA)
                            FROM G093 G093X
                          inner join g092 g092X
                              on g092X.idg092 = g093X.idg092
                          WHERE G093X.IDG099 = T.IDG099
                            and G092X.TPAPONTA = '-'
                            and G093X.SNDELETE = 0
                            and NVL(G093X.SNCOMPUT,'N') = 'N'
                            and to_CHAR(G093X.DTAPONTA, 'MMYYYY') = '${dataMesAno}'),0) 
                          ELSE
                            0 END AS PONTMENSAL,
                          CASE
                              WHEN T.DIASTRA >= T.QTDIASTR THEN
                              1
                              ELSE
                              0
                          END AS QTDMES
                            FROM (SELECT DISTINCT G099.IDG099, G099.IDG031,G099.IDG024,
                  
                                  ((select case
                                    when to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                        G099Y.dtadmmot >
                                        TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD')) then
                                    TO_NUMBER(to_char(LAST_DAY(${dataAux}), 'DD'))
                                    else
                                    to_date(LAST_DAY(${dataAux}), 'DD/MM/YY') -
                                    G099Y.dtadmmot
                                  end as dias_trabalhados
                            from G099 G099Y
                            WHERE G099Y.IDG099 = G099.IDG099)-
                        (SELECT NVL(case
                                    when X.QTDDIAS > TO_CHAR(LAST_DAY(${dataAux}), 'DD') THEN
                                    TO_CHAR(LAST_DAY(${dataAux}), 'DD')
                                    ELSE
                                    TO_CHAR(X.QTDDIAS)
                                  END,0) AS QTDTRA
                            FROM (
                                  
                                  SELECT SUM(
                                              
                                              ((case
                                                when TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                              'MM') > to_number(${dataMesAno.substr(0,2)}) then
                                                  TO_DATE(LAST_DAY(${dataAux}), 'DD/MM/YY')
                                                else
                                                  TO_DATE(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                          'DD/MM/YY')
                                              end) - (CASE
                                                WHEN TO_CHAR(G100.DTINICIO, 'MM') < to_number(${dataMesAno.substr(0,2)}) THEN
                                                  ${dataAux}
                                                ELSE
                                                  TO_DATE(G100.DTINICIO, 'DD/MM/YY')
                                              END))) + 2 AS QTDDIAS
                                  
                                    FROM G100
                                    WHERE G100.IDG099 = G099.IDG099
                                      AND 7 BETWEEN TO_CHAR(G100.DTINICIO, 'MM') AND
                                          TO_CHAR(NVL(G100.DTFINAL, LAST_DAY(${dataAux})),
                                                  'MM')
                                  
                                  ) X)) AS DIASTRA, G090.QTDIASTR
                    FROM G099
                  INNER JOIN G031
                      ON G031.IDG031 = G099.IDG031
                  INNER JOIN G091
                      ON G091.IDG024 = G099.IDG024
                  INNER JOIN G090
                      ON G090.IDG090 = G091.IDG090
                  WHERE ${sqlWhereAux} NOT EXISTS (SELECT G099N.IDG099 FROM G099 G099N WHERE G099N.IDG099 = G099.IDG099 AND G099N.TPCONTRA = 'F' AND G099N.DTDEMMOT IS NOT NULL)
                    )T`;

            
            /**Verifica todos os motorista da campanha e se estão válidos a terem seus lançamentos computados */
            let result = await objConn.execute({
                sql:sqlWith,
                param:[]
            }).then((res) => {
                return res;
            }).catch((err) => {
                objConn.closeRollBack();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });

            /**Informar nos lançamentos de cada motorista se foi computado ou não */
            let sncomput = '';
            let update   = '';
            for (let index = 0; index < result.length; index++) {

              sncomput = result[index].QTDMES == 1 ? 'S' : 'N';

              update   = await
              objConn.update({
                tabela: 'G093',
                colunas: {
                  SnComput: sncomput,
                  StLancam: 1
                },
                condicoes: ` IdG099 = ${result[index].IDG099} And TO_CHAR(DtAponta,'MMYYYY') = ${dataMesAno} And SnDelete = 0`
              }).then((result1) => {
                return result1;
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
              });
              
            }

            await objConn.close();
            return true;
        
    
      } catch (err) {
          
            res.status(500);
            res.json(resposta);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
      }
      
  
    }

    /**
     * @description Verificar se pode realizar o fechamento da campanha e salvar na tabela de 
     * histórico a aprovação do usuário
     *
     * @async
     * @function /api/tp/segurancapremiada/validaFechamento
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.validaFechamento = async function(req,res,next){
    
      try {

        let objConn   = await this.controller.getConnection();

        /** Insere as informações na tabela de histórico */
        let insert = await objConn.insert({
          tabela: 'G104',
          colunas: {
            IDS001  : req.body.USERID,
            IDG090  : req.body.IDG090,
            IDG024  : req.body.IDG024,
            IDG097  : req.body.IDG097,
            MESANOVI: req.body.CDMES.id,
            DTFECHAM: dtatu.dataAtualJS(),
          },
          key: 'IDG104'
        })
        .then((result) => {
            return result;
        })
        .catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

        let fechamentos = await objConn.execute({
            sql: `select *
                    from (select g091.idg090,
                                (select count(*)
                                    From g104 g104
                                  where g104.idg097 = 46
                                    and g104.idg090 = g091.idg090
                                    and G104.MESANOVI = ${req.body.CDMES.id}) as qtdFecha,
                                (select count(*)
                                    From g091 g091x
                                  where g091x.idg090 = g091.idg090) as qtdidg024,
                                (select count(*)
                                    From g104 g104
                                  where g104.idg097 = 48
                                    and G104.MESANOVI = ${req.body.CDMES.id}) as idg097Multas,
                                (select count(*)
                                    From g104 g104
                                  where g104.idg097 = 47
                                    and G104.MESANOVI = ${req.body.CDMES.id}) as idg097Km
                            from g091 g091
                          group by g091.idg090) a
                  where a.qtdidg024 = a.qtdFecha
                    and a.idg097Multas >= 1
                    and a.idg097Km >= 1`,
            param: []
        }).then((res) => {
            
            return res;
            
        }).catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

        let resultFecham    = true;
        let resultFechamAux = true;
        for (let index = 0; index < fechamentos.length; index++) {
          req.body.IDG090 = fechamentos[index].IDG090;
          resultFecham    = await this.fecharLancamentos(req, res, next);
          resultFechamAux = resultFechamAux && (resultFecham == 1);
        }

       
        objConn.close();

        if(resultFechamAux){
          res.status(200);
          resposta = { response: `Aprovação realizada com sucesso.`  };
          res.json(resposta); 
        }else{

        }
        
      } catch (err) {
          await objConn.closeRollBack();
          res.status(500);
          res.json(resposta);
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      }
  
    }

    /**
     * @description Verificar qual é a transportadora, no qual o usuário pode visualizar as informações
     *
     * @async
     * @function /api/tp/segurancapremiada/fecharLancamentos
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */ 
    api.validarFilial = async function(UserId){
    
      try {

        let objConn   = await this.controller.getConnection();

        return await objConn.execute({
            sql:`
                  SELECT S001.IDG024
                    FROM S001
                  WHERE S001.IDS001 = :IDS001
                    AND S001.IDG097PR = 33

                  UNION

                  SELECT S045.IDG024
                    FROM S001
                  INNER JOIN S045 S045
                      ON S045.IDS001 = S001.IDS001
                  WHERE S001.IDS001 = :IDS001
                    AND S001.IDG097PR = 33
                    AND S045.SNDELETE = 0`,
            param: {
              IDS001: UserId
            }
        }).then((res) => {
            objConn.close();
            let element = [];
            if(res.length > 0){
              for (let index = 0; index < res.length; index++) {
                element.push(res[index].IDG024);
              }
            }else{
              element = null;
            }
            return element;
            
        }).catch((err) => {
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });
       
   
      } catch (err) {
          await objConn.closeRollBack();
          res.status(500);
          res.json(resposta);
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      }
  
    }
  
    return api;
  };
  