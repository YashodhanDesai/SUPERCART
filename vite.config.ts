import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

function getNormalizedSupabaseUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return 'https://itwmjfylusrllprnvexy.supabase.co';
  }
  const val = raw.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val;
  }
  if (val.includes('supabase.co')) {
    return `https://${val}`;
  }
  return `https://${val}.supabase.co`;
}

function oauthCallbackPlugin() {
  const callbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SuperCart - Authenticating...</title>
  <style>
    body {
      background-color: #121212;
      color: #ffffff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .box {
      text-align: center;
      padding: 2rem;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 1rem;
      max-width: 380px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(16, 185, 129, 0.2);
      border-top-color: #10b981;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h3 style="margin:0 0 0.5rem;font-size:1.1rem;font-weight:600;">Authenticating with Google</h3>
    <p style="margin:0;color:#9ca3af;font-size:0.875rem;">Completing sign in to SuperCart...</p>
  </div>
  <script>
    (function() {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const payload = {
        type: 'SUPABASE_OAUTH_SUCCESS',
        hash: hash,
        search: search,
        url: window.location.href
      };

      if (window.opener && window.opener !== window) {
        try {
          window.opener.postMessage(payload, '*');
        } catch (e) {}
        setTimeout(function() { window.close(); }, 600);
      } else {
        window.location.replace('/' + search + hash);
      }
    })();
  </script>
</body>
</html>`;

  return {
    name: 'supabase-oauth-callback',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0] || '';
        if (url === '/auth/callback' || url === '/auth/callback/') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(callbackHtml);
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), oauthCallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || 'AIzaSyBmg46MN6hX4aHA5nCvZH2kwgpVIl8v6Dg'),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBmg46MN6hX4aHA5nCvZH2kwgpVIl8v6Dg'),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(getNormalizedSupabaseUrl(process.env.VITE_SUPABASE_URL)),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Xa7miymjVJqi4Fql1042Kw_aaESWw8c')
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
