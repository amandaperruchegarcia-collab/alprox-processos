// aula-2/app/supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

// Credenciais do projeto Supabase (públicas)
const SUPABASE_URL = 'https://aefiardlggehjlnrjavz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JtZuePMhw2uiejnElWtbZA_NT7hGbPf';

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis globais de sessão
export let usuario_id = null;
export let usuario_nome = null;

/**
 * Inicializa a sessão do usuário
 * Verifica se existe uma sessão ativa e atualiza as variáveis globais
 * @returns {Promise<boolean>} true se autenticado, false caso contrário
 */
export async function inicializarSessao() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      usuario_id = data.session.user.id;
      usuario_nome = data.session.user.email;
      console.log('✅ Sessão inicializada para:', usuario_nome);
      return true; // autenticado
    }
    console.log('ℹ️  Nenhuma sessão ativa');
    return false; // não autenticado
  } catch (error) {
    console.error('❌ Erro ao inicializar sessão:', error);
    return false;
  }
}

/**
 * Faz logout do usuário
 * Limpa a sessão do Supabase e as variáveis globais
 */
export async function fazerLogout() {
  try {
    await supabase.auth.signOut();
    usuario_id = null;
    usuario_nome = null;
    console.log('✅ Logout realizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
  }
}
