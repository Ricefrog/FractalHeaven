import Canvas from './Canvas.js';
import {useRef, useState} from 'react';

const RenderView = ({src, renderBounds, handleSetPosition}) => {
	const [textColor, setTextColor] = useState("white");
	const imageRef = useRef(null);
	return (
		<div className="w-2/3 mx-auto h-2/3 flex flex-col justify-center">
			<button
				className="bg-blue-300"
				onClick={() => {
					textColor === "white" 
						? setTextColor("black")
						: setTextColor("white");
				}}
			>
				Change text color to {textColor === "white" ? "black" : "white"}.
			</button>
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
					renderBounds={renderBounds}
					handleSetPosition={handleSetPosition}
					imageRef={imageRef}
					textColor={textColor}
				/>
			</div>
		</div>
	);
};

export default RenderView;
