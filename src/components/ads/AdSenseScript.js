'use client';

import Script from 'next/script';

export default function AdSenseScript() {
  return (
    <Script
      id="adsbygoogle-init"
      strategy="lazyOnload"
      onLoad={() => {
        if (window.adsbygoogle) {
          window.adsbygoogle.pauseAdRequests = 1;
        }
      }}
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6030791027461493"
      crossOrigin="anonymous"
    />
  );
}
