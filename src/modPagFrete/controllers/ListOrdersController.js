module.exports = function (app, cb) {

	const dao = app.src.modPagFrete.dao.ListOrdersDAO;

	var api = {};

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista as ordens de pagamento a serem aprovadas
    * @function listOrders
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\    

	api.listOrders = async function (req, res, next) {

		try {

			var arRS = await dao.listOrders(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

    //-----------------------------------------------------------------------\\
    
    return api;

}
