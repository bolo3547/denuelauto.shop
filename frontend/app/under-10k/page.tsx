import { redirect } from 'next/navigation';

export default function Under10kRedirect() {
  redirect('/stock?maxPrice=10000');
}
