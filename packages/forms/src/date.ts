/**
 * Parser datuma je preseljen u `@liro/dates`, jer ga koriste i komponente koje
 * nemaju veze sa formama - kolone tabela, rokovi dospeca, izbor perioda.
 *
 * Ovaj fajl ostaje kao preusmerenje da postojeci uvozi ne pucaju.
 */
export { parseSerbianDate, formatSerbianDate, type DateString } from '@liro/dates'
