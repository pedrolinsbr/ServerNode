var multer = require('multer');
var crypto = require("crypto");


var storageMulter = multer.memoryStorage();
var uploadMulter = multer({ storage: storageMulter });

var storageCanhoto = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, DirCanhoto)
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(1, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + file.originalname);
    });
  }
});

var uploadNF = multer({ storage: storageCanhoto });

var storageCheckList = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, DirCheckList)
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(1, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + file.originalname);
    });
  }
});

var uploadChecklist = multer({ storage: storageCheckList });



module.exports = function (app) {

  var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;

    //HORA CERTA 2.0

    //HORÁRIO
    var horario = app.src.modHoraCerta.controllers.HorarioController;

    app.post('/api/hc/horario/getHorarios', token, horario.getHorarios);
    app.post('/api/hc/horario/gerarAgenda', token, horario.gerarAgenda);
    app.post('/api/hc/horario/deleteSlots', token, horario.deleteSlots);

    app.post('/api/hc/horario/horarios-resumido', token, horario.horariosResumido);

    //AGENDAMENTO
    var agendamento = app.src.modHoraCerta.controllers.AgendamentoController;

    //app.post('/api/hc/agendamento/salvar', token, agendamento.salvar);
    app.post('/api/hc/agendamento/salvar-liberacao-saida', token, agendamento.salvarLiberacaoSaida);
    app.post('/api/hc/agendamento/tempoSlots', token, agendamento.tempoSlots);
    app.post('/api/hc/agendamento/status', token, agendamento.trocarStatus);
    app.post('/api/hc/agendamento/comentarios', token, agendamento.atualizarComentarios);
    app.post('/api/hc/agendamento/buscar/comentarios', token, agendamento.buscarComentarios);
    app.post('/api/hc/agendamento/buscar/dataAtual', token, agendamento.buscarDataAtual);
    
    app.post('/api/hc/agendamento/buscar/agendamentos', token, agendamento.buscarAgendamentos);
    app.post('/api/hc/agendamento/buscar/agendamentos/grid', token, agendamento.buscarAgendamentosGrid);
    app.post('/api/hc/agendamento/buscar/timeline', token, agendamento.buscarInfoTimeLine);
    app.post('/api/hc/agendamento/buscar/montarcarga', token, agendamento.buscarMontarCarga);
    app.post('/api/hc/agendamento/buscar/montarcarga/grid', token, agendamento.buscarMontarCargaGrid);
    app.post('/api/hc/nf/up', uploadNF.any(), function (req, res, next) {
        agendamento.uploadNF(req, res, next);
    });
    app.post('/api/hc/nf/delete',token,agendamento.deleteNF);//deleta NF do diretorio
    app.post('/api/hc/agendamento/buscar/NF', token, agendamento.buscarNF);
    app.post('/api/hc/agendamento/buscar/atualizacaoAgendamentos', token, agendamento.atualizacaoAgendamentos);
    app.post('/api/hc/agendamento/buscar/atualizacaoAgendamentosCheckin', token, agendamento.atualizacaoAgendamentosCheckin);
    app.post('/api/hc/agendamento/cancelar/carga-4pl', token, agendamento.cancelarCarga4pl);  //cancela carga 4pl
    app.post('/api/hc/agendamento/grade-acoes', token, agendamento.buscarAcoesGrade);
    app.post('/api/hc/agendamento/buscar/grade-transp', token, agendamento.buscarTranspGrade);
    app.post('/api/hc/agendamento/buscar/parametros', token, agendamento.buscarParametros);
    app.post('/api/hc/agendamento/buscar/armazem-user', token, agendamento.buscarArmazemUser);
    app.post('/api/hc/agendamento/buscar/ordem-carregamento', token, agendamento.buscarOrCarregamento);
    app.post('/api/hc/agendamento/mudar-st-finali', token, agendamento.mudarStFinali);
    app.post('/api/hc/agendamento/editar-agendamento', token, agendamento.editarAgendamento);
    app.post('/api/hc/agendamento/cancelar/agendamento', token, agendamento.cancelarAgendamento); 
    app.post('/api/hc/agendamento/buscar/relatorioNotas', token, agendamento.relatorioNotas);
    app.post('/api/hc/agendamento/salvarBox', token, agendamento.salvarBox);
    app.post('/api/hc/agendamento/buscar/tomadores', token, agendamento.buscarTomador);
    app.post('/api/hc/agendamento/buscar/produtos', token, agendamento.buscarProduto);
    app.post('/api/hc/agendamento/buscar/buscarClienteGrade', token, agendamento.buscarClienteGrade);
    app.post('/api/hc/agendamento/buscar/buscarTimeline', token, agendamento.buscarTimeline);
    app.post('/api/hc/agendamento/buscar/buscarAvancadaAgendamento', token, agendamento.buscarAvancadaAgendamento);
    app.post('/api/hc/agendamento/salvar/salvarNAM', token, agendamento.salvarNAM);
    app.post('/api/hc/agendamento/excluirTerceiro', token, agendamento.excluirTerceiro);
    app.post('/api/hc/agendamento/cancelarPesagens', token, agendamento.cancelarPesagens);
    app.post('/api/hc/agendamento/inverterPesagens', token, agendamento.inverterPesagens);
    app.post('/api/hc/agendamento/trocarDadosAgendamento', token, agendamento.trocarDadosAgendamento);

    app.post('/api/hc/agendamento/email', agendamento.enviarEmail);

    app.get('/api/hc/agendamento/pdf', agendamento.gerarPdf);

    app.post('/api/hc/agendamento/buscar/perfil-user', token, agendamento.buscarPerfilUser);
    app.post('/api/hc/agendamento/mudar-tpPesagem', token, agendamento.mudarTipoPesagem);
    app.post('/api/hc/agendamento/verificaStCarga', token, agendamento.verificaStCarga);
    app.post('/api/hc/agendamento/buscar4PL', token, agendamento.buscar4PL);

    app.post('/api/hc/agendamento/validarCheckList', token, agendamento.validarCheckList);

    app.post('/api/hc/agendamento/buscarDadosCarga', token, agendamento.buscarDadosCarga);

    //REAGENDAR
    var reagendamento = app.src.modHoraCerta.controllers.ReagendamentoController

    app.post('/api/hc/agendamento/Filtro/horarios', token, reagendamento.buscarHorarioReagendar);
    app.post('/api/hc/agendamento/slotsReagendar', token, reagendamento.validaSlotReagendar);
    //app.post('/api/hc/agendamento/reagendar', token, reagendamento.reagendar);

    //PARÂMETROS
    var parametros = app.src.modHoraCerta.controllers.ParametrosController;

    app.post('/api/hc/parametros/salvar', token, parametros.salvar);
    app.post('/api/hc/parametros/atualizar', token, parametros.atualizar);
    app.post('/api/hc/parametros/excluir', token, parametros.excluir);
    app.post('/api/hc/parametros/horarios', token, parametros.horarios);
    app.post('/api/hc/parametros/listar', token, parametros.listar);
    app.post('/api/hc/parametros/listarIntervalo', token, parametros.listarIntervalo);
    app.post('/api/hc/parametros/buscar', token, parametros.buscar);
    app.post('/api/hc/parametros/excluirIntervalo', token, parametros.excluirIntervalo);
    app.post('/api/hc/parametros/intervalos', token, parametros.intervalos);
    app.post('/api/hc/parametros/salvarHorarios', token, parametros.salvarHorarios);
    app.post('/api/hc/parametros/verificaAgendaCriada', token, parametros.verificaAgendaCriada);

    app.post('/api/hc/parametros/salvarIntervalo', token, parametros.salvarIntervalo);
    app.post('/api/hc/parametros/atualizarIntervalo', token, parametros.atualizarIntervalo);


    //SLOTS
    var slots = app.src.modHoraCerta.controllers.SlotsController;

    app.post('/api/hc/slots/getSlots', token, slots.getSlots);
    app.post('/api/hc/slots/atribuirStatus', token, slots.atribuirStatus);
    app.post('/api/hc/slots/replicarStatus', token, slots.replicarStatus);


    // TEMPO STATUS
    var tempoStatus = app.src.modHoraCerta.controllers.TempoStatusController;

    app.post('/api/hc/tempoStatus/salvar', token, tempoStatus.salvar);
    app.post('/api/hc/tempoStatus/atualizar', token, tempoStatus.atualizar);
    app.post('/api/hc/tempoStatus/excluir', token, tempoStatus.excluir);
    app.post('/api/hc/tempoStatus/listar', token, tempoStatus.listar);
    app.post('/api/hc/tempoStatus/buscar', token, tempoStatus.buscar);
    app.post('/api/hc/tempoStatus/buscarStatus', token, tempoStatus.buscarStatus);


    //JANELAS
    var janela = app.src.modHoraCerta.controllers.ConfiguracaoJanelaController;

    app.post('/api/hc/configuracaoJanela/salvar', token, janela.salvar);
    app.post('/api/hc/configuracaoJanela/atualizar', token, janela.atualizar);
    app.post('/api/hc/configuracaoJanela/excluir', token, janela.excluir);
    app.post('/api/hc/configuracaoJanela/listar', token, janela.listar);
    app.post('/api/hc/configuracaoJanela/buscar', token, janela.buscar);
    app.post('/api/hc/configuracaoJanela/alterar-situacao', token, janela.alterarSituacao);


    //TEMPO ARMAZEM
    var tempoArmazem = app.src.modHoraCerta.controllers.TempoArmazemController;

    app.post('/api/hc/tempoArmazem/salvar', token, tempoArmazem.salvar);
    app.post('/api/hc/tempoArmazem/atualizar', token, tempoArmazem.atualizar);
    app.post('/api/hc/tempoArmazem/excluir', token, tempoArmazem.excluir);
    app.post('/api/hc/tempoArmazem/listar', token, tempoArmazem.listar);
    app.post('/api/hc/tempoArmazem/buscar', token, tempoArmazem.buscar);


    //MOTORISTA
    var motorista = app.src.modHoraCerta.controllers.MotoristaController;

    app.post('/api/hc/motorista/salvar', token, motorista.salvar);
    app.post('/api/hc/motorista/salvar/precadastro', token, motorista.salvarPreCadastro);
    app.post('/api/hc/motorista/atualizar', token, motorista.atualizar);
    app.post('/api/hc/motorista/excluir', token, motorista.excluir);
    app.post('/api/hc/motorista/listar', token, motorista.listar);
    app.post('/api/hc/motorista/buscar', token, motorista.buscar);
    app.post('/api/hc/motorista/buscar/cpf', token, motorista.buscarPorCPF);
    app.post('/api/hc/motorista/atualizarMultiplasDatas', token, motorista.atualizarMultiplasDatas);


    //TRANSPORTADORA
    //# Não utilizado, é utilizado as apis e front feitos apartir do oferecimento.
    // var transportadora = app.src.modHoraCerta.controllers.TransportadoraController;

    // app.post('/api/hc/transportadora/salvar', transportadora.salvar);
    // app.post('/api/hc/transportadora/atualizar', transportadora.atualizar);
    // app.post('/api/hc/transportadora/excluir', transportadora.excluir);
    // app.post('/api/hc/transportadora/listar', transportadora.listar);
    // app.post('/api/hc/transportadora/buscar', transportadora.buscar);


    //GRUPO TRANSPORTADORA
    var grupoTransportadora = app.src.modHoraCerta.controllers.GrupoTransportadoraController;

    app.post('/api/hc/grupoTransportadora/salvar', token, grupoTransportadora.salvar);
    app.post('/api/hc/grupoTransportadora/atualizar', token, grupoTransportadora.atualizar);
    app.post('/api/hc/grupoTransportadora/excluir', token, grupoTransportadora.excluir);
    app.post('/api/hc/grupoTransportadora/listar', token, grupoTransportadora.listar);
    app.post('/api/hc/grupoTransportadora/buscar', token, grupoTransportadora.buscar);

    //ARMAZEM
    var armazem = app.src.modHoraCerta.controllers.ArmazemController;

    app.post('/api/hc/armazem/salvar', token, armazem.salvar);
    app.post('/api/hc/armazem/atualizar', token, armazem.atualizar);
    app.post('/api/hc/armazem/excluir', token, armazem.excluir);
    app.post('/api/hc/armazem/listar', token, armazem.listar);
    app.post('/api/hc/armazem/buscar', token, armazem.buscar);
    app.post('/api/hc/armazem/buscar-capacidades', token, armazem.buscarCapacidades);


    //FORNECEDOR
    var fornecedor = app.src.modHoraCerta.controllers.FornecedorController;

    app.post('/api/hc/fornecedor/salvar', token, fornecedor.salvar);
    app.post('/api/hc/fornecedor/atualizar', token, fornecedor.atualizar);
    app.post('/api/hc/fornecedor/excluir', token, fornecedor.excluir);
    app.post('/api/hc/fornecedor/listar', token, fornecedor.listar);
    app.post('/api/hc/fornecedor/buscar', token, fornecedor.buscar);

    //VEICULO

    var veiculo = app.src.modHoraCerta.controllers.VeiculoController;

    app.post('/api/hc/veiculo/salvar', token, veiculo.salvar);
    app.post('/api/hc/veiculo/atualizar/:id', token, veiculo.atualizar);
    app.delete('/api/hc/veiculo/excluir/:id', token, veiculo.excluir);
    app.post('/api/hc/veiculo/listar', token, veiculo.listar);
    app.get('/api/hc/veiculo/buscar/:id', token, veiculo.buscar);
    app.post('/api/hc/veiculo/buscarFrota', token, veiculo.buscarFrota);
    app.post('/api/hc/veiculo/buscarPlaca', token, veiculo.buscarPlaca);
    app.post('/api/hc/veiculo/atualizarMultiplasDatas', token, veiculo.atualizarMultiplasDatas);
    app.post('/api/hc/veiculo/getImagensVeiculo', token, veiculo.getImagemVeiculo);

    app.post('/api/hc/veiculo/deleteImagemVeiculo', token, veiculo.deleteImagemVeiculo);



    app.post('/api/hc/veiculo/file', token, uploadMulter.any(), (req, res, next) => {
      veiculo.uploadImagens(req, res, next);
  });



    //TIPO OPERAÇÃO
    var tipoOperacao = app.src.modHoraCerta.controllers.TipoOperacaoController;

    app.post('/api/hc/tipo-operacao/salvar', token, tipoOperacao.salvar);
    app.post('/api/hc/tipo-operacao/atualizar', token, tipoOperacao.atualizar);
    app.post('/api/hc/tipo-operacao/excluir', token, tipoOperacao.excluir);
    app.post('/api/hc/tipo-operacao/listar', token, tipoOperacao.listar);
    app.post('/api/hc/tipo-operacao/buscar', token, tipoOperacao.buscar);

    //////////////////////////////////////////////////////////////////////////////


    //ROTAS EQUIPES
    var equipe = app.src.modHoraCerta.controllers.EquipeController;

    app.get('/api/testeinter', token, equipe.teste);

    app.get('/api/equipes', token, equipe.listar);
    app.get('/api/equipe/:id', token, equipe.buscar);
    app.post('/api/equipe', token, equipe.salvar);
    app.post('/api/equipe/:id', token, equipe.atualizar);
    app.delete('/api/equipe/:id', token, equipe.excluir);

    //ROTAS JANELAS
    var janela = app.src.modHoraCerta.controllers.JanelaController;

    app.get('/api/janelas', token, janela.listar);
    app.get('/api/janela/:id', token, janela.buscar);
    app.post('/api/janela', token, janela.salvar);
    app.post('/api/janela/:id', token, janela.atualizar);
    app.delete('/api/janela/:id', token, janela.excluir);


    //ROTAS PORTARIA
    var portaria = app.src.modHoraCerta.controllers.PortariaController;

    app.get('/api/portarias', token, portaria.listar);
    app.get('/api/portaria/:id', token, portaria.buscar);
    app.post('/api/portaria', token, portaria.salvar);
    app.post('/api/portaria/:id', token, portaria.atualizar);
    app.delete('/api/portaria/:id', token, portaria.excluir);

    app.post('/api/syngenta/portaria/solicitarEntradaAuto', token, portaria.solicitarEntradaAuto);

    //ROTAS RECURSOS HUMANOS
    var recurso_humano = app.src.modHoraCerta.controllers.RecursosHumanosController;

    app.get('/api/recursos_humanos', token, recurso_humano.listar);
    app.get('/api/recurso_humano/:id', token, recurso_humano.buscar);
    app.post('/api/recurso_humano', token, recurso_humano.salvar);
    app.post('/api/recurso_humano/:id', token, recurso_humano.atualizar);
    app.delete('/api/recurso_humano/:id', token, recurso_humano.excluir);


    //COMPROVANTES DE AGENDAMENTO
    var comprovante = app.src.modHoraCerta.controllers.ComprovanteAgendamentoController;

    app.get('/api/comprovante_carga/:id', token, comprovante.gerarComprovanteCarga);
    app.get('/api/comprovante_agendamento/:id', token, comprovante.gerarComprovanteAgendamento);

    //ROTAS DOCAS
    var docas = app.src.modHoraCerta.controllers.DocasController;

    app.get('/api/docas', token, docas.listar);
    app.get('/api/doca/:id', token, docas.buscar);
    app.post('/api/doca', token, docas.salvar);
    app.post('/api/doca/:id', token, docas.atualizar);
    app.delete('/api/doca/:id', token, docas.excluir);

    //ROTAS CHECKLIST
    var checklist = app.src.modHoraCerta.controllers.ChecklistController;

    app.post('/api/hc/checklist/salvar', token, checklist.salvar);
    app.post('/api/hc/checklist/buscar', token, checklist.buscar);
    app.post('/api/hc/checklist/update', token, checklist.update);
    app.get('/api/hc/checklist/listarChecklist/:id', token, checklist.listarChecklist);
    app.post('/api/hc/checklist/removerChecklist', token, checklist.removerChecklist)
    app.post('/api/hc/checklist/up', token, uploadChecklist.any(), function (req, res, next) {
      checklist.gravarChecklist(req, res, next);
    });


    //ROTAS MAPA
    var mapa = app.src.modHoraCerta.controllers.MapaController;

    app.post('/api/hc/mapa/buscar', token, mapa.buscarMapa);

    //ROTAS mobile
    var mobile = app.src.modHoraCerta.controllers.MobileController;

    app.post('/api/hc/mobile/buscar/agendamento', mobile.buscarAgendamento);
    app.post('/api/hc/mobile/buscar/motorista', mobile.buscarMotorista);
    app.post('/api/hc/mobile/entrada', mobile.solicitarEntrada);
    app.post('/api/hc/mobile/entrada/painel', mobile.solicitarEntradaPainel);
 
    //ROTAS salvar
    var salvar = app.src.modHoraCerta.controllers.SalvarController;

    //app.post('/api/hc/salvar/salvar', salvar.salvar);

    //app.post('/api/hc/agendamento/salvar', salvar.salvar);

    //ROTAS balanca
    var balanca = app.src.modHoraCerta.controllers.BalancaController;
    app.post('/api/hc/balanca/buscar', balanca.buscarPeso);
    app.get('/api/hc/balanca/agente/salvar/:PESOBAL/:BALANCA', balanca.salvarPesoAgente);
    app.post('/api/hc/balanca/salvar', balanca.salvarPesagem);
    app.post('/api/hc/balanca/calcular', balanca.calcularPesos);
    app.post('/api/hc/balanca/calcular/auto', balanca.calcularPesosAuto);
    app.post('/api/hc/balanca/movimentacao', balanca.buscarMovimentacao);
    app.post('/api/hc/balanca/cancelar-pesagem', balanca.cancelarPesagem);
    app.post('/api/hc/balanca/ticketPesagens', balanca.ticketPesagens);
    app.post('/api/hc/balanca/relatorioDadosAgendamento', balanca.relatorioDadosAgendamento);
    app.post('/api/hc/balanca/relatorioPesagens', balanca.relatorioPesagens);

    //rotas terceiros
    var terceiros = app.src.modHoraCerta.controllers.TerceirosController;
    app.post('/api/hc/terceiros/salvar', terceiros.salvar);

    //rotas materiais
    var materiais = app.src.modHoraCerta.controllers.MateriaisController;
    app.post('/api/hc/materiais/salvar', materiais.inserir);

    app.post('/api/hc/materiais/salvar2', token, materiais.salvar);
    app.post('/api/hc/materiais/atualizar', token, materiais.atualizar);
    app.post('/api/hc/materiais/excluir', token, materiais.excluir);
    app.post('/api/hc/materiais/listar', token, materiais.listar);
    app.post('/api/hc/materiais/buscar', token, materiais.buscar);

    //AGENDAMENTO2
    var agendamento2 = app.src.modHoraCerta.controllers.Agendamento2Controller;

    //app.post('/api/hc/teste/calculaSla', novoSalvar.calcularSla);
    app.post('/api/hc/agendamento/salvar', token, agendamento2.salvar);
    app.post('/api/hc/agendamento/reagendar', token, agendamento2.reagendar);
    app.post('/api/hc/agendamento/editar', token, agendamento2.editar);
    app.post('/api/hc/agendamento/editar/portaria', token, agendamento2.updateEditar);
    app.post('/api/hc/agendamento/verificar/agendamento', token, agendamento2.verificarAgendamento);
    app.post('/api/hc/agendamento/verificar/agp', token, agendamento2.verificarAGP);
    app.post('/api/hc/agendamento/desagrupar-cargas', token, agendamento2.desagruparCargas);
    app.post('/api/hc/agendamento/salvar-peso-pallet', token, agendamento2.salvarPesoPallet);
    app.post('/api/hc/agendamento/montarCarga', token, agendamento2.montarCarga);
    app.post('/api/hc/agendamento/editarPesoAgendamento', token, agendamento2.editarPesoAgendamento);

    //TRANSPORTADORA SYNGENTA
    var transportadora = app.src.modHoraCerta.controllers.TransportadoraController

    app.post('/api/hc/syn/transportadora/salvar', token, transportadora.salvar);

    //HORÁRIO
    var horarioLista = app.src.modHoraCerta.controllers.HorarioListaController;
    app.post('/api/hc/horario/lista/buscar', token, horarioLista.buscar);

    //HORÁRIO
    var mockup = app.src.modHoraCerta.controllers.MockupController;
    app.post('/api/hc/mk/agendamento/buscar/agendamentos', token, mockup.mkBuscarAgendamento);

    //CANCELAR AGENDAMENTO
    var cancelar = app.src.modHoraCerta.controllers.CancelarAgendamentoController;
    app.post('/api/hc/cancelar-agendamento', token, cancelar.cancelar);

    //TROCAR STATUS
    var trocarStatus = app.src.modHoraCerta.controllers.TrocarStatusController;
    app.post('/api/hc/trocar-status', token, trocarStatus.trocarStatus);

    //RELATÓRIO DE AGENDAMENTOS
    var agendamentoRelatorio = app.src.modHoraCerta.controllers.RelatorioAgendamentosController;
    app.post('/api/hc/agendamento/buscar/relatorio', token, agendamentoRelatorio.relatorioAgendamento);
    app.post('/api/hc/agendamento/buscar/relatorioReagendamento', token, agendamentoRelatorio.relatorioReagendamento);

    //RELATÓRIO DE AGENDAMENTOS
    var agendamentoRelatorio2 = app.src.modHoraCerta.controllers.RelatorioAgendamentos2Controller;
    app.post('/api/hc/agendamento/buscar/relatorioFaturamento'   , token, agendamentoRelatorio2.relatorioFaturamento   );
    app.post('/api/hc/agendamento/buscar/relatorioTransporte'    , token, agendamentoRelatorio2.relatorioTransporte    );
    app.post('/api/hc/agendamento/buscar/relatorioQualidade'     , token, agendamentoRelatorio2.relatorioQualidade     );
    app.post('/api/hc/agendamento/buscar/relatorioLogistica'     , token, agendamentoRelatorio2.relatorioLogistica     );
    app.post('/api/hc/agendamento/buscar/relatorioPesagem'       , token, agendamentoRelatorio2.relatorioPesagem       );
    app.post('/api/hc/agendamento/buscar/relatorioDPA'           , token, agendamentoRelatorio2.relatorioDPA           );
    app.post('/api/hc/agendamento/buscar/relatorioTransportadora', token, agendamentoRelatorio2.relatorioTransportadora);
    app.post('/api/hc/agendamento/buscar/relatorioBravo'         , token, agendamentoRelatorio2.relatorioBravo         );

    //SUPORTE
    var suporte = app.src.modHoraCerta.controllers.SuporteController;
    app.post('/api/hc/suporte/listarSlots'             , token, suporte.listarSlots             );
    app.post('/api/hc/suporte/buscarSlot'              , token, suporte.buscarSlot              );
    app.post('/api/hc/suporte/updateSlot'              , token, suporte.updateSlot              );
    app.post('/api/hc/suporte/setAcaoSlots'            , token, suporte.setAcaoSlots            );
    app.post('/api/hc/suporte/listarAgendamentos'      , token, suporte.listarAgendamentos      );
    app.post('/api/hc/suporte/buscarAgendamento'       , token, suporte.buscarAgendamento       );
    app.post('/api/hc/suporte/updateAgendamento'       , token, suporte.updateAgendamento       );
    app.post('/api/hc/suporte/updatePesagem'           , token, suporte.updatePesagem           );
    app.post('/api/hc/suporte/listarAgendamentosStatus', token, suporte.listarAgendamentosStatus);
    app.post('/api/hc/suporte/updateDatasStatus'       , token, suporte.updateDatasStatus       );

};
