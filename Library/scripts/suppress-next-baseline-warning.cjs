const staleBaselineWarning =
  "[baseline-browser-mapping] The data in this module is over two months old.  " +
  "To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`";

const warn = console.warn.bind(console);

console.warn = (...args) => {
  if (args.length === 1 && args[0] === staleBaselineWarning) return;
  warn(...args);
};
