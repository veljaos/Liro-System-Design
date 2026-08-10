// Allows TypeScript to import CSS from Liro packages without an error
declare module '@liro/*/css' {
  const content: any;
  export default content;
}

declare module '@liro/*/styles.css' {
  const content: any;
  export default content;
}