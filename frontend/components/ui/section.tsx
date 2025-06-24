interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8 rounded-lg border border-border bg-white dark:bg-zinc-900 p-6 shadow-sm">
      {title && (
        <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h4>
      )}
      {children}
    </section>
  );
}
