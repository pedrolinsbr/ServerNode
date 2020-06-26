module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modIntegrador.dao.UsuarioDAO;
  var jwt = require('jsonwebtoken'); // inserir o módulo jwt
  var log = app.config.logger;

  api.listar = async function (req, res, next) {
    await dao.listar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscar = async function (req, res, next) {
    await dao.buscar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvar = async function (req, res, next) {
    await dao.salvar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.salvarLayout = async function (req, res, next) {
    await dao.salvarLayout(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.atualizar = async function (req, res, next) {
    await dao.atualizar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.excluir = async function (req, res, next) {
    await dao.excluir(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  /**
	 * @description Faz a autenticação do usuário 
	 * @author Marco Antonio
	 * @since ??
   *
   * @description Gera token e insere ele no retorno
   * @author Everton Pessoa
	 * @since 07/02/2018
	 *
	 * @async
	 * @function api/login
	*/
  api.login = async function (req, res, next) {

    var token;
    var resultado;

    await dao.login(req, res, next)

      .then((result) => {

        if (process.env.TOKEN == 1 && result.IDS001 != null) { //verifica se será gerado token, chave no arquivo .env, deixe desabilitado no .env.dev
          
          app.set('token_secret', process.env.TOKEN_PRIVATE_KEY);
          
          if (process.env.TOKEN_RANDOM == 1) { //verifica se o token gerado será dinamico, chave no arquivo .env
            token = jwt.sign(result.DSEMALOG + Math.random(), app.get('token_secret')); //gerar token
          } else {
            token = jwt.sign(result.DSEMALOG, app.get('token_secret')); //gerar token
          }

          result.TOKEN = token; // salvar token no objeto de retorno para o front
          log.debug("Token gerado com sucesso: " + token);
        }
        log.debug("Retorno do login: ", result);
        resultado = result; // guardado para salvar o token no banco
        res.json(result);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });

    //gravar token no banco
    if (process.env.TOKEN == 1 && token && process.env.TOKEN_BD == 1) {
      log.debug('Salvou no DB');
      var saveToken = await dao.SalvarToken(resultado, res, next);
    }
  };

  /**
	 * @description Verifica se veio token na requisição, se ele é válido e libera o acesso a rota
	 * @author Everton Pessoa
	 * @since 07/02/2018
	 *
	 * @async
	 * @function api/tokenRoutes
   * 
   * @author Igor Pereira da Silva
   * @description quando validade insere ID do usuário e se ele é admin no obj de requisição
   * @since 09/05/2018
	 */
  api.tokenRoutes = async function (req, res, next) {

    if (process.env.TOKEN == 1) { //verifica se será gerado token, chave no arquivo .env, deixe desabilitado no .env.dev

      var token = req.body.token || req.query.token || req.headers['x-access-token']; // procurar a propriedade token em partes diferentes do pedido

      if (token) {
        var token_decode = false;
        var atualizar = false;

        jwt.verify(token, app.get('token_secret'), async function (err, decoded) { // verificando segredo
          if (err) { // erro!
            console.log('O usuário não está logado ou é invalido.');
            res.status(401).send({ nrlogerr: -901, armensag: ['O usuário não está logado ou é invalido.'] });
            return;
          } else {
            if (process.env.TOKEN_BD == 1) {
              var tokenValido = await dao.ValidarToken(token, res, next); //verifica token expirou
              if (tokenValido.length > 0) {
                token_decode = true;
                req.UserId = tokenValido[0].IDS001;
                req.UserIsAdmin = tokenValido[0].SNADMIN;
                var updateToken = await dao.TokenUpdateDataExp(tokenValido, res, next); // atualiza data no bd
              } else {
                console.log('Token Expirado');
                res.status(401).send({ nrlogerr: -902, armensag: ['Token Expirado'] });
                return
              }
            } else { //caso não tenha autenticação com o banco
              token_decode = true
            }

            if (token_decode) {
              req.decoded = decoded; // se tiver tudo correto o token é decodificado
              next();
            }
          }
        });
      } else { // se o pedido vir sem token, retorna um erro
        console.log('Token não fornecido');
        res.status(401).send({ nrlogerr: -900, armensag: ['Token não fornecido.'] });
        return;
      }
    } else { //sem token
      next()
    }
  };

  api.teste = async function (req, res, next) {
    await dao.teste(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.usuarioAccess = async function (req, res, next) {
    res.json({access:true});
  };


  return api;
};
