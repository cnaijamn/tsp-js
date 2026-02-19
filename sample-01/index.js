'use strict';

/**
 * 巡回セールスマン問題 (Traveling salesman problem; TSP)
 * 焼きなまし法 (Simulated Annealing)
 */

/**
 * 都市データを取得します.
 * @param {function} cityCreate - 生成メソッド
 * @param {number} num - 都市数
 * @return {City[]} 都市データ
 */
function initCities(cityCreate, num) {
  let cities = Array.from({ length: num }, (e, i) => {
    let w = canvas.width;
    let h = canvas.height;
    return cityCreate(w, h);
  });
  return cities;
}

/**
 * エネルギー取得.
 * @param {City[]} cities - 都市データ
 * @param {number[]} order - 順列
 * @param {number} i - 都市i
 * @param {number} j - 都市j
 * @return {number} エネルギー
 */
function getEnerty(cities, order, i, j) {
  let n = order.length;
  let c1 = order[i % n];
  let c2 = order[j % n];
  let e = cities[c1].distanceToOther(cities[c2]);
  return e;
}

/**
 * エネルギーの総和を取得.
 * @param {City[]} cities - 都市データ
 * @param {number[]} order - 順列
 * @return {number} 総エネルギー
 */
function getAllEnergy(cityes, order) {
  let e = 0;
  for (let i = 0; i < order.length; i++) {
    e += getEnerty(cities, order, i, i + 1);
  }
  return e;
}

/**
 * 遷移確率を求め、遷移の要否を返却.
 * @param {number} T - 温度
 * @param {number} de - エネルギー差
 * @return {boolean} 遷移の要否
 */
function needToAnneal(T, de) {
  if (T < 1.0e-4) {
    return de > 0.0;
  }
  return Math.random() < Math.exp(de / T);
}

/**
 * 順列を近傍の状態に変更します.
 * @param {City[]} cities - 都市データ
 * @param {number[]} order - 順列
 * @param {number} T - 温度
 */
function updateOrderToNeighbour(cities, order, T) {
  let n = order.length;

  for (let c = 0, len = n * n; c < len; c++) {
    // 任意の都市c(i)、c(i+1)、c(j)、c(j+1)を抜き出し、
    // それぞれの経路を入れ替えることでエネルギーが減少すれば、
    // 経路を入れ替える(順序を入れ替える)。
    let i = Math.floor(n * Math.random())
    let j = Math.floor(n * Math.random())
    let de = getEnerty(cities, order, i, i + 1)
              + getEnerty(cities, order, j, j + 1)
              - getEnerty(cities, order, i, j)
              - getEnerty(cities, order, i + 1, j + 1);

    if (needToAnneal(T, de)) {
      if (j < i) {
        let tmp = i;
        i = j;
        j = tmp;
      }
      for (; j > i; j--) {
        let i2 = order[i + 1];
        order[i + 1] = order[j];
        order[j] = i2;
        ++i;
      }
    }
  }
}

/**
 * シミュレーティド・アニーリングを実行する.
 * @param {City[]} cities - 都市データ
 * @param {number[]} order - 都市データの順列
 * @param {number} startT - 開始温度
 * @param {number} delta - デルタ値
 * @param {number} intervalTime - タイマーの一定時間(msec)
 */
function runSA(cities, order, startT = 10.0, delta = 0.99, intervalTime = 100) {
  let cycle = 1; // 周期回数
  let energy = getAllEnergy(cities, order); // 現在のエネルギー
  let bestEnergy = energy; // 最良解のエネルギー
  let T = startT; // 現在の温度
  let bestOrder = new Uint32Array(order);
  let sameCount = 0; // 同一解

  const log = document.getElementById('log');

  let interval = setInterval(() => {
    log.innerText = `周期回数:${cycle} / E:${bestEnergy} / T:${T} / 同一解:${sameCount}`;

    // 暫定: 同一解が50回連続で現れたら終了
    if (sameCount >= 50) {
      clearInterval(interval);
      return;
    }

    // 順列を近傍の状態に更新
    updateOrderToNeighbour(cities, order, T);

    // 最良解を更新
    energy = getAllEnergy(cities, order);
    if (energy < bestEnergy) {
      bestEnergy = energy;
      bestOrder.set(order);
      sameCount = 0;
    } else {
      T *= delta;
      ++sameCount;
    }

    // 都市描画
    updateCanvas(canvas, cities, order)

    ++cycle;
  }, intervalTime);
}

/**
 * 都市を描画します.
 * @param {Context} ctx - 2Dコンテキスト
 * @param {City} city - 都市
 * @param {number} color - 描画色
 */
function drawCity(ctx, city, color) {
  ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  ctx.beginPath();
  ctx.arc(city.x, city.y, 5, 0, Math.PI * 2, false);
  ctx.fill();
}

/**
 * キャンバス描画更新.
 * @param {Canvas} canvas - キャンバス
 * @param {City[]} cities - 都市
 * @param {number} order - 順列
 */
function updateCanvas(canvas, cities, order) {
  const ctx = canvas.getContext('2d');

  // 背景(黒)
  ctx.fillStyle = 'rgb(0, 0, 0)'
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCity(ctx, cities[order[0]], [255, 0, 0]);
  for (let i = 1; i < cities.length - 1; i++) {
    drawCity(ctx, cities[order[i]], [0, 255, 0]);
  }
  drawCity(ctx, cities[order[cities.length - 1]], [255, 255, 0]);

  ctx.strokeStyle = 'rgb(255, 255, 255)';
  for (let i = 0; i < cities.length - 1; i++) {
    let s = order[i];
    let e = order[i + 1]

    ctx.beginPath();
    ctx.moveTo(cities[s].x, cities[s].y);
    ctx.lineTo(cities[e].x, cities[e].y);
    ctx.stroke();
  }
}

// キャンバス
const canvas = document.getElementById('canvas');

// 都市初期データ (ランダム)
let cities = initCities(City.creators[0], 100)
let order = Uint32Array.from({ length: cities.length }, (e, i) => i);

// 都市描画
updateCanvas(canvas, cities, order)

const run = () => {
  // クリック不可
  document.getElementById('run').disabled = true;

  // 実行
  runSA(cities, order);
};