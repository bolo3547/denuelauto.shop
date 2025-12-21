import { redirect } from 'next/navigation';

export default function ToyotaRedirect() {
  redirect('/stock?make=Toyota');
}
