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

      {/* Water area with waves */}
      <div className="water-area">
        <div className="wave" />
        <div className="wave" />
        <div className="wave" />
      </div>

      {/* Water slide decoration */}
      <div className="waterslide">
        <div className="slide-track" />
      </div>
    </>
  )
}
