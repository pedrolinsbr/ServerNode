/**
 * @description Possui funções de validação gerais
 * @author João Eduardo Saad
 * @since 1/11/2017
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Retorna um objeto JSON.
*/

//Importações
const Joi = require('joi');

module.exports = function (app, cb) {

    var fn = {};
    /**
    * @author João Eduardo Saad
    * @since 31/10/2017
    * @description Função para construção do objeto de retorno para construção do datagrid no front-end
    * @function fn/validarInputField
    * @param {JSON} objResultDB - Possui um objeto com os dados retornados pelo DAO .
    * @return {JSON} Retorna um objeto JSON.
    **/

    fn.validarInputField = function (res, objJSON, objModelo, next) {
        //PS : todos os campos contidos no objeto JSON de entrada, devem estar descritos 
        const result = Joi.validate(objJSON, objModelo.joiSchema, {
            abortEarly: false,
            convert: false,
            language: {
                any: {
                    unknown: 'não é permitido!',
                    invalid: 'contém um valor inválido!',
                    empty: 'não é permitido estar vazio!',
                    required: 'é necessário!',
                    allowOnly: 'deve ser um dos valores a seguir: {{valids}} !',
                    default: 'demonstrou um erro ao rodar o método padrão!'
                },
                array: {
                    base: 'deve ser um array !',
                    includes: 'na posição {{pos}} não combina com nenhum dos tipos permitidos!',
                    includesSingle: 'valor unitário de "{{!label}}" não combina com nenhum dos tipos permitidos!',
                    includesOne: 'na posição {{pos}} houve falha pois {{reason}}',
                    includesOneSingle: 'valor unitário de "{{!label}}" falhou pois {{reason}}',
                    includesRequiredUnknowns: 'não contém {{unknownMisses}} os valores necessários',
                    includesRequiredKnowns: 'não contém {{knownMisses}}',
                    includesRequiredBoth: 'não contém {{knownMisses}} e {{unknownMisses}} outros valores necessários',
                    excludes: 'na posição {{pos}} contém um valor excluído da lista de permitidos!',
                    excludesSingle: 'valor unitário de "{{!label}}" contém um valor excluído da lista de permitidos!',
                    min: 'deve conter ao menos {{limit}} itens',
                    max: 'deve conter menos ou quantidade menor que {{limit}} items',
                    length: 'deve conter {{limit}} itens',
                    ordered: 'na posição {{pos}} falhou pois {{reason}}',
                    orderedLength: 'na posição {{pos}} falhou pois o array deve conter ao menos {{limit}} itens',
                    ref: 'referência "{{ref}}" que não é um inteiro positivo',
                    unique: 'posição {{pos}} contém um valor duplicado'
                },
                alternatives: {
                    base: 'não é igual a nenhuma das alteranativas permitidas!',
                    child: null
                },
                boolean: {
                    base: 'deve ser um boleano!'
                },
                binary: {
                    base: 'deve ser um buffer ou uma string',
                    min: 'deve conter ao menos {{limit}} bytes',
                    max: 'deve ser menor ou igual à {{limit}} bytes',
                    length: 'deve ser {{limit}} bytes'
                },
                 date: {
                    base: 'deve ser um número de milisegundos ou uma string válida',
                    format: 'deve ser uma string com um dos formatos a seguir {{format}}',
                    strict: 'deve ser uma data válida',
                    min: 'deve ser maior ou igual a"{{limit}}"',
                    max: 'deve ser menor ou igual a "{{limit}}"',
                    isoDate: 'deve ser uma data compatível com o formato de datas ISO 8601 ',
                    timestamp: {
                        javascript: 'deve ser um timestamp válido ou um número em milisegundos',
                        unix: 'deve ser um timestamp válido ou um número em segundos'
                    },
                    ref: 'referência  "{{ref}}" não é uma data '
                },
                function: {
                    base: 'deve ser uma função',
                    arity: 'deve ser um ariete de {{n}}',
                    minArity: 'deve ser um ariete maior ou igual a {{n}}',
                    maxArity: 'deve ser um ariete menor ou igual a {{n}}',
                    ref: 'deve ser uma referência Joi',
                    class: 'deve ser uma classe'
                },
                lazy: {
                    base: '!!erro de schema: um schema deve ser informado',
                    schema: '!!erro de schema: uma função do tipo schema deve ser retornada'
                },
                object: {
                    base: 'deve ser um objeto',
                    child: '!!filho "{{!child}}" falhou pois {{reason}}',
                    min: 'deve ter ao menos {{limit}} filho(s)',
                    max: 'deve ser menor ou igual a {{limit}} filho(s)',
                    length: 'deve ter {{limit}} filho(s)',
                    allowUnknown: '!!"{{!child}}" não é permitido',
                    with: '!!"{{mainWithLabel}}" está faltando seu par requerido "{{peerWithLabel}}"',
                    without: '!!"{{mainWithLabel}}" conflito par proibido "{{peerWithLabel}}"',
                    missing: 'deve conter ao menos um dos {{peersWithLabels}}',
                    xor: 'contém um conflito de pares exclusivos {{peersWithLabels}}',
                    or: 'deve conter ao menos um dos {{peersWithLabels}}',
                    and: 'contém {{presentWithLabels}} sem um dos seus pares requeridos {{missingWithLabels}}',
                    nand: '!!"{{mainWithLabel}}" não deve existir simultaneamente com {{peersWithLabels}}',
                    assert: '!!"{{ref}}" validação falhou pois "{{ref}}" falha: {{message}}',
                    rename: {
                        multiple: 'não é possivel renomear filho "{{from}}" pois múltiplas renomeações estão desativadas e outra chave ja foi renomeada para "{{to}}"',
                        override: 'não é possivel renomear filho "{{from}}" pois sobreinscrição está desativada e alvo "{{to}}" existe',
                        regex: {
                            multiple: 'não é possivel renomear filho(s) "{{from}}" pois múltiplas renomeações estão desativadas e outra chave já foi renomeada para "{{to}}"',
                            override: 'não é possivel renomear filho(s) "{{from}}" pois sobreinscrição está desativada e alvo "{{to}}" existe'
                        }
                    },
                    type: 'deve ser uma instância de"{{type}}"',
                    schema: 'deve ser uma instância Joi'
                },
                number: {
                    base: 'deve ser um número',
                    min: 'deve ser maior ou igual a {{limit}}',
                    max: 'deve ser menor ou igual a {{limit}}',
                    less: 'deve menor que {{limit}}',
                    greater: 'deve maior que {{limit}}',
                    float: 'deve ser um flutuante ou do tipo double',
                    integer: 'deve ser um inteiro',
                    negative: 'deve ser um número negativo',
                    positive: 'deve ser um número positivo',
                    precision: 'não deve ter mais que {{limit}} casas decimais',
                    ref: 'referência "{{ref}}" que não é um número',
                    multiple: 'deve ser um múltiplo de {{multiple}}'
                },
                string: {
                    base: 'deve ser uma string',
                    min: 'tamanho deve ser ao menos {{limit}} caracteres',
                    max: 'tamanho deve ser menor que ou igual a {{limit}} caracteres',
                    length: 'tamanho deve ser {{limit}} caracteres',
                    alphanum: 'deve conter somente caracteres alfanuméricos',
                    token: 'deve conter somente caracteres alfanuméricos e sublinhados',
                    regex: {
                        base: 'with value "{{!value}}" fails to match the required pattern: {{pattern}}',
                        name: 'with value "{{!value}}" fails to match the {{name}} pattern',
                        invert: {
                            base: 'with value "{{!value}}" matches the inverted pattern: {{pattern}}',
                            name: 'with value "{{!value}}" matches the inverted {{name}} pattern'
                        }
                    },
                    email: 'deve ser um email válido',
                    uri: 'deve ser uma uri válida',
                    uriRelativeOnly: 'deve ser uma uri relativa válida',
                    uriCustomScheme: 'deve ser uma uri válida com schema correspondente de {{scheme}} como padrão',
                    isoDate: 'deve ser uma data de ISO 8601 válida',
                    guid: 'deve ser uma GUID válida',
                    hex: 'deve conter somente caracteres hexadecimais',
                    base64: 'deve ser uma string de base64 válida',
                    hostname: 'deve ser um hostname válido',
                    normalize: 'deve ser unicode normalizado no formulário {{form}}',
                    lowercase: 'deve conter somente caracteres minúsculos',
                    uppercase: 'deve conter somente caracteres maiúsculos',
                    trim: 'must not have leading or trailing whitespace',
                    creditCard: 'deve ser um cartãoo de créditos',
                    ref: 'referência "{{ref}}" que não é um número',
                    ip: 'deve ser um endereço IP válido com {{cidr}} CIDR',
                    ipVersion: 'deve ser um endereço IP válido comum das versões a seguir {{version}} com {{cidr}} CIDR'
                }
            }
        });
        if (next != undefined && result.error != null) {
            //Gerando Informações para OBJ JSON retorno
            var armensag = new Array();    
            
            result.error.details.forEach(function(element, index, array) {
                armensag.push({column : element.context.key,failsOn : element.type, limit : element.context.limit});
             }, this);
            
            //Preenchendo OBJ JSON retorno
            var mensagemErro = {
                nrlogerr: -1,
                armensag: armensag
            }

            //Retornando erro e OBJ JSON retorno
            erro = new Error();
            erro.validador = mensagemErro;
            throw erro;
        } else {
            return result;
        }
    };

    return fn;
};
