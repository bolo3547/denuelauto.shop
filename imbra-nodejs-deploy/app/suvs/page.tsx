import { redirect } from 'next/navigation';

export default function SUVsRedirect() {
  redirect('/stock?bodyType=SUV');
}
