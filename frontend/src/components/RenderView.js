import Canvas from './Canvas.js';
import {useRef, useState} from 'react';

const RenderView = ({
	src,
	renderBounds,
	handleSetPosition,
	handleSetTextColor,
	textColor,
}) => {
	const [fullscreen, setFullscreen] = useState(false);
	const imageRef = useRef(null);

	const defaultImageClass = "z-10 left-0 top-0 h-auto w-auto w-max-full"
		+ "object-contain absolute";
	const fullscreenStyle = {
		//top: "10%",
		margin: "auto",
		top: "0",
		bottom: "0",
		right: "0",
		left: "0",
	};
	const fullscreenImageClass = "z-10 w-5/6 xl:w-3/5 absolute";

	const defaultContainerClass = "mb-3 w-full relative";
	const fullscreenContainerClass = 
		"w-screen h-screen bg-black bg-opacity-50"
		+ " fixed top-0 left-0";

	return (
		<div className="w-2/3 mx-auto h-2/3 flex flex-col justify-center">
			<button
				className="bg-blue-300 hover:bg-blue-200 outline-none"
				onClick={() => {
					textColor === "white" 
						? handleSetTextColor("black")
						: handleSetTextColor("white");
				}}
			>
				Change text color to {textColor === "white" ? "black" : "white"}.
			</button>
			<button
				className="
				bg-indigo-500
				hover:bg-indigo-400
				outline-none
				"
				onClick={() => setFullscreen(!fullscreen)}
			>
				Fullscreen
			</button>
			<div
				className={
					fullscreen ? fullscreenContainerClass : defaultContainerClass
				}
			>
				<img
					style={fullscreen ? fullscreenStyle : {}}
					ref={imageRef}
					src={src}
					className={fullscreen ? fullscreenImageClass : defaultImageClass}
					alt="rendered fractals"
				/>
				<Canvas 
					fullscreen={fullscreen}
					handleChangeFullscreen={v => setFullscreen(v)}
					fullscreenStyle={fullscreenStyle}
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
