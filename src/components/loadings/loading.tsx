'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import animationData from '../../assets/animations/Loading.json';

const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

const Loading = ({ width = 81, height = 81 }) => {
    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
        setDomLoaded(true);
    }, []);

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className="flex justify-center items-center">
            {domLoaded && (
                <Lottie
                    options={defaultOptions}
                    height={height}
                    width={width}
                />
            )}
        </div>
    );
};

export default Loading;