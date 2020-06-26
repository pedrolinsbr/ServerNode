module.exports = function (app, cb) {

	//SOAP
	var soap = require('soap');	

	var auth = "Basic " + Buffer.from(process.env.SAP_BRAVO_USER + ":" + process.env.SAP_BRAVO_PASS).toString("base64");

	var authSyn = "Basic " + Buffer.from(process.env.SAP_SYN_USER + ":" + process.env.SAP_SYN_PASS).toString("base64");

	const soapRequest = require('easy-soap-request');
	const fs = require('fs');

	const tmz     		= app.src.utils.DataAtual;

	
	var api = {};

	api.criarReservaSaldoSap = async function (args, res, next) {
		var url;
		var tpProces = args.TPPROCES
		delete args.TPPROCES

		if(tpProces == "O"){
			var url = process.env.SAP_BRAVO_URL_REMESSA;
		} else {
			var url = process.env.SAP_BRAVO_URL_RECEBIMENTO;
		}

		return await soap.createClientAsync(url, { wsdl_headers: { Authorization: auth } }).then(
			async (client) => {
				client.setSecurity(new soap.BasicAuthSecurity(process.env.SAP_BRAVO_USER, process.env.SAP_BRAVO_PASS));

				if (tpProces == "O") {

					client.setEndpoint(process.env.SAP_BRAVO_ENDPOINT_REMESSA);

					return await client.ZmfCriarEntregaSrAsync(args).then((result) => {
						return result[0];
					}).catch(e=>{
						console.log(e); // response error
					});
				} else {

					client.setEndpoint(process.env.SAP_BRAVO_ENDPOINT_RECEBIMENTO);

					return await client.ZmfCriarRecebimentoAsync(args).then((result) => {
						return result[0];
					})
				}
			}).catch(e=>{
				console.log(e); // response error
			});
	}

	//-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-\\

	api.criarDtSap = async function (args, res, next) {

		return await soap.createClientAsync(process.env.SAP_BRAVO_URL_DT, { wsdl_headers: { Authorization: auth } }).then(
			async (client) => {
				client.setSecurity(new soap.BasicAuthSecurity(process.env.SAP_BRAVO_USER, process.env.SAP_BRAVO_PASS));

				client.setEndpoint(process.env.SAP_BRAVO_ENDPOINT_DT);

				return await client.ZmfCriarTransporteAsync(args).then((result) => {
					return result[0];
				}).catch(e=>{
					console.log(e); // response error
				});

			})
	}

	//-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-\\

	api.criarTpSap = async function (args, res, next) {

		return await soap.createClientAsync(process.env.SAP_BRAVO_URL_TP, { wsdl_headers: { Authorization: auth } }).then(
			async (client) => {
				client.setSecurity(new soap.BasicAuthSecurity(process.env.SAP_BRAVO_USER, process.env.SAP_BRAVO_PASS));

				client.setEndpoint(process.env.SAP_BRAVO_ENDPOINT_TP);

				return await client.ZmfMudarEstoqueAsync(args).then((result) => {
					return result[0];
				}).catch(e=>{
					console.log(e); // response error
				});

			})
	}

	//-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-\\

	api.enviarMilestones = async function (args, res, next) {

		// example data
		const url = process.env.SAP_URL_SYN;
		const wsdl_headers = {
			'user-agent': 'sampleTest',
			'Content-Type': 'text/xml;charset=UTF-8',
			'soapAction': 'invokeAsync',
			'Authorization': authSyn
		};

		 await soapRequest({ url: url, headers: wsdl_headers, xml: args.xml, timeout: 5000}).then(result => {
			console.log(`CERTO`); //response success
			fs.writeFileSync(`${process.env.FOLDER_WHMS}logs/${args.CDDELIVE}-${tmz.tempoAtual('YYYYMMDDHHmmss')}.txt`, 'CERTO');


		 }).catch(e=>{
		 console.log(e); // response error
		 fs.writeFileSync(`${process.env.FOLDER_WHMS}logs/${args.CDDELIVE}-${tmz.tempoAtual('YYYYMMDDHHmmss')}.txt`, e);


		 })
		
	}


		//-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-\\

		api.enviarPGR = async function (args, res, next) {

			// example data
			const url = process.env.SAP_URL_SYN_PGR;
			const wsdl_headers = {
				'user-agent': 'sampleTest',
				'Content-Type': 'text/xml;charset=UTF-8',
				'soapAction': 'invokeAsync',
				'Authorization': authSyn
			};
	
			 await soapRequest({ url: url, headers: wsdl_headers, xml: args.xml, timeout: 5000}).then(result => {
				console.log(`CERTO`); //response success
				fs.writeFileSync(`${process.env.FOLDER_WHMS}logs/PGR-${args.CDDELIVE}-${tmz.tempoAtual('YYYYMMDDHHmmss')}.txt`, 'CERTO');

				
			 }).catch(e=>{
				 console.log(e); // response error
				 fs.writeFileSync(`${process.env.FOLDER_WHMS}logs/PGR-${args.CDDELIVE}-${tmz.tempoAtual('YYYYMMDDHHmmss')}.txt`,e);
			 
			 })
			
		}




	//-=-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-==-=-=-=-=-=-=-=-\\

	api.enviarInventario = async function (args, res, next) {

		// example data
		const url = process.env.SAP_URL_SYN_INVENTARIO;
		const wsdl_headers = {
		'user-agent': 'sampleTest',
		'Content-Type': 'text/xml;charset=UTF-8',
		'soapAction': 'invokeAsync',
		'Authorization': authSyn


		};
		//const xml = fs.readFileSync('../xml/warehouse/milestones/GRB/1.xml', 'utf-8');

			await soapRequest({ url: url, headers: wsdl_headers, xml: args, timeout: 50000}).then(result => {
		//	console.log(result);
			}).catch(e=>{
		//	 console.log(e);
			})
		
	}


	api.enviarMilestones1 = async function (args, res, next) {

				ZXDELVRY07_WH= {
					Idoc: {
						EDI_DC40: '', 
						E1EDL20: {
							VBELN: '0085387495',
							E1EDT13: {
								QUALF: 'GRL',
								NTANF: '20191015',
								NTANZ: '094856',
								TZONE_BEG: 'BRAZIL'
							}
						}
					}
				}

		

		return await soap.createClientAsync(process.env.SAP_URL_SYN, { wsdl_headers: { Authorization: authSyn } }).then(
			async (client) => {
				client.setSecurity(new soap.BasicAuthSecurity(process.env.SAP_SYN_USER, process.env.SAP_SYN_PASS));

				//client.setEndpoint(process.env.SAP_BRAVO_ENDPOINT_DT);

				return await client.invokeAsync(ZXDELVRY07_WH).then((result) => {
					console.log(result)
					return result[0];
				});

			}).catch(error =>{
				console.log(error);
			})
	}

	return api;

}