const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {

  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: "http://localhost:8089/",
      changeOrigin: true
    })
  );

}