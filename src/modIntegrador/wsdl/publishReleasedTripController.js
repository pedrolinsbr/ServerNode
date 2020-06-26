
var db = require(process.cwd() + '/config/database');
var promise = require('promise');
var axios = require("axios");

module.exports = function (app) {

  var api = {};

  //var tipoVeiculoController = app.src.modIntegrador.controllers.TipoVeiculoController;
  //var cargaController = app.src.modOferecimento.controllers.CargaController;
  //var etapasCargasController = app.src.modOferecimento.controllers.EtapasCargasController;
  var diretorio = app.src.utils.Diretorio;
  var conversorArquivos = app.src.utils.ConversorArquivos;

  api.UnblockCarga = async function (carga) {
    try {
      let xml = ``;
      let json = '';
      let viagem = carga.identifier;
      let messageId = carga.messageId;
      // Aqui esta pegando apenas 1 carga porque usamos apenas 1 para 1.
      if (carga.loads.load[0] != undefined) {
        carga = carga.loads.load[0];
      } else {
        carga = carga.loads.load;
      }

      carga = carga.stops;

      for (key in carga.stop) {
        let g048 = {};
        let subStop = null;
        let shipmentUnits = [];
        // Se for o número 1 eu ignoro porque aqui sempre vai ser o armazém.
        if (carga.stop[key].sequenceOnLoad == 1) {
          if (carga.stop[key].subStops.subStop.length != undefined) {
            subStop = carga.stop[key].subStops.subStop[0];
          } else {
            subStop = carga.stop[key].subStops.subStop;
          }
          let deliverys = subStop.loadedShipmentUnits.shipmentUnit;
          if (deliverys[0] == undefined) {
            deliverys = [];
            deliverys.push(subStop.loadedShipmentUnits.shipmentUnit);
          }
          for (x in deliverys) {
            let deliveryUnit = undefined;
            if (deliverys[x].deliveryUnitList.deliveryUnit.length == undefined) {
              deliveryUnit = [deliverys[x].deliveryUnitList.deliveryUnit];
            } else {
              deliveryUnit = deliverys[x].deliveryUnitList.deliveryUnit;
            }
            for (y in deliveryUnit) {
              xml = xml +
                `<trip:tripReleaseResponse>
                <trip:attributes>
                  <trip:attribute>
                      <trip:name>tripTransportDocument</trip:name>
                      <trip:value>QA_DTTRIP_0001</trip:value>
                  </trip:attribute>
                </trip:attributes>
                <trip:itemId>`+ deliveryUnit[y].orderItemSourceId + `</trip:itemId>
                <trip:msg>Desbloqueio Aprovado</trip:msg>
                <trip:orderSourceId>`+ deliveryUnit[y].orderSourceId + `</trip:orderSourceId>
                <trip:regionSourceId>DEFAULT</trip:regionSourceId>
                <trip:status>1</trip:status>
                <trip:tripCode>`+ viagem + `</trip:tripCode>
            </trip:tripReleaseResponse>`;
            }  
        }
          break;
        }
      }  

    xml =
      `<soapenv:Envelope xmlns:trip1="http://www.neolog.com.br/cpl/acquisition/tripLoadsSourceId/" xmlns:trip="http://www.neolog.com.br/cpl/acquisition/tripReleaseResponse/" xmlns:ord2="http://www.neolog.com.br/cpl/acquisition/orderBreakResponse/" xmlns:ord1="http://www.neolog.com.br/cpl/acquisition/orderBreakId/" xmlns:ord="http://www.neolog.com.br/cpl/acquisition/orderBreakRemovalRequest/" xmlns:erp="http://www.neolog.com.br/cpl/acquisition/eRPMessageResponse/" xmlns:unb="http://www.neolog.com.br/cpl/acquisition/unblockRelTrip/" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
        <soapenv:Header/>
        <soapenv:Body>
          <unb:doUnblockReleasedTrip>
              <unb:unblockReleasedTrips>
                <unb:unblockReleasedTrips>
                    <unb:unblockReleasedTrip>
                      <unb:ERPMessageResponses>
                          <erp:eRPMessageResponseList>
                            <erp:ERPMessageResponses>
                                <erp:eRPMessageResponse>
                                  <erp:msg>Liberação Aprovada</erp:msg>
                                </erp:eRPMessageResponse>
                            </erp:ERPMessageResponses>
                          </erp:eRPMessageResponseList>
                      </unb:ERPMessageResponses>
                      <unb:identifier>`+messageId+`</unb:identifier>
                      <unb:regionSourceId>DEFAULT</unb:regionSourceId>
                      <unb:tripReleaseResponses>
                          <trip:tripReleaseResponseList>
                            <trip:tripReleaseResponses>
                              `+xml+`
                            </trip:tripReleaseResponses>
                      </trip:tripReleaseResponseList>
                    </unb:tripReleaseResponses>
                  </unb:unblockReleasedTrip>
                </unb:unblockReleasedTrips>
              </unb:unblockReleasedTrips>
          </unb:doUnblockReleasedTrip>
        </soapenv:Body>
      </soapenv:Envelope>`;
      //console.log(xml);
      
      // Código usado para gravar o XML.
      var moment = require('moment');
      moment.locale('pt-BR');
      moment().format("DD/MM/YYYY HH:mm:ss");
      let caminho = process.cwd() + '/src/modIntegrador/wsdl/xmlDesbloqueio/';
      let nomeArquivo = caminho + moment().format("DD_MM_YYYY_HH_mm_ss") + "_" + viagem + ".xml";
      await conversorArquivos.salvarArquivo(nomeArquivo, xml);

      await axios({
        method: 'POST',
        url: process.env.NEOLOG_UNBLOCK,
        headers: {
          'Content-Type': 'application/xml'
        },
        data: xml
      })
        .then((result) => {
          json = require('xml2json').toJson(result.data, { object: true });
        })
        .catch(function (err) {
          err.stack = new Error().stack + `\r\n` + err.stack;
      });
      //console.log(json['soap:Envelope']['soap:Body']['ns1:updateProductsResponse']['ns1:result']['success']['$t']);
      console.log('UnblockCarga: ', json);
      return json;
    } catch(err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
    } 
  }

  api.processarXMLOtimizador = async function (carga, otimizador = true) {
    

    var o2x = require('object-to-xml');
    //console.log('chegou');
    //console.log(o2x(carga));
    let returnCarga = [];
    let caminho = process.cwd() + '/src/modIntegrador/wsdl/xmlCarga/';
    if (otimizador) {
      // Código usado para gravar o XML que vem da Neolog.
      var moment = require('moment');
      moment.locale('pt-BR');
      moment().format("DD/MM/YYYY HH:mm:ss");
      let nomeArquivo = caminho + moment().format("DD_MM_YYYY_HH_mm_ss") + "_" + carga.tripReleaseRequests.tripReleaseRequest[0].identifier + ".xml";
      let xml =
        `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <soap:Body>
        <ns2:publishReleasedTrip xmlns:ns2="urn:neolog:cockpit:TripReleaseRequestPublishingService">`
        + o2x(carga) +
        `   </ns2:publishReleasedTrip>
      </soap:Body>
    </soap:Envelope>`;
      await conversorArquivos.salvarArquivo(nomeArquivo, xml);
    } 
    
    // Código usado para ler a pasta com os XML das cargas.
    /* let result = diretorio.listFiles(caminho);
    var parser = require('xml2json');
    for (x in result) {
      console.log('Nome do arquivo: ', result[x].filename);
      let xml = conversorArquivos.lerArquivo(caminho + result[x].filename);
      var json = parser.toJson(xml, {
        object: true,
        reversible: false,
        coerce: false,
        sanitize: true,
        trim: true,
        arrayNotation: false,
        alternateTextNode: false
      });
      carga = json['soap:Envelope']['soap:Body']['ns2:publishReleasedTrip']; */


      
      let cargas = [];
      let messageId = carga.messageId;
      if (carga.tripReleaseRequests.tripReleaseRequest[0] != undefined) {
        cargas = carga.tripReleaseRequests.tripReleaseRequest;
      } else {
        cargas.push(carga.tripReleaseRequests.tripReleaseRequest);
      }
      for (y in cargas) {
        let obCarga = {};
        obCarga.G048 = [];
        carga = cargas[y];
        obCarga.dscarga = (carga.identifier != 'null' ? 'Viagem ' + carga.identifier : carga.nameViagem);
        obCarga.cdviaoti = carga.identifier;
        obCarga.dstipvei = carga.vehicleId;
      
        // Aqui esta pegando apenas 1 carga porque usamos apenas 1 para 1.
        if (carga.loads.load[0] != undefined) {
          carga = carga.loads.load[0];
        } else {
          carga = carga.loads.load;
        }
        obCarga.tpcarga = carga.loadMode;
        obCarga.qtdisper = parseFloat(carga.distance).toFixed(0);
        obCarga.dtcarga = new Date();//carga.dispatchLimitTime;
        obCarga.stintcli = 0;

        carga = carga.stops;
      
        obCarga.qtvolcar = 0;
        obCarga.vrcarga = 0;
        obCarga.pscarga = 0;
        obCarga.qtg043 = 0;
            
        for (key in carga.stop) {
          let g048 = {};
          let subStop = null;
          let shipmentUnits = [];
          // Se for o número 1 eu ignoro porque aqui sempre vai ser o armazém.
          if (carga.stop[key].subStops.subStop[0] == undefined && carga.stop[key].subStops.subStop.loadedShipmentUnits != undefined) {
            continue;
          } else if (carga.stop[key].subStops.subStop[0] != undefined && carga.stop[key].subStops.subStop[0].loadedShipmentUnits != undefined) {
            continue;
          }
          if (carga.stop[key].subStops.subStop[0] != undefined) {
            subStop = carga.stop[key].subStops.subStop[0];
          } else {
            subStop = carga.stop[key].subStops.subStop;
          }
          if (subStop.unloadedShipmentUnits.shipmentUnit[0]/* .deliveryUnitList.deliveryUnit[0] */ != undefined) {
            shipmentUnits = subStop.unloadedShipmentUnits.shipmentUnit/* [0].deliveryUnitList.deliveryUnit */;
          } else {
            shipmentUnits.push(subStop.unloadedShipmentUnits.shipmentUnit)/* [0].deliveryUnitList.deliveryUnit */;
          }
          g048.nrseqeta = parseFloat(carga.stop[key].sequenceOnLoad) - 1;
        
          g048.qtdisper = parseFloat(obCarga.qtdisper / (carga.stop.length -1)).toFixed(0);
          g048.idg005or = parseInt(carga.stop[key-1].localitySourceId.replace("EVO", ""));
          g048.idg005de = parseInt(carga.stop[key].localitySourceId.replace("EVO", ""));//(carga.stop[key+1] != undefined ? parseInt(carga.stop[key+1].localitySourceId.replace("EVO", "")) : parseInt(carga.stop[0].localitySourceId.replace("EVO", "")));
          g048.dtinieta = subStop.arrivalTime;
          g048.dtfineta = subStop.departureTime;

          g048.idg043 = [];
          g048.psdeleta = 0;
          for (z in shipmentUnits) {
            
            let shipmentUnit = shipmentUnits[z];
            let deliveryUnits = [];
            if (shipmentUnit.deliveryUnitList.deliveryUnit[0] != undefined) {
              deliveryUnits = shipmentUnit.deliveryUnitList.deliveryUnit;
            } else {
              deliveryUnits.push(shipmentUnit.deliveryUnitList.deliveryUnit);
            }
            for (w in deliveryUnits) {
              let deliveryUnit = deliveryUnits[w];
              g048.idg043.push(parseInt(deliveryUnit.orderSourceId.split("_")[0]));
              //obCarga.vrcarga = obCarga.vrcarga + parseFloat(deliveryUnit.price);
            }
          
            g048.psdeleta = g048.psdeleta + parseFloat(shipmentUnit.weight);
            obCarga.qtvolcar = obCarga.qtvolcar + parseFloat(shipmentUnit.volume);
            g048.qtvolcar = parseFloat(shipmentUnit.volume);
            obCarga.pscarga = obCarga.pscarga + parseFloat(shipmentUnit.weight); // 10000;//obCarga.qtvolcar + 
          
          }
          
          let vrCargaBd = null;
          await cargaController.getValorPrecoCarga(g048.idg043.join(','))
            .then((result0) => {
              vrCargaBd = result0[0];
              console.log('vrCargaBd', result0);
            });
          obCarga.vrcarga = obCarga.vrcarga + parseFloat(vrCargaBd.VRCARGA);
          obCarga.dtlanmin = vrCargaBd.DTLANMIN;
          obCarga.qtg043 = obCarga.qtg043 + vrCargaBd.QTG043;

          // Tirando duplicidade do Array
          g048.idg043 = [...new Set(g048.idg043)];
          obCarga.G048.push(g048);
          g048 = {};
        }

        if (obCarga.qtg043 > 0) {
          let arCarga = null;
          await cargaController.getCarga(obCarga.cdviaoti)
            .then((result0) => {
              arCarga = result0;
              console.log(result0);
              cargas[y].messageId = messageId;
              if (otimizador) {
                api.UnblockCarga(cargas[y]);
              }  
            });
        if (arCarga.length == 0) {
          await tipoVeiculoController.buscarVeiculoPorPeso(obCarga)
            .then((result) => {
              console.log('chegou 1');
              //console.log(result);
              if (result != undefined) {
                obCarga.idg030 = result.IDG030;
                obCarga.vrporocu = (obCarga.pscarga * 100) / result.QTCAPPES;
              } else {
                obCarga.idg030 = null;
                obCarga.vrporocu = null;
              }
            });
          await cargaController.salvarNeolog(obCarga)
            .then((result2) => {
              console.log('chegou 2');
              obCarga.idg046 = result2;
            });
          await etapasCargasController.salvarNeolog(obCarga)
            .then((result3) => {
              console.log('chegou 3');
              if (result3) {
                obCarga.sncarpar = 'N';
              } else {
                obCarga.sncarpar = 'S';
              }
            });
          await cargaController.salvarNeologSN(obCarga)
            .then((result4) => {
              console.log('chegou 4');
              //console.log(result3);
              //callback({ result: true });
            });
          }
        
          returnCarga.push(obCarga);
      }
      } 
    //}
    if (otimizador) {
      console.log('Terminou');
      return true;
    } else {
      console.log('Terminou >>>', returnCarga);
      return returnCarga;
    }

  };

  //api.processarXMLOtimizador(null);
  return api;
};