module.exports = function (app, cb) {

	const gdao  = app.src.modGlobal.dao.GenericDAO;
	const utils = app.src.utils.FuncoesObjDB;
	
	var api = {};
	api.controller = app.config.ControllerBD;

	const tmz 	   		= app.src.utils.DataAtual;
	const utilsWare 	= app.src.utils.Warehouse;
	
	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	/**
	 * @description Retorna um array com os dados do Inventario
	 * @author Everton
	 * @since 04/10/2019
	 * @async
	 * @function buscarInventario
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	api.listaInventario = async function (req, res, next) {

		//await this.controller.setConnection(req.objConn);
		
		req.sql = `
					SELECT 
						W007.IDW007,
						W007.DTINVENT, 
						W007.NRINVENT, 
						W007.NRDOCUME, 
						W007.CDFILIAL,
						W007.CDDEPOSI,
						TO_CHAR(W007.DTINVENT, 'YYYY') AS DTFISCAL,
						COUNT(W007.IDW007) OVER() AS COUNT_LINHA
					FROM W007
					WHERE STETAPA = ${req.body.params.STETAPA}
					AND SNDELETE = 0
					
					${utilsWare.ordenar(req, "W007.IDW007")} 
					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;

		//var parm = {sql};
					
		var rs = await gdao.executar(req, res, next);

		return rs;   

	}

	api.atualizarInventario = async function (req, res, next) {

		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `UPDATE W007 SET STETAPA = ${req.STETAPA} WHERE IDW007 IN (${req.IDW007})`;

		return await gdao.executar(parm, res, next);

	}

	api.buscarInventario = async function (req, res, next){
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
					Select 
					W007.IDW007, W007.NRINVENT, W007.DTCADAST, W008.NRLNITEM,
					W008.CDMATERI, W008.NRLOTE, W008.NRALFANU,  W008.QTMATERI,
					W008.DSMEDIDA, W008.DSRESPON
					FROM W007
					Inner Join W008 ON W007.IDW007 = W008.IDW007
					Where W007.IDW007 = ${req.IDW007}
				`;
					
		var rs = await gdao.executar(req, res, next);

		return rs;
	}

	api.detalhesInventario = async function (req, res, next){
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
					Select 
						W008.IDW007, 
						W007.NRDOCUME, 
						W007.NRINVENT,
						W008.IDW008,
						UPPER(W008.CDMATERI) || ' - ' || UPPER(W008.DSMATERI) AS MATERIAL,
						W008.NRLOTE, 
						W008.NRALFANU,
						W008.QTMATERI,
						W008.QTRESULT,
						W008.DSRESPON,
						W008.DTCONTAG,
						W008.NRLNITEM,
						W007.CDDEPOSI,
						W008.DSMEDIDA,
						(W008.QTMATERI - NVL(W008.QTRESULT, 0)) AS QTDIFERE,
						CASE WHEN(W008.QTMATERI - NVL(W008.QTRESULT, 0)) > 0 
							THEN 'SIM'	
							ELSE 'NÃO'
						END AS DSDIFERE,
						COUNT(W008.IDW008) OVER() AS COUNT_LINHA
					FROM W008
					INNER JOIN W007 ON W007.IDW007 = W008.IDW007
					Where W008.IDW007 = ${req.body.params.IDW007}
					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;
					
		var rs = await gdao.executar(req, res, next);

		return rs;
	}


	api.detalhesInventarioContagem = async function (req, res, next){
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
					Select 
						W008.IDW008,
						UPPER(W008.CDMATERI) || ' - ' || UPPER(W008.DSMATERI) AS MATERIAL,
						W008.NRLOTE, 
						W008.QTRESULT,
						COUNT(W008.IDW008) OVER() AS COUNT_LINHA
					FROM W008
					INNER JOIN W007 ON W007.IDW007 = W008.IDW007
					Where W008.IDW007 = ${req.body.params.IDW007}
					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;
					
		var rs = await gdao.executar(req, res, next);

		return rs;
	}

	api.calcularCards = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
						SELECT 
							  SUM(PRE_ASN) AS PRE_ASN
							, SUM(INICIADO) AS INICIADO
							, SUM(REALIZADO) AS REALIZADO
							, SUM(FINALIZADO) AS FINALIZADO
					    FROM (
								SELECT 						
									CASE
										WHEN STETAPA = 1 THEN 1
											ELSE 0
										END PRE_ASN,
									
									CASE
										WHEN STETAPA = 2 THEN 1
										ELSE 0
									END INICIADO,
									
									CASE
										WHEN STETAPA = 3 THEN 1
										ELSE 0
									END REALIZADO,
									
									CASE
										WHEN STETAPA = 4 THEN 1
										ELSE 0
									END FINALIZADO
								FROM (
									SELECT IDW007, STETAPA
									FROM W007
									WHERE W007.SNDELETE = 0
									GROUP BY IDW007, STETAPA
								)
							)
				`;
					
		return  await gdao.executar(req, res, next);

	}

	api.gerarTarefa = async function (req, res, next) {
		var parm = { objConn: req.objConn };

		await this.controller.setConnection(parm.objConn);

		parm.sql = `UPDATE W007 SET STETAPA = 3, SNGERINV = 1, SNENVIAD = 0 WHERE IDW007 IN (${req.body.IDW007})`;

		return await gdao.executar(parm, res, next);

	}

	api.listarInventarioEnvio = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);
		
		req.sql = `
					Select 
						IDW007,
						NRDOCUME,
						NRINVENT,
						DTCADAST
					From W007
					Where SNGERINV = 1 AND SNENVIAD = 0
					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`
		return await gdao.executar(req, res, next);
	}

	api.mudarEtapaFCM = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W007 SET STETAPA = 2 WHERE IDW007 IN (${req.body.params.IDW007.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.mudarEtapaCBS = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W007 SET STETAPA = 2  WHERE IDW007 IN (${req.body.params.IDW007.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.geraCBS = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W008 SET QTRESULT = QTMATERI, DSRESPON= 'BRAVO', DTCONTAG = TO_DATE('${tmz.tempoAtual('YYYY-MM-DD HH:mm:ss')}', 'YYYY-MM-DD HH24:MI:SS') WHERE IDW007 IN (${req.body.params.IDW007.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.mudarEtapaResultado = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W007 SET STETAPA = 3 WHERE IDW007 IN (${req.body.params.IDW007.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.mudarEtapaINV = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W007 SET STETAPA = 3 WHERE IDW007 IN (${req.body.params.IDW007.join()})`;

		return await gdao.executar(req, res, next);

	}

	api.finalizar = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W007 SET STETAPA = 4, SNENVIAD = 1 WHERE IDW007 IN (${req.IDW007})`;

		return await gdao.executar(req, res, next);

	}

	api.recontagem = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W007 SET STETAPA = 2, SNENVIAD = 1 WHERE IDW007 IN (${req.body.params.IDW007})`;

		return await gdao.executar(req, res, next);

	}

	api.editarQuantItem = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `UPDATE W008 SET QTRESULT = ${req.body.QTRESULT}, DSRESPON= 'BRAVO', DTCONTAG = TO_DATE('${tmz.tempoAtual('YYYY-MM-DD HH:mm:ss')}', 'YYYY-MM-DD HH24:MI:SS') WHERE IDW008 = ${req.body.IDW008}`;

		return await gdao.executar(req, res, next);

    }
    
    api.excluirInventario = async function (req, res, next) {

        await this.controller.setConnection(req.objConn);
        var IDW007 = req.body.params.IDW007;

        req.sql = `UPDATE W007 SET SNDELETE = 1 WHERE IDW007 = ${IDW007}`;

        return await gdao.executar(req, res, next);

    }


	
	return api;
}


