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
	api.timelineAdd = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);
		
		objBanco = {
			table:    'W010'
		  , key:      ['IDW010']
		  , vlFields:  {}
		  }

		  objBanco.vlFields.IDS001 		=  	97; 
		  objBanco.vlFields.NRKEY 		=  	req.NRKEY ? req.NRKEY: '';
		  objBanco.vlFields.STEVENT 	=  req.STEVENT; 
		  objBanco.vlFields.DSKEY 		=  	req.DSKEY ? req.DSKEY : '';
		  objBanco.vlFields.DSDESC		=	req.DSDESC;
		  objBanco.vlFields.SNDELETE	=	0; 
		  objBanco.vlFields.DTCADAST 	=  	tmz.dataAtualJS();
		  
		  
		  
		  
		  objBanco.objConn = req.objConn;
		  
		return await gdao.inserir(objBanco, res, next).catch((err) => { 
			throw err 
		});  

	}

	api.listarTimeline = async function (req, res, next) {

		await this.controller.setConnection(req.objConn);

		req.sql = `
					Select 
						NRKEY AS KEY,
						DSDESC AS DESCRIPTION,
						DTCADAST AS DATA
					From W010
					Where 
						NRKEY = ${req.body.params.NRKEY}
					ORDER BY DTCADAST ASC
				`;
					
		return await gdao.executar(req, res, next)


	}




	
	return api;
}


