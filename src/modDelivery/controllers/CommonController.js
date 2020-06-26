module.exports = function (app, cb) {

    const logger   = app.config.logger;
    const utilsCA  = app.src.utils.ConversorArquivos;
    const fmt      = app.src.utils.Formatador;
    const tmz      = app.src.utils.DataAtual;
    
    var api = {};

    //-----------------------------------------------------------------------\\ 

    api.formatDelivery = function (objDelivery) {

		logger.debug(`Obtendo Delivery: ${objDelivery.CDDELIVE}`);
    
        //=======================================\\
        //Dados iniciais 

        objDelivery.IDG014   = 5;	//SYNGENTA CROP
        objDelivery.SNLIBROT = (objDelivery.tpFlag === undefined) ? 0 : 1;
        objDelivery.SNINDSEG = (objDelivery.blSegregate == 'Y') ? 'S' : 'N'; // Produto segregado

        //=======================================\\
        //Dados do Destinatário

        if (objDelivery.hasOwnProperty('cpDestin'))
            objDelivery.cpDestin = objDelivery.cpDestin.replace(/(\-|\.)/g, ''); 

        if (objDelivery.hasOwnProperty('cpRemete')) 
            objDelivery.cpRemete = objDelivery.cpRemete.replace(/(\-|\.)/g, ''); 

        if (objDelivery.hasOwnProperty('cpBuyer'))             
            objDelivery.cpBuyer = objDelivery.cpBuyer.replace(/(\-|\.)/g, ''); 

        if (objDelivery.hasOwnProperty('cnpjCliente')) {
            objDelivery.CJCLIENT = objDelivery.cnpjCliente;
            objDelivery.TPPESSOA = 'J';

        } else { 
            objDelivery.CJCLIENT = objDelivery.cpfCliente;
            objDelivery.TPPESSOA = 'F';

        }

        //=======================================\\
        //Tipo de Operação

        switch (objDelivery.tpDelivery) {

            case 'ZLR': //Recusa e Devolução
                objDelivery.TPDELIVE = (objDelivery.blRecusa) ? 4 : 3;
                break;

            case 'LF': //Venda
                objDelivery.TPDELIVE = 2;
                break;

            case 'TFDT': //Transferência
            default:
                objDelivery.TPDELIVE = 1;
                break;

        }

        //=======================================\\
        //Etapa inicial

        switch (objDelivery.TPDELIVE) {

            case 3: //Devolução
                objDelivery.STETAPA = (objDelivery.tpFlag === undefined) ? 25 : 20; //Backlog L.R.
                break;

            case 4: //Recusa
                objDelivery.STETAPA  = 25; //Encerrada
                objDelivery.SNFIMREC = 1; //Gatilho para ASN Represada
                break;

            case 1: //Transferência
            default:
                objDelivery.STETAPA = 0; //Backlog Integrador
                break;
        }
        
        objDelivery.STULTETA = objDelivery.STETAPA;

        //=======================================\\
        // Tipo de função da Delivery

        switch (objDelivery.tpFuncao) {

            case 'CancelReplace':
                objDelivery.STDELIVE = 'D';
                objDelivery.STETAPA  = 7; //A Cancelar
                break;

            case 'AmendReplace':
                objDelivery.STDELIVE = 'R';
                break;

            case 'Create':
            default:
                objDelivery.STDELIVE = 'C';
                break;
        }    
        
        //=======================================\\

        if (objDelivery.TPDELIVE > 2) { //Recusa e Devolução

            objDelivery.CDFILIAL = objDelivery.cdDestin;
            objDelivery.CPFILIAL = objDelivery.cpDestin;

            if (objDelivery.hasOwnProperty('WHDEPART')) {
            
                objDelivery.IDEXTCLI = objDelivery.cdBuyer;
                objDelivery.CPCLIENT = objDelivery.cpBuyer;
                objDelivery.CPWHDEPA = objDelivery.cpRemete;
        
            } else {

                objDelivery.IDEXTCLI = objDelivery.cdRemete;
                objDelivery.CPCLIENT = objDelivery.cpRemete;
    
            }            

            if (!objDelivery.hasOwnProperty('CDMOTIVO'))
                objDelivery.arOcorrencia.push(fmt.gerarOcorrencia(2, 'CDMOTIVO', 'Motivo de Devolução/Recusa não informado', objDelivery.CDFILIAL));
        
            if (objDelivery.hasOwnProperty('cdDelRef'))
                objDelivery.cdDelRef = `F${objDelivery.cdDelRef}`;                            

        } else {

            objDelivery.CDFILIAL = objDelivery.cdRemete;
            objDelivery.CPFILIAL = objDelivery.cpRemete;

            if (objDelivery.hasOwnProperty('WHDEPART')) {
            
                objDelivery.IDEXTCLI = objDelivery.cdBuyer;
                objDelivery.CPCLIENT = objDelivery.cpBuyer;
                objDelivery.CPWHDEPA = objDelivery.cpDestin;
        
            } else {
    
                objDelivery.IDEXTCLI = objDelivery.cdDestin;
                objDelivery.CPCLIENT = objDelivery.cpDestin;
    
            }            

        }

        return objDelivery;
    }

    //-----------------------------------------------------------------------\\ 

    api.validaCampo = function(tpCampo, vrCampo) {

        var blOcorrencia = false;

        switch (tpCampo) {

            case 'boolean':
                vrCampo = vrCampo.toLowerCase();

                switch (vrCampo) {
                    case 'true':
                    case 'y':
                        vrCampo = true;
                        blOcorrencia = false;
                        break;

                    case 'false':
                    case 'n':
                        vrCampo = false;
                        blOcorrencia = false;
                        break;

                    default:
                        vrCampo = false;
                        blOcorrencia = true;
                        break;
                }

                break;

            case 'float':
                vrCampo = vrCampo.replace(/\,/g, '');
                blOcorrencia = isNaN(vrCampo);
                vrCampo = parseFloat(vrCampo);
                break;

            case 'number':
                blOcorrencia = isNaN(vrCampo);
                vrCampo = parseInt(vrCampo);
                break;

            case 'date':
                blOcorrencia = !(utilsCA.isDate(vrCampo));
                if (!blOcorrencia) vrCampo = tmz.retornaData(vrCampo, 'YYYY-MM-DD');
                break;

            case 'datelong':
                vrCampo = vrCampo.substr(0, 4) + '-' + vrCampo.substr(4, 2) + '-' + vrCampo.substr(6, 2);
                blOcorrencia = !(utilsCA.isDate(vrCampo));
                if (!blOcorrencia) vrCampo = tmz.retornaData(vrCampo, 'YYYY-MM-DD');
                break;

            case 'email':
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                blOcorrencia = !re.test(vrCampo);
                break;

            default:
                blOcorrencia = (typeof vrCampo != 'string')
                if (!blOcorrencia) {
                    vrCampo = vrCampo.replace(/(\s+|\t+)/g, ' '); //ESPAÇO / TAB
                    blOcorrencia = (vrCampo.length == 0);
                }
                break;

        }

        return { vrCampo, blOcorrencia };

    }

    //-----------------------------------------------------------------------\\ 

    api.buscaNos = function (xmlDom, arXML, i) {

        try {

            var objTmp = { arOcorrencia: [] };

            for (var objRef of arXML) {
    
                var nodes = utilsCA.getXmlNodes(objRef.xPath, xmlDom);
    
                if (i >= nodes.length) {
    
                    var idOcorrencia = 1;
                    var blOcorrencia = true;				
    
                } else {
    
                    var idOcorrencia = 2;
                    var vrCampo      = (nodes[i].firstChild) ? nodes[i].firstChild.data : null;
                    var objValida    = this.validaCampo(objRef.tpCampo, vrCampo);
                    var blOcorrencia = objValida.blOcorrencia;
    
                    if (!blOcorrencia) objTmp[objRef.nmCampo] = objValida.vrCampo;
    
                }
    
                if ((blOcorrencia) && (objRef.blMandatorio))			
                    objTmp.arOcorrencia.push(fmt.gerarOcorrencia(idOcorrencia, objRef.nmCampo, objRef.dsCampo));
    
            }
    
            return objTmp;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}