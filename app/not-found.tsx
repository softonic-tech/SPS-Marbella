import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <section className="page-hero">
        <div className="shell">
          <div>
            <div className="eyebrow">SPS · MARBELLA</div>
            <h1 className="serif">Page not found</h1>
          </div>
          <p>The page you were looking for is not here. Return to the landing page to continue.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <Link className="btn" href="/">
            Back to home
            <span className="arrow">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
