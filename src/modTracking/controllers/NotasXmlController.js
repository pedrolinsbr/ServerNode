var parser = require('jstoxml');
module.exports = function (app, cb) {
    
  var api = {};
  var dao = app.src.modTracking.dao.NotasXmlDAO;
  var utils = app.src.utils.ConversorArquivos;
  var log = app.config.logger;
  var moment = require('moment');
  var fs = require('fs');
  
  

//---------------------------------------------------------------//
  api.listarNotasXml = async function (req, res, next) {
    console.log("Controller :: Listar notas XML");
    var rs = await dao.listarNotasXml(req);

    log.info(`Iniciando QM Notification.`);
    // console.log(rs);
    var re = await api.gerarNotasXml()
      .then((result) => {
        
        // console.log(result);
        if (result == null || result == undefined) {
          log.info(`Erro ao gerar XML QM notification.`);
          console.log("result  == null or undefined");
          return result;
        }else{
          log.info(`Sucesso ao gerar QM notification`);
          var xml = parser.toXML(result, { header: '<?xml version="1.0" encoding="iso-8859-1"?>' });
          fs.appendFile('src/modTracking/notasxml/NOTAS_BRAVO-' + moment() + ".xml", xml, (err) => {
            if (err) throw err;
            console.log('Arquivo salvo!');
          });
          return xml;
        }
        // return result;
      })

      .catch((err) => {
        console.log(err);
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
   
    res.json(rs);
  }

  
//---------------------------------------------------------------//
//---------------------------------------------------------------//



  api.listarNotasJsonXml = async function (req,res,next) {
    console.log("Controller :: Listar notas XML");
    // COLOCAR ITEM DE PARAMETRO
    var re = await api.gerarNotasXml()
      .then((result) => {
        console.log(result);
        if (result == null || result == undefined) {
          console.log("result  == null or undefined");
          return result;
        } else {
          var xml = parser.toXML(result, { header: '<?xml version="1.0" encoding="iso-8859-1"?>' });
          fs.appendFile('../xml/qmnotification/local/ATLANTIS_IST-'+ moment()+".xml", xml, (err) => {
            if (err) throw err;
            console.log('Arquivo salvo! Bravo Log');
          });
          var xml = parser.toXML(result, { header: '<?xml version="1.0" encoding="iso-8859-1"?>' });
          fs.appendFile('../xml/qmnotification/ftp/ATLANTIS_IST.xml', xml, (err) => {
            if (err) throw err;
            console.log('Arquivo salvo! :: QM Notification');
          });
          var ftpVar =  api.putFiles();
        
          return xml;
        }
      
        return result;
      })

      .catch((err) => {
        console.log(err);
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });

    if(req){
      res.json(re);
      return re;
    }
    
  }

//---------------------------------------------------------------//


api.gerarNotasXml = async function () {
  console.log("Controller :: Gerar Notas XML");
  
  var rows = await dao.listarNotasXmlOrdenado(90,120);
  var origem = new Array();


  var data, hora;
  data = moment().format('DD-MM-YYYY');
  hora = moment().format('HH:mm');

  dataNm = moment().format('YYYY-MM-DD');
  horaNm = moment().format('HH:mm');

  data = data.replace(/\-/g, "/");
  hora = hora.replace(/\:/g, ":");

  dataNm = dataNm.replace(/\-/g, "");
  horaNm = horaNm.replace(/\:/g, "");

  // objDados.transportadora = `${data} ${hora}`;


  for (let i = 0; i < rows.length; i++) {   
    var notafiscalContent = new Array();                                // FOR ITERAÇÃO PARA CADA REGISTRO
    if (origem.length == 0) {                                                 // SE O ARRAY DE ORIGEM ESTÁ VAZIO 
                                          
      origem.push({                                                            
        _name:"origem",
        _attrs:{
          cnpj: String(rows[i].CNPJ)
        },
        _content: notafiscalContent
      });

      var local;
      // console.log(origem[origem.length - 1]);
      var entregaFinal;
      if (origem[origem.length - 1]._content.length == 0) {
        
        if (rows[i].DTENTREG != null) {
          entregaFinal = rows[i].DTENTREG;
          local = "ENTREGASYN";
        } else if (rows[i].DTSAICAR != null) {
          entregaFinal = '';
          local = "ENTREGUESYN";
        } else {
          entregaFinal = '';
          local = "PATIO";
        }  
        
        if (rows[i].DATA_ENTREGA != null) {
          // console.log("\t \t rows[i].DATA_ENTREGA != null");
          var dataEntrega = rows[i].DATA_ENTREGA;
        } else if (rows[i].ENTREGA_CONTRATUAL != null){
          // console.log("\t \t rows[i].DTENTREG != null");
          // console.log(rows[i].DTENTREG);
          var dataEntrega = rows[i].ENTREGA_CONTRATUAL;
        }else{
          // console.log("\t \t NULL");
          // console.log(rows[i].DATA_ENTREGA);
          // console.log(rows[i].ENTREGA_CONTRATUAL);
          var dataEntrega = "MISSING DATABASE DATA";
        }
        notafiscalContent = new Array();   
        notafiscalContent = {
          _name:"notafiscal",
          _attrs:{
            numero: rows[i].NRNOTA,
            dataprevisaoentrega: dataEntrega,
            dataentrega: entregaFinal,
            localizacao: local
          }
        };

        origem[origem.length - 1]._content.push(notafiscalContent);
      }else{
        //
      }
    }else{
      
      if (origem[origem.length - 1]._attrs.cnpj == rows[i].CNPJ) {
        
        if (rows[i].DTENTREG != null) {
          entregaFinal = rows[i].DTENTREG;
          local = "ENTREGASYN";
        } else if (rows[i].DTSAICAR != null) {
          entregaFinal = '';
          local = "ENTREGUESYN";
        } else {
          entregaFinal = '';
          local = "PATIO";
        } 

        if (rows[i].DATA_ENTREGA != null) {
          // console.log("\t \t rows[i].DATA_ENTREGA != null");
          var dataEntrega = rows[i].DATA_ENTREGA;
        } else if (rows[i].ENTREGA_CONTRATUAL != null) {
          // console.log("\t \t rows[i].DTENTREG != null");
          // console.log(rows[i].DTENTREG);
          var dataEntrega = rows[i].ENTREGA_CONTRATUAL;
        } else {
          // console.log("\t \t NULL");
          // console.log(rows[i].DATA_ENTREGA);
          // console.log(rows[i].ENTREGA_CONTRATUAL);
          var dataEntrega = "MISSING DATABASE DATA";
        }
        
        notafiscalContent = new Array();
        notafiscalContent = {
          _name: "notafiscal",
          _attrs: {
            numero: rows[i].NRNOTA,
            dataprevisaoentrega: dataEntrega,
            dataentrega: entregaFinal,
            localizacao: local
          }
        };

        origem[origem.length - 1]._content.push(notafiscalContent);    
      }else{
        origem.push({
          _name: "origem",
          _attrs: {
            cnpj: String(rows[i].CNPJ)
          },
          _content: notafiscalContent
        });
        

        var local;
        if (origem[origem.length - 1]._content.length == 0) {
          // if (rows[i].CNPJ == '60744463005582') {
          //   console.log("nr atual" + origem[origem.length - 1]._attrs.cnpj);
          //   console.log("nr cnpj" + rows[i].CNPJ);
          //   console.log("nr nota" + rows[i].NRNOTA);
          //   console.log("data entrega" + entregaFinal);
          //   console.log("data previsao entrega" + dataEntrega);
          //   console.log("local" + local);
          // }

          if (rows[i].DTENTREG != null) {
            entregaFinal = rows[i].DTENTREG;
            local = "ENTREGASYN";
          } else if (rows[i].DTSAICAR != null) {
            entregaFinal = '';
            local = "ENTREGUESYN";
          } else {
            entregaFinal = '';
            local = "PATIO";
          } 

          if (rows[i].DATA_ENTREGA != null) {
            // console.log("\t \t rows[i].DATA_ENTREGA != null");
            var dataEntrega = rows[i].DATA_ENTREGA;
          } else if (rows[i].ENTREGA_CONTRATUAL != null) {
            // console.log("\t \t rows[i].DTENTREG != null");
            // console.log(rows[i].DTENTREG);
            var dataEntrega = rows[i].ENTREGA_CONTRATUAL;
          } else {
            // console.log("\t \t NULL");
            // console.log(rows[i].DATA_ENTREGA);
            // console.log(rows[i].ENTREGA_CONTRATUAL);
            var dataEntrega = "MISSING DATABASE DATA";
          }

          notafiscalContent = new Array();
          notafiscalContent = {
            _name: "notafiscal",
            _attrs: {
              numero: rows[i].NRNOTA,
              dataprevisaoentrega: dataEntrega,
              dataentrega: entregaFinal,
              localizacao: local
            }
          };

          origem[origem.length - 1]._content.push(notafiscalContent); 
        } else {
          //
        }
      }
    }    
  }

  return {
    _name:"transportadora",
    _attrs: {
      dthratualizacao: `${data} ${hora}`
    },
    _content:{
      _name:"notasfiscais",
      _content : origem
    }
  };
};


api.templateNotasXml = function (objDados){
  
      function xmlHeader(objDados) {
        let xml_header = `
        <?xml version="1.0" encoding="iso-8859-1"?>
        <Transportadora="${objDados.transportadora}">
        <NotasFiscais>
        <Origem cnpj="${objDados.CJCLIENT}"/>
                `
      
          return xml_header;
        }
  
      function xmlItens(objDados) {
        var xml_itens =`
        <notafiscal numero="${objDados.NRNOTA}"/>
        <dataprevisaoentrega="${objDados.DTPREATU}"/>
        <dataentrega="${objDados.DTENTREG}"/>
        <localizacao="${objDados.localizacao}"/>
          `;
  
        return xml_itens;

      }    
  
      // function xmlFooter(objDados) {
      //   var xml_footer =
      // ``
      //     return xml_footer;
      // }
  
      var xml = '';
      xml += xmlHeader(objDados);
  
      for (var i in objDados.item)
        xml += xmlItens(objDados.item[i]);  
         
        // // xml += xmlFooter(objDados);

      fs.appendFile('src/modTracking/notasxml/'+objDados.fileName, xml, (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
      //fs.appendFile('src/xml/upload/'+objDados.fileName, xml, (err) => {
      fs.appendFile(process.env.FOLDER_UPLOAD+objDados.fileName, xml, (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
      return xml;
    }
    
    //-----------------------------------------------------------------------\\
    api.putFiles = async function (req, res, next) {
      const Client = require('ssh2-sftp-client');
      const fs = require('fs');

      const strRemoteDir = '/syngenta/out/';
      const strLocalDir = '../xml/';

      const strPutDir = strRemoteDir;

      const strUpDir 		= `${strLocalDir}qmnotification/ftp/`;
      
      var keyFile = fs.readFileSync('../key/id_rsa');	

      const objConn = {
        host: '200.170.131.74',    // ip para acesso externo
        port: '20789',               // porta para acesso externo
        // host:'192.10.10.200',
        // port:'22',
        username: 'sftp.syngenta',
        password: '4rUPr@Fu'
        // privateKey: keyFile,
        
        // algorithms: {		
        //   kex: ['diffie-hellman-group1-sha1'],
        //   serverHostKey: ['ssh-dss'],		
        //   cipher: ['aes256-ctr']
        // }		
      }

      var sftp = new Client();
  

      console.log('Enviando arquivos para o SFTP');
  
      return await sftp.connect(objConn).then(async (result) => {
  
        var files = [];
  
        fs.readdirSync(strUpDir).forEach(file => { files.push(file) });
  
        for (var i in files) {
          var strLocalFile = `${strUpDir}${files[i]}`;
          var strRemoteFile = `${strPutDir}${files[i]}`;
          console.log(`Subindo ${strLocalFile}`);
  
          await sftp.put(strLocalFile, strRemoteFile).then(async () => {
            console.log(`Salvando ${strRemoteFile}`);
  
            await fs.unlink(strLocalFile, (err) => {
              if (err) console.log(err, `Erro ao remover ${strLocalFile}`);
              else console.log(`Removendo ${strLocalFile}`);
            });
  
          }).catch((err) => {
            console.log(err, `Erro ao subir ${strLocalFile}`);
          });
        }
  
        return files;
  
      }).catch((err) => {
        console.log(err, 'Erro na conexão');
  
      });
    }

    return api;


}