/**
 * サービスのUUIDです。
 * @type {string}
 */
const SERVICE_UUID = "8a61d7f7-888e-4e72-93be-0df87152fc6d";

/**
 * キャラクタリスティックのUUIDです。
 * @type {string}
 */
const CHARACTERISTIC_UUID = "fae2e24f-aea2-48cb-b449-55ec20518e93";

/**
 * 扱うセンサー値の上限です。
 * @type {number}
 */
const SENSORE_MAX_VALUE = 160;

/**
 * アルコールセンサーのキャラクタリスティックです。
 */
let sensoreCharacteristic;

/**
 * BLEに接続するボタンです。
 */
let connectButton;

/**
 * ビール全体のDOMです。
 */
let beerMain;

/**
 * ビールグラスのDOMです。
 */
let beerMask;

/**
 * ローディングボタンです。
 */
let loading;

/**
 * BLE経由で読み込んだセンサー値です。
 */
let sensorValue;

/**
 * ビールグラスの表示率です。
 */
let beerPer;

/**
 * BLE接続が成功したかどうか
 */
let isConnected;

/**
 * 初期化処理です。
 */
function init() {
  // beerの拡大率を算出
  let designWidth = 458;
  let designHeight = 755;
  let margin = 40;
  let windowW = window.innerWidth - margin;
  let windowH = window.innerHeight - margin;

  if (windowW < windowH && windowW / designWidth * designHeight < windowH) {
    this.wrapperScale = windowW / designWidth;
  }
  else {
    this.wrapperScale = windowH / designHeight;
  }

  let beerMainInner = document.querySelector("#beer-main-inner");
  beerMainInner.style.transform = "scale(" + this.wrapperScale + ")";

  sensorValue = 0;
  beerPer = 0;
  isConnected = false;

  connectButton = document.querySelector("#ble-connect-button");
  connectButton.addEventListener("click", connectBLE);

  beerMain = document.querySelector("#beer-main");
  beerMask = document.querySelector("#beer-mask");

  loading = document.querySelector("#loading");
}

/**
 * Web Bluetooth APIでBLEデバイスに接続します。
 */
function connectBLE() {
  // loading表示
  loading.className = "show";

  navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [
          SERVICE_UUID
        ]
      }
    ]
  })
    .then(device => {
      console.log("デバイスを選択しました。接続します。");
      console.log("デバイス名 : " + device.name);
      console.log("ID : " + device.id);

      // 選択したデバイスに接続
      return device.gatt.connect();
    })
    .then(server => {
      console.log("デバイスへの接続に成功しました。サービスを取得します。");

      // UUIDに合致するサービス(機能)を取得
      return server.getPrimaryService(SERVICE_UUID);
    })
    .then(service => {
      console.log("サービスの取得に成功しました。キャラクタリスティックを取得します。");

      // UUIDに合致するキャラクタリスティック(サービスが扱うデータ)を取得
      return service.getCharacteristic(CHARACTERISTIC_UUID);
    })
    .then(characteristic => {
      sensoreCharacteristic = characteristic;

      console.log("BLE接続が完了しました。");

      // センサーの値を読み込みます。
      loadSensorValue();

      // ビール更新
      loop();
    })
    .catch(error => {
      console.log("Error : " + error);

      // loading非表示
      loading.className = "hide";
    });
}

/**
 * センサーの値を読み込みます。
 */
function loadSensorValue() {
  // 1秒ごとにセンサーの値を取得
  setInterval(function () {
    // アルコール値を読み込む
    sensoreCharacteristic.readValue()
      .then(value => {
        // アルコール値を取得
        sensorValue = value.getUint8(0);

        // アルコール値を表示
        showMainView();
      })
      .catch(error => {
        console.log("Error : " + error);
      });
  }, 300);
}

function loop() {
  beerPer += (sensorValue / SENSORE_MAX_VALUE * 100 - beerPer) * 0.1;
  beerMask.style.height = beerPer + "%";

  window.requestAnimationFrame(loop);
}

/**
 * アルコール値を表示します。
 */
function showMainView() {
  if (isConnected) {
    return;
  }

  // 接続ボタン
  connectButton.className = "hide";
  // loading非表示
  loading.className = "hide";
  // アルコール値表示
  beerMain.className = "show";

  isConnected = true;
}

window.addEventListener("load", init);