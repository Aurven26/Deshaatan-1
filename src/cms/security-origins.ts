/** Only configured origins are trusted; never derive trust from a request Host header. */
const isVercelDeployment=()=>process.env.VERCEL==='1' || Boolean(process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL);
const isLoopback=(hostname:string)=>['localhost','127.0.0.1','::1','[::1]'].includes(hostname.toLowerCase()) || hostname.toLowerCase().endsWith('.localhost');

function validateOrigin(value:string){
  const url=new URL(value.trim());
  if(!['http:','https:'].includes(url.protocol) || url.username || url.password || url.pathname!=='/' || url.search || url.hash) throw new Error('Configure valid ALLOWED_ORIGINS.');
  return url;
}

function vercelOrigin(hostname:string|undefined){
  if(!hostname)return undefined;
  const url=new URL(`https://${hostname}`);
  if(url.protocol!=='https:' || url.username || url.password || url.pathname!=='/' || url.search || url.hash) throw new Error('Vercel provided an invalid deployment hostname.');
  return url.origin;
}

export function allowedOrigins(): string[] {
  const onVercel=isVercelDeployment();
  const configured=(process.env.ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_SERVER_URL || (onVercel?'https://deshaatan-1.vercel.app':'http://127.0.0.1:3000')).split(',');
  const origins=configured.map(value=>validateOrigin(value)).filter(url=>!(onVercel && isLoopback(url.hostname))).map(url=>url.origin);
  if(onVercel){
    const production=vercelOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL || (process.env.VERCEL_ENV==='production'?'deshaatan-1.vercel.app':undefined));
    const deployment=vercelOrigin(process.env.VERCEL_URL);
    if(production)origins.push(production);
    if(deployment)origins.push(deployment);
  }
  return [...new Set(origins)];
}

export function getServerURL():string{
  const onVercel=isVercelDeployment();
  const configured=process.env.NEXT_PUBLIC_SERVER_URL;
  if(configured){
    const url=new URL(configured);
    if(!(onVercel && isLoopback(url.hostname)))return configured.replace(/\/+$/,'');
  }
  if(onVercel){
    const hostname=process.env.VERCEL_ENV==='production'
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL || 'deshaatan-1.vercel.app'
      : process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'deshaatan-1.vercel.app';
    return `https://${hostname}`;
  }
  return 'http://127.0.0.1:3000';
}
