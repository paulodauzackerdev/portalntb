"use client";

import Image from "next/image";

import { API_URL } from "../../lib/constants";

interface HeaderBannerProps {
  imageUrl: string;
  alt: string | null;
  linkUrl: string | null;
}

export function HeaderBanner({ imageUrl, alt, linkUrl }: HeaderBannerProps) {
  const handleClick = () => {
    fetch(`${API_URL}/banner/click`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch(() => {});
  };

  return (
    <div className="hidden lg:flex items-center justify-end ml-4">
      {linkUrl ? (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          <Image
            src={imageUrl}
            alt={alt || "Anúncio"}
            width={728}
            height={90}
            className="max-w-full"
            style={{ maxHeight: "90px", objectFit: "contain" }}
          />
        </a>
      ) : (
        <Image
          src={imageUrl}
          alt={alt || "Anúncio"}
          width={728}
          height={90}
          className="max-w-full"
          style={{ maxHeight: "90px", objectFit: "contain" }}
          onClick={handleClick}
        />
      )}
    </div>
  );
}
