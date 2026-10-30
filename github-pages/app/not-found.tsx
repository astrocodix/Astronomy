import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="gp-not-found">
      <span>✦</span>
      <h1>This corner of the cosmos is uncharted.</h1>
      <p>The page you’re looking for isn’t part of this preview.</p>
      <Link href="/" className="btn btn-primary">
        Back to the academy
      </Link>
    </div>
  );
}
