const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {

  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8089/",
      changeOrigin: true
    })
  );

  app.use(
    "/auth",
    createProxyMiddleware({
      target: "http://localhost:8089/",
      changeOrigin: true
    })
  );

  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: "http://localhost:8089/",
      changeOrigin: true
    })
  );

}