// ============================
// データ
// ============================
let master = {};
let stageData = {};

const units = ["leo", "mmj", "vbs", "ws", "25"];

// 選択中ユニット
let selectedUnits = [];

// ============================
// ユニット名
// ============================
const unitNames = {
  leo: "Leo/need",
  mmj: "MORE MORE JUMP！",
  vbs: "Vivid BAD SQUAD",
  ws: "ワンダーランズ×ショウタイム",
  25: "25時、ナイトコードで。"
};

// ============================
// DOM
// ============================
const unitButtonsEl =
  document.getElementById("unitButtons");

const unitLevelSettingsEl =
  document.getElementById("unitLevelSettings");

const materialInputsEl =
  document.getElementById("materialInputs");

const calcBtn =
  document.getElementById("calcBtn");

const requiredByLevelEl =
  document.getElementById("requiredByLevel");

const totalRequiredEl =
  document.getElementById("totalRequired");

const missingListEl =
  document.getElementById("missingList");

// ============================
// 起動
// ============================
initGame().then(() => {

  setupUnitButtons();

  setupMaterialInputs();

});

// ============================
// JSON読込
// ============================
async function loadJSON(path) {

  try {

    const res =
      await fetch(path);

    if (!res.ok) {

      throw new Error(
        `読み込み失敗: ${path}`
      );

    }

    return await res.json();

  } catch (err) {

    console.error(err);

    return {};

  }

}

// ============================
// 初期データ読込
// ============================
async function initGame() {

  master =
    await loadJSON(
      "data/master.json"
    );

  for (const unit of units) {

    stageData[unit] =
      await loadJSON(
        `data/${unit}.json`
      );

  }

  console.log(
    "データ読込完了"
  );

}

// ============================
// ユニット選択UI
// ============================
function setupUnitButtons() {

  unitButtonsEl.innerHTML = "";

  units.forEach(unit => {

    const label =
      document.createElement(
        "label"
      );

    label.className =
      "unit-checkbox";

    const checkbox =
      document.createElement(
        "input"
      );

    checkbox.type =
      "checkbox";

    checkbox.value =
      unit;

    checkbox.addEventListener(
      "change",
      () => {

        updateSelectedUnits();

      }
    );

    const img =
      document.createElement(
        "img"
      );

    img.src =
      `images/units/${unit}.png`;

    img.alt =
      unit;

    const text =
      document.createElement(
        "span"
      );

    text.textContent =
      unitNames[unit];

    label.appendChild(
      checkbox
    );

    label.appendChild(
      img
    );

    label.appendChild(
      text
    );

    unitButtonsEl.appendChild(
      label
    );

  });

}

// ============================
// 選択ユニット更新
// ============================
function updateSelectedUnits() {

  selectedUnits = [];

  document
    .querySelectorAll(
      ".unit-checkbox input:checked"
    )
    .forEach(cb => {

      selectedUnits.push(
        cb.value
      );

    });

  renderLevelSettings();

}

// ============================
// ユニット別レベル設定
// ============================
function renderLevelSettings() {

  unitLevelSettingsEl.innerHTML =
    "";

  selectedUnits.forEach(unit => {

    const box =
      document.createElement(
        "div"
      );

    box.className =
      "unit-level-box";

    const title =
      document.createElement(
        "h3"
      );

    title.textContent =
      unitNames[unit];

    const current =
      document.createElement(
        "input"
      );

    current.type =
      "number";

    current.min =
      1;

    current.max =
      40;

    current.value =
      1;

    current.id =
      `current-${unit}`;

    const target =
      document.createElement(
        "input"
      );

    target.type =
      "number";

    target.min =
      1;

    target.max =
      40;

    target.value =
      40;

    target.id =
      `target-${unit}`;

    box.appendChild(
      title
    );

    box.append(
      document.createTextNode(
        "現在Lv "
      )
    );

    box.appendChild(
      current
    );

    box.append(
      document.createTextNode(
        " 目標Lv "
      )
    );

    box.appendChild(
      target
    );

    unitLevelSettingsEl.appendChild(
      box
    );

  });

}

// ============================
// 所持素材取得
// ============================
function getOwnedMaterials() {

  const owned = {};

  document
    .querySelectorAll(
      "#materialInputs input"
    )
    .forEach(input => {

      owned[
        input.dataset.id
      ] =
        parseInt(
          input.value
        ) || 0;

    });

  return owned;

}

// ============================
// 所持素材UI
// ============================
function setupMaterialInputs() {

  materialInputsEl.innerHTML =
    "";

  Object.keys(master)
    .forEach(id => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "material-row";

      const label =
        document.createElement(
          "label"
        );

      const img =
        document.createElement(
          "img"
        );

      img.src =
        `images/materials/${id}.png`;

      img.alt =
        id;

      img.style.width =
        "20px";

      img.style.height =
        "20px";

      img.style.marginRight =
        "6px";

      const text =
        document.createElement(
          "span"
        );

      text.textContent =
        master[id];

      label.appendChild(
        img
      );

      label.appendChild(
        text
      );

      const input =
        document.createElement("input");

      input.type = "number";
      input.min = 0;

      input.value =
        localStorage.getItem(id) || 0;

      input.dataset.id = id;

      input.addEventListener(
        "change",
        () => {

          localStorage.setItem(
            id,
            input.value
          );

        }
      );

      row.appendChild(
        label
      );

      row.appendChild(
        input
      );

      materialInputsEl
        .appendChild(
          row
        );

    });

}

// ============================
// 計算ボタン
// ============================
calcBtn.addEventListener(
  "click",
  () => {

    if (
      selectedUnits.length === 0
    ) {

      alert(
        "ユニットを選択してください"
      );

      return;

    }

    calculate();

  }
);

// ============================
// メイン計算
// ============================
function calculate() {

  const allByUnit = {};

  const total = {};

  selectedUnits.forEach(
    unit => {

      const current =
        parseInt(
          document.getElementById(
            `current-${unit}`
          ).value
        );

      const target =
        parseInt(
          document.getElementById(
            `target-${unit}`
          ).value
        );

      const unitResult =
        {};

      for (
        let lv = current;
        lv < target;
        lv++
      ) {

        const levelData =
          stageData[unit]?.[
            lv
          ];

        if (
          !levelData
        ) {
          continue;
        }

        unitResult[lv] =
          levelData;

        for (
          const id
          in levelData
        ) {

          total[id] =
            (
              total[id]
              || 0
            )
            +
            levelData[id];

        }

      }

      allByUnit[
        unit
      ] =
        unitResult;

    }
  );

  const owned =
    getOwnedMaterials();

  const missing =
    calcMissing(
      total,
      owned
    );

  renderByUnit(
    allByUnit
  );

  renderTotal(
    total
  );

  renderMissing(
    missing
  );

}

// ============================
// 不足素材計算
// ============================
function calcMissing(
  total,
  owned
) {

  const result = {};

  for (
    const id
    in total
  ) {

    const diff =
      total[id]
      -
      (
        owned[id]
        || 0
      );

    if (
      diff > 0
    ) {

      result[id] =
        diff;

    }

  }

  return result;

}

// ============================
// master順取得
// ============================
function getSortedIds() {

  return Object.keys(
    master
  );

}

// ============================
// ユニット別表示
// ============================
function renderByUnit(
  allByUnit
) {

  requiredByLevelEl.innerHTML =
    "";

  selectedUnits.forEach(
    unit => {

      const details =
        document.createElement(
          "details"
        );

      details.className =
        "unit-result-box";

      const summary =
        document.createElement(
          "summary"
        );

      summary.textContent =
        unitNames[unit];

      details.appendChild(
        summary
      );

      const unitData =
        allByUnit[unit];

      for (
        const lv
        in unitData
      ) {

        const levelBox =
          document.createElement(
            "div"
          );

        levelBox.className =
          "level-box";

        const lvTitle =
          document.createElement(
            "h4"
          );

        lvTitle.textContent =
          `Lv ${lv}`;

        levelBox.appendChild(
          lvTitle
        );

        getSortedIds()
          .forEach(id => {

            if (
              !unitData[
                lv
              ][id]
            ) {
              return;
            }

            levelBox.appendChild(
              createMaterialRow(
                id,
                unitData[
                  lv
                ][id]
              )
            );

          });

        details.appendChild(
          levelBox
        );

      }

      requiredByLevelEl
        .appendChild(
          details
        );

    }
  );

}

// ============================
// 合計必要素材表示
// ============================
function renderTotal(
  total
) {

  totalRequiredEl.innerHTML =
    "";

  getSortedIds()
    .forEach(id => {

      if (
        !total[id]
      ) {
        return;
      }

      totalRequiredEl
        .appendChild(
          createMaterialRow(
            id,
            total[id]
          )
        );

    });

}

// ============================
// 不足素材表示
// ============================
function renderMissing(
  missing
) {

  missingListEl.innerHTML =
    "";

  getSortedIds()
    .forEach(id => {

      if (
        !missing[id]
      ) {
        return;
      }

      missingListEl
        .appendChild(
          createMaterialRow(
            id,
            missing[id]
          )
        );

    });

}

// ============================
// 共通行生成
// ============================
function createMaterialRow(
  id,
  amount
) {

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "material-row";

  const img =
    document.createElement(
      "img"
    );

  img.src =
    `images/materials/${id}.png`;

  img.alt =
    id;

  img.style.width =
    "22px";

  img.style.height =
    "22px";

  img.style.marginRight =
    "6px";

  img.style.verticalAlign =
    "middle";

  const text =
    document.createElement(
      "span"
    );

  text.textContent =
    `${master[id] || id} : ${amount}`;

  row.appendChild(
    img
  );

  row.appendChild(
    text
  );

  return row;

}