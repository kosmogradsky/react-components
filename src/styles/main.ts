import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    overflow: hidden;
    font-family: 'IBM Plex Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
    letter-spacing: normal;
    background-color: #F5F6F8;
  }

  html, body, :global(#root) {
    height: 100%;
    width: 100%;
  }

  :global(#root) {
    overflow: auto;
  }

  button,
  input {
    font-family: inherit;
    outline: none;
  }

  #root {
    overflow: auto;
    width: 100%;
    height: 100vh;
  }

  button {
    border: none;
  }

  @media print {
    @page {
      margin: 0;
    }

    ::-webkit-scrollbar {
      display: none;
    }

    html, body {
      width:100%;
      height:auto;
      margin:auto;
      padding:0;
    }

    body {
      background: #fff;
      color: #000;
      height: auto;
      margin: 0 1cm 1cm;
    }

    :global(#root) {
      overflow: visible;
    }

    h1, h2, h3 {
      page-break-after: avoid;
    }

    img, svg {
      max-width: 100% !important;
    }

    ul, img {
      page-break-inside: avoid;
    }

    #root {
      overflow: visible;
    }
  }
`;
