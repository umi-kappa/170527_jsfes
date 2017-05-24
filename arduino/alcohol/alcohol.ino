/*
  BLE
*/
#include <CurieBLE.h>

#define SERVICE_UUID "8a61d7f7-888e-4e72-93be-0df87152fc6d"
// アルコールセンサーの値用キャラクタリスティックのUUID
#define CHARACTERISTIC_UUID "fae2e24f-aea2-48cb-b449-55ec20518e93"

// サービス
BLEService sensorService(SERVICE_UUID);

// キャラクタリスティック
// 湿度 書き込み禁止
BLEUnsignedCharCharacteristic sensorCharacteristic(CHARACTERISTIC_UUID, BLERead | BLENotify);

/*
  アルコールセンサー
*/
#define analogInDatPin 0

int sensorValue = 0;

int idata;
float Vs, RsRo, cenc, a1;

const float VO = 1.0;
const float VCC = 5.0;

void setup() {
  Serial.begin(9600);

  // BLE初期化
  BLE.begin();

  // デバイス名とサービスのUUIDを設定
  BLE.setLocalName("ALCOHOL_SENSOR");
  BLE.setAdvertisedService(sensorService);

  // キャラクタリスティックをサービスへ追加
  sensorService.addCharacteristic(sensorCharacteristic);

  // センサーを扱う機能をサービスとして設定
  BLE.addService(sensorService);

  // BLE動作開始
  BLE.advertise();

  Serial.println("BLE Sensor Peripheral");
}

void loop() {
  // 接続しているデバイスを取得
  BLEDevice central = BLE.central();

  // 接続しているデバイスが存在するかどうか判定
  if (central) {
    Serial.print("Connected to central: ");
    // 接続しているデバイスのMacアドレスを表示
    Serial.println(central.address());

    // デバイスと接続している間は処理を繰り返す
    while (central.connected()) {
      // センサの値を読み取ります
      idata = 1023 - analogRead(0);

      // 電圧に変換します
      Vs = VCC * idata / 1024;

      // 抵抗値の比を算出
      RsRo = (VO / Vs) * (VCC - Vs) / (VCC - VO);

      // 一次回帰式より濃度を求める
      a1 = -1.5137 * log10(RsRo) - 0.4408;

      // 対数から元の値に戻す
      cenc = pow(10, a1);

      Serial.print(idata);
      Serial.print(" ");
      Serial.print(Vs);
      Serial.print(" ");
      Serial.print(RsRo);
      Serial.print(" ");
      Serial.print(cenc);
      Serial.println("mg/L");

      // センサー値を設定
      // 0 ～ 1023の値を0 ～ 255へ変換
      sensorCharacteristic.setValue(map(idata, 0, 1023, 0, 255));

      delay(200);
    }

    // デバイスとの接続が切れたら実行
    Serial.print(F("Disconnected from central: "));
    Serial.println(central.address());
  }
}
