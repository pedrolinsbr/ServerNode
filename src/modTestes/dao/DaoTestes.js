//const db = require(process.cwd() + '/config/database')
//var db = require(process.cwd() + '/config/database');
//var promise = require('promise');

module.exports = function (app, cb) {
  
  var api = {};
  //var BD = require(process.cwd() + '/config/databaseV4.js');//app.config.databaseV4;
  //let con = null;
  api.controller = app.config.ControllerBD;//require(process.cwd() + '/config/ControllerBD.js');
  let daoTeste = app.src.modTestes.dao.DaoTestesC2;
  
  //console.log(cb());
/*   api.lista1 = function (req, res) {
    var resultado = "aaa";
    console.log(db);
    db.execute('select * from s001 where cdusuari = :id', {id: 10}, (result) => {
      //console.log(result);
      resultado = result;
      console.log("dentro",resultado);
      //res.send(result);
      //var name = result.length > 0 ? result[0][0] : 'no-name'
      //cb(result)
    });
    console.log("fora");
    res.send(resultado);
    //res.send("sass");
  }; */

  /* api.getConnection = async function () {
    if (con == null) {
      con = new BD();
    }
  } */

  api.lista = async function (req, res, next) {
    //let con = new BD();
    let con = await this.controller.getConnection();
    try {
      let teste = await con.execute(
        {
          sql: 'select * from s001 where ids001 = :id',
          param: [1]
        })
        .then((result) => {
          console.log('Resultado: ', result);
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      
      let insert1 = await con.insert({
        tabela: 's023',
        colunas: {
          dsacao: `EVOLOG`
        },
        key: 'ids023'
      })
        .then((result1) => {
          return (result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      console.log(insert1);
      //await daoTeste.setConnection(con);
      daoTeste.controller.setConnection(con);
      await daoTeste.insertTeste(insert1);
      /* let insert2 = await con.execute(
        {
          sql: "insert into s024 (IDS022, IDS023) values (10, "+insert1+")",
          param: []
        })
        .then((result) => {
          console.log('Resultado: ',result);
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
      }); */
      
      //console.log('Fim do try');
      await con.close();
    } catch(err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

      /* return await db.insert({
      tabela: 'G017',
      colunas: {
        dtregist: new Date(),
        txmensag: `X1`,
        txtrace: `X2`,
        txsql: `X3`,
        dsparame: `X4`,
        dsurl: `X5`,
        ids001: 1,
        dsmodulo: `EVOLOG`
      },
      key: 'idg017'
    })
      .then((result1) => {
        return (result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      }); */
    
    /* try {
      adddlert("Welcome guest!");
      console.log(x);
    } catch (e) {
      console.log(e);
    } */
    
    /* return await
      db.update({
        tabela: 'G017',
        colunas: {
          dsurl: `TESTE`
        },
        condicoes: 'dsmodulo = :dsmodulo1',
        parametros: {
          dsmodulo1: "EVOLOG"
        }
      })
        .then( (result1) => {
          //res.send(result1);
          
          //sucesso(result1);
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          //erro(err);
          throw err;
        }); */
  };

  //api.lista();


  api.nivel2 = async function (req, res, next) {
    let con = await this.controller.getConnection(req.con);
    try {
      let teste = await con.execute(
        {
          sql: 'select * from s001 where ids001 = :id',
          param: [1]
        })
        .then((result) => {
          console.log('Resultado: ', result);
          return (result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      
      let insert1 = await con.insert({
        tabela: 's023',
        colunas: {
          dsacao: `EVOLOG`
        },
        key: 'ids023'
      })
        .then((result1) => {
          return (result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      console.log(insert1);
      
      //daoTeste.controller.setConnection(con);
      //await daoTeste.insertTeste(insert1);

      con.close();

      return insert1;
    } catch(err) {
      con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }

    
  };

  api.aclTeste = async function () {
    try {
      var acl = app.src.modIntegrador.controllers.FiltrosController;
      let acl1 = await acl.montar({
        ids001: 25,
        dsmodulo: 'oferecimento',
        nmtabela: [{ G024: 'G024' }],
        dioperad: ' ',
        esoperad: 'And'
      });
      console.log(acl1);
    } catch(err) {
      //con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  return api;
};