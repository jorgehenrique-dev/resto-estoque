// ============================================================================
// js/app.js
// RESPONSABILIDADE: Ponto central da aplicação.
//   - Guarda o estado global (usuário logado, lista de ingredientes)
//   - Controla qual "tela" está ativa (roteamento simples)
//   - Conecta os eventos dos botões às funções corretas
//   - Renderiza as tabelas e os dados na tela
// ============================================================================

import {
  loginUsuario,
  buscarIngredientes,
  criarIngrediente,
  atualizarIngrediente,
  deletarIngrediente,
  buscarMovimentacoes,
  registrarMovimentacao,
} from './services/api.js';

import {
  mostrarToast,
  abrirModal,
  fecharModal,
  setLoading,
  confirmar,
  badgeStatus,
  formatarData,
} from './utils/ui.js';

// ── ESTADO GLOBAL ─────────────────────────────────────────────────────────────
// Estas variáveis representam a "memória" da aplicação enquanto ela está aberta.
// São equivalentes ao "estado" em frameworks como React ou Vue.

let usuarioLogado    = null; // Objeto do usuário vindo do banco
let listaIngredientes = [];  // Cache da lista de ingredientes

// ── ALGORITMO DE ORDENAÇÃO: BUBBLE SORT ───────────────────────────────────────
// Ordena um array de objetos pelo campo "nome" em ordem alfabética (A → Z).
// Utilizado na tela de Estoque (Entrega 07).
//
// Como funciona:
//   Percorre o array várias vezes. A cada passagem, compara dois elementos
//   vizinhos e os troca se estiverem fora de ordem. Repete até não precisar
//   mais trocar nenhum par.

function bubbleSort(arr) {
  const lista = [...arr]; // cópia para não modificar o array original
  const n = lista.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      // Compara o nome dos dois elementos vizinhos
      if (lista[j].nome.localeCompare(lista[j + 1].nome) > 0) {
        // Se o da esquerda vem depois alfabeticamente, troca os dois
        [lista[j], lista[j + 1]] = [lista[j + 1], lista[j]];
      }
    }
  }
  return lista;
}

// ── ROTEAMENTO (troca de telas) ───────────────────────────────────────────────

/**
 * Mostra a tela desejada e esconde todas as outras.
 * As "telas" são <section> com ids no HTML.
 * @param {string} nomeTela - ID da seção a exibir
 */
function mostrarTela(nomeTela) {
  // Esconde todas as seções
  document.querySelectorAll('.tela').forEach(t => t.classList.add('hidden'));

  // Exibe apenas a tela solicitada
  document.getElementById(`tela-${nomeTela}`)?.classList.remove('hidden');

  // Atualiza o item ativo no menu lateral
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('bg-orange-700', link.dataset.tela === nomeTela);
    link.classList.toggle('text-white',    link.dataset.tela === nomeTela);
    link.classList.toggle('text-orange-200', link.dataset.tela !== nomeTela);
  });

  // Carrega os dados da tela que foi ativada
  if (nomeTela === 'painel')    carregarPainel();
  if (nomeTela === 'produtos')  carregarTabelaProdutos();
  if (nomeTela === 'estoque')   carregarTelaEstoque();
  if (nomeTela === 'historico') carregarHistorico();
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────

async function handleLogin() {
  const login = document.getElementById('input-login').value.trim();
  const senha = document.getElementById('input-senha').value.trim();

  if (!login || !senha) {
    mostrarToast('Preencha login e senha.', 'aviso');
    return;
  }

  setLoading(true);
  const usuario = await loginUsuario(login, senha);
  setLoading(false);

  if (!usuario) {
    mostrarToast('Login ou senha incorretos.', 'erro');
    document.getElementById('erro-login').classList.remove('hidden');
    return;
  }

  // Login bem-sucedido: guarda o usuário e exibe a aplicação
  usuarioLogado = usuario;
  document.getElementById('tela-login').classList.add('hidden');
  document.getElementById('layout-app').classList.remove('hidden');
  document.getElementById('nome-usuario').textContent = usuario.nome;

  // Carrega os ingredientes uma única vez e guarda no cache
  listaIngredientes = await buscarIngredientes();
  mostrarTela('painel');
}

// ── PAINEL ────────────────────────────────────────────────────────────────────

function carregarPainel() {
  const total     = listaIngredientes.length;
  const emAlerta  = listaIngredientes.filter(i => i.quantidade_atual < i.estoque_minimo);
  const zerados   = listaIngredientes.filter(i => i.quantidade_atual === 0);
  const normais   = total - emAlerta.length;

  // Atualiza os KPI cards
  document.getElementById('kpi-total').textContent   = total;
  document.getElementById('kpi-normal').textContent  = normais;
  document.getElementById('kpi-alerta').textContent  = emAlerta.length;
  document.getElementById('kpi-zerado').textContent  = zerados.length;

  // Bloco de alertas
  const divAlerta = document.getElementById('painel-alertas');
  if (emAlerta.length === 0) {
    divAlerta.innerHTML = `<p class="text-sm text-green-700 font-medium">✅ Todos os ingredientes estão dentro do estoque mínimo.</p>`;
  } else {
    divAlerta.innerHTML = `
      <p class="text-sm font-semibold text-amber-800 mb-2">⚠ ${emAlerta.length} ingrediente(s) abaixo do mínimo:</p>
      <ul class="space-y-1">
        ${emAlerta.map(i => `
          <li class="text-sm text-amber-900">
            • <strong>${i.nome}</strong> — ${i.quantidade_atual} ${i.unidade}
            <span class="text-amber-600">(mínimo: ${i.estoque_minimo} ${i.unidade})</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  // Tabela resumo do painel
  const tbody = document.getElementById('painel-tabela-body');
  tbody.innerHTML = listaIngredientes.map(i => `
    <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
      <td class="px-4 py-3 text-sm font-medium text-stone-800">${i.nome}</td>
      <td class="px-4 py-3 text-sm text-stone-500">${i.categoria}</td>
      <td class="px-4 py-3 text-sm text-stone-800">${i.quantidade_atual} ${i.unidade}</td>
      <td class="px-4 py-3">${badgeStatus(i.quantidade_atual, i.estoque_minimo)}</td>
    </tr>
  `).join('');
}

// ── PRODUTOS (CRUD) ───────────────────────────────────────────────────────────

function carregarTabelaProdutos(filtro = '') {
  // Filtra localmente pelo texto digitado na busca
  const lista = listaIngredientes.filter(i =>
    i.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    i.categoria.toLowerCase().includes(filtro.toLowerCase())
  );

  const tbody = document.getElementById('produtos-tabela-body');

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-stone-400 text-sm">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(i => `
    <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors" data-id="${i.id}">
      <td class="px-4 py-3 text-sm font-medium text-stone-800">${i.nome}</td>
      <td class="px-4 py-3 text-sm text-stone-500">${i.categoria}</td>
      <td class="px-4 py-3 text-sm text-stone-800">${i.quantidade_atual} ${i.unidade}</td>
      <td class="px-4 py-3 text-sm text-stone-800">${i.estoque_minimo} ${i.unidade}</td>
      <td class="px-4 py-3">${badgeStatus(i.quantidade_atual, i.estoque_minimo)}</td>
      <td class="px-4 py-3">
        <div class="flex gap-2">
          <button onclick="editarProduto(${i.id})"
            class="text-xs px-3 py-1 rounded border border-stone-300 hover:bg-stone-100 transition-colors">
            Editar
          </button>
          <button onclick="excluirProduto(${i.id})"
            class="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            Excluir
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Chamado pelo botão "Editar" na tabela — abre o modal preenchido
window.editarProduto = function(id) {
  const ingrediente = listaIngredientes.find(i => i.id === id);
  if (ingrediente) abrirModal('Editar Ingrediente', ingrediente);
};

// Chamado pelo botão "Excluir" na tabela
window.excluirProduto = async function(id) {
  const ok = await confirmar('Deseja excluir este ingrediente?');
  if (!ok) return;

  setLoading(true);
  const sucesso = await deletarIngrediente(id);
  setLoading(false);

  if (sucesso) {
    // Remove do cache local sem precisar recarregar do banco
    listaIngredientes = listaIngredientes.filter(i => i.id !== id);
    carregarTabelaProdutos();
    mostrarToast('Ingrediente excluído com sucesso!');
  } else {
    mostrarToast('Erro ao excluir ingrediente.', 'erro');
  }
};

// Salva o formulário do modal (cria ou atualiza)
async function salvarFormulario() {
  const id        = document.getElementById('campo-id').value;
  const nome      = document.getElementById('campo-nome').value.trim();
  const categoria = document.getElementById('campo-categoria').value.trim();
  const unidade   = document.getElementById('campo-unidade').value;
  const quantidade = parseFloat(document.getElementById('campo-quantidade').value) || 0;
  const minimo    = parseFloat(document.getElementById('campo-minimo').value) || 0;

  // Validações básicas
  if (!nome || !categoria) {
    mostrarToast('Nome e Categoria são obrigatórios.', 'aviso');
    return;
  }

  const dados = { nome, categoria, unidade, quantidade_atual: quantidade, estoque_minimo: minimo };

  setLoading(true);

  if (id) {
    // Edição: atualiza o registro existente
    const atualizado = await atualizarIngrediente(parseInt(id), dados);
    if (atualizado) {
      // Atualiza no cache local
      listaIngredientes = listaIngredientes.map(i => i.id === atualizado.id ? atualizado : i);
      mostrarToast('Ingrediente atualizado!');
    } else {
      mostrarToast('Erro ao atualizar.', 'erro');
    }
  } else {
    // Novo: cria o registro
    const criado = await criarIngrediente(dados);
    if (criado) {
      listaIngredientes.push(criado);
      mostrarToast('Ingrediente cadastrado!');
    } else {
      mostrarToast('Erro ao cadastrar.', 'erro');
    }
  }

  setLoading(false);
  fecharModal();
  carregarTabelaProdutos();
}

// ── ESTOQUE (MOVIMENTAÇÕES) ───────────────────────────────────────────────────

function carregarTelaEstoque() {
  // Aplica o Bubble Sort para exibir em ordem alfabética (Entrega 07)
  const ordenados = bubbleSort(listaIngredientes);

  const select = document.getElementById('estoque-select-produto');
  select.innerHTML = `<option value="">-- Selecione um ingrediente --</option>` +
    ordenados.map(i => `
      <option value="${i.id}" data-atual="${i.quantidade_atual}" data-unidade="${i.unidade}" data-minimo="${i.estoque_minimo}">
        ${i.nome} — Estoque: ${i.quantidade_atual} ${i.unidade}
      </option>
    `).join('');

  // Atualiza o card de info quando o usuário seleciona um produto
  select.onchange = () => {
    const opt = select.selectedOptions[0];
    const card = document.getElementById('estoque-info-card');
    if (!opt.value) { card.classList.add('hidden'); return; }

    const atual  = parseFloat(opt.dataset.atual);
    const minimo = parseFloat(opt.dataset.minimo);

    document.getElementById('estoque-info-atual').textContent  = `${atual} ${opt.dataset.unidade}`;
    document.getElementById('estoque-info-minimo').textContent = `${minimo} ${opt.dataset.unidade}`;
    document.getElementById('estoque-info-badge').innerHTML    = badgeStatus(atual, minimo);
    card.classList.remove('hidden');
  };
}

async function handleMovimentacao(tipo) {
  const select    = document.getElementById('estoque-select-produto');
  const quantidadeInput = document.getElementById('estoque-quantidade');
  const opt       = select.selectedOptions[0];

  if (!opt?.value) { mostrarToast('Selecione um ingrediente.', 'aviso'); return; }

  const quantidade = parseFloat(quantidadeInput.value);
  if (!quantidade || quantidade <= 0) { mostrarToast('Informe uma quantidade válida.', 'aviso'); return; }

  const id          = parseInt(opt.value);
  const estoqueAtual = parseFloat(opt.dataset.atual);

  setLoading(true);
  const resultado = await registrarMovimentacao(id, usuarioLogado.id, tipo, quantidade, estoqueAtual);
  setLoading(false);

  if (!resultado.sucesso) {
    mostrarToast(resultado.mensagem, 'erro');
    return;
  }

  // Atualiza o cache local sem recarregar o banco
  listaIngredientes = listaIngredientes.map(i =>
    i.id === id ? { ...i, quantidade_atual: resultado.novaQuantidade } : i
  );

  // Verifica se ficou abaixo do mínimo
  const ingrediente = listaIngredientes.find(i => i.id === id);
  if (ingrediente.quantidade_atual < ingrediente.estoque_minimo) {
    mostrarToast(`⚠ Atenção: ${ingrediente.nome} abaixo do mínimo!`, 'aviso');
  } else {
    mostrarToast(resultado.mensagem);
  }

  // Limpa o formulário e recarrega a tela
  quantidadeInput.value = '';
  carregarTelaEstoque();
}

// ── HISTÓRICO ─────────────────────────────────────────────────────────────────

async function carregarHistorico() {
  setLoading(true);
  const movimentacoes = await buscarMovimentacoes();
  setLoading(false);

  const tbody = document.getElementById('historico-tabela-body');

  if (movimentacoes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-stone-400 text-sm">Nenhuma movimentação registrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = movimentacoes.map(m => {
    const corTipo = m.tipo === 'Entrada'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
    const icone = m.tipo === 'Entrada' ? '↑' : '↓';

    return `
      <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
        <td class="px-4 py-3 text-sm text-stone-500">${formatarData(m.data_movimentacao)}</td>
        <td class="px-4 py-3 text-sm font-medium text-stone-800">${m.nomeIngrediente}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-0.5 text-xs font-semibold rounded-full ${corTipo}">
            ${icone} ${m.tipo}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-stone-800">${m.quantidade}</td>
      </tr>
    `;
  }).join('');
}

// ── INICIALIZAÇÃO: liga todos os eventos quando a página carrega ──────────────

document.addEventListener('DOMContentLoaded', () => {
  // Login
  document.getElementById('btn-login').addEventListener('click', handleLogin);
  document.getElementById('input-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    usuarioLogado = null;
    listaIngredientes = [];
    document.getElementById('layout-app').classList.add('hidden');
    document.getElementById('tela-login').classList.remove('hidden');
    document.getElementById('input-login').value = '';
    document.getElementById('input-senha').value = '';
  });

  // Navegação lateral
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => mostrarTela(link.dataset.tela));
  });

  // Botão "Novo Produto"
  document.getElementById('btn-novo-produto').addEventListener('click', () => {
    abrirModal('Novo Ingrediente');
  });

  // Busca em tempo real na tela de Produtos
  document.getElementById('input-busca').addEventListener('input', e => {
    carregarTabelaProdutos(e.target.value);
  });

  // Modal: salvar e cancelar
  document.getElementById('btn-salvar-modal').addEventListener('click', salvarFormulario);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) fecharModal();
  });

  // Estoque: botões Entrada e Saída
  document.getElementById('btn-entrada').addEventListener('click', () => handleMovimentacao('Entrada'));
  document.getElementById('btn-saida').addEventListener('click',   () => handleMovimentacao('Saída'));
});
