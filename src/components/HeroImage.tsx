'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface HeroImageProps {
  src: string;
  alt: string;
}

export const HeroImage: React.FC<HeroImageProps> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <Image
      alt={alt}
      className="object-cover object-center opacity-45"
      src={src}
      fill
      sizes="100vw"
      priority
      onError={() => setHasError(true)}
    />
  );
};
