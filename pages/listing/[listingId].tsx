import { UserCircleIcon } from '@heroicons/react/24/solid';
import { MediaRenderer, useContract, useListing } from '@thirdweb-dev/react';
import { ListingType } from '@thirdweb-dev/sdk';
import { useRouter } from 'next/router';
import React from 'react';
import Header from '../../components/Header';

function ListingPage() {
  const router = useRouter();
  const { listingId } = router.query as { listingId: string };

  const { contract } = useContract (
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    'marketplace'
  );
  
  const { data: listing, isLoading, error } = useListing(contract, listingId);

  const formatPlaceHolder = () => {
    if (!listing) return;
    if (listing.type === ListingType.Direct) {
      return "Enter Offer Amount"
    }

    if (listing.type === ListingType.Auction) {
      return "Enter Bid Amount"

    {/* TODO: Improve Big Amount   */}
    }
  }

  if (isLoading) 
    return (
    <div>
      <Header />
      <div className="text-center animate-pulse text-blue-500">
        <p>Loading Item...</p>
      </div>
    </div>
    );
  

  if (!listing) {
    return <div>Listing not found!</div>;
  }



  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-2 flex-col lg:flex-row space-y-10 space-x-5 pr-10">
        <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
          <MediaRenderer src={listing.asset.image} />
        </div>
        {/* Item name / Item description / seller id */}
        <section className="flex-1 space-y-5 pb-20 lg:pb-0">
          <div>
            <h1 className="text-xl font-bold" >{listing.asset.name}</h1>
            <p className="text-gray-600">{listing.asset.description}</p>
            <p className="flex items-center text-xs sm:text-base">
              <UserCircleIcon className="h-5" />
              <span className="font-bold pr-1">Seller: </span>
              {listing.sellerAddress}
            </p>
          </div>

          {/* Listing Section */}
          <div className="grid grid-cols-2 items-center py-2">
            <p className="font-bold">Listing Type:</p>
            <p>
              {listing.type === ListingType.Direct 
                ? "Direct Listing " 
                : "Auction Listing"}
            </p>
            <p className="font-bold ">Buy it Now Price: </p>
            <p className="text-4xl font-bold">
              {listing.buyoutCurrencyValuePerToken.displayValue}{" "} 
              {listing.buyoutCurrencyValuePerToken.symbol}
            </p>

            <button className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10">
              Buy Now!
            </button>
          </div>

          {/* TODO: If DIRECT, show offers here... */}
          
          <div className="grid grid-cols-2 space-y-2 items-center justify-end">

            <hr className='col-span-2'/>
            
            <p className='col-span-2 font-bold '>
              {listing.type === ListingType.Direct 
              ? "Make an offer" 
              :"Bid on this Auction"}
            </p>

            {/* TODO: Remaining time on auction goes here */}
            {listing.type === ListingType.Auction && (
              <>
                <p>Current Minimum Bid:</p>
                <p>...</p>

                <p>Time Remaining:</p>
                <p>...</p>
              </>
            )}

            <input 
              className="border p-2 rounded-lg mr-5" 
              type="text" 
              placeholder={formatPlaceHolder()}
            />
            <button className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10">
              {listing.type === ListingType.Direct 
              ? "Offer" 
              : "Bid"}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
};

export default ListingPage;

