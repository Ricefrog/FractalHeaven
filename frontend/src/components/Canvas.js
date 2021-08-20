import React, {useRef, useEffect} from 'react';

const Canvas = ({imageRef, max, min}) => {
	const canvasRef = useRef(null);

	const makeCoordsRelative = (ctx, canvasPos) => {
		let width = ctx.canvas.width;
		let mid = width / 2.0;
		let x = canvasPos.x - mid;
		let y = mid - canvasPos.y;
		let relX = (x / mid) * max;
		let relY = (y / mid) * max;
		/*
		console.log("width:", width, "mid:", mid);
		console.log("before:", "x:", canvasPos.x, "y:", canvasPos.y);
		*/
		console.log("max:", max);
		console.log("x:", x, "y:", y);
		console.log("relX:", relX, "relY:", relY);
	};

	const getMousePos = (canvas, event) => {
		let rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		};
	};

	const fillDraw = (ctx, fillColor) => {
		ctx.fillStyle = fillColor;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	};

	const handleResize = () => {
		const canvas = canvasRef.current;
		const image = imageRef.current;
		const context = canvas.getContext("2d");

		canvas.width = image.offsetWidth;
		canvas.height = image.offsetHeight;
		fillDraw(context, "rgba(0, 0, 255, 0.5)");
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext("2d");

		window.onresize = () => {
			handleResize();
			setTimeout(handleResize, 1);
		};


		canvas.addEventListener("mousemove", (event) => {
			let mousePos = getMousePos(canvas, event);
			makeCoordsRelative(context, mousePos);
		}, false);
		handleResize();
		setTimeout(handleResize, 1);
	}, [handleResize, makeCoordsRelative]);

	return (
		<canvas
			className="
			left-0
			relative
			z-10
			"
			ref={canvasRef} 
		/>
	);
};

export default Canvas;
