module.exports = function (app, cb) {
  var fs = require('fs');
  var api = {};
  var dao = app.src.modHoraCerta.dao.MapaDao;

  /**
   * @description Busca o mapa de uma carga.
   *
   * @async
   * @function api/buscarMapa
   * @param {request} req - Possui as requisições para a função, {IDG046}.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {Array} Retorna um array contendo os dados para montar o mapa da carga.
   * @throws Caso falso, o número do log de erro aparecerá no console.
   * @since 01-08-2018
   * @author Everton Pessoa
  */ 
  api.buscarMapa = async function (req, res, next) {

    //BUSCAR ID DA CARGA
    if (req.body.IDG046 !== undefined){
      IDG046 = req.body.IDG046;
    }
    else if (req.headers.IDG046 !== undefined){
      IDG046 = req.headers.IDG046;
    } else{
      return res.status(500).send("Número da carga não informado")
    }

    await dao.buscarMapa({IDG046:IDG046}, res, next)
      .then(async (result) => {

        var arNotasTemp     =   [];
        var arNotasDistinct =   [];
        var arNotas         =   [];
        var pesoNota       =   0.0;

        for (key of result){
          arNotasTemp.push(key.NRNOTA)
        }

        arNotasDistinct = arNotasTemp.filter(function (value, index, self) { 
          return self.indexOf(value) === index;
        })

        for (key of arNotasDistinct){

          var obj =
          {
            NRNOTA: null,
            REMETENTE: "",
            DESTINATARIO: "",
            CIDADE:"",
            ENDERECO:"",
            VOLUME:"",
            PESO:"",
            PRODUTO: []
          }
          
          filtro = result.filter((d) => { return d.NRNOTA == key });

          obj.NRNOTA        = filtro[0].NRNOTA;
          obj.REMETENTE     = filtro[0].REMETENTE;
          obj.DESTINATARIO  = filtro[0].DESTINATARIO;
          obj.CIDADE        = filtro[0].NMCIDADE;
          obj.ENDERECO      = filtro[0].DSENDERE;
          obj.VOLUME        = filtro[0].VRVOLUME;
          

          for(i of filtro){
            
            pesoNota = pesoNota + i.PSBRUTO;//Calcula o peso de cada nota

            obj.PRODUTO.push(
              {
                IDG045    : i.IDG045,
                DSPRODUT  : i.DSPRODUT,
                NRONU     : i.NRONU,
                DSLOTE    : i.DSLOTE,
                QTPRODUT  : i.QTPRODUT
              }
            )
          }
          obj.PESO = pesoNota;
          arNotas.push(obj);

        }
        
        return res.json(arNotas);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  return api;
};
