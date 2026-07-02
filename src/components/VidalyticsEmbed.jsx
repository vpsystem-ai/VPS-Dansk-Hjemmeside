import React, { useEffect } from "react";

const EMBED_ID = "vidalytics_embed_lLLji1kON0xvXRrF";
const LOADER_BASE =
  "https://fast.vidalytics.com/embeds/00G3LN3A/lLLji1kON0xvXRrF/";

// Modul-niveau: sikrer at vendor-loaderen kun injiceres én gang på tværs af
// mounts (ellers kører embedden flere gange og videoen fordobles/overlapper).
let loaderInjected = false;

// Indlejret Vidalytics-video.
// - Første load: vendor-loaderen injiceres én gang og kører selv embedden.
// - Ved SPA-navigation (remount) findes loaderen allerede, så vi kører
//   embedden én gang mere ind i den nye (tomme) div, så videoen altid vises.
export default function VidalyticsEmbed() {
  useEffect(() => {
    // Remount: loaderen findes allerede → kør embedden én gang for den nye div
    if (window.Vidalytics && window.Vidalytics.Embed) {
      try {
        const el = document.getElementById(EMBED_ID);
        if (el) el.innerHTML = ""; // ryd evt. gammelt indhold, så den ikke fordobles
        new window.Vidalytics.Embed().run(EMBED_ID);
      } catch {
        /* ignore */
      }
      return;
    }

    // Første load: injicér vendor-loaderen (kun én gang). Den kører selv
    // embedden, når loader + player er hentet – vi kalder IKKE run() her,
    // så videoen ikke indlæses to gange.
    if (loaderInjected) return;
    loaderInjected = true;

    const s = document.createElement("script");
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
