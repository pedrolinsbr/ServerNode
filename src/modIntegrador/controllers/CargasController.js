module.exports = function (app, cb) {

	var api = {};
	var dao = app.src.modIntegrador.dao.CargasDAO;
	var deliveryDAO = app.src.modIntegrador.dao.DeliveryDAO;

	api.buscarCarga = async function (req, res, next) {
		await dao.buscarCarga(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	api.buscarDeliveries = async function (req, res, next) {
		await dao.buscarDeliveries(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	api.buscarParadas = async function (req, res, next) {
		await dao.buscarParadas(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	/**
	 * @description Faz o cancelamento da carga, gerando ASN delete, enviando as deliveries para backlog/a cancelar/cancelada, gera evento na timeline
	 *
	 * @async
	 * @function cancelarCargas   
	 * @param {Object} req Possui as requisições para a função.
	 * 
	 * @return {Object} Retorna um objeto JSON.
	 * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
	 * 
	 * @requires config/ControllerBD~getConnection
	 * @requires config/ControllerBD~setConnection
	 * @requires modIntegrador/dao/CargasDAO~cancelarCarga
	 * @requires modIntegrador/dao/CargasDAO~gerarAsnDelete
	 * @requires modIntegrador/dao/CargasDAO~cancelarDelivery
	 * @requires modIntegrador/dao/CargasDAO~eventoCargaCancelada
	 * @requires modIntegrador/dao/CargasDAO~verificaEtapaDelivery
	 * 
	 *  @author Yusha Mariak Miranda Silva
	 *  @since 03/2018
  	*/
	api.cancelarCargas = async function (req, res, next) {
		
		var arOcorre = [];
		var parm 	 = {UserId: req.UserId};
		var cdStatus = 500;
		
		if (req.body.carga !== undefined){
			parm.IDG046 = req.body.carga;
			parm.IDT013 = req.body.IDT013;
			parm.IDS001 = req.body.IDS001;
		}
		else{
			arOcorre.push('Carga não informada');
		} 
		
		if (arOcorre.length == 0) {
		
			var objConn = await dao.controller.getConnection();			

			await dao.controller.setConnection(objConn);
			parm.objConn = objConn;			

			var rs = await dao.verificaEtapaDelivery(parm, res, next);
			
			if (rs.length == 0) {

				await dao.controller.setConnection(objConn);				

				await dao.cancelarCarga(parm, res, next)
					.then(async (result) => {

						await dao.controller.setConnection(objConn);						

						await dao.gerarAsnDelete(parm, res, next)
						.then(async (result) => {

							parm.opcao = 1;
							await dao.controller.setConnection(objConn);
			
							await dao.cancelarDeliveryCarga(parm, res, next)
							.then(async (result) => {

								parm.opcao = 2;	
								await dao.controller.setConnection(objConn);

								await dao.cancelarDeliveryCarga(parm, res, next)

								.then(async (result) => {

									await dao.controller.setConnection(objConn);

									await dao.eventoCargaCancelada(parm, res, next)

									.catch((err) => {										
										arOcorre.push('Erro ao registrar evento de carga cancelada.');
									})
								})

								.catch((err) => {									
									arOcorre.push('Erro ao cancelar delivery.');
								})
							})

							.catch((err) => {
								arOcorre.push('Erro ao enviar delivery ao Backlog.');
							})
						})

						.catch((err) => {
							arOcorre.push('Erro ao gerar asn delete.');
						})

				})

				.catch((err) => {
					arOcorre.push('Erro ao cancelar carga.');
				})
				
			} else {
				arOcorre.push('A carga não pode ser cancelada. Verifique a etapa da(s) delivery(ies).');
			}

			if (arOcorre.length == 0) {

				cdStatus = 200;
				await objConn.close();
	
			} else {
				
				await objConn.closeRollback();
	
			}			
			
		}

		res.status(cdStatus).send({ arOcorre });
	}

	/**
   * @description Atualiza o status que indica o envio da ASN
   *
   * @async
   * @function updateStatusASN   
   * @param {Object} req Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires config/ControllerBD~getConnection
   * @requires config/ControllerBD~setConnection
   * @requires modIntegrador/dao/CargasDAO~updateStatusASN
   * 
   * @author Yusha Mariak Miranda Silva
   * @since 03/2018
  */
	api.updateStatusASN = async function (req, res, next) {

		var objConn = await dao.controller.getConnection();

		await dao.controller.setConnection(objConn);
		req.objConn = objConn;
		
		await dao.updateStatusASN(req, res, next)
			.then((result) => {
				objConn.close();

				res.status(200).send("Status atualizado com sucesso");
			})
			.catch((err) => {
				next(err);
			});
	};

	api.selecAlteraStEtapaDelivery = async function (req, res, next) {
		return await deliveryDAO.getEtapaDelivery(req, res, next)
			.then((result) => {
				return result;
			}).catch((err) => {
				return false;
			})
	}

	api.cancelarDeliveryCarga = async function (req, res, next) {
		return await deliveryDAO.cancelarDelivery(req, res, next)
			.then((result) => {
				return result;
			}).catch((err) => {
				return false;
			})
	}

	api.cargaFracionada = async function (req, res, next) {
		await dao.cargaFracionada(req, res, next)
			.then((result) => {
				res.status(200).send(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	api.envLog = async function (req, res, next) {
		await dao.envLog(req, res, next)
			.then((result) => {
				res.status(200).send(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	api.buscarMilestone = async function (req, res, next) {
		await dao.buscarMilestone(req, res, next)
			.then((result) => {
				res.status(200).send(result);
			})
			.catch((err) => {
				next(err);
			});
	};

	api.countCargaNotaPorDelivery = async function (parms) {
		return await dao.countCargaNotaPorDelivery(parms)
		  .then((result) => {
			return result;
		  })
		  .catch((err) => {
			next(err);
		  });
	  }

	  api.countCargaNotaPorIdDelivery = async function (parms) {
		return await dao.countCargaNotaPorIdDelivery(parms)
		  .then((result) => {
			return result;
		  })
		  .catch((err) => {
			next(err);
		  });
	  }

	  api.cargaPorIdDelivery = async function (parms) {
		return await dao.cargaPorIdDelivery(parms)
		  .then((result) => {
			return result;
		  })
		  .catch((err) => {
			next(err);
		  });
	  }

	  
	return api;
};
