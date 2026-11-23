import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { EmptyCardDetails } from '../CardDetailsComponents/EmptyCardDetails';
import ExistCardDetails from '../CardDetailsComponents/ExistCardDetails';
import {
    getSavedCard,
    startAddCard,
    removeSavedCard,
    SavedCard,
} from '@/services/card-service';

const CardDetails = () => {
    // Token comes from the auth slice
    const token = useSelector((state: RootState) => state.auth.token);

    const [card, setCard] = React.useState<SavedCard | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        // Not logged in (or the store hasn't loaded the token yet): nothing to fetch
        if (!token) {
            setLoading(false);
            return;
        }

        const load = async () => {
            const params = new URLSearchParams(window.location.search);
            const returning = params.get('card') === 'return';

            try {
                let found = await getSavedCard(token);

                // Back from the gateway checkout: the card may take a moment to appear
                for (let i = 0; returning && !found && i < 6; i++) {
                    await new Promise((r) => setTimeout(r, 2000));
                    found = await getSavedCard(token);
                }

                setCard(found);

                if (returning && !found) {
                    setError(
                        "We couldn't save your card. Please try again and tick 'save card' at checkout."
                    );
                }
            } catch {
                setError('Could not load your card.');
            } finally {
                // Clean ?card=return from the URL so a refresh doesn't poll again
                if (returning) {
                    window.history.replaceState({}, '', window.location.pathname);
                }
                setLoading(false);
            }
        };

        load();
    }, [token]);

    const handleAddCard = async () => {
        if (!token) return;
        setBusy(true);
        setError('');
        try {
            const checkoutUrl = await startAddCard(token);
            window.location.href = checkoutUrl;
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Could not start card setup.');
            setBusy(false);
        }
    };

    const handleRemoveCard = async () => {
        if (!token) return;
        if (!window.confirm('Remove this card?')) return;
        setBusy(true);
        setError('');
        try {
            await removeSavedCard(token);
            setCard(null);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Could not remove card.');
        } finally {
            setBusy(false);
        }
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
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            <div>
                {loading ? (
                    <p className="text-center text-gray-500 py-12">Loading...</p>
                ) : card ? (
                    <ExistCardDetails
                        card={card}
                        onRemoveCard={handleRemoveCard}
                        removing={busy}
                    />
                ) : (
                    <EmptyCardDetails onAddCard={handleAddCard} busy={busy} />
                )}
            </div>
        </div>
    );
};

export default CardDetails;