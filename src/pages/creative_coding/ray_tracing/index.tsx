import Header from "@/components/header";
import { previewContainer, sketch } from "@/styles/creative_coding.module.css";
import {
  bodyMedium,
  headlineLarge,
  textContainer,
} from "@/styles/main.module.css";
import React, { Suspense, useEffect, useRef } from "react";

const Preview = React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/ray_tracing")).default
      : () => null;
  return {
    default: function Component() {
      const canvas = useRef<HTMLCanvasElement>(null);
      const exec = main();
      useEffect(() => {
        exec?.start(canvas.current!);
      }, []);
      useEffect(
        () => () => {
          exec?.stop();
        },
        [],
      );
      return (
        <div className={previewContainer}>
          <canvas
            width="500"
            height="500"
            className={sketch}
            ref={canvas}
          ></canvas>
        </div>
      );
    },
  };
});

export default function Body() {
  return (
    <>
      <article>
        <h1 className={headlineLarge}>Ray Tracing</h1>
        <Suspense>
          <Preview />
        </Suspense>
        <p className={`${textContainer} ${bodyMedium}`}>
          In 3D computer graphics, ray tracing is a technique for modeling light
          transport for use in a wide variety of rendering algorithms for
          generating digital images. On a spectrum of computational cost and
          visual fidelity, ray tracing-based rendering techniques, such as ray
          casting, recursive ray tracing, distribution ray tracing, photon
          mapping and path tracing, are generally slower and higher fidelity
          than scanline rendering methods. Thus, ray tracing was first deployed
          in applications where taking a relatively long time to render could be
          tolerated, such as still computer-generated images, and film and
          television visual effects (VFX), but was less suited to real-time
          applications such as video games, where speed is critical in rendering
          each frame. Ray tracing is capable of simulating a variety of optical
          effects, such as reflection, refraction, soft shadows, scattering,
          depth of field, motion blur, caustics, ambient occlusion and
          dispersion phenomena (such as chromatic aberration). It can also be
          used to trace the path of sound waves in a similar fashion to light
          waves, making it a viable option for more immersive sound design in
          video games by rendering realistic reverberation and echoes. In fact,
          any physical wave or particle phenomenon with approximately linear
          motion can be simulated with ray tracing.
        </p>
      </article>
    </>
  );
}

export function Head() {
  return (
    <>
      <Header title="Ray Tracing" />
    </>
  );
}
