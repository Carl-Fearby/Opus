"use client";

import type { ModelAsset, ModelThumbnailSize } from "@/components/fields/types";
import { ModelThumbnail } from "@/components/ModelThumbnail";
import styles from "./ModelGallery.module.css";

type ModelGalleryProps = {
  assets: ModelAsset[];
  columns?: 2 | 3 | 4;
  showCaptions?: boolean;
  thumbnailSize?: ModelThumbnailSize;
};

export function ModelGallery({
  assets,
  columns = 4,
  showCaptions = true,
  thumbnailSize = "small",
}: ModelGalleryProps) {
  if (!assets.length) {
    return (
      <div className={styles.empty} role="status">
        No 3D assets available.
      </div>
    );
  }

  return (
    <div aria-label="3D asset gallery" className={styles.gallery} data-columns={columns}>
      {assets.map((asset) => (
        <ModelThumbnail
          asset={asset}
          key={asset.id ?? asset.src}
          openInLightbox
          showCaption={showCaptions}
          size={thumbnailSize}
        />
      ))}
    </div>
  );
}
