import { describe, expect, it } from 'vitest'
import {
  bankaIzRacuna,
  formatRacun,
  isValidRacun,
  isValidRacunFormat,
  normalizeRacun,
  racunControl,
} from './racun'

/*
 * Stvarni racuni iz pet razlicitih banaka. Kada dodajes nove, uzmi ih sa
 * fakture ili izvoda — izmisljen racun koji "izgleda ispravno" ne dokazuje
 * nista.
 */
const STVARNI = [
  '160-0000000921898-46',
  '155-0070100158173-04',
  '105-0000002158854-60',
  '340-0001000152520-11',
  '340-0001000152524-96',
]

describe('isValidRacun', () => {
  it.each(STVARNI)('prihvata stvaran racun %s', (racun) => {
    expect(isValidRacun(racun)).toBe(true)
  })

  it('prihvata i sazet oblik od osamnaest cifara', () => {
    expect(isValidRacun('160000000092189846')).toBe(true)
  })

  it('prihvata skraceni srednji deo bez vodecih nula', () => {
    expect(isValidRacun('160-921898-46')).toBe(true)
  })

  it('odbija pogresan kontrolni broj', () => {
    expect(isValidRacun('160-0000000921898-47')).toBe(false)
    expect(isValidRacun('340-0001000152520-96')).toBe(false)
  })

  it('hvata zamenu dve cifre u broju racuna', () => {
    /* Zbog toga kontrola i postoji — greska u prekucavanju. */
    expect(isValidRacun('160-0000000921889-46')).toBe(false)
  })

  it('odbija pogresan oblik', () => {
    expect(isValidRacun('16-0000000921898-46')).toBe(false)
    expect(isValidRacun('160-0000000921898-4')).toBe(false)
    expect(isValidRacun('nesto')).toBe(false)
    expect(isValidRacun('')).toBe(false)
  })
})

describe('normalizeRacun i formatRacun', () => {
  it('dopunjava srednji deo do trinaest cifara', () => {
    expect(normalizeRacun('160-921898-46')).toBe('160000000092189846')
  })

  it('vraca pisani oblik iz sazetog', () => {
    expect(formatRacun('160000000092189846')).toBe('160-0000000921898-46')
  })

  it('prolaz kroz oba oblika ne menja racun', () => {
    for (const racun of STVARNI) {
      expect(formatRacun(normalizeRacun(racun)!)).toBe(racun)
    }
  })
})

describe('racunControl', () => {
  it.each(STVARNI)('racuna istu kontrolu kao u %s', (racun) => {
    const [bank, account, control] = racun.split('-')
    expect(racunControl(bank!, account!)).toBe(control)
  })

  it('daje isti rezultat i bez vodecih nula', () => {
    expect(racunControl('160', '921898')).toBe('46')
  })
})

describe('bankaIzRacuna', () => {
  it('cita fiksni broj banke', () => {
    expect(bankaIzRacuna('160-0000000921898-46')).toBe('160')
    expect(bankaIzRacuna('nesto')).toBeNull()
  })
})

describe('isValidRacunFormat', () => {
  it('proverava oblik i kada je kontrola pogresna', () => {
    expect(isValidRacunFormat('160-0000000921898-99')).toBe(true)
    expect(isValidRacun('160-0000000921898-99')).toBe(false)
  })
})