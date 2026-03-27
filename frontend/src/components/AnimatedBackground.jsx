const puzzleColors = ['#FF6B35', '#FFD700', '#4CAF50', '#1a9fff', '#7B1FA2', '#E53935', '#00BCD4', '#FF8A50']

function PuzzlePiece({ color, top, delay, size, duration }) {
  return (
    <div
      className="puzzle-piece"
      style={{
        top,
        animationDelay: delay,
        animationDuration: duration,
        fontSize: size,
        color,
        filter: `drop-shadow(0 2px 4px ${color}44)`,
      }}
    >
      🧩
    </div>
  )
}

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

      {/* Drifting puzzle pieces */}
      <PuzzlePiece color={puzzleColors[0]} top="15%" delay="0s" size="22px" duration="25s" />
      <PuzzlePiece color={puzzleColors[1]} top="35%" delay="-8s" size="18px" duration="30s" />
      <PuzzlePiece color={puzzleColors[2]} top="55%" delay="-15s" size="24px" duration="35s" />
      <PuzzlePiece color={puzzleColors[3]} top="70%" delay="-4s" size="16px" duration="28s" />
      <PuzzlePiece color={puzzleColors[4]} top="45%" delay="-20s" size="20px" duration="32s" />
      <PuzzlePiece color={puzzleColors[5]} top="80%" delay="-12s" size="14px" duration="26s" />
    </>
  )
}
