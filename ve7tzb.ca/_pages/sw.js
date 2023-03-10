---
layout: null
sitemap: false
---

var CACHE_NAME = "ve7tzb-cache::{{site.time | date: '%Y%m%d%H%M%S'}}"

var urlsToCache = []

// Cache posts
{% for post in site.posts %}urlsToCache.push('{{ post.url }}')
{% endfor %}

// Cache pages
// Conditionally removes JS, TXT, and XML files from the loop as well
{% for page in site.pages %}{% unless page.url contains '.js' or page.url contains '.txt' or page.url contains '.xml' %}urlsToCache.push('{{ page.url }}')
{% endunless %}{% endfor %}

// Cache assets
urlsToCache.push('/assets/styles/site.css')

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache)
      })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => {
        var networked = fetch(event.request)
          .then((response) => {
            var cacheCopy = response.clone()

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                return cache.put(event.request, cacheCopy)
              })

              return response
          })
          .catch(() => {
            return caches.match('/offline')
          })

        return cached || networked
      })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => {
              return !key.startsWith(CACHE_NAME)
            })
            .map((key) => {
              return caches.delete(key)
            })
        )
      })
  )
})
