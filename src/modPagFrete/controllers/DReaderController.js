module.exports = function (app, cb) {

    const DIR_CTE_IN = process.env.FOLDER_CTE_IN;
    
    const comCtrl    = app.src.modPagFrete.controllers.CommonController;	
	const utilsCA    = comCtrl.utilsCA;
    const utilsDir   = app.src.utils.Diretorio;
    const utilsFMT   = comCtrl.utilsFMT;
    const XMLSchema  = app.src.modPagFrete.models.XMLSchema;

    var api = {};

    api.utilsFMT = utilsFMT;

    //-----------------------------------------------------------------------\\
    /**
    * @description Lista arquivos para importação
    * @function listDocFiles
    * @author Rafael Delfino Calzado
    * @since 13/11/2018
    *
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\    

    api.listDocFiles = function () { 
    
        try { 
    
            return utilsDir.listFiles(DIR_CTE_IN);    
      
        } catch (err) { 
    
            throw err;
    
        } 
    
    } 
    
    //-----------------------------------------------------------------------\\
    /**
    * @description Lê e valida arquivo XML
    * @function readXML
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @returns {Object} Objeto XML
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\   

    api.readXML = function (objFile) { 
    
        try { 
    
            var strXml = utilsCA.lerArquivo(`${DIR_CTE_IN}${objFile.filename}`);

            //remove atributo xmlns 
            strXml = strXml.replace(/\s+xmlns="\w+:\/{2}\w+(\.\w+)+\/\w+"/g, ''); 
    
            var xmlDom = utilsCA.getXmlDom(strXml);
    
            var objDoc = comCtrl.readNodes(xmlDom, XMLSchema.cte, 0);

            objDoc = Object.assign(objDoc, this.tpTomador(xmlDom));
            objDoc.arComp = this.componentePreco(xmlDom);

            if (objDoc.arComp.length == 0)
                objDoc.arOccurrence.push(utilsFMT.gerarOcorrencia(1, 'NMCOMPON', 'Nenhum componente de preço encontrado no documento XML'));

            return objDoc;
    
        } catch (err) { 
    
            throw err; 
    
        } 
    
    } 

    //-----------------------------------------------------------------------\\
    /**
    * @description Classifica tipo do tomador
    * @function tpTomador
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @returns {Object} Objeto preenchido
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\   

    api.tpTomador = function (xmlDom) {

        try {

            var objTomador = comCtrl.readNodes(xmlDom, XMLSchema.tipo_tomador, 0);

            switch (parseInt(objTomador.TPTOMADO)) {

                case 1:     objTomador.DSTOMADO = 'REMETENTE'; break;
                case 2:     objTomador.DSTOMADO = 'EXPEDIDOR'; break;
                case 3:     objTomador.DSTOMADO = 'DESTINATÁRIO'; break;

                default:    
                    objTomador.TPTOMADO = 4;
                    objTomador.DSTOMADO = 'OUTRO/4PL'; 
                    break;

            } 
            
            delete objTomador.arOccurrence;

            return objTomador;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Retorna os componentes de preço do documento
    * @function componentePreco
    * @author Rafael Delfino Calzado
    * @since 13/11/2019
    *
    * @returns {Array}  Array com os componentes 
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\   

    api.componentePreco = function (xmlDom) {

        try {

            var arComp  = [];
            var objComp = {};
            var ttComp  = comCtrl.utilsCA.getXmlNodes(XMLSchema.componentes[0].xPath, xmlDom); //Nome do Componente

            for (var i = 0; i<ttComp.length; i++) {

                objComp = comCtrl.readNodes(xmlDom, XMLSchema.componentes, i);

                if (objComp.arOccurrence.length == 0) { 

                    delete objComp.arOccurrence;
                    arComp.push(objComp);
                    
                }

            }

            return arComp;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\

    return api;

}