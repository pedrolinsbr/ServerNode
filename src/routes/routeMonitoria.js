module.exports = function (app) {

  var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
  /* CIDADES */
  let cidade  = app.src.modMonitoria.controllers.CidadeController;
  app.post('/api/mo/cidade/listar', token,               cidade.listar);
  app.post('/api/mo/cidade/buscar', token,               cidade.buscar);
  app.post('/api/mo/cidade/salvar', token,               cidade.salvar);
  app.post('/api/mo/cidade/atualizar', token,            cidade.atualizar);
  app.post('/api/mo/cidade/deleteSingle', token,           cidade.excluir);
  app.post('/api/mo/cidade/deleteMultiple', token,         cidade.excluirMunipiosSelecionados);
  app.post('/api/mo/cidade/listarDemoNotas', token,        cidade.listarDemoNotas);
  app.post('/api/mo/cidade/listarDemoAtendimentos', token, cidade.listarDemoAtendimentos);
  app.post('/api/mo/cidade/listarDemoNotasCarga', token, cidade.listarDemoNotasCarga);
  app.post('/api/mo/cidade/listarDemoNotasCTe', token,   cidade.listarDemoNotasCTe);


  /* USUARIOS */
  let usuario = app.src.modMonitoria.controllers.UsuarioController;
  app.post('/api/mo/usuario/listar', token,              usuario.listar);
  app.post('/api/mo/usuario/buscar', token,              usuario.buscar);
  app.post('/api/mo/usuario/salvar', token,              usuario.salvar);
  app.post('/api/mo/usuario/atualizar', token,           usuario.atualizar);
  app.post('/api/mo/usuario/deleteSingle', token,        usuario.excluir);
  app.post('/api/mo/usuario/deleteMultiple', token,      usuario.excluirUsuariosSelecionados);
  app.post('/api/mo/usuario/getUserFromHashcode', usuario.getUserFromHashcode);
  app.post('/api/mo/usuario/salvarSenha', usuario.salvarSenha);
  app.post('/api/mo/usuario/validaEmail', token,         usuario.validaEmail);
  app.post('/api/mo/usuario/listarGruposUsuarios', token,usuario.listarGruposUsuarios);
  app.post('/api/mo/usuario/removerUsuarioGrupo', token, usuario.removerUsuarioGrupo);
  app.post('/api/mo/usuario/reenviarEmail', token, usuario.reenviarEmail);
  app.post('/api/mo/usuario/resetarSenha',   usuario.resetPasswordByEmail);
  app.post('/api/mo/usuario/validaTime4pl', token,       usuario.validaTime4pl);

  /* EMAIL */
  let email = app.src.modMonitoria.controllers.EmailController;
  app.post('/api/mo/usuario/sendPassword', token,        email.sendEmail);

  /* Módulos */
  let modulo   = app.src.modMonitoria.controllers.ModuloController;
  app.post('/api/mo/modulo/listar', token,                   modulo.listar);
  app.post('/api/mo/modulo/listarGrupos', token,             modulo.listarGrupos);
  app.post('/api/mo/modulo/listarMenus', token,              modulo.listarMenus);
  app.post('/api/mo/modulo/listarMenusV2', token,            modulo.listarMenusV2);
  app.post('/api/mo/modulo/listarMenusPais', token,          modulo.listarMenusPais);
  app.post('/api/mo/modulo/salvarNovoMenu', token,           modulo.salvarNovoMenu);
  app.post('/api/mo/modulo/buscarMenu', token,               modulo.buscarMenu);
  app.post('/api/mo/modulo/atualizarMenu', token,            modulo.atualizarMenu);
  app.post('/api/mo/modulo/atualizarOrdemMenu', token,       modulo.atualizarOrdemMenu);
  app.post('/api/mo/modulo/listarGruposUsuarios', token,     modulo.listarGruposUsuarios);
  app.post('/api/mo/modulo/addUsuarioGrupoIndividual', token,modulo.addUsuarioGrupoIndividual);
  app.post('/api/mo/modulo/removerUsuarioGrupo', token,      modulo.removerUsuarioGrupo);
  app.post('/api/mo/modulo/loadAcoes', token,                modulo.loadAcoes);
  app.post('/api/mo/modulo/deleteMenuCadastrado', token,     modulo.deleteMenuCadastrado);
  app.post('/api/mo/modulo/acrescentarMenuVinculo', token,   modulo.acrescentarMenuVinculo);
  app.post('/api/mo/modulo/removerVinculoMenu', token,       modulo.removerVinculoMenu);

  /* ESTADOS */
  //let estado  = app.src.modMonitoria.controllers.EstadoController;
  //app.post('/api/mo/estado/estadoFiltro', estado.buscarFiltro);

  /* Filtros */
  let filtro  = app.src.modMonitoria.controllers.FiltroController;
  app.post('/api/mo/filtro/listar', token,               filtro.listar);
  app.post('/api/mo/filtro/salvar', token,               filtro.salvar);
  app.post('/api/mo/filtro/deletar', token,              filtro.deletar);

  /* Tabelas */
  let tabela  = app.src.modMonitoria.controllers.TabelaController;
  app.post('/api/mo/tabela/buscarAcl', token,            tabela.buscarAcl);
  app.post('/api/mo/tabela/buscarValueTabela', token, tabela.buscarValueTabela);

  let grupo = app.src.modMonitoria.controllers.GrupoController;
  app.post('/api/mo/grupo/salvar', token, grupo.salvar);
  app.post('/api/mo/grupo/deletar', token,               grupo.deletar);

  let cliente  = app.src.modMonitoria.controllers.ClienteController;
  app.post('/api/mo/cliente/listar', token, cliente.listar);
  app.post('/api/mo/cliente/salvar', token, cliente.salvar);
  app.post('/api/mo/cliente/buscar', token, cliente.buscar);
  app.post('/api/mo/cliente/atualizar', token, cliente.atualizar);
  // app.post('/api/mo/cliente/marcarTracking', token, cliente.marcarTracking);
  // app.post('/api/mo/cliente/desmarcarTracking', token, cliente.desmarcarTracking);
  app.post('/api/mo/cliente/vincularContatoCliente', token, cliente.vincularContatoCliente);
  app.post('/api/mo/cliente/marcarTrackingV2', token, cliente.marcarTrackingV2);
  app.post('/api/mo/cliente/desmarcarTrackingV2', token, cliente.desmarcarTrackingV2);
  

  //ROTAS Delivery
  let deliveryNF  = app.src.modMonitoria.controllers.DeliveryNFController;

  var multer        = require('multer');
  var storageMulter = multer.memoryStorage();
  var uploadMulter  = multer({ storage: storageMulter });

  app.post('/api/mo/deliverynf/listar',                              token, deliveryNF.listar);
  app.post('/api/mo/deliverynf/listarWithoutCte',                    token, deliveryNF.listarWithoutCte);
  app.post('/api/mo/deliverynf/listarCargaPorNfe',                   token, deliveryNF.listarCargaPorNfe);
  app.post('/api/mo/deliverynf/getInformacoesNotaFiscal',            token, deliveryNF.getInformacoesNotaFiscal);
  app.post('/api/mo/deliverynf/getInformacoesCargaCompleta',         token, deliveryNF.getInformacoesCargaCompleta);
  app.post('/api/mo/deliverynf/listarAg',                              token, deliveryNF.listarAg);
  
  app.post('/api/mo/deliverynf/getNfefromRastreio',                  deliveryNF.getInformacoesNotaFiscal);
  app.post('/api/mo/deliverynf/getItensNotaFiscal',                  token, deliveryNF.getItensNotaFiscal);
  app.post('/api/mo/deliverynf/getInformacoesCTe',                   token, deliveryNF.getInformacoesCTe);
  app.post('/api/mo/deliverynf/getInfoCTE',                          token, deliveryNF.getInfoCTE);
  app.post('/api/mo/deliverynf/salvaDataCanhoto',                    token, deliveryNF.salvaDataCanhoto);
  
  app.post('/api/mo/deliverynf/getNotaVinculadasCTe',                token, deliveryNF.getNotaVinculadasCTe);
  app.post('/api/mo/deliverynf/getInformacoesCarga',                 token, deliveryNF.getInformacoesCarga);
  app.post('/api/mo/deliverynf/getDatasToAtendimento',               token, deliveryNF.getDatasToAtendimento);
  app.post('/api/mo/deliverynf/getDatasToAtendimentoAg',             token, deliveryNF.getDatasToAtendimentoAg);
  app.post('/api/mo/deliverynf/getNotasVinculadasAtendimento',       token, deliveryNF.getNotasVinculadasAtendimento);
  app.post('/api/mo/deliverynf/isEntregue',                          token, deliveryNF.isEntregue);
  app.post('/api/mo/deliverynf/getStatusGeralNota',                  token, deliveryNF.getStatusGeralNota);
  app.post('/api/mo/deliverynf/getDashboardIndicadores',             token, deliveryNF.getDashboardIndicadores);
  app.post('/api/mo/deliverynf/getDashboardDiasEmAtraso',            token, deliveryNF.getDashboardDiasEmAtraso);
  app.post('/api/mo/deliverynf/getDashboardEntregas',                token, deliveryNF.getDashboardEntregas);
  app.post('/api/mo/deliverynf/getDashboardDemanda',                 token, deliveryNF.getDashboardDemanda);
  app.post('/api/mo/deliverynf/getRastreio',                         token, deliveryNF.getRastreio);
  app.post('/api/mo/deliverynf/isValidSendRastreio',                 token, deliveryNF.isValidSendRastreio);
  app.post('/api/mo/deliverynf/sendRastreio',                        token, deliveryNF.sendRastreio);
  app.post('/api/mo/deliverynf/validaPermissaoRastreio',             token, deliveryNF.validaPermissaoRastreio);
  app.post('/api/mo/deliverynf/validaRastreio',                      deliveryNF.validaRastreio);
  app.post('/api/mo/deliverynf/descadastroRastreio',                 deliveryNF.descadastroRastreio);
  app.post('/api/mo/deliverynf/validaRastreioAg',                    deliveryNF.validaRastreioAg);
  //app.post('/api/mo/deliverynf/enviarSatisfacao',                    token, deliveryNF.enviarSatisfacao);
  app.post('/api/mo/deliverynf/enviarSatisfacaoUnico',               token, deliveryNF.enviarSatisfacaoUnico);
  app.post('/api/mo/deliverynf/validaSatisfacao',                    deliveryNF.validaSatisfacao);
  app.post('/api/mo/deliverynf/salvarSatisfacao',                    deliveryNF.salvarSatisfacao);
  app.post('/api/mo/deliverynf/salvarNotaAlterada',                    deliveryNF.salvarNotaAlterada);
  app.post('/api/mo/deliverynf/getComentario',                       token,   deliveryNF.getComentario);
  app.post('/api/mo/deliverynf/salvarResposta',                      token,   deliveryNF.salvarResposta);
  app.post('/api/mo/deliverynf/unsubSatisfacao',                    deliveryNF.unsubSatisfacao);
  app.post('/api/mo/deliverynf/getListUnsubMail',                    deliveryNF.getListUnsubMail);
  app.post('/api/mo/deliverynf/enableMailReceptionNPS',                    deliveryNF.enableMailReceptionNPS);
  

  app.put('/api/file/monitoria/upload/canhoto',    token,  uploadMulter.any(), (req, res, next) => {        
    deliveryNF.uploadCanhotoMo(req, res, next);
  });


  app.post('/api/mo/deliverynf/listarPorCarga',        token, deliveryNF.listarPorCarga);
  app.post('/api/mo/deliverynf/listarPorConhecimento', token, deliveryNF.listarPorConhecimento);

  // rotas para a 140 que chamam o EVT por conta da requisição https 
  app.post('/api/mo/deliverynf/listarQmAux', token, deliveryNF.listarQMAux);
  app.post('/api/mo/deliverynf/listarConteudoQMAux', token, deliveryNF.listarConteudoQMAux);
  app.post('/api/mo/deliverynf/visualizarQMAux', token, deliveryNF.visualizarQMAux);

  // listar itens da pasta do QM
  app.post('/api/mo/deliverynf/listarQm', token, deliveryNF.listarQM);
  // listar conteudo do arquivo do QM
  app.post('/api/mo/deliverynf/listarConteudoQM', token, deliveryNF.listarConteudoQM);

  app.post('/api/mo/deliverynf/visualizarQM', token, deliveryNF.visualizarQM);


  //ROTAS PARA CHAMADA DAS FUNÇÕES DO CANHOTO QUE FICAM NO SERVIDOR DE EVENTOS
  app.put('/api/file/monitoria/upload/canhoto',    token,  uploadMulter.any(), (req, res, next) => {        
    deliveryNF.uploadCanhotoMo(req, res, next);
  });
  app.post('/api/mo/deliverynf/auxGerarXML', token, deliveryNF.auxGerarXML);

  //Rota para documento DANFE
  app.post('/api/mo/deliverynf/danfeGeneratorByXml', token, deliveryNF.danfeGeneratorByXml);
  app.get('/api/mo/deliverynf/downloadXmlDocs/:NRCHADOC', token, deliveryNF.downloadXmlDocs);

  //Rota para documento DACTE
  app.post('/api/mo/deliverynf/dacteGeneratorByXml', token, deliveryNF.dacteGeneratorByXml);

// ROTAS PARA CHAMADA DE CRON MANUAL
let cronMod  = app.src.modMonitoria.controllers.CronController;
app.get('/api/mo/startCronMonitoriaRastreio',                         cronMod.envioRastereioCteMonitoria);
app.get('/api/mo/startCronMonitoriaNps',                              cronMod.envioNpsMonitoria);
app.get('/api/mo/cronMonitoriaRastreioAlteracaoData',                 cronMod.envioRastreioAlteracaoData);
app.get('/api/mo/rastreioQM',                                         cronMod.rastreioQM);
app.get('/api/mo/setaMotivoEntregaAtrasada',                          cronMod.setaMotivoEntregaAtrasada);
app.get('/api/mo/retroativoXML',                                      cronMod.retroativoXML);

  
  //ROTAS AÇÕES
  let acoes  = app.src.modMonitoria.controllers.AcoesController;
  app.post('/api/mo/acoes/listar', token   , acoes.listar);
  app.post('/api/mo/acoes/salvar', token   , acoes.salvar);
  app.post('/api/mo/acoes/buscar', token   , acoes.buscar);
  app.post('/api/mo/acoes/atualizar', token, acoes.atualizar);
  app.post('/api/mo/acoes/remover', token, acoes.deletar);
  
  //ROTAS Atendimentos
  let atendimentos  = app.src.modMonitoria.controllers.AtendimentoController;

  var multer        = require('multer');
  var storageMulter = multer.memoryStorage();
  var uploadMulter  = multer({ storage: storageMulter });

  app.post('/api/mo/atendimentos/getIndicadoresEmAberto',         token, atendimentos.getIndicadoresEmAberto);
  app.post('/api/mo/atendimentos/getTiposDeAcao',                 token, atendimentos.getTiposDeAcao);
  app.post('/api/mo/atendimentos/getAllMotivos',                  token, atendimentos.getAllMotivos);
  app.post('/api/mo/atendimentos/listar',                         token, atendimentos.listar);
  app.post('/api/mo/atendimentos/listarByNfe',                    token, atendimentos.listarByNfe);
  app.post('/api/mo/atendimentos/salvarNovoAtendimento',          token, atendimentos.salvarNovoAtendimento);
  app.post('/api/mo/atendimentos/salvarFinalizarNovoAtendimento', token, atendimentos.salvarFinalizarNovoAtendimento);
  app.post('/api/mo/atendimentos/getInformacoesAtendimento',      token, atendimentos.getInformacoesAtendimento);
  app.post('/api/mo/atendimentos/getMovimentacoesAtendimento',    token, atendimentos.getMovimentacoesAtendimento);
  app.post('/api/mo/atendimentos/salvarMovimentacao',             token, atendimentos.salvarMovimentacao);
  app.post('/api/mo/atendimentos/salvarEditaMovimentacao',        token, atendimentos.salvarEditaMovimentacao);
  app.post('/api/mo/atendimentos/atendentes',                     token, atendimentos.getAtendentesCockpit);
  app.post('/api/mo/atendimentos/clientesCockpit',                token, atendimentos.getClientesCockpit);
  app.post('/api/mo/atendimentos/listarRelatorioAtendimento',     token, atendimentos.listarRelatorioAtendimento);
  app.post('/api/mo/atendimentos/listarRelatorioPerformance',     token, atendimentos.listarRelatorioPerformance);
  app.post('/api/mo/atendimentos/listarRelatorioAlteracaoDatas',  token, atendimentos.listarRelatorioAlteracaoDatas);
  app.post('/api/mo/atendimentos/listarMovNotificacoes',          token, atendimentos.listarMovNotificacoes);
  app.post('/api/mo/atendimentos/listarAvaliacoesPesquisa',       token, atendimentos.listarAvaliacoesPesquisa);
  app.post('/api/mo/atendimentos/listNpsByClient',                token, atendimentos.listNpsByClient);
  app.post('/api/mo/atendimentos/listaStEmail',             token, atendimentos.listaStEmail);
  app.post('/api/mo/atendimentos/visualizarAnexo',                token, atendimentos.visualizarAnexo);
  app.post('/api/mo/atendimentos/salvarAtendimentoDataCanhot',    token, atendimentos.salvarAtendimentoDataCanhot);
  app.post('/api/mo/atendimentos/uploadFileOC',                   token,  uploadMulter.any(), (req, res, next) => {        
    atendimentos.uploadFileOC(req, res, next);
  });
  app.post('/api/mo/atendimentos/listarEnvioRastreio',            token, atendimentos.listarEnvioRastreio);
  app.post('/api/mo/atendimentos/listRastreioByClient',           token, atendimentos.listRastreioByClient);

  app.post('/api/mo/atendimentos/listarTransferencia',  token, atendimentos.listarTransferencia);
  app.post('/api/mo/atendimentos/fluxoTransportadora',  token, atendimentos.fluxoTransportadora);

  app.post('/api/mo/atendimentos/downloadAnexo',          token, atendimentos.downloadAnexo);
  app.post('/api/mo/atendimentos/salvarFinalizarNovoAtendimentoReasonCode', token, atendimentos.salvarFinalizarNovoAtendimentoReasonCode);
  app.post('/api/mo/atendimentos/getAllMotivos4PL',                  token, atendimentos.getAllMotivos4PL);
  app.post('/api/mo/atendimentos/salvarFinalizarNovoAtendimentoMotivoQM', token, atendimentos.salvarFinalizarNovoAtendimentoMotivoQM);
  
  app.post('/api/mo/atendimentos/getDashboardAtendimentoPorAtendente', token, atendimentos.getDashboardAtendimentoPorAtendente);
  app.post('/api/mo/atendimentos/getDashboardTempoAtendimento', token, atendimentos.getDashboardTempoAtendimento);
  app.post('/api/mo/atendimentos/getDashboardAbertoXFinalizado',  token, atendimentos.getDashboardAbertoXFinalizado);
  app.post('/api/mo/atendimentos/getDashboardSituacaoAtendimento', token, atendimentos.getDashboardSituacaoAtendimento);
  app.post('/api/mo/atendimentos/getDashboardAcaoXMotivo',  token, atendimentos.getDashboardAcaoXMotivo);
  app.post('/api/mo/atendimentos/salvarFinalizarNovoAtendimentoRecusa', token, atendimentos.salvarFinalizarNovoAtendimentoRecusa);
  app.post('/api/mo/atendimentos/buscaUltimoMotivo', token, atendimentos.buscaUltimoMotivo);
  app.post('/api/mo/atendimentos/buscaManterSla', token, atendimentos.buscaManterSla);
  app.post('/api/mo/atendimentos/removeAtendimento', token, atendimentos.removeAtendimento);
  app.post('/api/mo/atendimentos/salvarRemocaoEntrega', token, atendimentos.salvarRemocaoEntrega);

  app.post('/api/mo/atendimentos/grupos-atendimento', token, atendimentos.listarGrupos);
  app.post('/api/mo/atendimentos/salvarGrupo', token, atendimentos.salvarGrupo);
  app.post('/api/mo/atendimentos/removerGrupo', token, atendimentos.removerGrupo);
  app.post('/api/mo/atendimentos/salvarContato', token, atendimentos.inserirContatoAtendimento);
  app.post('/api/mo/atendimentos/buscaInfoContatoAtendimento', token, atendimentos.buscaInfoContatoAtendimento);
  app.post('/api/mo/atendimentos/listarContatosAtendimento', token, atendimentos.listarContatosAtendimento);
  app.post('/api/mo/atendimentos/alterarContatoAtendimento', token, atendimentos.alterarContatoAtendimento);
  app.post('/api/mo/atendimentos/cancelarRecusa', token, atendimentos.cancelarRecusa);
  app.post('/api/mo/atendimentos/listarVinculoAtendentes', token, atendimentos.listarVinculoAtendentes);
  app.post('/api/mo/atendimentos/vinculaAtendente', token, atendimentos.vinculaAtendente);
  app.post('/api/mo/atendimentos/removerVinculoAtend', token, atendimentos.removerVinculoAtend);
  app.post('/api/mo/atendimentos/getAtendentesCockpitConfig', token, atendimentos.getAtendentesCockpitConfig);
  app.post('/api/mo/atendimentos/getDashboardsNps',         token, atendimentos.getDashboardsNps);
  app.post('/api/mo/atendimentos/relatorioAg',              token, atendimentos.getRelatorioAg);

  //ROTAS MOTIVOS
  let motivos  = app.src.modMonitoria.controllers.MotivosController;
  app.post('/api/mo/motivos/listar', token   , motivos.listar);
  app.post('/api/mo/motivos/salvar', token   , motivos.salvar);
  app.post('/api/mo/motivos/buscar', token   , motivos.buscar);
  app.post('/api/mo/motivos/atualizar', token, motivos.atualizar);
  app.post('/api/mo/motivos/remover', token  , motivos.deletar);

  let cidadeTarifa = app.src.modMonitoria.controllers.CidadeTarifaController;
  app.post('/api/mo/cidadeTarifa/getDiasEntrega', token, cidadeTarifa.getDiasEntrega); // token 
  
};
