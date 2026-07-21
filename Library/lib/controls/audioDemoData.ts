import type { AudioTrack } from "@/components/AudioPlayer";

/** Demo playlist for AudioPlayer docs / preview. */
export const demoAudioTracks: AudioTrack[] = [
  {
    id: "mirror-acoustic",
    src: "/media/demo-audio.mp3",
    title: "I Look in the Mirror",
    artist: "Acoustic Mix",
  },
  {
    id: "abysmal-3",
    src: "/media/demo-audio-abysmal.mp3",
    title: "Abysmal",
    artist: "neofuture",
    artworkSrc: "/media/demo-audio-abysmal-art.jpg",
  },
];
