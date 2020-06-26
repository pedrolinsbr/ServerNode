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
            xPath: "//EDI_DC40/DOCNUM"
            , tpCampo: "string"
            , nmCampo: "DOCNUM"
            , dsCampo: "numero do idoc"
            , blMandatorio: true
        },

        {
            xPath: "//EDI_DC40/CREDAT"
            , tpCampo: "string"
            , nmCampo: "CREDAT"
            , dsCampo: "Data de Criação da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//EDI_DC40/CRETIM"
            , tpCampo: "string"
            , nmCampo: "CRETIM"
            , dsCampo: "Hora de Criação da delivery"
            , blMandatorio: true
        },


        {
            xPath: "//E1EDL20/VBELN"
            , tpCampo: "string"
            , nmCampo: "CDOUBOUN"
            , dsCampo: "Código Delivery OUTBOUND"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZDIR"
            , tpCampo: "string"
            , nmCampo: "TPPROCES"
            , dsCampo: "Tipo de delivery - Inbound ou Outbound"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDT13[QUALF = '015']/NTANF"
            , tpCampo: "string"
            , nmCampo: "DTDELIVE"
            , dsCampo: "Data da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL18/QUALF"
            , tpCampo: "string"
            , nmCampo: "STATUALI"
            , dsCampo: "Status da Delivery." //1 - ORI, 2 - CHA, 3 - CHA + Chave da NF
            , blMandatorio: true
        }, 

        {
            xPath: "//Z1E3EHDR/ZEXTID"
            , tpCampo: "string"
            , nmCampo: "CDSHIPME"
            , dsCampo: "Código do Shipment"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/VBELN"
            , tpCampo: "string"
            , nmCampo: "CDINBOUN"
            , dsCampo: "Código da Delivery INBOUND"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL20/BTGEW"
            , tpCampo: "float"
            , nmCampo: "PSBRUTO"
            , dsCampo: "Peso Bruto"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL21/LFART"
            , tpCampo: "string"
            , nmCampo: "TPDELIVE"
            , dsCampo: "Tipo de Delivery" //Venda ou Transferencia
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL20/Z1E1EHDR/REF_DEL"
            , tpCampo: "string"
            , nmCampo: "NRDELREF"
            , dsCampo: "Delivery de Referência"
            , blMandatorio: false
        },         

        {
            xPath: "//Z1E3EHDR/SWERKS" //SUPPLYING PLANT - SOMENTE NO INBOUND
            , tpCampo: "string"
            , nmCampo: "CDPLAFOR"
            , dsCampo: "Planta de origem"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/SLGORT" //SUPPLYING STORAGE LOCATION - SOMENTE NO INBOUND
            , tpCampo: "string"
            , nmCampo: "CDARMFOR"
            , dsCampo: "Armazém de origem"
            , blMandatorio: true
        },

//-------------------------------------------------------------------

        {            
            xPath: "//Z1E1ADRM1[QUALF = 'WE']/PARTNER_ID"
            , tpCampo: "string"
            , nmCampo: "NRSAPDE"
            , dsCampo: "Código - Destinatário"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'WE']/STCD2"
            , tpCampo: "string"
            , nmCampo: "CJDESTIN"
            , dsCampo: "CPF - Destinatário"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'WE']/STCD1"
            , tpCampo: "string"
            , nmCampo: "CJDESTIN"
            , dsCampo: "CNPJ - Destinatário"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'WE']/STCD3"
            , tpCampo: "string"
            , nmCampo: "IEDESTIN"
            , dsCampo: "Inscrição Estadual - Destinatário"
            , blMandatorio: true
        },

//-------------------------------------------------------------------

        {
            xPath: "//Z1E1ADRM1[QUALF = 'OSP']/PARTNER_ID"
            , tpCampo: "string"
            , nmCampo: "NRSAPRE"
            , dsCampo: "Código SAP - Remetente"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'OSP']/STCD1"
            , tpCampo: "string"
            , nmCampo: "CJREMETE"
            , dsCampo: "CNPJ - Remetente"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'OSP']/STCD3"
            , tpCampo: "string"
            , nmCampo: "IEREMETE"
            , dsCampo: "Inscrição Estadual - Remetente"
            , blMandatorio: true
        },
        
//-------------------------------------------------------------------

        {
            xPath: "//Z1E1ADRM1[QUALF = 'AG']/PARTNER_ID"
            , tpCampo: "string"
            , nmCampo: "NRSAPCL"
            , dsCampo: "Código SAP - Sold To"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'AG']/STCD1"
            , tpCampo: "string"
            , nmCampo: "CJCLIENT"
            , dsCampo: "CNPJ - Sold to"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'AG']/STCD3"
            , tpCampo: "string"
            , nmCampo: "IECLIENT"
            , dsCampo: "Inscrição Estadual - Sold to"
            , blMandatorio: true
        },

//-------------------------------------------------------------------

        {
            xPath: "//Z1E1ADRM1[QUALF = 'SP']/PARTNER_ID"
            , tpCampo: "string"
            , nmCampo: "NRSAPTR"
            , dsCampo: "Código SAP - Transportadora"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'SP']/STCD1"
            , tpCampo: "string"
            , nmCampo: "CJTRANSP"
            , dsCampo: "CNPJ - Transportadora"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E1ADRM1[QUALF = 'SP']/STCD3"
            , tpCampo: "string"
            , nmCampo: "IETRANSP"
            , dsCampo: "Inscrição Estadual - Transportadora"
            , blMandatorio: true
        },
        
        //===========================================================\\
        // Remetente

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'OSP']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "NRCEPRE"
            , dsCampo: "CEP - Remetente"
            , blMandatorio: true
        }, 
        
        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'OSP']/JURISDIC"
            , tpCampo: "string"
            , nmCampo: "IMREMETE"
            , dsCampo: "Inscrição Municipal - Remetente"
            , blMandatorio: true
        }, 
        
        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'OSP']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLIRE"
            , dsCampo: "Nome - Remetente"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'OSP']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLIDE1" // destinatário no Inbound
            , dsCampo: "Nome - Remetente"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'OSP']/CITY1"
            , tpCampo: "string"
            , nmCampo: "NMCIDRE"
            , dsCampo: "Cidade - Remetente"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'OSP']/REGION"
            , tpCampo: "string"
            , nmCampo: "NMESTRE"
            , dsCampo: "Estado - Remetente"
            , blMandatorio: true
        },

        //===========================================================\\
        // Remetente - INBOUND

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'LF']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "NRCEPRE"
            , dsCampo: "CEP - Remetente - Inbound"
            , blMandatorio: true
        },    
        
        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'LF']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLIRE"
            , dsCampo: "Nome - Remetente - Inbound"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'LF']/CITY1"
            , tpCampo: "string"
            , nmCampo: "NMCIDRE"
            , dsCampo: "Cidade - Remetente - Inbound"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'LF']/REGION"
            , tpCampo: "string"
            , nmCampo: "NMESTRE"
            , dsCampo: "Estado - Remetente - Inbound"
            , blMandatorio: true
        },

        //===========================================================\\
        // Destinatario - Ship to

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'WE']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "NRCEPDE"
            , dsCampo: "CEP - Destinatário"
            , blMandatorio: true
        },    
        
        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'WE']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLIDE"
            , dsCampo: "Nome - Destinatário"
            , blMandatorio: true
        },   

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'WE']/JURISDIC"
            , tpCampo: "string"
            , nmCampo: "IMDESTIN"
            , dsCampo: "Inscrição Municipal - Destinatário"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'WE']/CITY1"
            , tpCampo: "string"
            , nmCampo: "NMCIDDE"
            , dsCampo: "Cidade - Destinatário"
            , blMandatorio: true
        },

        {            
            xPath: "//E1ADRM1[PARTNER_Q = 'WE']/REGION"
            , tpCampo: "string"
            , nmCampo: "NMESTDE"
            , dsCampo: "Estado - Destinatário"
            , blMandatorio: true
        },

        //===========================================================\\
        // Transportadora

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'SP']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLITR"
            , dsCampo: "Nome - Transportadora"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'SP']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "NRCEPTR"
            , dsCampo: "CEP - Transportadora"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'SP']/CITY1"
            , tpCampo: "string"
            , nmCampo: "NMCIDTR"
            , dsCampo: "Cidade - Transportadora"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'SP']/REGION"
            , tpCampo: "string"
            , nmCampo: "NMESTTR"
            , dsCampo: "Estado - Transportadora"
            , blMandatorio: true
        },

        //===========================================================\\
        // Sold to - Cliente - Virá somente nas deliveries de Venda

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'AG']/JURISDIC"
            , tpCampo: "string"
            , nmCampo: "IMCLIENT"
            , dsCampo: "Inscrição Municipal - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'AG']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLICL"
            , dsCampo: "Nome - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'AG']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "NRCEPCL"
            , dsCampo: "CEP - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'AG']/CITY1"
            , tpCampo: "string"
            , nmCampo: "NMCIDCL"
            , dsCampo: "Cidade - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'AG']/REGION"
            , tpCampo: "string"
            , nmCampo: "NMESTCL"
            , dsCampo: "Estado - Cliente"
            , blMandatorio: true
        },

        //===========================================================\\
        // Venda com AG - Virá somente nas deliveries de Venda

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'YA']/JURISDIC"
            , tpCampo: "string"
            , nmCampo: "IMCLIAG"
            , dsCampo: "Inscrição Municipal - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'YA']/NAME1"
            , tpCampo: "string"
            , nmCampo: "NMCLIAG"
            , dsCampo: "Nome - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'YA']/POSTL_COD1"
            , tpCampo: "string"
            , nmCampo: "NRCEPAG"
            , dsCampo: "CEP - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'YA']/CITY1"
            , tpCampo: "string"
            , nmCampo: "NMCIDAG"
            , dsCampo: "Cidade - Cliente"
            , blMandatorio: true
        },

        {
            xPath: "//E1ADRM1[PARTNER_Q = 'YA']/REGION"
            , tpCampo: "string"
            , nmCampo: "NMESTAG"
            , dsCampo: "Estado - Cliente"
            , blMandatorio: true
        },

        //=========================================================================\\
        // Totais

        {
            xPath: "//Z1E3EHDR/ZDVALUE"
            , tpCampo: "float"
            , nmCampo: "VRDELIVE"
            , dsCampo: "Valor Total da Delivery"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL20/VOLUM"
            , tpCampo: "float"
            , nmCampo: "VRVOLUME"
            , dsCampo: "Volume Total da Delivery"
            , blMandatorio: true
        },

    //===========================================================\\
    // NOTA FISCAL

        {
            xPath: "//Z1E3EHDR/ZNFE"
            , tpCampo: "integer"
            , nmCampo: "NRNOTA"
            , dsCampo: "Número da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZNFES"
            , tpCampo: "string"
            , nmCampo: "NRSERINF"
            , dsCampo: "Série da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZACS_KEY"
            , tpCampo: "string"
            , nmCampo: "NRCHADOC"
            , dsCampo: "Chave da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZNFEM"
            , tpCampo: "string"
            , nmCampo: "DSMODENF"
            , dsCampo: "Modelo da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZNFE_REF"
            , tpCampo: "string"
            , nmCampo: "NRNFREF"
            , dsCampo: "Número de Referência"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZNFSTAT"
            , tpCampo: "string"
            , nmCampo: "STNOTA"
            , dsCampo: "Status da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZNFE_VAL"
            , tpCampo: "float"
            , nmCampo: "VRNOTA"
            , dsCampo: "Valor da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/ZNFE_QTY"
            , tpCampo: "float"
            , nmCampo: "PSNOTA"
            , dsCampo: "Peso da Nota Fiscal"
            , blMandatorio: true
        },

        {
            xPath: "//Z1E3EHDR/WERKS"
            , tpCampo: "string"
            , nmCampo: "NMPLADES"
            , dsCampo: "Planta de Destino"
            , blMandatorio: true
        }


    ];

    //=======================================\\
    //item

    XMLSchema.DI = [

        {
            xPath: "//E1EDL24[LFIMG > 0]/POSNR"
            , tpCampo: "number"
            , nmCampo: "NRITEM"
            , dsCampo: "Line item number"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/VGBEL"
            , tpCampo: "string"
            , nmCampo: "NRPOLNIT"
            , dsCampo: "PO Line item"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/VGPOS"
            , tpCampo: "string"
            , nmCampo: "NRPONMBR"
            , dsCampo: "PO number"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/MATNR"
            , tpCampo: "string"
            , nmCampo: "CDMATERI"
            , dsCampo: "Código do material"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/ARKTX"
            , tpCampo: "string"
            , nmCampo: "DSMATERI"
            , dsCampo: "Descrição do material"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/MATKL"
            , tpCampo: "string"
            , nmCampo: "NMMATGRO"
            , dsCampo: "Grupo do material"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/WERKS" //planta de destino no inbound
            , tpCampo: "string"
            , nmCampo: "NMPLAORI"
            , dsCampo: "Planta de origem"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/LGORT"
            , tpCampo: "string"
            , nmCampo: "NMSTOLOC"
            , dsCampo: "Estoque de origem"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/CHARG"
            , tpCampo: "string"
            , nmCampo: "NRLOTE"
            , dsCampo: "Número do lote"
            , blMandatorio: true
        },

        //QUANTIDADE DE MEDIDA DE VENDA

        {
            xPath: "//E1EDL24[LFIMG > 0]/LFIMG"
            , tpCampo: "float"
            , nmCampo: "QTITEMVE"
            , dsCampo: "Quantidade do item de medida de venda"
            , blMandatorio: true
        },

        //UNIDADE DE MEDIDA DE VENDA
        {
            xPath: "//E1EDL24[LFIMG > 0]/VRKME"
            , tpCampo: "string"
            , nmCampo: "DSMEDIVE"
            , dsCampo: "Unidade de medida de venda"
            , blMandatorio: true
        },


        //QUANTIDADE DE UNIDADE DE MEDIDA BASICA
        {
            xPath: "//E1EDL24[LFIMG > 0]/LGMNG"
            , tpCampo: "float"
            , nmCampo: "QTITEMBA"
            , dsCampo: "Quantidade do item básica"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/MEINS"
            , tpCampo: "string"
            , nmCampo: "DSMEDIBA"
            , dsCampo: "Unidade de medida básica"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL24[LFIMG > 0]/HIPOS"
            , tpCampo: "string"
            , nmCampo: "NRREFERE"
            , dsCampo: "Link da partição com a característica geral do item"
            , blMandatorio: true
        },


        //=-=-=-=-=-LOTE =-=-=-=-=-=--

        {
            xPath: "//E1EDL15[ATNAM = 'MAPA_NUMBER']/ATWRT"
            , tpCampo: "string"
            , nmCampo: "NRMAPA"
            , dsCampo: "Lote Mapa"
            , blMandatorio: false
        },

        {
            xPath: "//E1EDL15[ATNAM = 'ORIGINAL_LOT_NUMBER']/ATWRT"
            , tpCampo: "string"
            , nmCampo: "DSALFANU"
            , dsCampo: "Lote Alfanumérico"
            , blMandatorio: false
        },

        {
            xPath: "//E1EDL15[ATNAM = 'LOBM_VFDAT']/ATWRT"
            , tpCampo: "string"
            , nmCampo: "DTVALIDA"
            , dsCampo: "Data de validade do lote"
            , blMandatorio: true
        },

        {
            xPath: "//E1EDL15[ATNAM = 'LOBM_HSDAT']/ATWRT"
            , tpCampo: "string"
            , nmCampo: "DTFABRIC"
            , dsCampo: "Data de fabricação do lote"
            , blMandatorio: true
        }


    ];

    //=======================================\\

    XMLSchema.loopItem1 = "//E1EDL24[LFIMG = 0]";
    XMLSchema.loopItem2 = "//E1EDL24[LFIMG > 0]";
    
    //XMLSchema.loopLote = "//E1EDL20/E1EDL24[LFIMG > 0 and MATNR = 'cdLoopDL']";

    //=======================================\\


    return XMLSchema;
}