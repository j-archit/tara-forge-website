import Image from "next/image";

// The supplied mark stays external, undistorted and decorative inside named links.
export function Logo({ size = 200, className = "" }: { size?: number; className?: string }) {
  return <Image src="/brand/svg/taraforge3d-mark-gold-tight.svg" alt="" width={Math.max(16, Math.round(size * 156 / 190))} height={Math.max(20, size)} className={className} />;
}
