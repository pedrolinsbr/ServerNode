module.exports = function (app, cb) {

    const pod = app.src.modDocSyn.controllers.PODController;
    const ctl = app.src.modOferece.controllers.ViagemController;
    const dao = app.src.modDelivery.dao.CargaDAO;
    
    var api = {};

    //-----------------------------------------------------------------------\\ 

    api.montarObjCarga = function (objDados, res, next) {

        var objCarga  = {};
        var objEtapa  = {};
        var objPedido = {};

        objCarga.IDS001     = objDados.IDS001;
        objCarga.IDG024     = objDados.IDG024;
        objCarga.IDG028     = objDados.IDG028;
        objCarga.IDG030     = objDados.IDG030;
        objCarga.IDG031M1   = objDados.IDG031M1;
        objCarga.IDG031M2   = objDados.IDG031M2;
        objCarga.IDG031M3   = objDados.IDG031M3;
        objCarga.IDG032V1   = objDados.IDG032V1;
        objCarga.IDG032V2   = objDados.IDG032V2;
        objCarga.IDG032V3   = objDados.IDG032V3;
        objCarga.CDVIAOTI   = objDados.CDVIAOTI;
        objCarga.TPCARGA    = objDados.TPCARGA;
        objCarga.QTDISPER   = objDados.QTDISPER;
        objCarga.QTVOLCAR   = objDados.QTVOLCAR;
        objCarga.VRPOROCU   = objDados.VRPOROCU;
        objCarga.VRCARGA    = objDados.VRCARGA;
        objCarga.PSCARGA    = objDados.PSCARGA;
        objCarga.DSCARGA    = objDados.DSCARGA;
        objCarga.TPORIGEM   = objDados.TPORIGEM;
        objCarga.TPMODCAR   = objDados.TPMODCAR;
        objCarga.SNCARPAR   = objDados.SNCARPAR;
        objCarga.SNESCOLT   = (objDados.SNESCOLT) ? objDados.SNESCOLT : 'N';
        objCarga.STCARGA    = 'D'; //'T';           //objDados.STCARGA;
        objCarga.TPTRANSP   = 'D';                  //objDados.TPTRANSP;
        objCarga.DTCOLORI   = objDados.DTPRESAI;    //objDados.DTCOLORI;
        objCarga.DTCOLATU   = objDados.DTCOLATU;
        objCarga.DTPRESAI   = objDados.DTPRESAI;
        objCarga.DTSAICAR   = objDados.DTSAICAR;
        objCarga.DTCARGA    = objDados.DTCARGA;
        objCarga.DTAGENDA   = objDados.DTAGENDA;
        objCarga.etapa      = [];
        
        objEtapa.IDG005OR   = objDados.IDG005OR;
        objEtapa.IDG005DE   = objDados.IDG005DE;
        objEtapa.STINTCLI   = 1;                    //objDados.STINCLI;
        objEtapa.STINTINV   = 0;                    //objDados.STININV;
        objEtapa.NRSEQETA   = objDados.NRSEQETA;
        objEtapa.PSDELETA   = objDados.PSDELETA;
        objEtapa.QTVOLCAR   = objDados.QTVOLCAR;
        objEtapa.QTDISPER   = objDados.QTDISPER;
        objEtapa.QTDISTOD   = objDados.QTDISTOD;
        objEtapa.DTINIETA   = objDados.DTINIETA;
        objEtapa.DTFINETA   = objDados.DTFINETA;
        objEtapa.DTPREORI   = objDados.DTPREORI;
        objEtapa.DTPREATU   = objDados.DTPREATU;
      //objEtapa.DTENTCON   = objDados.DTENTCON;
        objEtapa.pedido     = [];

        objPedido.NRORDEM   = objDados.NRORDEM;
        objPedido.IDG043    = 0;

        objEtapa.pedido.push(objPedido);
        objCarga.etapa.push(objEtapa);

        return objCarga;

    }

    //-----------------------------------------------------------------------\\ 

    api.insereCarga = async function (parm, res, next) {

        try {

            var objResult = await ctl.insereViagens(parm, res, next);
            objResult.blOK = ((objResult.arOcorre.length == 0) && (objResult.arID.length == 1));
    
            if (objResult.blOK) {
    
                parm.IDG046 = objResult.IDG046 = objResult.arID[0];
                await dao.atualizaCargaCTE(parm, res, next);
    
            }
    
            return objResult;    

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    api.geraCanhoto = async function (req, res, next) {

        try {

            var parm = { objConn: req.objConn };
            parm.PODOrigem  = `${req.IDG043RF}.pdf`;
			parm.PODDestino = `${req.IDG043}.pdf`;

            await pod.copyPOD(parm, res, next);

            return await pod.generatePOD(req, res, next);

        } catch (err) {

            throw err;

        }

    }

    //-----------------------------------------------------------------------\\ 

    return api;
}
