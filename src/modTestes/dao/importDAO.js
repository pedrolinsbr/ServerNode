module.exports = function (app, cb) {

  var api = {};
  //var dao = app.src.modMonitoria.dao.CronDAO;
  //var daoDelivery = app.src.modMonitoria.dao.DeliveryNFDAO;
  //var email = app.src.modMonitoria.controllers.EmailController;
  var logger     = app.config.logger;
  var moment     = require('moment');
  var fs         = require('fs');
  const utilsCA  = app.src.utils.ConversorArquivos;
  const nxt      = app.src.modDocSyn.dao.NextIdDAO;
  api.controller = app.config.ControllerBD;
  
  const xls = require('xlsx');
  

  api.import = async function (req, res, next) {
    var controller = app.config.ControllerBD;
    let retorno = '';
    let sequencia = 14520;
    if (req != undefined) {
      sequencia = parseInt(req.params.sequencia);
    } 
    try {
      var file = process.cwd() + '\\src\\modTestes\\dao\\import.xlsb';

      let workbook = xls.readFile(`${file}`);             
      let worksheet  = workbook.Sheets[workbook.SheetNames[0]];
      let arJSON     = xls.utils.sheet_to_json(worksheet);
      var ttReg      = arJSON.length;
      let con = null;
      for (let x = sequencia; x < ttReg; x++) {
        con = await controller.getConnection();
        
        let cnpj_cpf      = '';
        let idcliente     = arJSON[x]['IDCLIENTE'].trim();
        let cliente       = arJSON[x]['CLIENTE'].trim().substr(0, 150);
        //let cnpj          = arJSON[x]['CNPJ'];
        let tppessoa      = arJSON[x]['TPPESSOA'].trim()[0];
        //let cpf           = arJSON[x]['CPF'];
        let ie            = arJSON[x]['IE'].trim();
        let im            = arJSON[x]['IM'].trim();
        //let cidade        = arJSON[x]['CIDADE'].trim();
        let bairro        = arJSON[x]['BAIRRO'].trim().substr(0, 150);
        let cep           = arJSON[x]['CEP'].replace(/-/g, "").trim();
        let complemento   = arJSON[x]['COMPLEMENTO'].trim().substr(0, 50);
        let endereco      = arJSON[x]['ENDERECO'].trim().substr(0, 140);
        //let fone1         = arJSON[x]['FONE1'].replace(/ /g, "").trim();
        //let fone2         = arJSON[x]['FONE2'].replace(/ /g, "").trim();
        //let fax           = arJSON[x]['FAX'].trim();
        let email         = (arJSON[x]['EMAIL'] != undefined ? arJSON[x]['EMAIL'] : ' ').toLowerCase().trim();
        let ibge          = arJSON[x]['IBGE'].toString().trim();
        //let endereco_temp = arJSON[x]['ENDERECO_TEMP'].trim();
        let lat           = (arJSON[x]['LAT']+"").trim().substr(0, 15);
        let lon           = (arJSON[x]['LON']+"").trim().substr(0, 15);
        let planta        = arJSON[x]['PLANTA'].trim();
        let point         = arJSON[x]['POINT'].trim();
        if (tppessoa == "J") {
          cnpj_cpf = arJSON[x]['CNPJ'].toString().trim();
        } else {
          cnpj_cpf = arJSON[x]['CPF'].toString().trim();
        }
        
        let arCli = await con.execute({
          sql: `
          Select G005.IDG005, G022.IDG022
          From G005 G005
          Join G022 G022 On G022.Idg005 = G005.Idg005
          Where
          G005.CJCLIENT                 = '`+ cnpj_cpf +`' AND 
          G005.IECLIENT||G005.IMCLIENT  = '`+(ie+im)+`' AND 
          G005.CPENDERE                 = '`+cep+`' AND 
          G005.SNDELETE                 = 0 AND 
          G022.SNDELETE                 = 0 AND
          G022.IDCLIOPE                 = '`+planta+`' AND
          G022.IDEMPOPE                 = '`+idcliente+`' AND
          G022.DSSHIPOI                 = '`+point+`'
          ORDER BY IDG005 DESC`,
          param: {}
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
        
        let idg005 = '';
        if (arCli.length > 0) {
          idg005 = arCli[0].IDG005;

          await con.update({
            tabela: `G005`,
            colunas: {
              'NRLATITU' : lat,
              'NRLONGIT' : lon,
              'SNENVRAS': 0,
              'SNESPECI': 'N',
              'STENVOTI': 0,
              'DSCOMEND' : complemento,
              'BIENDERE' : bairro,
              'CPENDERE': cep,
              'DSENDERE' : endereco
              
            },
            condicoes: `IDG005 = :id`,
            parametros: {
              id: idg005
            }
          });
          /* for (let x = 1; x < arCli.length; x++) {
            await con.update({
              tabela: `G005`,
              colunas: {
                'SNDELETE' : 1
              },
              condicoes: `IDG005 = :id`,
              parametros: {
                id: arCli[x].IDG005
              }
            });
          } */
        } else {
          // PEGAR O IDG003
          let bdidg003 = await con.execute({
            sql: `
            Select IDG003 From G003 Where CDMUNICI = `+ibge,
            param: {}
          })
          .then((result) => {
            return result[0].IDG003;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });

          idg005 = await con.insert({
            tabela: `G005`,
            colunas: {
              'NMCLIENT' : cliente,
              'RSCLIENT' : cliente,
              'TPPESSOA' : tppessoa,
              'CJCLIENT' : cnpj_cpf,
              'IECLIENT' : ie,
              'IMCLIENT' : im,
              'DSENDERE' : endereco,
              'NRENDERE' : ' ',
              'DSCOMEND' : complemento,
              'BIENDERE' : bairro,
              'CPENDERE' : cep,
              'IDG003'   : bdidg003,
              'NRLATITU' : lat,
              'NRLONGIT' : lon,
              'STCADAST' : 'A',
              'IDS001'   : 1,
              'SNDELETE' : 0,
              'STENVOTI' : 0,
              'DTCADAST' : moment().toDate(),
              //'IDG040  ' : 
              //'NRDEPART' : 
              //'NRSELLER' : 
              //'IDG028'   : 
              'DSEMAIL'  : email,
              //'SNSATISF' : 
              //'SNRASTRE' : 
              'SNENVRAS' : 0,
              //'SNTEMPO ' : 
              //'IDLOGOS ' : 
              'SNESPECI' : 'N'

            },
            key: 'IDG005'
          });

          await con.insert({
            tabela: `G022`,
            colunas: {
              'IDG005'   : idg005,
              'IDG014'   : 5,
              'IDCLIOPE' : planta,
              'IDEMPOPE' : idcliente,
              'DSSHIPOI' : point,
              'SNINDUST' : 0,
              'SNDELETE' : 0
            }
          });


        }

        /* let arG022 = await con.execute({
          sql: `
          Select IDG022
          From   G022 G022
          Where  IDG005 = `+idg005,
          param: {}
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        }); */

        /* if (arG022.length == 0) {
          await con.insert({
            tabela: `G022`,
            colunas: {
              'IDG005'   : idg005,
              'IDG014'   : 5,
              'IDCLIOPE' : planta,
              'IDEMPOPE' : idcliente,
              'DSSHIPOI' : point,
              'SNINDUST' : 0,
              'SNDELETE' : 0
            }
          });
        } else {
          // NÃO PRECISA FAZER NADA
        } */
        retorno = retorno + "Linha " + (x + 2) + " CNPJ " + cnpj_cpf + " IE " + ie + " IM " + im + " G005 " + idg005 + "\r\n<br>";
        console.log("Linha " + (x+2) + " CNPJ "+cnpj_cpf + " IE "+ie+" IM "+ im + " G005 " + idg005);
        await con.close();
      }
      res.status(200).send(retorno);
    } catch (err) {
      // Rollback
      console.log(err.message);
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }
  //api.import();

    /**
   * @description Rotina para criar o preço frete para cargas FTL
   *
   * @async
   * @function 
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.importarFrete = async function (req, res, next) {

    
    let obj    = await this.controller.getConnection();
    let sqlG085    = null;

    try {

      logger.info("Iniciando Logs...");

      sqlG085 = await obj.execute({
        sql:` SELECT DISTINCT G085.IDG085, g085.IDG014,
                    'INSERT INTO G085 
                      (DSPREFRE, DTINIVIG, DTFIMVIG, TPTABELA, CDEMPRES, NRSEQUEN, IDG014)
                    VALUES
                      ('''|| G085.DSPREFRE ||''', 
                      to_date('''|| TO_CHAR(G085.DTINIVIG,'DD/MM/YYYY') ||''', ''DD/MM/YYYY''),
                      to_date('''|| TO_CHAR(G085.DTFIMVIG,'DD/MM/YYYY') ||''', ''DD/MM/YYYY''),
                      ''V'',
                      '|| G085.CDEMPRES ||',
                      '|| G085.NRSEQUEN || ',
                      '|| G085.IDG014 || ')' as sql
              FROM G085 G085
              JOIN G088 G088
                ON G088.IDG085 = G085.IDG085
             WHERE IDG024 IN (SELECT IDG024
                                FROM G024
                               WHERE IDG024 IN (SELECT G088.IDG024
                                                  FROM G085 G085
                                                  JOIN G088 G088
                                                    ON G088.IDG085 = G085.IDG085
                                                 WHERE IDG014 = 5)
                                  AND IDG023 = 2 --UPPER(NMTRANSP) LIKE 'BRAVO%'
                              )
              AND TPTABELA = 'P'
              AND CURRENT_DATE <= DTFIMVIG
              AND IDG014 = 5`,
        param:[]
      }).then((res) => {
          return res; 
      }).catch((err) => {
          logger.error("Erro:", err);
          obj.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      });

      logger.info("Select G085"+sqlG085.length);
      /**Analisar cada linha da tabela G085 */
      for (let i = 0; i < sqlG085.length; i++) {

        let objConn    = await this.controller.getConnection();

        const elementG085 = sqlG085[i]; 
        const idg085Aux   = elementG085.IDG085;//IDG085 que iremos duplicar

        let insertG085 = await objConn.execute(
        {
          sql: elementG085.SQL,
          param: []
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          logger.error("Erro:", err);
          objConn.closeRollBack();
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        logger.info("Insert G085");

        let idG085 = await objConn.execute({
          sql:` select max(idg085) id from g085`,
          param:[]
        }).then((res) => {
            return res[0].ID; 
        }).catch((err) => {
            logger.error("Erro:", err);
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });//IDG085 que iremos cadastrar

        /**Busca todas as linhas do G088 que precisam ser cadastrados */
        let sqlG088 = await objConn.execute({
          sql:` SELECT  
          G088.IDG088,
          'INSERT INTO G088 
          (IDG085, IDG005, IDG024)
          VALUES
          (${idG085},'|| G088.IDG005 ||','|| 
          CASE WHEN  G088.IDG024 IS NULL OR G088.IDG024 NOT IN (SELECT IDG024
                              FROM G024 G024X
                             WHERE G024X.IDG024 IN (SELECT G088X.IDG024
                                                FROM G085 G085X
                                                JOIN G088 G088X
                                                  ON G088X.IDG085 = G085X.IDG085
                                               WHERE G085X.IDG014 = 5)
                               and g024X.idg023 = 2 ) THEN 'null' 
           ELSE TO_CHAR(G088.IDG024) END  ||')' as sql
          FROM G088 G088 WHERE G088.IDG085 = :IDG085AUX `,
          param:{IDG085AUX:idg085Aux}
        }).then((res) => {
            return res; 
        }).catch((err) => {
            logger.error("Erro:", err);
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });

        logger.info("Select G088");

        /**Analisar cada linha da tabela G088 */
        for (let j = 0; j < sqlG088.length; j++) {
          const elementG088 = sqlG088[j]; 
          const idg088Aux   = elementG088.IDG088;//IDG088 que iremos duplicar

          let insertG088 = await objConn.execute(
          {
            sql: elementG088.SQL,
            param: []
          })
          .then((result) => {
            return result;
          })
          .catch((err) => {
            logger.error("Erro:", err);
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        }//FIM FOR G088
        logger.info("Insert G088");

        /**Busca todas as linhas do G086 que precisam ser cadastrados */
        let sqlG086 = await objConn.execute({
          sql:` SELECT G086.IDG086, 
                       NVL(G086.CDTARIFA,0) AS CDTARIFA, 
                       G086.HOFINOTI, 
                       NVL(G086.IDG003DE,0) AS IDG003DE, 
                       NVL(G086.IDG003OR,0) AS IDG003OR, 
                       NVL(G086.NRPESO,0) AS NRPESO, 
                       NVL(G086.QTDIACOL,0) AS QTDIACOL,
                       NVL(G086.QTDIAENT,0) AS QTDIAENT, 
                       NVL(G086.QTDIENLO,0) AS QTDIENLO, 
                       NVL(G086.TPDIAS,0) AS TPDIAS, 
                       NVL(G086.TPTRANSP,0) AS TPTRANSP 
                FROM G086 G086 
               WHERE G086.IDG085 = :IDG085AUX`,
          param:{IDG085AUX:idg085Aux}
        }).then((res) => {
            return res; 
        }).catch((err) => {
            logger.error("Erro:", err);
            objConn.closeRollBack();
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });
        logger.info("Select G086");

        //Cadastro das G086
        for (let k = 0; k < sqlG086.length; k++) {

          const elementG086 = sqlG086[k]; 
          const idg086Aux   = elementG086.IDG086;//IDG086 que iremos duplicar

          logger.info("Insert G086");
          let insertG086 = await objConn.execute({
            sql:` INSERT INTO G086 X
                  (X.CDTARIFA, X.HOFINOTI, X.IDG003DE, X.IDG003OR, X.IDG030, X.IDG085, X.NRPESO, X.QTDIACOL, X.QTDIAENT, X.QTDIENLO, X.TPDIAS, X.TPTRANSP)
                  SELECT 
                  Y.CDTARIFA, Y.HOFINOTI, Y.IDG003DE, Y.IDG003OR, A.IDG030, ${idG085} AS IDG085, Y.NRPESO, Y.QTDIACOL, Y.QTDIAENT, Y.QTDIENLO, Y.TPDIAS, Y.TPTRANSP
                  FROM G030 A 
                  CROSS APPLY
                  (SELECT G086.IDG086,
                        G086.IDG085,
                        G086.NRPESO,
                        G086.TPTRANSP,
                        G086.CDTARIFA,
                        G086.HOFINOTI,
                        G086.IDG003DE,
                        G086.IDG003OR,
                        G086.QTDIACOL,
                        G086.QTDIAENT,
                        G086.QTDIENLO,
                        G086.TPDIAS 
                        FROM G086 G086 WHERE IDG086 = :IDG086AUX) Y
                  WHERE A.SNDELETE = 0 `,
            param:{IDG086AUX:idg086Aux}
          }).then((res) => {
              return res; 
          }).catch((err) => {
              logger.error("Erro:", err);
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
          });
        

      logger.info("Select G086 novos");
        /**Busca todas as linhas do G086 que foram cadastradas agora */
        let sqlG086New = await objConn.execute({
              sql:` SELECT G086.IDG086, G086.IDG030 
                      FROM G086 G086 
                     WHERE G086.IDG085          = :IDG085
                       AND NVL(G086.NRPESO,0)   = :NRPESO
                       AND NVL(G086.TPTRANSP,0) = :TPTRANSP
                       AND NVL(G086.CDTARIFA,0) = :CDTARIFA
                       AND NVL(G086.IDG003OR,0) = :IDG003OR
                       AND NVL(G086.IDG003DE,0) = :IDG003DE
                       AND NVL(G086.QTDIAENT,0) = :QTDIAENT
                       AND NVL(G086.QTDIACOL,0) = :QTDIACOL
                       AND NVL(G086.TPDIAS,0)   = :TPDIAS`,
              param:{IDG085:idG085,
                     NRPESO:elementG086.NRPESO,
                     TPTRANSP:elementG086.TPTRANSP,
                     CDTARIFA:elementG086.CDTARIFA,
                     IDG003OR:elementG086.IDG003OR,
                     IDG003DE:elementG086.IDG003DE,
                     QTDIAENT:elementG086.QTDIAENT,
                     QTDIACOL:elementG086.QTDIACOL,
                     TPDIAS:elementG086.TPDIAS
                    }
        }).then((res) => {
              return res; 
        }).catch((err) => {
              logger.error("Erro:", err);
              objConn.closeRollBack();
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
        });

        logger.info("QTD de  G087"+sqlG086New.length);
        for (let l = 0; l < sqlG086New.length; l++) {
            const elementG086New = sqlG086New[l];
            const idg086New      = elementG086New.IDG086;//IDG086 novo, que acabou ser cadastrado
            logger.info("Select G087");
            /**Busca e realiza o insert de todas as linhas do G087 conforme G086 auxiliar */
            let sqlG087 = await objConn.execute({
              sql:` INSERT INTO G087 X
                    (X.DSDETFRE, X.IDG086, X.IDG089, X.QTENTREG, X.TPAPLICA, X.VRMINCOB, X.VRTABELA)
                    SELECT Y.DSDETFRE, ${idg086New} AS IDG086, Y.IDG089, Y.QTENTREG, 
                          CASE WHEN Y.TPAPLICA = 'P' THEN 'F' ELSE Y.TPAPLICA END AS TPAPLICA, 
                            Y.VRMINCOB, CASE WHEN Y.TPAPLICA = 'P' THEN NVL2(G030.QTCAPPES,(G030.QTCAPPES * Y.VRTABELA),Y.VRTABELA)  ELSE Y.VRTABELA END AS VRTABELA
                    FROM G087 Y 
                    INNER JOIN G086 G086
                        ON G086.IDG086 = Y.IDG086
                    INNER JOIN G030 G030
                        ON G030.IDG030 = :IDG030AUX
                    WHERE Y.IDG086 = :IDG086AUX `,
              param:{IDG086AUX:idg086Aux, IDG030AUX: elementG086New.IDG030}
            }).then((res) => {
                return res; 
            }).catch((err) => {
                logger.error("Erro:", err);
                objConn.closeRollBack();
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
            
        }//FIM FOR G086 NOVO
    
        }//FIM FOR G086
          
        //}//FIM FOR G088

        await objConn.close();

      }//FIM FOR G085

      logger.info("Acabou importarFrete.......");
      await obj.close();
  
    
    } catch (err) {

      await obj.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;
    
    }
    
  };

  return api;
}