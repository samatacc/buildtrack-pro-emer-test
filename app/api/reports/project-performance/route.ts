import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for project performance chart
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [65, 78, 90, 81, 86, 95],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'On Schedule',
        data: [85, 72, 79, 88, 92, 98],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  return NextResponse.json(data);
}
