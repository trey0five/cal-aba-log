export default function AnimatedBackground() {
  // Each wave is duplicated side-by-side so the scroll loops seamlessly
  const Wave = ({ className, color, d }) => (
    <div className={`ocean-wave ${className}`}>
      <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
        <path d={d} fill={color} />
      </svg>
      <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
        <path d={d} fill={color} />
      </svg>
    </div>
  )

  return (
    <>
      <div className="camp-bg" />

      {/* Sun - clean glowing orb, no clock hands */}
      <div className="sun" />

      {/* Floating clouds */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />

      {/* Butterflies */}
      <div className="butterfly" style={{ top: '25%' }}>🦋</div>
      <div className="butterfly" style={{ top: '45%', animationDelay: '-7s', fontSize: '16px' }}>🦋</div>

      {/* Layered ocean waves */}
      <div className="ocean">
        <Wave
          className="ocean-wave-5"
          color="#0A5E61"
          d="M0,80 C80,65 160,90 240,75 C320,60 400,85 480,70 C560,55 640,80 720,72 C800,64 880,88 960,74 C1040,60 1120,82 1200,70 C1280,58 1360,78 1440,68 L1440,150 L0,150 Z"
        />
        <Wave
          className="ocean-wave-4"
          color="#0D7377"
          d="M0,72 C100,85 200,60 320,75 C440,90 520,58 660,72 C800,86 880,55 1020,70 C1160,85 1260,60 1380,73 C1410,76 1430,70 1440,68 L1440,150 L0,150 Z"
        />
        <Wave
          className="ocean-wave-3"
          color="#1A9CA0"
          d="M0,78 C120,62 200,88 340,70 C480,52 580,82 720,68 C860,54 960,84 1100,66 C1240,48 1340,76 1440,64 L1440,150 L0,150 Z"
        />
        <Wave
          className="ocean-wave-2"
          color="#3DC8CC"
          d="M0,82 C90,68 220,92 360,74 C500,56 620,86 780,70 C940,54 1060,82 1200,68 C1340,54 1400,75 1440,72 L1440,150 L0,150 Z"
        />
        <Wave
          className="ocean-wave-1"
          color="#5ED4D8"
          d="M0,88 C140,72 260,95 400,78 C540,61 660,90 820,75 C980,60 1100,88 1260,74 C1360,65 1420,80 1440,76 L1440,150 L0,150 Z"
        />
      </div>
    </>
  )
}
