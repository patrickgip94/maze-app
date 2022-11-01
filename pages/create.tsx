import React, { useState } from 'react';
import Header from '../components/Header';
import { 
  useAddress, 
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import { NFT } from '@thirdweb-dev/sdk';


type Props = {}

function Create ({}: Props) {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    'marketplace'
  );
  const [selectedNft, setSelectedNft] = useState<NFT>();

  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION,
    'nft-collection'
  );

  const ownedNfts = useOwnedNFTs(collectionContract, address);

  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">Select an Item you would like to Sell</h2>

        <hr className="mb-5" />

        <p>Below you will find the NFT's you own in your wallet</p>
        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNfts?.data?.map(nft => (
            <div 
              key={nft.metadata.id}
              onClick={() => setSelectedNft(nft)}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${nft.
                metadata.id === selectedNft?.metadata.id 
                ? "border-black" 
                : "border-transparent"
              }`}
            >
              <MediaRenderer 
                className="h-48 rounded-lg" 
                src={nft.metadata.image} 
              />
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form>
            <div>
              <div className="flex flex-col p-10">
                <label>Direct Listing / Fixed Price</label>
                <input 
                  type="radio" 
                  name="listingType" 
                  value="directListing"
                  className="ml-auto h-10 w-10" 
                />

                <label>Auction</label>
                <input 
                  type="radio" 
                  name="listingType" 
                  value="auctionListing"
                  className="ml-auto h-10 w-10" 
                />


              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
};

export default Create;