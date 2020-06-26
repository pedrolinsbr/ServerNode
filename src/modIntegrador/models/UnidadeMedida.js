/**
 * @description Possui modelos e informações referentes a processamentos de informações de cada modelo 
 * @author João Eduardo Saad
 * @since 31/10/2017
 * @return {array} Retorna um array de funções.
*/

const Joi = require('joi');


/**
 * @description Esquema para validações de campos de entrada.
 *  
 * @function model/UnidadeMedida/joiSchema
 * @return {JSON} Retorna um objeto JSON.
*/
//PS : todos os campos contidos no objeto JSON de entrada, devem estar descritos 
module.exports.joiSchema = Joi.object().keys({
        IDG009: Joi.label("Id do Usuário"),
        CDUNIDAD: Joi.string().max(3).required().label("Código da Unidade"),
        DSUNIDAD: Joi.string().min(3).max(20).required().label("Descrição da Unidade"),
        STCADAST: Joi.string().min(1).max(1).required().uppercase().label("Status do Cadastro"),
        IDS001 : Joi.number().min(1).required().label("Identificador do Usuário"), //validação de id de usuario
        DTCADAST: Joi.label("Data do Cadastro"),
        NMUSUARI : Joi.label("Nome do Usuário")
      });
