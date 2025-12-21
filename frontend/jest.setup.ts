import '@testing-library/jest-dom';

// Extend expect with extra matchers from jest-dom
expect.extend({});

// JSDOM polyfill for matchMedia used by theme-toggle
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	}),
});

// Mock Next.js app router hooks for tests that use `useRouter` or navigation
jest.mock('next/navigation', () => ({
	useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() }),
	usePathname: () => '/',
	useSearchParams: () => new URLSearchParams(),
}));
