/**
 * @description Possui métodos utilizados na tela de suporte.
 * @author Walan Cristian Ferreira Almeida
 * @since 28/10/2019
 * 
*/

/** 
 * @module dao/Suporte
 * @description Possui métodos utilizados na tela de suporte.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dataAtual  = app.src.utils.DataAtual;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;
  var db         = app.config.database;

  const gdao  = app.src.modGlobal.dao.GenericDAO;

  /**
   * @description Listar slots, tabela H007.
   *
   * @async
   * @function api/listarSlots
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarSlots = async function (req, res, next) {

    logger.debug("Inicio listar slots");

    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      let sqlAux = '';

      if (req.body['parameter[H007_STHORARI]']) {
        if (req.body['parameter[H007_STHORARI]'] == 'L') {
          sqlAux += `And H007.IDH006 Is Null And (H007.STHORARI = 'L' Or H007.STHORARI Is Null)`;
          delete req.body['parameter[H007_STHORARI]'];
        }
        else if (req.body['parameter[H007_STHORARI]'] == 'O') {
          sqlAux += `And H007.IDH006 Is Not Null And H007.STHORARI Is Null`;
          delete req.body['parameter[H007_STHORARI]'];
        }
      }

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H007', false);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` SELECT H007.IDH007                                                         H007_IDH007
                      , H007.IDH006                                                         H007_IDH006
                      , TO_CHAR(H007.HOINICIO, 'DD/MM/YYYY HH24:MI')                        H007_HOINICIO
                      , TO_CHAR(H007.HOFINAL , 'DD/MM/YYYY HH24:MI')                        H007_HOFINAL
                      , CASE
                          WHEN H007.IDH006 IS NOT NULL AND H007.STHORARI IS NULL THEN 'O'
                          ELSE H007.STHORARI
                        END                                                                 H007_STHORARI
                      , H007.SNDELETE                                                       H007_SNDELETE
                      , LPAD(H005.NRJANELA, 3, 0) || ' - ' || H005.DSJANELA                 H005_DSJANELA
                      , G028.NMARMAZE                                                       G028_NMARMAZE
                      , COUNT(*) OVER() AS COUNT_LINHA
                   FROM H007 H007
                   JOIN H005 H005 ON H005.IDH005 = H007.IDH005
                   JOIN G028 G028 ON G028.IDG028 = H005.IDG028`+
                    sqlWhere +
                    sqlAux   +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result, req.body));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      await con.close();
      logger.debug("Fim listar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }
  }

  /**
   * @description Buscar slot, tabela H007.
   *
   * @async
   * @function api/buscarSlot
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarSlot = async function (req, res, next) {

    req.sql = `SELECT H007.IDH007                                                                          H007_IDH007
                    , H007.IDH006                                                                          H007_IDH006
                    , TO_CHAR(H007.HOINICIO, 'DD/MM/YYYY HH24:MI')                                         H007_HOINICIO
                    , TO_CHAR(H007.HOFINAL , 'DD/MM/YYYY HH24:MI')                                         H007_HOFINAL
                    , CASE
                        WHEN H007.IDH006 IS NOT NULL AND H007.STHORARI IS NULL THEN 'O'
                        ELSE H007.STHORARI
                      END                                                                                  H007_STHORARI
                    , H007.SNDELETE                                                                        H007_SNDELETE
                    , H007.SNFLAGDE                                                                        H007_SNFLAGDE
                    , G028.IDG028 || ' - ' || G028.NMARMAZE                                                H005_IDG028
                    , H005.IDH005                                                                          H005_IDH005
                    , LPAD(H005.NRJANELA, 3, 0) || ' - ' || H005.DSJANELA                                  H005_DSJANELA
                    , H005.STCADAST                                                                        H005_STCADAST
                    , H005.SNDELETE                                                                        H005_SNDELETE
                    , (
                        SELECT LISTAGG(G024.IDG024, ',') WITHIN GROUP (ORDER BY G024.IDG024) IDG024
                          FROM H020 H020
                          JOIN G024 G024 ON G024.IDG024 = H020.NRVALUE AND H020.TPPARAME = 'T'
                         WHERE H020.IDH007 = H007.IDH007
                      )                                                                                    G024_IDG024
                    , (
                        SELECT LISTAGG(G024.NMTRANSP, ',') WITHIN GROUP (ORDER BY G024.IDG024) NMTRANSP
                          FROM H020 H020
                          JOIN G024 G024 ON G024.IDG024 = H020.NRVALUE AND H020.TPPARAME = 'T'
                         WHERE H020.IDH007 = H007.IDH007
                      )                                                                                    G024_NMTRANSP
                    , (
                        SELECT LISTAGG(G005.IDG005, ',') WITHIN GROUP (ORDER BY G005.IDG005) IDG005
                          FROM H020 H020
                          JOIN G005 G005 ON G005.IDG005 = H020.NRVALUE AND H020.TPPARAME = 'C'
                         WHERE H020.IDH007 = H007.IDH007
                      )                                                                                    G005_IDG005
                    , (
                        SELECT LISTAGG(G005.NMCLIENT, ',') WITHIN GROUP (ORDER BY G005.IDG005) NMCLIENT
                          FROM H020 H020
                          JOIN G005 G005 ON G005.IDG005 = H020.NRVALUE AND H020.TPPARAME = 'C'
                         WHERE H020.IDH007 = H007.IDH007
                      )                                                                                    G005_NMCLIENT
                 FROM H007 H007
                 JOIN H005 H005 ON H005.IDH005 = H007.IDH005
                 JOIN G028 G028 ON G028.IDG028 = H005.IDG028
                WHERE H007.IDH007 = ${req.body.IDH007}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /**
   * @description Atualizar slot, tabela H007.
   *
   * @async
   * @function api/updateSlot
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.updateSlot = async function (req, res, next) {

    if (req.body['STHORARI'] == 'O' || req.body['IDH006'] != null) { req.body['STHORARI'] = '' };

    req.body.IDH006 = (req.body.IDH006) ? req.body.IDH006 : null;

    req.sql = `UPDATE H007
                  SET H007.IDH006   =  ${req.body.IDH006}
                    , H007.STHORARI = '${req.body.STHORARI}'
                    , H007.SNFLAGDE =  ${req.body.SNFLAGDE}
                    , H007.SNDELETE =  ${req.body.SNDELETE}
                WHERE H007.IDH007   =  ${req.body.IDH007}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /**
   * @description Atualizar slots, tabela H007.
   *
   * @async
   * @function api/setAcaoSlots
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.setAcaoSlots = async function (req, res, next) {

    let IDH007 = (req.body.IDH007.in) ? req.body.IDH007.in : req.body.IDH007;

    let camposUpdate = '';

    switch (req.body.TIPACAO) {
      case 1: // Remover agendamento
        camposUpdate += `H007.IDH006 = null`;
        break;
      case 2: // Atribuir agendamento
        camposUpdate += `H007.IDH006   = ${req.body.VALACAO}
                       , H007.STHORARI = null`;
        break;
      case 3: // Atribuir status ocupação
        if (req.body.VALACAO == 'L')  { req.body.VALACAO = '' };
        camposUpdate += `H007.STHORARI = '${req.body.VALACAO}'`;
        break;
      case 4: // Atribuir status exclusão
        camposUpdate += `H007.SNDELETE = ${req.body.VALACAO}
                       , H007.SNFLAGDE = null`;
        break;
    }

    if (camposUpdate != '') {
      req.sql = `UPDATE H007 SET ${camposUpdate}
                  WHERE H007.IDH007 IN (${IDH007.join()})`;

      return await gdao.executar(req, res, next).catch((err) => { throw (err) });
    } else {
      res.status(500).send({ error: 'Falha ao atualizar dados do slot por falta de informações!' });
    }

  }

  /**
   * @description Listar agendamentos, tabela H006.
   *
   * @async
   * @function api/listarAgendamentos
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarAgendamentos = async function (req, res, next) {

    logger.debug("Inicio listar agendamentos");

    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H006', true);

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let result = await con.execute(
        {
          sql: ` SELECT H006.IDH006                                           H006_IDH006
                      , H006.TPMOVTO                                          H006_TPMOVTO
                      , H006.STAGENDA                                         H006_STAGENDA
                      , UPPER(G097.DSVALUE)                                   H006_TPOPERAC
                      , H006.TPPESAGE                                         H006_TPPESAGE
                      , ROUND(H006.QTPESO, 2)                                 H006_QTPESO
                      , G028.NMARMAZE                                         G028_NMARMAZE
                      , MIN(TO_CHAR(H007.HOINICIO,'DD/MM/YYYY HH24:MI'))      H007_HOINICIO
                      , LPAD(H005.NRJANELA, 3, 0) || ' - ' || H005.DSJANELA   H005_DSJANELA
                      , COUNT(*) OVER() AS COUNT_LINHA

                   FROM H006 H006                                   --AGENDAMENTO
                   JOIN G028 G028 ON G028.IDG028 = H006.IDG028      --ARMAZÉM
              LEFT JOIN H007 H007 ON H007.IDH006 = H006.IDH006      --SLOTS
              LEFT JOIN H005 H005 ON H005.IDH005 = H007.IDH005      --JANELA
                   JOIN G097 G097 ON G097.IDGRUPO = 1
                                 AND G097.IDKEY   = H006.TPOPERAC   --TIPO OPERAÇÃO

                   ${sqlWhere}

               GROUP BY H006.IDH006
                      , H006.TPMOVTO
                      , H006.STAGENDA
                      , H006.TPPESAGE
                      , H006.QTPESO
                      , G028.NMARMAZE
                      , H005.NRJANELA
                      , H005.DSJANELA
                      , G097.DSVALUE

                    ${sqlOrder}${sqlPaginate}`,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result, req.body));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      await con.close();
      logger.debug("Fim listar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }
  }

  /**
   * @description Buscar agendamento, tabela H006.
   *
   * @async
   * @function api/buscarAgendamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarAgendamento = async function (req, res, next) {

    req.sql = `SELECT H006.IDH006                                           H006_IDH006
                    , H006.TPMOVTO                                          H006_TPMOVTO
                    , H006.STAGENDA                                         H006_STAGENDA
                    , H006.TPOPERAC                                         H006_TPOPERAC
                    , G097.DSVALUE                                          H006_DSOPERAC
                    , H006.TPPESAGE                                         H006_TPPESAGE
                    , ROUND(H006.QTPESO, 2)                                 H006_QTPESO
                    , G028.IDG028                                           H006_IDG028
                    , G028.IDG028 || ' - ' || G028.NMARMAZE                 H006_NMARMAZE
                    , MIN(TO_CHAR(H007.HOINICIO,'DD/MM/YYYY HH24:MI'))      H007_HOINICIO
                    , MAX(TO_CHAR(H007.HOFINAL ,'DD/MM/YYYY HH24:MI'))      H007_HOFINAL
                    , LPAD(H005.NRJANELA, 3, 0) || ' - ' || H005.DSJANELA   H005_DSJANELA

                 FROM H006 H006                                    --AGENDAMENTO
                 JOIN G028 G028 ON G028.IDG028  = H006.IDG028      --ARMAZÉM
            LEFT JOIN H007 H007 ON H007.IDH006  = H006.IDH006      --SLOTS
            LEFT JOIN H005 H005 ON H005.IDH005  = H007.IDH005      --JANELA
                 JOIN G097 G097 ON G097.IDGRUPO = 1
                               AND G097.IDKEY   = H006.TPOPERAC   --TIPO OPERAÇÃO

                WHERE H006.IDH006 = ${req.body.IDH006}

             GROUP BY H006.IDH006
                    , H006.TPMOVTO
                    , H006.STAGENDA
                    , H006.TPOPERAC
                    , G097.DSVALUE
                    , H006.TPPESAGE
                    , H006.QTPESO
                    , G028.IDG028
                    , G028.NMARMAZE
                    , H005.NRJANELA
                    , H005.DSJANELA`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /**
   * @description Atualizar agendamento, tabela H006.
   *
   * @async
   * @function api/updateSlot
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.updateAgendamento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let camposUpdate = [];

    if (req.body.QTPESO  ) { // Peso Agendamento
      camposUpdate.push(`H006.QTPESO   = ${req.body.QTPESO}`  );
    }

    if (req.body.TPOPERAC) { // Tipo de Operação
      camposUpdate.push(`H006.TPOPERAC = ${req.body.TPOPERAC}`);
    }

    if (req.body.TPPESAGE) { // Tipo Pesagem
      camposUpdate.push(`H006.TPPESAGE = ${req.body.TPPESAGE}`);
    }

    if (req.body.STAGENDA) { // Status Agendamento
      camposUpdate.push(`H006.STAGENDA = ${req.body.STAGENDA}`);
    }

    if (camposUpdate.length > 0) {
      req.sql = `UPDATE H006
                    SET ${camposUpdate.join()}
                  WHERE H006.IDH006 =  ${req.body.IDH006}`;

      return await gdao.executar(req, res, next).catch((err) => { throw (err) });
    } else {
      res.status(500).send({ error: 'Falha ao atualizar dados do agendamento por falta de informações!' });
    }
  }

  /**
   * @description Atualizar pesagem, tabela H021.
   *
   * @async
   * @function api/updatePesagem
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.updatePesagem = async function (req, res, next) {

    req.sql = `UPDATE H021
                  SET H021.SNDELETE = ${req.body.SNDELETE}
                WHERE H021.IDH021   = ${req.body.IDH021}`;

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /**
   * @description Listar agendamentos e seus status, tabelas H006 e H008.
   *
   * @async
   * @function api/listarAgendamentosStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarAgendamentosStatus = async function (req, res, next) {

    logger.debug("Inicio listar Agendamentos Status");

    let con = await this.controller.getConnection();

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H006', true);

      sqlWhere = sqlWhere.replace(
        "And H007.HOINICIO Between :H007_HOINICIO0 AND :H007_HOINICIO1",
        "And (H007.HOINICIO Between :H007_HOINICIO0 AND :H007_HOINICIO1 Or CAN.HOINICIO Between :H007_HOINICIO0 AND :H007_HOINICIO1)"
      );

      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      let sqlListar = `
         SELECT a.*
              , O03.AGE_IDH008            --ID AGENDADO
              , O03.AGE_DTCHECKIN         --DATA AGENDADO
              , O03.AGE_OBCHECKIN         --OBSERVACAO DO AGENDADO
              , O03.UAO_NMUSUARI          --NOME DO USUARIO AGENDADO

              , O04.CHE_IDH008            --ID CHECKIN
              , O04.CHE_DTCHECKIN         --DATA CHECKIN
              , O04.CHE_OBCHECKIN         --OBSERVACAO DO CHECKIN
              , O04.UCH_NMUSUARI          --NOME DO USUARIO CHECKIN

              , O05.ENT_IDH008            --ID ENTROU
              , O05.ENT_DTENTROU          --DATA ENTROU
              , O05.ENT_OBENTROU          --OBSERVACAO DO ENTROU
              , O05.UEN_NMUSUARI          --USUARIO DO ENTROU

              , O06.INI_IDH008            --ID INICIOU OPERACAO
              , O06.INI_DTINICIOP         --DATA INICIOU OPERACAO
              , O06.INI_OBINICIOP         --OBSERVACAO INICIOU OPERACAO
              , O06.UIN_NMUSUARI          --USUARIO INICIOU OPERACAO

              , O07.FIN_IDH008            --ID FINALIZOU OPERACAO
              , O07.FIN_DTFINAOP          --DATA FINALIZOU OPERACAO
              , O07.FIN_OBFINAOP          --OBSERVACAO FINALIZOU OPERACAO
              , O07.UFI_NMUSUARI          --USUARIO FINALIZOU OPERACAO

              , O08.SAI_IDH008            --ID SAIU
              , O08.SAI_DTSAIU            --DATA SAIU
              , O08.SAI_OBSAIU            --OBSERVACAO SAIU
              , O08.USA_NMUSUARI          --USUARIO  SAIU

              , O09.FAL_DTFALTOU          --DATA FALTOU
              , O09.UFA_NMUSUARI          --USUARIO FALTOU
              , O10.UCA_NMUSUARI          --USUARIO CANCELOU
           FROM (
                    SELECT  H006.IDH006                                       H006_IDH006     --ID DO AGENDAMENTO
                          , H006.TPMOVTO                                      H006_TPMOVTO    --TIPO DE MOVIMENTAÇÃO
                          , H006.DTCADAST                                     H006_DTCADAST   --DATA DE CADASTRO
                          , H006.STAGENDA                                     H006_STAGENDA   --STATUS AGENDAMENTO
                          , TO_CHAR(MIN(H007.HOINICIO), 'DD/MM/YYYY HH24:mi') H007_HOINICIO   --DATA E HORA INICIAL
                          , COUNT(*) OVER() AS COUNT_LINHA

                        FROM H006 H006
                  LEFT JOIN H007 H007 ON H006.IDH006 = H007.IDH006
                  LEFT JOIN H008 CAN  ON H006.IDH006 = CAN.IDH006 AND CAN.STAGENDA = 10

                            ${sqlWhere}

                      GROUP BY
                            H006.IDH006                 --ID DO AGENDAMENTO
                          , H006.TPMOVTO                --TIPO DE MOVIMENTAÇÃO
                          , H006.DTCADAST               --DATA DE CADASTRO
                          , H006.STAGENDA               --STATUS AGENDAMENTO

                            ${sqlOrder} ${sqlPaginate}
                )a

        CROSS APPLY
        (
          SELECT MAX(AGE.IDH008)   as AGE_IDH008,
                 MAX(AGE.HOOPERAC) as AGE_DTCHECKIN,
                 MAX(AGE.TXOBSERV) as AGE_OBCHECKIN,
                 MAX(UAO.NMUSUARI) as UAO_NMUSUARI,
                 '1' as O03AUX
            FROM H008 AGE
            JOIN S001 UAO ON AGE.IDS001 = UAO.IDS001
           WHERE AGE.IDH006   = a.H006_IDH006
             AND AGE.STAGENDA = 3
        )O03 --AGENDADO

        CROSS APPLY
        (
          SELECT MAX(CHE.IDH008)   as CHE_IDH008,
                 MAX(CHE.HOOPERAC) as CHE_DTCHECKIN,
                 MAX(CHE.TXOBSERV) as CHE_OBCHECKIN,
                 MAX(UCH.NMUSUARI) as UCH_NMUSUARI,
                 '1' as O04AUX
            FROM H008 CHE 
            JOIN S001 UCH ON CHE.IDS001 = UCH.IDS001
           WHERE CHE.IDH006   = a.H006_IDH006
             AND CHE.STAGENDA = 4
             AND CHE.NRSEQMOV > (SELECT MAX(ACH.NRSEQMOV)
                                   FROM H008 ACH
                                  WHERE ACH.IDH006 = a.H006_IDH006
                                    AND ACH.STAGENDA IN (3))
        ) O04 --CHECKIN

        CROSS APPLY
        (
          SELECT MAX(ENT.IDH008)   as ENT_IDH008,
                 MAX(ENT.HOOPERAC) as ENT_DTENTROU,
                 MAX(ENT.TXOBSERV) as ENT_OBENTROU,
                 MAX(UEN.NMUSUARI) as UEN_NMUSUARI,
                 '1' as O05AUX
            FROM H008 ENT  
            JOIN S001 UEN ON ENT.IDS001 = UEN.IDS001
           WHERE ENT.IDH006   = a.H006_IDH006
             AND ENT.STAGENDA = 5
             AND ENT.NRSEQMOV > (SELECT MAX(AEN.NRSEQMOV)
                                   FROM H008 AEN
                                  WHERE AEN.IDH006 = a.H006_IDH006
                                    AND AEN.STAGENDA IN (3,4,12))
        )O05 --ENTROU

        CROSS APPLY
        (
          SELECT MAX(INI.IDH008)   as INI_IDH008,
                 MAX(INI.HOOPERAC) as INI_DTINICIOP,
                 MAX(INI.TXOBSERV) as INI_OBINICIOP,
                 MAX(UIN.NMUSUARI) as UIN_NMUSUARI,
                 '1' as O06AUX
            FROM H008 INI
            JOIN S001 UIN ON INI.IDS001 = UIN.IDS001
           WHERE INI.IDH006   = a.H006_IDH006
             AND INI.STAGENDA = 6
             AND INI.NRSEQMOV > (SELECT MAX(AIN.NRSEQMOV)
                                   FROM H008 AIN
                                  WHERE AIN.IDH006 = a.H006_IDH006
                                    AND AIN.STAGENDA IN (3,4,12,5))
        )O06 --INICIOU OPERAÇÃO

        CROSS APPLY
        (
          SELECT MAX(FIN.IDH008)   as FIN_IDH008,
                 MAX(FIN.HOOPERAC) as FIN_DTFINAOP,
                 MAX(FIN.TXOBSERV) as FIN_OBFINAOP,
                 MAX(UFI.NMUSUARI) as UFI_NMUSUARI,
                 '1' as O07AUX
            FROM H008 FIN
            JOIN S001 UFI ON FIN.IDS001 = UFI.IDS001
           WHERE FIN.IDH006   = a.H006_IDH006
             AND FIN.STAGENDA = 7
             AND FIN.NRSEQMOV > (SELECT MAX(AFI.NRSEQMOV)
                                   FROM H008 AFI
                                  WHERE AFI.IDH006 = a.H006_IDH006
                                    AND AFI.STAGENDA IN (3,4,12,5,6))
        )O07 --FINALIZOU OPERAÇÃO

        CROSS APPLY
        (
          SELECT MAX(SAI.IDH008)   as SAI_IDH008,
                 MAX(SAI.HOOPERAC) as SAI_DTSAIU,
                 MAX(SAI.TXOBSERV) as SAI_OBSAIU,
                 MAX(USA.NMUSUARI) as USA_NMUSUARI,
                 '1' as O08AUX
            FROM H008 SAI
            JOIN S001 USA ON SAI.IDS001 = USA.IDS001
           WHERE SAI.IDH006   = a.H006_IDH006
             AND SAI.STAGENDA = 8
             AND SAI.NRSEQMOV > (SELECT MAX(ACH.NRSEQMOV)
                                   FROM H008 ACH
                                  WHERE ACH.IDH006 = a.H006_IDH006
                                    AND ACH.STAGENDA IN (3,4,12,5,6,7))
        )O08 --SAIU

        CROSS APPLY
        (
          SELECT MAX(FAL.HOOPERAC) as FAL_DTFALTOU,
                 MAX(UFA.NMUSUARI) as UFA_NMUSUARI,
                 '1' as O09AUX
            FROM H008 FAL
            JOIN S001 UFA ON FAL.IDS001 = UFA.IDS001
           WHERE FAL.IDH006   = a.H006_IDH006
             AND FAL.STAGENDA = 9
        )O09 --FALTOU

        CROSS APPLY
        (
          SELECT MAX(UCA.NMUSUARI) as UCA_NMUSUARI,
                 '1' as O10AUX
            FROM H008 CAN
            JOIN S001 UCA ON CAN.IDS001 = UCA.IDS001
           WHERE CAN.IDH006   = a.H006_IDH006
             AND CAN.STAGENDA = 10
        )O10 --CANCELADO`;

      let result = await con.execute(
        {
          sql: sqlListar,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result, req.body));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      await con.close();
      logger.debug("Fim listar");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }
  }

  /**
   * @description Edita datas dos status de um agendamento, tabela H008.
   *
   * @async
   * @function api/updateDatasStatus
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.updateDatasStatus = async function (req, res, next) {

    req.sql = `UPDATE H008
                  SET HOOPERAC = TO_DATE('${req.DATAHORA}', 'YYYY-MM-DD HH24:MI:SS')
                    , HOINICIO = TO_DATE('${req.DATAHORA}', 'YYYY-MM-DD HH24:MI:SS')
                    , TXOBSERV = '${req.OBSERVACAO}'
                WHERE IDH006 = ${req.IDH006} AND IDH008 = ${req.IDH008}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  return api;
};
