'use strict';

/**
 * 都市クラス.
 */
class City {
  /**
   * コンストラクタ.
   * @param {number} x - 都市のX座標
   * @param {number} y - 都市のY座標
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 生成メソッド配列を返却します.
   * @return {function[]} 生成メソッド配列
   */
  static get creators() {
    return [
      City.createRandom,
      City.createCircle,
    ];
  }

  /**
   * 指定された幅、高さの領域内でランダムな位置に都市を生成します.
   * @param {number} width - 領域幅
   * @param {number} height - 領域高さ
   * @param {number} padding - パディング
   * @return {City} 都市のインスタンス
   */
  static createRandom(width, height, padding = 10) {
    let x = parseInt(Math.random() * (width - padding * 2)) + padding;
    let y = parseInt(Math.random() * (height - padding * 2)) + padding;
    return new City(x, y);
  }

  /**
   * 指定された幅、高さの領域内で円上に都市を生成します.
   * @param {number} width - 領域幅
   * @param {number} height - 領域高さ
   * @param {number} padding - パディング
   * @return {City} 都市のインスタンス
   */
  static createCircle(width, height, padding = 10) {
    let cx = width / 2 - padding;
    let cy = height / 2 - padding;
    let radius = width < height ? cx : cy;
    let angle = Math.random() * 2 * Math.PI;
    let x = parseInt(cx + Math.sin(angle) * radius) + padding;
    let y = parseInt(cy + Math.cos(angle) * radius) + padding;
    return new City(x, y);
  }

  /**
   * 指定位置の都市との間の距離を求めます.
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @return {number} 距離
   */
  distance(x, y) {
    return Math.hypot(x - this.x, y - this.y);
  }

  /**
   * 指定した都市までの距離を求めます.
   * @param {City} other - 別の都市
   * @return {number} 距離
   */
  distanceToOther(other) {
    return this.distance(other.x, other.y);
  }
}