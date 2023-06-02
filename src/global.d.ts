export {};

declare global {
  interface Window {
    debug: any;

    setTheme: any;
    getThemes: any;
    setThemeOptions: any;
    gitCommitHash?: string;
  }
}
