import { NotFoundTemplate } from '@liro/templates'

/*
 * Without the `linkComponent` prop: this is a server component, and a
 * function cannot cross the server/client boundary. The link component is
 * taken from `LiroAppProvider`, which lives in the client layer.
 */
export default function NotFound() {
  return <NotFoundTemplate />
}
