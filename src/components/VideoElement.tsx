const VideoElement = (props: { url?: string; mimeType: string }) => {
  return props.url && props.mimeType.startsWith('video') ? (
    <video
      autoPlay
      loop
      muted
      playsInline
      tw="absolute left-0 top-0 w-full h-full object-cover z-10"
    >
      <source src={props.url} type={props.mimeType} />
    </video>
  ) : null;
};

export default VideoElement;
