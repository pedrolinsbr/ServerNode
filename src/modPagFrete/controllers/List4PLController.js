module.exports = function (app, cb) {

    const stream = require('stream');
    const dao = app.src.modPagFrete.dao.List4PLDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
    * @description Lista as cargas agendadas para hoje que aguardam sincronia de documentos
    * @function listSync4PL
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\    

    api.listSync4PL = async function (req, res, next) {

        try {

            var arRS = await dao.listSync4PL(req);
            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Apresenta os CTe's e NFe's sincronizadas com a carga até o momento
    * @function detailSync4PL
    * @author Rafael Delfino Calzado
    * @since 11/11/2019
    *
    * @async
    * @returns {Object} Objeto com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\        

    api.detailSync4PL = async function (req, res, next) {

        try {

            var objResp = { blOK: false };

            var arRS = await dao.detailSync4PL(req, res, next);

            if (arRS.length > 0) {

                objResp.blOK = true;
                objResp.IDG046 = arRS[0].IDG046;
                objResp.NMTRANSP = arRS[0].NMTRANSP;
                objResp.PSCARGA = arRS[0].PSCARGA;
                objResp.VRCARGA = arRS[0].VRCARGA;
                objResp.CDCTRC = arRS[0].CDCTRC;
                objResp.DSTPTRA = arRS[0].DSTPTRA;
                objResp.TPLOAD = arRS[0].TPLOAD;
                objResp.NMCIDORI = arRS[0].NMCIDORI;
                objResp.NMCIDDES = arRS[0].NMCIDDES;
                objResp.QTDISPER = arRS[0].QTDISPER;
                objResp.TTNFE = 0;
                objResp.arCTe = [];
                objResp.arDlvNV = [];

                while (arRS.length > 0) {

                    var objCTe =
                    {
                        IDG051: arRS[0].IDG051,
                        CDCTRC: arRS[0].CDCTRC,
                        NRCHACTE: arRS[0].NRCHACTE,
                        VRTOTFRE: arRS[0].VRTOTFRE,
                        DTEMICTR: arRS[0].DTEMICTR,
                        NMCLIENT: arRS[0].NMCLIENT,
                        arNFe: []
                    };

                    while ((arRS.length > 0) && (arRS[0].IDG051 == objCTe.IDG051)) {

                        if (arRS[0].IDG083) {

                            var objNFe =
                            {
                                IDG083: arRS[0].IDG083,
                                IDF004: arRS[0].IDF004,
                                NRNOTA: arRS[0].NRNOTA,
                                VRNOTA: arRS[0].VRNOTA,
                                DTEMINOT: arRS[0].DTEMINOT,
                                NRCHANFE: arRS[0].NRCHANFE
                            };

                            objResp.TTNFE++;

                            objCTe.arNFe.push(objNFe);
                        }

                        if (objCTe.IDG051 == null) {

                            var objDlvNV =
                            {
                                IDG043: arRS[0].IDG043,
                                CDDELIVE: arRS[0].CDDELIVE,
                                VRDELIVE: arRS[0].VRDELIVE,
                                DTDELIVE: arRS[0].DTDELIVE,
                                PSBRUTO: arRS[0].PSBRUTO
                            };

                            objResp.arDlvNV.push(objDlvNV);

                        }

                        arRS.shift();

                    }

                    if (objCTe.IDG051) objResp.arCTe.push(objCTe);

                }

            }

            var cdStatus = (objResp.blOK) ? 200 : 400;

            res.status(cdStatus).send(objResp);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Download XML do Documento
    * @function getXML
    * @author Rafael Delfino Calzado
    * @since 08/11/2019
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.getXML = async function (req, res, next) {

        try {

            var arRS = await dao.getXML(req, res, next);

            if (arRS.length == 1) {

                let xml = arRS[0].TXXML;
                var fileContents = Buffer.from(xml);
                var readStream = new stream.PassThrough();
                readStream.end(fileContents);

                res.set(`Content-disposition`, `attachment; filename=${req.params.NRCHADOC}.xml`);
                res.set('Content-Type', 'text/xml');
                readStream.pipe(res);

            } else {

                res.status(400).send({ error: `ID #${req.params.NRCHADOC} não localizado.` })

            }


        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}
