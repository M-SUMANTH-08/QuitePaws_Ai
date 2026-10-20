(function(){
  const banner=document.getElementById('cookieBanner');
  if(!banner)return;
  const key='quietpaws-analytics-consent';
  const loadAnalytics=()=>{
    if(window.__quietPawsAnalyticsLoaded)return;
    window.__quietPawsAnalyticsLoaded=true;
    const s=document.createElement('script');
    s.defer=true;
    s.src='/_vercel/insights/script.js';
    s.onerror=()=>{ window.__quietPawsAnalyticsLoaded=false; };
    document.head.appendChild(s);
  };
  const stored=localStorage.getItem(key);
  if(stored==='accepted') loadAnalytics();
  else if(stored==='rejected') banner.hidden=true;
  document.getElementById('cookieAccept').addEventListener('click',()=>{
    localStorage.setItem(key,'accepted'); banner.hidden=true; loadAnalytics();
  });
  document.getElementById('cookieReject').addEventListener('click',()=>{
    localStorage.setItem(key,'rejected'); banner.hidden=true;
  });
})();
