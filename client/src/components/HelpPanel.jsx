import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './HelpPanel.css';

const WA_NUMBER = '+1 (555) 629-1286';

const sections = [
  {
    id: 'upload',
    icon: '📷',
    title: 'How to upload a bill photo',
    steps: [
      'Click the Upload tab in the navigation bar.',
      'Make sure Bill Photo mode is selected (top toggle).',
      'Drag and drop your bill image onto the drop zone, or click it to open the file picker.',
      'Supported formats: PNG, JPG, WEBP — up to 10 MB.',
      'Click "Upload & Parse Bill". Google Vision OCR extracts text; Gemini structures it into line items.',
      'You are taken to the Review tab automatically once parsing completes.',
    ],
  },
  {
    id: 'voice',
    icon: '🎙️',
    title: 'How to upload a voice memo',
    steps: [
      'Click the Upload tab and select Voice Memo mode.',
      'Record a voice note on your phone naming the items you bought. Example: "teen kilo aalu, do liter doodh, ek kg cheeni".',
      'Export the file from your recorder app (WhatsApp voice note, iPhone Voice Memos, Android recorder).',
      'Click the drop zone, choose the audio file (OGG, M4A, MP3, WAV — up to 25 MB), and click "Upload & Parse Voice".',
      'Speech-to-Text transcribes your Urdu/English, then Gemini extracts each item.',
      'Open the Review tab to fill in any missing prices before verifying.',
    ],
  },
  {
    id: 'whatsapp',
    icon: '💬',
    title: 'How to use WhatsApp',
    steps: [
      `Send a bill photo to ${WA_NUMBER} on WhatsApp. You will receive a reply with the top items and total within seconds.`,
      `Send a voice note to the same number describing your purchases in Urdu or English.`,
      `Type "menu" to see your store stats (Revenue, Top Items, This Week) as interactive buttons.`,
      'All bills received via WhatsApp appear in the Review tab on the web dashboard.',
    ],
  },
  {
    id: 'revenue',
    icon: '💰',
    title: 'How to check revenue and stats',
    steps: [
      'Open the Dashboard tab.',
      'Total Revenue shows the sum of all verified bills.',
      'Total Bills counts every bill (verified + pending). Verified Bills counts only confirmed ones.',
      'Top Selling Items ranks items by total revenue across all verified bills.',
      'Recent Bills shows the last 5 bills with their source (web or WhatsApp), amount, and status.',
      'Stats update automatically after you verify a bill in the Review tab.',
    ],
  },
  {
    id: 'review',
    icon: '✏️',
    title: 'How to review and verify a bill',
    steps: [
      'Click the Review tab. Bills waiting for review appear in the left sidebar.',
      'Click a bill to open it. Each row shows the item name, quantity, and price.',
      'Click any cell to edit it inline — fix item names, quantities, or prices.',
      'Use "+ Add Item" to add missing rows.',
      'Click the delete button (×) on a row to remove a wrong item.',
      'Once everything looks correct, click "✅ Confirm & Verify". The bill is saved and revenue stats update.',
    ],
  },
  {
    id: 'whatsapp-commands',
    icon: '📋',
    title: 'WhatsApp commands',
    rows: [
      { cmd: 'Send a photo', desc: 'Parse a bill image — get a summary reply with top items and total' },
      { cmd: 'Send a voice note', desc: 'Parse spoken items in Urdu/English — confirm prices in the dashboard' },
      { cmd: 'menu', desc: 'Show interactive buttons: Revenue, Top Items, This Week' },
      { cmd: 'help', desc: 'Show usage instructions and the dashboard link' },
    ],
  },
];

function Accordion({ section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`help-accordion ${open ? 'open' : ''}`}>
      <button type="button" className="help-accordion-header" onClick={() => setOpen((o) => !o)}>
        <span className="help-acc-icon">{section.icon}</span>
        <span className="help-acc-title">{section.title}</span>
        <span className="help-acc-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="help-accordion-body">
          {section.steps && (
            <ol className="help-steps">
              {section.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}
          {section.rows && (
            <table className="help-cmd-table">
              <thead>
                <tr><th>Send / Type</th><th>What happens</th></tr>
              </thead>
              <tbody>
                {section.rows.map((r) => (
                  <tr key={r.cmd}>
                    <td><code>{r.cmd}</code></td>
                    <td>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function HelpPanel() {
  const { t } = useLanguage();
  return (
    <section className="help-panel fade-in">
      <div className="help-header">
        <h2>{t('help_title')}</h2>
        <p className="help-subtitle">{t('help_subtitle')}</p>
      </div>
      <div className="help-sections">
        {sections.map((s) => (
          <Accordion key={s.id} section={s} />
        ))}
      </div>
    </section>
  );
}

export default HelpPanel;
