import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/timers.tsx"),
  route("done", "routes/done.tsx"),
] satisfies RouteConfig;