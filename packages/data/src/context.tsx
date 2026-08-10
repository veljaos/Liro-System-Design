'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { DataProvider } from './types'

const DataProviderContext = createContext<DataProvider | null>(null)

export interface LiroDataProviderProps {
  provider: DataProvider
  children: ReactNode
}

/**
 * Sets the data source for the whole tree.
 *
 * The application picks the implementation once, at the root. Components
 * below never find out which one it is - that's the whole point.
 */
export function LiroDataProvider({ provider, children }: LiroDataProviderProps) {
  return <DataProviderContext.Provider value={provider}>{children}</DataProviderContext.Provider>
}

export function useDataProvider(): DataProvider {
  const provider = useContext(DataProviderContext)
  if (!provider) throw new Error('useDataProvider must be called within <LiroDataProvider>')
  return provider
}
