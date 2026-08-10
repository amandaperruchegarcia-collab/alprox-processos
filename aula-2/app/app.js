import { fazerLogout } from './login.js';
import { migrarDadosLocalStorage } from './migration.js';

const navItems = document.querySelectorAll('.nav-item');
const telas = document.querySelectorAll('.tela');
const logoutBtn = document.getElementById('logout-btn');
const appHeader = document.getElementById('app-header');

function mudarTela(telaId) {
  navItems.forEach(i => i.classList.remove('ativo'));
  const navAlvo = document.querySelector(`[data-tela="${telaId}"]`);
  if (navAlvo) navAlvo.classList.add('ativo');

  telas.forEach(t => t.classList.remove('ativa'));
  document.getElementById(telaId).classList.add('ativa');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navItems.forEach(item => {
  item.addEventListener('click', () => mudarTela(item.dataset.tela));
});

// Evento de logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await fazerLogout();
  });
}

// Evento de login bem-sucedido: executar migração e mostrar dashboard
window.addEventListener('usuario-logado', async (event) => {
  // Executar migração de dados localStorage → Supabase (uma única vez)
  const usuario_id = event.detail?.usuario_id || window.supabase_usuario_id;
  if (usuario_id) {
    console.log('🔄 Iniciando migração para usuário:', usuario_id);
    await migrarDadosLocalStorage(usuario_id);
  }

  // Mostrar botão de logout
  if (logoutBtn) logoutBtn.style.display = 'block';
});

// Inicialmente ocultar (será mostrado após autenticação bem-sucedida)
window.addEventListener('DOMContentLoaded', () => {
  if (window.supabase_usuario_id) {
    if (logoutBtn) logoutBtn.style.display = 'block';
  } else {
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
});
