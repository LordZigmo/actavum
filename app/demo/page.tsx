import type { Metadata } from "next";
import { Workspace } from "@/components/Workspace";

export const metadata: Metadata = {
  title: "Actavum — Live Demo",
  description:
    "The Actavum investigation workspace, live: map evidence on a board, build the timeline, and generate a source-backed report.",
};

// Server Component entry — the interactive workspace is a Client Component.
// The prototype lives at /demo; the public landing page is at /.
export default function DemoPage() {
  return <Workspace />;
}
