interface PageHeroProps {
  /** Uppercase kicker above the title */
  eyebrow: string;
  title: string;
  description: string;
}

/** Shared inner-page masthead used by the service, projects and contact pages. */
export default function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="shell">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="serif">{title}</h1>
        </div>
        <p>{description}</p>
      </div>
    </section>
  );
}
