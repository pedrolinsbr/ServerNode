
module.exports = function (app, cb) {

	var api = {};

	const tmz = app.src.utils.DataAtual;
	const dao = app.src.modIntegrador.dao.RelatorioDeliveryDAO;

    //-----------------------------------------------------------------------\\
	/**
	 * @description Relatório de deliveries Syngenta. Mostra todo os dados relacionados a ela desde a importação até a entrega.
	 * @author Rafael Delfino Calzado
	 * @since 04/11/2019
	 *
	 * @async
	 * @function listar
	 * @return 	{Array}  Retorna os registros encontrados
	 * @throws 	{Object} Retorna objeto com o erro encontrado
	*/
	//-----------------------------------------------------------------------\\

	api.listar = async function (req, res, next) {

		try {

            req.setTimeout(300000);

			var arRS = await dao.relDelivery(req, res, next);

			if (arRS.data)
				arRS.data.forEach(a => { a.TMOFEREC = tmz.msToHMS(a.TMOFEREC * 1000)});
			
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	return api;

}
