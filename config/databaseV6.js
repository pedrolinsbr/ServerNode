const oracledb4 = require('oracledb');
oracledb4.maxRows = 17000;
oracledb4.autoCommit = false;
const log = require(process.cwd() + '/config/logger.js');

const objAutenticacao = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_HOST + '/' + process.env.DB_DATABASE,
  poolTimeout: 60
}

module.exports = class BD {
  constructor(connection) {
    this.connection = [];
    this.nivel = 0;
    if (connection != null && connection != undefined) {
      this.connection = connection;
    }
  }

  async addNivel() {
    this.nivel = this.nivel + 1;
    log.debug("addNivel: " + this.nivel);
  }

  async getConnection() {
    if (this.connection[0] == undefined || this.connection[0] == null) {
      this.connection[0] = await oracledb4.getConnection(objAutenticacao)
        .then(con => {
          log.debug("Conexão criada com sucesso!");
          return con;
        })
        .catch((err) => {
          log.debug("Erro ao criar conexão " + err.message);
          err.stack = new Error().stack;
          throw err;
        });
    }
    return this.connection;
  }

  async close() {
    if (this.nivel == 0 && (this.connection[0] != undefined || this.connection[0] != null)) {
      log.debug('Init Close connection !');
      await this.connection[0].commit();
      await this.connection[0].close();
      this.connection[0] = null;
      log.debug('Connection Closed !');
    } else if (this.nivel > 0) {
      log.debug('Abaixando o nível!');
      this.nivel = this.nivel - 1;
    }
  }

  async closeRollback() {
    if (this.connection[0] != undefined) {
      log.debug('Init Close Rollback!');
      await this.connection[0].rollback();
      await this.connection[0].close();
      this.connection[0] = undefined;
      this.connection[0] = undefined;
      log.debug('Fim Close Rollback!');
    }
  }

  async execute(objParametros) {
    await this.getConnection();
    objParametros.properties =
    {
      outFormat: oracledb4.OBJECT,
      autoCommit: false
    };

    if (objParametros.fetchInfo != null && objParametros.fetchInfo != undefined) {
      objParametros.properties.fetchInfo = {};
      /*if(typeof objParametros.fetchInfo  === 'object' && objParametros.fetchInfo.type === "BLOB"){
        objParametros.properties.fetchInfo[objParametros.fetchInfo.column] = {type: oracledb4.BUFFER };
      } else*/
      if (typeof objParametros.fetchInfo === 'array' || typeof objParametros.fetchInfo === 'object') {
        for (let item of objParametros.fetchInfo) {
          if (typeof item === 'object' && item.type === "BLOB") {
            objParametros.properties.fetchInfo[item.column] = { type: oracledb4.BUFFER };
          } else if (typeof item === 'object' && item.type === "SP") {
            objParametros.param = { cursor: { type: oracledb4.CURSOR, dir: oracledb4.BIND_OUT } };
            objParametros.sql = objParametros.sql.trim().replace(');', ',:cursor);').replace('(,', '(');
            objParametros.type = 'SP';
          } else {
            objParametros.properties.fetchInfo[item] = { type: oracledb4.STRING };
          }
        }
      } else {
        objParametros.properties.fetchInfo[objParametros.fetchInfo] = { type: oracledb4.STRING };
      }
    }
    log.debug('Ini Execute!');
    if (objParametros.debug) {
      let sql = objParametros.sql;
      for (let param in objParametros.param) {
        sql = sql.replace(new RegExp(':' + param, 'g'), "'" + objParametros.param[param] + "'");
      }
      // log.debug(sql);
    }

    return await
      this.connection[0].execute(
        objParametros.sql,
        objParametros.param,
        objParametros.properties
      )
        .then(async (result) => {
          log.debug('Fim Execute!');
          this.close();
          if (objParametros.type == 'INSERT_KEY') {
            return result.outBinds.idbv[0];
          } if (objParametros.type == 'INSERT') {
            return undefined;
          } if (objParametros.type == 'UPDATE') {
            return result.rowsAffected;
          } if (objParametros.type == 'SP') {

            let resultSet = result.outBinds.cursor;
            let rows = await resultSet.getRows(oracledb4.maxRows); // get numRows rows at a time
            return rows;

          } else {
            return result.rows;
          }
        })
        .catch((err) => {
          this.closeRollback();
          log.debug('Fim Execute Error!');
          err.stack = new Error().stack;
          err.txsql = objParametros.sql;
          if (objParametros.param.isArray) {
            err.dsparame = objParametros.param.join();
          } else if (typeof objParametros.param === 'object') {
            err.dsparame = JSON.stringify(objParametros.param).substr(0, 1000);
          } else {
            err.dsparame = '';
          }
          //this.closeRollback();
          throw err;
        });
  };

  async insert(objParametros) {
    let arColunas = [];
    let arColunasBind = [];
    let arValores = {};
    let strSql = "";

    for (let key in objParametros.colunas) {
      //log.debug(objParametros.colunas[key]);
      arColunas.push(key);
      arColunasBind.push(':' + key);
      arValores[key] = (objParametros.colunas[key]);
    }


    if (objParametros.key != undefined) {
      arValores.idbv = { type: oracledb4.NUMBER, dir: oracledb4.BIND_OUT };

      strSql = `Insert Into ` + objParametros.tabela + `(` + arColunas.join() + `) Values (` + arColunasBind.join() + `)
      RETURNING `+ objParametros.key + ` INTO :idbv`;
    } else {
      strSql = `Insert Into ` + objParametros.tabela + `(` + arColunas.join() + `) Values (` + arColunasBind.join() + `)`;
    }
    //log.debug(strSql, arValores);

    return await this.execute({
      sql: strSql,
      param: arValores,
      type: (objParametros.key != undefined ? 'INSERT_KEY' : 'INSERT'),
    });
  };

  async update(objParametros) {
    let arColunas = [];
    let arColunasBind = [];
    let arValores = [];
    let strSql = "";
    for (let key in objParametros.colunas) {
      arColunas.push(key);
      arColunasBind.push(key + ' = :' + key);
      arValores.push(objParametros.colunas[key]);
    }
    for (let key in objParametros.parametros) {
      arValores.push(objParametros.parametros[key]);
    }

    strSql = `Update ` + objParametros.tabela + ` Set ` + arColunasBind.join() + ` Where ` + objParametros.condicoes;
    //console.log(strSql, arValores);

    return await this.execute({
      sql: strSql,
      param: arValores,
      type: 'UPDATE'
    });
  };

};