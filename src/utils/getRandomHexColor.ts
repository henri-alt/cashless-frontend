export function getRandomHexColor() {
  const randomNumber = Math.floor(Math.random() * 16777215);
  const hexColor = `#${randomNumber.toString(16).padStart(6, "0")}`;
  return hexColor;
}
