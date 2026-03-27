export default function AnimatedBackground() {
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

    </>
  )
}
