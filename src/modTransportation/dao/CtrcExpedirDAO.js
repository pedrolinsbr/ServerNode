/**
 * @description Possui os métodos responsaveis por criar, listar e atualizar dados de parâmetros
 * @author Desconhecido
 * @since 04/05/2018
 * 
*/

/** 
 * @module dao/Relatorio
 * @description G058, .
 * @param {application} app - Configurações do app.
 * @return {JSON} Um array JSON.
*/
module.exports = function (app, cb) {

  var api        = {};
  var utils      = app.src.utils.FuncoesObjDB;
  var dicionario = app.src.utils.Dicionario;
  var dtatu      = app.src.utils.DataAtual;
  var acl        = app.src.modIntegrador.controllers.FiltrosController;
  var logger     = app.config.logger;
  api.controller = app.config.ControllerBD;

  /**
   * @description Listar um dados da tabela G046.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   */ 
  api.listar = async function (req, res, next) {

    logger.debug("Inicio listar");
    let con = await this.controller.getConnection(null, req.UserId);

    try {

            
        var visao = req.body.visao;
        var ArColumn = "";

        var lsDocumentos = [];
        lsDocumentos['ctrc'] = null;

        //visao = 4;

        if(visao == 1){

          ArColumn = ",";
          lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoUm]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoUm]'] : "");
          

        }else if(visao == 2){

          ArColumn = "NmCidade,CdEstado";
          lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoDois]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoDois]'] : req.body['parameter[lsDocumentos][ctrc][visaoUm]']);
          

        }else if(visao == 3){

          ArColumn = "NmCidade,CdEstado,Nmcliede";
          lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoTres]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoTres]'] : req.body['parameter[lsDocumentos][ctrc][visaoDois]']);
          

        }else if(visao == 4){

          ArColumn = "NmCidade,CdEstado,Nmclieco,Idg005co,Nmcliede";
          lsDocumentos['ctrc'] = (req.body['parameter[lsDocumentos][ctrc][visaoQuatro]'] != "" ? req.body['parameter[lsDocumentos][ctrc][visaoQuatro]'] : req.body['parameter[lsDocumentos][ctrc][visaoTres]']);

        }

        if(lsDocumentos['ctrc']){
          if(lsDocumentos['ctrc'][0] == ","){
            lsDocumentos['ctrc'] = lsDocumentos['ctrc'].substr(1, lsDocumentos['ctrc'].length);
          }
        }else{
          lsDocumentos['ctrc'] = "";
        }


        var sqlWhereAuxCTRC = "";
        var sqlTpDocumento = "";
        var sqlCtrc = "";

        var [sqlWhere,sqlOrder,sqlPaginate,bindValues] = utils.retWherePagOrd(req.body,'G051',false);

        logger.debug("Variaveis:", sqlWhere, sqlOrder, sqlPaginate, bindValues);


        if(bindValues){

          // CTRC
          var G051_IDG024 = [];
          if (bindValues.G051_IDG024) {
            for (var key in bindValues.G051_IDG024) {
              G051_IDG024[key] = bindValues.G051_IDG024[key]['id'];
            }
            G051_IDG024 = G051_IDG024.join(',');

            sqlWhereAuxCTRC     += " AND nvl(G051.IDG024AT,G051.IDG024) in ("+G051_IDG024+") ";

          }

          // TIPO TRANSPORTE
          var G051_TPTRANSP = [];
          var G051_TPTRANSP_G043 = [];
          if (bindValues.G051_TPTRANSP) {
            var j = 0;
            for (var key in bindValues.G051_TPTRANSP) {

              G051_TPTRANSP[key] = "'"+bindValues.G051_TPTRANSP[key]['id']+"'";

              if(bindValues.G051_TPTRANSP[key]['id'] == "V"){
                G051_TPTRANSP_G043[j] = 2;
                j++;
              }else if(bindValues.G051_TPTRANSP[key]['id'] == "T"){
                G051_TPTRANSP_G043[j] = 1;
                j++;
              }else if(bindValues.G051_TPTRANSP[key]['id'] == "G"){
                G051_TPTRANSP_G043[j] = 5;
                j++;
              }

            }

            G051_TPTRANSP = G051_TPTRANSP.join(',');
            G051_TPTRANSP_G043 = G051_TPTRANSP_G043.join(',');

            sqlWhereAuxCTRC += " AND G051.TPTRANSP in ("+G051_TPTRANSP+") ";

          }

          // ESTADOS
          var G051_IDG002 = [];
          if (bindValues.G051_IDG002) {
            for (var key in bindValues.G051_IDG002) {
              G051_IDG002[key] = bindValues.G051_IDG002[key]['id'];
            }
            G051_IDG002 = G051_IDG002.join(',');
            sqlWhereAuxCTRC     += " AND G003DE.IDG002 in ("+G051_IDG002+") ";
          }


          // CALENDARIZACAO
          var G051_ARCALEND = [];
          if (bindValues.G051_ARCALEND) {
            
            for (var key in bindValues.G051_ARCALEND) {
              G051_ARCALEND[key] = "'"+bindValues.G051_ARCALEND[key]['id']+"'";
            }
            G051_ARCALEND = G051_ARCALEND.join(',');
            
            //#vencidos
            if(bindValues.G051_ARCALEND[0].id == 1){ 
              sqlWhereAuxDelivery += " AND (to_char(G043.DTVENROT, 'DD/MM/YYYY') in ("+G051_ARCALEND+") OR to_date(G043.DTVENROT, 'DD/MM/YYYY') <= to_date(CURRENT_DATE, 'DD/MM/YYYY') ) ";
            }
          }

          //CIDADES
          var G051_IDG003 = [];
          if (bindValues.G051_IDG003) {
            for (var key in bindValues.G051_IDG003) {
              G051_IDG003[key] = bindValues.G051_IDG003[key]['id'];
            }
            G051_IDG003 = G051_IDG003.join(',');
            sqlWhereAuxCTRC     += " AND G003DE.IDG003 in ("+G051_IDG003+") ";
          }

          //ROTAS
          if (bindValues.G051_IDT001) {
            sqlWhereAuxCTRC     += " AND T002.IDT001 in ("+bindValues.G051_IDT001+") ";
          }

          //DESTINATARIO
          if (bindValues.G051_IDG005DE) {
            sqlWhereAuxCTRC     += " AND G005DE.IDG005 in ("+bindValues.G051_IDG005DE+") ";
          }

          //TOMADOR
          if (bindValues.G051_IDG005C0) {
            sqlWhereAuxCTRC     += " AND G051.IDG005CO in ("+bindValues.G051_IDG005C0+") ";
          }

          //REMETENTE
          if (bindValues.G051_IDG005RE) {
            sqlWhereAuxCTRC     += " AND G051.IDG005RE in ("+bindValues.G051_IDG005RE+") ";
          }


          //CTRC
          if (bindValues.G051_IDG051) {
            sqlWhereAuxCTRC += " AND G051.CDCTRC in ("+bindValues.G051_IDG051+") ";
          }


          //NOTA
          if (bindValues.G051_NRNOTA) {
            sqlWhereAuxCTRC += " AND G043.NRNOTA in ("+bindValues.G051_NRNOTA+") ";
          }



          // DTENTCON
          if (bindValues.G051_DTENTCON0 && bindValues.G051_DTENTCON1) {

            var moment = require('moment');
            moment.locale('pt-BR');
            
            var d0 = moment(bindValues.G051_DTENTCON0).format('l');
            var d1 = moment(bindValues.G051_DTENTCON1).format('l');

            sqlWhereAuxCTRC     += ` And Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) >= 
            to_date( '${d0}', 'dd/mm/yyyy') AND Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) <= 
            to_date( '${d1}', 'dd/mm/yyyy') `;
            
          }

          // NOTLIBER
          if (bindValues.G051_NOTLIBER) {
            if(bindValues.G051_NOTLIBER == 1){
              sqlWhereAuxCTRC     += ` And ((G043.DtBloque Is Not Null And  G043.DtDesBlo Is Not Null)
              Or G043.DtBloque Is Null) `;
            
            }else if(bindValues.G051_NOTLIBER == 2){
              sqlWhereAuxCTRC     += ` And (G043.DtBloque Is Not Null And  G043.DtDesBlo Is Null) `;
            
            }
          }

        }


        //CALENDARIZAÇÃO
        var padraoRotAux = "";
        if (bindValues.G051_IDT005) {
          var auxDiasT001 = "";
          var auxDiasT002 = "";

          padraoRotAux = ` and c.IDT005 = ${bindValues.G051_IDT005} `;
          if(bindValues.G051_CALENDARIO){
            for(pos in bindValues.G051_CALENDARIO){
              //console.log(bindValues.G051_CALENDARIO[pos].id);
              auxDiasT001 = auxDiasT001 + " OR  T1.SNDIA"+bindValues.G051_CALENDARIO[pos].id + "=1 ";
              auxDiasT002 = auxDiasT002 + " OR  T2.SNDIA"+bindValues.G051_CALENDARIO[pos].id + "=1 ";
              
            }

            sqlWhereAuxCTRC     += ` AND (T002.IDT001 in (
            select distinct T1.idT001
              from T001 T1
              join T002 T2
                on T1.idT001 = T2.idT001
            where 1=1 
              AND (1=0 ${auxDiasT001}) 
              and (1=0 ${auxDiasT002})
              AND T1.IDT005 = ${bindValues.G051_IDT005}
              AND T1.IDG024 = ${bindValues.IDG024_CARGA}) 
                OR nvl(T002.IDT001,0) = 0)`;

          }else{

            sqlWhereAuxCTRC     += ` AND (T002.IDT001 in (
            select T1.idT001
              from T001 T1
              join T002 T2
                on T1.idT001 = T2.idT001
            where T1.IDT005 = ${bindValues.G051_IDT005}
              AND T1.IDG024 = ${bindValues.IDG024_CARGA}) 
                OR nvl(T002.IDT001,0) = 0)`;

          }
        }



        sqlCtrc = `
                    Select X0.IdT001,
                          X0.DsPraca,
                          X0.PsBruto,
                          X0.PsLotaca,
                          X0.DtEntCon,
                          X0.VrMercad,
                          X0.IdG051,
                          X0.cdctrc,
                          X0.IDG043,
                          LISTAGG(X0.NRNOTA, ', ') WITHIN GROUP(ORDER BY X0.NRNOTA) AS NRNOTA, 
                          
                          ${( visao == 2 ?`
                          X0.NmCidade , 
                          X0.CdEstado , 
                          `:``)
                          }
            
                          ${( visao == 3 ?`
                          X0.NmCidade , 
                          X0.CdEstado , 
                          X0.Nmcliede,
                          `:``)
                          }
            
                          ${( visao == 4 ?`
                          X0.NmCidade , 
                          X0.CdEstado , 
                          X0.Nmclieco , 
                          X0.Idg005co,
                          X0.Nmcliede,
                          `:``)
                          }
                          
                          
                          Null As CDDELIVE,
                          X0.EMITRANS,
                          X0.DTVENROT
                    From (
                          Select Distinct 
                                Nvl(Nvl(T002.IDT001, T003.IDT001), 0) As IDT001,
                                        G051.IdG024,
                                (Select  T001.DsPraca
                                  From T001 T001
                                Where T001.IDT001 = Nvl(T002.IDT001, T003.IDT001)
                                  And T001.IDG024 = Nvl(T002.IDG024, T003.IDG024)) As DsPraca,
                                Nvl(Nvl(G051.DtCombin, G051.DtAgenda), G043.DtEntCon) As DtEntCon,
                                G051.NRPESO as PsBruto,
                                nvl(G051.PsLotaca, G051.NRPESO) as PsLotaca,
                                G051.VrMercad,
                                G051.IdG051,
                                G051.cdctrc,
                                null As IdG043,
                                G043.NRNOTA,
                                G051.Idg005co,
                                /*G005co.Nmclient As Nmclieco,*/
                                G005co.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005co.CJCLIENT) || ' - ' || G005co.IECLIENT ||']' As Nmclieco,
                                G005DE.Nmclient || ' [' || FN_FORMAT_CNPJ_CPF(G005DE.CJCLIENT) || ' - ' || G005DE.IECLIENT ||']' As Nmcliede,
                                G003DE.NmCidade As NmCidade,
                                G002DE.CdEstado As CdEstado,
                                G024.NMTRANSP || ' [' || g024.idg024   || '-' || g024.idlogos   || ']' as EMITRANS,
                                null as DTVENROT
                                
                            From G051 G051 --CTE
                            Join G052 G052
                              On G052.IdG051 = G051.IdG051 -- NF COM CTE
                            Join G043 G043
                              On G043.IdG043 = G052.IdG043 -- NF
                            and G043.DtEntreg is null
                      Left Join G005 G005DE
                              On G005DE.IDG005 = NVL(G051.IDG005RC, G051.IDG005DE) -- DESTINATARIO

                            Join G003 G003DE
                              On G003DE.IdG003 = G005DE.IdG003 -- CIDADE/DESTINATARIO

                            Join G002 G002DE
                              On G002DE.IdG002 = G003DE.IdG002 -- ESTADO/DESTINATARIO

                            Join G024 G024
                              On G024.idg024 = G051.idg024

                      Left Join G005 G005RC
                              On G005RC.IDG005 = G051.IDG005RC -- DESTINATARIO

                      Left Join T002 T002
                              On T002.IdG024 = nvl(G051.IdG024At, G051.IdG024) 
                            And T002.IDG003 = Nvl(G005RC.IDG003, G005DE.IDG003)
                            And T002.IDT002 = (Select b.IDT002 From t002 b 
                              join t001 c
                              on c.IDT001 = b.IDT001
                              ${padraoRotAux}
                              and c.SNDELETE = 0
                              Where b.IDG003 = T002.IDG003 
                                AND b.IdG024 = nvl(G051.IdG024At, G051.IdG024) 
                                AND b.SNDELETE = 0
                                AND b.IdG024 = T002.IdG024
                                AND Rownum = 1)
                                AND T002.SNDELETE = 0
                      Left Join G003 G003T2
                              On G003T2.IdG003 = T002.IdG003
                      Left Join G002 G002T2
                              On G002T2.IdG002 = G003T2.IdG002
                            Left Join T003 T003
                              On T003.IdG024 = nvl(G051.IdG024AT,G051.IdG024)
                            And T003.IDG005 = Nvl(G005RC.IDG005, G005DE.IDG005)
                      Left Join G005 G005T3
                              On G005T3.IdG005 = T003.IdG005
                      Left Join G003 G003T3
                              On G003T3.IdG003 = G005T3.IdG003
                      Left Join G002 G002T3
                              On G002T3.IdG002 = G003T3.IdG002
                      Left Join G005 G005co
                              On G005co.Idg005 = G051.Idg005co -- CONSIGNATÁRIO
                          Where G051.IDG046 is null
                            And G051.StCtrc <> 'C'
                            ${(lsDocumentos['ctrc'] != "" ? `And g051.IdG051 In (`+lsDocumentos['ctrc']+`)` : '')}
                            And g051.SnDelete = 0
                            And g051.cdcarga is null
                            And G043.Sndelete = 0
                            /*
                            And G005T3.SNDELETE = 0
                            And G003T3.SNDELETE = 0
                            And G002T3.SNDELETE = 0
                            */ 
                            And NOT EXISTS (
                              SELECT
                                *
                              FROM
                                G052 G052x 
                                JOIN G043 G043x
                                ON G052x.IDG043 = G043x.IDG043
                              WHERE
                                G052x.IdG043 = G043.IDG043 
                                AND to_char(substr(G043x.cddelive,0,1)) NOT IN ('0','1','2','3','4','5','6','7','8','9') 
                                AND G043x.STETAPA = 1
                                AND G052x.IDG051 = G051.IDG051)     
                            And G043.dtentcon = (Select Min(dtentcon)
                                                    From G043 a 
                                                    Join G052 b On b.idg043 = a.idg043 
                                                  Where b.IdG051 = G051.IdG051 ) 
                              ${sqlWhereAuxCTRC}
                      )X0
                      Group By  X0.IdT001,
                                X0.DsPraca,
                                X0.PsBruto,
                                X0.PsLotaca,
                                X0.DtEntCon,
                                X0.DTVENROT,
                                X0.VrMercad,
                                X0.IdG051,
                                x0.cdctrc,
                                X0.IDG043,
                                X0.NmCidade , X0.CdEstado , X0.Nmclieco , X0.Idg005co , X0.Nmcliede, X0.EMITRANS`;


        sqlTpDocumento = sqlCtrc;

        sqlOrder = sqlOrder.replace(/G051./g, 'X3.');

        sqlAux = `  Select X3.*,
        (X3.DtEntCon - To_Date(current_date, 'DD/MM/YY')) As QtDiaVen
        From (Select X2.IdT001,
                X2.DsPraca,
                nvl(Sum(X2.PsBruto),0) As PsBruto,
                nvl(Sum(X2.PsLotaca),0) As PsLotaca,
                Min(X2.DtEntCon) As DtEntCon,
                Min(X2.DTVENROT) As DTVENROT,
                Sum(X2.VrMercad) As VrMercad,
                Sum(X2.QtCte) As QtCte,
                Sum(X2.QtNfe) As QtNfe,
                LISTAGG(X2.DsCte, ',') WITHIN Group(Order By X2.DsCte) As DsCte,
                LISTAGG(X2.DsNfe, ',') WITHIN Group(Order By X2.DsNfe) As DsNfe,
                LISTAGG(X2.cdctrc, ',') WITHIN Group(Order By X2.cdctrc) As cdctrc 
                ${utils.columnSqlAux("X2.", ArColumn)}
                ${(visao == 4 ? ", X2.IdG051, X2.IdG043, X2.NRNOTA, X2.CDDELIVE, X2.EMITRANS":"")}
          From (Select X1.IdT001,
                        X1.DsPraca,
                        Sum(X1.PsBruto) As PsBruto,
                        Sum(X1.PsLotaca) As PsLotaca,
                        X1.DtEntCon,
                        X1.DTVENROT,
                        Sum(X1.VrMercad) As VrMercad,
                        Count(X1.IdG051) As QtCte,
                        Count(X1.IdG043) As QtNfe,
                        LISTAGG(X1.IdG051, ',') WITHIN Group(Order By X1.IdG051) As DsCte,
                        LISTAGG(X1.IdG043, ',') WITHIN Group(Order By X1.IdG043) As DsNfe,
                        LISTAGG(X1.cdctrc, ',') WITHIN Group(Order By X1.cdctrc) As cdctrc
                        ${utils.columnSqlAux("X1.", ArColumn)}
                        ${(visao == 4 ? ", X1.IdG051, X1.IdG043, X1.NRNOTA, X1.CDDELIVE, X1.EMITRANS":"")}
                  From (Select X.IdT001,
                                X.DsPraca,
                                Sum(X.PsBruto) As PsBruto,
                                Sum(X.PsLotaca) As PsLotaca,
                                X.DtEntCon,
                                X.DTVENROT,
                                Sum(X.VrMercad) As VrMercad,
                                X.IdG051,
                                x.cdctrc,
                                X.IdG043,
                                X.NRNOTA,
                                X.CDDELIVE,
                                X.EMITRANS

                                ${utils.columnSqlAux("X.", ArColumn)}
                          From (
                                ${sqlTpDocumento}
                                ) X

                          Group By X.IdT001, X.DsPraca, X.DtEntCon, X.DTVENROT,  X.IdG051, X.IdG043, X.NRNOTA, X.CDDELIVE, X.EMITRANS, X.CDCTRC ${utils.columnSqlAux("X.", ArColumn)}) X1
                  Group By ${(visao == 4 ? "X1.IdG051, X1.IdG043, X1.NRNOTA, X1.CDDELIVE, X1.EMITRANS, X1.cdctrc,":"")} X1.IdT001, X1.DsPraca, X1.DtEntCon, X1.DTVENROT ${utils.columnSqlAux("X1.", ArColumn)}) X2
          Group By ${(visao == 4 ? "X2.IdG051, X2.IdG043, X2.NRNOTA, X2.CDDELIVE, X2.EMITRANS, X2.cdctrc,":"")} X2.IdT001, X2.DsPraca ${utils.columnSqlAux("X2.", ArColumn)}) X3

        /*Order By IdT001*/ --` + sqlOrder;


          
          let result = await con.execute(	

            {sql:sqlAux,
          param: {},
          })
          .then((result) => {
            logger.debug("Retorno:", result);
            return result;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            logger.error("Erro:", err);
            throw err;
          });

          result = (utils.construirObjetoRetornoBD(result, req.body));

        await con.close();
        logger.debug("Fim listar");
        return result;

      } catch (err) {
  
        await con.closeRollback();
        err.stack = new Error().stack + `\r\n` + err.stack;
        logger.error("Erro:", err);
        throw err;
  
      }
        
    };



  return api;
};
