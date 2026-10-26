import { Config } from "@remotion/cli/config";

// H.264 MP4 with an AAC track, even while the music is a silent placeholder (spec: Sizes, M.5).
// yuv420p in BT.709 plays the same everywhere, LinkedIn's and GitHub's players included.
Config.setCodec("h264");
Config.setEnforceAudioTrack(true);
Config.setVideoImageFormat("jpeg");
Config.setPixelFormat("yuv420p");
Config.setColorSpace("bt709");
// 128 kb/s is plenty for the music, and keeps the README cut nearer GitHub's 10 MB limit.
Config.setAudioBitrate("128k");
