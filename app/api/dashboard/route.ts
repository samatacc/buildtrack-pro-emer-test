import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * GET /api/dashboard
 * Retrieves dashboard configuration for the current user
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dashboardId = searchParams.get('id') || 'default';
  
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get dashboard from user_preferences table
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching dashboard:', error);
      return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
    }
    
    if (!data || !data.preferences || !data.preferences.dashboards) {
      // Return an empty result if no dashboard exists
      return NextResponse.json({ dashboard: null });
    }
    
    const userDashboards = data.preferences.dashboards;
    const requestedDashboard = userDashboards.find((dash: any) => dash.id === dashboardId);
    
    return NextResponse.json({ dashboard: requestedDashboard || null });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/dashboard
 * Saves dashboard configuration for the current user
 */
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get dashboard data from request body
    const { dashboard } = await request.json();
    
    if (!dashboard || !dashboard.id) {
      return NextResponse.json({ error: 'Invalid dashboard data' }, { status: 400 });
    }
    
    // Get existing user preferences
    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user preferences:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch user preferences' }, { status: 500 });
    }
    
    const preferences = existingPrefs?.preferences || {};
    const dashboards = preferences.dashboards || [];
    
    // Update or add the dashboard
    const dashboardIndex = dashboards.findIndex((dash: any) => dash.id === dashboard.id);
    
    if (dashboardIndex >= 0) {
      dashboards[dashboardIndex] = dashboard;
    } else {
      dashboards.push(dashboard);
    }
    
    preferences.dashboards = dashboards;
    
    // Save updated preferences
    const { error: updateError } = await supabase
      .from('user_preferences')
      .upsert({ 
        user_id: user.id, 
        preferences 
      });
    
    if (updateError) {
      console.error('Error updating user preferences:', updateError);
      return NextResponse.json({ error: 'Failed to save dashboard' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, dashboardId: dashboard.id });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
