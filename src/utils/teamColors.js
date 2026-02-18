export const getTeamColor = (teamId = "") => {
  // Hash teamId → angka deterministik
  const hash = [...teamId].reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) & 0xffffffff, 0
  );

  // Generate hue 0–359 dari hash, hindari range warna yang terlalu mirip (hijau-kuning)
  const hue = Math.abs(hash) % 360;

  return {
    bg:   `hsl(${hue}, 70%, 92%)`,
    text: `hsl(${hue}, 55%, 35%)`,
    border: `hsl(${hue}, 60%, 80%)`,
  };
};