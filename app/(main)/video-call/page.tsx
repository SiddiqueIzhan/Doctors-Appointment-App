import React from "react";
import VideoCall from "./_components/VideoCall";
import { VideoCallPageProps } from "@/utils/types";

const VideoCallPage = async ({ searchParams }: VideoCallPageProps) => {
  const { sessionId, token } = await searchParams;
  return <VideoCall sessionId={sessionId} token={token} />;
};

export default VideoCallPage;
