const puzzleColors = [
  '#FF6B35', '#FFD700', '#4CAF50', '#1a9fff', '#7B1FA2', '#E53935',
  '#00BCD4', '#FF8A50', '#E91E63', '#8BC34A', '#FF5722', '#3F51B5',
  '#009688', '#FFC107', '#673AB7',
]

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
        filter: `drop-shadow(0 3px 6px ${color}55)`,
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
      <PuzzlePiece color={puzzleColors[0]} top="12%" delay="0s" size="32px" duration="25s" />
      <PuzzlePiece color={puzzleColors[1]} top="30%" delay="-8s" size="28px" duration="30s" />
      <PuzzlePiece color={puzzleColors[2]} top="50%" delay="-15s" size="36px" duration="35s" />
      <PuzzlePiece color={puzzleColors[3]} top="68%" delay="-4s" size="26px" duration="28s" />
      <PuzzlePiece color={puzzleColors[4]} top="40%" delay="-20s" size="30px" duration="32s" />
      <PuzzlePiece color={puzzleColors[5]} top="78%" delay="-12s" size="24px" duration="26s" />
      <PuzzlePiece color={puzzleColors[6]} top="20%" delay="-18s" size="34px" duration="38s" />
      <PuzzlePiece color={puzzleColors[7]} top="60%" delay="-6s" size="28px" duration="33s" />
      <PuzzlePiece color={puzzleColors[8]} top="85%" delay="-22s" size="30px" duration="29s" />
    </>
  )
}
