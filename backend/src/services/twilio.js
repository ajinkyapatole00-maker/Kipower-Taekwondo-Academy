const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendBulkSMS(phoneNumbers, messageBody) {
  try {
    const promises = phoneNumbers.map(phoneNumber =>
      client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      })
    );

    const results = await Promise.all(promises);
    return results;
  } catch (err) {
    console.error('Twilio error:', err);
    throw err;
  }
}

async function sendBulkWhatsApp(phoneNumbers, messageBody) {
  try {
    const promises = phoneNumbers.map(phoneNumber =>
      client.messages.create({
        body: messageBody,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${phoneNumber}`
      })
    );

    const results = await Promise.all(promises);
    return results;
  } catch (err) {
    console.error('Twilio WhatsApp error:', err);
    throw err;
  }
}

module.exports = {
  sendBulkSMS,
  sendBulkWhatsApp
};
