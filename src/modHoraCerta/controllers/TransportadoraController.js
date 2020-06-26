module.exports = function (app, cb) {

  var api   = {};
  var dao   = app.src.modHoraCerta.dao.TransportadoraDAO;

  api.salvar = async function (req, res, next) {
    console.log("Entrou");

    try {

      var msgErro = null;
      var blOk = true

      req.objConn = await dao.controller.getConnection();

      var buscarTransp = await dao.buscarTransp(req, res, next);
      
      if (buscarTransp.length > 0){

        await api.addPerfil(req, res, next);

      } else{

        IDG024 = await dao.inserir(req, res, next);
        
        blOk = (IDG024 !== undefined);

        if(blOk){

          await api.addPerfil(req, res, next);

        } else {

          msgErro = "Erro ao inserir a transportadora";
        }
      }

      if (blOk) {
        await req.objConn.close();
        res.status(400).json({message:"transportadora adicionada com sucesso"});
      
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

  api.addPerfil = async function (req, res, next) {
    /* await dao.controller.setConnection(req.objConn);
    var result = await dao.addPerfil(req, res, next).catch((err) => { throw err }); */
    return true;

  }

  return api;
};
