const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();
const Bill = require('../models/Bill');
const LineItem = require('../models/LineItem');
const { parseImage } = require('../services/geminiParser');

const WA_TOKEN = process.env.WA_TOKEN;
const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WA_API_VERSION = process.env.WA_API_VERSION || 'v22.0';

async function sendWhatsAppReply(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('WhatsApp reply error:', err.response?.data || err.message);
  }
}

// GET /webhook — Meta verification handshake
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    return res.status(200).send(challenge);
  }
  return res.status(403).send('Verification failed');
});

// POST /webhook — Receive WhatsApp messages
router.post('/', (req, res) => {
  res.status(200).json({ status: 'ok' });

  processWebhook(req.body).catch((err) =>
    console.error('Webhook background processing error:', err)
  );
});

async function processWebhook(body) {
  const entries = body?.entry || [];

  for (const entry of entries) {
    const changes = entry?.changes || [];

    for (const change of changes) {
      const value = change?.value || {};
      const messages = value?.messages || [];

      for (const message of messages) {
        if (message.type !== 'image') continue;

        const mediaId = message.image?.id;
        const senderWaId = message.from;
        if (!mediaId) continue;

        try {
          // 1. Get media URL from Meta
          const mediaRes = await axios.get(
            `https://graph.facebook.com/${WA_API_VERSION}/${mediaId}`,
            { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
          );
          const mediaUrl = mediaRes.data.url;
          const mimeType = mediaRes.data.mime_type || 'image/jpeg';

          // 2. Download image buffer
          const imageRes = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${WA_TOKEN}` },
            responseType: 'arraybuffer',
          });
          const imageBuffer = Buffer.from(imageRes.data);

          // 3. Vision OCR → Gemini structuring
          let parsedData, rawText;
          try {
            ({ parsedData, rawText } = await parseImage(imageBuffer, mimeType));
          } catch (parseErr) {
            console.error(`Parser failure for mediaId=${mediaId}:`, parseErr.message);
            await sendWhatsAppReply(
              senderWaId,
              '❌ Sorry, we could not read your bill image. Please try again with a clearer photo.'
            );
            continue;
          }

          const parsedItems = Array.isArray(parsedData?.items) ? parsedData.items : [];

          if (parsedItems.length === 0) {
            await sendWhatsAppReply(
              senderWaId,
              '❌ No items were found in the bill image. Please try a clearer photo.'
            );
            continue;
          }

          const billId = new mongoose.Types.ObjectId();

          // 4. Create LineItems
          const lineItemDocs = [];
          for (const it of parsedItems) {
            const quantity = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            const lineItem = await LineItem.create({
              billId,
              item: it.item,
              quantity,
              price,
              subtotal: quantity * price,
            });
            lineItemDocs.push(lineItem);
          }

          // 5. Create Bill
          const totalAmount =
            parsedData.total > 0
              ? parsedData.total
              : lineItemDocs.reduce((sum, li) => sum + li.subtotal, 0);

          const bill = await Bill.create({
            _id: billId,
            source: 'whatsapp',
            senderWaId,
            mediaId,
            totalAmount,
            items: lineItemDocs.map((li) => li._id),
            status: 'unverified',
            confidence: 0.85,
            rawText,
          });

          // 6. Reply to user
          const replyText =
            `✅ Bill parsed!\n\n💰 Total: Rs. ${totalAmount.toLocaleString()}\n` +
            `📦 Items: ${lineItemDocs.length}\n\nOpen the dashboard to review and confirm.`;
          await sendWhatsAppReply(senderWaId, replyText);

          console.log(
            `WhatsApp bill processed: billId=${bill._id}, items=${lineItemDocs.length}, total=${totalAmount}`
          );
        } catch (err) {
          console.error(`Failed to process WhatsApp image mediaId=${mediaId}:`, err.message);
          if (senderWaId) {
            await sendWhatsAppReply(
              senderWaId,
              '❌ Sorry, we could not process your bill image. Please try again with a clearer photo.'
            );
          }
        }
      }
    }
  }
}

module.exports = router;
