import {Suspense} from "react";import {DemoFlow} from "@/components/demo-flow";
export const metadata={title:"Deterministic demo"};
export default function DemoPage(){return <Suspense fallback={<div className="grid min-h-screen place-items-center text-muted">Preparing demo…</div>}><DemoFlow/></Suspense>}
