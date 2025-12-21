export function auditPage(){
  // Lightweight client-side accessibility audit (dev only)
  if (typeof window === 'undefined') return;
  const issues: string[] = [];
  const imgs = Array.from(document.querySelectorAll('img'));
  imgs.forEach((img) => {
    const alt = img.getAttribute('alt');
    if (alt === null) {
      issues.push(`Image missing alt: ${img.outerHTML.slice(0,100)}`);
    }
  });
  // Buttons/links missing accessible name
  const clickables = Array.from(document.querySelectorAll('a,button,[role="button"]')) as HTMLElement[];
  clickables.forEach(el => {
    const hasName = (el as any).innerText?.trim() || el.getAttribute('aria-label');
    if (!hasName) {
      issues.push(`Clickable missing accessible name: ${el.outerHTML.slice(0,100)}`);
    }
  });
  if (issues.length > 0) {
    console.warn('Accessibility audit found issues:', issues);
  } else {
    console.info('Accessibility quick-audit: no apparent issues found.');
  }
}
