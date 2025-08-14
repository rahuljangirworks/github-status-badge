export default async function handler(req, res) {
  const {
    username = 'default',
    theme = 'github',
    style = 'modern',
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

    // Generate SVG with rich data
    const svg = generateStatusSVG({
      username,
      status: statusData.status || 'offline',
      emoji: statusData.emoji || '💤',
      message: statusData.message || 'Not available',
      activity: statusData.activity || '',
      updated_at: statusData.updated_at,
      user: userData,
      focus_level: statusData.focus_level,
      mood_level: statusData.mood_level,
      energy_level: statusData.energy_level,
      location: `${userData.city || ''}, ${userData.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
      duration_minutes: statusData.status_duration_minutes,
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

function generateStatusSVG({ username, status, emoji, message, activity, updated_at, user, focus_level, mood_level, energy_level, location, duration_minutes, theme, style, width, height }) {
  const themes = getThemes();
  const currentTheme = themes[theme] || themes.github;
  const displayText = activity || message || status;
  const timeAgo = updated_at ? getTimeAgo(updated_at) : '';
  const statusColor = getStatusColor(status);
  const displayName = user.display_name || user.full_name || username;
  const title = user.title || 'Developer';
  const company = user.current_company || user.company;

  // Calculate local time
  const localTime = getLocalTime(user.timezone);

  if (style === 'modern' || style === 'github') {
    return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${currentTheme.background};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${currentTheme.backgroundSecondary};stop-opacity:1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <clipPath id="avatar">
                        <circle cx="30" cy="35" r="16"/>
                    </clipPath>
                </defs>
                
                <!-- Main Background -->
                <rect width="${width}" height="${height}" rx="12" fill="url(#bg)" stroke="${currentTheme.border}" stroke-width="1"/>
                
                <!-- Status Bar (Left Edge) -->
                <rect x="0" y="0" width="4" height="${height}" rx="2" fill="${statusColor}" filter="url(#glow)"/>
                
                <!-- Header Section -->
                <rect x="8" y="8" width="${width - 16}" height="54" rx="8" fill="${currentTheme.headerBg}" opacity="0.4"/>
                
                <!-- Avatar -->
                <circle cx="30" cy="35" r="16" fill="${currentTheme.avatarBg}" stroke="${statusColor}" stroke-width="2"/>
                ${user.avatar_url ?
        `<image x="14" y="19" width="32" height="32" href="${user.avatar_url}" clip-path="url(#avatar)"/>` :
        `<text x="30" y="41" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="16" text-anchor="middle">👨‍💻</text>`
      }
                
                <!-- Status Indicator -->
                <circle cx="42" cy="47" r="6" fill="${statusColor}">
                    <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite"/>
                </circle>
                
                <!-- User Info -->
                <text x="55" y="30" fill="${currentTheme.textPrimary}" font-family="'SF Pro Display', system-ui, sans-serif" font-size="16" font-weight="600">
                    ${displayName}
                </text>
                <text x="55" y="45" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12">
                    ${title}${company ? ` at ${company}` : ''}
                </text>
                
                <!-- Location & Time -->
                ${location || localTime ? `
                    <text x="55" y="58" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="10">
                        ${location ? `📍 ${location}` : ''}${location && localTime ? ' • ' : ''}${localTime ? `🕐 ${localTime}` : ''}
                    </text>
                ` : ''}
                
                <!-- Status Section -->
                <rect x="15" y="70" width="${width - 30}" height="45" rx="8" fill="${currentTheme.statusBg}" opacity="0.3"/>
                
                <!-- Status Content -->
                <text x="25" y="88" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="20">
                    ${emoji}
                </text>
                <text x="50" y="88" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="14" font-weight="500">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </text>
                
                <!-- Status Message -->
                <text x="25" y="105" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12" textLength="${Math.min(displayText.length * 7, width - 50)}" lengthAdjust="spacingAndGlyphs">
                    ${displayText}
                </text>
                
                <!-- Bottom Info Bar -->
                <g transform="translate(15, 120)">
                    <!-- Time Ago -->
                    ${timeAgo ? `
                        <text x="0" y="12" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="9">
                            🕒 ${timeAgo}
                        </text>
                    ` : ''}
                    
                    <!-- Duration -->
                    ${duration_minutes ? `
                        <text x="80" y="12" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="9">
                            ⏱️ ${Math.round(duration_minutes)}m
                        </text>
                    ` : ''}
                    
                    <!-- Levels -->
                    ${focus_level || mood_level || energy_level ? `
                        <g transform="translate(${width - 120}, 0)">
                            ${focus_level ? `<text x="0" y="12" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="9">🎯${focus_level}</text>` : ''}
                            ${mood_level ? `<text x="25" y="12" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="9">😊${mood_level}</text>` : ''}
                            ${energy_level ? `<text x="50" y="12" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="9">⚡${energy_level}</text>` : ''}
                        </g>
                    ` : ''}
                </g>
                
                <!-- GitHub-style contribution graph inspired pattern (subtle) -->
                <g opacity="0.1">
                    ${Array.from({ length: 8 }, (_, i) =>
        `<rect x="${width - 25}" y="${10 + i * 3}" width="2" height="2" rx="1" fill="${statusColor}"/>`
      ).join('')}
                </g>
            </svg>
        `;
  }

  // Card style - Enhanced
  if (style === 'card') {
    return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${currentTheme.background};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${currentTheme.backgroundSecondary};stop-opacity:1" />
                    </linearGradient>
                    <filter id="shadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="12" flood-opacity="0.15"/>
                    </filter>
                </defs>
                
                <rect width="${width}" height="${height}" rx="16" fill="url(#cardBg)" filter="url(#shadow)" stroke="${currentTheme.border}" stroke-width="1"/>
                
                <!-- Header with gradient -->
                <rect width="${width}" height="50" rx="16" fill="${statusColor}" opacity="0.1"/>
                
                <!-- Avatar with status ring -->
                <circle cx="35" cy="35" r="18" fill="${currentTheme.avatarBg}" stroke="${statusColor}" stroke-width="3"/>
                ${user.avatar_url ?
        `<image x="17" y="17" width="36" height="36" href="${user.avatar_url}" clip-path="url(#avatar)"/>` :
        `<text x="35" y="42" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">👨‍💻</text>`
      }
                
                <!-- User details -->
                <text x="65" y="25" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="18" font-weight="700">
                    ${displayName}
                </text>
                <text x="65" y="40" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12">
                    ${title}${company ? ` • ${company}` : ''}
                </text>
                <text x="65" y="52" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="10">
                    ${location || 'Remote'}${localTime ? ` • ${localTime}` : ''}
                </text>
                
                <!-- Status section -->
                <rect x="20" y="65" width="${width - 40}" height="50" rx="10" fill="${currentTheme.statusBg}" opacity="0.4"/>
                
                <text x="35" y="85" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="24">
                    ${emoji}
                </text>
                <text x="65" y="82" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="16" font-weight="600">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </text>
                <text x="35" y="100" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12">
                    ${displayText}
                </text>
                <text x="35" y="112" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="9">
                    ${timeAgo}${duration_minutes ? ` • Active for ${Math.round(duration_minutes)}m` : ''}
                </text>
            </svg>
        `;
  }

  // Minimal style - Clean and simple
  return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="minimalBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${currentTheme.background};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${currentTheme.backgroundSecondary};stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <rect width="${width}" height="${height}" rx="12" fill="url(#minimalBg)" stroke="${currentTheme.border}" stroke-width="1"/>
            
            <circle cx="25" cy="30" r="8" fill="${statusColor}">
                <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            
            <text x="45" y="25" fill="${currentTheme.textPrimary}" font-family="system-ui, sans-serif" font-size="14" font-weight="600">
                ${displayName}
            </text>
            <text x="45" y="40" fill="${currentTheme.textSecondary}" font-family="system-ui, sans-serif" font-size="12">
                ${emoji} ${displayText}
            </text>
            <text x="45" y="55" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="10">
                ${location ? `📍 ${location}` : ''}${timeAgo ? ` • ${timeAgo}` : ''}
            </text>
        </svg>
    `;
}

function getLocalTime(timezone) {
  if (!timezone) return null;
  try {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return null;
  }
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
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return 'A while ago';
}

function getThemes() {
  return {
    github: {
      background: '#0d1117',
      backgroundSecondary: '#161b22',
      headerBg: '#21262d',
      statusBg: '#30363d',
      avatarBg: '#21262d',
      textPrimary: '#f0f6fc',
      textSecondary: '#7d8590',
      textTertiary: '#656d76',
      border: '#30363d'
    },
    dark: {
      background: '#1a1a1a',
      backgroundSecondary: '#2d2d2d',
      headerBg: '#3a3a3a',
      statusBg: '#404040',
      avatarBg: '#2d2d2d',
      textPrimary: '#ffffff',
      textSecondary: '#b3b3b3',
      textTertiary: '#808080',
      border: '#404040'
    },
    light: {
      background: '#ffffff',
      backgroundSecondary: '#f6f8fa',
      headerBg: '#f1f3f4',
      statusBg: '#e1e4e8',
      avatarBg: '#f1f3f4',
      textPrimary: '#24292f',
      textSecondary: '#656d76',
      textTertiary: '#7d8590',
      border: '#d0d7de'
    },
    default: {
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      headerBg: '#f1f5f9',
      statusBg: '#e2e8f0',
      avatarBg: '#e2e8f0',
      textPrimary: '#1e293b',
      textSecondary: '#64748b',
      textTertiary: '#94a3b8',
      border: '#e2e8f0'
    }
  };
}

function generateErrorSVG(username, width, height) {
  return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="${width}" height="${height}" rx="12" fill="#0d1117" stroke="#f85149" stroke-width="1"/>
            <circle cx="30" cy="35" r="8" fill="#f85149"/>
            <text x="50" y="30" fill="#f85149" font-family="system-ui, sans-serif" font-size="14" font-weight="600">@${username}</text>
            <text x="50" y="45" fill="#f85149" font-family="system-ui, sans-serif" font-size="12">❌ Error loading status</text>
            <text x="50" y="60" fill="#7d8590" font-family="system-ui, sans-serif" font-size="10">Check your configuration</text>
        </svg>
    `;
}
