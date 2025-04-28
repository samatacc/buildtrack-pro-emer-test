import { redirect } from 'next/navigation';

export const GET = () => {
  // Redirect to the internationalized profile page with default locale (en)
  redirect('/en/dashboard/profile');
};
