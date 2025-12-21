# CarLoadingAnimation

A small loader component that animates a car driving across the screen.

Props:
- `message?: string` - Text to display under the animation. Default: `Loading...`
- `direction?: 'ltr' | 'rtl'` - Direction the car moves. Default: `rtl` (right-to-left).
- `duration?: number` - Duration of animation loop in seconds. Default: `3`.
- `ariaLabel?: string` - Accessibility label for the whole loader.
- `disableControl?: boolean` - Show a small control to let users disable the animation and persist the preference in `localStorage`.
- `onDisable?: () => void` - Callback invoked when the user disables the animation.

Usage example:

```tsx
import CarLoadingAnimation from '../components/CarLoadingAnimation';

return (
  <CarLoadingAnimation
    message="Loading inventory..."
    direction="rtl"
    duration={3}
    disableControl={true}
    onDisable={() => setIsLoading(false)}
  />
);
```

Accessibility notes:
- The component respects `prefers-reduced-motion` and disables animation for users who request reduced motion.
- Decorative SVGs are hidden from assistive technologies using `aria-hidden`.
- The component exposes a `ariaLive` region by default (role `status`) to announce loading to screen readers.
