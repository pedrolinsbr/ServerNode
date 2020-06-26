module.exports = function (app, cb) {

	'use strict';

	const dao = app.src.modOferecimento.dao.FreteDAO;
	const cdao = app.src.modOferecimento.dao.CargaDAO; //remover
	const mdl = app.src.modOferecimento.models.FreteModel;
	const tmz = app.src.utils.DataAtual;
	const db = dao.db;

	var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Calcula o frete das Cargas em Backlog do Oferecimento
     * @function calculaFrete
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.calculaFrete = async function (req, res, next) {

		try {

			var parm = { UserId: 1, params: {} };

			if (req.params) {

				parm = req;
				req.setTimeout(300000);

			}

			var objConn = await db.controller.getConnection(null, parm.UserId);

			var arBL = await dao.buscaBacklog(parm.params, objConn);

			var arVenda = [];
			var arCompra = [];
			var arOP = [];

			if (arBL.length > 0) {

				var arID = [...new Set(arBL.map(uk => uk.IDG046))];

				var parm2 = { objConn, post: { IDG046: arID }};

				var arRSRegra = await cdao.listaCargasDist(parm2, res, next);

				var arIDRegra = [...new Set(arRSRegra.map(uk => uk.IDO008))];

				var arRSPart = await dao.listaPartRegra({ objConn, IDO008: arIDRegra });

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

				await dao.removeTarifas({ IDG046: arID }, objConn);
				await dao.removeCotacoes({ IDG046: arID }, objConn);

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

				arOP = await dao.triagemOperacao(arID, objConn);
				arVenda = await api.cotacaoCliente(arOP, objConn);

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

				//arOP = api.agrupaOperacao(arID, arOP);
				arCompra = await api.cotacao3PL(arOP, arRSPart, objConn);

				//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

				var arIns = arVenda.concat(arCompra);

				await api.salvaCotacoes(arIns, objConn);

			}

			await objConn.close();

			var objRet = { ttVenda: arVenda.length, ttCompra: arCompra.length };

			if (req.headers)
				res.send(objRet);
			else
				return objRet;

		} catch (err) {

			if (req.headers)
				res.status(500).send({ error: err.message });
			else
				return err.message;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Sintetiza todos os registros por operação em um registro por carga
     * @function agrupaOperacao
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.agrupaOperacao = function (arID, arOP) {

		try {

			var arSoma = [];

			for (var id of arID) {

				var arFilter  = arOP.filter(a => { return a.IDG046 == id });
				var objFilter = Object.assign({}, arFilter[0]);
				delete objFilter.PCOCUPAC;
				delete objFilter.IDG014;

				arSoma.push(objFilter);

			}

			return arSoma;

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Rotina para cálculo da tabela de Frete a Receber por carga
     * @function cotacaoCliente
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
	 * @async
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.cotacaoCliente = async function (arOP, objConn) {

		try {

			var arRS = [...new Set(arOP.map(uk => uk.IDG046))];
			var arTF = [];

			var arCotacao  = [];
			var objCotacao = {};
			var objTarifa  = {};

			var parm = { TPFRETE: 'C' };

			//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

			while (arRS.length > 0) {

				parm.IDG046 = arRS[0];

				objCotacao =
				{
					IDG046: 	parm.IDG046,
					TPCOTACA:	parm.TPFRETE,
					DTCOTACA:	tmz.dataAtualJS(),
					arTarifa:	[],
					dsOcorre: 	null
				};

				while ((arRS.length > 0) && (arRS[0] == parm.IDG046)) {

					if (!objCotacao.dsOcorre) {

						parm.IDG014   = arRS[0].IDG014;
						//parm.TPTABELA = ((arRS[0].SNCARPAR == 'S') || (arRS[0].PCMIN4PL > arRS[0].PCOCUPAC)) ? 'P' : 'V';
						parm.TPTABELA = 'P'; //remover

						arTF = arOP.filter(f => { return f.IDG046 == parm.IDG046 });

						if (arTF.length == 0) {

							objCotacao.dsOcorre = this.cargaSemTabela(parm);

						} else {

							objCotacao.dsOcorre = this.checaTabelaUnica(arTF, parm.TPFRETE);

							if (!objCotacao.dsOcorre) {

								while (arTF.length > 0) {

									objTarifa = this.somaTarifa(arTF[0]);
									if (objTarifa) objCotacao.arTarifa.push(objTarifa);
	
									arTF.shift();
	
								}								

							}

						}

					}

					arRS.shift();

				}

				arCotacao.push(objCotacao);

			}

			return arCotacao;

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Rotina para cálculo da tabela de Frete a Pagar por 3PL
     * @function cotacao3PL
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
	 * @async
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.cotacao3PL = async function (arOP, ar3PL, objConn) {

		try {

			var arRS = arOP.slice(0);
			var arTF = [];

			var arCotacao  = [];
			var objCotacao = {}
			var objTarifa  = {};

			var parm = { TPFRETE: 'T' };
			
			//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

			while (arRS.length > 0) 
			{

				parm.IDG046   = arRS[0].IDG046;
				parm.TPTABELA = 'P'; //(arRS[0].SNCARPAR == 'S') ? 'P' : 'V';

				objCotacao =
				{
					IDG046:		parm.IDG046,
					TPCOTACA:	parm.TPFRETE,
					DTCOTACA:	tmz.dataAtualJS()
				}

				arTF = arOP.filter(f => { return f.IDG046 == parm.IDG046 });

				if (arTF.length == 0) {

					objCotacao.dsOcorre = this.cargaSemTabela(parm);
					arCotacao.push(objCotacao);

				} else {

					objCotacao.dsOcorre = null; //this.checaTabelaUnica(arTF, parm.TPFRETE);

					if (objCotacao.dsOcorre) {
						
						arCotacao.push(objCotacao);

					} else {

						for (var y=0; y<ar3PL.length; y++) 
						{
	
							objCotacao.IDG024   = ar3PL[y].IDG024;
							objCotacao.IDG085   = 104; 
							objCotacao.arTarifa = [];
						
							for (var i=0; i<arTF.length; i++)
							{
	
								objTarifa = this.somaTarifa(arTF[i]);
								if (objTarifa) objCotacao.arTarifa.push(objTarifa);
		
							}
	
							arCotacao.push(Object.assign({}, objCotacao));

						}						

					}

				}
	
				arRS.shift();

			}

			return arCotacao;

		} catch (err) {

			throw err;
		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Função que retorna mensagem de ocorrência de acordo com o tipo de frete
     * @function cargaSemTabela
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @return {String}     Retorna o texto da ocorrência
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.cargaSemTabela = function (parm) {

		if (parm.TPFRETE == 'C') {

			var dsTipoTab = 'de venda';
			var strCompl = ` - Operação: ${parm.IDG014}`;

		} else {

			var dsTipoTab = 'de compra';
			var strCompl = '';

		}

		var dsOcorre = `Nenhuma tabela ${dsTipoTab} foi encontrada para a carga ${parm.IDG046}${strCompl}`

		return dsOcorre;

	}

    //-----------------------------------------------------------------------\\
    /**
     * Pesquisa ocorrência de múltiplas tabelas de preço em uma única cotação
     * @function checaTabelaUnica
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @return {String}     Retorna mensagem informando a duplicidade encontrada
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.checaTabelaUnica = function (arRS, tpFrete) {

		try {

			var dsMsg = null;
			var arTabela = [];

			if (tpFrete == 'C') {

				arTabela = [...new Set(arRS.map(uk => uk.IDG085))];
				dsMsg = `A Carga ${arRS[0].IDG046} possui ${arTabela.length} tabelas de venda: ${arTabela.join()}`;

			} else {

				var arID3PL = [...new Set(arRS.map(uk => uk.ID3PLCOT))];
				var arFilter = [];

				for (var id of arID3PL) {

					arFilter = arRS.filter(f => { return f.ID3PLCOT == id });
					arTabela = [...new Set(arFilter.map(uk => uk.IDG085))];
					if (arTabela.length > 1) break;

				}

				dsMsg = `A Carga ${arRS[0].IDG046} possui ${arTabela.length} tabelas de compra: ${arTabela.join()} - 3PL ${id}`;

			}

			return (arTabela.length == 1) ? null : dsMsg;

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Calcula a tarifa de acordo com os parâmetros enviados
     * @function somaTarifa
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
     * @return {Object}     Retorna um objeto com as tarifas somadas
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.somaTarifa = function (objRS) {

		try {

			var objTarifa = null;

			objRS.VRDELIVE = 1;
			objRS.VRMINCOB = 0;
			objRS.TTENTREG = 1;
			objRS.QTENTREG = 1;
			objRS.SNRATEIO = 0;
			objRS.TPAPLICA = 'P';
			objRS.PSBRUTO  = 1;
			objRS.VRTABELA = 100;

			if ((objRS.VRDELIVE >= objRS.VRMINCOB) &&
				(objRS.TTENTREG >= objRS.QTENTREG)) {

				var vrFator = ((objRS.SNRATEIO == 0) && (objRS.TPAPLICA != 'F')) ? 1 : (1 / objRS.TTDELIVE);

				switch (objRS.TPAPLICA) {

					case 'V':
						var vrTarifa = (objRS.VRTABELA * objRS.VRDELIVE * vrFator);
						break;

					case 'P':
						var vrTarifa = (objRS.VRTABELA * objRS.PSBRUTO * vrFator);
						break;

					case 'F':
					default:
						var vrTarifa = (objRS.VRTABELA * vrFator);
						break;

				}

				objTarifa =
				{
					IDG087:   11893912,
					IDG089:   1,
					IDG043:   objRS.IDG043,
					TPAPLICA: objRS.TPAPLICA,
					QTENTREG: objRS.QTENTREG,
					VRMINCOB: objRS.VRMINCOB,
					VRTABELA: objRS.VRTABELA,
					VRTARIFA: vrTarifa
				};

			}

			return objTarifa;

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Grava a cotação em banco e chama rotina de depenência
     * @function salvaCotacoes
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
	 * @async
     * @return {Object}     Retorna um objeto com os dados da cotação
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.salvaCotacoes = async function (arDados, objConn) {

		try {

			for (var objDados of arDados) {

				if (!objDados.dsOcorre) {

					var objVal = db.checkSchema(objDados, mdl.cotacao.columns);

					if (objVal.blOK) {

						var parm = Object.assign(objVal.value, { objConn });
						objDados.IDT017 = await db.insertData(parm, mdl.T017);
						await this.salvaTarifas(objDados, objConn);

					} else {

						objDados.dsOcorre = objVal.strError;

					}

				}

				if (objDados.dsOcorre)
					await this.salvaOcorrencias(objDados, objConn);

			}

			return objDados;

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Grava as tarifas de uma cotação em banco
     * @function salvaTarifas
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
	 * @async
     * @return {Array}      Retorna um array com os id's das tarifas 
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.salvaTarifas = async function (objDados, objConn) {

		try {

			var parm = {};
			var arID = [];
			var id   = {};

			for (var objTarifa of objDados.arTarifa) {

				parm = Object.assign(objTarifa, { IDT017: objDados.IDT017, objConn });
				id = await db.insertData(parm, mdl.T018);
				arID.push(id);

			}

			return arID;

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\
    /**
     * Grava as ocorrências da cotação
     * @function salvaOcorrencias
     * @author Rafael Delfino Calzado
     * @since 05/12/2019
     *
	 * @async
     * @return {Integer}    Retorna o id da ocorrência salva
     * @throws {Object}     Retorna uma mensagem do erro encontrado
     */
    //-----------------------------------------------------------------------\\

	api.salvaOcorrencias = async function (req, objConn) {

		try {

			var objOcorre =
			{
				IDS001: 1,
				TXVALIDA: req.dsOcorre,
				DTCADAST: tmz.dataAtualJS()
			};

			var id = null;

			var parm = Object.assign(objOcorre, { IDG046: req.IDG046 });

			var objVal = db.checkSchema(parm, mdl.T004.columns);

			if (objVal.blOK) {

				var objData = db.validateSchema(objVal.value, mdl.stOcorrencia);
				objData.objConn = objConn;

				await db.updateData(objData, mdl.stOcorrencia);

				var objData2 = Object.assign(objVal.value, { objConn });

				id = await db.insertData(objData2, mdl.T004);

			}

			return id;

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\

	return api;

}