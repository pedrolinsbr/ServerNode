/**
 * @file Busca os dados no XML e monta um objeto
 * @module modDelivery/models/XMLModel
*/
module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\
    //Delivery Header

    XMLSchema.DH = [

        // Cabeçalho
        {
            xPath: "//EDI_DC40/DOCNUM"
            , tpCampo: "string"
            , nmCampo: "NRDOCUME"
            , dsCampo: "Número do documento"
            , blMandatorio: true
        },

        {
            xPath: "//EDI_DC40/CREDAT"
            , tpCampo: "string"
            , nmCampo: "DTINVENT"
            , dsCampo: "Data de criação do documento"
            , blMandatorio: true
        },

        // Informações da planta a ser feito o inventário
        {
            xPath: "//E1WVINH/IBLNR"
            , tpCampo: "string"
            , nmCampo: "NRINVENT"
            , dsCampo: "Número do inventário"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/FILIALE"
            , tpCampo: "string"
            , nmCampo: "CDFILIAL"
            , dsCampo: "Código da Planta"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/LGORT"
            , tpCampo: "string"
            , nmCampo: "CDDEPOSI"
            , dsCampo: "Código do Depósito"
            , blMandatorio: true
        },

    ];


    XMLSchema.DI = [
        // Informações do item
        {
            xPath: "//E1WVINH/E1WVINI/ZEILI"
            , tpCampo: "string"
            , nmCampo: "NRLNITEM"
            , dsCampo: "Line Item Number"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/ARTNR"
            , tpCampo: "string"
            , nmCampo: "CDMATERI"
            , dsCampo: "Código do Material"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/MAKTX"
            , tpCampo: "string"
            , nmCampo: "DSMATERI"
            , dsCampo: "Descrição do Material"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/ERFMG"
            , tpCampo: "float"
            , nmCampo: "QTMATERI"
            , dsCampo: "Quantidade do material (Peso)"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/E1WVI03/UNIT_CODE"
            , tpCampo: "string"
            , nmCampo: "DSMEDIDA"
            , dsCampo: "Unidade de medida do material"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/CHARG"
            , tpCampo: "string"
            , nmCampo: "NRLOTE"
            , dsCampo: "Lote numérico (SAP Internal)"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/Z1E1WVINI/ZZBATCH" //a ser atualizado
            , tpCampo: "string"
            , nmCampo: "NRALFANU"
            , dsCampo: "Lote alfanumérico"
            , blMandatorio: true
        },

        {
            xPath: "//E1WVINH/E1WVINI/Z1E1WVINI/ZZMATVOL" //a ser atualizado
            , tpCampo: "number"
            , nmCampo: "VRVOLUME"
            , dsCampo: "Volume do material"
            , blMandatorio: true
        },
    ]

    XMLSchema.loopItem2 = "//E1WVINI";
    //=======================================\\

    //=======================================\\


    return XMLSchema;
}