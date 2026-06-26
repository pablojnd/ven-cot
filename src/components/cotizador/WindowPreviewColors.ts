export function getPreviewProfileColors(hexValue: string | null | undefined) {
  const profileColor = hexValue || '#888888';
  const isWhite = ['#FFFFFF', '#FFF'].includes(profileColor.toUpperCase());

  return {
    profileColor,
    detailColor: isWhite ? '#555555' : profileColor,
    outerBorderColor: isWhite ? '#000000' : null,
  };
}
