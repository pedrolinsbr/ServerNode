module.exports = function (app, cb) {

    var api = {};

    const tmz = app.src.utils.DataAtual;
    const ctl = app.src.modGlobal.controllers.GenericController;
    const mdl = app.src.modOferece.models.TipoVeiculoModel;

    var objModel = mdl['G030'];

    //-----------------------------------------------------------------------\\

    api.lista = async function (req, res, next) {

        req.objModel = objModel;
        
        await ctl.lista(req, res, next)    
        .then((result) => {
            // if (result.data.length > 0) {
            //     for (var i in result.data) 
            //         result.data[i].QTCAPVOL = result.data[i].QTCAPVOL.toFixed(2);
            // }

            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    api.edita = async function (req, res, next) {

        req.objModel = objModel;
        
        await ctl.edita(req, res, next)    
        .then((result) => {
            if (result.length > 0)
                result[0].QTCAPVOL = result[0].QTCAPVOL.toFixed(2);

            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\   

    api.insere = async function (req, res, next) {

        req.objModel = objModel;

        req.body.IDVEIOTI = req.body.IDVEIOTI == '' ? null : req.body.IDVEIOTI;
        req.body.DTCADAST = tmz.dataAtualJS();

        await ctl.insere(req, res, next)
        .then ((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\

    api.altera = async function (req, res, next) {

        req.objModel = objModel;

        await ctl.altera(req, res, next)
        .then ((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\    

    api.exclui = async function (req, res, next) {

        req.objModel = objModel;

        await ctl.exclui(req, res, next)
        .then ((result) => {
            res.status(200).send(result);
        });
    }

    //-----------------------------------------------------------------------\\        

    api.remove = async function (req, res, next) {
        
        req.objModel = objModel;

        await ctl.remove(req, res, next)
        .then((result) => { 
            res.status(200).send(result); 
        });
    }

    //-----------------------------------------------------------------------\\ 

    return api;
}
