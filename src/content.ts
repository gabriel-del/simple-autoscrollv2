import {Message} from './types'

console.info('Simple Autoscroll Loaded')
let isLooping = false

const element = window.location.origin === 'https://docs.google.com'
    ? document.querySelector('.kix-appview-editor')
    : null

async function main() {
  if (globalThis.chrome) {
    let intCB: number = -1
    let scrollDuration: number | null = null
    let scrollPixels: number | null = null
    let scrollLoop: boolean | null = null
    const stopAutoscroll = () => {
      clearInterval(intCB)
      intCB = -1
    }
    const startAutoscroll = (scrollDuration: number, scrollPixels: number, loop: boolean) => {
      if (intCB >= 0) clearInterval(intCB)
      intCB = setInterval(() => {
        const elements = [element, document?.body, document?.body?.parentNode].filter( Boolean ) as Element[]
        for (const element of elements) {
            const percentage = element.scrollTop / ( element.scrollHeight - element.clientHeight )
            const isDone = percentage > 0.99
            const scrollTop = element.scrollTop
            if (isLooping) {
              if (percentage < 0.01) isLooping = false
            } else {
              element.scroll(0, scrollTop + scrollPixels!)
            }
            const delta = element.scrollTop - scrollTop
            if (isDone && loop) {
              // Some websites slow down scrolling, causing the looping function to potentially break as it takes too long to reach the top. To fix it
              isLooping = true
              element.scroll({ top: 0, behavior: 'auto' })
            }
          if (delta) break
        }
      }, scrollDuration)
    }



    chrome.runtime.onMessage.addListener((message) => {
      if (message) {
        isLooping = false
        const {scrollDuration: SD, scrollPixels: SP, loop, stop, pause} = message as Message
        scrollLoop = loop
        if (stop) {
          stopAutoscroll()
        } else if (pause) {
            if (intCB >= 0)
              stopAutoscroll()
            else
              // scrollLoop default deve ser false
              if (scrollDuration && scrollPixels) startAutoscroll(scrollDuration, scrollPixels, scrollLoop)
        } else {
          scrollDuration = SD
          scrollPixels = SP
          startAutoscroll(SD, SP, loop)
        }
      }
    })
  }
}

main()
