module.exports = function (app, cb) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  const acl      = app.src.modIntegrador.controllers.FiltrosController;
  api.controller = app.config.ControllerBD;

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listar = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    let IDS001 = null, sqlAcl = "";

    //BUSCAR ID DO USUARIO
    if (req.body.IDS001 !== undefined) {
      IDS001 = req.body.IDS001;
    } else if (req.headers.ids001 !== undefined) {
      IDS001 = req.headers.ids001;
    }

    if (IDS001 !== null) {
      sqlAcl = await acl.montar({
        ids001: IDS001,
        dsmodulo: 'LOGIN',
        nmtabela: [{S025:'S025'}],
        snAdmin: false,
        esoperad: 'AND'
      });
    } else {
      sqlAcl = ' AND 1 = 0';
    }

    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S025', true);
    
    try {
      let result = await con.execute({
        sql: `Select S025.IDS025,
                     S025.DSMODULO,
                     COUNT(S025.IDS025) OVER () as COUNT_LINHA
                From S025 S025 `+
              sqlWhere +
              sqlAcl +
              sqlOrder,
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarGrupos = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S026', true);
    
    try {
      let result = await con.execute({
        sql: `Select S026.IDS026,
                     S026.IDS025,
                     S026.DSGRUPO,
                     S026.TPGRUPO,
                     COUNT(S026.IDS026) OVER () as COUNT_LINHA
                From S026 S026 `+
              sqlWhere +
              sqlOrder +
              sqlPaginate,  
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarMenus = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    let menuAr = [];
    let arResult = [];
    let arAux = [];

    let id = req.body.IDS026;

    try {
      menuAr = await con.execute({
        sql: `
        
        Select X.IdS022, X.DsMenu, X.DsTitulo, X.IdMenPai, X.DsIcone, X.DsCaminh, X.NrNivel, x.NrOrdem, x.Ids026
        From
            (   Select  Distinct S022.IdS022, S022.DsMenu, S022.DsTitulo, S022.IdMenPai,
                        S022.NrNivel, S022.NrOrdem, S022.DsIcone, S022.DsCaminh, S026.Ids026
                From    S026 S026 /* Grupos */
                        Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
                        Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos */
                        Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
                Where   S026.TpGrupo In ('M', 'A') And
                        S026.SnDelete = 0 And
                        S022.SnDelete = 0 And
                        S025.SnDelete = 0 And
                        S021.SnVisAdm in (0,1) And
                        S026.IDS026 = ` + id + `
                Order By Nvl(S022.IdMenPai, 0), S022.NrNivel, S022.NrOrdem ) X
        Start With Nvl(X.IdMenPai, 0) = 0
        Connect By Prior X.IdS022 = Nvl(X.IdMenPai, 0)
        ORDER SIBLINGS BY X.NRORDEM`,  
        param: []
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 

      for (item in menuAr) {
          var obResult = {};
          obResult.IDS022 = (menuAr[item].IDS022 === null ? '' : menuAr[item].IDS022);
          obResult.IDS026 = (menuAr[item].IDS026 === null ? '' : menuAr[item].IDS026);
          obResult.DSCAMINH = (menuAr[item].DSCAMINH === null ? '' : menuAr[item].DSCAMINH);
          obResult.DSMENU = (menuAr[item].DSMENU === null ? '' : menuAr[item].DSMENU);
          obResult.DSTITULO = (menuAr[item].DSTITULO === null ? '' : menuAr[item].DSTITULO);
          obResult.type = 'link';
          obResult.DSICONE = (menuAr[item].DSICONE === null ? '' : menuAr[item].DSICONE);
          obResult.NRNIVEL = (menuAr[item].NRNIVEL === null ? '' : menuAr[item].NRNIVEL);
          obResult.NRORDEM = (menuAr[item].NRORDEM === null ? '' : menuAr[item].NRORDEM);
          obResult.IDMENPAI = (menuAr[item].IDMENPAI === null ? '' : menuAr[item].IDMENPAI);
          
          
          if (menuAr[item].IDMENPAI === null) {
              if (arAux.length !== 0) {
                  arResult[arResult.length - 1].children = arAux;
                  arResult[arResult.length - 1].type = 'sub';
              }
              arResult.push(obResult);
              arAux = [];
          } else {
              arAux.push(obResult);
          }
      }
      if (arAux.length !== 0) {
          arResult[arResult.length - 1].children = arAux;
          arResult[arResult.length - 1].type = 'sub';
      }
      return arResult;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarMenusV2 = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    let menuAr = [];
    let arResult = [];
    let arAux = [];

    let IDS025 = req.body.IDS025;
    let IDS026 = req.body.IDS026;

    try {
      menuAr = await con.execute({
        sql: `
        
        Select X.IdS022, X.DsMenu, X.DsTitulo, X.IdMenPai, X.DsIcone, X.DsCaminh, X.NrNivel, x.NrOrdem, Case When x.CHECKED > 0 Then x.CHECKED Else null End as CHECKED
        From
            (   Select  Distinct S022.IdS022, S022.DsMenu, S022.DsTitulo, S022.IdMenPai,
                        S022.NrNivel, S022.NrOrdem, S022.DsIcone, S022.DsCaminh, (Select Count(1) as QTD From S021 Aux Where Aux.Ids022 = S022.IdS022 And Aux.Ids026 = ` + IDS026 + `) As CHECKED
                From    S026 S026 /* Grupos */
                        Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
                        Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos */
                        Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
                Where   S026.TpGrupo In ('M', 'A') And
                        S026.SnDelete = 0 And
                        S022.SnDelete = 0 And
                        S025.SnDelete = 0 And
                        S021.SnVisAdm in (0,1) And
                        S025.IDS025 = ` + IDS025 + `
                Order By Nvl(S022.IdMenPai, 0), S022.NrNivel, S022.NrOrdem ) X
        Start With Nvl(X.IdMenPai, 0) = 0
        Connect By Prior X.IdS022 = Nvl(X.IdMenPai, 0)
        ORDER SIBLINGS BY X.NRORDEM`,  
        param: []
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 

      for (item in menuAr) {
          var obResult = {};
          obResult.IDS022 = (menuAr[item].IDS022 === null ? '' : menuAr[item].IDS022);
          obResult.IDS026 = (menuAr[item].IDS026 === null ? '' : menuAr[item].IDS026);
          obResult.DSCAMINH = (menuAr[item].DSCAMINH === null ? '' : menuAr[item].DSCAMINH);
          obResult.DSMENU = (menuAr[item].DSMENU === null ? '' : menuAr[item].DSMENU);
          obResult.DSTITULO = (menuAr[item].DSTITULO === null ? '' : menuAr[item].DSTITULO);
          obResult.type = 'link';
          obResult.DSICONE = (menuAr[item].DSICONE === null ? '' : menuAr[item].DSICONE);
          obResult.NRNIVEL = (menuAr[item].NRNIVEL === null ? '' : menuAr[item].NRNIVEL);
          obResult.NRORDEM = (menuAr[item].NRORDEM === null ? '' : menuAr[item].NRORDEM);
          obResult.IDMENPAI = (menuAr[item].IDMENPAI === null ? '' : menuAr[item].IDMENPAI);
          obResult.CHECKED = (menuAr[item].CHECKED === null ? '' : menuAr[item].CHECKED);
          
          
          if (menuAr[item].IDMENPAI === null) {
              if (arAux.length !== 0) {
                  arResult[arResult.length - 1].children = arAux;
                  arResult[arResult.length - 1].type = 'sub';
              }
              arResult.push(obResult);
              arAux = [];
          } else {
              arAux.push(obResult);
          }
      }
      if (arAux.length !== 0) {
          arResult[arResult.length - 1].children = arAux;
          arResult[arResult.length - 1].type = 'sub';
      }
      return arResult;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarMenusPais = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let id = req.body.IDS026;
    try {
      let result = await con.execute({
        sql: `Select X.IdS022, X.DsMenu, X.DsTitulo, X.IdMenPai, X.DsIcone, X.DsCaminh, X.NrNivel, x.NrOrdem
        From
            (   Select  Distinct S022.IdS022, S022.DsMenu, S022.DsTitulo, S022.IdMenPai,
                        S022.NrNivel, S022.NrOrdem, S022.DsIcone, S022.DsCaminh
                From    S026 S026 /* Grupos */
                        Join S025 S025 On (S025.IdS025 = S026.IdS025) /* Módulos */
                        Join S021 S021 On (S021.IdS026 = S026.IdS026) /* Telas/Grupos */
                        Join S022 S022 On (S022.IdS022 = S021.IdS022) /* Menu */
                Where   S026.TpGrupo In ('M', 'A') And
                        S026.SnDelete = 0 And
                        S022.SnDelete = 0 And
                        S025.SnDelete = 0 And
                        S021.SnVisAdm in (0,1) And
                        S026.IDS026 = ` + id + `
                Order By Nvl(S022.IdMenPai, 0), S022.NrNivel, S022.NrOrdem ) X
        Where X.NRNIVEL = 1 AND X.IDMENPAI IS NULL
        Start With Nvl(X.IdMenPai, 0) = 0
        Connect By Prior X.IdS022 = Nvl(X.IdMenPai, 0)
        ORDER SIBLINGS BY X.NRORDEM`,
        param: []
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };


  
  /**
   * @description Insere um dado na tabela S021.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.acrescentarMenuVinculo = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    let IDS026 = req.body.IDS026;
    let IDS022 = req.body.IDS022;
    let IDS023 = req.body.IDS023;
    let len = IDS023.length;

    try {  
      let result = [];
      for (let i = 0; i < len; ++i) {
        result[i] = await con.insert({
          tabela: `S021`,
          colunas: {
            IDS023: IDS023[i],
            IDS026: IDS026,
            IDS022: IDS022,
            SNVISADM: 0
          }
        })
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      }

      // Busco os submenus vinculados a esse menu
      let result2 = await con.execute({
        sql: `        
            Select S022.Ids022
              From S022 S022
            Where S022.IdMenPai = `+ IDS022,
          param: []
      });
      if (result2.length > 0) {
        for (let i = 0; i < result2.length; i++) {
          // - Realiza o insert da S021 do submenu
          await this.controller.setConnection(con);
          await api.insertTelasAcoesGrupos(result2[i].IDS022, IDS023, IDS026, con,req.UserId);
        }
      }

      // Verifico se esse menu é filho de alguém
      let result3 = await con.execute({
        sql: `        
            Select S022.IDMENPAI
              From S022 S022
            Where S022.Ids022 = `+ IDS022,
          param: []
      });
      if (result3.length > 0 && result3[0].IDMENPAI != null) {
        // - Realiza o insert da S021 do menuPai
        // - Verifico se o MenuPai já está na tabela
        await this.controller.setConnection(con);
        let qtdRegistrosMenu = await api.havePermissions(result3[0].IDMENPAI, IDS026, con,req.UserId);

        if (qtdRegistrosMenu[0].QTD == 0) {
          await this.controller.setConnection(con);
          await api.insertTelasAcoesGrupos(result3[0].IDMENPAI, IDS023, IDS026, con,req.UserId);
        }
      }
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Insere um dado na tabela S021.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.insertTelasAcoesGrupos = async function (IDS022, IDS023, IDS026, con1, userId) {
    let con = await this.controller.getConnection(con1, userId);

    let len = IDS023.length;

    try {  
      let result = [];
      for (let i = 0; i < len; ++i) {
        result[i] = await con.insert({
          tabela: `S021`,
          colunas: {
            IDS023: IDS023[i],
            IDS026: IDS026,
            IDS022: IDS022,
            SNVISADM: 0
          }
        })
        .then((result1) => {
          return result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      }
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Insere um dado na tabela S021.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.deleteTelasAcoesGruposChildren = async function (IDS022, IDS026, con1, userId) {
    let con = await this.controller.getConnection(con1, userId);

    try {  
      let result = await con.execute({
        sql: `        
        Delete From S021 S021 Where S021.Ids022 = `+ IDS022 + ' And S021.Ids026 = '+ IDS026,
        param: []
      })
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Insere um dado na tabela S021.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.removerVinculoMenu = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    let IDS026 = req.body.IDS026;
    let IDS022 = req.body.IDS022;

    try {  
      let result = await con.execute({
        sql: `        
        Delete From S021 S021 Where S021.Ids022 = `+ IDS022 + ' And S021.Ids026 = '+ IDS026,  
        param: []
      })
      .then((result1) => {
        return { response: "Vinculo removido com sucesso" };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      // Busco os submenus vinculados a esse menu
      let result2 = await con.execute({
        sql: `        
            Select S022.Ids022
              From S022 S022
            Where S022.IdMenPai = `+ IDS022,
          param: []
      });
      if (result2.length > 0) {
        for (let i = 0; i < result2.length; i++) {
          // - Realiza o insert da S021 do submenu
          await this.controller.setConnection(con);
          await api.deleteTelasAcoesGruposChildren(result2[i].IDS022, IDS026, con, req.UserId);
        }
      }
        
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };
  
  /**
   * @description Busca um dado na tabela G003.
   *
   * @async
   * @function api/buscar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.buscarMenu = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let IDS022 = req.body.IDS022;
    let IDS026 = req.body.IDS026;

    try {
      let result = await con.execute(
      {
        sql: `Select  S022.Ids022,
                      S022.DsMenu,
                      S022.DsTitulo,
                      S022.IdMenPai,
                      S022.NrNivel,
                      S022.NrOrdem,
                      S022.DsIcone,
                      S022.DsCaminh,
                      S021.IDS023,
                      S021.IDS026,
                      COUNT(S022.IDS022) OVER() as COUNT_LINHA
                From S022 S022
                Join S021 S021
                  On (S022.IDS022 = S021.IDS022)
                Where S022.SNDELETE = 0
                  And S022.IDS022 = ` + IDS022 + `
                  And S021.IDS026 = ` + IDS026,
          param: [],
        })
        .then((result) => {
          if (result.length == undefined) {
            return [result];
          } else {
            return (result);
        }        
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }    
  };

  /**
   * @description Insere um dado na tabela S022.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.salvarNovoMenu = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    let nrnivel = 1;
    if (req.body.IDMENPAI != undefined && req.body.IDMENPAI != '' && req.body.IDMENPAI != null) {
      nrnivel = 2;
    } else {
      nrnivel = 1;
    }
    try {          
      let result = await con.insert({
        tabela: `S022`,
        colunas: {
          DSMENU: req.body.DSMENU,
          DSTITULO: req.body.DSTITULO,
          IDMENPAI: req.body.IDMENPAI,
          NRNIVEL: nrnivel,
          NRORDEM: req.body.NRORDEM,
          DSICONE: req.body.DSICONE,
          DSCAMINH: req.body.DSCAMINH
        },
        key: `S022.IDS022`
      })
      .then((result1) => {
        return result1;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      let idMenu = result;
      let acoes = req.body.ACOES;
      let IDS026 = req.body.IDS026;

      if (acoes.length > 0) {
        let result = [];

        for (let i = 0, len = acoes.length; i < len; ++i) {
          result[i] = await con.insert({
            tabela: `S021`,
            colunas: {
              IDS023: acoes[i],
              IDS026: IDS026,
              IDS022: idMenu,
              SNVISADM: 0
            }
          })
          .then((result1) => {
            return result1;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        }
      }

      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.loadAcoes = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    
    try {
      let result = await con.execute(
      {
        sql: `Select S023.IDS023, S023.DSACAO
                From S023 S023
            Order By S023.DSACAO`,
        param: [],
      })
      .then((result) => {
            return (result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close();
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };


    /**
   * @description Insere um dado na tabela S022.
   *
   * @async
   * @function api/salvar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.addUsuarioGrupoIndividual = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    
    //console.log(req.body);

    try { 
      let result = await con.insert({
        tabela: `S027`,
        colunas: {
          IDS026: req.body.IDS026,
          IDS001: req.body.IDS001
        }
      })
      .then((result1) => {
        return { response: "Usuário inserido com sucesso" };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });      
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };
  

  /**
   * @description Atualiza um dado da tabela G003.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarMenu = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    var id = req.body.IDS022;
    let nrnivel = 1;
    if (req.body.IDMENPAI != undefined && req.body.IDMENPAI != '' && req.body.IDMENPAI != null) {
      nrnivel = 2;
    } else {
      nrnivel = 1;
    }
    try {
      let result = await con.update({
        tabela: `S022`,
        colunas: {
          DSMENU: req.body.DSMENU,
          DSTITULO: req.body.DSTITULO,
          IDMENPAI: req.body.IDMENPAI,
          NRNIVEL: nrnivel,
          NRORDEM: req.body.NRORDEM,
          DSICONE: req.body.DSICONE,
          DSCAMINH: req.body.DSCAMINH
        },
        condicoes: `IDS022 = :id`,
        parametros: {
          id: id
        }
      })
      .then((result1) => {
        return { response: "Registro atualizado com sucesso." };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      let IDS026 = req.body.IDS026;
      let resultDel = await con.execute({
        sql: `        
        Delete From S021 S021 Where S021.Ids022 = `+ id + ` And S021.Ids026 = `+IDS026,  
        param: []
      })
      .then((result1) => {
        return { response: "Usuário removido com sucesso" };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      let acoes = req.body.ACOES;
      
  
      if (acoes.length > 0) {
        let result = [];
  
        for (let i = 0, len = acoes.length; i < len; ++i) {
          result[i] = await con.insert({
            tabela: `S021`,
            colunas: {
              IDS023: acoes[i],
              IDS026: IDS026,
              IDS022: id,
              SNVISADM: 0
            }
          })
          .then((result1) => {
            return result1;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
        }
      }
      
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

    /**
   * @description Atualiza um dado da tabela G003.
   *
   * @async
   * @function api/atualizar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.atualizarOrdemMenu = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    var array = req.body.arrayObj;
    
    try {
      let result = [];
      for (let i = 0, len = array.length; i < len; ++i) {        
        result[i] = await con.update({
          tabela: `S022`,
          colunas: {
            NRORDEM: array[i].NRORDEM
          },
          condicoes: `IDS022 = :id`,
          parametros: {
            id: array[i].IDS022
          }
        })
        .then((result1) => {
          result[i] = result1;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      }
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  }

    /**
   * @description Contém o SQL que requisita os dados da tabela S001.
   *
   * @async
   * @function api/listar
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.listarGruposUsuarios = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);
    //filtra,ordena,pagina
    var [sqlWhere, sqlOrder, sqlPaginate, bindValues] = utils.retWherePagOrd(req.body, 'S027', false);
    
    try {
      let result = await con.execute({
        sql: `Select S026.IDS026, S026.DSGRUPO, S001.IDS001, S001.NMUSUARI, COUNT(S026.IDS026) OVER() as COUNT_LINHA
              From S027 S027
              Join S026 S026
                On (S026.IDS026 = S027.IDS026)
              Join S001 S001 
                On (S001.IDS001 = S027.IDS001)`+
              sqlWhere +
              sqlOrder +
              sqlPaginate,  
        param: bindValues
      })
      .then((result) => {
        return (utils.construirObjetoRetornoBD(result));
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };


  /**
   * @description Exclui um dado na tabela G003.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.removerUsuarioGrupo = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    var usuario = req.body.IDS001;
    var modulo = req.body.IDS026;
    
    try {
      let result = await await con.execute({
        sql: `        
        Delete From S027 S027 Where S027.Ids001 = `+ usuario + ` and S027.Ids026 = ` + modulo,  
        param: []
      })
      .then((result1) => {
        return { response: "Usuário removido com sucesso" };
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  
  /**
   * @description Exclui um dado na tabela G003.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.deleteMenuCadastrado = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    var menu = req.body.IDS022;
    
    try {
      // Busco os submenus vinculados a esse menu
      let result = await con.execute({
        sql: `        
          Select S022.Ids022
            From S022 S022
           Where S022.IdMenPai = `+ menu,
        param: []
      });
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          // - Realiza o delete da S021 do submenu
          await this.controller.setConnection(con);
          await api.deleteTelasAcoesGrupos(result[i].IDS022, con, req.UserId);

          // - Realiza o delete da S022 do submenu
          await this.controller.setConnection(con);
          await api.deleteMenu(result[i].IDS022, con, req.UserId);
        }
        // - Terminou de excluir os filhos, agora é remover o pai
      }
      // - Realiza o delete da S021 do Menu
      await this.controller.setConnection(con);
      await api.deleteTelasAcoesGrupos(menu, con, req.UserId);

        // - Realiza o delete da S022 do Menu
      await this.controller.setConnection(con);
      await api.deleteMenu(menu, con, req.UserId);
      
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.deleteTelasAcoesGrupos = async function (IDS022,con1, userId) {
    let con = await this.controller.getConnection(con1, userId);
    
    try {
      let result = await await con.execute({
        sql: `        
        Delete From S021 S021 Where S021.Ids022 = `+ IDS022,
        param: []
      });
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.deleteMenu = async function (IDS022,con1, userId) {
    let con = await this.controller.getConnection(con1, userId);
    
    try {
      let result = await await con.execute({
        sql: `        
        Delete From S022 S022 Where S022.Ids022 = `+ IDS022,  
        param: []
      })
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  api.havePermissions = async function (IDS022,IDS026,con1, userId) {
    let con = await this.controller.getConnection(con1, userId);
    
    try {
      let result = await await con.execute({
        sql: `        
        Select Count(1) As QTD
          From S021 S021
         Where S021.IDS026 = ` + IDS026 + ` And S021.Ids022 = ` + IDS022,  
        param: []
      })
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  /**
   * @description Exclui um dado na tabela G003.
   *
   * @async
   * @function api/excluir
   * @param {request} req - Possui as requisições para a função.
   * @param {response} res - A resposta gerada na função.
   * @param {next} next - Caso haja algum erro na rota.
   * @return {JSON} Retorna um objeto JSON.
   * @throws Caso falso, o número do log de erro aparecerá no console.
  */
  api.deleteMenuCadastrado = async function (req, res, next) {
    let con = await this.controller.getConnection(null, req.UserId);

    let menu = req.body.IDS022;
    
    try {
      // Busco os submenus vinculados a esse menu
      let result = await con.execute({
        sql: `        
          Select S022.Ids022
            From S022 S022
           Where S022.IdMenPai = `+ menu,
        param: []
      });
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          // - Realiza o delete da S021 do submenu
          await this.controller.setConnection(con);
          await api.deleteTelasAcoesGrupos(result[i].IDS022, con, req.UserId);

          // - Realiza o delete da S022 do submenu
          await this.controller.setConnection(con);
          await api.deleteMenu(result[i].IDS022, con, req.UserId);
        }
        // - Terminou de excluir os filhos, agora é remover o pai
      }
      // - Realiza o delete da S021 do Menu
      await this.controller.setConnection(con);
      await api.deleteTelasAcoesGrupos(menu, con, req.UserId);

        // - Realiza o delete da S022 do Menu
      await this.controller.setConnection(con);
      await api.deleteMenu(menu, con, req.UserId);
      
      await con.close(); 
      return result;
    } catch (err) {
      await con.closeRollback();
      err.stack = new Error().stack + `\r\n` + err.stack;
      throw err;
    }
  };

  return api;
};
