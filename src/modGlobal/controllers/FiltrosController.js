/**
 * @module modGlobal/controllers/FiltrosController
 *
 * @requires module:modGlobal/dao/FiltrosDAO
*/
module.exports = function (app, cb) {

  var api = {};
  var dao = app.src.modGlobal.dao.FiltrosDAO;


  api.buscarAgenda = async function (req, res, next) {
    await dao.buscarAgenda(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarArmazem = async function (req, res, next) {
    await dao.buscarArmazem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoCarga = async function (req, res, next) {
    await dao.buscarTipoCarga(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTransportadora = async function (req, res, next) {
    await dao.buscarTransportadora(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  api.buscarGrupoTransportadora = async function (req, res, next) {
    await dao.buscarGrupoTransportadora(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoVeiculo = async function (req, res, next) {
    await dao.buscarTipoVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMateriais = async function (req, res, next) {
    await dao.buscarMateriais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoVeiculoNeolog = async function (req, res, next) {
    await dao.buscarTipoVeiculoNeolog(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.buscarTipoVeiculoSyngenta = async function (req, res, next) {
    await dao.buscarTipoVeiculoSyngenta(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.buscarRegra = async function (req, res, next) {
    await dao.buscarRegra(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCargas = async function (req, res, next) {
    await dao.buscarCargas(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCluster = async function (req, res, next) {
    await dao.buscarCluster(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEvento = async function (req, res, next) {
    await dao.buscarEvento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarOtimizador = async function (req, res, next) {
    await dao.buscarOtimizador(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMtRecusa = async function (req, res, next) {
    await dao.buscarMtRecusa(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarSetores = async function (req, res, next) {
    await dao.buscarSetores(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCargos = async function (req, res, next) {
    await dao.buscarCargos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTomador = async function (req, res, next) {
    await dao.buscarTomador(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotorista = async function (req, res, next) {
    await dao.buscarMotorista(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotoristaSemAcl = async function (req, res, next) {
    await dao.buscarMotoristaSemAcl(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.veiculoCarga = async function (req, res, next) {
    await dao.veiculoCarga(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.veiculoCargaCavalo = async function (req, res, next) {
    await dao.veiculoCargaCavalo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.veiculoCargaCarreta = async function (req, res, next) {
    await dao.veiculoCargaCarreta(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarVeiculo = async function (req, res, next) {
    await dao.buscarVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotivoCancelamento = async function (req, res, next) {
    await dao.buscarMotivoCancelamento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarUsuario= async function (req, res, next) {
    await dao.buscarUsuario(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCargosUsuario= async function (req, res, next) {
    await dao.buscarCargosUsuario(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarGestorFrotaUsuario = async function (req, res, next) {
    await dao.buscarGestorFrotaUsuario(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.buscarRotas = async function (req, res, next) {
    await dao.buscarRotas(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarUsuarioByEmail= async function (req, res, next) {
    await dao.buscarUsuarioByEmail(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarNivel= async function (req, res, next) {
    await dao.buscarNivel(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarPais = async function (req, res, next) {
    await dao.buscarPais(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCliente = async function (req, res, next) {
    await dao.buscarCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarGrupoCliente = async function (req, res, next) {
    await dao.buscarGrupoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotivosReasonCode = async function (req, res, next) {
    await dao.buscarMotivosReasonCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarReferencia = async function (req, res, next) {
    await dao.buscarReferencia(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCidade= async function (req, res, next) {
    await dao.buscarCidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarEstado= async function (req, res, next) {
    await dao.buscarEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.buscarUFEstado= async function (req, res, next) {
    await dao.buscarUFEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTempoStatus= async function (req, res, next) {
    await dao.buscarTempoStatus(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarAcoes = async function (req, res, next) {
    await dao.buscarAcoes(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarOnu = async function (req, res, next) {
    await dao.buscarOnu(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarOperacao = async function (req, res, next) {
    await dao.buscarOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarOperacaoIntegrador = async function (req, res, next) {
    await dao.buscarOperacaoIntegrador(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarReferencia = async function (req, res, next) {
    await dao.buscarReferencia(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarGrupoProduto = async function (req, res, next) {
    await dao.buscarGrupoProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  api.buscarCategoria = async function (req, res, next) {
    await dao.buscarCategoria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarUnidade = async function (req, res, next) {
    await dao.buscarUnidade(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarProduto = async function (req, res, next) {
    await dao.buscarProduto(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarProdutoSyngenta = async function (req, res, next) {
    await dao.buscarProdutoSyngenta(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarReasonCode = async function (req, res, next) {
    await dao.buscarReasonCode(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCarga = async function (req, res, next) {
    await dao.buscarCarga(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarUsuarioSac = async function (req, res, next) {
    await dao.buscarUsuarioSac(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarNumeroCte = async function (req, res, next) {
    await dao.buscarNumeroCte(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarNumeroNfe = async function (req, res, next) {
    await dao.buscarNumeroNfe(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarAgendamento = async function (req, res, next) {
    await dao.buscarAgendamento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.listarMotoristas = async function (req, res, next) {
    await dao.listarMotoristas(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.motoristasCarga = async function (req, res, next) {
    await dao.motoristasCarga(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarFeriados = async function (req, res, next) {
    await dao.buscarFeriados(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarAtendimentos = async function (req, res, next) {
    await dao.buscarAtendimentos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarRotasTela = async function (req, res, next) {
    await dao.buscarRotasTela(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarHistoricoOcorrencia = async function (req, res, next) {
    await dao.buscarHistoricoOcorrencia(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCidadeEstado = async function (req, res, next) {
    await dao.buscarCidadeEstado(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  //-----------------------------------------------------------------------\\
	/**
		* @description Realiza a busca para o filtro de grupo de fornecedores
		*
		* @async
		* @function grupoFornec
		* @returns {Object} Objecto para o single
		*
		* @author Ítalo Andrade Oliveira
		* @since 13/07/2018
  */
 api.buscarGrupoFornecedor = async function (req, res, next) {
    await dao.buscarGrupoFornecedor(req, res, next).then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
  }

  api.buscarFornecedores = async function (req, res, next) {
    await dao.buscarFornecedores(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
		* @description Realiza a busca para o filtro de contatos
		*
		* @async
		* @function buscarContato
		* @returns {Object} Objecto para o single
		*
		* @author Ítalo Andrade Oliveira
		* @since 13/07/2018
  */
 api.buscarContato = async function (req, res, next) {
    await dao.buscarContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  }

  /**
		* @description Realiza a busca para o filtro de Ocorrencias - G067
		*
		* @async
		* @function buscarContato
		* @returns {Object} Objecto para o single
		*
		* @author Adryell Batista
		* @since 27/07/2018
  */
 api.buscarOcorrenciasCarga = async function (req, res, next) {
  await dao.buscarOcorrenciasCarga(req, res, next)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
}

/**
  * @description Realiza a busca para o filtro de MOtivos de alteracao de datas
  *
  * @async
  * @function buscarContato
  * @returns {Object} Objecto para o single
  *
  * @author Adryell Batista
  * @since 31/07/2018
*/
api.buscarMotivoAlteracaoData = async function (req, res, next) {
await dao.buscarMotivoAlteracaoData(req, res, next)
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    next(err);
  });
}

api.buscarMotivoEntrega = async function (req, res, next) {
await dao.buscarMotivoEntrega(req, res, next)
  .then((result) => {
    res.json(result);
  })
  .catch((err) => {
    next(err);
  });
}


api.buscarMotivoFinalizar = async function (req, res, next) {
  await dao.buscarMotivoFinalizar(req, res, next)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
  }

  api.buscarMotivosCancelar = async function (req, res, next) {
    await dao.buscarMotivosCancelar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotivosConferencia = async function (req, res, next) {
    await dao.buscarMotivosConferencia(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotivosReagendar = async function (req, res, next) {
    await dao.buscarMotivosReagendar(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotivosContatoCliente = async function (req, res, next) {
    await dao.buscarMotivosContatoCliente(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarGrupoOcorrencia = async function (req, res, next) {
    await dao.buscarGrupoOcorrencia(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };


  api.tipoVeiculosAtivo = async function (req, res, next) {
    await dao.buscarTipoVeiculoAtivo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };
  api.buscarSeguradoras = async function (req, res, next) {
    await dao.buscarSeguradoras(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTransportadoraBravo = async function (req, res, next) {
    await dao.buscarTransportadoraBravo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTranspCampanhaBravo = async function (req, res, next) {
    await dao.buscarTranspCampanhaBravo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  

  api.filtrarTabela = async function (req, res, next) {
    await dao.filtrarTabela(req, res, next)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      next(err);
    });
};

  api.nomeContato = async function (req, res, next) {
    await dao.nomeContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.detalheContato = async function (req, res, next) {
    await dao.detalheContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.responsavelRastreioIndustrias = async function (req, res, next) {
    await dao.responsavelRastreioIndustrias(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.clienteFinal = async function (req, res, next) {
    await dao.clienteFinal(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.setorContato = async function (req, res, next) {
    await dao.setorContato(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.contatoDetalhe = async function (req, res, next) {
    await dao.contatoDetalhe(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.contatoClienteIndustria = async function (req, res, next) {
    await dao.contatoClienteIndustria(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.contatoClienteFinal = async function (req, res, next) {
    await dao.contatoClienteFinal(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarDescVeiculos = async function (req, res, next) {
    await dao.buscarDescVeiculos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarFrota = async function (req, res, next) {
    await dao.buscarFrota(req, res, next)
      .then((result1) => {
        res.json(result1);
      })
      .catch((err) => {
        err.stack = new Error().stack + `\r\n` + err.stack;
        next(err);
      });
  };

  api.buscarGrupoAtendimento = async function (req, res, next) {
    await dao.buscarGrupoAtendimento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarContatoAtendimento = async function (req, res, next) {
    await dao.buscarContatoAtendimento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCampanha = async function (req, res, next) {
    await dao.buscarCampanha(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMotoristasCampanha = async function (req, res, next) {
    await dao.buscarMotoristasCampanha(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarMesAnoCampanha = async function (req, res, next) {
    await dao.buscarMesAnoCampanha(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  
  api.buscarTipoApontamento = async function (req, res, next) {
    await dao.buscarTipoApontamento(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarClienteAg = async function (req, res, next) {
    await dao.buscarClienteAg(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoOperacao = async function (req, res, next) {
    await dao.buscarTipoOperacao(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarCorVeiculo = async function (req, res, next) {
    await dao.buscarCorVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoPesagem = async function (req, res, next) {
    await dao.buscarTipoPesagem(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarTipoFluxoVeiculo = async function (req, res, next) {
    await dao.buscarTipoFluxoVeiculo(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      }); 
  };

  api.buscarClientesEdi = async function (req, res, next) {    
    await dao.buscarClientesEdi(req, res, next)
      .then(( result) => {
        console.log(result);
        res.json(result);
      })
      .catch((err) => {
        console.log("[ERROR]: ",err);
        next(err);
      });
  };

  api.buscarGrupos = async function (req, res, next) {
    await dao.buscarGrupos(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  api.buscarJanelas = async function (req, res, next) {
    await dao.buscarJanelas(req, res, next)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        next(err);
      });
  };

  return api;
};
