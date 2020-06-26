module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\
    //Delivery Header

    XMLSchema.DH = [

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/VBELN"
            , tpCampo: "string"
            , nmCampo: "CDDELIVE"
            , dsCampo: "Código da Delivery na Syngenta"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL18/QUALF"
            , tpCampo: "string"
            , nmCampo: "tpFuncao"
            , dsCampo: "Tipo de função da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL21/LPRIO"
            , tpCampo: "number"
            , nmCampo: "CDPRIORI"
            , dsCampo: "Código da prioridade da Delivery"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDT13[QUALF = '015']/NTANF"
            , tpCampo: "date"
            , nmCampo: "DTDELIVE"
            , dsCampo: "Data da Emissão da Delivery"
            , blMandatorio: true
        },        

        //NRNOTA não contemplado

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/ZSEGREGATION"
            , tpCampo: "string"
            , nmCampo: "blSegregate"
            , dsCampo: "Boolean de segregação"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/ZTPLAN"
            , tpCampo: "string"
            , nmCampo: "tpFlag"
            , dsCampo: "Transport Planning Flag"
            , blMandatorio: false
        },

         {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EITM/SPART"
            , tpCampo: "string"
            , nmCampo: "tpNegocio"
            , dsCampo: "Tipo de Negócio"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL21/LFART"
            , tpCampo: "string"
            , nmCampo: "tpDelivery"
            , dsCampo: "Tipo de Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/REF_FLAG"
            , tpCampo: "boolean"
            , nmCampo: "blRecusa"
            , dsCampo: "Delivery de Recusa"
            , blMandatorio: false
        },    

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/AUGRU"
            , tpCampo: "string"
            , nmCampo: "CDMOTIVO"
            , dsCampo: "Motivo da Devolução/Recusa"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/REF_DEL"
            , tpCampo: "string"
            , nmCampo: "cdDelRef"
            , dsCampo: "Delivery de Referência"
            , blMandatorio: false
        },         

        //STTEMPER não contemplado

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1TXTH8[TDID = 'Z4PL']/E1TXTP8/TDLINE"
            , tpCampo: "string"
            , nmCampo: "TXINSTRU"
            , dsCampo: "Texto de instrução #1"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/SPART"
            , tpCampo: "string"
            , nmCampo: "NRDIVISA"
            , dsCampo: "Divisão"
            , blMandatorio: true
        },

        //===========================================================\\
        // Remetente

        {            
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1ADRM1[PARTNER_Q = 'OSP']/PARTNER_ID"
            , tpCampo: "string"
            , nmCampo: "cdRemete"
            , dsCampo: "Código do Remetente"
            , blMandatorio: true
        },

        {            
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1ADRM1[PARTNER_Q = 'OSP']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "cpRemete"
            , dsCampo: "CEP do Remetente"
            , blMandatorio: true
        },        

        // CDGRUCLI ( Grupo de Clientes) não contemplado

        // CDGRUPRE ( Grupo de Preços) não contemplado
        
        //===========================================================\\
        // Cliente

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1ADRM1[PARTNER_Q = 'WE']/PARTNER_ID"
            , tpCampo: "string"
            , nmCampo: "cdDestin"
            , dsCampo: "Código do Destinatário"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1ADRM1[PARTNER_Q = 'WE']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "cpDestin"
            , dsCampo: "CEP do Destinatário"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR2/EMAIL_SHIPTO"
            , tpCampo: "string"
            , nmCampo: "DSEMACLI"
            , dsCampo: "Email do Cliente"
            , blMandatorio: false
        },        

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR2/EMAIL_RTV"
            , tpCampo: "string"
            , nmCampo: "DSEMARTV"
            , dsCampo: "Email do Faturista"
            , blMandatorio: false
        },        

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/STCD1"
            , tpCampo: "string"
            , nmCampo: "cnpjCliente"
            , dsCampo: "CNPJ do Cliente"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/STCD2"
            , tpCampo: "string"
            , nmCampo: "cpfCliente"
            , dsCampo: "CPF do Cliente"
            , blMandatorio: false
        },        

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/STCD3"
            , tpCampo: "string"
            , nmCampo: "IECLIENT"
            , dsCampo: "IE do Cliente"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/STCD4"
            , tpCampo: "string"
            , nmCampo: "IMCLIENT"
            , dsCampo: "Inscrição Municipal do Cliente"
            , blMandatorio: false
        },

        //=========================================================================\\
        // Warehouse

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1ADRM1[PARTNER_Q = 'YA']/PARTNER_ID"
            , tpCampo: "number"
            , nmCampo: "WHDEPART"
            , dsCampo: "ID Warehouse"
            , blMandatorio: false
        },       

        //=========================================================================\\
        // Totais

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/GEWEI"
            , tpCampo: "string"
            , nmCampo: "unPeso"
            , dsCampo: "Unidade de peso da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/ZZQTYPALLETS"
            , tpCampo: "number"
            , nmCampo: "NREMBSEC"
            , dsCampo: "Quantidade de embalagens secundárias"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EHDR/ZDLVALUE"
            , tpCampo: "float"
            , nmCampo: "VRDELIVE"
            , dsCampo: "Valor Total da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/VOLUM"
            , tpCampo: "float"
            , nmCampo: "VRVOLUME"
            , dsCampo: "Volume Total da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/BTGEW"
            , tpCampo: "float"
            , nmCampo: "PSBRUTO"
            , dsCampo: "Peso total bruto"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/NTGEW"
            , tpCampo: "float"
            , nmCampo: "PSLIQUID"
            , dsCampo: "Peso total líquido"
            , blMandatorio: true
        }

    ];

    //=======================================\\
    //item

    XMLSchema.DI = [

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EITM/POSNR"
            , tpCampo: "number"
            , nmCampo: "NRORDITE"
            , dsCampo: "Line item number"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/MATNR"
            , tpCampo: "number"
            , nmCampo: "DSREFFAB"
            , dsCampo: "Código externo do item"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/Z1E1EITM/ZRIDUNR"
            , tpCampo: "number"
            , nmCampo: "NRONU"
            , dsCampo: "Código ONU do Produto"
            , blMandatorio: false
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/BRGEW"
            , tpCampo: "float"
            , nmCampo: "PSBRUTO"
            , dsCampo: "Peso bruto do item"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/GEWEI"
            , tpCampo: "string"
            , nmCampo: "unPeso"
            , dsCampo: "Unidade de peso do item"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/VOLUM"
            , tpCampo: "float"
            , nmCampo: "VRVOLUME"
            , dsCampo: "Volume do item"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/VRKME"
            , tpCampo: "string"
            , nmCampo: "unMedida"
            , dsCampo: "Unidade de medida do item"
            , blMandatorio: true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/ARKTX"
            , tpCampo: "string"
            , nmCampo: "DSPRODUT"
            , dsCampo: "Descrição do item"
            , blMandatorio: true
        },

        //CDLOCVEN ( Código do Local de Venda ) não contemplado

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/EAN11"
            , tpCampo: "integer"
            , nmCampo: "cdEAN"
            , dsCampo: "Código EAN do Produto"
            , blMandatorio: false //true
        },

        {
            xPath: "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24/MATNR"
            , tpCampo: "string"
            , nmCampo: "cdLoopDL"
            , dsCampo: "Código Loop Lote"
            , blMandatorio: true
        }        

    ];

    //=======================================\\
    //lote

    XMLSchema.DL = [

        {
            xPath: "//E1EDL24/CHARG"
            , tpCampo: "string"
            , nmCampo: "DSLOTE"
            , dsCampo: "Descrição do Lote"
            , blMandatorio: false
        },

        {
            xPath: "//E1EDL24/LFIMG"
            , tpCampo: "float"
            , nmCampo: "QTPRODUT"
            , dsCampo: "Quantidade de produtos no Lote"
            , blMandatorio: true
        },

    ];

    //=======================================\\

    XMLSchema.loopItem1 = "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24[LFIMG = 0]";
    XMLSchema.loopItem2 = "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24[LFIMG > 0]";

    XMLSchema.loopLote = "//ZXDELVRY07/IDOC/E1EDL20/E1EDL24[LFIMG > 0 and MATNR = 'cdLoopDL']";

    //=======================================\\

    return XMLSchema;

}
