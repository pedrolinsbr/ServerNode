module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modHoraCerta.dao.FornecedorDAO;

  api.listar = async function (req, res, next) {
    await dao.listar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.atualizar = async function (req, res, next) {
    await dao.atualizar(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.excluir = async function (req, res, next) {
    await dao.excluir(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvar = async function (req, res, next) { //salvar e adicionar no perfil

    try {

      var msgErro = null;
      var blOk = true

      req.objConn = await dao.controller.getConnection();

      var buscar = await dao.buscar(req, res, next);
      
      if (buscar.length > 0){

        //await api.addPerfil(req, res, next);

      } else{

        IDG005 = await dao.inserir(req, res, next);
        
        blOk = (IDG005 !== undefined);

        if(blOk){

          //await api.addPerfil(req, res, next);

        } else {

          msgErro = "Erro ao inserir o Fornecedor";
        }
      }

      if (blOk) {
        await req.objConn.close();
        res.status(200).json({message:"transportadora adicionada com sucesso"});
      
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({error: msgErro});
      }  
    } 
    catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({error:err.message});      
    }

  };

  

  return api;
};
