/**
 * @description Possui os métodos responsaveis por cancelar agendamento e respectivas cargas
 * @author Walan Cristian Ferreira Almeida
 * @since 09/07/2019
 * 
 */

/** 
 * @module dao/CancelarAgendamento
 * @description H006/H007/H008/G046/G048/G043.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
 */
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var db         = require(process.cwd() + '/config/database');
  const gdao     = app.src.modGlobal.dao.GenericDAO;
  const tmz      = app.src.utils.DataAtual; 
  api.controller = app.config.ControllerBD;


  /*******************************************************************************************
   * @description Busca dados agendamento para cancelamento (H006).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/buscarAgendamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.buscarAgendamento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDH006 = req.body.IDH006;

    req.sql = `Select H006.Idh006,
                      H006.Idg024,
                      H006.TpMovTo
                 From H006 H006
                Where H006.Idh006 In (${IDH006})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Busca dados das cargas para cancelamento (G046).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/buscarCargas
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.buscarCargas = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDH006 = req.body.IDH006;

    req.sql = `Select G046.Idg046,
                      G046.StCarga,
                      G046.TpModCar
                 From G046 G046
                 Join H024 H024
                   On H024.Idg046 = G046.Idg046
                Where H024.Idh006 In (${IDH006})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Busca etapa delivery por carga (G043).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/buscarEtapaDelivery
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.buscarEtapaDelivery = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDG046 = req.body.IDG046;

    req.sql = ` Select StEtapa
                  From G043 G043
                 Where Idg043 In (Select G049.Idg043
                                    From G046 G046
                                    Join G048 G048
                                      On G048.Idg046 = G046.Idg046
                                    Join G049 G049
                                      On G049.Idg048 = G048.Idg048
                                  Where G046.IDG046 in (${IDG046}))`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Atualiza etapa delivery por carga (G043).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/atualizaEtapaDelivery
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.atualizaEtapaDelivery = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDG046 = req.body.IDG046;

    req.sql = ` Update G043
                   Set StEtapa = 2
                 Where Idg043 In (Select G049.Idg043
                                    From G046 G046
                                    Join G048 G048
                                      On G048.Idg046 = G046.Idg046
                                    Join G049 G049
                                      On G049.Idg048 = G048.Idg048
                                  Where G046.IDG046 in (${IDG046}))`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Atualiza STCLI por carga (G048).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/atualizaSTCLI
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.atualizaSTCLI = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDG046 = req.body.IDG046;

    req.sql = `Update G048
                  Set Stintcli = 0
                Where Idg046 in (${IDG046})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Atualiza status da carga (G046).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/atualizaStatusCarga
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.atualizaStatusCarga = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let obj = {};
    obj.IDG046  = req.body.IDG046;
    obj.STCARGA = req.body.STCARGA;

    let camposUpdate = ``;

    if (obj.STCARGA == 'X') {
      camposUpdate += `Dtsaicar = Null,`;
    }

    camposUpdate += `StCarga = '${obj.STCARGA}'`;

    req.sql = `Update G046
                  Set ${camposUpdate}
                Where Idg046 in (${obj.IDG046})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Atualiza status agendamento (H006).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/atualizaStatusAgendamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.atualizaStatusAgendamento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let obj = {};
    obj.IDH006   = req.body.IDH006;
    obj.STAGENDA = 10;

    req.sql = `Update H006
                  Set StAgenda = ${obj.STAGENDA}
                Where Idh006 in (${obj.IDH006})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Altera etapa agendamento (H008).
   * @author Walan Cristian Ferreira Almeida
   * @since 10/07/2019
   * @async
   * @function api/alterarEtapaAgendamento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.alterarEtapaAgendamento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let obj      = {};
    obj.IDH006   = req.IDH006;
    obj.STAGENDA = req.STAGENDA;
    obj.IDI015   = req.IDI015;
    obj.HOOPERAC = tmz.formataData(tmz.dataAtualJS(), 'DD-MM-YYYY HH:mm:ss');
    obj.HOINICIO = req.HOINICIO;
    obj.IDS001   = req.IDS001;

    if (!obj.IDI015){
      obj.IDI015 = null;
    }

    req.sql = ` Insert Into H008 (NrSeqMov, IdH006, StAgenda, Idi015, HoOperac, HoInicio, IdS001, IdH005, HoPreIni)
                Values (
                  (Select Count(IdH006)+1 From H008 Where IdH006 = ${obj.IDH006}), 
                  ${obj.IDH006}, ${obj.STAGENDA}, ${obj.IDI015}, 
                  to_date('${obj.HOOPERAC}', 'dd-mm-yyyy hh24:mi:ss'), 
                  to_date('${obj.HOINICIO}', 'dd-mm-yyyy hh24:mi:ss'),
                  ${obj.IDS001}, null, null
                )`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Busca horário do agendamento (H007).
   * @author Walan Cristian Ferreira Almeida
   * @since 10/07/2019
   * @async
   * @function api/buscarHoInicio
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.buscarHoInicio = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDH006 = req.body.IDH006;

    req.sql = ` Select Min(Idh007) AS Idh007,
                       To_Char(Min(HoInicio), 'dd/mm/yyyy hh24:mi:ss') AS HoInicio
                  From H007 H007
                 Where Idh006 In (${IDH006})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Limpa slots por agendamento (H007).
   * @author Walan Cristian Ferreira Almeida
   * @since 09/07/2019
   * @async
   * @function api/limparSlots
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.limparSlots = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDH006 = req.body.IDH006;

    req.sql = `Update H007
                  Set Idh006 = null
                    , StHorari = StHorAnt
                Where Idh006 In (${IDH006})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw (err) });
  }

  /*******************************************************************************************
   * @description Busca id do oferecimento (IDO005).
   * @author Walan Cristian Ferreira Almeida
   * @since 10/07/2019
   * @async
   * @function api/buscarIDO005
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.buscarIDO005 = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let IDG046 = req.body.IDG046;

    req.sql = ` Select O005.Ido005
                  From G046 G046
                  Join O005 O005
                    On O005.Idg046 = G046.Idg046
                   And O005.Idg024 = G046.Idg024
                 Where G046.Idg046 = ${IDG046}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  /*******************************************************************************************
   * @description Atualiza dados oferecimento (O005).
   * @author Walan Cristian Ferreira Almeida
   * @since 10/07/2019
   * @async
   * @function api/atualizaOferecimento
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   ******************************************************************************************/
  api.atualizaOferecimento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let obj = {};
    obj.IDO005   = req.IDO005;
    obj.IDG024   = req.IDG024;
    obj.DTRESOFE = tmz.formataData(tmz.dataAtualJS(), 'YYYY-MM-DD hh:mm:ss');
    obj.STOFEREC = 'X';

    let camposUpdate = ``;

    if (req.IDS001RE) {
      camposUpdate += `Ids001Re = ${req.IDS001RE},`;
    }

    camposUpdate += `StOferec = '${obj.STOFEREC}',`;
    camposUpdate += `DtResOfe = TO_DATE('${obj.DTRESOFE}', 'YYYY-MM-DD HH24:MI:SS')`;

    req.sql = `Update O005
                  Set ${camposUpdate}
                Where Ido005 = ${obj.IDO005}
                  And Idg024 = ${obj.IDG024}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });

  }

  return api;

};