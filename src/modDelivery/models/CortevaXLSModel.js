module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\

    XMLSchema.header =

        [
            { nmCampo: 'CDDELIVE', nmColunaXLS: 'Order Number' },
            { nmCampo: 'DTDELIVE', nmColunaXLS: 'Sales Doc Date Created' },

            { nmCampo: 'stLibera', nmColunaXLS: 'Order Status'},

            { nmCampo: 'IDDESTIN', nmColunaXLS: 'SoldTo Code' },
            { nmCampo: 'CJCLIENT', nmColunaXLS: 'SoldTo Tax Number' },            
            { nmCampo: 'NMCLIENT', nmColunaXLS: 'SoldTo Report Name' },
            { nmCampo: 'RSCLIENT', nmColunaXLS: 'SoldTo Name' },
            { nmCampo: 'CPENDERE', nmColunaXLS: 'SoldToPostalCode' },

            { nmCampo: 'NMCIDADE', nmColunaXLS: 'SoldToCity' },
            { nmCampo: 'CDESTADO', nmColunaXLS: 'SoldTo State' }
        ];

    //=======================================\\

    XMLSchema.item =

        [
            { nmCampo: 'NRORDITE', nmColunaXLS: 'Order Item' },
            
            { nmCampo: 'DSREFFAB', nmColunaXLS: 'Material Number' },
            { nmCampo: 'DSPRODUT', nmColunaXLS: 'Trade Product Name' },
            { nmCampo: 'gpProdut', nmColunaXLS: 'Local Segment' },

            { nmCampo: 'PSBRUTO',  nmColunaXLS: 'Gross Weight' },
            { nmCampo: 'PSLIQUID', nmColunaXLS: 'Net Weight' },

            { nmCampo: 'UNPESO',   nmColunaXLS: 'Weight Unit1' },
            { nmCampo: 'UNMEDIDA', nmColunaXLS: 'Base UOM' },

            { nmCampo: 'QTPRODUT', nmColunaXLS: 'Sales Qty in UOM' },
            { nmCampo: 'VRDELIVE', nmColunaXLS: 'Price Rate Item' },

            { nmCampo: 'tpMoeda',  nmColunaXLS: 'Currency Rate Item' },
            { nmCampo: 'vrCotaca', nmColunaXLS: 'Curr rate of Mth' }
        ];

    //=======================================\\

    return XMLSchema;

}