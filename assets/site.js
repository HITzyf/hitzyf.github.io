(() => {
  const button = document.querySelector('.author__urls-wrapper button');
  const links = document.querySelector('.author__urls');
  const close = () => { links.classList.remove('is-visible'); button.setAttribute('aria-expanded', 'false'); };
  button.addEventListener('click', () => {
    const expanded = links.classList.toggle('is-visible');
    button.setAttribute('aria-expanded', String(expanded));
  });
  document.addEventListener('click', event => { if (!event.target.closest('.author__urls-wrapper')) close(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape') close(); });
  const updateFooter = () => { document.body.style.marginBottom = document.querySelector('.page__footer').offsetHeight + 'px'; if (window.innerWidth >= 925) close(); };
  window.addEventListener('load', updateFooter);
  window.addEventListener('resize', updateFooter);
  updateFooter();
})();
