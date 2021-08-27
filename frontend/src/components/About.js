const About = ({handleClose}) => {
	return (
		<div
			className="
			my-auto
			mx-auto
			shadow-2xl
			rounded-lg
			bg-black
			w-2/3
			lg:w-3/5
			xl:w-1/2
			2xl:w-5/12
			flex
			flex-col
			"
		>
			<div className="rounded-t-lg bg-green-300 flex">
				<div
					className="
					underline
					text-center
					font-mono
					flex-grow
					"
				>
					About
				</div>
				<div
					className="
					cursor-pointer
					justify-self-end
					mr-4
					"
					onClick={handleClose}
				>x</div>
			</div>
			<div className="m-8 text-white">
				<p>
					Types of fractals available for rendering:
					<br />Mandelbrot set:{" "}
					<a 
						className="text-indigo-700"
						target="_blank"
						href="https://en.wikipedia.org/wiki/Mandelbrot_set">
						https://en.wikipedia.org/wiki/Mandelbrot_set
					</a>
					<br />Newton fractals:{" "}
					<a 
						className="text-indigo-700"
						target="_blank"
						href="https://en.wikipedia.org/wiki/Newton_fractal">
						https://en.wikipedia.org/wiki/Newton_fractal
					</a>
				</p>
				<p className="my-5">
					How to use program:<br />
					Click anywhere on the rendered image to use those coordinates for the
					next render. If you need absolute coordinates feel free to use the 
					text input boxes.
					<br />
					+/- 10x zoom is generally a good way to navigate. Granularity can be 
					added after finding a general zoom range you want to explore.
					<br />
					Use the "Back" and "Forward" buttons to quickly load previous renders + presets.
				</p>
				<p className="mb-5">
					Server error:
					<br />
					The most likely reason for seeing this error would be because the 
					render was taking too long. The service I am using will timeout when 
					renders take longer than ten seconds. Rendering without color and without anti-aliasing will take the least amount of time.
				</p>
				<p>
					Extra:
					<br />
					When rendering fractals from the Mandelbrot set try out some of
					the presets with different zoom levels. I found these coordinates on 
					<a
						href="http://www.cuug.ab.ca/dewara/mandelbrot/Mandelbrowser.html"
						className="text-indigo-700"
					>
						{" "}this
					</a> website.
					<br />
					Mobile users -> While Fractal Heaven is <i>usable</i> on mobile, 
					the optimal experience is on a larger screen.

				</p>
			</div>
		</div>
	);
};

export default About;
