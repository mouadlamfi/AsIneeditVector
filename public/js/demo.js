/**
 * Demo - Singularity Homepage Interactions
 */

class Demo {
  constructor() {
    this.isTransitioning = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAnimations();
  }

  setupEventListeners() {
    // Take me in button
    const takeMeInButton = document.querySelector('.content__button');
    if (takeMeInButton) {
      takeMeInButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleTakeMeIn();
      });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAnimation();
      } else {
        this.resumeAnimation();
      }
    });
  }

  setupAnimations() {
    // Add loading class to body
    document.body.classList.add('loading');

    // Remove loading class after a short delay
    setTimeout(() => {
      document.body.classList.remove('loading');
      document.body.classList.add('demo-1');
    }, 1000);

    // Animate content items
    this.animateContentItems();
  }

  animateContentItems() {
    const contentItems = document.querySelectorAll('.content__item');
    
    contentItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 500 + (index * 200));
    });
  }

  handleTakeMeIn() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Trigger explosion
    if (window.ico) {
      window.ico.explode();
    }

    // Update button text
    const button = document.querySelector('.content__button');
    if (button) {
      button.textContent = 'EXPLODING...';
      button.disabled = true;
    }

    // Create transition effect
    this.createTransitionEffect();

    // Navigate to art page after explosion
    setTimeout(() => {
      window.location.href = '/art';
    }, 2000);
  }

  createTransitionEffect() {
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
      pointer-events: none;
    `;
    
    document.body.appendChild(overlay);

    // Fade in overlay
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 10);

    // Cleanup
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 1000);
  }

  handleResize() {
    // Handle responsive adjustments
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }
  }

  pauseAnimation() {
    if (window.ico && window.ico.animationId) {
      cancelAnimationFrame(window.ico.animationId);
    }
  }

  resumeAnimation() {
    if (window.ico) {
      window.ico.animate();
    }
  }

  destroy() {
    if (window.ico) {
      window.ico.destroy();
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.demo = new Demo();
});