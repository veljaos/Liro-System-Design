import { NotFoundTemplate } from '@liro/templates'

/*
 * Bez `linkComponent` propa: ovo je serverska komponenta, a funkcija ne moze
 * da predje granicu server/klijent. Komponenta za linkove se uzima iz
 * `LiroAppProvider`-a, koji zivi u klijentskom sloju.
 */
export default function NotFound() {
  return <NotFoundTemplate />
}
