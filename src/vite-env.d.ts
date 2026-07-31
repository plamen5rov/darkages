/// <reference types="vite/client" />

declare module '*.tmx?raw' {
  const content: string;
  export default content;
}
