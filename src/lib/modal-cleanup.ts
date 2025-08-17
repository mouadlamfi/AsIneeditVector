/**
 * Global Modal Cleanup System
 * Prevents stuck modal backdrops and overlay issues
 */

// Global function to clear all modals and overlays
export function clearAllModalsAndOverlays() {
  console.log('🧹 Clearing all modals and overlays...');
  
  // Remove any backdrop elements
  const backdropSelectors = [
    '.modal-backdrop',
    '.overlay', 
    '[data-backdrop]',
    '[class*="backdrop"]',
    '[class*="overlay"]',
    '[style*="backdrop"]',
    '[style*="overlay"]'
  ];
  
  backdropSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      console.log('🗑️ Removing backdrop element:', el);
      el.remove();
    });
  });
  
  // Remove any fixed positioned elements that might be overlays
  document.querySelectorAll('[style*="position: fixed"]').forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === 'fixed' && 
        (style.zIndex === '9999' || style.zIndex === '9998' || style.zIndex === '9997')) {
      console.log('🗑️ Removing fixed overlay element:', el);
      el.remove();
    }
  });
  
  // Reset body styles
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.classList.remove('modal-open', 'overlay-open');
  
  // Clear any z-index issues
  document.body.style.zIndex = '';
  
  // Remove any temporary export containers
  const exportContainer = document.getElementById('export-container');
  if (exportContainer) {
    console.log('🗑️ Removing export container');
    exportContainer.remove();
  }
  
  // Reset any React state that might be stuck
  // This will be handled by individual components
  
  console.log('✅ Modal cleanup completed');
}

// Global escape key handler
export function setupGlobalEscapeHandler() {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log('⌨️ Escape key pressed - clearing modals');
      clearAllModalsAndOverlays();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  
  // Return cleanup function
  return () => document.removeEventListener('keydown', handleEscape);
}

// Global click outside handler
export function setupGlobalClickOutsideHandler() {
  const handleClick = (e: Event) => {
    const target = e.target as HTMLElement;
    
    // Check if clicking on backdrop/overlay elements
    if (target.matches('.modal-backdrop, .overlay, [data-backdrop]') ||
        target.classList.contains('backdrop') ||
        target.style.position === 'fixed') {
      console.log('🖱️ Clicked on backdrop - clearing modals');
      clearAllModalsAndOverlays();
    }
  };
  
  document.addEventListener('click', handleClick);
  
  // Return cleanup function
  return () => document.removeEventListener('click', handleClick);
}

// Debug function for manual cleanup
export function debugClearModals() {
  console.log('🐛 Debug: Manual modal cleanup triggered');
  clearAllModalsAndOverlays();
  
  // Also log current modal state
  console.log('📊 Current modal state:');
  console.log('- Body overflow:', document.body.style.overflow);
  console.log('- Body classes:', document.body.className);
  console.log('- Fixed elements:', document.querySelectorAll('[style*="position: fixed"]').length);
  console.log('- High z-index elements:', document.querySelectorAll('[style*="z-index: 999"]').length);
}

// Hook for automatic cleanup on component mount
export function useModalCleanup() {
  const cleanup = () => {
    clearAllModalsAndOverlays();
  };
  
  return { cleanup, debugClearModals };
}