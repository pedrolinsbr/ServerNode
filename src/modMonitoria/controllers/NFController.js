
module.exports = function (app) {

  let api = {};
  let logger = app.config.logger;
  let dao = app.src.modMonitoria.dao.NFDAO;
  let conversorArquivos = app.src.utils.ConversorArquivos;

  api.salvarNF = async function (req, res, next) {

    var parser = require('xml2json');

    let xml = await conversorArquivos.lerArquivo('src/modMonitoria/controllers/a.xml');
    console.log(xml);

    var json = await parser.toJson(xml, {
      object: true,
      reversible: false,
      coerce: false,
      sanitize: true,
      trim: true,
      arrayNotation: false,
      alternateTextNode: false
    });
    console.log(json.nfeProc.protNFe.infProt.chNFe);

    let g043 = {};
    g043.NRCHADOC = json.nfeProc.NFe.infNFe.Id;
    let existeNrDocto = await dao.existeNrDocto(g043.NRCHADOC);
    logger.info('existeNrDocto: ', existeNrDocto);
    if (existeNrDocto != 0) {
      
      logger.info('//TODO: verificar o que fazer aqui quando existir a nota.');
    }

    // Emitente - Quem esta criando a Nota
    let cdtitulae = 0;
    if (json.nfeProc.NFe.infNFe.emit != undefined) {
      if(json.nfeProc.NFe.infNFe.emit.CNPJ != undefined) {
        cdtitulae = json.nfeProc.NFe.infNFe.emit.CNPJ;
      }else if(json.nfeProc.NFe.infNFe.emit.CPF != undefined){
        cdtitulae = json.nfeProc.NFe.infNFe.emit.CPF;
      }
      if(json.nfeProc.NFe.infNFe.emit.IE != undefined) {
        cdtitulae = cdtitulae + '%' + (json.nfeProc.NFe.infNFe.emit.IE * 1);
      }
    }
    logger.debug('Código do Emitente: ', cdtitulae);

    // Destino
    let cdtitulad = 0;
    if (json.nfeProc.NFe.infNFe.dest != undefined) {
      if(json.nfeProc.NFe.infNFe.dest.CNPJ != undefined) {
        cdtitulad = json.nfeProc.NFe.infNFe.dest.CNPJ;
      }else if(json.nfeProc.NFe.infNFe.dest.CPF != undefined){
        cdtitulad = json.nfeProc.NFe.infNFe.dest.CPF;
      }
      if(json.nfeProc.NFe.infNFe.dest.IE != undefined) {
        cdtitulad = cdtitulad + '%' + (json.nfeProc.NFe.infNFe.dest.IE * 1);
      }
    }
    logger.debug('Código do Destino: ', cdtitulad);

    // Transportadora
    let cdtitulat = 0;
    if(json.nfeProc.NFe.infNFe.transp.transporta != undefined) {
      if(json.nfeProc.NFe.infNFe.transp.transporta.CNPJ != undefined){
        cdtitulat = json.nfeProc.NFe.infNFe.transp.transporta.CNPJ;
      }else if(json.nfeProc.NFe.infNFe.transp.transporta.CPF != undefined){
        cdtitulat = json.nfeProc.NFe.infNFe.transp.transporta.CPF;
      }
      if(json.nfeProc.NFe.infNFe.transp.transporta.IE != undefined) {
        cdtitulat = cdtitulat + '%' + (json.nfeProc.NFe.infNFe.transp.transporta.IE * 1);
      }
    }
    logger.debug('Código da Transportadora: ', cdtitulat);

    let obj = {};
    obj.json = json;
    obj.tptitula = 'emit';
    g043.CDEMISSO = api.verificarOuAdicionar(obj);


    /* await dao.salvarNF(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      }); */
  };

  //api.salvarNF(null, null, null);

  api.verificarOuAdicionar = async function (obj) {

    try {
      
      /* $titularController = new TitularController;
      $titularController->setConnection($this->connection);
      $tptitula = $request->parameter['tptitula'];
      
      if(is_array($request->parameter['TxXml'])){
        $arrayNota = $request->parameter['TxXml'];
        
      }else if(file_exists($request->parameter['TxXml']->getRealPath())){
        $arrayNota = parent::XML2JSON( $request->parameter['TxXml']->getRealPath());
      }

      $request2 = new \Illuminate\Http\Request();
      $request2->parameter = []; */
      let objParam = {};
      if(obj.tptitula != 'transp') {

        if(obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['CNPJ'] != undefined) {
          objParam.cjtitula = obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['CNPJ'];
        }else if(obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['CPF'] != undefined) {
          objParam.cjtitula = obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['CPF'];
        }
        objParam.ietitula = obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['IE'];
        objParam.cdintmun = obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['ender' + obj.tptitula.charAt(0).toUpperCase() + obj.tptitula.slice(1)]['cMun'];
      } else {
        
        if(obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['transporta']['CNPJ'] != undefined) {
          objParam.cjtitula = obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['transporta']['CNPJ'];
          objParam.ietitula = obj.json['nfeProc']['NFe']['infNFe'][obj.tptitula]['transporta']['IE'];
        }
      }
      let cdEmisso = dao.buscaTitular(objParam);
      // CdDestin  CdTransp
      /* if(cdEmisso == null) {
        if(obj.tptitula != 'transp') {
          $cidadeController = new CidadeController; 
          $cidadeController->setConnection($this->connection);
          $request2 = new \Illuminate\Http\Request();
          $request2->parameter = [];
          $request2->parameter['cdintmun'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['ender'.ucfirst(obj.tptitula)]['cMun'];
          $request2->parameter['cdestado'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['ender'.ucfirst(obj.tptitula)]['UF'];
          if(isset($request2->parameter['cdestado'])){
            $lObEstado = Estados::where('sgestado', '=', $request2->parameter['cdestado'])->first();      
            if (!is_object($lObEstado)) {
              $this->rollBack();
              return new JsonResponse([
                'error' => -1, 
                'errorMensage' => 'Estado não cadastrado: '.$request2->parameter['cdestado'].'.'
              ], 500);        
            }else{
              $request2->parameter['cdestado'] = $lObEstado->cdestado;
            }
          }
          $cdCidade = json_decode($cidadeController->buscaCidade($request2));
          if($cdCidade != null && count($cdCidade->data) > 0) {
            $cdCidade = $cdCidade->data[0]->cdcidade;
          } else {
            $request2->parameter = [];
            $request2->parameter['dtFrmG109']['CdIntMun'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['ender'.ucfirst(obj.tptitula)]['cMun'];
            $request2->parameter['dtFrmG109']['NmCidade'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['ender'.ucfirst(obj.tptitula)]['xMun'];
            $request2->parameter['dtFrmG109']['SgEstado'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['ender'.ucfirst(obj.tptitula)]['UF'];
            $cdCidade = json_decode($cidadeController->create($request2));
            $cdCidade = $cdCidade->data->cdcidade;
          }
        } else {
          // Nesse modelo o xml não possui o código da cidade para pesquisa.
          $cdCidade = null;
        }
        $request2 = new \Illuminate\Http\Request();
        $request2->parameter = [];
        $request2->parameter['dtFrmG101']['G109Cidade']['cdcidade'] = $cdCidade;
        if(obj.tptitula != 'transp') {

          if(isset($arrayNota['NFe']['infNFe'][obj.tptitula]['CNPJ'])){
            $request2->parameter['dtFrmG101']['CjTitula'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['CNPJ'];
          }else if($arrayNota['NFe']['infNFe'][obj.tptitula]['CPF']){
            $request2->parameter['dtFrmG101']['CjTitula'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['CPF'];
          }
          
          $request2->parameter['dtFrmG101']['IeTitula'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['IE'];
          $request2->parameter['dtFrmG101']['NmEmpres'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['xNome'];
        } else {
          $request2->parameter['dtFrmG101']['CjTitula'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['transporta']['CNPJ'];
          $request2->parameter['dtFrmG101']['IeTitula'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['transporta']['IE'];
          $request2->parameter['dtFrmG101']['NmEmpres'] = $arrayNota['NFe']['infNFe'][obj.tptitula]['transporta']['xNome'];
        }
        return json_decode($titularController->create($request2))->data;
        //dd($request2->parameter);
      } else {
        return $cdEmisso->data->cdtitula1;
      } */

    } catch (err) {
      //await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }



  return api;
};


