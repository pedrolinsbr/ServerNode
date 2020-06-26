var moment = require('moment');
var db = require(process.cwd() + '/config/database');


async function fimDeSemana(data){
    const diaDaSemana = await moment(data, 'DD/MM/YYYY').format('dddd');
    return diaDaSemana;
}


async function feriado(dia, mes, ano){
    return await db.execute(
        {
            sql: `
            Select
                   G054.IDG054,
                   G054.DSFERIAD
            From   G054 G054
            Where  G054.SnDelete = 0  AND
                G054.DTDIAFER = ` + dia +`
                G054.DTMESFER = ` + mes +`
                G054.DTANOFER = ` + ano,
            param: [],
        })
        .then((result) => {
            return (result[0]);
        })
        .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        });
};

exports.dataContratada = async (data, dias) => {
    //dia
    var dia = moment(data, 'DD/MM/YYYY').format('DD');
    var mes = moment(data, 'DD/MM/YYYY').format('MM');
    var ano = moment(data, 'DD/MM/YYYY').format('YYYY');

    // soma dias
    var adddias = moment(data, 'DD/MM/YYYY').add(2, 'days');
    var data = moment(adddias, 'DD/MM/YYYY').format('DD/MM/YYYY');

    var fimDeSemana = fimDeSemana(data)

    return fimDeSemana;
}
