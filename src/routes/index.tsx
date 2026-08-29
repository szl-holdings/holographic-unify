import { createFileRoute } from "@tanstack/react-router";
import { CommandCenter } from "@/components/command-center";
import { loadEstate } from "@/lib/estate";

export const Route = createFileRoute("/")({
  loader: () => loadEstate(),
  component: Home,
});

function Home() {
  const snapshot = Route.useLoaderData();
  return <CommandCenter snapshot={snapshot} />;
}
