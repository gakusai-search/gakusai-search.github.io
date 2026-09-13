const fl_classrooms = {
  '1階': ['エントランスホール', 'コミュニケーションホール'],
  '2階': ['図書室', 'ラーニングコモンズ'],
  '3階': ['301'],
  '4階': ['401'],
  '5階': ['501', '502'],
  '6階': ['事務室'],
  '7階': ['701', '702'],
  '8階': ['801', '802'],
  '9階': ['901', '902'],
  '10階': ['1001', '1002', '1003', '1004', '1005'],
  '11階': ['1101', '1102', '1103', '1104', '1005'],
};

const buttons = document.querySelectorAll('.roomguide-btn');

buttons.forEach((btn, index) => {
  if (index !== 0) {
    btn.disabled = true;
  }
  const targetId = btn.getAttribute('popovertarget');
  if (!targetId) return;
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
  if (!select) return;
  select.addEventListener('change', () => {
    const selectedText = select.options[select.selectedIndex].text;
    btn.textContent = selectedText;
    popover.hidePopover();
    const nextBtn = buttons[index + 1];
    const selectedvalue = select.value
    if (nextBtn) {
      if (selectedvalue ==="none"){
        nextBtn.disabled = true;
      }
      else if (selectedvalue ==="chudai"){ /*お試しとしてuniv-selectのvalueタグをchudaiで実装した名残 */
        nextBtn.disabled = false;
      }}
  });
});