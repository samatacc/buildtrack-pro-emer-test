import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Schema version details
    const schemaDetails = {
      version: '1.0.0',
      releaseDate: '2025-04-26',
      features: [
        'Dashboard Configuration',
        'Project Management',
        'Task Management',
        'Notification System',
        'Analytics & Reporting'
      ],
      designSystem: {
        primaryBlue: 'rgb(24,62,105)',
        primaryOrange: 'rgb(236,107,44)',
        mobileFirst: true
      }
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      message: 'BuildTrack Pro API is running',
      schema: schemaDetails
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
