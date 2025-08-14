export default async function handler(req, res) {
    const {
        username = 'default',
        theme = 'default',
        style = 'minimal',
        width = 400,
        height = 120
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

        // Generate SVG
        const svg = generateStatusSVG({
            username,
            status: statusData.status || 'offline',
            emoji: statusData.emoji || '💤',
            message: statusData.message || 'Not available',
            activity: statusData.activity || '',
            updated_at: statusData.updated_at,
            theme,
            style,
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

function generateStatusSVG({ username, status, emoji, message, activity, updated_at, theme, style, width, height }) {
    const themes = getThemes();
    const currentTheme = themes[theme] || themes.default;
    const displayText = activity || message || status;
    const timeAgo = updated_at ? getTimeAgo(updated_at) : '';
    const statusColor = getStatusColor(status);

    if (style === 'card') {
        return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${currentTheme.background};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${currentTheme.backgroundSecondary};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.15"/>
          </filter>
        </defs>
        
        <rect width="${width}" height="${height}" rx="16" fill="url(#bg)" filter="url(#shadow)"/>
        
        <!-- Header -->
        <rect width="${width}" height="40" rx="16" fill="${currentTheme.headerBg}" opacity="0.5"/>
        
        <!-- Avatar -->
        <circle cx="30" cy="20" r="12" fill="${currentTheme.avatarBg}" stroke="${statusColor}" stroke-width="2"/>
        <text x="30" y="26" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="14" text-anchor="middle">👤</text>
        
        <!-- Username -->
        <text x="50" y="18" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="16" font-weight="700">${username}</text>
        <text x="50" y="32" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="11">Developer</text>
        
        <!-- Status -->
        <circle cx="35" cy="70" r="8" fill="${statusColor}">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        
        <text x="55" y="68" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="18">${emoji}</text>
        <text x="80" y="68" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="14" font-weight="500">${status.charAt(0).toUpperCase() + status.slice(1)}</text>
        <text x="55" y="85" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12">${displayText}</text>
        
        ${timeAgo ? `<text x="55" y="98" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="10">${timeAgo}</text>` : ''}
        
        <rect width="${width}" height="${height}" rx="16" fill="none" stroke="${currentTheme.border}" stroke-width="1"/>
      </svg>
    `;
    }

    // Default minimal style
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${currentTheme.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${currentTheme.backgroundSecondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="${width}" height="${height}" rx="12" fill="url(#bg)"/>
      
      <circle cx="20" cy="30" r="6" fill="${statusColor}">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <text x="35" y="25" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="14" font-weight="600">@${username}</text>
      <text x="35" y="45" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12">${emoji} ${displayText}</text>
      
      ${timeAgo ? `<text x="35" y="65" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="10">${timeAgo}</text>` : ''}
      
      <rect width="${width}" height="${height}" rx="12" fill="none" stroke="${currentTheme.border}" stroke-width="1"/>
    </svg>
  `;
}

function generateErrorSVG(username, width, height) {
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="12" fill="#ff4444" opacity="0.1"/>
      <circle cx="30" cy="30" r="6" fill="#ff4444"/>
      <text x="45" y="25" fill="#ff4444" font-family="system-ui, sans-serif" font-size="14" font-weight="600">@${username}</text>
      <text x="45" y="45" fill="#ff4444" font-family="system-ui, sans-serif" font-size="12">❌ Error loading status</text>
      <rect width="${width}" height="${height}" rx="12" fill="none" stroke="#ff4444" stroke-width="1"/>
    </svg>
  `;
}

function getStatusColor(status) {
    const colors = {
        'online': '#00d26a',
        'focusing': '#ff8c42',
        'in a meeting': '#ff4757',
        'away': '#ffa726',
        'offline': '#747d8c'
    };
    return colors[status] || colors.offline;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'A while ago';
}

function getThemes() {
    return {
        default: {
            background: '#ffffff',
            backgroundSecondary: '#f8fafc',
            headerBg: '#f1f5f9',
            avatarBg: '#e2e8f0',
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            textTertiary: '#94a3b8',
            border: '#e2e8f0'
        },
        dark: {
            background: '#0f172a',
            backgroundSecondary: '#1e293b',
            headerBg: '#334155',
            avatarBg: '#334155',
            textPrimary: '#f8fafc',
            textSecondary: '#cbd5e1',
            textTertiary: '#94a3b8',
            border: '#334155'
        },
        github: {
            background: '#0d1117',
            backgroundSecondary: '#161b22',
            headerBg: '#21262d',
            avatarBg: '#21262d',
            textPrimary: '#c9d1d9',
            textSecondary: '#8b949e',
            textTertiary: '#6e7681',
            border: '#30363d'
        }
    };
}
