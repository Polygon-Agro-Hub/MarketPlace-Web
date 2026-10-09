import React from 'react';
import { EmptyCardDetails } from '../CardDetailsComponents/EmptyCardDetails';
import ExistCardDetails from '../CardDetailsComponents/ExistCardDetails';

const CardDetails = () => {
    const [isCardDetailsEmpty, setIsCardDetailsEmpty] = React.useState(false);

    const handleAddCard = () => {
        console.log('Navigating to add card flow...');
    };

    return (
        <div className="w-full">
            <div className="w-full max-w-full mx-auto px-8 sm:px-10 py-3 sm:py-4 flex flex-col gap-1 sm:gap-1">
                <p className="text-xl sm:text-2xl font-[500] text-black">
                    Saved Debit / Credit Card
                </p>
                <p className="text-sm sm:text-base text-[#626D72]">
                    Manage your payment cards for accelerated 1-click checkout and seamless ledger settlement.
                </p>
                <hr className="border-gray-400" />
                

            </div>
            <div>
                {isCardDetailsEmpty ? (
                    <EmptyCardDetails onAddCard={handleAddCard} />
                ) : (
                    <ExistCardDetails />
                )}
            </div>
        </div>
    );
};

export default CardDetails;