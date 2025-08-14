export default async function handler(req, res) {
  const {
    username = 'default',
    theme = 'github',
    style = 'minimal',
    width = 450,
    height = 140
  } = req.query;

  try {
    // Fetch status from your Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/manage_status`, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        p_action: 'get_current',
        p_username: username
      })
    });

    const result = await response.json();
    const statusData = result.success ? result.data : {};
    const userData = statusData.user || {};

    // Generate minimal SVG
    const svg = generateMinimalSVG({
      display_name: userData.display_name || username,
      avatar_url: userData.avatar_url || '',
      message: statusData.message || 'Available for work',
      website_url: userData.website_url,
      github_username: userData.github_username,
      linkedin_url: userData.linkedin_url,
      twitter_url: userData.twitter_url,
      width: parseInt(width),
      height: parseInt(height)
    });

    // Set headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.send(svg);

  } catch (error) {
    console.error('Badge Error:', error);
    const errorSvg = generateErrorSVG(username, parseInt(width), parseInt(height));
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(errorSvg);
  }
}

function generateMinimalSVG({ display_name, avatar_url, message, website_url, github_username, linkedin_url, twitter_url, width, height }) {

  // Build social icons array
  const socialIcons = [];

  if (github_username) {
    socialIcons.push({
      href: `https://github.com/${github_username}`,
      icon: `<path fill="#c9d1d9" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.385.6.113.793-.263.793-.582 0-.287-.01-1.045-.015-2.05-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.997.108-.776.418-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.933 0-1.31.47-2.38 1.236-3.22-.123-.303-.536-1.52.116-3.176 0 0 1.007-.322 3.3 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.657.24 2.874.117 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.628-5.475 5.922.43.372.814 1.103.814 2.222 0 1.606-.015 2.898-.015 3.292 0 .32.192.698.8.58C20.565 21.795 24 17.297 24 12c0-6.63-5.37-12-12-12z"/>`
    });
  }

  if (linkedin_url) {
    socialIcons.push({
      href: linkedin_url,
      icon: `<path fill="#0a66c2" d="M20.447 20.452h-3.554v-5.569c0-1.327-.025-3.042-1.854-3.042-1.854 0-2.137 1.446-2.137 2.941v5.67h-3.554V9h3.414v1.561h.048c.476-.9 1.637-1.848 3.37-1.848 3.602 0 4.268 2.368 4.268 5.452v6.287zM5.337 7.433a2.063 2.063 0 1 1 0-4.127 2.063 2.063 0 0 1 0 4.127zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771A1.766 1.766 0 0 0 0 1.764v20.473A1.766 1.766 0 0 0 1.771 24h20.451A1.766 1.766 0 0 0 24 22.236V1.764A1.766 1.766 0 0 0 22.225 0z"/>`
    });
  }

  if (twitter_url) {
    socialIcons.push({
      href: twitter_url,
      icon: `<path fill="#1da1f2" d="M23.954 4.569c-.885.39-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.951.555-2.005.959-3.127 1.184-.897-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.204-4.92 4.917 0 .39.045.765.127 1.124-4.09-.205-7.719-2.164-10.148-5.144-.424.724-.666 1.561-.666 2.457 0 1.69.86 3.179 2.17 4.05-.801-.026-1.555-.246-2.212-.616v.061c0 2.362 1.68 4.334 3.918 4.78-.41.11-.84.17-1.287.17-.315 0-.615-.03-.916-.086.631 1.952 2.445 3.376 4.604 3.416-1.68 1.317-3.809 2.103-6.102 2.103-.396 0-.79-.022-1.17-.067 2.199 1.394 4.768 2.209 7.557 2.209 9.054 0 14.002-7.496 14.002-13.986 0-.209 0-.423-.015-.633.962-.695 1.8-1.56 2.46-2.548l-.047-.02z"/>`
    });
  }

  if (website_url) {
    socialIcons.push({
      href: website_url,
      icon: `<circle fill="#58a6ff" cx="12" cy="12" r="10"/><path fill="#fff" d="M12 6.75a5.252 5.252 0 0 0-1.292 10.243v-1.02a4.221 4.221 0 0 1 2.308 0v1.02a5.247 5.247 0 0 0-1.016-10.222z"/>`
    });
  }

  // Generate social icons HTML
  const socialIconsHTML = socialIcons.map((icon, index) =>
    `<a href="${icon.href}" target="_blank">
            <svg x="${index * 35}" y="0" width="20" height="20" viewBox="0 0 24 24" class="social-icon">
                ${icon.icon}
            </svg>
        </a>`
  ).join('');

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>
        .background { fill: #0d1117; }
        .border { stroke: #30363d; stroke-width: 1; fill: none; }
        .text-primary { fill: #f0f6fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 600; }
        .message { fill: #7d8590; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; }
        .social-icon { transition: opacity 0.2s; }
        .social-icon:hover { opacity: 0.8; }
    </style>

    <!-- Background -->
    <rect width="${width}" height="${height}" class="background" rx="8" ry="8" />
    <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" class="border" rx="7.5" ry="7.5" />

    <!-- Avatar -->
    <defs>
        <clipPath id="avatarClip">
            <circle cx="45" cy="70" r="30" />
        </clipPath>
    </defs>
    ${avatar_url ?
      `<image x="15" y="40" width="60" height="60" href="${avatar_url}" clip-path="url(#avatarClip)" />` :
      `<circle cx="45" cy="70" r="30" fill="#21262d" stroke="#30363d" stroke-width="1" />
         <text x="45" y="78" fill="#7d8590" font-family="system-ui" font-size="24" text-anchor="middle">👨‍💻</text>`
    }

    <!-- Content -->
    <text x="90" y="60" class="text-primary">${display_name}</text>
    <text x="90" y="85" class="message">${message}</text>

    <!-- Social Icons -->
    <g transform="translate(90, 100)">
        ${socialIconsHTML}
    </g>
</svg>`;
}

function generateErrorSVG(username, width, height) {
  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#0d1117" stroke="#f85149" stroke-width="1" rx="8" ry="8" />
    <circle cx="45" cy="70" r="30" fill="#21262d" stroke="#f85149" stroke-width="2" />
    <text x="45" y="78" fill="#f85149" font-family="system-ui" font-size="20" text-anchor="middle">❌</text>
    <text x="90" y="60" fill="#f85149" font-family="system-ui" font-size="16" font-weight="600">@${username}</text>
    <text x="90" y="85" fill="#f85149" font-family="system-ui" font-size="14">Error loading status</text>
</svg>`;
}
