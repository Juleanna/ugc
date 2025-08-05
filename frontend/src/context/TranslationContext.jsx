import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { apiService } from '@/services/apiService'

const TranslationContext = createContext()

export function TranslationProvider({ children }) {
  const location = useLocation()
  const [translations, setTranslations] = useState({})
  const [currentLocale, setCurrentLocale] = useState('uk')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extract locale from pathname
    const localeMatch = location.pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'uk'
    setCurrentLocale(locale)
    
    loadTranslations(locale)
  }, [location.pathname])

  const loadTranslations = async (locale) => {
    try {
      setLoading(true)
      const data = await apiService.getTranslations(locale)
      setTranslations(data)
    } catch (error) {
      console.error('Failed to load translations:', error)
      // Fallback to Ukrainian or empty object
      if (locale !== 'uk') {
        try {
          const fallbackData = await apiService.getTranslations('uk')
          setTranslations(fallbackData)
        } catch (fallbackError) {
          setTranslations({})
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const t = (key, defaultValue = '') => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    return value || defaultValue || key
  }

  const value = {
    t,
    currentLocale,
    translations,
    loading,
    setCurrentLocale: (locale) => {
      setCurrentLocale(locale)
      loadTranslations(locale)
    }
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider')
  }
  return context
}