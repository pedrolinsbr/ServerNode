module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    var api = {};
    api.controller = gdao.controller;
    api.alterar    = gdao.alterar;
    api.inserir    = gdao.inserir;

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista contatos da transportadoras
        *
        * @async 
        * @function listaContato			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaContato = async function (req, res, next) {

        try {

            if (req.method == 'POST') {

                var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G007', true);

            } else {

                sqlWhere    = `WHERE G007.IDG007 = ${req.params.id}`;
                sqlPaginate = ``;
                sqlOrder    = ``;

            }

            var sql = 
                `SELECT 
    
                    G007.IDG007,
                    G007.NMCONTAT,
                    
                    G006.IDG006,
                    G006.DSSETOR,
    
                    G025.IDG024,
    
                    G039.IDG039,
                    G039.DSCARGO,

                    COUNT(*) OVER() COUNT_LINHA
    
                FROM G007 -- CONTATOS
    
                INNER JOIN G006 -- SETOR
                    ON G006.IDG006 = G007.IDG006
                    AND G006.SNDELETE = 0
    
                INNER JOIN G025 -- CONTATOS x 3PL
                    ON G025.IDG007 = G007.IDG007
    
                INNER JOIN G039 -- CARGO
                    ON G039.IDG039 = G007.IDG039
                    AND G039.SNDELETE = 0
                                        
                ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;
    
            var arRS = await gdao.executar({ sql, bindValues }, res, next);

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
        * @description Lista os tipos de contato cadastrados para uma pessoa
        *
        * @async 
        * @function listaTipo			
        * 
        * @returns  {Array}   Retorna um array com o resultado da pesquisa
        * @throws   {Object}  Retorna a descrição do erro
        *
        * @author Rafael Delfino Calzado
        * @since 10/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.listaTipo = async function (req, res, next) {

        try {

            if (req.method == 'POST') {

                var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G008', true);

            } else {

                sqlWhere    = `WHERE G008.IDG008 = ${req.params.id}`;
                sqlPaginate = ``;
                sqlOrder    = ``;

            }

            var sql = 
                `SELECT 
                    G007.IDG007,
                    G007.NMCONTAT,
            
                    G008.IDG008,
                    G008.TPCONTAT,
                    G008.DSCONTAT,
            
                    CASE 
                        WHEN (G008.TPCONTAT = 'C') THEN 'CELULAR'
                        WHEN (G008.TPCONTAT = 'T') THEN 'TELEFONE'
                        WHEN (G008.TPCONTAT = 'E') THEN 'EMAIL'
                        WHEN (G008.TPCONTAT = 'O') THEN 'OFERECIMENTO'
                        ELSE 'OUTRO'
                    END CBCONTAT,

                    COUNT(*) OVER() COUNT_LINHA                            

                FROM G007 -- CONTATOS

                INNER JOIN G008 -- TIPOS DE CONTATOS
                    ON G008.IDG007 = G007.IDG007
                    AND G007.SNDELETE = 0
                                        
                ${sqlWhere} ${sqlOrder} ${sqlPaginate}`;
    
            var arRS = await gdao.executar({ sql, bindValues }, res, next);

            return utils.construirObjetoRetornoBD(arRS);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;
}