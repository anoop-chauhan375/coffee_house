import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import LabScene from '../three/LabScene';
import useScrollProgress from '../hooks/useScrollProgress';
import { lab, image } from '../data/cafeConfig';
import Img from './Img';

/**
 * Section two — The Coffee Lab. Oversized type on the left, an interactive
 * still-life of espresso equipment on the right. Scrolling reveals each tool;
 * hovering a tool (in 3D or in the list) highlights its stage.
 */
export default function CoffeeLab({ reduced, quality }) {
  const sectionRef = useRef(null);
  // We want the reveal to happen sooner so that all items are visible by the
  // time the section is fully in the viewport.
  const progress = useScrollProgress(sectionRef, { start: 'top bottom', end: 'top top' });
  const [activeId, setActiveId] = useState(null);

  return (
    <section className="lab" id="craft" ref={sectionRef}>
      <div className="lab__inner">
        <div className="lab__copy">
          <p className="section-label">{lab.label}</p>

          <h2 className="lab__headline">
            <span>{lab.headlineLead}</span>
            <em>{lab.headlineTail}</em>
          </h2>

          <p className="lab__supporting">{lab.supporting}</p>

          <ul className="lab__stages">
            {lab.stages.map((stage, index) => (
              <motion.li
                key={stage.id}
                className={`lab__stage ${activeId === stage.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveId(stage.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(stage.id)}
                onBlur={() => setActiveId(null)}
                initial={reduced ? false : { opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: reduced ? 0 : index * 0.08 }}
                tabIndex={0}
              >
                <span className="lab__stage-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="lab__stage-body">
                  <strong>{stage.label}</strong>
                  <em>{stage.note}</em>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="lab__stage3d">
          {quality.webgl ? (
            <LabScene
              progress={reduced ? 1 : progress}
              activeId={activeId}
              onHover={setActiveId}
              quality={quality}
            />
          ) : (
            <Img
              className="lab__fallback"
              src={image('Espresso machine group head and portafilter, dark warm light', 'portrait_4_3')}
              alt="Espresso machine group head and portafilter"
            />
          )}
          <p className="lab__hint" aria-hidden="true">
            {activeId ? 'HOLDING — ' + activeId.toUpperCase() : 'HOVER THE EQUIPMENT'}
          </p>
        </div>
      </div>
    </section>
  );
}
