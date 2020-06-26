module.exports = function (app, cb) {

	const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = { gdao };

    //-----------------------------------------------------------------------\\

	api.removerValoresAdicionais = async function (req, res, next) {

		req.sql = 
			`UPDATE (
				SELECT 
					G075.IDG075,
					G076.IDG076,
					G076.IDS007PK,
					G076.SNDELETE
						
				FROM G075 -- CAMPOS ADICIONAIS

				INNER JOIN S007 -- TABELAS
					ON S007.IDS007 = G075.IDS007
				
				INNER JOIN G076 -- VALORES ADICIONAIS
					ON G076.IDG075 = G075.IDG075
					AND G076.SNDELETE = 0
					
				WHERE 
					G075.SNDELETE = 0
					AND S007.NMTABELA = '${req.nmTabela}'
					AND G076.IDS007PK = ${req.IDS007PK}
					AND G075.NMCAMPO IN (${req.arCampos.join()})
					
				) Q SET Q.SNDELETE = 1`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });		

	}

	//-----------------------------------------------------------------------\\

	api.inserirValoresAdicionais = async function (req, res, next) {

		var vrCampo = (req.VRCAMPO == null) ? `NULL` : `'${req.VRCAMPO}'`;

		req.sql = 
			`INSERT INTO G076 (IDS007PK, IDG075, VRCAMPO) VALUES 
			(${req.IDS007PK}, ${req.IDG075}, ${vrCampo})`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });
	}

	//-----------------------------------------------------------------------\\

	api.buscarCamposAdicionais = async function (req, res, next) {

		req.sql = 
			`SELECT 
				G075.IDG075,
				G075.NMCAMPO,
				S007.IDS007 
			FROM G075

			INNER JOIN S007
				ON S007.IDS007 = G075.IDS007
				AND S007.NMTABELA = '${req.nmTabela}'

			WHERE 
				G075.SNDELETE = 0`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });					
	}

	//-----------------------------------------------------------------------\\

    return api;

}