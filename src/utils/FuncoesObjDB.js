/**
 * @description Possui os métodos relacionados ao tratamento dos objetos GERAIS retornados pelas consultas no banco de dados
 * @author Samuel Gonçalves Miranda
 * @since 25/10/2017
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Retorna um objeto JSON.
*/
module.exports = function (app, cb) {

  var fn = {};

  /**
   * @description Função para construção do objeto de retorno para construção do datagrid no front-end
   * @function fn/construirObjetoRetornoBD
   * @param {JSON} objResultDB - Possui um objeto com os dados retornados pelo DAO .
   * @return {JSON} Retorna um objeto JSON.
   **/

  fn.construirObjetoRetornoBD = async function (objResultDB, columnsExcel = null, RelatorioPerformance = false) {
    var obj = {};

    //Posição data para ser extraidos os dados do obj pelo datagrid
    obj.data = objResultDB;
    obj.recordsTotal = objResultDB.length;

    // Se houver retorno incrementa a posição com valor total de registros
    if (objResultDB.length >= 1) {
      obj.recordsFiltered = (objResultDB[0].COUNT_LINHA ? objResultDB[0].COUNT_LINHA : 0);

    } else {
      obj.recordsFiltered = 0;
    }

    obj.draw = "null";

    if(columnsExcel != null){
      var aux = await fn.tradFiltroGrid(columnsExcel);
      if (aux.paramExcel.length >= 1) {
        if (RelatorioPerformance) {
          var j = await fn.construirExcelPerformance(obj, aux.paramExcel);
        } else {
          var j = await fn.construirExcel(obj, aux.paramExcel);
        }
        return j;
      }
    }

    return obj;
  };

  /**
   * @description Função que trata datas POR DEFAULT no formato dd/mm/yyyy
   * @function fn/dateFormatOracle
   * @param {String} strDate - Recebe uma string no formato de data
   * @param {String} strSepAtual - Recebe uma string de 1 caractere, que é o separador atual da data
   * @param {String} strSepNovo - Recebe uma string de 1 caractere, que será o novo separador atual da data
   * @return {String}  Retorna uma string com formato de data adaptada de acordo com "separador" informado como parametro da função: Ex.: "20-04-2017", "10/04/2017", "20.04.2017", etc...
   **/
  fn.dateFormatOracle = function (strDate, strSepAtual, strSepNovo) {

    var objData;

    if (!(strSepAtual && strSepNovo)) {
      strSepAtual = "/";
      strSepNovo = "-";
    }

    if (strDate) {
      strDate = strDate.split(strSepAtual);
      strDate = new Date(strDate[2], strDate[1] - 1, strDate[0]);
    } else {
      return;
    }

    var objStringMonth = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    var dias = strDate.getDate();
    if (dias < 10) {
      dias = "0" + dias;
    }

    var meses = objStringMonth[strDate.getMonth()];

    var anos = strDate.getFullYear();

    return dias + strSepNovo + meses + strSepNovo + anos;
  };

  /**
   * @description Função que trata CamelCase em array JSON
   * @function fn/array_change_key_case
   * @param {String} array - Array JSON
   * @param {String} strCamel - Opção CamelCase
   * @return {String}  Retorna o array informado com as keys alteradas.
   **/

  fn.array_change_key_case = function (ArJson, strCamel) {

    //   eslint-disable-line camelcase
    //   discuss at: http://locutus.io/php/array_change_key_case/
    //   original by: Ates Goral (http://magnetiq.com)
    //   improved by: marrtins
    //   improved by: Brett Zamir (http://brett-zamir.me)
    //   example 1: array_change_key_case(42)
    //   returns 1: false
    //   example 2: array_change_key_case([ 3, 5 ])
    //   returns 2: [3, 5]
    //   example 3: array_change_key_case({ FuBaR: 42 })
    //   returns 3: {"fubar": 42}
    //   example 4: array_change_key_case({ FuBaR: 42 }, 'CASE_LOWER')
    //   returns 4: {"fubar": 42}
    //   example 5: array_change_key_case({ FuBaR: 42 }, 'CASE_UPPER')
    //   returns 5: {"FUBAR": 42}
    //   example 6: array_change_key_case({ FuBaR: 42 }, 2)
    //   returns 6: {"FUBAR": 42}


    for (var i = ArJson.length - 1; i >= 0; i--) {
      ArJson[i] = ArJson_change_key_case_recursive(ArJson[i], strCamel);
    }

    function ArJson_change_key_case_recursive(ArJson, strCamel) {
      var caseFnc
      var key
      var tmpArr = {}
      if (Object.prototype.toString.call(ArJson) === '[object Array]') {
        return ArJson
      }
      if (ArJson && typeof ArJson === 'object') {
        caseFnc = (!strCamel || strCamel === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase'
        for (key in ArJson) {
          tmpArr[key[caseFnc]()] = ArJson[key]
        }
        return tmpArr
      }
      return false
    }
    return ArJson;
  }


  /**
   * @description Função de Criptografia de string para base64
   * @function fn/cript
   * @param {string} String - Recebe uma string descriptografada .
   * @return {string} Retorna uma string criptografada em base64.
   **/

  fn.cript = function (strSenha) {
    return new Buffer(strSenha).toString('base64');
  };


  /**
   * @description Função de Descriptografia de string para base64
   * @function fn/decript
   * @param {string} String - Recebe uma string criptografada em base64 .
   * @return {string} Retorna uma string descriptografada.
   **/

  fn.decript = function (strSenha) {
    return new Buffer(strSenha, 'base64').toString('ascii');
  };

  /**
   * @description Função que incrementa um ID sting
   * @function fn/incrementIdString
   * @param {String} strIdTable - Recebe a String de id da tablea
   * @return {String}  Retorna uma string da proxima posição
   **/
  fn.incrementIdString = function (strIdTable) {
    var ans;
    if (strIdTable) {
      var converteIdStringToInteger = parseInt(strIdTable);
      converteIdStringToInteger++;
      var str = "" + converteIdStringToInteger
      var pad = "00"
      ans = pad.substring(0, pad.length - str.length) + str
    } else {
      ans = '01';
    }

    return ans;
  };


  /* Retorna array de objetos para o autocomplete select de cidades */
  fn.nmCidadeId = async function (result) {

    var cidades = result.map(function (cidade) {
      //console.log(JSON.stringify(cidade));
      item = {};
      item.label = cidade.NMCIDADE;
      item.value = cidade.IDG003;
      return item;
    });

    data = {data: await cidades}

    return data;

  };


  fn.nmEstadoId = async function (result) {

    var estados = result.map(function (estado) {
      //console.log(JSON.stringify(estado));
      item = {};
      item.label = estado.NMESTADO;
      item.value = estado.IDG002;
      return item;
    });

    data = {data: await estados}

    return data;

  };
  fn.nmPaisId = async function (result) {

    var paises = result.map(function (pais) {
      //console.log(JSON.stringify(pais));
      item = {};
      item.label = pais.NMPAIS;
      item.value = pais.IDG001;
      return item;
    });

    data = {data: await paises}

    return data;

  };


  fn.nmTransportadorasId = async function (result) {

    var transpotadoras = result.map(function (transportadora) {
      //console.log(JSON.stringify(transportadora));
      item = {};
      item.label = transportadora.NMTRANSP +' '+ transportadora.CJTRANSP;
      item.value = transportadora.IDG024;
      return item;
    });

    data = {data: await transpotadoras}

    return data;

  };

  fn.nmClientesId = async function (result) {

    var clientes = result.map(function (cliente) {
      //console.log(JSON.stringify(cliente));
      item = {};
      item.label = cliente.NMCLIENT +' '+ cliente.CJCLIENT;
      item.value = cliente.IDG005;
      return item;
    });

    data = {data: await clientes}

    return data;

  };

 /**
   * @description cria where dinamicamente gerando string e objeto com valores para bind
   *
   * @function buildWhere
   * @param   {Object} filtros
   * @param   {Boolean} snDelete default false
   * @param   {Boolean} nulls default false
   *
   * @returns {Array}  str for where sql and var to bind the values
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.buildWhere = function(filtros,snDelete = false,nulls = false){
    var dataAtual = app.src.utils.DataAtual;
    var sqlWhere = " Where ";
    const tableName = filtros.tableName;
    delete filtros.tableName;
    const fullDateFormat = "DD/MM/YYYY HH:mm:ss";
    const maxHourReachableBet = " 23:59:59";
    var bindValues = {};

    if(snDelete){
      filtros.SNDELETE = 0;
    }

    var firstCondition = true;
    for(let i in filtros){

      if (!nulls){
        if (filtros[i] === "" || filtros[i] == null){
          continue;
        }
      }
      if(filtros[i].id){
        filtros[i] = filtros[i].id
      }

      if(!firstCondition){
        sqlWhere += " And ";
      }else{
        firstCondition = false;
      }
      if(filtros[i].null == "true" || filtros[i].null == true){
        sqlWhere += this.retKey(i,tableName) + " IS NULL ";
        continue;
      }
      if(filtros[i].null == "false" || filtros[i].null == false){
        sqlWhere += this.retKey(i,tableName) + " IS NOT NULL ";
        continue;
      }

      if(Array.isArray(filtros[i])){ //verifico se é uma data
        var dateFormat = [];
        //percorro o array de datas convertendo tudo para data no formato js
        for(var ii = 0; ii < filtros[i].length; ii++){
          if(filtros[i][ii].length < 10){
            return [false];
          }
          //pré processamento da data para adicionar a hora máxima para correto funcionamento do between
          if(ii == filtros[i].length -1 && ii != 0){
            filtros[i][ii] = filtros[i][ii] + maxHourReachableBet.substr(filtros[i][ii].length - 10, fullDateFormat.length - filtros[i][ii].length);
          }

          dateFormat[ii] = fullDateFormat.substr(0,filtros[i][ii].length);
          bindValues[this.retKey(i,tableName,true) + ii] = dataAtual.retornaData(filtros[i][ii], dateFormat[ii]);
        }

        if(filtros[i].length == 2){
          sqlWhere += this.retKey(i,tableName) + " Between :" + this.retKey(i,tableName,true) + "0 AND :" + this.retKey(i,tableName,true) + "1";
         continue;
        }else{
          sqlWhere += this.retKey(i,tableName) + " = :" + this.retKey(i,tableName,true) + "0";
          continue;
        }
      }
      if(filtros[i].in){

        arrToFieldNames = [];
        if (!Array.isArray(filtros[i].in)) {
          filtros[i].in = [filtros[i].in];
        }
        for (const key in filtros[i].in) {
          arrToFieldNames.push(` :${this.retKey(i,tableName,true)}${key}`);
          bindValues[this.retKey(i,tableName,true) + key] = filtros[i].in[key];
        }
        sqlWhere += `${this.retKey(i,tableName)} in (${arrToFieldNames.join()})`;
        continue;
      }
      if(filtros[i][0] == "%" || filtros[i][filtros[i].length-1] == "%" ){
        sqlWhere += `UPPER(` + this.retKey(i,tableName) + `) like UPPER(:` + this.retKey(i,tableName,true)+`)`;

      }else{
        sqlWhere += this.retKey(i,tableName) + " = :" + this.retKey(i,tableName,true);
      }

      bindValues[this.retKey(i,tableName,true)] = filtros[i]

    }

    sqlWhere += " ";
    if(sqlWhere == " Where  "){
      return ["",{}];
    }
    return [sqlWhere,bindValues];
  }

  /**
   * @description cria string para paginação
   *
   * @function paginate
   * @param   {number} start  default 0
   * @param   {number} length default 10
   *
   * @returns {string}
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.paginate = function (start = 0, length = 10){
    var sqlPaginate = ` Offset ` + start + ` rows
    Fetch next ` + length + ` rows only `;

    return sqlPaginate;
  }

  /**
   * @description cria ordenação baseado no padrão da datagrid
   *
   * @function buildOrder
   * @param   {object} params
   * @param   {string} tableName
   *
   * @returns {string}
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.buildOrder = function(params,tableName){

    var numColumnsOrder = 0;
    var sqlOrder = " Order by ";
    while(true){
      if(params["order[" + numColumnsOrder + "][column]"] != null){
        if(numColumnsOrder != 0){
          sqlOrder += ", "
        }
        var columnNumber = params["order[" + numColumnsOrder + "][column]"];

        sqlOrder += this.retKey(params["columns[" + columnNumber + "][name]"],tableName) + " " + params["order[" + numColumnsOrder + "][dir]"];
        numColumnsOrder++;
      }else{
        if(numColumnsOrder == 0 && params["columns[0][name]"] != undefined){
          sqlOrder += this.retKey(params["columns[0][name]"],tableName) + ' Desc' ;
          return sqlOrder;
        }
        break;
      }
    }
    if(sqlOrder == " Order by "){
      return " ";
    }
    sqlOrder += " ";
    return sqlOrder;
  }

  /**
   * @description retorna nome de campo para uso no buildWhere e buildOrder
   *
   * @function retKey
   * @param   {string} i
   * @param   {string} tableName
   * @param   {Boolean} isForBind
   *
   * @returns {string}
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.retKey = function(i,tableName, isForBind = false){
    var iSlipted = i.split(".",2);

    //caso ñ haja . separando nomeTabela e nomeCampo procuro por _ por causa do datagrid
    // e "converto" pra .
    if(iSlipted.length == 1){
      var iSlipted = i.split("_",2);
      if (iSlipted.length == 2){
        i = iSlipted[0] + "." + iSlipted[1];
      }
    }
    if (iSlipted.length == 2){
      if(isForBind){
        return iSlipted[0] + "_" + iSlipted[1];
      }
      return i;
    }
    if(isForBind){
      return tableName + "_" + i;
    }
    return tableName + "." + i;
  }

  /**
   * @description Trabalha diretamente com datagrid integrando paginação, ordenação e filtros
   *
   * @function retWherePagOrd
   * @param   {object} body body da requisição
   * @param   {string} tableName
   * @param   {Boolean} snDelete gerar snDelete
   *
   * @returns {string}
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.retWherePagOrd = function(body,tableName,snDelete){
    var bodyConv = this.tradFiltroGrid(body);
    var parameter = bodyConv.parameter;
    if(parameter || snDelete){
      if(!parameter){
        parameter = {};
      }
      parameter.tableName = tableName;
      var [sqlWhere,bindValues] = this.buildWhere(parameter,snDelete);

    }else{
      var [sqlWhere,bindValues] = ["",{}];
    }
    var sqlPaginate = this.paginate(body.start,body.length);
    var sqlOrder = this.buildOrder(body,tableName);

    return [sqlWhere,sqlOrder,sqlPaginate,bindValues];
  }

  /**
   * @description função usada para converter o formato enviado pelo datagrid novo para um json 'correto'
   *
   * @function retWherePagOrd
   * @param   {object} body body da requisição
   *
   * @returns {object}
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.tradFiltroGrid = function(body){
    var parameter = {};//parameter agora se tornou "body"
    for(chave in body){

      var tmpVal = body[chave];
      delete body[chave];
      [chave] = chave.split("[]");
      body[chave] = tmpVal;

      var chavesSlipted = chave.split("[");
      //se não possui nada após [ colocar o valor e vai embora
      if(chavesSlipted.length == 1){
        parameter[chave] = body[chave];
      }else{
        //for para "limpar" o chavesSlipted pois ele ainda possui o ] e isso é indesejado
        for (chaveSlipted in chavesSlipted){
          [chavesSlipted[chaveSlipted]] = chavesSlipted[chaveSlipted].split(']');
        }
        //percorro o chavesSliptes a fim de processar cara chave encontrada e montar o objeto
        for(var i =1; i < chavesSlipted.length; i++){
          var atr = chavesSlipted[i];
          if(!isNaN(parseInt(atr))){


            var objAnterior = parameter
            for(var ii =0; ii < i; ii++){//percorro do começo até o local que estou para saber onde inserir o objeto
              //se no caminho existe algo que não existe eu defino
              if(objAnterior[chavesSlipted[ii]] == undefined){
                objAnterior[chavesSlipted[ii]] = []
              }
              objAnterior = objAnterior[chavesSlipted[ii]];
            }

            if(chavesSlipted.length -1 == i){
              if(objAnterior[atr] == undefined){
                objAnterior[atr] = {};
              }
              objAnterior[atr] = body[chave];
            }else{
              if(objAnterior[atr] == undefined){
                objAnterior[atr] = {};
              }

            }
          }else{
            var objAnterior = parameter;

            for(var ii =0; ii < i; ii++){//percorro do começo até o local que estou para saber onde inserir o objeto
              if(objAnterior[chavesSlipted[ii]] == undefined){
                objAnterior[chavesSlipted[ii]] = {}
              }
              objAnterior = objAnterior[chavesSlipted[ii]];

            }
            //começo atribuir valor
            if(chavesSlipted.length -1 == i){
              objAnterior[atr] = body[chave];
            }else{
              if(objAnterior[atr] == undefined){
                if(!isNaN(parseInt(chavesSlipted[i = 1]))){
                  objAnterior[atr] = []
                }else{
                  objAnterior[atr] = {}
                }

              }
            }
          }
        }
      }
    }
    var parameterNotNull = false;
    for(i in parameter){
      parameterNotNull = true;
      break;
    }
    if(parameterNotNull){
      return parameter;
    }else{
      return false;
    }

  }

  /**
   * @description Trabalha diretamente com componente combobox
   *
   * @function retWherePagOrd
   * @param   {number} id
   * @param   {string} text
   * @param   {string} tableName
   * @param   {string} column
   * @param   {string} param
   * @param   {Boolean} snDelete
   * @param   {string} columnSelect
   *
   * @returns {string}
   * @throws  {status(500)} Exceção não tratada
   *
   * @author Igor Pereira da Silva
   * @since 21/06/2018
   *
   */
  fn.searchComboBox = async function (id, text, tableName, column, param,snDelete = true, columnSelect = undefined, noRowNun = false, acl = '') {

    try {

      if (id == undefined) {
        id = tableName + '.Id' + tableName;
      }

      if (param.parameter == undefined) {  //busca vazia;
        return;
      }

      if (param.parameter.length < 2) {
        return;
      }

      var strWhere = `And (Upper(` + text + `) like Upper(:param) `;

      if (column.length > 0) {
        for (var i = 0; i < column.length; ++i) {
          strWhere += `Or Upper(` + column[i] + `) like Upper(:param) `;
        }
      }

      strWhere += ")";

      if (param.parameterDep != undefined && param.parameterDep != true) {
        for (var key in param.parameterDep) {
          var auxNameKey = key.replace("_",".");
          strWhere += `And ` + auxNameKey + `  = `+param.parameterDep[key]+` `;
        }
      }

      if (columnSelect == undefined) {
        columnSelect = column;
      }

      let strRowNum = `and ROWNUM <= 100 `;
      if(noRowNun){
        strRowNum = ``;
      }
      strColumnSelect = columnSelect; // colunas return;

      //columnSelect = columnSelect.split(',');
      strColumn = "";
      strColumn = columnSelect.join(",");
      // for (var i = 0; i < columnSelect.length; ++i) {
      //   strColumn = columnSelect[i] + ',';
      // }

      // strColumn = strColumn.substr(0, (strColumn.length - 1));

      var db = app.config.database;
      /*
      let acl1 = '';
        acl1 = await acl.montar({
          ids001: req.headers.ids001,
          dsmodulo: req.headers.dsmodulo,
          nmtabela: [{ tableName:tableName }],
          esoperad: 'And'
        });
      console.log(acl1);
        */
      var strSql = `Select ` +
        text + ` text, ` +
        id + ` ID, ` +
        strColumn +
        ` From ` + tableName +" "+ tableName+ acl +` Where `;
      if(snDelete){
        strSql += tableName+".SnDelete = 0 ";
      } else {
        strSql += " 1=1 ";
      }

      strSql += strRowNum +
      strWhere +
      `Order by text asc`;


      return await db.execute(
        {
          sql: strSql,
          param: {
            "param": "%" + param.parameter + "%"
          },
          debug: true
        })
        .then((result) => {
          return this.array_change_key_case(result);
        })
        .catch((err) => {
          //console.log(err);
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      } catch (e) {
        console.log(e);
      }

  }


  fn.columnSqlAux = function (index = "", column = null){

    var result = "";
    if(column != null){
      column = column.split(",");
    }else{
      column = [];
    }

    for (let i = 0; i < column.length; i++) {
      if(column[i] != ""){
      result = result+", "+index+column[i]+" ";
      }
    }
    if(result.length <= 1){
      result = " ";
    }
    return result;
  }


  /**
   * @description Função para construção do objeto excelde retorno para datagrid no front-end
   * @function fn/construirExcel
   * @param {JSON} objResultDB - Possui um objeto com os dados retornados pelo DAO .
   * @return {JSON} Retorna um objeto JSON.
   **/
  fn.construirExcel = async function (storedResults, columnsExcel) {
    
    var utils  = app.src.utils.Utils;
    var Excel = require('exceljs');
    var file = 'Project';
    var dtAux = new Date();

    file = dtAux.getDate()+""+(dtAux.getMonth()+1)+""+dtAux.getFullYear()+""+dtAux.getTime();
    
    const workbook    = new Excel.Workbook();
    workbook.creator  = 'Project';
    workbook.created  = new Date();
    const worksheet   = workbook.addWorksheet("Sheet");

    worksheet.columns = columnsExcel;

    worksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length
    })

    for (let i = 0; i < storedResults.data.length; i++) {
      worksheet.addRows([storedResults.data[i]]);
    }

    var obj = utils.getCaminhoExcel();

    workbook.xlsx.writeFile(obj.pathExcel+file+".xlsx");

    return  `http://localhost:3000/download/excel/`+process.env.APP_ENV.toLowerCase()+"/"+file+".xlsx";
  };



  fn.construirExcelPerformance = async function (storedResults, columnsExcel) {
    
    var utils  = app.src.utils.Utils;
    var Excel = require('exceljs');
    var file = 'Project';
    var dtAux = new Date();
    var maiorNumAtend = 0;
    var objAtend;
    var objMotivo;
    var objObserv;
    var objDataIni;
    var objDataFim;
    var objAtendente;

    file = dtAux.getDate()+""+(dtAux.getMonth()+1)+""+dtAux.getFullYear()+""+dtAux.getTime();
    
    const workbook    = new Excel.Workbook();
    workbook.creator  = 'Project';
    workbook.created  = new Date();
    const worksheet = workbook.addWorksheet("Sheet");

    for (let i = 0; i < storedResults.data.length; i++) {

      if (storedResults.data[i].A001_IDA001 != undefined && storedResults.data[i].A001_IDA001 != null && storedResults.data[i].A001_IDA001 != '') {
        objAtend = storedResults.data[i].A001_IDA001.split(",");
      } else {
        objAtend = [];
      }
      
      if (objAtend.length > maiorNumAtend) {
        maiorNumAtend = objAtend.length;
      }
    }

    for (i = 0; i < maiorNumAtend; i++){
      columnsExcel.push({ header: 'Atendimento '+(i+1), key: 'A001_IDA001_'+(i+1) });
    }

    worksheet.columns = columnsExcel;

    worksheet.columns.forEach(column => {
      column.width = column.header.length < 12 ? 12 : column.header.length
    })

    for (i = 0; i < storedResults.data.length; i++) {
      if (storedResults.data[i].A001_IDA001 != undefined && storedResults.data[i].A001_IDA001 != null && storedResults.data[i].A001_IDA001 != '') {
        objAtend = storedResults.data[i].A001_IDA001.split(",");
        objMotivo = storedResults.data[i].A002_DSTPMOTI.split(",");
        objDataIni = storedResults.data[i].A001_DTREGIST.split(",");
        //objDataFim = storedResults.data[i].A001_DTFIM;
        objAtendente = storedResults.data[i].S001_NMUSUARI.split(",");

        if (storedResults.data[i].DSOBSERV != undefined && storedResults.data[i].DSOBSERV != null && storedResults.data[i].DSOBSERV != '') {
          objObserv = storedResults.data[i].DSOBSERV.split("@#$");
        } else {
          objObserv = [];
        }
        if (storedResults.data[i].A001_DTFIM != undefined && storedResults.data[i].A001_DTFIM != null && storedResults.data[i].A001_DTFIM != '') {
          objDataFim = storedResults.data[i].A001_DTFIM.split(",");
        } else {
          objDataFim = [];
        }
        
      } else {
        objAtend = [];
        objMotivo = [];
        objDataIni = [];
        objAtendente = [];
      }
      for (let j = 0; j < maiorNumAtend; j++){
        storedResults.data[i]["A001_IDA001_" + (j + 1)] = (objAtend[j] != undefined && objAtend[j] != null ? ('Protocolo #' + objAtend[j].trim() + ' - ' + objMotivo[j] + ' - ' + (objObserv[j] != undefined && objObserv[j] != null ? objObserv[j] : ' ') + '. \n' + 
        'Abertura em ' + (objDataIni[j] != undefined && objDataIni[j] != null ? objDataIni[j]: '. Atendimento não finalizado') + (objDataFim[j] != undefined && objDataFim[j] != null ? ' e fechamento em ' + objDataFim[j]: '') + '.\nRealizado pelo atendente: ' + (objAtendente[j] != undefined && objAtendente[j] != null ? objAtendente[j]: ' ')) : null );
      }
      worksheet.addRows([storedResults.data[i]]);
    }

    var obj = utils.getCaminhoExcel();

    workbook.xlsx.writeFile(obj.pathExcel+file+".xlsx");

    return `http://localhost:3000/download/excel/`+process.env.APP_ENV.toLowerCase()+"/"+file+".xlsx";
  };




  return fn;
};
