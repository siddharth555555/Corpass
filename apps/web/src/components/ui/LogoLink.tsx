"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LogoLinkProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  src?: string;
}

export default function LogoLink({ className = "w-48 sm:w-64 h-auto object-contain", width = 1536, height = 1024, priority = false, src = "/logo-compact.png" }: LogoLinkProps) {
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
    <Link href="/" onClick={handleClick} className={`block cursor-pointer mx-auto flex items-center ${className}`}>
      <img src={src} alt="Corpass Logo" className="w-full h-auto object-contain block mx-auto scale-125 sm:scale-150" />
    </Link>
  );
}
