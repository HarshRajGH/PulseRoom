const timeline = [
  ['2023', 'SyncWave starts as a weekend project — three friends missing shared aux-cord road trips.'],
  ['2024', 'First 10,000 rooms hosted. Live voting queue ships after months of late-night testing.'],
  ['2025', 'Creator tools launch: analytics, tips, and a wallet for hosts building real audiences.'],
  ['2026', 'Over 300 rooms live at any given moment, across 40+ countries.'],
]

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <p className="heading-eyebrow mb-2">About</p>
      <h1 className="font-display text-4xl font-bold mb-6 max-w-lg">We think listening was never meant to be a solo scroll.</h1>
      <p className="text-muted max-w-2xl mb-16 text-lg">SyncWave started because passing an aux cord around a car full of friends is one of the best parts of a road trip — and there was no version of that online. So we built one.</p>
      <div className="space-y-8">
        {timeline.map(([year, text]) => (
          <div key={year} className="flex gap-6 pb-8 border-b border-white/[0.06] last:border-0">
            <span className="font-display text-2xl font-bold text-current-2 w-20 shrink-0">{year}</span>
            <p className="text-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
