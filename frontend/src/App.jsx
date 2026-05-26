import AppRouter from './router/AppRouter.jsx'

/**
 * Composant racine : délègue toute la logique de navigation à AppRouter.
 * Garder App.jsx minimaliste permet d'ajouter facilement des providers
 * (Context, Redux, etc.) sans toucher au routage.
 */
function App() {
  return <AppRouter />
}

export default App
