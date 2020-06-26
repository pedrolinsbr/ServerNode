/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 28/06/2018
 * 
 */

/** 
 * @module dao/OcorrenciaCarga
 * @description G067.
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
 */
module.exports = function(app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var dicionario = app.src.utils.Dicionario;
    var dtatu = app.src.utils.DataAtual;
    var acl = app.src.modIntegrador.controllers.FiltrosController;
    var logger = app.config.logger;
    api.controller = app.config.ControllerBD;
    const tmz = app.src.utils.DataAtual;

    /**
     * @description #Listar um dados da tabela A004.
     *
     * @async
     * @function api/listar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.listar = async function(req, res, next) {
        logger.debug("Inicio listar");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros recebidos:", req.body);
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'T014', true);
            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

            console.log('sqlWhere ', sqlWhere)
            console.log('bindValues ', bindValues)
            sqlWhere += " AND A004.SNDELETE = 0 "
                //sqlWhere = " WHERE A004.SNDELETE = 0 and T014.IDT014 is not null and  T014.CDAUTOR = :T014_CDAUTOR and NVL2(T014.IDUSUDOW, 1, 0) like '%:T014_ISDOWN%' and T014.IDAUTOR like '%:T014_IDAUTOR%' ";
                //console.log('sqlWhere ', sqlWhere)
            let result = await con.execute({
                    sql: `select 
                            T014.IDT014, 
                            A004.IDA004, 
                            T014.CDAUTOR, 
                            T014.IDAUTOR, 
                            A004.NMANEXO, 
                            T014.DSOBSERV,
                            T014.DTCADAST,  
                            A004.TPEXTENS, 
                            NVL2(T014.IDUSUDOW, 'Sim', 'Não') ISDOWN, 
                            case 
                                when S001.NMUSUARI is not null then S001.NMUSUARI||' ['||S001.IDS001||']'
                                else '' 
                            end as IDUSUDOW, 
                            T014.DTDOWNLO,
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN 'Motorista' 
                                WHEN 2 THEN 'Veículo' 
                                WHEN 3 THEN 'Tipo de Veículo' 
                                WHEN 4 THEN 'Cliente' 
                            END TPAUTOR, 
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(G031.NMMOTORI)||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' FROM G031 WHERE G031.SNDELETE = 0 AND IDG031 = T014.IDAUTOR ) 
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSAUTOR, 
                            
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(g024x.NMTRANSP) ||' ['|| g024x.IDLOGOS ||']' FROM G031 g031x 
                                JOIN g024 g024x ON g024x.idg024 = g031x.idg024
                                WHERE G031x.SNDELETE = 0 AND G031x.IDG031 = T014.IDAUTOR ) 
                                
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSEMPRES, 

                            COUNT(T014.IDT014) OVER() as COUNT_LINHA from A004 
                        left join T014 on T014.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                        left join S001 on S001.SNDELETE = 0 AND S001.IDS001 = T014.IDUSUDOW ` +
                        sqlWhere +
                        sqlPaginate,
                    param: bindValues
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (utils.construirObjetoRetornoBD(result, req.body));
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim listar");
            return result;

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };


    api.salvarT014 = async function(req) {

        logger.info("Inicio salvarT014: ");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            logger.info("Parametros recebidos:", req.body);
            let result = await con.insert({
                    tabela: 'T014',
                    colunas: {
                        CDAUTOR: req.body.CDAUTOR,
                        IDAUTOR: req.body.IDAUTOR,
                        DSOBSERV: req.body.DSOBSERV,
                        IDUSUCAD: req.body.IDUSUCAD,
                        DTCADAST: tmz.dataAtualJS(),
                        SNDELETE: 0,

                    },
                    key: 'IDT014'
                })
                .then((result1) => {
                    logger.info("Retorno, criado IDT014: ", result1);
                    return result1;
                })
                .catch((err) => {
                    logger.error("Erro:", err);
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            logger.debug("Fim salvar");
            return result;

        } catch (err) {
            await con.closeRollback();
            logger.error("Erro:", err);
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;

        }

    };

    /**
     * @description Listar um dado na tabela G067.
     *
     * @async
     * @function api/buscar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.buscar = async function(req, res, next) {

        logger.debug("Inicio buscar");
        let con = await this.controller.getConnection(null, req.UserId);

        try {

            var id = req.body.IDG067;
            logger.debug("Parametros buscar:", req.body);

            let result = await con.execute({
                    sql: ` Select G067.IDG067,
                      G067.DSOCORRE,
                      G067.STCADAST,
                      G067.DTCADAST,
                      COUNT(G067.IdG067) OVER () as COUNT_LINHA
                 From G067 G067
                Where G067.IdG067   = : id
                  And G067.SnDelete = 0`,
                    param: {
                        id: id
                    }
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (result[0]);
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    throw err;
                });

            await con.close();
            logger.debug("Fim buscar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }

    };





    /**
     * @description Salvar um dado na tabela G067.
     *
     * @async
     * @function api/salvar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.salvar = async function(req, res, next) {
        logger.debug("Inicio salvar: " + req.body);
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.info("Parametros recebidos:", req.body);
            let result = await con.insert({
                    tabela: 'T014',
                    colunas: {
                        CDAUTOR: req.body.CDAUTOR,
                        IDAUTOR: req.body.IDAUTOR,
                        DSOBSERV: req.body.DSOBSERV,
                        IDUSUCAD: req.body.IDUSUCAD,
                        DTCADAST: tmz.dataAtualJS(),
                        SNDELETE: 0,
                        SNDOWN: 0,

                    },
                    key: 'IDT014'
                })
                .then((result1) => {
                    logger.info("Retorno, criado IDT014: ", result1);
                    return result1;
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim salvar");
            return result;

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };

    /**
     * @description Atualizar um dado na tabela G067, .
     *
     * @async
     * @function api/atualizar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.atualizar = async function(req, res, next) {

        logger.debug("Inicio atualizar");
        let con = await this.controller.getConnection(null, req.UserId);
        try {

            var id = req.body.IDG067;
            logger.debug("Parametros recebidos:", req.body);

            let result = await
            con.update({
                    tabela: 'G067',
                    colunas: {

                        DSOCORRE: req.body.DSOCORRE,
                        STCADAST: req.body.STCADAST
                    },
                    condicoes: 'IdG067 = :id',
                    parametros: {
                        id: id
                    }
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.update') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim atualizar");
            return result;

        } catch (err) {

            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };

    /**
     * @description Delete um dado na tabela A004.
     *
     * @async
     * @function api/excluir
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.excluir = async function(req, res, next) {
        logger.debug("Inicio excluir");
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("ID selecionados");
            var id = req.body.IDA004;
            let result = await con.update({
                    tabela: 'A004',
                    colunas: {
                        SnDelete: 1
                    },
                    condicoes: ` IDA004 in (` + id + `)`
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            let result_T014 = await con.update({
                    tabela: 'T014',
                    colunas: {
                        SnDelete: 1
                    },
                    condicoes: ` IDT014 in (` + req.body.IDT014 + `)`
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim excluir");
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };


    /**Filtro clientes relacionados a EDI */
    api.buscarAutor = async function(req, res, next) {
        console.log("Inicio buscar buscarAutor");
        try {
            console.log("Parametros buscar (buscarAutor)");
            let tipoAutor = req.body.parameterDep.CDAUTOR;
            let db = await this.controller.getConnection(null, req.UserId);
            let sql = "";
            switch (tipoAutor) {
                case 1: //Motorista
                    sql = ` SELECT G031.IDG031 id, G031.NMMOTORI||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' text FROM G031 WHERE Upper(G031.NMMOTORI) Like Upper(:parameter) OR G031.CJMOTORI Like Upper(:parameter)`;
                    break;
                case 2: //Veiculo
                    sql = ` SELECT G032.IDG032 id, G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' text FROM G032 WHERE G032.SNDELETE = 0 AND (Upper(G032.NRPLAVEI) Like Upper(:parameter) OR G032.DSVEICUL Like Upper(:parameter)  OR G032.NRFROTA Like Upper(:parameter) )`;
                    break;
                case 3: //Tipo de Veiculo
                    sql = ` SELECT G030.IDG030 id, G030.DSTIPVEI||' ['||G030.IDG030||']' text FROM G030 WHERE G030.SNDELETE = 0 and Upper(G030.DSTIPVEI) Like Upper(:parameter) `;
                    break;
                case 4: //Cliente
                    sql = ` SELECT G005.IDG005 id, G005.NMCLIENT||' '||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' text FROM G005 WHERE G005.SNDELETE = 0 and ( Upper(G005.NMCLIENT) Like Upper(:parameter) or Upper(G005.CJCLIENT) Like Upper(:parameter) ) `;
                    break;
            }
            return result = await db.execute({
                    sql,
                    param: {
                        parameter: '%' + req.body.parameter + '%'
                    }
                })
                .then((result) => {
                    return utils.array_change_key_case(result);
                }).catch((err) => {
                    logger.info("Erro:", err);
                    throw err;
                });

        } catch (err) {
            logger.error("Erro:", err);
            throw new Error(err);
        }
    };

    api.getDocumentoByAutor = async function(req, res, next) {
        console.log("getDocumentoAutor ", req.body)
        let m1 = 0; let m2 = 0; let m3 = 0;
        let v1 = 0; let v2 = 0; let v3 = 0;

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'T014', false);
            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

            console.log('sqlWhere ', sqlWhere)
            console.log('bindValues ', bindValues)
        try {
            
            if (req.body.IDG031M1){m1 = req.body.IDG031M1.id}
            if (req.body.IDG031M2){m2 = req.body.IDG031M2.id}
            if (req.body.IDG031M3 ){m3 = req.body.IDG031M3.id}

            if (req.body.IDG032V1){v1 = req.body.IDG032V1.id}
            if (req.body.IDG032V2){v2 = req.body.IDG032V2.id}
            if (req.body.IDG032V3 ){v3 = req.body.IDG032V3.id}
            let con = await this.controller.getConnection(null, req.UserId);
            sql = ` select T014.IDT014, T014.CDAUTOR, T014.IDAUTOR, T014.DSOBSERV, T014.IDUSUCAD, T014.DTCADAST, T014.IDUSUDOW, T014.DTDOWNLO,
                A004.NMANEXO, A004.TPEXTENS, A004.TPCONTEN, A004.AQANEXO 
                From T014 
                Left Join A004 on A004.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                Where T014.SNDELETE =0 and T014.IDUSUDOW is null and T014.CDAUTOR = 1 and ( IDAUTOR = ` + m1 + ` or IDAUTOR = ` + m2 + ` or IDAUTOR = ` + m3 + `) union all 
                
                select T014.IDT014, T014.CDAUTOR, T014.IDAUTOR, T014.DSOBSERV, T014.IDUSUCAD, T014.DTCADAST, T014.IDUSUDOW, T014.DTDOWNLO,
                A004.NMANEXO, A004.TPEXTENS, A004.TPCONTEN, A004.AQANEXO 
                From T014 
                Left Join A004 on A004.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                Where T014.SNDELETE =0 and T014.IDUSUDOW is null and T014.CDAUTOR = 2 and ( IDAUTOR = ` + v1 + ` or IDAUTOR = ` + v2 + ` or IDAUTOR = ` + v3 + `) `;
            let result = await con.execute({
                sql,
                param: {},
            }).then((result) => {
                return result[0];
            }).catch((err) => {
                logger.error("Erro: ", err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
            await con.close();
            return result;
        } catch (err) {
            res.status(500).send({ strErro: err.message });
        }
    }

    api.saveUploadDoc = async function(req, res, next) {
        logger.info("Inicio salvar arquivo upload (saveUploadDoc)");
        try {

            var blOK = true;
            var strErro = 'Não foi possível inserir';
            var con = await this.controller.getConnection(null, req.UserId);
            var objInfo = {};
            var arFiles = req.files;
            if ((Array.isArray(arFiles)) && (arFiles.length > 0)) {
                for (objFile of arFiles) {
                    var idT014 = await this.salvarT014(req);
                    console.log("idT014, ", idT014)
                    objInfo.DTDOCUME = new Date();
                    objInfo.CTDOCUME = objFile.buffer;
                    objInfo.TMDOCUME = objFile.size;
                    objInfo.NMDOCUME = objFile.originalname;
                    objInfo.DSMIMETP = objFile.mimetype;
                    objInfo.IDT014 = idT014;
                    var arDoc = objInfo.NMDOCUME.split('.');
                    var tpDoc = (arDoc.length == 0) ? null : arDoc[arDoc.length - 1];
                    if ((!objInfo.TPDOCUME) && (tpDoc)) objInfo.TPDOCUME = tpDoc.toUpperCase();

                    var sql = `INSERT INTO A004 
                          (IDA003,NMANEXO,TPEXTENS,TPCONTEN,AQANEXO, IDT014) 
                          VALUES 
                          (null, '${objInfo.NMDOCUME}', '.${tpDoc}', '${objInfo.DSMIMETP}', :text, ${objInfo.IDT014})`

                    let result = await con.execute({
                            sql,
                            param: {
                                text: objInfo.CTDOCUME
                            },
                        })
                        .then((result) => {
                            logger.info("Result", result)
                            return result;
                        })
                        .catch((err) => {
                            logger.error("Erro: ", err)
                            err.stack = new Error().stack + `\r\n` + err.stack;
                            throw err;
                        });
                }
            } else {
                strErro = 'Nenhum arquivo enviado';
            }
            await con.close();
            var cdStatus = (blOK) ? 200 : 400;
            res.status(cdStatus).send({ blOK, strErro });
        } catch (err) {
            logger.error("Erro ", err);
            res.status(500).send({ strErro: err.message });
        }

    }

    api.downloadAnexo = async function(req, res, next) {
        let con = await this.controller.getConnection(null, req.UserId);
        let IDA004 = req.body.IDA004;
        let IDT014 = req.body.IDT014;
        let result = await con.execute({
                sql: `
					Select A004.NMANEXO, 
							A004.TPCONTEN,
							A004.AQANEXO
					  From A004 A004
					  Where A004.IDA004 = ${IDA004}					  
					  `,
                param: [],
                fetchInfo: [{
                    column: "AQANEXO",
                    type: "BLOB"
                }]
            })
            .then((result) => {
                api.setBaixado(req);
                return result[0];
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
        await con.close();
        res.writeHead(200, {
            'Content-Type': result.TPCONTEN,
            'Content-Transfer-Encoding': 'Binary',
            'Content-Disposition': 'attachment; filename=' + result.NMANEXO //,
                //'Content-Length': result.AQANEXO.length
        });
        res.end(result.AQANEXO);
    }


    /**
     * @description Marcar como na tabela A004.
     *
     * @async
     * @function api/setBaixado
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
     */
    api.setBaixado = async function(req) {
        logger.debug("Inicio setBaixado");
        let IDT014 = req.body.IDT014;
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("ID selecionados");
            let result = await
            con.update({
                    tabela: 'T014',
                    colunas: {
                        IDUSUDOW: req.body.IDS001,
                        DTDOWNLO: tmz.dataAtualJS(),
                        SNDOWN: 1
                    },
                    condicoes: ` IDT014 = ` + req.body.IDT014 + ` `
                })
                .then((result1) => {
                    logger.debug("Retorno:", result1);
                    return { response: req.__('tp.sucesso.delete') };
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });
            await con.close();
            logger.debug("Fim setBaixado");
            return result;
        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
        }
    };


    //Listar pendencia motoristas e veiculos
    api.listarPendMotVei = async function(req, res, next) {
        logger.debug("Inicio listarPendMotVei");
        let m1 = 0; let m2 = 0; let m3 = 0;
        let v1 = 0; let v2 = 0; let v3 = 0;
        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros recebidos:", req.body);
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'T014', false);
            if (bindValues.T014_IDG031M1){m1 = bindValues.T014_IDG031M1}
            if (bindValues.T014_IDG031M2){m2 = bindValues.T014_IDG031M2}
            if (bindValues.T014_IDG031M3){m3 = bindValues.T014_IDG031M3}

            if (bindValues.T014_IDG032V1){v1 = bindValues.T014_IDG032V1}
            if (bindValues.T014_IDG032V2){v2 = bindValues.T014_IDG032V2}
            if (bindValues.T014_IDG032V3){v3 = bindValues.T014_IDG032V3}

            console.log('bindValues ', bindValues.T014_IDG031M1)
            let result = await con.execute({
                    sql: `select 
                            T014.IDT014, 
                            A004.IDA004, 
                            T014.CDAUTOR, 
                            T014.IDAUTOR, 
                            A004.NMANEXO, 
                            T014.DSOBSERV,
                            T014.DTCADAST,  
                            A004.TPEXTENS, 
                            NVL2(T014.IDUSUDOW, 'Sim', 'Não') ISDOWN, 
                            case 
                                when S001.NMUSUARI is not null then S001.NMUSUARI||' ['||S001.IDS001||']'
                                else '' 
                            end as IDUSUDOW, 
                            T014.DTDOWNLO,
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN 'Motorista' 
                                WHEN 2 THEN 'Veículo' 
                                WHEN 3 THEN 'Tipo de Veículo' 
                                WHEN 4 THEN 'Cliente' 
                            END TPAUTOR, 
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(G031.NMMOTORI)||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' FROM G031 WHERE G031.SNDELETE = 0 AND IDG031 = T014.IDAUTOR ) 
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSAUTOR, 
                            COUNT(T014.IDT014) OVER() as COUNT_LINHA from A004 
                        left join T014 on T014.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                        left join S001 on S001.SNDELETE = 0 AND S001.IDS001 = T014.IDUSUDOW 
                        Where A004.SNDELETE = 0  and T014.IDUSUDOW is null  and T014.CDAUTOR = 1 and ( IDAUTOR = ` + m1 + ` or IDAUTOR = ` + m2 + ` or IDAUTOR = ` + m3 + `)  union all 
                        
                        select 
                            T014.IDT014, 
                            A004.IDA004, 
                            T014.CDAUTOR, 
                            T014.IDAUTOR, 
                            A004.NMANEXO, 
                            T014.DSOBSERV,
                            T014.DTCADAST,  
                            A004.TPEXTENS, 
                            NVL2(T014.IDUSUDOW, 'Sim', 'Não') ISDOWN, 
                            case 
                                when S001.NMUSUARI is not null then S001.NMUSUARI||' ['||S001.IDS001||']'
                                else '' 
                            end as IDUSUDOW, 
                            T014.DTDOWNLO,
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN 'Motorista' 
                                WHEN 2 THEN 'Veículo' 
                                WHEN 3 THEN 'Tipo de Veículo' 
                                WHEN 4 THEN 'Cliente' 
                            END TPAUTOR, 
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(G031.NMMOTORI)||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' FROM G031 WHERE G031.SNDELETE = 0 AND IDG031 = T014.IDAUTOR ) 
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSAUTOR, 
                            COUNT(T014.IDT014) OVER() as COUNT_LINHA from A004 
                        left join T014 on T014.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                        left join S001 on S001.SNDELETE = 0 AND S001.IDS001 = T014.IDUSUDOW 
                        Where A004.SNDELETE = 0  and T014.IDUSUDOW is null and T014.CDAUTOR = 2 and ( IDAUTOR = ` + v1 + ` or IDAUTOR = ` + v2 + ` or IDAUTOR = ` + v3 + `) ` ,
                        
                    param: {}
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (utils.construirObjetoRetornoBD(result, req.body));
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim listar");
            return result;

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };



       //Listar  listar pendencias na montagem da carga
       api.getDocsPendentesMounting = async function(req, res, next) {
        logger.debug("Inicio listar getDocsPendentesMounting");
        let m1 = 0; let m2 = 0; let m3 = 0;
        let v1 = 0; let v2 = 0; let v3 = 0;
        let tpVeiculo = 0;

        let con = await this.controller.getConnection(null, req.UserId);
        try {
            logger.debug("Parametros recebidos:", req.body);
            var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'T014', false);            
            if (bindValues.T014_IDG031M1) {m1 = bindValues.T014_IDG031M1}
            if (bindValues.T014_IDG031M2){m2 = bindValues.T014_IDG031M2}
            if (bindValues.T014_IDG031M3){m3 = bindValues.T014_IDG031M3}
            if (bindValues.IDG032V1){v1 = bindValues.T014_IDG032V1}
            if (bindValues.IDG032V2){v2 = bindValues.T014_IDG032V2}
            if (bindValues.IDG032V3){v3 = bindValues.T014_IDG032V3}
            if (bindValues.T014_IDG030 ){tpVeiculo = bindValues.T014_IDG030}
            
            let result = await con.execute({
                    sql: `select 
                            T014.IDT014, 
                            A004.IDA004, 
                            T014.CDAUTOR, 
                            T014.IDAUTOR, 
                            A004.NMANEXO, 
                            T014.DSOBSERV,
                            T014.DTCADAST,  
                            A004.TPEXTENS, 
                            NVL2(T014.IDUSUDOW, 'Sim', 'Não') ISDOWN, 
                            case 
                                when S001.NMUSUARI is not null then S001.NMUSUARI||' ['||S001.IDS001||']'
                                else '' 
                            end as IDUSUDOW, 
                            T014.DTDOWNLO,
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN 'Motorista' 
                                WHEN 2 THEN 'Veículo' 
                                WHEN 3 THEN 'Tipo de Veículo' 
                                WHEN 4 THEN 'Cliente' 
                            END TPAUTOR, 
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(G031.NMMOTORI)||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' FROM G031 WHERE G031.SNDELETE = 0 AND IDG031 = T014.IDAUTOR ) 
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSAUTOR, 
                            COUNT(T014.IDT014) OVER() as COUNT_LINHA from A004 
                        left join T014 on T014.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                        left join S001 on S001.SNDELETE = 0 AND S001.IDS001 = T014.IDUSUDOW 
                        Where A004.SNDELETE = 0  and T014.IDUSUDOW is null  and T014.CDAUTOR = 1 and ( IDAUTOR = ` + m1 + ` or IDAUTOR = ` + m2 + ` or IDAUTOR = ` + m3 + `)  union all 
                        
                        select 
                            T014.IDT014, 
                            A004.IDA004, 
                            T014.CDAUTOR, 
                            T014.IDAUTOR, 
                            A004.NMANEXO, 
                            T014.DSOBSERV,
                            T014.DTCADAST,  
                            A004.TPEXTENS, 
                            NVL2(T014.IDUSUDOW, 'Sim', 'Não') ISDOWN, 
                            case 
                                when S001.NMUSUARI is not null then S001.NMUSUARI||' ['||S001.IDS001||']'
                                else '' 
                            end as IDUSUDOW, 
                            T014.DTDOWNLO,
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN 'Motorista' 
                                WHEN 2 THEN 'Veículo' 
                                WHEN 3 THEN 'Tipo de Veículo' 
                                WHEN 4 THEN 'Cliente' 
                            END TPAUTOR, 
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(G031.NMMOTORI)||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' FROM G031 WHERE G031.SNDELETE = 0 AND IDG031 = T014.IDAUTOR ) 
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSAUTOR, 
                            COUNT(T014.IDT014) OVER() as COUNT_LINHA from A004 
                        left join T014 on T014.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                        left join S001 on S001.SNDELETE = 0 AND S001.IDS001 = T014.IDUSUDOW 
                        Where A004.SNDELETE = 0  and T014.IDUSUDOW is null and T014.CDAUTOR = 2 and ( IDAUTOR = ` + v1 + ` or IDAUTOR = ` + v2 + ` or IDAUTOR = ` + v3 + `) union all 
                        select 
                            T014.IDT014, 
                            A004.IDA004, 
                            T014.CDAUTOR, 
                            T014.IDAUTOR, 
                            A004.NMANEXO, 
                            T014.DSOBSERV,
                            T014.DTCADAST,  
                            A004.TPEXTENS, 
                            NVL2(T014.IDUSUDOW, 'Sim', 'Não') ISDOWN, 
                            case 
                                when S001.NMUSUARI is not null then S001.NMUSUARI||' ['||S001.IDS001||']'
                                else '' 
                            end as IDUSUDOW, 
                            T014.DTDOWNLO,
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN 'Motorista' 
                                WHEN 2 THEN 'Veículo' 
                                WHEN 3 THEN 'Tipo de Veículo' 
                                WHEN 4 THEN 'Cliente' 
                            END TPAUTOR, 
                            CASE T014.CDAUTOR 
                                WHEN 1 THEN (SELECT upper(G031.NMMOTORI)||' '||G031.CJMOTORI||' ['||G031.IDG031||'-'||G031.NRMATRIC||']' FROM G031 WHERE G031.SNDELETE = 0 AND IDG031 = T014.IDAUTOR ) 
                                WHEN 2 THEN (SELECT G032.DSVEICUL||' Placa: '||G032.NRPLAVEI||' ['||G032.IDG032||'-'||G032.NRFROTA||']' FROM G032 WHERE G032.SNDELETE = 0 AND IDG032 = T014.IDAUTOR ) 
                                WHEN 3 THEN (SELECT G030.DSTIPVEI||' ['||G030.IDG030||']' FROM G030 WHERE G030.SNDELETE = 0 AND IDG030 = T014.IDAUTOR ) 
                                WHEN 4 THEN (SELECT upper(G005.NMCLIENT)||' ['||G005.CJCLIENT||'-'||G005.IECLIENT||']' FROM G005 WHERE G005.SNDELETE = 0 AND IDG005 = T014.IDAUTOR ) 
                            END DSAUTOR, 
                            COUNT(T014.IDT014) OVER() as COUNT_LINHA from A004 
                        left join T014 on T014.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                        left join S001 on S001.SNDELETE = 0 AND S001.IDS001 = T014.IDUSUDOW 
                        Where A004.SNDELETE = 0  and T014.IDUSUDOW is null and T014.CDAUTOR = 3 and IDAUTOR = ` + tpVeiculo + ` `  ,
                        
                    param: {}
                })
                .then((result) => {
                    logger.debug("Retorno:", result);
                    return (utils.construirObjetoRetornoBD(result, req.body));
                })
                .catch((err) => {
                    err.stack = new Error().stack + `\r\n` + err.stack;
                    logger.error("Erro:", err);
                    throw err;
                });

            await con.close();
            logger.debug("Fim listar");
            return result;

        } catch (err) {
            await con.closeRollback();
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;

        }

    };


    api.buscarPendTpVeicCli = async function(req, res, next) {
        console.log("buscarPendTpVeicCli ", req.body)
        let m1 = 0; let m2 = 0; let m3 = 0;
        let v1 = 0; let v2 = 0; let v3 = 0;
        let tpVeiculo = 0;
        let clientes = 0;
        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'T014', false);
            logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);

            console.log('sqlWhere ', sqlWhere)
            console.log('bindValues ', bindValues)
        try {
            
            if (req.body.IDG030){tpVeiculo = req.body.IDG030.id}
//            if (req.body.IDG030.id){tpVeiculo = req.body.IDG030.id}
            if (req.body.IDG031M1){m1 = req.body.IDG031M1.id}
            if (req.body.IDG031M2){m2 = req.body.IDG031M2.id}
            if (req.body.IDG031M3){m3 = req.body.IDG031M3.id}
            if (req.body.IDG032V1){v1 = req.body.IDG032V1.id}
            if (req.body.IDG032V2){v2 = req.body.IDG032V2.id}
            if (req.body.IDG032V3){v3 = req.body.IDG032V3.id}

            if(req.body.ARG005DE){
                clientes = req.body.ARG005DE;
            }

            let con = await this.controller.getConnection(null, req.UserId);
            sql = ` select T014.IDT014, T014.CDAUTOR, T014.IDAUTOR, T014.DSOBSERV, T014.IDUSUCAD, T014.DTCADAST, T014.IDUSUDOW, T014.DTDOWNLO,
                A004.NMANEXO, A004.TPEXTENS, A004.TPCONTEN, A004.AQANEXO 
                From T014 
                Left Join A004 on A004.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                Where T014.SNDELETE =0 and T014.IDUSUDOW is null and T014.CDAUTOR = 1 and ( IDAUTOR = ` + m1 + ` or IDAUTOR = ` + m2 + ` or IDAUTOR = ` + m3 + `) union all 
                
                select T014.IDT014, T014.CDAUTOR, T014.IDAUTOR, T014.DSOBSERV, T014.IDUSUCAD, T014.DTCADAST, T014.IDUSUDOW, T014.DTDOWNLO,
                A004.NMANEXO, A004.TPEXTENS, A004.TPCONTEN, A004.AQANEXO 
                From T014 
                Left Join A004 on A004.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                Where T014.SNDELETE =0 and T014.IDUSUDOW is null and T014.CDAUTOR = 2 and ( IDAUTOR = ` + v1 + ` or IDAUTOR = ` + v2 + ` or IDAUTOR = ` + v3 + `) union all 
                
                select T014.IDT014, T014.CDAUTOR, T014.IDAUTOR, T014.DSOBSERV, T014.IDUSUCAD, T014.DTCADAST, T014.IDUSUDOW, T014.DTDOWNLO,
                A004.NMANEXO, A004.TPEXTENS, A004.TPCONTEN, A004.AQANEXO 
                From T014 
                Left Join A004 on A004.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                Where T014.SNDELETE =0 and T014.IDUSUDOW is null and T014.CDAUTOR = 3 and IDAUTOR = ` + tpVeiculo + ` union all 
                
                select T014.IDT014, T014.CDAUTOR, T014.IDAUTOR, T014.DSOBSERV, T014.IDUSUCAD, T014.DTCADAST, T014.IDUSUDOW, T014.DTDOWNLO,
                A004.NMANEXO, A004.TPEXTENS, A004.TPCONTEN, A004.AQANEXO 
                From T014 
                Left Join A004 on A004.SNDELETE = 0 and A004.IDT014 = T014.IDT014 
                Where T014.SNDELETE =0 and T014.IDUSUDOW is null and T014.CDAUTOR = 4 and IDAUTOR in (` + clientes + `) `;
            let result = await con.execute({
                sql,
                param: {},
            }).then((result) => {
                return result[0];
            }).catch((err) => {
                logger.error("Erro: ", err);
                err.stack = new Error().stack + `\r\n` + err.stack;
                throw err;
            });
            await con.close();
            return result;
        } catch (err) {
            res.status(500).send({ strErro: err.message });
        }
    }




    return api;
};