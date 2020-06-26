const oracledb = require('oracledb');
oracledb.autoCommit = true;
oracledb.maxRows = 17000;
//var promise = require('promise');

var objAutenticacao = {

  /* user: 'evologdev',
  password: 'evo17dev12cV1',
  connectString: 'db-bravolog.cyzgzizbhb3r.sa-east-1.rds.amazonaws.com/orcl', */

/*   user: 'bravo',
  password: 'bravo2020',
  connectString: 'bravo.c75akaoshomy.us-east-1.rds.amazonaws.com/bravo20', */


  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_HOST + '/' + process.env.DB_DATABASE, 


  //BANCO DUPLICADO
  // user: 'bravo_qa',
  // password: 'bravo2020',
  // connectString: 'bravoqa.c75akaoshomy.us-east-1.rds.amazonaws.com/orcl',


  // user: 'DEV',
  // password: 'bravo2020dev',
  // connectString: 'db-bravolog.c2s6dlsxpxz6.us-east-1.rds.amazonaws.com/ORCL', 


  // Default values shown below
  // externalAuth: false, // whether connections should be established using External Authentication
  // poolMax: 4, // maximum size of the pool. Increase UV_THREADPOOL_SIZE if you increase poolMax
  // poolMin: 0, // start with no connections; let the pool shrink completely
  // poolIncrement: 1, // only grow the pool by one connection at a time
  poolTimeout: 60, // terminate connections that are idle in the pool for 60 seconds
  // poolPingInterval: 60, // check aliveness of connection if in the pool for 60 seconds
  // queueRequests: true, // let Node.js queue new getConnection() requests if all pool connections are in use
  // queueTimeout: 60000, // terminate getConnection() calls in the queue longer than 60000 milliseconds
  // poolAlias: 'myalias' // could set an alias to allow access to the pool via a name
  // stmtCacheSize: 30 // number of statements that are cached in the statement cache of each connection
};

module.exports.execute = async (objParametros) => {
  return await //new promise(function (sucesso, erro) {
    oracledb.getConnection(objAutenticacao)
      .then((conn) => {
        return conn.execute(
          objParametros.sql,
          objParametros.param,
          {
            outFormat: oracledb.OBJECT,
            autoCommit: true
          }
        )
          .then((result) => {
            //console.log(result);
            /* if (objParametros.type == 'INSERT' && objParametros.autoincremento != undefined) {
              console.log( "SELECT " + objParametros.autoincremento + ".CURRVAL AS ID FROM DUAL");
              await conn.execute(
                "SELECT " + objParametros.autoincremento + ".CURRVAL AS ID FROM DUAL",
                {},
                { outFormat: oracledb.OBJECT }
              ).then((result1) => {
                conn.close();
                return result1.rows;
              })
            } else { */
            conn.close();
            switch (objParametros.type) {
              case 'INSERT':
                 var retorno = result.outBinds.idbv[0];
                 break;

              case 'UPDATE':
                 var retorno = result.rowsAffected;
                 break;

               default:
                 var retorno = result.rows;
                 break;
           }

           return retorno;
          })
          .catch((err) => {
            err.stack = new Error().stack;
            err.txsql = objParametros.sql;
            if (objParametros.param.isArray) {
              err.dsparame = objParametros.param.join();
            } else if (typeof objParametros.param === 'object') {
              err.dsparame = JSON.stringify(objParametros.param).substr(0, 1000);
            } else {
              err.dsparame = '';
            }
            conn.close();
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  //});
};

module.exports.retObjDb = () => { return oracledb; }

module.exports.insert = async (objParametros) => {

  let arColunas = [];
  let arColunasBind = [];
  let arValores = {};
  let strSql = "";

  for (key in objParametros.colunas) {
    //console.log(objParametros.colunas[key]);
    arColunas.push(key);
    arColunasBind.push(':' + key);
    arValores[key] = (objParametros.colunas[key]);
  }
  arValores.idbv = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };

  strSql = `Insert Into ` + objParametros.tabela + `(` + arColunas.join() + `) Values (` + arColunasBind.join() + `)
    RETURNING `+ objParametros.key + ` INTO :idbv`;
  //console.log(strSql);
  //console.log(arValores);

  return await this.execute({
    sql: strSql,
    param: arValores,
    type: 'INSERT',/*
      key: objParametros.key */
  });
};

module.exports.update = async (objParametros) => {

  let arColunas = [];
  let arColunasBind = [];
  let arValores = [];
  let strSql = "";
  for (key in objParametros.colunas) {
    arColunas.push(key);
    arColunasBind.push(key + ' = :' + key);
    arValores.push(objParametros.colunas[key]);
  }
  for (key in objParametros.parametros) {
    arValores.push(objParametros.parametros[key]);
  }

  strSql = `Update ` + objParametros.tabela + ` Set ` + arColunasBind.join() + ` Where ` + objParametros.condicoes;
  //console.log(strSql);
  //console.log(arValores);

  return await this.execute({
    sql: strSql,
    param: arValores
  });
};

module.exports.logErro = async (error) => {

  return await this.insert({
    tabela: 'G017',
    colunas: {
      dtregist: new Date(),
      txmensag: error.message,
      txtrace: error.stack,
      txsql: error.txsql,
      dsparame: error.dsparame,
      dsurl: error.dsurl,
      ids001: 1,
      dsmodulo: `EVOLOG`
    },
    key: 'idg017'
  })
    .then(function (r) {
      return { nrlogerr: r };
    }).catch((e) => {
      return { nrlogerr: -1, armensag: [e.message] };
    });
};
