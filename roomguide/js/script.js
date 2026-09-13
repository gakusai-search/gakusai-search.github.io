/*教室選択のoptionを整理しよう！ */

const fl_classrooms = {
  '1階': ['教室を選択', 'エントランスホール', 'コミュニケーションホール'],
  '3階': ['教室を選択', '301'],
  '4階': ['教室を選択', '401'],
  '5階': ['教室を選択', '501', '502'],
  '6階': ['教室を選択', '事務室'],
  '7階': ['教室を選択', '701', '702'],
  '8階': ['教室を選択', '801', '802'],
  '9階': ['教室を選択', '901', '902'],
  '10階': ['教室を選択', '1001', '1002', '1003', '1004', '1005'],
};

/*上から順に選ばないと次には進めないよ～ん */

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

  /*ボタンを押せるかどうかはこれで処理するよ */

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
      else if (selectedvalue ==="chudai"){ /*全部変更するのめんどくさいのでこれで行きます */
        nextBtn.disabled = false;
      }}
  });
});

/*教室選択の際の選択肢の処理だよ */

const flSelectPopover = document.getElementById('fl_select');
const classroomsSelectPopover = document.getElementById('classrooms_select');

if (flSelectPopover && classroomsSelectPopover) {
  const flSelect = flSelectPopover.querySelector('select');
  const classroomsSelect = classroomsSelectPopover.querySelector('select');

  if (flSelect && classroomsSelect) {
    flSelect.addEventListener('change', () => {
      const selectedFloor = flSelect.options[flSelect.selectedIndex].text;

      classroomsSelect.innerHTML = '';

      const classrooms = fl_classrooms[selectedFloor];

      if (classrooms) {
        classrooms.forEach((room) => {
          const option = document.createElement('option');
          option.value = room;
          option.textContent = room;
          classroomsSelect.appendChild(option);
        });
      } else {
        const option = document.createElement('option');
        option.value = 'none';
        option.textContent = '教室を選択';
        classroomsSelect.appendChild(option);
        }
    });
  }
}

buttons.forEach((btn) => {
  if (btn.dataset.originalText === undefined) {
    btn.dataset.originalText = btn.textContent.trim();
  }
});

/*選択肢を変更した場合に実行する後続ボタンの初期化処理だよ */

buttons.forEach((btn, index) => {
  const targetId = btn.getAttribute('popovertarget');
  if (!targetId) return;
  const popover = document.getElementById(targetId);
 if (!popover) return;
  const select = popover.querySelector('select');
  if (!select) return;
  select.addEventListener('change', () => {  /*Claudeのコードはこの先がバグってたっぽくて調整が大変でした */
    for (let i = index + 2; i < buttons.length; i++) {
      const laterBtn = buttons[i];
      laterBtn.disabled = true;}
    for (let i = index + 1; i < buttons.length; i++) {
      const laterBtn = buttons[i];
      laterBtn.textContent = laterBtn.dataset.originalText;

      const laterTargetId = laterBtn.getAttribute('popovertarget');
      if (!laterTargetId) continue;
      const laterPopover = document.getElementById(laterTargetId);
      if (!laterPopover) continue;
      const laterSelect = laterPopover.querySelector('select');
      if (!laterSelect) continue;

      laterSelect.selectedIndex = 0;
    }
  });
});