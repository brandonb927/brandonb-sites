---
layout: null
sitemap: false
---

var CACHE_NAME = "brandonb-cache::{{site.time | date: '%Y%m%d%H%M%S'}}"

var urlsToCache = []

// Cache posts
{% for post in site.posts %}
urlsToCache.push('{{ post.url }}')
{% endfor %}

// Cache pages
// Conditionally removes JS, TXT, and XML files from the loop as well
{% for page in site.pages %}
{% unless page.url contains '.js' or page.url contains '.txt' or page.url contains '.xml' %}
urlsToCache.push('{{ page.url }}')
{% endunless %}
{% endfor %}

// Cache assets
urlsToCache.push('/assets/styles/site.css')

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache
          .match(event.request)
          .then(response => {
            return response || fetch(event.request).then(response => {
              cache.put(event.request, response.clone())
              return response
            })
          })
        })
        .catch(() => {
          // Fallback to the offline page if not available in the cache.
          return caches.match('/offlineZZ')
        })
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return fetch(event.request).then(response => {
          cache.put(event.request, response.clone())
          return response
        })
      })
      .catch(() => {
        // Fallback to the offline page if not available in the cache.
        return caches.match('/offlineZZ')
      })
  )
})
