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
  const utils     = app.src.utils.FuncoesObjDB;
  const acl       = app.src.modIntegrador.controllers.FiltrosController;
  const logger    = app.config.logger;
  const tmz       = app.src.utils.DataAtual;
  const gdao      = app.src.modGlobal.dao.GenericDAO;
  api.controller  = app.config.ControllerBD;

  var moment = require('moment');
  moment.locale('pt-BR');

  const db = require(process.cwd() + '/config/database');

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
    objBanco.vlFields.IDCOMPOS    =     req.body.IDCOMPOS;
    objBanco.vlFields.PSMANUAL    =     req.body.PSMANUAL;
    objBanco.vlFields.NRBALPES    =     req.body.NRBALPES;
    objBanco.vlFields.IDS001      =     req.body.IDS001;
    objBanco.vlFields.DTCADAST    =     tmz.dataAtualJS();

    await this.controller.setConnection(req.objConn);

    objBanco.objConn = req.objConn;
    
    return await gdao.inserir(objBanco, res, next).catch((err) => { throw err });
  }

  api.buscarPesagensRelatorio = async function (req, res, next) {

    logger.debug("Iniciando busca de pesagens.Agendamento :" + req.body.IDH006);
    
    req.sql = `
              SELECT
                QTPESO,
                CASE
                  WHEN LIBERADO = 1 THEN 'Aprovado'
                  WHEN LIBERADO = 0 THEN 'Reprovado'
                END AS LIBERADO,
                DESVIOKG,
                DESVIOPE,
                DTCADAST,
                IDCOMPOS
              FROM 
                H021
              WHERE
                IDH006 = ${req.body.IDH006}
                AND SNDELETE = 0
              ORDER BY IDH021 ASC`;

    return await gdao.executar(req, res, next).catch((err) => { 
      console.log(err);
      throw err 
    });
  }

  api.buscarMovimentacao = async function (req, res, next) {

    if(req.body.SNDELETE === undefined){
      req.body.SNDELETE = [0,1];
    }

    req.sql = `SELECT H006.IDH006,																									--ID AGENDAMENTO
                      H006.IDG028,																									--ID ARMAZÉM
                      H006.TPMOVTO AS TIPO,																					--TIPO DO AGENDAMENTO 
                      H006.QTPESO AS PA,																						--PESO AGENDADO
                      H006.TPPESAGE,																								--TIPO PESAGEM
                      H006.IDH002,																									--TIPO DE CARREGAMENTO
                      H006.QTPALLET,																								--QUANTIDADE DE PALLET
                      H006.PSPALLET,																								--PESO UNITÁRIO DO PALLET
                      CASE
                        WHEN H006.TPOPERAC IS NULL THEN
                            (SELECT DISTINCT TPOPERAC FROM H024 WHERE H024.IDH006 = H006.IDH006 AND H024.SNDELETE = 0)
                          WHEN H006.TPOPERAC IS NOT NULL THEN
                            H006.TPOPERAC
                      END TPOPERAC,																									--TIPO DE OPERAÇÃO
                      H021.IDH021,																									--ID PESAGEM
                      H021.QTPESO,																									--PESO SALVO
                      H021.PSMANUAL,																								--PESO MANUAL?
                      H021.TPMOVTO,																									--TIPO MOVIMENTAÇÃO
                      H021.SNDELETE,																								--PESAGEM CANCELADA?
                      H021.LIBERADO,																								--VEÍCULO LIBERADO?
                      H021.DESVIOKG,																								--PESO DESVIO CALCULADO
                      H021.DESVIOPE,																								--PERCENTUAL DESVIO CALCULADO
                      H021.NRBALPES,																								--BALANÇA
                      TO_CHAR(H021.DTCADAST, 'DD/MM/YYYY HH24:mi:ss') AS DTCADAST, 	--DATA PESAGEM
                      S001.NMUSUARI																									--USUÁRIO DA BALANÇA
                 FROM H021
                 JOIN H006 ON H006.IDH006 = H021.IDH006
                 JOIN S001 ON H021.IDS001 = S001.IDS001
                WHERE H006.IDH006 = ${req.body.IDH006}
                  AND H021.SNDELETE IN (${req.body.SNDELETE.join()})
             ORDER BY H021.DTCADAST ASC`

    return await gdao.executar(req, res, next).catch((err) => { 
      console.log(err);
      throw err });
  };

  api.cancelarPesagem = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    var user = null;
    if (req.UserId) {
      user = req.UserId;
    } else if (req.headers.ids001) {
      user = req.headers.ids001;
    } else if (req.body.IDS001) {
      user = req.body.IDS001;
    }

    req.sql = `
      UPDATE H021
      SET SNDELETE = 1,
      USERCANC = ${user}
      WHERE 
        IDH006   = ${req.body.IDH006} AND
        TPMOVTO  = '${req.body.TPMOVTO}' AND
        IDH021   = ${req.body.IDH021}
    `
    return await gdao.executar(req, res, next).catch((err) => { throw err });
  };

  api.verificaQtdPesagens = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `SELECT (
                        SELECT COUNT(*)
                          FROM H021 H021
                         WHERE H021.IDH006 = ${req.body.IDH006}
                           AND H021.SNDELETE = 0
                      ) AS COUNT_PESAGEM,
                      (
                        SELECT H006.STAGENDA
                          FROM H006 H006
                        WHERE H006.IDH006 = ${req.body.IDH006}
                      ) AS STAGENDA
                 FROM dual`;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.updateStatus = async function (req, res, next){

    await gdao.controller.setConnection(req.objConn);

    req.sql = `
                Update H006 
                Set StAgenda = ${req.body.STAGENDA}
                Where IDH006 = ${req.body.IDH006}
              `;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.deleteStatus = async function (req, res, next) {

    await this.controller.setConnection(req.objConn);

    req.sql = `DELETE FROM H008 H008
                WHERE H008.IDH006 = ${req.body.IDH006}
                  AND H008.NRSEQMOV > ( SELECT MAX(H008B.NRSEQMOV)
                                          FROM H008 H008B
                                         WHERE H008B.IDH006   = ${req.body.IDH006}
                                           AND H008B.STAGENDA = 12
                                      )
                  AND H008.STAGENDA IN (5,6)`;

    return await gdao.executar(req, res, next).catch((err) => { throw err });
  }

  api.atualizaLiberacao = async function (req, res, next) {

    var comp;
    if(req.body.COMPOSICAO == null || req.body.COMPOSICAO == undefined){
        req.sql = `
                  UPDATE H021
                  SET LIBERADO = ${req.body.LIBERADO},
                      DESVIOKG  = ${req.body.DESVIOKG},
                      DESVIOPE  = ${req.body.DESVIOPE}
                  WHERE 
                    IDH006   = ${req.body.IDH006} AND 
                    IDH021 = ${req.body.IDH021} AND 
                    TPMOVTO  = 'S' AND
                    SNDELETE = 0
                  `;
    } else {
      comp = req.body.COMPOSICAO;
      req.sql = `
                UPDATE H021
                SET LIBERADO = ${req.body.LIBERADO},
                      DESVIOKG  = ${req.body.DESVIOKG},
                      DESVIOPE  = ${req.body.DESVIOPE}
                WHERE 
                  IDH006   = ${req.body.IDH006} AND 
                  IDCOMPOS = ${comp} AND 
                  TPMOVTO  = 'S' AND
                  SNDELETE = 0
              `;
    }

    
    return await gdao.executar(req, res, next).catch((err) => { 
      console.log(err);
      throw err;
    });
  };

  api.relatorioPesagens = async function (req, res, next) {

		let sqlAcl = "";
		let IDS001 = 1202;

		//BUSCAR ID DO USUARIO
		if (req.body.IDS001 !== undefined) {
      IDS001 = req.body.IDS001;
    } else if (req.headers.ids001 !== undefined) {
      IDS001 = req.headers.ids001;
    }

		if (IDS001 !== undefined) {
      sqlAcl = await acl.montar({
        ids001: IDS001,
        dsmodulo: 'HORA-CERTA',
        nmtabela: [{G028: 'G028'}],
        esoperad: 'AND'
      });
		} else {
      sqlAcl = ' AND 1 = 0';
    }

    let [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'H021',false);

    let sql = `SELECT H021.IDH021 																				H021_IDH021
                    , H021.IDH006 																				H021_IDH006
                    , H021.NRSEQUE  																			H021_NRSEQUE
                    , H021.QTPESO 																				H021_QTPESO
                    , H021.TPMOVTO																				H021_TPMOVTO
                    , H021.SNDELETE 																			H021_SNDELETE
                    , H021.LIBERADO 																			H021_LIBERADO
                    , H021.DESVIOKG																				H021_DESVIOKG
                    , H021.PSMANUAL 																			H021_PSMANUAL
                    , H021.DESVIOPE 																			H021_DESVIOPE
                    , H021.NRBALPES																				H021_NRBALPES
                    , H021.IDCOMPOS 																			H021_IDCOMPOS
                    , TO_CHAR(H021.DTCADAST, 'DD/MM/YYYY HH24:mi:ss')			H021_DTCADAST
                    , CASE
                        WHEN H021.TPMOVTO = 'E' THEN 'Entrada'
                        WHEN H021.TPMOVTO = 'S' THEN 'Saída'
                      END 																								H021_MOVIMENT
                    , H006.TPMOVTO																				H006_TPMOVTO
                    , H006.QTPESO																					H006_QTPESO
                    , H006.TPPESAGE 																			H006_TPPESAGE
                    , H006.QTPALLET 																			H006_QTPALLET
                    , H006.PSPALLET 																			H006_PSPALLET
                    , H002.DSTIPCAR																				H002_DSTIPCAR
                    , S001.NMUSUARI																				S001_NMUSUARI
                    , COUNT(*) OVER() AS COUNT_LINHA
                 FROM H021
            LEFT JOIN S001 ON H021.IDS001 = S001.IDS001
            LEFT JOIN H006 ON H006.IDH006 = H021.IDH006
            LEFT JOIN H002 ON H006.IDH002 = H002.IDH002
            LEFT JOIN G028 ON H006.IDG028 = G028.IDG028
                 ${sqlWhere}
                 ${sqlAcl} ${sqlOrder} ${sqlPaginate}`;

    return await db.execute({
      sql  : sql,
      param: bindValues
    })
    .then((result) => {
      return utils.construirObjetoRetornoBD(result);
    })
    .catch((err) => {
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    });

  }

  return api;

};