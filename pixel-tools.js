/* GENERADO: editar src/ o styles/ y ejecutar npm run build. Orden: sources.manifest.json. */
/* Small arithmetic parser: no eval, Function constructor or executable input. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PixelTools = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function calculate(expression) {
    const source = String(expression).replace(/\s/g, "");
    if (!source || source.length > 160)
      throw new Error("Escribe una operación de hasta 160 caracteres.");
    const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[()+\-*/%]/g) || [];
    if (tokens.join("") !== source) throw new Error("Operación no válida.");
    let at = 0;
    function primary() {
      let value;
      if (tokens[at] === "+") {
        at++;
        return primary();
      }
      if (tokens[at] === "-") {
        at++;
        return -primary();
      }
      if (tokens[at] === "(") {
        at++;
        value = sum();
        if (tokens[at++] !== ")") throw new Error("Revisa los paréntesis.");
      } else {
        const token = tokens[at++];
        if (!token || !/^(?:\d|\.)/.test(token)) throw new Error("Falta un número.");
        value = Number(token);
      }
      while (tokens[at] === "%") {
        value /= 100;
        at++;
      }
      return value;
    }
    function product() {
      let value = primary();
      while (tokens[at] === "*" || tokens[at] === "/") {
        const op = tokens[at++],
          next = primary();
        if (op === "/" && next === 0) throw new Error("No se puede dividir entre cero.");
        value = op === "*" ? value * next : value / next;
      }
      return value;
    }
    function sum() {
      let value = product();
      while (tokens[at] === "+" || tokens[at] === "-") {
        const op = tokens[at++],
          next = product();
        value = op === "+" ? value + next : value - next;
      }
      return value;
    }
    const value = sum();
    if (at !== tokens.length || !Number.isFinite(value))
      throw new Error("Resultado fuera de rango u operación incompleta.");
    return Number(value.toPrecision(12));
  }
  return { calculate };
});
