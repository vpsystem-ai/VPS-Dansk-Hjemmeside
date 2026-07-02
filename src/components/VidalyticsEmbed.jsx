import React, { useEffect } from "react";

const EMBED_ID = "vidalytics_embed_lLLji1kON0xvXRrF";
const LOADER_BASE =
  "https://fast.vidalytics.com/embeds/00G3LN3A/lLLji1kON0xvXRrF/";

// Indlejret Vidalytics-video. Det officielle embed leveres som et rå <script>.
// Ved SPA-navigation (skift af side) mountes komponenten på ny med en tom
// video-div, så vi skal (gen)køre embedden hver gang – ellers står videoen tom
// efter man har skiftet side/menu. Selve loaderen hentes dog kun første gang.
export default function VidalyticsEmbed() {
  useEffect(() => {
    let cancelled = false;

    // Kør embedden for den aktuelle div (bruges både ved første load og remount)
    const runEmbed = () => {
      try {
        if (window.Vidalytics && window.Vidalytics.Embed) {
          new window.Vidalytics.Embed().run(EMBED_ID);
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    };

    // Er loaderen allerede hentet (fx efter navigation), så kør bare igen
    if (runEmbed()) return;

    // Ellers: hent Vidalytics-loaderen (kun nødvendigt første gang)
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

    // Fallback: hvis loaderen først bliver klar lidt efter, så prøv at køre
    // embedden et par gange (dækker hurtige frem-og-tilbage-navigationer).
    let tries = 0;
    const iv = setInterval(() => {
      if (cancelled || tries++ > 20) {
        clearInterval(iv);
        return;
      }
      if (runEmbed()) clearInterval(iv);
    }, 250);

    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  return (
    <div
      id={EMBED_ID}
      style={{ width: "100%", position: "relative", paddingTop: "56.25%" }}
    />
  );
}
