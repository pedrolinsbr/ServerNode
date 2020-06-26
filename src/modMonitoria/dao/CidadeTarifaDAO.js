module.exports = function (app) {

  var api = {};
  var utils = app.src.utils.FuncoesObjDB;
  api.controller = app.config.ControllerBD;
  const utilsFE   = app.src.utils.Utils;

  api.getDiasEntrega = async function (req, res, next) {
    let con = await this.controller.getConnection(req.body.con, req.UserId);
    
    try {
      // Recupera a data de origem e destino da G051
      let g0xx = null;
      let operac = null;
      if (req.body.idg051 != undefined && req.body.idg051 != null) {
        g0xx = await con.execute({
          sql: `Select  IDG024, Nvl(G051.IDG005RC, G051.IDG005DE) As IDG005DE, IDG005CO AS IDG005TO, --Nvl(G051.IDG005EX, G051.IDG005RE) As IDG005OR, Nvl(G051.IDG005RE, G051.IDG005DE) As IDG005DE,
                        SnLotaca
                From    G051 G051
                Where   G051.IDG051 = :IDG051`,
          param: {
            IDG051: req.body.idg051
          },
          debug: true
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        operac = await con.execute({
          sql: `Select  Distinct G014.TPDIAS
                From    G051 G051
                Left Join G022 G022 On (G022.IdG005 = G051.IdG005CO AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                Left Join G014 G014   On G014.IdG014 = G022.IdG014
                Where   G051.IDG051 = :IDG051`,
          param: {
            IDG051: req.body.idg051
          },
          debug: true
        })
        .then((result) => {
          return result[0].TPDIAS;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

      } else {
        g0xx = await con.execute({
          sql: `Select  IDG024TR AS IDG024, G043.IdG005DE, IDG005TO,--G043.IdG005RE As IDG005OR, G043.IdG005DE,
                        Null As SnLotaca
                From    G043 G043
                Where   G043.IDG043 = :IDG043`,
          param: {
            IDG043: req.body.idg043
          },
          debug: true
        })
        .then((result) => {
          return result;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });

        operac = await con.execute({
          sql: `Select  Distinct G014.TPDIAS
                From    G043 G043
                Left Join G022 G022 On (G022.IdG005 = G043.IdG005RE AND G022.SNINDUST = 1 AND G022.SNDELETE = 0)
                Left Join G014 G014   On G014.IdG014 = G022.IdG014
                Where   G043.IDG043 = :IDG043`,
          param: {
            IDG043: req.body.idg043
          },
          debug: true
        })
        .then((result) => {
          return result[0].TPDIAS;
        })
        .catch((err) => {
          err.stack = new Error().stack + `\r\n` + err.stack;
          throw err;
        });
      }
      // Busca as informações necessárias para fazer o calculo do desbloqueio.
      let g053 = await con.execute({
        sql: `Select  Distinct G053.Qtdiacol,
                      
                      `+(g0xx[0].SNLOTACA == 'S' ? 'G053.QtDiEnLo' : 'G053.Qtdiaent' )+` As QtDias,
                      G024or.Idg003 As Idg003or,
                      G005de.Idg003 As Idg003de,
                      G053.TpDias
              From    G053 G053 -- Cidade Tarifa
              Join    G014 G014 On G014.IdG014 = G053.IdG014 -- Operação
              Join    G024 G024or On G024or.Idg003 = G053.Idg003or -- Transportadora Origem
              Join    G005 G005de On G005de.Idg003 = G053.Idg003de -- Clientes Destino
              Where   G014.SnDelete = 0
                      And G053.SnDelete = 0
                      -- And G024or.Idg005 = (Select G022O.IdG005 From G022 G022O Where G022O.IdG014 = G014.IdG014 And G022O.IDG005 = G005or.Idg005)
                      -- And G005de.Idg005 = (Select G022D.IdG005 From G022 G022D Where G022D.IdG014 = G014.IdG014 And G022D.IDG005 = G005de.Idg005)
                      And G024or.Idg024 = :Idg024
                      And G005de.Idg005 = :Idg005de
                      And G053.IdG005 = :IdG005`,
        param: {
          Idg024:   g0xx[0].IDG024,
          Idg005de: g0xx[0].IDG005DE,
          IdG005:   g0xx[0].IDG005TO,
        }
      })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        throw err;
      });
      
      let result = false;
      // Se no resultado da G053 não houver resultado retornarei false para avisar o usuário que precisa cadastrar na G053 antes de fazer o bloqueio.
      //if (req.body.stlogos == 'B' && g053.length > 0) {
      if (req.body.stlogos == 'B') {
        result = true;
        // Zera todas as datas.
        // await con.execute({
        //   sql: `        
        //   Update  G051 G051
        //       Set G051.DTCOLETA = NULL,
        //           G051.DTCALANT = NULL,
        //           G051.DTENTPLA = NULL,
        //           G051.DTCALDEP = NULL,
        //           G051.DTAGENDA = NULL,
        //           G051.DTCOMBIN = NULL,
        //           G051.DTROTERI = NULL
        //     Where G051.IDG051 = :IDG051`,
        //   param: {
        //     IDG051: req.body.idg051
        //   }
        // })
        if (req.body.manteSla == null || req.body.manteSla == undefined || req.body.manteSla == '') {
          await con.execute({
            sql: `        
          Update  G051 G051
              Set G051.DTAGENDA = NULL,
                  G051.DTCOMBIN = NULL,
                  G051.DTROTERI = NULL
            Where G051.IDG051 = :IDG051`,
            param: {
              IDG051: req.body.idg051
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
        
      } else if (req.body.stlogos == 'D' && g053.length > 0 && g053[0].TPDIAS != null) { // O mesmo vale para o desbloqueio sendo que é preciso haver informação na G053.

        result = true;
        //Se houver um atendimento de bloqueio para manter a data de SLA nada é feito
        if (req.body.manteSla == null || req.body.manteSla == undefined || req.body.manteSla == '') {
          let data = null;
          // Verifica se é dia útil ou corrido e faz o calculo necessário.
          if (g053[0].TPDIAS == 'U' || operac != 'C') {
            data = await utilsFE.addDiasUteis(req.body.dtdesblo, g053[0].QTDIAS, g053[0].IDG003DE);
          } else {
            data = await utilsFE.addDiasCorridos(req.body.dtdesblo, g053[0].QTDIAS, g053[0].IDG003DE);
          }
          //console.log(data.format('DD/MM/YYYY'));
          // Zera todas as datas e atualiza a data de coleta igual a data de bloqueio.
          await con.execute({
            sql: `        
            Update  G051 G051
                Set G051.DTCOLETA = To_Date('`+ req.body.dtdesblo + `','DD/MM/YYYY'),
                    G051.DTCALANT = NULL,
                    G051.DTENTPLA = NULL,
                    G051.DTCALDEP = NULL,
                    G051.DTAGENDA = NULL,
                    G051.DTCOMBIN = NULL,
                    G051.DTROTERI = NULL
              Where G051.IDG051 = :IDG051`,
            param: {
              IDG051: req.body.idg051
            }
          })
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
          // Após fazer o calculo da data de desbloqueio é feito a atualização da data SLA na G043.
          await con.execute({
            sql: `        
            Update  G043 G043U
            Set     G043U.DtEntCon = To_Date('`+ data.format('DD/MM/YYYY') + `','DD/MM/YYYY')
            Where   G043U.IdG043 In (
                                      Select G043.IdG043 
                                      From G051 G051
                                      Join G052 G052 On G052.IdG051 = G051.IdG051
                                      Join G043 G043 On G043.IdG043 = G052.IdG043
                                      Where G051.IdG051 = :IDG051
                                    )`,
            param: {
              IDG051: req.body.idg051
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

      } else if (req.body.stlogos == 'D' && g053.length == 0) {
        // - Defino o retorno da função default como false.
        result = false;
        //Se houver um atendimento de bloqueio para manter a data de SLA nada é feito
        if (req.body.manteSla == null || req.body.manteSla == undefined || req.body.manteSla == '') { 
          let data = null;
          // Verifica se é dia útil ou corrido e faz o calculo necessário.

          // Busca as informações necessárias para fazer o calculo do desbloqueio.

          // - Busco a cidade do destinatário
          let destinatario = await con.execute({
            sql: `Select  G005.IdG003 As IDG003DE
                    From  G005 G005
                  Where  G005.SnDelete = 0
                    And  G005.IdG005 = :Idg005de`,
            param: {
              Idg005de: g0xx[0].IDG005DE
            }
          })
          .then((result) => {
            return result[0].IDG003DE;
          })
          .catch((err) => {
            err.stack = new Error().stack + `\r\n` + err.stack;
            throw err;
          });
          
          // - Declaro os 2 parâmetros necessário para calcular os dias
          let dtColeta = null;
          let dtEntreg = null;
          
          // - Se Houver NFe é porque não há CTe para essa solicitação
          if (req.body.idg043 != '' && req.body.idg043 != null) {
            // - Data Coleta Buscando por modelo 4PL
            dtColeta = await con.execute({
              sql: `Select To_Char(Nvl(G046.DtColAtu,G046.DtColOri),'DD/MM/YYYY') As DTCOLETA
                      From G043 G043 
                      Join G049 G049 On (G049.IDG043 = G043.IDG043)
                      Join G048 G048 On (G049.IDG048 = G048.IDG048)
                      Join G046 G046 On (G048.IDG046 = G046.IDG046)
                    Where  G043.IdG043 = :IDG043`,
              param: {
                IDG043: req.body.idg043
              }
            })
            .then((result) => {
              return result[0].DTCOLETA;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
            
            // - Como não há CTe a única previsão de entrega que temos é o SLA
            dtEntreg = await con.execute({
              sql: `Select To_Char(G043.DtEntCon,'DD/MM/YYYY') As DTENTREG
                      From G043 G043
                    Where  G043.IdG043 = :IDG043`,
              param: {
                IDG043: req.body.idg043
              }
            })
            .then((result) => {
              return result[0].DTENTREG;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
          } else {
            // - Nesse caso há CTe, busco a data coleta do modelo 
            dtColeta = await con.execute({
              sql: `Select To_Char(Nvl(G051.DtColeta,G051.DtEmiCtr), 'DD/MM/YYYY') As DTCOLETA
                      From G051 G051
                    Where G051.IdG051 = :IDG051`,
              param: {
                IDG051: req.body.idg051
              }
            })
            .then((result) => {
              return result[0].DTCOLETA;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
            
            dtEntreg = await con.execute({
              sql: `Select To_Char(Coalesce(G051.DTCALDEP,G051.DTENTPLA,G051.DTCALANT, G043.DtEntCon),'DD/MM/YYYY') As DTENTREG
                      From G051 G051
                      Left Join G052 G052
                        On (G051.IdG051 = G052.IdG051)
                      Left Join G043
                        On (G043.IdG043 = G052.IdG043)
                    Where G052.IdG051 = :IDG051`,
              param: {
                IDG051: req.body.idg051
              }
            })
            .then((result) => {
              return result[0].DTENTREG;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
          }

          let dias = null;

          if (dtEntreg != '' && dtEntreg != null && dtColeta != '' && dtColeta != null) {
            dias = await con.execute({
              sql: `Select  To_Date('` + dtEntreg + `', 'DD/MM/YYYY') -
                            To_Date('` + dtColeta + `', 'DD/MM/YYYY') As DIAS
                      From Dual
                    `,
              param: []
            })
            .then((result) => {
              return result[0].DIAS;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
            
            if (operac != 'C') {
              data = await utilsFE.addDiasUteis(req.body.dtdesblo, dias, destinatario);
            } else {
              data = await utilsFE.addDiasCorridos(req.body.dtdesblo, dias, destinatario);
            }
            
            
            // Zera todas as datas e atualiza a data de coleta igual a data de bloqueio.
            await con.execute({
              sql: `        
              Update  G051 G051
                  Set G051.DTCOLETA = To_Date('`+ req.body.dtdesblo +`','DD/MM/YYYY'),
                      G051.DTCALANT = NULL,
                      G051.DTENTPLA = NULL,
                      G051.DTCALDEP = NULL,
                      G051.DTAGENDA = NULL,
                      G051.DTCOMBIN = NULL,
                      G051.DTROTERI = NULL
                Where G051.IDG051 = :IDG051`,
              param: {
                IDG051: req.body.idg051
              }
            })
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
            // Após fazer o calculo da data de desbloqueio é feito a atualização da data SLA na G043.
            await con.execute({
              sql: `        
              Update  G043 G043U
              Set     G043U.DtEntCon = To_Date('`+data.format('DD/MM/YYYY')+`','DD/MM/YYYY')
              Where   G043U.IdG043 In (
                                        Select G043.IdG043 
                                        From G051 G051
                                        Join G052 G052 On G052.IdG051 = G051.IdG051
                                        Join G043 G043 On G043.IdG043 = G052.IdG043
                                        Where G051.IdG051 = :IDG051
                                      )`,
              param: {
                IDG051: req.body.idg051
              }
            })
            .then((result1) => {
              return result1;
            })
            .catch((err) => {
              err.stack = new Error().stack + `\r\n` + err.stack;
              throw err;
            });
            
            result = true;
          }
            
        } else {
          result = true;
        }

        
      }
      //console.log(g053);
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
