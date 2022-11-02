import { UserCircleIcon } from '@heroicons/react/24/solid';
import { 
  useContract, 
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useOffers,
  useMakeOffer,
  useBuyNow,
  MediaRenderer,
  useAddress, 
  useListing,
} from '@thirdweb-dev/react';
import { ListingType } from '@thirdweb-dev/sdk';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Countdown from 'react-countdown';
import network from '../../utils/network';
import { ethers } from 'ethers';

function ListingPage() {
  const router = useRouter();
  const { listingId } = router.query as { listingId: string };
  const [bidAmount, setBidAmount] = useState('');
  const [, switchNetwork] = useNetwork();
  const networkMismatch = useNetworkMismatch();

  const [minmumNextBid, setMinimumNextbid] = useState<{
    displayValue: string;
    symbol: string;
  }>();

  
  const { contract } = useContract (
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    'marketplace'
    );

    const { mutate: makeBid } = useMakeBid(contract);

  const { data: offers } = useOffers(contract, listingId);
  console.log(offers);

  const { mutate: makeOffer } = useMakeOffer(contract);
  const { mutate: buyNow } = useBuyNow(contract);
  const { data: listing, isLoading, error } = useListing(contract, listingId);

  useEffect (() => {
    if (!listingId || !contract || !listing) return;

    if (listing.type === ListingType.Auction) {
      fetchMinNextBid();
    }
  }, [listingId, listing, contract]);

  console.log(minmumNextBid)

  const fetchMinNextBid = async () => {
    if (!listingId || !contract) return;

    const { displayValue, symbol } = await contract.auction.getMinimumNextBid(listingId);

    setMinimumNextbid({
      displayValue: displayValue,
      symbol: symbol,
    });
  };

  const formatPlaceHolder = () => {
    if (!listing) return;
    if (listing.type === ListingType.Direct) {
      return "Enter Offer Amount"
    }

    if (listing.type === ListingType.Auction) {
      return Number(minmumNextBid?.displayValue) === 0
        ? "Enter Bid Amount" 
        : `${minmumNextBid?.displayValue} ${minmumNextBid?.symbol} or more`;
    }
  };

  const buyNft = async () => {
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!listingId || !contract || !listing) return;

    await buyNow(
      {
        id: listingId,
        buyAmount: 1,
        type: listing.type,
      },
      {
        onSuccess(data, variables, context) {
          alert("NFT bought succcessfuly!");
          console.log('SUCCESS', data, variables, context);
          router.replace('/')
        },
        onError(error, variables, context) {
          alert("ERROR: NFT could not be bought");
          console.log("ERROR", error, variables, context);
        },
      }
    );
  };

  const createBidOrOffer = async () => {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(network);
        return;
      }

      // Direct Listing
      if (listing?.type === ListingType.Direct) {
        if (listing.buyoutPrice.toString() === ethers.utils.parseEther(bidAmount).toString()) {
          console.log("Buyout Price met, buying NFT...");

          buyNft();
          return;
        }

        console.log("Buyout price not met, making offer...")
        await makeOffer(
          {
            quantity: 1,
            listingId,
            pricePerToken: bidAmount,
          }, 
          {
            onSuccess(data, variables, context) {
              alert("Offer made successfully!");
              console.log("SUCESS", data, variables, context);
              setBidAmount('')
            },
            onError(error, variables, context) {
              alert("ERROR: Offer could not be made");
              console.log("ERROR", error, variables, context);
            }
          }
        );
      }

      // Auction Listing
      if (listing?.type === ListingType.Auction) {
        console.log('Making Bid...');

        await makeBid(
          {
            listingId,
            bid: bidAmount,
          }, 
          {
            onSuccess(data, variables, context) {
              alert("Bid made successfully!");
              console.log("SUCCESS", data, variables, context);
            },
            onError(error, variables, context) {
              alert("ERROR: Bid could not be made");
              console.log("ERROR", error, variables, context);
            },
          }
        );
      }
    } catch (error) {
      console.log(error)
    }
  };

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

      <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
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

            <button onClick={buyNft} className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10">
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
                <p>Current Minimum Bid: </p>
                <p className="font-bold ">
                  {minmumNextBid?.displayValue}{" "}
                  {minmumNextBid?.symbol}
                </p>

                {/* Using React extension called "React Countdown" */}
                <p>Time Remaining:</p>
                <Countdown 
                  date={Number(listing.endTimeInEpochSeconds.toString()) * 1000}
                />
              </>
            )}

            <input 
              className="border p-2 rounded-lg mr-5" 
              type="text"
              onChange={e => setBidAmount(e.target.value)}
              placeholder={formatPlaceHolder()}
            />
            <button 
              onClick={createBidOrOffer} 
              className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10">
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

