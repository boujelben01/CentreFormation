import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  body: ReactNode;
}

/**
 * Accordéon de la maquette (composant « accordion ») : un bouton par question (`aria-expanded`,
 * `aria-controls`), panneau en région, navigation aux flèches, Début et Fin. Plusieurs volets peuvent être ouverts.
 */
export function Accordion({ items, defaultOpen = -1 }: { items: AccordionItem[]; defaultOpen?: number }) {
  const base = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen >= 0 ? [defaultOpen] : []));
  const root = useRef<HTMLDivElement>(null);

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('.acc-btn') ?? []);
    let target = -1;
    if (e.key === 'ArrowDown') target = (i + 1) % buttons.length;
    else if (e.key === 'ArrowUp') target = (i - 1 + buttons.length) % buttons.length;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = buttons.length - 1;
    if (target >= 0) {
      e.preventDefault();
      buttons[target]?.focus();
    }
  };

  return (
    <div className="accordion" ref={root}>
      {items.map((item, i) => {
        const id = `${base}-${i}`;
        const isOpen = open.has(i);
        return (
          <div className="acc-item" key={item.title}>
            <h3 className="acc-head">
              <button
                type="button"
                className="acc-btn"
                id={`${id}-b`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p`}
                onClick={() => toggle(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span>{item.title}</span>
                <ChevronDown className="icon chev" aria-hidden="true" />
              </button>
            </h3>
            <div className={isOpen ? 'acc-panel is-open' : 'acc-panel'} id={`${id}-p`} role="region" aria-labelledby={`${id}-b`}>
              <div>
                <div className="acc-panel__inner">{item.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
