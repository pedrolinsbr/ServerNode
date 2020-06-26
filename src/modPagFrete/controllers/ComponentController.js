module.exports = function (app, cb) {

	const dao = app.src.modPagFrete.dao.ComponentDAO;
	const mdl = app.src.modPagFrete.models.CompModel;

	var api = {};

	//-----------------------------------------------------------------------\\      
    /**
    * @description Checa atributos da requisição
    * @function checkForm
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @throws  {Object}  Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.checkForm = function (req, res, next) {

		try {

			var objVal = dao.db.checkSchema(req.body, mdl.arComponente);

			if (objVal.blOK)
				next();
			else
				res.status(400).send({ error: objVal.strError });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\      
    /**
    * @description Insere componentes de preço
    * @function insertComp
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @async
    * @returns {Object}  Objeto com o ID / número de linhas atualizadas
    * @throws  {Object}  Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.insertComp = async function (req, res, next) {

		try {

			var parm = { post: req.body };

			parm.objConn = await dao.db.controller.getConnection(null, req.UserId);

			await dao.removePrevComp(parm);

		 	await dao.insertArComp(parm);

			await parm.objConn.close();

			res.send({ blOK: true });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\      
    /**
    * @description Lista componentes padrão disponíveis
    * @function listCompCad
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @async
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.listCompCad = async function (req, res, next) {

		try {

			var arRS = await dao.listCompCad(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\      
    /**
    * @description Lista componentes da 3PL
    * @function listComp3PL
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @async
    * @returns {Array}   resultado da pesquisa
    * @throws  {Object}  Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.listComp3PL = async function (req, res, next) {

		try {

			var arRS = await dao.listComp3PL(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\     
    /**
    * @description Remove componente cadastrado na 3PL
    * @function deleteComp
    * @author Rafael Delfino Calzado
    * @since 12/11/2019
    *
    * @async
    * @returns {Object}  Quantidade de linhas afetadas
    * @throws  {Object}  Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.deleteComp = async function (req, res, next) {

		try {

			var parm = { IDG063: req.params.id };

			parm.objConn = await dao.db.controller.getConnection(null, req.UserId);
			await dao.db.deleteData(parm, mdl.G063);

			await parm.objConn.close();

			res.status(200).send({ blOK: true });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\

	return api;

}