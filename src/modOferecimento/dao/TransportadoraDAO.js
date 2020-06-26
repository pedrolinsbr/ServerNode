module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;	

    var api = {};
    api.controller = gdao.controller;
    api.alterar    = gdao.alterar;
    api.inserir    = gdao.inserir;

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista transportadoras cadastradas
        *
        * @async 
        * @function listaTransp			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaTransp = async function (req, res, next) {

        try {

            if (req.method == 'POST') {

                var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body, 'G024', true);

			} else {

				var sqlWhere 	= `WHERE G024.IDG024 = ${req.params.id}`;
				var sqlOrder 	= '';
				var sqlPaginate = '';

			}
			
            var sql = 
                `SELECT 
                    G024.IDG024,
                    G024.NMTRANSP,
                    G024.RSTRANSP,
                    G024.TPPESSOA,
                    G024.CJTRANSP,
                    G024.IETRANSP,
                    G024.IMTRANSP,
                    G024.NRLATITU,
                    G024.NRLONGIT,
                    G024.IDLOGOS,
                    G024.PCPREFRE,
                    G024.STCADAST,
                    G024.CPENDERE,
                    G024.BIENDERE,
                    G024.DSENDERE,
                    G024.DSCOMEND,
                    G024.NRENDERE,
                    
                    G003.IDG003,
                    UPPER(G003.NMCIDADE) NMCIDADE,
                    
                    G002.IDG002, 
                    G002.CDESTADO,

                    UPPER(G003.NMCIDADE) || '/' || G002.CDESTADO NMCIDEST, 
                    
                    G023.IDG023,
                    UPPER(G023.DSGRUTRA) DSGRUTRA,
                    
                    COUNT(*) OVER() COUNT_LINHA
                    
                FROM G024 -- TRANSPORTADORA
                
                INNER JOIN G003 -- CIDADE
                    ON G003.IDG003 = G024.IDG003
                    
                INNER JOIN G002 -- ESTADO 
                    ON G002.IDG002 = G003.IDG002 
                
                INNER JOIN G023 -- GRUPO DE TRANSPORTADORA
                    ON G023.IDG023 = G024.IDG023
                    
            ${sqlWhere}  ${sqlOrder} ${sqlPaginate}`;

            var arRS = await gdao.executar({sql, bindValues}, res, next);

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista porcentagem contratada da 3PL em cada Regra
        *
        * @async 
        * @function listaPC		
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaPC = async function (req, res, next) {

        try {

            var sql =
                `SELECT
                    O008.IDO008,
                    O008.DSREGRA,
                    O009.PCATENDE

                FROM O008 -- REGRAS

                INNER JOIN O009 -- REGRAS x 3PL
                    ON O009.IDO008 = O008.IDO008

                INNER JOIN G024 -- 3PL
                    ON G024.IDG024 = O009.IDG024

                WHERE
                    O008.SNDELETE = 0 
                    AND O009.PCATENDE > 0
                    AND G024.IDG024 = ${req.params.id}

                ORDER BY O009.PCATENDE`;

            return await gdao.executar({sql}, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
        * @description Filtra Grupo de Transportadora
        *
        * @async 
        * @function listaGTP
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 09/04/2019
    */
    //-----------------------------------------------------------------------\\ 
  
    api.listarGTP = async function (req, res, next) {

        try {

            return await utils.searchComboBox('IDG023', 'DSGRUTRA', 'G023', ['IDG023', 'DSGRUTRA'], req.body);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}
