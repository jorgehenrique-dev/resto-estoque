// ============================================================================
// js/utils/ui.js
// RESPONSABILIDADE: Funções visuais reutilizáveis.
//   Toast (notificações), Modal (janela de formulário), Loading, e helpers
//   que qualquer parte da aplicação pode chamar sem repetir código.
// ============================================================================

// ── TOAST (Notificações de canto de tela) ─────────────────────────────────────

/**
 * Exibe uma notificação ("toast") no canto inferior direito da tela.
 * Desaparece automaticamente após 3 segundos.
 *
 * @param {string} mensagem   - Texto a exibir
 * @param {'sucesso'|'erro'|'aviso'} tipo - Define a cor do toast
 */
export function mostrarToast(mensagem, tipo = 'sucesso') {
  // Mapa de cores por tipo de mensagem
  const cores = {
    sucesso: 'bg-green-600',
    erro:    'bg-red-600',
    aviso:   'bg-amber-500',
  };

  // Cria o elemento do toast dinamicamente
  const toast = document.createElement('div');
  toast.className = `
    fixed bottom-6 right-6 z-50 flex items-center gap-3
    ${cores[tipo] ?? cores.sucesso}
    text-white text-sm font-medium
    px-4 py-3 rounded-lg shadow-lg
    translate-y-2 opacity-0 transition-all duration-300
  `;
  toast.textContent = mensagem;

  document.body.appendChild(toast);

  // Anima a entrada (pequeno delay para o CSS pegar)
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Remove após 3 segundos
  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// ── MODAL (Janela de formulário) ──────────────────────────────────────────────

/**
 * Exibe o modal de cadastro/edição preenchendo o título e os campos.
 *
 * @param {string} titulo       - Título que aparece no topo do modal
 * @param {object|null} dados   - Se passado, preenche os campos para edição
 */
export function abrirModal(titulo, dados = null) {
  // Preenche o título
  document.getElementById('modal-titulo').textContent = titulo;

  // Limpa ou preenche os campos do formulário
  document.getElementById('campo-id').value             = dados?.id ?? '';
  document.getElementById('campo-nome').value           = dados?.nome ?? '';
  document.getElementById('campo-categoria').value      = dados?.categoria ?? '';
  document.getElementById('campo-unidade').value        = dados?.unidade ?? 'kg';
  document.getElementById('campo-quantidade').value     = dados?.quantidade_atual ?? '';
  document.getElementById('campo-minimo').value         = dados?.estoque_minimo ?? '';

  // Exibe o modal removendo a classe que o esconde
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('campo-nome').focus(); // foca no primeiro campo
}

/**
 * Fecha o modal (adiciona a classe hidden novamente).
 */
export function fecharModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ── LOADING (Indicador de carregamento) ───────────────────────────────────────

/**
 * Exibe ou oculta o indicador de carregamento global.
 * @param {boolean} visivel
 */
export function setLoading(visivel) {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  el.classList.toggle('hidden', !visivel);
}

// ── CONFIRMAÇÃO ───────────────────────────────────────────────────────────────

/**
 * Substitui o window.confirm padrão por uma versão mais estilizada.
 * Retorna uma Promise<boolean> para uso com await.
 *
 * @param {string} mensagem - Pergunta a ser exibida ao usuário
 */
export function confirmar(mensagem) {
  return new Promise(resolve => {
    // Por simplicidade, usamos o confirm nativo.
    // Em produção, você poderia criar um modal customizado aqui.
    resolve(window.confirm(mensagem));
  });
}

// ── BADGE DE STATUS ───────────────────────────────────────────────────────────

/**
 * Gera o HTML de um badge colorido com o status do estoque.
 *
 * @param {number} quantidade - Quantidade atual
 * @param {number} minimo     - Estoque mínimo definido
 * @returns {string} HTML do badge
 */
export function badgeStatus(quantidade, minimo) {
  if (quantidade === 0) {
    return `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Zerado</span>`;
  }
  if (quantidade < minimo) {
    return `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Baixo</span>`;
  }
  return `<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Normal</span>`;
}

// ── FORMATAÇÃO DE DATA ────────────────────────────────────────────────────────

/**
 * Formata uma string de data ISO para o padrão brasileiro DD/MM/AAAA HH:MM.
 * @param {string} isoString - Data no formato ISO retornada pelo Supabase
 */
export function formatarData(isoString) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}
