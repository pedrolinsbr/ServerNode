module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\

    XMLSchema.entidades =

        [
            //----------------------------------\\
            //EMITENTE
            
            {
                xPath: "//emit/CNPJ"
                , nmCampo: "CJEMITEN"
            },

            {
                xPath: "//emit/IE"
                , nmCampo: "IEEMITEN"
            },

            {
                xPath: "//emit/xNome"
                , nmCampo: "NMEMITEN"
            },

            {
                xPath: "//emit/enderEmit/xLgr"
                , nmCampo: "NMLOGEMI"
            },

            {
                xPath: "//emit/enderEmit/nro"
                , nmCampo: "NRENDEMI"
            },

            {
                xPath: "//emit/enderEmit/xBairro"
                , nmCampo: "NMBAIEMI"
            },            

            {
                xPath: "//emit/enderEmit/cMun"
                , nmCampo: "CDMUNEMI"
            },            

            {
                xPath: "//emit/enderEmit/xMun"
                , nmCampo: "NMMUNEMI"
            },            

            {
                xPath: "//emit/enderEmit/UF"
                , nmCampo: "CDESTEMI"
            },            

            {
                xPath: "//emit/enderEmit/CEP"
                , nmCampo: "NRCEPEMI"
            },               
        
            //----------------------------------\\
            //REMETENTE

            {
                xPath: "//rem/CNPJ"
                , nmCampo: "CJREMETE"
            },

            {
                xPath: "//rem/IE"
                , nmCampo: "IEREMETE"
            },

            {
                xPath: "//rem/xNome"
                , nmCampo: "NMREMETE"
            },            

            {
                xPath: "//rem/enderReme/xLgr"
                , nmCampo: "NMLOGREM"
            },

            {
                xPath: "//rem/enderReme/nro"
                , nmCampo: "NRENDREM"
            },

            {
                xPath: "//rem/enderReme/xBairro"
                , nmCampo: "NMBAIREM"
            },            

            {
                xPath: "//rem/enderReme/cMun"
                , nmCampo: "CDMUNREM"
            },            

            {
                xPath: "//rem/enderReme/xMun"
                , nmCampo: "NMMUNREM"
            },            

            {
                xPath: "//rem/enderReme/UF"
                , nmCampo: "CDESTREM"
            },            

            {
                xPath: "//rem/enderReme/CEP"
                , nmCampo: "NRCEPREM"
            },   

            //----------------------------------\\
            //DESTINATÁRIO

            //CNPJ / CPF está como não obrigatório

            {
                xPath: "//dest/IE"
                , nmCampo: "IEDESTIN"
            },

            {
                xPath: "//dest/xNome"
                , nmCampo: "NMDESTIN"
            },

            {
                xPath: "//dest/enderDest/xLgr"
                , nmCampo: "NMLOGDES"
            },

            {
                xPath: "//dest/enderDest/nro"
                , nmCampo: "NRENDDES"
            },

            {
                xPath: "//dest/enderDest/xBairro"
                , nmCampo: "NMBAIDES"
            },            

            {
                xPath: "//dest/enderDest/cMun"
                , nmCampo: "CDMUNDES"
            },            

            {
                xPath: "//dest/enderDest/xMun"
                , nmCampo: "NMMUNDES"
            },            

            {
                xPath: "//dest/enderDest/UF"
                , nmCampo: "CDESTDES"
            },            

            {
                xPath: "//dest/enderDest/CEP"
                , nmCampo: "NRCEPDES"
            },

            //----------------------------------\\
            //DATA DA EMISSÃO

            {
                xPath: "//ide/dhEmi"
                , nmCampo: "DTEMICTR"
            },

            //----------------------------------\\
            //CFOP, MODELO, SÉRIE, NÚMERO CT, CHAVE, CHAVE REF

            {
                xPath: "//ide/CFOP"
                , nmCampo: "CFOP"
            },

            {
                xPath: "//ide/mod"
                , nmCampo: "DSMODENF"
            },

            {
                xPath: "//ide/serie"
                , nmCampo: "NRSERINF"
            },

            {
                xPath: "//ide/nCT"
                , nmCampo: "CDCTRC"
            },            

            {
                xPath: "//protCTe/infProt/chCTe"
                , nmCampo: "NRCHADOC"
            },

            //----------------------------------\\
            //DOCUMENTO ANTERIOR

            {
                xPath: "//docAnt/emiDocAnt/CNPJ"
                , nmCampo: "CJEMIANT"
            },            

            {
                xPath: "//docAnt/emiDocAnt/IE"
                , nmCampo: "IEEMIANT"
            },

            {
                xPath: "//docAnt/emiDocAnt/UF"
                , nmCampo: "UFEMIANT"
            },

            {
                xPath: "//docAnt/emiDocAnt/xNome"
                , nmCampo: "NMEMIANT"
            },            

            {
                xPath: "//docAnt/emiDocAnt/idDocAnt/idDocAntEle/chCTe"
                , nmCampo: "NRCHAANT"
            },

            //----------------------------------\\
            //RNTRC

            {
                xPath: "//infModal/rodo/RNTRC"
                , nmCampo: "NRRNTRC"
            },

            //----------------------------------\\
            //Status CTe

            {
                xPath: "//protCTe/infProt/cStat"
                , nmCampo: "STCTRC"
            },

            //----------------------------------\\
            //VALOR DA CARGA

            {
                xPath: "//infCarga/vCarga"
                , nmCampo: "VRMERCAD"
            },

            //----------------------------------\\
            //VALOR A RECEBER

            {
                xPath: "//vPrest/vRec"
                , nmCampo: "VRTOTPRE"
            },

        ];

    //=======================================\\    

    XMLSchema.tipo_tomador = 
        {
            xPath: "//ide/toma3/toma"
            , nmCampo: "TPTOMADO"
        };

    //=======================================\\

    XMLSchema.notRequired = 
        [
            //----------------------------------\\
            //DESTINATÁRIO

            {
                xPath: "//dest/CNPJ"
                , nmCampo: "CJDESTIN"
            },

            {
                xPath: "//dest/CPF"
                , nmCampo: "CJDESTIN"
            },            

            //----------------------------------\\
            //EMITENTE / TRANSPORTADOR

            {
                xPath: "//emit/enderEmit/fone"
                , nmCampo: "NRTELEMI"
            },  

            //----------------------------------\\
            //REMETENTE

            {
                xPath: "//rem/fone"
                , nmCampo: "NRTELREM"
            },                

            //----------------------------------\\
            //DESTINATÁRIO

            {
                xPath: "//dest/fone"
                , nmCampo: "NRTELDES"
            },    


            //----------------------------------\\
            //EXPEDIDOR
            
            {
                xPath: "//exped/CNPJ"
                , nmCampo: "CJEXPEDI"
            },

            {
                xPath: "//exped/IE"
                , nmCampo: "IEEXPEDI"
            },

            {
                xPath: "//exped/xNome"
                , nmCampo: "NMEXPEDI"
            },

            {
                xPath: "//exped/fone"
                , nmCampo: "NRTELEXP"
            },    

            {
                xPath: "//exped/enderExped/xLgr"
                , nmCampo: "NMLOGEXP"
            },

            {
                xPath: "//exped/enderExped/nro"
                , nmCampo: "NRENDEXP"
            },

            {
                xPath: "//exped/enderExped/xBairro"
                , nmCampo: "NMBAIEXP"
            },            

            {
                xPath: "//exped/enderExped/cMun"
                , nmCampo: "CDMUNEXP"
            },            

            {
                xPath: "//exped/enderExped/xMun"
                , nmCampo: "NMMUNEXP"
            },            

            {
                xPath: "//exped/enderExped/UF"
                , nmCampo: "CDESTEXP"
            },            

            {
                xPath: "//exped/enderExped/CEP"
                , nmCampo: "NRCEPEXP"
            },

            //----------------------------------\\
            //RECEBEDOR

            {
                xPath: "//receb/CNPJ"
                , nmCampo: "CJRECEBE"
            },

            {
                xPath: "//receb/IE"
                , nmCampo: "IERECEBE"
            },

            {
                xPath: "//receb/xNome"
                , nmCampo: "NMRECEBE"
            },

            {
                xPath: "//receb/fone"
                , nmCampo: "NRTELREC"
            },    

            {
                xPath: "//receb/enderReceb/xLgr"
                , nmCampo: "NMLOGREC"
            },

            {
                xPath: "//receb/enderReceb/nro"
                , nmCampo: "NRENDREC"
            },

            {
                xPath: "//receb/enderReceb/xBairro"
                , nmCampo: "NMBAIREC"
            },            

            {
                xPath: "//receb/enderReceb/cMun"
                , nmCampo: "CDMUNREC"
            },            

            {
                xPath: "//receb/enderReceb/xMun"
                , nmCampo: "NMMUNREC"
            },            

            {
                xPath: "//receb/enderReceb/UF"
                , nmCampo: "CDESTREC"
            },            

            {
                xPath: "//receb/enderReceb/CEP"
                , nmCampo: "NRCEPREC"
            },

            //----------------------------------\\
            //ICMS
            
            {
                xPath: "//imp/ICMS/ICMS00/pICMS"
                , nmCampo: "PCALIICM"
            },

            {
                xPath: "//imp/ICMS/ICMS00/vBC"
                , nmCampo: "VRBASECA"
            },
            
            {
                xPath: "//imp/ICMS/ICMS00/vICMS"
                , nmCampo: "VRICMS"
            },

            //----------------------------------\\
            //DADOS CTe REFERÊNCIA

            {
                xPath: "//infOutros/nDoc"
                , nmCampo: "NRDOCANT"
            },

            {
                xPath: "//infOutros/dEmi"
                , nmCampo: "DTDOCANT"
            },

            {
                xPath: "//infOutros/vDocFisc"
                , nmCampo: "VRDOCANT"
            },
            
            //----------------------------------\\
            //OBSERVAÇÃO

            {
                xPath: "//compl/xObs"
                , nmCampo: "DSINFCPL"
            },            
        ]; 

    //=======================================\\

    XMLSchema.tomador = 
        [
            {                
                xPath: "//ide/toma4/CNPJ"
                , nmCampo: "CJTOMADO"
            },

            {
                xPath: "//ide/toma4/IE"
                , nmCampo: "IETOMADO"
            },
            
            {
                xPath: "//ide/toma4/xNome"
                , nmCampo: "NMTOMADO"
            },

            {
                xPath: "//ide/toma4/enderToma/xLgr"
                , nmCampo: "NMLOGTOM"
            },

            {
                xPath: "//ide/toma4/enderToma/nro"
                , nmCampo: "NRENDTOM"
            },

            {
                xPath: "//ide/toma4/enderToma/xBairro"
                , nmCampo: "NMBAITOM"
            },            

            {
                xPath: "//ide/toma4/enderToma/cMun"
                , nmCampo: "CDMUNTOM"
            },            

            {
                xPath: "//ide/toma4/enderToma/xMun"
                , nmCampo: "NMMUNTOM"
            },            

            {
                xPath: "//ide/toma4/enderToma/UF"
                , nmCampo: "CDESTTOM"
            },            

            {
                xPath: "//ide/toma4/enderToma/CEP"
                , nmCampo: "NRCEPTOM"
            },

        ];

    //=======================================\\        

    XMLSchema.componentes = 

        [
            {
                xPath: "//vPrest/Comp/xNome"
                , nmCampo: "NMCOMPON"
            },

            {
                xPath: "//vPrest/Comp/vComp"
                , nmCampo: "VRCOMPON"
            },            

        ];

    //=======================================\\

    return XMLSchema;
}
