/**
 * オンラインゲームモード用のクラス
 * 簡易的なP2P（peer-to-peer）接続を提供
 * 
 * 注意: 実際のネットワーク接続をシミュレートするだけです。完全な実装にはSocket.ioなどが必要です。
 */

class NetworkGame {
  /**
   * ネットワークゲームを初期化
   */
  constructor() {
    this.isHost = false;
    this.isConnected = false;
    this.peer = null;
    this.gameId = null;
    this.callbacks = {
      onMove: null,
      onConnect: null,
      onDisconnect: null,
      onError: null
    };
  }

  /**
   * ゲームをホストする
   * @param {string} gameId - 一意のゲームID
   * @returns {Promise} 接続処理の結果
   */
  hostGame(gameId) {
    return new Promise((resolve, reject) => {
      // ネットワーク接続をシミュレート
      setTimeout(() => {
        this.isHost = true;
        this.isConnected = true;
        this.gameId = gameId;
        
        if (this.callbacks.onConnect) {
          this.callbacks.onConnect({ isHost: true, gameId });
        }
        
        resolve({ success: true, gameId, isHost: true });
      }, 1000);
    });
  }

  /**
   * ゲームに参加する
   * @param {string} gameId - 参加するゲームのID
   * @returns {Promise} 接続処理の結果
   */
  joinGame(gameId) {
    return new Promise((resolve, reject) => {
      // ネットワーク接続をシミュレート
      setTimeout(() => {
        // ゲームが存在するかをシミュレート（90%の確率で成功）
        if (Math.random() < 0.9) {
          this.isHost = false;
          this.isConnected = true;
          this.gameId = gameId;
          
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect({ isHost: false, gameId });
          }
          
          resolve({ success: true, gameId, isHost: false });
        } else {
          const error = new Error('指定されたゲームが見つかりませんでした');
          
          if (this.callbacks.onError) {
            this.callbacks.onError(error);
          }
          
          reject(error);
        }
      }, 1000);
    });
  }

  /**
   * 手を送信する
   * @param {Object} move - 送信する手の情報 {row, col}
   * @returns {Promise} 送信結果
   */
  sendMove(move) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        const error = new Error('接続されていません');
        
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
        
        reject(error);
        return;
      }
      
      // 手の送信をシミュレート
      setTimeout(() => {
        resolve({ success: true, move });
      }, 300);
    });
  }

  /**
   * 接続を閉じる
   */
  disconnect() {
    if (this.isConnected) {
      this.isConnected = false;
      
      if (this.callbacks.onDisconnect) {
        this.callbacks.onDisconnect({ gameId: this.gameId, isHost: this.isHost });
      }
    }
  }

  /**
   * イベントリスナーを設定
   * @param {string} event - イベント名 ('move', 'connect', 'disconnect', 'error')
   * @param {Function} callback - コールバック関数
   */
  on(event, callback) {
    switch (event) {
      case 'move':
        this.callbacks.onMove = callback;
        break;
      case 'connect':
        this.callbacks.onConnect = callback;
        break;
      case 'disconnect':
        this.callbacks.onDisconnect = callback;
        break;
      case 'error':
        this.callbacks.onError = callback;
        break;
    }
  }

  /**
   * ダミー手を受信するシミュレーション（デモ用）
   * 実際のP2P実装では不要
   */
  simulateReceiveMove() {
    if (!this.isConnected || !this.callbacks.onMove) {
      return;
    }
    
    // ランダムな手を生成してコールバックを呼び出す
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 5);
    
    setTimeout(() => {
      this.callbacks.onMove({ row, col });
    }, 500 + Math.random() * 1000);
  }

  /**
   * 現在の接続状態を取得
   * @returns {Object} 接続状態
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isHost: this.isHost,
      gameId: this.gameId
    };
  }
}

module.exports = NetworkGame;
