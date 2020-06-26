/**
 * @file Busca os dados no XML e monta um objeto
 * @module modDelivery/models/XMLModel
*/
module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\
    //Delivery Header

    XMLSchema.DH = [

        {
            xPath: "//poNumber"
            , tpCampo: "string"
            , nmCampo: "CDDELIVE"
            , dsCampo: "Código da Delivery na Syngenta"
            , blMandatorio: true
        },

        {
            xPath: "//orderDetail/orderFunctionCode"
            , tpCampo: "string"
            , nmCampo: "tpFuncao"
            , dsCampo: "Tipo de função da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'DeliveryPriorityCode']/value"
            , tpCampo: "number"
            , nmCampo: "CDPRIORI"
            , dsCampo: "Código da prioridade da Delivery"
            , blMandatorio: false
        },

        {
            xPath: "//orderTerms/orderDate[orderDateTypeCode = 'Issue']/orderDateValue"
            , tpCampo: "date"
            , nmCampo: "DTDELIVE"
            , dsCampo: "Data da Emissão da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'InitialExpectedDelivery']/value"
            , tpCampo: "date"
            , nmCampo: "DTFINCOL"
            , dsCampo: "Data esperada de coleta"
            , blMandatorio: false
        },

        {
            xPath: "//orderItem/baseItem/reference[type = 'NFNumber']/value"
            , tpCampo: "number"
            , nmCampo: "NRNOTA"
            , dsCampo: "Número da Nota Fiscal"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'SegregationIndicator']/value"
            , tpCampo: "string"
            , nmCampo: "blSegregate"
            , dsCampo: "Boolean de segregação"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'TransportPlanningFlag']/value"
            , tpCampo: "string"
            , nmCampo: "tpFlag"
            , dsCampo: "Transport Planning Flag"
            , blMandatorio: false
        },

         {
            xPath: "//orderDetail/orderTerms/reference[type = 'BusinessUnit']/value"
            , tpCampo: "string"
            , nmCampo: "tpNegocio"
            , dsCampo: "Tipo de Negócio"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'DeliveryTypeCode']/value"
            , tpCampo: "string"
            , nmCampo: "tpDelivery"
            , dsCampo: "Tipo de Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'Division']/value"
            , tpCampo: "string"
            , nmCampo: "NRDIVISA"
            , dsCampo: "Divisão"
            , blMandatorio: true
        },               

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'RefusalFlag']/value"
            , tpCampo: "boolean"
            , nmCampo: "blRecusa"
            , dsCampo: "Delivery de Recusa"
            , blMandatorio: false
        },    

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'OrderReason']/value"
            , tpCampo: "string"
            , nmCampo: "CDMOTIVO"
            , dsCampo: "Motivo da Devolução/Recusa"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'ReferenceDelivery']/value"
            , tpCampo: "string"
            , nmCampo: "cdDelRef"
            , dsCampo: "Delivery de Referência"
            , blMandatorio: false
        },         

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'TemperatureSensitiveFlag']/value"
            , tpCampo: "string"
            , nmCampo: "STTEMPER"
            , dsCampo: "Sensível à Temperatura"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = '4PLInstructions1']/value"
            , tpCampo: "string"
            , nmCampo: "TXINSTRU"
            , dsCampo: "Texto de instrução #1"
            , blMandatorio: false
        },

        //===========================================================\\
        // Cliente

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'TaxNumber1']/value"
            , tpCampo: "string"
            , nmCampo: "cnpjCliente"
            , dsCampo: "CNPJ do Cliente"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'TaxNumber2']/value"
            , tpCampo: "string"
            , nmCampo: "cpfCliente"
            , dsCampo: "CPF do Cliente"
            , blMandatorio: false
        },        

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'TaxNumber3']/value"
            , tpCampo: "string"
            , nmCampo: "IECLIENT"
            , dsCampo: "IE do Cliente"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'TaxNumber4']/value"
            , tpCampo: "string"
            , nmCampo: "IMCLIENT"
            , dsCampo: "Inscrição Municipal do Cliente"
            , blMandatorio: false
        },           

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'ShipToEmail']/value"
            , tpCampo: "string"
            , nmCampo: "DSEMACLI"
            , dsCampo: "Email do Cliente"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'RTVEmail']/value"
            , tpCampo: "string"
            , nmCampo: "DSEMARTV"
            , dsCampo: "Email do Faturista"
            , blMandatorio: false
        },

        {
            xPath: "//orderTerms/reference[type = 'CustomerGroup']/value"
            , tpCampo: "string"
            , nmCampo: "CDGRUCLI"
            , dsCampo: "Código do Grupo de Clientes"
            , blMandatorio: false
        },
        
        {
            xPath: "//orderTerms/reference[type = 'PriceGroup']/value"
            , tpCampo: "string"
            , nmCampo: "CDGRUPRE"
            , dsCampo: "Código do Grupo de Preços"
            , blMandatorio: false
        },             

        //===========================================================\\
        // Remetente

        {
            xPath: "//orderDetail/party[partyRoleCode = 'Seller']/contact/department"
            , tpCampo: "string"
            , nmCampo: "cdRemete"
            , dsCampo: "Código do Remetente"
            , blMandatorio: true
        },

        {
            xPath: "//orderDetail/party[partyRoleCode = 'Seller']/address/postalCodeNumber"
            , tpCampo: "string"
            , nmCampo: "cpRemete"
            , dsCampo: "CEP do Remetente"
            , blMandatorio: true
        },

        //===========================================================\\
        // Destinatário

        {
            xPath: "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/contact/department"
            , tpCampo: "string"
            , nmCampo: "cdDestin"
            , dsCampo: "Código do Destinatário"
            , blMandatorio: true
        },

        {
            xPath: "//orderDetail/party[partyRoleCode = 'ShipmentDestination']/address/postalCodeNumber"
            , tpCampo: "string"
            , nmCampo: "cpDestin"
            , dsCampo: "CEP do Destinatário"
            , blMandatorio: true
        },

        //=========================================================================\\
        // Warehouse

        {
            xPath: "//orderDetail/orderTerms/reference[type = 'WarehouseID']/value"
            , tpCampo: "number"
            , nmCampo: "WHDEPART"
            , dsCampo: "ID Warehouse"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/party[partyRoleCode = 'Consignee']/contact/department"
            , tpCampo: "string"
            , nmCampo: "cdBuyer"
            , dsCampo: "Código do Comprador"
            , blMandatorio: false
        },

        {
            xPath: "//orderDetail/party[partyRoleCode = 'Consignee']/address/postalCodeNumber"
            , tpCampo: "string"
            , nmCampo: "cpBuyer"
            , dsCampo: "CEP do Comprador"
            , blMandatorio: false
        },

        //=========================================================================\\
        // Totais

        {
            xPath: "//orderTerms/reference[type = 'WeightUnit']/value"
            , tpCampo: "string"
            , nmCampo: "unPeso"
            , dsCampo: "Unidade de peso da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'NoOfSecondaryPackage']/value"
            , tpCampo: "number"
            , nmCampo: "NREMBSEC"
            , dsCampo: "Quantidade de embalagens secundárias"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'ValueOfDelivery']/value"
            , tpCampo: "float"
            , nmCampo: "VRDELIVE"
            , dsCampo: "Valor Total da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'Volume']/value"
            , tpCampo: "float"
            , nmCampo: "VRVOLUME"
            , dsCampo: "Volume Total da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'GrossWeight']/value"
            , tpCampo: "float"
            , nmCampo: "PSBRUTO"
            , dsCampo: "Peso total bruto"
            , blMandatorio: true
        },

        {
            xPath: "//orderTerms/reference[type = 'NetWeight']/value"
            , tpCampo: "float"
            , nmCampo: "PSLIQUID"
            , dsCampo: "Peso total líquido"
            , blMandatorio: true
        },

    ];

    //=======================================\\
    //item

    XMLSchema.DI = [

        {
            xPath: "/Order/orderDetail/orderItem/itemKey"
            , tpCampo: "number"
            , nmCampo: "itemId"
            , dsCampo: "Line item Id"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/itemIdentifier[itemIdentifierTypeCode = 'ItemSequenceNumber']/itemIdentifierValue"
            , tpCampo: "number"
            , nmCampo: "NRORDITE"
            , dsCampo: "Ordem do Item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/itemIdentifier[itemIdentifierTypeCode = 'BuyerNumber']/itemIdentifierValue"
            , tpCampo: "string"
            , nmCampo: "DSREFFAB"
            , dsCampo: "Código externo do item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/reference[type = 'UNCodeADR']/value"
            , tpCampo: "number"
            , nmCampo: "NRONU"
            , dsCampo: "Código ONU do Produto"
            , blMandatorio: false
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/reference[type = 'GrossWeight']/value"
            , tpCampo: "float"
            , nmCampo: "PSBRUTO"
            , dsCampo: "Peso bruto do item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/reference[type = 'WeightUnit']/value"
            , tpCampo: "string"
            , nmCampo: "unPeso"
            , dsCampo: "Unidade de peso do item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/reference[type = 'Volume']/value"
            , tpCampo: "float"
            , nmCampo: "VRVOLUME"
            , dsCampo: "Volume do item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/unitOfMeasureCode"
            , tpCampo: "string"
            , nmCampo: "unMedida"
            , dsCampo: "Unidade de medida do item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/itemIdentifier[itemIdentifierTypeCode = 'ShortDescription']/itemIdentifierValue"
            , tpCampo: "string"
            , nmCampo: "DSPRODUT"
            , dsCampo: "Descrição do item"
            , blMandatorio: true
        },

        {
            xPath: "/Order/orderDetail/orderItem/baseItem/reference[type = 'SalesOffice']/value"
            , tpCampo: "string"
            , nmCampo: "CDLOCVEN"
            , dsCampo: "Código do Local de Venda"
            , blMandatorio: false
        },        

    ];

    //=======================================\\
    //lote

    XMLSchema.DL = [

        {
            xPath: "//baseItem/reference[type = 'Batch']/value"
            , tpCampo: "string"
            , nmCampo: "DSLOTE"
            , dsCampo: "Descrição do Lote"
            , blMandatorio: false
        },

        {
            xPath: "//baseItem/quantity"
            , tpCampo: "float"
            , nmCampo: "QTPRODUT"
            , dsCampo: "Quantidade de produtos no Lote"
            , blMandatorio: true
        },

    ];

    //=======================================\\

    XMLSchema.loopItem = '/Order/orderDetail/orderItem';

    XMLSchema.loopLote = "/Order/orderDetail/orderItem[itemKey = itemId]/orderItem";

    //=======================================\\

    return XMLSchema;
}
