const mqtt = require("mqtt");

let mqttClient;
module.exports = {
  initMqtt: () => {
    mqttClient = mqtt.connect(process.env.MQTTHost);
    return mqttClient;
  },
  getMqttClient: () => {
    if (!mqttClient) {
      throw new Error("Mqtt client is not connected!");
    }
    return mqttClient;
  },
};
