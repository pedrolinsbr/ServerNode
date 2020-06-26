module.exports = function (app, cb) {
  var fs = require('fs');
  var api = {};
  
  var dao             = app.src.modHoraCerta.dao.AgendamentoDAO;
  var daoBalanca      = app.src.modHoraCerta.dao.BalancaDAO;
  var daoM            = app.src.modHoraCerta.dao.MobileDAO;
  var aceite          = app.src.modOferece.dao.AceiteDAO;
  var utils           = app.src.utils.DataAtual;
  var utilsConversor  = app.src.utils.ConversorArquivos;
  var email           = app.src.modGlobal.controllers.EmailController;
  var daoCheckList = app.src.modHoraCerta.dao.ChecklistDAO;
  agendamentoChecklist = {'idh006': ''};
  var tomadorSalvo;
  var tomadores;
  var agendamento = {IDH006: ''};
  var socket = require('socket.io-client').connect('http://34.235.52.140:3020');

  const headerFile = 'src/modHoraCerta/templates/emailHeader.html';
  const footerFile = 'src/modHoraCerta/templates/emailFooter.html';
  const utilCA     = app.src.utils.ConversorArquivos;

  var PDFDocument, doc;
  PDFDocument = require('pdfkit');

  api.buscarAgendamentos = async function (req, res, next) {

    try {
      if (req.body.IDH006) {
        let result = await dao.buscarAgendamentos(req, res, next);

        if (result.length) {
          for (let res of result) {

            let IDS001;
            if (req.body.IDS001 !== undefined){
              IDS001 = req.body.IDS001;
            }
            else if (req.headers.ids001 !== undefined){
              IDS001 = req.headers.ids001;
            }

            let obj = {
              IDH006: res.IDH006,
              IDG046: res.IDG046,
              IDS001: IDS001
            }
            let cargas = await dao.buscarCargas(obj, res, next);

            for (let c of cargas) {
              let arIdTomado = c.IDTOMADO.split(',');
              let arNmTomado = c.NMTOMADO.split(',');
              c.arTomador = [];

              for (let i in arIdTomado) {
                let objTomado = { id: arIdTomado[i], text: arNmTomado[i] };
                c.arTomador.push(objTomado);
              }
            }

            res.CARGAS = cargas;
          }
          res.json(result);
        } else {
          res.status(400).send({ message: "Erro ao buscar agendamento!" });
        }

      } else {
        await dao.buscarAgendamentos(req, res, next)
          .then(async (result1) => {
            res.json(result1);
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            next(err);
          });
      }

    } catch (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
      next(err);
    }

  };


  api.buscarAgendamentosGrid = async function (req, res, next) {
    await dao.buscarAgendamentosGrid(req, res, next)
      .then(async (result1) => {
        let tomadores;
        let checklist;
        //Buscar os tomadores de cada agendamento
        for(var i = 0;  i < result1.data.length; i++){
          agendamento = {IDH006: result1.data[i].IDH006};
          tomadores = await dao.buscarTomador(agendamento, res, next);
          
          if(tomadores[0].TOMADOR == undefined || tomadores[0].TOMADOR == null || tomadores[0].TOMADOR == ''){
            result1.data[i].TOMADOR = '';
          } else {
            result1.data[i].TOMADOR = tomadores[0].TOMADOR;
          }
        }

        res.json(result1);
        console.log("Resposta::>>>", result1);

      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarMontarCarga = async function (req, res, next) {
    await dao.buscarMontarCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarOrCarregamento = async function (req, res, next) {
    await dao.buscarOrCarregamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarMontarCargaGrid = async function (req, res, next) {
    await dao.buscarMontarCargaGrid(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.mudarStFinali = async function (req, res, next) {
    await dao.mudarStFinali(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarBox = async function (req, res, next) {
    await dao.salvarBox(req, res, next)
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
      .then(async (result1) => {
        //await crlTomador.salvar(req,res,next);

        if(req.body.dadosCarga.FORNECED === undefined){
          for (key of req.body.dadosCarga.IDG005) {
            var obj = { IDH006: result1, IDG005: key };
            await dao.salvarTomador(obj, res, next)
              .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
              });
          }
        } else {// Tratativa para cargas do tipo de recebimento
          var obj = { IDH006: result1, IDG005: req.body.dadosCarga.IDG005};
          await dao.salvarTomador(obj, res, next)
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              next(err);
            });
        }

        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });


  };

  api.cancelarCarga4pl = async function (req, res, next) {
    await dao.cancelarCarga4pl(req, res, next)
      .then(async (result1) => {
        await api.cancelarAgendamento(req, res, next);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });      
  };

  api.trocarStatus = async function (req, res, next) {
    await dao.trocarStatus(req, res, next)
      .then(async ( result1) => {

        if(req.body.STAGENDA == 12){
          await api.solicitarEntrada(req,res,next);
          await api.solicitarEntradaPainel(req,res,next);
        }else{
          res.json(result1);
        }
                
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.solicitarEntrada = async function (req, res, next) {

    var data = await daoM.buscarSolicitarEntrada(req, res, next);


    socket.emit('emitRoom', {room:req.body.IDH006,  type:1, IDH006:data[0].IDH006, 
                NMMOTORI:data[0].NMMOTORI, HOOPERAC: data[0].HOOPERAC, 
                TXOBSERV: data[0].TXOBSERV, text:"rafael"
            });
    res.json({response: req.__('hc.sucesso.statusCriado')});     
  };

  api.solicitarEntradaPainel = async function (req, res, next) {
    
    try{ 
      var data = await daoM.buscarSolicitarEntrada(req, res, next);


      socket.emit('emitRoom', {
        room: 'hc-painel', type: 1, IDH006: data[0].IDH006,
        NMMOTORI: data[0].NMMOTORI, HOOPERAC: data[0].HOOPERAC,
        TXOBSERV: data[0].TXOBSERV
      });
      return 
    }
    catch (err) {
      res.status(500).send( "erro");
    } 
    
  }

  api.atualizarComentarios = async function (req, res, next) {
    await dao.atualizarComentarios(req, res, next)
      .then((result) => {
        //{res.status(200).send("Comentarios salvos com sucesso!")};
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarComentarios = async function (req, res, next) {
    await dao.buscarComentarios(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarLiberacaoSaida = async function (req, res, next) {
    await dao.salvarLiberacaoSaida(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.tempoSlots = async function (req, res, next) {
    
    var minutosSlots = await dao.BuscarMinutosSlots(req, res, next);
    var objResult;
    await dao.tempoSlots(req, res, next)
      .then((result1) => {
        if(result1 != undefined){
          var qtSlots =  Math.ceil(result1.VRTEMCAR / minutosSlots)
          objResult = {QTTEMPRE: result1.VRTEMCAR, TEMSLOTS: minutosSlots,  QTSLOTS: qtSlots};
        }else{
          //Default
          objResult = {QTTEMPRE: '30', TEMSLOTS: '30', QTSLOTS: '1'};
        }
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

      if(req.headers){
        res.json(objResult);
      }else{
        return objResult;
      }
  };

  api.atribuirTu = async function (req, res, next) {
    await dao.atribuirTu(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.uploadNF = async function (req, res, next) {

    if (req.files.length === 0) {
      res.status(400).send({ nrlogerr: -901, armensag: ['Erro ao importar delivery, arquivo incorreto ou muito grande'] });
    }

    let tempoAtualString = utils.tempoAtual().replace(/:/gi, '-');
    var DirCanhoto = process.env.FOLDER_NF;

    for (let i = 0; i < req.files.length; i++) {
      let nomeArquivo = '';
      var name = req.files[i].originalname.split(".");
      if (name.length > 0) {
        var ext = name.length - 1;
        var extensao = name[ext];
      }
      nomeArquivo = name[0] + "-" + tempoAtualString + "." + extensao;
      var fullPath = DirCanhoto + nomeArquivo;

      fs.writeFile(fullPath, req.files[i].buffer, "binary", function (err) {
        if (err) {
          console.log(err);
        }
      });

      req.files[0].originalname = nomeArquivo;
      await dao.gravarNF(req, res, next)
        .then((result) => {
          //res.json({ data: req.files[0].originalname });
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }
    res.status(200).json({data: 'sucess'});
  }

  api.deleteNF = async function (req, res, next) {
    let nomeArquivo = req.body.nomeArquivo;
    var DirCanhoto = process.env.FOLDER_NF;
    var fullPathArquivo = DirCanhoto + nomeArquivo;
    var fullPath = DirCanhoto + 'lixeira/';

    var arquivoOriginal = fs.readFileSync(fullPathArquivo);
    
    if(!fs.existsSync(fullPath)){
      fs.mkdir(fullPath);
    }
    
    fullPath += nomeArquivo;
    fs.writeFile(fullPath, arquivoOriginal, "binary", function (err) {
      if (err) {
        console.log(err);
      }
    });
    
    await dao.deleteNF(req, res, next)
      .then((result) => {
        fs.unlink(fullPathArquivo);
        res.json({ data: result });
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

  }

  api.buscarNF = async function (req, res, next) {
    await dao.buscarNF(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizacaoAgendamentosCheckin = async function (req, res, next) {
    await dao.atualizacaoAgendamentosCheckin(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.atualizacaoAgendamentos = async function (req, res, next) {
    await dao.atualizacaoAgendamentos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarAcoesGrade = async function (req, res, next) {
    await dao.buscarAcoesGrade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarDataAtual = async function (req, res, next) {
    var hora = utils.tempoAtual('DD/MM/YYYY HH:mm:ss');
    res.json(hora);
  };

  api.buscarTranspGrade = async function (req, res, next) {
    await dao.buscarTranspGrade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarInfoTimeLine = async function (req, res, next) {
    await dao.buscarInfoTimeLine(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarClienteGrade = async function (req, res, next) {
    await dao.buscarClienteGrade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarArmazemUser = async function (req, res, next) {
    await dao.buscarArmazemUser(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarPerfilUser = async function (req, res, next) {
    await dao.buscarPerfilUser(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarParametros = async function (req, res, next) {
    await dao.buscarParametros(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.editarAgendamento = async function (req, res, next) {

    var placasAntigas = await dao.buscarPlaca(req, res, next)
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    var IDH006 = {id: req.body.IDH006};


    
    var tomadorEnviado = [];

    //tratativa: quando existe apenas um tomador, a tela infoCarga manda um array e a infoCarga2 uma string
    if(Array.isArray(req.body.dadosCarga.IDG005)){ //
      tomadorEnviado = req.body.dadosCarga.IDG005.slice(0);
    } else {
      tomadorEnviado.push(req.body.dadosCarga.IDG005)
    }


    // busca dos tomadores salvos  
    tomadorSalvo = await aceite.listarTodosTomadores(IDH006, res, next);

    var tomadorSalvar  = [];
    var tomadorExcluir = [];
    var tomadorReinserir = [];

    // Compara o que usuário enviou com o que está salvo no banco, o que for diferente salvaremos
    for(let i in tomadorEnviado){ 
      var adiciona = true;
      for(let j in tomadorSalvo){ 
        if(tomadorEnviado[i] == tomadorSalvo[j].IDG005){
          //Verifica se o tomador foi excluído e agora está inserindo de novo
          if(tomadorSalvo[j].SNDELETE == 1){
            tomadorReinserir.push(tomadorEnviado[i]);
          }
          adiciona = false;
        }
      }
      if(adiciona){
        tomadorSalvar.push(tomadorEnviado[i]);
      }
    }
    
    //console.log("Tomador Salvar:>>>", tomadorSalvar);
    
    // salvar tomador
    if(tomadorSalvar){
      for(let key in tomadorSalvar){
        var obj = {IDH006: req.body.IDH006, IDG005: tomadorSalvar[key]};
        var tmSalvo = await dao.salvarTomador(obj, res, next)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
      }
    }

    // Compara o que está no banco com o que o usuário está enviando, o que for diferente excluiremos
    for(let i in tomadorSalvo){ 
      var adiciona = true;
      for(let j in tomadorEnviado){ 
        if(tomadorSalvo[i].IDG005 == tomadorEnviado[j]){
          adiciona = false;
        }
      }
      if(adiciona){
        tomadorExcluir.push(tomadorSalvo[i].IDG005);
      }
    }

    // excluir tomador
    if(tomadorExcluir){
      for(let key of tomadorExcluir){
        var obj = {IDH006: req.body.IDH006, IDG005: key, SNDELETE: 1};
        var tomadorExcluir = await dao.updateTomador(obj, res, next)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
      }
    }

    // reinserir tomador
    if(tomadorReinserir){
      for(let key of tomadorReinserir){
        var obj = {IDH006: req.body.IDH006, IDG005: key, SNDELETE: 0};
        var tmdReinserir = await dao.updateTomador(obj, res, next)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
      }
    }

    if(req.body.dadosCarga.produtos != undefined){
  
      await dao.deleteMateriais(req , res, next);
    
      for(i of req.body.dadosCarga.produtos){
        req.IDH006 = req.body.IDH006;
        req.IDH022 = i.IDH022;
        req.QTMATERI = i.QTMATERI;
        req.IDG009 = i.IDG009;
        
        await dao.salvarMateriais(req, res, next).catch((err) => { throw err });
      }
    }
    
    await dao.editarAgendamento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    //gerar pre-asn
    if (placasAntigas[0].NRPLAVEI != req.body.dadosCarga.NRPLAVEI ||
      placasAntigas[0].NRPLAVEI1 != req.body.dadosCarga.NRPLAVEI ||
      placasAntigas[0].NRPLAVEI1 != req.body.dadosCarga.NRPLAVEI
    ) {
      await dao.editarPreASN({ IDG046: req.body.IDG046, STINTCLI: 7 }, res, next)
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }
  };


  api.buscarPlaca = async function (req, res, next) {
    await dao.buscarPlaca(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.excluirTerceiro = async function (req, res, next) {
    await dao.excluirTerceiro(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.cancelarAgendamento = async function (req, res, next) {
    await dao.cancelarAgendamento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.cancelarPesagens = async function (req, res, next) {
    await dao.cancelarPesagens(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.inverterPesagens = async function (req, res, next) {
    await dao.inverterPesagens(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.trocarDadosAgendamento = async function (req, res, next) {
    var arrErro = [];
    
    await dao.trocarDadosAgendamento(req, res, next)
      .catch((err) => {
        arrErro.push("Não foi possível trocar os status")
      });

    await dao.trocarPesosAgendamento(req, res, next)
    .catch((err) => {
      arrErro.push("Não foi possível trocar os pesos")
    });

    await dao.voltarStatusAgendado(req, res, next)
    .catch((err) => {
      arrErro.push("Não foi possível voltar o status para Agendado")
    });

    await dao.atribuirNovoStatus(req, res, next)
    .catch((err) => {
      arrErro.push("Não foi possível atribuir o novo status")
    });

    if(arrErro.length  > 0 ){
      next(arrErro);
    } else {
      res.json("Alterado com sucesso!");
    }
      
  };

  api.relatorioNotas = async function (req, res, next) {
    await dao.buscarAgendamentosNotas(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarTomador = async function (req, res, next) {
    await dao.buscarTomador(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarProduto = async function (req, res, next) {
    await dao.buscarProduto(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarTimeline = async function (req, res, next) {
    await dao.buscarTimeline(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };
  
  api.buscarAvancadaAgendamento = async function (req, res, next) {
    await dao.buscarAvancadaAgendamento(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.verificarAdmin = async function (req, res, next) {
    await dao.verificarAdmin(req, res, next)
      .then((result1) => {
        var resp;
        if (result1[0].SNADMIN = 1){
          resp = true
        }else{
          resp = false
        }
        res.json(resp);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.salvarNAM = async function (req, res, next) {
    await dao.salvarNAM(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.mudarTipoPesagem = async function (req, res, next) {
    await dao.mudarTipoPesagem(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.verificaStCarga = async function (req, res, next) {
    await dao.verificaStCarga(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscar4PL = async function (req, res, next) {
    await dao.buscar4PL(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.validarCheckList = async function (req, res, next) {
    await dao.validarCheckList(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarDadosCarga = async function (req, res, next) {
    await dao.buscarDadosCarga(req, res, next)
      .then((result1) => {

        if (result1.length > 0) {
          for (let r of result1) {
            let arIdTomado = r.IDTOMADO.split(',');
            let arNmTomado = r.NMTOMADO.split(',');
            r.IDG005   = [];
            r.TPOPERAC = null;

            r.IDG028 = { id: r.IDG028, text: r.NMARMAZE };
            r.IDG024 = { id: r.IDG024, text: r.NMTRANSP };
            r.IDG030 = { id: r.IDG030, text: r.DSTIPVEI };
            r.IDH002 = { id: r.IDH002, text: r.DSTIPCAR };

            switch (r.TPTRANSP) {
              case 'T':
                r.TPOPERAC = { id: 4, text: 'Transferências' };
                break;
              case 'V':
                r.TPOPERAC = { id: 7, text: 'Vendas' };
                break;
            }

            for (let i in arIdTomado) {
              let objTomado = { id: arIdTomado[i], text: arNmTomado[i] };
              r.IDG005.push(objTomado);
            }

            delete r.IDTOMADO;
            delete r.NMTOMADO;
            delete r.NMARMAZE;
            delete r.NMTRANSP;
            delete r.DSTIPVEI;
            delete r.DSTIPCAR;
            delete r.TPTRANSP;
          }
        }

        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.gerarPdf = async function (req, res, next) { 
     
     await utilsConversor.salvarArquivo("../xml/protocolo/teste.txt", 'Teste');
     res.json('Ok');
  }

  api.enviarEmail = async function (req, res, next) {
    //req.body.ANEXO = [{filename:"../xml/hc/email/teste.txt", contentType: 'text/plain'}]
    //req.body.EMDESTIN    =   	["Everton <evertonalvespessoa@gmail.com>", "Thaís <thais.vale@bravolog.com.br>", "Daniel<eng.drgomes@hotmail.com"];
    
    var rota = '';
    if(req.body.dados.IDG046){
      rota =     
      `<tr>
        <td align="left"><b>Rota:</b></td>
        <td align="right"><span id="idAgenda">${req.body.dados.IDG046}</span></td>
      </tr>`
    }

    var frota = '';
    if(req.body.dados.FROTA){
      `<tr>
        <td align="left"><b>Frota:</b></td>
        <td align="right"><span id="idAgenda">${req.body.dados.FROTA}</span></td>
      </tr>`
    }

    var lacre = '';
    if(req.body.dados.CDLACRE){
      lacre = `<tr>
        <td align="left"><b>Lacre:</b></td>
        <td></td>
        <td align="left">${req.body.dados.CDLACRE}</td>
      </tr>`
    }

    var container = '';
    if(req.body.dados.CDCONTAI){
      container = `<tr>
        <td align="left"><b>Container:</b></td>
        <td></td>
        <td align="left">${req.body.dados.CDCONTAI}</td>
      </tr>`
    }

    var ordem = '';
    if(req.body.ordemCarregamento){
      ordem = `<tr>
        <td align="left"><b>Ordem de Carregamento:</b></td>
        <td></td>
        <td align="left">${req.body.ordemCarregamento}</td>
      </tr>`
    }

    var obs = '';
    if(req.body.dados.TXOBSAGE){
      obs = `<tr>
        <td align="left"><b>Observações:</b></td>
        <td></td>
        <td align="left">${req.body.dados.TXOBSAGE}</td>
      </tr>`
    }

    
    req.body.EMDESTIN      =   req.body.EMDESTIN;
    req.body.DSASSUNT      =   "Protocolo agendamento Hora certa";
    req.body.DSMENSAG      =   
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Hora Certa</title>
        <style>
        table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
        }
       
        .hr-pdf{
          border: 0.5px solid #333;
          width: 100%;
          margin-top: 5px !important;
          margin-bottom: 5px !important;
        }

        .font-head{
          font-size: 10px;
        }

        .font-body{
          font-size: 12px;
        }

        .flutuar{
          position: relative;
          float: right;
        }

        .selecionados{
          border: 1px solid #D6D6D6;
          padding: 10px;
        }

        .itemSelecionado{
          background: #ececec;
          border-radius: 10px;
          padding: 5px;
          margin-left: 5px;
        }

        </style>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
      </head>
      <body style="font-family: helvetica; background-image: url(http://artwebsistemas.com.br/img_bravo/bg02.jpg); background-position: center top; background-repeat: no-repeat;">
        <div class="row" style="padding-top: 25px; padding-bottom: 25px;">

        </div>
        <hr style="width: 100%;height:4px; border:none; color:#000; background-color:#4caf50; margin-top: 0px; margin-bottom: 0px;"/>
        <div class="row">
          <div class="col-md-12 text-center" style="padding: 10px; color: #054283; ; text-align: center">
            <h2 style="font-weight: 900; font-size: 170%">PROTOCOLO DE AGENDAMENTO</h2>
          </div>
        </div>

        <div style="text-align: center; width: 100%">

        <div class="divPDF">
                <div class="card">
                  <div class="card-body">
                    <table width="100%" class="font-head">
                      <tr>
                        <td align="left"><b>Usuário do agendamento:</b> ${req.body.dados.NMUSUARI} </td>
                        <td align="right"><b>Horário do agendamento:</b> ${req.body.dados.DTCADAST} </td>
                      </tr>
                    </table>
                    <div class="row sm-12">
                      <hr class="hr-pdf">
                      <div class="col-sm-4">
                        <br>
                        <img src="http://artwebsistemas.com.br/bravo/hcLogo.png" class="mb-12"  alt="" width="150px;">
                      </div>

                      <div class="col-sm-4">
                        <table class="font-body">
                          <tr>
                            <td align="left"><b>Armazém:</b></td>
                            <td align="right">${req.body.dados.NMARMAZE}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Data Agendada:</b></td>
                            <td align="right">${req.body.dados.HOINICIO}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Agendamento:</b></td>
                            <td align="right"><span id="idAgenda">${req.body.dados.IDH006}</span></td>
                          </tr>

                          ${rota} ${frota}

                          <tr>
                            <td align="left"><b>Janela:</b></td>
                            <td align="right">${req.body.dados.NRJANELA}</td>
                          </tr>

                        </table>

                      </div>
                    </div>

                    <div class="row col-mb-12">

                        <table class="font-body">

                          <tr>
                            <td colspan="3"><hr class="hr-pdf"></td>
                          </tr>

                          <tr>
                            <td colspan="3"><b>Obs:</b> Favor se apresentar na portaria do Armazém entre ${req.body.dados.HOANTES} e ${req.body.dados.HOATE} do dia ${req.body.dados.DTINICIO}.</td>
                          </tr>

                          <tr>
                            <td colspan="3"><hr class="hr-pdf"></td>
                          </tr>

                          <tr>
                            <td align="left"><b>Status:</b></td>
                            <td width="10px"></td>
                            <td align="left">${req.body.dados.DSSTAAGE}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Tipo de Operação:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.TPMOVTO}</td>
                          </tr>


                          <tr>
                            <td colspan="3"><hr class="hr-pdf"></td>
                          </tr>

                          <tr>
                            <td align="left"><b>Transportadora:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.NMTRANSP}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Motorista:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.NMMOTORI}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>RG do Motorista:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.RGMOTORI}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Tipo do Veí­culo:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.DSTIPVEI}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Placa:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.NRPLAVEI}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Peso (KG):</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.QTPESO}</td>
                          </tr>

                          ${lacre}
                          ${container}
                          ${ordem}

                          <tr>
                            <td align="left"><b>Tomadores:</b></td>
                            <td></td>
                            <td align="left">${req.body.tomadores}</td>
                          </tr>

                          <tr>
                            <td align="left"><b>Tipo(s) de operação:</b></td>
                            <td></td>
                            <td align="left">${req.body.dados.TPOPERAC}</td>
                          </tr>

                          ${obs}

                       </table>
                    </div>

                  </div>
                </div>
              </div>

        </div>  
        <hr style="width: 100%;height:4px; border:none; color:#000; background-color:#4caf50; margin-top: 20px; margin-bottom: 20px;"/>
        <div class="row" style="padding-top: 25px; padding-bottom: 25px;">
        </div>
      </body>
    </html>   
    `


    await email.envio(req,res ,next);

  }

  return api;
};
