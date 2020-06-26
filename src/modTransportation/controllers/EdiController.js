module.exports = function(app, cb) {
    var api = {};
    var logger = app.config.logger;
    var dao = app.src.modTransportation.dao.EdiDAO;
    const fs = require('fs');
    const utilsCA = app.src.utils.ConversorArquivos;
    var utils = app.src.utils.Utils;

    api.buscarConfigEdi = async function(idg094) {

        await dao.buscarConfigEdi(idg094)
            .then((result1) => {
                console.log(result1);
            })
            .catch((err) => {
                console.log("Erro processo Edi Rastreio cliente: " + idg094 + " Erro: " + err);
                throw err;
            });
    };

    api.getEdiTrackingCliente = async function(req, res, next) {
        await dao.getEdiTrackingCliente(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.getEdiList = async function(req, res, next) {
        await dao.getEdiList(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.atualizarConfigEdi = async function(req, res, next) {
        await dao.atualizarConfigEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.desativarConfigEdi = async function(req, res, next) {
        await dao.desativarConfigEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.createConfigEdi = async function(req, res, next) {
        await dao.createConfigEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.buscaCamposEdiListAll = async function(req, res, next) {
        await dao.buscaCamposEdiListAll(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.listAllFieldsEdi = async function(req, res, next) {
        await dao.listAllFieldsEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.listFieldToConcat = async function(req, res, next) {
        await dao.listFieldToConcat(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };


    api.removeFieldEdi = async function(req, res, next) {
        await dao.removeFieldEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };



    api.createNewFieldEdi = async function(req, res, next) {
        await dao.createNewFieldEdi(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.updateOrderField = async function(req, res, next) {
        await dao.updateOrderField(req, res, next)
            .then((result1) => {
                res.json(result1);
            })
            .catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    };

    api.listarConfigEdi = async function(req, res, next) {
        await dao.listarConfigEdi(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };
    
    api.buscaClienteOperacao = async function(req, res, next) {
        await dao.buscaClienteOperacao(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                console.log("[ERROR]: ", err);
                next(err);
            });
    };




    api.verificarErro = async function(req, res, next) {
        await dao.verificarErro(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                logger.error("[ERROR]: ", err);
                next(err);
            });
    };



    const axios = require('axios');
    api.processarEdiAux = async function(req, res, next) {
        await dao.processarEdi(req, res, next)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                logger.error("[EDI ERROR]: ", err);
                next(err);
            });
    };

    api.processarEdi = async function(req, res, next) {
        logger.info('[EDI] Executando processarEdiAux para processar arquivos enviados');
        axios.post('http://34.238.36.203/api/tp/edi/processarEdiAux', req.body)
        //axios.post('http://localhost:3000/api/tp/edi/processarEdiAux', req.body)
            .then((result) => {
                res.json(result.data);
            }).catch((err) => {
                logger.error("[EDI] - Erro: ", err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }


    api.listarArquivos = async function(req, res, next) {
        logger.info('[EDI] Executando listarArquivos para buscar arquivos enviados');
        axios.post('http://34.238.36.203/api/tp/edi/listarArquivosAux', req.body)
        //axios.post('http://localhost:3000/api/tp/edi/listarArquivosAux', req.body)
            .then((result) => {
                res.json(result.data);
            }).catch((err) => {
                logger.error("[EDI] - Erro: ", err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });

    }

    api.listarArquivosAux = async function(req, res, next) {
        logger.info('[EDI] Executando listarArquivosAux para buscar arquivos enviados, cliente: ', req.body.NMCLIENT.text);
        try {
            let dataFilter = new Date();
            let transpFilter = req.body.NMCLIENT.text;
            let pastaFilter = req.body.NM_PASTA;
            let pathFilter = null;
            let arquivos = null;
            let files = [];
            let obj = null;
            var dt_create = '';
            let path = null;
            if (process.platform === "win32") {
                path = process.cwd() + '/../edi/' + transpFilter; // Verifica se é Windows
            } else {
                path = "/dados/edi/rastreio/" + transpFilter; // Caso se diferente ele vai para a pasta do Linux.                
            }

            if (pastaFilter == 'Backup') {
                pathFilter = path + '/' + 'Backup';
            } else {
                pathFilter = path + '/' + 'logs';
            }

            if (!fs.existsSync(pathFilter)) {
                logger.info("[EDI] Pasta nao existe ");
            } else {
                let pastas = fs.readdirSync(path);
                // for (key in pastas) {
                if (pastaFilter != null && pastaFilter != undefined && pastaFilter != '') {
                    arquivos = fs.readdirSync(pathFilter);
                    for (key in arquivos) {
                        var criacao = await fs.statSync(pathFilter + '/' + arquivos[key]);
                        if (req.body.DT_PROCESS) {
                            var dia = req.body.DT_PROCESS.day;
                            var mes = req.body.DT_PROCESS.month;
                            if (dia < 10) {
                                dia = '0' + dia;
                            }
                            if (mes < 10) {
                                mes = '0' + mes;
                            }
                            dataFilter.setDate(dia);
                            dataFilter.setFullYear(req.body.DT_PROCESS.year);
                            dataFilter.setMonth(mes - 1);
                            dataFilter.setHours(00);
                            dataFilter.setMinutes(00);
                            if (criacao.atime >= dataFilter) {
                                obj = {
                                    'DATAPROCESS': converterHora(criacao.atime),
                                    'ARQUIVO': (arquivos[key] ? arquivos[key] : null),
                                    'PASTA': (pastaFilter ? pastaFilter : null),
                                    'TRANSPORTADORA': (transpFilter ? transpFilter : null)
                                };
                                files.push(obj);
                            }
                        } else {
                            obj = {
                                'DATAPROCESS': converterHora(criacao.atime),
                                'ARQUIVO': (arquivos[key] ? arquivos[key] : null),
                                'PASTA': (pastaFilter ? pastaFilter : null),
                                'TRANSPORTADORA': (transpFilter ? transpFilter : null)
                            };
                            files.push(obj);
                        }
                    }
                }
                // }
            }

            res.json(files);
        } catch (err) {
            logger.error(err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }

    };


    api.visualizarArquivo = async function(req, res, next) {
        axios.post('http://34.238.36.203/api/tp/edi/visualizarArquivoAux', req.body)
            .then((result) => {
                res.json(result.data);
            }).catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }


    api.visualizarArquivoAux = function(req, res, next) {
        logger.info("[EDI] Executando visualizarArquivoAux: ", req.body.TRANSPORTADORA);
        try {
            let transp = req.body.TRANSPORTADORA;
            let pasta = req.body.PASTA;
            let arquivo = req.body.ARQUIVO;
            let pathArquivo = null;
            let path = null;
            // Verifica se é Windows
            if (process.platform === "win32") {
                path = process.cwd() + '/../edi/' + transp;
            } else {
                // Caso se diferente ele vai para a pasta do Linux.
                path = "/dados/edi/rastreio/" + transp;
            }
            pathArquivo = path + '/' + 'Backup/' + arquivo;
            logger.info("[EDI] Arquivo a visualizar: ", pathArquivo);
            let strArquivo = utilsCA.lerArquivo(pathArquivo);
            res.json(strArquivo);
        } catch (err) {
            logger.error('[EDI] Erro: ', err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
        }
    }

    api.downloadEdiFile = async function(req, res, next) {
        axios.post('http://34.238.36.203/api/tp/edi/downloadEdiFileAux', req.body)
            .then((result) => {
                res.json(result.data);
            }).catch((err) => {
                console.log(err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
    }

    api.downloadEdiFileAux = async function(req, res) {
        logger.info('[EDI] Executar downloadEdiFile: ' + res);
        var nmfile = req.body.objeto.ARQUIVO;
        var transp = req.body.objeto.TRANSPORTADORA;
        var pasta = 'Backup';
        // Verifica se é Windows
        if (process.platform === "win32") {
            path = process.cwd() + '/../edi/' + transp + '/' + pasta;
        } else {
            // Caso se diferente ele vai para a pasta do Linux.
            path = "/dados/edi/rastreio/" + transp + '/' + pasta;
        }
        var file = path + '/' + nmfile;
        console.log(file)
        if (fs.existsSync(file)) {
            res.download(file);
        } else {
            logger.error("[EDI] Erro - Arquivo não encontrado.:", err);
            throw err;
        }
    }


    function converterHora(dt) {
        var returnHora = ' ';
        if (dt != null) {
            var hour = dt.getHours();
            var minute = dt.getMinutes();
            var day = dt.getDate();
            var month = dt.getMonth() + 1;
            var year = dt.getFullYear();
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (minute < 10) {
                minute = '0' + minute;
            }
            returnHora = day + "/" + month + "/" + year + " " + hour + ":" + minute;
        }
        return returnHora;
    };

    return api;
};