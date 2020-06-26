module.exports = function (app, cb) {

    var dir = process.env.FOLDER_WAREHOUSE;

    const utilsCA = app.src.utils.ConversorArquivos;
    const utilsDir = app.src.utils.Diretorio;
    const logger = app.config.logger;
    const ctlCom = app.src.modWarehouse.controllers.CommonController;
    const model = app.src.modWarehouse.models.XMLModel;
    const strDirDelivery = process.env.FOLDER_WAREHOUSE;
    const tmz     = app.src.utils.DataAtual;

    var dao = app.src.modWarehouse.dao.XmlDAO;


    //SOAP
    var soap = require('soap');
    
   
    var auth = "Basic " + Buffer.from(process.env.SAP_BRAVO_USER + ":" + process.env.SAP_BRAVO_PASS).toString("base64");

    var api = {};

    //=--==-=-=-= INICIO FUNCOES =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


    api.Iwhc = async function (req, res, next) {
        args = {}
        args.DeliveryXML = "<![CDATA[<teste>1</teste>]]>"
         soap.createClient('http://localhost:3000/Iwhc?wsdl', { wsdl_headers: { Authorization: auth } }, function (err, client) {
            client.setSecurity(new soap.BasicAuthSecurity('your username','your password'))

            try {
                client.SendDelivery(args, function (err, result) {
                    console.log(result);
                });
            } catch (error) {
                console.log(error);
            }
        });

    }

    //=--==-=-=-= FIM FUNCOES =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    return api;

};