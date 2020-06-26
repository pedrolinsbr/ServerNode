module.exports = function (app, cb) {

	const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
        * @description Verifica se o menu tem ações disponíveis para o usuário
        *
        * @async 
        * @function buscaAcoes
        * 
		* @returns  {Array}   Retorna array com o resultado da pesquisa
        * @throws   {Object}  Retorna o atributo não encontrado no modelo
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\  

	api.buscaAcoes = async function (req, res, next) {

		try {

			var sql = 
				`SELECT DISTINCT

					S025.IDS025,
					S025.DSMODULO,
				
					S026.IDS026,		
					S026.DSGRUPO,
					
					S022.IDS022,
					S022.DSTITULO,
					
					S023.IDS023,
					S023.DSACAO,
					
					S021.SNVISADM				
				
				FROM S025 -- MODULOS
				
				INNER JOIN S026 -- GRUPO MENU / PREFIL
					ON S026.IDS025 = S025.IDS025
					AND S026.SNDELETE = 0
				
				INNER JOIN S027 -- GRUPO x USUARIO
					ON S027.IDS026 = S026.IDS026
					
				INNER JOIN S021 -- ACOES x GRUPO
					ON S026.IDS026 = S021.IDS026
					
				INNER JOIN S023 -- ACOES
					ON S023.IDS023 = S021.IDS023
					
				INNER JOIN S022 -- MENUS
					ON S022.IDS022 = S021.IDS022
					AND S022.SNDELETE = 0
				
				WHERE 
					S025.SNDELETE = 0
					AND S026.TPGRUPO In ('M', 'A')
					AND S022.IDS022 = ${req.IDS022}
					AND S023.IDS023 = ${req.IDS023}
					AND S027.IDS001 = ${req.IDS001}`;

			return await gdao.executar({sql}, res, next);

		} catch (err) {

			throw err;

		}

	}

    //-----------------------------------------------------------------------\\  

	return api;

}
