import { redirect } from 'next/navigation';

export default function HondaRedirect() {
  redirect('/stock?make=Honda');
}
