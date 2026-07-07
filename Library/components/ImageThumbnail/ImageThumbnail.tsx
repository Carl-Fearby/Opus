"use client";

/* eslint-disable @next/next/no-img-element */

import type { GalleryImage } from "@/components/fields/types";
import { Lightbox } from "@/components/Lightbox";
import styles from "./ImageThumbnail.module.css";

type ImageThumbnailProps = {
  ellipsisCaption?: boolean;
  image: GalleryImage;
  openInLightbox?: boolean;
  showCaption?: boolean;
  size?: "small" | "medium" | "large";
};

function ThumbnailImage({ decorative, image }: { decorative?: boolean; image: GalleryImage }) {
  return (
    <figure className={styles.figure}>
      <img alt={decorative ? "" : image.alt} className={styles.image} src={image.src} />
    </figure>
  );
}

export function ImageThumbnail({
  ellipsisCaption = false,
  image,
  openInLightbox = true,
  showCaption = true,
  size = "medium",
}: ImageThumbnailProps) {
  return (
    <div className={styles.thumbnail} data-clickable={openInLightbox} data-size={size}>
      {openInLightbox ? (
        <Lightbox
          image={image}
          showCaption={showCaption}
          trigger={<ThumbnailImage decorative image={image} />}
          triggerLabel={`Open ${image.caption ?? image.alt}`}
          triggerVariant="image"
        />
      ) : (
        <ThumbnailImage image={image} />
      )}
      {showCaption && image.caption ? (
        <p
          className={styles.caption}
          data-ellipsis={ellipsisCaption ? "true" : undefined}
          title={ellipsisCaption ? image.caption : undefined}
        >
          {image.caption}
        </p>
      ) : null}
    </div>
  );
}
