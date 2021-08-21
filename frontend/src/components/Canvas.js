import React, {useRef, useEffect, useCallback} from 'react';

const Canvas = ({
	imageRef,
	renderBounds,
	handleSetPosition,
	textColor,
}) => {
	const canvasRef = useRef(null);

	const getRelativePosition = useCallback((canvasPos) => {
		const ctx = canvasRef.current.getContext("2d");
		let width = ctx.canvas.width;
		let mid = width / 2.0;
		// percent distance from center
		let xScale = (canvasPos.x - mid)/mid;
		let yScale = (mid - canvasPos.y)/mid;
		// percent distance from the center
		// multiplied by the scaled width between the center and the max bound
		// plus the center offset
		let relX = xScale*(renderBounds.xmax-renderBounds.x)+renderBounds.x;
		let relY = yScale*(renderBounds.ymax-renderBounds.y)-renderBounds.y;

		return {x: relX, y: relY};
	}, [canvasRef, renderBounds]);

	const drawPosition = useCallback((ctx, x, y) => {
		const font = "Courier New";
		const width = ctx.canvas.width;
		const fontSize = Math.floor(width / 30);
		const textX = Math.floor(width / 10);
		const textY = Math.floor(width / 10);

		ctx.font = `${fontSize}px ${font}`;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = textColor;
		ctx.fillText("Click to apply cursor position.", textX, textY);
		ctx.fillText(`x: ${x}`, textX, textY + fontSize);
		ctx.fillText(`y: ${y}`, textX, textY + 2*fontSize);
	}, [textColor]);

	const renderMousePosition = useCallback((canvasPos) => {
		const ctx = canvasRef.current.getContext("2d");
		const coords = getRelativePosition(canvasPos);
		drawPosition(ctx, coords.x, coords.y);
	}, [canvasRef, drawPosition, getRelativePosition]);

	const getMousePos = (event) => {
		const canvas = canvasRef.current;
		let rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		};
	};

	/*
	const fillDraw = (ctx, fillColor) => {
		ctx.fillStyle = fillColor;
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	};
	*/

	const handleResize = useCallback(() => {
		const canvas = canvasRef.current;
		const image = imageRef.current;
		if (!canvas || !image) {
			return
		}

		canvas.width = image.offsetWidth;
		canvas.height = image.offsetHeight;
	}, [canvasRef, imageRef]);

	/*
	const canvasFits = useCallback(() => {
		const canvas = canvasRef.current;
		const image = imageRef.current;
		return (
			(canvas.width === image.offsetWidth) &&
			(canvas.height === image.offsetHeight)
		);
	}, [canvasRef, imageRef]); */

	useEffect(() => {
		const canvas = canvasRef.current;

		const resize = () => {
			handleResize();
			setTimeout(handleResize, 1);
			setTimeout(() => renderMousePosition({x: 0, y: 0}), 10);
		};

		window.addEventListener("resize", resize);

		canvas.addEventListener("mousemove", (event) => {
			let mousePos = getMousePos(event);
			renderMousePosition(mousePos);
		}, false);

		canvas.addEventListener("click", (event) => {
			let mousePos = getMousePos(event);
			let coords = getRelativePosition(mousePos);
			handleSetPosition({x: coords.x, y: coords.y});
		}, false);

		resize();

		return () => {
			window.removeEventListener("resize", resize);
			canvas.removeEventListener("mousemove", handleResize);
		};
	}, [handleResize, renderMousePosition, handleSetPosition, getRelativePosition]);

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
