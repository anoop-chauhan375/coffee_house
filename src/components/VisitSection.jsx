import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Instagram, ArrowUpRight } from 'lucide-react';
import ShowcaseCup from '../three/ShowcaseCup';
import { visit } from '../data/cafeConfig';

const ICONS = { address: MapPin, hours: Clock, phone: Phone, instagram: Instagram };

/**
 * Section seven — Find your way to Buland. Practical primary, still cinematic.
 */
export default function VisitSection({ reduced, quality }) {
  return (
    <section className="visit" id="visit">
      <div className="visit__inner">
        <div className="visit__copy">
          <p className="section-label section-label--dark">{visit.label}</p>

          <h2 className="visit__headline">
            {visit.headlineLead}
            <em>{visit.headlineTail}</em>
          </h2>

          <p className="visit__location">{visit.location}</p>

          <ul className="visit__details">
            {visit.details.map((detail, index) => {
              const Icon = ICONS[detail.id] || MapPin;
              return (
                <motion.li
                  key={detail.id}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{ duration: 0.6, delay: reduced ? 0 : index * 0.07 }}
                >
                  <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
                  <span className="visit__detail-label">{detail.label}</span>
                  <span className={`visit__detail-value ${detail.value.startsWith('PLACEHOLDER') ? 'is-placeholder' : ''}`}>
                    {detail.value}
                  </span>
                </motion.li>
              );
            })}
          </ul>

          <div className="visit__actions">
            <a
              className="btn btn--dark"
              href={visit.mapLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              {visit.primaryCta.label}
              <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <a
              className="btn btn--outline-dark"
              href={visit.instagramLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              {visit.secondaryCta.label}
            </a>
          </div>
        </div>

        <div className="visit__stage">
          {quality.webgl ? (
            <ShowcaseCup
              colors={{ espresso: '#2a160c', crema: '#8a5630', milk: '#fff6e6' }}
              accent="#B87945"
              showSaucer={false}
              beanCount={quality.tier === 'low' ? 7 : 14}
              quality={quality}
              camera={{ position: [0.8, 1.7, 4.6], fov: 32 }}
              spin={0.13}
            />
          ) : (
            <div className="visit__fallback" aria-hidden="true" />
          )}
          <span className="visit__stage-note" aria-hidden="true">
            {visit.location}
          </span>
        </div>
      </div>
    </section>
  );
}
