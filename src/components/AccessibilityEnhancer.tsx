import { useEffect } from "react";

const AccessibilityEnhancer = () => {
  useEffect(() => {
    // Skip to main content link
    const addSkipLink = () => {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50';
      skipLink.style.position = 'absolute';
      skipLink.style.top = '-40px';
      skipLink.style.left = '6px';
      skipLink.style.transition = 'top 0.3s';
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });

      document.body.insertBefore(skipLink, document.body.firstChild);
    };

    // Announce page changes for screen readers
    const announcePageChanges = () => {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'page-announcer';
      document.body.appendChild(announcer);
    };

    // Focus management for modal/dialog accessibility
    const manageFocus = () => {
      const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      
      // Trap focus within modals when they're open
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          const modal = document.querySelector('[role="dialog"]:not([hidden])');
          if (modal) {
            const focusableContent = modal.querySelectorAll(focusableElements);
            const firstFocusableElement = focusableContent[0] as HTMLElement;
            const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
              }
            }
          }
        }

        // Close modal on Escape key
        if (e.key === 'Escape') {
          const modal = document.querySelector('[role="dialog"]:not([hidden])');
          if (modal) {
            const closeButton = modal.querySelector('[data-close-modal]') as HTMLElement;
            if (closeButton) {
              closeButton.click();
            }
          }
        }
      });
    };

    // Enhance keyboard navigation
    const enhanceKeyboardNavigation = () => {
      // Add visible focus indicators
      const style = document.createElement('style');
      style.textContent = `
        *:focus-visible {
          outline: 2px solid hsl(var(--primary));
          outline-offset: 2px;
          border-radius: 4px;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: inherit;
          margin: inherit;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `;
      document.head.appendChild(style);
    };

    addSkipLink();
    announcePageChanges();
    manageFocus();
    enhanceKeyboardNavigation();

    // Cleanup function
    return () => {
      const skipLink = document.querySelector('a[href="#main-content"]');
      const announcer = document.getElementById('page-announcer');
      
      if (skipLink) skipLink.remove();
      if (announcer) announcer.remove();
    };
  }, []);

  return null;
};

export default AccessibilityEnhancer;