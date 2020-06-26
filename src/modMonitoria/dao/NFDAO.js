
module.exports = function (app) {

  let api = {};
  //var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;
  let logger = app.config.logger;

  api.existeNrDocto = async function (nrchadoc) {
    
    let con = await this.controller.getConnection(null, req.UserId);
    
    try {
      let result = await con.execute(
        {
          sql: `Select  Count(G043.IDG043) As qtd
                From  G043 G043
                Where G043.NRCHADOC = :NRCHADOC`,
          param: { NRCHADOC: nrchadoc }
        });
      
        await con.close(); 
        return result[0].QTD;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.buscaTitular = async function (objParam) { //(Request $request) {
    try {       
      let result = await con.execute(
        {
          sql: `Select  Count(G043.IDG043) As qtd
                From  G043 G043
                Where G043.NRCHADOC = :NRCHADOC`,
          param: { NRCHADOC: nrchadoc }
        });
      
        await con.close(); 
        return result[0].QTD;
      
      /* //$request->parameter_code_error = 0;
        $request->parameter_data = Titulares::buscaTitularCreate($request); // Data   
        //Log::info(count($request->parameter_data));
      if(count($request->parameter_data) > 0) {
        $cdtitula = null;
        $request->parameter_data = $request->parameter_data[0];
        if(!isset($request->parameter['cdtitula'])) {
          $cdtitula = $request->parameter_data->cdtitula1;
        } else {
          $cdtitula = $request->parameter['cdtitula']; 
        }
        
        //dd($request->parameter_data);    

        //busca as notificações do titular
        $request2 = new \Illuminate\Http\Request();
        $request2->parameter = [];
        $request2->parameter['cdtitula'] = $cdtitula;  
        $lnotifica = new NotificacoesController();
        $request->parameter_data->not = json_decode($lnotifica->buscaNotificacoes($request2))->data;      

        //busca os grupos e usuários vinculados ao titular
        $request3 = new \Illuminate\Http\Request();
        $request3->parameter = [];
        $request3->parameter['cdtitula'] = $cdtitula; 
        $lTiGruUsu = new UsuTitGruController();
        $request->parameter_data->usugru = json_decode($lTiGruUsu->buscaGrupoUsers($request3))->data;      
      } else {
        return null;
      }*/
            

    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    } 
    //return parent::ajaxResponse($request);   
  }

  return api;
};
