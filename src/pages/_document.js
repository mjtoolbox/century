import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en' data-theme='corporate'>
      <Head>
        <meta charSet='UTF-8' />
        <meta property='title' content='밴쿠버 한인 검도 클럽' />
        <meta
          name='description'
          content='캐나다 밴쿠버 유일의 한인 검도 클럽, 센츄리 검도 클럽입니다. 밴쿠버 한인 공동체 비영리 검도 스포츠 클럽입니다.'
        />
        <meta property='url' content='https://www.centurykumdo.com' />
        <meta
          name='keywords'
          content='밴쿠버 한인 검도 클럽, 센츄리 검도 클럽, Kendo, Kumdo, Korean, Canada, Vancouver, Langley, Coquitlam, Greater Vancouver, 밴쿠버, 검도, 한인, 한국, 캐나다'
        />
        <meta name='author' content='Century Kumdo Club' />
        <meta property='og:title' content='밴쿠버 한인 검도 클럽' />
        <meta
          property='og:site_name'
          content='센츄리 밴쿠버 한인 검도 클럽'
        ></meta>
        <meta
          property='og:description'
          content='캐나다 밴쿠버 유일의 한인 검도 클럽, 센츄리 검도 클럽입니다. 밴쿠버 한인 공동체 비영리 검도 스포츠 클럽입니다.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://www.centurykumdo.com' />
        <meta
          property='og:image'
          content='https://www.centurykumdo.com/logo.jpg'
        />
        <meta
          name='google-site-verification'
          content='N354zcCrBXtHpz6E-VePb0BP-T-eW-i0v_GqQyUPQzg'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
