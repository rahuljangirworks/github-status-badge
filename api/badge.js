export default async function handler(req, res) {
  const {
    username = 'default',
    theme = 'github',
    style = 'minimal',
    width = 450,
    height = 120,
    bg = 'default'
  } = req.query;

  const transparent = bg === 'transparent';

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

    // Generate enhanced minimal SVG
    const svg = generateStatusSVG({
      status: statusData.status || 'offline',
      emoji: statusData.emoji || '💤',
      message: statusData.message || 'Available for work',
      activity: statusData.activity || '',
      updated_at: statusData.updated_at,
      user: userData,
      location: `${userData.city || ''}, ${userData.country || ''}`.replace(/^,\s*|,\s*$/g, ''),
      duration_minutes: statusData.status_duration_minutes,
      theme,
      style,
      width: parseInt(width),
      height: parseInt(height),
      transparent
    });

    // Set headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.send(svg);

  } catch (error) {
    console.error('Badge Error:', error);
    const errorSvg = generateErrorSVG(parseInt(width), parseInt(height), transparent);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(errorSvg);
  }
}

function generateStatusSVG({ status, emoji, message, activity, updated_at, user, location, duration_minutes, theme, style, width, height, transparent }) {
  const themes = getThemes();
  const currentTheme = themes[theme] || themes.github;
  const displayText = activity || message || status;
  const timeAgo = updated_at ? getTimeAgo(updated_at) : '';
  const statusColor = getStatusColor(status);

  // Enhanced realistic data
  const localTime = getLocalTime(user.timezone);
  const skillsCount = user.skills ? user.skills.length : 0;
  const experience = user.years_experience || 'N/A';
  const currentWork = activity || message || 'Working on projects';

  // Build info array with all stats separated by •
  const infoItems = [
    location || 'Remote Developer',
    localTime ? `${localTime} local` : null,
    timeAgo,
    duration_minutes ? `Active ${Math.round(duration_minutes)}m` : null,
    skillsCount > 0 ? `${skillsCount}+ skills` : null,
    experience !== 'N/A' ? `${experience}y exp` : null
  ].filter(Boolean);

  // Minimal, professional, responsive design
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="minimalBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${currentTheme.background};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${currentTheme.backgroundSecondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background (conditional) -->
      ${transparent ? '' : `<rect width="${width}" height="${height}" rx="12" fill="url(#minimalBg)" stroke="${currentTheme.border}" stroke-width="1"/>`}
      
      <!-- Status pulse (no left edge bar) -->
      <circle cx="25" cy="${Math.min(height / 2, 35)}" r="6" fill="${statusColor}">
        <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      
      <!-- Main status content -->
      <text x="40" y="${Math.min(height / 2 - 5, 30)}" fill="${currentTheme.textPrimary}" font-family="'SF Pro Display', -apple-system, system-ui, sans-serif" font-size="${Math.min(width / 25, 16)}" font-weight="600">
        ${emoji} ${currentWork}
      </text>
      
      <!-- Enhanced info line with all stats separated by • -->
      <text x="40" y="${Math.min(height / 2 + 15, 50)}" fill="${currentTheme.textTertiary}" font-family="system-ui, sans-serif" font-size="${Math.min(width / 40, 11)}" textLength="${Math.min(infoItems.join(' • ').length * 7, width - 60)}" lengthAdjust="spacingAndGlyphs">
        ${infoItems.join(' • ')}
      </text>
      
      <!-- Subtle coding activity indicator -->
      <g transform="translate(${width - 18}, ${Math.max(10, height / 8)})" opacity="0.5">
        <rect x="0" y="0" width="2" height="4" rx="1" fill="${statusColor}">
          <animate attributeName="height" values="4;8;4" dur="3s" repeatCount="indefinite"/>
        </rect>
        <rect x="4" y="1" width="2" height="6" rx="1" fill="${statusColor}">
          <animate attributeName="height" values="6;3;6" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x="8" y="0" width="2" height="7" rx="1" fill="${statusColor}">
          <animate attributeName="height" values="7;10;7" dur="2.5s" repeatCount="indefinite"/>
        </rect>
      </g>
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
    }
  };
}

function generateErrorSVG(width, height, transparent = false) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${transparent ? '' : `<rect width="${width}" height="${height}" rx="12" fill="#0d1117" stroke="#f85149" stroke-width="1"/>`}
      <circle cx="25" cy="${height / 2}" r="6" fill="#f85149"/>
      <text x="40" y="${height / 2 - 5}" fill="#f85149" font-family="system-ui, sans-serif" font-size="14" font-weight="600">❌ Error loading status</text>
      <text x="40" y="${height / 2 + 15}" fill="#f85149" font-family="system-ui, sans-serif" font-size="11">Check configuration</text>
    </svg>
  `;
}
