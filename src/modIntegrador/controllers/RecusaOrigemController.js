module.exports = function (app, cb) {

    const tmz    = app.src.utils.DataAtual;
    const fldAdd = app.src.modGlobal.controllers.XFieldAddController;
    const dao    = app.src.modIntegrador.dao.RecusaOrigemDAO;

    var api = {};

    //-----------------------------------------------------------------------\\    
    /**
        * @description Recusa e finaliza a Carga indicada antes do Embarque
        *
        * @async 
        * @function recusaCargaOrigem
        *
        * @returns  {Object}    Retorna um objeto com o resultado da operação
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 29/04/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.recusaCargaOrigem = async function (req, res, next) {

        try {

            var parm = { IDG046: req.params.id, UserId: req.UserId };
            parm.objConn = await dao.controller.getConnection(null, parm.UserId);

            var arRS = await dao.listaDeliveries(parm, res, next);

            var blOK = (arRS.length > 0);

            if (blOK) {

                parm.nmTabela = 'G043';
                parm.SNRECORI = 1;
                parm.DTENTREG = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss');

                await dao.finalizaDelivery(parm, res, next);
                await dao.finalizaCarga(parm, res, next);

                while (arRS.length > 0) {

                    parm.idTabela = arRS[0].IDG043;
                    await fldAdd.inserirValoresAdicionais(parm, res, next);
                    arRS.shift();

                }

            }

            await parm.objConn.close();

            res.send({ blOK });

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}