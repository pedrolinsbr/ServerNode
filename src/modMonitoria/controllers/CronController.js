module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modMonitoria.dao.CronDAO;
  var daoDelivery = app.src.modMonitoria.dao.DeliveryNFDAO;
  var email = app.src.modMonitoria.controllers.EmailController;
  var logger = app.config.logger;
  var moment = require('moment');
  const utilsCA = app.src.utils.ConversorArquivos;
  var fs = require('fs');
  api.controller = app.config.ControllerBD;
  var tmz = app.src.utils.DataAtual;
  const axios = require('axios');
  var multiDoc = app.src.modGlobal.controllers.MultiDocController;
  var pod = app.src.modDocSyn.controllers.PODController;

  const dirIMG = process.env.FOLDER_CANHOTO;
  const dirPDF = process.env.FOLDER_CANHOTO_PDF;
  const sharp = require('sharp');
  const pdfKit = require('pdfkit');

  //---------------------------------------------------------------//
  api.envioNpsMonitoria = async function (req, res, next) {
    console.log("Cron Monitoria envio satisfação");
    var controllerDelivery = app.src.modMonitoria.controllers.DeliveryNFController;
    var objSatisfacao = await controllerDelivery.enviarSatisfacao();
    res.status(200).send({ armensag: objSatisfacao });

  }

  api.envioRastereioCteMonitoria = async function (req, res, next) {
    console.log("Cron Monitoria envio rastreio");

    var objCteAg = await dao.getCteAg();
    let geraCodigoRast;

    if (objCteAg && objCteAg.length > 0) {
      for (let i = 0; i < objCteAg.length; i++) {
        geraCodigoRast = await daoDelivery.getCteInfoAg(objCteAg[i]);
      }
    }

    // busca is ctes que serão enviados para os clientes
    var objEnvioRastreio = await dao.cteEnvioClienteMonitoria();
    //let urlHost =  process.env.URL_MONITORIA;
    //let urlHost = 'http://localhost:4200';
    let urlHost = 'http://monitoria.bravo2020.com.br';
    let paramLogCron = {};

    if (objEnvioRastreio != undefined && objEnvioRastreio != null && objEnvioRastreio.length > 0) {

      for (i = 0; i < objEnvioRastreio.length; i++) {


        if (objEnvioRastreio[i].emailEnvioCte != null && objEnvioRastreio[i].emailEnvioCte.DSEMAIL != null) {

          //se todas as condições estiverem corretos faz o envio
          if (objEnvioRastreio[i].emailEnvioCte.DSEMAIL != null && objEnvioRastreio[i].emailEnvioCte.DSEMAIL != '' && objEnvioRastreio[i].emailEnvioCte.DSEMAIL != undefined) {
            let retEmail = null;
            //##############################################################################################
            // Valida e-mail exclusivo para Syngenta
            if (objEnvioRastreio[i].IDG014 == 5) {
              //dispara e-mail especial para syngenta, com layout diferente
              //diferenciação pelo ultimo parâmetro da função
              console.log("email syngenta");
              //retEmail = await email.sendEmailDebugg(objEnvioRastreio[i], urlHost, i);
              retEmail = await email.sendEmailEntregaSyngenta(objEnvioRastreio[i].CDRASTRE, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, objEnvioRastreio[i].NRNOTEMA);

            } else if (objEnvioRastreio[i].IDG014 == 93) {
              console.log("email FMC");
              //retEmail = await email.sendEmailDebugg(objEnvioRastreio[i], urlHost, i);
              retEmail = await email.sendEmailEntregaFmc(objEnvioRastreio[i].CDRASTRE, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, objEnvioRastreio[i].NRNOTEMA);

            } else if (objEnvioRastreio[i].IDG014 == 71) {

              console.log("email ADAMA");
              //retEmail = await email.sendEmailDebugg(objEnvioRastreio[i], urlHost, i);
              retEmail = await email.sendEmailEntregaAdama(objEnvioRastreio[i].CDRASTRE, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, objEnvioRastreio[i].NRNOTEMA);

            } else {
              //##############################################################################################
              //disparo de e-mail para demais operações, com layout padrão
              console.log("email normal");
              //retEmail = await email.sendEmailDebugg(objEnvioRastreio[i], urlHost, i);
              retEmail = await email.sendEmailEntrega(objEnvioRastreio[i].CDRASTRE, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, objEnvioRastreio[i].NRNOTEMA);
            }

            paramLogCron.IDG051 = objEnvioRastreio[i].IDG051;
            paramLogCron.DSEMAID = '';
            paramLogCron.DSENVPAR = objEnvioRastreio[i].emailEnvioCte.DSEMAIL;
            paramLogCron.SNENVIAD = 1;
            paramLogCron.TPSISENV = 'R';
            paramLogCron.TXOBSERV = `Email enviado com sucesso G051 ${objEnvioRastreio[i].IDG051}`;
            paramLogCron.DTPREENT = objEnvioRastreio[i].DTPREENT;
            await dao.gravaLogEnvioCron(paramLogCron);
            //res.json(result);
          } else {
            paramLogCron.IDG051 = objEnvioRastreio[i].IDG051;
            paramLogCron.DSEMAID = '';
            paramLogCron.DSENVPAR = '';
            paramLogCron.SNENVIAD = 2;
            paramLogCron.TPSISENV = 'R';
            paramLogCron.TXOBSERV = `Email não informado G051 ${objEnvioRastreio[i].IDG051}`;
            paramLogCron.DTPREENT = objEnvioRastreio[i].DTPREENT;
            await dao.gravaLogEnvioCron(paramLogCron);
          }

        } else { // emailEnvioCte != 'undefined'

          paramLogCron.IDG051 = objEnvioRastreio[i].IDG051;
          paramLogCron.DSEMAID = '';
          paramLogCron.DSENVPAR = '';
          paramLogCron.SNENVIAD = 2;
          paramLogCron.TPSISENV = 'R';
          paramLogCron.TXOBSERV = `Email não encontrado G051 ${objEnvioRastreio[i].IDG051}`;
          paramLogCron.DTPREENT = objEnvioRastreio[i].DTPREENT;
          await dao.gravaLogEnvioCron(paramLogCron);
        }
      }
    }

    console.log("FIM DO CRON ENVIO RASTREIO");
    res.status(200).send({ armensag: `Processo envio rastreio finalizado` });

  }
  /**
   * Cron de envio com alteração de data de previsão de entrega
   */
  api.envioRastreioAlteracaoData = async function (req, res, next) {
    console.log("envioRastreioAlteracaoData");
    // busca is ctes que serão enviados para os clientes
    var objEnvioRastreio = await dao.cteEnvioAlteracaoDataPrevisaoEntrega();
    //let urlHost =  process.env.URL_MONITORIA;
    //let urlHost = 'http://localhost:4200';
    let urlHost = 'http://monitoria.bravo2020.com.br';
    let paramUpdateLogCron = {};

    for (i = 0; i < objEnvioRastreio.length; i++) {
      // para fazer o envio é necessário o IDG077 existir
      // e o campo SNENVRAS (G005) da indústria estar setado como 1
      if (objEnvioRastreio[i].SNENVRAS == 1 && (objEnvioRastreio[i].IDG077 != null || objEnvioRastreio[i].IDG077 != '')) {
        // busca o código do rastreio por cada item do obj de cte para o envio
        let result = await daoDelivery.getRastreioPorCTE(objEnvioRastreio[i])
          .then((result1) => {
            //console.log("result1 ", result1);
            return result1;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });

        // se estiver liberado (dentro do prazo) ele continua com o processo
        if (result.ISLIBERA == 1) {
          //pega os emails que deverão receber o rastreio de cada cte
          //##############################################################################################
          // se for operação da Syngenta, não pega contatos de cliente e sim o contato que fica na nota
          let emailEnvioCte = await daoDelivery.getEmailToRastreioCtePorDelivery(objEnvioRastreio[i])
            .then((result2) => {
              return result2;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });

          if (typeof emailEnvioCte != 'undefined') {
            //se todas as condições estiverem corretos faz o envio
            if (emailEnvioCte.DSEMAIL != null && emailEnvioCte.DSEMAIL != '' && emailEnvioCte.DSEMAIL != undefined) {
              let retEmail = null;
              //##############################################################################################
              // Valida e-mail exclusivo para Syngenta
              if (objEnvioRastreio[i].IDG014 == 5) {
                // faz envio de e-mail especial da Syngenta, com layout diferente
                retEmail = await email.sendEmailEntregaSyngenta(result.CDRASTRE, emailEnvioCte.DSEMAIL, urlHost, null, result.NRNOTEMA);
              }

              paramUpdateLogCron.IDG078 = objEnvioRastreio[i].IDG078;
              paramUpdateLogCron.DTPREENT = objEnvioRastreio[i].DTPREENT;
              await dao.atualizaLogDataPreEntEnvioCron(paramUpdateLogCron);
              //res.json(result);
            }
          }
        }
      }
    }

    console.log("FIM DO CRON REENVIO RASTREIO SYNGENTA 1");
    res.status(200).send({ armensag: `Processo reenvio rastreio syngenta 1 finalizado` });

  }




  //api.envioRastereioCteMonitoria(null, null, null);

  // api.cronSendRastreioCteMonitoria = async function (req, res, next) {
  //   let result = await dao.getRastreio(req, res, next)
  //     .then((result1) => {
  //       return result1;
  //     })
  //     .catch((err) => {
  //       err.stack = new Error().stack + `\r\n` + err.stack;
  //       next(err);
  //     });

  //   if (result.ISLIBERA == 1) {
  //     if (req.body.DSEMAIL != null && req.body.DSEMAIL != '' && req.body.DSEMAIL != undefined) {
  //       await email.sendEmailEntrega(result.CDRASTRE, req.body.DSEMAIL, req.headers.origin, req.UserId);
  //       res.json(result);
  //     } else {
  //       res.status(500).send({armensag:'Não foi possível enviar o rastreio.'});
  //     }
  //   } else {
  //     res.status(500).send({armensag:'Não foi possível enviar o rastreio.'});
  //   }
  // };

  api.rastreioQM = async function (req, res, next) {
    logger.info("Inicio rastreioQM");
    let con = null;
    this.controller = app.config.ControllerBD;

    try {
      // Inicia a variável.
      let path = null;
      // Verifica se é Windows
      if (process.platform === "win32") {
        path = process.cwd() + '/../rastreio';
      } else {
        // Caso se diferente ele vai para a pasta do Linux.
        path = "/dados/rastreio";
      }
      logger.info(`PRINT DA PATH ${path}`);
      // Define a pasta raiz do rastreio.
      let pastas = fs.readdirSync(path);
      logger.info(`PASTA ${pastas}`);
      // Trava para tratativa de de result
      let trataResult = false;
      // Trava para validação de algumas informações
      let trataInformacao = false;
      // Faz um laço com todas as pastas dos 3PL
      for (key in pastas) {
        // Define a pasta de entrada.
        let pathIn = path + '/' + pastas[key] + '/qm/in';
        // Define a pasta de saída.
        let pathOut = path + '/' + pastas[key] + '/qm/out/';
        logger.info(`PASTA IN ${pathIn}`);
        logger.info(`PASTA OUT ${pathOut}`);
        // Lê a pasta de entrada.
        let arquivos = fs.readdirSync(pathIn);
        // Percorre todos os arquivos da pasta de entrada de um determinado 3PL
        for (key1 in arquivos) {
          con = await this.controller.getConnection();
          // Define o caminho de um arquivo.
          let pathInFile = pathIn + '/' + arquivos[key1];
          // define o tamanho do arquivo
          let fileSize = fs.statSync(pathInFile).size;
          // verifica se o arquivo não está vazio
          if (fileSize > 0) {
            // Lê o arquivo.
            let strXml = utilsCA.lerArquivo(pathInFile);
            // Converte o arquivo em DOM.
            let xmlDom = utilsCA.getXmlDom(strXml);
            // Pega todas as tag dnf.
            let elements = utilsCA.getXmlNodes('/infnfs/dnf', xmlDom);
            // Percorre todas as tags dnf
            for (let x = 0; x < elements.length; x++) {
              //logger.info(`ENTROU NO FOR DE LEITURA`);
              //let nf = utilsCA.getXmlNodes("/infnfs/dnf[" + (x + 1) + "]/@nf", xmlDom)[0].nodeValue;
              // Pega a chave da NF.
              let nf = elements[x].getAttribute('nf');
              let lat = elements[x].getAttribute('lat').replace(/,/g, ".").substr(0, 15);
              let lon = elements[x].getAttribute('lon').replace(/,/g, ".").substr(0, 15);
              let dhatu = elements[x].getAttribute('dhatu');
              let loc = elements[x].getAttribute('loc');
              let dtentr = elements[x].getAttribute('dtentr');
              let dtpreent = elements[x].getAttribute('dtpreent');
              let ocor = elements[x].getAttribute('ocor');
              let cjrem = elements[x].getAttribute('cjrem');
              //limpa a tratativa a cada vez que rodar o loop
              trataResult = false;
              trataInformacao = false;

              /*################################################################################################### */
              // Formato padrão da data		
              var formatoDataPadrao = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
              var formatoDataHoraPadrao = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4} [0-9]{2}:[0-9]{2}$/;

              //Tratativa de Lat e Log
              // if( (!lat && (lat == '' || lat == 0)) && (!lon && (lon == '' && lon == 0)) ){
              //   trataInformacao = true;
              //   logger.info(`Lat Long não informado ou infomação incorreta`);
              //   elements[x].setAttribute("result", "Lat Long não informado ou infomação incorreta");
              // }

              // Tratativa de Data Atualização
              if (!dhatu && dhatu == '' && dhatu == null) {
                trataInformacao = true;
                //logger.info(`Data de atualização não informada`);
                elements[x].setAttribute("result", "Data de atualização não informada");
              } else {
                if (!formatoDataHoraPadrao.test(dhatu)) {
                  trataInformacao = true;
                  //logger.info(`Data de atualização com formato incorreto`);
                  elements[x].setAttribute("result", "Data de atualização com formato incorreto");
                }
              }

              // Tratativa de localização
              if (!loc && (loc == '' || loc == 0)) {
                trataInformacao = true;
                //logger.info(`Localização não informada`);
                elements[x].setAttribute("result", "Localização não informada");
              }

              //Tratativa data de entrega
              if (dtentr && dtentr != '') {
                if (!formatoDataPadrao.test(dtentr)) {
                  trataInformacao = true;
                  //logger.info(`Data de entrega com formato incorreto`);
                  elements[x].setAttribute("result", "Data de entrega com formato incorreto");
                }
              }

              //Tratativa data de previsão
              if (dtpreent && dtpreent != '') {
                if (!formatoDataPadrao.test(dtpreent)) {
                  trataInformacao = true;
                  //logger.info(`Data de previsão com formato incorreto`);
                  elements[x].setAttribute("result", "Data de previsão com formato incorreto");
                }
              }

              // Tratativa de CNPJ
              if (!cjrem && (cjrem == '' || cjrem == 0)) {
                trataInformacao = true;
                //logger.info(`CNPJ não informado`);
                elements[x].setAttribute("result", "CNPJ não informado");
              }

              if (trataInformacao == false) {
                // Se passar nas tratativas, segue o fluxo
                if ((nf.trim()) !== "") {

                  let whereAux = '';

                  if ((nf.trim()).length == 44) {
                    whereAux = ` And G043.NrChaDoc = '` + nf + `' `;
                  } else {
                    whereAux = ` And G043.NrNota = '` + nf + `' `;
                  }

                  let arNF = await con.execute({
                    sql: `
                    Select X.* From (
                    Select  Distinct G043.IdG043, G043.Dtentreg, G043.NrChaDoc, G060.IdG060, G060.NrLatitu, G060.NrLongit, G060.DsLocali
                    From    G043 G043 
                    Join G052 G052 ON G052.IDG043 = G043.IDG043
                    Join G051 G051 ON G051.IDG051 = G052.IDG051
                    Join G005 G005RE On G005RE.IDG005 = G051.IDG005RE
                    Left Join G060 G060 On G060.Idg043 = G043.Idg043
                    Where   G043.NrChaDoc Is Not Null
                            And G005RE.CJCLIENT = '`+ cjrem + `'
                            `+ whereAux + `
                    Order By G060.IDG060 Desc) X
                    Where RowNum = 1`,
                    param: {}
                  })
                    .then((result) => {
                      return result;
                    })
                    .catch((err) => {
                      err.stack = new Error().stack + `\r\n` + err.stack;
                      throw err;
                    });

                  if (arNF.length > 0) {

                    let dthratualizacao = '';
                    if (dhatu) {
                      dthratualizacao = moment(dhatu, "DD/MM/YYYY HH:mm").toDate();
                    }

                    if (arNF[0].IDG060 == null && loc != null) {
                      await con.insert({
                        tabela: `G060`,
                        colunas: {
                          'IDG043': arNF[0].IDG043,
                          'DTPOSICA': dthratualizacao,
                          'NRLATITU': lat,
                          'NRLONGIT': lon,
                          'DSLOCALI': loc
                        }
                      });
                    } else {
                      if (arNF[0].DSLOCALI != loc && loc != null) {
                        await con.insert({
                          tabela: `G060`,
                          colunas: {
                            'IDG043': arNF[0].IDG043,
                            'DTPOSICA': dthratualizacao,
                            'NRLATITU': lat,
                            'NRLONGIT': lon,
                            'DSLOCALI': loc
                          }
                        });
                      }
                    }



                    // busca informações da nota e do cte vinculado
                    let buscaCteNota = await con.execute({
                      sql: `
                      SELECT 
                          G052.IDG051, 
                          G052.IDG043, 
                          G048.IDG046,
                          G051.IDI015 as IDI015,
                          To_Char(G043.DTENTREG, 'DD/MM/YYYY') AS DTENTREG, 
                          To_Char(G051.DTENTPLA, 'DD/MM/YYYY') AS DTENTPLA,
                          To_Char(G043.DTENTCON, 'DD/MM/YYYY') AS DTENTCON,
                          To_Char(G051.DTAGENDA, 'DD/MM/YYYY') AS DTAGENDA,   
                          To_Char(G051.DTCOMBIN, 'DD/MM/YYYY') AS DTCOMBIN,
                          To_Char(G048.DTPREORI, 'DD/MM/YYYY') AS DTPREORI,
                          To_Char(G043.DTENTMOB, 'DD/MM/YYYY') AS DTENTMOB,

                          (Select A001.IDA001
                            From A005 A005
                            Join A001 A001
                                On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0 And A001.STDATAS in ('E','P','A','C'))
                            Where A005.IDG043 = G043.IDG043
                            ORDER BY A001.IDA001 DESC FETCH FIRST ROW ONLY) As IDA001,

                          (Select A001.STDATAS
                            From A005 A005
                            Join A001 A001
                                On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0 And A001.STDATAS in ('P'))
                            Where A005.IDG043 = G043.IDG043
                            ORDER BY A001.IDA001 DESC FETCH FIRST ROW ONLY) As STDATAS


                        FROM G052 G052 
                        INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
                        INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
                        INNER JOIN G049 G049 ON G049.IDG043 = G043.IDG043 AND
                                                G051.IDG051 = G049.IDG051
                        INNER JOIN G048 G048 ON G048.IDG048 = G049.IDG048
                        INNER JOIN G046 G046 ON G046.IDG046 = G048.IDG046
                        WHERE G046.STCARGA <> 'C' AND
                              G051.STCTRC = 'A'     AND
                              G043.SNDELETE = 0     AND
                              G052.IDG043 = ${arNF[0].IDG043}`,
                      param: []
                    })
                      .then((result) => {
                        return (result);
                      })
                      .catch((err) => {
                        err.stack = new Error().stack + `\r\n` + err.stack;
                        throw err;
                      });
                    // SE NÃO ACHAR NOTA/CTE VINCULADO RETORNA ERRO
                    if (buscaCteNota.length == 0) {
                      trataResult = true;
                      elements[x].setAttribute("result", "NF NÃO ENCONTRADA NA BASE DE DADOS");
                    } else if (buscaCteNota.length > 1) {
                      // SE RETORNAR MAIS DE UM REGISTRO ENCONTRADO, RETORNA ERRO
                      trataResult = true;
                      elements[x].setAttribute("result", "DUPLICIDADE ENCONTRADA NA NF");
                    } else {
                      //##########################################################################
                      // - É alteração de Datas Planejada
                      //##########################################################################
                      if (dtpreent != "") {
                        //logger.info(`ENTROU IF PREVISÃO DE ENTREGA `);
                        // faz alteração de data planejada se a informação vinda do QM é diferente da que está atualmente no banco de dados
                        // ou se a informação que está no banco é vazia
                        if ((buscaCteNota[0].DTENTPLA != dtpreent) || (buscaCteNota[0].DTENTPLA == '' || buscaCteNota[0].DTENTPLA == null)) {
                          //logger.info(`ENTROU NO SEGUNDO IF PREVISÃO DE ENTREGA `);
                          //valida se existe motivo informado

                          if (ocor != "" && (buscaCteNota[0].IDI015 == null || (buscaCteNota[0].IDI015 != null && buscaCteNota[0].IDA001 == null))) {

                            //valida se o motivo informado existe no sistema
                            let validaMotivo = await con.execute({
                              sql: `  
                                    SELECT 
                                      A015.IDA015, 
                                      A015.IDA002, 
                                      A015.IDI015 
                                    FROM A015 A015 
                                    WHERE A015.IDA002 = ${ocor}  `,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch(async (err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });

                            if (validaMotivo.length == 0) {
                              trataResult = true;
                              //logger.info(`MOTIVO INFORMADO NÃO ENCONTRADO`);
                              elements[x].setAttribute("result", "MOTIVO INFORMADO NÃO ENCONTRADO");
                            } else if (validaMotivo.length > 1) {
                              trataResult = true;
                              //logger.info(`MOTIVO INFORMADO DUPLICADO`);
                              elements[x].setAttribute("result", "MOTIVO INFORMADO DUPLICADO");
                            } else {


                              if (buscaCteNota[0].IDA001 == null || buscaCteNota[0].STDATAS == null) {


                                //logger.info(`UPDATE TABELA CONHECIMENTO G051 DTPREENT`);
                                let alteraPrazoEntrega = await con.execute({
                                  sql: `        
                                  Update G051 G051

                                    Set  G051.DTENTPLA = To_Date('${((dtpreent).trim().length) == 19 ? dtpreent : dtpreent + ' 12:00'} ', 'DD/MM/YYYY HH24:MI'),

                                        G051.STINTCLI = 1,
                                        G051.IDI015 = ${validaMotivo[0].IDI015},
                                        G051.STLOGOS = 'P'
                                  Where G051.IDG051 = ${buscaCteNota[0].IDG051}`,
                                  param: []
                                })
                                  .then((result1) => {
                                    return result1;
                                  })
                                  .catch((err) => {
                                    err.stack = new Error().stack + `\r\n` + err.stack;
                                    throw err;
                                  });
                              }// else de validação dos motivos

                            }

                          } else {
                            // trataResult = true;
                            // logger.info(`MOTIVO NÃO INFORMADO`);
                            // elements[x].setAttribute("result", "MOTIVO NÃO INFORMADO");
                            //logger.info(`UPDATE TABELA CONHECIMENTO G051 DTPREENT`);

                            if (buscaCteNota[0].IDA001 == null || buscaCteNota[0].STDATAS == null) {

                              let alteraPrazoEntregaSemMotivo = await con.execute({
                                sql: `        
                                  Update G051 G051

                                    Set  G051.DTENTPLA = To_Date('${((dtpreent).trim().length) == 19 ? dtpreent : dtpreent + ' 12:00'}', 'DD/MM/YYYY HH24:MI'),

                                        G051.STINTCLI = 1
                                  Where G051.IDG051 = ${buscaCteNota[0].IDG051}`,
                                param: []
                              })
                                .then((result1) => {
                                  return result1;
                                })
                                .catch((err) => {
                                  err.stack = new Error().stack + `\r\n` + err.stack;
                                  throw err;
                                });
                            }

                          }//else de validação de ocorrência vazias

                        }//validação diferença entre parametro e banco de dados

                      }//validação data planejada vazia


                      //##########################################################################
                      // - É alteração de Datas Entrega
                      //##########################################################################
                      if (dtentr != "") {
                        //logger.info(`ENTROU DATA DE ENTREGA`);

                        // faz alteração de data entrega se o campo na nota estiver vazio e se não houver data de entrega 
                        // do mobile
                        if ((buscaCteNota[0].DTENTMOB == null || buscaCteNota[0].DTENTMOB == '') && (buscaCteNota[0].DTENTREG == '' || buscaCteNota[0].DTENTREG == null)) {
                          //logger.info(`ENTROU NO SEGUNDO IF DATA DE ENTREGA `);
                          let nrEtapa = null;
                          // valida status da nota para tratamento quando for recusa ou devolução
                          let buscaStatusDaNota = await con.execute({
                            sql: `        
                            SELECT TPDELIVE FROM G043 G043 WHERE G043.IDG043 = ${buscaCteNota[0].IDG043}`,
                            param: []
                          })
                            .then((result1) => {
                              return result1;
                            })
                            .catch(async (err) => {
                              err.stack = new Error().stack + `\r\n` + err.stack;
                              throw err;
                            });

                          // Se TPDELIVE for 3 ou 4, a delivery é recusa ou devolução, por isso muda etapa para 25
                          if (buscaStatusDaNota[0].TPDELIVE == 3 || buscaStatusDaNota[0].TPDELIVE == 4) {
                            nrEtapa = 25;
                          } else {
                            nrEtapa = 5;
                          }

                          // se não informar o motivo, ao atualizar a data de entrega, seta como vazio o motivo atual
                          let nrMotivo = null;

                          //valida se existe motivo informado
                          if (ocor != "" && (buscaCteNota[0].IDI015 == null || (buscaCteNota[0].IDI015 != null && buscaCteNota[0].IDA001 == null))) {
                            //valida se o motivo informado existe no sistema
                            let validaMotivoEntrega = await con.execute({
                              sql: `      
                                    SELECT 
                                      A015.IDA015, 
                                      A015.IDA002, 
                                      A015.IDI015 
                                    FROM A015 A015 
                                    WHERE A015.IDA002 = ${ocor} `,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch(async (err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });

                            if (validaMotivoEntrega.length != 1) {
                              trataResult = true;
                              //logger.info(`MOTIVO INFORMADO NÃO ENCONTRADO`);
                              elements[x].setAttribute("result", "MOTIVO INFORMADO NÃO ENCONTRADO");
                            } else {
                              nrMotivo = validaMotivoEntrega[0].IDI015;
                            }

                          } else if (buscaCteNota[0].IDI015 == null || (buscaCteNota[0].IDI015 != null && buscaCteNota[0].IDA001 == null)) {
                            //logger.info(`ENTROU ELSE MOTIVO MANUAL`);
                            //formata data previsão de entrega para para formato americano


                            let DtEntConAux = buscaCteNota[0].DTENTCON.split(' ')[0];


                            let Dt1 = DtEntConAux.split('/');
                            let Dt2 = `${Dt1[2]}-${Dt1[1]}-${Dt1[0]}`;

                            //formata data de entrada para formato americano
                            let Dt3 = dtentr.split('/');
                            let Dt4 = `${Dt3[2]}-${Dt3[1]}-${Dt3[0]}`;

                            // transforma em data
                            let dtPreOriAux = tmz.retornaData(Dt2, 'YYYY-MM-DD');
                            let dtEntregAux = tmz.retornaData(Dt4, 'YYYY-MM-DD');

                            //pega time das datas para comparação
                            let newDtSLA = dtPreOriAux.getTime();
                            let newDtEntreg = dtEntregAux.getTime();

                            // se data de previsão for igual a data de entrega seta motivo entrega no prazo
                            if (newDtEntreg == newDtSLA) {
                              nrMotivo = 60; // Entrega normal
                            } else if (newDtEntreg < newDtSLA) {
                              // se data de entrega for menor que a previsão, seta motivo de entrega antecipada
                              nrMotivo = 24; // Entrega antecipada
                            }

                          }


                          //se tiver motivo, grava no banco
                          if (nrMotivo != null) {
                            // await con.update({
                            //   tabela: `G043`,
                            //   colunas: {
                            //     'DTENTREG' : dtentr,
                            //     'STETAPA'  : nrEtapa,
                            //     'STLOGOS' : 'E',
                            //     'IDI015'  : nrMotivo
                            //   },
                            //   condicoes: `IDG043 = :id`,
                            //   parametros: {
                            //     id: arNF[0].IDG043
                            //   }
                            // });

                            let alteraDataEntregaComMotivo = await con.execute({
                              sql: `        
                                Update G043 G043

                                  Set G043.DTENTREG = To_Date('${((dtentr).trim().length) == 19 ? dtentr : dtentr + ' 12:00'}', 'DD/MM/YYYY HH24:MI'),
                                      G043.DTENTRAS = To_Date('${((dtentr).trim().length) == 19 ? dtentr : dtentr + ' 12:00'}', 'DD/MM/YYYY HH24:MI'),
                                      G043.STETAPA  = ${nrEtapa},
                                      G043.STLOGOS  = 'E',
                                      G043.IDI015   = ${nrMotivo}
                                Where G043.IDG043 = ${arNF[0].IDG043}`,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch((err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });

                            //logger.info(`UPDATE G043 COM MOTIVO`);
                            // INFORMA MOTIVO DA DATA DE ENTREGA E MUDA STATUS
                            let result2 = await con.execute({
                              sql: `        
                              Update G051 G051
                                Set  G051.IDI015 = ${nrMotivo},
                                    G051.STINTCLI = 3
                              Where G051.IDG051 = ${buscaCteNota[0].IDG051}`,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch((err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });

                            //logger.info(`UPDATE G051 COM MOTIVO`);

                          } else {
                            // se não tiver motivo, não atualiza o campo para não ter risco de limpar o motivo que já possa estar no banco
                            // await con.update({
                            //   tabela: `G043`,
                            //   colunas: {
                            //     'DTENTREG' : dtentr,
                            //     'STETAPA'  : nrEtapa,
                            //     'STLOGOS' : 'E'
                            //   },
                            //   condicoes: `IDG043 = :id`,
                            //   parametros: {
                            //     id: arNF[0].IDG043
                            //   }
                            // });

                            let alteraDataEntrega = await con.execute({
                              sql: `        
                                Update G043 G043

                                  Set G043.DTENTREG = To_Date('${((dtentr).trim().length) == 19 ? dtentr : dtentr + ' 12:00'}', 'DD/MM/YYYY HH24:MI'),
                                      G043.DTENTRAS = To_Date('${((dtentr).trim().length) == 19 ? dtentr : dtentr + ' 12:00'}', 'DD/MM/YYYY HH24:MI'),
                                      G043.STETAPA  = ${nrEtapa},
                                      G043.STLOGOS  = 'E'
                                Where G043.IDG043 = ${arNF[0].IDG043}`,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch((err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });

                            //logger.info(`UPDATE G043 SEM MOTIVO`);
                            // se não houver motivo, apenas muda o status do STINCLI para 3 sem gravar motivo
                            // INFORMA MOTIVO DA DATA DE ENTREGA E MUDA STATUS
                            let result2 = await con.execute({
                              sql: `        
                              Update G051 G051
                                Set G051.STINTCLI = 3
                              Where G051.IDG051 = ${buscaCteNota[0].IDG051}`,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch((err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });
                            //logger.info(`UPDATE G051 SEM MOTIVO`);
                          }

                          //  MUDA STATUS DA CARGA
                          if (buscaCteNota[0].IDG046 != null) {

                            let buscaNotaEntreg = await con.execute({
                              sql: `  
                              SELECT count(g043.idg043) as QTD
                              FROM g043 g043
                              JOIN G049 G049
                                ON G049.IDG043 = G043.IDG043
                              JOIN G048 G048
                                ON G048.IDG048 = G049.IDG048
                               AND g048.idg046 = ${buscaCteNota[0].IDG046}
                             WHERE g043.DTENTREG IS null  `,
                              param: []
                            })
                              .then((result1) => {
                                return result1;
                              })
                              .catch(async (err) => {
                                err.stack = new Error().stack + `\r\n` + err.stack;
                                throw err;
                              });

                            if (buscaNotaEntreg[0].QTD == 0) {
                              let alteraStatusCarga = await con.execute({
                                sql: `        
                                Update G046 G046
                                  Set  G046.STCARGA = 'D'
                                Where G046.IDG046 = ${buscaCteNota[0].IDG046}`,
                                param: []
                              })
                                .then((result1) => {
                                  return result1;
                                })
                                .catch(async (err) => {
                                  await con.closeRollback();
                                  err.stack = new Error().stack + `\r\n` + err.stack;
                                  throw err;
                                });
                              //logger.info(`UPDATE NA CARGA G046`);
                            }
                          }

                        } else {//else caso a data de entrega já esteja preenchida

                          let alteraDataEntregaComMotivo = await con.execute({
                            sql: `        
                              Update G043 G043
                                Set G043.DTENTRAS = To_Date('${((dtentr).trim().length) == 19 ? dtentr : dtentr + ' 12:00'}', 'DD/MM/YYYY HH24:MI')
                              Where G043.IDG043 = ${arNF[0].IDG043}`,
                            param: []
                          })
                            .then((result1) => {
                              return result1;
                            })
                            .catch((err) => {
                              err.stack = new Error().stack + `\r\n` + err.stack;
                              throw err;
                            });
                        }

                      }//valida se dt entrega está vazia

                    }// ELSE BUSCA CTE

                  } else {
                    trataResult = true;
                    //logger.info(`Nota não encontrada`);
                    elements[x].setAttribute("result", "Nota não encontrada");
                  }

                  //se trataResult for false, não houve nenhum setAttribute anteriormente e será printado o sucesso
                  //se for true, não printa sucesso e apenas o que foi tratado anteriormente
                  if (trataResult == false) {
                    // Define que a NF foi lida e processada corretamente.
                    //logger.info(`NF PROCESSADA`);
                    elements[x].setAttribute("result", "NF PROCESSADA");
                  }
                } else {
                  // Define que a NF foi lida e processada corretamente.
                  //logger.info(`NF NÃO PROCESSADA`);
                  elements[x].setAttribute("result", "NF NÃO PROCESSADA");
                }

              }// if das tratativas

            }
            // Grava na pasta de out o arquivo que acabou de ser lido e informa as notas que deram certo o processo.
            utilsCA.salvarArquivo(pathOut + moment().format('DD_MM_YYYY_HH_mm_ss') + '.xml', xmlDom.toString());
            //logger.info(`ARQUIVO CRIADO NA PASTA`);

            // Deleta o arquivo. (NÃO ESQUECER DE DESCOMENTAR ESSA LINHA QUANDO ACABAR DE TESTAR)
            fs.unlinkSync(pathInFile);
            //logger.info(`REMOVENDO ARQUIVO`);

            // Commit
            await con.close();
          }

          await con.close();

        }
      }
    } catch (err) {
      logger.info(`ERRO RASTREIO QM ===================================================`);
      logger.info(err);
      // Rollback
      if (con != null) {
        await con.closeRollback();
      }
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

  //api.rastreioQM();

  // Cron para setar motivo 25 - atraso do transportador diariamente as 16 horas
  // caso o transportador não informar nenhum no QM
  api.setaMotivoEntregaAtrasada = async function (req, res, next) {
    logger.info('setaMotivoEntregaAtrasada INICIADA ');
    this.controller = app.config.ControllerBD;
    let con1 = await this.controller.getConnection();
    // busca informações de delivery que estão com entrega em atraso
    let buscaDeliverys = await con1.execute({
      sql: `
      SELECT * FROM (
        SELECT 
              G052.IDG051, 
              G052.IDG043, 
              G048.IDG046,
              
              (Select A001.IDA001
                From A005 A005
                Join A001 A001
                    On (A001.IDA001 = A005.IDA001 And A001.SNDELETE = 0 And A001.STDATAS in ('E','P','A','C'))
                Where A005.IDG043 = G052.IDG043
                ORDER BY A001.IDA001 DESC FETCH FIRST ROW ONLY) As IDA001, 


              To_Char(G043.DTENTREG, 'DD/MM/YYYY') AS DTENTREG, 
              To_Char(G051.DTENTPLA, 'DD/MM/YYYY') AS DTENTPLA,
              To_Char(G051.DTAGENDA, 'DD/MM/YYYY') AS DTAGENDA,   
              To_Char(G051.DTCOMBIN, 'DD/MM/YYYY') AS DTCOMBIN,
              To_Char(G048.DTPREORI, 'DD/MM/YYYY') AS DTPREORI,
              G051.IDI015,
              TRUNC(G043.DTENTCON) as DTPRIEAD,
              TRUNC(MIN(G043.DTENTREG)) DTAAD,
              G051.STINTCLI,
              CASE
              WHEN TRUNC(G043.DTENTREG) > TRUNC(G043.DTENTCON) AND ((G051.IDI015 IS NULL OR G051.IDI015 IN  (60,24)) OR G051.STINTCLI <> 3 ) THEN 'ATRASADO'
              WHEN TRUNC(G043.DTENTREG) = TRUNC(G043.DTENTCON) THEN 'NO PRAZO'
              WHEN TRUNC(G043.DTENTREG) < TRUNC(G043.DTENTCON) THEN 'ADIANTADO'
              END AS FLAG
              
            FROM G052 G052 
            INNER JOIN G051 G051 ON G051.IDG051 = G052.IDG051
            INNER JOIN G043 G043 ON G043.IDG043 = G052.IDG043
            INNER JOIN G049 G049 ON G049.IDG043 = G043.IDG043 AND
                                    G051.IDG051 = G049.IDG051
            INNER JOIN G048 G048 ON G048.IDG048 = G049.IDG048
            INNER JOIN G046 G046 ON G046.IDG046 = G048.IDG046
            WHERE G046.STCARGA <> 'C' AND
                  G046.TPMODCAR <> 1 AND 
                  G051.STCTRC = 'A'   AND
                  G043.SNDELETE = 0   AND
                  TRUNC(G051.DTEMICTR) >= TO_DATE('2019/01/14', 'YYYY/MM/DD') AND 
                  G051.STINTCLI NOT IN (4) AND
                  G043.DTENTREG IS NOT NULL AND
                  G043.TPDELIVE <> '5'
                  --AND G052.IDG043 IN ()
                  -- and rownum <= 2
                        
                  
            GROUP BY G052.IDG051, 
                   G052.IDG043, 
                   G048.IDG046,
                   G043.DTENTCON,
                   G043.DTENTREG, 
                   G051.DTENTPLA, 
                   G051.DTAGENDA,   
                   G051.DTCOMBIN, 
                   G048.DTPREORI,
                   G051.IDI015,
                   G051.STINTCLI
        ) `,
      param: []
    })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });

    // Valida resultado da busca
    if (buscaDeliverys.length > 0) {
      logger.info('setaMotivoEntregaAtrasada ACHOU NOTAS ');
      let con = null;
      let motivo;

      for (let x = 0; x < buscaDeliverys.length; x++) {

        con = null;
        motivo = null;
        con = await this.controller.getConnection();

        if ((buscaDeliverys[x].IDI015 == null) || (buscaDeliverys[x].IDI015 != null && buscaDeliverys[x].IDA001 == null) ) {



          if (buscaDeliverys[x].FLAG == 'ATRASADO') {
            motivo = 25;

          } else if (buscaDeliverys[x].FLAG == 'ADIANTADO') {
            motivo = 24;

          } else {
            motivo = 60;
          }
        
          let result4 = await con.execute({
            sql: `        
              Update G043 G043
                Set G043.DTENTREG = (G043.DTENTREG + (1/86400)),
                    G043.IDI015  = ${motivo}
              Where G043.IDG043 = ${buscaDeliverys[x].IDG043}`,
            param: []
          })
          .then((result1) => {
            return result1;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });


          let result2 = await con.execute({
            sql: `        
                  Update G051 G051
                    Set G051.IDI015 = ${motivo},
                        G051.STINTCLI = 3
                  Where G051.IDG051 = ${buscaDeliverys[x].IDG051} `,
            param: []
          })
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });

          await con.close();

        } else if (buscaDeliverys[x].STINTCLI == 2 && buscaDeliverys[x].IDI015 != null) {

          let result3 = await con.execute({
            sql: `        
                Update G051 G051
                  Set 
                      G051.STINTCLI = 3
                Where G051.IDG051 = ${buscaDeliverys[x].IDG051} `,
            param: []
          })
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });

          await con.close();
        }
      }
      logger.info('setaMotivoEntregaAtrasada Final! ');
    }



  }


  api.envioRastereioCteMonitoriaV2 = async function (req, res, next) {
    console.log("Cron Monitoria envio rastreio");

    var objCteAg = await dao.getCteAg();
    let geraCodigoRast;

    if (objCteAg && objCteAg.length > 0) {
      for (let i = 0; i < objCteAg.length; i++) {
        geraCodigoRast = await daoDelivery.getCteInfoAg(objCteAg[i]);
      }
    }

    // busca as notas que serão enviados para os clientes
    var objEnvioRastreio = await dao.cteEnvioClienteMonitoriaV2();

    let urlHost = 'http://monitoria.evolog.com.br';
    let paramLogCron = {};
    let listNotas = [];
    let validaNotas = false;
    let notasEnviadas = [];

    if (objEnvioRastreio != undefined && objEnvioRastreio != null && objEnvioRastreio.length > 0) {

      for (i = 0; i < objEnvioRastreio.length; i++) {

        if (objEnvioRastreio[i].arrayNotas != null && objEnvioRastreio[i].arrayNotas != undefined) {

        /*Validação para não enviar as mesmas notas que já foram enviadas*/
        /*Caso tiver alguma nota diferente das que foram enviadas, enviar a nova nota e as outras também*/

          listNotas = [];
          objEnvioRastreio[i].arrayNotas.map(item => listNotas.push(item.IDG043));

          if (objEnvioRastreio[i].VALIDNOT == null || objEnvioRastreio[i].VALIDNOT == undefined) {
            validaNotas = true;
          } else {
            notasEnviadas = objEnvioRastreio[i].VALIDNOT.G043LIST.split(",");
            for (let j = 0; j < listNotas.length; j++) {
              if (!(notasEnviadas.includes(String(listNotas[j])))) {
                validaNotas = true;
                break;
              }
            }
          }

          if (validaNotas) {
            let retEmail = null;

            if (objEnvioRastreio[i].validaDominio.status) {

              if (objEnvioRastreio[i].emailEnvioCte != null && objEnvioRastreio[i].emailEnvioCte.DSEMAIL != null
                && objEnvioRastreio[i].emailEnvioCte.DSEMAIL != '' && objEnvioRastreio[i].emailEnvioCte.DSEMAIL != undefined) {
                //se todas as condições estiverem corretos faz o envio
                //##############################################################################################
                if (process.env.APP_ENV == 'EVT') {
                  // Valida e-mail exclusivo para Syngenta
                  if (objEnvioRastreio[i].IDG014 == 5) {
                    //dispara e-mail especial para syngenta, com layout diferente
                    console.log("email syngenta");

                    retEmail = await email.sendEmailEntregaSyngentaV2(objEnvioRastreio[i].arrayNotas, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, { IDG005DE: objEnvioRastreio[i].IDG005DE, IDG014: objEnvioRastreio[i].IDG014 });

                  } else if (objEnvioRastreio[i].IDG014 == 93) {
                    console.log("email FMC");
                    retEmail = await email.sendEmailEntregaFmcV2(objEnvioRastreio[i].arrayNotas, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, { IDG005DE: objEnvioRastreio[i].IDG005DE, IDG014: objEnvioRastreio[i].IDG014 });

                  } else if (objEnvioRastreio[i].IDG014 == 71) {
                    console.log("email ADAMA");
                    retEmail = await email.sendEmailEntregaAdamaV2(objEnvioRastreio[i].arrayNotas, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, { IDG005DE: objEnvioRastreio[i].IDG005DE, IDG014: objEnvioRastreio[i].IDG014 });

                  } else {
                    //##############################################################################################
                    //disparo de e-mail para demais operações, com layout padrão
                    console.log("email normal");
                    retEmail = await email.sendEmailEntregaV2(objEnvioRastreio[i].arrayNotas, objEnvioRastreio[i].emailEnvioCte.DSEMAIL, urlHost, null, { IDG005DE: objEnvioRastreio[i].IDG005DE, IDG014: objEnvioRastreio[i].IDG014 });
                  }

                  paramLogCron.IDG005DE = objEnvioRastreio[i].IDG005DE;
                  paramLogCron.DSEMAID = '';
                  paramLogCron.DSENVPAR = objEnvioRastreio[i].emailEnvioCte.DSEMAIL;
                  paramLogCron.SNENVIAD = 1;
                  paramLogCron.TPSISENV = 'R';
                  paramLogCron.TXOBSERV = `Email enviado com sucesso Cliente ${objEnvioRastreio[i].IDG005DE}`;
                  paramLogCron.G043LIST = listNotas.join();
                  await dao.gravaLogEnvioCron(paramLogCron);
                }

              } else {
                paramLogCron.IDG005DE = objEnvioRastreio[i].IDG005DE;
                paramLogCron.DSEMAID = '';
                paramLogCron.DSENVPAR = '';
                paramLogCron.SNENVIAD = 2;
                paramLogCron.TPSISENV = 'R';
                paramLogCron.TXOBSERV = `Email não encontrado Cliente ${objEnvioRastreio[i].IDG005DE}`;
                await dao.gravaLogEnvioCron(paramLogCron);
              }
            } else {

              console.log("email debug");
              retEmail = await email.sendEmailDebugg(objEnvioRastreio[i].arrayNotas, objEnvioRastreio[i].IDG005DE);
          
              paramLogCron.IDG005DE = objEnvioRastreio[i].IDG005DE;
              paramLogCron.DSEMAID = '';
              paramLogCron.DSENVPAR = '';
              paramLogCron.SNENVIAD = 5;
              paramLogCron.TPSISENV = 'R';
              paramLogCron.TXOBSERV = `Email não foi enviado ao cliente ${objEnvioRastreio[i].IDG005DE} por erro de dominio`;
              paramLogCron.G043LIST = listNotas.join();
              await dao.gravaLogEnvioCron(paramLogCron);
            }
          }
        }
      }
    }

    console.log("FIM DO CRON ENVIO RASTREIO");
    res.status(200).send({ armensag: `Processo envio rastreio finalizado` });

  }

  api.retroativoXML = async function (req, res, next) {
    console.log("Cron Monitoria retroativo XML");
    let con = null;
    this.controller = app.config.ControllerBD;

    try {

      var deliveries = await dao.deliveryRetroativo();

      let objDeliv = {};
      let objXML = {
        params: {
          id: 0
        },
        cronXml: true
      };

      if (deliveries != undefined && deliveries != null && deliveries.length > 0) {

        for (let index = 0; index < deliveries.length; index++) {
          con = await this.controller.getConnection();

          objDeliv.id = deliveries[index].IDG043;

          objDeliv.ext = ((deliveries[index].NMDOCUME).substring((deliveries[index].NMDOCUME).lastIndexOf(".") + 1)).toLowerCase();

          objDeliv.buffer = await Buffer.from(deliveries[index].CTDOCUME, 'base64');

          var strImgPath = `${dirIMG}${objDeliv.id}.${objDeliv.ext}`;
          var strPDFPath = `${dirPDF}${objDeliv.id}.pdf`;
          let resultPod;

          fs.writeFileSync(strImgPath, objDeliv.buffer);

          var doc = new pdfKit;

          doc.pipe(fs.createWriteStream(strPDFPath));
          doc.image(strImgPath, 0, 300, { width: 600 });
          doc.end();

          objXML.params.id = objDeliv.id;

          resultPod = await pod.newPOD(objXML, res, next);

          

            if(resultPod.blOK){
              await con.execute({
                sql: `        
                    Update G043 
                      Set 
                          G043.FLAGTEMP = 2
                    Where G043.IDG043 = ${deliveries[index].IDG043} `,
                param: []
                })
                .then((result1) => {
                  return result1;
                })
                .catch((err) => {
                  err.stack = new Error().stack + `\r\n` + err.stack;
                  throw err;
                });
            }
          

          await con.close();
        }
        
      }

      res.status(200).send({ armensag: `Processo xml retroativo finalizado` });

    } catch (err) {

      if (con != null) {
        await con.closeRollback();
      }
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

  //api.setaMotivoEntregaAtrasada();
  //api.rastreioQM();
  //api.envioRastereioCteMonitoriaV2();


  return api;


}