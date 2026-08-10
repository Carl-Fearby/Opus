import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PersistentVideoPlayer,
  PersistentVideoPlayerProvider,
} from "@/components/VideoPlayer";

const tracks = [{ id: "demo", src: "/media/demo-video.mp4", title: "Demo video" }];

function Harness({
  onPlayingChange,
  showPlayer,
}: {
  onPlayingChange?: (playing: boolean) => void;
  showPlayer: boolean;
}) {
  return (
    <PersistentVideoPlayerProvider>
      {showPlayer
        ? <PersistentVideoPlayer tracks={tracks} onPlayingChange={onPlayingChange} />
        : <p>Another route</p>}
    </PersistentVideoPlayerProvider>
  );
}

describe("PersistentVideoPlayer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps the same playing media element mounted as its route anchor disappears", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 450,
      height: 360,
      left: 40,
      right: 680,
      top: 90,
      width: 640,
      x: 40,
      y: 90,
      toJSON: () => ({}),
    });

    const onPlayingChange = vi.fn();
    const { container, rerender } = render(
      <Harness showPlayer onPlayingChange={onPlayingChange} />,
    );
    const originalVideo = container.querySelector("video:not([aria-hidden='true'])");
    expect(originalVideo).toBeInstanceOf(HTMLVideoElement);
    expect(screen.getByRole("complementary", { name: "Persistent video player" }))
      .toHaveAttribute("data-mini", "false");

    fireEvent.play(originalVideo as HTMLVideoElement);
    await waitFor(() => expect(onPlayingChange).toHaveBeenCalledWith(true));
    rerender(<Harness showPlayer={false} onPlayingChange={onPlayingChange} />);

    const miniPlayer = await screen.findByRole("complementary", {
      name: "Persistent video player",
    });
    expect(miniPlayer).toHaveAttribute("data-mini", "true");
    expect(container.querySelector("video:not([aria-hidden='true'])")).toBe(originalVideo);

    fireEvent.click(screen.getByRole("button", { name: "Close mini player" }));
    await waitFor(() => {
      expect(screen.queryByRole("complementary", { name: "Persistent video player" }))
        .not.toBeInTheDocument();
    });
  });
});
