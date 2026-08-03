const navItems = document.querySelectorAll('.nav-item');
const telas = document.querySelectorAll('.tela');

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
