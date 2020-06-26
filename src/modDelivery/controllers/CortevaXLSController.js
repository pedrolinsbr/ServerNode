module.exports = function (app, cb) {

    const xls = require('xlsx');    
    const dirXLS = '../xml/corteva/delivery/xls/'

    const mdl = app.src.modDelivery.models.CortevaXLSModel;

    var api = {};

    //-----------------------------------------------------------------------\\    

    api.readXLS = function (req, res, next) {

        var file = 'dow.xlsx';

        var workbook = xls.readFile(`${dirXLS}${file}`);             
        var worksheet  = workbook.Sheets[workbook.SheetNames[0]];
        var arJSON     = xls.utils.sheet_to_json(worksheet);
        var ttReg      = arJSON.length;

        var arRead = [];
        var i = 0;        

        while (i < ttReg) {

            var objRead   = this.buildHeader(arJSON[i]);
            var objVerify = Object.assign({}, objRead);

            objVerify.CDDELIVE = objRead.CDDELIVE;
            var cdDelivery = objVerify.CDDELIVE;

            while ((i < ttReg) && (objVerify.CDDELIVE == cdDelivery)) {
                            
                var objItem = this.buildItem(arJSON[i]);
                
                objRead.UNPESO    = objItem.UNPESO;
                objRead.VRDELIVE += parseFloat(objItem.VRDELIVE);
                objRead.PSBRUTO  += parseFloat(objItem.PSBRUTO);
                objRead.PSLIQUID += parseFloat(objItem.PSLIQUID);

                objRead.item.push(objItem);
                
                i++;

                if (i < ttReg) objVerify = this.buildHeader(arJSON[i]);

            }

            arRead.push(objRead);

        }

        return arRead;

    }

    //-----------------------------------------------------------------------\\

    api.buildHeader = function (objJSON) {

        var arFields     = mdl.header;
        var objRead      = {};

        objRead.VRDELIVE = 0;
        objRead.PSBRUTO  = 0;
        objRead.PSLIQUID = 0;

        for (var objModel of arFields) 
            objRead[objModel.nmCampo] = objJSON[objModel.nmColunaXLS]; 

        objRead.item = [];

        return objRead;

    }

    //-----------------------------------------------------------------------\\

    api.buildItem = function (objJSON) {

        var arFields = mdl.item;
        var objRead  = {};

        for (var objModel of arFields) 
            objRead[objModel.nmCampo] = objJSON[objModel.nmColunaXLS]; 

        objRead.VRUNIPRO = objRead.VRDELIVE;

        var objLote  = { QTPRODUT: objRead.QTPRODUT, DSLOTE: `L${objRead.NRORDITE}` };
        objRead.lote = [objLote];

        return objRead;

    }

    //-----------------------------------------------------------------------\\

    return api;

}