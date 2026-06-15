"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface LogoLinkProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  src?: string;
}

export default function LogoLink({ className = "h-16 w-auto object-contain", width = 320, height = 120, priority = false, src = "/logo-compact.png" }: LogoLinkProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:3001/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role === 'SELLER') {
          router.push("/dashboard/seller");
        } else {
          router.push("/dashboard/buyer");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      router.push("/");
    }
  };

  return (
    <a href="/" onClick={handleClick} className="inline-block cursor-pointer">
      <Image src={src} alt="Corpass Logo" width={width} height={height} className={className} priority={priority} />
    </a>
  );
}
