import type { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

/** Liste déroulante native (composants « select » et « select-wrap » de la maquette). */
export function SelectField({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="select-wrap">
      <select className="select" {...props}>
        {children}
      </select>
      <ChevronDown className="icon" aria-hidden="true" />
    </div>
  );
}
