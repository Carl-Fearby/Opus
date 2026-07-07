"use client";

import type { ModelAsset, ModelThumbnailSize } from "@/components/fields/types";
import { ModelLightbox } from "@/components/ModelLightbox";
import { ModelViewer } from "@/components/ModelViewer";
import styles from "./ModelThumbnail.module.css";

type ModelThumbnailProps = {
  asset: ModelAsset;
  openInLightbox?: boolean;
  showCaption?: boolean;
  size?: ModelThumbnailSize;
};

function ThumbnailContent({
  asset,
  showCaption,
  size,
}: {
  asset: ModelAsset;
  showCaption: boolean;
  size: ModelThumbnailSize;
}) {
  return (
    <span className={styles.content} data-size={size}>
      <ModelViewer asset={asset} cameraControls={false} height="compact" showCaption={false} />
      {showCaption ? <span className={styles.caption}>{asset.name}</span> : null}
    </span>
  );
}

export function ModelThumbnail({
  asset,
  openInLightbox = true,
  showCaption = true,
  size = "medium",
}: ModelThumbnailProps) {
  const content = <ThumbnailContent asset={asset} showCaption={showCaption} size={size} />;

  if (openInLightbox) {
    return (
      <ModelLightbox
        asset={asset}
        trigger={content}
        triggerLabel={`Open ${asset.name}`}
      />
    );
  }

  return <div className={styles.staticThumbnail}>{content}</div>;
}
