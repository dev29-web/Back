import React, { useState } from "react";

const _Image = React.memo(({ logo, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <img
        src={`https://logo.clearbit.com/${logo}`}
        alt={alt}
        onLoad={() => setLoaded(true)}
      />
      {/* {loaded ? (
        <img
          src={`https://logo.clearbit.com/${logo}`}
          alt={alt}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="image__loading"></div>
      )} */}
    </>
  );
});
export default _Image;
