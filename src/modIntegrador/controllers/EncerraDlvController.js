module.exports = function (app, cb) {

    const tmz = app.src.utils.DataAtual;
    const mdl = app.src.modIntegrador.models.EndDlvModel;
    const dao = app.src.modIntegrador.dao.EncerraDlvDAO;
    const mls = app.src.modDocSyn.controllers.MSController;
    const dbg = dao.dbg;

    var api = {};

    //-----------------------------------------------------------------------\\    
    /**
        * @description Checa conteúdo da requisição
        *
        * @async 
        * @function checkDlvEnd
        *
        * @returns  {Object}    Retorna um objeto com o resultado da operação
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 28/10/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.checkDlvEnd = async function (req, res, next) {
        
        var objVal = dbg.checkSchema(req.body, mdl.chkEndDlv.columns);

        if (objVal.blOK) 
            next();
        else 
            res.status(400).send({ message: objVal.strError });

    }

    //-----------------------------------------------------------------------\\    
    /**
        * @description Encerra a entrega da Delivery manualmente
        *
        * @async 
        * @function encerraDelivery
        *
        * @returns  {Object}    Retorna um objeto com o resultado da operação
        * @throws   {Object}    Retorna a descrição do erro encontrado
        *
        * @author Rafael Delfino Calzado
        * @since 28/10/2019
    */
    //-----------------------------------------------------------------------\\ 

    api.encerraDelivery = async function (req, res, next) {

		try {

            var parm     = req.body;
            var blOK     = false;
            var nrRows   = 0;
            var cdStatus = 400;

            //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

            parm.objConn = await dbg.controller.getConnection(null, req.body.IDS001);

            var arRS = await dao.verSitDelivery(parm);

            if (arRS.length == 1) {                

                parm.IDG048 = arRS[0].IDG048;
                parm.DTENTREG = tmz.retornaData(`${parm.DTENTREG} 12:00`, 'YYYY-MM-DD HH:mm');

                if ([1,2].includes(parseInt(arRS[0].TPDELIVE))) { //Transf. / Venda
                    
                    parm.STETAPA = 5;
                    parm.MSTYPE  = 'AAD';

                 } else { 

                    parm.STETAPA = 25;
                    parm.MSTYPE  = 'RRO';

                }

                nrRows = await dbg.updateData(parm, mdl.endDlv);
                blOK = (nrRows > 0);

                if ((blOK) && (arRS[0].IDG014 == 5)) //Syngenta
                    await api.insMilestone(parm, res, next);

            }

            await parm.objConn.close();            

			cdStatus = (blOK) ? 200 : 400;

			res.status(cdStatus).send({ blOK });

		} catch (err) {

			res.status(500).send({ error: err.message });

		}

    }

    //-----------------------------------------------------------------------\\ 
    
    api.insMilestone = async function (req, res, next) {

        try {

            var objMS = 
            { 
                MSTYPE:   req.MSTYPE,
                IDG048:   req.IDG048, 
                DTALTEVE: req.DTENTREG,
                IDI007:   req.IDI007
            };                

            req.arDados = [objMS];

            return await mls.insereMS(req, res, next);            

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;

}