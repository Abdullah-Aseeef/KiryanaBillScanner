import { useLanguage } from '../context/LanguageContext';
import './WhatsAppCTA.css';

const WA_NUMBER = '+15556291286';
const WA_DISPLAY = '+1 (555) 629-1286';

function WhatsAppCTA() {
  const { t } = useLanguage();
  const waLink = `https://wa.me/${WA_NUMBER.replace(/\D/g, '')}`;

  return (
    <div className="wa-cta fade-in">
      <div className="wa-cta-left">
        <span className="wa-cta-icon">💬</span>
        <div>
          <p className="wa-cta-title">{t('wa_title')}</p>
          <p className="wa-cta-sub">
            {t('wa_sub')} <strong>{WA_DISPLAY}</strong> {t('wa_suffix')}
          </p>
        </div>
      </div>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="wa-cta-btn"
      >
        {t('wa_btn')}
      </a>
    </div>
  );
}

export default WhatsAppCTA;
