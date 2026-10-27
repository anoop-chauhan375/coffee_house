import { useRef } from 'react';
import { motion } from 'framer-motion';
import Img from './Img';
import useScrollProgress from '../hooks/useScrollProgress';
import { lifestyle } from '../data/cafeConfig';

/**
 * Section five — a staggered lifestyle collage. Each frame drifts at its own
 * pace as the section passes, and zooms gently on hover.
 */
export default function LifestyleGallery({ reduced }) {
  const sectionRef = useRef(null);
  const progress = useScrollProgress(sectionRef);

  return (
    <section className="collage" id="moments" ref={sectionRef}>
      <div className="collage__inner">
        <header className="collage__head">
          <p className="section-label section-label--dark">{lifestyle.label}</p>
          <h2 className="collage__headline">
            {lifestyle.headline[0]}
            <em>{lifestyle.headline[1]}</em>
          </h2>
          <p className="collage__supporting">{lifestyle.supporting}</p>
        </header>

        <div className="collage__grid">
          {lifestyle.photos.map((photo, index) => {
            const drift = reduced ? 0 : (progress - 0.5) * (index % 2 === 0 ? -70 : 70);

            return (
              <motion.figure
                key={photo.id}
                className={`collage__item collage__item--${photo.span}`}
                style={{ y: drift }}
                initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: reduced ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="collage__frame">
                  <Img src={photo.src} alt={photo.alt} className="collage__img" />
                </div>
                <figcaption className="collage__phrase">{photo.phrase}</figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
