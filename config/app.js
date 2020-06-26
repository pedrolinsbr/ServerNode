var logger       = require(process.cwd() + '/config/logger.js');
var db   		 = require(process.cwd() + '/config/database');

var compression  = require('compression');
var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var moment  	   = require('moment');
var consign 	   = require('consign');
var cors 		     = require('cors');

//upload dependencias
var multer 		 = require('multer');
var crypto 		 = require('crypto');
var vhost  		 = require('vhost');
var fs 			 = require('fs')

var app = express();
app.use(compression());

moment.locale('pt-BR');


//*** PERMITE PASSSAGEM DE XML E OUTROS TIPOS DE FORMATO PELO BODYPARSER */
function anyBodyParser(req, res, next) {
	if(req.path == "/api/qmnotification"){
		var data = '';
		req.setEncoding('utf8');
		req.on('data', function(chunk) {
				data += chunk;
		});
		req.on('end', function() {
				req.body = data;
				next();
		});
	}else{
		next();
	}

}

app.use(anyBodyParser);


//************UPLOAD*********************************/
//var DIR = './src/xml/download/';
var DIR = process.env.FOLDER_DOWNLOAD;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, DIR)
	},
	filename: function (req, file, cb) {
		crypto.pseudoRandomBytes(1, function (err, raw) {
			cb(null, raw.toString('hex') + Date.now() + '.' + file.originalname);
		});
	}
});

var upload = multer({ storage: storage });

//************FIM UPLOAD******************************/

//# bibliotecas para internacionalização
var i18n    = require('i18n');
i18n.configure({
	locales: ['en', 'es', 'pt'],
	register: global,
	defaultLocale: 'pt',
	updateFiles: false,
    // setting of log level DEBUG - default to require('debug')('i18n:debug')
    logDebugFn: function (msg) {
			console.log('debug i18n', msg);
	},

	// setting of log level WARN - default to require('debug')('i18n:warn')
	logWarnFn: function (msg) {
			console.log('warn i18n', msg);
	},

	// setting of log level ERROR - default to require('debug')('i18n:error')
	logErrorFn: function (msg) {
			console.log('error i18n', msg);
	},

	objectNotation: true,

		//directory: __dirname + './../locales'
		directory: './public/files/locales'
});



//#//////////////////////////////////////



// HABILITA TODOS OS ACESSOS Á API

/* app.use(cors());  // (SOMENTE EM AMBIENTE DE TESTES/DESENVOLVIMENTO) */


app.use(cors(
	{
		credentials: true,
		origin: [
        'http://localhost:4200'
			, 'http://localhost:4201'
			, 'http://localhost:4202'
			, 'http://localhost:4203'
			, 'http://localhost:4204'
			, 'http://localhost:4205'
			, 'http://localhost:8100'
			, 'http://10.10.8.167:4200'
			//, 'http://10.10.8.18:4200'

			, 'http://www.integrador.bravo2020.com.br'
			, 'http://www.oferecimento.bravo2020.com.br'
			, 'http://www.horacerta.bravo2020.com.br'
			, 'http://www.tracking.bravo2020.com.br'
			//, 'http://www.monitoria.bravo2020.com.br'
			, 'http://www.transportation.bravo2020.com.br'
			, 'http://www.payment.bravo2020.com.br'
			, 'http://www.logisticareversa.bravo2020.com.br'
			, 'http://www.dashboard.bravo2020.com.br'			

			, 'http://www.dev.integrador.bravo2020.com.br'
			, 'http://www.dev.oferecimento.bravo2020.com.br'
			, 'http://www.dev.horacerta.bravo2020.com.br'
			, 'http://www.dev.tracking.bravo2020.com.br'
			//, 'http://www.dev.monitoria.bravo2020.com.br'
			, 'http://www.dev.transportation.bravo2020.com.br'
			, 'http://www.dev.payment.bravo2020.com.br'
			, 'http://www.dev.logisticareversa.bravo2020.com.br'
			, 'http://www.dev.dashboard.bravo2020.com.br'

			, 'http://www.qas.integrador.bravo2020.com.br'
			, 'http://www.qas.oferecimento.bravo2020.com.br'
			, 'http://www.qas.horacerta.bravo2020.com.br'
			, 'http://www.qas.tracking.bravo2020.com.br'
			//, 'http://www.qas.monitoria.bravo2020.com.br'
			, 'http://www.qas.transportation.bravo2020.com.br'
			, 'http://www.qas.payment.bravo2020.com.br'
			, 'http://www.qas.logisticareversa.bravo2020.com.br'
			, 'http://www.qas.dashboard.bravo2020.com.br'

			, 'http://www.qas2.integrador.bravo2020.com.br'
			, 'http://www.qas2.oferecimento.bravo2020.com.br'
			, 'http://www.qas2.horacerta.bravo2020.com.br'
			, 'http://www.qas2.tracking.bravo2020.com.br'
			, 'http://www.qas2.monitoria.bravo2020.com.br'
			, 'http://www.qas2.transportation.bravo2020.com.br'
			, 'http://www.qas2.payment.bravo2020.com.br'
			, 'http://www.qas2.logisticareversa.bravo2020.com.br'
			, 'http://www.qas2.dashboard.bravo2020.com.br'

			, 'http://integrador.bravo2020.com.br'
			, 'http://oferecimento.bravo2020.com.br'
			, 'http://horacerta.bravo2020.com.br'
			, 'http://tracking.bravo2020.com.br'
			//, 'http://monitoria.bravo2020.com.br'
			, 'http://transportation.bravo2020.com.br'
			, 'http://payment.bravo2020.com.br'
			, 'http://logisticareversa.bravo2020.com.br'
			, 'http://dashboard.bravo2020.com.br'
			, 'http://paymentkeyuser.bravo2020.com.br'

			, 'http://dev.integrador.bravo2020.com.br'
			, 'http://dev.oferecimento.bravo2020.com.br'
			, 'http://dev.horacerta.bravo2020.com.br'
			, 'http://dev.tracking.bravo2020.com.br'
			//, 'http://dev.monitoria.bravo2020.com.br'
			, 'http://dev.transportation.bravo2020.com.br'
			, 'http://dev.payment.bravo2020.com.br'
			, 'http://dev.logisticareversa.bravo2020.com.br'
			, 'http://dev.dashboard.bravo2020.com.br'

			, 'http://qas.integrador.bravo2020.com.br'
			, 'http://qas.oferecimento.bravo2020.com.br'
			, 'http://qas.horacerta.bravo2020.com.br'
			, 'http://qas.tracking.bravo2020.com.br'
			//, 'http://qas.monitoria.bravo2020.com.br'
			, 'http://qas.transportation.bravo2020.com.br'
			, 'http://qas.payment.bravo2020.com.br'
			, 'http://qas.logisticareversa.bravo2020.com.br'
			, 'http://qas.dashboard.bravo2020.com.br'

			, 'http://qas2.integrador.bravo2020.com.br'
			, 'http://qas2.oferecimento.bravo2020.com.br'
			, 'http://qas2.horacerta.bravo2020.com.br'
			, 'http://qas2.tracking.bravo2020.com.br'
			, 'http://qas2.monitoria.bravo2020.com.br'
			, 'http://qas2.transportation.bravo2020.com.br'
			, 'http://qas2.payment.bravo2020.com.br'
			, 'http://qas2.logisticareversa.bravo2020.com.br'
			, 'http://qas2.dashboard.bravo2020.com.br'

			, 'http://www.integrador.evolog.com.br'
			, 'http://www.oferecimento.evolog.com.br'
			, 'http://www.horacerta.evolog.com.br'
			, 'http://www.tracking.evolog.com.br'
			, 'http://www.evolog.com.br'
			, 'http://www.etms.evolog.com.br'
			, 'http://www.payment.evolog.com.br'
			, 'http://www.logisticareversa.evolog.com.br'
			, 'http://www.dashboard.evolog.com.br'
			, 'http://www.warehouse.evolog.com.br'
			, 'http://www.monitoria.evolog.com.br'

			//subdominio pagamento de frete de teste
			, 'http://www.paymentkeyuser.evolog.com.br'

			, 'http://www.dev.integrador.evolog.com.br'
			, 'http://www.dev.oferecimento.evolog.com.br'
			, 'http://www.dev.horacerta.evolog.com.br'
			, 'http://www.dev.tracking.evolog.com.br'
			, 'http://www.dev.evolog.com.br'
			, 'http://www.dev.etms.evolog.com.br'
			, 'http://www.dev.payment.evolog.com.br'
			, 'http://www.dev.logisticareversa.evolog.com.br'
			, 'http://www.dev.dashboard.evolog.com.br'
			, 'http://www.dev.warehouse.evolog.com.br'
			, 'http://www.dev.monitoria.evolog.com.br'

			, 'http://www.qas.integrador.evolog.com.br'
			, 'http://www.qas.oferecimento.evolog.com.br'
			, 'http://www.qas.horacerta.evolog.com.br'
			, 'http://www.qas.tracking.evolog.com.br'
			, 'http://www.qas.evolog.com.br'
			, 'http://www.qas.etms.evolog.com.br'
			, 'http://www.qas.payment.evolog.com.br'
			, 'http://www.qas.logisticareversa.evolog.com.br'
			, 'http://www.qas.dashboard.evolog.com.br'
			, 'http://www.qas.warehouse.evolog.com.br'
			, 'http://www.qas.monitoria.evolog.com.br'

			, 'http://integrador.evolog.com.br'
			, 'http://oferecimento.evolog.com.br'
			, 'http://horacerta.evolog.com.br'
			, 'http://tracking.evolog.com.br'
			, 'http://evolog.com.br'
			, 'http://etms.evolog.com.br'
			, 'http://payment.evolog.com.br'
			, 'http://logisticareversa.evolog.com.br'
			, 'http://dashboard.evolog.com.br'
			, 'http://warehouse.evolog.com.br'
			, 'http://monitoria.evolog.com.br'
			, 'http://paymentkeyuser.evolog.com.br'

			, 'http://dev.integrador.evolog.com.br'
			, 'http://dev.oferecimento.evolog.com.br'
			, 'http://dev.horacerta.evolog.com.br'
			, 'http://dev.tracking.evolog.com.br'
			, 'http://dev.evolog.com.br'
			, 'http://dev.etms.evolog.com.br'
			, 'http://dev.payment.evolog.com.br'
			, 'http://dev.logisticareversa.evolog.com.br'
			, 'http://dev.dashboard.evolog.com.br'
			, 'http://dev.warehouse.evolog.com.br'
			, 'http://dev.monitoria.evolog.com.br'

			, 'http://qas.integrador.evolog.com.br'
			, 'http://qas.oferecimento.evolog.com.br'
			, 'http://qas.horacerta.evolog.com.br'
			, 'http://qas.tracking.evolog.com.br'
			, 'http://qas.evolog.com.br'
			, 'http://qas.etms.evolog.com.br'
			, 'http://qas.payment.evolog.com.br'
			, 'http://qas.logisticareversa.evolog.com.br'
			, 'http://qas.dashboard.evolog.com.br'
			, 'http://qas.warehouse.evolog.com.br'
			,	'http://qas.monitoria.evolog.com.br'

			//, 'https://videowall-bravo.herokuapp.com'
			//, 'http://videowall-bravo.herokuapp.com'
			//, 'https://www.videowall-bravo.herokuapp.com'
			//, 'http://www.videowall-bravo.herokuapp.com'

			//, 'http://oficina5.com.br/'
			, 'https://www.integrador.evolog.com.br'
			, 'https://www.oferecimento.evolog.com.br'
			, 'https://www.horacerta.evolog.com.br'
			, 'https://www.tracking.evolog.com.br'
			, 'https://www.evolog.com.br'
			, 'https://www.monitoria.evolog.com.br'
			, 'https://www.etms.evolog.com.br'
			, 'https://www.payment.evolog.com.br'
			, 'https://www.logisticareversa.evolog.com.br'
			, 'https://www.dashboard.evolog.com.br'
			, 'https://www.warehouse.evolog.com.br'

			, 'https://www.dev.integrador.evolog.com.br'
			, 'https://www.dev.oferecimento.evolog.com.br'
			, 'https://www.dev.horacerta.evolog.com.br'
			, 'https://www.dev.tracking.evolog.com.br'
			, 'https://www.dev.evolog.com.br'
			, 'https://www.dev.monitoria.evolog.com.br'
			, 'https://www.dev.etms.evolog.com.br'
			, 'https://www.dev.payment.evolog.com.br'
			, 'https://www.dev.logisticareversa.evolog.com.br'
			, 'https://www.dev.dashboard.evolog.com.br'
			, 'https://www.dev.warehouse.evolog.com.br'

			, 'https://www.qas.integrador.evolog.com.br'
			, 'https://www.qas.oferecimento.evolog.com.br'
			, 'https://www.qas.horacerta.evolog.com.br'
			, 'https://www.qas.tracking.evolog.com.br'
			, 'https://www.qas.evolog.com.br'
			, 'https://www.qas.monitoria.evolog.com.br'
			, 'https://www.qas.etms.evolog.com.br'
			, 'https://www.qas.payment.evolog.com.br'
			, 'https://www.qas.logisticareversa.evolog.com.br'
			, 'https://www.qas.dashboard.evolog.com.br'
			, 'https://www.qas.warehouse.evolog.com.br'

			, 'https://integrador.evolog.com.br'
			, 'https://oferecimento.evolog.com.br'
			, 'https://horacerta.evolog.com.br'
			, 'https://tracking.evolog.com.br'
			, 'https://evolog.com.br'
			, 'https://monitoria.evolog.com.br'
			, 'https://etms.evolog.com.br'
			, 'https://payment.evolog.com.br'
			, 'https://logisticareversa.evolog.com.br'
			, 'https://dashboard.evolog.com.br'
			, 'https://warehouse.evolog.com.br'

			, 'https://dev.integrador.evolog.com.br'
			, 'https://dev.oferecimento.evolog.com.br'
			, 'https://dev.horacerta.evolog.com.br'
			, 'https://dev.tracking.evolog.com.br'
			, 'https://dev.evolog.com.br'
			, 'https://dev.monitoria.evolog.com.br'
			, 'https://dev.etms.evolog.com.br'
			, 'https://dev.payment.evolog.com.br'
			, 'https://dev.logisticareversa.evolog.com.br'
			, 'https://dev.dashboard.evolog.com.br'
			, 'https://dev.warehouse.evolog.com.br'

			, 'https://qas.integrador.evolog.com.br'
			, 'https://qas.oferecimento.evolog.com.br'
			, 'https://qas.horacerta.evolog.com.br'
			, 'https://qas.tracking.evolog.com.br'
			, 'https://qas.evolog.com.br'
			, 'https://qas.monitoria.evolog.com.br'
			, 'https://qas.etms.evolog.com.br'
			, 'https://qas.payment.evolog.com.br'
			, 'https://qas.logisticareversa.evolog.com.br'
			, 'https://qas.dashboard.evolog.com.br'
			, 'https://qas.warehouse.evolog.com.br'
			, /155\.56\.128\.\d{1,3}/ //Syngenta (soap IWHC)
			


		]
	}

));


logger.info("Iniciando Logs...");
// "combined"
app.use(require("morgan")(function (tokens, req, res) {
	//var date = moment(tokens.date(req, res, 'iso'), moment.ISO_8601).format('DD/MM/YYYY HH:mm');
	return [
		//date, '-',
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, 'content-length'), '-',
		tokens['response-time'](req, res), 'ms'
	].join(' ');
}, { "stream": logger.stream }));

logger.info("Iniciando configurações mínimas do ExpressJS...");
// Seta o ícone favicon do servidor.
app.use(favicon(path.join(process.cwd(), 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(i18n.init);
/*app.use(express.static(path.join(process.cwd(), 'public'), {
	etag: false // Evitar que a view de erro porque não usamos ela.
})
);*/

//# Locales
app.use(express.static(path.join(process.cwd(), 'public/files'), {
	etag: false // Evitar que a view de erro porque não usamos ela.
})
);


//--------------------------------------------------------------------
// Trabalhando vhost

function createVirtualHost() {

	let localhosts = [];
	localhosts['bravo2020'] = 'bravo2020.com.br';
	localhosts['evolog']    = 'evolog.com.br';

	produtos  = [];
	produtos['integrador.']       = 'front-integrador/';
	produtos['oferecimento.']     = 'front-oferecimento/';
	produtos['horacerta.']        = 'front-hora-certa/';
	produtos['tracking.']         = 'front-tracking/';
	produtos['monitoria.']        = 'front-monitoria/';
	produtos['transportation.']   = 'front-transportation/';
	produtos['etms.']     		  = 'front-transportation/';
	produtos['payment.']          = 'front-payment/';
	produtos['paymentkeyuser.']   = 'front-payment-qas/';
	produtos['logisticareversa.'] = 'front-logisticareversa/';
	produtos['dashboard.']        = 'front-dashboard/';
	produtos['warehouse.']        = 'front-warehouse/';
	produtos['']                  = 'front-bravo2020/';

	//ambientes = ['dev', 'prd'];

	ambientes = [];
	ambientes[''] = 'prd';
	ambientes['dev.'] = 'dev';
	ambientes['qas.'] = 'qas';
	ambientes['qas2.'] = 'qas2';

	for (produto in produtos) {

		for (ambiente in ambientes) {

			for (localhost in localhosts) {

				//if (!(produto == '' && localhost == 'evolog' && ambiente == '')) {

					app.use( vhost(ambiente+produto+localhosts[localhost], express.static(path.join(process.cwd(), '../../'+ambientes[ambiente]+'/server/public/'+produtos[produto]), {
					etag: false // Evitar que a view de erro porque não usamos ela.
					})));

					console.log(ambiente+produto+localhosts[localhost], path.join(process.cwd(), '../../'+ambientes[ambiente]+'/server/public/'+produtos[produto]));

					app.use( vhost('www.'+ambiente+produto+localhosts[localhost], express.static(path.join(process.cwd(), '../../'+ambientes[ambiente]+'/server/public/'+produtos[produto]), {
					etag: false // Evitar que a view de erro porque não usamos ela.
					})));

				console.log('www.'+ambiente+produto+localhosts[localhost], path.join(process.cwd(), '../../'+ambientes[ambiente]+'/server/public/'+produtos[produto]));
				// }
			}

		}
	}
}

if(process.env.PORT == 80){
	createVirtualHost();
}



//-----------ROTAS ESTATICAS-----------------------------------

app.use('/api/xml/canhoto/img', express.static(process.env.FOLDER_CANHOTO));

app.use('/api/arquivo/checklist', express.static(process.env.FOLDER_CHECKLIST));

app.use('/api/hc/nf', express.static('../hc/nf'));

app.get('/', function (req, res) {
	res.redirect('http://www.evolog.com.br');
	// res.send('Hello Bravo! ' + process.env.APP_ENV + '/' + process.env.ADDRESS);
});

app.post('/api/up', upload.any(), function (req, res, next) {
	// req.body contains the text fields
	res.end('file uploaded');
});

app.post('/api/blank/datagrid', function (req, res, next) {
	var json = require(path.join(process.cwd(), "/public/files/datagrid/blank.json"));
	res.send(json);
});

app.get('/download/excel/'+process.env.APP_ENV.toLowerCase()+'/:id', function (req, res, next) {

	var utils = app.src.utils.Utils;
	var file = req.params.id;
	var obj = utils.getCaminhoExcel();

	if (fs.existsSync(obj.pathExcel + file)) {
		res.sendFile(file, { root: obj.pathExcel });
	}else{
		res.status(500).send({ erro: 'Arquivo não encontrado' });
	}

});


app.get('/mobile/update', function (req, res, next) {
	//# '/mobile/'+process.env.APP_ENV.toLowerCase()+'/update'
	var pathAux = path.join(process.cwd(), '../mobile/');
	var file = "app-release.apk";

	if (fs.existsSync(pathAux + file)) {
		res.sendFile(file, { root: pathAux });
	}else{
		res.status(500).send({ erro: 'Arquivo não encontrado' });
	}
});


app.use(function (req, res, next) {
	/* let portHTTPS = 443;
  if (process.env.PORT == 3010) {
    portHTTPS = 3009;
  }
	if ((!req.secure) && (req.get('X-Forwarded-Proto') !== 'https') && req.host.indexOf("evolog") !== -1) {
		res.redirect('https://' + req.host + ':' + portHTTPS + req.url);
	} else { */
		i18n.setLocale('pt');
		next();
	//}
});


logger.info("Iniciando as importações dos módulos e das rotas...");
consign({
	cwd: process.cwd(),
	locale: 'pt-br',
	logger: console,
	verbose: true,
	extensions: ['.js', '.json', '.node'],
	loggingType: 'info'
})//.include('models')

	.then('config/logger.js')
	.then('src/utils')
	.then('src/modMonitoria/controllers/HashController.js')
	.then('src/modIntegrador/dao/FiltrosDAO.js')
	.then('src/modIntegrador/controllers/FiltrosController.js')

	.then('config/database.js')
	.then('config/ControllerBDV6.js')
	.then('config/ControllerBD.js')

	.then('src/modGlobal/models')
	.then('src/modGlobal/dao')
	.then('src/modGlobal/controllers')

	.then('src/modDocSyn/models')
	.then('src/modDocSyn/dao')
	.then('src/modDocSyn/controllers')

	.then('src/modIntegrador/models')
	.then('src/modIntegrador/dao')
	.then('src/modIntegrador/controllers')

	.then('src/modOferece/models')
	.then('src/modOferece/dao')
	.then('src/modOferece/controllers')

	.then('src/modOferecimento/models')
	.then('src/modOferecimento/dao')
	.then('src/modOferecimento/controllers')	

	.then('src/modDelivery/models')
	.then('src/modDelivery/dao')
	.then('src/modDelivery/controllers')	

	.then('src/modAG/models')
	.then('src/modAG/dao')
	.then('src/modAG/controllers')

	.then('src/modPagFrete/models')
	.then('src/modPagFrete/dao')
	.then('src/modPagFrete/controllers')

	.then('src/modWarehouse/models')
	.then('src/modWarehouse/dao')
	.then('src/modWarehouse/controllers/CommonController.js')
	.then('src/modWarehouse/controllers/SapBravoController.js')
	.then('src/modWarehouse/controllers/XcockpitController.js')
	.then('src/modWarehouse/controllers')
	.then('src/modWarehouse/soap')

	.then('src/modHoraCerta/models')
	.then('src/modHoraCerta/dao')
	.then('src/modHoraCerta/controllers')

	.then('src/modTestes/models')
	.then('src/modTestes/dao/DaoTestesC2.js')
	.then('src/modTestes/dao')
	.then('src/modTestes/controllers/CrlTestesC2.js')
	.then('src/modTestes/controllers')
	
	.then('src/modSFTP/controllers')

	.then('src/modTracking/models')
	.then('src/modTracking/dao')
	.then('src/modTracking/controllers')

	.then('src/modLogisticaReversa/models')
	.then('src/modLogisticaReversa/dao')
	.then('src/modLogisticaReversa/controllers')

	.then('src/modMonitoria/models')
	.then('src/modMonitoria/dao')
	.then('src/modMonitoria/controllers/EmailController.js')
	.include('src/modMonitoria/controllers')

	//.then('src/modIntegrador/wsdl/publishCancelService.js')
	.then('src/modIntegrador/wsdl/publishReleasedTripController.js')
	.then('src/modIntegrador/wsdl/publishReleasedTripService.js')
	.then('src/modIntegrador/wsdl/publishTransitionController.js')
	.then('src/modIntegrador/wsdl/publishTransitionService.js')
	.then('src/modIntegrador/wsdl/publishOccurrenceController.js')
	.then('src/modIntegrador/wsdl/publishOccurrenceService.js')
	//.then('src/modIntegrador/wsdl/OrderAcquisitionService.js')
	.then('src/modIntegrador/wsdl/ClienteSoap.js')

	//.then('routes/auth.js')
	.then('src/modTransportation/models')
	.then('src/modTransportation/dao')
	.then('src/modTransportation/controllers')

	.then('src/modDashboard/models')
	.then('src/modDashboard/dao')
	.then('src/modDashboard/controllers')

	//Modúlo de teste de connection v6
	.then('src/modConnectionTest/models')
	.then('src/modConnectionTest/dao')
	.then('src/modConnectionTest/controllers')

	.then('src/routes')
	.into(app);

logger.info("Iniciando rota 404...");
app.use(function (req, res, next) {
	res.status(404);
	res.sendFile(path.join(process.cwd() + '/public/404.html'));
});



logger.info("Iniciando rota de erro...");

app.use(function (err, req, res, next) {
	//verificando se veio algum erro do validador de entrada de campos para retornar o status adequado
	if (err.validador != undefined) {
		res.status(400);
		res.json(err.validador);
	} else {
		// Realizar validação de status a nivel de aplicação
		err.dsurl = req.protocol + '://' + req.get('host') + req.originalUrl;
		db.logErro(err)
			.then((r) => {
				res.status(500);
				res.json(r);
			})
			.catch((err) => {
				res.status(500);
				res.json(err);
			});
	}
});

module.exports = app;
