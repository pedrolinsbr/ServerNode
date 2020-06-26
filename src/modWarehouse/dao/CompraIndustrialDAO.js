module.exports = function (app, cb) {

	const gdao  = app.src.modGlobal.dao.GenericDAO;
	const utils = app.src.utils.FuncoesObjDB;
	
	var api = {};
	api.controller = app.config.ControllerBD;

	const tmz 	   		= app.src.utils.DataAtual;
	const utilsWare 	= app.src.utils.Warehouse;
	

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
	/**
	 * @description Retorna um array com a lista de deliveries que compõe a carga
	 * @author Everton
	 * @since 02/07/2019
	 * @async
	 * @function listarCargas
	 * @return {Array} Retorno da consulta SQL.
	 * @throws {Object} Retorna o erro da consulta.
	 */
	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.updateDeliveriesToShipment = async function (req, res, next) {

		try {

			var parm = { objConn: req.objConn };

			await this.controller.setConnection(parm.objConn);
	
			parm.sql = `Update W001 SET IDW002 = ${req.body.IDW002}, DELICOMP = 0
						Where IDW001 
								In (${req.body.IDW001.join()})
						`;
			
			return await gdao.executar(parm, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarDeliveries = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);
		
		 req.sql = `
					Select 
						W001.IDW001, W001.CJREMETE, W001.CJDESTIN, 
						W001.CJTRANSP, W004.IDW004, W004.NMPLADES, W004.NRNFREF
						, COUNT(W001.IDW001) OVER() AS COUNT_LINHA
					From W001
						LEFT Join W003 ON W003.IDW001 = W001.IDW001
						LEFT Join W004 ON W003.IDW004 = W004.IDW004
					Where W001.DELICOMP = 1

					GROUP BY W001.IDW001, W001.CJREMETE, W001.CJDESTIN, 
					W001.CJTRANSP, W004.IDW004, W004.NMPLADES, W004.NRNFREF
					${utilsWare.paginar(req.body.pageNumber, req.body.size)}
				`;
					
		var rs = await gdao.executar(req, res, next);


		return rs;  

	}
	api.buscarUltimoId = async function (req, res, next) {
		await this.controller.setConnection(req.objConn);
		
		 req.sql = `
		 			SELECT  NEXTIDW001.NEXTVAL FROM w001
				`;
					
		var rs = await gdao.executar(req, res, next);


		return rs;  


	}
	

	return api;
}


