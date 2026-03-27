export default function AnimatedBackground() {
  return (
    <>
      <div className="camp-bg" />

      {/* Sun with rotating rays */}
      <div className="sun">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="sun-ray" />
        ))}
      </div>

      {/* Floating clouds */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />

      {/* Butterflies */}
      <div className="butterfly" style={{ top: '25%' }}>🦋</div>
      <div className="butterfly" style={{ top: '45%', animationDelay: '-7s', fontSize: '16px' }}>🦋</div>

      {/* Ocean waves */}
      <div className="ocean">
        {/* Back wave - darkest */}
        <div className="ocean-wave ocean-wave-4">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C120,80 240,40 360,55 C480,70 600,35 720,50 C840,65 960,30 1080,50 C1200,70 1320,40 1440,55 L1440,120 L0,120 Z" fill="#0D7377" />
          </svg>
        </div>
        {/* Mid-back wave */}
        <div className="ocean-wave ocean-wave-3">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,65 C160,45 280,75 420,55 C560,35 680,70 840,50 C1000,30 1120,65 1280,50 C1360,42 1400,55 1440,60 L1440,120 L0,120 Z" fill="#1A9CA0" />
          </svg>
        </div>
        {/* Mid-front wave */}
        <div className="ocean-wave ocean-wave-2">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,70 C200,50 320,80 480,60 C640,40 760,75 960,55 C1160,35 1280,70 1440,55 L1440,120 L0,120 Z" fill="#3DC8CC" />
          </svg>
        </div>
        {/* Front wave - lightest */}
        <div className="ocean-wave ocean-wave-1">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,75 C180,55 300,85 480,65 C660,45 780,80 1000,60 C1220,40 1340,72 1440,65 L1440,120 L0,120 Z" fill="#5ED4D8" />
          </svg>
        </div>
      </div>
    </>
  )
}
