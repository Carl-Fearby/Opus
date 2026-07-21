import type { VideoTrack } from "@/components/VideoPlayer";

/** Demo playlist for VideoPlayer docs / preview. */
export const demoVideoTracks: VideoTrack[] = [
  {
    id: "mirror-acoustic",
    src: "/media/demo-video.mp4",
    title: "I Look in the Mirror",
    previewTime: 10,
  },
  {
    id: "into-the-abyss",
    src: "/media/demo-video-abyss.mp4",
    title: "Into the Abyss",
    previewTime: 8,
  },
];
