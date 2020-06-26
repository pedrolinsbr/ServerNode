module.exports = function (app) {

  var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

  // ROTAS DISTRIUIBCAO SYNGENTA
  var distribSyngenta = app.src.modDashboard.controllers.DistribSyngentaController;
  app.post('/api/ds/distribSyngenta/buscar',           token, distribSyngenta.buscarDistrib);

  //ROTAS TRANSFERENCIA DISTRIBUICAO
  var transferencia = app.src.modDashboard.controllers.TransferenciaController;
  app.post('/api/ds/transferencia/crossdocking',       token, transferencia.crossDockingTransferencia);
  app.post('/api/ds/transfe-distrib/buscar',           token, transferencia.buscarTransfeDistrib);
  app.post('/api/ds/timeline-Nf',                      token, transferencia.timeLineNf);

  //ROTAS PIB
  var pib = app.src.modDashboard.controllers.PibController;
  app.post('/api/ds/pib/Geral',                        token, pib.pibGeral);
  app.post('/api/ds/pib/qualidade-ofereciemento',      token, pib.pibQualidadeOfericimento); 
  app.post('/api/ds/pib/tipo-veiculo',                 token, pib.pibTipoVeiculo);
  app.post('/api/ds/pib/transportadoras',              token, pib.pibTransportadora);  
  app.post('/api/ds/pib/previsaoFaturamento',          token, pib.previsaoFaturamento);
  app.post('/api/ds/pib/previsaoFaturamentoAcumulado', token, pib.previsaoFaturamentoAcumulado);
  app.post('/api/ds/pib/grid',                         token, pib.gridPib);
  app.get('/api/ds/pib/buscar',                        token, pib.buscarPib);
  
  //ROTAS CRUD PLANEJAMENTO
  var planejamento = app.src.modDashboard.controllers.PlanejamentoController;

  app.post('/api/ds/planejamento/salvar',   token, planejamento.salvar);
  app.post('/api/ds/planejamento/atualizar',token, planejamento.atualizar);
  app.post('/api/ds/planejamento/excluir',  token, planejamento.excluir);
  app.post('/api/ds/planejamento/listar',   token, planejamento.listar);
  app.post('/api/ds/planejamento/buscar',   token, planejamento.buscar);

  //ROTAS GESTÃO DE CD
  var gestaoCd = app.src.modDashboard.controllers.GestaoCdController;
  app.post('/api/ds/gestao-cd/inOutGeral',                         token, gestaoCd.inOutGeral);
  app.post('/api/ds/gestao-cd/inOutFiliais',                       token, gestaoCd.inOutFiliais);
  app.post('/api/ds/gestao-cd/detailAgendamento',                  token, gestaoCd.detailAgendamento);
  app.post('/api/ds/gestao-cd/planejamento-semanal-detalhado',     token, gestaoCd.planejamentoSemanalDetalhado);
  app.post('/api/ds/gestao-cd/planejamento-semanal-realizado',     token, gestaoCd.planejamentoSemanalRealizado);
  app.post('/api/ds/gestao-cd/planejamento-mensal-geral',          token, gestaoCd.planejamentoMensalGeral);
  app.post('/api/ds/gestao-cd/planejamento-mensal-realizado',      token, gestaoCd.planejamentoMensalRealizado);
  app.post('/api/ds/gestao-cd/grid-cargas',                        token, gestaoCd.gestaoCdGrid);
  app.post('/api/ds/gestao-cd/ocupacaoGeral',                      token, gestaoCd.ocupacaoGeral);
  app.post('/api/ds/gestao-cd/xlsx',                               token, gestaoCd.lerXlsx);
  app.post('/api/ds/gestao-cd/inOutGeralNovo',                     token, gestaoCd.inOutGeralNovo);
  app.post('/api/ds/gestao-cd/buscarOcupacao',                     token, gestaoCd.buscarOcupacao);
  app.post('/api/ds/gestao-cd/atualizarArmazenagem',               token, gestaoCd.atualizarArmazenagem);
  app.post('/api/ds/gestao-cd/atualiza/planejamento-movimentacao', token, gestaoCd.atualizarPlaneMovimentacao);
  
  //ROTAS GESTÃO DE CD || AG
  var gestaoCdAg = app.src.modDashboard.controllers.GestaoCdAgController;
  app.post('/api/ds/gestao-cd-ag/inOutGeral',                     token, gestaoCdAg.inOutGeral);
  app.post('/api/ds/gestao-cd-ag/inOutFiliais',                   token, gestaoCdAg.inOutFiliais);
  app.post('/api/ds/gestao-cd-ag/detailAgendamento',              token, gestaoCdAg.detailAgendamento);
  app.post('/api/ds/gestao-cd-ag/planejamento-semanal-detalhado', token, gestaoCdAg.planejamentoSemanalDetalhado);
  app.post('/api/ds/gestao-cd-ag/planejamento-semanal-realizado', token, gestaoCdAg.planejamentoSemanalRealizado);
  app.post('/api/ds/gestao-cd-ag/planejamento-mensal-geral',      token, gestaoCdAg.planejamentoMensalGeral);
  app.post('/api/ds/gestao-cd-ag/planejamento-mensal-realizado',  token, gestaoCdAg.planejamentoMensalRealizado);
  app.post('/api/ds/gestao-cd-ag/grid-cargas',                    token, gestaoCdAg.gestaoCdGrid);
  app.post('/api/ds/gestao-cd-ag/ocupacaoGeral',                  token, gestaoCdAg.ocupacaoGeral);
  app.post('/api/ds/gestao-cd-ag/xlsx',                           token, gestaoCdAg.lerXlsx);
  app.post('/api/ds/gestao-cd-ag/inOutGeralNovo',                 token, gestaoCdAg.inOutGeralNovo);
  app.post('/api/ds/gestao-cd-ag/buscarMovimentacao',             token, gestaoCdAg.buscarMovimentacao);
  app.post('/api/ds/gestao-cd-ag/atualizarArmazenagem',           token, gestaoCdAg.atualizarArmazenagem);

  //ROTAS OCORREENCIA
  var ocorrencia = app.src.modDashboard.controllers.OcorrenciaController;
  app.post('/api/ds/ocorrencia/geral' ,token , ocorrencia.getOcorrencias);
  app.post('/api/ds/ocorrencia/nps-cte', token, ocorrencia.getNpsCte);

  //ROTAS RECONHECIMENTO DE RECEITA
  var recReceita = app.src.modDashboard.controllers.ReconhecimentoReceitaController;
  app.post('/api/ds/reconhece-receita/geral', token, recReceita.reconheceReceitaGeral);
  app.post('/api/ds/reconhece-receita/grid',  token, recReceita.reconheceReceitaGrid);
  app.post('/api/ds/reconhece-receita/buscar/cutoff',  token, recReceita.buscarCutOff);

  //ROTAS DE MAP DE NFS
  var mapNfs = app.src.modDashboard.controllers.MapController;
  app.post('/api/ds/map-nfs/listar', token, mapNfs.listarNfs);
  app.post('/api/ds/mapa/buscarDados', token, mapNfs.buscarDadosLocalizacao);
  app.post('/api/ds/mapa/buscarDadosCalor', token, mapNfs.buscarDadosCalor);

  //ROTAS GESTÃO MOVIMENTAÇÃO
  var gestaoMovimentacao = app.src.modDashboard.controllers.GestaoMovimentacaoController;
  app.post('/api/ds/gestao-movimentacao/indicadores-status-agendamento'    , token, gestaoMovimentacao.buscaIndicadoresStatusAgendamento    );
  app.post('/api/ds/gestao-movimentacao/indicadores-agendamentos-atrasados', token, gestaoMovimentacao.buscaIndicadoresAgendamentosAtrasados);
  app.post('/api/ds/gestao-movimentacao/agendamentos-atrasados'            , token, gestaoMovimentacao.buscaAgendamentosAtrasados           );
  app.post('/api/ds/gestao-movimentacao/capacidade-movimentacao-armazens'  , token, gestaoMovimentacao.buscaCapacidadeArmazem               );

  // --------------->>> NEW ROUTES <<<------------------ //

  // ROTAS PIB OFERECIMENTO
  var oferecimento = app.src.modDashboard.controllers.PibOferecimentoController;
  app.post('/api/ds/pib/oferecimento/buscar-oferecimentos', token, oferecimento.buscarIndicadoresOferecimento);
  app.post('/api/ds/pib/oferecimento/buscar-lista-status', token, oferecimento.buscarListaStatus);
  app.post('/api/ds/pib/oferecimento/buscar-lista-cargas', token, oferecimento.listaCargas);

  // ROTAS NOVA TELA PIB ETMS
  var etms = app.src.modDashboard.controllers.pibEtmsController;
  app.post('/api/ds/pib/etms/buscar-indicadores', token, etms.buscarIndicadores);
  app.post('/api/ds/pib/etms/buscar-dados', token, etms.buscarDados);
  app.post('/api/ds/pib/etms/buscar-graficos', token, etms.buscarGraficos);
  app.post('/api/ds/pib/etms/buscar-calendario', token, etms.buscarCalendario);
  app.post('/api/ds/pib/etms/buscar-barra', token, etms.buscarBarra);

};
