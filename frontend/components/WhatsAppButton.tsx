export default function WhatsAppButton({phone, message}:{phone?:string, message?:string}){
  const url = `https://wa.me/${phone || '+260 0973914432'}?text=${encodeURIComponent(message||'I am interested')}`;
  return (<a aria-label="WhatsApp" href={url} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-green-500 p-3 rounded-full shadow-lg text-white">WA</a>);
}
