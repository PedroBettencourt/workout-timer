import type { Route } from "./+types/home";
import { Timers } from "../timers/timers";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workout Timer" },
    { name: "description", content: "Set and Rep Timers" },
  ];
}

export default function Home() {
  return <Timers />;
}
