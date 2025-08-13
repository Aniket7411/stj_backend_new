const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const setupSwagger = (app) => {
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "swagger.json"), "utf8")
  );

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
