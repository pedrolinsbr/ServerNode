module.exports = function (app, cb) {

    const dao = app.src.modDocSyn.dao.ListDocDAO;

    var api = {};

    //-----------------------------------------------------------------------\\
    /**
     * Lista as ASN's digitalizadas
     * @function api/listDocASN
     * @author Rafael Delfino Calzado
     * @since 06/09/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listDocASN = async function (req, res, next) {

        try {

            var parm = { post: req.body };
            parm.post.TPDOCUME = 'ASN';

            var arRS = await dao.listDocShipment(parm);

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }

    //-----------------------------------------------------------------------\\
    /**
     * Lista as Invoices digitalizadas
     * @function api/listDocInvoice
     * @author Rafael Delfino Calzado
     * @since 06/09/2019
     *
     * @async 
     * @return {Array}     Retorna um objeto com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listDocInvoice = async function (req, res, next) {

        try {

            var parm = { post: req.body };
            parm.post.TPDOCUME = 'INV';

            var arRS = await dao.listDocShipment(parm);

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }    

    //-----------------------------------------------------------------------\\
    /**
     * Lista Milestones digitalizados
     * @function api/listDocMS
     * @author Rafael Delfino Calzado
     * @since 10/09/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listDocMS = async function (req, res, next) {

        try {

            var parm = { post: req.body };

            var arRS = await dao.listDocMS(parm);

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }
    
    //-----------------------------------------------------------------------\\
    /**
     * Lista POD Digitalizados
     * @function api/listDocPOD
     * @author Rafael Delfino Calzado
     * @since 15/10/2019
     *
     * @async 
     * @return {Array}      Retorna um array com o resultado da operação
     * @throws {String}     Retorna uma mensagem em caso de erro
     */
    //-----------------------------------------------------------------------\\

    api.listDocPOD = async function (req, res, next) {

        try {

            var parm = { post: req.body };

            var arRS = await dao.listDocPOD(parm);

            res.send(arRS);

        } catch (err) {

            res.status(500).send({ error: err.message });

        }

    }
    
    //-----------------------------------------------------------------------\\   
    
    return api;

}