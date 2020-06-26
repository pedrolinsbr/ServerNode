const fs = require('fs');
var parser = require('xml2json');
var __dirname = '/home/bravolog/deliveries/';
var conversor = require('./ConversorArquivos');

module.exports = {

    listenFolder: async function (err, result) {
        return await fs.watch(__dirname, (eventType, filename) => {
            if (filename && eventType === 'change') {
                if (!filename) {
                    return err;
                }
                else {
                    return converterXmlparaJson(__dirname + filename);
                }
            }
        })
    }

}


/* functions com erros insert ocorrencia duplicada */
async function converterXmlparaJson(filename) {

    return await fs.readFile(filename, function (err, data) {
        if (err) {
            return err.message;
        }
        else {
            resultado = parser.toJson(data, { object: true, coerce: true });
            if (!resultado) {
                return err;
            }
        }
    })

}

function insertOcorrencia(poNumber, err) {
    var OcorrenciaModel = require('./occurrence');
    var ocorrencia = new OcorrenciaModel();
    ocorrencia.poNumber = poNumber;
    ocorrencia.messageError = JSON.stringify(err);

    return ocorrencia.save().then((resultado) => {
        return resultado;
    }).catch((err) => {
        console.log(err);
        return err;
    });

}

