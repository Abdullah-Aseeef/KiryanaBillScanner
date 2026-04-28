const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();
const Bill = require('../models/Bill');
const LineItem = require('../models/LineItem');
const { parseImage, parseAudio } = require('../services/geminiParser');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/upload — Web upload route
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { buffer, mimetype } = req.file;

    let parsedData, rawText;
    try {
      ({ parsedData, rawText } = await parseImage(buffer, mimetype));
    } catch (err) {
      const isVisionError = err.message.startsWith('Vision OCR failed');
      const isGeminiError = err.message.startsWith('Gemini structuring failed');
      if (isVisionError) {
        return res.status(502).json({ error: err.message });
      }
      if (isGeminiError) {
        return res.status(502).json({ error: err.message });
      }
      throw err;
    }

    const parsedItems = Array.isArray(parsedData?.items) ? parsedData.items : [];

    if (parsedItems.length === 0) {
      return res.status(422).json({ error: 'No bill items were extracted from the image' });
    }

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
      source: 'web',
      totalAmount,
      items: lineItemDocs.map((li) => li._id),
      status: 'unverified',
      confidence: 0.85,
      rawText,
    });

    const populatedBill = await Bill.findById(bill._id).populate('items');
    res.status(201).json(populatedBill);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

// POST /api/upload/audio — Web audio upload route
router.post('/audio', audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { buffer, mimetype } = req.file;

    let parsedData, rawText;
    try {
      ({ parsedData, rawText } = await parseAudio(buffer, mimetype));
    } catch (err) {
      const isSpeechError = err.message.startsWith('Speech-to-Text failed');
      const isGeminiError = err.message.startsWith('Gemini audio structuring failed');
      if (isSpeechError || isGeminiError) {
        return res.status(502).json({ error: err.message });
      }
      throw err;
    }

    const parsedItems = Array.isArray(parsedData?.items) ? parsedData.items : [];

    if (parsedItems.length === 0) {
      return res.status(422).json({ error: 'No items were found in the voice recording' });
    }

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

    const totalAmount = lineItemDocs.reduce((sum, li) => sum + li.subtotal, 0);

    const bill = await Bill.create({
      _id: billId,
      source: 'web',
      totalAmount,
      items: lineItemDocs.map((li) => li._id),
      status: 'unverified',
      confidence: 0.75,
      rawText,
    });

    const populatedBill = await Bill.findById(bill._id).populate('items');
    res.status(201).json(populatedBill);
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to process audio' });
  }
});

module.exports = router;
