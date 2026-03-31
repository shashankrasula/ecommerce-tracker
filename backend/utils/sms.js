const axios = require('axios');

const normalizePhone = (phone = '') => {
  const cleaned = phone.toString().trim().replace(/[^\d+]/g, '');

  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;

  return `+${cleaned}`;
};

const sendOrderSms = async ({ phone, name, orderId, totalAmount, itemCount }) => {
  const to = normalizePhone(phone);

  if (!to) {
    return { sent: false, reason: 'missing-phone' };
  }

  const message = `Hi ${name || 'Customer'}, your order ${orderId} for ${itemCount} item(s) has been placed successfully. Total: ₹${Number(totalAmount || 0).toFixed(2)}. Thank you for shopping with TrackR!`;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`[SMS skipped] ${to} -> ${message}`);
    return { sent: false, reason: 'sms-not-configured', preview: message };
  }

  try {
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', TWILIO_PHONE_NUMBER);
    params.append('Body', message);

    const { data } = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      params,
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log(`SMS sent to ${to} for order ${orderId}`);
    return { sent: true, sid: data.sid };
  } catch (error) {
    const details = error.response?.data?.message || error.message;
    console.error(`SMS failed for ${to}: ${details}`);
    return { sent: false, reason: 'sms-failed', error: details };
  }
};

module.exports = { normalizePhone, sendOrderSms };
