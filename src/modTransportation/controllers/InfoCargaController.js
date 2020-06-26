module.exports = function (app) {

    var api = {};
    var dao = app.src.modTransportation.dao.InfoCargaDAO;

    api.getInformacoesCargaCompletaSemAcl = async function (req, res, next) {
        let controller = req.body;

        let infoCarga          = null;
        let infoParadas        = null;
        let infoCTE            = null;
        let infoNFE            = null;
        let infoNFE_AUX        = null;
        let infoAtendimento    = null;
        let infoRestricoes     = null;
        
        if (controller.G046) {
            infoCarga = await dao.getInformacoesCargaSemAcl(req, res, next)
            .then((result1) => {
                return result1;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
        }    
        
        if (controller.G048 && controller.G048) {
            infoParadas = await dao.getParadasFromCargaSemAcl(req, res, next)
            .then((result1) => {
                return result1;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
        }


        if(controller.IDG046){
            infoRestricoes = await dao.getInformacoesRestricoesCarga(req, res, next)
            .then((res) => {
                return res;
            })
            .catch((err) => {
                err.stack = new Error().stack + `\r\n` + err.stack;
                next(err);
            });
        }

        let retorno = {};
                
        retorno =
        {
            'G046':     (controller.IDG046    ? infoCarga         : null),
            'G048':     (controller.G048      ? infoParadas       : null),
            'G051':     (controller.G051      ? infoCTE           : null),
            'G043':     (controller.G043      ? infoNFE           : null),
            'G043_AUX': (controller.G043_AUX  ? infoNFE_AUX       : null),
            'A001':     (controller.A001      ? infoAtendimento   : null),
            'T004':     (controller.IDG046    ? infoRestricoes    : null)
        };
        
        res.json(retorno);
    }

    api.getGrid = async function (req, res, next) {
		await dao.getGrid(req, res, next)
			.then((result) => {
				res.json(result);
			})
			.catch((err) => {
				next(err);
			});
	};



    

    return api;
};