const fs = require('fs');
const path = require('path');

/**
 * ゲームの保存と読み込みを管理するクラス
 */
class GameStorage {
  /**
   * ストレージクラスを初期化
   */
  constructor() {
    this.saveDirPath = path.join(process.cwd(), 'saves');
    this.statsFilePath = path.join(process.cwd(), 'stats.json');
    this.ensureSaveDirectory();
  }

  /**
   * セーブディレクトリが存在することを確認、なければ作成
   */
  ensureSaveDirectory() {
    if (!fs.existsSync(this.saveDirPath)) {
      fs.mkdirSync(this.saveDirPath, { recursive: true });
    }
  }

  /**
   * ゲームの状態を保存
   * @param {string} saveName - セーブの名前
   * @param {Object} gameState - 保存するゲームの状態
   * @returns {boolean} 保存が成功したかどうか
   */
  saveGame(saveName, gameState) {
    try {
      const saveFilePath = path.join(this.saveDirPath, `${saveName}.json`);
      const saveData = JSON.stringify(gameState, null, 2);
      fs.writeFileSync(saveFilePath, saveData);
      return true;
    } catch (error) {
      console.error('ゲームの保存中にエラーが発生しました:', error);
      return false;
    }
  }

  /**
   * ゲームの状態を読み込む
   * @param {string} saveName - 読み込むセーブの名前
   * @returns {Object|null} 読み込まれたゲーム状態、失敗した場合はnull
   */
  loadGame(saveName) {
    try {
      const saveFilePath = path.join(this.saveDirPath, `${saveName}.json`);
      if (!fs.existsSync(saveFilePath)) {
        return null;
      }
      
      const saveData = fs.readFileSync(saveFilePath, 'utf8');
      return JSON.parse(saveData);
    } catch (error) {
      console.error('ゲームの読み込み中にエラーが発生しました:', error);
      return null;
    }
  }

  /**
   * 保存されたゲームの一覧を取得
   * @returns {Array} 保存されたゲームのファイル名のリスト
   */
  getSavedGamesList() {
    try {
      const saveFiles = fs.readdirSync(this.saveDirPath)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
      
      return saveFiles;
    } catch (error) {
      console.error('セーブファイルの一覧取得中にエラーが発生しました:', error);
      return [];
    }
  }

  /**
   * 統計情報を保存
   * @param {Object} stats - 保存する統計情報
   * @returns {boolean} 保存が成功したかどうか
   */
  saveStats(stats) {
    try {
      const statsData = JSON.stringify(stats, null, 2);
      fs.writeFileSync(this.statsFilePath, statsData);
      return true;
    } catch (error) {
      console.error('統計情報の保存中にエラーが発生しました:', error);
      return false;
    }
  }

  /**
   * 統計情報を読み込む
   * @returns {Object} 読み込まれた統計情報、ファイルが存在しない場合はデフォルト値
   */
  loadStats() {
    try {
      if (!fs.existsSync(this.statsFilePath)) {
        return {
          oWins: 0,
          xWins: 0,
          draws: 0,
          totalGames: 0
        };
      }
      
      const statsData = fs.readFileSync(this.statsFilePath, 'utf8');
      return JSON.parse(statsData);
    } catch (error) {
      console.error('統計情報の読み込み中にエラーが発生しました:', error);
      return {
        oWins: 0,
        xWins: 0,
        draws: 0,
        totalGames: 0
      };
    }
  }
}

module.exports = GameStorage;
