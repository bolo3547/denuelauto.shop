import dynamic from 'next/dynamic'

export const metadata = {
  title: 'Admin — Print Center'
}

const PrintActions = dynamic(() => import('../../../components/admin/PrintActions'), { ssr: false });

export default function AdminPrintPage(){
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Print Center</h1>
      <p className="mb-4">Generate or download documents such as proforma invoices, packing lists and printable receipts.</p>
      <div className="mb-6"><PrintActions /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/api/admin/print?text=Proforma%20Invoice" className="p-4 border rounded hover:shadow">Direct download (GET)</a>
        <a href="#" className="p-4 border rounded hover:shadow">Download Packing List</a>
      </div>
    </div>
  )
}
