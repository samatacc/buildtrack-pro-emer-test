# BuildTrack Pro Enhanced User Profile Schema

## Overview

This document describes the enhanced user profile schema implemented in BuildTrack Pro to support advanced personalization, mobile workflow optimization, and project management features. The schema was designed following the mobile-first approach and user-centric design principles of BuildTrack Pro.

## Schema Categories

The enhanced user profile schema is organized into five main categories:

### 1. Professional Fields

Fields that capture professional information relevant to construction roles:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `job_title` | TEXT | User's position or role within organization | null |
| `department` | TEXT | Department or team within the organization | null |
| `skills` | JSONB | Array of construction skills or specialties | `[]` |
| `certifications` | JSONB | Array of professional certifications and licenses | `[]` |

### 2. Communication Preferences

Fields that control how the user receives communications and notifications:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `preferred_contact_method` | ENUM | Primary method for notifications (email, sms, app) | 'email' |
| `timezone` | TEXT | User's timezone for scheduling and notifications | 'UTC' |
| `language` | TEXT | Preferred language for localization | 'en' |
| `preferences.notificationSettings` | JSONB | Granular control over notification types | See below |

#### Notification Settings Structure

```json
{
  "daily_digest": true,
  "project_updates": true,
  "task_assignments": true,
  "mentions": true,
  "deadlines": true
}
```

### 3. User Experience Customization

Fields that personalize the user interface and experience:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `dashboard_layout` | JSONB | Saved dashboard widget configurations | `{"widgets": [], "layout": "default"}` |
| `recent_projects` | JSONB | IDs of recently accessed projects | `[]` |
| `favorite_tools` | JSONB | User's favorite or most-used tools | `[]` |
| `preferences.uiSettings` | JSONB | Theme preferences, display density, etc. | See below |

#### UI Settings Structure

```json
{
  "theme": "light",
  "density": "comfortable",
  "animations": true,
  "reduceMotion": false
}
```

### 4. Mobile-Specific Fields

Fields that optimize the mobile experience for construction environments:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `device_tokens` | JSONB | Device tokens for push notifications | `[]` |
| `offline_access` | BOOLEAN | Whether user needs offline functionality | false |
| `data_usage_preferences` | JSONB | Controls for bandwidth/data usage | See below |

#### Data Usage Preferences Structure

```json
{
  "autoDownload": false,
  "highQualityImages": false,
  "videoPlayback": "wifi-only"
}
```

### 5. Analytics & Personalization

Fields that support personalization and engagement tracking:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `last_active_project` | UUID | Most recently active project | null |
| `login_streak` | INTEGER | Count of consecutive daily logins | 0 |
| `feature_usage` | JSONB | Analytics on feature usage | `{}` |
| `onboarding_status` | JSONB | Tracks completion of onboarding | See below |

#### Onboarding Status Structure

```json
{
  "completed": false,
  "steps": {
    "profile": false,
    "organization": false,
    "project": false,
    "team": false,
    "tour": false
  }
}
```

## Security and Privacy

The enhanced user profile implements Row Level Security (RLS) with the following policies:

1. Users can only view and edit their own profile data
2. Organization admins can view profiles within their organization
3. All profile data is encrypted in transit and at rest

## Performance Considerations

The schema includes the following indexes for performance optimization:

- `idx_profiles_job_title`
- `idx_profiles_department`
- `idx_profiles_last_active_project`
- `idx_profiles_login_streak`

## Mobile Performance Optimizations

The schema is optimized for mobile performance with:

1. JSONB fields for efficient storage and retrieval
2. Offline access flags to enable functionality without connectivity
3. Data usage preferences to control bandwidth consumption
4. Device tokens storage for mobile push notifications

## Integration with BuildTrack Pro Features

This enhanced profile schema supports the following BuildTrack Pro features:

1. **Personalized Dashboard** - Uses dashboard_layout and recentProjects
2. **Mobile Field Access** - Leverages offlineAccess and dataUsagePreferences
3. **Team Collaboration** - Uses professional fields for skills matching
4. **Intelligent Notifications** - Employs preferredContactMethod and notification settings
5. **User Engagement** - Tracks loginStreak and featureUsage

## Design System Alignment

The UI components accessing this schema will follow BuildTrack Pro's design system:

- Primary Blue: rgb(24,62,105)
- Primary Orange: rgb(236,107,44)
- Light Neumorphism for subtle depth
- Glassmorphism for overlays/modals

## Future Extensions

The schema is designed to be extensible for:

1. Additional professional qualifications and certifications
2. Advanced notification preferences by project or task type
3. Team-specific communication preferences
4. Enhanced personalization based on machine learning
