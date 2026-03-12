import React from 'react';
import PageHero from '../components/c4/PageHero';

export default function Rebuild() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--c4-bg)' }}>
      <PageHero
        label="Rebuilds"
        titleLines={[
          'Replace overpriced software',
          'with something better.',
        ]}
        description="We build lean, custom alternatives to the bloated tools your team has outgrown — same capability, fraction of the cost. More coming soon."
      />
    </div>
  );
}