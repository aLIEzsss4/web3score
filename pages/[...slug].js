import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { AudioOutlined } from '@ant-design/icons';
import { Input,Table,Typography,Tag,Tooltip } from 'antd';
const { Search } = Input;
const { Text } = Typography;
import { Network, Alchemy } from "alchemy-sdk";

// const fixed=num=>num?num.fo

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    align:'right',
    width:100,

         
    render: (text, item) => <a href={item.link} target="_blank" rel="noopener noreferrer">{text}</a>,
  },
  {
    title: 'Own',
    dataIndex: 'Own',
    key: 'Own',
    align:'right',
    // width:300,
    render: (_,item) =>{
      return(
        <span>
          <span style={{overflow:'scroll',width:250,height:40,display:'inline-flex',justifyContent:item.list?.length>5?'space-between':'end'}}>
       {item.list?.map((res,index)=>{
        // if(index<5){
         return (<Tooltip key={res.tokenId} title={res.tokenId}><a rel="noopener noreferrer" href={item.link+'/'+res.tokenId} target="_blank"><img style={{margin:'0 5px'}}   width="40px" src={res.media?.[0]?.thumbnail||res.media?.[0]?.gateway} layout='fill' /></a></Tooltip>)
        // }
      })
       } 
            </span>

        <Tag color={'geekblue'} style={{marginLeft:10}}>
              x{item.list.length}
            </Tag>
</span>
      )

    } ,

  },
  {
    title: 'Floor',
    dataIndex: 'Floor',
    key: 'Floor',
    align:'right',
    width:60,

    render: (_,item) =>{
      
      return <Tag color="#55acee">
      {(item.floor?.openSea?.floorPrice||0)?.toFixed(2) +' E'}
    </Tag>
    }
    
  },
 
  {
    title: 'Price',
    dataIndex: 'Price',
    key: 'Price',
    align:'right',
    width:80,

    render: (_,item) =>{
      return  <Tag style={{marginRight:10}} color="#3b5999">
     { item.list?.length*((item.floor?.openSea?.floorPrice||0)?.toFixed(2))+' E'}
    </Tag> 
    } 
  },
  
 
];

export default function Addrs(props) {
  const router = useRouter()



  const onSearch = (value) => {
    // console.log(value);
    // router.push(`/${value}`)
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

         <Table size="small" columns={columns} style={{width:600}} scroll={{ x: 400, y: 400 }}  dataSource={props.list}
         summary={() => {
        let totalBorrow = props.list.length;
        let totalRepayment = 0;

        props.list.forEach(({ list, floor }) => {
          totalRepayment += list.length*(floor.openSea.floorPrice||0);
        });

        return (
           <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} align="right">
                {totalBorrow} category
                </Table.Summary.Cell>
              <Table.Summary.Cell index={1}  align="right">
                <Text  > <Tag color={'geekblue'} style={{marginLeft:10}}>
              {props.total} 
            </Tag></Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}  align="right">
                <Tag style={{marginRight:10}} color="#3b5999">

               {totalRepayment?(totalRepayment).toFixed(2)+' E':''}
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
let nftsList={}
let error=null

let data=await alchemy.nft.getNftsForOwner(`${context.query?.slug?.[0]}`,
{omitMetadata:false}
).then(res=>{
  res.ownedNfts=res.ownedNfts?.map(item=>{
   
    if(!nftsList[item.contract.address]){
      nftsList[item.contract.address]={
        list:[]
      }
    }
    if(nftsList[item.contract.address]){
      nftsList[item.contract.address]['list'].push({
        tokenId:item.tokenId,
        media:item.media
      })
    }
    return item
  })
  return res
}).catch(e=>{
  console.log(e)
  // console.log(e.value)
  error=e||null
});
  const getFloorPriceFn =async (addrs)=>{
  return await alchemy.nft
    .getFloorPrice(addrs)
    .then(res=>{
      return {
        contract:addrs,
        floor:res
      }
      });
}
 let list=[]
 
 list=await Promise.all(Object.keys(nftsList)?.map(item=>getFloorPriceFn(item))).then(res=>{
    return res
  })

const getName=(url)=>{
  if(!url) return ''
return url.split('/')[url.split('/').length-1]
}




list=await list.map(item=>{
  return {
    ...item,
    name:getName(item?.['floor']?.['openSea']?.['collectionUrl']),
    list:nftsList[item.contract]['list']||null,
    link:`https://opensea.io/assets/ethereum/${item.contract}`
  }
})


data={
  total:data?.totalCount||null,
  list,
  error
}





  return {
    props:data // will be passed to the page component as props
  }
}