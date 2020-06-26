module.exports = function (app, cb) {

	const readCtrl = app.src.modPagFrete.controllers.DReaderController;
	const dao      = app.src.modPagFrete.dao.DocDAO;
	const mdlImp   = app.src.modPagFrete.models.ImportModel;
	const mdlCTe   = app.src.modPagFrete.models.CTeModel2;
	const utilsFMT = readCtrl.utilsFMT;
	const tmz 	   = dao.tmz;

	var api = {};

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista ocorrências na importação do documento XML
    * @function listOccurrence
    * @author Rafael Delfino Calzado
    * @since 21/11/2018
    *
	* @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */	
    //-----------------------------------------------------------------------\\

	api.listOccurrence = async function (req, res, next) {

		try {

			var arRS = await dao.listaOcorrencia(req);
			res.send(arRS);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}
	}

	//-----------------------------------------------------------------------\\
    /**
    * @description Lista arquivos para importação
    * @function listDocFiles
    * @author Rafael Delfino Calzado
    * @since 13/11/2018
    *
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\    

	api.listDocFiles = function (req, res, next) {

		try {

			var arFiles = readCtrl.listDocFiles();
			res.send(arFiles);

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

	}

	//-----------------------------------------------------------------------\\
    /**
    * @description Importa Documentos de Transporte
    * @function importDoc
    * @author Rafael Delfino Calzado
    * @since 14/06/2018
    *
    * @async
    * @returns {Array} Array com resultado do processo
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\    

	api.importDoc = async function (req, res, next) {

		try {

			req.setTimeout(300000);

			var arFiles    = (req.headers) ? readCtrl.listDocFiles() : req.body.arFiles;
			var arResOK    = [];
			var arResIssue = [];
			var objDoc     = {};
			var userId     = req.UserId || 1;

			var objConn = await dao.db.controller.getConnection(null, userId);

			var arComp3PL = await dao.buscaComponente(objConn);

			for (var objFile of arFiles) {

				objDoc = await api.refDoc(objFile, objConn);

				if (objDoc.arOccurrence.length == 0) {

					objDoc = api.relacionaComponente(objDoc, arComp3PL);
					objDoc = await api.saveDoc(objDoc, objConn);

				}
				
				await dao.removeOcorrencias(objDoc.NRCHADOC, objConn);

				if (objDoc.arOccurrence.length == 0) {
				
					arResOK.push(objFile.filename);

				} else {

					await dao.insereOcorrencias(objDoc, objConn);
					arResIssue.push(objFile.filename);

				}

			}

			await objConn.close();			

			var blOK = ((arResOK.length == arFiles.length) && (arFiles.length > 0));

			var objRes = { blOK, arResOK, arResIssue };

			if (req.headers)
				res.send(objRes);
			else
				return objRes;

		} catch (err) {

			if (req.headers)
				res.status(500).send({ error: err.message });
			else
				return false;

		}

	}

	//-----------------------------------------------------------------------\\    
    /**
    * @description Lê os atributos do XML e busca as referências de cadastro
    * @function refDoc
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @async
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\   

	api.refDoc = async function (objFile, objConn) {

		try {

			var objDoc = readCtrl.readXML(objFile);

			if (objDoc.arOccurrence.length == 0) 
				objDoc = await this.buscaCTe(objDoc, objConn);

			return objDoc;

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\    
    /**
    * @description Busca dados de CT-e previamente cadastrados
    * @function buscaCTe
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @async
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\  

	api.buscaCTe = async function (objDoc, objConn) { 
	
		try { 
	
			var parm = [objDoc.NRCHADOC, objDoc.NRCHAANT];
			var arRS = await dao.buscaCTe(parm, objConn);

			switch (arRS.length) {

				case 0:
					objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(3, 'NRCHAANT', `CT-e de referência ${objDoc.NRCHAANT} não foi encontrado`));
					break;

				case 1:
					if (arRS[0].NRCHADOC == objDoc.NRCHAANT) 
						objDoc.IDG051AN = arRS[0].IDG051;
					else
						objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(2, 'NRCHADOC', `CT-e ${objDoc.NRCHADOC} cadastrado sem CT-e de referência`));
					break;
			
				case 2:					
					var arID = (arRS[0].NRCHADOC == objDoc.NRCHAANT) ? ['IDG051AN', 'IDG051'] : ['IDG051', 'IDG051AN'];
					objDoc[arID[0]] = arRS[0].IDG051;
					objDoc[arID[1]] = arRS[1].IDG051;
					break;

			}

			if (objDoc.arOccurrence.length == 0) 
				objDoc = await this.buscaEmitente(objDoc, objConn);

			return objDoc;
	
		} catch (err) { 
	
			throw err; 
	
		} 
	
	} 
	
	//-----------------------------------------------------------------------\\    
    /**
    * @description Busca dados do emitente do CT-e
    * @function buscaEmitente
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @async
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.buscaEmitente = async function (objDoc, objConn) {

		try {

			var strPesq = `CJTRANSP: ${objDoc.CJEMITEN}, IETRANSP: ${objDoc.IEEMITEN}, CEP: ${objDoc.CPEMITEN}`;

			var arRS = await dao.buscaEmitente(objDoc, objConn);

			switch (arRS.length) {

				case 0:
					objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(3, 'IDG024', `Emitente ${objDoc.NMEMITEN} não encontrado (${strPesq})`));
					break;

				case 1:
					if (arRS[0].SNTRAINT == 1)
						objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(2, 'IDG024', 'CT-e interno'));
					else
						objDoc.IDG024 = arRS[0].IDG024;
					break;

				default:
					objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(2, 'IDG024', `Múltiplas ocorrências para o emitente ${objDoc.NMEMITEN}`));
					break;

			}

			if (objDoc.arOccurrence.length == 0) 
				objDoc = await this.buscaPessoas(objDoc, objConn);

			return objDoc;

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\    
    /**
    * @description Busca dados de Remetente, Destinatário, Tomador, etc.
    * @function buscaPessoa
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @async
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.buscaPessoas = async function (objDoc, objConn) {

		try {

			var arSearch = mdlImp.pessoas;
			var arRS     = [];
			var objCli   = {};
			var strPesq  = null;

			for (var a of arSearch) {

				objCli = {};

				for (var key of Object.keys(a.objSearch)) objCli[key] = objDoc[a.objSearch[key]];

				if (objCli.CJCLIENT) { //Tomador opcional

					strPesq = JSON.stringify(objCli).replace(/("|\}|\{)/g, '').replace(/\,/g, ', ');

					arRS = await dao.buscaPessoa(objCli, objConn);

					switch (arRS.length) {

						case 0:
							if (a.blMandatory) {						
								objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(3, a.nmPriField, `Os dados do ${a.nmPerson} não foram encontrados (${strPesq})`));
							} else {						
								objDoc[a.nmPriField] = objDoc[a.nmSecField];						
							}
							break;

						case 1:						
							objDoc[a.nmPriField] = arRS[0].IDG005;
							break;

						default:
							objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(2, a.nmPriField, `Múltiplas ocorrências para o ${a.nmPerson} (${strPesq})`));
							break;

					}

					if (objDoc.arOccurrence.length > 0) break;

				}

			}

			return objDoc;

		} catch (err) {

			throw err;

		}


	}

	//-----------------------------------------------------------------------\\    
    /**
    * @description Relaciona os componentes padrão cadastrados com os atributos 
	* encontrados no documento XML
	* 
    * @function relacionaComponente
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
	* 
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.relacionaComponente = function (objDoc, arComp3PL) {

		try {

			var arResult =[];
			var objComp  = 
				{
					VROUTROS: 0,
					VRFRETEV: 0,
					VRFRETEP: 0,
					VRPEDAGI: 0
				};

			for (var objC of objDoc.arComp) {
	
				arResult = arComp3PL.filter((a) => { 
					return ((a.IDG024 == objDoc.IDG024) &&
							(a.NMCOMVAR.toUpperCase() == objC.NMCOMPON.toUpperCase())) 
				});
	
				if (arResult.length == 1) 
					objComp[arResult[0].NMCOMPAD] = parseFloat(objC.VRCOMPON);
				else
					objComp.VROUTROS += parseFloat(objC.VRCOMPON);
				
			}
	
			return Object.assign(objDoc, objComp);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\    
    /**
    * @description Checa o objeto e salva os dados do documento
    * @function saveDoc
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @async
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
	//-----------------------------------------------------------------------\\ 

	api.saveDoc = async function (objDoc, objConn) {

		try {

			objDoc.IDG059   = objDoc.CFOP;
			objDoc.VRTOTPRE = objDoc.VRTOTFRE;
			objDoc.STCTRC   = (parseInt(objDoc.CDSTCTRC) == 100) ? 'A' : 'C';
			objDoc.DTLANCTO = tmz.dataAtualJS();

			var objVal = dao.db.checkSchema(objDoc, mdlCTe.G051.columns);

			if (objVal.blOK) {
				
				var parm = Object.assign(objVal.value, { objConn });

				var blUpd = objDoc.hasOwnProperty('IDG051');

				if (blUpd) {

					await dao.db.updateData(parm, mdlCTe.G051);

				} else {

					objDoc.IDG051 = await dao.db.insertData(parm, mdlCTe.G051);

				}
				
				parm = { IDG051AT: objDoc.IDG051, IDG051AN: objDoc.IDG051AN, objConn };

				if (blUpd) await dao.removeRelCTe(parm);

				await dao.db.insertData(parm, mdlCTe.G064);

			} else {

				objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(2, 'G051', objVal.error));

			}

			return objDoc;

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	return api;

}
