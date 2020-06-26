module.exports = function (app, cb) {

  var api = {};
  var db = require(process.cwd() + '/config/database');
  var utils = app.src.utils.FuncoesObjDB;
  var log = app.config.logger;
  var tmz = app.src.utils.DataAtual;
  api.controller = app.config.ControllerBD;

  const gdao = app.src.modGlobal.dao.GenericDAO;


  /**
   * @description Lista registros da tabela I007 e I017.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarReasonCode = async function (req, res, next) {
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'I007', true);

    return await db.execute(
      {
        sql: `SELECT 
                    I007.IDI007   AS I007_IDI007, 
                    I007.IDREACOD AS I007_IDREACOD, 
                    I007.DSCONTEU AS I007_DSCONTEU, 
                    I007.STCADAST AS I007_STCADAST, 
                    I007.DTCADAST AS I007_DTCADAST, 
                    G014.DSOPERAC AS G014_DSOPERAC,
                    LISTAGG(I015.DSOCORRE, '; ') WITHIN GROUP (ORDER BY I015.DSOCORRE) I015_DSOCORRE,
                    COUNT(I007.IDI007) OVER () AS COUNT_LINHA
                    FROM I017 
                    INNER JOIN I007 ON I007.IDI007 = I017.IDI007
                    INNER JOIN G014 ON G014.IDG014 = I017.IDG014
                    INNER JOIN I003 ON I003.IDI003 = I007.IDI003
                    INNER JOIN I004 ON I004.IDI004 = I007.IDI004
                    INNER JOIN I005 ON I005.IDI005 = I007.IDI005
                    INNER JOIN I006 ON I006.IDI006 = I007.IDI006
                    INNER JOIN I015 ON I015.IDI015 = I017.IDI015
                    ${sqlWhere}
                    AND I017.SNDELETE = 0
                    GROUP BY
                        I007.IDI007,
                        I007.IDREACOD,
                        I007.DSCONTEU,
                        I007.STCADAST,
                        I007.DTCADAST,
                        G014.DSOPERAC` +
                sqlOrder +
                sqlPaginate,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        return err;
      });
  };


  api.listarOld = async function (req, res, next) {

    return await db.execute(
      {
        sql: `Select
                IDI007,
                IDREACOD,
                DSCONTEU,
                COUNT(I007.IDI007) OVER () as COUNT_LINHA
                From   I007
                Where  I007.SnDelete = 0
                AND I007.DSCONTEU IS NOT NULL`,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        return err;
      });
  };


  /**
   * @description Insere registros na tabela I007.
   *
   * @async
   * @function api/inserir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarReasonCode = async function (req, res, next) {
    let result = await req.objConn.insert(
        {
            tabela: 'I007',
            colunas: {
                IDREACOD: req.body.IDREACOD,
                DSCONTEU: req.body.DSCONTEU.toUpperCase(),
                DTCADAST: new Date(),
                STCADAST: req.body.STCADAST,
                IDS001: req.body.IDS001,
                IDI003: req.body.IDI003,
                IDI004: req.body.IDI004,
                IDI005: req.body.IDI005,
                IDI006: req.body.IDI006,
                SNDELETE: 0
            },
            key: 'I007.IDI007'
        })
        .then((result) => {
            return (result);
        })
        .catch((err) => {
            throw err;
        });

    return result;
  };


  /**
   * @description Insere registros na tabela I017.
   *
   * @async
   * @function api/inserir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.salvarMotivosReasonCode = async function (req, res, next) {

    try {

      var arCampos  = ['IDG014', 'IDI007', 'IDI015', 'SNDELETE'];
      var arValores = [];

      var sql = `INSERT INTO I017 (${arCampos.join()}) \n`;

      sql += 'WITH input_values AS ( \n';

      for (var id of req.body[arCampos[2]]) {

          var strValor = `SELECT 
                            ${req.body[arCampos[0]]} ${arCampos[0]},
                            ${req.body[arCampos[1]]} ${arCampos[1]}, 
                            ${id.idi015} ${arCampos[2]}, 
                            0 ${arCampos[3]} FROM DUAL`;
          arValores.push(strValor);

      } 

      sql += arValores.join(' UNION ALL \n');

      sql += `) SELECT * FROM input_values`;

      req.sql = sql;

      let result = await gdao.executar(req, res, next)
        .then((result) => {
          return { response: req.__('it.sucesso.insert') };
        })
        .catch((err) => {
          throw err;
        });

      return result;

    } catch (err) {

        throw err;

    }

  };


  /**
   * @description Busca registros na tabela I007.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarReasonCode = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
        {
            sql: `SELECT
                    I007.IDREACOD,
                    I003.IDI003,
                    I004.IDI004,
                    I005.IDI005,
                    I006.IDI006,
                    I007.IDI007,
                    I007.DSCONTEU AS I007_DSCONTEU,
                    I003.IDEXTERN AS I003_IDEXTERN,
                    I004.IDEXTERN AS I004_IDEXTERN,
                    I005.IDEXTERN AS I005_IDEXTERN,
                    I006.IDEXTERN AS I006_IDEXTERN,
                    I007.STCADAST AS I007_STCADAST,
                    I007.IDS001   AS I007_IDS001

                    FROM
                        I007 I007 
                        LEFT JOIN	I003 I003
                            ON	I003.IDI003 = I007.IDI003
                        LEFT JOIN	I004 I004
                            ON	I004.IDI004 = I007.IDI004
                        LEFT JOIN	I005 I005
                            ON	I005.IDI005 = I007.IDI005
                        LEFT JOIN	I006 I006
                            ON	I006.IDI006 = I007.IDI006


                        WHERE 	I003.SNDELETE = 0		AND
                                I004.SNDELETE = 0		AND
                                I005.SNDELETE = 0		AND
                                I006.SNDELETE = 0		AND
                                I007.SNDELETE = 0		AND
                                I007.IDI007   =` + id,
            param: [],
        })
        .then((result) => {
            return (result);
        })
        .catch((err) => {
            return err;
        });
  };


  /**
   * @description Busca registros na tabela I017.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.buscarMotivosReasonCode = async function (req, res, next) {
    var id = req.params.id;

    return await db.execute(
        {
            sql: `SELECT
                        I015.IDI015 As id,
                        I015.IDI015 ||' - '|| I015.DSOCORRE As text
                   FROM I015 I015
                   JOIN I017 I017
                     ON I017.IDI015 = I015.IDI015
                  WHERE I017.SNDELETE = 0
                    AND I017.IDI007 = ` + id,
            param: [],
        })
        .then((result) => {
            return utils.array_change_key_case(result);
        })
        .catch((err) => {
            return err;
        });
  };


  /**
   * @description Atualiza registros na tabela I007.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarReasonCode = async function (req, res, next) {

    var id = req.body.IDI007;

    let result = await req.objConn.update({
      tabela: 'I007',
      colunas: {

        IDI003:   req.body.IDI003,
        IDI004:   req.body.IDI004,
        IDI005:   req.body.IDI005, 
        IDI006:   req.body.IDI006,
        IDS001:   req.body.IDS001,
        IDREACOD: req.body.IDREACOD,
        DSCONTEU: req.body.DSCONTEU,
        STCADAST: req.body.STCADAST,

      },
      condicoes: 'IDI007 = :id',
      parametros: {
        id: id
      }
    }).then((result) => {
      return result;

    }).catch((err) => {
      throw err;
    });

    return result;
  };


  /**
   * @description Atualiza registros na tabela I017.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.atualizarMotivosReasonCode = async function (req, res, next) {

    var idi007 = req.body.IDI007;
    var idi015 = req.motivosReasonCodeAtualizar;

    let result = await req.objConn.update({
      tabela: 'I017',
      colunas: {

        SNDELETE: 0,

      },
      condicoes: `IDI007 = :idi007 and IDI015 in (${idi015.join()})`,
      parametros: {
        idi007: idi007
      }
    }).then((result) => {
      return result;

    }).catch((err) => {
      throw err;
    });

    return result;
  };

  /**
   * @description lista registros da tabela I017 referentes ao IDI007.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.listarMotivosReasonCode = async function (req, res, next) {

    var id = req.body.IDI007;

    let result = await req.objConn.execute(
    {
      sql: ` Select I017.IDI015,
                    I017.IDI007,
                    I017.IDG014
               From I017 I017
              Where I017.IDI007 = : id
           Order By I017.IDI015`,
      param: {
        id: id
      }
    })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      throw err;
    });

    return result;
  };


  /**
   * @description Exclui registros na tabela I017.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluirMotivosReasonCode = async function (req, res, next) {

    var idi007 = req.body.IDI007;
    var idi015 = req.motivosReasonCodeExcluir;

    let result = await req.objConn.update({
      tabela: 'I017',
      colunas: {

        SNDELETE: 1,

      },
      condicoes: `IDI007 = :idi007 and IDI015 in (${idi015.join()})`,
      parametros: {
        idi007: idi007
      }
    }).then((result) => {
      return result;

    }).catch((err) => {
      throw err;
    });

    return result;
  };


  /**
   * @description Exclui registros na tabela I007 e em cascata I017.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */
  api.excluirReasonCode = async function (req, res, next) {

    let con = await this.controller.getConnection();

    try {

      var ids = req.params.id;  

      let result = await con.update({
        tabela: 'I007',
        colunas: {
          SNDELETE: 1
        },
        condicoes: ` IDI007 in (`+ids+`)`

      }).then((result) => {
        return result;
      }).catch((err) => {
        throw err;
      });

      if (result) {
        let resultGruMot = await con.update({
          tabela: 'I017',
          colunas: {
            SNDELETE: 1
          },
          condicoes: ` IDI007 in (`+ids+`)`

        }).then((result) => {
          return { response: req.__('it.sucesso.delete') };
        }).catch((err) => {
          throw err;
        });

        await con.close();
        return resultGruMot;

      } else {
        await con.closeRollback();
        res.status(400).send({armensag: req.__('it.erro.delete')});
      }

    } catch (err) {
      await con.closeRollback();
      throw err;
    }
  };


    api.listarOnde = async function (req, res, next) {

        var params = req.query;
        var arrOrder = [];

        if (params.order != null) {
            params.order.forEach(function (order) {
                arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
            })
            arrOrder = arrOrder.join();
        } else {
            arrOrder = ' I005.IdI005';
        }

        return await db.execute(
            {

                sql: `SELECT
                         I005.IDI005,   I005.IDEXTERN,
                         I005.DSSITUAC, I005.STCADAST,
                         to_char(I005.DTCADAST, 'dd/mm/yyyy'),
                         I005.IDS001,
                         I005.SNDELETE
                  From I005 I005
                  Join S001 S001 on (I005.IdS001 = S001.IdS001)
                  Where I005.SnDelete = 0
                  Order By `+ arrOrder,
                param: []
            })
            .then((result) => {
                return (utils.construirObjetoRetornoBD(result));
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarOnde = async function (req, res, next) {
        var id = req.params.id;

        return await db.execute(
            {
                sql: `
                    SELECT
                         I005.IDI005,   I005.IDEXTERN,
                         I005.DSSITUAC, I005.STCADAST,
                         to_char(I005.DTCADAST, 'dd/mm/yyyy'),
                         I005.IDS001,
                         I005.SNDELETE
                  From I005 I005
                  Join S001 S001 on (I005.IdS001 = S001.IdS001)
                  Where I005.SnDelete = 0 and
                   I005.IDI005 = ` + id,
                param: [],
            })
            .then((result) => {
                return (result[0]);
            })
            .catch((err) => {
                return err;
            });
    };

    api.salvarOnde = async function (req, res, next) {
        return await db.insert({
            tabela: 'I005',
            colunas: {
                IDEXTERN: req.body.IDEXTERN,
                DSSITUAC: req.body.DSSITUAC,
                STCADAST: req.body.STCADAST,
                DTCADAST: new Date(),
                IDS001: 1,
                SNDELETE: 0
            },
            key: 'IDI005'
        })
            .then((result) => {
                return (result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.atualizarOnde = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'I005',
                colunas: {
                    IDEXTERN: req.body.IDEXTERN,
                    DSSITUAC: req.body.DSSITUAC,
                    STCADAST: req.body.STCADAST
                },
                condicoes: 'IDI005 = :id',
                parametros: {
                    id: id
                }
            })
                .then((result) => {
                    return { response: "Atualizado com sucesso" };
                })
                .catch((err) => {
                    throw err;
                });
    };

    api.excluirOnde = async function (req, res, next) {
        var id = req.params.id;

        return await db.update({
            tabela: 'I005',
            colunas: {
                SnDelete: 1
            },
            condicoes: 'IDI005 = :id',
            parametros: {
                id: id
            }
        })
        .then((result) => {
            return { response: "Excluído com sucesso" };
        })
        .catch((err) => {
            throw err;
        });
    };

    api.listarPorque = async function (req, res, next) {

        var params = req.query;
        var arrOrder = [];

        if (params.order != null) {
            params.order.forEach(function (order) {
                arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
            })
            arrOrder = arrOrder.join();
        } else {
            arrOrder = ' I004.IdI004';
        }

        return await db.execute(
            {

                sql: `SELECT
                         I004.IDI004,   I004.IDEXTERN,
                         I004.DSMOTIVO, I004.STCADAST,
                         to_char(I004.DTCADAST, 'dd/mm/yyyy'),
                         I004.IDS001,
                         I004.SNDELETE
                  From I004 I004
                  Join S001 S001 on (I004.IdS001 = S001.IdS001)
                  Where I004.SnDelete = 0
                  Order By `+ arrOrder,
                param: []
            })
            .then((result) => {
                return (utils.construirObjetoRetornoBD(result));
            })
            .catch((err) => {
                throw err;
            });
    };

    api.buscarPorque = async function (req, res, next) {
        var id = req.params.id;

        return await db.execute(
            {
                sql: `
                    SELECT
                         I004.IDI004,   I004.IDEXTERN,
                         I004.DSMOTIVO, I004.STCADAST,
                         to_char(I004.DTCADAST, 'dd/mm/yyyy'),
                         I004.IDS001,
                         I004.SNDELETE
                  From I004 I004
                  Join S001 S001 on (I004.IdS001 = S001.IdS001)
                  Where I004.SnDelete = 0 and
                   I004.IDI004 = ` + id,
                param: [],
            })
            .then((result) => {
                return (result[0]);
            })
            .catch((err) => {
                return err;
            });
    };

    api.salvarPorque = async function (req, res, next) {
        return await db.insert({
            tabela: 'I004',
            colunas: {
                IDEXTERN: req.body.IDEXTERN,
                DSMOTIVO: req.body.DSMOTIVO,
                STCADAST: req.body.STCADAST,
                DTCADAST: new Date(),
                IDS001: 1,
                SNDELETE: 0
            },
            key: 'IDI004'
        })
            .then((result) => {
                return (result);
            })
            .catch((err) => {
                throw err;
            });
    };

    api.atualizarPorque = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'I004',
                colunas: {
                    IDEXTERN: req.body.IDEXTERN,
                    DSMOTIVO: req.body.DSMOTIVO,
                    STCADAST: req.body.STCADAST
                },
                condicoes: 'IDI004 = :id',
                parametros: {
                    id: id
                }
            })
                .then((result) => {
                    return { response: "Atualizado com sucesso" };
                })
                .catch((err) => {
                    throw err;
                });
    };

    api.excluirPorque = async function (req, res, next) {
        var id = req.params.id;

        return await db.update({
            tabela: 'I004',
            colunas: {
                SnDelete: 1
            },
            condicoes: 'IDI004 = :id',
            parametros: {
                id: id
            }
        })
        .then((result) => {
            return { response: "Excluido com sucesso" };
        })
        .catch((err) => {
            throw err;
        });
    };
 
    api.listarQuem = async function (req, res, next) {

        var params = req.query;
        var arrOrder = [];

        if (params.order != null) {
            params.order.forEach(function (order) {
                arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
            })
            arrOrder = arrOrder.join();
        } else {
            arrOrder = ' I006.IdI006';
        }

        return await db.execute(
            {

                sql: `SELECT
                         I006.IDI006,   I006.IDEXTERN,
                         I006.DSRESPON, I006.STCADAST,
                         to_char(I006.DTCADAST, 'dd/mm/yyyy'),
                         I006.IDS001,
                         I006.SNDELETE
                  From I006 I006
                  Join S001 S001 on (I006.IdS001 = S001.IdS001)
                  Where I006.SnDelete = 0
                  Order By `+ arrOrder,
                param: []
            })
        .then((result) => {
            return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
            throw err;
        });
    };

    api.buscarQuem = async function (req, res, next) {
        var id = req.params.id;

        return await db.execute(
            {
                sql: `
                    SELECT
                         I006.IDI006,   I006.IDEXTERN,
                         I006.DSRESPON, I006.STCADAST,
                         to_char(I006.DTCADAST, 'dd/mm/yyyy'),
                         I006.IDS001,
                         I006.SNDELETE
                  From I006 I006
                  Join S001 S001 on (I006.IdS001 = S001.IdS001)
                  Where I006.SnDelete = 0 and
                   I006.IDI006 = ` + id,
                param: [],
            })
        .then((result) => {
            return (result[0]);
        })
        .catch((err) => {
            return err;
        });
    };

    api.salvarQuem = async function (req, res, next) {
        return await db.insert({
            tabela: 'I006',
            colunas: {
                IDEXTERN: req.body.IDEXTERN,
                DSRESPON: req.body.DSRESPON,
                STCADAST: req.body.STCADAST,
                DTCADAST: new Date(),
                IDS001: 1,
                SNDELETE: 0
            },
            key: 'IDI006'
        })
        .then((result) => {
            return (result);
        })
        .catch((err) => {
            throw err;
        });
    };

    api.atualizarQuem = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'I006',
                colunas: {
                    IDEXTERN: req.body.IDEXTERN,
                    DSRESPON: req.body.DSRESPON,
                    STCADAST: req.body.STCADAST
                },
                condicoes: 'IDI006 = :id',
                parametros: {
                    id: id
                }
            })
        .then((result) => {
            return { response: "Atualizado com sucesso" };
        })
        .catch((err) => {
            throw err;
        });
    };

    api.excluirQuem = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'I006',
                colunas: {
                    SnDelete: 1
                },
                condicoes: 'IDI006 = :id',
                parametros: {
                    id: id
                }
            })
        .then((result) => {
            return { response: "Excluido com sucesso" };
        })
        .catch((err) => {
            throw err;
        });

    };

    api.listarResultado = async function (req, res, next) {

        var params = req.query;
        var arrOrder = [];

        if (params.order != null) {
            params.order.forEach(function (order) {
                arrOrder.push(params.columns[order.column]['name'] + ' ' + order['dir']);
            })
            arrOrder = arrOrder.join();
        } else {
            arrOrder = ' I003.IdI003';
        }

        return await db.execute( 
            {

                sql: `SELECT
                         I003.IDI003,   I003.IDEXTERN,
                         I003.DSRESULT, I003.STCADAST,
                         to_char(I003.DTCADAST, 'dd/mm/yyyy'),
                         I003.IDS001,
                         I003.SNDELETE
                  From I003 I003
                  Join S001 S001 on (I003.IdS001 = S001.IdS001)
                  Where I003.SnDelete = 0
                  Order By `+ arrOrder,
                param: []
            })
        .then((result) => {
            return (utils.construirObjetoRetornoBD(result));
        })
        .catch((err) => {
            throw err;
        });
    };

    api.buscarResultado = async function (req, res, next) {
        var id = req.params.id;

        return await db.execute(
            {
                sql: `
                    SELECT
                         I003.IDI003,   I003.IDEXTERN,
                         I003.DSRESULT, I003.STCADAST,
                         to_char(I003.DTCADAST, 'dd/mm/yyyy'),
                         I003.IDS001,
                         I003.SNDELETE
                  From I003 I003
                  Join S001 S001 on (I003.IdS001 = S001.IdS001)
                  Where I003.SnDelete = 0 and
                   I003.IDI003 = ` + id ,
                param: [],
            })
        .then((result) => {
            return (result[0]);
        })
        .catch((err) => {
            return err;
        });
    };

    api.salvarResultado = async function (req, res, next) {
        return await db.insert({
            tabela: 'I003',
            colunas: {
                IDEXTERN: req.body.IDEXTERN,
                DSRESULT: req.body.DSRESULT,
                STCADAST: req.body.STCADAST,
                DTCADAST: new Date(),
                IDS001: 1,
                SNDELETE: 0
            },
            key: 'IDI003'
        })
        .then((result) => {
            return (result);
        })
        .catch((err) => {
            throw err;
        });
    };

    api.atualizarResultado = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'I003',
                colunas: {
                    IDEXTERN: req.body.IDEXTERN,
                    DSRESULT: req.body.DSRESULT,
                    STCADAST: req.body.STCADAST
                },
                condicoes: 'IDI003 = :id',
                parametros: {
                    id: id
                }
            })
        .then((result) => {
            return { response: "Atualizado com sucesso" };
        })
        .catch((err) => {
            throw err;
        });
    };

    api.excluirResultado = async function (req, res, next) {
        var id = req.params.id;

        return await
            db.update({
                tabela: 'I003',
                colunas: {
                    SnDelete: 1
                },
                condicoes: 'IDI003 = :id',
                parametros: {
                    id: id
                }
            })
        .then((result) => {
            return { response: "Excluido com sucesso" };
        })
        .catch((err) => {
            throw err;
        });

    };

  return api;
};
