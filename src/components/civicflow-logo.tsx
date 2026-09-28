import Link from "next/link";
import Image from "next/image";

export function CivicFlowLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} aria-label="CivicFlow AI home" className="inline-flex shrink-0 items-center gap-2.5">
      <Image src="/logo.svg" alt="" aria-hidden="true" width={36} height={36} priority className={compact ? "size-8" : "size-9"} />
      {!compact && <span className="text-sm font-semibold tracking-[-.02em] sm:text-base">CivicFlow <span className="text-brand">AI</span></span>}
    </Link>
  );
}
