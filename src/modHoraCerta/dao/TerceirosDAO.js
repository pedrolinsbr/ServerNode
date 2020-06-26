/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de agendamento
 * @author Desconhecido
 * @since 20/02/2018
 * 
*/

/** 
 * @module dao/Agendamento
 * @description H006/H007/H008.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {
  var api         = {};
  var utils       = app.src.utils.FuncoesObjDB;
  var asnDAO      = app.src.modIntegrador.dao.ASNDAO;
  var cargasDAO   = app.src.modIntegrador.dao.CargasDAO;
  var dtatu       = app.src.utils.DataAtual;
  var acl         = app.src.modIntegrador.controllers.FiltrosController;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  const tmz 		= app.src.utils.DataAtual;


  const gdao = app.src.modGlobal.dao.GenericDAO;

  var moment = require('moment');
  moment.locale('pt-BR');
  
  var db = require(process.cwd() + '/config/database');

  
  api.salvarPeso = async function (req, res, next){

    var objBanco = {
        table:    'H021'
      , key:      ['IDH021']
      , vlFields:  {}
    }

    objBanco.vlFields.IDH006      =     req.body.IDH006;
    objBanco.vlFields.NRETAPA     =     req.body.NRETAPA;
    objBanco.vlFields.NRSEQUE     =     req.body.NRSEQUE;
    objBanco.vlFields.QTPESO      =     req.body.QTPESO;
    objBanco.vlFields.TPMOVTO     =     req.body.TPMOVTO;
    objBanco.vlFields.AREASERV    =     req.body.AREASERV ;
    objBanco.vlFields.NUMAUTO     =     req.body.NUMAUTO;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS() //tmz.tempoAtual('DD/MM/YYYY HH:mm:ss')

    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  api.buscarMovimentacao = async function (req, res, next) {

    req.sql = `SELECT 
                  CASE 
                    WHEN H021.NRETAPA = 1 THEN 'Composição + Cavalo'
                    WHEN H021.NRETAPA = 2 THEN 'Cavalo'
                    WHEN H021.NRETAPA = 3 THEN 'Composições Vazias + Cavalo'
                  END	AS NRETAPA,		
                    H021.NRSEQUE,
                    H021.QTPESO, 
                  CASE
                    WHEN H021.TPMOVTO = 'E' THEN 'Entrada'
                    WHEN H021.TPMOVTO = 'S' THEN 'Saída'
                  END AS TPMOVTO,
                  TO_CHAR(H021.DTCADAST, 'DD/MM/YYYY HH24:mi:ss') AS DTCADAST,
                  H006.TPOPERAC, 
                  H006.TPMOVTO AS TIPO, 
                  H006.QTPESO AS PA,
                  H006.PESCOMP1,
                  H006.PESCOMP2,
                  H006.TPPESAGE,
                  H021.NRETAPA
              FROM H021 
              INNER JOIN H006 
                  ON H006.IDH006 = H021.IDH006
              WHERE H006.IDH006 = ${req.body.IDH006} ORDER BY H021.DTCADAST ASC
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  return api;

};