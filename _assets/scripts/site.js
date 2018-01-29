/**
 Site JS
*/

domready(() => {
  let easterEgg = new Konami(() => {
    document.querySelector('html').classList.add('konami-code')
    console.log('Konami code activated! 😉')
	})
})
