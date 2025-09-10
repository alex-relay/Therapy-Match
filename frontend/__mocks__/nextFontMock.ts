const mock = new Proxy(
  {},
  {
    get: function getter() {
      return () => ({
        className: "className",
        variable: "variable",
        style: { fontFamily: "fontFamily" },
      });
    },
  },
);

export default mock;
