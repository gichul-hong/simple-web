import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * Initializes the custom CA certificate for the Node.js process.
 * This is useful when running in environments with private CAs (e.g., corporate proxies)
 * where NODE_EXTRA_CA_CERTS might not be picked up correctly by all libraries (like undici/fetch).
 */
export function initCustomCA() {
  if (process.env.NEXT_PUBLIC_CA_LOADED === 'true') return;

  try {
    // 1. Check for specific file in public/ (User's convention)
    const publicCertPath = path.join(process.cwd(), 'public', 'root-ca.crt');
    
    // 2. Check environment variable
    const envCertPath = process.env.NODE_EXTRA_CA_CERTS 
      ? path.resolve(process.cwd(), process.env.NODE_EXTRA_CA_CERTS) 
      : null;

    let certPathToLoad: string | null = null;

    if (fs.existsSync(publicCertPath)) {
        certPathToLoad = publicCertPath;
    } else if (envCertPath && fs.existsSync(envCertPath)) {
        certPathToLoad = envCertPath;
    }

    if (certPathToLoad) {
      const ca = fs.readFileSync(certPathToLoad);
      
      // Extend https.globalAgent
      const existingCa = https.globalAgent.options.ca;
      let caArr: (string | Buffer)[] = [];
      
      if (existingCa) {
          if (Array.isArray(existingCa)) {
              caArr = [...existingCa] as (string | Buffer)[];
          } else {
              caArr = [existingCa] as (string | Buffer)[];
          }
      }
      
      caArr.push(ca);
      https.globalAgent.options.ca = caArr;
      
      console.log(`[CustomCA] Successfully loaded CA certificate from: ${certPathToLoad}`);
      process.env.NEXT_PUBLIC_CA_LOADED = 'true';
    } else {
       // Only log if we expected something but didn't find it
       if (process.env.NODE_EXTRA_CA_CERTS) {
           console.warn(`[CustomCA] Warning: NODE_EXTRA_CA_CERTS is set to '${process.env.NODE_EXTRA_CA_CERTS}' but file not found.`);
       }
    }
  } catch (err) {
    console.error('[CustomCA] Failed to load custom CA:', err);
  }
}
