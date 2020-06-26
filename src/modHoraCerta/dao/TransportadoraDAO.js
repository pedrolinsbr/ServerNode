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
  var dtatu       = app.src.utils.DataAtual;
  var acl         = app.src.modIntegrador.controllers.FiltrosController;
  var logger      = app.config.logger;
  api.controller = app.config.ControllerBD;
  const tmz 		= app.src.utils.DataAtual;


  const gdao = app.src.modGlobal.dao.GenericDAO;

  var moment = require('moment');
  moment.locale('pt-BR');
  
  var db = require(process.cwd() + '/config/database');


  api.inserir = async function (req, res, next){

    var objBanco = {
        table:    'G024'
      , key:      ['IDG024']
      , vlFields:  {}
    }

    objBanco.vlFields.TPPESSOA      =     req.body.TPPESSOA;
    objBanco.vlFields.DSENDERE      =     req.body.DSENDERE;
    objBanco.vlFields.NRENDERE      =     req.body.NRENDERE;
    objBanco.vlFields.DSCOMEND      =     req.body.DSCOMEND
    objBanco.vlFields.BIENDERE      =     req.body.BIENDERE;
    objBanco.vlFields.CPENDERE      =     req.body.CPENDERE;
    objBanco.vlFields.IDG003        =     req.body.IDG003;
    objBanco.vlFields.NRLATITU      =     0;
    objBanco.vlFields.NRLONGIT      =     0;
    objBanco.vlFields.STCADAST      =     "A";
    objBanco.vlFields.DTCADAST      =     tmz.dataAtualJS();
    objBanco.vlFields.IDS001        =     req.body.IDS001;
    objBanco.vlFields.SNDELETE      =     0;
    objBanco.vlFields.IDG023        =     2;
    objBanco.vlFields.IETRANSP      =     req.body.IETRANSP;
    objBanco.vlFields.IMTRANSP      =     req.body.IMTRANSP;
    objBanco.vlFields.CJTRANSP      =     req.body.CJTRANSP;
    objBanco.vlFields.NMTRANSP      =     req.body.NMTRANSP;
    objBanco.vlFields.RSTRANSP      =     req.body.RSTRANSP;
    
    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  api.buscarTransp = async function (req, res, next) {

    req.sql = `
                SELECT IDG024 
                  FROM G024
                WHERE CJTRANSP = ${req.body.CJTRANSP}
                AND SNDELETE = 0
              `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.addPerfil = async function (req, res, next) {


  };
    
  return api;

};
