import { redirect } from 'next/navigation';

// Old registration flow removed. Students now register through /student/registration after login.
export default function RegisterRedirect() {
  redirect('/login');
}
