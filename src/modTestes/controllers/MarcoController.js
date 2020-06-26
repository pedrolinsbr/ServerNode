module.exports = function (app, cb) {

  var api = {};
  const idao = app.src.modTestes.dao.importDAO;

  const soapRequest = require('easy-soap-request');
  var soap = require('soap');
  const fs = require('fs');

  api.marcoOracle = async function (req, res, next) {
    const oracledb4 = require('oracledb');
    try {
      if (req.query.function != undefined && req.query.param != undefined) {
        res.status(200).send('<pre>' + JSON.stringify(oracledb4[req.query.function]()[req.query.param], undefined, 2) + '</pre>');
      } else if (req.query.function != undefined) {
        //let pool = await oracledb4[req.query.function]();
        //let teste = await pool.getConnection();
        //await teste.close();
        //await pool.close();
        res.status(200).send('<pre>' + JSON.stringify(oracledb4[req.query.function](), undefined, 2) + '</pre>');
      } else if(req.query.param != undefined) {
        res.status(200).send('<pre>' + JSON.stringify(oracledb4[req.query.param], undefined, 2) + '</pre>');
      } else {
        res.status(200).send('<pre>' + JSON.stringify(oracledb4, undefined, 2) + '</pre>');
      }
    } catch (err) {
      res.status(200).send( '<pre>' + err.message + '</pre>' );
    }
  }

  api.importarFrete = async function (req, res, next) {

    try {

        var objResult = await idao.importarFrete(req, res , next);

        res.status(200).send(objResult);

    } catch (err) {

        res.status(500).send(err);

    }

  }

  api.soap = async function () {

    // example data
    const url = "https://www.roadcard.com.br/sistemapamcardwsdlp/WSTransacional-wsdl.xml?WSDL";
    let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservice.pamcard.jee.pamcary.com.br">
    <soapenv:Header/>
    <soapenv:Body>
       <web:execute>
          <!--Optional:-->
          <arg0>
       <context>FindCard</context>
       <fields>
         <key>viagem.contratante.documento.numero</key>
         <value>12815827000132</value>
       </fields>
       <fields>
         <key>viagem.cartao.numero</key>
         <value>4417819800000859</value>
       </fields>
     </arg0>
       </web:execute>
    </soapenv:Body>
 </soapenv:Envelope>`;
    var authSyn = "Basic " + Buffer.from(process.env.SAP_SYN_USER + ":" + process.env.SAP_SYN_PASS).toString("base64");
    const wsdl_headers = {
      //'user-agent': 'sampleTest',
      'Content-Type': 'text/xml;charset=UTF-8',
      //'soapAction': 'invokeAsync',
      //'Authorization': authSyn
    };

     await soapRequest({ url: url, headers: wsdl_headers, xml: xml, timeout: 5000}).then(result => {
      console.log(`CERTO`); //response success
      fs.writeFileSync(`teste.json`, result.response.body);
      //console.log(result);
      
     }).catch(e=>{
       console.log(e); // response error
       //fs.writeFileSync(`${process.env.FOLDER_WHMS}logs/PGR-${args.CDDELIVE}-${tmz.tempoAtual('YYYYMMDDHHmmss')}.txt`,e);
     
     })
    
  }
  //api.soap();
  
  api.soap2 = async function () {
    var url = 'https://www.roadcard.com.br/sistemapamcardwsdlp/WSTransacional-wsdl.xml?WSDL';

  soap.createClient(url ,{
    returnFault: true,
    disableCache: true
  }, function (err, client) {
    if (err) throw err;
    //console.log(client.describe().OrderAcquisitionService.OrderAcquisitionServiceHttpPort);
    var xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://webservice.pamcard.jee.pamcary.com.br">
    <soapenv:Header/>
    <soapenv:Body>
       <web:execute>
          <!--Optional:-->
          <arg0>
             <context>FindCard</context>
       <fields>
         <key>viagem.contratante.documento.numero</key>
         <value>12815827000132</value>
       </fields>
       <fields>
         <key>viagem.cartao.numero</key>
         <value>4417819800000859</value>
       </fields>
          </arg0>
       </web:execute>
    </soapenv:Body>
 </soapenv:Envelope>`;
    var json = require('xml2json').toJson(xml, {object: true});
    console.log(json);
    client.execute(
      json['soapenv:Envelope']['soapenv:Body']['web:execute'],
      function (err, res) {
        if (err) {
          console.log(err.body);
          throw err;
        }
        console.log(res);
      });
  });
  }
  //api.soap2();


  return api;
}