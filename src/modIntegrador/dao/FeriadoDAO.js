module.exports = function (app, cb) {

	const gdao  = app.src.modGlobal.dao.GenericDAO;
	const utils = app.src.utils.FuncoesObjDB;

	var api = {};

	api.controller	= gdao.controller;
	api.inserir 	= gdao.inserir;
	api.alterar		= gdao.alterar;

	//-----------------------------------------------------------------------\\ 

	api.insereLocalFeriado = async function (req, res, next) {

		try {

			var arCampos  = ['IDG054', 'IDS001', 'STCADAST', 'IDG001', 'IDG002', 'IDG003', 'DTCADAST'];
			var arValores = [];
	
			var strAux = '';
	
			var sql  = `INSERT INTO G055 (${arCampos.join()}) \n`;
				sql += 'WITH input_values AS ( \n';
	
			switch (req.post.TPFERIAD) {

				case 0: 
					var arLoop = req.post.IDG003;
					break;

				case 1:
					var arLoop = req.post.IDG002;
					break;

				case 2:
				default:
					var arLoop = req.post.IDG001;
					break;

			}

			for (var a of arLoop) {
	
				strAux  = `SELECT `;
				
				strAux += `${req.post[arCampos[0]]} ${arCampos[0]}, `;
				strAux += `${req.post[arCampos[1]]} ${arCampos[1]}, `;  
				strAux += `'${req.post[arCampos[2]]}' ${arCampos[2]}, `;  

				for (var i=3; i<6; i++) {
	
					strAux += (Array.isArray(req.post[arCampos[i]])) ? `${a.id}` : `NULL`;
					strAux += ` ${arCampos[i]}, `;
	
				}
	
				strAux += `CURRENT_DATE ${arCampos[6]} FROM DUAL`;  
	
				arValores.push(strAux);
	
			} 
	
			sql += arValores.join(' UNION ALL \n');
	
			sql += `) SELECT * FROM input_values`;
	
			var parm = { objConn: req.objConn, sql };
	
			await gdao.controller.setConnection(parm.objConn);
			await gdao.executar(parm, res, next);		

		} catch (err) {

			throw err;

		}

	}
	
	//-----------------------------------------------------------------------\\

	api.buscaPreviaFeriado = async function (req, res, next) {

		try {

			var sql = 
				`SELECT IDG054 
				FROM G054 
				WHERE 
					SNDELETE = 0
					AND SNRECORR = ${req.post.SNRECORR}
					AND DTDIAFER = ${req.post.DTDIAFER}
					AND DTMESFER = ${req.post.DTMESFER}`;

			if (Number.isInteger(parseInt(req.post.DTANOFER))) 
				sql += ` AND DTANOFER = ${req.post.DTANOFER}`
			else 
				sql += ` AND DTANOFER IS NULL`;

			var parm = { sql, objConn: req.objConn };

			await gdao.controller.setConnection(req.objConn);

			return await gdao.executar(parm, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\ 

	api.removeLocalPrevio = async function (req, res, next) {

		try {

			var sql = `UPDATE G055 SET SNDELETE = 1 WHERE IDG054 = ${req.post.IDG054}`;

			var parm = { sql, objConn: req.objConn };

			await gdao.controller.setConnection(parm.objConn);

			return await gdao.executar(parm, res, next);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\ 

	api.listaFeriado = async function (req, res, next) {

		try {

			if (req.method == 'POST') {

				var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body, 'G054', true);

			} else {

				var sqlWhere 	= `WHERE G054.IDG054 = ${req.params.id}`;
				var sqlOrder 	= '';
				var sqlPaginate = '';

			}
			
			var sql = 
				`SELECT 
					G054.IDG054, 
					G054.DSFERIAD, 
					G054.DTANOFER, 
					G054.DTMESFER, 
					G054.DTDIAFER,
					G054.STCADAST,
					TO_CHAR(G054.DTCADAST, 'DD/MM/YYYY HH24:MI') DTCADAST,
				
					CASE 
						WHEN MAX(NVL(G055.IDG003,0)) > 0 THEN 'MUNICIPAL'
						WHEN MAX(NVL(G055.IDG002,0)) > 0 THEN 'ESTADUAL'
						ELSE 'NACIONAL'
					END TPFERIAD,

					CASE 
						WHEN G054.SNRECORR = 1 THEN 'SIM'
						WHEN G054.SNRECORR = 0 THEN 'NÃO'
						ELSE 'NULO'
					END SNRECORR,
						
					LISTAGG(G001.IDG001, ',') WITHIN GROUP(ORDER BY G001.IDG001) IDPAIS,
					LISTAGG(G001.NMPAIS, ',') WITHIN GROUP(ORDER BY G001.NMPAIS) NMPAIS,
					
					LISTAGG(G002.IDG002, ',') WITHIN GROUP(ORDER BY G002.IDG002) IDESTADO,
					LISTAGG(G002.CDESTADO, ',') WITHIN GROUP(ORDER BY G002.CDESTADO) CDESTADO,
					
					LISTAGG(G003.IDG003, ',') WITHIN GROUP(ORDER BY G003.IDG003) IDCIDADE,
					LISTAGG(G003.NMCIDADE, ',') WITHIN GROUP(ORDER BY G003.NMCIDADE) NMCIDADE,

					COUNT(*) TTLOCAIS,

					COUNT(*) OVER() COUNT_LINHA
									
				FROM G054 -- FERIADO
				
				INNER JOIN G055 -- FERIADO x LOCALIDADE
					ON G055.IDG054 = G054.IDG054
					AND G055.SNDELETE = 0

				LEFT JOIN G001 -- PAÍS
					ON G001.IDG001 = G055.IDG001
					AND G001.SNDELETE = 0

				LEFT JOIN G002 -- ESTADO
					ON G002.IDG002 = G055.IDG002
					AND G002.SNDELETE = 0

				LEFT JOIN G003 -- CIDADE
					ON G003.IDG003 = G055.IDG003
					AND G003.SNDELETE = 0
					
				${sqlWhere}

				GROUP BY 
					G054.IDG054, 
					G054.DSFERIAD, 
					G054.DTANOFER, 
					G054.DTMESFER, 
					G054.DTDIAFER,
					G054.SNRECORR, 
					G054.STCADAST,
					G054.DTCADAST
				
				${sqlOrder}
				${sqlPaginate}`;

			var arRS = await gdao.executar({sql, bindValues}, res, next);

			return utils.construirObjetoRetornoBD(arRS);

		} catch (err) {

			throw err;

		}

	}

	//-----------------------------------------------------------------------\\ 

	return api;

}