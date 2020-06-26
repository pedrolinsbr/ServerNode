/**
 * @module controller/Email
 * @description Funções relacionadas ao procedimento envio de emails.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires dao/Pais
*/

//Config MAIL
const mail = require('nodemailer');

module.exports = function (app, cb) {

    var api  = {};
    var dao  = app.src.modMonitoria.dao.UsuarioDAO;
    var hash = app.src.modMonitoria.controllers.HashController;
    var logger = app.config.logger;
    //Carrega os dados do remetente ..::
    var smtpMonitoria = mail.createTransport({
        service: process.env.MAIL_DRIVER,
        host: process.env.MAIL_HOST,
        tls: {
            rejectUnauthorized:false
        },
        auth: {
            user: process.env.MAIL_FROM_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
        to: '', // list of receivers
        subject: 'Redefinição de senha - Bravo', // Subject line
        text: 'Redefinição de senha - Bravo', // plain text body
        html: ''
    };

    api.sendEmail = async function (usuario, urlHost, UserId) {

        var objAux = await dao.buscarInfoRegSenha(usuario)
        .then((result) => {
            return (result);
        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });
        
        mailOptions.to = objAux[0].DSEMALOG;
        mailOptions.firstName = objAux[0].NMUSUARI;
        // 1.3 - Get url for that user
        mailOptions.encrypt = await hash.encrypt(usuario.toString().trim());
        mailOptions.url = urlHost + '/#/forgot?hashcode=' + mailOptions.encrypt;
        mailOptions.decrypt = await hash.decrypt(mailOptions.encrypt);

        var passEncrypted = await dao.gravarHashcode(usuario, mailOptions.encrypt, UserId)
        .then((result) => {
            return (result);
        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });
        mailOptions.subject = 'Redefinição de senha - Bravo';
        mailOptions.text = 'Redefinição de senha - Bravo';

        mailOptions.html = `
        <!DOCTYPE html>
        <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Monitoria</title>
            </head>
            <body   style="width:70%;text-align:center"> 
            <table class="container" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgb(234,234,234);margin-top:0"> 
            <tbody>
            <tr> 
            <td align="center"> 
                
            <table class="shell" width="600" cellpadding="0" cellspacing="0" border="0"> 
                
                <tbody>
                <tr> 
                <td class="m_content-shell" bgcolor="#ffffff" style="background-repeat:no-repeat;background-color:rgb(255,255,255)"> 
                <table class="m_content" width="100%" cellpadding="0" cellspacing="0" border="0"> 
                    
                    <tbody>
                        <tr> 
                            <td class="m_logo" align="center" style="padding:46px 0 0 0">
                                <a href="http://www.bravolog.com.br/"
                                    style="color:inherit"
                                    target="_blank">
                                    <img src="http://www.bravolog.com.br/img/bravo-logo-01.png"
                                        alt="Bravo - Serviços Logísticos"
                                        width="145"
                                        align="center"
                                        style="border:none;outline:none;border-style:none"
                                        class="CToWUd">
                                </a>
                            </td> 
                        </tr>
                        <tr>
                            <td 
                                class="m_headline"
                                style="font-family:Helvetica,Arial,sans;font-weight:bold;font-size:32px;color:rgb(34,31,31);line-height:36px;padding:40px 90px 10px 90px">
                                
                                <span class="il">
                                    Redefinir
                                </span>
                                <span class="il">
                                    senha
                                </span>
                            </td> 
                        </tr> 
                    
                    
                    <tr> 
                    <td class="m_copy" style="padding:22px 90px 0 90px;font-family:Helvetica Neue,Helvetica,Roboto,Segoe UI,sans-serif;font-size:18px;line-height:24px"> Olá, ` + mailOptions.firstName + `, </td> 
                    </tr> 
                    
                    
                    <tr> 
                    <td class="m_copy" style="padding:22px 90px 0 90px;font-family:Helvetica Neue,Helvetica,Roboto,Segoe UI,sans-serif;font-size:18px;line-height:24px"> Vamos <span class="il">redefinir</span> sua <span class="il">senha</span> para que você comece a usar nossos produtos. </td> 
                    </tr> 
                    
                    
                    <tr> 
                    <td class="m_button-shell" style="padding:22px 90px 0 90px"> 
                    <table class="m_button m_red" cellpadding="0" cellspacing="0" border="0"> 
                        <tbody>
                        <tr> 
                        <td style="color:rgb(255,255,255);background-color:#F58220;padding:10px 16px;max-width:250px;border-radius:2px">
                            <a class="m_button-link"
                               href="` + mailOptions.url + `"
                               style="color:#ffffff;font-family:Helvetica,Arial,sans;font-size:14px;font-weight:bold;text-align:center;text-decoration:none;color:inherit;color:rgb(255,255,255);font-size:16px;line-height:24px;font-weight:normal;text-align:center;text-decoration:none;font-family:Helvetica Neue,Helvetica,Roboto,Segoe UI,sans-serif;letter-spacing:0.025em" target="_blank"><span class="il">REDEFINIR</span> <span class="il">SENHA</span></a> </td> 
                        </tr> 
                        </tbody>
                    </table> </td> 
                    </tr> 
                    
                    
                    <tr> 
                    <td class="m_copy" style="padding:22px 90px 0 90px;font-family:Helvetica Neue,Helvetica,Roboto,Segoe UI,sans-serif;font-size:18px;line-height:24px"> Estamos sempre prontos para ajudar, qualquer dúvida <a href="http://www.bravolog.com.br/contato.asp" target="_blank">entre em contato conosco</a>. </td> 
                    </tr> 
                    
                    
                    <tr> 
                    <td class="m_copy" style="padding:22px 90px 0 90px;font-family:Helvetica Neue,Helvetica,Roboto,Segoe UI,sans-serif;font-size:18px;line-height:24px"> – Bravo - Serviços Logísticos </td> 
                    </tr> 
                    
                    </tbody>
                </table> </td> 
                </tr> 
                </tbody>
            </table> 
            <table class="m_shell-footer" width="600" cellpadding="0" cellspacing="0" border="0"> 
                
                <tbody>
                <tr> 
                <td class="m_content-shell-footer"> 
                <table class="m_footer" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgb(34,31,31);text-align:initial;font-family:Helvetica,Arial,sans;font-size:13px;color:rgb(169,166,166);line-height:16px"> 
                    
                    <tbody>             
                    <tr> 
                    <td class="m_footer m_footer-copy" style="background-color:rgb(34,31,31);text-align:initial;font-family:Helvetica,Arial,sans;font-size:13px;color:rgb(169,166,166);line-height:16px;padding:15px 90px 0 90px"> Não responda a este email, pois a caixa deste endereço de email não é monitorada. </td> 
                    </tr> 
                    <tr> 
                    <td class="m_footer m_footer-copy" style="background-color:rgb(34,31,31);text-align:initial;font-family:Helvetica,Arial,sans;font-size:13px;color:rgb(169,166,166);line-height:16px;padding:15px 90px 0 90px"> Esta mensagem foi enviada para [<a href="#m__" style="text-decoration:none!important;color:#a9a6a6;color:rgb(169,166,166);color:inherit">"` + mailOptions.to + `"</a>] pela Bravo Logística. </td> 
                    </tr> 
                    <tr></tr>
                    </tbody>
                </table> </td> 
                </tr> 
                </tbody>
            </table></td> 
            </tr> 
            </tbody>
        </table>
        </body>
        </html>`;
        //console.log(mailOptions);

        return await smtpMonitoria.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };

    api.sendEmailAtendimento = async function (atendimento, email, urlHost, UserId) {
        const { idAtendimento, CDCTRC, NRNOTA } = atendimento;
        let contentNotas = '';
        if (Array.isArray(NRNOTA) && NRNOTA.length > 0) {
            NRNOTA.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item}</td></tr>`;
            });
        }else{
            contentNotas = `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }
        let contentCtes = '';
        if (Array.isArray(CDCTRC) && CDCTRC.length > 0) {
            CDCTRC.forEach(item => {
                contentCtes += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item}</td></tr>`;
            });
        }else{
            contentCtes = `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há CTE's</td></tr>`;
        }
        mailOptions.subject = 'Atendimento - Protocolo: #'+idAtendimento;
        mailOptions.text = 'Atendimento - Protocolo: #'+idAtendimento;
        mailOptions.to = email;

        mailOptions.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Atendimento</title>

            <style type="text/css">
            .myText{
                font-family: "Montserrat", Helvetica, sans-serif;
                font-weight: 350;
                letter-spacing: 0.06rem;
                font-size: 18px;
            }
            .box-center-title{
                text-align: center;
                background-color: red;
                margin-left: 20%;
                margin-right: 20%;
                margin-top: 20px;
                color: #fff;
                background: #f06724;
                padding-top: 10px;
                padding-bottom: 10px;
            }
            .box-center-content{
                text-align: center;
                background-color: red;
                margin-left: 20%;
                margin-right: 20%;
                color: #383838;
                background: #f5f5f5;
                padding-top: 40px;
                padding-bottom: 50px;
                padding-left: 10%;
                padding-right: 10%;

            }
            .myText-content{
                font-family: "Montserrat", Helvetica, sans-serif;
                font-weight: 350;
                letter-spacing: 0.02rem;
            }
            .button{
                background: #f06724;
                padding: 10px;
                padding-left: 20px;
                padding-right: 20px;
                color: #fff;
                font-weight: 350;
                text-decoration:none;
            }
            .container-table {
                display: flex;
                flex-direction: column;
                justifyContent: center;
                align-items: center;
            }
            </style>
        </head>
        <body>
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            <div style="padding-left: 43% !important;">
            <img src="http://www.bravolog.com.br/img/bravo-logo-01.png"
            alt="Bravo - Serviços Logísticos"
            width="145"
            align="center"
            style="border:none;outline:none;border-style:none"
            class="CToWUd">
            </div>

            <div class="box-center-title myText">
                NOVO ATENDIMENTO
            </div>
            <div class="box-center-content myText-content">
                <img src="https://png.icons8.com/ios/60/f06724/headset-filled.png"><br><br>
                OLÁ, O ATENDIMENTO <b>#` + idAtendimento + `</b> FOI ATRIBUIDO A VOCÊ EM NOSSA PLATAFORMA.
                <div class="container-table">
                    <table>
                        <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                            <th style="padding-top: 12px;
                                padding-bottom: 12px;
                                background: #f06724;
                                color: white;width: 350px;">Número do CTE</th>
                        </tr>
                        ${contentCtes}
                    </table></br></br>
                    <table>
                        <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                            <th style="padding-top: 12px;
                                padding-bottom: 12px;
                                background: #f06724;
                                color: white;width: 350px;">Número da Nota</th>
                        </tr>
                        ${contentNotas}
                    </table></br></br>
                </div>
            </div>
            </div>
        </body>
        </html>

        `;
        //console.log(mailOptions);
        if(idAtendimento){
            return await smtpMonitoria.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(response);
                    return response;
                }
            });
        }else{
            return 'Erro, sem id de atendimento'
        }
        // 1.4 - Can send the e-mail */

    };
    //api.sendEmailAtendimento(null, null, null);

    api.sendEmailEntregaSyngenta = async function (cdrastre, email, urlHost, UserId, notas) {
        let mailSyngenta = require('nodemailer');

        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let contentNotas = '';
        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }else{
            contentNotas = `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 20%;
                    margin-right: 20%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 10%;
                    padding-right: 10%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                </style>
            </head>
            <body>
        
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            
                <table cellpadding="0" cellspacing="0" width="100%" style="Margin-top:40px;">
                    <tbody>
                        <tr>
                        <td bgcolor="#ffffff" align="left">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="135" style="width:135px;max-width:135px;min-width:135px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://www.bravolog.com.br/img/bravo-logo-01.png">
                            </a>
                        </td>
                        <td bgcolor="#ffffff" align="right" style="padding-top: 60px">
                            <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/syngenta.png">
                        </td>
                        </tr>
                    </tbody>
                </table>
                    

                    <div class="box-center-title myText">
                        RASTREIE SUA ENTREGA
                    </div>

                    <div class="box-center-content myText-content">
                        <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                        OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                        <div style="margin-left: 10%;margin-right: 10%;"></br></br>
                            <table>
                                <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;width: 350px;">Número da Nota</th>
                                </tr>
                                ${contentNotas}
                            </table></br></br>
                        </div>
                        VOCÊ PODE ACOMPANHAR A ENTREGA <b>`+ cdrastre + `</b> <br>ATRAVÉS DO LINK:
                        <div class="row" style="margin-top: 35px; margin-bottom: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=`+cdrastre+`">Acessar</a> <!-- APONTAR PARA O LINK CORRETO-->
                        </div>
                        OU BUSCAR POR OUTRAS ENTREGAS:
                        <div class="row"style="margin-top: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a> <!-- APONTAR PARA O LINK CORRETO-->
                        </div>
                    </div>
                    <div style="text-align:center;">
                        Em caso de duvidas ou esclarecimentos entrar em contato com o Centro Avançado Syngenta de Atendimento<br>
                        <img src="http://monitoria.evolog.com.br/assets/images/casa.png" alt="" width="150px">
                        <h2 style="font-family: arial;">0800 704 4304</h2>
                    </div>


                </div>
            </body>
            </html>

            `;
        
        let mailOptionsSyngenta = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega', // Subject line
            text: 'Rastreamento de Entrega', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaSyngenta = mailSyngenta.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaSyngenta.sendMail(mailOptionsSyngenta, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };
    //api.sendEmailEntrega(null, null, null);

    api.sendEmailEntrega = async function (cdrastre, email, urlHost, UserId, notas) {
        let mailPadrao = require('nodemailer');

        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let contentNotas = '';
        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }else{
            contentNotas = `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }
      
            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-left: 20%;
                    margin-right: 20%;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 20%;
                    margin-right: 20%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 10%;
                    padding-right: 10%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                </style>
            </head>
            <body>
                <div style="height: 100%; width: 100%; padding-top: 40px;">
                <div style="padding-left: 43% !important;">
                <img src="http://www.bravolog.com.br/img/bravo-logo-01.png"
                alt="Bravo - Serviços Logísticos"
                width="145"
                align="center"
                style="border:none;outline:none;border-style:none"
                class="CToWUd">
                </div>

                <div class="box-center-title myText">
                    RASTREIE SUA ENTREGA
                </div>
                <div class="box-center-content myText-content">
                    <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                    OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                    <div style="margin: 0 auto;width: 350px;"></br></br>
                        <table>
                            <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                <th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background: #f06724;
                                    color: white;width: 350px;">Número da Nota</th>
                            </tr>
                            ${contentNotas}
                        </table></br></br>
                    </div>
                    VOCÊ PODE ACOMPANHAR A ENTREGA <b>`+ cdrastre + `</b> <br>ATRAVÉS DO LINK:
                    <div class="row" style="margin-top: 35px; margin-bottom: 35px;">
                    <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=`+cdrastre+`">Acessar</a> <!-- APONTAR PARA O LINK CORRETO-->
                    </div>
                    OU BUSCAR POR OUTRAS ENTREGAS:
                    <div class="row"style="margin-top: 35px;">
                    <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a> <!-- APONTAR PARA O LINK CORRETO-->
                    </div>
                </div>
                </div>
            </body>
            </html>

            `;
        
        let mailOptionsPadrao = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega', // Subject line
            text: 'Rastreamento de Entrega', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaPadrao = mailPadrao.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaPadrao.sendMail(mailOptionsPadrao, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };
    //api.sendEmailEntrega(null, null, null);

    api.sendEmailSatisfacao = async function (CDCTRC, notas, email, token, urlHost, UserId) {
        let mailSyngentaNps = require('nodemailer');

        // mailOptions.subject = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.text = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.to = email;
        

        let htmlText = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pesquisa de Satisfação</title>

            <style type="text/css">
            .myText{
                font-family: "Montserrat", Helvetica, sans-serif;
                font-weight: 350;
                letter-spacing: 0.06rem;
                font-size: 18px;
            }
            .box-center-title{
                text-align: center;
                background-color: red;
                margin-left: 20%;
                margin-right: 20%;
                margin-top: 20px;
                color: #fff;
                background: #f06724;
                padding-top: 10px;
                padding-bottom: 10px;
            }
            .box-center-content{
                text-align: center;
                background-color: red;
                margin-left: 20%;
                margin-right: 20%;
                color: #383838;
                background: #f5f5f5;
                padding-top: 40px;
                padding-bottom: 50px;
                padding-left: 10%;
                padding-right: 10%;

            }
            .myText-content{
                font-family: "Montserrat", Helvetica, sans-serif;
                font-weight: 350;
                letter-spacing: 0.02rem;
            }
            .button{
                background: #f06724;
                padding: 10px;
                padding-left: 20px;
                padding-right: 20px;
                color: #fff;
                font-weight: 350;
                text-decoration:none;
            }
            </style>
        </head>
        <body>
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            <div style="padding-left: 43% !important;">
            <img src="http://www.bravolog.com.br/img/bravo-logo-01.png"
            alt="Bravo - Serviços Logísticos"
            width="145"
            align="center"
            style="border:none;outline:none;border-style:none"
            class="CToWUd">
            </div>

            <div class="box-center-title myText">
                AVALIE SUA ENTREGA
            </div>
            <div class="box-center-content myText-content">
                Olá, Em uma escala de 0 a 5,
                Qual o seu grau de satisfação com a entrega do conhecimento [`+ CDCTRC + `]?

                <!--<div style="width: 100%;margin-top: 25px;">
                 <img src="https://i.imgur.com/BN4PBUe.png" style="width: 320px;">
                </div>-->

                <div style="width: 100%;margin-top: 25px;">
                <a class="button" target="_blank" href="`+ urlHost + `#/satisfacao?param=`+ token +`">AVALIAR</a>
                </div>

            </div>
            </div>
        </body>
        </html>
        `;

        let mailOptionsSyngentaNps = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Pesquisa de Satisfação - #' + CDCTRC, // Subject line
            text: 'Pesquisa de Satisfação - #' + CDCTRC, // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaSyngentaNps = mailSyngentaNps.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        //console.log(mailOptions);

        return await smtpMonitoriaSyngentaNps.sendMail(mailOptionsSyngentaNps, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };

    api.sendEmailSatisfacaoV2 = async function (CDCTRC, notas, email, token, urlHost, UserId) {
        let mailNpsV2 = require('nodemailer');

        // mailOptions.subject = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.text = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let contentNotas = '';

        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
    <style>
    #customers {
        font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }
    
    #customers td, #customers th {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
    }
    
    #customers tr:nth-child(even){background-color: #f2f2f2;}
    
    #customers tr:hover {background-color: #ddd;}
    
    #customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        background-color: #00386C;
        color: white;
    }
    </style>
    </head>
    <body>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        
        <tbody><tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-top:1px solid #d9d9d9;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;Margin-top:40px">
                    <tbody><tr>
                        <td bgcolor="#ffffff" align="center" valign="middle" style="padding:40px 0px 40px 0px">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="155" style="display:block;width:155px;max-width:155px;min-width:155px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://www.bravolog.com.br/img/bravo-logo-01.png">
                            </a>
                        </td>
                    </tr>
                </tbody></table>
                
            </td>
        </tr>
        
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                    <tbody>
                        <tr>
                            <td bgcolor="#00386C" align="center" valign="top" style="padding:10px 0px;color:#ffffff;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:20px;font-weight:400">
                              <span style="font-size:32px;font-weight:400;">Pesquisa de Satisfação Logística</span>
                            </td>
                        </tr>
                    </tbody>
                </table>            
            </td>
        </tr>
        
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                    <tbody>
                        <tr>
                            <td bgcolor="#ffffff" align="justify" style="padding:20px 30px 15px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
                                <p style="Margin:0px">Agradecemos antecipadamente por sua participação em nossa pesquisa.</p>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" align="justify" style="padding:20px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
                                <p style="Margin:0px">Essa pesquisa é referente a entrega das seguintes Notas-Fiscais:</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding:20px 30px 40px;">
                                <table id="customers" style="Margin: 0px;border: 1px solid #000;font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
                                border-collapse: collapse;
                                width: 100%;">
                                    <tr style="border: 1px solid #ddd;padding: 8px;text-align: center;">
                                        <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background-color: #00386C;
                                        color: white;">Número da Nota</th>
                                    </tr>
                                    ${contentNotas}
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:25px">
                                <p style="Margin:0px;padding-left:10px;padding-right:10px">Em uma escala de 0 a 10, Como você avalia o Serviço Logístico prestado para esta entrega?</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                
                
            </td>
        </tr>
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody><tr>
                    <td bgcolor="#ffffff" align="left">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tbody><tr>
                          <td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px">
                            <table border="0" cellspacing="0" cellpadding="0">
                              <tbody><tr>	
                                  <td align="center">
                                      <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=1" target="_blank">
                                          1<img alt="1" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                      </a>
                                  </td>
                                  <td align="center">
                                      <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=2" target="_blank">
                                          2<img alt="2" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                      </a>
                                  </td>
                                  <td align="center">
                                      <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=3" target="_blank">
                                          3<img alt="3" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                      </a>
                                  </td>
                                  <td align="center">
                                      <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=4" target="_blank">
                                          4<img alt="4" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                      </a>
                                  </td>
                                  <td align="center">
                                      <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=5" target="_blank">
                                          5<img alt="5" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                      </a>
                                  </td>
                                  <td align="center">
                                        <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=6" target="_blank">
                                            6<img alt="6" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                        </a>
                                    </td>
                                    <td align="center">
                                        <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=7" target="_blank">
                                            7<img alt="7" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                        </a>
                                    </td>
                                    <td align="center">
                                        <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=8" target="_blank">
                                            8<img alt="8" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                        </a>
                                    </td>
                                    <td align="center">
                                        <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=9" target="_blank">
                                            9<img alt="9" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                        </a>
                                    </td>
                                    <td align="center">
                                        <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=10" target="_blank">
                                            10<img alt="10" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                        </a>
                                    </td>
                              </tr>
                            </tbody></table>
                          </td>
                        </tr>
                      </tbody></table>
                    </td>
                  </tr>
                </tbody></table>
                
            </td>
        </tr>
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody><tr>
                    <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                        <p style="Margin:0;text-align:center;color:#a5a5a5">Responda com um clique</p>
                    </td>
                  </tr>
                </tbody></table>
                
            </td>
        </tr>
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                    <tbody><tr>
                        <td bgcolor="#ffffff" align="justify" style="padding:0px 30px 32px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
                              <p style="Margin:0px">Agradecemos sua colaboração! Estamos seguros que nos ajudará a oferecer um serviço cada vez melhor.</p>
                        </td>
                      </tr>
                </tbody></table>
                
            </td>
        </tr>
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody><tr>
                    <td bgcolor="#ffffff" align="center" style="padding:0px 30px 16px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                        <p style="Margin:0;text-align:center">Até a próxima, Bravo Serviços Logísticos.</p>
                    </td>
                  </tr>
                </tbody></table>
                
            </td>
        </tr>
        <tr>
            <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody><tr>
                    <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;line-height:25px">
                        <p style="Margin:0;text-align:center;color:#a5a5a5">${token}  Se deseja não receber mais mensagens como esta, <a href="`+ urlHost + `#/satisfacao?param=`+ token +`&unsub=1" target="_blank">descadastre-se.</a></p>
                    </td>
                  </tr>
                </tbody></table>
                
            </td>
        </tr>
        
    </tbody></table></body>
            </html>
            `; 
        
        
        let mailOptionsNpsV2 = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Pesquisa de Satisfação - #' + CDCTRC, // Subject line
            text: 'Pesquisa de Satisfação - #' + CDCTRC, // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaNpsV2 = mailNpsV2.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });


        //console.log(mailOptions);

        return await smtpMonitoriaNpsV2.sendMail(mailOptionsNpsV2, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };
    
    
    api.sendEmailSatisfacaoV2Syngenta = async function (CDCTRC, notas, email, token, urlHost, UserId) {
        let mailSyngentaNpsV2 = require('nodemailer');

        // mailOptions.subject = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.text = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';
        
        let contentNotas = '';

        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }

            let htmlText = `
            <!DOCTYPE html>
        <html>
        <head>
<style>
#customers {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}

#customers td, #customers th {
    border: 1px solid #ddd;
    padding: 8px;
	text-align: center;
}

#customers tr:nth-child(even){background-color: #f2f2f2;}

#customers tr:hover {background-color: #ddd;}

#customers th {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: #00386C;
    color: white;
}
</style>
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
    
    <tbody><tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-top:1px solid #d9d9d9;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;Margin-top:40px">
                <tbody><tr bgcolor="#ffffff">
                <td align="left">
                    <a href="http://www.bravolog.com.br/" target="_blank">
                        <img width="135" style="width:135px;max-width:135px;min-width:135px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://www.bravolog.com.br/img/bravo-logo-01.png">
                    </a>
                </td>
                <td align="right" style="padding-top: 60px">
                    <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/syngenta.png">
                </td>
                </tr>
            </tbody></table>
            
        </td>
    </tr>
    
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody>
					<tr>
						<td bgcolor="#00386C" align="center" valign="top" style="padding:10px 0px;color:#ffffff;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:20px;font-weight:400">
						  <span style="font-size:32px;font-weight:400;"><b>Pesquisa de Satisfação Logística</b></span>
						</td>
					</tr>
				</tbody>
			</table>            
        </td>
    </tr>
    
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            	<tbody>
					<tr>
						<td bgcolor="#ffffff" align="justify" style="padding:20px 30px 15px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
							<p style="Margin:0px">Agradecemos antecipadamente por sua participação em nossa pesquisa.</p>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" align="justify" style="padding:20px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
							<p style="Margin:0px">Essa pesquisa é referente a entrega das seguintes Notas-Fiscais:</p>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding:20px 30px 40px;">
							<table id="customers" style="Margin: 0px;border: 1px solid #000;font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
                            border-collapse: collapse;
                            width: 100%;">
								<tr style="border: 1px solid #ddd;padding: 8px;text-align: center;">
									<th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background-color: #00386C;
                                    color: white;">Número da Nota</th>
								</tr>
								${contentNotas}
							</table>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:25px">
							<p style="Margin:0px;padding-left:10px;padding-right:10px">Em uma escala de 0 a 10, Como você avalia o Serviço Logístico prestado para esta entrega?</p>
						</td>
					</tr>
				</tbody>
			</table>
			
			
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="left">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody><tr>
                      <td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tbody><tr>	
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=1" target="_blank">
                              		1<img alt="1" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=2" target="_blank">
                              		2<img alt="2" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=3" target="_blank">
                              		3<img alt="3" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=4" target="_blank">
                              		4<img alt="4" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=5" target="_blank">
                              		5<img alt="5" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=6" target="_blank">
                                        6<img alt="6" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=7" target="_blank">
                                        7<img alt="7" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=8" target="_blank">
                                        8<img alt="8" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=9" target="_blank">
                                        9<img alt="9" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=10" target="_blank">
                                        10<img alt="10" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                          </tr>
                        </tbody></table>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center;color:#a5a5a5">Responda com um clique</p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            	<tbody><tr>
                	<td bgcolor="#ffffff" align="justify" style="padding:0px 30px 32px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
                  		<p style="Margin:0px">Agradecemos sua colaboração! Estamos seguros que nos ajudará a oferecer um serviço cada vez melhor.</p>
                	</td>
              	</tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 16px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center">Até a próxima, Bravo Serviços Logísticos.</p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
	<tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center;color:#a5a5a5">${token}  Se deseja não receber mais mensagens como esta, <a href="`+ urlHost + `#/satisfacao?param=`+ token +`&unsub=1" target="_blank">descadastre-se.</a></p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#ffffff" align="center" style="padding:0px 30px 16px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
            <p style="Margin:0;text-align:center"> Em caso de duvidas ou esclarecimentos entrar em contato com o Centro Avançado Syngenta de Atendimento</p>
            <img src="http://monitoria.evolog.com.br/assets/images/casa.png" alt="" width="150px">
            <h2 style="font-family: arial;">0800 704 4304</h2>
        </td>
    </tr>
    
</tbody></table></body>
        </html>
            `;  
        
        let mailOptionsSyngentaNpsV2 = {
            from: `"Evolog - Satisfação Syngenta" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email + ',vinicius.santos@syngenta.com, Natiele_Vitoria.Gomes@syngenta.com', // list of receivers (acrescimo dos e-mails de verificação da syngenta manualmente até estruturarmos o contato por operação)
            subject: 'Pesquisa de Satisfação Logística Syngenta - #' + CDCTRC, // Subject line
            text: 'Pesquisa de Satisfação Logística Syngenta - #' + CDCTRC, // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaSyngentaNpsV2 = mailSyngentaNpsV2.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });


        //console.log(mailOptions);

        return await smtpMonitoriaSyngentaNpsV2.sendMail(mailOptionsSyngentaNpsV2, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };


    api.sendEmailSatisfacaoV2Fmc = async function (CDCTRC, notas, email, token, urlHost, UserId) {
        let mailFmcNpsV2 = require('nodemailer');

        // mailOptions.subject = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.text = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';
        
        let contentNotas = '';

        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }

            let htmlText = `
            <!DOCTYPE html>
        <html>
        <head>
<style>
#customers {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}

#customers td, #customers th {
    border: 1px solid #ddd;
    padding: 8px;
	text-align: center;
}

#customers tr:nth-child(even){background-color: #f2f2f2;}

#customers tr:hover {background-color: #ddd;}

#customers th {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: #00386C;
    color: white;
}
</style>
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
    
    <tbody><tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-top:1px solid #d9d9d9;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;Margin-top:40px">
                <tbody><tr bgcolor="#ffffff">
                <td align="left" style="padding-top: 60px">
                    <a href="http://www.bravolog.com.br/" target="_blank">
                        <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                    </a>
                </td>
                <td align="right" style="padding-top: 60px">
                    <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/logo_FMC_final_rgb.png">
                </td>
                </tr>
            </tbody></table>
            
        </td>
    </tr>
    
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody>
					<tr>
						<td bgcolor="#00386C" align="center" valign="top" style="padding:10px 0px;color:#ffffff;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:20px;font-weight:400">
						  <span style="font-size:32px;font-weight:400;">Pesquisa de Satisfação Logística</span>
						</td>
					</tr>
				</tbody>
			</table>            
        </td>
    </tr>
    
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            	<tbody>
					<tr>
						<td bgcolor="#ffffff" align="justify" style="padding:20px 30px 15px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
							<p style="Margin:0px">Agradecemos antecipadamente por sua participação em nossa pesquisa.</p>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" align="justify" style="padding:20px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
							<p style="Margin:0px">Essa pesquisa é referente a entrega das seguintes Notas-Fiscais:</p>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding:20px 30px 40px;">
							<table id="customers" style="Margin: 0px;border: 1px solid #000;font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
                            border-collapse: collapse;
                            width: 100%;">
								<tr style="border: 1px solid #ddd;padding: 8px;text-align: center;">
									<th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background-color: #00386C;
                                    color: white;">Número da Nota</th>
								</tr>
								${contentNotas}
							</table>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:25px">
							<p style="Margin:0px;padding-left:10px;padding-right:10px">Em uma escala de 0 a 10, Como você avalia o Serviço Logístico prestado para esta entrega?</p>
						</td>
					</tr>
				</tbody>
			</table>
			
			
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="left">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody><tr>
                      <td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tbody><tr>	
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=1" target="_blank">
                              		1<img alt="1" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=2" target="_blank">
                              		2<img alt="2" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=3" target="_blank">
                              		3<img alt="3" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=4" target="_blank">
                              		4<img alt="4" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=5" target="_blank">
                              		5<img alt="5" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=6" target="_blank">
                                        6<img alt="6" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=7" target="_blank">
                                        7<img alt="7" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=8" target="_blank">
                                        8<img alt="8" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=9" target="_blank">
                                        9<img alt="9" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=10" target="_blank">
                                        10<img alt="10" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                          </tr>
                        </tbody></table>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center;color:#a5a5a5">Responda com um clique</p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            	<tbody><tr>
                	<td bgcolor="#ffffff" align="justify" style="padding:0px 30px 32px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
                  		<p style="Margin:0px">Agradecemos sua colaboração! Estamos seguros que nos ajudará a oferecer um serviço cada vez melhor.</p>
                	</td>
              	</tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 16px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center">Até a próxima, Bravo Serviços Logísticos.</p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
	<tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center;color:#a5a5a5">${token}  Se deseja não receber mais mensagens como esta, <a href="`+ urlHost + `#/satisfacao?param=`+ token +`&unsub=1" target="_blank">descadastre-se.</a></p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>

</tbody></table></body>
        </html>
            `;  


        let mailOptionsFmcNpsV2 = {
            from: `"Evolog - Satisfação FMC" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Pesquisa de Satisfação FMC - #' + CDCTRC, // Subject line
            text: 'Pesquisa de Satisfação FMC - #' + CDCTRC, // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaFmcNpsV2 = mailFmcNpsV2.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaFmcNpsV2.sendMail(mailOptionsFmcNpsV2, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };


    api.sendEmailSatisfacaoV2Adama = async function (CDCTRC, notas, email, token, urlHost, UserId) {
        let mailAdamaNpsV2 = require('nodemailer');

        // mailOptions.subject = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.text = 'Pesquisa de Satisfação - #' + CDCTRC;
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';
        
        let contentNotas = '';

        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }

            let htmlText = `
            <!DOCTYPE html>
        <html>
        <head>
<style>
#customers {
    font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
}

#customers td, #customers th {
    border: 1px solid #ddd;
    padding: 8px;
	text-align: center;
}

#customers tr:nth-child(even){background-color: #f2f2f2;}

#customers tr:hover {background-color: #ddd;}

#customers th {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: #00386C;
    color: white;
}
</style>
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
    
    <tbody><tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-top:1px solid #d9d9d9;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;Margin-top:40px">
                <tbody><tr bgcolor="#ffffff">
                <td align="left" style="padding-top: 60px">
                    <a href="http://www.bravolog.com.br/" target="_blank">
                        <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                    </a>
                </td>
                <td align="right" style="padding-top: 60px">
                    <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/Logo_ADAMA.png">
                </td>
                </tr>
            </tbody></table>
            
        </td>
    </tr>
    
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                <tbody>
					<tr>
						<td bgcolor="#00386C" align="center" valign="top" style="padding:10px 0px;color:#ffffff;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:20px;font-weight:400">
						  <span style="font-size:32px;font-weight:400;">Pesquisa de Satisfação Logística</span>
						</td>
					</tr>
				</tbody>
			</table>            
        </td>
    </tr>
    
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            	<tbody>
					<tr>
						<td bgcolor="#ffffff" align="justify" style="padding:20px 30px 15px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
							<p style="Margin:0px">Agradecemos antecipadamente por sua participação em nossa pesquisa.</p>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" align="justify" style="padding:20px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
							<p style="Margin:0px">Essa pesquisa é referente a entrega das seguintes Notas-Fiscais:</p>
						</td>
					</tr>
					<tr>
						<td align="center" style="padding:20px 30px 40px;">
							<table id="customers" style="Margin: 0px;border: 1px solid #000;font-family: 'Trebuchet MS', Arial, Helvetica, sans-serif;
                            border-collapse: collapse;
                            width: 100%;">
								<tr style="border: 1px solid #ddd;padding: 8px;text-align: center;">
									<th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background-color: #00386C;
                                    color: white;">Número da Nota</th>
								</tr>
								${contentNotas}
							</table>
						</td>
					</tr>
					<tr>
						<td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:25px">
							<p style="Margin:0px;padding-left:10px;padding-right:10px">Em uma escala de 0 a 10, Como você avalia o Serviço Logístico prestado para esta entrega?</p>
						</td>
					</tr>
				</tbody>
			</table>
			
			
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="left">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody><tr>
                      <td bgcolor="#ffffff" align="center" style="padding:0px 30px 0px 30px">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tbody><tr>	
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=1" target="_blank">
                              		1<img alt="1" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fd363c;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Jamais recomendaria!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=2" target="_blank">
                              		2<img alt="2" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=3" target="_blank">
                              		3<img alt="3" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#fe8a2d;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Não recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=4" target="_blank">
                              		4<img alt="4" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                              	<a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=5" target="_blank">
                              		5<img alt="5" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                              	</a>
                              </td>
                              <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#ffcb45;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Neutro" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=6" target="_blank">
                                        6<img alt="6" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=7" target="_blank">
                                        7<img alt="7" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#89b239;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Sim, recomendaria." href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=8" target="_blank">
                                        8<img alt="8" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=9" target="_blank">
                                        9<img alt="9" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                                <td align="center">
                                    <a style="font-size:20px;font-family:Helvetica,Arial,sans-serif;color:#389839;text-decoration:none;text-decoration:none;padding:15px 5px;display:inline-block" title="Recomendaria muito!" href="`+ urlHost + `/monitoria_email/#/satisfacao?param=`+ token +`&n=10" target="_blank">
                                        10<img alt="10" src="https://ci4.googleusercontent.com/proxy/-7fOVxr_gHsWBCYUqBw0Jra0k4WV7oOHmh1myjGBjNssCsSXeT29mEAQB9FyL_J2pOERjw4sSTabOGGnEfQGpBY0CQSMpU-PKrQy5TgEI5Psd1AZ=s0-d-e1-ft#https://s3-sa-east-1.amazonaws.com/emails-tagme/starbig@2x.png" width="15" height="14" style="display:block;width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18px;vertical-align:middle;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" class="CToWUd">
                                    </a>
                                </td>
                          </tr>
                        </tbody></table>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center;color:#a5a5a5">Responda com um clique</p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            	<tbody><tr>
                	<td bgcolor="#ffffff" align="justify" style="padding:0px 30px 32px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;line-height:25px">
                  		<p style="Margin:0px">Agradecemos sua colaboração! Estamos seguros que nos ajudará a oferecer um serviço cada vez melhor.</p>
                	</td>
              	</tr>
            </tbody></table>
            
        </td>
    </tr>
    <tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 16px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center">Até a próxima, Bravo Serviços Logísticos.</p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>
	<tr>
        <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
            
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
            <tbody><tr>
                <td bgcolor="#ffffff" align="center" style="padding:0px 30px 40px 30px;color:#666666;font-family:'Lato',Helvetica,Arial,sans-serif;font-size:8px;font-weight:400;line-height:25px">
                	<p style="Margin:0;text-align:center;color:#a5a5a5">${token}  Se deseja não receber mais mensagens como esta, <a href="`+ urlHost + `#/satisfacao?param=`+ token +`&unsub=1" target="_blank">descadastre-se.</a></p>
                </td>
              </tr>
            </tbody></table>
            
        </td>
    </tr>

</tbody></table></body>
        </html>
            `;  


        let mailOptionsAdamaNpsV2 = {
            from: `"Evolog - Satisfação Adama" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Pesquisa de Satisfação Adama - #' + CDCTRC, // Subject line
            text: 'Pesquisa de Satisfação Adama - #' + CDCTRC, // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaAdamaNpsV2 = mailAdamaNpsV2.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaAdamaNpsV2.sendMail(mailOptionsAdamaNpsV2, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };



    api.sendEmailEntregaFmc = async function (cdrastre, email, urlHost, UserId, notas) {
        let mailFmc = require('nodemailer');
        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let contentNotas = '';
        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }else{
            contentNotas = `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 20%;
                    margin-right: 20%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 10%;
                    padding-right: 10%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                </style>
            </head>
            <body>
        
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            
                <table cellpadding="0" cellspacing="0" width="100%" style="Margin-top:40px;">
                    <tbody>
                        <tr>
                        <td bgcolor="#ffffff" align="left" style="padding-top: 60px">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                            </a>
                        </td>
                        <td bgcolor="#ffffff" align="right" style="padding-top: 60px">
                            <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/logo_FMC_final_rgb.png">
                        </td>
                        </tr>
                    </tbody>
                </table>
                    

                    <div class="box-center-title myText">
                        RASTREIE SUA ENTREGA
                    </div>

                    <div class="box-center-content myText-content">
                        <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                        OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                        <div style="margin-left: 10%;margin-right: 10%;"></br></br>
                            <table>
                                <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;width: 350px;">Número da Nota</th>
                                </tr>
                                ${contentNotas}
                            </table></br></br>
                        </div>
                        VOCÊ PODE ACOMPANHAR A ENTREGA <b>`+ cdrastre + `</b> <br>ATRAVÉS DO LINK:
                        <div class="row" style="margin-top: 35px; margin-bottom: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=`+cdrastre+`">Acessar</a> <!-- APONTAR PARA O LINK CORRETO-->
                        </div>
                        OU BUSCAR POR OUTRAS ENTREGAS:
                        <div class="row"style="margin-top: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a> <!-- APONTAR PARA O LINK CORRETO-->
                        </div>
                    </div>

                </div>
            </body>
            </html>

            `;
        
        let mailOptionsFmc = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega', // Subject line
            text: 'Rastreamento de Entrega', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaFmc = mailFmc.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaFmc.sendMail(mailOptionsFmc, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };
    //api.sendEmailEntrega(null, null, null);


    api.sendAtendimento = async function (emails, InfoAtendimento, urlHost, UserId, InfoMovimentacao, informacoesNota, status, idAtendimento ,buf, file) {

        let mailOptionsAtd = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: '', // list of receivers
            subject: '', // Subject line
            text: '', // plain text body
            html: '',
            attachments: []
        };

        // objDeliv.ext = ((deliveries[index].NMDOCUME).substring((deliveries[index].NMDOCUME).lastIndexOf(".") + 1)).toLowerCase();

        

        //Se o buf não estiver nulo, significa que foram anexados arquivos, e é aqui que eles se tornam anexos de email(Attachments)
        if(buf){
            for (let index = 0; index < buf.length; index++) {
                mailOptionsAtd.attachments.push(  
                    {   
                        filename: file[index],
                        content:  Buffer.from(buf[index], 'base64'),
                        encoding: 'base64'
                    }
                  )
            }

        }
        

        mailOptionsAtd.subject = 'Atendimento Protocolo - ' + idAtendimento;
        mailOptionsAtd.text = 'Atendimento Protocolo - ' + idAtendimento;
        mailOptionsAtd.to = emails;
        mailOptionsAtd.bcc = 'bravolog.ti@gmail.com';

        

        //Inicialização de variáveis
        let nrnotas = ', Nota(s) ';
        let primeiraNota = 1;
        let remetente = '';
        let destinatario = '';
        let contentNotas = '';
        if (Array.isArray(informacoesNota) && informacoesNota.length > 0) {
            for (let i = 0; i < informacoesNota.length; i++){
                //Recebe o conteudo das notas relacionadas
                contentNotas += `
                <tr bgcolor="#ffffff">
                    <td align="center" style="color: #666666">${informacoesNota[i].NRNOTA}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].DTEMINOT}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].CDCTRC}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].G005RE_NMCLIENTRE}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].G003RE_NMCIDADERE} - ${informacoesNota[i].G002RE_NMESTADORE}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].G005DE_NMCLIENTDE}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].G003DE_NMCIDADEDE} - ${informacoesNota[i].G002DE_NMESTADODE}</td>
                    <td align="center" style="color: #666666">${informacoesNota[i].PSBRUTO} KG</td>
                    <td align="center" style="color: #666666">&nbsp;R$${informacoesNota[i].VRDELIVE}&nbsp;</td>
                </tr>`;   
                //Se for a primeira nota, preenche com as informações da mesma
                if (primeiraNota == 1){
                    nrnotas += `${informacoesNota[i].NRNOTA}`
                    remetente += ` de ${informacoesNota[i].G005RE_NMCLIENTRE}`;
                    destinatario += ` para ${informacoesNota[i].G005DE_NMCLIENTDE}`
                    primeiraNota = 2; //Seta como 2 para receber a próxima nota
                }
                //Se for a segunda nota, mostra as reticências no lugar na informação para não lotar o campo
                else if (primeiraNota == 2){
                    nrnotas += `, ...`;
                    remetente += `, ...`;
                    destinatario += `, ...`;
                    primeiraNota = 0; //Seta como 0 para não preencher com mais nada
                }
            }
            
        }else{
            contentNotas = `<tr bgcolor="#ffffff"><td style="color: #666666">Não há notas</td></tr>`;
        }

        
        //Encaixa os campos para o asssunto
        mailOptionsAtd.subject = 'Atendimento Protocolo - ' + idAtendimento + ': ' + InfoAtendimento[0].DSTPMOTI + nrnotas + remetente + destinatario;
        mailOptionsAtd.text = 'Atendimento Protocolo - ' + idAtendimento + ': ' + InfoAtendimento[0].DSTPMOTI + nrnotas + remetente + destinatario;
        mailOptionsAtd.to = emails;

        

        let contentMovimentacao = '';
        if (Array.isArray(InfoMovimentacao) && InfoMovimentacao.length > 0) {
            InfoMovimentacao.forEach(item => {
                contentMovimentacao += `

                <div style="text-align: left; margin-top: 30px;margin-left: 20px">
                    <img width="50" style="width:50px;max-width:50px;min-width:50px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none;float: left;" border="0" src="http://monitoria.evolog.com.br/assets/images/userAvatar.png">
                    <div style="font-size:16px;float: left;margin-left: 10px">
                        ${item.NMUSUARIRE}
                    </div>
                    <div style="display: block;margin-left: 64px;clear: both">
                        <div style="margin-top: 5px"><small><b>Atendimento  ${idAtendimento } - #${item.ROWNUM} - ${item.DTMOVIME}</b></small></div>
                        <div style="margin-top: 5px"><small><b>Situação: ${status}</b></small></div>
                        <div style="margin-top: 5px"><small><b>Para: ${item.NMUSUARIDE ? item.NMUSUARIDE : ''}</b></small></div>
                        <div style="margin-top: 5px"><small><b>Observação do atendimento:</b></small></div>
                        <div style="margin-top: 5px"><small><b>${item.DSOBSERV ? item.DSOBSERV: ''}</b></small></div>
                    </div>
                </div>`;
            });
        }

        mailOptionsAtd.html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Atendimento/Ocorrência</title>

                    <style>
                        hr {
                            -moz-border-bottom-colors: none;
                            -moz-border-image: none;
                            -moz-border-left-colors: none;
                            -moz-border-right-colors: none;
                            -moz-border-top-colors: none;
                            border-color: #333333 -moz-use-text-color #FFFFFF;
                            border-style: solid none;
                            border-width: 1px 0;
                            margin: 18px 0;
                        }

                    </style>
                </head>
                <body>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">

                        <tbody>
                            <tr>
                                <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">
                                    <table cellpadding="0" cellspacing="0" width="100%" style="max-width:90%;border-top:1px solid #d9d9d9;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;Margin-top:40px;border-bottom:1px solid black">
                                        <tbody>
                                            <tr bgcolor="#ffffff">
                                                <td align="center">
                                                    <a href="http://www.bravolog.com.br/" target="_blank">
                                                        <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                                                    </a>
                                                </td>
                                                <td style="width: 70%">
                                                </td>
                                                <td align="center">
                                                    <h4 style="font-family:'Lato',Helvetica,Arial,sans-serif;color: #00386c">PROTOCOLO #${idAtendimento}</h4>
                                                    <h3 style="font-family:'Lato',Helvetica,Arial,sans-serif;color: #00386c">${InfoAtendimento[0].DSACAO.toUpperCase()}</h3>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px">

                                    <table width="100%" cellpadding="0" cellspacing="0" width="100%" style="max-width:90%;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;">
                                    
                                        <tr bgcolor="#ffffff">
                                            <td align="center" rowspan="2">
                                                <h4 style="color: #8496c2;font-family:'Lato',Helvetica,Arial,sans-serif;">TOMADOR</h4>
                                                <h5 style="color: #2f5496">${informacoesNota[0].G005CO_NMCLIENTCO}</h5>
                                            
                                            
                                            </td>
                                            <td align="center" rowspan="2">
                                                <h4 style="color: #8496c2;font-family:'Lato',Helvetica,Arial,sans-serif;">MOTIVO ATENDIMENTO/OCORRÊNCIA</h4>
                                                <h5 style="color: #666666">${InfoAtendimento[0].DSTPMOTI}</h5>
                                            </td>
                                            <td align="left">
                                                <h4 style="color: #033071;font-family:'Lato',Helvetica,Arial,sans-serif;">TIPO DE OPERAÇÃO</h4>
                                                <h5 style="color: #666666">${InfoAtendimento[0].DSACAO.toUpperCase()}</h5>
                                            </td>
                                        </tr>
                                        <tr bgcolor="#ffffff">
                                            <td align="left" style="padding-bottom: 20px">
                                                <h4 style="color: #033071;font-family:'Lato',Helvetica,Arial,sans-serif; margin-top: 30px">STATUS DO ATENDIMENTO</h4>
                                                <h5 style="color: #666666">${status.toUpperCase()}</h5>
                                            </td>
                                        </tr>
                                    
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:90%;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;">
                                        <tr bgcolor="#ffffff">
                                            <td align="center" style="font-size: 16px; color: #434343;">
                                                NOTA(S) ATRIBUÍDA(S) AO ATENDIMENTO
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px;">

                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid black; border-bottom: 1px solid black;max-width:90%;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9">
                                        <thead>
                                            <tr bgcolor="#ffffff">
                                                <th align="center" style="color: #033071;">
                                                    NF
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    DT EMISSÃO NF
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    CTE
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    REMETENTE
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    ORIGEM/UF
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    DESTINATÁRIO
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    DESTINO/UF
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    PESO
                                                </th>
                                                <th  align="center" style="color: #033071;">
                                                    VALOR
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${contentNotas}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:90%;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;border-bottom:1px solid black">
                                        <tr bgcolor="#ffffff">
                                            <td align="center" style="font-size: 16px; color: #434343;font-family:'Lato',Helvetica,Arial,sans-serif;padding-top: 40px">
                                                HISTÓRICO DO ATENDIMENTO/OCORRÊNCIA
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <tr>
                                <td bgcolor="#f7f7f7" align="center" style="padding:0px 5px 0px 5px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:90%;border-left:1px solid #d9d9d9;border-right:1px solid #d9d9d9;border-bottom:1px solid #d9d9d9">
                                        <tr bgcolor="#ffffff">
                                            <td align="left">
                                                ${contentMovimentacao}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </body>
            </html>

            `;

        //console.log(mailOptionsAtd);

        return await smtpMonitoria.sendMail(mailOptionsAtd, function (error, response) {
            if (error) {
                logger.info(error);
            } else {
                logger.info(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };


    api.sendEmailEntregaAdama = async function (cdrastre, email, urlHost, UserId, notas) {
        let mailAdama = require('nodemailer');
        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let contentNotas = '';
        if (Array.isArray(notas) && notas.length > 0) {
            notas.forEach(item => {
                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">${item.NRNOTA}</td></tr>`;
            });
        }else{
            contentNotas = `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 20%;
                    margin-right: 20%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 10%;
                    padding-right: 10%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                </style>
            </head>
            <body>
        
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            
                <table cellpadding="0" cellspacing="0" width="100%" style="Margin-top:40px;">
                    <tbody>
                        <tr>
                        <td bgcolor="#ffffff" align="left" style="padding-top: 60px">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                            </a>
                        </td>
                        <td bgcolor="#ffffff" align="right" style="padding-top: 65px">
                            <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/Logo_ADAMA.png">
                        </td>
                        </tr>
                    </tbody>
                </table>
                    

                    <div class="box-center-title myText">
                        RASTREIE SUA ENTREGA
                    </div>

                    <div class="box-center-content myText-content">
                        <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                        OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                        <div style="margin-left: 10%;margin-right: 10%;"></br></br>
                            <table>
                                <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;width: 350px;">Número da Nota</th>
                                </tr>
                                ${contentNotas}
                            </table></br></br>
                        </div>
                        VOCÊ PODE ACOMPANHAR A ENTREGA <b>`+ cdrastre + `</b> <br>ATRAVÉS DO LINK:
                        <div class="row" style="margin-top: 35px; margin-bottom: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=`+cdrastre+`">Acessar</a> <!-- APONTAR PARA O LINK CORRETO-->
                        </div>
                        OU BUSCAR POR OUTRAS ENTREGAS:
                        <div class="row"style="margin-top: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a> <!-- APONTAR PARA O LINK CORRETO-->
                        </div>
                    </div>

                </div>
            </body>
            </html>

            `;
        
        let mailOptionsAdama = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega', // Subject line
            text: 'Rastreamento de Entrega', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaAdama = mailAdama.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaAdama.sendMail(mailOptionsAdama, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };


    api.sendEmailEntregaSyngentaV2 = async function (arrayNotas, email, urlHost, UserId, user) {
        let mailSyngenta = require('nodemailer');

        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let descadastro = '';

        if (user != null && user != undefined && user != '') {
            descadastro = `<div class="row"style="margin-top: 35px;">
                            <p style="Margin:0;text-align:center;color:#a5a5a5">Se deseja não receber mais mensagens como esta, <a href="` + urlHost + `/monitoria_email/#/rastreio?id=0&nota=0&user=` + user.IDG005DE + `&op=` + user.IDG014 +`" target="_blank">descadastre-se.</a></p>
                        </div>`;
        } else {
            descadastro = '';
        }


        let contentNotas = '';
        let dataEminot = '';
        let txtEminot = '';

        let dataColeta = '';
        let txtColeta = '';

        let dataEntrega = '';
        let txtEntrega = '';

        let validaDtColeta = 0;
        let dataHoje = new Date();
        let dtColAux = null;
        let dtColAux2 = null;
        let dtColAux3 = null;
        let timerCole = null;
        let timerHoje = null;
        let dtHojeAux2 = null;
        let dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
        let dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');

        if (Array.isArray(arrayNotas) && arrayNotas.length > 0) {
            arrayNotas.forEach(item => {
                validaDtColeta = 0;
                dtColAux = null;
                dtColAux2 = null;
                dtColAux3 = null;
                timerCole = null;
                timerHoje = null;
                dtHojeAux2 = null;
                dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
                dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');
                //TRATA DATAS DE COLETA ANTES DO DIA DE HOJE
                if (item.DTCOLETA != null && item.DTCOLETA != '') {
                    //trata data da coleta vinda do banco
                    dtColAux = item.DTCOLETA.split("-").reverse().join("/");
                    dtColAux3 = dtColAux.split('/');
                    dtColAux2 = new Date(Number(dtColAux3[2]), Number(dtColAux3[1]), Number(dtColAux3[0]));
                    timerCole = dtColAux2.getTime();
                    //trata data "Hoje"
                    dtHojeAux2 = new Date(Number(dtHojeAux3[2]), Number(dtHojeAux3[1]), Number(dtHojeAux3[0]));
                    timerHoje = dtHojeAux2.getTime();
                    //compara as duas datas
                    if (timerHoje >= timerCole) {
                        //flag para deixar como completo o milestone da data de coleta
                        validaDtColeta = 1;
                    }
                }

                //DATA EMISSÃO DA NOTA FISCAL
                if (item.DTEMINOT != null && item.DTEMINOT != '') {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>${item.DTEMINOT}</small>
                                </td>`;
                } else {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>n.i.</small>
                                </td>`;
                }

                //DATA DE COLETA
                if ((item.DTSAICAR == null || item.DTSAICAR == '') && (item.DTENTREG == null || item.DTENTREG == '') && (validaDtColeta != 1)) {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small>${ item.DTCOLETA != null && item.DTCOLETA != '' ? (item.DTCOLETA.split("-").reverse().join("/")) : 'n.i.'}</small>
                                </td> `;
                } else {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    if (item.DTSAICAR != null && item.DTSAICAR != '') {
                        txtColeta = ` <td style="text-align: center;">
                                        <small>Data de Coleta</small><br><small>${item.DTSAICAR}</small>
                                    </td> `;
                    } else if ((item.DTSAICAR == null || item.DTSAICAR == '') && (item.DTENTREG != null && item.DTENTREG != '')) {
                        txtColeta = ` <td style="text-align: center;">
                                        <small>Data de Coleta</small><br><small>${(item.DTCOLETA.split("-").reverse().join("/"))}</small>
                                    </td> `;
                    } else if ((item.DTSAICAR == null || item.DTSAICAR == '') && (item.DTENTREG == null || item.DTENTREG == '') && (validaDtColeta == 1)) {
                        txtColeta = ` <td style="text-align: center;">
                                        <small>Data de Coleta</small><br><small>${(item.DTCOLETA.split("-").reverse().join("/"))}</small>
                                    </td> `;
                    }
                }

                //DATA DE ENTREGA
                if ((item.DTENTREG == null || item.DTENTREG == '')) {
                    dataEntrega = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>`;
                    
                } else {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td>

                                <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>
                                <td style="text-align: center;">
                                    <small>Data de Entrega</small><br><small>${item.DTENTREG}</small>
                                </td>`;
                }

                if ((item.DTBLOQUE != null && item.DTBLOQUE != '') && (item.DTDESBLO == null || item.DTDESBLO == '')) {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #a0a6ab;"></div>
                                </td>`;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small></small>
                                </td> `;
                    txtEntrega = ` <td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small></small>
                                </td> `;
                }



                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">
                    <a target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=` + item.CDRASTRE + `&nota=` + item.IDG043 + `">${item.NRNOTA}</a>
                    <img width="15" style="width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/lupa.png">
                </td>
                <td style="border: 1px solid #ddd;
                text-align: center;">

                    <table>
                        <tr>
                            ${dataEminot}
                            ${dataColeta}
                            ${dataEntrega}
                        </tr>
                        <tr>
                            ${txtEminot}
                            ${txtColeta}
                            ${txtEntrega}
                        </tr>
                    </table>

                </td></tr>`;
            });
        }else{
            contentNotas = `<tr><td colspan="2" style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 10%;
                    margin-right: 10%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 5%;
                    padding-right: 5%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                .box-circle{
                    border-radius:50%;
                    -moz-border-radius:50%;
                    -webkit-border-radius:50%;
                    min-width: 25px;
                    max-width: 25px;
                    min-height: 25px;
                    max-height: 25px;
                    display: inline-block;
                }
                </style>
            </head>
            <body>
        
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            
                <table cellpadding="0" cellspacing="0" width="100%" style="Margin-top:40px;">
                    <tbody>
                        <tr>
                        <td bgcolor="#ffffff" align="left">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="135" style="width:135px;max-width:135px;min-width:135px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://www.bravolog.com.br/img/bravo-logo-01.png">
                            </a>
                        </td>
                        <td bgcolor="#ffffff" align="right" style="padding-top: 60px">
                            <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/syngenta.png">
                        </td>
                        </tr>
                    </tbody>
                </table>
                    

                    <div class="box-center-title myText">
                        RASTREIE SUA ENTREGA
                    </div>

                    <div class="box-center-content myText-content">
                        <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                        OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                        <div></br></br>
                            <table>
                                <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;width: 350px;">Número da Nota</th>
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;">Datas</th>
                                </tr>
                                ${contentNotas}
                            </table></br></br>
                        </div>
                        <!--
                        BUSCAR POR OUTRAS ENTREGAS:
                        <div class="row"style="margin-top: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a>
                        </div> -->

                        ${descadastro}

                    </div>
                    <div style="text-align:center;">
                        Em caso de duvidas ou esclarecimentos entrar em contato com o Centro Avançado Syngenta de Atendimento<br>
                        <img src="http://monitoria.evolog.com.br/assets/images/casa.png" alt="" width="150px">
                        <h2 style="font-family: arial;">0800 704 4304</h2>
                    </div>


                </div>
            </body>
            </html>

            `;
        
        let mailOptionsSyngenta = {
            from: `"Evolog - Rastreamento Syngenta" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega Syngenta', // Subject line
            text: 'Rastreamento de Entrega Syngenta', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaSyngenta = mailSyngenta.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaSyngenta.sendMail(mailOptionsSyngenta, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };
    //api.sendEmailEntrega(null, null, null);


    api.sendEmailEntregaFmcV2 = async function (arrayNotas, email, urlHost, UserId, user) {
        let mailFmc = require('nodemailer');
        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let descadastro = '';

        if (user != null && user != undefined && user != '') {
            descadastro = `<div class="row"style="margin-top: 35px;">
                            <p style="Margin:0;text-align:center;color:#a5a5a5">Se deseja não receber mais mensagens como esta, <a href="` + urlHost + `/monitoria_email/#/rastreio?id=0&nota=0&user=` + user.IDG005DE + `&op=` + user.IDG014 +`" target="_blank">descadastre-se.</a></p>
                        </div>`;
        } else {
            descadastro = '';
        }

        let contentNotas = '';
        let dataEminot = '';
        let txtEminot = '';

        let dataColeta = '';
        let txtColeta = '';

        let dataEntrega = '';
        let txtEntrega = '';

        let validaDtColeta = 0;
        let dataHoje = new Date();
        let dtColAux = null;
        let dtColAux2 = null;
        let dtColAux3 = null;
        let timerCole = null;
        let timerHoje = null;
        let dtHojeAux2 = null;
        let dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
        let dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');

        if (Array.isArray(arrayNotas) && arrayNotas.length > 0) {
            arrayNotas.forEach(item => {
                validaDtColeta = 0;
                dtColAux = null;
                dtColAux2 = null;
                dtColAux3 = null;
                timerCole = null;
                timerHoje = null;
                dtHojeAux2 = null;
                dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
                dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');
                //TRATA DATAS DE COLETA ANTES DO DIA DE HOJE
                if (item.DTCOLETA != null && item.DTCOLETA != '') {
                    //trata data da coleta vinda do banco
                    dtColAux = item.DTCOLETA.split("-").reverse().join("/");
                    dtColAux3 = dtColAux.split('/');
                    dtColAux2 = new Date(Number(dtColAux3[2]), Number(dtColAux3[1]), Number(dtColAux3[0]));
                    timerCole = dtColAux2.getTime();
                    //trata data "Hoje"
                    dtHojeAux2 = new Date(Number(dtHojeAux3[2]), Number(dtHojeAux3[1]), Number(dtHojeAux3[0]));
                    timerHoje = dtHojeAux2.getTime();
                    //compara as duas datas
                    if (timerHoje >= timerCole) {
                        //flag para deixar como completo o milestone da data de coleta
                        validaDtColeta = 1;
                    }
                }

                //DATA EMISSÃO DA NOTA FISCAL
                if (item.DTEMINOT != null && item.DTEMINOT != '') {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>${item.DTEMINOT}</small>
                                </td>`;
                } else {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>n.i.</small>
                                </td>`;
                }

                //DATA DE COLETA
                if (validaDtColeta != 1) {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small>${item.DTCOLETA != null && item.DTCOLETA != '' ? (item.DTCOLETA.split("-").reverse().join("/")) : 'n.i.'}</small>
                                </td> `;
                } else {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Data de Coleta</small><br><small>${(item.DTCOLETA.split("-").reverse().join("/"))}</small>
                                </td> `;
                
                }

                //DATA DE ENTREGA
                if ((item.DTENTREG == null || item.DTENTREG == '')) {
                    dataEntrega = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>`;
                    
                } else {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td>

                                <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>
                                <td style="text-align: center;">
                                    <small>Data de Entrega</small><br><small>${item.DTENTREG}</small>
                                </td>`;
                }

                if ((item.DTBLOQUE != null && item.DTBLOQUE != '') && (item.DTDESBLO == null || item.DTDESBLO == '')) {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #a0a6ab;"></div>
                                </td>`;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small></small>
                                </td> `;
                    txtEntrega = ` <td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small></small>
                                </td> `;
                }



                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">
                    <a target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=` + item.CDRASTRE + `&nota=` + item.IDG043 + `">${item.NRNOTA}</a>
                    <img width="15" style="width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/lupa.png">
                </td>
                <td style="border: 1px solid #ddd;
                text-align: center;">

                    <table>
                        <tr>
                            ${dataEminot}
                            ${dataColeta}
                            ${dataEntrega}
                        </tr>
                        <tr>
                            ${txtEminot}
                            ${txtColeta}
                            ${txtEntrega}
                        </tr>
                    </table>

                </td>
                </tr>`;
            });
        }else{
            contentNotas = `<tr><td colspan="2" style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 10%;
                    margin-right: 10%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 5%;
                    padding-right: 5%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                .box-circle{
                    border-radius:50%;
                    -moz-border-radius:50%;
                    -webkit-border-radius:50%;
                    min-width: 25px;
                    max-width: 25px;
                    min-height: 25px;
                    max-height: 25px;
                    display: inline-block;
                }
                </style>
            </head>
            <body>
        
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            
                <table cellpadding="0" cellspacing="0" width="100%" style="Margin-top:40px;">
                    <tbody>
                        <tr>
                        <td bgcolor="#ffffff" align="left" style="padding-top: 60px">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                            </a>
                        </td>
                        <td bgcolor="#ffffff" align="right" style="padding-top: 60px">
                            <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/logo_FMC_final_rgb.png">
                        </td>
                        </tr>
                    </tbody>
                </table>
                    

                    <div class="box-center-title myText">
                        RASTREIE SUA ENTREGA
                    </div>

                    <div class="box-center-content myText-content">
                        <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                        OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                        <div></br></br>
                            <table>
                            <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                <th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background: #f06724;
                                    color: white;width: 350px;">Número da Nota</th>
                                <th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background: #f06724;
                                    color: white;">Datas</th>
                            </tr>
                                ${contentNotas}
                            </table></br></br>
                        </div>
                        <!--
                        BUSCAR POR OUTRAS ENTREGAS:
                        <div class="row"style="margin-top: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a> 
                        </div> -->

                        ${descadastro}

                    </div>

                </div>
            </body>
            </html>

            `;
        
        let mailOptionsFmc = {
            from: `"Evolog - Rastreamento FMC" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega FMC', // Subject line
            text: 'Rastreamento de Entrega FMC', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaFmc = mailFmc.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaFmc.sendMail(mailOptionsFmc, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };
    //api.sendEmailEntrega(null, null, null);


    api.sendEmailEntregaAdamaV2 = async function (arrayNotas, email, urlHost, UserId, user) {
        let mailAdama = require('nodemailer');
        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';


        let descadastro = '';

        if (user != null && user != undefined && user != '') {
            descadastro = `<div class="row"style="margin-top: 35px;">
                            <p style="Margin:0;text-align:center;color:#a5a5a5">Se deseja não receber mais mensagens como esta, <a href="` + urlHost + `/monitoria_email/#/rastreio?id=0&nota=0&user=` + user.IDG005DE + `&op=` + user.IDG014 +`" target="_blank">descadastre-se.</a></p>
                        </div>`;
        } else {
            descadastro = '';
        }

        let contentNotas = '';
        let dataEminot = '';
        let txtEminot = '';

        let dataColeta = '';
        let txtColeta = '';

        let dataEntrega = '';
        let txtEntrega = '';

        let validaDtColeta = 0;
        let dataHoje = new Date();
        let dtColAux = null;
        let dtColAux2 = null;
        let dtColAux3 = null;
        let timerCole = null;
        let timerHoje = null;
        let dtHojeAux2 = null;
        let dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
        let dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');

        if (Array.isArray(arrayNotas) && arrayNotas.length > 0) {
            arrayNotas.forEach(item => {
                validaDtColeta = 0;
                dtColAux = null;
                dtColAux2 = null;
                dtColAux3 = null;
                timerCole = null;
                timerHoje = null;
                dtHojeAux2 = null;
                dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
                dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');
                //TRATA DATAS DE COLETA ANTES DO DIA DE HOJE
                if (item.DTCOLETA != null && item.DTCOLETA != '') {
                    //trata data da coleta vinda do banco
                    dtColAux = item.DTCOLETA.split("-").reverse().join("/");
                    dtColAux3 = dtColAux.split('/');
                    dtColAux2 = new Date(Number(dtColAux3[2]), Number(dtColAux3[1]), Number(dtColAux3[0]));
                    timerCole = dtColAux2.getTime();
                    //trata data "Hoje"
                    dtHojeAux2 = new Date(Number(dtHojeAux3[2]), Number(dtHojeAux3[1]), Number(dtHojeAux3[0]));
                    timerHoje = dtHojeAux2.getTime();
                    //compara as duas datas
                    if (timerHoje >= timerCole) {
                        //flag para deixar como completo o milestone da data de coleta
                        validaDtColeta = 1;
                    }
                }

                //DATA EMISSÃO DA NOTA FISCAL
                if (item.DTEMINOT != null && item.DTEMINOT != '') {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>${item.DTEMINOT}</small>
                                </td>`;
                } else {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>n.i.</small>
                                </td>`;
                }

                //DATA DE COLETA
                if (validaDtColeta != 1) {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small>${item.DTCOLETA != null && item.DTCOLETA != '' ? (item.DTCOLETA.split("-").reverse().join("/")) : 'n.i.'}</small>
                                </td> `;
                } else {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Data de Coleta</small><br><small>${(item.DTCOLETA.split("-").reverse().join("/"))}</small>
                                </td> `;
                
                }

                //DATA DE ENTREGA
                if ((item.DTENTREG == null || item.DTENTREG == '')) {
                    dataEntrega = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>`;
                    
                } else {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td>

                                <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>
                                <td style="text-align: center;">
                                    <small>Data de Entrega</small><br><small>${item.DTENTREG}</small>
                                </td>`;
                }

                if ((item.DTBLOQUE != null && item.DTBLOQUE != '') && (item.DTDESBLO == null || item.DTDESBLO == '')) {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #a0a6ab;"></div>
                                </td>`;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small></small>
                                </td> `;
                    txtEntrega = ` <td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small></small>
                                </td> `;
                }



                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">
                    <a target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=` + item.CDRASTRE + `&nota=` + item.IDG043 + `">${item.NRNOTA}</a>
                    <img width="15" style="width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/lupa.png">
                </td>
                <td style="border: 1px solid #ddd;
                text-align: center;">

                    <table>
                        <tr>
                            ${dataEminot}
                            ${dataColeta}
                            ${dataEntrega}
                        </tr>
                        <tr>
                            ${txtEminot}
                            ${txtColeta}
                            ${txtEntrega}
                        </tr>
                    </table>

                </td></tr>`;
            });
        }else{
            contentNotas = `<tr><td colspan="2" style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }

            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 10%;
                    margin-right: 10%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 5%;
                    padding-right: 5%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                .box-circle{
                    border-radius:50%;
                    -moz-border-radius:50%;
                    -webkit-border-radius:50%;
                    min-width: 25px;
                    max-width: 25px;
                    min-height: 25px;
                    max-height: 25px;
                    display: inline-block;
                }
                </style>
            </head>
            <body>
        
            <div style="height: 100%; width: 100%; padding-top: 40px;">
            
                <table cellpadding="0" cellspacing="0" width="100%" style="Margin-top:40px;">
                    <tbody>
                        <tr>
                        <td bgcolor="#ffffff" align="left" style="padding-top: 60px">
                            <a href="http://www.bravolog.com.br/" target="_blank">
                                <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/1.1.4-Horizontal-Sem_Slongan-Sem_Fundo.png">
                            </a>
                        </td>
                        <td bgcolor="#ffffff" align="right" style="padding-top: 65px">
                            <img width="175" style="width:175px;max-width:175px;min-width:175px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/Logo_ADAMA.png">
                        </td>
                        </tr>
                    </tbody>
                </table>
                    

                    <div class="box-center-title myText">
                        RASTREIE SUA ENTREGA
                    </div>

                    <div class="box-center-content myText-content">
                        <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                        OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                        <div></br></br>
                            <table>
                                <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;width: 350px;">Número da Nota</th>
                                    <th style="padding-top: 12px;
                                        padding-bottom: 12px;
                                        background: #f06724;
                                        color: white;">Datas</th>
                                </tr>
                                ${contentNotas}
                            </table></br></br>
                        </div>
                        <!--
                         BUSCAR POR OUTRAS ENTREGAS:
                        <div class="row"style="margin-top: 35px;">
                            <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a> 
                        </div>-->

                        ${descadastro}

                    </div>

                </div>
            </body>
            </html>

            `;
        
        let mailOptionsAdama = {
            from: `"Evolog - Rastreamento Adama" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega Adama', // Subject line
            text: 'Rastreamento de Entrega Adama', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaAdama = mailAdama.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        
        //console.log(mailOptions);

        return await smtpMonitoriaAdama.sendMail(mailOptionsAdama, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };


    api.sendEmailEntregaV2 = async function (arrayNotas, email, urlHost, UserId, user) {
        let mailPadrao = require('nodemailer');

        // mailOptions.subject = 'Rastreamento de Entrega';
        // mailOptions.text = 'Rastreamento de Entrega';
        // mailOptions.to = email;
        // mailOptions.bcc = 'bravolog.ti@gmail.com';

        let descadastro = '';

        if (user != null && user != undefined && user != '') {
            descadastro = `<div class="row"style="margin-top: 35px;">
                            <p style="Margin:0;text-align:center;color:#a5a5a5">Se deseja não receber mais mensagens como esta, <a href="` + urlHost + `/monitoria_email/#/rastreio?id=0&nota=0&user=` + user.IDG005DE + `&op=` + user.IDG014 +`" target="_blank">descadastre-se.</a></p>
                        </div>`;
        } else {
            descadastro = '';
        }

        let contentNotas = '';
        let dataEminot = '';
        let txtEminot = '';

        let dataColeta = '';
        let txtColeta = '';

        let dataEntrega = '';
        let txtEntrega = '';

        let validaDtColeta = 0;
        let dataHoje = new Date();
        let dtColAux = null;
        let dtColAux2 = null;
        let dtColAux3 = null;
        let timerCole = null;
        let timerHoje = null;
        let dtHojeAux2 = null;
        let dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
        let dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');

        if (Array.isArray(arrayNotas) && arrayNotas.length > 0) {
            arrayNotas.forEach(item => {
                validaDtColeta = 0;
                dtColAux = null;
                dtColAux2 = null;
                dtColAux3 = null;
                timerCole = null;
                timerHoje = null;
                dtHojeAux2 = null;
                dtHojeAux = dataHoje.toLocaleDateString("pt-BR");
                dtHojeAux3 = (dtHojeAux.split("-").reverse().join("/")).split('/');
                //TRATA DATAS DE COLETA ANTES DO DIA DE HOJE
                if (item.DTCOLETA != null && item.DTCOLETA != '') {
                    //trata data da coleta vinda do banco
                    dtColAux = item.DTCOLETA.split("-").reverse().join("/");
                    dtColAux3 = dtColAux.split('/');
                    dtColAux2 = new Date(Number(dtColAux3[2]), Number(dtColAux3[1]), Number(dtColAux3[0]));
                    timerCole = dtColAux2.getTime();
                    //trata data "Hoje"
                    dtHojeAux2 = new Date(Number(dtHojeAux3[2]), Number(dtHojeAux3[1]), Number(dtHojeAux3[0]));
                    timerHoje = dtHojeAux2.getTime();
                    //compara as duas datas
                    if (timerHoje >= timerCole) {
                        //flag para deixar como completo o milestone da data de coleta
                        validaDtColeta = 1;
                    }
                }

                //DATA EMISSÃO DA NOTA FISCAL
                if (item.DTEMINOT != null && item.DTEMINOT != '') {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>${item.DTEMINOT}</small>
                                </td>`;
                } else {
                    dataEminot = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEminot = `<td style="text-align: center;">
                                    <small>Nota Fiscal</small><br><small>n.i.</small>
                                </td>`;
                }

                //DATA DE COLETA
                if (validaDtColeta != 1) {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small>${item.DTCOLETA != null && item.DTCOLETA != '' ? (item.DTCOLETA.split("-").reverse().join("/")) : 'n.i.'}</small>
                                </td> `;
                } else {
                    dataColeta = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Data de Coleta</small><br><small>${(item.DTCOLETA.split("-").reverse().join("/"))}</small>
                                </td> `;
                
                }

                //DATA DE ENTREGA
                if ((item.DTENTREG == null || item.DTENTREG == '')) {
                    dataEntrega = ` <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #673ad7;"></div>
                                </td> `;
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>`;
                    
                } else {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td>

                                <td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #2e7d32;"></div>
                                </td> `;
                    
                    txtEntrega = `<td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small>${item.DTPREENT}</small>
                                </td>
                                <td style="text-align: center;">
                                    <small>Data de Entrega</small><br><small>${item.DTENTREG}</small>
                                </td>`;
                }

                if ((item.DTBLOQUE != null && item.DTBLOQUE != '') && (item.DTDESBLO == null || item.DTDESBLO == '')) {
                    dataEntrega = `<td style="text-align: center; padding-top: 8px; padding-left: 60px; padding-right: 60px;">
                                    <div class="box-circle" style="background-color: #a0a6ab;"></div>
                                </td>`;
                    txtColeta = ` <td style="text-align: center;">
                                    <small>Previsão de Coleta</small><br><small></small>
                                </td> `;
                    txtEntrega = ` <td style="text-align: center;">
                                    <small>Previsão de Entrega</small><br><small></small>
                                </td> `;
                }



                contentNotas += `<tr><td style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">
                    <a target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio?id=` + item.CDRASTRE + `&nota=` + item.IDG043 + `">${item.NRNOTA}</a>
                    <img width="15" style="width:15px;max-width:15px;min-width:15px;font-family:'Lato',Helvetica,Arial,sans-serif;color:#ffffff;font-size:18pxs;border:0;min-height:auto;line-height:100%;outline:none;text-decoration:none" border="0" src="http://monitoria.evolog.com.br/assets/images/lupa.png">
                </td>
                <td style="border: 1px solid #ddd;
                text-align: center;">

                    <table>
                        <tr>
                            ${dataEminot}
                            ${dataColeta}
                            ${dataEntrega}
                        </tr>
                        <tr>
                            ${txtEminot}
                            ${txtColeta}
                            ${txtEntrega}
                        </tr>
                    </table>

                </td></tr>`;
            });
        }else{
            contentNotas = `<tr><td colspan="2" style="border: 1px solid #ddd;
                padding: 8px;
                text-align: center;">Não há notas</td></tr>`;
        }
      
            let htmlText = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>

                <style type="text/css">
                .myText{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.06rem;
                    font-size: 18px;
                }
                .box-center-title{
                    text-align: center;
                    background-color: red;
                    margin-top: 20px;
                    color: #fff;
                    background: #f06724;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .box-center-content{
                    text-align: center;
                    background-color: red;
                    margin-left: 10%;
                    margin-right: 10%;
                    color: #383838;
                    background: #f5f5f5;
                    padding-top: 40px;
                    padding-bottom: 50px;
                    padding-left: 5%;
                    padding-right: 5%;

                }
                .myText-content{
                    font-family: "Montserrat", Helvetica, sans-serif;
                    font-weight: 350;
                    letter-spacing: 0.02rem;
                }
                .button{
                    background: #f06724;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #fff;
                    font-weight: 350;
                    text-decoration:none;
                }
                .button_2{
                    background: #dbdbdb;
                    padding: 10px;
                    padding-left: 20px;
                    padding-right: 20px;
                    color: #b6b6b6;
                    font-weight: 350;
                    text-decoration:none;
                }
                .box-circle{
                    border-radius:50%;
                    -moz-border-radius:50%;
                    -webkit-border-radius:50%;
                    min-width: 25px;
                    max-width: 25px;
                    min-height: 25px;
                    max-height: 25px;
                    display: inline-block;
                }
                </style>
            </head>
            <body>
                <div style="height: 100%; width: 100%; padding-top: 40px;">
                <div style="padding-left: 43% !important;">
                <img src="http://www.bravolog.com.br/img/bravo-logo-01.png"
                alt="Bravo - Serviços Logísticos"
                width="145"
                align="center"
                style="border:none;outline:none;border-style:none"
                class="CToWUd">
                </div>

                <div class="box-center-title myText">
                    RASTREIE SUA ENTREGA
                </div>
                <div class="box-center-content myText-content">
                    <img src="https://png.icons8.com/metro/60/f06724/delivery.png"><br><br>
                    OLÁ, ESSE RASTREIO É REFERENTE A(S) SEGUINTE(S) NOTA(S) FISCAL(S):
                    <div></br></br>
                        <table>
                            <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                <th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background: #f06724;
                                    color: white;width: 350px;">Número da Nota</th>
                                <th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background: #f06724;
                                    color: white;">Datas</th>
                            </tr>
                            ${contentNotas}
                        </table></br></br>
                    </div>
                    <!--
                    BUSCAR POR OUTRAS ENTREGAS:
                    <div class="row"style="margin-top: 35px;">
                    <a class="button" target="_blank" href="`+ urlHost + `/monitoria_email/#/rastreio">Outras Entregas</a>
                    </div> -->

                    ${descadastro}
                    
                </div>
                </div>
            </body>
            </html>

            `;
        
        let mailOptionsPadrao = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: 'Rastreamento de Entrega', // Subject line
            text: 'Rastreamento de Entrega', // plain text body
            html: htmlText,
            bcc : 'bravolog.ti@gmail.com'
        };

        let smtpMonitoriaPadrao = mailPadrao.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });
        

        return await smtpMonitoriaPadrao.sendMail(mailOptionsPadrao, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };

    api.sendEmailDebugg = async function (notas, cliente) {
         let mailDebug = require('nodemailer');

         let contentNotas = '';
         if (Array.isArray(notas) && notas.length > 0) {
             notas.forEach(item => {
                contentNotas += `
                <tr>
                    <td style="border: 1px solid #ddd;padding: 8px;text-align: center;">
                        ${item.IDG043}
                    </td>
                </tr>`;
             });
         }else{
             contentNotas = `<tr><td style="border: 1px solid #ddd;
                 padding: 8px;
                 text-align: center;">Não há notas</td></tr>`;
         }
        
        let htmlText = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>Entrega</title>
            
                <style type="text/css">
            
                </style>
            </head>
            <body>
            
                <div style="height: 100%; width: 100%; padding-top: 40px;">
                    <h2>Cliente: ${cliente}</h2>
                
                    <div>
                        <h3>Informações Notas</h3>
                        <table>
                            <tr style="border: 1px solid #ddd;padding: 8px;text-align: center; width: 350px;">
                                <th style="padding-top: 12px;
                                    padding-bottom: 12px;
                                    background: #f06724;
                                    color: white;width: 350px;">IDs das Notas</th>
                            </tr>
                            ${contentNotas}
                        </table></br></br>
                        <br>
                    </div>
                
                </div>
            </body>
        </html>

        `;
     
        let mailOptionsDebug = {
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address
            to: 'bravolog.ti@gmail.com', // list of receivers
            subject: 'Rastreamento de Entrega Erro', // Subject line
            text: 'Rastreamento de Entrega Erro', // plain text body
            html: htmlText
        };

        let smtpMonitoriaDebug = mailDebug.createTransport({
            service: process.env.MAIL_DRIVER,
            host: process.env.MAIL_HOST,
            tls: {
                rejectUnauthorized:false
            },
            auth: {
                user: process.env.MAIL_FROM_ADDRESS,
                pass: process.env.MAIL_PASSWORD
            }
        });

        return await smtpMonitoriaDebug.sendMail(mailOptionsDebug, function (error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log(response);
                return response;
            }
        });
        // 1.4 - Can send the e-mail */

    };

    return api;
};
