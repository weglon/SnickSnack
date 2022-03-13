// Routing

module.exports = (app) => {
  app.get("/login", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
  });

  app.get("/register", (req, res) => {
    res.sendFile(`${__dirname}/public/register.html`);
  });

  app.get("/changepass", (req, res) => {
    res.sendFile(`${__dirname}/public/changepass.html`);
  });

  app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/landing.html`);
  });
};
