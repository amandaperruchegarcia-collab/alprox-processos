import { supabase, inicializarSessao } from './supabase-config.js';

// Elementos do formulário
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginSenha = document.getElementById('login-senha');
const loginErro = document.getElementById('login-erro');
const telaLogin = document.getElementById('tela-login');
const telaDashboard = document.getElementById('tela-dashboard');

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} senha - Senha do usuário
 */
export async function fazerLogin(email, senha) {
  try {
    // Autenticar via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (error) throw error;

    const userId = data.user.id;

    // Verificar se colaborador existe na tabela
    const { data: colaborador, error: erroFetch } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Se não existe, criar entrada
    if (!colaborador) {
      const { error: erroInsert } = await supabase.from('colaboradores').insert({
        id: userId,
        nome: email.split('@')[0],
        email: email,
        cargo: null,
        role: 'user',
        ativo: true
      });

      if (erroInsert && erroInsert.code !== '23505') { // 23505 = unique constraint violation
        console.warn('⚠️ Aviso ao criar colaborador:', erroInsert);
      } else if (!erroInsert) {
        console.log('✅ Novo colaborador criado:', email);
      }
    } else if (erroFetch) {
      // Erro real ao consultar, não apenas "não encontrado"
      throw erroFetch;
    }

    // Atualizar sessão global
    const autenticado = await inicializarSessao();
    if (autenticado) {
      // Ocultar login, mostrar dashboard
      telaLogin.classList.remove('ativa');
      telaDashboard.classList.add('ativa');

      // Limpar formulário
      loginForm.reset();
      loginErro.style.display = 'none';

      // Disparar evento para carregar dados
      window.dispatchEvent(new CustomEvent('usuario-logado', {
        detail: { usuario_id: window.supabase_usuario_id }
      }));

      console.log('✅ Login bem-sucedido para:', email);
    }
  } catch (error) {
    console.error('❌ Erro de login:', error);
    loginErro.textContent = error.message || 'Erro ao fazer login. Verifique suas credenciais.';
    loginErro.style.display = 'block';
  }
}

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<boolean>} true se autenticado, false caso contrário
 */
export async function verificarAutenticacao() {
  try {
    const autenticado = await inicializarSessao();

    if (autenticado) {
      // Usuário autenticado: mostrar dashboard, ocultar login
      telaLogin.classList.remove('ativa');
      telaDashboard.classList.add('ativa');
    } else {
      // Usuário não autenticado: mostrar login, ocultar dashboard
      telaLogin.classList.add('ativa');
      telaDashboard.classList.remove('ativa');
    }

    return autenticado;
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
}

/**
 * Faz logout do usuário
 */
export async function fazerLogout() {
  try {
    await supabase.auth.signOut();
    window.supabase_usuario_id = null;

    // Ocultar dashboard, mostrar login
    telaDashboard.classList.remove('ativa');
    telaLogin.classList.add('ativa');

    // Limpar formulário e erros
    loginForm.reset();
    loginErro.style.display = 'none';

    console.log('✅ Logout realizado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao fazer logout:', error);
  }
}

// Event listener para o formulário de login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErro.style.display = 'none';

    const email = loginEmail.value.trim();
    const senha = loginSenha.value;

    if (!email || !senha) {
      loginErro.textContent = 'Por favor, preencha email e senha.';
      loginErro.style.display = 'block';
      return;
    }

    await fazerLogin(email, senha);
  });
}

// Verificar autenticação ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
  await verificarAutenticacao();
});
