export function toTitleCase(str: string) {
  try {
    if (typeof str !== "string") {
      throw new TypeError("Input must be a string");
    }

    return str
      .replace(/(_)+/g, " ")
      .replace(/(^[a-z])/g, function (_, g1) {
        return g1.toUpperCase();
      })
      .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
      .replace(/([A-Z][a-z])([A-Z])/g, "$1 $2")
      .replace(/([a-z])([A-Z]+[a-z])/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-z][a-z])/g, "$1 $2")
      .replace(/([a-z]+)([A-Z0-9]+)/g, "$1 $2")
      .replace(/([A-Z]+)([A-Z][a-rt-z][a-z]*)/g, "$1 $2")
      .replace(/([0-9])([A-Z][a-z]+)/g, "$1 $2")
      .replace(/([A-Z]{2,})([0-9]{2,})/g, "$1 $2")
      .replace(/([0-9]{2,})([A-Z]{2,})/g, "$1 $2")
      .trim();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error?.message);
    }
    return null;
  }
}
