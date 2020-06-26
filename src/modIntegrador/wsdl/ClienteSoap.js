var soap = require('soap');
var axios = require("axios");

module.exports = function (app) {

/*   var url = 'https://bravo_qa.cloudneolog.com.br/cockpit-gateway/integration/services/OrderAcquisitionService?wsdl';

  soap.createClient(url, {
    returnFault: true,
    disableCache: true
  }, function (err, client) {
    if (err) throw err;
    console.log(client.describe().OrderAcquisitionService.OrderAcquisitionServiceHttpPort);
    var xml = require('fs').readFileSync('./src/modIntegrador/wsdl/Order.xml', 'utf8');
    var json = require('xml2json').toJson(xml, {object: true});
    console.log(json);
    client.updateOrders(
      json['soapenv:Envelope']['soapenv:Body']['ord:createOrders'],
      function (err, res) {
        if (err) {
          console.log(err.body);
          throw err;
        }
        console.log(res);
      });
  }); */

  var api = {};
  var clienteController = app.src.modIntegrador.controllers.ClienteController;
  var produtoController = app.src.modIntegrador.controllers.ProdutoController;
  //var deliveryController = app.src.modIntegrador.controllers.DeliveryController;
  //var neologController = app.src.modIntegrador.controllers.NeologController;
  var conversorArquivos = app.src.utils.ConversorArquivos;
  /* api.createOrders = async function () {
    //var xml = require('fs').readFileSync('./src/modIntegrador/wsdl/Order.xml', 'utf8');
    var orderAcquisitionService = app.src.modIntegrador.wsdl.OrderAcquisitionService;
    var xml = await orderAcquisitionService.gerarXML();
    var json = '';
    await axios({
      method: 'POST',
      url: 'https://bravo_qa.cloudneolog.com.br/cockpit-gateway/integration/services/OrderAcquisitionService',
      headers: {
        'Content-Type': 'application/xml'
      },
      data: xml
    })
      .then((result) => {
        //console.log('hasil axios', result.data);
        json = require('xml2json').toJson(result.data, { object: true });
        console.log('aaaa',json);
      });
      console.log('bbbb',json);
  }
  api.createOrders(); */

  api.createLocalities = async function (ids) {
    try {
      let objeto = await clienteController.gerarXMLNeolog(ids);
      let json = '';
      if (objeto.array.length > 0) {
        await axios({
          method: 'POST',
          url: process.env.NEOLOG_LOCALITY,
          headers: {
            'Content-Type': 'application/xml'
          },
          data: objeto.xml
        })
          .then((result) => {
            json = require('xml2json').toJson(result.data, { object: true });
          })
          .catch(function (err) {
            err.stack = new Error().stack + `\r\n` + err.stack;
            //console.log(err.response.data);
          });
        //console.log(json['soap:Envelope']['soap:Body']['ns1:createLocalitiesResponse']['ns1:result']);
        if (json['soap:Envelope']['soap:Body']['ns1:createLocalitiesResponse']['ns1:result']['success']['$t'] == "true") {
          let arId = [];
          for (key in objeto.array) {
            arId.push(objeto.array[key].IDG005);
          }
          let save = await clienteController.marcarEnvioNeolog(arId.join());
        }
      }
      console.log('aqui', json);
      return json;
    } catch(err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
    }
  }
  //api.createLocalities();

  api.updateProducts = async function (ids) {
    try {
      //console.log('aqui');
      let objeto = await produtoController.gerarXMLNeolog(ids);
      let json = '';
      if (objeto.array.length > 0) {
        await axios({
          method: 'POST',
          url: process.env.NEOLOG_PRODUCT,
          headers: {
            'Content-Type': 'application/xml'
          },
          data: objeto.xml
        })
          .then((result) => {
            json = require('xml2json').toJson(result.data, { object: true });
          })
          .catch(function (err) {
            err.stack = new Error().stack + `\r\n` + err.stack;
            //console.log(err.response.data);
        });
      //console.log(json['soap:Envelope']['soap:Body']['ns1:updateProductsResponse']['ns1:result']['success']['$t']);
        if (json['soap:Envelope']['soap:Body']['ns1:updateProductsResponse']['ns1:result']['success']['$t'] == "true") {
          let arId = [];
          for (key in objeto.array) {
            arId.push(objeto.array[key].IDG010);
          }
          let save = await produtoController.marcarEnvioNeolog(arId.join());
        }
      }
      console.log('aqui', json);
      return json;
    } catch(err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
    }
  }
  //api.updateProducts();

  api.createOrders = async function (ids) {
    try {
      //console.log('aqui');
      //let ids = [123, 456];
      let objeto = await neologController.listarXMLNeolog(ids);
      let json = '';
      if (objeto.array.length > 0) {
        
        let caminho = process.cwd() + '/src/modIntegrador/wsdl/xmlOrder/';
        var moment = require('moment');
        moment.locale('pt-BR');

        for (key in objeto.array) {

          // Código usado para gravar o XML que vem da Neolog.
          moment().format("DD/MM/YYYY HH:mm:ss");
          let nomeArquivo = caminho + moment().format("DD_MM_YYYY_HH_mm_ss") + "_" + objeto.array[key].tableId + ".xml";
          await conversorArquivos.salvarArquivo(nomeArquivo, objeto.xml[key]);

          await axios({
            method: 'POST',
            url: process.env.NEOLOG_ORDER,
            headers: {
              'Content-Type': 'application/xml'
            },
            data: objeto.xml[key]
          })
            .then((result) => {
              json = require('xml2json').toJson(result.data, { object: true });
            })
            .catch(function (err) {
              err.stack = new Error().stack + `\r\n` + err.stack;
              //console.log(err.response.data);
            });
          //console.log(json['soap:Envelope']['soap:Body']['ns1:createOrdersResponse']['ns1:result']['success']['$t']);
          if (json['soap:Envelope']['soap:Body']['ns1:createOrdersResponse']['ns1:result']['success']['$t'] == "true") {
            let arId = [];
            arId.push(objeto.array[key].tableId);
            let save = await neologController.marcarEnvioNeolog(arId.join());
          }
        }
      }
      console.log('aqui', json);
      return json;
    } catch(err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
    }
  }
  //api.createOrders([100064]);

  api.enviarTudoNeolog = async function (req, res, next) {
    let objResult = await deliveryController.listarLocProDelivery(req, res, next);

    console.log('Localidade Iniciado!');
    await api.createLocalities( Array.from(new Set((objResult[0].IDG005RE+','+objResult[0].IDG005DE).split(','))) );
    console.log('Localidade Finalizado!');

    console.log('Produto Iniciado!');
    await api.updateProducts(objResult[0].IDG010.split(','));
    console.log('Produto Finalizado!');
    
    if (typeof(req.body.ids) === 'string') {
      req.body.ids = [req.body.ids];
    }

    console.log('Pedido Iniciado!');
    await api.createOrders(req.body.ids);
    console.log('Pedido Finalizado!');

    res.json(true);

  };

  return api;
}