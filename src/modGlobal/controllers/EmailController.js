/**
 * @module modGlobal/controllers/EmailController
 * 
 * @requires NPM:nodemailer
*/
module.exports = function (app, cb) {

    const mail = require('nodemailer');

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * @description Envia um email
     *
     * @async 
     * @function envio
     * @param  	{Object} req.body Parâmetros da requisição
     * @returns {Object}  Retorna um objeto com o resultado do envio
     * 
     * @author Rafael Delfino Calzado
     * @since 20/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.envio = async function (req, res, next) {
        var objResult = await api.enviaEmail(req.body);

        var cdStatus  = (objResult.blOK) ? 200 : 500;

        res.status(cdStatus).send(objResult);
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Prepara os parâmetros e configurações para o envio do email
     *
     * @async 
     * @function enviaEmail
     * @param  	{Object}   req.body Parâmetros da requisição
     * @param  	{Array}    req.body.EMDESTIN Nome e Email do Destinatário
     * @param  	{String}   req.body.DSASSUNT Assunto do Email
     * @param  	{String}   req.body.DSMENSAG Corpo da mensagem
     * @returns {Object}   Retorna um objeto com o resultado do envio
     * 
     * @author Rafael Delfino Calzado
     * @since 20/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.enviaEmail = async function (req) {

        var arTo     = req.EMDESTIN; //array format
        var strSubj  = (req.DSASSUNT === undefined) ? 'Assunto' : req.DSASSUNT;
        var strMsg   = (req.DSMENSAG === undefined) ? '' : req.DSMENSAG;
        var arAttach = (req.ANEXO === undefined) ? [] : req.ANEXO;

        /*
        req.ANEXO = 
            [{   
                filename: 'text.bin',
                content: 'hello world!',
                contentType: 'text/plain'
            }];
        */

        var objMail = 
            {
                from:           `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to:             arTo,
                subject:        strSubj,
                html:           strMsg,
                attachments:    arAttach
            };

        var objConfig     = api.mailConfig();
        var smtpTransport = mail.createTransport(objConfig);

        var objResult = await smtpTransport.sendMail(objMail)
        .then((info) => {     
            info.blOK = true;
            return info;
        })

        .catch((err) => { 
            err.blOK = false;
            return err;
        });

        return objResult;        
    }

    //-----------------------------------------------------------------------\\
    /**
     * @description Retorna os parâmetros de configuração de envio
     *
     * @async 
     * @function mailConfig
     * @returns {Object}   Retorna um objeto com os parâmetros de configuração
     * 
     * @author Rafael Delfino Calzado
     * @since 20/04/2018
    */
    //-----------------------------------------------------------------------\\ 

    api.mailConfig = function () {

        var objConfig = {            
            host:       process.env.MAIL_HOST,
            port:       process.env.MAIL_PORT,
            service:    process.env.MAIL_DRIVER,

            tls: {
                rejectUnauthorized: false
            },

            auth: {
                user:   process.env.MAIL_FROM_ADDRESS,
                pass:   process.env.MAIL_PASSWORD
            }    
        };

        return objConfig;
    }

    //-----------------------------------------------------------------------\\

    return api;
}
