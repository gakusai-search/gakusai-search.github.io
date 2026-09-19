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

/*フロアマップのoptionも整理しよう！※画像ファイルのタグは/img/roomguide/大学_キャンパス_建物_階数.png */

const floor_map = {
  "itl-1": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-1.png",
  "itl-3": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-3.png",
  "itl-4": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-4.png",
  "itl-5": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-5.png",
  "itl-6": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-6.png",
  "itl-7": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-7.png",
  "itl-8": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-8.png",
  "itl-9": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-9.png",
  "itl-10": "/img/roomguide/chudai_ichigaya-tamachi_mb_floor-10.png",
};

/*フロアマップにつける補足説明のoptionも整理しよう！*/

const floor_labels = {
  "itl-1": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 1階" },
  "itl-3": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 3階" },
  "itl-4": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 4階" },
  "itl-5": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 5階" },
  "itl-6": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 6階" },
  "itl-7": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 7階" },
  "itl-8": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 8階" },
  "itl-9": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 9階" },
  "itl-10": { main: "中央大学 市ヶ谷田町キャンパス", sub: "ミドルブリッジ 10階" },
};

/*フロアマップにつけるアイコンのoptionも整理しよう！*/

const campus_icon = {
  "itl-1": "/img/roomguide/icons/orange_icon.svg",
  "itl-3": "/img/roomguide/icons/orange_icon.svg",
  "itl-4": "/img/roomguide/icons/orange_icon.svg",
  "itl-5": "/img/roomguide/icons/orange_icon.svg",
  "itl-6": "/img/roomguide/icons/orange_icon.svg",
  "itl-7": "/img/roomguide/icons/orange_icon.svg",
  "itl-8": "/img/roomguide/icons/orange_icon.svg",
  "itl-9": "/img/roomguide/icons/orange_icon.svg",
  "itl-10": "/img/roomguide/icons/orange_icon.svg",
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

/*fl_selectのvalue値に応じて/img/nav/roomguideから画像を引っ張るシステムだったけど、テキスト等も引っ張れるように太らせたもの */

const access_floor_map = document.getElementById('access-code');
const map_search = document.getElementById('fl_select');
const roomguide_map = document.getElementById('roomguide-map');
const img = document.getElementById('display-image');
const floor_main = document.getElementById('floor-main');
const floor_sub = document.getElementById('floor-sub');
const campus_icon_file = document.getElementById('campus-icon')

access_floor_map.addEventListener('click', () => {

  const selectedValue = map_search.value;

  const imageSrc = floor_map[selectedValue];
  const labelinfo = floor_labels[selectedValue];

  if (imageSrc) {
    img.src = imageSrc;
    roomguide_map.style.display = 'block';
    if (labelinfo) {
      floor_main.textContent = labelinfo.main;
      floor_sub.textContent = labelinfo.sub;
    }
  } else {
    img.src = ' ';
    roomguide_map.style.display = 'none';
    alert("この場所のフロアマップは現在準備中です")
    console.warn('floor map is not prepared now. comming soon:', selectedValue);
  }

  /*同一処理にしたらバグり散らかしたので、アイコンの処理だけ分けて記述します */

  const iconSrc = campus_icon[selectedValue];

  if (iconSrc) {
    campus_icon_file.src = iconSrc;
  }
});