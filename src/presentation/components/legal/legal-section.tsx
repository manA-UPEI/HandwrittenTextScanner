interface LegalSectionProps {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

/** One numbered clause, shared by the Terms and Privacy pages so both render consistently. */
export const LegalSection = ({ heading, paragraphs, list }: LegalSectionProps) => (
  <section className="mb-6">
    <h2 className="mb-2 text-lg font-semibold text-slate-900">{heading}</h2>
    {paragraphs?.map((paragraph) => (
      <p key={paragraph} className="mb-2 text-slate-700">
        {paragraph}
      </p>
    ))}
    {list && (
      <ul className="list-disc space-y-1 pl-5 text-slate-700">
        {list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )}
  </section>
);
