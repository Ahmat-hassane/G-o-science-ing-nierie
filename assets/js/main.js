const nav = document.querySelector('.site-nav')
const toggle = document.querySelector('.nav-toggle')
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true'
    nav.setAttribute('aria-expanded', String(!expanded))
    toggle.setAttribute('aria-expanded', String(!expanded))
  })
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').substring(1)
    const el = document.getElementById(id)
    if (el) {
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})
const io = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  }
}, { threshold: 0.2 })
document.querySelectorAll('.reveal').forEach(el => io.observe(el))
const slides = document.querySelectorAll('.hero-slide')
const heroEl = document.querySelector('.hero')
slides.forEach(s => {
  s.addEventListener('error', () => { s.dataset.broken = '1' })
  if (s.complete && s.naturalWidth === 0) s.dataset.broken = '1'
})
function setOverlayForSlide(slide) {
  const overlay = slide.dataset.overlay || 'medium'
  let value = 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.35) 100%)'
  if (overlay === 'soft') value = 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%)'
  if (overlay === 'strong') value = 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.5) 100%)'
  heroEl?.style.setProperty('--hero-overlay', value)
}
if (slides.length > 1) {
  let idx = 0
  setInterval(() => {
    slides[idx].classList.remove('active')
    let next = (idx + 1) % slides.length
    let guard = 0
    while (slides[next].dataset.broken === '1' && guard < slides.length) {
      next = (next + 1) % slides.length
      guard++
    }
    idx = next
    slides[idx].classList.add('active')
    const theme = slides[idx].dataset.theme || 'light'
    setOverlayForSlide(slides[idx])
    if (heroEl) {
      heroEl.classList.toggle('hero-text-light', theme === 'light')
      heroEl.classList.toggle('hero-text-dark', theme === 'dark')
    }
  }, 5000)
}
else if (slides.length === 1 && heroEl) {
  const theme = slides[0].dataset.theme || 'light'
  setOverlayForSlide(slides[0])
  heroEl.classList.toggle('hero-text-light', theme === 'light')
  heroEl.classList.toggle('hero-text-dark', theme === 'dark')
}
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count') || '0', 10)
  const start = 0
  const dur = 1800
  const t0 = performance.now()
  function step(ts) {
    const p = Math.min((ts - t0) / dur, 1)
    const val = Math.floor(start + (target - start) * (1 - Math.pow(1 - p, 3)))
    el.textContent = String(val)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
const counters = document.querySelectorAll('.counter')
const ioc = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      animateCounter(entry.target)
      ioc.unobserve(entry.target)
    }
  }
}, { threshold: 0.6 })
counters.forEach(el => ioc.observe(el))
const filterBtns = document.querySelectorAll('.filter-btn')
const cards = document.querySelectorAll('.project-card')
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    const f = btn.getAttribute('data-filter')
    cards.forEach(c => {
      const cat = c.getAttribute('data-category')
      c.style.display = f === 'all' || f === cat ? '' : 'none'
    })
  })
})
const form = document.getElementById('contact-form')
const statusEl = document.getElementById('form-status')
if (form && statusEl) {
  form.addEventListener('submit', async e => {
    e.preventDefault()
    statusEl.textContent = ''
    const data = new FormData(form)
    const name = String(data.get('name') || '')
    const email = String(data.get('email') || '')
    const phone = String(data.get('phone') || '')
    const message = String(data.get('message') || '')
    const hp = String(data.get('hp_field') || '')
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!name || !emailOk || !message || hp) {
      statusEl.textContent = 'Veuillez vérifier les champs.'
      return
    }
    const btn = form.querySelector('button[type="submit"]')
    if (btn) btn.disabled = true
    try {
      const res = await fetch(form.action, { method: 'POST', body: data })
      const json = await res.json()
      statusEl.textContent = json.success ? 'Message envoyé. Merci.' : 'Échec de l’envoi.'
    } catch (_) {
      statusEl.textContent = 'Erreur réseau.'
    } finally {
      if (btn) btn.disabled = false
      form.reset()
    }
  })
}
