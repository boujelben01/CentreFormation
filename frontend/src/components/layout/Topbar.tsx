import { useState } from 'react';
import { Menu, Moon, PanelLeft, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import type { OverlayName } from './useOverlay';

interface TopbarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onOpenMobile: () => void;
}

/** Barre supérieure (composant « topbar » de la maquette) : menu, repli, cloche, thème, menu avatar. */
export function Topbar({ collapsed, mobileOpen, onToggleCollapsed, onOpenMobile }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [overlay, setOverlay] = useState<OverlayName | null>(null);
  const isDark = theme === 'dark';

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-btn"
        id="menu-btn"
        aria-label="Ouvrir le menu"
        aria-expanded={mobileOpen}
        aria-controls="sidebar"
        onClick={onOpenMobile}
      >
        <Menu className="icon" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-btn collapse-btn"
        id="collapse-btn"
        aria-label={collapsed ? 'Développer le menu latéral' : 'Réduire le menu latéral'}
        aria-expanded={!collapsed}
        aria-controls="sidebar"
        onClick={onToggleCollapsed}
      >
        <PanelLeft className="icon" aria-hidden="true" />
      </button>

      <div className="topbar__spacer" />

      <NotificationBell overlay={overlay} setOverlay={setOverlay} />

      <button
        type="button"
        className="icon-btn"
        id="theme-btn"
        aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
        onClick={toggleTheme}
      >
        {isDark ? <Sun className="icon" aria-hidden="true" /> : <Moon className="icon" aria-hidden="true" />}
      </button>

      <UserMenu overlay={overlay} setOverlay={setOverlay} />
    </header>
  );
}
