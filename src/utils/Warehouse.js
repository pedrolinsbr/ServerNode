
/**
 * @description Possui funções genericas para o Warehouse
 * @author Everton pessoa
 * @since 22/07/2019
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Retorna um objeto DATA (DD/MM/YYYY).
*/

const moment = require('moment');
const db = require(process.cwd() + '/config/database');
const timezone = require('moment-timezone');
const interval = require('moment-interval');

const Joi = require('joi');


module.exports = function (app, cb) {
    var fn = {};

    fn.tpDelive =  function (req) {
//
        switch (req) {

            case 'LF': //Venda
                return 2;

            case 'YTFD': //Troca de Prateleira
            case 'TP': //Troca de Prateleira
                return 3;
            case 'YA':
            case 'AG':
                return 4; // VENDA AG

            case 'TFDT': //Transferência
            case 'ZL1' : //Transferência - INBOUND
            default:
                return 1;
        }
    }

    //-----------------------------------------------------------------------\\
	/**
	 * @description Converte a letra do número da carga para o milhar
	 * @author Everton Pessoa
	 * @since 01/08/2019
	 *
	 * @function formataShipment
	 * @param {Integer}  idCarga ID da Carga
	 * @returns {String} Shipment no formato 0001123456
	*/
	//-----------------------------------------------------------------------\\

	fn.formataShipment = function (param) {
        var letra = param.substring(0,1);
        var quociente = param.substring(1,param.length);
        var numerador;

        switch(letra){
            case 'A':
                numerador = 'A'
                break
            case 'B':
                numerador = '1'
                break
            case 'C':
                numerador = 'C'
                break
            default:
                numerador = '1'
                break
        }


		return `${numerador}${quociente}`;
    }


    fn.formataShipmentSyn = function (param, tpproces) {
        var num = param.substring(0,1);
        var quociente = param.substring(1,param.length);
        var numerador;


        switch(num){
            case "1":
                numerador = tpproces
                break
            case "2":
                numerador = tpproces
                break
            case "C":
                numerador = "C"
                break
            case "A":
                numerador = "A"
                break
            default:
                numerador = tpproces
                break
        }


		return `${numerador}${quociente}`;
    }


    //-----------------------------------------------------------------------\\
	/**
	 * @description Verifica a etapa de atualização da delivery
	 * @author Everton Pessoa
	 * @since 01/08/2019
	 *
	 * @function formataShipment
	 * @param {String}  param1 Trigger
     * @param {String}  param2 Chave da Nota
     * @param {String}  param3 Status da Nota
	 * @returns {Integer} 1, 2, 3, 4, 5
	*/
	//-----------------------------------------------------------------------\\

    fn.verificarStatusAtu = function (param1, param2, param3, process) {

        var STATUALI;


        if(process == 'O') {

            if(param1 == "ORI"){ STATUALI = 1 };

            if(param1 == "CHA"){ STATUALI = 2 };

            if(param1 == "CHA" && param2 && param3) { STATUALI = 3 };

            if(param1 == "ORI" && param2) { STATUALI = 4 };

            if(param1 == "DEL" || param1 == "CAN" ) { STATUALI = 5 };
        } else {

            if(param1 == "ORI"){ STATUALI = 1 };

            if(param1 == "CHA"){ STATUALI = 2 };

        }


		return STATUALI;
    }


    //------------------------------------------------------------------------------\\
	/**
	 * @description inclui no objeto de retorno o objeto page, usado pela data grid
	 * @author Everton Pessoa
	 * @since 12/08/2019
	 *
	 * @function formataShipment
	 * @param {Object}  rs recordset de dados que serão retornados para datagrid
     * @param {String}  req objeto enviado pelo cliente no inicio da requisição
	 * @returns {Object} Formado pelo recordset[Object] e pelo page[Object]
	*/
	//------------------------------------------------------------------------------\\

    fn.formatDataGrid = function (rs, req){
        if (rs.length) {
            var result = {};
            result.data = rs;
            result.page = req.body;
            result.page.totalElements = rs[0].COUNT_LINHA;
            result.page.totalPages = Math.ceil(result.page.totalElements / req.body.size);
            result.page.pageNumber = req.body.pageNumber;

            for (var i of result.data) {
                delete i.COUNT_LINHA
            }

            return result
        }
        else { //objeto vazio
            return rs;
        }

    }

    //------------------------------------------------------------------------------\\
	/**
	 * @description inclui o a paginação passada pelo cliente em uma consulta
	 * @author Everton Pessoa
	 * @since 12/08/2019
	 *
	 * @function formataShipment
	 * @param {Integer}  pageNumber offset de busca do SQL
     * @param {Integer}  size número de linhas que será retornado
	 * @returns {String} complemento de paginação para o SQL
	*/
	//------------------------------------------------------------------------------\\
    fn.paginar = function (pageNumber, size){

        return `Offset ${((pageNumber) * size)} rows Fetch next ${size} rows only`
    }

    fn.formatarIDW001 = function (IDW001){
         return parseInt(IDW001.replace(/[^\d]+/g,'')) //só numeros
    }


    fn.erros = function(message, err,res){
        var error = {}
        error.message = message;

        if(process.env.DEBUG && process.env.DEBUG == 1 ){
            error.err = {message: err.message, stack: err.stack};
        }

        res.status(500).send(error);

    }

    fn.validarSchema = function(data, schema){
        return Joi.validate(data, schema, { stripUnknown: true });
    }

    fn.soNumeros = function (text){
        return text.replace(/[^\d]+/g,'') //só numeros
   }

    fn.tipoMilestoneNr = function (text) {
        var res = 0;

        switch (text) {
            case "GRB":
                res = 1
                break
            case "GRL":
                res = 2
                break
            case "GRW":
                res = 3
                break
            case "PGR":
                res = 4
                break
        }
        return res;

    }

    fn.tipoMilestoneText = function (nr) {
        var res = "GRB";

        switch (parseInt(nr)) {
            case 1:
                res = "GRB"
                break
            case 2:
                res = "GRL"
                break
            case 3:
                res = "GRW"
                break
            case 4:
                res = "PGR"
                break
        }
        return res;

    }

    fn.ordenar = function (req, id){
        var ordenar = ordenar = `ORDER BY ${id}`;

        if(req.body.params.sort){
            ordenar = `ORDER BY ${req.body.params.sort.prop} ${req.body.params.sort.dir}`;
        }

        return ordenar
    }

    fn.normalizarPeso = function (num) {
        let x = num.toString().replace('.','').replace(',','.');
        return parseFloat(x).toFixed(4);
    }

    fn.criarfiltros = function(req){
        var filtros = '';

		if(req && req[0].prop ){

			for (var i of req){

                var tb = fn.buscarTbFiltro(i.prop)

				filtros += ` AND ${tb}.${fn.tratarCampoFiltro(i.prop)} like '%${i.value}%' `
			}
        }
        return filtros;
    }

    fn.buscarTbFiltro = function (req){
        var tb;
        switch (req){
            case 'IDW001':
            case 'CDOUBOUN':
            case 'CDDELIVE':
            case 'STATUALI':
            case 'NRDELIVERY':
                tb = 'W001';
                break
            case 'NRNOTA':
            case 'STNOTA':
                tb = 'W004';
                break;
            case 'IDW002':
                tb = 'W002';
                break;
            default:
                tb = 'W001';
                break
        }

        return tb;

    }

    fn.tratarCampoFiltro = function(req){
        var campo = req;

        switch(campo){
            case 'CDDELIVE':
                campo = 'CDOUBOUN'
                break
            case 'IDW002':
                campo = 'CDSHIPME';
                break;
            case 'DELIVSAP':
            case 'NRDELIVERY':
                campo = 'IDW001';
                break;
            case 'DTLANCTO':
                campo = 'DTLANCTO';
                break;
        }

        return campo;

    }

    fn.joinAclArm = function(req){

        auxAcl = 'CJREMETE'
		if(req == 'I'){
			auxAcl = 'CJDESTIN'
        }

        return ` INNER JOIN G005
					ON W001.${auxAcl} = G005.CJCLIENT
				INNER JOIN G028
					ON G005.IDG028 = G028.IDG028 `
    }

    fn.filtroAclArm = function(req){

        return ` AND G005.IDG028 IS NOT NULL
                AND G005.SNDELETE = 0 AND
                G005.STCADAST = 'A' `
    }
    fn.customizarDeliverySap  = function (req) {

        var campoCustom = "Z000000000";
        var reqString = req.toString();

        var aux = campoCustom.slice(0, -reqString.length);

        return aux+req;

    }

    fn.customizarDocTransporte = function (tp, req) {

        // var campoCustom = `${tp}000000000`;
        // var reqString = req.toString();

        // var aux = campoCustom.slice(0, -reqString.length);

        // return aux+req;
        return tp+req;

    }

    fn.gerarIconesMilestones = function (geral, milestones) {

        for (let d of geral) {
            d.MILESTAT = [];
            for (let i of milestones) {
                if(d.IDW001 == i.IDW001) {
                    d.MILESTAT.push({name: i.TIPO, value: Boolean(i.SNENVIAD)});
                }
            };
        };

        return geral;

    }

    fn.calcularHoraFin = function (dt, peso) {

        qtPeso = Math.round(Math.round(peso) /1000) //peso em tonelada

        racional = (10 + (3 * qtPeso)) * 60
        var result = moment(dt).subtract(racional, 'seconds').format('YYYY-MM-DD HH:mm:ss');

        return result

    }

    fn.calcularHoraIni = function (dt, peso) {

        qtPeso = Math.round(Math.round(peso) /1000) //peso em tonelada

        racionaFin = (10 + (3 * qtPeso)) * 60
        dtFin = moment(dt).subtract(racionaFin, 'seconds').format('YYYY-MM-DD HH:mm:ss');

        racional = (20 + (5 * qtPeso)) * 60

        result = moment(dtFin).subtract(racional, 'seconds').format('YYYY-MM-DD HH:mm:ss'); ;

        return result

    }


    fn.verificarLoteBloqueado = function (req) {

        objLote = {};
        objLote.charg = req.CHARG;

        result = req.CHARG;

        switch(req.NMSTOLOC){
            case "DEAP":
                objLote.letra = "E";
                result = fn.formataCharg(objLote);
                break
            case "DESE":
                objLote.letra = "D";
                result = fn.formataCharg(objLote);
                break
            case "DESN":
                objLote.letra = "N";
                result = fn.formataCharg(objLote);
                break
            case "DESV":
                objLote.letra = "B";
                result = fn.formataCharg(objLote);
                break
            case "RETR":
                objLote.letra = "R";
                result = fn.formataCharg(objLote);
                break
            case "REVA":
                objLote.letra = "V";
                result = fn.formataCharg(objLote);
                break
            case "PWOF":
            case "WOF1":
            case "WOF2":
                objLote.letra = "W";
                result = fn.formataCharg(objLote);
                break
            case "TRFS":
            case "PTC":
            case "DP21":
                result = objLote.charg;
                break
            case "TAMB":
                obj.letra = "T";
                result = fn.formataCharg(objLote);
                break
            default:
                result = req.CHARG;
                break
        }

        return result;

    }

    fn.verificarDepositoBloqueado = function (req) {

        result = req.LGORT;;


        switch(req.NMSTOLOC){
            case "DEAP":
            case "DESE":
            case "DESN":
            case "DESV":
            case "RETR":
            case "REVA":
            case "TRFS":
            case "PTC":
            case "DP21":
            case "TAMB":
                result = "BEWM"
                break
            case "PWOF":
            case "WOF1":
            case "WOF2":
                result = "IEWM"
                break
            default:
                result = req.LGORT;
                break
        }

    return result;




    }

    fn.formataCharg = function (req) {
        
        var result;

        if (req.charg.length < 10) {
            result = req.letra + req.charg;
        } else {
            result = req.letra + req.charg.replace('L', '' );
        }

        return result;

    }

    fn.verificarStatusDelivery = function (req) {

        switch (req) {
            case 1:
                return 'BACKLOG';
            case 2:
                return 'ANALISE';
            case 3:
                return 'DOCUMENTAÇÃO';
            case 4:
                return 'SEPARADO';
            case 5:
                return 'CONFERIDO';
            case 6:
                return 'A CANCELAR';
            case 7:
                return 'CANCELADO';
            case 8:
                return 'FINALIZADO';

            default:
                return '';
        }

    }
    fn.mudarDataValidade = function (req) {

        var mes = moment(req).format('MM');
        var ano = moment(req).format('YYYY');
        var dia = "30"

        if(parseInt(mes) == 2){
            dia = "28"
        }

        return `${ano}-${mes}-${dia}`

    }


    return fn;
}
