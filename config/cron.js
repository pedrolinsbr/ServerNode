const cron = require('cron');
const logger = require('./logger');
const app = require('./app');

const exportXml = app.src.modTracking.controllers.NotasXmlController;
const ms = app.src.modDocSyn.controllers.MSController;
const inv = app.src.modDocSyn.controllers.InvoiceController;
const asn = app.src.modDocSyn.controllers.XASNController;
const ofe = app.src.modOferecimento.controllers.AvisoController;
const ofe2 = app.src.modOferecimento.controllers.FreteController;
const ag = app.src.modAG.controllers.AGController;
const apiSFTP = app.src.modSFTP.controllers.SFTPController;
var monitoria = app.src.modMonitoria.controllers.CronController;
var dashGestaoCd = app.src.modDashboard.controllers.GestaoCdController;
const portaria = app.src.modHoraCerta.controllers.PortariaController;
//var trafegus 		= app.src.modTransportation.controllers.TrafegusController;
var trafegus = app.src.modIntegrador.controllers.TrafegusController;
var edi = app.src.modTransportation.controllers.EdiController;
var averbacao = app.src.modTransportation.controllers.AverbacaoController;

logger.info('Iniciando o CRON...');


//# Oferecimento 2.0
if (process.env.APP_ENV == 'EVT') {

    module.exports.calculoFrete = new cron.CronJob({
        cronTime: '*/1 * * * *',
        onTick: async () => {
            logger.info('Executando Tarefa Cálculo de Frete Oferecimento');
            await ofe2.calculaFrete({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });


    module.exports.averbacaoCte = new cron.CronJob({
        cronTime: '0,10,20,30,40,50 5-23 * * *',
        onTick: () => {
            logger.info('Executando Tarefa Averbacao Cte');
            averbacao.testeIntegracao();
            averbacao.testeIntegracaoPR();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

}

if (process.env.APP_ENV == 'EVT') {

    //-----------------------------------------------------------------------\\
    /**
     * @module config/cron
     * @description Tarefa que executa leitura das notas e gera xml
     * @return {NULL} Sem retorno.
     */
    //-----------------------------------------------------------------------\\

    module.exports.notasXmlJob = new cron.CronJob({
        cronTime: '0 */2 * * *',
        onTick: async() => {
            logger.info('Executando Tarefa Notas JSON XML');
            await exportXml.listarNotasJsonXml();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\
    /**
     * @module config/cron
     * @description Rotinas para gerar docs Syngenta
     * @return {NULL} Sem retorno.
     */
    //-----------------------------------------------------------------------\\

    module.exports.newASN = new cron.CronJob({
        cronTime: '0,10,20,30,40,50 * * * *',
        onTick: async() => {
            logger.info('Executando Tarefa ASN');
            await asn.newASN({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.newMS = new cron.CronJob({
        cronTime: '1,11,21,31,41,51 * * * *',
        onTick: async() => {
            logger.info('Executando Tarefa newMS');
            await ms.newMS({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });


    //-----------------------------------------------------------------------\\

    module.exports.dbMS = new cron.CronJob({
        cronTime: '5,15,25,35,45,55 * * * *',
        onTick: async() => {
            logger.info('Executando Tarefa trackingMS');
            await ms.trackingMS({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.postAG = new cron.CronJob({
        cronTime: '0 */1 * * *',
        onTick: async() => {
            logger.info('Executando Tarefa Retorno de AG');
            await ag.postAGList({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.newInvoice = new cron.CronJob({
        cronTime: '9,19,29,39,49,59 * * * *',
        onTick: async() => {
            logger.info('Executando Tarefa newInvoice');
            await inv.newInvoice({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.upload = new cron.CronJob({
        cronTime: '3,8,13,18,23,28,33,38,43,48,53,58 * * * *',
        onTick: () => {
            logger.info('Executando Tarefa upload docs Syngenta');
            apiSFTP.sftpHandler('upload');
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.download = new cron.CronJob({
        cronTime: '*/5 * * * *',
        onTick: () => {
            logger.info('Executando Tarefa download delivery Syngenta');
            apiSFTP.sftpHandler('download');
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.envioEmail = new cron.CronJob({
        cronTime: '*/5 * * * *',
        onTick: () => {
            logger.info('Executando Tarefa Envio Email Oferecimento');
            ofe.envioAutomatico();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\
    /*
    	Envio automático de pesquisa de satisfação NPS para clientes monitoria
    */
    //-----------------------------------------------------------------------\\

    module.exports.envioNpsMonitoria = new cron.CronJob({
        cronTime: '0 0 */2 * * *',
        onTick: async function() {
            logger.info("Executando Tarefa envioNpsMonitoria");
            await monitoria.envioNpsMonitoria({});
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\
    /*
       Envio automático rastreios dos CTE/Notas para clientes monitoria
    */
    //-----------------------------------------------------------------------\\

    module.exports.envioRastereioCteMonitoria = new cron.CronJob({
        cronTime: '45 7 * * *',
        onTick: async function() {
            logger.info("Executando Tarefa envioRastereioCteMonitoria");
            await monitoria.envioRastereioCteMonitoriaV2();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.rastreioQM = new cron.CronJob({
        cronTime: '0 0 */1 * * *',
        onTick: () => {
            logger.info('Executando Tarefa Importação de QM Rastreio');
            monitoria.rastreioQM();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    // module.exports.retroativoXML = new cron.CronJob({
    //     cronTime: '0 0,0 * * *',
    //     onTick: () => {
    //         logger.info('Executando Tarefa Gerar XMLs retroativos');
    //         monitoria.retroativoXML();
    //     },
    //     start: true,
    //     timeZone: process.env.LOCAL_TIMEZONE
    // });
    //-----------------------------------------------------------------------\\

    module.exports.setaMotivoEntregaAtrasada = new cron.CronJob({
        cronTime: '0 16,4 * * *',
        onTick: () => {
            logger.info('Executando Tarefa Seta Motivo Atraso Transportador');
            monitoria.setaMotivoEntregaAtrasada();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.atualizaArmazenagem = new cron.CronJob({
        cronTime: '0 0 1 * * *',
        onTick: async function() {
            logger.info("Atualizando tabela de Armazenagem - G080");
            await dashGestaoCd.atualizarArmazenagem();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });


    //-----------------------------------------------------------------------\\

    module.exports.salvarViagem = new cron.CronJob({
        cronTime: '0,10,20,30,40,50 5-23 * * *',
        onTick: () => {
            logger.info('Executando Tarefa Envio carga trafegus');
            trafegus.salvarViagem();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.buscarEventos = new cron.CronJob({
        cronTime: '*/2 5-23 * * *',
        onTick: () => {
            logger.info('Executando Tarefa busca Eventos trafegus');
            trafegus.buscarEventos();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    //-----------------------------------------------------------------------\\

    module.exports.buscarUltimaPosicaoVeiculo = new cron.CronJob({
        cronTime: '30 5-23 * * *',
        onTick: () => {
            logger.info('Executando Tarefa ultima posicao veiculo trafegus');
            trafegus.buscarUltimaPosicaoVeiculo();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });
    //-----------------------------------------------------------------------\\
    /*
       Envio automático Edi de rastreio dos CTE/Notas para clientes. 
    */
    //-----------------------------------------------------------------------\\
    module.exports.processEdiAdm = new cron.CronJob({
        cronTime: '0 8,12,16 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando cliente Adm');
            edi.buscarConfigEdi(1);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiCargillXls = new cron.CronJob({
        cronTime: '0 8,14,20 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Cargill Excel');
            edi.buscarConfigEdi(2);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiAgroField = new cron.CronJob({
        cronTime: '0 8,14,20 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Cargill Excel');
            edi.buscarConfigEdi(3);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiCargillTxt = new cron.CronJob({
        cronTime: '40 7,9,11,13,15,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Cargill Txt');
            edi.buscarConfigEdi(6);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiHelm = new cron.CronJob({
        cronTime: '0 9,11 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Helm');
            edi.buscarConfigEdi(9);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiMacrofertil = new cron.CronJob({
        cronTime: '0 8 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Macrofertil');
            edi.buscarConfigEdi(11);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiNuFarm = new cron.CronJob({
        cronTime: '0 8,14,16 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando NuFarm');
            edi.buscarConfigEdi(12);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiOurofinoTxt = new cron.CronJob({
        cronTime: '0 8,16 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando OurofinoTxt');
            edi.buscarConfigEdi(14);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiOurofinoXls = new cron.CronJob({
        cronTime: '15 8,16 * * *',
        //cronTime: '* 8,11,15,17 * * 1-6',
        onTick: async() => {
            logger.info('[EDI] - Executando Ourofino XLS');
            edi.buscarConfigEdi(15);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiRotam = new cron.CronJob({
        cronTime: '0 9 * * 1-7',
        onTick: async() => {
            logger.info('[EDI] - Executando ROTAM');
            edi.buscarConfigEdi(16);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiSipcam = new cron.CronJob({
        cronTime: '10 2,13,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Sipcam');
            edi.buscarConfigEdi(17);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processSyngenta = new cron.CronJob({
        cronTime: '15 6,9,12 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Syngenta');
            edi.buscarConfigEdi(18);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiTecField = new cron.CronJob({
        cronTime: '0 8,12,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando TecField');
            edi.buscarConfigEdi(19);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiUPLConsignatario = new cron.CronJob({
        cronTime: '0 7,9,11,13,14,15,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Upl Consignatario');
            edi.buscarConfigEdi(21);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiUPL = new cron.CronJob({
        cronTime: '0 7,9,11,13,15,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Upl');
            edi.buscarConfigEdi(20);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiDupont = new cron.CronJob({
        cronTime: '5 8,9,10,11,12,13,14,15,16,17,18,19 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Dupont XML');
            edi.buscarConfigEdi(23);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiTecnoMyl = new cron.CronJob({
        cronTime: '0 8,14,16 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando TecnoMyl');
            edi.buscarConfigEdi(29);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiRenovagro = new cron.CronJob({
        cronTime: '0 8,14,16 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Renovagro');
            edi.buscarConfigEdi(30);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiDefensul = new cron.CronJob({
        cronTime: '0 8,14,16 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Defensul');
            edi.buscarConfigEdi(31);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiCargillMilho = new cron.CronJob({
        cronTime: '40 7,9,11,13,15,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Cargill Milho');
            edi.buscarConfigEdi(34);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiArysta = new cron.CronJob({
        cronTime: '0 8,14 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Arysta');
            edi.buscarConfigEdi(4);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiBasfTransit = new cron.CronJob({
        cronTime: '30 8 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Basf Transit');
            edi.buscarConfigEdi(33);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiBasfDelivered = new cron.CronJob({
        cronTime: '0 8 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Basf Delivered');
            edi.buscarConfigEdi(32);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processEdiBasfPING = new cron.CronJob({
        cronTime: '50 7,9,11,13,15,17 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Basf Ping');
            edi.buscarConfigEdi(36);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });


    module.exports.processEdiOpeneem = new cron.CronJob({
        cronTime: '15 9 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando Openeem');
            edi.buscarConfigEdi(13);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processFMC = new cron.CronJob({
        cronTime: '5 8,9,10,11,12,13,14,15,16,17,18,19 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando FMC');
            edi.buscarConfigEdi(24);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processDow = new cron.CronJob({
        cronTime: '5 8,9,10,11,12,13,14,15,16,17,18,19 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando DOW');
            edi.buscarConfigEdi(22);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

    module.exports.processBayerXml = new cron.CronJob({
        cronTime: '5 8,9,10,11,12,13,14,15,16,17,18,19 * * *',
        onTick: async() => {
            logger.info('[EDI] - Executando BayerXml');
            edi.buscarConfigEdi(25);
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });

}

//-----------------------------------------------------------------------\\

if (process.env.APP_ENV == 'QAS') {

    module.exports.solicitarEntrada = new cron.CronJob({
        cronTime: '*/30 * * * *',
        onTick: async function() {
            logger.info("Solicitando entrada automatica portaria DPA Paulinia");
            await portaria.solicitarEntradaAuto();
        },
        start: true,
        timeZone: process.env.LOCAL_TIMEZONE
    });
}

//-----------------------------------------------------------------------\\

for (var key in this) {
    logger.info(`Tarefa: ${key}`);
    this[key].start();
}

//-----------------------------------------------------------------------\\

// if (process.env.APP_ENV == 'PRD' && process.env.PORT == '3000') {

// 	module.exports.salvarViagem = new cron.CronJob({
// 		cronTime: '0,10,20,30,40,50 5-23 * * *',
// 		onTick: () => {
// 			logger.info('Executando Tarefa Envio carga trafegus');
// 			trafegus.salvarViagem();
// 			//trafegus.buscarUltimaPosicaoVeiculo();
// 			//trafegus.buscarEventos();
// 		},
// 		start: true,
// 		timeZone: process.env.LOCAL_TIMEZONE
// 	});

// }