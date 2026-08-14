"use client";

import dynamic from "next/dynamic";

const Factory3D = dynamic(() => import("./factory-3d"), {
  ssr: false,
  loading: () => <div className="factory3d-fallback"><span />Đang dựng xưởng 3D</div>,
});

export default function HeroFactory() {
  return <Factory3D mode="hero" />;
}
