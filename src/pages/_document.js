import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en' data-theme='corporate'>
      <Head>
        <meta charSet='UTF-8' />
        <meta
          name='description'
          content='Century Kumdo Club - A Korean non-profit Kumdo sports club'
        />
        <meta
          name='keywords'
          content='Kendo, Kumdo, Korean, Vancouver, Langley, Coquitlam, Greater Vancouver, 밴쿠버, 검도, 한인, 한국'
        />
        <meta name='author' content='Century Kumdo Club' />

        {/* English language meta tags */}
        <meta property='og:title' content='Century Kumdo Club' />
        <meta
          property='og:description'
          content='Century Kumdo Club - A Korean non-profit Kumdo sports club'
        />
        <meta property='og:type' content='website' />
        <meta
          property='og:url'
          content='https://century-nfe2z3zko-mjtoolbox.vercel.app/#item3'
        />
        <meta
          property='og:image'
          content='https://century-nfe2z3zko-mjtoolbox.vercel.app/logo.jpg'
        />

        {/* Korean language meta tags */}
        <meta property='og:title' content='센츄리 검도 클럽' />
        <meta
          property='og:description'
          content='센츄리 검도 클럽 - 밴쿠버 한인 공동체 비영리 검도 스포츠 클럽'
        />
        <meta property='og:type' content='website' />
        <meta
          property='og:url'
          content='https://century-nfe2z3zko-mjtoolbox.vercel.app/#item3'
        />
        <meta
          property='og:image'
          content='https://century-nfe2z3zko-mjtoolbox.vercel.app/logo.jpg'
        />

        <meta
          property='og:image'
          content='https://century-nfe2z3zko-mjtoolbox.vercel.app/logo.jpg'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
