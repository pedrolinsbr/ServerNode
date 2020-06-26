module.exports = function (app, cb) {
    var api          = {};
    var dao          = app.src.modTransportation.dao.SegurancaPremiadaDAO;
    const stream     = require('stream');
    const puppeteer  = require('puppeteer');
    const stringMask = require('string-mask');

    api.downloadPdfM1 = async function(req,res,next) {

      try {
        var rs = await dao.buscarEnderecos(req, res, next);
 
        if (rs.length > 0) {
          let bloco    = '';
          let dscomend = '';

          for (let index = 0; index < rs.length; index++) {

            dscomend = rs[index].DSCOMEND != ' ' && rs[index].DSCOMEND != null ? rs[index].DSCOMEND+',' : ''; 

            bloco += ` <div style="padding-bottom:511.7544787966px; padding-top:511.7544787966px;page-break-before: always;">
                        <div style="font-size: 16px;margin-left:207.8766346663px; width:472.4468969688px; height:98.26895456951px;">
                            <strong>Destinatário:</strong> ${rs[index].NMMOTORI}<br>
                            <strong>End.:</strong> ${rs[index].DSENDERE}, <strong>n°</strong> ${rs[index].NRENDERE}, ${dscomend} <strong>Bairro:</strong> ${rs[index].BIENDERE}<br>
                            ${rs[index].NMCIDADE} - ${rs[index].CDESTADO}<br>
                            ${new stringMask('00000-000').apply(rs[index].CPENDERE)}
                        </div>
                        </div>`;
          }

          

          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
         });
          const page    = await browser.newPage();
    
          await page.setContent(`<!DOCTYPE html>
                    <html lang="pt-br">
                    
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <meta http-equiv="X-UA-Compatible" content="ie=edge">
                      <meta name="author" content="Marco">
                      <meta name="description" content="PDF da Bravo">
                      <meta name="keywords" content="MDF-e">
                      <title>Bravo</title>
                      <style type="text/css">
                        html {
                          font-family: serif;
                        }
                      </style>
                    
                    </head>
                    
                    <body style="margin: 0px;">
                        ${bloco}
                    </body>
                    </html>`);
        
                  
          await page.emulateMedia('screen');
          
          const pdf = await page.pdf({
            format: 'A4',
            margin: {
              top:    '0cm',
              right:  '0cm',
              bottom: '0cm',
              left:   '0cm'
            },
            printBackground: true
          });

          await browser.close();
          var fileContents = new Buffer(pdf, 'base64');
    
          var readStream = new stream.PassThrough();
          readStream.end(fileContents);
    
          res.setHeader('Content-disposition', 'inline');
          res.setHeader('Content-type', 'application/pdf');
    
          readStream.pipe(res);
    
        
        }else{
          res.status(400).send({ message: 'Não foi encontrado nenhum motorista para está campanha.' });
          return res;
        }
      } catch (err) {
        err.stack = new Error().stack + `\r\n` + err.stack;
        res.status(500).send({ strErro: err.message });
        logger.error("Erro:", err);
        throw err;
      }
      
    };

    api.downloadPdfM2 = async function(req,res,next) {

      try {
        var rs = await dao.buscarMotoristaEnderecos(req, res, next);
 
        if (rs.length > 0) {
          let blocoTexto    = '';
          let dscomend      = '';
          let dataAtual     = new Date();
          const arrayMes    = new Array(12);
                arrayMes[0] = "Janeiro";
                arrayMes[1] = "Fevereiro";
                arrayMes[2] = "Março";
                arrayMes[3] = "Abril";
                arrayMes[4] = "Maio";
                arrayMes[5] = "Junho";
                arrayMes[6] = "Julho";
                arrayMes[7] = "Agosto";
                arrayMes[8] = "Setembro";
                arrayMes[9] = "Outubro";
                arrayMes[10] = "Novembro";
                arrayMes[11] = "Dezembro";

          let dataLoc        =`Uberaba, ${dataAtual.getDate()} de ${arrayMes[dataAtual.getMonth()]} de ${dataAtual.getFullYear()}.`;

          for (let index = 0; index < rs.length; index++) {

            dscomend = rs[index].DSCOMEND != ' ' && rs[index].DSCOMEND != null ? rs[index].DSCOMEND+',' : ''; 

            blocoTexto += ` <div style="padding-bottom:511.7544787966px; padding-top:511.7544787966px;page-break-before: always;">
                              <div style="font-size: 16px;margin-left:207.8766346663px; width:472.4468969688px; height:98.26895456951px;">
                                  <strong>Destinatário:</strong> ${rs[index].NMMOTORI}<br>
                                  <strong>End.:</strong> ${rs[index].DSENDERE}, <strong>n°</strong> ${rs[index].NRENDERE}, ${dscomend} <strong>Bairro:</strong> ${rs[index].BIENDERE}<br>
                                  ${rs[index].NMCIDADE} - ${rs[index].CDESTADO}<br>
                                  ${new stringMask('00000-000').apply(rs[index].CPENDERE)}
                              </div>
                            </div>`;
            blocoTexto += `<div style="page-break-before: always; padding:75.59px;text-align:justify;">
                              <p style="padding-bottom:20px; padding-top:60px;">${dataLoc}</p>
                              <p style="padding-bottom:20px;">Prezado(a) Sr(a) ${rs[index].NMMOTORI.split(' ')[0]},</p>`;

            if(rs[index].NRCLASSI <= 10){
              blocoTexto += `<p>A BRAVO SERVIÇOS LOGÍSTICOS tem o prazer de lhe dar as boas-vindas e lhe parabenizar pela participação no PROGRAMA BRAVO DE SEGURANÇA NAS ESTRADAS.</p>
                             <p>O Programa visa aumentar consideravelmente a segurança nas estradas, focado na proteção individual, no meio ambiente e em terceiros que dela fazem uso, buscando ser exemplo de empresa segura e consciente.</p>
                             <p>Você está concorrendo a uma viagem com a família <i>(dependentes conforme regras do plano de saúde)</i> durante 1(uma) semana para um RESORT com as despesas pagas pela BRAVO! Este prêmio é intransferível e personalíssimo.</p>
                             <p>Você se encontra na ${rs[index].NRCLASSI}° colocação com ${rs[index].VLMDTOTA} pontos.</p>
                             <p>PARABÉNS!!</p>
                             <p>VOCÊ É UM EXEMPLO DE COMPORTAMENTO SEGURO!</p>`;
            }else if(rs[index].NRCLASSI >= 11 && rs[index].NRCLASSI <= 49){
              blocoTexto += `<p>A BRAVO SERVIÇOS LOGÍSTICOS tem o prazer de lhe dar as boas-vindas e lhe parabenizar pela participação no PROGRAMA BRAVO DE SEGURANÇA NAS ESTRADAS.</p>
                             <p>O Programa visa aumentar consideravelmente a segurança nas estradas, focado na proteção individual, no meio ambiente e em terceiros que dela fazem uso, buscando ser exemplo de empresa segura e consciente.</p>
                             <p>Você está concorrendo a uma viagem com a família <i>(dependentes conforme regras do plano de saúde)</i> durante 1(uma) semana para um RESORT com as despesas pagas pela BRAVO! Este prêmio é intransferível e personalíssimo.</p>
                             <p>Você se encontra na ${rs[index].NRCLASSI}° colocação com ${rs[index].VLMDTOTA} pontos.</p>
                             <p>PERSISTA! ACREDITE! VOCÊ ESTÁ QUASE LÁ.</p>
                             <p>SEJA UM EXEMPLO PARA SUA FAMÍLIA.</p>`;
            }else{
              blocoTexto += `<p>A BRAVO SERVIÇOS LOGÍSTICOS tem o prazer de lhe dar as boas-vindas e lhe parabenizar pela participação no PROGRAMA BRAVO DE SEGURANÇA NAS ESTRADAS.</p>
                             <p>O Programa visa aumentar consideravelmente a segurança nas estradas, focado na proteção individual, no meio ambiente e em terceiros que dela fazem uso, buscando ser exemplo de empresa segura e consciente.</p>
                             <p>Você está concorrendo a uma viagem com a família <i>(dependentes conforme regras do plano de saúde)</i> durante 1(uma) semana para um RESORT com as despesas pagas pela BRAVO! Este prêmio é intransferível e personalíssimo.</p>
                             <p>Você se encontra na ${rs[index].NRCLASSI}° colocação com ${rs[index].VLMDTOTA} pontos.</p>
                             <p>As férias do seu sonho só depende de você.</p>
                             <p>NÃO DESISTA.</p>
                             <p><SEJA UM EXEMPLO PARA SUA FAMÍLIA./p>`;
            }

            if(rs[index].QTDPASSOS == 1){
              blocoTexto   += `<p>Falta ${rs[index].QTDPASSOS} "passo" das férias dos seus sonhos.</p>`;
            }else{
              blocoTexto   += `<p>Faltam ${rs[index].QTDPASSOS} "passos" das férias dos seus sonhos.</p>`;
            }

            blocoTexto   += `<p>Boa sorte!</p>
                             <p>Atenciosamente,</p>
                             <p>BRAVO SERVIÇOS LOGÍSTICOS.</p>
                          </div>`;

          }

          

          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
         });
          const page    = await browser.newPage();
    
          await page.setContent(`<!DOCTYPE html>
                    <html lang="pt-br">
                    
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <meta http-equiv="X-UA-Compatible" content="ie=edge">
                      <meta name="author" content="Marco">
                      <meta name="description" content="PDF da Bravo">
                      <meta name="keywords" content="MDF-e">
                      <title>Bravo</title>
                      <style type="text/css">
                        html {
                          font-family: serif;
                        }
                        body {
                          margin: 0px;
                        }
                      </style>
                    
                    </head>
                    
                    <body>
                        ${blocoTexto}
                    </body>
                    </html>`);
        
                  
          await page.emulateMedia('screen');
          
          const pdf = await page.pdf({
            format: 'A4',
            margin: {
              top:    '0cm',
              right:  '0cm',
              bottom: '0cm',
              left:   '0cm'
            },
            printBackground: true
          });

          await browser.close();
          var fileContents = new Buffer(pdf, 'base64');
    
          var readStream = new stream.PassThrough();
          readStream.end(fileContents);
    
          res.setHeader('Content-disposition', 'inline');
          res.setHeader('Content-type', 'application/pdf');
    
          readStream.pipe(res);
    
        
        }else{
          res.status(400).send({ message: 'Não foi encontrado nenhum motorista para está campanha.' });
          return res;
        }
      } catch (err) {
        err.stack = new Error().stack + `\r\n` + err.stack;
        res.status(500).send({ strErro: err.message });
        logger.error("Erro:", err);
        throw err;
      }
      
    };

    api.listar = async function (req, res, next) {
      
      var ok = await dao.listar(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    };

    api.buscaLancMotorista = async function (req, res, next) {
      
      var ok = await dao.buscaLancMotorista(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    };

    api.fecharLancamentos = async function (req, res, next) {
      
      var ok = await dao.fecharLancamentos(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    };
    
    api.validaFechamento = async function (req, res, next) {
      
      var ok = await dao.validaFechamento(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    };
    
    return api;
  };
  