module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.MotivosDAO;

  /**
   * @description Lista todos os motivos na grid
   *
   * @async
   * @function listarMotivos
   * @param {Object} req Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires dao/MotivosDAO
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.listarMotivos = async function (req, res, next) {
    await dao.listarMotivos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  /**
   * @description Busca um motivo por Id
   *
   * @async
   * @function buscarMotivos
   * @param {Object} req Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires dao/MotivosDAO
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.buscarMotivos = async function (req, res, next) {
    await dao.buscarMotivos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  /**
   * @description Salva um motivo e adiciona grupo motivos ao mesmo
   *
   * @async
   * @function salvarMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires dao/MotivosDAO
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.salvarMotivos = async function (req, res, next) {

    try {

      req.objConn = await dao.controller.getConnection();

      let IDI015 = await dao.salvarMotivos(req, res, next);

      if (IDI015) {

        req.body.IDI015 = IDI015;
        let result = await dao.salvarGrupoMotivos(req, res, next)
          .then((result) => {
            return result;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });

        await req.objConn.close();
        res.json(result);

      } else {

        await req.objConn.closeRollback();
        return res.status(400).send({armensag: req.__('it.erro.insert')});

      }

    } catch (err) {

      await req.objConn.closeRollback();
      throw err;

    }

  };

  /**
   * @description Atualiza um motivo e o relacionamento com os grupos motivos
   *
   * @async
   * @function atualizarMotivos
   * @param {Object} req Possui as requisições para a função.
   * @param {Object} req.body
   * @param {Number} req.body.IDI015
   * @param {Array}  req.body.IDI018
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires dao/MotivosDAO
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.atualizarMotivos = async function (req, res, next) {

    try {

      req.objConn = await dao.controller.getConnection();

      let IDI015 = await dao.atualizarMotivos(req, res, next);

      if (IDI015) {

        let listaGrupoMotivos = await dao.listarGrupoMotivos(req, res, next);

        let grupoMotivos = req.body.IDI018;
        let novaListaGrupoMotivos = [];
        grupoMotivos.forEach(grupoMotivo => {
          novaListaGrupoMotivos.push({IDI018: grupoMotivo.id, IDI015: req.body.IDI015});
        });

        if (listaGrupoMotivos.length > 0 && novaListaGrupoMotivos.length > 0) {

          let listaGpMotAtualizar = [];
          let listaGpMotExcluir = [];
          let listaGpMotInserir = [];

          listaGrupoMotivos.forEach(i => {

            const grupoMotivoAtualizar = novaListaGrupoMotivos.filter(j => j.IDI018 == i.IDI018 && j.IDI015 == i.IDI015);
            if (grupoMotivoAtualizar.length > 0) {
              listaGpMotAtualizar.push(i);
            } else {
              listaGpMotExcluir.push(i);
            }

          });

          novaListaGrupoMotivos.forEach(i => {

            const grupoMotivoInserir = listaGrupoMotivos.filter(j => j.IDI018 == i.IDI018 && j.IDI015 == i.IDI015);
            if (grupoMotivoInserir.length == 0) {
              listaGpMotInserir.push(i);
            }

          });

          try {

            if (listaGpMotAtualizar.length > 0) {

              let grupoMotivosAtualizar = [];
              listaGpMotAtualizar.forEach(i => {
                grupoMotivosAtualizar.push(i.IDI018);
              });
              req.grupoMotivosAtualizar = grupoMotivosAtualizar;

              await dao.atualizarGrupoMotivos(req, res, next);

            }

            if (listaGpMotExcluir.length > 0) {

              let grupoMotivosExcluir = [];
              listaGpMotExcluir.forEach(i => {
                grupoMotivosExcluir.push(i.IDI018);
              });
              req.grupoMotivosExcluir = grupoMotivosExcluir;

              await dao.excluirGrupoMotivos(req, res, next);

            }

            if (listaGpMotInserir.length > 0) {

              let IDI018 = [];
              listaGpMotInserir.forEach(i => {
                IDI018.push({ idi018: i.IDI018 });
              });
              req.body.IDI018 = IDI018;

              await dao.salvarGrupoMotivos(req, res, next);

            }

          } catch (err) {

            await req.objConn.closeRollback();
            throw err;

          }

          await req.objConn.close();
          return res.status(200).send({ response: req.__('it.sucesso.update') });

        } else {

          await req.objConn.closeRollback();
          res.status(400).send({armensag: req.__('it.erro.update')});

        }

      } else {

        await req.objConn.closeRollback();
        res.status(400).send({armensag: req.__('it.erro.update')});

      }

    } catch (err) {

      await req.objConn.closeRollback();
      throw err;

    }
  };

  /**
   * @description Exclui motivos e seus relacionamentos em cascata
   *
   * @async
   * @function excluirMotivos
   * @param {Object} req Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires dao/MotivosDAO
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.excluirMotivos = async function (req, res, next) {
    await dao.excluirMotivos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
   * @description Busca grupo motivos referente a um motivo
   *
   * @async
   * @function buscarGrupoMotivos
   * @param {Object} req Possui as requisições para a função.
   * 
   * @return {Object} Retorna um objeto JSON.
   * @throws {Object} Caso falso, o número do log de erro aparecerá no console.
   * 
   * @requires dao/MotivosDAO
   * 
   * @author Walan Cristian Ferreira Almeida
   * @since 16/04/2019
  */
  api.buscarGrupoMotivos = async function (req, res, next) {
    await dao.buscarGrupoMotivos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
};
