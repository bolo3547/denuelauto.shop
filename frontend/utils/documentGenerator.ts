// Mock document generator for proforma, invoice, contract
export type DocumentDetails = { [k: string]: string | number | undefined };
export function generateDocument({ type, details }: { type: 'proforma' | 'invoice' | 'contract'; details: DocumentDetails }) {
  // Simple text-based mock
  let content = '';
  switch (type) {
    case 'proforma':
      content = `PROFORMA INVOICE\nBuyer: ${details.buyer}\nCar: ${details.car}\nAmount: ${details.amount}\nDate: ${details.date}`;
      break;
    case 'invoice':
      content = `INVOICE\nBuyer: ${details.buyer}\nCar: ${details.car}\nAmount: ${details.amount}\nDate: ${details.date}`;
      break;
    case 'contract':
      content = `SALES CONTRACT\nBuyer: ${details.buyer}\nCar: ${details.car}\nAmount: ${details.amount}\nDate: ${details.date}\nTerms: ${details.terms}`;
      break;
    default:
      content = 'Unknown document type';
  }
  return content;
}
