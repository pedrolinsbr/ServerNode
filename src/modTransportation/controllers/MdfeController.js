module.exports = function (app, cb) {
  
    const stream     = require('stream');
    const puppeteer  = require('puppeteer');
    const stringMask = require('string-mask');
    const moment     = require('moment');

    let api    = {};
    let dao    = app.src.modTransportation.dao.MdfeDAO;
    let logger = app.config.logger;
    
    api.indicadoresMdfe = async function (req, res, next) {

      var ok = await dao.indicadoresMdfe(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.validarCarga = async function (req, res, next) {

      var ok = await dao.validarCarga(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.listar = async function (req, res, next) {
      
      var ok = await dao.listar(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.listarPercurso = async function (req, res, next) {
  
      var ok = await dao.listarPercurso(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.salvarMdfe = async function (req, res, next) {

    var ok = await dao.salvarMdfe(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
    }

    api.buscarMdfe = async function (req, res, next) {

      var ok = await dao.buscarMdfe(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.atualizarMdfe = async function (req, res, next) {

      var ok = await dao.atualizarMdfe(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.gerarXML = async function (req, res, next) {

          try {

            var rs = await dao.buscarXML(req, res, next);

            var blOK = (rs.length == 1);
            
            if (blOK) {

              let strArquivo = 'MDF-e_'+rs[0].IDF001+'.xml';

              let fileContents = new Buffer(rs[0].TXXMLMDF, 'base64');

              let readStream = new stream.PassThrough();
              readStream.end(fileContents);
            
              res.setHeader('Content-disposition', 'inline; filename="' + strArquivo + '"');
              res.setHeader('Content-type', 'image/svg+xml');
              
              readStream.pipe(res);
              // Documentação de referência para mostrar no navegador.
              // https://nodejs.docow.com/1603/exibir-pdf-no-navegador-usando-js-express.html

              
            } else {

                res.status(400).send({ strErro: 'Não existe XML para este MDF-e' });

            }

        } catch (err) {

            res.status(500).send({ strErro: err.message });

        }

        
    }

    api.validarPdfMdfe = async function (req, res, next) {

      var ok = await dao.validarPdfMdfe(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.gerarPDF = async function(req,res,next) {

      try {
        var rs = await dao.buscarXML(req, res, next);

        var blOK = (rs[0].TXXMLMDF != null);
            
        if (blOK) {

          let formatter = new stringMask('0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000');
    
          //let xml = require('fs').readFileSync(rs[0].TXXMLMDF, 'utf8');
          let json = require('xml2json').toJson(rs[0].TXXMLMDF, { object: true });
    
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
         });
          const page    = await browser.newPage();

          if(json.mdfeProc.protMDFe.infProt.chMDFe == rs[0].NRCHAMDF){
            
            await page.setContent(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="ie=edge">
              <meta name="author" content="Marco">
              <meta name="description" content="PDF da Bravo">
              <meta name="keywords" content="MDF-e">
              <title>Bravo</title>
              <style type="text/css">
                html {
                  font-family: sans-serif;
                  font-size:12px;
                }
      
                table { page-break-inside:auto }
                tr    { page-break-inside:avoid; page-break-after:auto }
      
                
                table, td, th {
                  /*border: 1px solid black;*/
                  border:0px;
                  padding:0px;
                  margin:0px;
                }
              </style>
            
            </head>
            <body style="margin: 20px;">
              <table style="width:100%;">
                <tr>
                  <td style="width:10%;">
                    <div style="width:200px;height:95px;">
                      <img style="-webkit-user-select: none;margin: auto; width:195px;height:68px;" src="http://etms.evolog.com.br/assets/images/logo-bravo-sem-fundo.png" />
                    </div>
                  </td>
                  <td style="line-height:1.5;padding-left:10px;width:60%;font-size:11px;vertical-align: sub;">
                    <span style="font-size: 14px; font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.emit.xNome}</span><br/>
                    <span>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xLgr}, ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.nro} - ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xBairro}</span><br/>
                    <span>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xMun} - ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.UF} CEP ${new stringMask('00000-000').apply(json.mdfeProc.MDFe.infMDFe.emit.enderEmit.CEP)}</span><br/>
                    <span><b>CNPJ:</b>${new stringMask('00.000.000/0000-00').apply(json.mdfeProc.MDFe.infMDFe.emit.CNPJ)} <b>IE:</b>${json.mdfeProc.MDFe.infMDFe.emit.IE} <b>RNTRC:</b>${json.mdfeProc.MDFe.infMDFe.infModal.rodo.infANTT.RNTRC}</span>
                  </td>
                  <td rowspan="3" style="width:30%; text-align:right;"> 
                    <div id="output"></div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:10px; padding-bottom:10px;font-size: 12px;"><b>DAMDFE</b> - Documento Auxiliar de Manifesto Eletrônico de Documentos Fiscais</td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size:11px;">
            
                    <div style="float:left;padding-left:10px;background-color:#ADD8E6;padding:5px;">
                      <div style="float:left;padding-right:20px;">Modelo<br/>${new stringMask('00').apply(json.mdfeProc.MDFe.infMDFe.ide.mod)}</div>
                      <div style="float:left;padding-right:20px;">Série<br/>${new stringMask('000', {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.ide.serie)}</div>
                      <div style="float:left;">Número<br/>${new stringMask('000.000.000', {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.ide.nMDF)}</div>
                    </div>
              
                    <div style="background-color:#ADD8E6;margin-left:5px;margin-right:5px;float:left;padding:5px;"
                      <div style="float:left;padding-left:15px;padding-right:15px;">Fl<br/>1/1</div>
                    </div>
              
                    <div style="float:left;background-color:#ADD8E6;padding:5px;">
                      <div style="float:left;">Data e hora de Emissão<br/><b>${moment(json.mdfeProc.MDFe.infMDFe.ide.dhEmi).format('DD/MM/YYYY HH:mm:ss')}</b></div>
                    </div>
                  
                    <div style="float:left;background-color:#ADD8E6;margin-left:5px;padding:5px;">
                      <div style="float:left;">UF Carreg.<br/><b>${json.mdfeProc.MDFe.infMDFe.ide.UFIni}</b></div>
                    </div>
                  
                    <div style="float:left;background-color:#ADD8E6;margin-left:5px;padding:5px;">
                      <div style="float:left;">UF Descarreg.<br/><b>${json.mdfeProc.MDFe.infMDFe.ide.UFFim}</b></div>
                    </div>
                  </td>
                </tr>
              </table>
        
              <table style="width:100%;margin-top:20px;">
                <tr>
          
                  <td style="width:30%;font-size: 14px;"><b>Modelo Rodoviário de Carga</br></td>
                  <td style="font-size:10px;width:70%">CONTROLE DO FISCO</td>
          
                </tr>
                <tr>
          
                  <td style="width:40%;vertical-align: middle; padding:0px;">
                    <div style="float:left;padding-left:10px;background-color:#DCDCDC;padding:5px;">
                      <div style="float:left;">Qtd. CTe<br/><b>${json.mdfeProc.MDFe.infMDFe.tot.qCTe}</b></div>
                    </div>
              
                    <div style="background-color:#DCDCDC;margin-left:5px;margin-right:5px;float:left;padding:5px;"
                      <div style="float:left;">Qtd. NFe<br/><b>0</b></div>
                    </div>
                    
                    <div style="float:left;background-color:#DCDCDC;padding:5px;">
                      <div style="float:left;">Peso total (Kg)<br/><b>${new stringMask('#.##0,0000', {reverse: true}).apply((json.mdfeProc.MDFe.infMDFe.tot.qCarga).replace(".", ""))}</b></div>
                    </div>
                  </td>
                  <td style="width:60%;padding:0px">
                    <div style="text-align: left;">
                      <svg id="codBarras"></svg>
                    </div>
                  </td>
          
                </tr>
                <tr>
                  <td style="padding-top:20px;line-height:1.5;">
                    <b>Protocolo de autorização</b><br/>
                    ${json.mdfeProc.protMDFe.infProt.nProt} - ${moment(json.mdfeProc.protMDFe.infProt.dhRecbto).format('DD/MM/YYYY HH:mm:ss')}
                  </td>
                  <td style="padding-top:20px;line-height:1.5;">
                  <b>Chave de acesso</b><br/>
                  ${new stringMask('0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000').apply(json.mdfeProc.protMDFe.infProt.chMDFe)}<br/>
                  Consulte em <b>https://dfe-portal.svrs.rs.gov.br/Mdfe/Consulta</b>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px; font-size:13px;">
                    <b>Veículo</b>
                  </td>
                  <td style="padding-top:20px;">
                    <b>Condutor</b>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%">
                      <tr>
                        <td width="30%" style="border-bottom: 1pt solid #DCDCDC;">Placa</td>
                        <td width="70%" style="border-bottom: 1pt solid #DCDCDC;">RNTRC</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1pt dashed #DCDCDC;"><b>${json.mdfeProc.MDFe.infMDFe.infModal.rodo.veicTracao.placa} </b></td>
                        <td style="border-bottom: 1pt dashed #DCDCDC;"><b>${json.mdfeProc.MDFe.infMDFe.infModal.rodo.infANTT.RNTRC}</b></td>
                      </tr>
                    </table>
                  </td>
                  <td>
                    <table width="100%">
                      <tr>
                        <td width="30%" style="border-bottom: 1pt solid #DCDCDC;">CPF</td>
                        <td width="70%" style="border-bottom: 1pt solid #DCDCDC;">Nome</td>
                      </tr>
                      <tr>
                        <td style="border-bottom: 1pt dashed #DCDCDC;"><b>${new stringMask('000.000.000-00', {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.infModal.rodo.veicTracao.condutor.CPF)}</b></td>
                        <td style="border-bottom: 1pt dashed #DCDCDC;"><b>${json.mdfeProc.MDFe.infMDFe.infModal.rodo.veicTracao.condutor.xNome}</b></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding-top:20px; font-size:13px;">
                    <b>Vale Pedágio</b>
                  </td>
                  <td rowspan="2"></td>
                </tr>
                <tr>
                  <td style="padding-top:0px;">
                    <table>
                      <tr style="font-size:11px;">
                        <td width="33%" style="border-bottom: 1pt solid #DCDCDC;"><b>Responsável CNPJ</b></td>
                        <td width="33%" style="border-bottom: 1pt solid #DCDCDC;"><b>Fornecedor CNPJ</b></td>
                        <td width="33%" style="border-bottom: 1pt solid #DCDCDC;"><b>Nº Comprovante</b></td>
                      </tr>
                    </table>
                  </td>
                </tr>
        
                <tr>
                    <td colspan="2" style="padding-top:20px;border-bottom: 1pt solid #DCDCDC;">
                      <b>Observações</b>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                      ${json.mdfeProc.MDFe.infMDFe.infAdic != undefined ? json.mdfeProc.MDFe.infMDFe.infAdic.infCpl : ''}
                    </td>
                  </tr>
              </table>
              <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/barcodes/JsBarcode.code128.min.js"></script>
              <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script>
              <!-- https://github.com/jeromeetienne/jquery-qrcode -->
              <script>
                (function(r){r.fn.qrcode=function(h){var s;function u(a){this.mode=s;this.data=a}function o(a,c){this.typeNumber=a;this.errorCorrectLevel=c;this.modules=null;this.moduleCount=0;this.dataCache=null;this.dataList=[]}function q(a,c){if(void 0==a.length)throw Error(a.length+"/"+c);for(var d=0;d<a.length&&0==a[d];)d++;this.num=Array(a.length-d+c);for(var b=0;b<a.length-d;b++)this.num[b]=a[b+d]}function p(a,c){this.totalCount=a;this.dataCount=c}function t(){this.buffer=[];this.length=0}u.prototype={getLength:function(){return this.data.length},
                write:function(a){for(var c=0;c<this.data.length;c++)a.put(this.data.charCodeAt(c),8)}};o.prototype={addData:function(a){this.dataList.push(new u(a));this.dataCache=null},isDark:function(a,c){if(0>a||this.moduleCount<=a||0>c||this.moduleCount<=c)throw Error(a+","+c);return this.modules[a][c]},getModuleCount:function(){return this.moduleCount},make:function(){if(1>this.typeNumber){for(var a=1,a=1;40>a;a++){for(var c=p.getRSBlocks(a,this.errorCorrectLevel),d=new t,b=0,e=0;e<c.length;e++)b+=c[e].dataCount;
                for(e=0;e<this.dataList.length;e++)c=this.dataList[e],d.put(c.mode,4),d.put(c.getLength(),j.getLengthInBits(c.mode,a)),c.write(d);if(d.getLengthInBits()<=8*b)break}this.typeNumber=a}this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17;this.modules=Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=Array(this.moduleCount);for(var b=0;b<this.moduleCount;b++)this.modules[d][b]=null}this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-
                7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(a,c);7<=this.typeNumber&&this.setupTypeNumber(a);null==this.dataCache&&(this.dataCache=o.createData(this.typeNumber,this.errorCorrectLevel,this.dataList));this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,c){for(var d=-1;7>=d;d++)if(!(-1>=a+d||this.moduleCount<=a+d))for(var b=-1;7>=b;b++)-1>=c+b||this.moduleCount<=c+b||(this.modules[a+d][c+b]=
                0<=d&&6>=d&&(0==b||6==b)||0<=b&&6>=b&&(0==d||6==d)||2<=d&&4>=d&&2<=b&&4>=b?!0:!1)},getBestMaskPattern:function(){for(var a=0,c=0,d=0;8>d;d++){this.makeImpl(!0,d);var b=j.getLostPoint(this);if(0==d||a>b)a=b,c=d}return c},createMovieClip:function(a,c,d){a=a.createEmptyMovieClip(c,d);this.make();for(c=0;c<this.modules.length;c++)for(var d=1*c,b=0;b<this.modules[c].length;b++){var e=1*b;this.modules[c][b]&&(a.beginFill(0,100),a.moveTo(e,d),a.lineTo(e+1,d),a.lineTo(e+1,d+1),a.lineTo(e,d+1),a.endFill())}return a},
                setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(a=8;a<this.moduleCount-8;a++)null==this.modules[6][a]&&(this.modules[6][a]=0==a%2)},setupPositionAdjustPattern:function(){for(var a=j.getPatternPosition(this.typeNumber),c=0;c<a.length;c++)for(var d=0;d<a.length;d++){var b=a[c],e=a[d];if(null==this.modules[b][e])for(var f=-2;2>=f;f++)for(var i=-2;2>=i;i++)this.modules[b+f][e+i]=-2==f||2==f||-2==i||2==i||0==f&&0==i?!0:!1}},setupTypeNumber:function(a){for(var c=
                j.getBCHTypeNumber(this.typeNumber),d=0;18>d;d++){var b=!a&&1==(c>>d&1);this.modules[Math.floor(d/3)][d%3+this.moduleCount-8-3]=b}for(d=0;18>d;d++)b=!a&&1==(c>>d&1),this.modules[d%3+this.moduleCount-8-3][Math.floor(d/3)]=b},setupTypeInfo:function(a,c){for(var d=j.getBCHTypeInfo(this.errorCorrectLevel<<3|c),b=0;15>b;b++){var e=!a&&1==(d>>b&1);6>b?this.modules[b][8]=e:8>b?this.modules[b+1][8]=e:this.modules[this.moduleCount-15+b][8]=e}for(b=0;15>b;b++)e=!a&&1==(d>>b&1),8>b?this.modules[8][this.moduleCount-
                b-1]=e:9>b?this.modules[8][15-b-1+1]=e:this.modules[8][15-b-1]=e;this.modules[this.moduleCount-8][8]=!a},mapData:function(a,c){for(var d=-1,b=this.moduleCount-1,e=7,f=0,i=this.moduleCount-1;0<i;i-=2)for(6==i&&i--;;){for(var g=0;2>g;g++)if(null==this.modules[b][i-g]){var n=!1;f<a.length&&(n=1==(a[f]>>>e&1));j.getMask(c,b,i-g)&&(n=!n);this.modules[b][i-g]=n;e--; -1==e&&(f++,e=7)}b+=d;if(0>b||this.moduleCount<=b){b-=d;d=-d;break}}}};o.PAD0=236;o.PAD1=17;o.createData=function(a,c,d){for(var c=p.getRSBlocks(a,
                c),b=new t,e=0;e<d.length;e++){var f=d[e];b.put(f.mode,4);b.put(f.getLength(),j.getLengthInBits(f.mode,a));f.write(b)}for(e=a=0;e<c.length;e++)a+=c[e].dataCount;if(b.getLengthInBits()>8*a)throw Error("code length overflow. ("+b.getLengthInBits()+">"+8*a+")");for(b.getLengthInBits()+4<=8*a&&b.put(0,4);0!=b.getLengthInBits()%8;)b.putBit(!1);for(;!(b.getLengthInBits()>=8*a);){b.put(o.PAD0,8);if(b.getLengthInBits()>=8*a)break;b.put(o.PAD1,8)}return o.createBytes(b,c)};o.createBytes=function(a,c){for(var d=
                0,b=0,e=0,f=Array(c.length),i=Array(c.length),g=0;g<c.length;g++){var n=c[g].dataCount,h=c[g].totalCount-n,b=Math.max(b,n),e=Math.max(e,h);f[g]=Array(n);for(var k=0;k<f[g].length;k++)f[g][k]=255&a.buffer[k+d];d+=n;k=j.getErrorCorrectPolynomial(h);n=(new q(f[g],k.getLength()-1)).mod(k);i[g]=Array(k.getLength()-1);for(k=0;k<i[g].length;k++)h=k+n.getLength()-i[g].length,i[g][k]=0<=h?n.get(h):0}for(k=g=0;k<c.length;k++)g+=c[k].totalCount;d=Array(g);for(k=n=0;k<b;k++)for(g=0;g<c.length;g++)k<f[g].length&&
                (d[n++]=f[g][k]);for(k=0;k<e;k++)for(g=0;g<c.length;g++)k<i[g].length&&(d[n++]=i[g][k]);return d};s=4;for(var j={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,
                78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var c=a<<10;0<=j.getBCHDigit(c)-j.getBCHDigit(j.G15);)c^=j.G15<<j.getBCHDigit(c)-j.getBCHDigit(j.G15);return(a<<10|c)^j.G15_MASK},getBCHTypeNumber:function(a){for(var c=a<<12;0<=j.getBCHDigit(c)-
                j.getBCHDigit(j.G18);)c^=j.G18<<j.getBCHDigit(c)-j.getBCHDigit(j.G18);return a<<12|c},getBCHDigit:function(a){for(var c=0;0!=a;)c++,a>>>=1;return c},getPatternPosition:function(a){return j.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,c,d){switch(a){case 0:return 0==(c+d)%2;case 1:return 0==c%2;case 2:return 0==d%3;case 3:return 0==(c+d)%3;case 4:return 0==(Math.floor(c/2)+Math.floor(d/3))%2;case 5:return 0==c*d%2+c*d%3;case 6:return 0==(c*d%2+c*d%3)%2;case 7:return 0==(c*d%3+(c+d)%2)%2;default:throw Error("bad maskPattern:"+
                a);}},getErrorCorrectPolynomial:function(a){for(var c=new q([1],0),d=0;d<a;d++)c=c.multiply(new q([1,l.gexp(d)],0));return c},getLengthInBits:function(a,c){if(1<=c&&10>c)switch(a){case 1:return 10;case 2:return 9;case s:return 8;case 8:return 8;default:throw Error("mode:"+a);}else if(27>c)switch(a){case 1:return 12;case 2:return 11;case s:return 16;case 8:return 10;default:throw Error("mode:"+a);}else if(41>c)switch(a){case 1:return 14;case 2:return 13;case s:return 16;case 8:return 12;default:throw Error("mode:"+
                a);}else throw Error("type:"+c);},getLostPoint:function(a){for(var c=a.getModuleCount(),d=0,b=0;b<c;b++)for(var e=0;e<c;e++){for(var f=0,i=a.isDark(b,e),g=-1;1>=g;g++)if(!(0>b+g||c<=b+g))for(var h=-1;1>=h;h++)0>e+h||c<=e+h||0==g&&0==h||i==a.isDark(b+g,e+h)&&f++;5<f&&(d+=3+f-5)}for(b=0;b<c-1;b++)for(e=0;e<c-1;e++)if(f=0,a.isDark(b,e)&&f++,a.isDark(b+1,e)&&f++,a.isDark(b,e+1)&&f++,a.isDark(b+1,e+1)&&f++,0==f||4==f)d+=3;for(b=0;b<c;b++)for(e=0;e<c-6;e++)a.isDark(b,e)&&!a.isDark(b,e+1)&&a.isDark(b,e+
                2)&&a.isDark(b,e+3)&&a.isDark(b,e+4)&&!a.isDark(b,e+5)&&a.isDark(b,e+6)&&(d+=40);for(e=0;e<c;e++)for(b=0;b<c-6;b++)a.isDark(b,e)&&!a.isDark(b+1,e)&&a.isDark(b+2,e)&&a.isDark(b+3,e)&&a.isDark(b+4,e)&&!a.isDark(b+5,e)&&a.isDark(b+6,e)&&(d+=40);for(e=f=0;e<c;e++)for(b=0;b<c;b++)a.isDark(b,e)&&f++;a=Math.abs(100*f/c/c-50)/5;return d+10*a}},l={glog:function(a){if(1>a)throw Error("glog("+a+")");return l.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;256<=a;)a-=255;return l.EXP_TABLE[a]},EXP_TABLE:Array(256),
                LOG_TABLE:Array(256)},m=0;8>m;m++)l.EXP_TABLE[m]=1<<m;for(m=8;256>m;m++)l.EXP_TABLE[m]=l.EXP_TABLE[m-4]^l.EXP_TABLE[m-5]^l.EXP_TABLE[m-6]^l.EXP_TABLE[m-8];for(m=0;255>m;m++)l.LOG_TABLE[l.EXP_TABLE[m]]=m;q.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var c=Array(this.getLength()+a.getLength()-1),d=0;d<this.getLength();d++)for(var b=0;b<a.getLength();b++)c[d+b]^=l.gexp(l.glog(this.get(d))+l.glog(a.get(b)));return new q(c,0)},mod:function(a){if(0>
                this.getLength()-a.getLength())return this;for(var c=l.glog(this.get(0))-l.glog(a.get(0)),d=Array(this.getLength()),b=0;b<this.getLength();b++)d[b]=this.get(b);for(b=0;b<a.getLength();b++)d[b]^=l.gexp(l.glog(a.get(b))+c);return(new q(d,0)).mod(a)}};p.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],
                [4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,
                116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,
                43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,
                3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,
                55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,
                45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];p.getRSBlocks=function(a,c){var d=p.getRsBlockTable(a,c);if(void 0==d)throw Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+c);for(var b=d.length/3,e=[],f=0;f<b;f++)for(var h=d[3*f+0],g=d[3*f+1],j=d[3*f+2],l=0;l<h;l++)e.push(new p(g,j));return e};p.getRsBlockTable=function(a,c){switch(c){case 1:return p.RS_BLOCK_TABLE[4*(a-1)+0];case 0:return p.RS_BLOCK_TABLE[4*(a-1)+1];case 3:return p.RS_BLOCK_TABLE[4*
                (a-1)+2];case 2:return p.RS_BLOCK_TABLE[4*(a-1)+3]}};t.prototype={get:function(a){return 1==(this.buffer[Math.floor(a/8)]>>>7-a%8&1)},put:function(a,c){for(var d=0;d<c;d++)this.putBit(1==(a>>>c-d-1&1))},getLengthInBits:function(){return this.length},putBit:function(a){var c=Math.floor(this.length/8);this.buffer.length<=c&&this.buffer.push(0);a&&(this.buffer[c]|=128>>>this.length%8);this.length++}};"string"===typeof h&&(h={text:h});h=r.extend({},{render:"canvas",width:256,height:256,typeNumber:-1,
                correctLevel:2,background:"#ffffff",foreground:"#000000"},h);return this.each(function(){var a;if("canvas"==h.render){a=new o(h.typeNumber,h.correctLevel);a.addData(h.text);a.make();var c=document.createElement("canvas");c.width=h.width;c.height=h.height;for(var d=c.getContext("2d"),b=h.width/a.getModuleCount(),e=h.height/a.getModuleCount(),f=0;f<a.getModuleCount();f++)for(var i=0;i<a.getModuleCount();i++){d.fillStyle=a.isDark(f,i)?h.foreground:h.background;var g=Math.ceil((i+1)*b)-Math.floor(i*b),
                j=Math.ceil((f+1)*b)-Math.floor(f*b);d.fillRect(Math.round(i*b),Math.round(f*e),g,j)}}else{a=new o(h.typeNumber,h.correctLevel);a.addData(h.text);a.make();c=r("<table></table>").css("width",h.width+"px").css("height",h.height+"px").css("border","0px").css("border-collapse","collapse").css("background-color",h.background);d=h.width/a.getModuleCount();b=h.height/a.getModuleCount();for(e=0;e<a.getModuleCount();e++){f=r("<tr></tr>").css("height",b+"px").appendTo(c);for(i=0;i<a.getModuleCount();i++)r("<td></td>").css("width",
                d+"px").css("background-color",a.isDark(e,i)?h.foreground:h.background).appendTo(f)}}a=c;jQuery(a).appendTo(this)})}})(jQuery);
              </script>
              <script>
                  function GerarCódigoDeBarras(elementoInput) {
                    let configuracao = {
                        format: "CODE128",
                        
                        width: 1.3,
                        height: 60,
                        displayValue: false
                    };
                    JsBarcode('#codBarras', "${json.mdfeProc.protMDFe.infProt.chMDFe}", configuracao);
                  }
                  GerarCódigoDeBarras();
                  
                  jQuery('#output').qrcode({width: 100,height: 100,text: "http://dfe-portal.svrs.rs.gov.br/mdfe/QRCode?chMDFe=${json.mdfeProc.protMDFe.infProt.chMDFe}&tpAmb=1"});
    
              </script>
            </body>
          </html>`);
            await page.emulateMedia('screen');
            const pdf = await page.pdf({
              //path: 'teste.pdf',
              format: 'A4',
              margin: {
                top:    '1cm',
                right:  '0.5cm',
                bottom: '1cm',
                left:   '0.5cm'
              },
              printBackground: true//,
              //headerTemplate: `<style> .teste { font-family: serif;text-align: center; font-size: 10px; font-weight: bold; }</style> <div class="teste">BRAVO SERVICOS LOGISTICOS LTDA</div>`,
              //footerTemplate: '',
              //displayHeaderFooter: true
            });
      
            console.log('FEITO');
            await browser.close();
            var fileContents = new Buffer(pdf, 'base64');
      
            var readStream = new stream.PassThrough();
            readStream.end(fileContents);
      
            res.setHeader('Content-disposition', 'inline; filename="MDF-e.pdf"');
            res.setHeader('Content-type', 'application/pdf');
      
            readStream.pipe(res);
          }else{
            res.status(500);
            res.json({ message: 'A chave de acesso do MDF-e está divergente do XML, por favor, entre em contato com o Setor de Suporte.' });
            return true; 
          }
        
        }else{
          res.status(400).send({ message: 'Não existe XML para este MDF-e para gerarmos o pdf.' });
          return res;
        }
      } catch (err) {
        err.stack = new Error().stack + `\r\n` + err.stack;
        res.status(500).send({ strErro: err.message });
        logger.error("Erro:", err);
        throw err;
      }
      
    }

    api.gerarPDFLayoutAntigo = async function(req,res,next) {

      try {
        var rs = await dao.buscarXML(req, res, next);

        var blOK = (rs[0].TXXMLMDF != null);
            
        if (blOK) {

          let formatter = new stringMask('0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000');
    
          //let xml = require('fs').readFileSync(rs[0].TXXMLMDF, 'utf8');
          let json = require('xml2json').toJson(rs[0].TXXMLMDF, { object: true });
    
          const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
         });
          const page    = await browser.newPage();
    
          let bloco   = ``;
          let jsonAux = ``;
          req.verifica = json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga;
          json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga = await api.verificaArray(json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga);

          for (let x = 0; x < json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga.length; x++) {
            let blocoCTE1 = ``;
            let blocoCTE2 = ``;
            if (json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga[x].infCTe.length == undefined) {
              blocoCTE1 = blocoCTE1 + `<br/>CT-e ` + json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga[x].infCTe.chCTe;
            } else {
              for (let y = 0; y < json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga[x].infCTe.length; y++) {
                if ((y % 2) == 0) {
                  blocoCTE1 = blocoCTE1 + `<br/>CT-e ` + formatter.apply(json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga[x].infCTe[y].chCTe);
                } else {
                  blocoCTE2 = blocoCTE2 + `<br/>CT-e ` + formatter.apply(json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga[x].infCTe[y].chCTe);
                }
              }
            }
            bloco = bloco + `
                            <tr style="font-size: 15px; vertical-align: top;">
                              <td colspan="6">Município ${json.mdfeProc.MDFe.infMDFe.infDoc.infMunDescarga[x].xMunDescarga}</td>
                            </tr>
                            <tr style="font-size: 12px; vertical-align: top;">
                              <td colspan="3">
                                ${blocoCTE1}
                              </td>
                              <td colspan="3">
                                ${blocoCTE2}
                              </td>
                            </tr>`;
          }
    
          await page.setContent(`<!DOCTYPE html>
          <html lang="pt-br">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <meta name="author" content="Marco">
            <meta name="description" content="PDF da Bravo">
            <meta name="keywords" content="MDF-e">
            <title>Bravo</title>
            <style type="text/css">
              html {
                font-family: serif;
              }
    
              table { page-break-inside:auto }
              tr    { page-break-inside:avoid; page-break-after:auto }
    
              table {
                border-collapse: collapse;
                width: 100%;
              }
              
              table, td, th {
                border: 1px solid black;
              }
            </style>
          
          </head>
          <body style="margin: 0px;">
          
            <table id="table1" style="width: 765px;">
              <tbody>
                <tr>
                  <td colspan="3" style="vertical-align: top;">
                    <div style="text-align: center; font-size: 14px; font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.emit.xNome}</div>
                    <br/>
                    <div style="position: relative; width: 100%;">
                      <div style="left: 38%; position: absolute; transform: translateX(-39%); font-size: 12px;">
                        <label>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xLgr}, ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.nro}</label><br/>
                        <label>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xCpl}</label><br/>
                        <label>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xBairro}</label><br/>
                        <label>CEP: ${new stringMask('00000-000').apply(json.mdfeProc.MDFe.infMDFe.emit.enderEmit.CEP)} - ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xMun} - ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.UF}</label><br/>
                        <label>CNPJ: ${new stringMask('00.000.000/0000-00').apply(json.mdfeProc.MDFe.infMDFe.emit.CNPJ)}</label><br/>
                        <label>INSCRIÇÃO ESTADUAL: ${json.mdfeProc.MDFe.infMDFe.emit.IE}</label><br/>
                        <label>TELEFONE: ${new stringMask('0000-0000').apply(json.mdfeProc.MDFe.infMDFe.emit.enderEmit.fone)}</label>
                      </div>
                    </div>
                    <br/><br/><br/><br/><br/><br/><br/><br/>
                  </td>
                  <td colspan="3" style="vertical-align: top; width: 45%;">
                      <div style="vertical-align: top; display: flex; border-bottom: 1px solid;">
                            <label style=" font-weight: bold; font-size: 20px; padding-right: 20px; text-align: top;">DAMDFE</label>
                            <label style="font-size: 14px; display: inline-block; width: 280px; background-color:white;">
                            Documento Auxiliar de Manifesto Eletrônico de Documentos Fiscais
                            </label>
                      </div>
                      <div style="vertical-align: top; border-bottom: 1px solid;">
                        <div style="font-size: 12px; font-weight: bold; text-align: center; padding-bottom: 5px;">Controle do Fisco</div>
                        <div style="text-align: center; padding-bottom: 10px;">
                          <svg id="codBarras"></svg>
                        </div>
                      </div>
                      <div style="vertical-align: top;">
                        <div style="font-size: 12px; font-weight: bold; text-align: left; padding-bottom: 10px;">Chave de acesso</div>
                        <div style="text-align: center; font-weight: bold; font-size: 14px;">
                          ${new stringMask('0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000').apply(json.mdfeProc.protMDFe.infProt.chMDFe)}
                        </div>
                      </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="3">
                    <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">
                      <div>MODELO</div>
                      <div style="font-weight: bold;">${new stringMask('00').apply(json.mdfeProc.MDFe.infMDFe.ide.mod)}</div>
                    </div>
                    <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">
                      <div>SÉRIE</div>
                      <div style="font-weight: bold;">${new stringMask('000', {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.ide.serie)}</div>
                    </div>
                    <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">
                      <div>NÚMERO</div>
                      <div style="font-weight: bold;">${new stringMask('000.000.000', {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.ide.nMDF)}</div>
                    </div>
                    <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">
                      <div>FOLHA</div>
                      <div style="font-weight: bold;">01/01</div>
                    </div>
                    <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">
                      <div>DATA E HORA DE EMISSÃO</div>
                      <div style="font-weight: bold;">${moment(json.mdfeProc.MDFe.infMDFe.ide.dhEmi).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                    <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">
                      <div>UF Carrega</div>
                      <div style="font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.ide.UFIni}</div>
                    </div>
                    <div style="display: inline-block; padding-right: 0px; border-right: 0px solid; text-align: center; font-size: 8px;">
                      <div>UF Descar.</div>
                      <div style="font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.ide.UFFim}</div>
                    </div>
                  </td>
                  <td colspan="3">
                    <div style="border-right: 0px solid; font-size: 10px;">
                      <div>PROTOCOLO DE AUTORIZAÇÃO DE USO</div>
                      <div style="font-weight: bold; text-align: center;">${json.mdfeProc.protMDFe.infProt.nProt} ${moment(json.mdfeProc.protMDFe.infProt.dhRecbto).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                  </td>
                </tr>
                <tr style="font-size: 14px;">
                  <td colspan="3">Veículo</td>
                  <td colspan="3">Condutor</td>
                </tr>
                <tr style="font-size: 14px;">
                  <td>Placa</td>
                  <td colspan="2">RNTRC</td>
                  <td>CPF</td>
                  <td colspan="2">Nome</td>
                </tr>
                <tr style="font-size: 14px; vertical-align: top;">
                  <td>${json.mdfeProc.MDFe.infMDFe.infModal.rodo.veicTracao.placa} <br/><br/><br/><br/></td>
                  <td colspan="2">${json.mdfeProc.MDFe.infMDFe.infModal.rodo.infANTT.RNTRC}</td>
                  <td rowspan="3">${new stringMask('000.000.000-00', {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.infModal.rodo.veicTracao.condutor.CPF)}</td>
                  <td rowspan="3" colspan="2">${json.mdfeProc.MDFe.infMDFe.infModal.rodo.veicTracao.condutor.xNome}</td>
                </tr>
                <tr style="font-size: 14px; vertical-align: top;">
                  <td colspan="3">Vale Pedágio </td>
                </tr>
                <tr style="font-size: 14px; vertical-align: top;">
                  <td>Responsável CNPJ<br/><br/><br/><br/></td>
                  <td>Fornecedor CNPJ</td>
                  <td>N. Comprovante</td>
                </tr>
                <tr style="font-size: 15px; vertical-align: top; text-align: center;">
                  <td colspan="6">MODAL RODOVIÁRIO DE CARGA</td>
                </tr>
                <tr style="font-size: 14px; vertical-align: top;">
                  <td>QTDE CT-e<br/><div style="text-align: center;">${json.mdfeProc.MDFe.infMDFe.tot.qCTe}</div></td>
                  <td>QTDE NF-e<br/><div style="text-align: center;">0</div></td>
                  <td colspan="2">QTDE MDF-e<br/><div style="text-align: center;">0</div></td>
                  <td colspan="2">PESO TOTAL (Kg)<br/><div style="text-align: center;">${new stringMask('#.##0,0000', {reverse: true}).apply((json.mdfeProc.MDFe.infMDFe.tot.qCarga).replace(".", ""))}</div></td>
                </tr>
                <tr style="font-size: 15px; vertical-align: top; text-align: center;">
                  <td colspan="6">RELAÇÃO DOS DOCUMENTOS FISCAIS ELETRÔNICOS</td>
                </tr>
                <tr style="font-size: 10px; vertical-align: top;">
                  <td>TP DOC.</td>
                  <td>CNPJ/CPF EMITENTE</td>
                  <td>SÉRIE/NRO. DOCUMENTO</td>
                  <td>TP DOC.</td>
                  <td>CNPJ/CPF EMITENTE</td>
                  <td>SÉRIE/NRO. DOCUMENTO</td>
                </tr>
    
                  ${bloco}
    
                  <tr style="font-size: 15px; vertical-align: top;">
                      <td id="td1" colspan="6">
                        &nbsp;
                      </td>
                  </tr>
                  <tr style="font-size: 15px; vertical-align: top;">
                    <td colspan="6">
                        Observação
                      <br/>
                      ${json.mdfeProc.MDFe.infMDFe.infAdic != undefined ? json.mdfeProc.MDFe.infMDFe.infAdic.infCpl : ''}
                      <br/><br/><br/><br/>
                      <!--div style="font-size: 12px;">DATA E HORA DA IMPRESSÃO: 10/06/2019 15:52</div-->
                    </td>
                  </tr>
              </tbody>
            </table>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/barcodes/JsBarcode.code128.min.js"></script>
            <script>
              function GerarCódigoDeBarras(elementoInput) {
                let configuracao = {
                    format: "CODE128",
                    
                    width: 1.3,
                    height: 60,
                    displayValue: false
                };
                JsBarcode('#codBarras', "${json.mdfeProc.protMDFe.infProt.chMDFe}", configuracao);
              }
              
              let tamanho = (1129 - document.getElementById("table1").clientHeight + document.getElementById("td1").clientHeight);
              let tamanhoTr = document.getElementById("table1").children[0].children.length;
              let tamanhoTot = document.getElementById("table1").clientHeight;
              if(tamanho >= 0) {
                if(document.getElementById("td1").clientHeight != tamanho) {
                  document.getElementById("td1").style.height = (tamanho-5)+"px";
                }
              } else {
                let tamanhoPag = 0;
                for(let x = 2; x < tamanhoTr; x++) {
                  tamanhoPag = tamanhoPag + document.getElementById("table1").children[0].children[tamanhoTr-x].clientHeight;
                  console.log(tamanhoPag -document.getElementById("table1").children[0].children[tamanhoTr-x].clientHeight, ' ', tamanhoPag);
                  if( (tamanhoTot - tamanhoPag) < 1130) {
                    
                    document.getElementById("table1").insertRow(tamanhoTr-x+1).outerHTML = '<tr><td colspan="3" style="vertical-align: top;">'
            +'        <div style="text-align: center; font-size: 14px; font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.emit.xNome}</div>'
            +'          <br/>'
            +'          <div style="position: relative; width: 100%;">'
            +'            <div style="left: 38%; position: absolute; transform: translateX(-39%); font-size: 12px;">'
            +'              <label>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xLgr}, ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.nro}</label><br/>'
            +'              <label>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xCpl}</label><br/>'
            +'              <label>${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xBairro}</label><br/>'
            +'              <label>CEP: ${new stringMask("00000-000").apply(json.mdfeProc.MDFe.infMDFe.emit.enderEmit.CEP)} - ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.xMun} - ${json.mdfeProc.MDFe.infMDFe.emit.enderEmit.UF}</label><br/>'
            +'              <label>CNPJ: ${new stringMask("00.000.000/0000-00").apply(json.mdfeProc.MDFe.infMDFe.emit.CNPJ)}</label><br/>'
            +'              <label>INSCRIÇÃO ESTADUAL: ${json.mdfeProc.MDFe.infMDFe.emit.IE}</label><br/>'
            +'              <label>TELEFONE: ${new stringMask("0000-0000").apply(json.mdfeProc.MDFe.infMDFe.emit.enderEmit.fone)}</label>'
            +'          </div>'
            +'        </div>'
            +'        <br/><br/><br/><br/><br/><br/><br/><br/>'
            +'      </td>'
            +'      <td colspan="3" style="vertical-align: top; width: 45%;">'
            +'          <div style="vertical-align: top; display: flex; border-bottom: 1px solid;">'
            +'                <label style=" font-weight: bold; font-size: 20px; padding-right: 20px; text-align: top;">DAMDFE</label>'
            +'                <label style="font-size: 14px; display: inline-block; width: 280px; background-color:white;">'
            +'                Documento Auxiliar de Manifesto Eletrônico de Documentos Fiscais'
            +'                </label>'
            +'          </div>'
            +'          <div style="vertical-align: top; border-bottom: 1px solid;">'
            +'            <div style="font-size: 12px; font-weight: bold; text-align: center; padding-bottom: 5px;">Controle do Fisco</div>'
            +'            <div style="text-align: center; padding-bottom: 10px;">'
            +'              <svg id="codBarras"></svg>'
            +'            </div>'
            +'          </div>'
            +'          <div style="vertical-align: top;">'
            +'            <div style="font-size: 12px; font-weight: bold; text-align: left; padding-bottom: 10px;">Chave de acesso</div>'
            +'            <div style="text-align: center; font-weight: bold; font-size: 14px;">'
            +'              ${new stringMask("0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000").apply(json.mdfeProc.protMDFe.infProt.chMDFe)}'
            +'            </div>'
            +'          </div>'
            +'      </td>'
            +'    </tr>'
            +'    <tr>'
            +'      <td colspan="3">'
            +'        <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">'
            +'            <div>MODELO</div>'
            +'            <div style="font-weight: bold;">${new stringMask("00").apply(json.mdfeProc.MDFe.infMDFe.ide.mod)}</div>'
            +'          </div>'
            +'          <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">'
            +'            <div>SÉRIE</div>'
            +'            <div style="font-weight: bold;">${new stringMask("000", {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.ide.serie)}</div>'
            +'          </div>'
            +'          <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">'
            +'            <div>NÚMERO</div>'
            +'            <div style="font-weight: bold;">${new stringMask("000.000.000", {reverse: true}).apply(json.mdfeProc.MDFe.infMDFe.ide.nMDF)}</div>'
            +'          </div>'
            +'          <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">'
            +'            <div>FOLHA</div>'
            +'            <div style="font-weight: bold;">01/01</div>'
            +'          </div>'
            +'          <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">'
            +'            <div>DATA E HORA DE EMISSÃO</div>'
            +'            <div style="font-weight: bold;">${moment(json.mdfeProc.MDFe.infMDFe.ide.dhEmi).format("DD/MM/YYYY HH:mm:ss")}</div>'
            +'          </div>'
            +'          <div style="display: inline-block; padding-right: 5px; border-right: 1px solid; text-align: center; font-size: 8px;">'
            +'            <div>UF Carrega</div>'
            +'            <div style="font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.ide.UFIni}</div>'
            +'          </div>'
            +'          <div style="display: inline-block; padding-right: 0px; border-right: 0px solid; text-align: center; font-size: 8px;">'
            +'            <div>UF Descar.</div>'
            +'            <div style="font-weight: bold;">${json.mdfeProc.MDFe.infMDFe.ide.UFFim}</div>'
            +'        </div>'
            +'      </td>'
            +'      <td colspan="3">'
            +'        <div style="border-right: 0px solid; font-size: 10px;">'
            +'          <div>PROTOCOLO DE AUTORIZAÇÃO DE USO</div>'
            +'          <div style="font-weight: bold; text-align: center;">${json.mdfeProc.protMDFe.infProt.nProt} ${moment(json.mdfeProc.protMDFe.infProt.dhRecbto).format("DD/MM/YYYY HH:mm:ss")}</div>'
            +'        </div>'
            +'      </td>'
            +'    </tr>'
            +'    <tr style="font-size: 15px; vertical-align: top; text-align: center;">'
            +'      <td colspan="6">RELAÇÃO DOS DOCUMENTOS FISCAIS ELETRÔNICOS</td>'
            +'    </tr>'
            +'    <tr style="font-size: 10px; vertical-align: top;">'
            +'      <td>TP DOC.</td>'
            +'      <td>CNPJ/CPF EMITENTE</td>'
            +'      <td>SÉRIE/NRO. DOCUMENTO</td>'
            +'      <td>TP DOC.</td>'
            +'      <td>CNPJ/CPF EMITENTE</td>'
            +'      <td>SÉRIE/NRO. DOCUMENTO</td>'
            +'    </tr>'; 
                    break;
                  }
                }
                
                
              }
              GerarCódigoDeBarras();
            </script>
          </body>
          </html>`);
          await page.emulateMedia('screen');
          const pdf = await page.pdf({
            //path: 'teste.pdf',
            format: 'A4',
            margin: {
              top:    '1cm',
              right:  '0.5cm',
              bottom: '1cm',
              left:   '0.5cm'
            },
            printBackground: true//,
            //headerTemplate: `<style> .teste { font-family: serif;text-align: center; font-size: 10px; font-weight: bold; }</style> <div class="teste">BRAVO SERVICOS LOGISTICOS LTDA</div>`,
            //footerTemplate: '',
            //displayHeaderFooter: true
          });
    
          console.log('FEITO');
          await browser.close();
          var fileContents = new Buffer(pdf, 'base64');
    
          var readStream = new stream.PassThrough();
          readStream.end(fileContents);
    
          res.setHeader('Content-disposition', 'inline; filename="MDF-e.pdf"');
          res.setHeader('Content-type', 'application/pdf');
    
          readStream.pipe(res);
    
        
        }else{
          res.status(400).send({ message: 'Não existe XML para este MDF-e para gerarmos o pdf.' });
          return res;
        }
      } catch (err) {
        err.stack = new Error().stack + `\r\n` + err.stack;
        res.status(500).send({ strErro: err.message });
        logger.error("Erro:", err);
        throw err;
      }
      
    }

    api.salvarTrocaStatus = async function (req, res, next) {

      var ok = await dao.salvarTrocaStatus(req, res, next)
        .then((result1) => {
          res.json(result1);
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          next(err);
        });
    }

    api.verificaArray = async function (json) {
          let jsonAux = [];
          if(json.length == undefined){
            jsonAux[0] = json;
            return jsonAux;
          }else{
            return json;
          }
    }
  
  /* api.brendaeutenhorazao = async function (req, res, next) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(`<!DOCTYPE html>
          <html lang="pt-br">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <meta name="author" content="Marco">
            <meta name="description" content="PDF da Bravo">
            <meta name="keywords" content="MDF-e">
            <title>Bravo</title>
            <style type="text/css">
              html {
                font-family: serif;
              }
    
              table { page-break-inside:auto }
              tr    { page-break-inside:avoid; page-break-after:auto }
    
              table {
                border-collapse: collapse;
                width: 100%;
              }
              
              table, td, th {
                border: 1px solid black;
              }
            </style>
          
          </head>
          <body style="margin: 0px;">
          
            <table id="table1" style="width: 765px;">
              <tbody>
                <tr>
                  <td>
                  xxxx
                  </td>
                </tr>
              </tbody>
            </table>
            </body>
          </html>
        `);
        await page.emulateMedia('screen');
        const pdf = await page.pdf({
          //path: 'teste.pdf',
          format: 'A4',
          margin: {
            top:    '1cm',
            right:  '0.5cm',
            bottom: '1cm',
            left:   '0.5cm'
          },
          printBackground: true//,
          //headerTemplate: `<style> .teste { font-family: serif;text-align: center; font-size: 10px; font-weight: bold; }</style> <div class="teste">BRAVO SERVICOS LOGISTICOS LTDA</div>`,
          //footerTemplate: '',
          //displayHeaderFooter: true
        });
  
        console.log('FEITO');
        await browser.close();
        var fileContents = new Buffer(pdf, 'base64');
  
        var readStream = new stream.PassThrough();
        readStream.end(fileContents);
  
        res.setHeader('Content-disposition', 'inline; filename="MDF-e.pdf"');
        res.setHeader('Content-type', 'application/pdf');
  
        readStream.pipe(res);

      } catch (err) {
        err.stack = new Error().stack + `\r\n` + err.stack;
        res.status(500).send({ strErro: err.message });
        logger.error("Erro:", err);
        throw err;
      }
    } */
  
    return api;
  };
  