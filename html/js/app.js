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
 * アルコールセンサーのキャラクタリスティックです。
 */
let sensoreCharacteristic;

/**
 * BLEに接続するボタンです。
 */
let connectButton;

/**
 * センサー値を表示するDOMです。
 */
let mainView;

/**
 * アルコール値を表示するDOMです。
 */
let sensorText;

/**
 * ローディングボタンです。
 */
let loading;

/**
 * 初期化処理です。
 */
function init() {
  connectButton = document.querySelector("#ble-connect-button");
  connectButton.addEventListener("click", connectBLE);

  mainView = document.querySelector("#main-view");
  sensorText = document.querySelector("#humidity-text");

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
    let humidity;

    // アルコール値を読み込む
    sensoreCharacteristic.readValue()
      .then(value => {
        // アルコール値を取得
        humidity = value.getUint8(0);
        console.log(humidity);

        // アルコール値の表示を更新
        sensorText.innerHTML = humidity;

        // アルコール値を表示
        showMainView();
      })
      .catch(error => {
        console.log("Error : " + error);
      });

  }, 500);
}

/**
 * アルコール値を表示します。
 */
function showMainView() {
  // 接続ボタン
  connectButton.className = "hide";

  // loading非表示
  loading.className = "hide";

  // アルコール値表示
  mainView.className = "show";
}

window.addEventListener("load", init);