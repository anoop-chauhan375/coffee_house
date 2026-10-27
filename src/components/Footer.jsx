import { Instagram, Phone } from 'lucide-react';
import { brand, footer } from '../data/cafeConfig';
import { scrollToSection } from '../lib/browser';

/** The footer: deep brown, anchored by an oversized BULAND wordmark. */
export default function Footer({ reduced }) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <h2>{brand.name}</h2>
          <p>{brand.city}, {brand.region}</p>
          <p className="footer__tagline">{footer.tagline}</p>
        </div>

        <nav className="footer__nav" aria-label="Footer">
          <ul>
            {footer.links.map((link) => (
              <li key={link.id}>
                <button type="button" onClick={() => scrollToSection(link.id, { reduced })}>
                  <span>{link.index}</span>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__contact">
          <a href={footer.social.href} target="_blank" rel="noreferrer noopener">
            <Instagram size={16} strokeWidth={1.6} aria-hidden="true" />
            {footer.social.value}
          </a>
          <span>
            <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
            {footer.contact.value}
          </span>
        </div>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        <span>{brand.wordmark}</span>
      </div>

      <div className="footer__bottom">
        <p>{footer.copyright}</p>
        <p className="footer__note">Details marked PLACEHOLDER are editable in src/data/cafeConfig.js</p>
        <span className="footer__bean" aria-hidden="true">
          <svg viewBox="0 0 60 72">
            <ellipse cx="30" cy="36" rx="24" ry="32" fill="#4a2c19" />
            <path d="M30 6c6 12 6 46 0 60" fill="none" stroke="#F4EBDD" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </footer>
  );
}
