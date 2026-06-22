import { Composition } from "remotion";
import { ViralVideo } from "./ViralVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="ViralVideo"
      component={ViralVideo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};
