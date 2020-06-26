module.exports = function (app, cb) {

    const utilsCA 	= app.src.utils.ConversorArquivos;
    const utilsDir  = app.src.utils.Diretorio;
    const utilsFMT  = app.src.utils.Formatador;

    const XMLSchema = app.src.modPagFrete.models.XMLModel;
    const CTeSchema = app.src.modPagFrete.models.CTEModel;

    const dirIn     = process.env.FOLDER_CTE_IN;
    const dirOut    = process.env.FOLDER_CTE_OUT;

    var api = {};

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Download da cópia do XML da CTe importada
    * @function downloadCTe
    * @author Rafael Delfino Calzado
    * @since 14/06/2018
    *
    * @param   {String} id Chave do documento
    * @returns {file}      download do arquivo
    */
    //-----------------------------------------------------------------------\\     

    api.downloadCTe = function (req, res, next) {

        try {

            var file = `cte-${req.params.id}.xml`;

            if (utilsDir.existsPath(`${dirOut}${file}`))
                res.sendFile(file, { root: dirOut });
            else
                res.status(500).send({ erro: 'Arquivo não encontrado' });
    

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Retorna um array de objetos dos CTe's contidos no diretório
    * @function mostrarDirCTe
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @returns {Array}  Retorna o array de todos os CTe's
    */
    //-----------------------------------------------------------------------\\ 

    api.mostrarDirCTe = function (req, res, next) {

        try {

            var arCTe = api.lerDirCTe(req, res, next);

            res.status(200).send(arCTe);    

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Formata os XML's dos CTe's em Objetos e devolve em um array
    * @function lerDirCTE
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @returns {Array}  Retorna o array de objetos
    */
    //-----------------------------------------------------------------------\\ 

    api.lerDirCTe = function (req, res, next) {

        try {

            var arCTe   = [];
            var arFiles = utilsDir.listFiles(dirIn);
    
            for (var file of arFiles) {
                    
                var param  = { dir: dirIn, filename: file.filename };            
                var objCTe = this.lerXMLCTe(param, res, next);
    
                arCTe.push(objCTe);
    
            }
    
            return arCTe;

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Lê o XML do CTe e cria e valida o objeto
    * @function lerXMLCTe
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @param   {String} dir Diretório de leitura
    * @param   {String} filename Arquivo encontrado
    * @returns {Object} Retorna o objeto 
    */
    //-----------------------------------------------------------------------\\ 

    api.lerXMLCTe = function (req, res, next) {

        try {

            var strXml 			 = utilsCA.lerArquivo(`${req.dir}${req.filename}`);

            //remover atributo xmlns 
            strXml               = strXml.replace(/\s+xmlns="\w+:\/{2}\w+(\.\w+)+\/\w+"/g, ''); 
    
            var xmlDom 			 = utilsCA.getXmlDom(strXml);
    
            var objCTe           = this.cteHeader(xmlDom);
            objCTe.filename      = req.filename;
    
            var objVer           = utilsFMT.validaEsquema(objCTe, CTeSchema.CTe.columns);      
            objCTe               = Object.assign(objCTe, objVer);
    
            return objCTe;
    
        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 
    /**
    * @description Monta o cabeçalho do objeto CTe
    * @function cteHeader
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @param   {Object} xmlDom Objeto XML Completo para pesquisa
    * @returns {Object} Retorna o objeto CTe 
    */
    //-----------------------------------------------------------------------\\ 

    api.cteHeader = function (xmlDom) {

        try {

            var objCTe = { arOcorre: [] };

            var XMLModel  = XMLSchema.entidades;
    
            for (var xml of XMLModel) {
    
                var nodes = utilsCA.getXmlNodes(xml.xPath, xmlDom);
                
                if ((nodes.length > 0) && (nodes[0].firstChild)) 
                    objCTe[xml.nmCampo] = nodes[0].firstChild.data;
                else 
                    objCTe.arOcorre.push(utilsFMT.gerarOcorrencia(1, xml.nmCampo, '-'));
            }
    
            return Object.assign(objCTe, this.cteNotRequired(objCTe, xmlDom));

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\          
    /**
    * @description Busca pelos campos não obrigatórios do CTe
    * @function cteNotRequired
    * @author Rafael Delfino Calzado
    * @since 15/06/2018
    *
    * @param   {Object} objCTe Objeto com os dados de cabeçalho
    * @param   {Object} xmlDom Objeto XML Completo para pesquisa
    * @returns {Object} Retorna o objeto CTe 
    */
    //-----------------------------------------------------------------------\\ 

    api.cteNotRequired = function (objCTe, xmlDom) {

        try {

            var XMLModel  = XMLSchema.notRequired;

            for (var xml of XMLModel) {
    
                var nodes = utilsCA.getXmlNodes(xml.xPath, xmlDom);
                
                if ((nodes.length > 0) && (nodes[0].firstChild)) 
                    objCTe[xml.nmCampo] = nodes[0].firstChild.data;
    
            }
    
            return Object.assign(objCTe, this.cteTomador(objCTe, xmlDom));

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\          
    /**
    * @description Obtém os dados do tomador da CTe
    * @function cteTomador
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @param   {Object} objCTe Objeto com os dados de cabeçalho
    * @param   {Object} xmlDom Objeto XML Completo para pesquisa
    * @returns {Object} Retorna o objeto 
    */
    //-----------------------------------------------------------------------\\ 

    api.cteTomador = function (objCTe, xmlDom) {

        try {

            var nodes = utilsCA.getXmlNodes(XMLSchema.tipo_tomador.xPath, xmlDom);

            if ((nodes.length > 0) && (nodes[0].firstChild)) {
    
                objCTe.TPTOMADO = nodes[0].firstChild.data;
    
                switch (parseInt(objCTe.TPTOMADO)) {
    
                    case 0: //Remetente
                        objCTe.CJTOMADO = objCTe.CJREMETE;
                        objCTe.IETOMADO = objCTe.IEREMETE;
                        objCTe.NMTOMADO = objCTe.NMREMETE;
                        objCTe.NMLOGTOM = objCTe.NMLOGREM;
                        objCTe.NRENDTOM = objCTe.NRENDREM;
                        objCTe.NMBAITOM = objCTe.NMBAIREM;
                        objCTe.CDMUNTOM = objCTe.CDMUNREM;
                        objCTe.NMMUNTOM = objCTe.NMMUNREM;
                        objCTe.CDESTTOM = objCTe.CDESTREM;
                        objCTe.NRCEPTOM = objCTe.NRCEPREM;
                        break;
    
                    case 1: //Expedidor
                        objCTe.CJTOMADO = objCTe.CJEXPEDI;
                        objCTe.IETOMADO = objCTe.IEEXPEDI;
                        objCTe.NMTOMADO = objCTe.NMEXPEDI;
                        objCTe.NMLOGTOM = objCTe.NMLOGEXP;
                        objCTe.NRENDTOM = objCTe.NRENDEXP;
                        objCTe.NMBAITOM = objCTe.NMBAIEXP;
                        objCTe.CDMUNTOM = objCTe.CDMUNEXP;
                        objCTe.NMMUNTOM = objCTe.NMMUNEXP;
                        objCTe.CDESTTOM = objCTe.CDESTEXP;
                        objCTe.NRCEPTOM = objCTe.NRCEPEXP;
                        break;
    
                    case 2: //Recebedor
                        objCTe.CJTOMADO = objCTe.CJRECEBE;
                        objCTe.IETOMADO = objCTe.IERECEBE;
                        objCTe.NMTOMADO = objCTe.NMRECEBE;
                        objCTe.NMLOGTOM = objCTe.NMLOGREC;
                        objCTe.NRENDTOM = objCTe.NRENDREC;
                        objCTe.NMBAITOM = objCTe.NMBAIREC;
                        objCTe.CDMUNTOM = objCTe.CDMUNREC;
                        objCTe.NMMUNTOM = objCTe.NMMUNREC;
                        objCTe.CDESTTOM = objCTe.CDESTREC;
                        objCTe.NRCEPTOM = objCTe.NRCEPREC;        
                        break;
    
                    case 3: //Destinatário
                        objCTe.CJTOMADO = objCTe.CJDESTIN;
                        objCTe.IETOMADO = objCTe.IEDESTIN;
                        objCTe.NMTOMADO = objCTe.NMDESTIN;
                        objCTe.NMLOGTOM = objCTe.NMLOGDES;
                        objCTe.NRENDTOM = objCTe.NRENDDES;
                        objCTe.NMBAITOM = objCTe.NMBAIDES;
                        objCTe.CDMUNTOM = objCTe.CDMUNDES;
                        objCTe.NMMUNTOM = objCTe.NMMUNDES;
                        objCTe.CDESTTOM = objCTe.CDESTDES;
                        objCTe.NRCEPTOM = objCTe.NRCEPDES;           
                        break;
    
                }
    
            } else {
    
                objCTe.TPTOMADO = 4;
    
                var XMLModel = XMLSchema.tomador;
    
                for (var xml of XMLModel) {
                    
                    var nodes = utilsCA.getXmlNodes(xml.xPath, xmlDom);
                
                    if ((nodes.length > 0) && (nodes[0].firstChild)) 
                        objCTe[xml.nmCampo] = nodes[0].firstChild.data;
                    else
                        objCTe.arOcorre.push(utilsFMT.gerarOcorrencia(1, xml.nmCampo, '-'));
                }
    
            }
    
            return this.cteComponentes(objCTe, xmlDom);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\          
    /**
    * @description Realiza a triagem dos campos de Peso, Valor do Frete e Pedágio
    * @function cteComponentes
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @param   {Object} objCTe Objeto com os dados de cabeçalho
    * @param   {Object} xmlDom Objeto XML Completo para pesquisa
    * @returns {Object} Retorna o objeto 
    */
    //-----------------------------------------------------------------------\\ 

    api.cteComponentes = function (objCTe, xmlDom) {

        try {

            var XMLModel = XMLSchema.componentes;

            var arNodesNM = utilsCA.getXmlNodes(XMLModel[0].xPath, xmlDom); 
            var arNodesVR = utilsCA.getXmlNodes(XMLModel[1].xPath, xmlDom); 
    
            if ((arNodesNM.length == arNodesVR.length) && (arNodesNM.length > 0)) {
    
                objCTe.ARCOMPON = [];
    
                for (var i in arNodesNM) {
    
                    var objComponente = 
                        {
                            NMCOMPON: arNodesNM[i].firstChild.data,
                            VRCOMPON: arNodesVR[i].firstChild.data
                        };
    
                    objCTe.ARCOMPON.push(objComponente);
    
                }
    
            } else {

                objCTe.arOcorre.push(utilsFMT.gerarOcorrencia(1, 'NMCOMPON', 'Nome do Componente'));

            }
            
            return objCTe;     

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\          
    /**
    * @description Exclui os arquivos selecionados do diretório informado
    * @function excluirXML
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async 
    * @param   {String} dir   Diretório contendo os arquivos
    * @param   {Array} files  Array com os arquivos a serem excluídos
    * @returns {Array} Retorna um array com os arquivos excluídos
    */
    //-----------------------------------------------------------------------\\    

	api.excluirXML = async function (req, res, next) {

        try {

            var arFiles = [];

            req.body.files.forEach(file => {
                arFiles.push(`${dirIn}${file}`);
            });			
    
            var arDelFiles = await utilsDir.removeFiles(arFiles, res, next);
            
            res.status(200).send(arDelFiles);
            
        } catch (err) {

            res.status(500).send({ error: err.message });

        }

	}

    //-----------------------------------------------------------------------\\

    return api;
}