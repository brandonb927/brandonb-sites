/**
 Site JS
*/

const BODY_CLASS_DARK_MODE = 'dark-mode'
const TOGGLE_CLASS_DARK_MODE = 'toggle-dark-mode'
const KEY_DARK_MODE = 'darkMode'

domready(() => {
  const body = document.querySelector('body')
  let toggleDarkMode = document.querySelector('.js-toggle-dark-mode')

  const getStoredDarkMode = () => {
    return window.localStorage.getItem(KEY_DARK_MODE) === 'true' ? true : false
  }

  const setStoredDarkMode = val => {
    window.localStorage.setItem(KEY_DARK_MODE, val)
    return val
  }

  const enableDarkMode = () => {
    body.classList.add(BODY_CLASS_DARK_MODE)
    setStoredDarkMode(true)
    toggleDarkMode.setAttribute('title', 'Activate light mode')
    console.log('Dark mode activated! 🌑')
  }

  const disableDarkMode = () => {
    body.classList.remove(BODY_CLASS_DARK_MODE)
    setStoredDarkMode(false)
    toggleDarkMode.setAttribute('title', 'Activate dark mode')
    console.log('Dark mode deactivated! 🌞')
  }

  let easterEgg = new Konami(() => {
    document.querySelector('html').classList.add('konami-code')
    console.log('Konami code activated! 😉')
  })

  toggleDarkMode.addEventListener('click', e => {
    e.preventDefault()

    body.classList.contains(BODY_CLASS_DARK_MODE)
      ? disableDarkMode()
      : enableDarkMode()
  })

  getStoredDarkMode() ? enableDarkMode() : disableDarkMode()
})
