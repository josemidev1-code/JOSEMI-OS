// src/apps/calculator.js: fuente de JOSEMI-OS.
Apps.calculator = {
  title: "Calculadora",
  icon: spriteIcon("calculator"),
  size: [410, 575],
  render: () =>
    `<section class="pixel-calculator"><span class="card-kicker">CUENTAS SIN SALIR DEL ESCRITORIO</span><label for="calc-operation">OPERACIÓN</label><input id="calc-operation" aria-label="Operación" readonly value="0"><p class="calc-message" role="status">Teclado o botones. % equivale a dividir entre 100.</p><div class="calc-keys">${[
      ["AC", "clear"],
      ["⌫", "back"],
      ["%", "%"],
      ["÷", "/"],
      ["7", "7"],
      ["8", "8"],
      ["9", "9"],
      ["×", "*"],
      ["4", "4"],
      ["5", "5"],
      ["6", "6"],
      ["−", "-"],
      ["1", "1"],
      ["2", "2"],
      ["3", "3"],
      ["+", "+"],
      ["0", "0"],
      [".", "."],
      ["(", "("],
      [")", ")"],
    ]
      .map(
        ([text, value]) =>
          `<button class="btn" data-calc="${value}" aria-label="${{ clear: "Borrar operación", back: "Borrar último carácter", "/": "Dividir", "*": "Multiplicar" }[value] || text}">${text}</button>`,
      )
      .join(
        "",
      )}<button class="btn btn--accent calc-equals" data-calc="equals" aria-label="Calcular resultado">=</button></div></section>`,
  bind(body, win) {
    let expression = "",
      fresh = false;
    const display = body.querySelector("input"),
      message = body.querySelector(".calc-message");
    function act(value) {
      if (value === "clear") {
        expression = "";
        fresh = false;
        message.textContent = "Lista para otra operación.";
      } else if (value === "back") {
        expression = expression.slice(0, -1);
        fresh = false;
      } else if (value === "equals") {
        try {
          expression = String(PixelTools.calculate(expression));
          fresh = true;
          message.textContent = "RESULTADO";
        } catch (error) {
          message.textContent = error.message;
        }
      } else if (expression.length < 150) {
        if (fresh && /[\d.(]/.test(value)) expression = "";
        fresh = false;
        expression += value;
        message.textContent = "";
      }
      display.value = expression || "0";
    }
    win.calculateExpression = (value) => {
      expression = String(PixelTools.calculate(value));
      fresh = true;
      display.value = expression;
      message.textContent = "RESULTADO";
      return Number(expression);
    };
    body.addEventListener("click", (e) => {
      const b = e.target.closest("[data-calc]");
      if (b) act(b.dataset.calc);
    });
    win.addEventListener("keydown", (e) => {
      let key = e.key;
      if (key === "Enter" || key === "=") key = "equals";
      else if (key === "Backspace") key = "back";
      else if (key === "Escape" || key === "Delete") key = "clear";
      else if (!/^[\d.+\-*/()%]$/.test(key)) return;
      e.preventDefault();
      act(key);
    });
  },
};
