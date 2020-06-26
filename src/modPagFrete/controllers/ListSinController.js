module.exports = function (app, cb) {

	const dao = app.src.modPagFrete.dao.ListSinDAO;

	var api = {};

	//-----------------------------------------------------------------------\\
	/**
	* @description Lista os CTe's que não concluíram entrega
	* @function listND
	* @author Rafael Delfino Calzado
	* @since 12/12/2019
	*
	* @async
	* @returns {Array} Array com resultado da pesquisa
	* @throws  {Object} Objeto descrevendo o erro
	*/
	//-----------------------------------------------------------------------\\    

	api.listND = async function (req, res, next) {

		try {

			var arRS = await dao.listND(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\   
	/**
	* @description Lista chamados de ocorrências com as Deliveries do CTe
	* @function listCalls
	* @author Rafael Delfino Calzado
	* @since 12/12/2019
	*
	* @async
	* @returns {Array} Array com resultado da pesquisa
	* @throws  {Object} Objeto descrevendo o erro
	*/
	//-----------------------------------------------------------------------\\    

	api.listCalls = async function (req, res, next) {

		try {

			var arRS = await dao.listCalls(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	} 

	//-----------------------------------------------------------------------\\

	return api;

}
