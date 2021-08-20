import Canvas from './Canvas.js';
import {useRef} from 'react';

const RenderView = ({src, max, min}) => {
	const imageRef = useRef(null);

	return (
		<div className="w-2/3 mx-auto h-2/3 flex justify-center">
			<div
				className="
					w-full
					relative
					mb-3
				"
			>
				<img
					ref={imageRef}
					src={src}
					className="
					z-0
					left-0
					top-0
					h-auto
					w-auto
					w-max-full
					object-contain
					absolute
					"
					alt="rendered fractals"
				/>
				<Canvas 
					max={max}
					min={min}
					imageRef={imageRef}
				/>
			</div>
		</div>
	);
};

export default RenderView;
