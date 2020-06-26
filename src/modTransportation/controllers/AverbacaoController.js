const axios = require("axios");

module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modTransportation.dao.AverbacaoDAO;


  api.testeIntegracao = async function (req, res, next) {
    let a = await api.sendCte(1)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        //next(err);
      });

  };

  api.testeIntegracaoPR = async function (req, res, next) {
    let a = await api.sendCte(2)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        //next(err);
      });

  };


	api.authAtm = async function (tpUser) {
		
		let obj = {};
		obj.url = 'http://webserver.averba.com.br/rest/Auth';
    
    //# AT&M - Usuario referente a interface, possui dois devido ao cnpj da empresa 81
    //# 1 - bravo
    //# 2 - bravolog

    let objUser = {};

    objUser.usuario = "interface";
    objUser.senha = "bravo@int@2020";

    if(tpUser == 1){
      objUser.codigoatm = "11330307"
    }else{
      objUser.codigoatm = "11330453"
    }

		let resultAuth = await axios({
			method: 'post',
			url: obj.url,
			headers: {
        'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			data: objUser
		}).then((result) => {
       return result;
		}).catch(function (err) {
      err.stack = new Error().stack + `\r\n` + err.stack;
    });
    
    return resultAuth;
    
  }
  

	api.sendCte = async function (tpUser = 1) {

    try {
      let obj = {};
      obj.url = 'http://webserver.averba.com.br/rest/Cte';

      let token = await api.authAtm(tpUser);

      if(token != undefined){

        let arXml = await dao.getCteXml(tpUser);

        if(arXml.length == 0){
          return 'sem documentos';
        }else{
          for (let i = 0; i < arXml.length; i++) {
            
            let resultSend = await axios({
              method: 'post',
              url: obj.url,
              headers: {
                'Authorization': 'Bearer '+token.data.Bearer,
                'Accept': 'application/json',
                'Content-Type': 'application/xml',
              },
              data: arXml[i].TXXML
            }).then((result3) => {
              return result3.data;
            }).catch(function (err) {
            // err.stack = new Error().stack + `\r\n` + err.stack;
              return err.response.data;
            });

            /* 
              
            results:
              //###############################
            
                sucess:
                //###############################
                {
                  "Numero": "",
                  "Serie": "",
                  "Filial": "",
                  "CNPJCli": "",
                  "TpDoc": "",
                  "InfAdic": "",
                  "Averbado": {
                      "dhAverbacao": "",
                      "Protocolo": "",
                      "DadosSeguro": [{
                          "NumeroAverbacao": "",
                          "CNPJSeguradora": "",
                          "NomeSeguradora": "",
                          "NumApolice": "",
                          "TpMov": "",
                          "TpDDR": "",
                          "ValorAverbado": "",
                          "RamoAverbado": ""
                      }]
                  },

                  "Infos": {
                      "info": [{
                          "Codigo": "",
                          "Descricao": ""
                      }]
                  }

                }

                erros:
                //###############################

                {
                  "Numero": "",
                  "Serie": "",
                  "Filial": "",
                  "CNPJCli": "",
                  "TpDoc": "",
                  "InfAdic": "",
                  "Erros": {
                      "Codigo": "",
                      "Descricao": "",
                      "ValorEsperado": "",
                      "ValorInformado": ""
                  }

                }

            */

            if(resultSend != undefined){
              
              //# sucess
              if(resultSend.Averbado != undefined){

                for (let k = 0; k < resultSend.Averbado.DadosSeguro.length; k++) {

                  let objSave = {};

                  objSave.IDG051   = arXml[i].IDG051 ;
                  objSave.STAVERBA = 'S' ;
                  objSave.DTAVERBA = resultSend.Averbado.dhAverbacao ;
                  objSave.NRPROAVE = resultSend.Averbado.Protocolo ;
                  objSave.NRAVERBA = resultSend.Averbado.DadosSeguro[k].NumeroAverbacao ;
                  objSave.CJSEGURA = resultSend.Averbado.DadosSeguro[k].CNPJSeguradora ;
                  objSave.NMSEGURA = resultSend.Averbado.DadosSeguro[k].NomeSeguradora ;
                  objSave.NRAPOLIC = resultSend.Averbado.DadosSeguro[k].NumApolice ;
                  objSave.VRAVERBA = resultSend.Averbado.DadosSeguro[k].ValorAverbado ;
                  
                  let resultSave = await dao.updateCte(objSave, resultSend);
                }
                

              //# errors
              }else{

                for (let k = 0; k < resultSend.Erros.Erro.length; k++) {
                  
                  let objError = {};

                  objError.IDG051   = arXml[i].IDG051 ;
                  objError.STAVERBA = 'E' ;
                  objError.CDERRO   = resultSend.Erros.Erro[k].Codigo ;
                  objError.DSERRO   = resultSend.Erros.Erro[k].Descricao ;
                  objError.VRESPERA = resultSend.Erros.Erro[k].ValorEsperado ;
                  objError.VRINFORM = resultSend.Erros.Erro[k].ValorInformado ;
      
                  let resultSaveErro = await dao.updateCteError(objError, resultSend);

                }

              }

            }

          }
        }

      //# nao autenticado
      }else{
        logger.error("Falha na autenticacao");
      }
      
      return true;

    } catch (err) {

      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      logger.error("Erro:", err);
      throw err;

    }
    
  }




  api.indicadores = async function (req, res, next) {
    await dao.indicadores(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.notificacao = async function (req, res, next) {
    await dao.notificacao(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.getCteXml = async function (req, res, next) {
    await dao.getCteXml(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };



  api.getDadosCIOT = async function (req, res, next) {
    await dao.getDadosCIOT(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };



  return api;
};
