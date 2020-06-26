module.exports = function (app, cb) {

    const joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.G097 = {

        table: 'G097',
        key: ['IDG097'],
        vlKey: {},
        vlFields: {},

        columns: {
            IDG097:     joi.number().integer().label('ID Tabela'),
            IDGRUPO:    joi.number().integer().default(5).label('ID Grupo'),
            IDKEY:      joi.number().integer().label('ID Key'),
            DSVALUE:    joi.string().required().max(250).label('Descrição Campo'),
            SNDELETE:   joi.number().integer().min(0).max(1).default(0).label('Soft Delete')
        }

    }


    //-----------------------------------------------------------------------\\

    objSchema.G102 = {

        table: 'G102',
        key: ['IDG005', 'IDG097'],
        vlKey: {},
        vlFields: {},

        columns: {
            IDG005:     joi.number().integer().required().label('ID Cliente Especial'),
            IDG097:     joi.array().min(0).required().items(
                             joi.number().integer().label('ID Exigências')
                         ).label('Array de Exigências')
        }

    }

    //-----------------------------------------------------------------------\\

    return objSchema;

}
