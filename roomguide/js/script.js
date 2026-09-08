const buttons = document.querySelectorAll('.roomguide-btn');

buttons.forEach(btn => {
  const targetId = btn.getAttribute('popovertarget');
  const popover = document.getElementById(targetId);
  if (!popover) return;

  popover.addEventListener('beforetoggle', (event) => {
    if (event.newState === 'open') {
      const rect = btn.getBoundingClientRect();
      popover.style.position = 'fixed';
      popover.style.top = rect.bottom + 'px';
      popover.style.left = rect.left + 'px';
      popover.style.margin = '0';
    }
  });

  const select = popover.querySelector('select');
  select.addEventListener('change', () => {
    const selectedText = select.options[select.selectedIndex].text;
    btn.textContent = selectedText;
    popover.hidePopover();
  });
});