import React, { useEffect } from "react";

export default React.lazy(async () => {
  const main =
    typeof window !== "undefined"
      ? (await import("@/script/creative_coding/dtmf")).default
      : () => null;
  return {
    default: function Component() {
      const exec = main();
      useEffect(() => {
        exec?.start();
      }, []);
      useEffect(
        () => () => {
          exec?.stop();
        },
        [],
      );
      return <></>;
    },
  };
});
