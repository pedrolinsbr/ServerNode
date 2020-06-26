module.exports = function (app, cb) {

	const dirPDF     = process.env.FOLDER_CANHOTO_PDF;
	const dirUpload  = process.env.FOLDER_UPLOAD;
	const dirXML     = process.env.FOLDER_CANHOTO_XML;
	const podMaxSize = process.env.POD_MAX_SIZE || 307200;

	const utilsCA    = app.src.utils.ConversorArquivos;
	const utilsFMT   = app.src.utils.Formatador;
	const utilsDir   = app.src.utils.Diretorio;
	const tmz        = app.src.utils.DataAtual;
	
	const tpl        = app.src.modDocSyn.models.PODModel;
	const dao        = app.src.modDocSyn.dao.PODDAO;
	const nxt        = app.src.modDocSyn.dao.NextIdDAO;

    const mDoc       = app.src.modDocSyn.controllers.DocSaveController;

	var api = {};

	//-----------------------------------------------------------------------\\

	api.newPOD = async function (req, res, next) {

		try {

			var parm = { IDG043: req.params.id, IDS001: req.UserId };

			parm.objConn  = await nxt.controller.getConnection();
			var objResult = await api.generatePOD(parm, res, next);
			
			await parm.objConn.close();

			if (req.cronXml) {
				return objResult;
			} else {
				var cdStatus = (objResult.blOK) ? 200:400;			
				res.status(cdStatus).send(objResult);
			}

			

		} catch (err) {

			res.status(500).send(err);

		}

	}

	//-----------------------------------------------------------------------\\

	api.generatePOD = async function (req, res, next) {

		try {

			var blOK = false;
			var strPathPDF = `${dirPDF}${req.IDG043}.pdf`;
			var strMsg = null;

        	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

			if (utilsDir.existsPath(strPathPDF)) {

				var objFile = utilsDir.getFileStatus(strPathPDF);

				if (objFile.size < podMaxSize) {

					await nxt.controller.setConnection(req.objConn);

					var rs = await dao.buscaCanhoto(req, res, next);	
	
					if (rs.length > 0) {

						var objXML   = {};
						var parm     = {};						
						var strTime  = tmz.tempoAtual('YYYYMMDDHHmmss');	

						//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

						objXML.cdDelivery     = rs[0].CDDELIVE;
						objXML.shipmentNumber = utilsFMT.formataShipment({ idCarga: rs[0].IDG046, nrEtapa: rs[0].NRSEQETA });
						objXML.strBase64      = utilsCA.base64_encode(strPathPDF);
						objXML.strFileName	  = `BravoDocumentFolderInbound_DEL_${strTime}.xml`;
		
						//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

						parm.objConn  = req.objConn;
						parm.IDS001   = req.IDS001 || 1;
						parm.IDG043   = req.IDG043;
						parm.NMDOCUME = objXML.strFileName;
						parm.buffer   = tpl.getPODXML(objXML);

						utilsDir.saveFile(`${dirXML}${objXML.strFileName}`, parm.buffer); //Diretório provisório
		
						//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

						blOK = await this.checkHead(objXML.strFileName); 

						if (blOK) {

							var objResult = await this.savePODDoc(parm, res, next);

							if (objResult.blOK) {
			
								await nxt.controller.setConnection(req.objConn);
								
								await nxt.insereEventoDelivery({
									objConn:  req.objConn,
									IDG043:   req.IDG043,
									IDI001:   31,
									DTEVENTO: tmz.tempoAtual('YYYY-MM-DD HH:mm:ss')
								});
	
								strMsg = 'POD gerado com sucesso';	
	
							} else {
	
								strMsg = 'Erro ao digitalizar POD';
	
							}
										
							blOK = objResult.blOK;	

						} else {

							strMsg = 'Erro na estrutura do documento XML';
							await utilsDir.removeFiles([`${dirXML}${objXML.strFileName}`]); //apaga arquivo inválido

						}
						
						//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
						
					} else {
		
						strMsg = 'Registro não encontrado';
		
					}

				} else {

					strMsg = `Tamanho do arquivo excede o máximo permitido (${(podMaxSize / 1024).toFixed(0)} KB)`;

				}

			} else {

				strMsg = 'Arquivo não encontrado';

			}

        	//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
			
			return { blOK, strMsg };

		} catch (err) {

			throw err;

		}
		
	}

	//-----------------------------------------------------------------------\\

	api.checkHead = async function (filename) { 
	
		try { 

			var blOK = false;

			var re = /(?:<content>)(\S{100,})(?:<\/content>)/;
	
			var parm = {};
			parm.dirOrigem   = dirXML;
			parm.dirDestino  = dirUpload
			parm.nmArqOrigem = filename;

			if (utilsDir.existsPath(`${dirXML}${filename}`)) {

				var strBuff = utilsCA.lerArquivo(`${dirXML}${filename}`);

				blOK = (strBuff.substr(0, 16) == '<DocumentFolder>');

				if (blOK) {
					blOK = re.test(strBuff);
					//if (blOK) await utilsDir.copyFile(parm);
				}

			}

			return blOK;
	
		} catch (err) { 
	
			throw err; 
	
		} 
	
	} 
	
	//-----------------------------------------------------------------------\\

	api.copyPOD = async function (req, res, next) {

		try {

			var parm = {};
			parm.dirOrigem  = dirPDF;
			parm.dirDestino = parm.dirOrigem;
			
			parm.nmArqOrigem  = req.PODOrigem;
			parm.nmArqDestino = req.PODDestino;
	
			await utilsDir.copyFile(parm, res, next);	

		} catch (err) {

			throw err;
		}

	}

    //-----------------------------------------------------------------------\\

    api.savePODDoc = async function (req, res, next) { 
    
        try { 

            var parm = 
            {
                objConn:    req.objConn,                
                TPDOCUME:   'POD',
                DSMIMETP:   'application/xml',
                IDS001:     req.IDS001,                
                IDS007:     31, //G043
                PKS007:     req.IDG043,
                NMDOCUME:   req.NMDOCUME,
                buffer:     req.buffer
            };

            return await mDoc.saveDoc(parm, res, next);

        } catch (err) { 
    
            throw err; 
    
        } 
    
    }

	//-----------------------------------------------------------------------\\
	
	return api;

}
