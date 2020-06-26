module.exports = function(app) {

    var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
    var multer = require('multer');
    var storageMulter = multer.memoryStorage();
    var uploadMulter = multer({ storage: storageMulter });

    var montagemCarga = app.src.modTransportation.controllers.MontagemCargaController;

    app.post('/api/tp/montagemCarga/listar', token, montagemCarga.listar);
    app.post('/api/tp/montagemCarga/excluir', token, montagemCarga.excluir);
    app.post('/api/tp/montagemCarga/salvar', token, montagemCarga.salvar);
    app.post('/api/tp/montagemCarga/indicadores/:IDG024TR', token, montagemCarga.indicadoresMountingLoad);
    app.post('/api/tp/montagemCarga/indicadores4pl/:IDG024TR', token, montagemCarga.indicadoresMountingLoad4pl);
    // app.post('/api/tp/montagemcarga/gerarAgenda', token, montagemCarga.gerarAgenda);
    // app.post('/api/tp/montagemcarga/deleteSlots', token, montagemCarga.deleteSlots);
    app.post('/api/tp/montagemCarga/salvarReprocessarCarga', token, montagemCarga.salvarReprocessarCarga);
    app.post('/api/tp/montagemCarga/getArmazemColeta', token, montagemCarga.getArmazemColeta);
    app.post('/api/tp/montagemCarga/getCapacidadePeso', token, montagemCarga.getCapacidadePeso);
    // app.post('/api/tp/montagemCarga/setTipoTransporte', token, montagemCarga.setTipoTransporte);
    app.post('/api/tp/montagemCarga/recalculoPrazoEntrega', token, montagemCarga.recalculoPrazoEntrega);





    var deParaCarga = app.src.modTransportation.controllers.DeParaCargaController;

    app.post('/api/tp/deParaCarga/salvar', token, deParaCarga.salvar);
    app.post('/api/tp/deParaCarga/atualizar', token, deParaCarga.atualizar);
    app.post('/api/tp/deParaCarga/excluir', token, deParaCarga.excluir);
    app.post('/api/tp/deParaCarga/listar', token, deParaCarga.listar);
    app.post('/api/tp/deParaCarga/buscar', token, deParaCarga.buscar);



    var relatorio = app.src.modTransportation.controllers.RelatorioController;

    app.post('/api/tp/cargaParadas/listar', token, relatorio.listar);
    app.post('/api/tp/cargaParadas/buscar', token, relatorio.buscar);


    var ctrcExpedir = app.src.modTransportation.controllers.CtrcExpedirController;

    app.post('/api/tp/ctrcExpedir/listar', token, ctrcExpedir.listar);
    app.post('/api/tp/ctrcExpedir/buscar', token, ctrcExpedir.buscar);


    var analiseCarga = app.src.modTransportation.controllers.AnaliseCargaController;

    app.post('/api/tp/analiseCarga/listar', token, analiseCarga.listar);
    // app.post('/api/tp/analiseCarga/buscar', token, analiseCarga.buscar);

    var documentoPendenteCarga = app.src.modTransportation.controllers.DocumentoPendenteCargaController;

    app.post('/api/tp/documentoPendenteCarga/listar', token, documentoPendenteCarga.listar);
    //app.post('/api/tp/documentoPendenteCarga/buscar', token, documentoPendenteCarga.buscar);


    var rota = app.src.modTransportation.controllers.RotaController;

    //# ROTA
    app.post('/api/tp/rota/salvarRota', token, rota.salvarRota);
    app.post('/api/tp/rota/atualizarRota', token, rota.atualizarRota);
    app.post('/api/tp/rota/excluirRota', token, rota.excluirRota);
    app.post('/api/tp/rota/listarRota', token, rota.listarRota);
    app.post('/api/tp/rota/buscarRota', token, rota.buscarRota);

    //# CIDADE
    app.post('/api/tp/rota/salvarCidade', token, rota.salvarCidade);
    app.post('/api/tp/rota/atualizarCidade', token, rota.atualizarCidade);
    app.post('/api/tp/rota/excluirCidade', token, rota.excluirCidade);
    app.post('/api/tp/rota/listarCidade', token, rota.listarCidade);
    app.post('/api/tp/rota/buscarCidade', token, rota.buscarCidade);

    //# CLIENTE
    app.post('/api/tp/rota/salvarCliente', token, rota.salvarCliente);
    app.post('/api/tp/rota/atualizarCliente', token, rota.atualizarCliente);
    app.post('/api/tp/rota/excluirCliente', token, rota.excluirCliente);
    app.post('/api/tp/rota/listarCliente', token, rota.listarCliente);
    app.post('/api/tp/rota/buscarCliente', token, rota.buscarCliente);

    //# CLUSTER
    app.post('/api/tp/rota/salvarCluster', token, rota.salvarCluster);
    app.post('/api/tp/rota/atualizarCluster', token, rota.atualizarCluster);
    app.post('/api/tp/rota/excluirCluster', token, rota.excluirCluster);
    app.post('/api/tp/rota/listarCluster', token, rota.listarCluster);
    app.post('/api/tp/rota/buscarCluster', token, rota.buscarCluster);

    var historicoOcorrencia = app.src.modTransportation.controllers.HistoricoOcorrenciaCargaController;

    //# HISTORICO
    app.post('/api/tp/historicoOcorrencia/salvar', token, historicoOcorrencia.salvar);
    app.post('/api/tp/historicoOcorrencia/atualizar', token, historicoOcorrencia.atualizar);
    app.post('/api/tp/historicoOcorrencia/excluir', token, historicoOcorrencia.excluir);
    app.post('/api/tp/historicoOcorrencia/listar', token, historicoOcorrencia.listar);
    app.post('/api/tp/historicoOcorrencia/buscar', token, historicoOcorrencia.buscar);

    var cidadetarifa = app.src.modTransportation.controllers.CidadeTarifaController;

    //# CidadeTarifa
    app.post('/api/tp/cidadetarifa/salvar', token, cidadetarifa.salvar);
    app.post('/api/tp/cidadetarifa/atualizar', token, cidadetarifa.atualizar);
    app.post('/api/tp/cidadetarifa/excluir', token, cidadetarifa.excluir);
    app.post('/api/tp/cidadetarifa/listar', token, cidadetarifa.listar);
    app.post('/api/tp/cidadetarifa/buscar', token, cidadetarifa.buscar);


    var ocorrencia = app.src.modTransportation.controllers.OcorrenciaCargaController;

    //# OCORRÊNCIA
    app.post('/api/tp/ocorrencia/salvar', token, ocorrencia.salvar);
    app.post('/api/tp/ocorrencia/atualizar', token, ocorrencia.atualizar);
    app.post('/api/tp/ocorrencia/excluir', token, ocorrencia.excluir);
    app.post('/api/tp/ocorrencia/listar', token, ocorrencia.listar);
    app.post('/api/tp/ocorrencia/buscar', token, ocorrencia.buscar);



    var apolice = app.src.modTransportation.controllers.ApoliceController;

    app.post('/api/tp/apolice/salvar', token, apolice.salvar);
    app.post('/api/tp/apolice/atualizar', token, apolice.atualizar);
    app.post('/api/tp/apolice/excluir', token, apolice.excluir);
    app.post('/api/tp/apolice/listar', token, apolice.listar);
    app.post('/api/tp/apolice/buscar', token, apolice.buscar);



    var seguradora = app.src.modTransportation.controllers.SeguradoraController;

    app.post('/api/tp/seguradora/salvar', token, seguradora.salvar);
    app.post('/api/tp/seguradora/atualizar', token, seguradora.atualizar);
    app.post('/api/tp/seguradora/excluir', token, seguradora.excluir);
    app.post('/api/tp/seguradora/listar', token, seguradora.listar);
    app.post('/api/tp/seguradora/buscar', token, seguradora.buscar);


    var niveisOcorrencia = app.src.modTransportation.controllers.NiveisOcorrenciaController;

    app.post('/api/tp/niveisOcorrencia/salvar', token, niveisOcorrencia.salvar);
    app.post('/api/tp/niveisOcorrencia/atualizar', token, niveisOcorrencia.atualizar);
    app.post('/api/tp/niveisOcorrencia/excluir', token, niveisOcorrencia.excluir);
    app.post('/api/tp/niveisOcorrencia/listar', token, niveisOcorrencia.listar);
    app.post('/api/tp/niveisOcorrencia/buscar', token, niveisOcorrencia.buscar);


    var parametrosGeraisCarga = app.src.modTransportation.controllers.ParametrosGeraisCargaController;

    app.post('/api/tp/parametrosGeraisCarga/salvar', token, parametrosGeraisCarga.salvar);
    app.post('/api/tp/parametrosGeraisCarga/atualizar', token, parametrosGeraisCarga.atualizar);
    app.post('/api/tp/parametrosGeraisCarga/excluir', token, parametrosGeraisCarga.excluir);
    app.post('/api/tp/parametrosGeraisCarga/listar', token, parametrosGeraisCarga.listar);
    app.post('/api/tp/parametrosGeraisCarga/buscar', token, parametrosGeraisCarga.buscar);


    var cockpit = app.src.modTransportation.controllers.CockpitController;

    app.post('/api/tp/cockpit/listar', token, cockpit.listar);
    app.post('/api/tp/cockpit/buscarDetalhe', token, cockpit.buscarDetalhe);
    app.post('/api/tp/cockpit/buscarDetalheRedirect', token, cockpit.buscarDetalheRedirect);


    var mountLoad = app.src.modTransportation.controllers.MontagemCargaController;

    app.post('/api/tp/mountLoad/listarDocumentos', token, mountLoad.listarDocumentos);

    app.post('/api/tp/mountLoad/listarParadas', token, mountLoad.listarParadas);

    app.post('/api/tp/mountLoad/salvarCarga', token, mountLoad.salvarCarga);

    app.post('/api/tp/mountLoad/validacaoDatas', token, mountLoad.validacaoDatas);

    app.post('/api/tp/mountLoad/validarCarga', token, mountLoad.validarCarga);


    // app.post('/api/tp/mountLoad/salvar', token, mountLoad.salvar);
    // app.post('/api/tp/mountLoad/atualizar', token, mountLoad.atualizar);
    // app.post('/api/tp/mountLoad/excluir', token, mountLoad.excluir);
    // app.post('/api/tp/mountLoad/listar', token, mountLoad.listar);
    // app.post('/api/tp/mountLoad/buscar', token, mountLoad.buscar);



    var liberacaoOcorrencia = app.src.modTransportation.controllers.LiberacaoOcorrenciaController;

    app.post('/api/tp/liberacaoOcorrencia/menuIndi', token, liberacaoOcorrencia.menuIndi);
    app.post('/api/tp/liberacaoOcorrencia/listar', token, liberacaoOcorrencia.listar);
    app.post('/api/tp/liberacaoOcorrencia/aprovar', token, liberacaoOcorrencia.aprovar);
    app.post('/api/tp/liberacaoOcorrencia/reprovar', token, liberacaoOcorrencia.reprovar);




    var carga = app.src.modTransportation.controllers.CargaController;

    app.post('/api/tp/carga/desmontarCarga', token, carga.desmontarCarga);
    app.post('/api/tp/carga/cancelarCarga', token, carga.cancelarCarga);
    app.post('/api/tp/carga/listar', token, carga.listar);
    app.post('/api/tp/carga/qtdTotal', token, carga.qtdTotal);
    app.post('/api/tp/carga/listarDocumentos', token, carga.listarDocumentos);
    app.post('/api/tp/carga/indicadores', token, carga.indicadoresCarga);
    app.post('/api/tp/carga/validaCancelar', token, carga.validaCancelar);
    app.post('/api/tp/carga/validaMontarCarga4PL', token, carga.validaMontarCarga4PL);
    app.post('/api/tp/carga/atribuirVeiculoMotorista', token, carga.atribuirVeiculoMotorista);
    app.post('/api/tp/carga/mapaCarga', token, carga.mapaCarga);
    app.post('/api/tp/carga/mapaExpedicao', token, carga.mapaExpedicao);
    app.post('/api/tp/carga/listarAtribuirOutrosDocumentos', token, carga.listarAtribuirOutrosDocumentos);
    app.post('/api/tp/carga/deliverysCarga', token, carga.deliverysCarga);
    app.post('/api/tp/carga/deliverysSelecionadasCarga', token, carga.deliverysSelecionadasCarga);
    app.post('/api/tp/carga/qtdSituacaoCargas', token, carga.qtdSituacaoCargas);
    app.post('/api/tp/carga/atribuicaoMobileCarga', token, carga.atribuicaoMobileCarga);
    app.post('/api/tp/carga/getManifesto', token, carga.getManifesto);
    app.post('/api/tp/carga/savePrintLog', token, carga.savePrintLog);
    app.post('/api/tp/carga/listPrintLog', token, carga.listPrintLog);




    var mobile = app.src.modTransportation.controllers.MobileController;

    //app.post('/api/tp/mobile/desmontarMobile', token, mobile.desmontarMobile);
    //app.post('/api/tp/mobile/cancelarMobile', token, mobile.cancelarMobile);
    app.post('/api/tp/mobile/listar', token, mobile.listar);
    //app.post('/api/tp/mobile/listarDocumentos', token, mobile.listarDocumentos);
    app.post('/api/tp/mobile/indicadores', token, mobile.indicadoresMobile);
    //app.post('/api/tp/mobile/validaCancelar', token, mobile.validaCancelar);
    //app.post('/api/tp/mobile/atribuirVeiculoMotorista', token, mobile.atribuirVeiculoMotorista);
    app.post('/api/tp/mobile/qtdSituacaoMobile', token, mobile.qtdSituacaoMobile);

    //app.post('/api/tp/mobile/mapaMobile', token, mobile.mapaMobile);




    var conhecimento = app.src.modTransportation.controllers.ConhecimentoController;

    app.post('/api/tp/conhecimento/listar', token, conhecimento.listar);
    app.post('/api/tp/conhecimento/listarCarga', token, conhecimento.listarCarga);

    app.post('/api/tp/conhecimento/listarNfe', token, conhecimento.listarNfe);
    app.post('/api/tp/conhecimento/atribuirDataEntrega', token, conhecimento.atribuirDataEntrega);
    app.post('/api/tp/conhecimento/alteracaoDataPrevisaoEntrega', token, conhecimento.alteracaoDataPrevisaoEntrega);

    app.post('/api/tp/conhecimento/listarLiberaConhecimentos', token, conhecimento.listarLiberaConhecimentos);
    app.post('/api/tp/conhecimento/liberarConhecimento', token, conhecimento.liberarConhecimento);
    app.post('/api/tp/conhecimento/listarInfConhecimento', token, conhecimento.listarInfConhecimento);
    app.post('/api/tp/conhecimento/listarInfMovimento', token, conhecimento.listarInfMovimento);
    app.post('/api/tp/conhecimento/listarInfNotas', token, conhecimento.listarInfNotas);
    app.post('/api/tp/conhecimento/listarInfProdutos', token, conhecimento.listarInfProdutos);

    var Parada = app.src.modTransportation.controllers.ParadaController;

    app.post('/api/tp/parada/listar', token, Parada.listar);
    app.post('/api/tp/parada/listarNfe', token, Parada.listarNfe);
    app.post('/api/tp/parada/listarInfparada', token, Parada.listarInfparada);
    app.post('/api/tp/parada/listarInfProdutos', token, Parada.listarInfProdutos);
    app.post('/api/tp/parada/listarNotaRaioX', token, Parada.listarNotaRaioX);
    app.post('/api/tp/parada/listarPorCargaRaioX', token, Parada.listarPorCargaRaioX);
    app.post('/api/tp/parada/listarPorConhecimentoRaioX', token, Parada.listarPorConhecimentoRaioX);

    var restricoesCliente = app.src.modTransportation.controllers.RestricoesClienteController;

    //# RESTRIÇÕES CLIENTE
    app.post('/api/tp/restricoesCliente/salvar', token, restricoesCliente.salvar);
    app.post('/api/tp/restricoesCliente/excluir', token, restricoesCliente.excluir);
    app.post('/api/tp/restricoesCliente/listar', token, restricoesCliente.listar);


    var grupoOcorrencia = app.src.modTransportation.controllers.GrupoOcorrenciaController;

    app.post('/api/tp/grupoOcorrencia/salvar', token, grupoOcorrencia.salvar);
    app.post('/api/tp/grupoOcorrencia/atualizar', token, grupoOcorrencia.atualizar);
    app.post('/api/tp/grupoOcorrencia/excluir', token, grupoOcorrencia.excluir);
    app.post('/api/tp/grupoOcorrencia/listar', token, grupoOcorrencia.listar);
    app.post('/api/tp/grupoOcorrencia/buscar', token, grupoOcorrencia.buscar);


    var usuarioGrupoOcorrencia = app.src.modTransportation.controllers.UsuarioGrupoOcorrenciaController;

    app.post('/api/tp/usuarioGrupoOcorrencia/salvar', token, usuarioGrupoOcorrencia.salvar);
    app.post('/api/tp/usuarioGrupoOcorrencia/atualizar', token, usuarioGrupoOcorrencia.atualizar);
    app.post('/api/tp/usuarioGrupoOcorrencia/excluir', token, usuarioGrupoOcorrencia.excluir);
    app.post('/api/tp/usuarioGrupoOcorrencia/listar', token, usuarioGrupoOcorrencia.listar);
    app.post('/api/tp/usuarioGrupoOcorrencia/buscar', token, usuarioGrupoOcorrencia.buscar);

    //Dados Carga
    var dadosCarga = app.src.modTransportation.controllers.DadosCargaController;

    app.post('/api/tp/dadosCarga/getInformacoesCargaCompletaSemAcl', token, dadosCarga.getInformacoesCargaCompletaSemAcl);
    app.post('/api/tp/dadosCarga/getInformacoesCTeSemAcl', token, dadosCarga.getInformacoesCTeSemAcl);
    app.post('/api/tp/dadosCarga/getCanhoto', token, dadosCarga.getCanhoto);


    //Dados Carga
    var gestaoRecurso = app.src.modTransportation.controllers.GestaoRecursoController;

    app.post('/api/tp/gestaoRecurso/frota', token, gestaoRecurso.listarFrota);

    //Info Carga(Neo Dados Carga)
    var infoCarga = app.src.modTransportation.controllers.InfoCargaController;
    app.post('/api/tp/infoCarga/getInformacoesCargaGeralSemAcl', token, infoCarga.getInformacoesCargaCompletaSemAcl);
    app.post('/api/tp/infoCarga/gridInfoCarga', token, infoCarga.getGrid);



    //# QRCODE
    var qrcode = app.src.modTransportation.controllers.QrCodeController;

    app.post('/api/tp/qrcode/salvar', token, qrcode.salvar);
    app.post('/api/tp/qrcode/atualizar', token, qrcode.atualizar);
    app.post('/api/tp/qrcode/excluir', token, qrcode.excluir);
    app.post('/api/tp/qrcode/listar', token, qrcode.listar);
    app.post('/api/tp/qrcode/buscar', token, qrcode.buscar);
    app.post('/api/tp/qrcode/autentica', qrcode.autenticaQrCode);
    app.post('/api/tp/qrcode/atualizarMotorista', qrcode.atualizarMotorista);

    //#LOGS
    var logs = app.src.modTransportation.controllers.LogController;

    app.post('/api/tp/logs/listar', token, logs.listarLog);
    app.post('/api/tp/logs/buscar', token, logs.buscarLog);
    app.post('/api/tp/logs/listarTimeLine', token, logs.listarTimeLine);

    var importDAO = app.src.modTestes.dao.importDAO;
    app.get('/api/importDAO/:sequencia', importDAO.import);

    //#LOGS APLICACAO
    var logsAplicacao = app.src.modTransportation.controllers.LogAplicacaoController;

    app.post('/api/tp/logsAplicacao/listar', token, logsAplicacao.listarLogAplicacao);
    app.post('/api/tp/logsAplicacao/buscar', token, logsAplicacao.buscarLogAplicacao);

    //#NOTAS
    var nota = app.src.modTransportation.controllers.NotaController;

    app.post('/api/tp/nota/listar', token, nota.listar);

    //# ARMAZEM TRANSPORTADORA
    var armazemTransportadora = app.src.modTransportation.controllers.ArmazemTransportadoraController;

    app.post('/api/tp/armazemTransp/listarArmazemTransp', token, armazemTransportadora.listarArmazemTransp);
    app.post('/api/tp/armazemTransp/buscarArmazemTransp', token, armazemTransportadora.buscarArmazemTransp);
    app.post('/api/tp/armazemTransp/salvarArmazemTransp', token, armazemTransportadora.salvarArmazemTransp);
    app.post('/api/tp/armazemTransp/atualizarArmazemTransp', token, armazemTransportadora.atualizarArmazemTransp);
    app.post('/api/tp/armazemTransp/excluirArmazemTransp', token, armazemTransportadora.excluirArmazemTransp);



    //TIPO VEICULO
    var tipoVeiculo = app.src.modTransportation.controllers.TipoVeiculoController;

    app.post('/api/tp/tipoveiculo/salvar', token, tipoVeiculo.salvar);
    app.post('/api/tp/tipoveiculo/atualizar', token, tipoVeiculo.atualizar);
    app.post('/api/tp/tipoveiculo/excluir', token, tipoVeiculo.excluir);
    app.post('/api/tp/tipoveiculo/listar', token, tipoVeiculo.listar);
    app.post('/api/tp/tipoveiculo/buscar', token, tipoVeiculo.buscar);

    // CAMPANHA
    var campanha = app.src.modTransportation.controllers.CampanhaController;

    app.post('/api/tp/campanha/salvar', token, campanha.salvar);
    app.post('/api/tp/campanha/atualizar', token, campanha.atualizar);
    app.post('/api/tp/campanha/excluir', token, campanha.excluir);
    app.post('/api/tp/campanha/listar', token, campanha.listar);
    app.post('/api/tp/campanha/buscar', token, campanha.buscar);


    // LANÇAMENTO CAMPANHA
    var lancamentoCampanha = app.src.modTransportation.controllers.LancamentoCampanhaController;

    app.post('/api/tp/lancamentoCampanha/salvar', token, lancamentoCampanha.salvar);
    app.post('/api/tp/lancamentoCampanha/atualizar', token, lancamentoCampanha.atualizar);
    app.post('/api/tp/lancamentoCampanha/excluir', token, lancamentoCampanha.excluir);
    app.post('/api/tp/lancamentoCampanha/listar', token, lancamentoCampanha.listar);
    app.post('/api/tp/lancamentoCampanha/buscar', token, lancamentoCampanha.buscar);
    app.post('/api/tp/lancamentoCampanha/buscarTransportadoras', token, lancamentoCampanha.buscarTransportadoras);

    app.post('/api/tp/lancamentoCampanha/listarMotoristasRelatorio', token, lancamentoCampanha.listarMotoristasRelatorio);
    app.post('/api/tp/lancamentoCampanha/listarMotoristas', token, lancamentoCampanha.listarMotoristas);
    app.post('/api/tp/lancamentoCampanha/buscarApontamentoExistentes', token, lancamentoCampanha.buscarApontamentoExistentes);
    app.post('/api/tp/lancamentoCampanha/lancamentoMotorista', token, lancamentoCampanha.lancamentoMotorista);
    app.post('/api/tp/lancamentoCampanha/lancamentoKmMotorista', token, lancamentoCampanha.lancamentoKmMotorista);
    app.post('/api/tp/lancamentoCampanha/lancamentoMdMotorista', token, lancamentoCampanha.lancamentoMdMotorista);
    app.post('/api/tp/lancamentoCampanha/buscarApontamentoExistentesUser', token, lancamentoCampanha.buscarApontamentoExistentesUser);
    app.post('/api/tp/lancamentoCampanha/buscarApontamentoExistentesUserAcl', token, lancamentoCampanha.buscarApontamentoExistentesUserAcl);
    app.post('/api/tp/lancamentoCampanha/buscarApontamentoExistentesUserRetifica', token, lancamentoCampanha.buscarApontamentoExistentesUserRetifica);
    app.post('/api/tp/lancamentoCampanha/listaLancamento', token, lancamentoCampanha.listaLancamento);
    app.post('/api/tp/lancamentoCampanha/listarAnexoLancamento', token, lancamentoCampanha.listarAnexoLancamento);
    app.post('/api/tp/lancamentoCampanha/excluirAnexoLancamento', token, lancamentoCampanha.excluirAnexoLancamento);

    app.post('/api/tp/lancamentoCampanha/buscaObservacao', token, lancamentoCampanha.buscaObservacao);
    app.post('/api/tp/lancamentoCampanha/atualizaObservacao', token, lancamentoCampanha.atualizaObservacao);

    app.post('/api/tp/lancamentoCampanha/removerLancamento', token, lancamentoCampanha.removerLancamento);
    app.post('/api/tp/lancamentoCampanha/usuariosFechamento', token, lancamentoCampanha.usuariosFechamento);

    app.put('/api/tp/lancamentoCampanha/file', token, uploadMulter.any(), (req, res, next) => {
        lancamentoCampanha.uploadDocumento(req, res, next);
    });

    app.get('/api/tp/lancamentoCampanha/importarExcel', token, lancamentoCampanha.importarExcel);


    // TIPO APONTAMENTO
    var tipoApontamento = app.src.modTransportation.controllers.TipoApontamentoController;

    app.post('/api/tp/tipoApontamento/salvar', token, tipoApontamento.salvar);
    app.post('/api/tp/tipoApontamento/atualizar', token, tipoApontamento.atualizar);
    app.post('/api/tp/tipoApontamento/excluir', token, tipoApontamento.excluir);
    app.post('/api/tp/tipoApontamento/listar', token, tipoApontamento.listar);
    app.post('/api/tp/tipoApontamento/buscar', token, tipoApontamento.buscar);

    // PERMISSOES FECHAMENTO
    var permissoesFechamento = app.src.modTransportation.controllers.PermissoesFechamentoController;

    app.post('/api/tp/permissoesFechamento/salvar', token, permissoesFechamento.salvar);
    app.post('/api/tp/permissoesFechamento/atualizar', token, permissoesFechamento.atualizar);
    app.post('/api/tp/permissoesFechamento/excluir', token, permissoesFechamento.excluir);
    app.post('/api/tp/permissoesFechamento/listar', token, permissoesFechamento.listar);
    app.post('/api/tp/permissoesFechamento/buscar', token, permissoesFechamento.buscar);

    // TIPO APONTAMENTO
    var usuarioApontamento = app.src.modTransportation.controllers.UsuarioApontamentoController;

    app.post('/api/tp/usuarioApontamento/salvar', token, usuarioApontamento.salvar);
    app.post('/api/tp/usuarioApontamento/atualizar', token, usuarioApontamento.atualizar);
    app.post('/api/tp/usuarioApontamento/excluir', token, usuarioApontamento.excluir);
    app.post('/api/tp/usuarioApontamento/listar', token, usuarioApontamento.listar);
    app.post('/api/tp/usuarioApontamento/buscar', token, usuarioApontamento.buscar);


    var teste = app.src.modTestes.controllers.CrlTestes;
    app.post('/api/tp/teste', teste.teste);

    //SEGURANÇA PREMIADA
    var segurancapremiada = app.src.modTransportation.controllers.SegurancaPremiadaController;
    app.get('/api/tp/segurancapremiada/downloadPdfM1/:id', token, segurancapremiada.downloadPdfM1);
    app.get('/api/tp/segurancapremiada/downloadPdfM2/:id', token, segurancapremiada.downloadPdfM2);
    app.post('/api/tp/segurancapremiada/listar', token, segurancapremiada.listar);
    app.post('/api/tp/segurancapremiada/buscaLancMotorista', token, segurancapremiada.buscaLancMotorista);
    app.post('/api/tp/segurancapremiada/fecharLancamentos', token, segurancapremiada.fecharLancamentos);
    app.post('/api/tp/segurancapremiada/validaFechamento', token, segurancapremiada.validaFechamento);



    //MDF-e
    var mdfe = app.src.modTransportation.controllers.MdfeController;
    app.post('/api/tp/mdfe/indicadoresMdfe',    token, mdfe.indicadoresMdfe);
    app.post('/api/tp/mdfe/listar',             token, mdfe.listar);
    app.post('/api/tp/mdfe/listarPercurso',     token, mdfe.listarPercurso);
    app.post('/api/tp/mdfe/salvarMdfe',         token, mdfe.salvarMdfe);
    app.post('/api/tp/mdfe/buscarMdfe',         token, mdfe.buscarMdfe);
    app.post('/api/tp/mdfe/atualizarMdfe',      token, mdfe.atualizarMdfe);
    app.post('/api/tp/mdfe/salvarTrocaStatus',  token, mdfe.salvarTrocaStatus);
    app.get('/api/tp/mdfe/downloadXmlMdfe/:id', token, mdfe.gerarXML);
    app.get('/api/tp/mdfe/downloadPdfMdfe/:id', token, mdfe.gerarPDF);
    app.post('/api/tp/mdfe/validarCarga',       token, mdfe.validarCarga);
    app.post('/api/tp/mdfe/validarPdfMdfe',     token, mdfe.validarPdfMdfe);


    //Edi
    var edi = app.src.modTransportation.controllers.EdiController;
    app.get('/api/tp/edi/buscarConfigEdi', token, edi.buscarConfigEdi);
    app.post('/api/tp/edi/getEdiTrackingCliente', token, edi.getEdiTrackingCliente);
    app.post('/api/tp/edi/getEdiList', token, edi.getEdiList);
    app.post('/api/tp/edi/atualizarConfigEdi', token, edi.atualizarConfigEdi);
    app.post('/api/tp/edi/desativarConfigEdi', token, edi.desativarConfigEdi);
    app.post('/api/tp/edi/createConfigEdi', token, edi.createConfigEdi);
    app.post('/api/tp/edi/getCamposEdiList', token, edi.buscaCamposEdiListAll); //Busca G095 inteira
    app.post('/api/tp/edi/getAllFieldsEdi', token, edi.listAllFieldsEdi); //Busca S010 inteira
    app.post('/api/tp/edi/getListFieldToConcat', token, edi.listFieldToConcat); //Busca S010 inteira
    app.post('/api/tp/edi/createNewFieldEdi', token, edi.createNewFieldEdi); //Busca S010 inteira
    app.post('/api/tp/edi/removeFieldEdi', token, edi.removeFieldEdi); //Deleta registro G095 inteira
    app.post('/api/tp/edi/updateOrderField', token, edi.updateOrderField); //Deleta registro G095 inteira

    app.post('/api/tp/edi/visualizarArquivo', token, edi.visualizarArquivo);
    app.post('/api/tp/edi/visualizarArquivoAux', token, edi.visualizarArquivoAux);

    app.post('/api/tp/edi/listarArquivosAux', token, edi.listarArquivosAux);
    app.post('/api/tp/edi/listarArquivos', token, edi.listarArquivos);

    app.post('/api/tp/edi/listarConfigEdi', token, edi.listarConfigEdi);
    app.post('/api/tp/edi/downloadEdiFile', token, edi.downloadEdiFile);
    app.post('/api/tp/edi/downloadEdiFileAux', token, edi.downloadEdiFileAux);

    app.post('/api/tp/edi/processarEdi', token, edi.processarEdi);
    app.post('/api/tp/edi/processarEdiAux', token, edi.processarEdiAux);

    app.post('/api/tp/edi/verificarErro', token, edi.verificarErro);
    app.post('/api/tp/edi/buscaClienteOperacao', token, edi.buscaClienteOperacao);


    //Validacao de Malote
    var validMalote = app.src.modTransportation.controllers.ValidacaoMaloteController;
    app.post('/api/tp/validMalote/listChadocs', token, validMalote.listChadocs);
    app.post('/api/tp/validationDocs/createValidationDocs', token, validMalote.createValidation);



    //Documento de viagem 
    var documentoViagem = app.src.modTransportation.controllers.DocumentoViagemController;
    app.post('/api/tp/documentoViagem/salvar', token, documentoViagem.salvar);
    app.post('/api/tp/documentoViagem/excluir', token, documentoViagem.excluir);
    app.post('/api/tp/documentoViagem/buscarAutor', token, documentoViagem.buscarAutor);
    app.post('/api/tp/documentoViagem/listar', token, documentoViagem.listar);
    app.post('/api/tp/documentoViagem/getDocumentoByAutor', token, documentoViagem.getDocumentoByAutor);

    app.post('/api/tp/documentoViagem/listarPendMotVei', token, documentoViagem.listarPendMotVei);
    app.post('/api/tp/documentoViagem/getDocsPendentesMounting', token, documentoViagem.getDocsPendentesMounting);    
    app.post('/api/tp/documentoViagem/buscarPendTpVeicCli', token, documentoViagem.buscarPendTpVeicCli);  


    app.post('/api/tp/documentoViagem/file', token, uploadMulter.any(), (req, res, next) => {
        documentoViagem.uploadDocumento(req, res, next);
    });
    app.post('/api/tp/documentoViagem/downloadAnexo', token, documentoViagem.downloadAnexo);

    //Suporte
    var suporte = app.src.modTransportation.controllers.SuporteController;
    var deliverysla = app.src.modTransportation.controllers.SlaDeliveryController;
    app.post('/api/tp/suporte/getInfoByCarga', token, suporte.getInfoByCarga);
    app.post('/api/tp/suporte/getInfoByMdf', token, suporte.getInfoByMdf);
    app.post('/api/tp/suporte/getIndMdfVenc', token, suporte.getIndMdfVenc);  
    app.post('/api/tp/suporte/getInfoCTE', token, suporte.getInfoCTE);  
    app.post('/api/tp/deliverysla/verificaSLA', token, deliverysla.verificaSLA);  

    
    //Horario Corte
    var horarioCorte = app.src.modTransportation.controllers.HorarioCorteController;

    app.post('/api/tp/horarioCorte/salvar', token, horarioCorte.salvar);
    app.post('/api/tp/horarioCorte/atualizar', token, horarioCorte.atualizar);
    app.post('/api/tp/horarioCorte/excluir', token, horarioCorte.excluir);
    app.post('/api/tp/horarioCorte/listar', token, horarioCorte.listar);
    app.post('/api/tp/horarioCorte/buscar', token, horarioCorte.buscar);


    //Natureza Carga
    var naturezaCarga = app.src.modTransportation.controllers.NaturezaCargaController;

    app.post('/api/tp/naturezaCarga/salvar', token, naturezaCarga.salvar);
    app.post('/api/tp/naturezaCarga/atualizar', token, naturezaCarga.atualizar);
    app.post('/api/tp/naturezaCarga/atualizarValida', token, naturezaCarga.atualizarValida);
    app.post('/api/tp/naturezaCarga/excluir', token, naturezaCarga.excluir);
    app.post('/api/tp/naturezaCarga/listar', token, naturezaCarga.listar);
    app.post('/api/tp/naturezaCarga/buscar', token, naturezaCarga.buscar);

    //Averbacao
    var averbacao = app.src.modTransportation.controllers.AverbacaoController;

    app.post('/api/tp/averbacao/indicadores', token, averbacao.indicadores);
    app.post('/api/tp/averbacao/notificacao', token, averbacao.notificacao);

    app.post('/api/tp/averbacao/testeIntegracao', token, averbacao.testeIntegracao);
    app.post('/api/tp/averbacao/testeIntegracaoPR', token, averbacao.testeIntegracaoPR);

    app.post('/api/tp/ciot/testeIntegracao', token, averbacao.getDadosCIOT);



};