"use client";

type Props = {
  action: () => Promise<void>;
  message: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
};

// Bouton qui demande confirmation avant d'exécuter une action serveur
export default function ConfirmButton({ action, message, className, title, children }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button type="submit" className={className} title={title}>
        {children}
      </button>
    </form>
  );
}