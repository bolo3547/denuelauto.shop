import { redirect } from 'next/navigation';

export default function SedansRedirect() {
  redirect('/stock?bodyType=Sedan');
}
