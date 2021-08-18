import {useState} from 'react';

const CoordInput = ({
	label,
	name,
	value,
	handleChange,
}) => {
	return (
		<div className="left-0">
			<label for={name}>{label}</label>
			<input 
				name={name}
				className="
				my-2
				ml-2
				w-6em
				pl-1
				outline-none
				"
				type="number" 
				min="-2"
				max="2"
				step="0.001"
				value={value}
				onChange={e => handleChange(e.target.value)}
			/>
		</div>
	);
};

const ZoomInput = ({
	value,
	handleChange,
}) => {
	return (
		<div className="left-0">
			<label for="zoom">Zoom Level:</label>
			<input 
				name="zoom"
				className="
				my-2
				ml-2
				w-6em
				pl-1
				"
				type="number" 
				min="1"
				value={value}
				onChange={e => handleChange(e.target.value)}
			/>
		</div>
	);
};

const FractalTypeInput = ({value, handleChange}) => {
	return (
		<div>
			<select 
				className="outline-none"
				value={value}
				onChange={e => handleChange(e.target.value)}
			>
				<option value="mandelbrot">Mandelbrot</option>
				<option value="newton">Newton</option>
			</select>
		</div>
	);
};

const Form = () => {
	const [x, setX] = useState(0.0);
	const [y, setY] = useState(0.0);
	const [zoom, setZoom] = useState(1.0);
	const [fractalType, setFractalType] = useState("mandlebrot");

	return (
		<div
			className="
				my-auto
				mx-auto
				shadow-2xl
				rounded-lg
				bg-gray-400
				w-2/3
				text-center
				flex
				flex-col
			"
		>
			<div 
				className="
				flex-start
				rounded-t-lg
				w-full
				bg-green-300
				font-mono
				underline
				"
			>
				Fractal Heaven
			</div>
			<div className="p-3">
				<FractalTypeInput 
					value={fractalType}
					handleChange={v => setFractalType(v)}
				/>
				<CoordInput 
					label={"x-coordinate:"}
					name={"x"}
					value={x}
					handleChange={v => setX(v)}
				/>
				<CoordInput 
					label={"y-coordinate:"}
					name={"y"}
					value={y}
					handleChange={v => setY(v)}
				/>
				<ZoomInput 
					value={zoom}
					handleChange={v => setZoom(v)}
				/>
				<button
					className="
					rounded-md
					bg-red-400
					hover:bg-red-300
					p-3
					font-mono
					"
				>
					RENDER FRACTAL
				</button>
			</div>
		</div>
	);
};

export default Form;
