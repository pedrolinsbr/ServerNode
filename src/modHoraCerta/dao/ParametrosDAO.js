/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 20/02/2018
 * 
*/

/** 
 * @module dao/Parametros
 * @description H009.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var util       = app.src.utils.Utils;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela H009.
   *
   * @async
   * @function api/buscarHorarioReagendar
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

      let sqlDate = '';

      if (req.body['parameter[DTINICIO]'] || req.body['parameter[DTINICIO][]']) {
        let date = (req.body['parameter[DTINICIO]']) ? req.body['parameter[DTINICIO]'] : req.body['parameter[DTINICIO][]'];
        sqlDate += `AND TO_CHAR(H009.DTINICIO, 'DD/MM/YYYY') = '${date}'`;
        delete req.body['parameter[DTINICIO]'];
        delete req.body['parameter[DTINICIO][]'];
      }

      if (req.body['parameter[DTFINAL]'] || req.body['parameter[DTFINAL][]']) {
        let date = (req.body['parameter[DTFINAL]']) ? req.body['parameter[DTFINAL]'] : req.body['parameter[DTFINAL][]'];
        sqlDate += `AND TO_CHAR(H009.DTFINAL, 'DD/MM/YYYY') = '${date}'`;
        delete req.body['parameter[DTFINAL]'];
        delete req.body['parameter[DTFINAL][]'];
      }

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,"H009",true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);
      
      let result = await con.execute(
        {
          sql: ` Select H009.IDH009,
                        H009.IDG028,
                        TO_CHAR(H009.DTINICIO, 'DD/MM/YYYY') DTINICIO,
                        TO_CHAR(H009.DTFINAL, 'DD/MM/YYYY') DTFINAL,
                        H009.STCADAST,
                        H009.DTCADAST,
                        H009.IDS001,
                        H009.SNDELETE, 
                        H009.STPARAME,
                        H009.QTMINJAN,
                        G028.NMARMAZE,
                        COUNT(H009.IdH009) OVER () as COUNT_LINHA
                    From H009 H009
                    Join G028 G028 on (H009.IdG028 = G028.IdG028)`+
                    sqlWhere +
                    sqlDate  +
                    sqlOrder +
                    sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result));
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
    
  };

  /**
   * @description Listar um dados da tabela H009.
   *
   * @async
   * @function api/buscarHorarioReagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.listarIntervalo = async function (req, res, next) {

    logger.debug("Inicio listarIntervalo");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,"H011",true);
      
      logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

      
      let result = await con.execute(
        {
          sql: ` Select H011.Idh011,
                        H011.Idh009,
                        H011.Nrdia,
                        H011.Hoiniint,
                        H011.Hofinint,
                        H011.Stcadast
                   From H011 H011`+
                sqlWhere + 
                sqlOrder +
                sqlPaginate,
          param: bindValues
        })
        .then((result) => {
          logger.debug("Retorno:", result);
          return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
    
      await con.close();
      logger.debug("Fim listarIntervalo");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

    /**
   * @description Listar um dado na tabela H009.
   *
   * @async
   * @function api/horarios
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.horarios = async function (req, res, next) {
    
    logger.debug("Inicio horarios");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDH009;
      logger.debug("Parametros recebidos:", req.body);

      let result1 = await con.execute(
      {
        sql: ` Select H010.NRDIA As NRDIA1,
                      H010.HOINICIO As INTDIA1I,
                      H010.HOFINAL As INTDIA1F,
                      H010.IDH010 As IDH0101,
                      H010.IdH009
                 From H010 H010
                Where H010.IdH009   = :id
                  And H010.SnDelete = 0
                  And H010.NrDia    = 1 
                  And H010.StCadast = 'A'`,
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
      
      let result2 = await con.execute(
        {
          sql: `Select H010.NRDIA As NRDIA6,
                  H010.HOINICIO As INTDIA6I,
                  H010.HOFINAL As INTDIA6F,
                  H010.IDH010 As IDH0106
             From H010 H010
            Where H010.IdH009   = :id
              And H010.SnDelete = 0
              And H010.NrDia    = 6 
              And H010.StCadast = 'A'`,
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
      
        let result3 = await con.execute(
          {
            sql: ` Select H010.NRDIA As NRDIA0,
                          H010.HOINICIO As INTDIA0I,
                          H010.HOFINAL As INTDIA0F,
                          H010.IDH010 As IDH0100
                     From H010 H010
                    Where H010.IdH009   = :id
                      And H010.SnDelete = 0
                      And H010.NrDia    = 0 
                      And H010.StCadast = 'A'`,
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
      
      if (result1 == undefined) {
        result1 = '';
      }
      
      if (result2 == undefined) {
        result2 = '';
      }

      if (result3 == undefined) {
        result3 = '';
      }

      let strResult = Object.assign(result1, result2, result3);

      await con.close();
      logger.debug("Fim horarios");
      return strResult;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
      
  };



    /**
   * @description Listar um dado na tabela H011.
   *
   * @async
   * @function api/intervalos
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.intervalos = async function (req, res, next) {
    
    logger.debug("Inicio intervalos");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDH011;
      var dia = req.body.NRDIA;
      logger.debug("Parametros recebidos:", req.body);

      let strResult = await con.execute(
      {
        sql: ` Select H011.NRDIA As NRDIA,
                      H011.HOINIINT As INTDIAXI,
                      H011.HOFININT As INTDIAXF,
                      H011.IdH011,
                      H011.IdH009
                 From H011 H011
                Where H011.IdH011   = :id
                  And H011.SnDelete = 0
                  And H011.NrDia    = :dia 
                  And H011.StCadast = 'A'`,
        param: {
          id: id,
          dia: dia
        }
      })
      .then((result) => {
        logger.debug("Retorno:", result);
        return (result[0]);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
      
      await con.close();
      logger.debug("Fim intervalos");
      return strResult;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    }
      
  };
  
  /**
   * @description Listar um dado na tabela H009.
   *
   * @async
   * @function api/buscarHorarioReagendar
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

      var id = req.body.IDH009;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: `Select H009.IDH009,
                     H009.IDG028,
                     H009.DTINICIO,
                     H009.DTFINAL,
                     H009.STCADAST,
                     H009.DTCADAST,
                     H009.IDS001,
                     H009.SNDELETE,
                     G028.NMARMAZE,
                     nvl(G028.QTMINJAN,0) as MNSLOT,

                     (Select Count(*)
                     From H007 H007
                     Join H005 H005
                       On H005.Idh005 = H007.Idh005
                     Join G028 G028
                       On H005.Idg028 = G028.Idg028
                    Where H009.Idg028 = G028.Idg028
                      And to_Date(H007.HOINICIO, 'dd/mm/yy') 
                  Between to_Date(H009.Dtinicio, 'dd/mm/yy') 
                      And to_Date(H009.Dtfinal, 'dd/mm/yy')
                      And H007.Idh006 Is Not Null) As QtAgenda,

                     H009.IdH015,
                     H015.DSCONFIG,
                     H009.STPARAME
                From H009 H009
                Join G028 G028 on (H009.IdG028 = G028.IdG028)
           Left Join H015 H015 on (H009.IdH015 = H015.IdH015)
               Where H009.IdH009   = : id
                 And H009.SnDelete = 0`,
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

  /**
   * @description Salvar um dado na tabela H009.
   *
   * @async
   * @function api/buscarHorarioReagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvar = async function (req, res, next) {

    logger.debug("Inicio salvar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);

      req.UserId = req.headers.ids001;

      var Moment = require('moment');
      Moment.locale('pt-BR');
      var MomentRange = require('moment-range');
      var moment = MomentRange.extendMoment(Moment);
        
      let paramIni = moment(req.body.DTINICIO).format('L');
      let paramFin = moment(req.body.DTFINAL).format('L');

      let parametro = await con.execute(
        {
          sql: `Select Distinct H009.*
                  From H007 H007
                  Join H005 H005
                    On H005.Idh005 = H007.Idh005
                  Join G028 G028
                    On H005.Idg028 = G028.Idg028
                
                  Left Join H009 H009
                   On H009.Idg028 = G028.Idg028
                  And To_Date(H009.Dtinicio, 'dd/mm/yy') Between
                      To_Date(H007.Hoinicio, 'dd/mm/yy') And
                      To_Date(H007.Hofinal, 'dd/mm/yy')
                
                Where G028.Idg028 = '`+req.body.IDG028.id+`'
                  And To_Date(H007.Hoinicio, 'dd/mm/yy') Between
                      To_Date('`+paramIni+`', 'dd/mm/yyyy') And
                      To_Date('`+paramFin+`', 'dd/mm/yyyy')
                  And H007.Sndelete = '0'
                  And H009.Sndelete = '0' `,
                  param:[]
        })
        .then((result) => {
  
          logger.debug("Retorno:", result);
          return (result[0]);
  
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
  
      if (parametro != undefined) {
        logger.error("Grade existente");
        res.status(500);
        return { nrlogerr: -1, response: [req.__('hc.erro.parametroCadastrado')] };
      }

      let result = await con.insert({
        tabela: 'H009',
        colunas: {

          DtInicio : new Date(req.body.DTINICIO),
          DtFinal : new Date(req.body.DTFINAL),
          StCadast: 'A',
          DtCadast: new Date(),
          IdG028: req.body.IDG028.id,
          IDH015: req.body.IDH015.id,
          QTMINJAN:  req.body.MNSLOT,
          IdS001  : req.UserId,
          StParame  : 'S',

        },
        key: 'IdH009'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
  
      await con.close();
      logger.debug("Fim salvar");
      return {"IDH009":result};
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
   * @description Atualizar um dado na tabela H009.
   *
   * @async
   * @function api/buscarHorarioReagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atualizar = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDH009;
      logger.debug("Parametros recebidos:", req.body);

      let result = await
        con.update({
          tabela: 'H009',
          colunas: {
            DtInicio : new Date(req.body.DTINICIO),
            DtFinal: new Date(req.body.DTFINAL),
            StCadast:  req.body.STCADAST,
            IdG028: req.body.IDG028.id,
            IDH015: req.body.IDH015.id,
            QTMINJAN: req.body.MNSLOT,
            StParame  : 'S'
          },
          condicoes: 'IdH009 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.update')};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      
      await con.close();
      logger.debug("Fim atualizar");
      return {"IDH009":id};
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  
  };

  /**
   * @description Delete um dado na tabela H009.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.excluir = async function (req, res, next) {

    logger.debug("Inicio excluir");
    let con = await this.controller.getConnection(null, req.UserId);

    try {
    
      let id = req.body.IDH009;
    
    let parametro = await con.execute(
      {
        sql: ` Select H009.Dtinicio,
                      H009.Dtfinal,
                      H009.Idh009,
                      (Select Listagg(Idh005, ',') Within Group(Order By Idh005) Dsmovage
                        From H005 H005
                        Where H005.Idg028 = H009.Idg028) As Idh005s
                From H009 H009
               Where H009.IDH009 = :id `,
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
        logger.error("Erro:", err);
        throw err;
      });

    if (parametro.IDH009 == undefined) {
      logger.error("Parametro nao encontrado");
      res.status(500);
      return { nrlogerr: -1, armensag: [req.__('hc.erro.slotsIndisponivel')] };
    }
      
    var Moment = require('moment');
    Moment.locale('pt-BR');
    var MomentRange = require('moment-range');
    var moment = MomentRange.extendMoment(Moment);
      
    let paramIni = moment(parametro.DTINICIO).format('L');
    let paramFin = moment(parametro.DTFINAL).format('L');
    let updateH007 = await
      con.execute({

          sql: ` Update H007 
                 set SnDelete = '1', 
                     SnFlagDe = IDH007
                 where to_date(HOINICIO, 'dd/mm/yy') Between To_Date('`+paramIni+`', 'dd/mm/yyyy') And
          To_Date('`+ paramFin + `', 'dd/mm/yyyy') and idH005 in (`+parametro.IDH005S+`)`,
          param: []
        })

        .then((result1) => {
        logger.debug("Retorno Update delete:", result1);
        return { response: req.__('hc.sucesso.delete') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
      
    
    let result = await
      con.update({
        tabela: 'H009',
        colunas: {
          SnDelete: 1
        },
        condicoes: ` IdH009 in (`+req.body.IDH009+`)`,
        param: []
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.delete') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
      
      await con.close();
      logger.debug("Fim excluir");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }

  }; 



  /**
   * @description Delete um dado na tabela H011.
   *
   * @async
   * @function api/excluirIntervalo
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.excluirIntervalo = async function (req, res, next) {

    logger.debug("Inicio excluirIntervalo");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDH011;

      logger.debug("ID selecionados");  

    
      let result = await
      con.update({
        tabela: 'H011',
        colunas: {
          SnDelete:  1,
        },
        condicoes: 'IdH011 = :id',
        parametros: {
          id: id
        }
      })
        .then((result1) => {
        logger.debug("Retorno:", result1);
        return { response: req.__('hc.sucesso.delete') };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
      
      await con.close();
      logger.debug("Fim excluirIntervalo");
      return result;
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }

  }; 

  /**
   * @description Salvar um dado na tabela H010.
   *
   * @async
   * @function api/salvarHorarios
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvarHorarios = async function (req, res, next) {

    logger.debug("Inicio salvarHorarios");
    let con = await this.controller.getConnection(null, req.UserId);
    let id = null;
    try {

      logger.debug("Parametros recebidos:", req.body);
      var objHorarios = req.body;

      req.UserId = req.headers.ids001;

      if (objHorarios.NRDIA0 != undefined && objHorarios.NRDIA1 != undefined && objHorarios.NRDIA6 != undefined) {
        //msg para escolher dias;
        logger.debug("Nenhum dia cadastrado");
        return false;
      }

      if (objHorarios.DIA1DESC != undefined && objHorarios.DIA1DESC == false /*true*/) {
        
        logger.debug("DIA 1");
        let hoinicio  = ("0000" + objHorarios.INTDIA1I.hour).slice(-2) +':'+ ("0000" + objHorarios.INTDIA1I.minute).slice(-2);
        let horafinal = ("0000" + objHorarios.INTDIA1F.hour).slice(-2) +':'+ ("0000" + objHorarios.INTDIA1F.minute).slice(-2);;
        
        // update
        if (objHorarios.IDH0101 != undefined && objHorarios.IDH0101 != null && objHorarios.IDH0101 != '') {
          logger.debug("UPDATE DIA 1");
          id = objHorarios.IDH0101;
          let result1 = await
            con.update({
              tabela: 'H010',
              colunas: {
                NRDIA: 1,
                HOINICIO: hoinicio,
                HOFINAL: horafinal,
                StCadast: 'A',
                IDS001: req.UserId,
                IDH009: objHorarios.IDH009,
                QTMINJAN: objHorarios.QTMINJAN
              },
              condicoes: 'IdH010 = :id',
              parametros: {
                id: id
              }
            })
              .then((result1) => {
                logger.debug("Retorno:", result1);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
              });
          
          //save
        } else {
          logger.debug("SAVE DIA 1");
          let result1 = await con.insert({
            tabela: 'H010',
            colunas: {
              NRDIA: 1,
              HOINICIO: hoinicio,
              HOFINAL: horafinal,
              StCadast: 'A',
              IDS001: req.UserId,
              IDH009: objHorarios.IDH009,
              DtCadast: new Date(),
              QTMINJAN: objHorarios.QTMINJAN
            },
            key: 'IdH010'
          })
            .then((result1) => {
              logger.debug("Retorno:", result1);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
        }
      } else { 
        // delta se tiver algum
        id = objHorarios.IDH009;
        let result = await
        con.update({
          tabela: 'H010',
          colunas: {
            SnDelete:  1,
          },
          condicoes: 'IDH009 = :id AND NRDIA = 1 ',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return { response: req.__('hc.sucesso.delete') };
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      }

      if (objHorarios.DIA0DESC != undefined && objHorarios.DIA0DESC == false /*true*/) {
        
        let hoinicio  = ("0000" + objHorarios.INTDIA0I.hour).slice(-2) +':'+ ("0000" + objHorarios.INTDIA0I.minute).slice(-2);
        let horafinal = ("0000" + objHorarios.INTDIA0F.hour).slice(-2) +':'+ ("0000" + objHorarios.INTDIA0F.minute).slice(-2);;
        
        // update
        if (objHorarios.IDH0100 != undefined && objHorarios.IDH0100 != null && objHorarios.IDH0100 != '') {
          id = objHorarios.IDH0100;
          let result1 = await
            con.update({
              tabela: 'H010',
              colunas: {
                NRDIA: 0,
                HOINICIO: hoinicio,
                HOFINAL: horafinal,
                StCadast: 'A',
                IDS001: req.UserId,
                IDH009: objHorarios.IDH009,
                DtCadast: new Date(),
                QTMINJAN: objHorarios.QTMINJAN
              },
              condicoes: 'IdH010 = :id',
              parametros: {
                id: id
              }
            })
              .then((result1) => {
                logger.debug("Retorno:", result1);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
              });
          
          //save
        } else {

          let result1 = await con.insert({
            tabela: 'H010',
            colunas: {
              NRDIA: 0,
              HOINICIO: hoinicio,
              HOFINAL: horafinal,
              StCadast: 'A',
              IDS001: req.UserId,
              IDH009: objHorarios.IDH009,
              DtCadast: new Date(),
              QTMINJAN: objHorarios.QTMINJAN
            },
            key: 'IdH010'
          })
            .then((result1) => {
              logger.debug("Retorno:", result1);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
        }
      } else { 
        // delta se tiver algum
        id = objHorarios.IDH009;
        let result = await
        con.update({
          tabela: 'H010',
          colunas: {
            SnDelete:  1,
          },
          condicoes: 'IDH009 = :id AND NRDIA = 0 ',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return { response: req.__('hc.sucesso.delete') };
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      }

      if (objHorarios.DIA6DESC != undefined && objHorarios.DIA6DESC == false /*true*/) {
        
        let hoinicio  = ("0000" + objHorarios.INTDIA6I.hour).slice(-2) +':'+ ("0000" + objHorarios.INTDIA6I.minute).slice(-2);
        let horafinal = ("0000" + objHorarios.INTDIA6F.hour).slice(-2) +':'+ ("0000" + objHorarios.INTDIA6F.minute).slice(-2);;
        
        // update
        if (objHorarios.IDH0106 != undefined && objHorarios.IDH0106 != null && objHorarios.IDH0106 != '') {
          id = objHorarios.IDH0106;
          let result1 = await
            con.update({
              tabela: 'H010',
              colunas: {
                NRDIA: 6,
                HOINICIO: hoinicio,
                HOFINAL: horafinal,
                StCadast: 'A',
                IDS001: req.UserId,
                IDH009: objHorarios.IDH009,
                DtCadast: new Date(),
                QTMINJAN: objHorarios.QTMINJAN
              },
              condicoes: 'IdH010 = :id',
              parametros: {
                id: id
              }
            })
              .then((result1) => {
                logger.debug("Retorno:", result1);
              })
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                logger.error("Erro:", err);
                throw err;
              });
          
          //save
        } else {

          let result1 = await con.insert({
            tabela: 'H010',
            colunas: {
              NRDIA: 6,
              HOINICIO: hoinicio,
              HOFINAL: horafinal,
              StCadast: 'A',
              IDS001: req.UserId,
              IDH009: objHorarios.IDH009,
              DtCadast: new Date(),
              QTMINJAN: objHorarios.QTMINJAN
            },
            key: 'IdH010'
          })
            .then((result1) => {
              logger.debug("Retorno:", result1);
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              logger.error("Erro:", err);
              throw err;
            });
        }
      } else { 
        // delta se tiver algum
        id = objHorarios.IDH009;
        let result = await
        con.update({
          tabela: 'H010',
          colunas: {
            SnDelete:  1,
          },
          condicoes: 'IDH009 = :id AND NRDIA = 6 ',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return { response: req.__('hc.sucesso.delete') };
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });

      }

      await con.close();
      logger.debug("Fim salvarHorarios");
      return {"IDH009":req.body.IDH009};
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
   * @description Salvar um dado na tabela H009.
   *
   * @async
   * @function api/buscarHorarioReagendar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.salvarIntervalo = async function (req, res, next) {

    logger.debug("Inicio salvarIntervalo");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      logger.debug("Parametros recebidos:", req.body);
      let hoinicio  = ("0000" + req.body.INTDIAXI.hour).slice(-2) +':'+ ("0000" + req.body.INTDIAXI.minute).slice(-2);
      let horafinal = ("0000" + req.body.INTDIAXF.hour).slice(-2) +':'+ ("0000" + req.body.INTDIAXF.minute).slice(-2);;

      req.UserId = req.headers.ids001;

      let result = await con.insert({
        tabela: 'H011',
        colunas: {
          IDH009: req.body.IDH009,
          NRDIA: req.body.NRDIA,
          HOINIINT: hoinicio,
          HOFININT: horafinal,
          StCadast: 'A',
          DtCadast: new Date(),
          IdS001  : req.UserId,
        },
        key: 'IDH011'
      })
      .then((result1) => {
        logger.debug("Retorno:", result1);
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
      });
  
      await con.close();
      logger.debug("Fim salvarIntervalo");
      return { response: req.__('hc.sucesso.insert') };
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  /**
   * @description Atualizar um dado na tabela H009.
   *
   * @async
   * @function api/atualizarIntervalo
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.atualizarIntervalo = async function (req, res, next) {

    logger.debug("Inicio atualizar");
    let con = await this.controller.getConnection(null, req.UserId);
    try {

      var id = req.body.IDH011;
      logger.debug("Parametros recebidos:", req.body);

      let hoinicio  = ("0000" + req.body.INTDIAXI.hour).slice(-2) +':'+ ("0000" + req.body.INTDIAXI.minute).slice(-2);
      let horafinal = ("0000" + req.body.INTDIAXF.hour).slice(-2) +':'+ ("0000" + req.body.INTDIAXF.minute).slice(-2);;

      let result = await
        con.update({
          tabela: 'H011',
          colunas: {
            HOINIINT: hoinicio,
            HOFININT: horafinal,
          },
          condicoes: 'IdH011 = :id',
          parametros: {
            id: id
          }
        })
          .then((result1) => {
          logger.debug("Retorno:", result1);
          return {response: req.__('hc.sucesso.update')};
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          logger.error("Erro:", err);
          throw err;
        });
      
      await con.close();
      logger.debug("Fim atualizar");
      return {response: req.__('hc.sucesso.update')};
    
    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
  
  };

  /**
   * @description Listar um dado na tabela H009.
   *
   * @async
   * @function api/verificaAgendaCriada
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.verificaAgendaCriada = async function (req, res, next) {
    
    logger.debug("Inicio verificaAgendaCriada");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

      var id = req.body.IDH009;
      logger.debug("Parametros buscar:", req.body);

      let result = await con.execute(
      {
        sql: `Select Count(*) as QTD
                From H007 H007
                Join H005 H005
                  On H005.Idh005 = H007.Idh005
                Join G028 G028
                  On H005.Idg028 = G028.Idg028
                Join H009 H009
                  On H009.Idg028 = G028.Idg028
              Where H009.Idh009 = : id
                And to_Date(H007.HOINICIO, 'dd/mm/yy') 
            Between to_Date(H009.Dtinicio, 'dd/mm/yy') 
                And to_Date(H009.Dtfinal, 'dd/mm/yy')
                And H007.Idh006 Is Not Null`,
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
      logger.debug("Fim verificaAgendaCriada");
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
