module.exports = function (app, cb) {
	var api = {};
	var dao = app.src.modDashboard.dao.PibOferecimentoDAO;


	api.listaCargas = async function (req, res, next) {


		try {

			var arRS = await dao.listaCargas(req, res, next);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ err, message: err.message });

		}


	}

	api.buscarIndicadoresOferecimento = async function (req, res, next) {

		try {

			var retorno = {};

			req.objConn = await dao.controller.getConnection(null, req.UserId);

			req.sqlACL = await dao.getACL(req);

			retorno.qualidade = await dao.buscarQualidadeOferecimento(req, res, next); //FAZ UMA BUSCA PARA PESQUISA A QUALIDADE DO OFERECIMENTO(FTL E LTL)

			var veiculos = await dao.buscarVeiculos(req, res, next); //BUSCA VEICULOS COM SEU PERCENTUAL E OCUPACAO MEDIA

			retorno.veiculos = api.classeVeiculos(veiculos);

			retorno.oferecimentos = await dao.totalOferecimentosGrupo(req, res, next); //DIVIDI OS OFERECIMENTOS PELA QUANTIDADE DE VEZES QUE FOI OFERECIDO

			var status = await dao.buscarStatus(req, res, next);// PESQUISA POR CADA STATUS DE OFERECIMENTO

			await req.objConn.close();

			var objTotais =  { TTSTATUS: 0, TTHORA1: 0, TTHORA2:0, TTHORAM:	0 };

			retorno.status = [
				{ STCARGA: 'B', DSSTACAR: 'BACKLOG' 		 },
				{ STCARGA: 'P', DSSTACAR: 'PRÉ-APROVAÇÃO' 	 },
				{ STCARGA: 'R', DSSTACAR: 'DISTRIBUIDAS' 	 },
				{ STCARGA: 'O', DSSTACAR: 'OFERECIDAS' 		 },
				{ STCARGA: 'X', DSSTACAR: 'RECUSADAS' 		 },
				{ STCARGA: 'A', DSSTACAR: 'ACEITAS' 		 },
				{ STCARGA: 'S', DSSTACAR: 'AGENDADAS' 		 }
			];

			for (var j of retorno.status) {

				j = Object.assign(j, objTotais);

				for (var i of status) {

					if (i.STCARGA == j.STCARGA) {
						j.TTSTATUS = i.TTSTATUS;
						j.TTHORA1  = i.TTHORA1;
						j.TTHORA2  = i.TTHORA2;
						j.TTHORAM  = i.TTHORAM;
						break;
					}

				}

			}

			res.status(200).send(retorno);

		} catch (err) {

			res.status(500).send({ err, message: `Erro ao buscar dados!` });

		};

	};

	//-----------------------------------------------------------------------\\

	api.classeVeiculos = function (arVeiculos) {

		try {

			var arTipo = ['LEVE', 'TOCO', 'TRUCK', 'BI-TRUCK', 'CARRETA', 'VANDERLEIA', 'BI-TREM', 'RODOTREM', 'OUTROS'];
			var objZero = { PCTIPCAR: 0, MDOCUPAC: 0, TTCARVEI: 0, QTTIPVEI: 0 };

			var arResp = [];
			var i = 0;

			arTipo.forEach(a => { arResp.push(Object.assign({ DSTIPVEI: a }, objZero)) });

			for (objVeiculo of arVeiculos) {

				switch (objVeiculo.QTCAPPES) {
					//case 31:
					case 4000:
						i = 0;
						break;

					//case 33: //TOCO
					//case 32:
					case 8000:
					case 9000:
						i = 1;
						break;

					//case 155: //TRUCK
					//case 34:
					case 14000:
						i = 2;
						break;

					//case 45: //BI-TRUCK
					case 18500:
						i = 3;
						break;

					//case 36: //CARRETA
					//case 37:
					//case 154:
					//case 38:
					//case 39:
					case 24000:
					case 25000:
					case 27000:
					case 30000:
						i = 4;
						break;

					//case 41: //VANDERLEIA
					//case 40:
					//case 153:
					//case 159:
					case 32000:
					case 34000:
						i = 5;
						break;

					//case 160: //BI-TREM
					case 37000:
						i = 6;
						break;

					//case 156: //RODOTREM
					//case 42:
					case 45000:
					case 48000:
						i = 7;
						break;

					default:
						i = 8;
						break;

				}

				arResp[i].PCTIPCAR += objVeiculo.PCTIPCAR;
				arResp[i].MDOCUPAC += objVeiculo.MDOCUPAC;
				arResp[i].TTCARVEI += objVeiculo.TTCARVEI;
				arResp[i].QTTIPVEI++;				

			}

			arResp.forEach(a => {
				if ((a.QTTIPVEI > 0) && (a.MDOCUPAC > 0)) a.MDOCUPAC /= a.QTTIPVEI; 
			});

			return arResp;

		} catch (err) {

			throw err;

		}

	}

	api.buscarListaStatus = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection(null, req.UserId);

			req.sqlACL = await dao.getACL(req);

			var arRS = await dao.totalOferecimentosLista(req, res, next);

			await req.objConn.close();

			res.status(200).send(arRS);

		} catch (err) {

			res.status(500).send({ err, message: `Erro ao buscar dados!` });

		}

	}

	//-----------------------------------------------------------------------\\

	return api;
}