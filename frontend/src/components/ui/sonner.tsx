import type { CSSProperties } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toasts alignés sur le composant « toast » de la maquette (.toast / .toast--success|error|info, client.css) :
 * mise en forme portée par les classes de la maquette (unstyled), icône Lucide, bouton fermer `.icon-btn.x`,
 * sous la barre supérieure à droite, 4,5 s, 3 au maximum. Compléments de structure : styles/sonner.css.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const top = "calc(var(--header-height) + var(--space-2))";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      position="top-right"
      expand
      gap={8}
      visibleToasts={3}
      duration={4500}
      closeButton
      offset={{ top, right: "var(--space-4)" }}
      mobileOffset={{ top, right: "var(--space-4)", left: "var(--space-4)" }}
      style={{ "--width": "380px" } as CSSProperties}
      icons={{
        success: <CheckCircle className="icon" aria-hidden="true" />,
        error: <AlertCircle className="icon" aria-hidden="true" />,
        info: <Info className="icon" aria-hidden="true" />,
        warning: <AlertCircle className="icon" aria-hidden="true" />,
        close: <X className="icon icon--sm" aria-hidden="true" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "toast",
          success: "toast--success",
          error: "toast--error",
          info: "toast--info",
          warning: "toast--info",
          closeButton: "icon-btn x",
          title: "toast__title",
          description: "toast__text",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
