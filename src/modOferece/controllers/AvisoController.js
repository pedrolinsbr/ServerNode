module.exports = function (app, cb) {

    var api = {};

    const tmz    = app.src.utils.DataAtual;
    const utils  = app.src.utils.Formatador;
    const utilCA = app.src.utils.ConversorArquivos;
    const email  = app.src.modGlobal.controllers.EmailController;
    const mdl    = app.src.modOferece.models.AvisoModel;
    const dao    = app.src.modOferece.dao.AvisoDAO;            
    const gdao   = app.src.modGlobal.dao.GenericDAO;

    const headerFile = 'src/modOferece/templates/EmailHeader.html';
    const footerFile = 'src/modOferece/templates/EmailFooter.html';

    //-----------------------------------------------------------------------\\

    api.envia = async function (req, res, next) {

        var objConn = await gdao.controller.getConnection();
        req.objConn = objConn;

        await gdao.controller.setConnection(objConn);
        var rs = await dao.listarAvisos(req, res, next);
        
        var arOcorre  = [];
        var ttEnvio   = 0;
        var ttCommit  = 0;
        var ttReg     = rs.length;

        var strHeader = utilCA.lerArquivo(headerFile);
        var strFooter = utilCA.lerArquivo(footerFile);

        if (ttReg > 0) {
            
            var strURL = (rs[0].TPTRANSP == 'D') ? process.env.URL_LOGREV : process.env.URL_OFERECIMENTO
            strFooter = strFooter.replace('@LINK@', strURL);

            do {
                var objDados = {};
                objDados.objConn  = objConn;
                objDados.IDS001OF = req.body.IDS001OF;
                objDados.IDG046   = rs[0].IDG046;
                objDados.IDO005   = rs[0].IDO005;
                objDados.NMTRANSP = rs[0].NMTRANSP;
                objDados.EMTRANSP = rs[0].EMTRANSP.split(',');

                var strMsg = '';
                var strFim = '';

                strMsg += strHeader;
                strMsg += api.htmlCarga(rs[0]);
                strMsg += api.htmlParadaTH(rs[0]);
                strFim  = api.htmlParadaTF(rs[0]);
                strFim += strFooter;

                while ((rs.length > 0) && (objDados.IDG046 == rs[0].IDG046)) {
                    strMsg += api.htmlParadaTD(rs[0]);
                    rs.shift();
                }

                strMsg += strFim;                

                var param = 
                    { 
                        id:     objDados.IDG046,                        
                        emdest: objDados.EMTRANSP,
                        msg:    strMsg
                    }
                
                //::::::::::::: Email preparado :::::::::::::\\                

                if (await api.enviaMensagem(param)) {

                    ttEnvio++;
                    var objResult = await api.salvaOferecimento(objDados, res, next);
                    if (objResult.blOK) ttCommit++; else arOcorre = arOcorre.concat(objResult.arOcorre);

                } else {
                    arOcorre.push(`Erro ao enviar o email para ${param.emdest.join()}`);
                }

            } while (rs.length > 0);

        } else {
            arOcorre.push('Nenhum registro foi localizado');
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        if (arOcorre.length == 0) {
            var cdStatus = 200;
            await objConn.close();

        } else {
            var cdStatus = 500;
            await objConn.closeRollback();
        }

        res.status(cdStatus).send({ttReg, ttEnvio, ttCommit, arOcorre});
    }

    //-----------------------------------------------------------------------\\

    api.salvaOferecimento = async function (req, res, next) {
        
        var blOK     = false;
        var arOcorre = [];

        var objDados = req;
        var objConn  = objDados.objConn;
        
        delete objDados.objConn;

        var objOferece = utils.setSchema(mdl['O005'], objDados);
        objOferece.vlFields.STOFEREC = 'O';
        objOferece.vlFields.DTOFEREC = tmz.dataAtualJS();

        if (utils.validateSchema(objOferece)) { 
            
            await gdao.controller.setConnection(objConn);
            objOferece.objConn = objConn;

            await gdao.alterar(objOferece, res, next)
            .then(async (result) => {

                var objCarga = utils.setSchema(mdl['G046'], objDados);
                //objCarga.vlFields.IDS001  = objOferece.vlFields.IDS001OF;
                objCarga.vlFields.STCARGA = objOferece.vlFields.STOFEREC;

                if (utils.validateSchema(objCarga)) { 
                    
                    await gdao.controller.setConnection(objConn);
                    objCarga.objConn = objConn;

                    await gdao.alterar(objCarga, res, next)
                    .then((result) => {
                        blOK = true;
                    })
                    
                    .catch((err) => {
                        arOcorre.push(`Erro na alteração do Carga #${objDados.IDG046}`);
                    });

                } else {
                    arOcorre.push('Erro no objeto Carga');
                }
            })

            .catch((err) => {
                arOcorre.push(`Erro na alteração do Oferecimento #${objDados.IDO005}`);
            });

        } else {
            arOcorre.push('Erro no objeto Oferecimento');
        }    

        return { blOK, arOcorre };
    }

    //-----------------------------------------------------------------------\\

    api.enviaMensagem = async function (req) {
        var param = {
            EMDESTIN: req.emdest,
            DSASSUNT: `Oferecimento de Carga: ID# ${req.id}`,
            DSMENSAG: req.msg
        }

        var objResult = await email.enviaEmail(param);
        
        return objResult.blOK;
    }

    //-----------------------------------------------------------------------\\

    api.htmlCarga = function (param) {

        param.QTDISPER = parseFloat(param.QTDISPER.toFixed(2));
        param.VRCARGA  = parseFloat(param.VRCARGA.toFixed(2));
        param.PSCARGA  = parseFloat(param.PSCARGA.toFixed(2));
        param.VRPOROCU = parseFloat(param.VRPOROCU.toFixed(2));

        if (param.TPTRANSP == 'D')  {

            var strPlataforma = 'o Logística Reversa';
            var strOcupacao   = '';            

        } else {

            var strPlataforma = 'a P.I.B. (Plataforma de Integração Bravo)';

            var strOcupacao = 
                `<tr>
                    <td><b style="font-weight: 600;">Tipo de Ocupação:</b></td>
                    <td style="text-align: center;"><i>${param.TPOCUPAC}</i></td>
                </tr>
                <tr>
                    <td><b style="font-weight: 600;">Taxa de Ocupação (%):</b></td>
                    <td style="text-align: center;"><i>${param.VRPOROCU}</i></td>
                </tr>`;

            if (param.SNCARPAR == 'N') {

                strOcupacao += 
                    `<tr>
                        <td><b style="font-weight: 600;">Tipo de Veículo:</b></td>
                        <td style="text-align: center;"><i>${param.DSTIPVEI}</i></td>
                    </tr>`;

            }

        }       

        var strHTML = `
            <div class="row">
                <div class="col-md-12 text-center" style="text-align: center;font-size: 120%; color: #054283;">
                    <p style="font-weight: 900;"><small style="color: #ff8316;">${param.NMTRANSP}</small></p>
                    <p>Abaixo segue oferecimento para a carga <small style="color: #ff8316;">${param.IDG046}</small>. 
                    Por favor, acessar ${strPlataforma}.</p>
                    <p>para dar sequência nos processos de ACEITE e AGENDAMENTO.</p>
                </div>
            </div>
            <div class="row" style="padding-top: 0.5%; width: 50%;">
                <div  style="padding-left: 40%; color: #054283;">
  
                <h4 style="color: #ff8316; font-weight: 900;">Dados da Carga</h4>
  
                <table class="table table-striped">
                    <tr>
                        <td><b style="font-weight: 600;">ID Carga:</b></td>
                        <td style="text-align: center;"><i>${param.IDG046}</i></td>
                    </tr>
                    <tr>
                        <td><b style="font-weight: 600;">Operação:</b></td>
                        <td style="text-align: center;"><i>${param.TPOPERAC}</i></td>
                    </tr>
                    <tr>
                        <td><b style="font-weight: 600;">Origem:</b></td>
                        <td style="text-align: center;"><i>${param.NMCIDORC} / ${param.CDESTORC}</i></td>
                    </tr>
                    <tr>
                        <td><b style="font-weight: 600;">Destino:</b></td>
                        <td style="text-align: center;"><i>${param.NMCIDDEC} / ${param.CDESTDEC}</i></td>
                    </tr>
                    <tr>
                        <td><b style="font-weight: 600;">Peso Total (Kg):</b></td>
                        <td style="text-align: center;"><i>${param.PSCARGA}</i></td>
                    </tr>
                    <tr>
                        <td><b style="font-weight: 600;">Valor Carga (R$):</b></td>
                        <td style="text-align: center;"><i>${param.VRCARGA}</i></td>
                    </tr>
                    ${strOcupacao}
                    <tr>
                        <td><b style="font-weight: 600;">Distância Total (Km):</b></td>
                        <td style="text-align: center;"><i>${param.QTDISPER}</i></td>
                    </tr>
                    <tr>
                        <td><b style="font-weight: 600;">Previsão de Coleta:</b></td>
                        <td style="text-align: center;"><i>${param.DTCOLATU}</i></td>
                    </tr>
                </table>
            </div>
        </div>`;

        return strHTML;
    }

    //-----------------------------------------------------------------------\\

    api.htmlParadaTH = function () {
        var strHTML = `        
            <div class="row" style="padding-top: 0.5%; padding-bottom: 20px;">
                <div class="col-md-12" style="padding-left: 20%;padding-right: 20%; color: #054283;">
                    <h4 style="color: #ff8316; font-weight: 900;">Paradas</h4>
                    <table class="table table-striped">
                        <tr style="font-weight: 900;">
                            <td style="text-align: center;">#</td>
                            <td style="text-align: center;">Origem</td>
                            <td style="text-align: center;">Destino</td>
                            <td style="text-align: center;">Peso Total (Kg)</td>
                            <td style="text-align: center;">Qt. Volumes</td>
                            <td style="text-align: center;">Distância Total (Km)</td>
                            <td style="text-align: center;">Previsão de Entrega</td>
                        </tr>`;
  
        return strHTML;          
    }

    //-----------------------------------------------------------------------\\

    api.htmlParadaTF = function () {
        return `</table></div></div>`;
    }

    //-----------------------------------------------------------------------\\

    api.htmlParadaTD = function (param) {
        param.QTDISETA = parseFloat(param.QTDISETA.toFixed(2));
        param.PSDELETA = parseFloat(param.PSDELETA.toFixed(2));

        var strHTML = `
            <tr>
                <td style="text-align: center;">${param.NRSEQETA}</td>
                <td style="text-align: center;">${param.NMCIDORP} / ${param.CDESTORP}</td>
                <td style="text-align: center;">${param.NMCIDDEP} / ${param.CDESTDEP}</td>
                <td style="text-align: center;">${param.PSDELETA}</td>
                <td style="text-align: center;">${param.QTVOLCAR}</td>
                <td style="text-align: center;">${param.QTDISETA}</td>
                <td style="text-align: center;">${param.DTEAD}</td>
            </tr>`;
      
        return strHTML;
    }

    //-----------------------------------------------------------------------\\

    return api;
}
