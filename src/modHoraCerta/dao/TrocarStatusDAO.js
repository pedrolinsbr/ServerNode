/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de cargas aceitas  e selecionadas para agendamento
 * @author Everton Pessoa
 * @since 10/04/2019
 * 
*/

/** 
 * @module dao/AAceite
 * @description G046/G028/G024.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {
  var api    = {};
  var utils  = app.src.utils.FuncoesObjDB;
  const gdao = app.src.modGlobal.dao.GenericDAO;

  api.controller = app.config.ControllerBD;

  var moment = require('moment');
  moment.locale('pt-BR');

  api.salvarStatusH008 = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = ` Insert Into H008 (NrSeqMov, IdH006, StAgenda, Idi015, HoOperac, HoInicio, IdS001, TxObserv, IdH005, HoPreIni)
                    Values
                ((Select Count(IdH006)+1 From H008 Where IdH006 = ${req.IDH006}), ${req.IDH006}, ${req.STAGENDA}, ${req.IDI015},
                to_date('${moment().format("DD/MM/YYYY HH:mm:ss")}', 'dd-mm-yyyy hh24:mi:ss'),
                to_date('${moment().format("DD/MM/YYYY HH:mm:ss")}', 'dd-mm-yyyy hh24:mi:ss'), ${req.IDS001}, '${req.TXOBSERV}', null, null)`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.deleteStatusH008 = async function (req, res, next){

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                Update H008
                Set SnDelete = 1
                Where IDH006 = ${req.IDH006}
                And StAgenda In (${req.OLD_STAGENDA})
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.updateStatusH006 = async function (req, res, next){

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                Update H006 
                Set StAgenda = ${req.STAGENDA}
                Where IDH006 = ${req.IDH006}
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.updateCarga = async function (req, res, next){

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                Update G046
                Set Dtsaicar = to_date('${moment().format("DD/MM/YYYY HH:mm:ss")}', 'dd-mm-yyyy hh24:mi:ss'),
                    stCarga = 'T'
              Where Idg046 In (${req.IDG046})
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.buscarDadosAgendamento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                Select H006.IDH006,
                       (SELECT LISTAGG(H024.IDG046, ',') WITHIN GROUP(ORDER BY H024.IDG046) IDG046 
                          FROM H024
                         WHERE H024.IDH006 = H006.IDH006 
                           AND H024.SNDELETE = 0
                       ) AS IDG046,
                       H006.TPMOVTO
                  From H006
                 Where H006.IDH006 = ${req.IDH006}
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarCargas4PL = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    let exp = "'([^,]+)(,\1)+', '\1'";

    req.sql = ` SELECT regexp_replace(LISTAGG(G046.IDG046, ',') WITHIN GROUP(ORDER BY G046.IDG046), ${exp}) IDG046
                  FROM G046 G046
                  JOIN G048 G048 ON G048.IDG046 = G046.IDG046
                  JOIN G049 G049 ON G049.IDG048 = G048.IDG048
                  JOIN G043 G043 ON G043.IDG043 = G049.IDG043
                  JOIN G014 G014 ON G014.IDG014 = G043.IDG014
                 WHERE G046.TPMODCAR = 2
                   AND G046.SNDELETE = 0
                   AND G014.SN4PL    = 1
                   AND G014.IDG097DO = ${req.IDG097DO}
                   AND G046.IDG046 IN (${req.IDG046})`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.verificaStAgendamento = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                SELECT count(*) AS COUNT_H008
                  FROM H008
                 WHERE IDH006   = ${req.IDH006}
                   AND STAGENDA = 7

                UNION ALL

                SELECT count(*) AS COUNT_H008
                  FROM H008
                 WHERE IDH006   = ${req.IDH006}
                   AND STAGENDA = 6
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.cancelarUltimaPesagem = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                UPDATE H021 SET SNDELETE = 1
                WHERE IDH021 IN ( SELECT MAX(IDH021)
                                    FROM H021
                                   WHERE IDH006   = ${req.IDH006}
                                     AND TPMOVTO  = 'S'
                                     AND SNDELETE = 0
                                )
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.buscarStatusAtual = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = `SELECT STAGENDA FROM H006 WHERE IDH006 = ${req.IDH006}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.cancelarPesagens = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = `Update H021
                  Set SNDELETE = 1,
                      USERCANC = ${req.IDS001}
                Where IDH006   = ${req.IDH006}`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.buscarComentario = async function (req, res, next) {

    await gdao.controller.setConnection(req.objConn);

    req.sql = ` SELECT MAX(TXOBSERV) AS TXOBSERV FROM (
                 SELECT LAST_VALUE(H008.TXOBSERV)
                        OVER (ORDER BY H008.NRSEQMOV ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
                        AS TXOBSERV
                   FROM H008 H008
                  WHERE H008.IDH006   = ${req.IDH006}
                    AND H008.STAGENDA = ${req.STAGENDA}
                )`;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).then((result) => result[0].TXOBSERV ).catch((err) => { throw err });
  };

  return api;

};
