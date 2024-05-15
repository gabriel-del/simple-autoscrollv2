import './popup.css'
import React, {ReactNode, useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Message, Settings} from './types'

const container = document.getElementById('app')
const root = createRoot(container!)

const ErrorMessages = {
  CANNOT_CONNECT_TO_ACTIVE_TAB:
    'Unable to connect to the active tab. If this is a non-chrome tab, refreshing the tab might resolve the issue.',
  CANNOT_QUERY_CURRENT_TAB:
    'Unable to query the active tab. Please ensure that the window is active and try again'
} as const

function TransientMessage({children, duration, value, delay = 0, done, ...rest}: {
  children: ReactNode
  duration: number
  delay?: number
  done?: () => void
  value: any
  [key: string]: unknown
}) {
  const [opacity, setOpacity] = useState(1)
  const [visible, setVisibility] = useState(true)
  useEffect(() => {
    (async () => {
      setOpacity(1);
      setVisibility(true);
      await new Promise(resolve => setTimeout(resolve, delay));
      setOpacity(0);
      await new Promise(resolve => setTimeout(resolve, duration));
      setVisibility(false);
      if (done) done();
    })()
  }, [value])
  return visible
    ? ( <span style={{opacity}} {...rest}> {'       '}{children}{'       '} </span> ) : null
}

const settingsKey = 'defaultSettings'

function FormHandler() {
  const [error, setError] = useState('')
  const [scrollDuration, setScrollDuration] = useState(25)
  const [scrollPixels, setScrollPixels] = useState(5)
  const [loop, setLoop] = useState(false)
  const [savedOpacity, setSavedOpacity] = useState(0)
  const [displaySaved, setDisplaySaved] = useState(false)
  const [doneSyncing, setDoneSyncing] = useState(true)
  const [doneOpacity, setDoneOpacity] = useState(1)
  const startSyncing = () => {
    setDoneSyncing(false)
    setDoneOpacity(1)
  }
  const finishedSyncing =  async () => {
    setDoneSyncing(true)
    await new Promise(_ => setTimeout(_, 3000))
    setDoneOpacity(0)
  }
  const fetchSyncedSettings = async () => {
    if (globalThis.chrome?.storage) {
      try {
        startSyncing()
        const settings = (((await chrome.storage.sync.get([settingsKey])) || {})?.[settingsKey]
          || {}) as Settings
        const {scrollDuration, scrollPixels, loop} = settings
        console.log('Got new settings from sync', scrollDuration, scrollPixels)
        if (scrollDuration && scrollPixels) {
          console.log('Setting defaults')
          setScrollDuration(scrollDuration)
          setScrollPixels(scrollPixels)
          setLoop(Boolean(loop))
        }
      } catch (e) {
        console.error(e)
      } finally {
        finishedSyncing()
      }
    }
  }

  const sendMessage = async (message: Message, showErrors: boolean = true) => {
    if (!globalThis.chrome?.tabs) return
    try {
      const [firstTab] = await chrome.tabs.query({active: true, currentWindow: true})
      if (!firstTab?.id) { if (showErrors) setError(ErrorMessages.CANNOT_QUERY_CURRENT_TAB); return}
        try {
          chrome.tabs.sendMessage(firstTab.id, message as Message)
          if (showErrors) setError('')
          console.log('Sent to tab: ', firstTab.id)
        } catch (e) { if (showErrors) setError(ErrorMessages.CANNOT_CONNECT_TO_ACTIVE_TAB) }
    } catch (e) {
      if (showErrors) setError(ErrorMessages.CANNOT_QUERY_CURRENT_TAB)
      console.error(e)
    }
  }

  useEffect(() => {
    sendMessage({stop: true} as Message, false)
    fetchSyncedSettings().catch(() => console.error('Error syncing'))
  }, [])
  const saveAsDefault = async () => {
    startSyncing()
    setDisplaySaved(false)
    if (globalThis.chrome?.storage) {
      console.log('saving', scrollDuration, scrollPixels)
      try {
        await chrome.storage.sync.set({ [settingsKey]: {scrollDuration, scrollPixels, loop} as Settings })
      } catch (e) {console.error(e)}
    }
    setDisplaySaved(true)
    setSavedOpacity(1)
    await new Promise(_ => setTimeout(_, 3000))
    setSavedOpacity(0)
    await new Promise(_ => setTimeout(_, 1500))
    setDisplaySaved(false)
    finishedSyncing()
  }

  return (
    <>
    <form onSubmit={e => { e.preventDefault(); sendMessage({scrollDuration, scrollPixels, loop} as Message) }} >
      <div className="grid">
        <button id="default" type="button" onClick={saveAsDefault}> Save as default </button>
        {displaySaved
          ? (<div className="save-section" id="saved" style={{opacity: savedOpacity}}> Saved ✓ </div>)
          : null}
        Scroll
        <br />
        <input id="scroll" type="number" min="-5000" max="5000" value={String(scrollPixels)} onChange={e => setScrollPixels(Number(e.target.value))} />
        {'   pixels every '}
        <br />
        <input id="seconds" type="number" min="1" max="600000" value={String(scrollDuration)} onChange={e => setScrollDuration(Number(e.target.value))} />
        {' milliseconds'}
        <br />
        <input type="checkbox" name="loop" id="loop" checked={loop} onChange={e => setLoop(e.target.checked)} />
        <label htmlFor="loop">loop?</label>
      </div>
      {
        <button type="submit">
          {' Go '}
        </button>
      }
    </form>


      <div aria-busy={!doneSyncing} className="syncing" style={{opacity: doneOpacity}}>
        {doneSyncing ? 'Synced!' : 'Syncing...'}
      </div>
      <div>
        <TransientMessage done={() => setError('')} value={error} delay={15000} duration={3000} className="error-message">
          {error}
        </TransientMessage>
      </div>
    </>
  )
}

root.render(<FormHandler />)
