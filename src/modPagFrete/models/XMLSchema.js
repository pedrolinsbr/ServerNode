module.exports = function (app, cb) {

    var XMLSchema = {};

    //=======================================\\

    XMLSchema.cte =

        [
            //----------------------------------\\
            //EMITENTE
            
            {
                xPath:          '//emit/CNPJ',
                tpField:        'integer',
                nmField:        'CJEMITEN',
                dsField:        'CNPJ do Emitente',
                blMandatory:    true
            },

            {
                xPath:          '//emit/IE',
                tpField:        'integer',
                nmField:        'IEEMITEN',
                dsField:        'IE do Emitente',
                blMandatory:    true
            },            

            {
                xPath:          '//emit/xNome',
                tpField:        'string',
                nmField:        'NMEMITEN',
                dsField:        'Nome do Emitente',
                blMandatory:    true
            },

            {
                xPath:          '//emit/enderEmit/xLgr',
                tpField:        'string',
                nmField:        'NMLOGEMI',
                dsField:        'Logradouro do Emitente',
                blMandatory:    true
            },
                                    
            {
                xPath:          '//emit/enderEmit/nro',
                tpField:        'string',
                nmField:        'NRLOGEMI',
                dsField:        'Número do Logradouro do Emitente',
                blMandatory:    true
            },

            {
                xPath:          '//emit/enderEmit/xBairro',
                tpField:        'string',
                nmField:        'NMBAIEMI',
                dsField:        'Bairro do Logradouro do Emitente',
                blMandatory:    true
            },
          
            {
                xPath:          '//emit/enderEmit/cMun',
                tpField:        'integer',
                nmField:        'CDMUNEMI',
                dsField:        'Código do Município do Emitente',
                blMandatory:    true
            },

            {
                xPath:          '//emit/enderEmit/xMun',
                tpField:        'string',
                nmField:        'NMMUNEMI',
                dsField:        'Nome do Município do Emitente',
                blMandatory:    true
            },

            {
                xPath:          '//emit/enderEmit/UF',
                tpField:        'string',
                nmField:        'CDESTEMI',
                dsField:        'Sigla do Estado do Emitente',
                blMandatory:    true
            },            

            {
                xPath:          '//emit/enderEmit/CEP',
                tpField:        'integer',
                nmField:        'CPEMITEN',
                dsField:        'CEP do Emitente',
                blMandatory:    true
            },

            {
                xPath:          '//emit/enderEmit/fone',
                tpField:        'string',
                nmField:        'NRTELEMI',
                dsField:        'Telefone do Emitente',
                blMandatory:    false
            },
             
            //----------------------------------\\
            //REMETENTE

            {
                xPath:          '//rem/CNPJ',
                tpField:        'integer',
                nmField:        'CJREMETE',
                dsField:        'CNPJ do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/IE',
                tpField:        'integer',
                nmField:        'IEREMETE',
                dsField:        'IE do Remetente',
                blMandatory:    false
            },

            {
                xPath:          '//rem/xNome',
                tpField:        'string',
                nmField:        'NMREMETE',
                dsField:        'Nome do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/enderReme/xLgr',
                tpField:        'string',
                nmField:        'NMLOGREM',
                dsField:        'Logradouro do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/enderReme/nro',
                tpField:        'string',
                nmField:        'NRLOGREM',
                dsField:        'Número do Logradouro do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/enderReme/xBairro',
                tpField:        'string',
                nmField:        'NMBAIREM',
                dsField:        'Bairro do Logradouro do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/enderReme/cMun',
                tpField:        'integer',
                nmField:        'CDMUNREM',
                dsField:        'Código do Município do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/enderReme/xMun',
                tpField:        'string',
                nmField:        'NMMUNREM',
                dsField:        'Nome do Município do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/enderReme/UF',
                tpField:        'string',
                nmField:        'CDESTREM',
                dsField:        'Sigla do Estado do Remetente',
                blMandatory:    true
            },                       

            {
                xPath:          '//rem/enderReme/CEP',
                tpField:        'integer',
                nmField:        'CPREMETE',
                dsField:        'CEP do Remetente',
                blMandatory:    true
            },

            {
                xPath:          '//rem/fone',
                tpField:        'string',
                nmField:        'NRTELREM',
                dsField:        'Telefone do Remetente',
                blMandatory:    false
            },            

            //----------------------------------\\
            //DESTINATÁRIO

            {
                xPath:          '//dest/CNPJ',
                tpField:        'integer',
                nmField:        'CJDESTIN',
                dsField:        'CNPJ do Destinatário',
                blMandatory:    false
            },

            {
                xPath:          '//dest/CPF',
                tpField:        'integer',
                nmField:        'CJDESTIN',
                dsField:        'CPF do Destinatário',
                blMandatory:    false
            },            

            {
                xPath:          '//dest/IE',
                tpField:        'integer',
                nmField:        'IEDESTIN',
                dsField:        'IE do Destinatário',
                blMandatory:    false
            },

            {
                xPath:          '//dest/xNome',
                tpField:        'string',
                nmField:        'NMDESTIN',
                dsField:        'Nome do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/enderDest/xLgr',
                tpField:        'string',
                nmField:        'NMLOGDES',
                dsField:        'Logradouro do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/enderDest/nro',
                tpField:        'string',
                nmField:        'NRLOGDES',
                dsField:        'Número do Logradouro do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/enderDest/xBairro',
                tpField:        'string',
                nmField:        'NMBAIDES',
                dsField:        'Bairro do Logradouro do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/enderDest/cMun',
                tpField:        'integer',
                nmField:        'CDMUNDES',
                dsField:        'Código do Município do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/enderDest/xMun',
                tpField:        'string',
                nmField:        'NMMUNDES',
                dsField:        'Nome do Município do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/enderDest/UF',
                tpField:        'string',
                nmField:        'CDESTDES',
                dsField:        'Sigla do Estado do Destinatário',
                blMandatory:    true
            },                       

            {
                xPath:          '//dest/enderDest/CEP',
                tpField:        'integer',
                nmField:        'CPDESTIN',
                dsField:        'CEP do Destinatário',
                blMandatory:    true
            },

            {
                xPath:          '//dest/fone',
                tpField:        'string',
                nmField:        'NRTELDES',
                dsField:        'Telefone do Destinatário',
                blMandatory:    false
            },

            //----------------------------------\\
            //EXPEDIDOR
            
            {
                xPath:          '//exped/CNPJ',
                tpField:        'integer',
                nmField:        'CJEXPEDI',
                dsField:        'CNPJ do Expedidor',
                blMandatory:    false
            },        

            {
                xPath:          '//exped/IE',
                tpField:        'integer',
                nmField:        'IEEXPEDI',
                dsField:        'IE do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/xNome',
                tpField:        'string',
                nmField:        'NMEXPEDI',
                dsField:        'Nome do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/enderExped/xLgr',
                tpField:        'string',
                nmField:        'NMLOGEXP',
                dsField:        'Logradouro do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/enderExped/nro',
                tpField:        'string',
                nmField:        'NRLOGEXP',
                dsField:        'Número do Logradouro do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/enderExped/xBairro',
                tpField:        'string',
                nmField:        'NMBAIEXP',
                dsField:        'Bairro do Logradouro do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/enderExped/cMun',
                tpField:        'integer',
                nmField:        'CDMUNEXP',
                dsField:        'Código do Município do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/enderExped/xMun',
                tpField:        'string',
                nmField:        'NMMUNEXP',
                dsField:        'Nome do Município do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/enderExped/UF',
                tpField:        'string',
                nmField:        'CDESTEXP',
                dsField:        'Sigla do Estado do Expedidor',
                blMandatory:    false
            },                       

            {
                xPath:          '//exped/enderExped/CEP',
                tpField:        'integer',
                nmField:        'CPEXPEDI',
                dsField:        'CEP do Expedidor',
                blMandatory:    false
            },

            {
                xPath:          '//exped/fone',
                tpField:        'string',
                nmField:        'NRTELEXP',
                dsField:        'Telefone do Expedidor',
                blMandatory:    false
            },            

            //----------------------------------\\
            //RECEBEDOR

            {
                xPath:          '//receb/CNPJ',
                tpField:        'integer',
                nmField:        'CJRECEBE',
                dsField:        'CNPJ do Recebedor',
                blMandatory:    false
            },        

            {
                xPath:          '//receb/IE',
                tpField:        'integer',
                nmField:        'IERECEBE',
                dsField:        'IE do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/xNome',
                tpField:        'string',
                nmField:        'NMRECEBE',
                dsField:        'Nome do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/enderReceb/xLgr',
                tpField:        'string',
                nmField:        'NMLOGREC',
                dsField:        'Logradouro do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/enderReceb/nro',
                tpField:        'string',
                nmField:        'NRLOGREC',
                dsField:        'Número do Logradouro do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/enderReceb/xBairro',
                tpField:        'string',
                nmField:        'NMBAIREC',
                dsField:        'Bairro do Logradouro do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/enderReceb/cMun',
                tpField:        'integer',
                nmField:        'CDMUNREC',
                dsField:        'Código do Município do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/enderReceb/xMun',
                tpField:        'string',
                nmField:        'NMMUNREC',
                dsField:        'Nome do Município do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/enderReceb/UF',
                tpField:        'string',
                nmField:        'CDESTREC',
                dsField:        'Sigla do Estado do Recebedor',
                blMandatory:    false
            },                       

            {
                xPath:          '//receb/enderReceb/CEP',
                tpField:        'integer',
                nmField:        'CPRECEBE',
                dsField:        'CEP do Recebedor',
                blMandatory:    false
            },

            {
                xPath:          '//receb/fone',
                tpField:        'string',
                nmField:        'NRTELREC',
                dsField:        'Telefone do Recebedor',
                blMandatory:    false
            }, 

            //--------------------------------\\
            //TOMADOR

            {
                xPath:          '//ide/toma4/CNPJ',
                tpField:        'integer',
                nmField:        'CJTOMADO',
                dsField:        'CNPJ do Tomador',
                blMandatory:    false
            }, 

            {
                xPath:          '//ide/toma4/IE',
                tpField:        'integer',
                nmField:        'IETOMADO',
                dsField:        'IE do Tomador',
                blMandatory:    false
            },             

            {
                xPath:          '//ide/toma4/xNome',
                tpField:        'string',
                nmField:        'NMTOMADO',
                dsField:        'Nome do Tomador',
                blMandatory:    false
            },

            {
                xPath:          '//ide/toma4/enderToma/xLgr',
                tpField:        'string',
                nmField:        'NMLOGTOM',
                dsField:        'Logradouro do Tomador',
                blMandatory:    false
            },

            {
                xPath:          '//ide/toma4/enderToma/nro',
                tpField:        'string',
                nmField:        'NRENDTOM',
                dsField:        'Número do Logradouro do Tomador',
                blMandatory:    false
            },            

            {
                xPath:          '//ide/toma4/enderToma/xBairro',
                tpField:        'string',
                nmField:        'NMBAITOM',
                dsField:        'Bairro do Tomador',
                blMandatory:    false
            },

            {
                xPath:          '//ide/toma4/enderToma/cMun',
                tpField:        'integer',
                nmField:        'CDMUNTOM',
                dsField:        'Código do Município do Tomador',
                blMandatory:    false
            },

            {
                xPath:          '//ide/toma4/enderToma/xMun',
                tpField:        'string',
                nmField:        'NMMUNTOM',
                dsField:        'Nome do Município do Tomador',
                blMandatory:    false
            },

            {
                xPath:          '//ide/toma4/enderToma/UF',
                tpField:        'string',
                nmField:        'CDESTTOM',
                dsField:        'Sigla do Estado do Tomador',
                blMandatory:    false
            },  
        
            {
                xPath:          '//ide/toma4/enderToma/CEP',
                tpField:        'integer',
                nmField:        'CPTOMADO',
                dsField:        'CEP do Tomador',
                blMandatory:    false
            },

            //---------------------------------\\
            // CFOP, Modelo, Série, CTRC, Chave, Data da Emissão

            {
				xPath: 			'//ide/CFOP',
				tpField:		'integer',
				nmField: 		'CFOP',
				dsField:		'CFOP - Código Fiscal de Operações',
				blMandatory:	true
            },

            {
				xPath: 			'//ide/mod',
				tpField:		'integer',
				nmField: 		'DSMODENF',
				dsField:		'Modelo do CT-e',
				blMandatory:	true
            },

            {
				xPath: 			'//ide/serie',
				tpField:		'string',
				nmField: 		'NRSERINF',
				dsField:		'Série do CT-e',
				blMandatory:	true

            },

            {
				xPath: 			'//ide/nCT',
				tpField:		'integer',
				nmField: 		'CDCTRC',
				dsField:		'Número do CTRC',
				blMandatory:	true
            },            

            {
				xPath: 			'//protCTe/infProt/chCTe',
				tpField:		'integer',
				nmField: 		'NRCHADOC',
				dsField:		'Número da Chave do CT-e',
				blMandatory:	true
            },

            {
				xPath: 			'//ide/dhEmi',
				tpField: 		'date',
				nmField: 		'DTEMICTR',
				dsField: 		'Data da Emissão do CT-e',
				blMandatory: 	true
			},
			
            //---------------------------------\\
            //ICMS
            
            {
                xPath:          '//imp/ICMS//CST',
                tpField:        'integer',
                nmField:        'CDSUBSTRI',
                dsField:        'Código ST',
                blMandatory:    true
            }, 

            {
                xPath:          '//imp/ICMS//pICMS',
                tpField:        'float',
                nmField:        'PCALIICM',
                dsField:        'Alíquota ICMS',
                blMandatory:    false
            }, 

            {
                xPath:          '//imp/ICMS//vBC',
                tpField:        'float',
                nmField:        'VRBASECA',
                dsField:        'Base de Cálculo ICMS',
                blMandatory:    false
            },            

            {
                xPath:          '//imp/ICMS//vICMS',
                tpField:        'float',
                nmField:        'VRICMS',
                dsField:        'Valor ICMS',
                blMandatory:    false
            },

            //----------------------------------\\
            //DADOS CTe REFERÊNCIA

            {
                xPath:          '//infOutros/nDoc',
                tpField:        'string',
                nmField:        'NRDOCANT',
                dsField:        'Chave CT-e anterior',
                blMandatory:    false
            },

            {
                xPath:          '//infOutros/dEmi',
                tpField:        'string',
                nmField:        'DTDOCANT',
                dsField:        'Data CT-e anterior',
                blMandatory:    false
            },

            {
                xPath:          '//infOutros/vDocFisc',
                tpField:        'string',
                nmField:        'VRDOCANT',
                dsField:        'Valor CT-e anterior',
                blMandatory:    false
            },
    
            //----------------------------------\\
            //OBSERVAÇÃO

            {
                xPath:          '//compl/xObs',
                tpField:        'string',
                nmField:        'DSINFCPL',
                dsField:        'Observação',
                blMandatory:    false
            },


            //----------------------------------\\
            //DOCUMENTO ANTERIOR

            {
                xPath:          '//docAnt/emiDocAnt/idDocAnt/idDocAntEle/chCTe',
                tpField:        'integer',
                nmField:        'NRCHAANT',
                dsField:        'Chave do Doc. anterior',
                blMandatory:    true
            },  

            {
                xPath:          '//docAnt/emiDocAnt/CNPJ',
                tpField:        'integer',
                nmField:        'CJEMIANT',
                dsField:        'CNPJ do Emissor do Doc. anterior',
                blMandatory:    false
            },  
            
            {
                xPath:          '//docAnt/emiDocAnt/IE',
                tpField:        'integer',
                nmField:        'IEEMIANT',
                dsField:        'IE do Emissor do Doc. anterior',
                blMandatory:    false
            },

            {
                xPath:          '//docAnt/emiDocAnt/xNome',
                tpField:        'string',
                nmField:        'NMEMIANT',
                dsField:        'Nome do Emissor do Doc. anterior',
                blMandatory:    false
            },

            {
                xPath:          '//docAnt/emiDocAnt/UF',
                tpField:        'string',
                nmField:        'UFEMIANT',
                dsField:        'Sigla do Estado do Emissor do Doc. anterior',
                blMandatory:    false
            },             

            //----------------------------------\\
            //RNTRC

            {
                xPath:          '//infModal/rodo/RNTRC',
                tpField:        'integer',
                nmField:        'NRRNTRC',
                dsField:        'Número RNTRC',
                blMandatory:    false
            }, 

            //----------------------------------\\
            //Status CTe

            {
                xPath:          '//protCTe/infProt/cStat',
                tpField:        'integer',
                nmField:        'CDSTCTRC',
                dsField:        'Código de Status CTRC',
                blMandatory:    true
            }, 

            {
                xPath:          '//protCTe/infProt/xMotivo',
                tpField:        'string',
                nmField:        'DSSTCTRC',
                dsField:        'Descrição Status CTRC',
                blMandatory:    true
            }, 


            //----------------------------------\\
            //VALOR DA CARGA

            {
                xPath:          '//infCarga/vCarga',
                tpField:        'float',
                nmField:        'VRMERCAD',
                dsField:        'Valor da Mercadoria',
                blMandatory:    false
            },

            //----------------------------------\\
            //VALOR A RECEBER

            {
                xPath:          '//vPrest/vRec',
                tpField:        'float',
                nmField:        'VRTOTFRE',
                dsField:        'Valor do Frete',
                blMandatory:    true
            },

        ];

    //=======================================\\    

    XMLSchema.tipo_tomador = 
        [
            {
                xPath:          '//ide/toma3/toma',
                tpField:        'integer',
                nmField:        'TPTOMADO',
                dsField:        'Tipo de Papel do Tomador',
                blMandatory:    false
            }
        ];

    //=======================================\\        

    XMLSchema.componentes = 

        [
            {
                xPath:          '//vPrest/Comp/xNome',
                tpField:        'string',
                nmField:        'NMCOMPON',
                dsField:        'Nome do Componente de Preço',
                blMandatory:    true
            },

            {
                xPath:          '//vPrest/Comp/vComp',
                tpField:        'float',
                nmField:        'VRCOMPON',
                dsField:        'Valor do Componente de Preço',
                blMandatory:    true
            }
        ];

    //=======================================\\

    return XMLSchema;
}
