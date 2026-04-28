/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    tagline: 'Kiryana Bill Scanner',
    nav_dashboard: 'Dashboard',
    nav_upload: 'Upload',
    nav_review: 'Review',
    lang_toggle: 'اردو',

    // Dashboard
    dash_title: 'Dashboard',
    dash_subtitle: 'Your store performance at a glance',
    loading_analytics: 'Loading analytics...',
    failed_analytics: 'Failed to load analytics:',
    retry: 'Retry',
    stat_revenue: 'Total Revenue',
    stat_revenue_note: 'From verified bills',
    stat_bills: 'Total Bills',
    stat_verified: 'Verified',
    stat_verified_note: 'Confirmed accurate',
    stat_pending: 'Needs Review',
    stat_pending_note: 'Awaiting verification',
    top_items_title: '🏆 Top Selling Items',
    items_label: 'items',
    col_rank: '#',
    col_item_name: 'Item Name',
    col_times_sold: 'Times Sold',
    col_total_qty: 'Total Qty',
    col_revenue: 'Revenue',
    no_items: 'No items recorded yet. Upload a bill to get started!',
    recent_bills_title: '📄 Recent Bills',
    no_bills: 'No bills yet.',

    // Upload
    upload_title: 'Upload Bill',
    upload_subtitle: 'Drop a clear bill photo — AI extracts every item, quantity, and price in seconds',
    step1_title: 'Take a photo',
    step1_desc: 'Snap your bill clearly — printed or handwritten',
    step2_title: 'AI parses it',
    step2_desc: 'Vision OCR + Gemini extract every line item',
    step3_title: 'Review & confirm',
    step3_desc: 'Fix any errors, then verify to save to your records',
    sample_label: 'Sample output',
    upload_btn: 'Upload & Parse Bill',
    processing_btn: 'Processing with Gemini...',
    processing_note: 'AI extraction can take up to a minute for complex images.',

    // Mode toggle & voice upload
    mode_photo: 'Bill Photo',
    mode_voice: 'Voice Memo',
    voice_drop_text: 'Click to choose audio file',
    voice_drop_hint: 'Say items like "do kilo aalu, ek liter doodh"',
    voice_formats: 'OGG, M4A, MP3, WAV up to 25MB',
    voice_btn: 'Upload & Parse Voice',
    voice_processing_btn: 'Transcribing...',
    voice_processing_note: 'Speech-to-text can take up to 30 seconds.',
    voice_prices_note: '⚠️ Prices not mentioned — open the Review tab to add them.',

    // Help
    nav_help: 'Help',
    help_title: 'Help & Guide',
    help_subtitle: 'Everything you need to know about Tajir',

    // WhatsApp CTA
    wa_title: 'Send via WhatsApp',
    wa_sub: 'Snap a photo of your bill and send it to',
    wa_suffix: "— we'll parse it instantly.",
    wa_btn: 'Open WhatsApp',

    // Review Panel
    review_title: 'Review & Verify',
    review_subtitle: 'Edit scanned results and confirm accuracy',
    loading_bills: 'Loading bills...',
    bills_sidebar: 'Bills',
    no_bills_found: 'No bills found',
    meta_source: 'Source',
    meta_status: 'Status',
    meta_date: 'Date',
    col_item: 'Item Name',
    col_qty: 'Qty',
    col_price: 'Price (Rs.)',
    col_subtotal: 'Subtotal',
    add_item: '+ Add Item',
    total_label: 'Total',
    confirm_btn: '✅ Confirm & Verify',
    saving_btn: 'Saving...',
    select_bill: 'Select a bill from the sidebar to review',
    verified_msg: 'Bill verified successfully!',
    verify_error: 'Failed to verify bill: ',
  },
  ur: {
    tagline: 'کرانہ بل اسکینر',
    nav_dashboard: 'ڈیش بورڈ',
    nav_upload: 'اپلوڈ',
    nav_review: 'جائزہ',
    lang_toggle: 'EN',

    // Dashboard
    dash_title: 'ڈیش بورڈ',
    dash_subtitle: 'آپ کی دکان کی کارکردگی ایک نظر میں',
    loading_analytics: 'تجزیہ لوڈ ہو رہا ہے...',
    failed_analytics: 'تجزیہ لوڈ کرنے میں ناکامی:',
    retry: 'دوبارہ کوشش کریں',
    stat_revenue: 'کل آمدنی',
    stat_revenue_note: 'تصدیق شدہ بلوں سے',
    stat_bills: 'کل بل',
    stat_verified: 'تصدیق شدہ',
    stat_verified_note: 'درست تصدیق شدہ',
    stat_pending: 'جائزہ ضروری',
    stat_pending_note: 'تصدیق کا انتظار',
    top_items_title: '🏆 سب سے زیادہ بکنے والی اشیاء',
    items_label: 'اشیاء',
    col_rank: 'نمبر',
    col_item_name: 'آئٹم',
    col_times_sold: 'فروخت',
    col_total_qty: 'کل مقدار',
    col_revenue: 'آمدنی',
    no_items: 'ابھی کوئی آئٹم نہیں۔ شروع کرنے کے لیے بل اپلوڈ کریں!',
    recent_bills_title: '📄 حالیہ بل',
    no_bills: 'ابھی کوئی بل نہیں۔',

    // Upload
    upload_title: 'بل اپلوڈ کریں',
    upload_subtitle: 'بل کی واضح تصویر ڈالیں — AI چند سیکنڈ میں ہر آئٹم نکالے گا',
    step1_title: 'تصویر لیں',
    step1_desc: 'بل کی واضح تصویر لیں — پرنٹ یا ہاتھ سے لکھا',
    step2_title: 'AI پارس کرے',
    step2_desc: 'Vision OCR + Gemini ہر لائن آئٹم نکالے گا',
    step3_title: 'جائزہ لیں',
    step3_desc: 'غلطیاں ٹھیک کریں، پھر ریکارڈ میں محفوظ کریں',
    sample_label: 'نمونہ آؤٹ پٹ',
    upload_btn: 'بل اپلوڈ اور پارس کریں',
    processing_btn: 'Gemini سے پروسیسنگ...',
    processing_note: 'پیچیدہ تصاویر کے لیے AI نکالنے میں ایک منٹ تک لگ سکتا ہے۔',

    // Mode toggle & voice upload
    mode_photo: 'بل فوٹو',
    mode_voice: 'وائس میمو',
    voice_drop_text: 'آڈیو فائل منتخب کریں',
    voice_drop_hint: '"دو کلو آلو، ایک لیٹر دودھ" کی طرح بولیں',
    voice_formats: 'OGG, M4A, MP3, WAV — 25MB تک',
    voice_btn: 'وائس اپلوڈ اور پارس کریں',
    voice_processing_btn: 'تبدیل ہو رہا ہے...',
    voice_processing_note: 'آواز کو متن میں تبدیل کرنے میں 30 سیکنڈ لگ سکتے ہیں۔',
    voice_prices_note: '⚠️ قیمتیں نہیں ملیں — جائزہ ٹیب میں شامل کریں۔',

    // Help
    nav_help: 'مدد',
    help_title: 'رہنمائی',
    help_subtitle: 'تاجر کے بارے میں سب کچھ جانیں',

    // WhatsApp CTA
    wa_title: 'واٹس ایپ پر بھیجیں',
    wa_sub: 'اپنے بل کی تصویر لیں اور بھیجیں',
    wa_suffix: '— ہم فوری پارس کریں گے۔',
    wa_btn: 'واٹس ایپ کھولیں',

    // Review Panel
    review_title: 'جائزہ اور تصدیق',
    review_subtitle: 'اسکین شدہ نتائج میں ترمیم کریں اور درستگی کی تصدیق کریں',
    loading_bills: 'بل لوڈ ہو رہے ہیں...',
    bills_sidebar: 'بلز',
    no_bills_found: 'کوئی بل نہیں ملا',
    meta_source: 'ذریعہ',
    meta_status: 'حیثیت',
    meta_date: 'تاریخ',
    col_item: 'آئٹم',
    col_qty: 'مقدار',
    col_price: 'قیمت (روپے)',
    col_subtotal: 'ذیلی کل',
    add_item: '+ آئٹم شامل کریں',
    total_label: 'کل',
    confirm_btn: '✅ تصدیق کریں',
    saving_btn: 'محفوظ ہو رہا ہے...',
    select_bill: 'جائزہ کے لیے سائیڈبار سے بل منتخب کریں',
    verified_msg: 'بل کامیابی سے تصدیق ہو گیا!',
    verify_error: 'بل تصدیق کرنے میں ناکامی: ',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('tajir_lang') || 'en'
  );

  const toggle = () => {
    const next = lang === 'en' ? 'ur' : 'en';
    localStorage.setItem('tajir_lang', next);
    setLang(next);
  };

  const t = (key) => translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
