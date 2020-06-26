/**
 * @module dao/Feriado
 * @description Função para realizar o CRUD da tabela S001.
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Um array JSON.
 * @requires controller/Feriado
*/
module.exports = function (app, cb) {

    var api = {};
    var utils = app.src.utils.FuncoesObjDB;
    var dicionario = app.src.utils.Dicionario;
    var db = app.config.database;


  
  
    var tabNfe = dicionario.nomeTabela("Nfe");
    var tabDeliveries = dicionario.nomeTabela("Deliveries");
    var tabPivot = dicionario.nomeTabela("NfeDeliveries");
    var tabTransportadoras = dicionario.nomeTabela("Transportadoras");
    var tabClient = dicionario.nomeTabela("Cliente");
    var tabCidade = dicionario.nomeTabela("Cidade");
    var tabEstado = dicionario.nomeTabela("Estado");
  
     /**
     * @description Contém o SQL que requisita os dados da tabela G045.
     *
     * @async
     * @function api/   
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
    */
    api.listar = async function (req, res, next) {
 
      if(req.method == "POST"){
        req.body.parameter.tableName = tabNfe.codTabela;
        var [sqlWhere,bindValues] = utils.buildWhere(req.body.parameter,true)        
      }else{
        req.body.parameter = {};
        req.body.parameter.tableName = tabNfe.codTabela;
        var [sqlWhere,bindValues] = utils.buildWhere(req.body.parameter,true);
      }
      
      
      var sqlPaginate = utils.paginate(req.params.pagina,req.params.limite);


      return await db.execute(
        {
          sql: `Select ` +
                        tabNfe.codTabela + `.IDG051,` +
                        `RE.NMCLIENT Remetente,` +
                        `RC.NMCLIENT Recebedor,` +
                        `DE.NMCLIENT Destinatario,` +
                        `EX.NMCLIENT Expeditor,` +
                        `CO.NMCLIENT Consignatario,` +
                        tabNfe.codTabela + `.IDG024,` +

                        tabNfe.codTabela + `.NRCHADOC,` +
                        tabNfe.codTabela + `.DSMODENF,` +
                        tabNfe.codTabela + `.NRSERINF,` +
                        tabNfe.codTabela + `.CDCTRC,` +
                        tabNfe.codTabela + `.VRTOTFRE,` +
                        tabNfe.codTabela + `.VRFRETEP,` +
                        tabNfe.codTabela + `.VRFRETEV,` +
                        tabNfe.codTabela + `.VRPEDAGI,` +
                        tabNfe.codTabela + `.VROUTROS,` +
                        tabNfe.codTabela + `.VRMERCAD,` +
                        tabNfe.codTabela + `.VRSECCAT,` +
                        tabNfe.codTabela + `.STCTRC,` +
                        tabNfe.codTabela + `.VRTOTPRE,` +

                        `TO_CHAR(` + tabNfe.codTabela + `.DTEMICTR ,'DD/MM/YYYY') AS DTEMICTR ,` +
                     
                        
                        `COUNT(` + tabNfe.codTabela + `.` + tabNfe.Id + `) OVER () as COUNT_LINHA
                From ` + tabNfe.codTabela +
                ` INNER JOIN G005 RE ON(` + tabNfe.codTabela + `.IDG005RE = RE.IDG005) ` +
                ` INNER JOIN G005 RC ON(` + tabNfe.codTabela + `.IDG005RC = RC.IDG005) ` +
                ` INNER JOIN G005 DE ON(` + tabNfe.codTabela + `.IDG005DE = DE.IDG005) ` +
                ` INNER JOIN G005 EX ON(` + tabNfe.codTabela + `.IDG005EX = EX.IDG005) ` +
                ` INNER JOIN G005 CO ON(` + tabNfe.codTabela + `.IDG005CO = CO.IDG005) ` +
                 sqlWhere + sqlPaginate,
  
          param: bindValues
        })
        .then((result) => {         
            return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
    };
  
    /**
     * @description Busca um dado na tabela S001.
     *
     * @async
     * @function api/buscar
     * @param {request} req - Possui as requisições para a função.
     * @param {response} res - A resposta gerada na função.
     * @param {next} next - Caso haja algum erro na rota.
     * @return {JSON} Retorna um objeto JSON.
     * @throws Caso falso, o número do log de erro aparecerá no console.
    */
  
    api.buscar = async function (req, res, next) {
      
  
      var id = req.params.id;

      
  
      return await db.execute(
        {
  
            sql: `Select ` +
            tabNfe.codTabela + `.IDG051,` +
            tabNfe.codTabela + `.IDG005RE,` +
            tabNfe.codTabela + `.IDG005RC,` +
            tabNfe.codTabela + `.IDG005DE,` +
            tabNfe.codTabela + `.IDG005EX,` +
            tabNfe.codTabela + `.IDG005CO,` +
            tabNfe.codTabela + `.IDG024,` +

            tabNfe.codTabela + `.NRCHADOC,` +
            tabNfe.codTabela + `.DSMODENF,` +
            tabNfe.codTabela + `.NRSERINF,` +
            tabNfe.codTabela + `.CDCTRC,` +
            tabNfe.codTabela + `.VRTOTFRE,` +
            `TO_CHAR(` + tabNfe.codTabela + `.DTEMICTR ,'DD/MM/YYYY') AS DTEMICTR ,` +
            
            
           
            `IDG005RE.NMCLIENT IDG005RE_NMCLIENT,` + 
            `IDG005RE_CIDADE.NMCIDADE IDG005RE_NMCIDADE,` + 
            `IDG005RE_ESTADO.NMESTADO IDG005RE_NMESTADO,` + 

            `IDG005DE.NMCLIENT IDG005DE_NMCLIENT,` + 
            `IDG005DE.CJCLIENT IDG005DE_CJCLIENT,` + 
            `IDG005DE.IECLIENT IDG005DE_IECLIENT,` + 
            `IDG005DE_CIDADE.NMCIDADE IDG005DE_NMCIDADE,` + 
            `IDG005DE_ESTADO.NMESTADO IDG005DE_NMESTADO,` + 

            `IDG005EX.NMCLIENT IDG005EX_NMCLIENT,` + 
            `IDG005EX.CJCLIENT IDG005EX_CJCLIENT,` + 
            `IDG005EX.IECLIENT IDG005EX_IECLIENT,` + 
            `IDG005EX_CIDADE.NMCIDADE IDG005EX_NMCIDADE,` + 
            `IDG005EX_ESTADO.NMESTADO IDG005EX_NMESTADO,` + 

            `IDG005RC.NMCLIENT IDG005RC_NMCLIENT,` +
            
            `IDG005CO.NMCLIENT IDG005CO_NMCLIENT,` +

            `IDG024.NMTRANSP IDG024_NMTRANSP,` +
            `IDG024.CJTRANSP IDG024_CJTRANSP,` +
            `IDG024.IETRANSP IDG024_IETRANSP,` +
            `IDG024_CIDADE.NMCIDADE IDG024_NMCIDADE,` + 
            `IDG024_ESTADO.NMESTADO IDG024_NMESTADO,` + 
            
            `COUNT(` + tabNfe.codTabela + `.` + tabNfe.Id + `) OVER () as COUNT_LINHA` +
            ` from ` + tabNfe.codTabela +
              
            ` inner join ` + tabClient.codTabela + 
              ` IDG005RE on (`+ tabNfe.codTabela + `.IDG005RE = IDG005RE.IdG005)` +
              ` inner join ` + tabCidade.codTabela + 
              ` IDG005RE_CIDADE on (IDG005RE_CIDADE.IDG003 = IDG005RE.IDG003)` +
              ` inner join ` + tabEstado.codTabela + 
              ` IDG005RE_ESTADO on (IDG005RE_CIDADE.IDG002 = IDG005RE_ESTADO.IDG002)` +
              
              ` inner join ` + tabClient.codTabela + 
              ` IDG005RC on (`+ tabNfe.codTabela + `.IDG005RC = IDG005RC.IdG005)` +
              ` inner join ` + tabCidade.codTabela + 
              ` IDG005RC_CIDADE on (IDG005RC_CIDADE.IDG003 = IDG005RC.IDG003)` +
              ` inner join ` + tabEstado.codTabela + 
              ` IDG005RC_ESTADO on (IDG005RC_CIDADE.IDG002 = IDG005RC_ESTADO.IDG002)` +  

              ` inner join ` + tabClient.codTabela + 
              ` IDG005DE on (`+ tabNfe.codTabela + `.IDG005DE = IDG005DE.IdG005)` +
              ` inner join ` + tabCidade.codTabela + 
              ` IDG005DE_CIDADE on (IDG005DE_CIDADE.IDG003 = IDG005DE.IDG003)` +
              ` inner join ` + tabEstado.codTabela + 
              ` IDG005DE_ESTADO on (IDG005DE_CIDADE.IDG002 = IDG005DE_ESTADO.IDG002)` +  
              
              ` inner join ` + tabClient.codTabela + 
              ` IDG005EX on (`+ tabNfe.codTabela + `.IDG005EX = IDG005EX.IdG005)` +
              ` inner join ` + tabCidade.codTabela + 
              ` IDG005EX_CIDADE on (IDG005EX_CIDADE.IDG003 = IDG005EX.IDG003)` +
              ` inner join ` + tabEstado.codTabela + 
              ` IDG005EX_ESTADO on (IDG005EX_CIDADE.IDG002 = IDG005EX_ESTADO.IDG002)` +  
              
              ` inner join ` + tabClient.codTabela + 
              ` IDG005CO on (`+ tabNfe.codTabela + `.IDG005CO = IDG005CO.IdG005)` +
              ` inner join ` + tabCidade.codTabela + 
              ` IDG005CO_CIDADE on (IDG005CO_CIDADE.IDG003 = IDG005CO.IDG003)` +
              ` inner join ` + tabEstado.codTabela + 
              ` IDG005CO_ESTADO on (IDG005CO_CIDADE.IDG002 = IDG005CO_ESTADO.IDG002)` +  

              ` inner join ` + tabTransportadoras.codTabela + 
              ` IDG024 on (`+ tabNfe.codTabela + `.IDG024 = IDG024.IDG024)` +
              ` inner join ` + tabCidade.codTabela + 
              ` IDG024_CIDADE on (IDG024_CIDADE.IDG003 = IDG024.IDG003)` +
              ` inner join ` + tabEstado.codTabela + 
              ` IDG024_ESTADO on (IDG024_ESTADO.IDG002 = IDG024_ESTADO.IDG002)` +

            ` Where ` + tabNfe.Id + ` = ` + id ,
  
          param: [],
        })
        .then((result) => {         
          return result[0];
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
    };


    api.fillDeliveries  = async function (req, res, next, nfe) {
        const results = [];
        nfe.forEach(element => {
          results.push(
            db.execute({
              sql: `Select ` +
                            tabDeliveries.codTabela + `.IDG043,` +
                            tabDeliveries.codTabela + `.CDDELIVE` +
                    ` from ` + tabPivot.codTabela +
                    ` inner join ` + tabDeliveries.codTabela + 
                    ` on (`+ tabPivot.codTabela + `.IDG043 = ` + tabDeliveries.codTabela + `.IDG043)` +
                    ` WHERE ` + tabPivot.codTabela + `.IDG051 = ` + element.IDG051
            ,
              param: [],
            }).then((result) => {
              return result;
            }).catch((err) => {
              //console.log(err);
            })
          );
        });
        var resultados = await Promise.all(results);
        for(var i = 0; i<nfe.length; i++){
          nfe[i].deliveries = resultados [i];
        }

        return utils.construirObjetoRetornoBD(nfe);
    }


    
    api.fillDelivery  = async function (req, res, next, IDG051) {
 
          return await db.execute({
            sql: `Select ` +
                          tabDeliveries.codTabela + `.IDG043,` +
                          tabDeliveries.codTabela + `.CDDELIVE,` +                        
                          tabDeliveries.codTabela + `.NRNOTA,` +                          
                          `TO_CHAR(` + tabDeliveries.codTabela + `.DTEMINOT ,'DD/MM/YYYY') AS DTEMINOT,` +
                          tabDeliveries.codTabela + `.NRCHADOC,` +
                          tabDeliveries.codTabela + `.PSBRUTO,` +
                          tabDeliveries.codTabela + `.PSLIQUID,` +
                          tabDeliveries.codTabela + `.VRDELIVE,` +
                          tabDeliveries.codTabela + `.TXCANHOT,` +
                          `TO_CHAR(` + tabDeliveries.codTabela + `.DTENTCON ,'DD/MM/YYYY') AS DTENTCON` +
                  ` from ` + tabPivot.codTabela +
                  ` inner join ` + tabDeliveries.codTabela + 
                  ` on (`+ tabPivot.codTabela + `.IDG043 = ` + tabDeliveries.codTabela + `.IDG043)` +
                  ` WHERE ` + tabPivot.codTabela + `.IDG051 = ` + IDG051
          ,
            param: [],
          }).then((result) => {
            // nfe.deliveries = result;
            return result;
          }).catch((err) => {
            //console.log(err);
          });
     
    }
    api.BuscaTransportadora  = async function (req, res, next, nfe) {
      var ret = new Object();

      ret.NMTRANSP = nfe['IDG024_NMTRANSP'];
      delete nfe['IDG024_NMTRANSP'];
      ret.CJTRANSP = nfe['IDG024_CJTRANSP'];
      delete nfe['IDG024_CJTRANSP'];
      ret.IETRANSP = nfe['IDG024_IETRANSP'];
      delete nfe['IDG024_IETRANSP'];
      ret.CIDADE = nfe['IDG024_NMCIDADE'];
      delete nfe['IDG024_NMCIDADE'];
      ret.ESTADO = nfe['IDG024_NMESTADO'];
      delete nfe['IDG024_NMESTADO'];
      
      return [ret];
    }   

    api.BuscaCliente  = async function (req, res, next, nfe, nmCampoJoin) {     
      var ret = new Object();

      ret.NMCLIENT = nfe[nmCampoJoin + '_NMCLIENT'];
      delete nfe[nmCampoJoin + '_NMCLIENT'];
      if(nmCampoJoin == 'IDG005DE' || nmCampoJoin == 'IDG005RE' || nmCampoJoin == 'IDG005EX'){
        ret.CIDADE = nfe[nmCampoJoin + '_NMCIDADE'];
        delete nfe[nmCampoJoin + '_NMCIDADE'];
        ret.ESTADO = nfe[nmCampoJoin + '_NMESTADO'];
        delete nfe[nmCampoJoin + '_NMESTADO'];
        if(nmCampoJoin == 'IDG005DE' || nmCampoJoin == 'IDG005EX'){
          ret.CJCLIENT = nfe[nmCampoJoin + '_CJCLIENT'];
          delete nfe[nmCampoJoin + '_CJCLIENT'];
          
          ret.IECLIENT = nfe[nmCampoJoin + '_IECLIENT'];
          delete nfe[nmCampoJoin + '_IECLIENT'];
        }        
      }
      
      return [ret];
    }
    api.fillAll  = async function (req, res, next, nfe) {
      var retDelivery = api.fillDelivery(req, res, next, nfe.IDG051);//envia deliveries para que seja encontrada carga
      var retCargas = this.fillCargasWithChildren(await retDelivery);

      var retIDG005RE = api.BuscaCliente(req, res, next, nfe,'IDG005RE');
      var retIDG005DE = api.BuscaCliente(req, res, next, nfe,'IDG005DE');
      var retIDG005RC = api.BuscaCliente(req, res, next, nfe,'IDG005RC');
      var retIDG005EX = api.BuscaCliente(req, res, next, nfe,'IDG005EX');
      var retIDG005CO = api.BuscaCliente(req, res, next, nfe,'IDG005CO');

      var retIDG024 = api.BuscaTransportadora(req, res, next, nfe);
      [
        nfe.Remetente,
        nfe.Destinatario,
        nfe.Recebedor,
        nfe.Expedidor,
        nfe.Consignatario,
        nfe.Transportadora,
        nfe.Cargas
      ] = await Promise.all([
        retIDG005RE,
        retIDG005DE,
        retIDG005RC,
        retIDG005EX,
        retIDG005CO,
        retIDG024,
        retCargas
      ]);
      return nfe;
      
    }

    api.fillCargasWithChildren = async function(deliveries){
      var cargas = [];
      var itens = [];


      // percorro todas deliveries procurando itens para preencher
      for (let i = 0; i < deliveries.length; i++) {
        const delivery = deliveries[i];
        //retorno todos itens que há em uma delivery
        var itensTemp = await this.returnItensDelivery(delivery);
        //loop para criar array dentro dos itens temporarios
        for (let ii = 0; ii < itensTemp.length; ii++) {
          itensTemp[ii].deliveries = [];          
        }

        if(itens.length > 0 ){//se há itens

          //percorro todos itens encontrados para saber se já existem 
          // serve para evitar duplicidade
        

          for (let ii = 0; ii < itensTemp.length; ii++) {
            const itemTemp = itensTemp[ii];
            
            //começo a verificar se o item no qual a delivery pertence já existe no array definitivo
            
              var duplicidade = false;

              //procuro por duplicidade, caso encontrado retorno o indice do item permanente no array itens
              for (let iii = 0; iii < itens.length; iii++) {
                const item = itens[iii];
                if(item.IDG048 == itemTemp.IDG048){
                  duplicidade = iii;
                  break;
                }
                
              }
              
            



              //verifico se houve ou não duplicidade para inserir o item temporario no array
              if(duplicidade !== false){
                itens[duplicidade].deliveries.push(delivery);
              }else{
                itemTemp.deliveries.push(delivery);
                itens.push(itemTemp);
              }

            

          }

        }else{//se não existe simplesmente preenche
          itensTemp.forEach(itemTemp => {
            itemTemp.deliveries.push(delivery);
            itens.push(itemTemp);
          });
        }
      }

      /*
      Agora que possuo todos os itens já preenchidos com suas deliveries
      eu procuro as cargas que possuem os itens
      */
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        var cargasTemp = await this.returnCargasItens(item); 
        //loop para criar array dentro das cargas temporarias
        for (let ii = 0; ii < cargasTemp.length; ii++) {
          cargasTemp[ii].Paradas = [];          
        }

        if(cargas.length > 0 ){//se há cargas

          //percorro todas cargas encontrados para saber se já existem 
          // serve para evitar duplicidade
        

          for (let ii = 0; ii < cargasTemp.length; ii++) {
            const cargaTemp = cargasTemp[ii];
            
            //começo a verificar se o item no qual a delivery pertence já existe no array definitivo
            
              var duplicidade = false;

              //procuro por duplicidade, caso encontrado retorno o indice do item permanente no array itens
              for (let iii = 0; iii < cargas.length; iii++) {
                const carga = cargas[iii];
                if(carga.IDG046 == cargaTemp.IDG046){
                  duplicidade = iii;
                  break;
                }
                
              }
              
            



              //verifico se houve ou não duplicidade para inserir o item temporario no array
              if(duplicidade !== false){
                cargas[duplicidade].Paradas.push(item);
              }else{
                cargaTemp.Paradas.push(item);
                cargas.push(cargaTemp);
              }

            

          }

        }else{//se não existe simplesmente preenche
          cargasTemp.forEach(cargaTemp => {
            cargaTemp.Paradas.push(item);
            cargas.push(cargaTemp);
          });
        }


      }
      return cargas;
    }

    api.returnItensDelivery = async function(delivery){

      var tabItens = dicionario.nomeTabela("Itens");

      
      var filtros = {
        "G049.IDG043": delivery.IDG043,
        "tableName":"G048"
      }

      var [sqlWhere, bindValues] = utils.buildWhere(filtros);
   
      return await db.execute({
        sql: `Select ` +
              tabItens.codTabela + `.IDG048,` +
              tabItens.codTabela + `.IDG046` +      
              ` from ` + tabItens.codTabela +
              ` inner join G049` + 
              ` on (`+ tabItens.codTabela + `.IDG048 = G049.IDG048)` +
              sqlWhere
        ,
          param: bindValues,
        }).then((result) => {
          // nfe.transportadora = result[0];
          return result;
        }).catch((err) => {
          //console.log(err);
        });
    }

    api.buscarCargasCTe = async function(req, res, next){
      return await this.returnCargasCTe(req.params.id);
    }

    api.returnCargasCTe = async function(idCTe){
      var filtros = {
        "PI_CARGAS_DELIVERIES.IDG051": idCTe,
        "tableName":"PI_CARGAS_DELIVERIES"
      }
      var [sqlWhere, bindValues] = utils.buildWhere(filtros);
      return await db.execute({
        sql: `SELECT DISTINCT  
                        CARGA.IDG046         IDCARGA
                  ,    CARGA.STCARGA        STCARGA    
                  ,    CARGA.CDVIAOTI        CDVIAOTI
                  ,    CARGA.VRCARGA        VRCARGA
                  ,    CARGA.PSCARGA        PSCARGA
                  ,    CARGA.SNCARPAR        SNCARPAR
                  ,    CARGA.QTDISPER        QTDISPER
                  ,    CARGA.QTVOLCAR        QTVOLCAR
                  ,    CARGA.VRPOROCU        VRPOROCU 
                  ,	   CARGA.STCARGA 		STCARGA
                  ,	   VEICULO1.NRPLAVEI 		NRPLAVEI1
                  ,	   VEICULO2.NRPLAVEI 		NRPLAVEI2
                  ,	   VEICULO3.NRPLAVEI 		NRPLAVEI3               
                  ,    CASE 
                          WHEN CARGA.TPCARGA = 1 THEN 'ESTIVADA'
                          WHEN CARGA.TPCARGA = 2 THEN 'PALETIZADA'
                          ELSE 'MISTA'
                      END TPCARGA                  
                  ,    TO_CHAR(CARGA.DTPRESAI, 'DD/MM/YYYY HH24:MI:SS') DTPRESAI
                  ,    TO_CHAR(CARGA.DTSAICAR, 'DD/MM/YYYY HH24:MI:SS') DTSAICAR
                  ,    TO_CHAR(CARGA.DTAGENDA, 'DD/MM/YYYY HH24:MI:SS') DTAGENDA
                  ,    TO_CHAR(CARGA.DTCARGA, 'DD/MM/YYYY HH24:MI:SS') DTCARGA                  
                  ,    TRANSP.NMTRANSP        NMTRANSP
                  ,    TPVEIC.DSTIPVEI        DSTIPVEI
                  ,    COUNT(CARGA.IDG046) OVER () as COUNT_LINHA
              FROM G052 PI_CARGAS_DELIVERIES
              INNER JOIN G043 DELIVERIES
              ON(DELIVERIES.IDG043 = PI_CARGAS_DELIVERIES.IDG043)
              INNER JOIN G049 PI_DELIVERIES_PARADAS
              ON(PI_DELIVERIES_PARADAS.IDG043 = DELIVERIES.IDG043)
              INNER JOIN G048 PARADAS
              ON(PARADAS.IDG048 = PI_DELIVERIES_PARADAS.IDG048)
              INNER JOIN G046 CARGA
              ON(CARGA.IDG046 = PARADAS.IDG046)
              LEFT JOIN G024 TRANSP
              ON(TRANSP.IDG024 = CARGA.IDG024)
              LEFT JOIN G032 VEICULO1
	            ON(VEICULO1.IDG032= CARGA.IDG032V1)
	            LEFT JOIN G032 VEICULO2
	            ON(VEICULO1.IDG032= CARGA.IDG032V2)
	            LEFT JOIN G032 VEICULO3
	            ON(VEICULO1.IDG032= CARGA.IDG032V3)
              LEFT JOIN G030 TPVEIC
              ON (TPVEIC.IDG030 = CARGA.IDG030)` + sqlWhere
        ,
          param: bindValues,
        }).then((result) => {
          return utils.construirObjetoRetornoBD(result);          
        }).catch((err) => {
          //console.log(err);
        });
    }

    api.returnCargasItens = async function(item){
      

      var tabCargas = dicionario.nomeTabela("Cargas");

      var filtros = {
        "G048.IDG048": item.IDG048,
        "tableName":"G046"
      }

      var [sqlWhere, bindValues] = utils.buildWhere(filtros);

      return await db.execute({
        sql: `Select ` +
              tabCargas.codTabela + `.IDG046` +
              // tabCargas.codTabela + `.DSCARGA,` +
              // tabCargas.codTabela + `.IDG031M1,` +
              // tabCargas.codTabela + `.IDG031M2,` +
              // tabCargas.codTabela + `.IDG031M3,` +
              // tabCargas.codTabela + `.IDG032V1,` +
              // tabCargas.codTabela + `.IDG032V2,` +
              // tabCargas.codTabela + `.IDG032V3,` +
              // tabCargas.codTabela + `.IDG024,` +
              // tabCargas.codTabela + `.CDVIAOTI,` +
              // tabCargas.codTabela + `.SNESCOLT,` +
              // `TO_CHAR(` + tabCargas.codTabela + `.DTCARGA ,'DD/MM/YYYY') AS DTCARGA,` +
              // `TO_CHAR(` + tabCargas.codTabela + `.DTSAICAR ,'DD/MM/YYYY') AS DTSAICAR,` +
              // `TO_CHAR(` + tabCargas.codTabela + `.DTPRESAI ,'DD/MM/YYYY') AS DTSPRESAI,` +
              // tabCargas.codTabela + `.PSCARGA,` +
              // tabCargas.codTabela + `.VRCARGA,` +
              // tabCargas.codTabela + `.IDS001,` +
              // tabCargas.codTabela + `.SNDELETE,` +
              // tabCargas.codTabela + `.QTVOLCAR,` +
              // tabCargas.codTabela + `.TPCARGA,` +
              // tabCargas.codTabela + `.QTDISPER,` +
              // tabCargas.codTabela + `.VRPOROCU,` +
              // tabCargas.codTabela + `.IDG030,` +
              // `TO_CHAR(` + tabCargas.codTabela + `.DTAGENDA ,'DD/MM/YYYY') AS DTAGENDA,` +
              // tabCargas.codTabela + `.STCARGA,` +
              // tabCargas.codTabela + `.STINTCLI,` +
              // tabCargas.codTabela + `.SNCARPAR` +
       
              ` from ` + tabCargas.codTabela +
              ` inner join G048` + 
              ` on (`+ tabCargas.codTabela + `.IDG046 = G048.IDG046)` +
              sqlWhere
        ,
          param: bindValues,
        }).then((result) => {
          // nfe.transportadora = result[0];
          return result;
        }).catch((err) => {
          //console.log(err);
        });

    }

    
  

  
    return api;
  };

  