
/**
 * @description Possui função gera data contratada
 * @author Vanessa Souto
 * @since 07/02/2018
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Retorna um objeto DATA (DD/MM/YYYY).
*/

const moment = require('moment');
const db = require(process.cwd() + '/config/database');
const timezone = require('moment-timezone');
const interval = require('moment-interval');


module.exports = function (app, cb) {
    var fn = {};

    fn.fimDeSemana = async function (data) {

        var feriado = await this.feriado(data);

        if (feriado) {
            data = moment(data, 'DD/MM/YYYY').add(1, 'days');
        }

        const diaDaSemana = await moment(data, 'DD/MM/YYYY').format('dddd');


        if (diaDaSemana === 'Sábado') {
            //console.log('é sabado');
            data = moment(data, 'DD/MM/YYYY').add(2, 'days');
            //console.log('sabado add', data);
            return data;
        }
        else if (diaDaSemana === 'Domingo') {
            //console.log('é domingo');
            data = moment(data, 'DD/MM/YYYY').add(1, 'days');
            //console.log('domingo add ', data);
            return data;
        }

        //console.log('fds', data);

        //return data;

        return await moment(data, 'DD/MM/YYYY').format('DD/MM/YYYY');

    }

    fn.feriado = async function (data) {

        var dia = moment(data, 'DD/MM/YYYY').format('DD');
        var mes = moment(data, 'DD/MM/YYYY').format('MM');
        var ano = moment(data, 'DD/MM/YYYY').format('YYYY');

        return await db.execute(
            {
                sql: `
            Select
                   G054.IDG054,
                   G054.DSFERIAD
            From   G054 G054
            Where  G054.SnDelete = 0  AND
                G054.DTDIAFER = ` + dia + ` AND
                G054.DTMESFER = ` + mes + ` AND
               NVL(G054.DTANOFER,`+ ano + `) = ` + ano,
                param: [],
            })
            .then((result) => {

                if (result.length > 0) {
                    //console.log('Eh feriado');
                    return true;
                }
                return false;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    fn.buscaQtFeriadosPeriodo = async function (dtInicio, dtFinal, cidade) {

        return await db.execute(
            {
                sql: ` 
                Select count(*) as QtFeriad
                From
                (Select distinct
                        to_date(G054.DtDiaFer || '/' || G054.DtMesFer || '/' || 
                            nvl(G054.DtAnoFer, to_char(sysdate, 'yyyy')), 'dd/mm/yyyy') as DtFeriad         
                       
                  From   G054 G054, G055 G055, G003 G003, G002 G002
                  Where  
                        G054.SnDelete = 0  
                    and G055.SnDelete = 0   
                    and G054.IdG054 = G055.IdG054
                    and G003.IdG002 = G002.IdG002
                    and G003.IdG003 = nvl(G055.IdG003, G003.IdG003)
                    and G003.IdG002 = nvl(G055.IdG002, G003.IdG002)
                    and G002.IdG001 = nvl(G055.IdG001, G002.IdG001)
                    and G003.IdG003 = :idG003 ) Feriados
              Where DtFeriad >= to_date(:dtInicio, 'dd/mm/yyyy') and
                    DtFeriad <= to_date(:dtFinal, 'dd/mm/yyyy')  and
                    to_char(DtFeriad, 'D') not in ('1','7')`,
                param: {
                    dtInicio: dtInicio.format('DD/MM/YYYY'),
                    dtFinal: dtFinal.format('DD/MM/YYYY'),
                    idG003: cidade
                }
            })
            .then((result) => {

                if (result.length > 0) {
                    return result[0].QTFERIAD;
                }
                return 0;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    fn.addDiasTrabalho = async function (data, dias) {
        let dataBase = dias > 0 ? moment(data, 'DD/MM/YYYY').add(1, 'days') : data;

        let diaDaSemana = await dataBase.format('d');
        if (diaDaSemana == 6) {
            dataBase = dataBase.add(2, 'days');
        } else if (diaDaSemana == 0) {
            dataBase = dataBase.add(1, 'days');
        }

        return (dias > 0 ? await fn.addDiasTrabalho(dataBase, dias - 1) : dataBase);
    }

    fn.addDiasUteis = async function (data, dias, cidade) {
        let dataInicio = moment(data, 'DD/MM/YYYY');

        let dataFim = await fn.addDiasTrabalho(dataInicio, dias);

        let qtFeriad = await fn.buscaQtFeriadosPeriodo((dias > 0 ? dataInicio.add(1, 'days') : dataInicio), dataFim, cidade);

        if (qtFeriad) {
            dataFim = await fn.addDiasUteis(dataFim, qtFeriad, cidade);
        }
        return dataFim;
    }

    fn.addDiasCorridos = async function (data, dias, cidade) {
        let dataInicio = moment(data, 'DD/MM/YYYY');

        let dataFim = dias == 0 ? moment(data, 'DD/MM/YYYY').add(1, 'days') : moment(data, 'DD/MM/YYYY').add(dias, 'days');
        let diaDaSemana = await dataFim.format('d');
        if (diaDaSemana == 6) {
            dataFim = dataFim.add(2, 'days');
        } else if (diaDaSemana == 0) {
            dataFim = dataFim.add(1, 'days');
        }

        let qtFeriad = await fn.buscaQtFeriadosPeriodo(dataFim, dataFim, cidade);

        if (qtFeriad) {
            dataFim = dataFim.add(qtFeriad, 'days');
        }
        return dataFim;
    }

    fn.dataContratada = async function (data, diasEntrega, diasColeta, origem, destino) {
        let dataEntrega = await fn.addDiasUteis(data, diasEntrega, destino);
        return dataEntrega.format('DD/MM/YYYY');
    };


    // Verifica se hora1 é maior que hora2.
    fn.compararHoraString = async function (hora1, hora2, horai) {
        hora1 = hora1.split(":");
        hora2 = hora2.split(":");
        horai = horai.split(":");

        var d = new Date();
        var data1 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hora1[0], hora1[1]);
        var data2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hora2[0], hora2[1]);
        var horai = new Date(d.getFullYear(), d.getMonth(), d.getDate(), horai[0], horai[1]);

        return (horai >= data1 && horai <= data2);
    };



    fn.curlHttpPost = async function (host, path, objPost) {

        let http = require("http");
        let querystring = require('querystring');
        let postObj = querystring.stringify(objPost);

        let options = {
            host: host,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postObj)
            }
        };

        let reqCurl = http.request(options, function (res) {

            res.setEncoding('utf8');
            res.on('data', function (chunk) {

            });
        });
        // post the data
        reqCurl.write(postObj);
        reqCurl.end();

    };

    fn.getCaminhoExcel = function () {

        var pathExcel = null;
        var win32 = 0;
        // Verifica se é Windows
        if (process.platform === "win32") {
            pathExcel = process.cwd() + '\\..\\';
            win32 = 1;
        } else {
            // Caso se diferente ele vai para a pasta do Linux.
            pathExcel = "/dados/excel/" + process.env.APP_ENV.toLowerCase() + "/";
            win32 = 0;
        }

        return { pathExcel: pathExcel, win32: win32 };
    }


    fn.calcularDistancia = async function (pLatLng1, pLatLng2) {
        var lLatLng1 = pLatLng1.split(',');
        var lLatLng2 = pLatLng2.split(',');

        var lVrCalcul = 6371; // km
        var lVrDecLat = await fn.ConverterDistancia(lLatLng2[0] - lLatLng1[0]);
        var lVrDecLon = await fn.ConverterDistancia(lLatLng2[1] - lLatLng1[1]);
        var lVrLatit1 = await fn.ConverterDistancia(lLatLng1[0]);
        var lVrLatit2 = await fn.ConverterDistancia(lLatLng2[0]);

        var lVrResulA = Math.sin(lVrDecLat / 2) * Math.sin(lVrDecLat / 2) +
            Math.cos(lVrLatit1) * Math.cos(lVrLatit2) *
            Math.sin(lVrDecLon / 2) * Math.sin(lVrDecLon / 2);
        var lVrResulB = 2 * Math.atan2(Math.sqrt(lVrResulA), Math.sqrt(1 - lVrResulA));
        var lVrResulC = lVrCalcul * lVrResulB * 1000;

        return Math.sqrt(lVrResulC);
    }

    fn.ConverterDistancia = async function (pVrLatLng) {
        return (pVrLatLng * Math.PI / 180.0);
    }

    fn.BuscaDiasTrabalho = async function (data, dias) {
        let qtdAtualDias = dias;
        let diaDaSemana;
        let dataAux = moment(data, 'DD/MM/YYYY').add(1, 'days');

        for (let i = 0; i < dias; i++) {
            diaDaSemana = await dataAux.format('d');
            if (diaDaSemana == 6) {
                qtdAtualDias -= 1;
            } else if (diaDaSemana == 0) {
                qtdAtualDias -= 1;
            }
            dataAux = moment(dataAux, 'DD/MM/YYYY').add(1, 'days');
        }

        return (qtdAtualDias > 0 ? qtdAtualDias : 0);
    }

    fn.BuscaDiasUteis = async function (dias, feriados, cidade) {
        let dataInicio = moment((new Date()), 'DD/MM/YYYY');

        let qtdAtual = await fn.BuscaDiasTrabalho(dataInicio, dias);

        if (feriados && feriados != null) {
            for (let i = 0; i < dias; i++) {
                for (let j = 0; j < feriados.length; j++) {
                    if (feriados[j].DtFeriad == (dataInicio.format('DD/MM/YYYY')) && (feriados[j].cidFeriad == null || feriados[j].cidFeriad == cidade)) {
                        qtdAtual -= 1;
                    }
                }
                dataInicio = moment(dataInicio, 'DD/MM/YYYY').add(1, 'days');
            }
        }

        return qtdAtual > 0 ? qtdAtual : 0;
    }

    fn.buscaFeriadosCidade = async function (ano) {

        return await db.execute(
            {
                sql: ` 
                Select distinct
                    to_char(to_date(G054.DtDiaFer || '/' || G054.DtMesFer || '/' || 
                    nvl(G054.DtAnoFer, to_char(sysdate, 'yyyy')), 'dd/mm/yyyy'),'dd/mm/yyyy') as DtFeriad,

                    G055.IDG003 as cidFeriad
                       
                  From   G054 G054, G055 G055, G003 G003, G002 G002
                  Where  
                        G054.SnDelete = 0  
                    and G055.SnDelete = 0   
                    and G054.IdG054 = G055.IdG054
                    and G003.IdG002 = G002.IdG002
                    and G003.IdG003 = nvl(G055.IdG003, G003.IdG003)
                    and G003.IdG002 = nvl(G055.IdG002, G003.IdG002)
                    and G002.IdG001 = nvl(G055.IdG001, G002.IdG001)
                    and to_date(G054.DtDiaFer || '/' || G054.DtMesFer || '/' || 
                    nvl(G054.DtAnoFer, to_char(sysdate, 'yyyy')), 'dd/mm/yyyy') >= to_date('01/11/${ano - 1}','dd/mm/yyyy')
                    and to_date(G054.DtDiaFer || '/' || G054.DtMesFer || '/' || 
                    nvl(G054.DtAnoFer, to_char(sysdate, 'yyyy')), 'dd/mm/yyyy') <= to_date('01/02/${ano + 1}','dd/mm/yyyy')
                    and to_char(to_date(G054.DtDiaFer || '/' || G054.DtMesFer || '/' || 
                    nvl(G054.DtAnoFer, to_char(sysdate, 'yyyy')), 'dd/mm/yyyy'),'D') not in ('1','7')`,
                param: {
                }
            })
            .then((result) => {
                return result;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
    };

    fn.leftPad  = function (value, totalWidth, paddingChar = '0') {
        var length = totalWidth - value.toString().length + 1;
        return Array(length).join(paddingChar) + value;
    };



        return fn;
    }