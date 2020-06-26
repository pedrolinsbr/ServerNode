
let db = require(process.cwd() + '/config/database');
let promise = require('promise');
let axios = require("axios");

module.exports = function (app) {

  let api = {};

  let diretorio = app.src.utils.Diretorio;
  let conversorArquivos = app.src.utils.ConversorArquivos;



  api.processarXML = async function (occurrence) {
    

    let o2x = require('object-to-xml');
    //console.log('chegou');
    console.log(o2x(occurrence));
    
     let caminho = process.cwd() + '/src/modIntegrador/wsdl/xmlOccurrence/';
    // Código usado para gravar o XML que vem da Neolog.
    let moment = require('moment');
    moment.locale('pt-BR');
    moment().format("DD/MM/YYYY HH:mm:ss");
    let nomeArquivo = caminho + moment().format("DD_MM_YYYY_HH_mm_ss") + "_" + occurrence.monitorableCode + ".xml";
    let xml = 
    `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
      <SOAP-ENV:Header/>
      <SOAP-ENV:Body>
        <ns2:publishOccurrence xmlns:ns2="http://www.neolog.com.br/cpl/publish/monitoring/occurrence/" xmlns:ns3="http://www.neolog.com.br/cpl/publish/monitoring/transition/">`
        + o2x(occurrence) +
    `   </ns2:publishOccurrence>
      </SOAP-ENV:Body>
    </SOAP-ENV:Envelope>`;
    await conversorArquivos.salvarArquivo(nomeArquivo, xml);
    
    // Código usado para ler a pasta com os XML das cargas.
    /* let result = await diretorio.listFiles(caminho);
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


      
      
    console.log('Terminou');
    return true;
  };

  //api.processarXMLOtimizador(null);
  return api;
};