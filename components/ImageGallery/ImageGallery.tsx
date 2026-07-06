"use client";

import type { GalleryImage, ImageThumbnailSize } from "@/components/fields/types";
import { ImageThumbnail } from "@/components/ImageThumbnail";
import styles from "./ImageGallery.module.css";

type ImageGalleryProps = {
  columns?: 2 | 3 | 4;
  images: GalleryImage[];
  showCaptions?: boolean;
  thumbnailSize?: ImageThumbnailSize;
};

export function ImageGallery({
  columns = 4,
  images,
  showCaptions = true,
  thumbnailSize = "small",
}: ImageGalleryProps) {
  if (!images.length) {
    return (
      <div className={styles.empty} role="status">
        No gallery images available.
      </div>
    );
  }

  return (
    <div aria-label="Image gallery" className={styles.gallery} data-columns={columns}>
      {images.map((image) => (
        <ImageThumbnail
          ellipsisCaption
          image={image}
          key={image.id ?? image.src}
          openInLightbox
          showCaption={showCaptions}
          size={thumbnailSize}
        />
      ))}
    </div>
  );
}
