###
# Site JS
###

# credit where it’s due:
# http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/

window.requestAnimFrame = () ->
  return window.requestAnimationFrame or
         window.webkitRequestAnimationFrame or
         window.mozRequestAnimationFrame or
         (callback) -> window.setTimeout(callback, 1000 / 60)

# $("a[href^='http'], a[href^='https']", '.post-content').each () ->
#   $(@).css(
#     'background': "url(http://grabicon.com/icon?key=3f0a9c5f6f5a146a&size=16&domain=#{this.hostname}) left center no-repeat"
#     'padding-left': '20px'
#   )
