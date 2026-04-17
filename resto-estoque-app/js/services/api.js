// ============================================================================
// js/services/api.js
// RESPONSABILIDADE: Todas as funções que conversam com o banco de dados.
//   Aqui ficam as operações de: buscar, salvar, editar, excluir.
//   O resto da aplicação nunca fala diretamente com o Supabase —
//   sempre usa uma função deste arquivo.
// ============================================================================

import { supabase } from '../config/supabase.js';

// ── USUÁRIOS ─────────────────────────────────────────────────────────────────

/**
 * Tenta fazer login buscando um usuário com login e senha correspondentes.
 * Retorna o objeto do usuário ou null se não encontrar.
 */
export async function loginUsuario(login, senha) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('login', login)
    .eq('senha_hash', senha)
    .single(); // espera exatamente 1 resultado

  if (error) return null;
  return data; // { id, nome, login, ... }
}

// ── INGREDIENTES (CRUD) ───────────────────────────────────────────────────────

/**
 * Busca todos os ingredientes do banco.
 * Retorna um array de objetos ingrediente.
 */
export async function buscarIngredientes() {
  const { data, error } = await supabase
    .from('ingredientes')
    .select('*')
    .order('nome', { ascending: true }); // ordem alfabética padrão

  if (error) {
    console.error('Erro ao buscar ingredientes:', error.message);
    return [];
  }
  return data;
}

/**
 * Salva um novo ingrediente no banco.
 * Recebe um objeto com: nome, categoria, unidade, quantidade_atual, estoque_minimo.
 * Retorna o ingrediente criado ou null em caso de erro.
 */
export async function criarIngrediente(ingrediente) {
  const { data, error } = await supabase
    .from('ingredientes')
    .insert([ingrediente])
    .select()  // retorna o registro inserido
    .single();

  if (error) {
    console.error('Erro ao criar ingrediente:', error.message);
    return null;
  }
  return data;
}

/**
 * Atualiza os dados de um ingrediente existente.
 * Recebe o id do ingrediente e um objeto com os campos a atualizar.
 * Retorna o ingrediente atualizado ou null em caso de erro.
 */
export async function atualizarIngrediente(id, campos) {
  const { data, error } = await supabase
    .from('ingredientes')
    .update(campos)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar ingrediente:', error.message);
    return null;
  }
  return data;
}

/**
 * Remove um ingrediente pelo seu id.
 * Retorna true se deletou com sucesso, false em caso de erro.
 */
export async function deletarIngrediente(id) {
  const { error } = await supabase
    .from('ingredientes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar ingrediente:', error.message);
    return false;
  }
  return true;
}

// ── MOVIMENTAÇÕES ─────────────────────────────────────────────────────────────

/**
 * Busca todo o histórico de movimentações, incluindo o nome do ingrediente.
 * O "join" é feito via select: ingredientes(nome) traz o nome relacionado.
 */
export async function buscarMovimentacoes() {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select(`
      id,
      tipo,
      quantidade,
      data_movimentacao,
      ingredientes ( nome )
    `)
    .order('data_movimentacao', { ascending: false }); // mais recente primeiro

  if (error) {
    console.error('Erro ao buscar movimentações:', error.message);
    return [];
  }

  // Achata o objeto para facilitar o uso: mov.nomeIngrediente ao invés de mov.ingredientes.nome
  return data.map(m => ({
    ...m,
    nomeIngrediente: m.ingredientes?.nome ?? 'Desconhecido',
  }));
}

/**
 * Registra uma movimentação (Entrada ou Saída) e atualiza a quantidade do ingrediente.
 * Toda a lógica de negócio fica aqui, isolada do app.js.
 *
 * @param {number} ingredienteId  - ID do ingrediente
 * @param {number} usuarioId      - ID do usuário logado
 * @param {'Entrada'|'Saída'} tipo - Tipo da movimentação
 * @param {number} quantidade     - Quantidade movimentada
 * @param {number} estoqueAtual   - Quantidade atual antes da movimentação
 * @returns {{ sucesso: boolean, mensagem: string, novaQuantidade?: number }}
 */
export async function registrarMovimentacao(ingredienteId, usuarioId, tipo, quantidade, estoqueAtual) {
  // Calcula a nova quantidade com base no tipo
  const novaQuantidade = tipo === 'Entrada'
    ? estoqueAtual + quantidade
    : estoqueAtual - quantidade;

  // Valida: não permite estoque negativo
  if (novaQuantidade < 0) {
    return { sucesso: false, mensagem: `Estoque insuficiente! Disponível: ${estoqueAtual}.` };
  }

  // 1. Insere o registro na tabela de movimentações
  const { error: erroMov } = await supabase
    .from('movimentacoes')
    .insert([{ ingrediente_id: ingredienteId, usuario_id: usuarioId, tipo, quantidade }]);

  if (erroMov) return { sucesso: false, mensagem: 'Erro ao registrar movimentação.' };

  // 2. Atualiza a quantidade atual do ingrediente
  const { error: erroUpd } = await supabase
    .from('ingredientes')
    .update({ quantidade_atual: novaQuantidade })
    .eq('id', ingredienteId);

  if (erroUpd) return { sucesso: false, mensagem: 'Movimentação salva, mas falha ao atualizar estoque.' };

  return { sucesso: true, mensagem: 'Movimentação registrada com sucesso!', novaQuantidade };
}
