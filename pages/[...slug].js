import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'

import { Input, Table, Typography, Tag, Tooltip } from 'antd';
const { Search } = Input;
const { Text } = Typography;
import { Network, Alchemy } from "alchemy-sdk";


const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    align: 'right',
    width: 130,


    render: (text, item) => <a href={item.link} target="_blank" rel="noopener noreferrer">{text}</a>,
  },
  {
    title: 'Own',
    dataIndex: 'Own',
    key: 'Own',
    align: 'right',
    // width:300,
    render: (_, item) => {
      return (
        <span>
          <span style={{ overflow: 'scroll', width: 250, height: 40, display: 'inline-flex', justifyContent: item.list?.length > 5 ? 'space-between' : 'end' }}>
            {item.list?.map((res, index) => {
              return (<Tooltip key={res.tokenId} title={res.tokenId}><a rel="noopener noreferrer" href={item.link + '/' + res.tokenId} target="_blank"><img style={{ margin: '0 5px' }} width="40px" src={res.media?.[0]?.thumbnail || res.media?.[0]?.gateway} layout='fill' /></a></Tooltip>)
            })
            }
          </span>

          <Tag color={'geekblue'} style={{ marginLeft: 10 }}>
            x{item.list.length}
          </Tag>
        </span>
      )

    },

  },
  {
    title: 'Floor',
    dataIndex: 'Floor',
    key: 'Floor',
    align: 'right',
    width: 60,

    render: (_, item) => {
      const showFloor = Object.keys(item.floor).map((floorItem,index) => <p key={index}>{floorItem}:{item['floor'][floorItem]['floorPrice']}</p>)

      return (
        <Tooltip title={showFloor}>

          <Tag color="#55acee">
            {(item.floorPrice || 0)?.toFixed(2) + ' E'}
          </Tag>
        </Tooltip>
      )

    }

  },

  {
    title: 'Price',
    dataIndex: 'Price',
    key: 'Price',
    align: 'right',
    width: 80,

    render: (_, item) => {
      return <Tag style={{ marginRight: 10 }} color="#3b5999">
        {item.list?.length * ((item.floorPrice || 0)?.toFixed(2)) + ' E'}
      </Tag>
    }
  },


];

export default function Addrs(props) {
  const router = useRouter()

  const onSearch = (value) => {
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
          {router.query?.slug?.[0]}
        </h1>

        <div className={styles.grid}>
          <p>Query any address in Ethereum to understand the Web3 Score </p>
          <Search placeholder="Ethereum address or ENS name" allowClear onSearch={onSearch} enterButton />
        </div>

        <Table key="nfts" size="small" columns={columns} style={{ width: 600 }} scroll={{ x: 400, y: 400 }} dataSource={props.list}
          summary={() => {
            let totalAmount  = props.list.length;
            let totalPrice = 0;

            props.list.forEach(({ list, floorPrice }) => {
              totalPrice += list.length * floorPrice ;
            });

            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right">
                    <Tag color={'blue'} > {totalAmount } </Tag>category
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text> <Tag color={'geekblue'} style={{ marginLeft: 10 }}>
                      {props.total}
                    </Tag></Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Tag style={{ marginRight: 10 }} color="#3b5999">
                      {totalPrice ? (totalPrice).toFixed(2) + ' E' : ''}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>

              </Table.Summary>
            );
          }}

        />
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


export async function getServerSideProps(context) {

  const settings = {
    apiKey: 'Ub7cIF85117w9qiAch9zwFwWwhL2_VBL', // Replace with your Alchemy API Key.
    network: Network.ETH_MAINNET, // Replace with your network.
  };

  const alchemy = new Alchemy(settings);
  let nftsList = {}
  let error = null

  let data = await alchemy.nft.getNftsForOwner(`${context.query?.slug?.[0]}`,
    { omitMetadata: false }
  ).then(res => {
    res.ownedNfts = res.ownedNfts?.map(item => {

      if (!nftsList[item.contract.address]) {
        nftsList[item.contract.address] = {
          list: []
        }
      }
      if (nftsList[item.contract.address]) {
        nftsList[item.contract.address]['list'].push({
          tokenId: item.tokenId,
          media: item.media,
          tokenUri: item.tokenUri
        })
      }
      return item
    })
    return res
  }).catch(e => {
    console.log(e)
    // console.log(e.value)
    error = e || null
  });

  const getFloorPriceFn = async (addrs) => {
    return await alchemy.nft
      .getFloorPrice(addrs)
      .then(res => {
        return {
          contract: addrs,
          floor: res,
          floorPrice: res?.['openSea']?.['floorPrice'] || res?.['looksRare']?.['floorPrice'] || 0
        }
      });
  }

  const getContractMetadataFn = async (addrs) => {
    return await alchemy.nft
      .getContractMetadata(addrs)
      .then(res => ({
        // contract: addrs,
        name: res.name
      }));
  }

  const getContractAndFloor = async (addrs) => {
    let res1 = await getContractMetadataFn(addrs)
    let res2 = await getFloorPriceFn(addrs)
    return {
      ...res1,
      ...res2
    }
  }


  let list = []

  list = await Promise.all(Object.keys(nftsList)?.map((item) => {

    return getContractAndFloor(item)


  }))

  // console.log(list,'list')

  const getName = (url) => {
    if (!url) return ''
    return url.split('/')[url.split('/').length - 1]
  }




  list = await list.map(item => {
    return {
      ...item,
      name: item.name || getName(item?.['floor']?.['openSea']?.['collectionUrl']),
      list: nftsList[item.contract]['list'] || null,
      link: `https://opensea.io/assets/ethereum/${item.contract}`
    }
  }).sort((a, b) => {
    return b.floorPrice - a.floorPrice
  })


  data = {
    total: data?.totalCount || null,
    list,
    error
  }





  return {
    props: data // will be passed to the page component as props
  }
}