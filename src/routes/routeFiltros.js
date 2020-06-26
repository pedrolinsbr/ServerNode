module.exports = function (app) {

    //AGENDAMENTO
    var filtros = app.src.modGlobal.controllers.FiltrosController;
    var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
    //# filtros utilizados
    app.post('/api/filtro/agendas', filtros.buscarAgenda);
    app.post('/api/filtro/armazens', filtros.buscarArmazem);
    app.post('/api/filtro/materiais', filtros.buscarMateriais);

    app.post('/api/filtro/tipoCargas', filtros.buscarTipoCarga);
    app.post('/api/filtro/transportadoras', filtros.buscarTransportadora);
    app.post('/api/filtro/grupoTransportadoras', filtros.buscarGrupoTransportadora);

    app.post('/api/filtro/tipoVeiculos', filtros.buscarTipoVeiculo);
    app.post('/api/filtro/tipoVeiculosNeolog', filtros.buscarTipoVeiculoNeolog);
    app.post('/api/filtro/tipoVeiculosOperacao', filtros.buscarTipoVeiculoSyngenta);

    app.post('/api/filtro/tomadores', filtros.buscarTomador);
    app.post('/api/filtro/motoristas', filtros.buscarMotorista);
    app.post('/api/filtro/motoristas-sem-acl', filtros.buscarMotoristaSemAcl);
    app.post('/api/filtro/motoristas-full', filtros.listarMotoristas);
    app.post('/api/filtro/veiculos', filtros.buscarVeiculo);
    app.post('/api/filtro/motivo-cancelamento', filtros.buscarMotivoCancelamento);
    app.post('/api/filtro/usuarios', filtros.buscarUsuario);
    app.post('/api/filtro/usuariosByEmail', filtros.buscarUsuarioByEmail);

    app.post('/api/filtro/cargosUsuarios', filtros.buscarCargosUsuario);

    app.post('/api/filtro/gestorFrotaUsuarios', filtros.buscarGestorFrotaUsuario);

    app.post('/api/filtro/nivel', filtros.buscarNivel);

    app.post('/api/filtro/estados', filtros.buscarEstado);
    app.post('/api/filtro/estadosUF', filtros.buscarUFEstado);
    
    app.post('/api/filtro/cidades', filtros.buscarCidade);

    app.post('/api/filtro/janelas', token, filtros.buscarJanelas);

    app.post('/api/filtro/paises', filtros.buscarPais);
    app.post('/api/filtro/clientes', filtros.buscarCliente);
    app.post('/api/filtro/grupo-cliente', filtros.buscarGrupoCliente);
    app.post('/api/filtro/clientesAg', filtros.buscarClienteAg);

    app.post('/api/filtro/tempoStatus', filtros.buscarTempoStatus);

    app.post('/api/filtro/regras', filtros.buscarRegra);
    app.post('/api/filtro/otimizador', filtros.buscarOtimizador);
    app.post('/api/filtro/motivo-recusa', filtros.buscarMtRecusa);

    app.post('/api/filtro/motivo-cancelar', filtros.buscarMotivosCancelar);
    app.post('/api/filtro/motivo-conferencia', filtros.buscarMotivosConferencia);
    app.post('/api/filtro/motivo-reagendar', filtros.buscarMotivosReagendar);

    app.post('/api/filtro/motivo-contato-cliente', filtros.buscarMotivosContatoCliente)

    app.post('/api/filtro/cargas', filtros.buscarCargas);
    app.post('/api/filtro/cluster', filtros.buscarCluster);
    app.post('/api/filtro/setor', filtros.buscarSetores);
    app.post('/api/filtro/cargo', filtros.buscarCargos);

    app.post('/api/filtro/Acoes', filtros.buscarAcoes);
    app.post('/api/filtro/grupos', filtros.buscarGrupos);

    app.post('/api/filtro/onu', filtros.buscarOnu);
    app.post('/api/filtro/operacao', filtros.buscarOperacao);
    app.post('/api/filtro/operacao-integrador', filtros.buscarOperacaoIntegrador);
    app.post('/api/filtro/referencia' , filtros.buscarReferencia);
    app.post('/api/filtro/grupo-produto', filtros.buscarGrupoProduto);
    app.post('/api/filtro/categoria', filtros.buscarCategoria);
    app.post('/api/filtro/unidade', filtros.buscarUnidade);

    app.post('/api/filtro/produto', filtros.buscarProduto);
    app.post('/api/filtro/produtoSyngenta', filtros.buscarProdutoSyngenta);

    app.post('/api/filtro/reason-code', filtros.buscarReasonCode);
    app.post('/api/filtro/motivosReasonCode', filtros.buscarMotivosReasonCode);

    app.post('/api/filtro/numerosNotaNfe', filtros.buscarNumeroNfe);
    app.post('/api/filtro/numerosNotaNfe/:isHaveCTE', filtros.buscarNumeroNfe);
    app.post('/api/filtro/numerosCte', filtros.buscarNumeroCte);
    app.post('/api/filtro/numerosCte/:idCarga', filtros.buscarNumeroCte);
    app.post('/api/filtro/numerosViagem', filtros.buscarCarga);
    app.post('/api/filtro/numerosViagem/:isHaveCTE', filtros.buscarCarga);
    app.post('/api/filtro/usuarios-sac', filtros.buscarUsuarioSac);
    app.post('/api/filtro/agendamento', filtros.buscarAgendamento);

    app.post('/api/filtro/tipoOperacao', filtros.buscarTipoOperacao);
    app.post('/api/filtro/tipoPesagem', filtros.buscarTipoPesagem);
    app.post('/api/filtro/tipoFluxoVeiculo', filtros.buscarTipoFluxoVeiculo);

    app.post('/api/filtro/feriados', filtros.buscarFeriados);

    app.post('/api/filtro/atendimentos', filtros.buscarAtendimentos);

    app.post('/api/filtro/rotas', filtros.buscarRotas);

    app.post('/api/filtro/historicoOcorrencia', filtros.buscarHistoricoOcorrencia);

    app.post('/api/filtro/cidadeEstado', filtros.buscarCidadeEstado);

    app.post('/api/filtro/grupo-fornecedor', filtros.buscarGrupoFornecedor);

    app.post('/api/filtro/contato', filtros.buscarContato);

    app.post('/api/filtro/motoristasCarga', filtros.motoristasCarga);

    app.post('/api/filtro/veiculoCarga', filtros.veiculoCarga);

    app.post('/api/filtro/veiculoCargaCavalo', filtros.veiculoCargaCavalo);

    app.post('/api/filtro/veiculoCargaCarreta', filtros.veiculoCargaCarreta);

    app.post('/api/filtro/fornecedores', filtros.buscarFornecedores);

    app.post('/api/filtro/ocorrenciasCarga', filtros.buscarOcorrenciasCarga);

    app.post('/api/filtro/motivo-alteracao-data', filtros.buscarMotivoAlteracaoData);

    app.post('/api/filtro/motivo-entrega', filtros.buscarMotivoEntrega);

    app.post('/api/filtro/motivo-finalizar', filtros.buscarMotivoFinalizar);

    app.post('/api/filtro/grupo-ocorrencia', filtros.buscarGrupoOcorrencia);

    app.post('/api/filtro/tipoVeiculosAtivo', filtros.tipoVeiculosAtivo);

    app.post('/api/filtro/seguradoras', filtros.buscarSeguradoras);

    app.post('/api/filtro/transportadoras-bravo', token,filtros.buscarTransportadoraBravo);

    app.post('/api/filtro/transportadorasCampanha', token,filtros.buscarTranspCampanhaBravo);
    

    app.post('/api/filtro/tabela', token,filtros.filtrarTabela);

    app.post('/api/filtro/nomeContato', token,filtros.nomeContato);
    app.post('/api/filtro/detalheContato', token,filtros.detalheContato);
    app.post('/api/filtro/responsavelRastreioIndustrias', token,filtros.responsavelRastreioIndustrias);
    app.post('/api/filtro/clienteFinal', token,filtros.clienteFinal);
    app.post('/api/filtro/setorContato', token,filtros.setorContato);
    app.post('/api/filtro/contatoDetalhe/:operacao', token,filtros.contatoDetalhe);
    app.post('/api/filtro/contatoClienteIndustria', token,filtros.contatoClienteIndustria);
    app.post('/api/filtro/contatoClienteFinal', token,filtros.contatoClienteFinal);
    app.post('/api/filtro/buscarDescVeiculos', token, filtros.buscarDescVeiculos);

    app.post('/api/filtro/buscarRotas', token, filtros.buscarRotasTela);

    
    app.post('/api/filtro/buscarGrupoAtendimento', token, filtros.buscarGrupoAtendimento);
    app.post('/api/filtro/buscarContatoAtendimento', token,filtros.buscarContatoAtendimento);
    
    app.post('/api/filtro/frota', token, filtros.buscarFrota);
    app.post('/api/filtro/tipoApontamento', token, filtros.buscarTipoApontamento);
    app.post('/api/filtro/campanha', token, filtros.buscarCampanha);
    app.post('/api/filtro/motoristasCampanha', token, filtros.buscarMotoristasCampanha);
    app.post('/api/filtro/mesAnoCampanha', token, filtros.buscarMesAnoCampanha);

    app.post('/api/filtro/clientesEdi', token, filtros.buscarClientesEdi);

    app.post('/api/filtro/eventos', filtros.buscarEvento);

    app.post('/api/filtro/corVeiculo', filtros.buscarCorVeiculo);
    
};
