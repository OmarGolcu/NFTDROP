import React from 'react'
import {useAddress, useDisconnect, useMetamask,useNFTDrop} from "@thirdweb-dev/react"
import { sanityClient, urlFor } from '../../sanity';
import { GetServerSideProps } from 'next';
import { Collection } from '../../typing';
import Link from 'next/link';
import { useState } from 'react';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface Props{
  collection:Collection
}

function NFTDropPage({collection}:Props) {

const [claimedSupply,setClaimedSupply] = useState<number>(0)
const [totalSupply,setTotalSupply] = useState<number>()
const [loading,setLoading] = useState<boolean>(true)
const [priceInEth,setPriceInEth] = useState<string>('')
const nftDrop = useNFTDrop(collection.address)

  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect()
  console.log(address)

  useEffect(()=>{
    if(!nftDrop) return;

    const fetchPrice = async () =>{
      const claimedConditions = await nftDrop.claimConditions.getAll()
      setPriceInEth(claimedConditions?.[0].currencyMetadata.displayValue)

    }
    
    fetchPrice()

  },[nftDrop])

  useEffect(() => {
    if (!nftDrop) return;
    
    const fetcNFTDropData = async () =>{

        setLoading(true)

        const claimed =  await nftDrop.getAllClaimed();
        let total = await nftDrop.totalUnclaimedSupply()
        const totalSup = total.toNumber() + claimed.length;
   

        setClaimedSupply(claimed.length)
        setTotalSupply(totalSup)

        setLoading(false)

    }
    fetcNFTDropData();

  },[nftDrop])


  const mintNFT = () =>{
    if(!nftDrop || !address) return;
    const quantity = 1;
    setLoading(true)
    const notification = toast.loading('Minting...',{
      style:{
        background:'white',
        color:'green',
        fontWeight:'bolder',
        fontSize:'17px',
        padding:'20px',
      }
    })


    nftDrop.claimTo(address,quantity).then(async (tx)=>{
        const receipt = tx[0].receipt //the transaction receipt
        const claimedTokenId = tx[0].id //the id of the NFT claimed
        const claimedNFT = await tx[0].data() //(optional) get the claimed NFT metadata
        
        toast('You Successfully Minted',{
          duration:8000,
           style:{
             background:'green',
             color:'white',
             fontWeight:'bolder',
             fontSize:'17px',
             padding:'20px'
           }
        })
        console.log(receipt)
        console.log(claimedTokenId)
        console.log(claimedNFT)
      }).catch(err =>{
        console.log(err)
        toast('Something went wrong !',{
          style:{
            background:'red',
            color:'white',
            fontWeight:'bolder',
            fontSize:'17px',
            padding:'20px'
          }
        })
      }).finally(()=>{
        setLoading(false)
        toast.dismiss(notification)
      })

  }

  return (
    <div className="flex flex-col h-screen lg:grid lg:grid-cols-10">
      <Toaster position='bottom-center'/>

        {/* Left Side */}
        <div className="bg-gradient-to-br from-cyan-800 to-rose-500 
        py-2 flex flex-col items-center justify-center lg:min-h-screen 
        lg:col-span-4">
            <div className="bg-gradient-to-br from-yellow-400 to-purple-600 rounded-xl p-2">
                <img
                className="w-44 object-cover rounded-xl lg:h-96 lg:w-72" 
                src={urlFor(collection.previewImage).url()}
                alt="la la la"
                />
            </div>

            <div className="text-center space-y-2 p-5">
              <h1 className="text-4xl font-bold text-white"> {collection.nftCollectionName}</h1>
              <h2 className="text-xl text-gray-300 ">{collection.description}</h2>

            </div>
           
        </div>
        {/* Right Side*/}
      
        <div className='flex flex-col p-12 col-span-6'>
          {/* Header */}
          <header className="flex justify-between item-center">
            <Link href="/">
            <h1 className='w-52 cursor-pointer text-xl font-extralight sm:w-80'>The{' '}<span className='font-bold underline decoration-pink-600/50'>PAPAFAM</span>{' '}NFT MARKET PLACE</h1>
            </Link>
            <button
            onClick={()=> address ? disconnect() : connectWithMetamask()}
            className="bg-rose-400 text-white rounded-full px-4 py-2 text-xs font-semibold
            lg:px-5 lg:py-3 lg:text-base
            ">{address ? 'Sign Out' : 'Sign In'}</button>

          </header>
          <hr className="my-4 border"/>
          {address && <p className='text-center text-sm text-rose-400 font-semibold'>You're Logged in with wallet {address.substring(0,5)}...{address.substring(address.length-5)}</p>}

          {/* Content */}
          <div className="mt-10 flex flex-1 flex-col  items-center space-y-6 lg:space-y-0 lg:justify-center text-center">
            <img
                  className="rounded-md w-80 object-cover lg:h-40 pb-10" 
                  src={urlFor(collection.mainImage).url()}
                  alt="la la la"
                  />
                  <h1 className=' text-3xl font-bold lg:text-4xl lg:font-extrabold'> {collection.title}</h1>
                  {loading ? (
                    <p className="pt-2 text-xl text-green-400 animate-bounce"
                    >Loading Supply Count... </p>
                  ):
                  (
                    <p className='pt-2 text-xl text-green-400'> {claimedSupply} / {totalSupply?.toString()} NFT's claimed</p>
                  )
                  }
                  {loading && (
                    <img 
                    src="https://i.pinimg.com/originals/a2/de/bf/a2debfb85547f48c3a699423ba75f321.gif"
                    className='h-80 w-80 object-contain'
                   /*  src="https://cdn.hackernoon.com/images/0x4Gzjgh9Y7GuBKEtZ.gif" */ alt="" />
                  )}
                
          </div>

          {/* Mint Button */}
          <button
          onClick={mintNFT}
          disabled={loading || claimedSupply === totalSupply || !address}
          className='bg-red-500 w-full rounded-full h-16 text-white mt-5 font-bold text-lg disabled:bg-gray-500'
          >
            {loading ? (
              <>Loading</>
            ): claimedSupply ===totalSupply ?(
              <>SOLD OUT</>
            ) : !address ? (
              <>Sign in to Mint</>
            ) :
            (
            <span>Mint NFT ({priceInEth} ETH)</span>
            )
          }
         </button>
         
          

        </div>
    </div>
  )
}

export default NFTDropPage


export const getServerSideProps: GetServerSideProps = async ({params}) =>{
  const query = `
  *[_type == "collection" && slug.current==$id][0]{
    _id,
    title,
    address,
    description,
    nftCollectionName,
    mainImage{
    asset
  },
   previewImage{
     asset
   },
    slug{
      current
    },
    creator ->{
      _id,
      name,
      address,
      slug{
      current
    },
     bio,
     image{
       asset
     },
  
    }
  }
  ` 
  const collection = await sanityClient.fetch(query,{
    id:params?.id
  })
    
  if(!collection){
    return {
      notFound:true
    }
  }
  return{
    props:{
      collection,
    }
  }
}
