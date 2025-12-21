import { redirect } from 'next/navigation';

export default function RegisterIndexPage() {
  // Redirect to the tenant registration wizard for now
  redirect('/register/tenant');
}
