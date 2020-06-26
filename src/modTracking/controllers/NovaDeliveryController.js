module.exports = function (app, cb) {

  const utilsCA   = app.src.utils.ConversorArquivos;
  const utilsDir  = app.src.utils.Diretorio;
  const utilsFE   = app.src.utils.Utils;
  const dao       = app.src.modTracking.dao.NovaDeliveryDAO;
  const tmz       = app.src.utils.DataAtual;

  const fs        = require('fs');
 
  const dirList = process.env.FOLDER_DOWNLOAD;
  const dirIn   = '../xml/delivery/pool/';
  const dirOut  = process.env.FOLDER_STORE;
  const dirSave = process.env.FOLDER_SAVE;

  var api = {};

  //---------------------------------------------------------------------\\

	/**
	 * @description Retorna um array JSON contendo todas as deliveries a ser importadas
	 * @author Rafael Delfino Calzado
	 * @since 20/12/2017
	 *
	 * @async
	 * @function api/listarDelivery	 
	 * @return {Array} Json com todas as Deliveries constantes no diretório
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/

  api.listarDelivery = async function (req, res, next) {
    console.log('Listando Deliveries');

    await api.lerDiretorio(dirList, res, next)
      .then((arrDelivery) => {
        res.status(200).json(arrDelivery);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });      
  }

  //---------------------------------------------------------------------\\  

	/**
	 * @description Retorna um array JSON contendo os dados da Entrega da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 12/01/2018
	 *
	 * @async
	 * @function api/listarEntrega
	 * @return {Array} 
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/

  api.listarEntrega = async function (req, res, next) {
    console.log('Listando Entrega');

    await dao.buscarEntrega(req, res, next)
      .then((result) => {
        res.status(200).json(result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });      
  }

  //-----------------------------------------------------------------------\\

	/**
	 * @description Retorna um array de Objetos com os atributos de cada delivery
	 * @author Rafael Delfino Calzado
	 * @since 20/12/2017
	 *
	 * @async
	 * @function api/lerDiretorio
   * @param {path} path Diretório a ser lido
	 * @return {Array} Json com todas as Deliveries constantes no diretório
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/

  api.lerDiretorio = async function (path, res, next) {
    var arrDelivery = [];
    
    var files = utilsDir.listFiles(path);
    var arrDelivery = [];
    var parm = { dir: path };

    for (var i in files) {
      parm.filename = files[i].filename;
      arrDelivery.push(await api.lerXMLDelivery(parm, res, next));
    }

    return arrDelivery;
  }

  //---------------------------------------------------------------------\\  

	/**
	 * @description Retorna um objeto JSON com as diferenças entre a Delivery atual e a Nova
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/comparaDelivery	 
	 * @return {JSON} 
	 * @throws Caso falso, o número do log de erro aparecerá no console.
	*/

  api.comparaDelivery = async function (req, res, next) {
    console.log('Comparando Deliveries');

    await api.comparaValores(req, res, next)
      .then((objResult) => {
        res.status(200).send(objResult);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });      
  }

  //---------------------------------------------------------------------\\  

	/**
	 * @description Compara os campos de dois arquivos de Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/comparaValores
	 * @return {JSON} 
	*/

  api.comparaValores = async function (req, res, next) {    

    var parm = { dir: dirList, filename: req.body[0].data };    
    
    var objDelivery  = {};
    var objResult    = { ok: false };
    var objCompara   = api.getObjCompara();

    objDelivery.nova = await api.lerXMLDelivery(parm, res, next);

    parm = { dir: dirSave, filename: `delivery-${objDelivery.nova.cdDelivery}.xml` };    
    objDelivery.atual = await api.lerXMLDelivery(parm, res, next);
  

    if (objDelivery.atual.hasOwnProperty('cdDelivery')) {
      
      objResult.ok = true;

      //------------------------------------\\
      //Compara header

      for (var i in objCompara.header) {        
        var prop = objCompara.header[i];

        if (objDelivery.nova.hasOwnProperty(prop)) {

          if (objDelivery.atual.hasOwnProperty(prop)) {

            if (objDelivery.atual[prop] != objDelivery.nova[prop]) 
              objResult[prop] = [objDelivery.atual[prop], objDelivery.nova[prop]];            

          } else {
            objResult[prop] = ['', objDelivery.nova[prop]];
          }

        } else if (objDelivery.atual.hasOwnProperty(prop)) {
          objResult[prop] = [objDelivery.atual[prop], ''];
        }

      }

    }
    //------------------------------------\\

    return objResult;
  }

  //---------------------------------------------------------------------\\ 

	/**
	 * @description Retorna um objeto JSON com os campos da Delivery a serem comparados
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @function api/getObjCompara
	 * @return {JSON} 
	*/

  api.getObjCompara = function() {
    var objCompara = { header: [] };

    //HEADER
    objCompara.header.push('cdPrioridade');
    objCompara.header.push('dtDelivery');
    objCompara.header.push('dtEntrega');
    objCompara.header.push('cdFilial');
    objCompara.header.push('cdCliExterno');
    objCompara.header.push('cdDestinatario');
    objCompara.header.push('nrCNPJ');
    objCompara.header.push('nrIE');
    objCompara.header.push('tpEnvio');
    objCompara.header.push('unPeso');
    objCompara.header.push('nrEmbalagem');
    objCompara.header.push('vrDelivery');
    objCompara.header.push('vrVolume');
    objCompara.header.push('psBruto');
    objCompara.header.push('psLiquido');
    objCompara.header.push('snSegregado');

    //ITEM
    //objCompara.item = [];

    //LOTE
    //objCompara.lote = [];
    
    return objCompara;
  }

  //---------------------------------------------------------------------\\ 
  
	/**
	 * @description Lê o arquivo da Delivery e salva no banco
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/gravarDelivery	 
	 * @return {JSON} 	 
	*/

  api.gravarDelivery = async function (path, res, next) {
    var arrPath = path.split("/");
    var parm = { dir: dirIn, filename: arrPath[arrPath.length-1] };

    console.log(`Importando ${parm.dir}${parm.filename}`);
    await dao.registraImportacao(parm, res, next);

    var objDelivery = await api.lerXMLDelivery(parm);
    objDelivery     = await api.salvarDelivery(objDelivery, res, next);

    await dao.removerImportacao(parm.filename, res, next);

    return objDelivery;
  }

  //---------------------------------------------------------------------\\    

	/**
	 * @description Verifica referências, cria ou atualiza a Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/salvarDelivery	 
	 * @return {JSON} 
	*/

  api.salvarDelivery = async function (objDelivery, res, next) {
    
    if (typeof objDelivery.cdDelivery == "string") {      
      
      var dia  = tmz.tempoAtual('DD/MM/YYYY');
      var hora = tmz.tempoAtual('HH:mm:ss');

      objDelivery = await api.buscarRefDelivery(objDelivery, res, next);
      
      var rs = await dao.buscarDelivery(objDelivery.cdDelivery, res, next);

      if (rs.length > 0) {
        objDelivery.idDelivery = rs[0].ID;

        if (objDelivery.stDelivery == 'D') { //Cancelamento
          objDelivery.stEtapa = 8;

        } else {

          switch (rs[0].STETAPA) {
            case 6:
              objDelivery.stEtapa = rs[0].STULTETA;
              break;

            case 5: //Encerrada            
              objDelivery.stEtapa = rs[0].STETAPA;
              break;

            default:
              objDelivery.stEtapa = rs[0].STETAPA;
              objDelivery = api.compararCampos(objDelivery, rs[0]);
              break;
          }

        }

        objDelivery.stUltEtapa = objDelivery.stEtapa;

        objDelivery.snOcorrencia = api.verificarOcorrencia(objDelivery);
        if (objDelivery.snOcorrencia) objDelivery.stEtapa = 6;
          
        //=======================================\\

        console.log(`Removendo ocorrências da delivery #${objDelivery.idDelivery}`);
        await dao.removerOcorrencias(objDelivery.idDelivery, res, next);

        console.log(`Removendo lotes da delivery #${objDelivery.idDelivery}`);
        await dao.removerLotes(objDelivery.idDelivery, res, next);

        console.log(`Removendo itens da delivery #${objDelivery.idDelivery}`);
        await dao.removerItens(objDelivery.idDelivery, res, next);

        console.log(`Atualizando delivery #${objDelivery.idDelivery}`);
        await dao.atualizarDelivery(objDelivery, res, next);        

      } else {
        console.log(`Criando delivery ${objDelivery.cdDelivery}`);

        objDelivery.snOcorrencia  = api.verificarOcorrencia(objDelivery);
        if (objDelivery.snOcorrencia) objDelivery.stEtapa = 6;

        objDelivery.idDelivery = await dao.inserirDelivery(objDelivery, res, next);        
      }
      
      //=======================================\\

      if (typeof objDelivery.idDelivery == "number") {

        // Salvar evento
        await dao.salvarEvento(objDelivery.idDelivery, 1, `${dia} ${hora}`);

        // Salvar ocorrências
        if (objDelivery.snOcorrencia) await api.salvarOcorrencias(objDelivery, 0);

        // Salvar Itens
        if (objDelivery.item.length > 0) objDelivery = await api.salvarItens(objDelivery);

        console.log(`Delivery #${objDelivery.idDelivery} importada`);

      } else {
        console.log("Delivery inválida");
      }

      //=======================================\\        

    }      
  
    return objDelivery;
  }

  //---------------------------------------------------------------------\\

	/**
	 * @description Salva os itens da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/salvarItens
	 * @return {JSON} 
	*/

  api.salvarItens = async function (objDelivery, res, next) {
    
    for (var i in objDelivery.item) {
      var objItem         = objDelivery.item[i];      
      objItem.idDelivery  = objDelivery.idDelivery;
      objItem.vrItem      = (objDelivery.vrDelivery / objDelivery.item.length);
      objItem.idItem      = await dao.salvarItem(objItem);
      
      console.log(`Item #${objItem.idItem} da Delivery #${objDelivery.idDelivery} foi salvo com sucesso`);

      //==========================================\\
      // lotes

      if (objItem.lote.length > 0) objItem = await api.salvarLotes(objItem);

      objDelivery.item[i] = objItem;
      
      //==========================================\\
      // ocorrências

      if (objItem.dsOcorrencia.length > 0) await api.salvarOcorrencias(objItem, objItem.idItem);
    
      //==========================================\\
    }

    return objDelivery;
  }

  //---------------------------------------------------------------------\\  

	/**
	 * @description Salva os lotes da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/salvarLotes
	 * @return {JSON} 	 
	*/

  api.salvarLotes = async function (objItem, res, next) {

    for (var i in objItem.lote) {    
      var objLote         = objItem.lote[i];
      objLote.idDelivery  = objItem.idDelivery;
      objLote.idItem      = objItem.idItem;
      objLote.idLote      = await dao.salvarLote(objLote);
      objItem.lote[i]     = objLote;

      console.log(`Lote# ${objLote.idLote} do item #${objLote.idItem} da Delivery #${objItem.idDelivery} foi salvo com sucesso`);

      //==========================================\\
      // ocorrências

      if (objLote.dsOcorrencia.length > 0) await api.salvarOcorrencias(objLote, objLote.idItem);
      
      //==========================================\\      
    }

    return objItem;
  }

  //---------------------------------------------------------------------\\

	/**
	 * @description Percorre o objeto da Delivery em busca de ocorrências
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @function api/verificarOcorrencia 
	 * @return {boolean} 
	*/  

  api.verificarOcorrencia = function (objDelivery) {
    var snOcorrencia = (objDelivery.dsOcorrencia.length > 0);

    if (!snOcorrencia) {

      for (var i in objDelivery.item) {
        var objItem = objDelivery.item[i];
        snOcorrencia = (objItem.dsOcorrencia.length > 0);

        if (snOcorrencia) {
          break;

        } else {

          for (var l in objItem.lote[l]) {
            var objLote = objItem.lote[l];
            snOcorrencia = (objLote.dsOcorrencia.length > 0);
            if (snOcorrencia) break;
          } 

        } 

      } 

    }

    return snOcorrencia;
  }

  //---------------------------------------------------------------------\\  

	/**
	 * @description Salva os ocorrências da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/salvarOcorrencias 
	*/

  api.salvarOcorrencias = async function (objOcc, nrItem) {
    var occ = objOcc.dsOcorrencia;
    var req = { idDelivery: objOcc.idDelivery, nrItem: nrItem };
    var log = "";

    for (var i in occ) {
      req.idOcorrencia = occ[i].idOcorrencia;
      req.nmCampo = occ[i].nmCampo;
      req.dsCampo = occ[i].dsCampo;

      log = `OCORRÊNCIA ==> ID Delivery: ${req.idDelivery} - Tipo de Ocorrência: ${req.idOcorrencia} - Campo: ${req.nmCampo} (${req.dsCampo})`;
      if (nrItem > 0) log += ` - Item: ${nrItem}`;

      console.log(log);

      await dao.salvarOcorrencia(req);
    }
  }

  //-----------------------------------------------------------------------\\

	/**
	 * @description Compara campos críticos entre a base e os novos valores
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/compararCampos
   * @return {JSON}
	*/

  api.compararCampos = function (objDelivery, rs) {

    if (objDelivery.idRemetente != rs.IDG005RE)
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'idRemetente', 'ID do Remetente'));

    if (objDelivery.idDestinatario != rs.IDG005DE)
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'idDestinatario', 'ID do Destinatário'));

    if (objDelivery.vrDelivery != parseFloat(rs.VRDELIVE.toFixed(2)))
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'vrDelivery', 'Valor da Delivery'));

    if (objDelivery.vrVolume != parseFloat(rs.VRVOLUME.toFixed(2)))
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'vrVolume', 'Volume total da Delivery'));

    if (objDelivery.psBruto != parseFloat(rs.PSBRUTO.toFixed(2)))
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'psBruto', 'Peso bruto da Delivery'));

    if (objDelivery.psLiquido != parseFloat(rs.PSLIQUID.toFixed(2)))
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'psLiquido', 'Peso líquido da Delivery'));    

    return objDelivery;
  }  

  //-----------------------------------------------------------------------\\

  /**
	 * @description Busca os IDs das referências dos campos de header na base de dados
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/buscarRefDelivery
   * @return {JSON}
	*/

  api.buscarRefDelivery = async function (objDelivery, res, next) {
    
    var rs    = [];
    var parm  = {};
    
    //=======================================\\
    // Unidade de Peso

    objDelivery.idPeso = 0;

    if (objDelivery.hasOwnProperty('unPeso')) {
      console.log('Buscando unidade de Peso da Delivery');
      rs = await dao.buscarMedida(objDelivery.unPeso, res, next);

      if (rs.length > 0) 
        objDelivery.idPeso = rs[0].ID;

      else 
        objDelivery.dsOcorrencia.push(api.gerarOcorrencia(3, 'idPeso', `Unidade de Peso da Delivery: ${objDelivery.unPeso}`));
    }

    //=======================================\\
    // Remetente

    objDelivery.idRemetente = 0;
    objDelivery.nrRemetente = 0;

    if (objDelivery.hasOwnProperty('cdFilial') && (objDelivery.hasOwnProperty('cdOperacao'))) {
      console.log('Buscando ID do Remetente');

      parm  = { cdOperacao: objDelivery.cdOperacao, cdFilial: objDelivery.cdFilial };
      rs    = await dao.buscarRemetente(parm, res, next);

      if (rs.length > 0) {
        objDelivery.idRemetente = rs[0].ID;
        objDelivery.nrRemetente = rs[0].NRSELLER;
        objDelivery.idCidOrigem = rs[0].IDCIDADE;

      } else {
        objDelivery.dsOcorrencia.push(api.gerarOcorrencia(3, 'idRemetente', `ID do Remetente: ${objDelivery.cdFilial}`));
      }
    }
     
    //=======================================\\
    // Destinatário
    
    objDelivery.idDestinatario = 0;

    if (objDelivery.hasOwnProperty('nrCNPJ') && (objDelivery.hasOwnProperty('nrIE'))) { 
      console.log('Buscando ID do Destinatário');

      parm  = { nrCNPJ: objDelivery.nrCNPJ, nrIE: objDelivery.nrIE };   
      rs    = await dao.buscarDestinatario(parm, res, next);
    
      if (rs.length > 0) {
        objDelivery.idDestinatario = rs[0].ID;
        objDelivery.idCidDestino   = rs[0].IDCIDADE;
    
      } else {
        objDelivery.dsOcorrencia.push(api.gerarOcorrencia(3, 'idDestinatario', `ID do Destinatário. CNPJ: ${objDelivery.nrCNPJ} / IE: ${objDelivery.nrIE}`));      
      }
    }

    if ((objDelivery.idRemetente == objDelivery.idDestinatario) && (objDelivery.idRemetente != 0))
      objDelivery.dsOcorrencia.push(api.gerarOcorrencia(2, 'idDestinatario', 'Origem igual ao Destino'));

    //=======================================\\  
    //Data de Entrega Contratada

    objDelivery.dtEntCon = null;

    if (objDelivery.idRemetente != objDelivery.idDestinatario) {    

      console.log('Calculando data de entrega contratada');

      parm = {   idOrigem:   objDelivery.idCidOrigem
               , idDestino:  objDelivery.idCidDestino
               , cdOperacao: objDelivery.cdOperacao 
              };      

      rs = await dao.buscarDiasSLA(parm, res, next);

      if ((rs.length > 0) && (Number.isInteger(rs[0].QTDIAENT)) && (Number.isInteger(rs[0].QTDIACOL))) {
        var dtContratada      = await utilsFE.dataContratada(new Date(), (rs[0].QTDIAENT + rs[0].QTDIACOL));
        objDelivery.dtEntCon  = utilsCA.formataDataOracle(dtContratada);

      } else {
        objDelivery.dsOcorrencia.push(api.gerarOcorrencia(3, 'dtEntCon', 'Prazo de entrega não cadastrado.'));      
      }
    }
    
    //=======================================\\
    
    for (var i in objDelivery.item) {
      objDelivery.item[i].idRemetente = objDelivery.idRemetente;
      objDelivery.item[i] = await api.buscarRefItem(objDelivery.item[i], res, next);
    }      

    return objDelivery;
  }

  //---------------------------------------------------------------------\\

  /**
	 * @description Busca os IDs das referências dos campos de item na base de dados
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/buscarRefItem
   * @return {JSON}
	*/

  api.buscarRefItem = async function (objItem, res, next) {

    var rs    = [];
    var parm  = {};

    //==========================================\\
    // Busca Unidade de Peso

    objItem.idPeso = 0;
    
    if (objItem.hasOwnProperty('unPeso')) {
      console.log(`Buscando unidade de peso do item: ${objItem.nrLineItem}`);

      rs = await dao.buscarMedida(objItem.unPeso, res, next);
    
      if (rs.length > 0) 
        objItem.idPeso = rs[0].ID;
    
      else 
        objItem.dsOcorrencia.push(api.gerarOcorrencia(3, 'idPeso', `Unidade de peso do item ${objItem.nrLineItem}: ${objItem.unPeso}`));
    }

    //==========================================\\
    // Busca Unidade de Medida

    objItem.idMedida = 0;

    if (objItem.hasOwnProperty('unMedida')) {
      console.log(`Buscando unidade de medida do item: ${objItem.nrLineItem}`);

      rs = await dao.buscarMedida(objItem.unMedida);

      if (rs.length > 0) 
        objItem.idMedida = rs[0].ID;

      else         
        objItem.dsOcorrencia.push(api.gerarOcorrencia(3, 'idMedida', `Unidade de medida do item ${objItem.nrLineItem}: ${objItem.unMedida}`));
    }

    //==========================================\\
    // Busca do ID do Produto
    
    objItem.idProduto = 0;

    if ((objItem.idRemetente > 0) && (objItem.hasOwnProperty('cdItem'))) {    
      console.log(`Buscando ID do produto do item: ${objItem.nrLineItem}`);

      parm = { idRemetente: objItem.idRemetente, cdItem: objItem.cdItem };
      rs   = await dao.buscarProduto(parm, res, next);

      if (rs.length > 0) 
        objItem.idProduto = rs[0].ID;

      else 
        objItem.dsOcorrencia.push(api.gerarOcorrencia(3, 'idProduto', `ID do produto do item ${objItem.nrLineItem}: ${objItem.cdItem}`));
    }

    //==========================================\\

    return objItem;
  }

  //---------------------------------------------------------------------\\  

  /**
	 * @description Abre o arquivo XML e devolve o objeto Delivery construído
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/lerXMLDelivery
   * @return {JSON}
	*/

  api.lerXMLDelivery = async function (req) {
    var path  = `${req.dir}${req.filename}`;    

    if (fs.existsSync(path)) {
      var strXml      = fs.readFileSync(path, 'utf8');
      var xmlDom      = utilsCA.getXmlDom(strXml);
      var objDelivery = api.construirDelivery(xmlDom);
      
    } else  {
      var objDelivery = {};
    }

    objDelivery.filename = req.filename;

    return objDelivery;
  }

  //---------------------------------------------------------------------\\

  /**
	 * @description Constrói o objeto Delivery completo
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/construirDelivery
   * @return {JSON}
	*/

  api.construirDelivery = function (xmlDom) {
    console.log('Construindo Delivery');

    var objDelivery = api.deliveryHeader(xmlDom);

    if (!objDelivery.hasOwnProperty('nrNota')) objDelivery.nrNota = null;
    if (!objDelivery.hasOwnProperty('txInstrucao')) objDelivery.txInstrucao = null;

    objDelivery.item = api.deliveryItem(xmlDom, objDelivery);

    return objDelivery;
  }

  //---------------------------------------------------------------------\\  

  /**
	 * @description Constrói e valida os campos de header da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/deliveryHeader
   * @return {JSON}
	*/

  api.deliveryHeader = function (xmlDom) {
    var dia = tmz.tempoAtual('DD/MM/YYYY');
    var objDelivery = api.validarCampos(xmlDom, 0);

    if (typeof objDelivery.cdDelivery == "string") {
      objDelivery.cdOperacao   = 5; //SYNGENTA
      objDelivery.stEtapa      = 0; //BACKLOG
      objDelivery.snSegregado  = (objDelivery.snSegregado == "Y" ?  "S" : "N");
      objDelivery.snLibRot     = (objDelivery.tpFlag == "TP" ? 1 : 0); 
      objDelivery.dtLancto     = utilsCA.formataDataOracle(dia);       

      if (objDelivery.hasOwnProperty("dtEntrega")) {
        objDelivery.dtEntregaDash = objDelivery.dtEntrega;
        objDelivery.dtEntrega     = utilsCA.formataDataOracle(objDelivery.dtEntrega);
      }

      if (objDelivery.hasOwnProperty("dtDelivery")) { 
        objDelivery.dtDeliveryDash = objDelivery.dtDelivery;      
        objDelivery.dtDelivery     = utilsCA.formataDataOracle(objDelivery.dtDelivery);      
      }

      if ((objDelivery.hasOwnProperty("psBruto")) && (objDelivery.psBruto > 40000))
        objDelivery.dsOcorrencia.push(api.gerarOcorrencia(2, 'psBruto', `Limite de peso ultrapassado: ${objDelivery.psBruto}`));

      //=======================================\\
      // Tipo de função da Delivery

      switch (objDelivery.tpFuncao) {
        case 'CancelReplace':
          objDelivery.stDelivery = 'D';
          objDelivery.dsOcorrencia.push(api.gerarOcorrencia(4, 'stDelivery', 'Cancelamento de Delivery'));  
          break;

        case 'AmendReplace':
          objDelivery.stDelivery = 'R';          
          break;

        case 'Create':
        default:
          objDelivery.stDelivery = 'C';
          break;
      }    

      //=======================================\\

      console.log(`Obtendo Delivery: ${objDelivery.cdDelivery}`);      
    }

    return objDelivery;
  }

  //---------------------------------------------------------------------\\  

 /**
	 * @description Constrói e valida os campos de item da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/deliveryItem
   * @return {array}
	*/

  api.deliveryItem = function (xmlDom, objDelivery) {    

    var arrItem = [];
    var nodes   = utilsCA.getXmlNodes("/Order/orderDetail/orderItem", xmlDom);

    if (nodes.length > 0) {

      for (var n in nodes) {

        var objItem   = {};
        objItem.lote  = [];

        objItem.vrItem = (objDelivery.vrDelivery / nodes.length);

        //==========================================\\
        // Obtendo e validando nodes do item

        var xmlDom  = utilsCA.getXmlDom(nodes[n].toString());
        var objItem = api.validarCampos(xmlDom, 1);

        if (!objItem.hasOwnProperty("nrOnu")) objItem.nrOnu = "0";          

        console.log(`Obtendo Item: ${objItem.nrLineItem}`);

        //==========================================\\
        // lotes

        objItem.lote = api.deliveryLote(xmlDom, objDelivery);

        arrItem.push(objItem);
      }

    } 

    return arrItem;
  }

  //---------------------------------------------------------------------\\  

 /**
	 * @description Constrói e valida os campos de lote da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/deliveryLote
   * @return {array}
	*/

  api.deliveryLote = function (xmlDom, objDelivery) {

    var arrLote = [];
    var nodes   = utilsCA.getXmlNodes("//orderItem/orderItem", xmlDom);

    if (nodes.length > 0) {

      for (var i in nodes) {

        var xmlDom  = utilsCA.getXmlDom(nodes[i].toString());
        var objLote = api.validarCampos(xmlDom, 2);
        
        if ((!objLote.hasOwnProperty("dsLote")) || (objLote.dsLote.length == 0)) objLote.dsLote = "0";
        if ((!objLote.hasOwnProperty("qtProd")) || (objLote.qtProd.length == 0)) objLote.qtProd = 0;

        console.log(`Obtendo Lote: ${objLote.dsLote}`);        

        arrLote.push(objLote);
      }
      
    }

    return arrLote;
  }

  //---------------------------------------------------------------------\\  

 /**
	 * @description Valida e tipifica os campos da Delivery
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/validarCampos
   * @return {JSON}
	*/  

  api.validarCampos = function (xmlDom, tpBusca) {
    var objRef  = {};
    var objTmp  = {};
    var nodes   = [];

    var dsOcorrencia = [];
    var snOcorrencia = false;
    var idOcorrencia = 1;
    var aux;

    var array_busca = api.getArrayDelivery(tpBusca);

    for (var x in array_busca) {
      objRef = array_busca[x];
      nodes = utilsCA.getXmlNodes(objRef.xPath, xmlDom);

      if (nodes.length == 0) {
        snOcorrencia  = true;
        idOcorrencia = 1;

      } else {
        idOcorrencia = 2;
        aux = nodes[0].firstChild.data;

        switch (objRef.tpCampo) {

          case "float":
            aux = aux.replace(/\,/g, "");
            snOcorrencia = isNaN(aux);
            aux = parseFloat(aux);
            break;

          case "number":
            snOcorrencia = isNaN(aux);
            aux = parseInt(aux);
            break;

          case "date":
            aux = utilsCA.formataData(aux);
            snOcorrencia = utilsCA.isDate(aux);
            break;

          default:
            aux = aux.replace(/\s+/g, " "); //ESPAÇOS
            aux = aux.replace(/\t+/g, " "); //TAB
            snOcorrencia = (aux.length == 0);
            break;
        }

        if (!snOcorrencia) objTmp[objRef.nmCampo] = aux;
      }

      if ((snOcorrencia) && (objRef.blMandatorio))
        dsOcorrencia.push(api.gerarOcorrencia(idOcorrencia, objRef.nmCampo, objRef.dsCampo));
    }

    objTmp.dsOcorrencia = dsOcorrencia;

    return objTmp;
  }

  //-----------------------------------------------------------------------\\ 
  
 /**
	 * @description Retorna um objeto com os atributos dos campos a serem importados no XML
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/getArrayDelivery
   * @return {array}
	*/  

  api.getArrayDelivery = function (tpBusca) {
    var array_busca = [];
    var a = [];

    //=======================================\\
    //Delivery Header

    array_busca = [

      {
          xPath:        "//poNumber"
        , tpCampo:      "string"
        , nmCampo:      "cdDelivery"
        , dsCampo:      "Código da Delivery na Syngenta"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'DeliveryPriorityCode']/value"
        , tpCampo:      "number"
        , nmCampo:      "cdPrioridade"
        , dsCampo:      "Código da prioridade da Delivery"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/orderDate[orderDateTypeCode = 'Issue']/orderDateValue"
        , tpCampo:      "date"
        , nmCampo:      "dtDelivery"
        , dsCampo:      "Data da Emissão da Delivery"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'InitialExpectedDelivery']/value"
        , tpCampo:      "date"
        , nmCampo:      "dtEntrega"
        , dsCampo:      "Data final da entrega"
        , blMandatorio: false
      },

      {
          xPath:        "//orderItem/baseItem/reference[type = 'NFNumber']/value"
        , tpCampo:      "number"
        , nmCampo:      "nrNota"
        , dsCampo:      "Número da Nota Fiscal"
        , blMandatorio: false
      },

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'Seller']/reference[type = 'TaxJurisdictionCode']/value"
        , tpCampo:      "string"
        , nmCampo:      "nrIM"
        , dsCampo:      "Número de Inscrição Municipal"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'SegregationIndicator']/value"
        , tpCampo:      "string"
        , nmCampo:      "snSegregado"
        , dsCampo:      "Boolean de segregação"
        , blMandatorio: false
      },

      {
          xPath:        "//orderTerms/reference[type = 'TransportPlanningFlag']/value"
        , tpCampo:      "string"
        , nmCampo:      "tpFlag"
        , dsCampo:      "Transport Planning Flag"
        , blMandatorio: false
      },

      {
          xPath:        "//orderDetail/orderFunctionCode"
        , tpCampo:      "string"
        , nmCampo:      "tpFuncao"
        , dsCampo:      "Tipo de função da Delivery"
        , blMandatorio: true
      },

      //===========================================================\\
      // Remetente

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'Seller']/name"
        , tpCampo:      "string"
        , nmCampo:      "nmRemetente"
        , dsCampo:      "Nome do Remetente"
        , blMandatorio: true
      },

      {
        //xPath:        "//orderTerms/reference[type = 'PlantCompanyCode']/value"
          xPath:        "//orderTerms/reference[type = 'ShippingPoint']/value"
        , tpCampo:      "string"
        , nmCampo:      "cdFilial"
        , dsCampo:      "Código da Filial"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'Division']/value"
        , tpCampo:      "string"
        , nmCampo:      "nrDivisao"
        , dsCampo:      "Divisão"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'OriginalDemandPO']/value"
        , tpCampo:      "string" 
        , nmCampo:      "cdCliExterno"
        , dsCampo:      "Customer PO Number"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'ShippingInstruction1']/value"
        , tpCampo:      "string" 
        , nmCampo:      "txInstrucao"
        , dsCampo:      "Texto de instrução #1"
        , blMandatorio: false
      },

      //===========================================================\\
      // Destinatário

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/contact/department"
        , tpCampo:      "string"
        , nmCampo:      "cdDestinatario"
        , dsCampo:      "Código do Destinatário"
        , blMandatorio: true
      },

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/name"
        , tpCampo:      "string"
        , nmCampo:      "nmDestinatario"
        , dsCampo:      "Nome do Destinatário"
        , blMandatorio: true
      },

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/address/postalCodeNumber"
        , tpCampo:      "string"
        , nmCampo:      "nrCEP"
        , dsCampo:      "CEP do Destinatário"
        , blMandatorio: true
      },

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/address/addressLine1"
        , tpCampo:      "string"
        , nmCampo:      "nmEndDest1"
        , dsCampo:      "End. do Destinatário 1"
        , blMandatorio: true
      },

      {
          xPath:        "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/address/city"
        , tpCampo:      "string"
        , nmCampo:      "nmCidade"
        , dsCampo:      "Cidade do Destinatário"
        , blMandatorio: false
      },

      {
          xPath:        "//orderTerms/reference[type = 'TaxNumber1']/value"
        , tpCampo:      "string"
        , nmCampo:      "nrCNPJ"
        , dsCampo:      "CNPJ do Comprador"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'TaxNumber3']/value"
        , tpCampo:      "string"
        , nmCampo:      "nrIE"
        , dsCampo:      "IE do Comprador"
        , blMandatorio: true
      },         

      //=========================================================================\\
      // Totais

      {
          xPath:        "//orderTerms/reference[type = 'ShippingTypeCode']/value"
        , tpCampo:      "string"
        , nmCampo:      "tpEnvio"
        , dsCampo:      "Tipo do Envio"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'WeightUnit']/value"
        , tpCampo:      "string"
        , nmCampo:      "unPeso"
        , dsCampo:      "Unidade de peso da Delivery"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'NoOfSecondaryPackage']/value"
        , tpCampo:      "number"
        , nmCampo:      "nrEmbalagem"
        , dsCampo:      "Quantidade de embalagens secundárias"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'ValueOfDelivery']/value"
        , tpCampo:      "float"
        , nmCampo:      "vrDelivery"
        , dsCampo:      "Valor Total da Delivery"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'Volume']/value"
        , tpCampo:      "float"
        , nmCampo:      "vrVolume"
        , dsCampo:      "Volume Total da Delivery"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'GrossWeight']/value"
        , tpCampo:      "float"
        , nmCampo:      "psBruto"
        , dsCampo:      "Peso total bruto"
        , blMandatorio: true
      },

      {
          xPath:        "//orderTerms/reference[type = 'NetWeight']/value"
        , tpCampo:      "float"
        , nmCampo:      "psLiquido"
        , dsCampo:      "Peso total líquido"
        , blMandatorio: true
      },

    ];

    a.push(array_busca);

    //=======================================\\
    //item

    array_busca = [

      {
          xPath:        "/orderItem/itemKey"
        , tpCampo:      "number"
        , nmCampo:      "nrLineItem"
        , dsCampo:      "Line item number"
        , blMandatorio: true
      },

      {

        //xPath:        "//baseItem/itemUid"
          xPath:        "//baseItem/itemIdentifier[itemIdentifierTypeCode = 'BuyerNumber']/itemIdentifierValue"
        , tpCampo:      "number"
        , nmCampo:      "cdItem"
        , dsCampo:      "Código externo do item"
        , blMandatorio: true
      },

      {
          xPath:        "//baseItem/reference[type = 'UNCodeADR']/value"
        , tpCampo:      "number"
        , nmCampo:      "nrONU"
        , dsCampo:      "Código ONU do Produto"
        , blMandatorio: false
      },

      {
          xPath:        "//baseItem/reference[type = 'GrossWeight']/value"
        , tpCampo:      "float"
        , nmCampo:      "psItem"
        , dsCampo:      "Peso bruto do item"
        , blMandatorio: true
      },

      {
          xPath:        "//baseItem/reference[type = 'WeightUnit']/value"
        , tpCampo:      "string"
        , nmCampo:      "unPeso"
        , dsCampo:      "Unidade de peso do item"
        , blMandatorio: true
      },

      {
          xPath:        "//baseItem/reference[type = 'Volume']/value"
        , tpCampo:      "float"
        , nmCampo:      "vrVolume"
        , dsCampo:      "Volume do item"
        , blMandatorio: true
      },

      {
          xPath:        "//baseItem/unitOfMeasureCode"
        , tpCampo:      "string"
        , nmCampo:      "unMedida"
        , dsCampo:      "Unidade de medida do item"
        , blMandatorio: true
      },      

      {
          xPath:        "//baseItem/itemIdentifier[itemIdentifierTypeCode = 'ShortDescription']/itemIdentifierValue"
        , tpCampo:      "string"
        , nmCampo:      "dsItem"
        , dsCampo:      "Descrição do item"
        , blMandatorio: true
      },

    ];

    a.push(array_busca);

    //=======================================\\
    //lote

    array_busca = [

      {
          xPath:         "//baseItem/reference[type = 'Batch']/value"
        , tpCampo:       "string"
        , nmCampo:       "dsLote"
        , dsCampo:       "Descrição do Lote"
        , blMandatorio:  false
      },

      {
          xPath:        "//baseItem/quantity"
        , tpCampo:      "number"
        , nmCampo:      "qtProd"
        , dsCampo:      "Quantidade de produtos no Lote"
        , blMandatorio:  true
      },

    ];

    a.push(array_busca);

    //=======================================\\

    return a[tpBusca];
  }  

  //-----------------------------------------------------------------------\\

  /**
	 * @description Retorna um objeto com a ocorrência a ser apresentada
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/gerarOcorrencia
   * @return {JSON}
	*/

  api.gerarOcorrencia = function (idOcorrencia, nmCampo, dsCampo) {
    objOcorrencia = {
        idOcorrencia: idOcorrencia
      , nmCampo:      nmCampo
      , dsCampo:      dsCampo
    };

    return objOcorrencia;
  }

  //-----------------------------------------------------------------------\\  

 /**
	 * @description Verifica se há registro de uma Delivery em processo de importação
	 * @author Rafael Delfino Calzado
	 * @since 05/01/2018
	 *
	 * @async
	 * @function api/buscarImportacao
   * @return {JSON}
   * @throws Em caso de erro, será apresentado no console
	*/

  api.buscarImportacao = async function (req, res, next) {
    await dao.buscarImportacao(req, res, next)
      .then((result) => {
        res.status(200).send(result);
      })

      .catch((err) => {
        console.log(err);
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  api.alterarDataPrevisaoCarga = async function (req, res, next) {
    await dao.alterarDataPrevisaoCarga(req, res, next)
      .then((result) => {
        res.status(200).send(result);
      })

      .catch((err) => {
        console.log(err);
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  }

  //-----------------------------------------------------------------------\\

  return api;

}