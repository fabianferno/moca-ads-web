import ReactDOM from 'react-dom/client'
import ContentApp from './ContentApp'
import { adInjector } from './utils/adInjector'

let unmount: () => void

if (import.meta.webpackHot) {
  import.meta.webpackHot?.accept()
  import.meta.webpackHot?.dispose(() => {
    unmount?.()
    adInjector.destroy()
  })
}

if (document.readyState === 'complete') {
  unmount = initial() || (() => { })
  // Initialize ad injection after a delay to let the page load
  setTimeout(() => {
    adInjector.init()
  }, 2000)
} else {
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') {
      unmount = initial() || (() => { })
      // Initialize ad injection after a delay to let the page load
      setTimeout(() => {
        adInjector.init()
      }, 2000)
    }
  })
}

console.log('MOCA Ads Extension: Content script loaded')

function initial() {
  // Create a new div element and append it to the document's body
  const rootDiv = document.createElement('div')
  rootDiv.id = 'extension-root'
  document.body.appendChild(rootDiv)

  // Injecting content_scripts inside a shadow dom
  // prevents conflicts with the host page's styles.
  // This way, styles from the extension won't leak into the host page.
  const shadowRoot = rootDiv.attachShadow({ mode: 'open' })

  const styleElement = document.createElement('style')
  shadowRoot.appendChild(styleElement)
  fetchCSS().then((response) => (styleElement.textContent = response))

  if (import.meta.webpackHot) {
    import.meta.webpackHot?.accept('./styles.css', () => {
      fetchCSS().then((response) => (styleElement.textContent = response))
    })
  }

  // Create a container for React to render into
  const container = document.createElement('div')
  shadowRoot.appendChild(container)

  const mountingPoint = ReactDOM.createRoot(container)
  mountingPoint.render(
    <div className="content_script">
      <ContentApp />
    </div>
  )
  return () => {
    mountingPoint.unmount()
    rootDiv.remove()
  }
}

async function fetchCSS() {
  const cssUrl = new URL('./styles.css', import.meta.url)
  const response = await fetch(cssUrl)
  const text = await response.text()
  return response.ok ? text : Promise.reject(text)
}
