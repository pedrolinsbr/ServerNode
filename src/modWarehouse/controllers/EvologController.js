module.exports = function (app, cb) {

	const utilCA  = app.src.utils.ConversorArquivos;
	const utilDir = app.src.utils.Diretorio;
	const tmz     = app.src.utils.DataAtual;
	const dao 	  = app.src.modWarehouse.dao.CockpitDAO;

	const utilsWare 	= app.src.utils.Warehouse;

	const strDirWHMS   = process.env.FOLDER_WHMS;
	const strDirUpload = process.env.FOLDER_UPLOAD;

	//SOAP
	var soap = require('soap');

	var api = {};


	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.importarDelivery = async function (req, res, next) {

		req.objConn = await dao.controller.getConnection();

		var rs = await dao.buscarDelivery(req, res, next);

		/*
		if (rs.length > 0) {
			await dao.updateDelivery(req, res, next);
		} else {
			await dao.inserirDelivery(req, res, next);
		}
		*/

		await req.objConn.close();		
		
	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.inserirPreAsn = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var buscarCarga = await dao.buscarCarga(req, res, next);

			var erro = '';
			var blOk = (buscarCarga.length > 0);

			if (blOk) {

				req.carga = buscarCarga[0];

				var inserirCarga = await dao.inserirCarga(req, res, next);

				blOk = (buscarCarga.length > 0);

				if (blOk) {

					req.body.IDW002 = inserirCarga.id;
					await dao.inserirDeliveries(req, res, next);

				} else {

					erro = "Erro ao inserir a carga";

				}

			} else {

				erro = "Delivery não encontrada";

			}

			await req.objConn.close();

			if (blOk) {
				res.status(200).send({ message: "Pré ASN inserido com sucesso!" });
			} else {
				res.status(500).send({ message: erro });

			}

		} catch (err) {

			await req.objConn.closeRollback();
			res.status(500).send({ message: "Erro" });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.trocarStatus = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			await dao.trocarStatus(req, res, next);

			await req.objConn.close();

			req.body.STWARE = parseInt(req.body.STWARE);

			switch (req.body.STWARE) {

				case 5:
				case 6:
					req.body.tipo = (req.body.STWARE == 5) ? 'GRB' : 'GRL';
					await api.salvarMilestones(req, res, next);
					var strMsg = 'Status alterado com sucesso';
					var cdStatus = 200;
					break;


				default:
					var cdStatus = 400;
					var strMsg   = 'Tipo de MS inválido';
					break;

			}

			res.status(cdStatus).send({ message: strMsg });

		} catch (err) {

			res.status(500).send({ message: err.message });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.detalhesDelivery = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var result = await dao.detalhesDelivery(req, res, next);
			result[0].itens = [];

			var itens = await dao.itensDelivery(req, res, next);

			result[0].itens.push(itens);

			res.status(200).send(result);

		} catch (err) {

			res.status(500).send({ message: `Erro ao buscar dados da Delivery` });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.mapaDelivery = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var itens = await dao.mapaDelivery(req, res, next);

			await req.objConn.close();

			res.status(200).send(itens);

		} catch (err) {

			res.status(500).send({ message: `Erro ao buscar dados da Delivery` });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.updateTransp = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var result = await dao.updateTransp(req, res, next);

			await req.objConn.close();

			res.status(200).send(result);

		} catch (err) {

			res.status(500).send({ message: `Erro ao buscar dados da Delivery` });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.updateItens = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			await dao.updateItens(req, res, next);

			await dao.updateLote(req, res, next);

			await req.objConn.close();

			res.send({ message: 'ok' });

		} catch (err) {

			res.status(500).send({ message: err.message });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.reservarSaldo = async function (req, res, next) {

		try {

			req.objConn = await dao.controller.getConnection();

			var deliveries = await dao.buscarNfs(req, res, next);

			var arDeliveries = [];
			for (var d of deliveries){
				var incluirCabec = true;
				var incluirItem  = false;
				for( var i of arDeliveries){
					
					if(d.IDW002 == i.IDW002){
						incluirCabec = false;
						incluirItem = true;
					}

					if(incluirItem){
						i.args.ItItemReceb.item.push(i)
						incluirItem = false;
					}
				} //fim for i

				if(incluirCabec){
					var args = {
						IsCabecReceb:{},
						ItItemReceb:{}
					};
			
					//header
					args.IsCabecReceb.Rfbel			=	d.RFBEL;
					args.IsCabecReceb.Lfart			=	d.LFART;
					args.IsCabecReceb.Lifex			=	d.LIFEX;
					args.IsCabecReceb.Stcd1			=	d.STCD1;
					args.IsCabecReceb.Lfdat			=	d.LFDAT;
					args.IsCabecReceb.TpEmissao		=	d.TPEMISSAO;
					args.IsCabecReceb.Route			=	d.ROUTE;

					args.ItItemReceb.item = []

					objItem = {}
					objItem = {
						Rfpos: d.RFPOS,
						Matnr: d.MATNR,
						Charg: d.CHARG,
						Vfdat: d.VFDAT,
						Hsdat: d.HSDAT,
						Lfimg: d.LFIMG,
						Vrkme: d.VRKME,
						VrkmeIso: d.VRKMEISO,
						Werks: d.WERKS,
						Lgort: d.LGORT,
						Insmk: d.INSMK,
						Kdauf: d.KDAUF,
						Kdpos: d.KDPOS,
						Netwr: d.NETWR,
						Waerk: d.WAERK
					}
					args.ItItemReceb.item.push(objItem);
					arDeliveries.push(args);

				} //fim incluirCabec
			}

			for( var r of arDeliveries){
				if(req.body.TPPROCES == 'I'){
					await api.criarRecebimentoSap(r, res, next)
				} else{
					await api.criarRecebimentoSap(r, res, next)
				}
			}

			//await dao.reservarSaldo(req, res, next);

			await req.objConn.close();

			res.status(200).send({ message: 'ok' });

		} catch (err) {

			res.status(500).send({ message: err.message });

		}

	}

	//-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-\\

	api.salvarMilestones = async function (req, res, next) {

		try {

			var rs = await dao.buscarDocTransp(req, res, next);

			if (rs.length > 0) {

				var dtAtual  = tmz.tempoAtual('YYYYMMDDHHmmss');
				req.CDSHIPME = rs[0].CDSHIPME;
				var xml = api.gerarMilestones(req, res, next);

				await utilCA.salvarArquivo(`${strDirWHMS}${req.body.tipo}/WH-${req.CDSHIPME}-${dtAtual}.xml`, xml);

			}

		} catch (err) {

			throw err;

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.gerarMilestones = function (req, res, next) {

		try {

			switch (req.body.tipo) {

				case 'GRB':
					var strMS = 'Goods removed from bin';
					break;
	
				case 'GRL':
					var strMS = 'Goods ready for loading';
					break;
	
				case 'GRW':
					var strMS = 'Goods received at warehouse';
					break;
	
				default: 
					var strMS = '-';
					break;
	
			}

			var arDataHora = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss').split(' ');
	
			//----------------------------------------------------------------\\

			var strXML = `<?xml version="1.0" encoding="UTF-8" ?>\n`;
			strXML += `<delivery>\n`;
			strXML += `\t<deliveryNumber>${req.CDSHIPME}</deliveryNumber>\n`;
			strXML += `\t<milestoneCode>${req.body.tipo}</milestoneCode>\n`;
			strXML += `\t<milestoneDescription>${strMS}</milestoneDescription>\n`;
			strXML += `\t<date>${arDataHora[0]}</date>\n`;
			strXML += `\t<time>${arDataHora[1]}</time>\n`;
			strXML += `\t<timezone>${process.env.LOCAL_TIMEZONE}</timezone>\n`;
			strXML += `</delivery>`;

			return strXML;

		} catch (err) {

			throw err;

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.listarMilestones = async function (req, res, next) {

		try {

			var strTipo = req.body.tipo.toUpperCase();

			var arList = utilDir.listFiles(`${strDirWHMS}${strTipo}/`);

			var arFile = [];

			for (i of arList) {

				var objFile = {};

				objFile.CDDELIVE = i.filename.split('-')[0];
				objFile.FILENAME = i.filename;
				objFile.size = i.size;
				objFile.date = tmz.retornaData(i.birthtime, 'YYYY-MM-DD HH:mm:ss');

				arFile.push(objFile);

			}

			res.send(arFile);

		} catch (err) {

			res.status(500).send({ message: err.message  });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

	api.enviarMilestones = async function (req, res, next) {

		try {

			if ((Array.isArray(req.body.arFiles)) && (req.body.arFiles.length > 0)) {

				var destino = strDirUpload;
				var origem  = `${strDirWHMS}${req.body.tipo}/`;

				for (var i of req.body.arFiles) {
					utilDir.moveFile({ dirOrigem: origem, dirDestino: destino, nmArqOrigem: i });
				}

				var strMsg   = `${req.body.arFiles.length} arquivos movidos com sucesso`;
				var cdStatus = 200;

			} else {

				var strMsg = 'Nenhum arquivo a ser movido';
				var cdStatus = 400;

			}

			res.status(cdStatus).send({ message: strMsg });


		} catch (err) {

			res.status(500).send({ message: err.message });

		}

	}

	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\




	return api;

}