# GitHub Status Badge

A dynamic, real-time status badge that displays your current coding activity, powered by Supabase and deployed on Vercel. Created by **Rahul Jangir**, Senior Software Developer & Systems Architect.

[![Status](https://github-status-badge.vercel.app/api/badge?username=test&style=minimal&theme=github&width=450&height=80)](https://github.com/test)

## Features

- **Real-time Updates** - Automatically syncs with your current status via WakaTime integration
- **Multiple Styles** - Choose from minimal, modern, or card layouts
- **Theme Support** - GitHub, dark, light, and transparent themes
- **Rich Data Display** - Shows location, local time, skills, and experience
- **Responsive Design** - Perfect for any README or website
- **Transparent Background** - Seamlessly blends into any page
- **Free Forever** - Built on Supabase and Vercel free tiers
- **Cloudflare Workers** - Ultra-fast global edge computing for data sync

## Architecture

This project uses a modern serverless architecture:


- **Cloudflare Worker**: Fetches coding activity from WakaTime and syncs to Supabase
- **Supabase Database**: Stores real-time developer status and activity data
- **Vercel API**: Serves dynamic SVG badges with live data
- **GitHub Integration**: Embeddable badges for profiles and project READMEs





| Theme | Preview |
|------|---------|
| GitHub | ![GitHub](https://github-status-badge.vercel.app/api/badge?username=rahuljangirworks&style=minimal&theme=github&width=350&height=90) |
| Dark | ![Dark](https://github-status-badge.vercel.app/api/badge?username=rahuljangirworks&style=minimal&theme=dark&width=350&height=80) |
| Light | ![Light](https://github-status-badge.vercel.app/api/badge?username=rahuljangirworks&style=minimal&theme=light&width=350&height=80) |
| Default | ![Default](https://github-status-badge.vercel.app/api/badge?username=rahuljangirworks&style=minimal&theme=default&width=350&height=80) |
| Transparent | ![Default](https://github-status-badge.vercel.app/api/badge?username=rahuljangirworks&style=minimal&theme=github&width=500&height=80&bg=transparent) |
