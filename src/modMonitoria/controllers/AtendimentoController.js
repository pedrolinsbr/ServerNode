module.exports = function (app) {

	var api = {};
	var dao = app.src.modMonitoria.dao.AtendimentoDAO;
	var email = app.src.modMonitoria.controllers.EmailController;

	api.controller = app.config.ControllerBD;

	api.getIndicadoresEmAberto = async function (req, res, next) {
		await dao.getIndicadoresEmAberto(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getTiposDeAcao = async function (req, res, next) {
		await dao.getTiposDeAcao(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getMovimentacoesAtendimento = async function (req, res, next) {
		await dao.getMovimentacoesAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getAllMotivos = async function (req, res, next) {
		await dao.getAllMotivos(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listar = async function (req, res, next) {
		await dao.listar(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarMovimentacao = async function (req, res, next) {
		let result = await dao.salvarMovimentacao(req, res, next)
			.then((result1) => {
				return result1;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		//O código abaixo ocorre caso haja encaminhamento para outro usuário, para este tipo de email não há anexos
		if (req.body.IDS001DE != '' && req.body.IDS001DE != null) {
			let dataEmail = await dao.getEmailUsuario(req, res, next)
				.then((result1) => {
					return result1;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					next(err);
				});

			if (dataEmail.DSEMALOG != '' && dataEmail.DSEMALOG != null) {
				await email.sendEmailAtendimento(req.body.IDA001, dataEmail.DSEMALOG, req.headers.origin, req.UserId);
			}
		}

		res.json(result);
	};

	api.salvarEditaMovimentacao = async function (req, res, next) {
		await dao.salvarEditaMovimentacao(req, res, next)
			.then((result1) => {
				res.json(result1) ;
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	}

	api.listarByNfe = async function (req, res, next) {
		await dao.listarByNfe(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarRelatorioAtendimento = async function (req, res, next) {
		await dao.listarRelatorioAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarRelatorioPerformance = async function (req, res, next) {
		await dao.listarRelatorioPerformance(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarRelatorioAlteracaoDatas = async function (req, res, next) {
		await dao.listarRelatorioAlteracaoDatas(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarMovNotificacoes = async function (req, res, next) {
		await dao.listarMovNotificacoes(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getInformacoesAtendimento = async function (req, res, next) {
		await dao.getInformacoesAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getAtendentesCockpit = async function (req, res, next) {
		await dao.getAtendentesCockpit(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getClientesCockpit = async function (req, res, next) {
		await dao.getClientesCockpit(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarNovoAtendimento = async function (req, res, next) {
		let result = await dao.salvarNovoAtendimento(req, res, next)
			.then((result1) => {
				return result1;
			})
			.catch((err) => {
				console.log('[ERROR] - ', err);
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});

		if (req.body.IDS001DE != '' && req.body.IDS001DE != null && result != null && result != undefined  ) {
			let dataEmail = await dao.getEmailUsuario(req, res, next)
				.then((result1) => {
					return result1;
				})
				.catch((err) => {
					err.stack = new Error().stack + `\r\n` + err.stack;
					next(err);
				});

			if (dataEmail.DSEMALOG != '' && dataEmail.DSEMALOG != null) {
				let atendimento = {
					idAtendimento: result,
					CDCTRC: req.body.CDCTRC,
					NRNOTA: req.body.NRNOTA
				}
				await email.sendEmailAtendimento(atendimento, dataEmail.DSEMALOG, req.headers.origin, req.UserId);
			}
		}
		res.json(result);
	};

	api.salvarFinalizarNovoAtendimento = async function (req, res, next) {
		await dao.salvarFinalizarNovoAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getDashboardAtendimentoPorAtendente = async function (req, res, next) {
		await dao.getDashboardAtendimentoPorAtendente(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getDashboardTempoAtendimento = async function (req, res, next) {
		await dao.getDashboardTempoAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getDashboardAbertoXFinalizado = async function (req, res, next) {
		await dao.getDashboardAbertoXFinalizado(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getDashboardSituacaoAtendimento = async function (req, res, next) {
		await dao.getDashboardSituacaoAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarAvaliacoesPesquisa = async function (req, res, next) {
		await dao.listarAvaliacoesPesquisa(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getDashboardAcaoXMotivo = async function (req, res, next) {
		await dao.getDashboardAcaoXMotivo(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.uploadFileOC = async function (req, res, next) {
		let con = await this.controller.getConnection(null, req.UserId);

		var arFiles = [];
		var extentions = new Array(".jpg", ".png", ".xml", ".pdf", ".docx", ".xls",".xlsx",".doc",".txt",".eml");
		var allow = 0;
		let sql;
		let count = 0;
		let buffers = [];
		let nomes = [];

		//O NMGRUPOC é necessário para o envio do email, ele vem do front como string, aqui ele se torna novamente um objetivo
		if(req.body.NMGRUPOC){
			req.body.NMGRUPOC = JSON.parse(req.body.NMGRUPOC);
		}
		

	
		for (let arq of req.files) {
			var extentionFile = ((arq.originalname).substring((arq.originalname).lastIndexOf("."))).toLowerCase();

			for (let i = 0; i < extentions.length; i++) {
				if (extentionFile == extentions[i]) {
					allow = 1;
				}
			}
			if (allow == 1) {
				var nomeFile = arq.originalname;
				var contentFile = arq.mimetype;
				var buf = Buffer.from(arq.buffer);
				arFiles.push(arq.originalname);

				//Monta os arrays dos anexos
				buffers.push(arq.buffer);
				nomes.push(nomeFile);
				
				
				
				//Se não existir IDA003, significa que é um novo atendimento, caso contrário é movimentação
				if(!req.body.IDA003){
					sql = `INSERT INTO A004 (IDA003,NMANEXO,TPEXTENS,TPCONTEN,AQANEXO) VALUES ((Select IDA003 from A003 Where IDA001 =  `+ req.body.IDA001 +` ), '${nomeFile}', '${extentionFile}', '${contentFile}', :text)`
				}else{
					sql = `INSERT INTO A004 (IDA003,NMANEXO,TPEXTENS,TPCONTEN,AQANEXO) VALUES (${req.body.IDA003}, '${nomeFile}', '${extentionFile}', '${contentFile}', :text)`
				}				

				try{

					let result = await con.execute(
						{
						  sql,
						  param: {
							  text: buf
						  },
						})
						.then(async(result) => {

							
							
							count++;
							//Quando todos os anexos forem inseridos, o array deles vai para a próxima fase, onde começa o processo de criação do atendimento e do email
							if(req.files && req.body.NMGRUPOC){
								if(count >= req.files.length){
									await dao.enviarAtendimento(req.body.NMGRUPOC, con, req.UserId, req.body.IDA001, req.body.IDG043, req.body.SNFINALIZA, req.headers.origin, buffers, nomes);
									res.status(200).send(arFiles);
								
								}
							}
													  
						})
						.catch((err) => {
						  err.stack = new Error().stack + `\r\n` + err.stack;
						  throw err;
						});
						await con.close();

				}catch (err) {
					await con.closeRollback();

					if(req.body.IDA001){
						await dao.deleteAtendimento(req, res, next);
					}else{
						await dao.deleteMovimentacao(req, res, next);
					}

					err.stack = new Error().stack + `\r\n` + err.stack;
					res.status(400).send({ msg: 'Erro no processo '});
					throw err;
				}
				
			}else{
				res.status(400).send({ msg: 'Extensões inválidas '});

				if(req.body.IDA001){
					await dao.deleteAtendimento(req, res, next);
				}else{
					await dao.deleteMovimentacao(req, res, next);
				}

				break;
			}

		}

	}

	api.visualizarAnexo = async function (req, res, next) {
		
		await dao.visualizarAnexo(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.downloadAnexo = async function (req, res, next) {
		
		await dao.downloadAnexo(req, res, next);
	};

	api.salvarFinalizarNovoAtendimentoReasonCode = async function (req, res, next) {
		await dao.salvarFinalizarNovoAtendimentoReasonCode(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getAllMotivos4PL = async function (req, res, next) {
		await dao.getAllMotivos4PL(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarFinalizarNovoAtendimentoRecusa = async function (req, res, next) {
		await dao.salvarFinalizarNovoAtendimentoRecusa(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarFinalizarNovoAtendimentoMotivoQM = async function (req, res, next) {
		await dao.salvarFinalizarNovoAtendimentoMotivoQM(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.buscaUltimoMotivo = async function (req, res, next) {
		await dao.buscaUltimoMotivo(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarEnvioRastreio = async function (req, res, next) {
		await dao.listarEnvioRastreio(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.removeAtendimento = async function (req, res, next) {
		await dao.removeAtendimento(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarGrupos = async function (req, res, next) {
		await dao.listarGrupos(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarGrupo = async function (req, res, next) {
		await dao.salvarGrupo(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.removerGrupo = async function (req, res, next) {
		await dao.removerGrupo(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.inserirContatoAtendimento = async function (req, res, next) {
    await dao.inserirContatoAtendimento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
	};
	
	api.buscaInfoContatoAtendimento = async function (req, res, next) {
    await dao.buscaInfoContatoAtendimento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
	};
	
	api.listarContatosAtendimento = async function (req, res, next) {

    await dao.listarContatosAtendimento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

	};
	
	api.alterarContatoAtendimento = async function (req, res, next) {
    await dao.alterarContatoAtendimento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
	};
	
	api.cancelarRecusa = async function (req, res, next) {
    await dao.cancelarRecusa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
	};
	
	api.listarVinculoAtendentes = async function (req, res, next) {

    await dao.listarVinculoAtendentes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

	};

	api.vinculaAtendente = async function (req, res, next) {

    await dao.vinculaAtendente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

	};

	api.removerVinculoAtend = async function (req, res, next) {

    await dao.removerVinculoAtend(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });

	};

	api.getAtendentesCockpitConfig = async function (req, res, next) {
		await dao.getAtendentesCockpitConfig(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarAtendimentoDataCanhot = async function (req, res, next) {
		await dao.salvarAtendimentoDataCanhot(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listarTransferencia = async function (req, res, next) {
		await dao.listarTransferencia(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.fluxoTransportadora = async function (req, res, next) {
		await dao.fluxoTransportadora(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.buscaManterSla = async function (req, res, next) {
		await dao.buscaManterSla(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.salvarRemocaoEntrega = async function (req, res, next) {
		await dao.salvarRemocaoEntrega(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getDashboardsNps = async function (req, res, next) {
		let entregas = await dao.getEntregas(req, res, next);
		let npsPorFilial = await dao.npsPorFilial(req, res, next);
		 await dao.getDashboardsNps(req, res, next)
			 .then((result1) => {

				 let result = { nps: {}, npsFilial: {} };
				
				 result.nps.data = result1; // ARRAY TOTAL DA RESPOSTA NPS

				 result.nps.total = result1.length; //TOTAL NPS
	
				 result.nps.detratores = result1.filter(d => { return d.NOTA < 7 }).length; //TOTAL DE DETRATORES ( NOTA < 7)
				 
				 result.nps.detratoresPerc = parseFloat(((result.nps.detratores / result.nps.total) * 100).toFixed(2)); //PERCENTUAL DE DETRATORES

				 result.nps.neutros = result1.filter(d => { return d.NOTA == 7 || d.NOTA == 8 }).length; //TOTAL DE NEUTROS (NOTA = 7 ou NOTA = 8)
				 
				 result.nps.neutrosPerc = parseFloat(((result.nps.neutros / result.nps.total) * 100).toFixed(2)); //PERCENTUAL DE NEUTROS
	
				 result.nps.promotores = result1.filter(d => { return d.NOTA > 8 }).length; //TOTAL DE PROMOTORES (NOTA > 8)
				 
				 result.nps.promotoresPerc = parseFloat(((result.nps.promotores / result.nps.total) * 100).toFixed(2)); //PERCENTUAL DE PROMOTORES
	
				 result.nps.valor = (result.nps.total != 0) ? Math.round(((result.nps.promotores / result.nps.total) - (result.nps.detratores / result.nps.total)) * 100) : 0;//CALCULO NPS
	
				 result.nps.npsVsEntregue = parseFloat(((result.nps.total / entregas[0].ENTREGAS) * 100).toFixed(2)); //NPS VS ENTREGUES 

				 result.nps.totalEntregas = entregas[0].ENTREGAS;

				 let somaNotas = 0;
				 result.nps.qtdComent = 0;

				 if (result.nps.total != 0) {
					result1.forEach(d => {
						somaNotas += d.NOTA; 
						result.nps.qtdComent += d.DSCOMENT != null ? 1 : 0; 
					});
					 
					result.nps.mediaNotas = (somaNotas / result.nps.total).toFixed(2);
				 } else {
					 result.nps.mediaNotas = 0;
					 result.nps.qtdComent = 0;
				 }

				 result.npsFilial.data = npsPorFilial;
				 result.npsFilial.valuesDashboard = [];

				 if (npsPorFilial && npsPorFilial.length > 0) {
					 	result.npsFilial.data.forEach(d => {
							d.VALORNPS = (d.TOTAL != 0) ? Math.round(((d.PROMOTORES / d.TOTAL) - (d.DETRATORES / d.TOTAL)) * 100) : 0;
							result.npsFilial.valuesDashboard.push({name: d.NMTRANSP, value: (d.TOTAL != 0 && (Math.round(((d.PROMOTORES / d.TOTAL) - (d.DETRATORES / d.TOTAL)) * 100)) > 0 ) ? Math.round(((d.PROMOTORES / d.TOTAL) - (d.DETRATORES / d.TOTAL)) * 100) : 0 });
						});
				 } else {
					 result.npsFilial.data = [];
					 result.npsFilial.valuesDashboard.push({name: '', value: 0});
				 }
				 
				 res.json(result);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.getRelatorioAg = async function (req, res, next) {
		await dao.getRelatorioAg(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listNpsByClient = async function (req, res, next) {
		await dao.listNpsByClient(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listaStEmail = async function (req, res, next) {
		await dao.listaStEmail(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	api.listRastreioByClient = async function (req, res, next) {
		await dao.listRastreioByClient(req, res, next)
			.then((result1) => {
				res.json(result1);
			})
			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				next(err);
			});
	};

	return api;
};
