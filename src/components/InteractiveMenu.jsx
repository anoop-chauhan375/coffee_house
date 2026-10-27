import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import ShowcaseCup from '../three/ShowcaseCup';
import { menuCategories, menuItems } from '../data/menuItems';

/**
 * Section three — The Menu, Reimagined. Category selectors and a drink list on
 * the left; a large 3D presentation of the selected drink on the right that
 * changes colour, ingredients and accent as the visitor chooses.
 */
export default function InteractiveMenu({ reduced, quality }) {
  const [category, setCategory] = useState(menuCategories[0].id);
  const [activeId, setActiveId] = useState(menuItems[0].id);
  const [fullMenuOpen, setFullMenuOpen] = useState(false);

  const items = useMemo(() => menuItems.filter((item) => item.category === category), [category]);
  const active = useMemo(
    () => menuItems.find((item) => item.id === activeId) || items[0],
    [activeId, items],
  );

  // Keep the featured drink inside the chosen category.
  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) setActiveId(items[0].id);
  }, [items, activeId]);

  const colors = active
    ? { espresso: active.liquid, crema: active.crema, milk: '#fff8ec' }
    : undefined;

  return (
    <section
      className="menu"
      id="menu"
      style={{ '--drink-accent': active?.accent, '--drink-base': active?.liquid }}
    >
      <div className="menu__inner">
        <header className="menu__head">
          <p className="section-label section-label--dark">SECTION 03 — THE MENU, REIMAGINED</p>
          <h2 className="menu__headline">
            Find your
            <em>kind of buzz.</em>
          </h2>
        </header>

        <div className="menu__body">
          <div className="menu__controls">
            <div className="menu__categories" role="tablist" aria-label="Menu categories">
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={category === cat.id}
                  className={`menu__category ${category === cat.id ? 'is-active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span>{cat.label}</span>
                  <em>{cat.note}</em>
                </button>
              ))}
            </div>

            <ul className="menu__list">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`menu__item ${item.id === activeId ? 'is-active' : ''}`}
                    onClick={() => setActiveId(item.id)}
                    style={{ animationDelay: reduced ? '0s' : `${index * 45}ms` }}
                  >
                    <span className="menu__item-name">{item.name}</span>
                    <span className="menu__item-rule" aria-hidden="true" />
                    <span className="menu__item-dot" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <button className="btn btn--dark" type="button" onClick={() => setFullMenuOpen(true)}>
              View Full Menu
              <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <div className="menu__feature">
            <div className="menu__cup">
              {quality.webgl ? (
                <ShowcaseCup
                  colors={colors}
                  accent={active?.accent}
                  beanCount={quality.tier === 'low' ? 5 : 9}
                  quality={quality}
                  camera={{ position: [0.4, 1.9, 4.4], fov: 30 }}
                />
              ) : (
                <div className="menu__cup-fallback" aria-hidden="true" />
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active?.id}
                className="menu__feature-copy"
                initial={reduced ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, y: -16 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="menu__article">{active?.article}</h3>
                <p className="menu__description">{active?.description}</p>
                <ul className="menu__ingredients">
                  {(active?.ingredients || []).map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fullMenuOpen && (
          <FullMenuModal items={menuItems} onClose={() => setFullMenuOpen(false)} reduced={reduced} />
        )}
      </AnimatePresence>
    </section>
  );
}

function FullMenuModal({ items, onClose, reduced }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      className="fullmenu"
      initial={reduced ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-label="Full menu"
      onClick={onClose}
    >
      <motion.div
        className="fullmenu__sheet"
        initial={reduced ? false : { y: 40 }}
        animate={{ y: 0 }}
        exit={reduced ? undefined : { y: 40 }}
        transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="fullmenu__head">
          <div>
            <h3>The Full Menu</h3>
            <p>Prices appear as placeholders until they are confirmed in store.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close full menu">
            <X size={20} strokeWidth={1.75} />
          </button>
        </header>

        <div className="fullmenu__body">
          {menuCategories.map((cat) => (
            <section key={cat.id} className="fullmenu__group">
              <h4>{cat.label}</h4>
              <ul>
                {items
                  .filter((item) => item.category === cat.id)
                  .map((item) => (
                    <li key={item.id}>
                      <span className="fullmenu__name">{item.name}</span>
                      <span className="fullmenu__rule" aria-hidden="true" />
                      <span className="fullmenu__price">{item.price ?? '—'}</span>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
