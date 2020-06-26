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
  var api         = {};
  var utils       = app.src.utils.FuncoesObjDB;

  api.controller = app.config.ControllerBD;
  
  const gdao = app.src.modGlobal.dao.GenericDAO;

  var db = require(process.cwd() + '/config/database');

  api.buscar = async function (req, res, next){

    var sqlAcl = await acl.montar({
      ids001: req.body.IDS001,
      dsmodulo: 'HORA-CERTA',
      nmtabela: [{ G024: 'G024' }, {G028: 'G028'}, {G005:'G005'}],
      //dioperad: ' ',
      esoperad: 'AND'
    });

    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G046', true);

    var sql =
        `SELECT 
                'G046.IDG046'
              , 'G046.TPCARGA'
              , 'G046.TPORIGEM'
              , 'G046.CDVIAOTI'
              , 'G046.DSCARGA'
              ,  ROUND(G046.PSCARGA, 2) PSCARGA
              , 'G046.DTCARGA'
              , TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY') DTCOLATU
              , 'G046.TPTRANSP'
              , 'G028.IDG028'
              , 'G028.NMARMAZE'
              , 'G030.IDG030'
              , 'G030.DSTIPVEI'
              , 'G030.QTCAPPES'
              , 'G024.IDG024'
              , 'G024.NMTRANSP'
              , 'G031.IDG031'
              , 'G031.CJMOTORI'
              , 'G032.IDG032'
              , 'G032.NRPLAVEI'
              , 'H002.DSTIPCAR'
              , 'O005.IDO005'
              , 'O005.DTRESOFE'

            ,	CASE
                    WHEN (O005.IDO005 IS NULL) THEN TO_CHAR(G046.DTCARGA, 'DD/MM/YYYY')
                    ELSE TO_CHAR(O005.DTRESOFE, 'DD/MM/YYYY')
                END DTRESPOS

            ,	COALESCE(LISTAGG(G043.NRNOTA, ',') WITHIN GROUP (ORDER BY G043.NRNOTA), '-') NRNFE

            ,   COUNT(*) OVER() COUNT_LINHA

        FROM G046

        INNER JOIN H002 -- TIPO DE CARGA
            ON H002.IDH002 = G046.TPCARGA

        INNER JOIN G028 -- ARMAZEM
            ON G028.IDG028 = G046.IDG028

        INNER JOIN G030 -- TIPO VEICULO
            ON G030.IDG030 = G046.IDG030

        INNER JOIN G024 -- TRANSP
            ON G024.IDG024 = G046.IDG024

        LEFT JOIN G031 -- MOTORISTA
            ON G031.IDG031 = G046.IDG031M1

        LEFT JOIN G032 -- VEÍCULO
            ON G032.IDG032 = G046.IDG032V1

        LEFT JOIN O005 -- OFERECIMENTO
            ON O005.IDG046 = G046.IDG046
            AND O005.IDG024 = G024.IDG024
            AND O005.STOFEREC = G046.STCARGA

        INNER JOIN G048 -- ETAPAS
            ON G048.IDG046 = G046.IDG046

        INNER JOIN G049 -- DELIVERIES DA ETAPA
            ON G049.IDG048 = G048.IDG048

        LEFT JOIN G051  -- CONHECIMENTOS DA ETAPA
            ON G051.IDG051 = G049.IDG051
            AND G051.STCTRC <> 'C'
            AND G051.SNDELETE = 0

        LEFT JOIN G052  -- NOTAS DO CONHECIMENTO
            ON G052.IDG051 = G051.IDG051

        INNER JOIN G043	-- DELIVERIES
            ON G043.IDG043 = NVL(G049.IDG043, G052.IDG043)

        ${sqlWhere} ${sqlAcl}
        AND G046.STCARGA = 'A'

        GROUP BY 
            'G046.IDG046'
          , 'G046.TPCARGA'
          , 'G046.TPORIGEM'
          , 'G046.CDVIAOTI'
          , 'G046.DSCARGA'
          ,  ROUND(G046.PSCARGA, 2) PSCARGA
          , 'G046.DTCARGA'
          , TO_CHAR(G046.DTCOLATU, 'DD/MM/YYYY') DTCOLATU
          , 'G046.TPTRANSP'
          , 'G028.IDG028'
          , 'G028.NMARMAZE'
          , 'G030.IDG030'
          , 'G030.DSTIPVEI'
          , 'G030.QTCAPPES'
          , 'G024.IDG024'
          , 'G024.NMTRANSP'
          , 'G031.IDG031'
          , 'G031.CJMOTORI'
          , 'G032.IDG032'
          , 'G032.NRPLAVEI'
          , 'H002.DSTIPCAR'
          , 'O005.IDO005'
          , 'O005.DTRESOFE'

      ${sqlOrder} ${sqlPaginate}`;


    var rs = await gdao.executar({sql, bindValues}, res, next).catch((err) => { throw err });

    return utils.construirObjetoRetornoBD(rs);

  }

    
  return api;

};
