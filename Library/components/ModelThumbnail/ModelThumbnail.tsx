"use client";

import type { ModelAsset, ModelThumbnailSize } from "@/components/fields/types";
import { ModelLightbox } from "@/components/ModelLightbox";
import { ModelViewer } from "@/components/ModelViewer";
import styles from "./ModelThumbnail.module.css";

type ModelThumbnailProps = {
  asset: ModelAsset;
  fill?: boolean;
  openInLightbox?: boolean;
  showCaption?: boolean;
  size?: ModelThumbnailSize;
};

function ThumbnailContent({
  asset,
  fill,
  showCaption,
  size,
}: {
  asset: ModelAsset;
  fill: boolean;
  showCaption: boolean;
  size: ModelThumbnailSize;
}) {
  return (
    <span className={styles.content} data-fill={fill ? "true" : undefined} data-size={size}>
      <ModelViewer asset={asset} cameraControls={false} height="compact" showCaption={false} />
      {showCaption ? <span className={styles.caption}>{asset.name}</span> : null}
    </span>
  );
}

export function ModelThumbnail({
  asset,
  fill = false,
  openInLightbox = true,
  showCaption = true,
  size = "medium",
}: ModelThumbnailProps) {
  const content = (
    <ThumbnailContent asset={asset} fill={fill} showCaption={showCaption} size={size} />
  );

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
