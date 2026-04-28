const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();
const Bill = require('../models/Bill');
const LineItem = require('../models/LineItem');
const { parseImage, parseAudio } = require('../services/geminiParser');

const WA_TOKEN = process.env.WA_TOKEN;
const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;
const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WA_API_VERSION = process.env.WA_API_VERSION || 'v22.0';
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'https://kiryana-bill-scanner.vercel.app';

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

async function sendWhatsAppMenu(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: '📊 *Tajir Dashboard*\nWhat would you like to see?' },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'revenue', title: '💰 Revenue' } },
              { type: 'reply', reply: { id: 'top_items', title: '🏆 Top Items' } },
              { type: 'reply', reply: { id: 'this_week', title: '📅 This Week' } },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('WhatsApp menu error:', err.response?.data || err.message);
  }
}

async function handleMenuReply(to, buttonId) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  if (buttonId === 'revenue') {
    const result = await Bill.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    const data = result[0] || { total: 0, count: 0 };
    await sendWhatsAppReply(
      to,
      `💰 *Total Revenue*\n\nRs. ${data.total.toLocaleString()} from ${data.count} verified bills\n\n🔗 ${DASHBOARD_URL}`
    );
  } else if (buttonId === 'top_items') {
    const items = await LineItem.aggregate([
      {
        $lookup: {
          from: 'bills',
          localField: 'billId',
          foreignField: '_id',
          as: 'bill',
        },
      },
      { $unwind: '$bill' },
      { $match: { 'bill.status': 'verified' } },
      { $group: { _id: '$item', totalQty: { $sum: '$quantity' }, revenue: { $sum: '$subtotal' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    if (items.length === 0) {
      await sendWhatsAppReply(to, `🏆 No verified bills yet.\n\n🔗 ${DASHBOARD_URL}`);
      return;
    }

    const lines = items
      .map((it, i) => `${i + 1}. ${it._id} — Rs. ${it.revenue.toLocaleString()} (${it.totalQty} units)`)
      .join('\n');
    await sendWhatsAppReply(to, `🏆 *Top Selling Items*\n\n${lines}\n\n🔗 ${DASHBOARD_URL}`);
  } else if (buttonId === 'this_week') {
    const result = await Bill.aggregate([
      { $match: { status: 'verified', createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    const data = result[0] || { total: 0, count: 0 };
    await sendWhatsAppReply(
      to,
      `📅 *This Week*\n\nRs. ${data.total.toLocaleString()} from ${data.count} verified bills\n\n🔗 ${DASHBOARD_URL}`
    );
  }
}

async function downloadMedia(mediaId) {
  const mediaRes = await axios.get(
    `https://graph.facebook.com/${WA_API_VERSION}/${mediaId}`,
    { headers: { Authorization: `Bearer ${WA_TOKEN}` } }
  );
  const mediaUrl = mediaRes.data.url;
  const mimeType = mediaRes.data.mime_type || 'application/octet-stream';

  const fileRes = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${WA_TOKEN}` },
    responseType: 'arraybuffer',
  });

  return { buffer: Buffer.from(fileRes.data), mimeType };
}

async function createBillFromItems(parsedData, rawText, source, senderWaId, mediaId, confidence) {
  const parsedItems = Array.isArray(parsedData?.items) ? parsedData.items : [];
  if (parsedItems.length === 0) return null;

  const billId = new mongoose.Types.ObjectId();

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

  const totalAmount =
    parsedData.total > 0
      ? parsedData.total
      : lineItemDocs.reduce((sum, li) => sum + li.subtotal, 0);

  const bill = await Bill.create({
    _id: billId,
    source,
    senderWaId,
    mediaId,
    totalAmount,
    items: lineItemDocs.map((li) => li._id),
    status: 'unverified',
    confidence,
    rawText,
  });

  return { bill, lineItemDocs, totalAmount };
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
        const senderWaId = message.from;

        try {
          if (message.type === 'text') {
            const text = (message.text?.body || '').toLowerCase().trim();
            if (text === 'menu' || text === 'help' || text === 'مینو' || text === 'مدد') {
              await sendWhatsAppMenu(senderWaId);
            } else {
              await sendWhatsAppReply(
                senderWaId,
                `👋 Send me a *photo of your kiryana bill* and I'll extract all items automatically.\n\nType *menu* to see your store stats.\n\n🔗 ${DASHBOARD_URL}`
              );
            }
          } else if (message.type === 'interactive') {
            const buttonId = message.interactive?.button_reply?.id;
            if (buttonId) {
              await handleMenuReply(senderWaId, buttonId);
            }
          } else if (message.type === 'image') {
            const mediaId = message.image?.id;
            if (!mediaId) continue;

            let buffer, mimeType;
            try {
              ({ buffer, mimeType } = await downloadMedia(mediaId));
            } catch (err) {
              console.error(`Media download failed for mediaId=${mediaId}:`, err.message);
              await sendWhatsAppReply(senderWaId, '❌ Could not download your image. Please try again.');
              continue;
            }

            let parsedData, rawText;
            try {
              ({ parsedData, rawText } = await parseImage(buffer, mimeType));
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

            const result = await createBillFromItems(parsedData, rawText, 'whatsapp', senderWaId, mediaId, 0.85);
            if (!result) continue;

            const { lineItemDocs, totalAmount, bill } = result;
            const top3 = [...lineItemDocs].sort((a, b) => b.subtotal - a.subtotal).slice(0, 3);
            const itemLines = top3
              .map((li) => `  • ${li.item} × ${li.quantity} — Rs. ${li.subtotal.toLocaleString()}`)
              .join('\n');
            const replyText =
              `✅ Bill scanned! Here's your summary:\n\n` +
              `${itemLines}${lineItemDocs.length > 3 ? `\n  ... and ${lineItemDocs.length - 3} more` : ''}\n\n` +
              `💰 Total: Rs. ${totalAmount.toLocaleString()}\n` +
              `🔗 Review: ${DASHBOARD_URL}\n\n` +
              `Tap the link to verify and confirm.`;
            await sendWhatsAppReply(senderWaId, replyText);

            console.log(`WhatsApp bill processed: billId=${bill._id}, items=${lineItemDocs.length}, total=${totalAmount}`);
          } else if (message.type === 'audio') {
            const mediaId = message.audio?.id;
            if (!mediaId) continue;

            let buffer, mimeType;
            try {
              ({ buffer, mimeType } = await downloadMedia(mediaId));
            } catch (err) {
              console.error(`Audio download failed for mediaId=${mediaId}:`, err.message);
              await sendWhatsAppReply(senderWaId, '❌ Could not download your voice message. Please try again.');
              continue;
            }

            let parsedData, rawText;
            try {
              ({ parsedData, rawText } = await parseAudio(buffer, mimeType));
            } catch (parseErr) {
              console.error(`Audio parser failure for mediaId=${mediaId}:`, parseErr.message);
              await sendWhatsAppReply(
                senderWaId,
                '❌ Sorry, we could not understand your voice message. Please try speaking clearly or send a bill photo instead.'
              );
              continue;
            }

            const parsedItems = Array.isArray(parsedData?.items) ? parsedData.items : [];
            if (parsedItems.length === 0) {
              await sendWhatsAppReply(
                senderWaId,
                '❌ No items were found in your voice message. Please mention item names and quantities clearly.'
              );
              continue;
            }

            const result = await createBillFromItems(parsedData, rawText, 'whatsapp', senderWaId, mediaId, 0.75);
            if (!result) continue;

            const { lineItemDocs, totalAmount, bill } = result;
            const itemLines = lineItemDocs
              .slice(0, 5)
              .map((li) => `  • ${li.item} × ${li.quantity}${li.price > 0 ? ` — Rs. ${li.subtotal.toLocaleString()}` : ''}`)
              .join('\n');
            const replyText =
              `🎙️ Voice bill recorded! Items heard:\n\n` +
              `${itemLines}${lineItemDocs.length > 5 ? `\n  ... and ${lineItemDocs.length - 5} more` : ''}\n\n` +
              `${totalAmount > 0 ? `💰 Total: Rs. ${totalAmount.toLocaleString()}\n` : '⚠️ Prices not mentioned — set them in the dashboard.\n'}` +
              `🔗 Review: ${DASHBOARD_URL}`;
            await sendWhatsAppReply(senderWaId, replyText);

            console.log(`WhatsApp audio bill processed: billId=${bill._id}, items=${lineItemDocs.length}, total=${totalAmount}`);
          }
        } catch (err) {
          console.error(`Failed to process WhatsApp message type=${message.type}:`, err.message);
          if (senderWaId) {
            await sendWhatsAppReply(
              senderWaId,
              '❌ Sorry, something went wrong. Please try again.'
            );
          }
        }
      }
    }
  }
}

module.exports = router;
