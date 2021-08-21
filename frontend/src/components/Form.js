import {useState} from 'react';
import {PORT, MandelbrotCoords} from '../constants.js';
import RenderView from './RenderView.js';

const coordsToValueString = (coords) => {
	return `${coords.x} ${coords.y}`;
};

const PresetCoords = ({value, handleChange, handleClick}) => {
	return (
		<div className="flex mt-2">
			<select 
				className="outline-none"
				value={value}
				onChange={e => handleChange(e.target.value)}
			>
				{
					MandelbrotCoords.map((coords, index) => {
						let asString = `x: ${coords.x}, y: ${coords.y}`
						return (
							<option
								key={index}
								value={`${coords.x} ${coords.y}`}
							>
								{asString}
							</option>
						);
					})
				}
			</select>
			<button
				className="
				bg-red-400
				hover:bg-red-300
				p-2
				ml-2
				outline-none
				"
				onClick={() => handleClick(value)}
			>
				Use preset
			</button>
		</div>
	);
};

const CoordInput = ({
	label,
	name,
	value,
	handleChange,
}) => {
	return (
		<div className="flex">
			<label className="self-center" htmlFor={name}>{label}</label>
			<input 
				name={name}
				className="
				my-2
				ml-2
				w-6em
				pl-1
				outline-none
				self-center
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
		<div className="flex">
			<label className="self-center" htmlFor="zoom">Zoom Level:</label>
			<input 
				name="zoom"
				className="
				my-2
				ml-2
				w-6em
				pl-1
				self-center
				outline-none
				"
				type="number" 
				min="1"
				value={value}
				onChange={e => handleChange(e.target.value)}
			/>
			<button
				className="
					mx-2
					p-1
					bg-blue-400
					hover:bg-blue-300
					outline-none
					rounded-md
				"
				onClick={e => handleChange(value / 10)}
			>-10x</button>
			<button
				className="
					mx-2
					p-1
					bg-red-400
					hover:bg-red-300
					outline-none
					rounded-md
				"
				onClick={e => handleChange(value * 10)}
			>10x</button>
		</div>
	);
};

const AAInput = ({checked, handleChange}) => {
	return (
		<div className="flex">
			<input 
				className="self-center"
				type="checkbox"
				name="antiAliasing"
				onChange={e => handleChange(e)}
				checked={checked}
			/>
			<label
				className="
				self-center
				ml-2
				"
				for="antiAliasing"
			>
				Anti-Aliasing
			</label>
		</div>
	);
};

const FractalTypeInput = ({value, handleChange}) => {
	return (
		<div className="flex">
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
	const [clientBounds, setClientBounds] = useState({
		x: 0, y: 0, zoom: 1.0,
	});
	const [renderBounds, setRenderBounds] = useState({
		x: 0, y: 0, xmin: -2.0, xmax: 2.0, ymin: -2.0, ymax: 2.0,
	});
	const [fractalType, setFractalType] = useState("mandlebrot");
	const [imageStr, setImageStr] = useState("");
	const [loading, setLoading] = useState(false);
	const [antiAliasing, setAntiAliasing] = useState(false);
	const [presetCoords, setPresetCoords] = useState(
		coordsToValueString(MandelbrotCoords[0]));
	const [textColor, setTextColor] = useState("white");

	const handleSubmit = () => {
		const data = {
			x: parseFloat(clientBounds.x),
			y: parseFloat(clientBounds.y),
			zoom: parseFloat(clientBounds.zoom),
			fractalType,
			antiAliasing,
		};
		console.log("JSON.stringify:", JSON.stringify(data))

		setLoading(true);
		setImageStr("");
		fetch(`http://localhost:${PORT}/api/renderFractal`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
		.then(response => {
				return response.json()
			}
		)
		.then(data => {
			console.log(data);
			setRenderBounds({
				...renderBounds,
				x: data.x,
				y: data.y,
				xmax: data.xmax,
				xmin: data.xmin,
				ymax: data.ymax,
				ymin: data.ymin,
			});
			setImageStr("data:image/jpeg;base64,"+data.base64);
			setLoading(false);
		})
		.catch(error => {
			console.error("Error:", error);
			setLoading(false);
		});
	};

	const usePreset = (value) => {
		let coords = value.split(" ");
		let x = coords[0];
		let y = coords[1];
		setClientBounds({...clientBounds, x, y});
	};

	const useCursorCoords = (coords) => {
		setClientBounds({...clientBounds, x: coords.x, y: coords.y});
	};

	return (
		<div
			className="
				my-auto
				mx-auto
				shadow-2xl
				rounded-lg
				bg-gray-400
				w-2/3
				lg:w-3/5
				2xl:w-5/12
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
			<div className="p-3 flex flex-col">
				<FractalTypeInput 
					value={fractalType}
					handleChange={v => setFractalType(v)}
				/>
				<PresetCoords 
					value={presetCoords}
					handleChange={v => setPresetCoords(v)}
					handleClick={usePreset}
				/>
				<CoordInput 
					label={"x-coordinate:"}
					name={"x"}
					value={clientBounds.x}
					handleChange={v => setClientBounds({...clientBounds, x: v})}
				/>
				<CoordInput 
					label={"y-coordinate:"}
					name={"y"}
					value={clientBounds.y}
					handleChange={v => setClientBounds({...clientBounds, y: v})}
				/>
				<ZoomInput 
					value={clientBounds.zoom}
					handleChange={v => setClientBounds({...clientBounds, zoom: v})}
				/>
				<AAInput
					checked={antiAliasing}
					handleChange={e => setAntiAliasing(e.target.checked)}
				/>
				<button
					className="
					mt-3
					rounded-md
					bg-red-400
					hover:bg-red-300
					p-3
					font-mono
					outline-none
					"
					onClick={handleSubmit}
				>
					RENDER FRACTAL
				</button>
			</div>
				{loading ? <span>Rendering fractal...</span> : <></>}
				{imageStr
					? <RenderView 
							src={imageStr}
							handleSetPosition={useCursorCoords}
							handleSetTextColor={v => setTextColor(v)}
							renderBounds={renderBounds}
							textColor={textColor}
						/>
					: <></>
				}
		</div>
	);
};

export default Form;
