module.exports = function (app, cb) {

    var objSchema = {};

    //-----------------------------------------------------------------------\\

    objSchema.pessoas = 
        [
            {
                nmPerson:		'Remetente',
                nmPriField:		'IDG005RE',
                blMandatory: 	true,
                objSearch:
                {
                    CJCLIENT: 	'CJREMETE',
                    IECLIENT:	'IEREMETE',
                    CPENDERE:	'CPREMETE'
                }
            },

            {
                nmPerson:		'Destinatário',
                nmPriField:		'IDG005DE',
                blMandatory: 	true,
                objSearch:
                {
                    CJCLIENT: 	'CJDESTIN',
                    IECLIENT:	'IEDESTIN',
                    CPENDERE:	'CPDESTIN'
                }
            },

            {
                nmPerson:		'Expedidor',
                nmPriField:		'IDG005EX',
                nmSecField:		'IDG005RE',
                blMandatory: 	false,
                objSearch:
                {
                    CJCLIENT: 	'CJEXPEDI',
                    IECLIENT:	'IEEXPEDI',
                    CPENDERE:	'CPEXPEDI'
                }
            },

            {
                nmPerson:		'Recebedor',
                nmPriField:		'IDG005RC',
                nmSecField:		'IDG005DE',
                blMandatory: 	false,
                objSearch:
                {
                    CJCLIENT: 	'CJRECEBE',
                    IECLIENT:	'IERECEBE',
                    CPENDERE:	'CPRECEBE'
                }
            },
            
            {
                nmPerson:		'Tomador',
                nmPriField:		'IDG005CO',
                blMandatory: 	false,
                objSearch:
                {
                    CJCLIENT: 	'CJTOMADO',
                    IECLIENT:	'IETOMADO',
                    CPENDERE:	'CPTOMADO'
                }						
            }            

        ];

    //-----------------------------------------------------------------------\\

    return objSchema
}
