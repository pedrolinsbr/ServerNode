module.exports = function (app, cb) {

    var api = {};

    const tmz   = app.src.utils.DataAtual;
    const utils = app.src.utils.Formatador;
    const mdl   = app.src.modOferece.models.ViagemModel;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    //-----------------------------------------------------------------------\\
    /**
        *      
        * @function insere
        * 
        * @description Valida o array e inicia o processo para salvar as viagens
        * 
        * @param  {Array} req.body.carga Contém a estrutura com os dados das viagens
        * 
        * @requires this.insereViagens
        * 
        * @returns {Object} Retorna com o resultado da operação
        * @throws  {Object} Retorna a descrição do erro
        * 
        * @author Rafael Delfino Calzado
        * @since 26/06/2018
    */
    //-----------------------------------------------------------------------\\       

    api.insere = async function (req, res, next) {

        var arDados = (req.body.carga === undefined) ? [] : req.body.carga;

        if (arDados.length > 0) {

            var objConn = await gdao.controller.getConnection();            
            var parm    = { arDados, objConn };
            
            var objResult = await api.insereViagens(parm, res, next).catch((err) => next(err));

            await objConn.close();

        } else {

            var objResult = 
                {
                    arID:     [],
                    arOcorre: ['Não foram encontrados dados para a operação']                    
                };
        }
 
        var cdStatus = (arDados.length == objResult.arID.length) ? 200 : 500;
        
        res.status(cdStatus).send(objResult);

    }

    //-----------------------------------------------------------------------\\
    /**
        *      
        * @function insereViagens
        * 
        * @description Insere em loop todas as Viagens
        * 
        * @param  {Array} arDados Array com todos os dados das viagens
        * 
        * @requires module:utils/Formatador~setSchema
        * @requires module:utils/Formatador~validaEsquema
        * 
        * @returns {Object} Retorna com o resultado da operação
        * @throws  {Object} Retorna a descrição do erro
        * 
        * @author Rafael Delfino Calzado
        * @since 26/06/2018
    */
    //-----------------------------------------------------------------------\\   

    api.insereViagens = async function (parm, res, next) {

        var arOcorre = [];
        var arID     = [];

        for (var objDados of parm.arDados) {

            var objCarga = utils.setSchema(mdl.carga, objDados);
            objCarga.vlFields.DTCARGA = tmz.dataAtualJS();

            var objErro = utils.validaEsquema(objCarga.vlFields, mdl.carga.columns);
            
            if (objErro.blOK) {

                objCarga.objConn = parm.objConn;

                await this.insereCargas(objCarga, res, next)

                .then((result) => { arID.push(result.id) })
                .catch((err) => { throw err });
                

            } else {

                arOcorre.push(objErro.strErro);
                break;
            }

        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\                
                             
        return { arOcorre, arID };        

    }

    //-----------------------------------------------------------------------\\
    /**
        *      
        * @function insereCargas
        * 
        * @description Insere em loop todas as cargas na tabela G046
        * 
        * @param  {Object} objCarga Contém todos os dados de uma Viagem
        * 
        * @requires this.insereEtapas
        * 
        * @returns {Object} Retorna com o resultado da operação
        * @throws  {Object} Retorna a descrição do erro
        * 
        * @author Rafael Delfino Calzado
        * @since 26/06/2018
    */
    //-----------------------------------------------------------------------\\   

    api.insereCargas = async function (objCarga, res, next) {

        var objTmp = Object.assign({}, objCarga.vlFields);

        delete objTmp.etapa;

        var objDados = 
            {
                objConn:  objCarga.objConn,
                table:    objCarga.table,
                key:      objCarga.key,
                vlFields: objTmp,
            };

        await gdao.controller.setConnection(objDados.objConn);

        return await gdao.inserir(objDados, res, next).catch((err) => { throw err })

        .then(async (result) => { 

            objCarga.vlFields.IDG046 = result.id;
            await this.insereEtapas(objCarga, res, next).catch((err) => { throw err });

            return result;

        });

    }

    //-----------------------------------------------------------------------\\
    /**
        *      
        * @function insereEtapas
        * 
        * @description Insere em loop todas as etapas na tabela G048
        * 
        * @param  {Object} objCarga         Contém todos os dados de uma Viagem
        * @param  {Array}  objCarga.etapa   Array com os dados das etapas
        * 
        * @throws  {Object} Retorna a descrição do erro
        * 
        * @author Rafael Delfino Calzado
        * @since 26/06/2018
    */
    //-----------------------------------------------------------------------\\   


    api.insereEtapas = async function (objCarga, res, next) {

        var objDados = 
            { 
                    objConn: objCarga.objConn 
                ,   table: 'G048'
                ,   key:   ['IDG048']
            };
        
        for (var objEtapa of objCarga.vlFields.etapa) {
                        
            objEtapa.IDG046   = objCarga.vlFields.IDG046;
            objDados.vlFields = Object.assign({}, objEtapa);

            delete objDados.vlFields.pedido;

            await gdao.controller.setConnection(objDados.objConn);

            await gdao.inserir(objDados, res, next).catch((err) => { throw err })
    
            .then(async (result) => { 
                    
                objEtapa.IDG048  = result.id;
                objEtapa.objConn =  objDados.objConn;

                await this.inserePedidos(objEtapa, res, next).catch((err) => { throw err });
    
            });
    
        }

    }    

    //-----------------------------------------------------------------------\\    
    /**
        *      
        * @function inserePedidos
        * 
        * @description Insere em loop todos os pedidos na tabela G049
        * 
        * @param  {Object} objEtapa         Contém todos os dados da Etapa
        * @param  {Array}  objEtapa.pedido  Array com os dados dos pedidos
        * 
        * @throws  {Object} Retorna a descrição do erro
        * 
        * @author Rafael Delfino Calzado
        * @since 26/06/2018
    */
    //-----------------------------------------------------------------------\\   

    api.inserePedidos = async function (objEtapa, res, next) {

        var objDados = 
            { 
                    objConn: objEtapa.objConn
                ,   table:  'G049'
                ,   key:    ['IDG049']
            };


        for (var objPedido of objEtapa.pedido) {

            objPedido.IDG048 = objEtapa.IDG048;
            objDados.vlFields = Object.assign({}, objPedido);

            await gdao.controller.setConnection(objDados.objConn);

            await gdao.inserir(objDados, res, next).catch((err) => { throw err });

        }

    }

    //-----------------------------------------------------------------------\\    

    return api;
}
