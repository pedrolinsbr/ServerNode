module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.LancamentoCampanhaDAO;



  api.uploadDocumento = async function (req, res, next) {

    var allow = 0;
    var extentionFile;
    var sizeFile;

    for (let arq of req.files) {
      extentionFile = ((arq.originalname).substring((arq.originalname).lastIndexOf("."))).toLowerCase();
      sizeFile = arq.size;

      if((extentionFile == ".jpeg" || extentionFile == ".jpg" || extentionFile == ".png" ) && arq.size <= 404800){
        allow = 1;
      }else{
        allow = 0;
        break;
      }
      
    }
    if(allow == 1){
      await dao.saveUploadDoc(req, res, next)
        .then( async (result) => {
          // await nxt.insereEventoDelivery({
          //   IDG043: req.body.PKS007,
          //   IDI001: 30,
          //   DTEVENTO: tmz.tempoAtual('YYYY-MM-DD HH:mm:ss')
          // })
        });
    } else {
      if (extentionFile != ".jpeg" && extentionFile != ".jpg" && extentionFile != ".png") {
        res.status(400).send('Extensões invalidas');
      } else if (sizeFile > 404800) {
        res.status(400).send('O tamanho do(s) arquivo(s) é muito grande');
      } else {
        res.status(400).send('Erro na importação do(s) arquivo(s)');
      }
      
    }
        
  }
  


  api.removerLancamento = async function (req, res, next) {
    await dao.removerLancamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };



  api.buscaObservacao = async function (req, res, next) {
    await dao.buscaObservacao(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.atualizaObservacao = async function (req, res, next) {
    await dao.atualizaObservacao(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  
  api.excluirAnexoLancamento = async function (req, res, next) {
    await dao.excluirAnexoLancamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.listarAnexoLancamento = async function (req, res, next) {
    await dao.listarAnexoLancamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.listaLancamento = async function (req, res, next) {
    await dao.listaLancamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  
  api.lancamentoKmMotorista = async function (req, res, next) {
    await dao.lancamentoKmMotorista(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.lancamentoMdMotorista = async function (req, res, next) {
    await dao.lancamentoMdMotorista(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.lancamentoMotorista = async function (req, res, next) {
    await dao.lancamentoMotorista(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  
  
  api.listarMotoristas = async function (req, res, next) {
    await dao.listarMotoristas(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.listarMotoristasRelatorio = async function (req, res, next) {
    await dao.listarMotoristasRelatorio(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };


  api.buscarApontamentoExistentes = async function (req, res, next) {
    await dao.buscarApontamentoExistentes(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };  


  api.buscarApontamentoExistentesUser = async function (req, res, next) {
    await dao.buscarApontamentoExistentesUser(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };  


  api.buscarApontamentoExistentesUserAcl = async function (req, res, next) {
    await dao.buscarApontamentoExistentesUserAcl(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }; 

  api.buscarApontamentoExistentesUserRetifica = async function (req, res, next) {
    await dao.buscarApontamentoExistentesUserRetifica(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }; 



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

  api.salvar = async function (req, res, next) {
    await dao.salvar(req, res, next)
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


  api.buscarTransportadoras = async function (req, res, next) {
    await dao.buscarTransportadoras(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.importarExcel = async function (req, res, next) {
    await dao.importarExcel(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.usuariosFechamento = async function (req, res, next) {
    await dao.usuariosFechamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  

  return api;
};
