'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { DataProvider } from './types'

const DataProviderContext = createContext<DataProvider | null>(null)

export interface LiroDataProviderProps {
  provider: DataProvider
  children: ReactNode
}

/**
 * Postavlja izvor podataka za celo stablo.
 *
 * Aplikacija bira implementaciju jednom, na korenu. Komponente ispod nikada
 * ne saznaju koja je - to je cela poenta.
 */
export function LiroDataProvider({ provider, children }: LiroDataProviderProps) {
  return <DataProviderContext.Provider value={provider}>{children}</DataProviderContext.Provider>
}

export function useDataProvider(): DataProvider {
  const provider = useContext(DataProviderContext)
  if (!provider) throw new Error('useDataProvider mora biti pozvan unutar <LiroDataProvider>')
  return provider
}
