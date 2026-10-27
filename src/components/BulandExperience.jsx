import { motion } from 'framer-motion';
import ShowcaseCup from '../three/ShowcaseCup';
import { experience } from '../data/cafeConfig';

/**
 * Section six — the Buland experience. A dark stage with a huge cup running
 * off the edge of the frame and circular lettering orbiting it.
 */
export default function BulandExperience({ reduced, quality }) {
  return (
    <section className="experience" id="experience">
      <div className="experience__glow" aria-hidden="true" />

      <div className="experience__cup" aria-hidden="true">
        {quality.webgl ? (
          <ShowcaseCup
            colors={{ espresso: '#2c1a0f', crema: '#8a5630', milk: '#fff3e0' }}
            accent="#C78E65"
            beanCount={quality.tier === 'low' ? 12 : 24}
            quality={quality}
            camera={{ position: [0, 1.4, 6.2], fov: 26 }}
            target={[0, -0.45, 0]}
            spin={0.1}
          />
        ) : (
          <div className="experience__cup-fallback" />
        )}

        <div className="experience__ring">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <defs>
              <path id="ringPath" d="M150,150 m-112,0 a112,112 0 1,1 224,0 a112,112 0 1,1 -224,0" />
            </defs>
            <text>
              <textPath href="#ringPath" startOffset="0">
                {experience.ring.repeat(2)}
              </textPath>
            </text>
          </svg>
        </div>
      </div>

      <div className="experience__copy">
        <p className="section-label section-label--light">{experience.label}</p>

        <ul className="experience__statements">
          {experience.statements.map((statement, index) => (
            <motion.li
              key={statement}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: reduced ? 0 : index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="experience__index">{String(index + 1).padStart(2, '0')}</span>
              {statement}
            </motion.li>
          ))}
        </ul>

        <p className="experience__foot">Good coffee • Good company • Good days</p>
      </div>
    </section>
  );
}
