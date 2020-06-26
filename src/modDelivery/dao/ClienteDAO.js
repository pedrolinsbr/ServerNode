module.exports = function (app, cb) {

    const gdao = app.src.modGlobal.dao.GenericDAO;

    var api = {};

	//-----------------------------------------------------------------------\\
	/**
		* @description Busca o ID, ID da Cidade e IDEMPOPE do Revendedor
		*
		* @async 
		* @function buscaRevendedor
		* @param  {Object} req
		* @param  {number} req.IDG014   ID da operação
		* @param  {string} req.CDFILIAL Código da filial
		* @returns {Array} Retorna um array com o resultado da pesquisa 
		*
		* @author Rafael Delfino Calzado
		* @since 20/04/2018
    */
    //-----------------------------------------------------------------------\\

	api.buscaRevendedor = async function (req, res, next) {

		req.sql =
			`SELECT
					G005.IDG005 ID
				,	G005.IDG003 IDCIDADE
				,	G022.IDEMPOPE NRSELLER
			FROM G005

			INNER JOIN G022 ON 
				G022.IDG005 = G005.IDG005
				AND G005.SNDELETE = 0
				AND G022.SNDELETE = 0 

            WHERE 
                G005.IDG028 IS NOT NULL
                AND G022.SNINDUST = 1                
				AND G022.IDG014 = ${req.IDG014} 
                AND G022.DSSHIPOI = '${req.CDFILIAL}'
                AND G005.CPENDERE = '${req.CPFILIAL}'`;

		return await gdao.executar(req, res, next).catch((err) => { throw err });
    }
    
    //-----------------------------------------------------------------------\\

    api.buscaCidade = async function (req, res, next) {

        req.sql = 
            `SELECT 
                    G003.IDG003
                ,	G002.IDG002
                ,	G003.NMCIDADE
                ,	G002.CDESTADO
	
            FROM G003 -- CIDADE 

            INNER JOIN G002 -- ESTADO
	            ON G002.IDG002 = G003.IDG002
	
            WHERE 
	            G003.SNDELETE = 0
                AND G002.SNDELETE = 0 
                AND TRANSLATE(UPPER(G003.NMCIDADE), 'ÃÂÁÊÉÍÕÔÓÚÇ', 'AAAEEIOOOUC') = TRANSLATE('${req.NMCIDADE.toUpperCase()}', 'ÃÂÁÊÉÍÕÔÓÚÇ', 'AAAEEIOOOUC')
	            AND UPPER(G002.CDESTADO) = '${req.CDESTADO.toUpperCase()}'`;

       return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

	//-----------------------------------------------------------------------\\
	/**
        * @description Busca o ID, ID da Cidade, CNPJ e Inscrição Estadual do Cliente
        *
        * @async 
        * @function buscaCliente
        * @param  {Object} req  
        * @param  {string} req.CJCLIENT CNPJ do Cliente
        * @param  {string} req.IECLIENT Inscrição Estadual do Cliente (opcional)
        * @returns {Array} Retorna um array com o resultado da pesquisa 
        *
        * @author Rafael Delfino Calzado
        * @since 16/08/2018
    */
    //-----------------------------------------------------------------------\\

	api.buscaCliente = async function (req, res, next) {

		req.sql =
			`SELECT
					G005.IDG005     ID
				,	G005.IDG003     IDCIDADE
				,	G005.CJCLIENT
				,	G005.IECLIENT

			FROM G005
            INNER JOIN G003 G003 ON G003.IDG003 = G005.IDG003
			WHERE 
				G005.SNDELETE = 0 
                AND G005.CJCLIENT = '${req.CJCLIENT}'`;
                
        if (req.IECLIENT !== undefined){
            req.sql += ` AND LPAD(UPPER(G005.IECLIENT),15,0) = LPAD(UPPER('${req.IECLIENT}'),15,0)`;
        }
        if (req.CDMUNICI !== undefined){
            req.sql += ` AND G003.CDMUNICI = '${req.CDMUNICI}'`;
        }
        if (req.CPENDERE !== undefined){
            req.sql += ` AND G005.CPENDERE = '${req.CPENDERE}'`;
        }

        
        return await gdao.executar(req, res, next).catch((err) => { throw err });

	}    

	//-----------------------------------------------------------------------\\
	/**
        * @description Busca o ID do Cliente, ID da Cidade e o ID do Cliente na Operação
        *
        * @async 
        * @function buscaClienteOperacao
        * @param  {Object}  req  
        * @param  {String}  req.CJCLIENT CNPJ do Cliente
        * @param  {String}  req.IECLIENT Inscrição Estadual do Cliente
        * @param  {String}  req.CPENDERE CEP do Cliente
        * @param  {Integer} req.IDG014   ID da Operação
        * @returns {Array}  Retorna um array com o resultado da pesquisa 
        *
        * @author Rafael Delfino Calzado
        * @since 16/08/2018
    */
    //-----------------------------------------------------------------------\\

	api.buscaClienteOperacao = async function (req, res, next) {
      
        var nmCampo = (req.TPDELIVE == 1) ? 'G022.IDCLIOPE' : 'G022.IDEMPOPE';

        var parm = { objConn: req.objConn };

		parm.sql =
			`SELECT
					G005.IDG005     ID
                ,	G005.IDG003     IDCIDADE
                ,   G022.IDG022 
                ,   ${nmCampo}      IDEXTCLI

			FROM G005 -- CLIENTES

            INNER JOIN G022 -- OPERAÇÕES
                ON G022.IDG005 = G005.IDG005
                AND G022.SNDELETE = 0 

			WHERE 
                G005.SNDELETE = 0                 
				AND G005.CJCLIENT = '${req.CJCLIENT}'
                AND G005.CPENDERE = '${req.CPCLIENT}'
                AND G022.IDG014 = ${req.IDG014}
                AND ${nmCampo} = '${req.IDEXTCLI}'`;

        if (req.IECLIENT !== undefined) 
            parm.sql += ` AND LPAD(UPPER(G005.IECLIENT), 15, 0) = LPAD(UPPER('${req.IECLIENT}'), 15, 0)`;    

        return await gdao.executar(parm, res, next).catch((err) => { throw err });

	}    

    //-----------------------------------------------------------------------\\

	api.buscaIdAG = async function (req, res, next) {

        req.sql = 
            `SELECT
                    G005.IDG005 ID
                ,	G005.IDG003 IDCIDADE

                FROM G005

                INNER JOIN G022 
                    ON G022.IDG005 = G005.IDG005
                    AND G005.SNDELETE = 0
                    AND G022.SNDELETE = 0 

                WHERE 
                    G022.IDG014 = ${req.IDG014} AND
                    G022.IDEMPOPE = '${req.IDEMPOPE}' AND 
                    G005.CPENDERE = '${req.CPENDERE}'`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });

	}    

    //-----------------------------------------------------------------------\\    
    
    return api;

}