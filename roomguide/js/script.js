/*教室選択のoptionを整理しよう！ */

/*
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
*/

/*フロアマップのoptionも整理しよう！ */
const floor_map = {
  "iTL-2F": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-2.png",

}

/*上から順に選ばないと次には進めないよ～ん */

const selects = document.querySelectorAll('.roomguide-btn');

selects.forEach((select, index) => {
  if (index !== 0) {
    select.disabled = true;
  }

  /*選択できるかどうかはこれで処理するよ */
  select.addEventListener('change', () => {
    const nextSelect = selects[index + 1];
    const selectedvalue = select.value;
    if (nextSelect) {
      if (selectedvalue === "none") {
        nextSelect.disabled = true;
      } else if (selectedvalue === "chudai") { /*全部変更するのめんどくさいのでこれで行きます */
        nextSelect.disabled = false;
      }
    }
  });
});

/*選択肢を変更した場合に実行する後続選択の初期化処理だよ */

selects.forEach((select, index) => {
  select.addEventListener('change', () => {
    for (let i = index + 2; i < selects.length; i++) {
      selects[i].disabled = true;
    }
    for (let i = index + 1; i < selects.length; i++) {
      selects[i].selectedIndex = 0;
    }
  });
});

/*検索ボタンはデフォで押せない見た目の方が良さそうってイティエルが言ってた */

const flSelect = document.getElementById('fl_select');
const searchBtn = document.querySelector('.roomguide-search-btn');

flSelect.addEventListener('change', updateSearchBtn);
updateSearchBtn();

searchBtn.addEventListener('click', () => {
  const floorNum = flSelect.value.replace('itl-', '');
});

function updateSearchBtn() {
  const ready = [...selects].every(s => s.value !== 'none');
  searchBtn.disabled = !ready;
  searchBtn.classList.toggle('activated', ready);
}

selects.forEach(select => select.addEventListener('change', updateSearchBtn));
updateSearchBtn();

searchBtn.addEventListener('click', () => {
  const floorNum = flSelect.value.replace('itl-', '');
});

/*fl_selectのvalue値に応じて/img/nav/roomguideから画像を引っ張るシステムをこの下に置くつもり */

const access_floor_map = document.getElementById('access-code');
const map_search = document.getElementById('fl_select');
