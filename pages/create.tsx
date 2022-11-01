import React from 'react';
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


type Props = {}

function Create ({}: Props) {
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    'marketplace'
  );

  return (
    <div>
      <Header />

      <main>
        <h1>List an Item</h1>
        <h2>Select an Item you would like to Sell</h2>
      </main>
    </div>
  )
};

export default Create;