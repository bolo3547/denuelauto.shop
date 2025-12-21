import React from 'react';
import { TenantTheme } from '@/types/dealer';
import { themePresets } from '@/lib/themePresets';

function ToneCopy(tone: string) {
  switch (tone) {
    case 'formal':
      return {
        title: 'Purchasing Instructions',
        body: 'Please follow the established steps to complete the purchase. Submit an inquiry, wait for confirmation, and remit payment as per the invoice. Our staff will prepare the necessary documents and arrange logistics.'
      };
    case 'friendly':
      return {
        title: "Let's Get You Driving!",
        body: "We're excited to help you find a car — pick a vehicle, send us a quick message, and our friendly team will guide you through everything. It's easy and fun!"
      };
    default:
      return {
        title: 'How to Buy',
        body: 'Choose a vehicle, make an inquiry, confirm details with our team, and proceed with payment and shipping. We’ll ensure clear communication and a professional experience.'
      };
  }
}

export default function ThemePreview({ theme }: { theme?: TenantTheme | null }) {
  if (!theme) return <div className="p-4">No theme loaded for preview</div>;
  const palette = (theme as any).theme?.palette || 'deep-blue-gold';
  const preset = (themePresets as any)[palette] || themePresets['deep-blue-gold'];
  const copy = ToneCopy((theme.brandTone as string) || 'professional');
  const accent = theme.accentColor || preset.primaryAccentColor || '#0F3D91';
  const primary = theme.primaryColor || preset.primaryAccentColor || '#0F3D91';
  const font = (theme as any).font || (theme.brandTone === 'formal' ? 'Merriweather' : theme.brandTone === 'friendly' ? 'Nunito' : 'Inter');

  return (
    <div className="border rounded p-4" style={{ background: preset.secondaryBgColor, color: preset.secondaryTextColor, fontFamily: font }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-2xl" style={{ color: primary }}>{theme.name || 'Dealer'}</div>
          <div className="text-sm text-gray-600">{theme.slogan || 'Quality vehicles & professional service'}</div>
        </div>
        <div>
          <a className="px-4 py-2 rounded" style={{ background: accent, color: '#fff' }}>{copy.title}</a>
        </div>
      </div>
      <div className="rounded bg-white p-4 shadow">
        <h3 className="font-semibold text-lg mb-2">{copy.title}</h3>
        <p className="text-sm text-gray-700">{copy.body}</p>
      </div>
    </div>
  );
}
