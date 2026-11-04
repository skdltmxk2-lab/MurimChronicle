import type { Metadata } from "next";
import { Lab5ReferencePanel } from "@/components/electronics/Lab5ReferencePanel";

export const metadata: Metadata = { title: "Lab 5 원문 회로 비교", robots: { index: false, follow: false } };
export default function Lab5ReferencePage() { return <Lab5ReferencePanel />; }
