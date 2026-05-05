import React from "react";
import VideoCall from "./_components/VideoCall";

export interface VideoCallProps {
  sessionId: string;
  token: string;
}

interface VideoCallPageProps {
  searchParams: Promise<VideoCallProps>;
}

const VideoCallPage = async ({ searchParams }: VideoCallPageProps) => {
  const { sessionId, token } = await searchParams;
  return <VideoCall sessionId={sessionId} token={token} />;
};

export default VideoCallPage;
