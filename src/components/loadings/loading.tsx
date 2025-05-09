import Lottie from 'react-lottie';
import animationData from '../../assets/animations/Loading.json'

const Loading = ({ width = 81, height = 81 }) => {

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
            <Lottie
                options={defaultOptions}
                height={height}
                width={width}
            />
        </div>
    )
}

export default Loading;