module.exports = function (app, cb) {

    const utils = app.src.utils.FuncoesObjDB;
    const gdao  = app.src.modGlobal.dao.GenericDAO;

    var api = {};

    //-----------------------------------------------------------------------\\

    api.getConnection = async function (objConn) {
        return await gdao.controller.getConnection(objConn);
    }

    //-----------------------------------------------------------------------\\

    api.setConnection = async function (objConn) {
        return await gdao.controller.setConnection(objConn);
    }

    //-----------------------------------------------------------------------\\

    api.inserir = async function (req, res, next) {
        return await gdao.inserir(req, res, next);
    }

    //-----------------------------------------------------------------------\\

    api.alterar = async function (req, res, next) {
        return await gdao.alterar(req, res, next);
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Busca os componentes da prestação de serviço padrão em CTe cadastrados
    * @function buscarComponentes
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.buscarComponentes = async function (req, res, next) {

        req.sql =

            `SELECT
                    G063.IDG063
                ,	G063.IDG024
                ,	G063.NMCOMVAR
                ,	G062.IDG062
                ,	G062.NMCOMPAD

            FROM G063 -- COMPONENTES x 3PL

            INNER JOIN G062 -- COMPONENTES PADRÃO DA PRESTAÇÃO DE SERVIÇO
                ON G062.IDG062 = G063.IDG062

            WHERE
                G063.SNDELETE = 0 AND
                G062.SNDELETE = 0

            ORDER BY
                    G063.IDG024
                ,	G062.IDG062`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Busca a CTe de referência e a que será cadastrada
    * @function buscarCTe
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param   {Array} arChave Array com a chave atual e a chave de referência da CTe
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.buscarCTe = async function (req, res, next) {

        req.sql = `SELECT IDG051 ID, NRCHADOC FROM G051
                   WHERE SNDELETE = 0 AND
                   NRCHADOC IN (${req.arChave.join()})`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Busca ID de referência do Emitente / Transportador
    * @function buscarEmitente
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param   {Array} CNPJ Número do CNPJ do Emitente
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.buscarEmitente = async function (req, res, next) {

        //req.sql = `SELECT IDG024 ID, NMTRANSP FROM G024 WHERE SNDELETE = 0 AND CJTRANSP = '${req.CNPJ}'`;

        req.sql =
            `SELECT
                    G024.IDG024 ID
                ,	G024.NMTRANSP
                ,	G023.SNTRAINT

            FROM G024

            LEFT JOIN G023
                ON G023.IDG023 = G024.IDG023
                AND G023.SNDELETE = 0

            WHERE G024.SNDELETE = 0
            AND G024.STCADAST = 'A'
            AND CJTRANSP = '${req.CNPJ}'`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Busca ID de referência da Entidade encontrada no CTe
    * @function buscarPessoa
    * @author Rafael Delfino Calzado
    * @since 28/05/2018
    *
    * @async
    * @param   {Array} CNPJ Número do CNPJ da Entidade
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.buscarPessoa = async function (req, res, next) {

        req.sql = `SELECT IDG005 ID, NMCLIENT FROM G005 WHERE SNDELETE = 0 AND CJCLIENT = '${req.CNPJ}'`;

        return await gdao.executar(req, res, next).catch((err) => { throw err });
    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Filtra os CTe's importados
    * @function buscarDadosCTe
    * @author Rafael Delfino Calzado
    * @since 08/06/2018
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.buscarDadosCTe = async function (req, res, next) {

        var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'G051', true);

        var arCols = [];

        arCols[0]  = 'G051.IDG051';
        arCols[1]  = 'G051.IDG059'; //CFOP

        arCols[2]  = 'G051.CDCTRC';
        arCols[3]  = 'G051.NRCHADOC';
        arCols[4]  = 'G051.NRSERINF';
        arCols[5]  = 'G051.DSMODENF';
        arCols[6]  = 'G051.DSINFCPL';

        arCols[7]  = 'G051.VRFRETEP'; //COALESCE
        arCols[8]  = 'G051.VRTOTPRE'; //COALESCE
        arCols[9]  = 'G051.VRMERCAD'; //COALESCE

        arCols[10] = 'G051.VRFRETEV'; //COALESCE
        arCols[11] = 'G051.VRPEDAGI'; //COALESCE
        arCols[12] = 'G051.VROUTROS'; //COALESCE

        arCols[13] = 'G051.PCALIICM'; //COALESCE
        arCols[14] = 'G051.VRBASECA'; //COALESCE
        arCols[15] = 'G051.VRICMS';   //COALESCE

        arCols[16] = 'G051.NRPESO';   //COALESCE

        arCols[17] = 'G051.DTEMICTR'; //TO_CHAR


        arCols[18] = 'G051AN.IDG051';   //IDCTEANT
        arCols[19] = 'G051AN.CDCTRC';   //CDCTRANT
        arCols[20] = 'G051AN.NRCHADOC'; //NRCHAANT

        arCols[21] = 'G051AN.VRFRETEP'; //COALESCE PSFRTANT
        arCols[22] = 'G051AN.VRTOTPRE'; //COALESCE VRTTFANT
        arCols[23] = 'G051AN.VRMERCAD'; //COALESCE VRMERANT

        arCols[24] = 'G051AN.VRFRETEV'; //COALESCE VRFRTANT
        arCols[25] = 'G051AN.VRPEDAGI'; //COALESCE VRPDGANT
        arCols[26] = 'G051AN.VROUTROS'; //COALESCE VROUTANT

        arCols[27] = 'G051AN.PCALIICM'; //COALESCE PCICMANT
        arCols[28] = 'G051AN.VRBASECA'; //COALESCE VRBASANT
        arCols[29] = 'G051AN.VRICMS';   //COALESCE VRICMANT

        arCols[30] = 'G051AN.NRPESO';   //COALESCE NRPESANT

        arCols[31] = 'G051AN.DTEMICTR'; //TO_CHAR DTEMIANT

        arCols[32] = 'G003RE.NMCIDADE'; //UPPER NMCIDORI
        arCols[33] = 'G003DE.NMCIDADE'; //UPPER NMCIDDES

        arCols[34] = 'G024.NMTRANSP'; //NMEMITEN
        arCols[35] = 'G024.CJTRANSP'; //CJEMITEN
        arCols[36] = 'G024.IETRANSP'; //IEEMITEN
        arCols[37] = 'G024.DSENDERE'; //NMLOGEMI
        arCols[38] = 'G024.NRENDERE'; //NRENDEMI
        arCols[39] = 'G024.BIENDERE'; //NMBAIEMI
        arCols[40] = 'G024.CPENDERE'; //NRCEPEMI

        arCols[41] = 'G003EM.NMCIDADE'; //UPPER NMUNEMI
        arCols[42] = 'G002EM.CDESTADO'; //CDESTEMI

        arCols[43] = 'G024AN.NMTRANSP'; //NMEMIANT
        arCols[44] = 'G024AN.CJTRANSP'; //CJEMIANT
        arCols[45] = 'G024AN.IETRANSP'; //IEEMIANT

        arCols[46] = 'G002EA.CDESTADO'; //UFEMIANT

        arCols[47] = 'G005RE.NMCLIENT'; //NMREMETE
        arCols[48] = 'G005RE.CJCLIENT'; //CJREMETE
        arCols[49] = 'G005RE.IECLIENT'; //IEREMETE
        arCols[50] = 'G005RE.DSENDERE'; //NMLOGREM
        arCols[51] = 'G005RE.NRENDERE'; //NRENDREM
        arCols[52] = 'G005RE.BIENDERE'; //NMBAIREM
        arCols[53] = 'G005RE.CPENDERE'; //NRCEPREM

        arCols[54] = 'G003RE.NMCIDADE'; //UPPER NMMUNREM
        arCols[55] = 'G002RE.CDESTADO'; //CDESTREM

        arCols[56] = 'G005DE.NMCLIENT'; //NMDESTIN
        arCols[57] = 'G005DE.CJCLIENT'; //CJDESTIN
        arCols[58] = 'G005DE.IECLIENT'; //IEDESTIN
        arCols[59] = 'G005DE.DSENDERE'; //NMLOGDES
        arCols[60] = 'G005DE.NRENDERE'; //NRENDDES
        arCols[61] = 'G005DE.BIENDERE'; //NMBAIDES
        arCols[62] = 'G005DE.CPENDERE'; //NRCEPDES

        arCols[63] = 'G003DE.NMCIDADE'; //UPPER NMMUNDES
        arCols[64] = 'G002DE.CDESTADO'; //CDESTDES

        arCols[65] = 'G005CO.NMCLIENT'; //NMTOMADO
        arCols[66] = 'G005CO.CJCLIENT'; //CJTOMADO
        arCols[67] = 'G005CO.IECLIENT'; //IETOMADO
        arCols[68] = 'G005CO.DSENDERE'; //NMLOGTOM
        arCols[69] = 'G005CO.NRENDERE'; //NRENDTOM
        arCols[70] = 'G005CO.BIENDERE'; //NMBAITOM
        arCols[71] = 'G005CO.CPENDERE'; //NRCEPTOM

        arCols[72] = 'G003CO.NMCIDADE'; //UPPER NMMUNTOM
        arCols[73] = 'G002CO.CDESTADO'; //CDESTTOM

        arCols[74] = 'G005EX.NMCLIENT'; //NMEXPEDI
        arCols[75] = 'G005EX.CJCLIENT'; //CJEXPEDI
        arCols[76] = 'G005EX.IECLIENT'; //IEEXPEDI
        arCols[77] = 'G005EX.DSENDERE'; //NMLOGEXP
        arCols[78] = 'G005EX.NRENDERE'; //NRENDEXP
        arCols[79] = 'G005EX.BIENDERE'; //NMBAIEXP
        arCols[80] = 'G005EX.CPENDERE'; //NRCEPEXP

        arCols[81] = 'G003EX.NMCIDADE'; //UPPER NMMUNEXP
        arCols[82] = 'G002EX.CDESTADO'; //CDESTEXP

        arCols[83] = 'G005RC.NMCLIENT'; //NMRECEBE
        arCols[84] = 'G005RC.CJCLIENT'; //CJRECEBE
        arCols[85] = 'G005RC.IECLIENT'; //IERECEBE
        arCols[86] = 'G005RC.DSENDERE'; //NMLOGREC
        arCols[87] = 'G005RC.NRENDERE'; //NRENDREC
        arCols[88] = 'G005RC.BIENDERE'; //NMBAIREC
        arCols[89] = 'G005RC.CPENDERE'; //NRCEPREC

        arCols[90] = 'G003RC.NMCIDADE'; //UPPER NMMUNREC
        arCols[91] = 'G002RC.CDESTADO'; //CDESTREC

        arCols[92] = 'G046.IDG046';
        arCols[93] = 'G046.PSCARGA';
        arCols[94] = 'G046.VRCARGA';

        arCols[95] = 'G030.IDG030';
        arCols[96] = 'G030.QTCAPPES';
        arCols[97] = 'G030.DSTIPVEI';

        arCols[98] = 'G046.TPTRANSP'; 

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        var arColsSel = arCols.slice(0);

        arColsSel[1] += ' CFOP';

        arColsSel[7]  = `COALESCE(${arColsSel[7]}, 0) VRFRETEP`;
        arColsSel[8]  = `COALESCE(${arColsSel[8]}, 0) VRTOTPRE`;
        arColsSel[9]  = `COALESCE(${arColsSel[9]}, 0) VRMERCAD`;

        arColsSel[10] = `COALESCE(${arColsSel[10]}, 0) VRFRETEV`;
        arColsSel[11] = `COALESCE(${arColsSel[11]}, 0) VRPEDAGI`;
        arColsSel[12] = `COALESCE(${arColsSel[12]}, 0) VROUTROS`;

        arColsSel[13] = `COALESCE(${arColsSel[13]}, 0) PCALIICM`;
        arColsSel[14] = `COALESCE(${arColsSel[14]}, 0) VRBASECA`;
        arColsSel[15] = `COALESCE(${arColsSel[15]}, 0) VRICMS`;

        arColsSel[16] = `COALESCE(${arColsSel[16]}, 0) NRPESO`;

        arColsSel[17] = `TO_CHAR(${arColsSel[17]}, 'DD/MM/YYYY HH24:MI') DTEMICTR`;

        arColsSel[18] += ' IDCTEANT';
        arColsSel[19] += ' CDCTRANT';
        arColsSel[20] += ' NRCHAANT';

        arColsSel[21] = `COALESCE(${arColsSel[21]}, 0) PSFRTANT`;
        arColsSel[22] = `COALESCE(${arColsSel[22]}, 0) VRTTFANT`;
        arColsSel[23] = `COALESCE(${arColsSel[23]}, 0) VRMERANT`;

        arColsSel[24] = `COALESCE(${arColsSel[24]}, 0) VRFRTANT`;
        arColsSel[25] = `COALESCE(${arColsSel[25]}, 0) VRPDGANT`;
        arColsSel[26] = `COALESCE(${arColsSel[26]}, 0) VROUTANT`;

        arColsSel[27] = `COALESCE(${arColsSel[27]}, 0) PCICMANT`;
        arColsSel[28] = `COALESCE(${arColsSel[28]}, 0) VRBASANT`;
        arColsSel[29] = `COALESCE(${arColsSel[29]}, 0) VRICMANT`;

        arColsSel[30] = `COALESCE(${arColsSel[30]}, 0) NRPESANT`;

        arColsSel[31] = `TO_CHAR(${arColsSel[31]}, 'DD/MM/YYYY HH24:MI') DTEMIANT`;

        arColsSel[32] = `UPPER(${arColsSel[32]}) NMCIDORI`;
        arColsSel[33] = `UPPER(${arColsSel[33]}) NMCIDDES`;

        arColsSel[34] += ' NMEMITEN';
        arColsSel[35] += ' CJEMITEN';
        arColsSel[36] += ' IEEMITEN';
        arColsSel[37] += ' NMLOGEMI';
        arColsSel[38] += ' NRENDEMI';
        arColsSel[39] += ' NRBAIEMI';
        arColsSel[40] += ' NRCEPEMI';

        arColsSel[41] = `UPPER(${arColsSel[41]}) NMMUNEMI`;
        arColsSel[42] += ' CDESTEMI';

        arColsSel[43] += ' NMEMIANT';
        arColsSel[44] += ' CJEMIANT';
        arColsSel[45] += ' IEAMIANT';

        arColsSel[46] += ' UFEMIANT';

        arColsSel[47] += ' NMREMETE';
        arColsSel[48] += ' CJREMETE';
        arColsSel[49] += ' IEREMETE';
        arColsSel[50] += ' NMLOGREM';
        arColsSel[51] += ' NRENDREM';
        arColsSel[52] += ' NMBAIREM';
        arColsSel[53] += ' NRCEPREM';

        arColsSel[54] = `UPPER(${arColsSel[54]}) NMMUNREM`;
        arColsSel[55] += ' CDESTREM';

        arColsSel[56] += ' NMDESTIN';
        arColsSel[57] += ' CJDESTIN';
        arColsSel[58] += ' IEDESTIN';
        arColsSel[59] += ' NMLOGDES';
        arColsSel[60] += ' NRRENDES';
        arColsSel[61] += ' NMBAIDES';
        arColsSel[62] += ' NRCEPDES';

        arColsSel[63] = `UPPER(${arColsSel[63]}) NMMUNDES`;
        arColsSel[64] += ' CDESTDES';

        arColsSel[65] += ' NMTOMADO';
        arColsSel[66] += ' CJTOMADO';
        arColsSel[67] += ' IETOMADO';
        arColsSel[68] += ' NMLOGTOM';
        arColsSel[69] += ' NRENDTOM';
        arColsSel[70] += ' NMBAITOM';
        arColsSel[71] += ' NRCEPTOM';

        arColsSel[72] = `UPPER(${arColsSel[72]}) NMMUNTOM`;
        arColsSel[73] += ' CDESTOM';

        arColsSel[74] += ' NMEXPEDI';
        arColsSel[75] += ' CJEXPEDI';
        arColsSel[76] += ' IEEXPEDI';
        arColsSel[77] += ' NMLOGEXP';
        arColsSel[78] += ' NRENDEXP';
        arColsSel[79] += ' NMBAIEXP';
        arColsSel[80] += ' NRCEPEXP';

        arColsSel[81] = `UPPER(${arColsSel[81]}) NMMUNEXP`;
        arColsSel[82] += ' CDESTEXP';

        arColsSel[83] += ' NMRECEBE';
        arColsSel[84] += ' CJRECEBE';
        arColsSel[85] += ' IERECEBE';
        arColsSel[86] += ' NMLOGREC';
        arColsSel[87] += ' NRENDREC';
        arColsSel[88] += ' NMBAIREC';
        arColsSel[89] += ' NRCEPREC';
        arColsSel[98] += ' TPTRANSP';


        arColsSel[90] = `UPPER(${arColsSel[90]}) NMMUNREC`;
        arColsSel[91] += ' CDESTREC';

        arColsSel[97] = `UPPER(${arColsSel[97]}) DSTIPVEI`;


        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        var sql =
            `SELECT
                    ${arColsSel.join()}
                ,   COUNT(*) OVER()     COUNT_LINHA


            FROM G051 -- CTE

            INNER JOIN G024 -- EMITENTE / TRANSPORTADOR
                ON G024.IDG024 = G051.IDG024
                AND G051.STCTRC <> 'C'

            INNER JOIN G003 G003EM -- CIDADE EMITENTE
                ON G003EM.IDG003 = G024.IDG003

            INNER JOIN G002 G002EM -- ESTADO EMITENTE
                ON G002EM.IDG002 = G003EM.IDG002

            INNER JOIN G005 G005RE -- REMETENTE
                ON G005RE.IDG005 = G051.IDG005RE

            INNER JOIN G003 G003RE  -- CIDADE REMETENTE
                ON G003RE.IDG003 = G005RE.IDG003

            INNER JOIN G002 G002RE  -- ESTADO REMETENTE
                ON G002RE.IDG002 = G003RE.IDG002

            INNER JOIN G005 G005DE -- DESTINATARIO
                ON G005DE.IDG005 = G051.IDG005DE

            INNER JOIN G003 G003DE  -- CIDADE DESTINATÁRIO
                ON G003DE.IDG003 = G005DE.IDG003

            INNER JOIN G002 G002DE  -- ESTADO DESTINATÁRIO
                ON G002DE.IDG002 = G003DE.IDG002

            INNER JOIN G005 G005CO -- CONSIGNATARIO / TOMADOR
                ON G005CO.IDG005 = G051.IDG005CO

            INNER JOIN G003 G003CO -- CIDADE TOMADOR
                ON G003CO.IDG003 = G005CO.IDG003

            INNER JOIN G002 G002CO -- ESTADO TOMADOR
                ON G002CO.IDG002 = G003CO.IDG002

            INNER JOIN G005 G005EX -- EXPEDIDOR
                ON G005EX.IDG005 = G051.IDG005EX

            INNER JOIN G003 G003EX -- CIDADE EXPEDIDOR
                ON G003EX.IDG003 = G005EX.IDG003

            INNER JOIN G002 G002EX -- ESTADO EXPEDIDOR
                ON G002EX.IDG002 = G003EX.IDG002

            INNER JOIN G005 G005RC -- RECEBEDOR
                ON G005RC.IDG005 = G051.IDG005RC

            INNER JOIN G003 G003RC -- CIDADE RECEBEDOR
                ON G003RC.IDG003 = G005RC.IDG003

            INNER JOIN G002 G002RC -- ESTADO RECEBEDOR
                ON G002RC.IDG002 = G003RC.IDG002

            INNER JOIN G064 -- CTE x CTE REF
                ON G064.IDG051AT = G051.IDG051

            INNER JOIN G051 G051AN
                ON G051AN.IDG051 = G064.IDG051AN
                AND G051AN.SNDELETE = 0
                AND G051AN.STCTRC <> 'C'

            INNER JOIN G024 G024AN
                ON G024AN.IDG024 = G051AN.IDG024

            INNER JOIN G003 G003EA -- CIDADE EMITENTE ANTERIOR
                ON G003EA.IDG003 = G024AN.IDG003

            INNER JOIN G002 G002EA -- ESTADO EMITENTE ANTERIOR
                ON G002EA.IDG002 = G003EA.IDG002

            INNER JOIN G049 -- CTE x ETAPA
                ON G049.IDG051 = G051AN.IDG051

            INNER JOIN G048 -- ETAPA
                ON G048.IDG048 = G049.IDG048

            INNER JOIN G046 -- CARGA
                ON G046.IDG046 = G048.IDG046
                AND G046.SNDELETE = 0
                AND G046.STCARGA <> 'C'

            INNER JOIN G030 -- TIPO DE VEÍCULO
                ON G030.IDG030 = G046.IDG030

             ${sqlWhere}

             GROUP BY
                ${arCols.join()}

             ${sqlOrder} ${sqlPaginate}`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        var parm = { sql, bindValues };

        var objResult = await gdao.executar(parm, res, next).catch((err) => { throw err });

        return utils.construirObjetoRetornoBD(objResult);

    }

    //-----------------------------------------------------------------------\\
    /**
    * @description Lista as ocorrências encontradas na importação do XML
    * @function listarOcorrencias
    * @author Rafael Delfino Calzado
    * @since 14/06/2018
    *
    * @async
    * @returns {Array} Array com resultado da pesquisa
    * @throws  {Object} Objeto descrevendo o erro
    */
    //-----------------------------------------------------------------------\\

    api.listarOcorrencias = async function (req, res, next) {

        req.sql =
            `SELECT
                    I016.IDI016
                ,	I016.NMCAMPO
                ,	I016.OBOCORRE
                ,   I016.NRCHADOC
                , 	TO_CHAR(I016.DTCADAST, 'DD/MM/YYYY HH24:MI:SS') DTCADAST

                ,	I009.IDI009
                ,	I009.DSOCORRE

            FROM I016 -- OCORRENCIAS CTe

            INNER JOIN I009 -- TIPO DE OCORRENCIA
                ON I009.IDI009 = I016.IDI009

            WHERE I016.SNDELETE = 0

            ORDER BY I016.DTCADAST DESC, I016.NRCHADOC`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\\

        return await gdao.executar(req, res, next).catch((err) => { throw err });

    }

    //-----------------------------------------------------------------------\\

    return api;
}
