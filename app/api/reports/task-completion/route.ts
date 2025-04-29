import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for task completion pie chart
  const data = {
    labels: ['Completed', 'In Progress', 'Not Started', 'Delayed'],
    datasets: [
      {
        data: [63, 21, 9, 7],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',  // teal for completed
          'rgba(54, 162, 235, 0.6)',  // blue for in progress
          'rgba(255, 206, 86, 0.6)',  // yellow for not started
          'rgba(255, 99, 132, 0.6)'   // red for delayed
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return NextResponse.json(data);
}
