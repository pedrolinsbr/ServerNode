module.exports = function (app, cb) {

  var api = {};
  var db = app.config.database;
  var utils = app.src.utils.FuncoesObjDB;

  api.listarContatoCliente = async function (req, res, next) {
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G007', true);
    
    return await db.execute(
      {
        sql: `SELECT
                      G007.IDG007 G007_IDG007, 
                      G007.IDG006 G007_IDG006, 
                      G007.IDG039 G007_IDG039,
                      NVL(G039.DSCARGO, 'n.i') G039_DSCARGO,
                      G007.NMCONTAT G007_NMCONTAT, 
                      NVL(G006.DSSETOR, 'n.i') G006_DSSETOR, 
                      G020.IDG005 G020_IDG005,
                      S001.NMUSUARI || ' [' || S001.IDS001 || ']' AS G007_NMUSUARI,
                      CASE
                        WHEN G007.IDG006 = 28 THEN 
                          'Sim'
                        ELSE
                          'Não'
                      END AS SNNPSCON
              FROM G007 
              LEFT JOIN S001 
                ON S001.IDS001 = G007.IDS001
              LEFT JOIN G020
                ON G020.IDG007 = G007.IDG007
              Left Join G006 G006 
                ON G006.IDG006 = G007.IDG006
              LEFT JOIN G039
                ON G039.IDG039 = G007.IDG039`+
              sqlWhere +
              sqlOrder +
              sqlPaginate,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarContatoCliente = async function (req, res, next) {
    var id = req.params.id;
    return await db.execute(
      {
        sql: `SELECT 
                     G007.IDG007,
                     G007.IDS001, 
                     G007.IDG006, 
                     G007.IDG039, 
                     G007.NMCONTAT,
                     G006.DSSETOR,
                     G039.DSCARGO
              FROM   G007
              INNER JOIN G006
              ON G006.IDG006 = G007.IDG006
              INNER JOIN G039
              ON G039.IDG039 = G007.IDG039
              WHERE  G007.IDG007 = :id 
                AND G007.SNDELETE = 0`,
        param: {id:id},
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.buscarClienteContato = async function (req, res, next) {
    var id = req.params.id;
    objRetorno = {};
    objRetorno.cliente =  await db.execute(
      {
        sql: `SELECT 
                     G007.IDG007,
                     G007.IDS001, 
                     G007.IDG006, 
                     G007.IDG039, 
                     G007.NMCONTAT,
                     G007.IDG014,
                     G014.DSOPERAC,
                     G006.DSSETOR,
                     G039.DSCARGO
              FROM   G007
              LEFT JOIN G006
              ON G006.IDG006 = G007.IDG006
              LEFT JOIN G039
              ON G039.IDG039 = G007.IDG039
              LEFT JOIN G014
              ON G014.IDG014 = G007.IDG014
              WHERE  G007.IDG007 = :id 
                AND G007.SNDELETE = 0`,
        param: {id:id},
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

      objRetorno.contato =  await db.execute(
        {
          sql: `SELECT  G008.IDG008, 
                        G008.IDG007, 
                        G008.TPCONTAT, 
                        G008.DSCONTAT 
                FROM G008 G008 
                WHERE G008.IDG007 = :id 
                AND G008.SNDELETE = 0 `,
          param: {id:id},
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          throw err;
        });

        return objRetorno;

  };

  api.salvarContatoCliente = async function (req, res, next) {

    let validacao = await this.validarEmails(req);

    if(validacao.status){
   
      let objDetalheContato = req.body.CONTATO;
      // por padrão se não for rtv deve gravar tipo cliente como C
      let tpContato = 'C';
      // se for tipo RTV, força gravar tipo indústria
      if(req.body.IDG006 == 27){
        tpContato = 'I';
      }

        var contato = await db.insert({
          tabela: 'G007',
          colunas: {
            IDG039: req.body.IDG039,
            IDS001: req.body.IDS001,
            NMCONTAT: req.body.NMCONTAT,
            IDG006: req.body.IDG006,
            IDG014: req.body.IDG014,
            DTCADAST: new Date(),
          },
          key: 'IDG007'
        })
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          throw err;
        });

        let relacionamento = await db.insert({
          tabela: 'G020',
          colunas: {
            IDG007: contato,
            IDG005: req.body.IDG005,
            TPCONTAT: tpContato
          },
          key: 'IDG020'
        })
        .then((result) => {
          return (result);
        })
        .catch((err) => {
          throw err;
        });


        let operationSuccess = true;
        for(let i = 0; i < objDetalheContato.length; i++){
          let detalheContato = await db.insert({
              tabela: 'G008',
              colunas: {
                IDG007: contato,
                DSCONTAT: objDetalheContato[i].G008_DSCONTAT,
                TPCONTAT: objDetalheContato[i].G008_TPCONTAT,
                DTCADAST: new Date(),
                SNDELETE: 0,
                IDS001: req.body.IDS001
              },
              key: 'IDG008'
            })
            .then((result) => {
              operationSuccess = operationSuccess && true;
            })
            .catch((err) => {
    
              throw err;
            });
        }

        if(!operationSuccess){
          return {success: false, idg007:contato, idg020:relacionamento, msg: "Erro ao criar detalhe do contato"}
        }else{
          return {success: true, idg007:contato, idg020:relacionamento, msg: "Contato criado com sucesso."}
        }
    }else{
      return {success: false, msg: `Não é permitido salvar e-mail com esse(s) domínio(s): ${validacao.email}`}
    }
  };

  api.atualizarContatoCliente = async function (req, res, next) {

    let validacao = await this.validarEmails(req);

    if(validacao.status){

      var id = req.params.id;
      let objDetalheContato = req.body.CONTATO;
      let operationSuccess = true;

      //remove tudo sobre o usuário em questão
      let resultDelete= await db.execute({ 
        sql: `        
        Delete From G008 G008 Where G008.IDG007 = `+ req.body.IDG007,  
        param: []
      })
      .then((result) => {
        operationSuccess = operationSuccess && true;
      })
      .catch((err) => {
        operationSuccess = operationSuccess && false
        throw err;
      });

      for(let i = 0; i < objDetalheContato.length; i++){
        // após remover tudo referente ao usuário, faz um novo insert dele
        let result = await db.insert({
          tabela: `G008`,
          colunas: {
            IDG007: req.body.IDG007,
            DSCONTAT: objDetalheContato[i].G008_DSCONTAT,
            TPCONTAT: objDetalheContato[i].G008_TPCONTAT,
            DTCADAST: new Date(),
            SNDELETE: 0,
            IDS001: req.body.IDS001
          },
          key: `G008.IDG008`
        })
        .then((result) => {
          operationSuccess = operationSuccess && true;
        })
        .catch((err) => {
          operationSuccess = operationSuccess && false;
          throw err;
        });    
      }

      // por padrão se não for rtv deve gravar tipo cliente como C
      let tpContato = 'C';
      // se for tipo RTV, força gravar tipo indústria
      if(req.body.IDG006 == 27){
        tpContato = 'I';
      }
      // quando alterar o setor, precisa alterar o tipo de contato no  vínculo
      await db.update({
        tabela: 'G020',
        colunas: {
          TPCONTAT: tpContato
        },
        condicoes: `IDG007 = :id AND IDG005 = ${req.body.IDG005}`,
        parametros: {
          id: id
        }
      })
      .then((result) => {
        operationSuccess = operationSuccess && true;
      })
      .catch((err) => {
        operationSuccess = operationSuccess && false
        throw err;
      });


      await db.update({
          tabela: 'G007',
          colunas: {
            IDG039: req.body.IDG039,
            IDS001: req.body.IDS001,
            NMCONTAT: req.body.NMCONTAT,
            IDG006: req.body.IDG006,
            IDG014: req.body.IDG014,
          },
          condicoes: 'IDG007 = :id',
          parametros: {
            id: id
          }
        })
        .then((result) => {
          operationSuccess = operationSuccess && true;
        })
        .catch((err) => {
          operationSuccess = operationSuccess && false;
          throw err;
        });

        if(!operationSuccess){
          return {success: false, msg: "Erro ao alterar contato"}
        }else{
          return {success: true, msg: "Contato alterado com sucesso."}
        }
    }else{
      return {success: false, msg: `Não é permitido salvar e-mail com esse(s) domínio(s): ${validacao.email}`}
    }

  };

  api.excluirContatoCliente = async function (req, res, next) {
    var id = req.params.id;

    let resultDelete = await db.update({
      tabela: 'G008',
      colunas: {
        SnDelete: 1
      },
      condicoes: 'IdG007 = :id',
      parametros: {
        id: id
      }
    })
    .then((result) => {
        return result;
    })
    .catch((err) => {
        throw err;
    });

    return await
      db.update({
        tabela: 'G007',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG007 = :id',
        parametros: {
          id: id
        }
      })
        .then((result) => {
          return { response: "Contato excluído com sucesso." };
        })
        .catch((err) => {
          throw err;
        });
  };

  api.inserirClienteContato = async function (req, res, next) {

    let validacao = await this.validarEmails(req);

    if(validacao.status){
   
      let objDetalheContato = req.body.CONTATO;
      let objDetalheVinculoCliente = req.body.VINCULO_CLIENTE ? req.body.VINCULO_CLIENTE : null;
      let operacaoRtv = req.body.IDG014 ? req.body.IDG014 : null;
      let operationSuccess = true;

        var contato = await db.insert({
          tabela: 'G007',
          colunas: {
            IDG039: req.body.IDG039,
            IDS001: req.body.IDS001,
            NMCONTAT: req.body.NMCONTAT,
            IDG006: req.body.IDG006,
            IDG014: operacaoRtv,
            DTCADAST: new Date(),
          },
          key: 'IDG007'
        })
        .then((result) => {
          operationSuccess = operationSuccess && true;
          return result;
        })
        .catch((err) => {
          throw err;
        });

        for(let itemCliente = 0; itemCliente < objDetalheVinculoCliente.length; itemCliente++){

          let relacionamentoCliente= await db.insert({
            tabela: 'G020',
            colunas: {
              IDG007: contato,
              IDG005: objDetalheVinculoCliente[itemCliente].id,
              TPCONTAT: req.body.IDG006 == 27 ? 'I' : 'C'
            },
            key: 'IDG020'
          })
          .then((result) => {
            operationSuccess = operationSuccess && true;
            return result;
          })
          .catch((err) => {
            throw err;
          });

        }

        for(let i = 0; i < objDetalheContato.length; i++){
          let detalheContato = await db.insert({
              tabela: 'G008',
              colunas: {
                IDG007: contato,
                DSCONTAT: objDetalheContato[i].G008_DSCONTAT,
                TPCONTAT: objDetalheContato[i].G008_TPCONTAT,
                DTCADAST: new Date(),
                SNDELETE: 0,
                IDS001: req.body.IDS001
              },
              key: 'IDG008'
            })
            .then((result) => {
              operationSuccess = operationSuccess && true;
            })
            .catch((err) => {  
              throw err;
            });
        }

        if(!operationSuccess){
          return {success: false, idg007:contato, msg: "Erro ao criar detalhe do contato"}
        }else{
          return {success: true, idg007:contato, msg: "Contato criado com sucesso."}
        }
      }else{
        return {success: false, msg: `Não é permitido salvar e-mail com esse(s) domínio(s): ${validacao.email}`}
      }
      
  };

  api.alterarClienteContato = async function (req, res, next) {

    let validacao = await this.validarEmails(req);

    if(validacao.status){

      let objDetalheContato = req.body.CONTATO;
      let objDetalheVinculoCliente = req.body.VINCULO_CLIENTE ? req.body.VINCULO_CLIENTE : null;
      let operacaoRtv = req.body.IDG014 ? req.body.IDG014 : null;
      let operationSuccess = true;

      //remove tudo sobre o usuário em questão
      let resultDelete= await db.execute({ 
        sql: `        
        Delete From G020 G020 Where G020.IDG007 = `+ req.body.IDG007,  
        param: []
      })
      .then((result) => {
        operationSuccess = operationSuccess && true;
      })
      .catch((err) => {
        operationSuccess = operationSuccess && false
        throw err;
      });


      if(operationSuccess){

        for(let itemCliente = 0; itemCliente < objDetalheVinculoCliente.length; itemCliente++){

          let relacionamentoCliente= await db.insert({
            tabela: 'G020',
            colunas: {
              IDG007: req.body.IDG007,
              IDG005: objDetalheVinculoCliente[itemCliente].id,
              TPCONTAT: req.body.IDG006 == 27 ? 'I' : 'C'
            },
            key: 'IDG020'
          })
          .then((result) => {
            operationSuccess = operationSuccess && true;
            return result;
          })
          .catch((err) => {
            throw err;
          });

        }

      }
      
      //remove os detalhe do contato
      let resultDeleteContato = await db.execute({ 
        sql: `        
        Delete From G008 G008 Where G008.IDG007 = `+ req.body.IDG007,  
        param: []
      })
      .then((result) => {
        operationSuccess = operationSuccess && true;
      })
      .catch((err) => {
        operationSuccess = operationSuccess && false
        throw err;
      });

      if(operationSuccess){
        for(let i = 0; i < objDetalheContato.length; i++){
          // após remover tudo referente ao usuário, faz um novo insert dele
          let result = await db.insert({
            tabela: `G008`,
            colunas: {
              IDG007: req.body.IDG007,
              DSCONTAT: objDetalheContato[i].G008_DSCONTAT,
              TPCONTAT: objDetalheContato[i].G008_TPCONTAT,
              DTCADAST: new Date(),
              SNDELETE: 0,
              IDS001: req.body.IDS001
            },
            key: `G008.IDG008`
          })
          .then((result) => {
            operationSuccess = operationSuccess && true;
          })
          .catch((err) => {
            operationSuccess = operationSuccess && false;

            throw err;
          });    
        }
      }

      await db.update({
          tabela: 'G007',
          colunas: {
            IDG039: req.body.IDG039,
            IDS001: req.body.IDS001,
            NMCONTAT: req.body.NMCONTAT,
            IDG006: req.body.IDG006,
            IDG014: operacaoRtv
          },
          condicoes: 'IDG007 = :id',
          parametros: {
            id: req.body.IDG007
          }
        })
        .then((result) => {
          operationSuccess = operationSuccess && true;
        })
        .catch((err) => {
          operationSuccess = operationSuccess && false;
          throw err;
        });

        if(!operationSuccess){
          return {success: false, msg: "Erro ao alterar contato"}
        }else{
          return {success: true, msg: "Contato alterado com sucesso."}
        }
    }else{
      return {success: false, msg: `Não é permitido salvar e-mail com esse(s) domínio(s): ${validacao.email}`}
    }

  };

  api.buscaInfoClienteContato = async function (req, res, next) {
    var id = req.params.id;
    objRetorno = {};
    objRetorno.cliente =  await db.execute(
      {
        sql: `SELECT 
                     G007.IDG007,
                     G007.IDS001, 
                     G007.IDG006, 
                     G007.IDG039, 
                     G007.IDG014,
                     G007.NMCONTAT,
                     G006.DSSETOR,
                     G014.DSOPERAC,
                     G039.DSCARGO
              FROM   G007
              INNER JOIN G006
              ON G006.IDG006 = G007.IDG006
              LEFT JOIN G039
              ON G039.IDG039 = G007.IDG039
              LEFT JOIN G014
              ON G014.IDG014 = G007.IDG014
              WHERE  G007.IDG007 = :id 
                AND G007.SNDELETE = 0`,
        param: {id:id},
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw err;
      });

      objRetorno.contato =  await db.execute(
        {
          sql: `SELECT  G008.IDG008, 
                        G008.IDG007, 
                        G008.TPCONTAT, 
                        G008.DSCONTAT 
                FROM G008 G008 
                WHERE G008.IDG007 = :id 
                AND G008.SNDELETE = 0 `,
          param: {id:id},
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          throw err;
        });

        // objRetorno.industrias =  await db.execute(
        //   {
        //     sql: `SELECT DISTINCT G005.CJCLIENT,
        //                   G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']' as Text, 
        //                   G005.IECLIENT, 
        //                   FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || '/' || G005.IECLIENT AS CJCLIAUX,
        //                   G005.NMCLIENT, 
        //                   G005.RSCLIENT, 
        //                   G005.TPPESSOA,
        //                   CASE
        //                     WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
        //                     ELSE 'Física' 
        //                   END as DSTPPESS, 
        //                   G005.IDG005 AS ID 
        //               FROM G005 G005
        //               INNER JOIN G020 G020 ON G020.IDG005 = G005.IDG005
        //                 AND G005.SNDELETE = 0
        //                 AND G020.TPCONTAT = 'I'
        //                 And G020.IDG007 = :id `,
        //     param: {id:id},
        //   })
        //   .then((result) => {
        //     return utils.array_change_key_case(result);
        //   })
        //   .catch((err) => {  
        //     throw err;
        //   });  

          objRetorno.clientes =  await db.execute(
            {
              sql: `SELECT DISTINCT G005.CJCLIENT,
                            G005.RSCLIENT || ' [' || FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || ' - ' || G005.IECLIENT ||']' as Text, 
                            G005.IECLIENT, 
                            FN_FORMAT_CNPJ_CPF(G005.CJCLIENT) || '/' || G005.IECLIENT AS CJCLIAUX,
                            G005.NMCLIENT, 
                            G005.RSCLIENT, 
                            G005.TPPESSOA,
                            CASE
                              WHEN G005.TPPESSOA = 'J' THEN 'Jurídica'
                              ELSE 'Física' 
                            END as DSTPPESS, 
                            G005.IDG005 AS ID 
                        FROM G005 G005
                        INNER JOIN G020 G020 ON G020.IDG005 = G005.IDG005
                          AND G005.SNDELETE = 0
                          --AND NVL(G020.TPCONTAT, 'C') = 'C'
                          And G020.IDG007 = :id `,
              param: {id:id},
            })
            .then((result) => {
              return utils.array_change_key_case(result);
            })
            .catch((err) => {    
              throw err;
            });    

        return objRetorno;

  };

  api.removerClienteContato = async function (req, res, next) {
    var id = req.params.id;
    let operationSuccess = true;
    //remove tudo sobre o usuário em questão
    let resultDelete= await db.execute({ 
      sql: `        
      Delete From G020 G020 Where G020.IDG007 = `+ id,  
      param: []
    })
    .then((result) => {
      operationSuccess = operationSuccess && true;
    })
    .catch((err) => {
      operationSuccess = operationSuccess && false
      throw err;
    });

    let desativaDetalhesContato =  await
      db.update({
        tabela: 'G008',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG007 = :id',
        parametros: {
          id: id
        }
      })
      .then((result) => {
        operationSuccess = operationSuccess && false;
      })
      .catch((err) => {
        throw err;
      });

    let desativaContato =  await
      db.update({
        tabela: 'G007',
        colunas: {
          SnDelete: 1
        },
        condicoes: 'IdG007 = :id',
        parametros: {
          id: id
        }
      })
      .then((result) => {
        operationSuccess = operationSuccess && false;
      })
      .catch((err) => {
        throw err;
      });

      if(!operationSuccess){
        return {success: false, msg: "Erro ao remover contato"}
      }else{
        return {success: true, msg: "Contato removido com sucesso."}
      }
  };

  api.emailsCliente = async function (params) {
    var id = params;
    return await db.execute(
      {
        sql: `SELECT DISTINCT
                  LISTAGG (G008.DSCONTAT, ', ') WITHIN GROUP (ORDER BY G008.DSCONTAT)
                  OVER (PARTITION BY G020.IDG005) AS DSCONTAT
              FROM   G008 G008
              INNER JOIN G007 G007
                ON (G008.IDG007 = G007.IDG007)
              INNER JOIN G020 G020
                ON (G020.IDG007 = G007.IDG007)
              WHERE  G020.IDG005 = :id 
                AND G007.SNDELETE = 0
                AND G008.SNDELETE = 0 `,
        param: {id:id},
      })
      .then((result) => {
        return (result);
      })
      .catch((err) => {
        throw err;
      });
  };

  api.validarEmails = async function (req) {
    let emails = req.body.CONTATO.filter(element => {return element.G008_TPCONTAT == 'E'});
    let resultStatus = true;
    let resultEmail  = null;

    if(emails.length > 0){

      let tpSetor      = req.body.IDG006;
      let idg014       = req.body.IDG014;
      let where        = '';

      /** Quando for alterar os emails da Syngenta colocar igual para todas as operações
      */
      if(tpSetor == 27 && idg014 != null){
        where =   ` AND IDG014 <> 5 AND DSDOMINI NOT IN (SELECT DSDOMINI FROM G014 G WHERE G.IDG014 = ${idg014}) `;
      }

      let emailsOpera = await db.execute(
        {
          sql: `SELECT DSDOMINI FROM G014 WHERE DSDOMINI IS NOT NULL ${where} `,
          param: {},
        })
      .then((result) => {
        let retorno = [];
        for (let index = 0; index < result.length; index++) {
          const element = result[index];
          retorno[index] = element.DSDOMINI;
          
        }
        return (retorno.toString());
      })
      .catch((err) => {
          throw err;
      });

      emailsOpera = emailsOpera.split(',');
      
      for (let i = 0; i < emails.length; i++) {
        const emailContato = emails[i].G008_DSCONTAT.substring(emails[i].G008_DSCONTAT.indexOf("@")+1,emails[i].G008_DSCONTAT.length);

        for (let j = 0; j < emailsOpera.length; j++) {
          const emailValidar = emailsOpera[j];

          if(emailValidar.toUpperCase() == emailContato.toUpperCase()){
            resultStatus = false;
            resultEmail  = emailContato;
          }

        }
        
      }
    }

    return {status: resultStatus, email: resultEmail};

    
  };

  return api;
};
