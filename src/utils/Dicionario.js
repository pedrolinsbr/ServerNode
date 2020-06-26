/**
 * @description Possui funções dicionário
 * @author João Eduardo Saad
 * @since 3/11/2017
 * @param {application} app - Configurações do app.
 * @param {connection} cb - Contém os dados de conexão com o banco de dados.
 * @return {JSON} Retorna um objeto JSON.
*/

module.exports = function (app, cb) {

    var fn = {};
    /**
    * @author João Eduardo Saad
    * @since 3/11/2017
    * @description Função para dicionário de nomes de tabelas do banco
    * @function fn/nomeTabela
    *
    * @return {JSON} Retorna um objeto JSON.
    **/

    fn.nomeTabela = function (nomeArquivo) {
        var tabelaRetorno;
        var posicaoContador = 0;

        //todas as tabelas do sistema e seus respectivos códigos estarão aqui
        var tabelas = [
            {
                nomeArquivo: 'UnidadeMedida',
                nomeTabela: 'Unidades de Medida',
                Id: 'IDG009',
                codTabela: 'G009'
            },
            {
                nomeArquivo: 'Pais',
                nomeTabela: 'Países',
                Id: 'IDG001',
                codTabela: 'G001'
            },
            {
                nomeArquivo: 'Usuario',
                nomeTabela: 'Usuários',
                Id: 'IDS001',
                codTabela: 'S001'
            },
            {
                nomeArquivo: 'CadastroEvento',
                nomeTabela: 'Cadastro de Eventos',
                Id: 'IDI001',
                codTabela: 'I001'
            },
            {
                nomeArquivo: 'Cidade',
                nomeTabela: 'Cidades',
                Id: 'IDG003',
                codTabela: 'G003'
            },
            {
                nomeArquivo: 'Estado',
                nomeTabela: 'Estados',
                Id: 'IDG002',
                codTabela: 'G002'
            },
            {
                nomeArquivo: 'Cliente',
                nomeTabela: 'Clientes',
                Id: 'IDG005',
                codTabela: 'G005'
            },
            {
                nomeArquivo: 'Embalagem',
                nomeTabela: 'Embalagens',
                Id: 'IDG011',
                codTabela: 'G011'
            },
            {
                nomeArquivo: 'Produto',
                nomeTabela: 'Produto',
                Id: 'IDG010',
                codTabela: 'G010'
            },
            {
                nomeArquivo: 'GrupoProduto',
                nomeTabela: 'GrupoProduto',
                Id: 'IDG038',
                codTabela: 'G038'
            },
            {
                nomeArquivo: 'CodigoONU',
                nomeTabela: 'CodigoONU',
                Id: 'IDG015',
                codTabela: 'G015'
            },
            {
                nomeArquivo: 'Operacao',
                nomeTabela: 'Operacao',
                Id: 'IDG014',
                codTabela: 'G014'
            },
            {
                nomeArquivo: 'Feriado',
                nomeTabela: 'Feriado',
                Id: 'IDG054',
                codTabela: 'G054'
            },
            {
                nomeArquivo: 'FeriadoLocalidade',
                nomeTabela: 'FeriadoLocalidade',
                Id: 'IDG055',
                codTabela: 'G055'
            },
            {
                nomeArquivo: 'Nfe',
                nomeTabela: 'Nfe',
                Id: 'IDG051',
                codTabela: 'G051'
            },
            {
                nomeArquivo: 'Deliveries',
                nomeTabela: 'Deliveries',
                Id: 'IDG043',
                codTabela: 'G043'
            },
            {
                nomeArquivo: 'Itens',
                nomeTabela: 'Itens',
                Id: 'IDG048',
                codTabela: 'G048'
            },
            {
                nomeArquivo: 'Cargas',
                nomeTabela: 'Cargas',
                Id: 'IDG046',
                codTabela: 'G046'
            },
            {
                nomeArquivo: 'DiasUteis',
                nomeTabela: 'DiasUteis',
                Id: 'IDG053',
                codTabela: 'G053'
            },
            {
                nomeArquivo: 'NfeDeliveries',
                nomeTabela: 'NfeDeliveries',
                Id: 'IDG052',
                codTabela: 'G052'
            },
            {
                nomeArquivo: 'Transportadoras',
                nomeTabela: 'Transportadoras',
                Id: 'IDG024',
                codTabela: 'G024'
            },
            {
                nomeArquivo: 'Categoria',
                nomeTabela: 'Categoria',
                Id: 'IDG037',
                codTabela: 'G037'
            },
            {
                nomeArquivo: 'Parametros',
                nomeTabela: 'Parametros',
                Id: 'IDH009',
                codTabela: 'H009'
            },
            {
                nomeArquivo: 'Intervalos',
                nomeTabela: 'Intervalos',
                Id: 'IDH011',
                codTabela: 'H011'
            }

            
        ];

        //verificador de posição
        for (posicaoContador = 0; posicaoContador < tabelas.length; posicaoContador++) {
            if (nomeArquivo == tabelas[posicaoContador].nomeArquivo) {
                tabelaRetorno = tabelas[posicaoContador];
                break;
            }

        }

        //retorno
        if (tabelaRetorno) {
            return tabelaRetorno;
        } else {
            return null;
        }

        return;
    };

    return fn;
};
