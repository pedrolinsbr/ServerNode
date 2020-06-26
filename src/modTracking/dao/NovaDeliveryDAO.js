module.exports = function (app, cb) {
	const db = app.config.database;
  const fs = require('fs');
  

  var api = {};

  //-----------------------------------------------------------------------\\  

  /**
     * @description responde a requisição da datagrid
     *
     * @function listaLogQm            
     * @param   {Object} req    
     * @param   {Object} req.body    
     *
     * @returns {Object} retorno padrão p/ datagrid
     * @throws  {status(500)} Exceção não tratada
     *
     * @author Igor Pereira da Silva
     * @since 21/06/2018
     *
     */
  api.buscarEntrega = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT 
                  CARGA.IDG046 		  IDCARGA
                ,	CARGA.SNCARPAR		SNPARCIAL
                ,	CARGA.VRPOROCU		VROCUPA
                ,	TO_CHAR(CARGA.DTAGENDA, 'DD/MM/YYYY HH24:MI') 	DTAGENDA		
                ,	TO_CHAR(CARGA.DTSAICAR, 'DD/MM/YYYY HH24:MI') 	DTSAICAR		
            
                ,	TRANS.NMTRANSP		NMTRANSP
      
                , TO_CHAR(HORARIO.HOINICIO, 'DD/MM/YYYY HH24:MI') DTCOLETA

                , VEICULO.IDTIPVEI	IDVEICULO
      
                ,	HORACERTA.NRPLAVEI	NRPLACA		
                
                , PARADA.QTVOLCAR		VRVOLUME
                ,	PARADA.QTDISPER		QTDISTAN
                /*,	TO_CHAR(PARADA.DTFINETA, 'DD/MM/YYYY HH24:MI') 	DTPLAN*/
                , TO_CHAR(DH.DTENTCON, 'DD/MM/YYYY HH24:MI')  DTPLAN
                , DH.IDG043
            
                ,	REM.NMCLIENT		NMREMETE
                ,	DEST.NMCLIENT		NMDEST		
                
                ,	DH.CDDELIVE			CDDELIVE
                ,	DH.PSBRUTO			PSBRUTO				
                ,	TO_CHAR(DH.DTENTREG, 'DD/MM/YYYY HH24:MI') 	DTENTREGDEL
                , CARGA.IDG046
                , PARADA.IDG048
                , PARADA.NRSEQETA
        
              FROM G046 CARGA
              
              INNER JOIN G024 TRANS
                ON TRANS.IDG024 = CARGA.IDG024
              
              INNER JOIN H006 HORACERTA
                ON HORACERTA.IDG046 = CARGA.IDG046	
              
              INNER JOIN H007 HORARIO
                ON HORARIO.IDH006 = HORACERTA.IDH006	
                
              INNER JOIN I011 VEICULO
                ON VEICULO.IDG030 = HORACERTA.IDG030
                
              INNER JOIN G048 PARADA
                ON PARADA.IDG046 = CARGA.IDG046
                
              INNER JOIN G049 RELDELIVE
                ON RELDELIVE.IDG048 = PARADA.IDG048
                
              INNER JOIN G043 DH
                ON DH.IDG043 = RELDELIVE.IDG043
                
              INNER JOIN G005 REM
                ON REM.IDG005 = DH.IDG005RE 
                
              INNER JOIN G005 DEST 
                ON DEST.IDG005 = DH.IDG005DE	
              WHERE 
                DH.SNDELETE = 0
                AND DH.IDG043 = ${req.params.id}`,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\

  api.buscarMedida = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT IDG009 ID FROM G009 WHERE CDUNIDAD = '${req}'`,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\

  api.buscarRemetente = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT 
                  G005.IDG005 ID
                , G005.IDG003 IDCIDADE
                , G022.IDEMPOPE NRSELLER                 
              FROM G005 
              INNER JOIN G022 ON G022.IDG005 = G005.IDG005
              WHERE G022.IDG014 = ${req.cdOperacao} 
              AND G022.DSSHIPOI = '${req.cdFilial}'`,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\  
  
  api.buscarDestinatario = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT 
                  G005.IDG005 ID
                , G005.IDG003 IDCIDADE
                , G005.CJCLIENT
                , G005.IECLIENT 

              FROM G005
              
              WHERE G005.SNDELETE = 0 
              AND G005.CJCLIENT = '${req.nrCNPJ}' 
              AND G005.IECLIENT = '${req.nrIE}'`,
        param: []
      })

      .then((result) => {        
        return result;
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\
  
  api.buscarProduto = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT
                  G010.IDG010 ID,
                  G010.DSPRODUT,
                  G010.DSREFFAB,
                  G010.SNDELETE,
                  G022.IDG005

                FROM G010 --PRODUTO

                INNER JOIN G014 --OPERACAO
                  ON G014.IDG014 = G010.IDG014

                INNER JOIN G022 --ALIAS DE CLIENTE
                  ON G022.IDG014 = G014.IDG014

                INNER JOIN G016 --EMBPRODUTO
                  ON G016.IDG010 = G010.IDG010
                  AND G016.SNEMBPAD = 1

                INNER JOIN G011 --EMBALAGEM
                  ON G011.IDG011 = G016.IDG011

                INNER JOIN G013 --CONVERSAO
                  ON G013.IDG010 = G016.IDG010
                  AND G013.IDG009DE = G011.IDG009                  

                WHERE G010.SNDELETE = 0
                  AND G010.DSREFFAB = '${req.cdItem}'
                  AND G022.IDG005 = ${req.idRemetente}`,
        param: []
      })

      .then((result) => {
        return (result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\

  api.buscarDelivery = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT
									IDG043 ID
								, STETAPA
                , STULTETA
                , STDELIVE
								, SNLIBROT
								, IDG005RE
								, IDG005DE
								, VRVOLUME
								, VRDELIVE
								, PSBRUTO
								, PSLIQUID
							FROM G043 WHERE CDDELIVE = '${req}' AND SNDELETE = 0`,
        param: []
      })
      .then((result) => {
        return (result);
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\

	api.buscarDiasSLA = async function (req, res, next) {
		return await db.execute(
			{
        sql: `SELECT QTDIAENT, QTDIACOL FROM G053 WHERE SNDELETE = 0 
              AND IDG014 = ${req.cdOperacao}
              AND IDG003OR = ${req.idOrigem} 
              AND IDG003DE = ${req.idDestino}`,
				param: []
			})

			.then((result) => {
				return result;
			})

			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\

  api.registraImportacao = async function (req, res, next) {
    var file = fs.statSync(`${req.dir}${req.filename}`);

    return await db.insert(
      {
        tabela: 'I012',
        colunas: {
            NMARQUIV: req.filename
          , TPARQUIV: "D"
          , QTTAMARQ: file.size
          , DTCADAST: file.ctime
        },
        key: 'IDI012'
      })

      .then((result) => {
        return result;
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

  //-----------------------------------------------------------------------\\
  
	api.removerImportacao = async function (req, res, next) {
		await db.execute(
			{
				sql: `DELETE FROM I012 WHERE NMARQUIV = '${req}'`,
				param: []
			})

			.catch((err) => {
				err.stack = new Error().stack + `\r\n` + err.stack;
				throw err;
			});
	}

	//-----------------------------------------------------------------------\\	  

  api.buscarImportacao = async function (req, res, next) {
    return await db.execute(
      {
        sql: `SELECT IDI012
								,   NMARQUIV
								,   QTTAMARQ
								,   TO_CHAR(DTCADAST, 'DD/MM/YYYY HH24:MI:SS') DTCADAST
								FROM I012
								WHERE TPARQUIV = 'D'`,
        param: []
      })

      .then((result) => {
        return result;
      })

      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
  }

	//-----------------------------------------------------------------------\\
 

  //-----------------------------------------------------------------------\\

  return api;
}
