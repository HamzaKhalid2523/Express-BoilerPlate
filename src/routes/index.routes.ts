// Requiring Routes
export default function routesIndex(app: any) {
  const UsersRoutes = require("./users.routes");

  app.use("/api/users", UsersRoutes);
}
