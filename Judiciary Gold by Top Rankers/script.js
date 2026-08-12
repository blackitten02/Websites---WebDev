(() => {
  'use strict';

  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const primaryNav = document.querySelector('.primary-nav');
  const modal = document.querySelector('#lead-modal');
  const leadForm = document.querySelector('#lead-form');
  const successState = document.querySelector('.success-state');
  const modalGrid = document.querySelector('.modal-grid');

  // Sticky-header depth
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 22);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Mobile navigation
  const closeMenu = () => {
    menuButton?.classList.remove('active');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    primaryNav?.classList.remove('open');
    body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const isOpen = !primaryNav.classList.contains('open');
    menuButton.classList.toggle('active', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    primaryNav.classList.toggle('open', isOpen);
    body.classList.toggle('menu-open', isOpen);
  });

  primaryNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 820) closeMenu(); });

  // Entrance animations
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('in-view'));
  }

  // Impact counters
  const numberFormat = new Intl.NumberFormat('en-IN');
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = el => {
    if (el.dataset.ran) return;
    el.dataset.ran = 'true';
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = numberFormat.format(Math.round(target * eased)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  // Program filters
  const filterButtons = document.querySelectorAll('.filter-chip');
  const programCards = document.querySelectorAll('.program-card');
  const emptyState = document.querySelector('.filter-empty');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      let visibleCount = 0;
      programCards.forEach(card => {
        const categories = card.dataset.category?.split(' ') || [];
        const show = filter === 'all' || categories.includes(filter);
        card.hidden = !show;
        if (show) visibleCount += 1;
      });
      if (emptyState) emptyState.hidden = visibleCount > 0;
    });
  });

  // Accessible preparation-stage tabs
  const stageTabs = [...document.querySelectorAll('.stage-tab')];
  const selectStage = tab => {
    stageTabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.querySelector(`#panel-${item.dataset.tab}`);
      if (panel) {
        panel.hidden = !selected;
        panel.classList.toggle('active', selected);
      }
    });
  };

  stageTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectStage(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % stageTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + stageTabs.length) % stageTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = stageTabs.length - 1;
      stageTabs[nextIndex].focus();
      selectStage(stageTabs[nextIndex]);
    });
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const willOpen = !item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        otherItem.classList.remove('open');
        otherItem.querySelector('button')?.setAttribute('aria-expanded', 'false');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.hidden = true;
      });
      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
      }
    });
  });

  // Counselling modal
  const resetModal = () => {
    leadForm.hidden = false;
    document.querySelector('.modal-aside').hidden = false;
    successState.hidden = true;
    leadForm.reset();
  };

  const openModal = () => {
    if (!modal) return;
    resetModal();
    modal.showModal();
    body.classList.add('modal-open');
    window.setTimeout(() => modal.querySelector('input')?.focus(), 80);
  };

  const closeModal = () => {
    if (!modal?.open) return;
    modal.close();
    body.classList.remove('modal-open');
  };

  document.querySelectorAll('.js-open-modal').forEach(button => button.addEventListener('click', openModal));
  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.querySelector('.success-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    const box = modal.getBoundingClientRect();
    const clickedOutside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (clickedOutside) closeModal();
  });
  modal?.addEventListener('cancel', event => {
    event.preventDefault();
    closeModal();
  });

  leadForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!leadForm.checkValidity()) {
      leadForm.reportValidity();
      return;
    }
    leadForm.hidden = true;
    document.querySelector('.modal-aside').hidden = true;
    successState.hidden = false;
    modalGrid.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Resource cards demonstrate a light conversion interaction
  const toast = document.querySelector('.toast');
  let toastTimer;
  document.querySelectorAll('.resource-card').forEach(card => {
    card.addEventListener('click', event => {
      event.preventDefault();
      toast?.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toast?.classList.remove('show');
        openModal();
      }, 900);
    });
  });

  // Decorative dashboard action
  document.querySelector('.next-action button')?.addEventListener('click', () => {
    toast.textContent = 'Revision task opened in your study plan.';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2200);
  });
})();
