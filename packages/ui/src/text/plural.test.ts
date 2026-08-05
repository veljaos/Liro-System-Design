import { describe, expect, it } from 'vitest'
import { srPlural } from './plural'

const oblik = (n: number) => srPlural(n, 'stavka', 'stavke', 'stavki')

describe('srPlural', () => {
  it('jednina za brojeve koji se zavrsavaju na 1', () => {
    expect(oblik(1)).toBe('stavka')
    expect(oblik(21)).toBe('stavka')
    expect(oblik(101)).toBe('stavka')
  })

  it('mnozina za 11, koje je izuzetak', () => {
    expect(oblik(11)).toBe('stavki')
    expect(oblik(111)).toBe('stavki')
  })

  it('dvojina za 2-4', () => {
    expect(oblik(2)).toBe('stavke')
    expect(oblik(3)).toBe('stavke')
    expect(oblik(4)).toBe('stavke')
    expect(oblik(22)).toBe('stavke')
    expect(oblik(104)).toBe('stavke')
  })

  it('mnozina za 12-14, koje su izuzetak', () => {
    expect(oblik(12)).toBe('stavki')
    expect(oblik(13)).toBe('stavki')
    expect(oblik(14)).toBe('stavki')
    expect(oblik(113)).toBe('stavki')
  })

  it('mnozina za 5-20 i za nulu', () => {
    expect(oblik(0)).toBe('stavki')
    expect(oblik(5)).toBe('stavki')
    expect(oblik(20)).toBe('stavki')
    expect(oblik(746)).toBe('stavki')
  })
})