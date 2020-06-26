module.exports = function (app, cb) {

	const tmz = app.src.utils.DataAtual;
	const fmt = app.src.utils.Formatador;
	const ca  = app.src.utils.ConversorArquivos;
	const mdl = app.src.modIntegrador.models.FeriadoModel;
	const dao = app.src.modIntegrador.dao.FeriadoDAO;

	var api = {};

	//-----------------------------------------------------------------------\\ 

	api.checkModel = function (req, res, next) {

		var parm = { post: req.body, model: mdl.feriado.columns };
		fmt.chkModelPost(parm, res, next);
		
	}

	//-----------------------------------------------------------------------\\ 

	api.removeFeriado = async function (req, res, next) {

		try {

			var objDados = Object.assign({}, mdl.G054);
			objDados.UserId = req.UserId;
			objDados.vlKey[objDados.key[0]] = req.params.id;
			objDados.vlFields = { SNDELETE: 1 };
			
			var objRet = await dao.alterar(objDados, res, next);

			res.send(objRet);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\ 

	api.listaFeriado = async function (req, res, next) {

		try {

			var arRS = await dao.listaFeriado(req, res, next);

			var nmCampo = null
			var idCampo = null;
			var idObj   = null;

			for (var a of arRS.data) {

				switch (a.TPFERIAD) {

					case 'MUNICIPAL':
						idCampo = 'IDCIDADE';
						nmCampo = 'NMCIDADE';
						idObj   = 'IDG003';
						break;

					case 'ESTADUAL':
						idCampo = 'IDESTADO';
						nmCampo = 'CDESTADO';
						idObj   = 'IDG002';
						break;

					case 'NACIONAL':
					default: 
						idCampo = 'IDPAIS';
						nmCampo = 'NMPAIS';
						idObj   = 'IDG001';
						break;

				}

				var arID    = a[idCampo].split(',');
				var arNome  = a[nmCampo].split(',');
				var arDados = [];

				for (var i in arID) {
					arDados.push({ id: parseFloat(arID[i]), text: arNome[i] });
				}
				
				a[idObj] = arDados;

			}

			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\ 

	api.validaDados = function (req, res, next) {

		try {

			var parm    = req.body;
			var blOK 	= false;
			var strErro = null;

			var vrAno = (Number.isInteger(parseInt(parm.DTANOFER))) ? parm.DTANOFER : new Date().getFullYear();

			var dtCompl = `${vrAno}-${parm.DTMESFER}-${parm.DTDIAFER}`;

			if (ca.isDate(dtCompl)) {

				if ((!parm.DTANOFER) && (parm.SNRECORR == 0)) {

					strErro = 'Ano não informado';

				} else if 
					(((parm.TPFERIAD == 2) && (!Array.isArray(parm.IDG001))) ||
					((parm.TPFERIAD == 1) && (!Array.isArray(parm.IDG002))) ||
					((parm.TPFERIAD == 0) && (!Array.isArray(parm.IDG003)))) 
				{

					strErro = 'Localidade não informada';

				} else {

					if (parm.SNRECORR == 1) parm.DTANOFER = null;
					blOK = true;

				}

			} else {

				strErro = 'Data inválida';

			}

			return { blOK, strErro };

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\ 

	api.editaFeriado = async function (req, res, next) {

		try {

			var objVal = api.validaDados(req, res, next);

			var strErro  = objVal.strErro;
			var blOK 	 = false;
			var key 	 = mdl.G054.key[0];
			var parm	 = { post: req.body };

			if (objVal.blOK) {
			
				parm.post.DTCADAST = tmz.dataAtualJS();
				parm.objConn = await dao.controller.getConnection(null, parm.post.IDS001);

				var objDados = fmt.setSchema(mdl.G054, parm.post);
				objDados.objConn = parm.objConn;

				blOK = (Object.keys(objDados.vlKey).length == 1);

				if (!blOK) {

					var arRS = await dao.buscaPreviaFeriado(parm, res, next);
					var blOK = (arRS.length == 0);

					if (blOK) {

						await dao.controller.setConnection(parm.objConn);
						var objRet = await dao.inserir(objDados, res, next);

						parm.post[key] = objRet.id;			

					} else {

						strErro = 'Existe um feriado cadastrado com as mesmas características';

					}

				} else {

					await dao.controller.setConnection(parm.objConn);
					await dao.alterar(objDados, res, next);
					await dao.removeLocalPrevio(parm, res, next);

				}

				if (blOK) {
					await dao.insereLocalFeriado(parm, res, next);
				}

				await parm.objConn.close();

			} 

			var cdStatus = (blOK) ? 200 : 400;

			res.status(cdStatus).send({ blOK, error: strErro, id: parm.post[key] });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\ 

	return api;

}
