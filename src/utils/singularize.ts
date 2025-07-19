const endings = {
  ves: "fe",
  ies: "y",
  i: "us",
  zes: "ze",
  ses: "s",
  es: "e",
  s: "",
};

export function singularize(word: string) {
  return word.replace(
    new RegExp(`(${Object.keys(endings).join("|")})$`),
    (r) => endings[r as keyof typeof endings]
  );
}
