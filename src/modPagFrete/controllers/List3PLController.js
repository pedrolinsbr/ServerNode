module.exports = function (app, cb) {

	const dao = app.src.modPagFrete.dao.List3PLDAO;

	var api = {};

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista as cargas que faltam documentação do 3PL
    * @function listSync3PL
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\    

	api.listSync3PL = async function (req, res, next) {

		try {

            req.setTimeout(300000);

			var arRS = await dao.listSync3PL(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\
	/**
	* @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
	* @function detailSync3PL
	* @author Rafael Delfino Calzado
	* @since 10/12/2019
	*
	* @async
	* @returns {Object} Objeto com resultado da pesquisa
	* @throws  {Object} Objeto descrevendo o erro
	*/
	//-----------------------------------------------------------------------\\  

	api.detailSync3PL = async function (req, res, next) {

		try {

			var objResp = { blOK: false };

			var arRS = await dao.detailSync3PL(req);

			if (arRS.length > 0) {

				objResp.blOK = true;
				objResp.IDG046   = arRS[0].IDG046;
				objResp.NMTRANSP = arRS[0].NMTRANSP;
				objResp.PSCARGA  = arRS[0].PSCARGA;
				objResp.VRCARGA  = arRS[0].VRCARGA;
				objResp.TPLOAD 	 = arRS[0].TPLOAD;
				objResp.QTDISPER = arRS[0].QTDISPER;
				objResp.NMCIDORI = arRS[0].NMCIDORI;
				objResp.NMCIDDES = arRS[0].NMCIDDES;
				objResp.DSTPTRA  = arRS[0].DSTPTRA;
				objResp.arCTe    = [];

				while (arRS.length > 0) {

					var objCTe =
					{
						IDCTE4PL: arRS[0].IDCTE4PL,
						CDCTR4PL: arRS[0].CDCTE4PL,
						VRCTE4PL: arRS[0].VRCTE4PL,
						NRCHA4PL: arRS[0].NRCHA4PL,
						NMCLIENT: arRS[0].NMCLIENT,
						IDCTE3PL: arRS[0].IDCTE3PL,
						CDCTR3PL: arRS[0].CDCTE3PL,
						VRCTE3PL: arRS[0].VRCTE3PL,
						NRCHA3PL: arRS[0].NRCHA3PL,
						arNFe: 	  []
					};

					while ((arRS.length > 0) &&
						   (arRS[0].IDCTE4PL == objCTe.IDCTE4PL) && 
						   (arRS[0].IDCTE3PL == objCTe.IDCTE3PL)) {

						var objNFe =
						{
							IDG083: 	arRS[0].IDG083,
							IDF004: 	arRS[0].IDF004,
							NRNOTA: 	arRS[0].NRNOTA,
							VRNOTA:		arRS[0].VRNOTA,
							DTEMINOT:	arRS[0].DTEMINOT,
							NRCHANFE: 	arRS[0].NRCHANFE
						};

						objCTe.arNFe.push(objNFe);

						arRS.shift();

					}

					objResp.arCTe.push(objCTe);

				}

			}

			res.send(objResp);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\  

	return api;

}
