module.exports = function (app, cb) {

    const Joi = require('joi');
    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.cancelaDelivery = {
        
        columns: {
            
            delivery:   Joi.array().min(1).items(

                Joi.object().keys({ 

                    CDDELIVE:   Joi.string().regex(/^^\D{1}\d{10}$$/).required().label('Código da Delivery'),
                    NRORDITE:   Joi.array().min(1).items(
                        Joi.number().integer().min(1).required().label('Ordem do Item')
                    )        

                })

            ).required().label('Array de Deliveries')

        }
        
    }

    //-----------------------------------------------------------------------\\

    return objSchema;
}
