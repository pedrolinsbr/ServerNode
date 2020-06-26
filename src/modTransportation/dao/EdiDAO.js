module.exports = function(app, cb) {
    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    api.controller = app.config.ControllerBD;
    const path = require('path');

    /**
     * @description Buscar dados de configuracoes de EDI para clientes.
     *
     * @async
     * @function api/buscarConfigEdi
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.buscarConfigEdi = async function(idg094) {

        logger.info("Inicio buscar confi cliente: ", idg094);
        let con = await this.controller.getConnection(null);
        try {
            logger.info("Parametros buscar:");
            let result = await con.execute({
                    sql: `SELECT
                    G094.IDG094, G094.IDG014, G094.DSCLIENT, G094.DSCAMINH, G094.NMARQUIV, G094.NRDIAENT, G094.NRDIAEMI,
                    G094.DSPADENT, G094.TPARQUIV, G094.TPCONSNF, G094.TPCODIFI, G094.TPCONSDT, G094.TPTRANSP,
                    G094.TRRECEDI, G094.TPENVIO, G094.DSENVIO, G094.TPPERENV, G094.HREXECUT, G094.HRREPETE,
                    G094.HRLIMRPT, G094.NMDIAEXE, G094.SNATIVO, G094.SNFILCLI, G094.DSTOKEN 
                    FROM G094  where G094.IDG094 = '` + idg094 + `' `,
                    param: {}
                })
                .then((result) => {

                    if (result[0]['TPARQUIV'] == 0) {
                        result[0]['NMARQUIV'] += '.txt'
                    } else if (result[0]['TPARQUIV'] == 1) {
                        result[0]['NMARQUIV'] += '.xls'
                    } else {
                        result[0]['NMARQUIV'] += '.xml'
                    }
                    return result;

                })
                .catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });

            if (result[0]['SNATIVO'] == 1) { //verifica se o processo de Edi esta ativo 
                // Funcao para geracao do arquivo
                await api.gerarQueryEdi(result[0]);
                // Funcao de envio de e-email
                if (result[0]['TPENVIO'] == 0) {
                    await api.sendMailEdiFile(result[0]);
                } else if (result[0]['TPENVIO'] == 1) {
                    await api.sendFileFtp(result[0]);
                } else {
                    //Eviar via WSDL - Dupont 
                    await api.sendFileWS(result[0]);
                }
                api.backupEdiFile(result[0]);
                await con.close();
                logger.info("Edi processado com Sucesso, cliente: " + idg094);
                return true;
            } else {
                await con.close();
                logger.info("Processo de EDI tracking desabilitado para o cliente: " + result[0]['DSCLIENT']);
                return false;
            }

            //Fim do processo!! 
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };




    /**
     * @description Criar copia do arquivo enviado para pasta Backup
     * @async
     * @function api/backupEdiFile
     * @param {request} req - Possui as requisições para a função.
     * @param {Dicionario} parametros - Dicionario de parametrs, campos de configuracao de um EDI x Cliente (Tab G094)
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.backupEdiFile = function(parametros) {
        try {
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi; //Buscar/Criar estrutura de pastas 
            const fs = require('fs')
            const readableStream = fs.createReadStream(caminhoEdiCliente + '/' + parametros['NMARQUIV']);
            var datahoraatual = new Date();
            var datetime = ("00" + datahoraatual.getDate()).slice(-2) + ("00" + (datahoraatual.getMonth() + 1)).slice(-2) + datahoraatual.getFullYear() + ("00" + (datahoraatual.getHours())).slice(-2) + ("00" + (datahoraatual.getMinutes())).slice(-2) + datahoraatual.getSeconds();
            var novo_nome = parametros['NMARQUIV'].replace('.', datetime + '.');
            var writableStream = fs.createWriteStream(caminhoEdiCliente + "/Backup/" + novo_nome);
            readableStream.pipe(writableStream)
        } catch (err) {
            logger.error(err);
            throw new Error(err);
        }
    };

    /**
     * @description Buscar dados para gerar a query a ser utilizada para trazer os dados dos EDI.
     * @async
     * @function api/gerarQueryEdi
     * @param {request} req - Possui as requisições para a função.
     * @param {Dicionario} parametros - Dicionario de parametrs, campos de configuracao de um EDI x Cliente (Tab G094)
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.gerarQueryEdi = async function(parametros) {
        logger.info("gerarQueryEdi || Inicio gerar query para dados de edi, Id Cliente: " + parametros['IDG014'] + " (" + parametros['DSCLIENT'] + ")");
        let con = await this.controller.getConnection(null);
        try {
            var colunas_edi = ''
                //Apagar Arquivo já existrnte
            api.deleteFile(parametros);

            let result = await con.execute({
                    sql: `SELECT 
                case 
                when S010.RFCUSTOM is not null THEN 
                S010.RFCUSTOM||' as "'||G095.NMCOLUNA||'"'
                when G095.IDG095RE is not null THEN 
                    G095.DSALIATB||'.'||S010.NMATRIBU||' ||'' ''|| '||G095RE.DSALIATB||'.'||S010RE.NMATRIBU||' as "'||G095.NMCOLUNA||'"' 
                when G095.IDS010 is null then 
                    G095.DSALIATB||' as "'||G095.NMCOLUNA||'"' 
                else 
                COALESCE(G095.DSALIATB,S007.NMTABELA)||'.'||S010.NMATRIBU||' as "'||G095.NMCOLUNA||'" ' end alias_coluna 
                FROM G095
                LEFT JOIN S010 ON S010.IDS010 = G095.IDS010 
                Left Join S007 on S007.IDS007 = S010.IDS007 
                Left Join G094 on G094.IDG094 = G095.IDG094
                Left Join G095 G095RE on G095RE.IDG095 = G095.IDG095RE 
                LEFT JOIN S010 S010RE ON S010RE.IDS010 = G095RE.IDS010 
                Left Join S007 S007RE on S007RE.IDS007 = S010RE.IDS007 
                WHERE G094.IDG094 = ` + parametros['IDG094'] + `
                and G094.TPARQUIV =  ` + parametros['TPARQUIV'] + `
                and G095.NRORDEM is not null
                ORDER BY G095.NRORDEM ASC
                `,
                    param: {}
                })
                .then((result) => {
                    for (let i = 0; i < result.length; i++) {
                        colunas_edi = colunas_edi + result[i].ALIAS_COLUNA
                        if (i + 1 != result.length) {
                            colunas_edi = colunas_edi + ", "
                        }
                    }

                    return colunas_edi;
                })
                .catch((err) => {
                    err.stack = new Error().stack + '\r\n' + err.stack;
                    throw err;
                });
            retorno = await this.getDadosEdi(colunas_edi, parametros);
            await con.close();
            logger.debug("Fim buscar");
            return retorno;

        } catch (err) {
            //err.stack = new Error().stack + '\r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };

    /**
     * @description Formatar campo de tipo data, null, e decimal.
     *
     * @async
     * @function api/getDadosEdi
     * @param {String} query - Colunas a serem usadas para criação da query. 
     * @param {Dicionario} parametros - Dicionario de parametrs, campos de configuracao de um EDI x Cliente (Tab G094)
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.getDadosEdi = async function(query, parametros) {
        logger.info("getDadosEdi || Inicio gerar query para dados de edi, Id Cliente: " + parametros['IDG014'] + " (" + parametros['DSCLIENT'] + ")");
        let con = await this.controller.getConnection(null);
        try {
            // Campos de datas para realizar o filtro na busca de dados dos EDI
            let retorno = '';
            var NRDIAENT = new Date();
            var NRDIAEMI = new Date();
            var moment = require('moment-business-days');

            //NRDIAENT = moment(NRDIAENT.getDate(), 'DD-MM-YYYY').businessSubtract(parametros['NRDIAENT'])._d
            //NRDIAEMI = moment(NRDIAEMI.getDate(), 'DD-MM-YYYY').businessSubtract(parametros['NRDIAEMI'])._d
            NRDIAENT.setDate(NRDIAENT.getDate() - parametros['NRDIAENT']); // Numero de dias de entrada da nota, filtro
            NRDIAEMI.setDate(NRDIAEMI.getDate() - parametros['NRDIAEMI']); // Numero de dias de entrada da nota, filtro
            parametros['NRDIAENT'] = ("00" + NRDIAENT.getDate()).slice(-2) + '/' + ("00" + (NRDIAENT.getMonth() + 1)).slice(-2) + "/" + NRDIAENT.getFullYear();
            parametros['NRDIAEMI'] = ("00" + NRDIAEMI.getDate()).slice(-2) + '/' + ("00" + (NRDIAEMI.getMonth() + 1)).slice(-2) + "/" + NRDIAEMI.getFullYear();
            
            var filtroCliente = "";
            if (parametros['SNFILCLI'] == 1){
                filtroCliente = ` And G051.IDG005CO in (select G107.IDG005 
                                    from G107 
                                    Where G107.IDG094 = ${parametros['IDG094']} ) `;
            
                                }
            let order = " Order by 1, G083.NRNOTA asc ";
            var fwj = ` From  G051 G051   
                    Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
                    Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
                    Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
                    Left Join G060 on (G060.IDG060 = (select IDG060 from
                      ( select * from G060 where CAST (DTPOSICA AS timestamp ) <= CAST(LOCALTIMESTAMP-2/24 as timestamp) order by IDG060 desc ) A 
                    where A.IDG043 = G043.IDG043 AND  ROWNUM <= 1) )
                    Left Join G005 G005 on (G005.IDG005 = G051.IDG005CO) AND G005.SNDELETE = 0
                    Left Join G024 G024 on (G024.IDG024 = G051.IDG024) 
                    Left Join G046 G046 on (G046.IDG046 = G051.IDG046)  
                    Left Join G048 G048 on G048.IDG048 = (SELECT DISTINCT IDG048 FROM G048 where G048.IDG005OR = G051.IDG005EX  and G048.IDG005DE = G051.IDG005DE and IDG046 = G046.IDG046 AND ROWNUM <= 1)
                    Left Join G032 G032 on (G032.IDG032 = G046.IDG032V1)    
                    Left Join G030 G030 on (G030.IDG030 = G032.IDG030)                   
                    Left Join G031 G031 on (G031.IDG031 = G046.IDG031M1) 
                    Left Join G005 G005OR on (G005OR.IDG005 = G051.IDG005RE) AND G005OR.SNDELETE = 0
                    Left Join G003 G003OR on (G003OR.IDG003 = G005OR.IDG003)  
                    Left Join G002 G002OR on (G002OR.IDG002 = G003OR.IDG002) 
                    Left join G005 G005DE on (G005DE.IDG005 = G051.IDG005DE) AND G005DE.SNDELETE = 0
                    Left Join G003 G003DE on (G003DE.IDG003 = G005DE.IDG003) 
                    Left Join G002 G002DE on (G002DE.IDG002 = G003DE.IDG002)
                    
                Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = ` + parametros['IDG014'] + ` )             
                and (CASE G051.IDG005CO WHEN G051.IDG005DE THEN '1' WHEN G051.IDG005RE THEN '0' else '2' END) in (` + parametros['TRRECEDI'] + `) 
                and G051.DTEMICTR is not null
                and G043.DTENTCON  is not null
                and G083.NRNOTA  is not null
                and G051.STCTRC <> 'C'
                and (CASE G051.TPTRANSP WHEN 'V' THEN '0' WHEN 'T' THEN '1' WHEN 'D' THEN '2'  WHEN 'I' THEN '3'  WHEN 'O' THEN '4'  END) in (` + parametros['TPTRANSP'] + `)  
                
                and (( TO_DATE(G043.DTENTREG, 'DD/MM/YY')  >= TO_DATE('` + parametros["NRDIAENT"] + `', 'DD/MM/YY') ) 
                or ( TO_DATE(G051.DTEMICTR, 'DD/MM/YY') >= TO_DATE('` + parametros["NRDIAEMI"] + `', 'DD/MM/YY') )
                and   G043.DTENTREG is null )

                -- and ( ( TO_DATE(G043.DTENTREG, 'DD/MM/YY')  >= TO_DATE('` + parametros["NRDIAENT"] + `', 'DD/MM/YY') 
                -- and TO_DATE(G051.DTEMICTR, 'DD/MM/YY') >= TO_DATE('` + parametros["NRDIAEMI"] + `', 'DD/MM/YY') )
                -- or  G043.DTENTREG is null )
                
                -- Para usar dias uteis 
                -- and  ( TO_DATE(G051.DTEMICTR, 'DD/MM/YY') >= TO_DATE('` + parametros["NRDIAEMI"] + `', 'DD/MM/YY') ) 
                -- and ( TO_DATE(G043.DTENTREG, 'DD/MM/YY') >= TO_DATE('` + parametros["NRDIAENT"] + `', 'DD/MM/YY') or G043.DTENTREG is null) 
                
                 ` 

            query = "Select " + query + fwj + filtroCliente + order;
            logger.info("Query buscar:", query);
            let result = await con.execute({
                    sql: query.toString(),
                    param: {}
                })
                .then((result) => {
                    return (result);
                })
                .catch((err) => {
                    //          err.stack = new Error().stack + '\r\n' + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            //Criar nome do arquivo a ser enviado
            if (parametros['TPARQUIV'] == 0) {
                retorno = await this.gerarEdiTxt(result, parametros);
            } else if (parametros['TPARQUIV'] == 1) {
                retorno = await this.gerarEdiExcel(result, parametros);
            } else if (parametros['TPARQUIV'] == 2) {
                retorno = await this.gerarEdiXml(result, parametros);
            } else {
                retorno = await this.gerarEdiXmlx(result, parametros);
            }

            await con.close();
            logger.debug("Fim buscar");
            return result;

        } catch (err) {
            //err.stack = new Error().stack + '\r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };

    /**
     * @description Gerar arquivo rastreia txt 
     *
     * @async
     * @function api/formatarCampo
     * @param {json} result - Retorno do banco de dados.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.gerarEdiTxt = async function(result, parametros) {
        try {
            var fs = require('fs');
            var cabecalho = 'CONTROLE - BRAVO\n'
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi; //Buscar/Criar estrutura de pastas 
            //Buscar os campos para cabeçalho do arquivo.  
            for (j in result[0]) {
                cabecalho = cabecalho + j + ';';
            }

            var registros = '';
            var linha = cabecalho + '\n';
            for (i in result) {
                for (k in result[i]) {
                    var campo = this.formatarCampo(result[i][k]);
                    registros = registros + campo + ';';
                }
                registros = registros + '\n'
            }

            registros = this.removerAcentos(registros).toUpperCase();
            linha = linha + registros;
            //Criando arquivo txt
            var path = require('path');

            fs.writeFile(caminhoEdiCliente + '/' + parametros['NMARQUIV'], linha + '\n', { flag: 'a' }, function(erro) {
                if (erro) {
                    throw erro;
                }
            });
            logger.info("Arquivo gerado: ", parametros['NMARQUIV'])
        } catch (err) {
            err.stack = new Error().stack + '\r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };


    /**
     * @description Gerar arquivo rastreia em XLS
     *
     * @async
     * @function api/formatarCampo
     * @param {json} result - Retorno do banco de dados.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.gerarEdiExcel = async function(result, parametros) {
        try {
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi; //Buscar/Criar estrutura de pastas 
            var fs = require('fs');
            var cabecalho = ''

            //Buscar os campos para cabeçalho do arquivo.  
            for (j in result[0]) {
                cabecalho = cabecalho + j + '\t';
            }
            var registros = '';

            var linha = cabecalho + '\n';
            for (i in result) {
                for (k in result[i]) {
                    var campo = this.formatarCampo(result[i][k]);
                    //var campo = result[i][k];
                    registros = registros + campo + '\t';
                }
                registros = registros + '\n'
            }
            linha = linha + this.removerAcentos(registros).toUpperCase();
            //Criando arquivo txt
            fs.writeFile(caminhoEdiCliente + '/' + parametros['NMARQUIV'], linha + '\n', 'utf-8', function(erro) {
                if (erro) {
                    throw erro;
                }
            });
            logger.info("Arquivo gerado: ", parametros['NMARQUIV'])
        } catch (err) {
            err.stack = new Error().stack + '\r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };

    /**
     * @description Gerar arquivo rastreia e XML (Basf)
     *
     * @async
     * @function api/formatarCampo
     * @param {json} result - Retorno do banco de dados.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.gerarEdiXml = async function(result, parametros) {
        logger.info("Gerar arquivo XML")
        try {
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi; //Buscar/Criar estrutura de pastas 
            var datahoraatual = new Date();
            var datahoraatual = ("00" + datahoraatual.getDate()).slice(-2) + '/' + ("00" + (datahoraatual.getMonth() + 1)).slice(-2) + "/" + datahoraatual.getFullYear() + " " + ("00" + (datahoraatual.getHours())).slice(-2) + ":" + ("00" + (datahoraatual.getMinutes())).slice(-2);
            var fs = require('fs');
            var cabecalho = ''
            var builder = require('xmlbuilder');
            var xml = builder.create('transportadora', { 'dthratualizacao': '10', version: '1.0', encoding: 'iso-8859-1' }).att('dthratualizacao', datahoraatual)
                .ele('notasfiscais');
            var item = xml;
            var cnpj_ant = ''
            for (i in result) { //Roda a linha do JSON        
                if (cnpj_ant != result[i]['cnpj']) {
                    item = xml.ele('origem', { 'cnpj': result[i]['cnpj'] });
                }
                item2 = item.ele('notafiscal')

                for (k in result[i]) { //Roda o campo do JSON
                    var campo_valor = result[i][k];
                    campo_valor = this.removerAcentos(String(campo_valor)).toUpperCase();
                    if (k != 'cnpj') {
                        item2.att(k, this.formatarCampo(campo_valor));
                    }
                }
                if (parametros['IDG094'] != '17') {
                    item2.att('NotaEntregue', '1');
                }
                cnpj_ant = result[i]['cnpj'];
            }

            var xml_file = xml.end({ pretty: true });
            //Criando arquivo txt
            fs.writeFile(caminhoEdiCliente + '/' + parametros['NMARQUIV'], xml_file + '\n', { flag: 'a' }, function(err, ok) {
                if (err) throw err;
            });

            logger.info("Arquivo gerado: ", parametros['NMARQUIV'])
            return xml_file;
        } catch (err) {
            err.stack = new Error().stack + '\r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };


    /**
     * @description Gerar arquivo rastreia e XML modelo dupont
     *
     * @async
     * @function api/gerarEdiXmlx
     * @param {json} result - Retorno do banco de dados.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.gerarEdiXmlx = async function(result, parametros) {
        logger.info("Gerar arquivo XML Toniato")
        try {
            var caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi;
            var datahoraatual = new Date();
            datahoraatual.toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
            var datahoraatual = ("00" + datahoraatual.getDate()).slice(-2) + '/' + ("00" + (datahoraatual.getMonth() + 1)).slice(-2) + "/" + datahoraatual.getFullYear() + " " + ("00" + (datahoraatual.getHours())).slice(-2) + ":" + ("00" + (datahoraatual.getMinutes())).slice(-2);
            var fs = require('fs');
            var cabecalho = ''
            var builder = require('xmlbuilder');
            var xml = builder.create('notasfiscais', { version: '1.0', encoding: 'utf-8' });
            var item = xml;
            var dataentrega = '';
            var dataprevisaoentrega = '';
            for (i in result) { //Roda a linha do JSON

                item2 = item.ele('notafiscal')
                for (k in result[i]) { //Roda o campo do JSON          
                    var campo_valor = result[i][k];
                    campo_valor = this.removerAcentos(String(campo_valor)).toUpperCase();
                    if (k == 'dataentrega') {
                        dataentrega = result[i][k];
                        item2.att(k, this.formatarCampo(result[i][k]));
                    } else if (k == 'dataprevisaoentrega') {
                        dataprevisaoentrega = result[i][k];
                        item2.att(k, this.formatarCampo(result[i][k]));
                    } else if (k == 'dthratualizacao') {
                        item2.att(k, datahoraatual);
                    } else if (k == 'codigoocorrencia') {
                        if (result[i][k] == null) {
                            item2.att(k, '91');
                        }else {
                            item2.att(k, this.validaCodigoOcorrencia(result[i][k]));
                        }
                    } else {
                        item2.att(k, this.formatarCampo(campo_valor));
                    }
                }
            }

            var xml_file = xml.end({ pretty: true });
            //Criando arquivo txt
             fs.writeFile(caminhoEdiCliente + '/' + parametros['NMARQUIV'], xml_file + '\n', { flag: 'a' }, function(err, ok) {
                if (err) {
                    throw err;
                } else {
                    ok = 'OK';
                }
            }); 

            logger.info("Arquivo gerado: ", parametros['NMARQUIV'])
            return xml_file;
        } catch (err) {
            err.stack = new Error().stack + '\r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };

    /**
     * @description Enviar arquivo via e-mail  
     *
     * @async
     * @function api/sendMailEdiFile
     * @param {parametros} - Parametros do EDI.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.sendMailEdiFile = async function(parametros) {
        logger.info("Enviar arquivo: " + parametros['NMARQUIV']);
        try {
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi;
            const mail = require('nodemailer');
            var smtpEDI = await mail.createTransport({
                service: process.env.MAIL_DRIVER,
                host: process.env.MAIL_HOST,
                tls: {
                    rejectUnauthorized: false
                },
                auth: {
                    user: process.env.MAIL_FROM_ADDRESS,
                    pass: process.env.MAIL_PASSWORD
                }
            });

            let mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`, // sender address        
                to: parametros['DSENVIO'],
                //'pedro.neto@bravolog.com.br; pedro.lins.br@gmail.com;marllon.peres@bravolog.com.br', // list of receivers         
                cc: 'bravolog.ti@gmail.com, pedro.neto@bravolog.com.br, marllon.peres@bravolog.com.br',

                subject: 'Entregas ' + parametros['DSCLIENT'], // Subject line
                text: 'Esta e uma mensagem automatica. Por favor, nao responda este e-mail!', // plain text body

                html: '',
                attachments: [{
                    filename: parametros['NMARQUIV'],
                    path: caminhoEdiCliente + "/" + parametros['NMARQUIV']
                }]
            };
            let retorno_envio = 0;
            await smtpEDI.sendMail(mailOptions, function(error, info) {
                if (error) {
                    logger.info(error);
                    return 0
                } else {
                    logger.info('Email enviado: ' + info.response);
                    return 1
                }
            });
            // return parametros;
        } catch (err) {
            err.stack = new Error().stack + 'Email nao enviado: \r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };

    /**
     * @description Enviar arquivo via FTP
     *
     * @function api/sendFileFtp
     * @param {parametros} - Parametros do EDI.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.sendFileFtp = async function(parametros) {
        logger.info("Enviar arquivo via ftp: " + parametros['NMARQUIV']);
        try {
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi;

            const Client = require('ssh2-sftp-client');
            const fs = require('fs');
            var sftp = new Client();
            
            var strRemoteDir = parametros['DSENVIO'];
            var strLocalDir = caminhoEdiCliente + '/' + parametros['NMARQUIV'];
            var strUpDir = caminhoEdiCliente + '/' + parametros['DSCLIENT'] + '/';

            logger.info('Enviando arquivos para o SFTP');

            const objConn = {
                //host: '192.10.10.200', // ip para acesso interno 
                //port: '22', // porta para acesso interno	
                host: '200.170.131.74',    // ip para acesso externo
                port: '20789',               // porta para acesso externo
                username: 'root',
                password: 'bravo@15'
            }
            return await sftp.connect(objConn).then(async(result) => {
                var strRemoteFile = strRemoteDir + parametros['NMARQUIV'];
                logger.info(`Subindo ` + strLocalDir + ` Para  ` + strRemoteFile);

                    await sftp.put(strLocalDir, strRemoteFile).then(async() => {
                    
                }).catch((err) => {
                    logger.error(err, `Erro ao subir `);
                });

            }).catch((err) => {
                logger.error(err, 'Erro na conexão');
            });

        } catch (err) {
            logger.error("Erro:", err);
            throw err;
        }
    };


    /**
     * @description Enviar arquivo via WebService
     *
     * @function api/sendFileWS
     * @param {parametros} - Parametros do EDI.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */

    api.sendFileWS = async function(parametros) {
        logger.info('ENVIANDO VIA WSDL');
        var debug = true;
        var result = '';
        var error = '';
        var exception = '';
        var datahoraatual = new Date();
        var caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi;
        var dt_nm_arq_log = ("00" + datahoraatual.getDate()).slice(-2) + ("00" + (datahoraatual.getMonth() + 1)).slice(-2) + datahoraatual.getFullYear() + ("00" + (datahoraatual.getHours())).slice(-2) + ("00" + (datahoraatual.getMinutes())).slice(-2) + datahoraatual.getSeconds();
        datahoraatual = ("00" + datahoraatual.getDate()).slice(-2) + '/' + ("00" + (datahoraatual.getMonth() + 1)).slice(-2) + "/" + datahoraatual.getFullYear() + " " + ("00" + (datahoraatual.getHours())).slice(-2) + ":" + ("00" + (datahoraatual.getMinutes())).slice(-2);

        var soap = require('soap');
        const token = '6a9857c692bcf7dd1af7aa6b40a313cdf790fe2c'; //Token informado pelo cliente
        var xml = caminhoEdiCliente + '/' + parametros['NMARQUIV'];
        var fs = require('fs');
        let urlWs = parametros['DSENVIO']
        let tokenWs = parametros['DSTOKEN']
        //const wsdl = 'https://webcol.gerasinergia.com.br/dwdp/desenvolvimento/public/server.php?wsdl';
        const wsdl = urlWs;
        var arquivo_xml = fs.readFileSync(xml, 'utf8')

        var cmlkdas = '<?xml version="1.0" encoding="utf-8"?> <notasfiscais> <notafidasdasscal numerofidasdscal="9999" dataprevisaoentrega="3/7/2019" dataentrega="26/6/2019" localizacao="" latitude="" longitude="" codigoocorrencia="25" dthratualizacao="" cnpjremetente="13414093000495" cnpjtransportador="00950001000105"/> <notafiscal numerofiscal="3782" dataprevisaoentrega="3/7/2019" dataentrega="26/6/2019" localizacao="" latitude="" longitude="" codigoocorrencia="25" dthratualizacao="" cnpjremetente="13414093000495" cnpjtransportador="00950001000105"/> <notafiscal numerofiscal="4748" dataprevisaoentrega="18/6/2019" dataentrega="" localizacao="" latitude="" longitude="" codigoocorrencia="25" dthratualizacao="" cnpjremetente="61064929009710" cnpjtransportador="00950001000105"/> </notasfiscais>'
        var args = { xml: arquivo_xml, token: tokenWs };

        soap.createClient(wsdl, function(err, client) {
            if (err) {
                logger.error(err);

            }
            client.AdicionaStatus(args, function(err, result) {
                if (result.return.AdicionaStatusError['$value']) {
                    logger.error('Erro : Adiciona status');
                    exception = err;
                    var log = "------------------------------------------------------------------------------- \r\n" +
                        "Data: " + datahoraatual + "\r\n" +
                        "Debug: " + client + "\r\n" +
                        "Exception: " + err + "\r\n" +
                        "Error: " + result.return.AdicionaStatusError['$value'];
                    fs.writeFile(caminhoEdiCliente + '/logs/log_erro_' + dt_nm_arq_log + ".txt", log + '\n', { flag: 'w' }, function(err, ok) {
                        if (err) throw err;
                    });
                }
                console.log('result ',result )
                if (!result.return.AdicionaStatusResult) {
                    error = result.return.AdicionaStatusError;
                }

                var log = "------------------------------------------------------------------------------- \n" +
                    "Data: " + datahoraatual + "\n" +
                    "Request Headers: " + client.lastRequestHeaders + "\n" +
                    "Response Headers: " + client.lastResponseHeaders + "\n" +
                    "Request: " + client.lastRequest + "\n" +
                    "Response: " + client.lastResponse + "\n" +
                    "Debug: " + result + "\n" +
                    "Exception: " + exception + "\n" +
                    "Error: " + error;


                fs.writeFile(caminhoEdiCliente + '/logs/log_' + dt_nm_arq_log + ".txt", log + '\n', { flag: 'w' }, function(err, ok) {
                    if (err) throw err;
                });
            });
        });
    };

    /**
     * @description Criar pastas para os arquivos cliente 
     *
     * @function api/getCaminhoEdi
     * @param {parametros} - Parametros do EDI.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.getCaminhoEdi = function(EdiClient) {
        var pathEdi = null;
        var win32 = 0;
        var fs = require('fs');

        // Verifica se é Windows
        if (process.platform === "win32") {
            pathEdi = process.cwd() + '\\..\\';
            //Verifica/Cria pasta Edi
            dirname = pathEdi + "edi";
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            //Verifica/Cria pasta cliente
            dirname = dirname + "\\" + EdiClient;
            if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname);
            }
            //Criar pasta logs
            var dirname_log = dirname + "\\logs";
            if (!fs.existsSync(dirname_log)) {
                fs.mkdirSync(dirname_log);
            }
            //Criar pasta Backup
            var dirname_bkp = dirname + "\\Backup";
            if (!fs.existsSync(dirname_bkp)) {
                fs.mkdirSync(dirname_bkp);
            }
            pathEdi = pathEdi + 'edi\\' + EdiClient;
            win32 = 1;
        } else {
            // Caso se diferente ele vai para a pasta do Linux.
            pathEdi = "/dados/edi/rastreio/" + EdiClient;
            win32 = 0;
        }
        return { pathEdi: pathEdi, win32: win32 };
    }


    /**
     * @description Deletar arquivo enciado
     *
     * @function api/deleteFile
     * @param {parametros} - Parametros do EDI.
     * @return {boolean} status - Status da geracao do arquivo.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.deleteFile = async function(parametros) {
        try {
            //Remoção do arquivo 
            const fs = require('fs');
            const caminhoEdiCliente = api.getCaminhoEdi(parametros['DSCLIENT']).pathEdi; //Buscar/Criar estrutura de pastas 

            fs.unlink(caminhoEdiCliente + '/' + parametros['NMARQUIV'], (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        return 'Arquivo não existe!';
                    }
                    throw err;
                }
                logger.info('Arquivo deletetado ', parametros['NMARQUIV']);
            });
            return parametros;
        } catch (err) {
            err.stack = new Error().stack + 'Email nao deletado: \r\n' + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    }

    /**
     * @description Formatar campo de tipo data, null, e decimal.
     *
     * @async
     * @function api/formatarCampo
     * @param {String} campo - Possui o valor a ser formatado.
     * @return {String} Campo formatado.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.formatarCampo = function(campo) {
        try {
            const util = require('util');
            if ((!campo) || (campo == 'null') || (campo == 'NULL') || (campo == " ") ) {
                campo = '';
            } else if ((typeof campo == 'number') && (!Number.isInteger(campo))) {
                campo = campo.toFixed(2);
            }
            return campo;
        } catch (err) {
            return campo;
        }
    };

    /**
     * @description Formatar campo validaCodigoOcorrencia.
     *
     * @async
     * @function api/validaCodigoOcorrencia
     * @param {String} campo - Possui o valor a ser formatado.
     * @return {String} Campo formatado.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.validaCodigoOcorrencia = function(campo) {
        try {
            if ( campo.toString().length < 2 ) {
                campo = '0'+campo;
            } 
            return campo;
        } catch (err) {
            return campo;
        }
    };

    api.removerAcentos = function(newStringComAcento) {
        var string = newStringComAcento;
        var mapaAcentosHex = {
            a: /[\xE0-\xE6]/g,
            A: /[\xC0-\xC6]/g,
            e: /[\xE8-\xEB]/g,
            E: /[\xC8-\xCB]/g,
            i: /[\xEC-\xEF]/g,
            I: /[\xCC-\xCF]/g,
            o: /[\xF2-\xF6]/g,
            O: /[\xD2-\xD6]/g,
            u: /[\xF9-\xFC]/g,
            U: /[\xD9-\xDC]/g,
            c: /\xE7/g,
            C: /\xC7/g,
            n: /\xF1/g,
            N: /\xD1/g
        };

        for (var letra in mapaAcentosHex) {
            var expressaoRegular = mapaAcentosHex[letra];
            string = string.replace(expressaoRegular, letra);
        }

        return string;
    }


    api.getEdiTrackingCliente = async function(req, res, next) {

        logger.info("Inicio buscar getEdiTrackingCliente");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            var id = req.body.IDG094;
            logger.info("Parametros buscar (getEdiTrackingCliente):", id);
            let result = await con.execute({
                    sql: `SELECT
                  G094.IDG094, G094.IDG014, NVL(G094.DSCLIENT, ' ') DSCLIENT, G094.DSCAMINH, G094.NMARQUIV, G094.NRDIAENT, G094.NRDIAEMI,
                  G094.DSPADENT, cast(G094.TPARQUIV as char) TPARQUIV, 
                  cast(G094.TPCONSNF as char) TPCONSNF, 
                  cast(G094.TPCODIFI as char) TPCODIFI, 
                  cast(G094.TPCONSDT as char) TPCONSDT, 
                  G094.TPTRANSP,
                  G094.TRRECEDI,                   
                  cast(G094.TPENVIO as char) TPENVIO, 
                  G094.DSENVIO, G094.TPPERENV, G094.HREXECUT, G094.HRREPETE,
                  G094.HRLIMRPT, G094.NMDIAEXE, G094.SNATIVO, 
                  case cast(G094.SNATIVO as char) when '0' then 'Inativo' when '1' then 'Ativo' end as DSATIVO,
                  G094.SNFILCLI, G094.DSTOKEN 
                  FROM G094 
                  where G094.IDG094 = : id `,

                    param: { id: id }
                })
                .then((result) => {
                    //logger.info("Retorno:", result);
                    return (result[0]);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });

            console.log('result')
            console.log(result['SNFILCLI'])
            idOperacao = result['IDG014'];
            let clientesOperacao = '';
            if (result['SNFILCLI'] == 1 ){
                console.log("tem filtro por cliente ")
                clientesOperacao = await con.execute({
                    sql: `select G005.NMCLIENT||'['||G005.CJCLIENT||']' Text,  G005.IDG005 ID                    
                    from G107 
                    inner join G094 on G094.IDG094 = G107.IDG094
                    inner join G005 on G005.IDG005 = G107.IDG005 And G005.SNDELETE = 0 
                    Where G094.IDG014 = : idOperacao  `,

                    param: { idOperacao: idOperacao }
                })
                .then((result1) => {
                    //logger.info("Retorno:", result);
                    return utils.array_change_key_case(result1);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            }

            result['SNFILCLI'] = clientesOperacao;
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };


    api.getEdiList = async function(req, res, next) {

        logger.info("Inicio buscar getEdiList");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            logger.debug("Parametros recebidos (getEdiList):");
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G094', false);
            sqlOrder = " Order by G094.SNATIVO desc, G014.DSOPERAC asc   ";
            let result = await con.execute({
                    sql: `SELECT
                  G094.IDG094, G094.IDG014, NVL(G014.DSOPERAC, ' ') DSOPERAC, 
                  NVL(G094.DSCLIENT, ' ') DSCLIENT, 
                  G094.DSCAMINH, G094.NMARQUIV, G094.NRDIAENT, G094.NRDIAEMI, G094.DSPADENT, 
                  case cast(G094.TPARQUIV as char) when '0' then 'TXT' when '1' then 'XLS' when '2' then 'XML' when '3' then 'XML Toniato' end as TPARQUIV, 
                  G094.TPCONSNF, G094.TPCODIFI, G094.TPCONSDT, G094.TPTRANSP,
                  G094.TRRECEDI, case cast(G094.TPENVIO as char) when '0' then 'E-mail' when '1' then 'Ftp' when '2' then 'Wsdl' end as TPENVIO, 
                  G094.DSENVIO, G094.TPPERENV, G094.HREXECUT, G094.HRREPETE,
                  G094.HRLIMRPT, G094.NMDIAEXE, case cast(G094.SNATIVO as char) when '0' then 'Inativo' when '1' then 'Ativo' end as SNATIVO, 
                  G094.DSTOKEN,
                  COUNT(G094.IDG094) OVER() as COUNT_LINHA 
                  FROM G094 G094 
                  LEFT join G014 ON G014.IDG014 = G094.IDG014 ` +
                        sqlWhere +
                        sqlOrder +
                        sqlPaginate,
                    param: bindValues
                })
                .then((result) => {
                    //logger.info("Retorno:", result);
                    //result[0].COUNT_LINHA = resultCount.QTD;
                    return (utils.construirObjetoRetornoBD(result));
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };

    /**
     * @description Atualizar um dado na tabela G094, .
     *
     * @async
     * @function api/atualizarConfigEdi
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.atualizarConfigEdi = async function(req, res, next) {

        logger.debug("Inicio atualizar Config EDI");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros recebidos:", req.body);

            let operationSuccess = false;
            var id = req.body.IDG094;
            req.body.IDG014 = req.body.IDG014.id;
            req.body.TPTRANSP = String(req.body.TPTRANSP);
            req.body.TRRECEDI = String(req.body.TRRECEDI);
            req.body.NMDIAEXE = String(req.body.NMDIAEXE);

            //remove tudo sobre Edi em questão
            let resultDelete= await con.execute({ 
                sql: `        
                Delete From G107 Where G107.IDG094 = `+ req.body.IDG094,  
                param: []
            })
            .then((result) => {
                operationSuccess = operationSuccess && true;
            })
            .catch((err) => {
                operationSuccess = operationSuccess && false
                throw err;
            });

            let clientesOperacao = req.body.SNFILCLI;
            for(let i = 0; i < clientesOperacao.length; i++){
                // após remover tudo referente ao usuário, faz um novo insert dele
                let result = await con.insert({
                  tabela: 'G107',
                  colunas: {
                    IDG094: req.body.IDG094,
                    IDG005: clientesOperacao[i].id  
                    
                  },
                  param : []
                })
                .then((result) => {
                  operationSuccess = operationSuccess && true;
                })
                .catch((err) => {
                  operationSuccess = operationSuccess && false;
                  throw err;
                });    
              }
              

            //Valida campo se existe filtro por clientes da opracao 
            if(clientesOperacao.length > 0){
                filtroPorCliente = 1;
            }else{
                filtroPorCliente = 0 
            }            

            let result = await
            con.update({
                    tabela: 'G094',
                    colunas: {
                        IDG014: req.body.IDG014,
                        DSCLIENT: req.body.DSCLIENT.trim(),
                        DSENVIO: req.body.DSENVIO,
                        DSPADENT: req.body.DSPADENT,
                        HREXECUT: req.body.HREXECUT,
                        HRLIMRPT: req.body.HRLIMRPT,
                        HRREPETE: req.body.HRREPETE,
                        NMARQUIV: req.body.NMARQUIV.trim(),
                        NMDIAEXE: req.body.NMDIAEXE,
                        NRDIAEMI: req.body.NRDIAEMI,
                        NRDIAENT: req.body.NRDIAENT,
                        SNATIVO: req.body.SNATIVO,
                        TPARQUIV: req.body.TPARQUIV,
                        TPCODIFI: req.body.TPCODIFI,
                        TPCONSDT: req.body.TPCONSDT,
                        TPCONSNF: req.body.TPCONSNF,
                        TPENVIO: req.body.TPENVIO,
                        TPTRANSP: req.body.TPTRANSP,
                        TRRECEDI: req.body.TRRECEDI,
                        SNFILCLI: filtroPorCliente,
                        DSTOKEN : req.body.DSTOKEN, 

                    },
                    condicoes: 'IDG094 = :id',
                    parametros: {
                        id: id
                    }
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.update') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim atualizar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };

    /**
     * @description Atualizar um dado na tabela G094, .
     *
     * @async
     * @function api/desativarConfigEdi
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.desativarConfigEdi = async function(req, res, next) {

        logger.debug("Inicio DESABILITA Config EDI");
        let con = await this.controller.getConnection(null, req.UserId);
        try {

            var id = req.body.IDG094;
            let result = await con.execute({
                    sql: `Update G094 set SNATIVO ='0'
            Where IDG094 = ${id} `,
                    param: []
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim desativar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };

    /**
     * @description Atualizar um dado na tabela G095, .
     *
     * @async
     * @function api/removeFieldEdi
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.removeFieldEdi = async function(req, res, next) {

        logger.debug("Inicio removeFieldEdi Config EDI");
        let con = await this.controller.getConnection(null, req.UserId);
        try {

            var id = req.body.IDG095;
            var NRORDEM = req.body.NRORDEM;
            var IDG094 = req.body.IDG094;
            let result = await con.execute({
                    sql: `delete from G095 Where IDG095 = ${id} `,
                    param: []
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });
            //TODO - arrumar as ordens
            let result_order = await con.execute({
                    sql: `Update G095 set NRORDEM = NRORDEM - 1
            Where IDG094 = ${IDG094} and NRORDEM > ${NRORDEM} `,
                    param: []
                })
                .then((result_order) => {
                    logger.debug("Retorno:", result_order);
                    return { response: "Ordenação dos campos do EDI foi reajustada" };
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim desativar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };


    /**
     * @description Criar uma condiguracao na tabela G094, .
     *
     * @async
     * @function api/createConfigEdi 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.createConfigEdi = async function(req, res, next) {
        logger.info("Inicio salvar novo Edi - createConfigEdi");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            req.body.IDG014 = req.body.IDG014.id;
            req.body.TPTRANSP = String(req.body.TPTRANSP);
            req.body.TRRECEDI = String(req.body.TRRECEDI);
            req.body.NMDIAEXE = String(req.body.NMDIAEXE);
            let filtroPorCliente = 0
            if(req.body.SNFILCLI != null){
                filtroPorCliente = 1;
            }else{
                filtroPorCliente = 0 
            }
            logger.info("Parametros recebidos:", req.body);

            let result = await con.insert({
                    tabela: 'G094',
                    colunas: {
                        IDG014: req.body.IDG014,
                        DSCLIENT: req.body.DSCLIENT.trim(),
                        DSENVIO: req.body.DSENVIO,
                        DSPADENT: req.body.DSPADENT,
                        HREXECUT: req.body.HREXECUT,
                        HRLIMRPT: req.body.HRLIMRPT,
                        HRREPETE: req.body.HRREPETE,
                        NMARQUIV: req.body.NMARQUIV.trim(),
                        NMDIAEXE: req.body.NMDIAEXE,
                        NRDIAEMI: req.body.NRDIAEMI,
                        NRDIAENT: req.body.NRDIAENT,
                        SNATIVO: req.body.SNATIVO,
                        TPARQUIV: req.body.TPARQUIV,
                        TPCODIFI: req.body.TPCODIFI,
                        TPCONSDT: req.body.TPCONSDT,
                        TPCONSNF: req.body.TPCONSNF,
                        TPENVIO: req.body.TPENVIO,
                        TPTRANSP: req.body.TPTRANSP,
                        TRRECEDI: req.body.TRRECEDI,
                        SNFILCLI: filtroPorCliente, 
                        DSTOKEN : req.body.DSTOKEN 
                    },
                    key: 'IDG094'
                })
                .then((result1) => {
                    logger.info("Retorno:", result1);
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            let operationSuccess = false;
            var idg094 = result;
        
            let clientesOperacao = req.body.SNFILCLI;
            for(let i = 0; i < clientesOperacao.length; i++){
                // após remover tudo referente ao usuário, faz um novo insert dele
                let result = await con.insert({
                  tabela: 'G107',
                  colunas: {
                    IDG094: idg094,
                    IDG005: clientesOperacao[i].id  
                  },
                  param : []
                })
                .then((result) => {
                  operationSuccess = true;
                })
                .catch((err) => {
                  operationSuccess = false;
                  throw err;
                });    
              }
              console.log("operationSuccess ",operationSuccess)
            await con.close();
            logger.info("Fim salvar");
            return { response: "Configuração de EDI cadastrado com sucesso." };

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };



    /**
     * @description Criar uma condiguracao na tabela G094, .
     *
     * @async
     * @function api/createNewFieldEdi 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.createNewFieldEdi = async function(req, res, next) {
        logger.debug("Inicio salvar novo Edi createNewFieldEdi: " + req.body);
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            var id = req.body.IDG094;
            let alias_table = '';
            if(req.body.DSALIATB){
                alias_table = req.body.DSALIATB
            }else{
                alias_table = null;
            }
            
            logger.debug("Parametros recebidos:", req.body);

            let result = await con.insert({
                    tabela: 'G095',
                    colunas: {
                        IDG094: req.body.IDG094,
                        NRORDEM: req.body.NRORDEM,
                        DSALIATB: alias_table,
                        IDG095RE: req.body.IDG095RE,
                        IDS010: req.body.IDS010.id,
                        NMCOLUNA: req.body.NMCOLUNA,

                    },
                    key: 'IDG094'
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: "Campo para EDI cadastrado com sucesso." };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim salvar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };

    /**
     * @description Busca lista de campos que podem ser associados à um Edi(Rastreio).
     *
     * @async
     * @function api/buscaCamposEdiListAll 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.buscaCamposEdiListAll = async function(req, res, next) {
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G095', false);
        logger.info("Inicio buscar buscaCamposEdiListAll");
        let con = await this.controller.getConnection(null, req.UserId);
        sqlOrder = " Order BY G095.NRORDEM asc "
        try {
            logger.info("Parametros recebidos (buscaCamposEdiListAll): " + req.body.parameter);
            var id = 6;
            let result = await con.execute({
                    sql: `select 
                G095.IDG095, S007.NMTABELA, G095.IDG095RE, S010.NMATRIBU, S010.DSATRIBU , G095.NMCOLUNA, G095.NRORDEM, COUNT(G095.IDG095) OVER() as COUNT_LINHA 
                from G095 
                left join S010 ON S010.IDS010 = G095.IDS010 
                left join S007 ON S007.IDS007 = S010.IDS007 ` +
                        sqlWhere +
                        sqlOrder +
                        sqlPaginate,
                    param: bindValues
                })
                .then((result) => {
                    return (utils.construirObjetoRetornoBD(result));
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };

    /**
     * @description Busca lista de campos S010
     *
     * @async
     * @function api/listAllFieldsEdi 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.listAllFieldsEdi = async function(req, res, next) {
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S010', false);
        logger.info("Inicio buscar listAllFieldsEdi");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            logger.info("Parametros recebidos (listAllFieldsEdi): " + req.body);

            let result = await con.execute({
                    sql: `SELECT 
                  S010.IDS010 as id, 'Tab: '||S007.NMTABELA||' - '||S010.DSATRIBU as text 
                  FROM S010 
                  INNER JOIN S007 ON S007.IDS007 = S010.IDS007 `,

                    param: {}
                })
                .then((result) => {
                    logger.info(result);
                    return utils.array_change_key_case(result);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };


    /**
     * @description Busca lista clientes para a operacao 
     *
     * @async
     * @function api/buscaClienteOperacao 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.buscaClienteOperacao = async function(req, res, next) {
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S010', false);
        logger.info("Inicio buscar buscaClienteOperacao, ", req.body.parameterDep['IDG014']);
        let idOperacao = req.body.parameterDep['IDG014'];
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            logger.info("Parametros recebidos (buscaClienteOperacao): " + req.body);

            let result = await con.execute({
                    sql: `select G005.IDG005 ID, G005.NMCLIENT||'['||G005.CJCLIENT||']' Text                   
                    from G022  
                    inner join G005 on G005.IDG005 = G022.IDG005 And G005.SNDELETE = 0 
                    Where G022.SNINDUST=1 And G022.IDG014 = ${idOperacao}  `,
                    param: {}
                })
                .then((result) => {
                    logger.info(result);
                    return utils.array_change_key_case(result);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };


    /**
     * @description Processar EDI via Tela de configuracao
     *
     * @async
     * @function api/processarEdi 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.processarEdi = async function(req, res, next) {
        logger.info("Inicio  processarEdi" + req.body.IDG094);
        let result = false;
        try {
            result = this.buscarConfigEdi(req.body.IDG094);
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
            return result;
        }
    };



    /**
     * @description Busca lista de campos de um EDI especifico para concatenacao
     *
     * @async
     * @function api/listAllFieldsEdi 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.listFieldToConcat = async function(req, res, next) {
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S010', false);
        logger.info("Inicio buscar listAllFieldsEdi");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            logger.info("Parametros recebidos (listAllFieldsEdi): " + req.body);

            let result = await con.execute({
                    sql: `SELECT 
                  S010.IDS010 as id, S010.DSATRIBU as text,  
                  FROM S010 
                  INNER JOIN S007 ON S007.IDS007 = S010.IDS007 `,
                    param: {}
                })
                .then((result) => {
                    logger.info(result);
                    return utils.array_change_key_case(result);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };

    /**
     * @description Atualiza ordem de campos de um EDI
     *
     * @async
     * @function api/updateOrderField 
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.updateOrderField = async function(req, res, next) {
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S010', false);
        logger.info("Inicio buscar updateOrderField");
        let con = await this.controller.getConnection(null, req.UserId);

        try {
            logger.info("Parametros recebidos (updateOrderField): " + req.body);

            var id = req.body.IDG094;
            var ordem = req.body.NRORDEM;
            let result = await con.execute({
                    sql: `Update G095 set NRORDEM = NRORDEM + 1
            Where IDG094 = ${id} and NRORDEM >= ${ordem} `,
                    param: []
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    api.createNewFieldEdi(req, res, next);
                    return { response: "Campo para EDI cadastrado com sucesso." };
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim buscar");
            return result;
        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };


    /**Filtro clientes relacionados a EDI */
    api.listarConfigEdi = async function(req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        logger.info("[EDI] Inicio buscar listarConfigEdi");
        try {
            let sql = ` SELECT DISTINCT 
                    G094.IDG094 id, G094.DSCLIENT text 
                    FROM G094                      
                    where Upper(G094.DSCLIENT) Like Upper(:parameter) `
            return result = await con.execute({
                    sql,
                    param: {
                        parameter: req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                }).catch((err) => {
                    logger.error("Erro:", err);
                    throw err;
                });

        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };

    /**Filtro clientes relacionados a EDI */
    api.verificarErro = async function(req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        logger.info("[EDI] Inicio buscar verificarErro");
        try {
            let sql = ` select 

      coalesce( (select 
       COALESCE(G051.TPTRANSP,'1', '0')
      From  G051
      Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
      Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
      Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
      Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = (SELECT IDG014 From G094 where IDG094 = :param_client) ) 
      AND ( (SELECT G094.TPTRANSP From G094 where IDG094 = :param_client) like '%'||(CASE G051.TPTRANSP WHEN 'V' THEN '0' WHEN 'T' THEN '1' WHEN 'D' THEN '2'  WHEN 'I' THEN '3'  WHEN 'O' THEN '4'  END)||'%')
      and G083.NRNOTA = :param_nota) , 'Tipo de transporte setado na configuração diferente do tipo em CTE', 'OK')  as vTpTRanp, 
          
      coalesce( (select 
      (CASE G051.IDG005CO WHEN G051.IDG005DE THEN 'OK' WHEN G051.IDG005RE THEN 'OK' else 'OK' END) as data 
      From  G051
      Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
      Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
      Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
      Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = (SELECT IDG014 From G094 where IDG094 = :param_client) ) 
      AND ((SELECT G094.TRRECEDI From G094 where IDG094 = :param_client) like  (CASE G051.IDG005CO WHEN G051.IDG005DE THEN '%1%' WHEN G051.IDG005RE THEN '%0%' else '%2%' END) )
      and G043.NRNOTA = :param_nota), 'Tipo de tomador (Tipo de operação) configurado diferente do tipo em CTE', 'OK') as vTpIncluir, 
      
      (select 
      CASE 
      WHEN G043.DTENTREG >= TO_DATE((SYSDATE - (SELECT G094.NRDIAENT From G094 where IDG094 = :param_client)), 'DD/MM/YYY') THEN 'OK'
      ELSE 'Data de entrega da nota fora do prazo configurado para EDI' END VDATA
      From  G051
      Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
      Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
      Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
      Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = (SELECT IDG014 From G094 where IDG094 = :param_client) ) 
      and G043.NRNOTA = :param_nota) as vDtEntregaRange,
       
       (select 
      
      CASE 
      WHEN G051.DTEMICTR >= TO_DATE((SYSDATE - (SELECT G094.NRDIAEMI From G094 where IDG094 = :param_client)), 'DD/MM/YYY') THEN 'OK'
      ELSE 'Data de entrega da nota fora do prazo configurado para EDI' END VDATA
      
      From  G051
      Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
      Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
      Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
      Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = (SELECT IDG014 From G094 where IDG094 = :param_client) ) 
      and G043.NRNOTA = :param_nota) as vDtEmissaoInRange,
      
      (select 
      case when G051.DTEMICTR is null then 'Data de Emissão vazia' else 'OK' end as tememissao 
      From  G051
      Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
      Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
      Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
      Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = (SELECT IDG014 From G094 where IDG094 = :param_client) ) 
      and G043.NRNOTA = :param_nota ) as vTemDtEmissao, 
      
      (select 
      G051.STCTRC 
      From  G051
      Left Join G052 G052 on (G052.IDG051 = G051.IDG051)        
      Left Join G083 G083 on (G083.IDG083 = G052.IDG083) 
      Left Join G043 G043 on (G043.IDG043 = G083.IDG043) 
      Where G051.IDG005CO in (Select G022.IDG005 From G022 Where G022.SNINDUST = 1 and G022.IDG014 = (SELECT IDG014 From G094 where IDG094 = :param_client) ) 
      and G043.NRNOTA = :param_nota) as vStiuacao
      
      from dual  `
            return result = await con.execute({
                    sql,
                    param: {
                        param_client: req.body.NMCLIENT.id,
                        param_nota: req.body.NRNOTA
                    }
                })
                .then((result) => {
                    return result[0];
                }).catch((err) => {
                    logger.error("[EDI] Erro:", err);
                    throw err;
                });

        } catch (err) {
            logger.error("[EDI] Erro:", err);
            throw new Error(err);
        }
    };

    return api;
};