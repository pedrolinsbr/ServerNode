module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\

    XMLSchema.header =

        [
            {
                    xPath:      "//ide/nNF"
                ,   nmCampo:    "nrNF"
                ,   dsCampo:    "Número da NF"
            },

            {
                    xPath:      "//ide/serie"
                ,   nmCampo:    "nrSerie"
                ,   dsCampo:    "Série da NF"
            },

            {
                    xPath:      "//ide/dhEmi"
                ,   nmCampo:    "dhEmissao"
                ,   dsCampo:    "Data da Emissão da NF"
            },

            //----------------------------------\\
            //Destinatário

            {
                    xPath:      "//dest/CPF"
                ,   nmCampo:    "cjDest"
                ,   dsCampo:    "CPF do Destinatário"
            },

            {
                    xPath:      "//dest/CNPJ"
                ,   nmCampo:    "cjDest"
                ,   dsCampo:    "CNPJ do Destinatário"
            },

            //----------------------------------\\
        ];

    //=======================================\\

    XMLSchema.loopItem = "//det";

    XMLSchema.item =

        [
            {
                  xPath: "//prod/cProd"
                , nmCampo: "cdRefProd"
                , dsCampo: "Código de Referência do Produto"                
            },
        ];

    //=======================================\\

    XMLSchema.lote =

        [
            {
                  xPath: "//veicProd/nSerie"
                , nmCampo: "nrLote"
                , dsCampo: "Lote do Produto"
            },
        ];

    //=======================================\\    

    return XMLSchema;

}