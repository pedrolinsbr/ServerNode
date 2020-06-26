![Bravo](../public/files/imgOferecimento/bravo-logo-01.png)

# Bem-Vindo a Documentação de Nomenclatura Projeto Bravo 2020 #

Esse padrão deverá ser utilizado no código das aplicações e DB.

## Nomes de Classe ##
* Seguir padrão da linguagem, Camelcase iniciando com letra maiuscula

## Métodos ##
*  Verbo + ação,  iniciando com minuscula.
*  Exemplo: adicionarCliente

## Padrão de Variáveis ##
			
| Tipo          | Abreviatura   | Nome Variavel |    Resultado    |
| ------------- |:-------------:| -------------:| ---------------:|
| string        |     str       |      Nome     |     strNome     |
| date          |      dt       |   Nascimento  |   dtNascimento  |
| integer       |     int       |    Unidades   |   intUnidades   |
| boolean       |      bl       |     Ativo     |     blAtivo     |
| float         |      fl       |     Numero    |     flNumero    |
| array         |      ar       | ListaUsuarios | arListaUsuarios |
| double        |      do       |   VlrDecimal  |   dlVlrDecimal  |
| object        |     obj       |    Usuario    |    objUsuario   |
| character     |     cht       |    Empresa    |    chtEmpresa   |
| datetime      |     dtm       |     Create    |    dtmCreate    |


## Padrão de Funções ##

|  Abreviatura	|        Nome Function      | 
|--------------:|--------------------------:| 
|      set	    |           setUser         |	
|      get	    |    getUser (um objeto)    |	
|      all	    | allUsers (lista usuários) |	
|      upd      |	        updUser()         |	
|      del	    |         DelUser()         |	
|      new	    |         NewUser()         |	
|      cnv      |       cnvUserPacient()    |	
|      tst	    |          TstUser()        |	
|      dow      |         DowFile ()        |	
|      upl      |         uplFile ()        |


## Padrão do Banco de Dados ##

|   Nome do Modulo (Aplicação)   |  Abreviatura |                Nome Tabela                |
|-------------------------------:|-------------:|------------------------------------------:|
|            SISTEMA             |      S       | S001 (INICIAL NOME  MODULO + ABREVIATURA) |
|          INTEGRADOR            |      I       |                     I001                  |
|          OTIMIZADOR	           |      O	      |                     O001                  |
|         OFERECIMENTO           |	    F	      |                     F001                  |
|          HORA CERTA            |	    H	      |                     H001                  |
|           TRACKING             |	    T	      |                     T001                  |
|       PAGAMENTO DE FRETE       |	    P	      |                     P001                  |


### Padrão das Colunas do Banco de Dados ###

|    Conteúdo         |    Abreviatura   |  Resultado  |
|--------------------:|-----------------:|------------:|
|         data        |	      dt         |   DtNascim  |
|      sim ou não     |	      sn         |   SnAtivo   |
|        tipo         |        tp        |   TpPagto   |
|       código        |	      cd         |   CdClient  |
|          id	        |        id        |    IdS001   |
|       descrição     |	      ds         |   DsProdut  |
|         Nome        |	      Nm         |   NmClient  |
|         Cgc         |	      cj         |   CjClient  |
|        CNPJ         |	      cj         |   CjClient  |
|         CPF         |	      cj         |   CjClient  |
|       Numero        |	      nr         |   NrEndere  |
| Inscrição Estadual  |	      Ie         |  IeCliente  |
|      Endereço       |        ds        |   DsEndere  |
|       texto         |        tx        |   TxObserv  |
| Valor (Monetário)   |        vr        |    VrTotal  |
|     Percentual      |        pc        |   PcAliquo  |
| Inscrição Municipal |       im         |   ImClient  |


### Padrão de Constraint, Foreing Key, Primary Key ###
		
|                             |	Nome Tabela   |	  Resultado   |
|----------------------------:|--------------:|--------------:|
|            ID               |	    S001      |    IDS001     |
| CONSTRAINT (FOR_KEY)        |	    S001      | FK_S001_S002  |
| NOME CONSTRAINT PRIMARY KEY |     S001      |   PK_S001     |


### Padrão de Procedure ###

|  Abreviatura  |     Procedure      |       Resultado       | 
|--------------:|-------------------:|----------------------:|   
|       sp      |  stored procedure  |	sp_oti_nomeprocedure |
|       fn      |       function     |  fn_oti_nomefunction  |


### Padrão de PLSQL ###

|   crs	   |     Cursor     |
|    p     |    Parametro   |
|    l     |	  local       |

Exemplo: lCrsNome


##  Exemplo de Identação  ##

### PLSQL ###
```
#!sql

Select Distinct
       W054.NrAtendi, W054.NrSeqIte, W054.QtProdut, W054.CdProdut,
       W054.VrUniEnt, W054.VrTotEnt, W054.VrUniRem, W054.VrTotRem,
       W054.DtVencto, W054.QtRetorn, W052.SnLibera, W052.CdResArm,
       W054.NrLotSap, W054.DsLote,   G010.CdProSAP, G010.DsRefFab,
       W053R.NrNota as NrNotRef,     G010.PsBruto,  W052.SnAltLot,
       BloqueioAg(W054.NrAtendi, W054.NrSeqIte) as QtBloque,
       W053R.NrVenSap, W054.NrOrdVe1, W054.NrIteOV1, W054.NrOrdVe2,
       W054.NrIteOV2,  W054.NrOrdVe3, W054.NrIteOV3, W053R.SnEnvSap,
       W052.DsRasCli,  W052.DsRasCl2, W052.DsRasCl3, S092.DsCaptio,
       S0922.DsCaptio AS DsCapti2,    S0922.DsCaptio AS DsCapti3
From   W054 W054
       Left Join W052 W052  on (W052.NrAtendi   = W054.NrAtendi and
                                W052.TpAtendi  = 'E'            and
                                W052.StAtendi <> 'E')
       Left Join W053 W053R on (W053R.NrSeqNot  = W054.NrSeqNot and
                                W053R.TpNotAte  in ('A', 'E'))
       Left Join W053 W053V on (W053V.NrSeqNot  = W054.NrSeqVen)
       Left Join G010 G010  on (G010.CdProdut   = W054.CdProdut)
 
       Left Join W009 W009  on (W009.CdEmpres   = W052.CdEmpres  and
                                W009.CdArmaze   = <%CdArmaze%>),
       G011 G011
       Left Join S092 S092   on (S092.CdMatriz  = G011.CdTitula  and
                                 S092.NmTabela  = 'W052'         and
                                 S092.NmAtribu  = 'DSRASCLI')
       Left Join S092 S0922  on (S0922.CdMatriz  = G011.CdTitula  and
                                 S0922.NmTabela = 'W052'          and
                                 S0922.NmAtribu = 'DSRASCL2')
       Left Join S092 S0923  on (S0923.CdMatriz  = G011.CdTitula  and
                                 S0923.NmTabela = 'W052'          and
                                 S0923.NmAtribu = 'DSRASCL3')
 
Where  W052.TpOpeAte  = '<%TpOpeAte%>'  and
       W052.CdEmpres  = <%CdEmpres%>    and
       W052.CdTomado  = <%CdTomado%>    and
       W052.CdResArm  = <%CdResArm%>    and
       W054.CdProdut  = <%CdProdut%>    and
       W009.CdEmpres  = W052.CdEmpres   and
       G011.CdTitula  = (Select CdMatriz
                         from   G011 G011
                         Where  G011.CdTitula in (W052.CdResArm))
      
       <%DsLote%>
       <%NrNotVen%>
       <%NrNotRem%>
 
Order by W054.DtVencto
```
# Padrão Back-End #

## Estrutura da Pastas do Projeto ##

![folders_bravo2020.jpg](https://bitbucket.org/repo/qERpxro/images/4042751510-folders_bravo2020.jpg)

* Config - configurações gerais do servidor.
* Models - estrutura dos dados das tabelas.
* Controllers - Funções de consumo de dados.
* Services - Funções de regras de negócio  
* Routes - configurações de caminhos da API
* DAO - configurações de conexão
* Utils - Funções compartilhadas com o Server e o Cliente.
* Logs - informações de servidor


## Convenções ##

* Models - mdl + nome da tabela, exemplo: mdlCliente.
* Controller - crl + nome do tabela, exemplo: crlCliente.
* Routes - route + nome da tabela, exemplo: routeCliente.
* DAO - dao + nome da tabela, exemplo: daoCliente.
* Utils - Verbo + Ação, exemplo: validarCpf


## Requisições ##

* Get - utilizar para SELECTS, usando a url para filtros. Exemplo: api/cliente/id
* Post - utilizar para INSERT E UPDATES, passando parâmetros por request. Exemplo: api/cliente
* Exceções - para SELECTS que passam muitos parâmetros utilizar POST. Exemplo: Filtros da grid personalizada.


## Chamadas de API ##
* Utilizar semântica de língua natural. 

Exemplo:
 Consultar uma lista de clientes: api/clientes (no plural)
	     consultar um único cliente: api/cliente/id (no singular)

# Padrão Front-End #

## Estrutura de Pastas ##

![folders_frontend_bravo2020.jpg](https://bitbucket.org/repo/qERpxro/images/1257845943-folders_frontend_bravo2020.jpg)


## Descrições ##

* app - configurações gerais do Cliente.
* pages - Paginas da aplicação
* components - diretório onde será salvo os componentes referentes a pagina do mesmo diretório
* view - Arquivo HTML de visualização;
* ts - arquivo type script com as regras de negócio da página;
* css - arquivo de folha de estilos.
* services: Diretórios para guardar requisições e regras de negócios compartilhadas
* shared: Diretório para guardar components compartilhados
* routes: diretório para guardar os caminhos da aplicação


## Convenções ##

* pages - seguir as convenções estabelecidas pelo angular-cli. Exemplo: page cliente: clientes.
* services - seguir as convenções do angular-cli. Exemplo: ClienteService.
* Componentes Herdados - utilizar o nome do component principal + “-” + o nome do novo component. Exemplo: card-cliente