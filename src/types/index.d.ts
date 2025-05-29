declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Tipos globais
interface Window {
  tailwind: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
