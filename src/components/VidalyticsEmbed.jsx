import React, { useEffect } from "react";

const EMBED_ID = "vidalytics_embed_lLLji1kON0xvXRrF";
const LOADER_BASE =
  "https://fast.vidalytics.com/embeds/00G3LN3A/lLLji1kON0xvXRrF/";
const SCRIPT_ID = "vidalytics-loader-lLLji1kON0xvXRrF";

// Indlejret Vidalytics-video. Det officielle embed leveres som et rå
// <script>, som ikke kan ligge direkte i JSX — derfor kører vi loader-koden
// i en useEffect efter at embed-div'en er i DOM'en.
export default function VidalyticsEmbed() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.type = "text/javascript";
    s.text = `
(function (v, i, d, a, l, y, t, c, s) {
    y='_'+d.toLowerCase();c=d+'L';if(!v[d]){v[d]={};}if(!v[c]){v[c]={};}if(!v[y]){v[y]={};}var vl='Loader',vli=v[y][vl],vsl=v[c][vl + 'Script'],vlf=v[c][vl + 'Loaded'],ve='Embed';
    if (!vsl){vsl=function(u,cb){
        if(t){cb();return;}s=i.createElement("script");s.type="text/javascript";s.async=1;s.src=u;
        if(s.readyState){s.onreadystatechange=function(){if(s.readyState==="loaded"||s.readyState=="complete"){s.onreadystatechange=null;vlf=1;cb();}};}else{s.onload=function(){vlf=1;cb();};}
        i.getElementsByTagName("head")[0].appendChild(s);
    };}
    vsl(l+'loader.min.js',function(){if(!vli){var vlc=v[c][vl];vli=new vlc();}vli.loadScript(l+'player.min.js',function(){var vec=v[d][ve];t=new vec();t.run(a);});});
})(window, document, 'Vidalytics', '${EMBED_ID}', '${LOADER_BASE}');
`;
    document.body.appendChild(s);
  }, []);

  return (
    <div
      id={EMBED_ID}
      style={{ width: "100%", position: "relative", paddingTop: "56.25%" }}
    />
  );
}
