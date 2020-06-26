module.exports = function (app, cb) {

    const fmt   = app.src.utils.Formatador;
    const ca    = app.src.utils.ConversorArquivos;
    const tmz   = app.src.utils.DataAtual;
    const email = app.src.modGlobal.controllers.EmailController;
    const sdao  = app.src.modOferecimento.dao.StatusDAO;
    const dao   = app.src.modOferecimento.dao.AvisoDAO;
    const mdl   = app.src.modOferecimento.models.AvisoModel;

    const emailHeader = 'src/modOferecimento/templates/EmailHeader.html';
    const emailLoop   = 'src/modOferecimento/templates/EmailLoop.html';
    const emailFooter = 'src/modOferecimento/templates/EmailFooter.html';

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Checa modelo de avisos
     * @function api/checkAViso
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.checkAviso = function (req, res, next) {

        var parm = { post: req.body, model: mdl.aviso.columns };
        fmt.chkModelPost(parm, res, next);

    }

    //-----------------------------------------------------------------------\\
    /**
     * Recusa automaticamente oferecimentos não respondidos feitos há mais de 60 minutos
     * @function api/recusaAutomatica
     * @author Rafael Delfino Calzado
     * @since 20/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.recusaAutomatica = async function () {

        try {

            var parm = { post: { IDS001: 97, STCARGA: 'X' } };
            parm.objConn = await dao.controller.getConnection();

            var arRS = await dao.listaSemResposta(parm);

            if (arRS.length > 0) {

                parm.post.IDG046   = [...new Set(arRS.map(uk => uk.IDG046))];
                parm.post.DTRESOFE = tmz.tempoAtual('YYYY-MM-DD HH:mm:ss', false);

                await sdao.trocaStatusOferec(parm);
                await sdao.trocaStatusCarga(parm);

            }

            await parm.objConn.close();

            return arRS;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Prepara o aviso de oferecimento aos 3PL's
     * @function api/preparaAvisos
     * @author Rafael Delfino Calzado
     * @since 20/05/2019
     *
     * @async 
     * @return {Object}     Retorna um objeto com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.preparaAvisos = async function (req, res, next) {

        try {

            var arCargas = [];
            var objRet   = { errror: null };
            var parm     = { post: req.body };

            parm.post.STOFEREC = 'R';

            arCargas = arCargas.concat(parm.post.IDG046);

            parm.objConn = await dao.controller.getConnection(null, parm.post.IDS001OF);

            var arRS = await dao.listaAvisos(parm, res, next);

            var arCargasOf = [...new Set(arRS.map(uk => uk.IDG046))];
            objRet.blOK    = (arCargasOf.length == arCargas.length);

            if (objRet.blOK) {

                var cdStatus = 200;
                parm.post.STCARGA = 'O';

                await sdao.trocaStatusOferec(parm, res, next);
                await sdao.trocaStatusCarga(parm, res, next);

            } else {            

                var cdStatus = 400;
                var arCargasSR = arCargas.filter(f => { return !arCargasOf.includes(f) });
                objRet.error = `A(s) transportadora(s) da(s) carga(s) ${arCargasSR.join()} não possui(em) cadastro válido`;

            }

            await parm.objConn.close();

            res.status(cdStatus).send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Envia email de oferecimento ao participante selecionado
     * @function api/envioAutomatico
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Array}      Retorna o resultado da operação
     * @throws {Object}     Retorna um objeto com o erro encontrado
     */
    //-----------------------------------------------------------------------\\

    api.envioAutomatico = async function () {

        try {
            
            var ttEnvio = 0;
            var ttMaxEnvio = process.env.MAX_ENVIO_EMAIL || 50;
            ttMaxEnvio = parseInt(ttMaxEnvio);

            var parm = { post: { IDG046: [], STOFEREC: 'O' } };

            parm.objConn = await dao.controller.getConnection();

            var arRS = await dao.listaAvisos(parm);

            var arCargasOf = [...new Set(arRS.map(uk => uk.IDG046))];

            var objDados     = {};
            objDados.objConn = parm.objConn;
            objDados.DTENVIO = tmz.dataAtualJS();
           
            while ((arRS.length > 0) && (ttEnvio <= ttMaxEnvio)) {

                var strURL = (arRS[0].TPTRANSP == 'D') ? process.env.URL_LOGREV : process.env.URL_OFERECIMENTO;

                objDados.IDG046 = arRS[0].IDG046;
                objDados.IDO005 = arRS[0].IDO005;

                var objEmail = 
                    { 
                        idCarga: arRS[0].IDG046,
                        emDest:  arRS[0].EMTRANSP.split(','),
                        strMsg: ''
                    };

                var objHeader = 
                    {
                        IDG046:     arRS[0].IDG046,
                        NMTRANSP:   arRS[0].NMTRANSP,
                        NMCIDORC:   arRS[0].NMCIDORC,
                        CDESTORC:   arRS[0].CDESTORC,
                        NMCIDDEC:   arRS[0].NMCIDDEC,
                        CDESTDEC:   arRS[0].CDESTDEC,
                        TPOPERAC:   arRS[0].TPOPERAC,
                        PSCARGA:    arRS[0].PSCARGA,
                        VRCARGA:    arRS[0].VRCARGA,
                        VRFREPAG:   arRS[0].VRFREPAG,
                        QTDISPER:   arRS[0].QTDISPER,
                        DSTIPVEI:   arRS[0].DSTIPVEI,
                        DTCOLATU:   arRS[0].DTCOLATU,
                        TPOCUPAC:   arRS[0].TPOCUPAC,
                        VRPOROCU:   arRS[0].VRPOROCU,
                        URILINK:    strURL
                    };

                if (arRS[0].SNCARPAR == 'S') objHeader.DSTIPVEI = '-';

                objEmail.strMsg += api.htmlHeader(objHeader);

                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                while ((arRS.length > 0) && (arRS[0].IDG046 == objDados.IDG046)) {
                    
                    var objLoop = 
                        {
                            NRSEQETA: arRS[0].NRSEQETA,
                            NMCIDORP: arRS[0].NMCIDORP,
                            CDESTORP: arRS[0].CDESTORP,
                            NMCIDDEP: arRS[0].NMCIDDEP,
                            CDESTDEP: arRS[0].CDESTDEP,
                            PSDELETA: arRS[0].PSDELETA,
                            QTVOLCAR: arRS[0].QTVOLCAR,
                            QTDISETA: arRS[0].QTDISETA,
                            DTEAD:    arRS[0].DTEAD,
                            TXEXIGEN: arRS[0].TXEXIGEN
                        }

                    objEmail.strMsg += api.htmlLoop(objLoop);

                    arRS.shift();

                }

                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\
                
                objEmail.strMsg += ca.lerArquivo(emailFooter);

                var objSMTP = await api.enviaMensagem(objEmail);

                ttEnvio++;

                if (objSMTP.blOK) {

                    objDados.SNENVIO  = 1;                        
                    objDados.DSRESSRV = objSMTP.response;
                    
                } else {

                    objDados.SNENVIO  = 0;
                    objDados.DSRESSRV = objSMTP.message;

                }

                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                await api.salvaDados(objDados);

            }

            await parm.objConn.close();

            return arCargasOf;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Envia o email de oferecimento
     * @function api/enviaMensagem
     * @author Rafael Delfino Calzado
     * @since 16/04/2019
     *
     * @async 
     * @return {Object}     Retorna o objeto com o resultado da ação
     * @throws {Object}     Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\

    api.enviaMensagem = async function (req) {

        try {

            var param = 
                {
                    EMDESTIN: req.emDest,
                    DSASSUNT: `Oferecimento de Carga: #${req.idCarga}`,
                    DSMENSAG: req.strMsg
                };
           
            return await email.enviaEmail(param);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\    
    /**
     * Grava os dados de oferecimento no banco
     * @function api/salvaDados
     * @author Rafael Delfino Calzado
     * @since 20/05/2019
     *
     * @async 
     * @throws {Object}     Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\

    api.salvaDados = async function (req) {

        try {

            var objDados = fmt.setSchema(mdl.O005, req);
            objDados.objConn = req.objConn;

            await dao.controller.setConnection(objDados.objConn);
            await dao.alterar(objDados);

        } catch (err) {

            throw err;

        }

    }

   //-----------------------------------------------------------------------\\
    /**
     * Retorna o HTML inicial do email
     * @function api/htmlHeader
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @async 
     * @return {String}     Retorna uma string com o HTML composto
     * @throws {Object}     Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\    

    api.htmlHeader = function (parm) {

        var strHTML = ca.lerArquivo(emailHeader);

        parm.VRCARGA  = fmt.floatToCurrency(parm.VRCARGA);
        parm.QTDISPER = fmt.floatToCurrency(parm.QTDISPER);
        parm.PSCARGA  = fmt.floatToCurrency(parm.PSCARGA);
        parm.VRPOROCU = fmt.floatToCurrency(parm.VRPOROCU);
        parm.VRFREPAG = fmt.floatToCurrency(parm.VRFREPAG);

        strHTML = strHTML.replace('@URILINK@',  parm.URILINK);
        strHTML = strHTML.replace('@NMTRANSP@', parm.NMTRANSP);
        strHTML = strHTML.replace('@IDCARGA@',  parm.IDG046);

        strHTML = strHTML.replace('@NMCIDORC@', parm.NMCIDORC);
        strHTML = strHTML.replace('@CDESTORC@', parm.CDESTORC);
        strHTML = strHTML.replace('@NMCIDDEC@', parm.NMCIDDEC);
        strHTML = strHTML.replace('@CDESTDEC@', parm.CDESTDEC);

        strHTML = strHTML.replace('@PSCARGA@',  parm.PSCARGA);
        strHTML = strHTML.replace('@DSTIPVEI@', parm.DSTIPVEI);
        strHTML = strHTML.replace('@DTCOLATU@', parm.DTCOLATU);
        strHTML = strHTML.replace('@VRFREPAG@', parm.VRFREPAG); 
        strHTML = strHTML.replace('@VRCARGA@',  parm.VRCARGA); 
        strHTML = strHTML.replace('@QTDISPER@', parm.QTDISPER);
        strHTML = strHTML.replace('@TPOPERAC@', parm.TPOPERAC);
        strHTML = strHTML.replace('@TPOCUPAC@', parm.TPOCUPAC);
        strHTML = strHTML.replace('@VRPOROCU@', parm.VRPOROCU);
      
        return strHTML;

    }

    //-----------------------------------------------------------------------\\
    /**
     * Retorna o HTML para o Loop da parada
     * @function api/htmlLoop
     * @author Rafael Delfino Calzado
     * @since 17/04/2019
     *
     * @async 
     * @return {String}     Retorna uma string com o HTML composto
     * @throws {Object}     Retorna um objeto caso ocorra um erro
     */
    //-----------------------------------------------------------------------\\    

    api.htmlLoop = function (parm) {

        var strHTML = ca.lerArquivo(emailLoop);

        var txExige = (parm.TXEXIGEN) ? parm.TXEXIGEN : 'Sem exigências adicionais';
        txExige     = txExige.replace(/;/g, ` <br />\n - `);

        parm.QTDISETA = fmt.floatToCurrency(parm.QTDISETA);
        parm.PSDELETA = fmt.floatToCurrency(parm.PSDELETA);

        strHTML = strHTML.replace('@NRSEQETA@',  parm.NRSEQETA);

        strHTML = strHTML.replace('@NMCIDORP@',  parm.NMCIDORP);
        strHTML = strHTML.replace('@CDESTORP@',  parm.CDESTORP);

        strHTML = strHTML.replace('@NMCIDDEP@',  parm.NMCIDDEP);
        strHTML = strHTML.replace('@CDESTDEP@',  parm.CDESTDEP);

        strHTML = strHTML.replace('@PSDELETA@',  parm.PSDELETA);
        strHTML = strHTML.replace('@QTVOLCAR@',  parm.QTVOLCAR);
        strHTML = strHTML.replace('@QTDISETA@',  parm.QTDISETA);
        strHTML = strHTML.replace('@DTEAD@',     parm.DTEAD);
        strHTML = strHTML.replace('@TXEXIGEN@',  txExige);

        return strHTML;

    }

    //-----------------------------------------------------------------------\\    

    return api;

}