// Dozvoljavamo TypeScript-u da importuje CSS iz Liro paketa bez greške
declare module '@liro/*/css' {
  const content: any;
  export default content;
}

declare module '@liro/*/styles.css' {
  const content: any;
  export default content;
}