import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect ,useState} from 'react'

import { AudioOutlined } from '@ant-design/icons';
import { Input } from 'antd';
const { Search } = Input;

export default function Home() {
  const router = useRouter()


  useEffect(() => {
    // effect
    return () => {
      // cleanup
    };
  }, []);

  const onSearch = (value) =>{
    console.log(value);
    router.push({
      pathname: '/[slug]',
      query: { slug: value },
    })
  }

  


  return (
    <div className={styles.container}>
      <Head>
        <title>Web3 Score </title>
        <meta name="description" content="Web3 score" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="">Web3 Score</a>
        </h1>

       

        <div className={styles.grid}>
          <p>Query any address in Ethereum to understand the Web3 Score </p>
          <Search placeholder="Ethereum address or ENS name" allowClear onSearch={onSearch} enterButton />
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://web3hooks.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Keep Building
        </a>
      </footer>
    </div>
  )
}
