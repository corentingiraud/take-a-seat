interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="mb-8 rounded-lg border border-border bg-white dark:bg-zinc-900 p-6 shadow-sm">
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h4>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
