import type { Metadata } from "next";
import { ElectronicsWorkspace } from "@/components/electronics/ElectronicsWorkspace";

export const metadata: Metadata = { title: "전자공학 실험실", robots: { index: false, follow: false } };
export default function ElectronicsPage() { return <ElectronicsWorkspace />; }
