import {createGlobalStyle, ThemeProvider} from 'styled-components'
import {NavBar} from '../components'
const GlobalStyle = createGlobalStyle`
  html {
    margin: 0;
    padding: 0;
    font-family: "Helvetica Neue", Roboto, "Segoe UI", Calibri, sans-serif;
    font-size: 12px;
    font-weight: bold;
    line-height: 16px;
  }
  body {
    margin: 0;
    padding: 0;
    width: 100%;
  }
`

const theme = {
    colors: {
        primary: '#1da1f2'
    }
}

export default function App({Component, pageProps}) {
    return (
        <>
            <GlobalStyle />
            <ThemeProvider theme={theme}>
                <NavBar />
                <Component {...pageProps} />
            </ThemeProvider>
        </>
    )
}
