module.exports = function (app, cb) {

    const fs = require('fs');
    const sharp = require('sharp');
    const pdfKit = require('pdfkit');
    const stream = require('stream');

    const tmz = app.src.utils.DataAtual;
    const fmt = app.src.utils.Formatador;

    const mdl = app.src.modGlobal.models.MultiDocModel;
    const dao = app.src.modGlobal.dao.MultiDocDAO;
    const ctl = app.src.modGlobal.controllers.GenericController;

    const dirIMG = process.env.FOLDER_CANHOTO;
    const dirPDF = process.env.FOLDER_CANHOTO_PDF;
    const axios = require('axios');

    var api = {};

    //-----------------------------------------------------------------------\\

    api.convertToPDF = async function (req, res, next) {

        try {

            var strImgPath = `${dirIMG}${req.id}.${req.ext}`;
            var strPDFPath = `${dirPDF}${req.id}.pdf`

            //var objProp = { kernel: sharp.kernel.lanczos2 };

            await sharp(req.buffer) //.resize(2808, 900, objProp)
                .toFile(strImgPath, (err, info) => {

                    if (err) {

                        throw err;

                    } else {

                        var doc = new pdfKit;

                        doc.pipe(fs.createWriteStream(strPDFPath));
                        doc.image(strImgPath, 0, 300, { width: 600 });
                        doc.end();

                    }

                });

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.removeDoc = async function (req, res, next) {

        try {

            req.objModel = mdl.G082;
            var objRet = await ctl.exclui(req, res, next);
            res.send(objRet);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.getBinaries = async function (req, res, next) {

        try {

            var rs = await dao.getInfoDoc(req, res, next);

            var blOK = (rs.length == 1);

            if (blOK) {

                var strArquivo = rs[0].NMDOCUME.replace(/(?:(?![A-z0-9\.]).)/g, '_');

                var strMimeType = (rs[0].DSMIMETP) ? rs[0].DSMIMETP : 'text/plain';

                var fileContents = Buffer.from(rs[0].CTDOCUME, 'base64');

                var readStream = new stream.PassThrough();
                readStream.end(fileContents);

                res.set('Content-disposition', 'attachment; filename=' + strArquivo);
                res.set('Content-Type', strMimeType);

                readStream.pipe(res);

            } else {

                res.status(400).send({ strErro: 'Arquivo inválido' });

            }

        } catch (err) {

            res.status(500).send({ strErro: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.getBinariesCTE = async function (req, res, next) {

        try {

            rs = await dao.getInfoDocCTE(req, res, next);

            var blOK = (rs.length == 1);

            if (blOK) {

                var strArquivo = rs[0].NMDOCUME.replace(/(?:(?![A-z0-9\.]).)/g, '_');

                var strMimeType = (rs[0].DSMIMETP) ? rs[0].DSMIMETP : 'text/plain';

                var fileContents = Buffer.from(rs[0].CTDOCUME, 'base64');

                var readStream = new stream.PassThrough();
                readStream.end(fileContents);

                res.set('Content-disposition', 'attachment; filename=' + strArquivo);
                res.set('Content-Type', strMimeType);

                readStream.pipe(res);

            } else {

                res.status(400).send({ strErro: 'Arquivo inválido' });

            }

        } catch (err) {

            res.status(500).send({ strErro: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.getInfoDoc = async function (req, res, next) {

        try {

            var rs = await dao.getInfoDoc(req, res, next);
            if (!rs.length > 0) {
                rs = await dao.getInfoDocCTE(req, res, next);
            }
            res.send(rs);

        } catch (err) {

            res.status(500).send({ strErro: err.message });

        }

    }

    //-----------------------------------------------------------------------\\    

    api.saveDoc = async function (req, res, next) {

        try {
            var blOK = false;
            var strErro = 'Tabela de Referência não definida';
            var mobile = req.body.mobile;

            if (req.body.NMTABELA !== undefined) {

                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                var objConn = await dao.controller.getConnection();
                var parm = { objConn, NMTABELA: req.body.NMTABELA };

                var rs = await dao.findIdTableRef(parm, res, next);

                //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

                if (rs.length == 1) {

                    req.body.IDS007 = rs[0].IDS007;

                    var arFiles = (req.body.files) ? [{ photo: req.body.files }] : req.files;

                    if ((Array.isArray(arFiles)) && (arFiles.length > 0)) {

                        for (objFile of arFiles) {

                            var parm = { objInfo: req.body, objFile };

                            var objInfo = await api.setAditionalInfo(parm, res, next);
                            var objVal = fmt.checaEsquema(objInfo, mdl.G082.columns);

                            if (objVal.blOK) {

                                var objDados = { objConn };
                                objDados.table = mdl.G082.table;
                                objDados.key = mdl.G082.key[0];
                                objDados.vlFields = objVal.value;

                                await dao.saveDoc(objDados, res, next);
                            }

                            blOK = objVal.blOK;
                            strErro = objVal.strErro;
                            if (!blOK) break;

                        }

                    } else {

                        strErro = 'Nenhum arquivo enviado';

                    }


                } else {

                    blOK = false;
                    strErro = 'Tabela de Referência não encontrada na base de dados';

                }

                await objConn.close();

            }

            var cdStatus = (blOK) ? 200 : 400;

            if (cdStatus == 200) {
                if (mobile) {
                    await axios.get(`http://34.238.36.203/api/docsyn/pod/generate/${req.body.PKS007}`)
                }
            }
            res.status(cdStatus).send({ blOK, strErro });

        } catch (err) {
            //Responsavel por remover o canhoto caso der problema ao gerar xml vindo do mobile 
            if (mobile) {
                let objParam = {
                    NMTABELA: 'G043',
                    PKS007: req.body.PKS007,
                    TPDOCUME: 'CTO'
                }
                await axios.post(`http://34.238.36.203/api/multidoc/info`, objParam)
                    .then(async res => {
                        if (res.data != undefined) {
                            await axios.delete(`http://34.238.36.203/api/multidoc/remove/${res.data[0].IDG082}`)
                        }
                    })
            }
            res.status(500).send({ strErro: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    api.setAditionalInfo = async function (req, res, next) {

        try {

            var objInfo = req.objInfo;
            var objFile = req.objFile;
            var arPhoto = [];

            if (objFile.photo) {

                arPhoto = objFile.photo.split(',');
                objFile.mimetype = 'image/jpeg';
                objFile.originalname = 'photo.jpg';
                objFile.size = objFile.photo.length;
                objFile.buffer = Buffer.from(arPhoto[1], 'base64');

            }
            

            objInfo.DTDOCUME = tmz.dataAtualJS();
            objInfo.CTDOCUME = objFile.buffer;
            objInfo.TMDOCUME = objFile.size;
            objInfo.NMDOCUME = objFile.originalname;
            objInfo.DSMIMETP = objFile.mimetype;

            var arDoc = objInfo.NMDOCUME.split('.');
            var tpDoc = (arDoc.length == 0) ? null : arDoc[arDoc.length - 1];

            if ((!objInfo.TPDOCUME) && (tpDoc)) objInfo.TPDOCUME = tpDoc.toUpperCase();

            if (objInfo.TPDOCUME == 'CTO') {

                objFile.id = objInfo.PKS007;
                objFile.ext = tpDoc.toLowerCase();

                await this.convertToPDF(objFile, res, next);

            }

            return objInfo;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    api.generatePdfMobile = async function (req, res, next) {
        try {
            var rs = await dao.generatePdfMobile(req, res, next);
            res.send(rs);
        } catch (err) {
            res.status(500).send({ strErro: err.message });
        }
    }

    return api;
}