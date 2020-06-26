module.exports = function (app, cb) {
  var fs = require('fs');
  var api = {};
  var dao        = app.src.modHoraCerta.dao.BalancaDAO;
  var operacDao  = app.src.modHoraCerta.dao.TipoOperacaoDAO;
  var ctrls      = app.src.modHoraCerta.controllers;
  var utils      = app.src.utils.DataAtual;
  var utilsCa    = app.src.utils.ConversorArquivos;

  //var crlTomador = app.src.modHoraCerta.controllers.TomadorController;
  readline = require('readline');

  api.buscarPeso = async function (req, res, next) {
    var balanca = req.body.balanca;

    if(balanca == 1){
      var rd = readline.createInterface({
        input: fs.createReadStream('../xml/balanca/peso.txt'),
        output: process.stdout,
        console: false
      });
    } else {
      var rd = readline.createInterface({
        input: fs.createReadStream('../xml/balanca/peso2.txt'),
        output: process.stdout,
        console: false
      });
    }

    await rd.on('line', (line) => {
      res.status(200).send( {PESOBAL: line});
    });
  }
  
  /**
   * Função responsavel por trazer dados do relatório Ticket de Pesagens
   * 
   */
  api.ticketPesagens = async function (req, res, next) {
    try{
      let obj = '';
      let daoAgendamento = app.src.modHoraCerta.dao.AgendamentoDAO;
      obj = await daoAgendamento.buscarDadosAgendamentoTicket(req, res, next).catch((err) => { throw err });

      if(obj[0].PESOCOMP1 != null && obj[0].PESOCOMP1 != null){
        obj[0].BITREM = true;
      }else{
        obj[0].BITREM = false;
      }

      let statusAgendamento = await daoAgendamento.buscarDadosStatusAgendamentoTicket(req, res, next).catch((err) => { throw err });

      let pesagens = await dao.buscarMovimentacao(req, res, next).catch((err) => { throw err });

      obj[0].statusAgendamento = statusAgendamento;
      obj[0].pesagens = pesagens.filter(element => element.SNDELETE != 1);

      res.status(200).send(obj[0]);
    }catch (err) {
      res.status(500).send( "Não foi possível buscar dados do Ticket");
      }
    
  }
  /**
   * Função responsavel por trazer dados do relatório Dados do Agendamento
   * 
   */
  api.relatorioDadosAgendamento = async function (req, res, next) {
    try{
      let obj = '';
      let daoAgendamento = app.src.modHoraCerta.dao.AgendamentoDAO;
      obj = await daoAgendamento.buscarRelatorioDadosAgendamento(req, res, next).catch((err) => { throw err });

      statusAgendamento = await daoAgendamento.buscarRelatorioDadosStatusAgendamento(req, res, next).catch((err) => { throw err });

      pesagens = await dao.buscarMovimentacao(req, res, next).catch((err) => { throw err });

      obj[0].statusAgendamento = statusAgendamento;
      obj[0].pesagens = pesagens.filter(element => element.SNDELETE != 1);

      res.status(200).send(obj[0]);
    }catch (err) {
      res.status(500).send( "Não foi possível buscar dados do Ticket");
      }
    
  }

  api.salvarPesoAgente = async function (req, res, next) {

    var path = '';
    if(parseInt(req.params.BALANCA) == 1){
      path = '../xml/balanca/peso.txt';
    } else {
      path = '../xml/balanca/peso2.txt';
    }

    try {
      await utilsCa.salvarArquivo(path, req.params.PESOBAL);
      res.status(200).send("ok");
    }
    catch (err) {
    res.status(500).send( "não foi possível gravar o peso");
    }
  }

  api.salvarPesagem = async function (req, res, next) {

    try {
      let objVal = {
        msgErro : '',
        blOk    : false
      };
      req.objConn = await dao.controller.getConnection();

      let result  = await dao.salvarPeso(req, res, next).catch((err) => { throw err });
      objVal.blOk = (result.id !== undefined);

      if (objVal.blOk) {
        if ((req.body.STAGENDA == 12) || (req.body.STAGENDA == 13 && req.body.TPMOVTO == 'E')) { // Se for primeira pesagem de entrada ou seg. comp. rodotrem
          const objTS = {
            IDH006       : req.body.IDH006, // Agendamento
            STAGENDA     : 5,               // Status de Entrou
            OLD_STAGENDA : null,            // Status anterior (Apenas quando volta status)
            IDI015       : null,            // Motivo cancelamento
            IDG028       : null,            // Armazém (Apenas quando volta status)
            IDS001       : req.body.IDS001, // Usuário
            objConn      : req.objConn,     // Objeto de conexão
          };
          objVal = await ctrls.TrocarStatusController.entrou(objTS, res, next);
          if (objVal.blOk) { result['status'] = 5; };
        }
      } else {
        objVal.msgErro = 'Falha ao salvar pesagem!, ERRO: P002';
      }

      if (objVal.blOk) {
        await req.objConn.close();
        res.status(200).send(result);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message: objVal.msgErro});
      }
    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send( "Não foi possível salvar o peso!, ERRO: P001");
    }
  }

  api.buscarMovimentacao = async function (req, res, next) {
    try{
      result = await dao.buscarMovimentacao(req, res, next).catch((err) => { throw err });

      if (result.length > 0) {
        result[0]['QTPESENT'] = result.filter(res => res.TPMOVTO == 'E' && res.SNDELETE == 0).length;
        result[0]['QTPESSAI'] = result.filter(res => res.TPMOVTO == 'S' && res.SNDELETE == 0).length;
      }

      res.status(200).send(result);
    }catch (err) {
      res.status(500).send( "Não foi possível buscar a movimentação");
      }
  }

  api.cancelarPesagem = async function (req, res, next) {
    try {
      var msgErro = null;
      var blOk    = false;
      req.objConn = await dao.controller.getConnection();

      let result = await dao.cancelarPesagem(req, res, next).then(result => 'Ok');
      blOk = (result == 'Ok');

      if (blOk) {
        let countPesagem = await dao.verificaQtdPesagens(req, res, next).then((result) => { return result[0]; });
        blOk = (countPesagem != undefined || countPesagem != null);

        if (blOk) {
          if (countPesagem['COUNT_PESAGEM'] == 0 && (countPesagem['STAGENDA'] == 5 || countPesagem['STAGENDA'] == 6)) {
            req.body.STAGENDA = 12;
            let updateStatus = await dao.updateStatus(req, res, next).then(result => 'Ok');
            blOk = (updateStatus == 'Ok');

            if (blOk) {
              let deleteStatus = await dao.deleteStatus(req, res, next).then(result => 'Ok');
              blOk = (deleteStatus == 'Ok');

              if (!blOk) {
                msgErro = `Falha ao voltar status agendamento!`;
              }
            } else {
              msgErro = `Falha ao atualizar status agendamento!`;
            }
          }
        } else {
          msgErro = `Falha ao buscar quantidade de pesagens!`;
        }
      } else {
        msgErro = `Falha ao cancelar pesagem!`;
      }


      if (blOk) {
        await req.objConn.close();
        res.json(req.body.IDH006);
      } else {
        await req.objConn.closeRollback();
        res.status(400).send({message:msgErro});
      }
    } catch (err) {
      await req.objConn.closeRollback();
      res.status(500).send({message:`Erro: ${err.message}`});
    }
  }

  api.calcularPesos = async function (req, res, next) {
    
    var obj = {};
    obj.tpOPeracao  = req.body.tpOPeracao
    obj.P1          = req.body.P1
    obj.P2          = req.body.P2
    obj.C1          = req.body.C1
    obj.C2          = req.body.C2
    obj.PS          = req.body.PS
    obj.PA          = req.body.PA
    obj.TO          = req.body.TO
    
    let desvio, desvioPer, aprovacao
    /*
      tpOperacao: Normal, bitrem, camaleão
      P1: Peso da composição 1
      P2: Peso da composição 2
      C1: Peso cavalo 1
      C2: Peso cavalo 2
      PS: Peso de saída
      PA: Peso agendado
      TO: tolerância
      Desvio: Valor de desvio do peso agendado com o peso da balança
      desvioPer: Valor do desvio em %
      aprovacao: Se o desvio foi aprovado ou não de acordo com a tolerância
    */
        
    
    switch(obj.tpOPeracao){

      case "N":
        desvio = (obj.PA - (obj.P1 - obj.PS));
        break
      case "B":
        desvio = (obj.PA - (obj.P1 + obj.P2) - (obj.PS + obj.C1));
        break
      case "C":
        desvio = (obj.PA - (obj.P1 - obj.C1) - (obj.PS - obj.C2));
        break
    }

    desvioPer = (desvio / obj.PA) * 100;

    if( desvio <= obj.TO){
      aprovacao = "Sim";
    } else{
      aprovacao = "Não";
    }
    res.status(200).send({desvio, desvioPer, aprovacao });
    
  }

  api.calcularPesosAuto = async function (req, res, next) {

    /*
      tpOperacao:
      P1: Peso da composição 1
      P2: Peso da composição 2
      C1: Peso cavalo 1
      C2: Peso cavalo 2
      PS: Peso de saída
      PA: Peso agendado
      TO: tolerância
      Desvio: Valor de desvio do peso agendado com o peso da balança
      desvioPer: Valor do desvio em %
      aprovacao: Se o desvio foi aprovado ou não de acordo com a tolerância
    */

    let desvio, desvioPer, aprovacao, calcularDesvioPer;

    req.body.SNDELETE = [0];

    pesos = await dao.buscarMovimentacao(req, res, next).catch((err) => { throw err });
    pesos = pesos.filter((peso) =>{ return peso.SNDELETE == 0 });

    if(!pesos.length){ 
      return res.status(500).send({message:"Não é possível realizar o calculo, PESOS NÃO LOCALIZADOS"});
    }

    if(!pesos[0].PA){
      return res.status(500).send({message:"Não é possível realizar o calculo, FALTA O PESO AGENDADO"});
    }

    let body = { IDOPERAC: parseInt(pesos[0].TPOPERAC) };

    var dadosOperacao = await operacDao.buscar({ body }, res, next);

    if(dadosOperacao == null || dadosOperacao == undefined){ 
      return res.status(500).send({message:"Não é possível realizar o calculo, VALORES DE TOLERÂNCIA NÃO LOCALIZADOS"});
    }

    var obj = {};

    obj.TO1 = 1;
    obj.TO2 = -1;

    if (parseInt(pesos[0].TPOPERAC) != 8) { // Entrada de terceiros não tem pesagem
      obj.TO1 = dadosOperacao.TOLERA1;
      obj.TO2 = -(dadosOperacao.TOLERA2);
    }

    calcularDesvioPer = true;
    switch (pesos[0].TPPESAGE) { //normal
      case 4:
      case 2:
        obj.tpOperacao = pesos[0].TPOPERAC
        obj.P1 = pesos[0].QTPESO;
        obj.PS = pesos[1].QTPESO;
        obj.PA = pesos[0].PA;

        if(pesos[0].TIPO == "D"){
          if(obj.tpOperacao == 11 || obj.tpOperacao == 12){
            desvio = (obj.P1 - obj.PS) - (obj.P1 - obj.PS); //arliquid
          } else {
            desvio =  (obj.P1 - obj.PS) - obj.PA; //descarga
          }
        }else{
          desvio = (obj.PS - obj.P1) - obj.PA ; //carga
        }
        break
      case 1: //bitrem
        obj.tpOperacao = pesos[0].TPOPERAC                  // Tipo de Operação
        obj.P1         = pesos[0].QTPESO + pesos[2].QTPESO; // Soma pesagens de entrada
        obj.PS         = pesos[1].QTPESO + pesos[3].QTPESO; // Soma pesagens de saída
        obj.PA         = pesos[0].PA;                       // Peso Agendado

        if (pesos[0].TIPO == 'D') { // Descarga
          desvio = (obj.P1 - obj.PS) - obj.PA;
        } else { //carga
          desvio = (obj.PS - obj.P1) - obj.PA
        }
        break

      case 3: // isotanque  carga - 4 pesagens, descarga 2

        obj.tpOperacao = pesos[0].TPOPERAC
        obj.P1 = pesos[0].QTPESO;
        obj.PS = pesos[1].QTPESO;
        obj.PA = pesos[0].PA;
  
        if(pesos.length > 2){
          obj.PTE =  pesos[2].QTPESO; //ENTRADA TICKET
          obj.PTS =  pesos[3].QTPESO; //SAÍDA TICKET
        }
  
        if(pesos[0].TIPO == "D"){
          desvio =  (obj.P1 - obj.PS) - obj.PA; //descarga
        } else {
          if(pesos.length == 2){ // primeira validacao de peso
            desvio = (obj.PS - obj.P1) - obj.PA; //carga
            obj.TO1 = 100;
            obj.TO2 = -100;
          } else{ // segunda validacao de peso
            desvio = obj.PTS - obj.PS;
            desvioPer = parseFloat(((desvio / (obj.PS - obj.P1)) * 100).toFixed(1)); //percentual de desvio em cima do peso liquido
            calcularDesvioPer = false;
          }
        }
        break

      case 5: //isotanque  descarga - 4 pesagens, carga 6 pesagens

        obj.tpOperacao = pesos[0].TPOPERAC
        obj.P1  =  pesos[0].QTPESO;
        obj.C1  =  pesos[1].QTPESO;
        obj.C2  =  pesos[2].QTPESO;
        obj.PS  =  pesos[3].QTPESO;
        obj.PA  =  pesos[0].PA;

        if(pesos.length > 4){
          obj.PTE =  pesos[4].QTPESO; //ENTRADA TICKET
          obj.PTS =  pesos[5].QTPESO; //SAÍDA TICKET
        }

        if(pesos[0].TIPO == "D"){
          desvio = ((obj.P1 - obj.C1) - (obj.PS - obj.C2)) - obj.PA;
        } else {
          if(pesos.length == 4){ // primeira validacao de peso
            desvio = ((obj.PS - obj.C2) - (obj.P1 - obj.C1)) - obj.PA;
            obj.TO1 = 100;
            obj.TO2 = -100;
          } else{ // segunda validacao de peso
            desvio = obj.PTS - obj.PS;
            desvioPer = parseFloat(((desvio / ((obj.PS - obj.C2) - (obj.P1 - obj.C1))) * 100).toFixed(1)); //percentual de desvio em cima do peso liquido
            calcularDesvioPer = false;
          }
        }
        break
    }

    // Para armazém DPA
    if (parseInt(pesos[0].IDG028) == 11) {
      // Para cargas paletizadas ou mistas considerar peso pallet
      if ((pesos[0].IDH002 == 2 || pesos[0].IDH002 == 3) && parseInt(pesos[0].TPOPERAC) != 6) {
        let pesoPallet = 0.00;

        if (pesos[0].QTPALLET && pesos[0].PSPALLET) {
          pesoPallet = pesos[0].QTPALLET * pesos[0].PSPALLET;
        }

        desvio = desvio - pesoPallet;
      }
    }

    if (calcularDesvioPer) {
      desvioPer = parseFloat(((desvio / obj.PA) * 100).toFixed(1));
    }
    let result = null;

    req.body.DESVIOKG = desvio;
    req.body.DESVIOPE = parseFloat(desvioPer);

    if(desvioPer <= obj.TO1 && desvioPer >= obj.TO2 ){
      aprovacao = "Sim";
      req.body.LIBERADO = 1;
      result = await dao.atualizaLiberacao(req, res, next).catch((err) => { throw err });
    } else{
      aprovacao = "Não";
      req.body.LIBERADO = 0;
      result = await dao.atualizaLiberacao(req, res, next).catch((err) => { 
        res.status(400).send({err:"Erro ao calcular" });   
        throw err 
      });
    }

    res.status(200).send({desvio, desvioPer, aprovacao });
  }

  api.relatorioPesagens = async function (req, res, next) {
    await dao.relatorioPesagens(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  return api;
};
