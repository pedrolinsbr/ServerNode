module.exports = function (app, cb) {

	var Excel = require('exceljs');
	var path = require('path');
	var fs = require('fs');
	const xls = require('xlsx');
	const gdao = app.src.modGlobal.dao.GenericDAO;
	const utilDir = app.src.utils.Diretorio;
	const utilFMT = app.src.utils.Formatador;
	const mdl = app.src.modTestes.models.tabelaPrecoModel;
	const dao = app.src.modTestes.dao.TabelaPrecoDAO;

	var api = {};

	api.editarTabelaFrete = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.editarTabelaFrete(req);
            res.send(arRS);
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
	} 

	api.addClientTranps = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.addClientTranps(req);
            res.send(arRS);
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
	} 

	api.listPrecoFrete = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listPrecoFrete(req);
            res.send(arRS);
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
	} 
	
	api.listClientTransp = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listClientTransp(req);
            res.send(arRS);
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
	} 
	
	api.listCidadeDestino = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.listCidadeDestino(req);
            res.send(arRS);
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
	} 
	
	api.removeClientTranspG088 = async function (req, res, next) { 
    
        try { 
    
            var arRS = await dao.removeClientTranspG088(req);
            res.send(arRS);
    
        } catch (err) { 
    
            res.status(500).send({ error: err.message });
    
        } 
    
    } 


	//---------------------------------------------\\

	api.readSheetFile = function (dir) {

		try {

			var path = ''; //'../../../';
			var file = `${path}../xml/tabela/tabela.xlsx`;
			var dirPath = dir ? dir : file;

			if (utilDir.existsPath(dirPath)) {

				var workbook = xls.readFile(dirPath);
				var worksheet = workbook.Sheets[workbook.SheetNames[0]];

				return xls.utils.sheet_to_json(worksheet, { header: 1 });

			} else {

				return false;

			}

		} catch (err) {

			throw err;

		}

	}

	//---------------------------------------------\\

	api.getStaticObj = function (arColStatic) {

		try {

			var objStatic = {};

			for (var i in arColStatic) objStatic[arColStatic[i]] = i;

			return objStatic;

		} catch (err) {

			throw err;

		}

	}

	//---------------------------------------------\\

	api.filterData = function (objStatic, a) {

		try {

			for (var key of Object.keys(objStatic)) {
				if (typeof (a[objStatic[key]]) == 'undefined') a[objStatic[key]] = null;
			}

			a[objStatic['DTINIVIG']] = new Date((a[objStatic['DTINIVIG']] - (25567 + 1)) * 86400 * 1000);
			a[objStatic['DTFIMVIG']] = new Date((a[objStatic['DTFIMVIG']] - (25567 + 1)) * 86400 * 1000);

			return a;

		} catch (err) {

			throw err;

		}

	}

	//---------------------------------------------\\

	api.insertData = async function (parm) {

		try {

			var model = mdl[parm.nmModel];

			var objVal = utilFMT.checaEsquema(parm, model.columns);

			if (objVal.blOK) {

				var objDados = utilFMT.setSchema(model, objVal.value);
				objDados.objConn = parm.objConn;

				await gdao.controller.setConnection(objDados.objConn);
				objVal.value[model.key[0]] = await gdao.inserir(objDados, null, null).then((result) => { return result.id });

			}

			return { blOK: objVal.blOK, strErro: objVal.strErro, value: objVal.value };

		} catch (err) {

			throw err;

		}

	}

	//---------------------------------------------\\

	api.parmIDG087 = async function (parm, iniMulti, arColsMulti, a) {

		try {

			var objVal = { blOK: true, strErro: null, value: null };
			var objMulti = {};

			var arNameMulti = [...new Set(arColsMulti)];

			for (var i in arColsMulti) {

				i = parseInt(i);

				for (var name of arNameMulti) {

					if (name == arColsMulti[i]) {

						objMulti[name] = a[i + iniMulti];

						if (typeof (objMulti[name]) == 'undefined') objMulti[name] = null;

						if (Object.keys(objMulti).length == arNameMulti.length) {

							parm.nmModel = 'G087';
							parm.IDG089 = objMulti.IDG089;
							parm.TPAPLICA = objMulti.TPAPLICA;
							parm.VRTABELA = objMulti.VRTABELA;
							parm.QTENTREG = objMulti.QTENTREG;

							objMulti = {};

							if (objVal.blOK) objVal = await api.insertData(parm);
							else break;

						}

					}

				}

			}

			return objVal;

		} catch (err) {

			throw err;

		}

	}

	//---------------------------------------------\\

	api.importPriceTable = async function (req, res, next) {

		try {
			var filePath = '';
			var files = req.files;
			for (const file of files) {
				const filename = new Date().getTime();
				filePath = path.resolve(`../xml/tabela/`, `${filename}.xlsx`);
				fs.writeFileSync(filePath, file.buffer);
				var arXLS = api.readSheetFile(filePath);
			}

			var objVal = {};
			objVal.blOK = Array.isArray(arXLS);

			if (objVal.blOK) {

				var blOnce = true;
				var iniVal = 2;
				var iniMulti = 20;

				var arCol = arXLS.slice(iniVal - 1, iniVal)[0];
				let rowValues = arXLS.slice(iniVal);
				var arVal = rowValues.filter(row => row.length > 0);

				var arColStatic = arCol.slice(0, iniMulti);
				var arColsMulti = arCol.slice(iniMulti);

				var objStatic = api.getStaticObj(arColStatic);

				var objConn = await gdao.controller.getConnection();
				var IDG085 = null;
				var IDG088 = null;
				for (var a of arVal) {
					var at = api.filterData(objStatic, a);

					var parm = { objConn, nmModel: 'G085' };

					parm.DSPREFRE = at[objStatic.DSPREFRE];
					parm.DTINIVIG = at[objStatic.DTINIVIG];
					parm.DTFIMVIG = at[objStatic.DTFIMVIG];
					parm.TPTABELA = at[objStatic.TPTABELA];
					parm.IDG014 = at[objStatic.IDG014];
					parm.IDG024 = at[objStatic.IDG024];

					if (blOnce) {
						objVal = await api.insertData(parm);
					}
					if (objVal.blOK) {
						if (blOnce) {
							parm.IDG085 = objVal.value.IDG085;
							IDG085 = parm.IDG085;
							parm.nmModel = 'G088';
							objVal = await api.insertData(parm);
							blOnce = false;
						} else {
							parm.IDG085 = IDG085;
						}
						if (objVal.blOK) {

							parm.IDG088 = objVal.value.IDG088;
							parm.IDG030 = at[objStatic.IDG030];
							parm.NRPESO = at[objStatic.NRPESO];
							parm.TPTRANSP = at[objStatic.TPTRANSP];
							parm.CDTARIFA = at[objStatic.CDTARIFA];
							parm.IDG003OR = at[objStatic.IDG003OR];
							parm.IDG003DE = at[objStatic.IDG003DE];
							parm.QTDIAENT = at[objStatic.QTDIAENT];
							parm.QTDIACOL = at[objStatic.QTDIACOL];
							parm.HOFINOTI = at[objStatic.HOFINOTI];
							parm.QTDIENLO = at[objStatic.QTDIENLO];
							parm.TPDIAS = at[objStatic.TPDIAS];

							parm.nmModel = 'G086';
							objVal = await api.insertData(parm);

							if (objVal.blOK) {
								parm.IDG086 = objVal.value.IDG086;
								objVal = await api.parmIDG087(parm, iniMulti, arColsMulti, at);
							}
						}
					}
					if (!objVal.blOK) break;
				}

				if (objVal.blOK) {
					fs.unlink(filePath, () => {
						console.log('planilha removida com sucesso!')
					});
					await objConn.close();
				} else
					await objConn.closeRollback();
			}
			var cdStatus = (objVal.blOK) ? 200 : 400;
			res.status(cdStatus).send(objVal);
		} catch (err) {
			res.status(500).send({ message: err.message });
		}
	}

	//---------------------------------------------\\

	return api;

}