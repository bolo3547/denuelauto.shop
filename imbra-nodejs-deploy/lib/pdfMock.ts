export function generateProformaPdfHtml({ dealer, car, buyer }: any) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Proforma Invoice</title><style>body{font-family: Arial, sans-serif; padding:20px;} .header{display:flex;align-items:center;gap:20px} .logo{height:50px}</style></head><body><div class="header"><img class="logo" src="${dealer.logoUrl || ''}"/><div><h2>Proforma Invoice</h2><div>${dealer.name}</div></div></div><hr /><h3>Car: ${car.make} ${car.model} ${car.year}</h3><div>Stock No: ${car.stockNo}</div><div>Price: ${car.priceUsd ? 'USD ' + car.priceUsd : 'ZMW ' + car.priceLocal}</div><hr /><div>Buyer: ${buyer?.name || 'Guest'} - ${buyer?.email || ''}</div></body></html>`;
  return html;
}

export function downloadProformaPdfAsHtmlBlob(filename = 'proforma.html', html = '') {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
