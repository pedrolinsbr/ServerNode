module.exports = function (app) {

  var token = app.src.modIntegrador.controllers.UsuarioController.tokenRoutes;
  var tokenApi = app.src.modTracking.controllers.AutentApiController;
  
  var multer        = require('multer');
  var storageMulter = multer.memoryStorage();
  var uploadMulter  = multer({ storage: storageMulter });

  // TOKEN PARA VALIDACAO
  app.post('/api/check-token', token, function () { return true; });

  //::::ROTAS CIDADES:::::::::::::::::::::::
  var cidade = app.src.modIntegrador.controllers.CidadeController;

  app.get('/api/cidades/busca/:busca', token, cidade.listarBusca);
  app.get('/api/cidades', token, cidade.listarCidade);
  app.post('/api/cidades', token, cidade.listarCidade);
  app.get('/api/cidades/:pagina', token, cidade.listarCidade);
  app.post('/api/it/cidade/salvar', token, cidade.salvarCidade);
  app.post('/api/it/cidade/atualizar', token, cidade.atualizarCidade);
  app.post('/api/it/cidade/excluir', token, cidade.excluirCidade);
  app.post('/api/it/cidade/listar', token, cidade.listarCidade);
  app.post('/api/it/cidade/buscar', token, cidade.buscarCidade);

  //::::::::::::::::::::::::::::::::::::::::

  //::::ROTAS ESTADOS:::::::::::::::::::::::
  var estado = app.src.modIntegrador.controllers.EstadoController;

  app.get('/api/estados', token, estado.listarEstado);
  app.get('/api/estados/busca/:busca', token, estado.listarBusca);
  app.get('/api/estado/:id', token, estado.buscarEstado);
  app.post('/api/estado', token, estado.salvarEstado);
  app.post('/api/estado/:id', token, estado.atualizarEstado);
  app.delete('/api/estado/:id', token, estado.excluirEstado);
  app.get('/api/estados-pais/:id', token, estado.buscarEstadosPais);
  app.post('/api/estadoFiltro', estado.buscarFiltro);
  //::::::::::::::::::::::::::::::::::::::::

  //::::ROTAS GRUPOS DE CLIENTE:::::::::::::
  var grupo_cliente = app.src.modIntegrador.controllers.GrupoClienteController;

  app.get('/api/grupos-clientes', token, grupo_cliente.listarGrupoClientes);
  app.get('/api/grupo-cliente/:id', token, grupo_cliente.buscarGrupoClientes);
  app.post('/api/grupo-cliente', token, grupo_cliente.salvarGrupoClientes);
  app.post('/api/grupo-cliente/:id', token, grupo_cliente.atualizarGrupoClientes);
  app.delete('/api/grupo-cliente/:id', token, grupo_cliente.excluirGrupoClientes);
  app.get('/api/grupo-cliente/clientes/:id', token, grupo_cliente.buscarClientesGrupo);

  app.post('/api/it/grupoCliente/salvar', token, grupo_cliente.salvarGrupoClientes);
  app.post('/api/it/grupoCliente/atualizar', token, grupo_cliente.atualizarGrupoClientes);
  app.post('/api/it/grupoCliente/excluir', token, grupo_cliente.excluirGrupoClientes);
  app.post('/api/it/grupoCliente/listar', token, grupo_cliente.listarGrupoClientes);
  app.post('/api/it/grupoCliente/buscar', token, grupo_cliente.buscarGrupoClientes);
  //::::::::::::::::::::::::::::::::::::::::

  //::::ROTAS PAÍSES::::::::::::::::::::::::
  var pais = app.src.modIntegrador.controllers.PaisController;

  app.get('/api/paises', token, pais.listarPais);
  app.get('/api/paises/busca/:busca', token, pais.listarBuscaPais);
  app.get('/api/pais/:id', token, pais.buscarPais);
  app.post('/api/pais', token, pais.salvarPais);
  app.post('/api/pais/:id', token, pais.atualizarPais);
  app.delete('/api/pais/:id', token, pais.excluirPais);
  app.post('/api/pais-filtro', pais.buscarFiltroPais);
  //::::::::::::::::::::::::::::::::::::::::

  //::::ROTAS CLIENTE::::::::::::::::::::::::
  var cliente = app.src.modIntegrador.controllers.ClienteController;

  app.post('/api/cliente/excluir', token, cliente.excluir); // novo delete cliente 
  app.post('/api/clientes', token, cliente.listar);
  app.post('/api/clientesV2', token, cliente.listarClientesV2);
  app.get('/api/clientes/busca/:busca', token, cliente.listarBusca);
  app.get('/api/cliente/industriasCliente/:id', token, cliente.buscaIndustriasCliente);
  app.post('/api/cliente/saveIndustriasCliente', token, cliente.saveIndustriasCliente);
  app.get('/api/cliente/:id', token, cliente.buscar);
  app.post('/api/cliente', token, cliente.salvar);
  app.post('/api/cliente/:id', token, cliente.atualizar);
  app.post('/api/cliente/permissao/email/:id', token, cliente.atualizarPermissaoEmail);
  app.delete('/api/cliente/:id', token, cliente.excluir);  
  app.post('/api/cliente/operacoes/listar', token, cliente.operacoesCliente);
  app.post('/api/cliente/operacoes/salvar', token, cliente.salvarOperacao);
  app.get('/api/cliente/operacoes/buscar/:id', token, cliente.buscarOperacao);
  app.delete('/api/cliente/operacoes/delete/:id', token, cliente.excluirOperacao);
  app.post('/api/cliente/operacoes/altera/:id', token, cliente.updateOperacao);
  app.post('/api/clientes-contatos', token, cliente.listarClientesContatos);

  app.get('/api/operacao-clientes/:id', token, cliente.buscarClientesOperacao);
  app.post('/api/insertContatosExcel',    token,  uploadMulter.any(), (req, res, next) => {        
    cliente.insertContatosExcel(req, res, next);
  });
  app.get('/api/UpdateClientesExcel',  cliente.UpdateClientesExcel);
  app.get('/api/cliente/getClienteByCj/:id', token,  cliente.getClienteByCj);


  //::::ROTAS CONTATOS DE CLIENTES:::::::::::
  var contato_cliente = app.src.modIntegrador.controllers.ContatoClienteController;

  app.post('/api/contatos-cliente/listar', token, contato_cliente.listarContatoCliente);
  app.get('/api/contato-cliente/:id', token, contato_cliente.buscarContatoCliente);
  app.get('/api/contato-cliente/buscarClienteContato/:id', token, contato_cliente.buscarClienteContato);
  app.post('/api/contato-cliente/inserir', token, contato_cliente.salvarContatoCliente);
  app.post('/api/contato-cliente/altera/:id', token, contato_cliente.atualizarContatoCliente);
  app.delete('/api/contato-cliente/:id', token, contato_cliente.excluirContatoCliente);
  app.post('/api/contato-cliente/inserir-cliente-contato', token, contato_cliente.inserirClienteContato);
  app.post('/api/contato-cliente/alterar-cliente-contato', token, contato_cliente.alterarClienteContato);
  app.get('/api/cliente-contato/:id', token, contato_cliente.buscaInfoClienteContato);
  app.delete('/api/cliente-contato/:id', token, contato_cliente.removerClienteContato);



  
  //::::ROTAS TIPOS DE CONTATOS DE CLIENTES::
  var tipo_contato_cliente = app.src.modIntegrador.controllers.TipoContatoClienteController;

  app.post('/api/tipos-contato-cliente/lista', token, tipo_contato_cliente.listarTipoContatoCliente);
  app.get('/api/tipo-contato-cliente/buscar/:id', token, tipo_contato_cliente.buscarTipoContatoCliente);
  app.post('/api/tipo-contato-cliente/inserir', token, tipo_contato_cliente.salvarTipoContatoCliente);
  app.post('/api/tipo-contato-cliente/altera/:id', token, tipo_contato_cliente.atualizarTipoContatoCliente);
  app.delete('/api/tipo-contato-cliente/:id', token, tipo_contato_cliente.excluirTipoContatoCliente);
  //:::::::::::::::::::::::::::::::::::::::::

  //ROTAS PRODUTO
  var produto = app.src.modIntegrador.controllers.ProdutoController;

  app.post('/api/produtos', token, produto.listarProduto);
  app.get('/api/produto/listar/:id', token, produto.buscarProduto);
  app.post('/api/produto/inserir', token, produto.salvarProduto);
  app.post('/api/produto/altera/:id', token, produto.atualizarProduto);
  app.delete('/api/produto/:id', token, produto.excluirProduto);
  app.post('/api/produto-embalagens/', token, produto.buscarEmbalagensProduto);
  app.get('/api/produto-embalagens/:id', token, produto.buscarEmbalagensProduto);
  app.post('/api/produto-embalagem/inserir', produto.salvarEmbalagensProduto);
  app.post('/api/embalagem-produto/inserir', produto.salvarRelacaoEmbalagemProduto);
  app.post('/api/embalagem-produto/:id', token, produto.atualizarRelacaoEmbalagemProduto);
  app.post('/api/embalagens-produto', token, produto.listarRelacaoEmbalagemProduto);
  app.get('/api/produto/buscar-embalagem/:id', token, produto.buscarEmbalagemProduto);
  app.get('/api/produto/verificar-embalagem-pad/:id', token, produto.verificaEmbPad);
  app.post('/api/embalagem-produto/altera/:id', token, produto.alteraEmbPad);

  //ROTAS EMBALAGEM
  var embalagem = app.src.modIntegrador.controllers.EmbalagemController;

  app.get('/api/embalagens', token, embalagem.listarEmbalagem);
  app.get('/api/embalagem/:id', token, embalagem.buscarEmbalagem);
  app.post('/api/embalagem', token, embalagem.salvarEmbalagem);
  app.post('/api/embalagem/altera/:id', token, embalagem.atualizarEmbalagem);
  app.delete('/api/embalagem/:id', token, embalagem.excluirEmbalagem);
  app.get('/api/produtos-embalagem/:id', token, embalagem.buscarProdutosEmbalagem);

  //ROTAS EMBALAGEM DO PRODUTO
  var embalagemProduto = app.src.modIntegrador.controllers.EmbalagemProdutoController;

  app.get('/api/embalagem-produtos', token, embalagemProduto.listarEmbalagemProduto);
  app.get('/api/embalagem-produto/:id', token, embalagemProduto.buscarEmbalagemProduto);
  app.post('/api/embalagem-produto', token, embalagemProduto.salvarEmbalagemProduto);
  app.post('/api/embalagem-produto/:id', token, embalagemProduto.atualizarEmbalagemProduto);

  //ROTA CODIGOS ONU
  var codigoONU = app.src.modIntegrador.controllers.CodigoONUController;

  app.get('/api/codigos-onu', token, codigoONU.listarCodigoONU);
  app.get('/api/codigo-onu/:id', token, codigoONU.buscarCodigoONU);
  app.post('/api/codigo-onu', token, codigoONU.salvarCodigoONU);
  app.post('/api/codigo-onu/:id', token, codigoONU.atualizarCodigoONU);
  app.delete('/api/codigo-onu/:id', token, codigoONU.excluirCodigoONU);
  app.get('/api/codigo-onu/produtos/:id', token, codigoONU.buscarProdutosCodigoONU);

  app.post('/api/it/onu/salvar', token, codigoONU.salvarCodigoONU);
  app.post('/api/it/onu/atualizar', token, codigoONU.atualizarCodigoONU);
  app.post('/api/it/onu/excluir', token, codigoONU.excluirCodigoONU);
  app.post('/api/it/onu/listar', token, codigoONU.listarCodigoONU);
  app.post('/api/it/onu/buscar', token, codigoONU.buscarCodigoONU);

  //ROTA FORNECEDORES
  var fornecedor = app.src.modIntegrador.controllers.FornecedorController;

  app.post('/api/fornecedores', token, fornecedor.listarFornecedor);
  app.get('/api/fornecedor/:id', token, fornecedor.buscarFornecedor);
  app.post('/api/fornecedor', token, fornecedor.salvarFornecedor);
  app.post('/api/fornecedor/:id', token, fornecedor.atualizarFornecedor);
  app.delete('/api/fornecedor/:id', token, fornecedor.excluirFornecedor);

  // //ROTA CONTATO_FORNECEDOR
  app.post('/api/fornecedor-contatos', token, fornecedor.listarContatosFornecedor);
  app.get('/api/fornecedor-contato/:id', token, fornecedor.buscarContatoFornecedor);
  app.post('/api/fornecedor-contato', token, fornecedor.salvarContatoFornecedor);
  app.post('/api/fornecedor-contato/:id', token, fornecedor.atualizarContatoFornecedor);
  app.delete('/api/fornecedor-contato/:id', token, fornecedor.excluirContatoFornecedor);

  //ROTAS UNIDADE DE MEDIDA
  var unidadeMedida = app.src.modIntegrador.controllers.UnidadeMedidaController;

  app.get('/api/unidades-medida', token, unidadeMedida.listarUnidadeMedida);
  app.get('/api/unidade-medida/:id', token, unidadeMedida.buscarUnidadeMedida);
  app.post('/api/unidade-medida', token, unidadeMedida.salvarUnidadeMedida);
  app.post('/api/unidade-medida/:id', token, unidadeMedida.atualizarUnidadeMedida);
  app.delete('/api/unidade-medida/:id', token, unidadeMedida.excluirUnidadeMedida);

  app.post('/api/it/unidadeMedida/salvar', token, unidadeMedida.salvarUnidadeMedida);
  app.post('/api/it/unidadeMedida/atualizar', token, unidadeMedida.atualizarUnidadeMedida);
  app.post('/api/it/unidadeMedida/excluir', token, unidadeMedida.excluirUnidadeMedida);
  app.post('/api/it/unidadeMedida/listar', token, unidadeMedida.listarUnidadeMedida);
  app.post('/api/it/unidadeMedida/buscar', token, unidadeMedida.buscarUnidadeMedida);

  //ROTAS CONVERSAO UNIDADE DE MEDIDA
  var conversaoUnidadeMedida = app.src.modIntegrador.controllers.ConversaoUnidadeMedidaController;

  app.post('/api/conversao-unidades-medida', token, conversaoUnidadeMedida.listarConversaoUnidMed);
  app.get('/api/conversao-unidade-medida/:id', token, conversaoUnidadeMedida.buscarConversaoUnidMed);
  app.post('/api/conversao-unidade-medida', token, conversaoUnidadeMedida.salvarConversaoUnidMed);
  app.post('/api/conversao-unidade-medida/:id', token, conversaoUnidadeMedida.atualizarConversaoUnidMed);
  app.delete('/api/conversao-unidade-medida/:id', token, conversaoUnidadeMedida.excluirConversaoUnidMed);

  //ROTA CADASTRO DE EVENTOS
  var cadastroEvento = app.src.modIntegrador.controllers.CadastroEventoController;

  app.get('/api/cadastro-eventos', token, cadastroEvento.listarEvento);
  app.get('/api/cadastro-evento/:id', token, cadastroEvento.buscarEvento);
  app.post('/api/cadastro-evento', token, cadastroEvento.salvarEvento);
  app.post('/api/cadastro-evento/:id', token, cadastroEvento.atualizarEvento);
  app.delete('/api/cadastro-evento/:id', token, cadastroEvento.excluirEvento);

  //ROTA COMPONENTE DELIVERY
  var api = app.src.modIntegrador.controllers.DeliveryCompController;

  app.get('/api/delivery/detalhe/:id', token, api.listaDlvDetalhe);
  app.get('/api/delivery/timeline/:id', token, api.listaTimeLine);

  //ROTAS DELIVERY
  var delivery = app.src.modIntegrador.controllers.DeliveryController;

  app.get('/api/delivery/dashboard', token, delivery.getDashboardDelivery);
  app.post('/api/delivery/dashboard', token, delivery.postDashboardDelivery);
  app.post('/api/delivery/enviootimizadormanual', token, delivery.envioOtimizadorManual);
  app.post('/api/delivery/consultaSlaDelivery', token, delivery.envioOtimizadorManual);
  app.get('/api/delivery/itensdash/:id', token, delivery.getDashboardItens);
  app.get('/api/delivery/eventos/:id', token, delivery.listarEventosDelivery);
  app.get('/api/delivery/parceiros/:id', token, delivery.listarParceirosDelivery);
  app.get('/api/delivery/warehouse/:id', token, delivery.buscarWarehouseDashboard);
  app.get('/api/delivery/dashboard-cancelamento', token, delivery.getDeliveryACancelar);
  app.post('/api/delivery/dashboard-cancelamento', token, delivery.postDeliveryACancelar);
  app.post('/api/delivery/exportar-canhoto', token, delivery.listarCanhoto);
  app.post('/api/delivery/alteraprevisao', token, delivery.alterarDataPrevisaoCarga);
  app.post('/api/delivery/cancel', token, delivery.cancelarDelivery)
  app.get('/api/download/:CDDELIVE', token, delivery.baixarXml);
  app.get('/api/delivery/ajusta-pdf-canhoto', delivery.ajustaPDFCanhoto);
  app.post('/api/it/delivery/qt-status',token,delivery.retQntStDelivery);
  app.post('/api/delivery/dashboard-cancelamento-backlog', token, delivery.postDeliveryACancelarBacklog);
  app.post('/api/delivery/voltarBacklog', token, delivery.voltarBacklog);

  //ROTAS MOTORISTAS
  var motorista = app.src.modIntegrador.controllers.MotoristaController;

  app.get('/api/motoristas', token, motorista.listarMotorista);
  app.get('/api/motorista/:id', token, motorista.buscarMotorista);
  app.post('/api/motorista', token, motorista.salvarMotorista);
  app.post('/api/motorista/:id', token, motorista.atualizarMotorista);
  app.delete('/api/motorista/:id', token, motorista.excluirMotorista);

  //ROTAS VEICULOS
  var veiculo = app.src.modIntegrador.controllers.VeiculoController;

  app.get('/api/veiculos', token, veiculo.listarVeiculo);
  app.get('/api/veiculo/:id', token, veiculo.buscarVeiculo);
  app.post('/api/veiculo', token, veiculo.salvarVeiculo);
  app.post('/api/veiculo/:id', token, veiculo.atualizarVeiculo);
  app.delete('/api/veiculo/:id', token, veiculo.excluirVeiculo);

  //ROTAS MENUS,token
  var menu = require('../modIntegrador/controllers/MenuController');

  app.post('/api/menu/menuItens', menu.menu);
  app.post('/api/menu/menuAcoes', token, menu.menuAcoes);
  app.get('/api/menus', token, menu.listarMenu);
  app.post('/api/menu', token, menu.salvarMenu);
  app.post('/api/menu/:id', token, menu.atualizarMenu);
  app.delete('/api/menu/:id', token, menu.excluirMenu);

  //ROTAS Grupos de Empresas
  var grupo_empresa = app.src.modIntegrador.controllers.GrupoEmpresaController;

  app.get('/api/grupos-empresas', token, grupo_empresa.listarGrupoEmpresa);
  app.get('/api/grupo-empresas/:id', token, grupo_empresa.buscarGrupoEmpresa);
  app.post('/api/grupo-empresas', token, grupo_empresa.salvarGrupoEmpresa);
  app.post('/api/grupo-empresas/:id', token, grupo_empresa.atualizarGrupoEmpresa);
  app.delete('/api/grupo-empresas/:id', token, grupo_empresa.excluirGrupoEmpresa);

  //ROTAS CATEGORIAS
  var categoria = app.src.modIntegrador.controllers.CategoriaController;

  app.get('/api/categorias', token, categoria.listarCategoria);
  app.get('/api/categoria/:id', token, categoria.buscarCategoria);
  app.post('/api/categoria', token, categoria.salvarCategoria);
  app.post('/api/categoria/:id', token, categoria.atualizarCategoria);
  app.delete('/api/categoria/:id', token, categoria.excluirCategoria);
  app.get('/api/categoria-produtos/:id', token, categoria.buscarProdutosCategoria);

  app.post('/api/it/categoriaProdutos/salvar', token, categoria.salvarCategoria);
  app.post('/api/it/categoriaProdutos/atualizar', token, categoria.atualizarCategoria);
  app.post('/api/it/categoriaProdutos/excluir', token, categoria.excluirCategoria);
  app.post('/api/it/categoriaProdutos/listar', token, categoria.listarCategoria);
  app.post('/api/it/categoriaProdutos/buscar', token, categoria.buscarCategoria);

  //ROTAS GRUPO DE PRODUTOS
  var grupo_produto = app.src.modIntegrador.controllers.GrupoProdutoController;

  app.get('/api/grupos-produtos', token, grupo_produto.listarGrupoProdutos);
  app.get('/api/grupo-produto/:id', token, grupo_produto.buscarGrupoProdutos);
  app.post('/api/grupo-produto', token, grupo_produto.salvarGrupoProdutos);
  app.post('/api/grupo-produto/:id', token, grupo_produto.atualizarGrupoProdutos);
  app.delete('/api/grupo-produto/:id', token, grupo_produto.excluirGrupoProdutos);
  app.get('/api/grupo-produto/produtos/:id', token, grupo_produto.buscarProdutosGrupo);

  app.post('/api/it/grupoProdutos/salvar', token, grupo_produto.salvarGrupoProdutos);
  app.post('/api/it/grupoProdutos/atualizar', token, grupo_produto.atualizarGrupoProdutos);
  app.post('/api/it/grupoProdutos/excluir', token, grupo_produto.excluirGrupoProdutos);
  app.post('/api/it/grupoProdutos/listar', token, grupo_produto.listarGrupoProdutos);
  app.post('/api/it/grupoProdutos/buscar', token, grupo_produto.buscarGrupoProdutos);

  //ROTAS USUÁRIOS
  var usuario = app.src.modIntegrador.controllers.UsuarioController;

  app.post('/api/usuario/login', usuario.login);
  app.get('/api/usuarios', token, usuario.listar);
  app.get('/api/usuario/:id', token, usuario.buscar);
  app.post('/api/usuario', token, usuario.salvar);
  app.post('/api/usuario/:id', token, usuario.atualizar);
  app.delete('/api/usuario/:id', token, usuario.excluir);
  app.get('/api/usuarioTeste', token, usuario.teste);
  app.post('/api/usuarioLayout/:id', token, usuario.salvarLayout);
  app.post('/api/usuarioAccess', token, usuario.usuarioAccess);

  //ROTAS CONHECIMENTO
  var conhecimento = app.src.modIntegrador.controllers.ConhecimentoController;

  app.get('/api/conhecimentos', token, conhecimento.listar);
  app.post('/api/conhecimento', tokenApi.veriToken, conhecimento.salvar);
  app.post('/api/cancelar-conhecimento', tokenApi.veriToken, conhecimento.cancelar);
  app.post('/api/conhecimentoV2', conhecimento.salvarConhecimentoV2);

  //ROTAS TIPOS DE CARGA
  var tipo_carga = app.src.modIntegrador.controllers.TipoCargaController;

  app.get('/api/tipos-carga', token, tipo_carga.listarTipoCarga);
  app.get('/api/tipo-carga/:id', token, tipo_carga.buscarTipoCarga);
  app.post('/api/tipo-carga', token, tipo_carga.salvarTipoCarga);
  app.post('/api/tipo-carga/:id', token, tipo_carga.atualizarTipoCarga);
  app.delete('/api/tipo-carga/:id', token, tipo_carga.excluirTipoCarga);
  app.post('/api/tipo-cargaFiltro', token, tipo_carga.buscarFiltroTipoCarga);

  // TESTAR DATA CONTRATADA
  var dataContratadaCtrl = app.src.modIntegrador.controllers.DataContratadaController;

  app.post('/api/data_contratada', token, dataContratadaCtrl.dataContratada); // ROUTE P TESTAR DATA CONTRATADA
  app.get('/api/timezone', token, dataContratadaCtrl.timezoneBr); // ROUTE P TIMEZONE AMERICA/SAO_PAULO

  //ROTAS FERIADOS
  var api = app.src.modIntegrador.controllers.FeriadoController;

  app.get('/api/integrador/feriado/busca/:id',      token,    api.listaFeriado);
  app.put('/api/integrador/feriado/edita',          token,    api.checkModel,   api.editaFeriado);
  app.post('/api/integrador/feriado/lista',         token,    api.listaFeriado);
  app.delete('/api/integrador/feriado/remove/:id',  token,    api.removeFeriado);

  //ROTAS CARGAS
  var cargas = app.src.modIntegrador.controllers.CargasController;

  app.get('/api/integrador/carga/:id', token, cargas.buscarCarga);
  app.get('/api/integrador/cargas', token, cargas.buscarCarga);
  app.post('/api/integrador/cargas', token, cargas.buscarCarga);
  app.get('/api/integrador/carga-deliveries/:id', token, cargas.buscarDeliveries);
  app.get('/api/integrador/carga-paradas/:id', token, cargas.buscarParadas);
  app.post('/api/integrador/cancela-carga', token, cargas.cancelarCargas);
  app.post('/api/integrador/carga-fracionada/:id', token, cargas.cargaFracionada);
  app.post('/api/integrador/carga-env-log/:id', token, cargas.envLog);
  app.post('/api/integrador/muda-status', token, cargas.updateStatusASN);
  app.post('/api/integrador/buscarMilestone', token, cargas.buscarMilestone);

  //ROTAS REASON CODES
  var reasonCodes = app.src.modIntegrador.controllers.ReasonCodesController;

  app.post('/api/integrador/reason-code/inserir', token, reasonCodes.salvarReasonCode);
  app.get('/api/integrador/reason-codes', token, reasonCodes.listarOld);
  app.post('/api/integrador/reason-codes/listar', token, reasonCodes.listarReasonCode);
  app.get('/api/integrador/reason-codes/buscar/:id', token, reasonCodes.buscarReasonCode);
  app.post('/api/integrador/reason-code/update/:id', token, reasonCodes.atualizarReasonCode);
  app.delete('/api/integrador/reason-codes/excluir/:id', token, reasonCodes.excluirReasonCode);

  app.get('/api/integrador/reason-codes/motivosReasonCode/:id', token, reasonCodes.buscarMotivosReasonCode);

  app.get('/api/resultados', reasonCodes.listarResultado);
  app.get('/api/resultado/:id', reasonCodes.buscarResultado);
  app.post('/api/resultado', reasonCodes.salvarResultado);
  app.post('/api/resultado/:id', reasonCodes.atualizarResultado);
  app.delete('/api/resultado/:id', reasonCodes.excluirResultado);

  app.get('/api/porques', reasonCodes.listarPorque);
  app.get('/api/porque/:id', reasonCodes.buscarPorque);
  app.post('/api/porque', reasonCodes.salvarPorque);
  app.post('/api/porque/:id', reasonCodes.atualizarPorque);
  app.delete('/api/porque/:id', reasonCodes.excluirPorque);

  app.get('/api/ondes', reasonCodes.listarOnde);
  app.get('/api/onde/:id', reasonCodes.buscarOnde);
  app.post('/api/onde', reasonCodes.salvarOnde);
  app.post('/api/onde/:id', reasonCodes.atualizarOnde);
  app.delete('/api/onde/:id', reasonCodes.excluirOnde);

  app.get('/api/quems', reasonCodes.listarQuem);
  app.get('/api/quem/:id', reasonCodes.buscarQuem);
  app.post('/api/quem', reasonCodes.salvarQuem);
  app.post('/api/quem/:id', reasonCodes.atualizarQuem);
  app.delete('/api/quem/:id', reasonCodes.excluirQuem);

  //ROTAS RELATORIO PIB
  var relatorioDelivery = app.src.modIntegrador.controllers.RelatorioDeliveryController;

  app.post('/api/integrador/relatorio', token, relatorioDelivery.listar);

  //ROTAS RELATÓRIO DELIVERY
  var relatorioItensDelivery = app.src.modIntegrador.controllers.RelatorioItensDeliveryController;

  app.post('/api/integrador/relatorio/itens-delivery', token, relatorioItensDelivery.listar);


  var relatorioItensEad = app.src.modIntegrador.controllers.RelatorioItensEadController;

  app.post('/api/integrador/relatorio/relatorio-ead', token, relatorioItensEad.listar);
  
  // ROTAS RELATORIO DELIVERY CANCELADA
  var relatorioCanceladas = app.src.modIntegrador.controllers.RelatorioDeliveryCanceladaController;

  app.post('/api/integrador/relatorio/canceladas' , token, relatorioCanceladas.listarRelatorioCanceladas);

  // - Rotas Trafegus - Thiago Henrique do Prado 10/07
  var trafegus = app.src.modIntegrador.controllers.TrafegusController;
  app.post('/api/integrador/trafegus/salvarViagem', trafegus.salvarViagem);
  app.post('/api/integrador/trafegus/salvarVeiculo',  trafegus.salvarVeiculo);
  app.post('/api/integrador/trafegus/salvarMotorista', trafegus.salvarMotorista);
  app.post('/api/integrador/trafegus/salvarTransportadora', trafegus.salvarTransportadora);
  app.get('/api/integrador/trafegus/buscarEventos', trafegus.buscarEventos);
  app.get('/api/integrador/trafegus/buscarUltimaPosicaoVeiculo', trafegus.buscarUltimaPosicaoVeiculo);
  app.get('/api/integrador/trafegus/buscarViagem', trafegus.buscarViagem);
  app.get('/api/integrador/trafegus/buscarRotas', trafegus.buscarRotas);
  app.get('/api/integrador/trafegus/atualizarStatusViagem', trafegus.atualizarStatusViagem);
  
  
  //ROTAS CONTIGENCIA
  var contingencia = app.src.modIntegrador.controllers.ContingenciaController;

  app.post('/api/integrador/contingencia/listarContingencia', token,  contingencia.listarContingencia);

  //::::ROTAS VENDOR CODE:::::::::::::
  var vendor_code = app.src.modIntegrador.controllers.VendorCodeController;

  app.post('/api/it/vendor-code/listar', token, vendor_code.listarVendorCode);
  app.post('/api/it/vendor-code/salvar', token, vendor_code.salvarVendorCode);
  app.post('/api/it/vendor-code/atualizar', token, vendor_code.atualizarVendorCode);
  app.delete('/api/it/vendor-code/excluir/:id', token, vendor_code.excluirVendorCode);
  app.post('/api/it/vendor-code/listar-i014/:id', token, vendor_code.listarI014);
  app.post('/api/it/vendor-code/salvar-i014', token, vendor_code.salvarI014);
  app.post('/api/it/vendor-code/atualizar-i014', token, vendor_code.atualizarI014);
  app.delete('/api/it/vendor-code/excluir-i014/:id', token, vendor_code.excluirI014);
  app.post('/api/it/vendor-code/verificar-i014', token, vendor_code.verificarI014);
  app.post('/api/it/vendor-code/alterar-situacao-i014', token, vendor_code.alterarSituacaoI014);

  //ROTAS DE PARA
  var dePara = app.src.modIntegrador.controllers.DeParaController;

  app.post('/api/it/dePara/salvar', token, dePara.salvarDePara);
  app.post('/api/it/dePara/atualizar', token, dePara.atualizarDePara);
  app.post('/api/it/dePara/excluir', token, dePara.excluirDePara);
  app.post('/api/it/dePara/listar', token, dePara.listarDePara);
  app.post('/api/it/dePara/buscar', token, dePara.buscarDePara);

  //:::::::::::RECUSA NA ORIGEM:::::::::::::

  var api = app.src.modIntegrador.controllers.RecusaOrigemController;

  app.get('/api/it/recusaorigem/:id', token,  api.recusaCargaOrigem);

//:::::::::::ENCERRA DELIVERY::::::::::::::::

  var api = app.src.modIntegrador.controllers.EncerraDlvController;

  app.post('/api/it/delivery/encerra', token,  api.checkDlvEnd, api.encerraDelivery);

  //:::::::::::ROTAS MOTIVOS::::::::::::::::

  var motivos = app.src.modIntegrador.controllers.MotivosController;

  app.get('/api/integrador/motivos', token, motivos.listarMotivos);
  app.get('/api/integrador/motivos/:id', token, motivos.buscarMotivos);
  app.post('/api/integrador/motivos', token, motivos.salvarMotivos);
  app.put('/api/integrador/motivos/:id', token, motivos.atualizarMotivos);
  app.delete('/api/integrador/motivos/excluir', token, motivos.excluirMotivos);

  app.post('/api/integrador/motivos/listar', token, motivos.listarMotivos);
  app.post('/api/integrador/motivos/buscar', token, motivos.buscarMotivos);
  app.post('/api/integrador/motivos/salvar', token, motivos.salvarMotivos);
  app.post('/api/integrador/motivos/atualizar', token, motivos.atualizarMotivos);
  app.post('/api/integrador/motivos/excluir', token, motivos.excluirMotivos);

  app.post('/api/integrador/motivos/grupoMotivos', token, motivos.buscarGrupoMotivos);
  //::::::::::::::::::::::::::::::::::::::::

  // ROTAS MOTIVO DE CANCELAMENTO
  var cancelamento = app.src.modIntegrador.controllers.MotivoCancelamentoController;
  app.post('/api/integrador/motivosCancelamento/listar' ,token , cancelamento.listar);
  app.get('/api/integrador/motivosCancelamento/buscar/:id' ,token ,cancelamento.buscar);
  app.post('/api/integrador/motivosCancelamento/inserir' ,token ,cancelamento.inserir);
  app.post('/api/integrador/motivosCancelamento/atualizar' ,token ,cancelamento.atualizar);
  app.delete('/api/integrador/motivosCancelamento/remover/:id' ,token ,cancelamento.remover);

};
