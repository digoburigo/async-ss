"use client"

import dynamic from "next/dynamic"

const YouTube = dynamic(() => import("react-youtube"), { ssr: false })

interface YouTubePlayerProps {
  videoId: string
}

export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  return (
    <YouTube
      videoId={videoId}
      opts={{
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
        },
      }}
      className="w-full h-full"
      iframeClassName="w-full h-full"
    />
  )
}
