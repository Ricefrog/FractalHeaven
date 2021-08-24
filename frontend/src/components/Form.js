import {useState, useEffect} from 'react';
import {PORT, MandelbrotCoords} from '../constants.js';
import RenderView from './RenderView.js';

const coordsToValueString = (coords) => {
	return `${coords.x} ${coords.y}`;
};

const PresetCoords = ({value, handleChange, handleClick}) => {
	return (
		<div className="flex mt-2">
			<select 
				className="w-1/2 outline-none"
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
				w-1/3
				sm:w-6em
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
				htmlFor="antiAliasing"
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
	const [index, setIndex] = useState(-1);
	const [history, setHistory] = useState([]);
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

	const navButtonActiveClass = "bg-blue-400 hover:bg-blue-300 w-full sm:w-1/6 sm:h-2/3 "
		+ "rounded-md font-mono outline-none p-3 flex-grow";

	const navButtonInactiveClass = "bg-blue-300 sm:w-1/6 w-full sm:h-2/3 flex-grow "
		+ "rounded-md font-mono text-white outline-none p-3 cursor-not-allowed";

	/*
	const showInfo = () => {
		console.log(history);
		console.log(index);
	};
	*/

	const goBack = () => {
		if (index > 0) {
			objectToClientBounds(history[index-1]);
			setIndex(index-1);
		}
	};

	const goForward = () => {
		if (index < history.length) {
			objectToClientBounds(history[index+1]);
			setIndex(index+1);
		}
	};

	const objectToClientBounds = (object) => {
		setClientBounds({
			x: object.x,
			y: object.y,
			zoom: object.zoom,
			fractalType: object.fractalType,
			antiAliasing: object.antiAliasing,
		});
		setRenderBounds({
			x: object.x,
			y: object.y,
			xmax: object.xmax,
			xmin: object.xmin,
			ymax: object.ymax,
			ymin: object.ymin,
		});
		setFractalType(object.fractalType);
		setAntiAliasing(object.antiAliasing);
		setImageStr(object.imageStr);
	};

	const handleSubmit = () => {
		const clientData = {
			x: parseFloat(clientBounds.x),
			y: parseFloat(clientBounds.y),
			zoom: parseFloat(clientBounds.zoom),
			fractalType,
			antiAliasing,
		};
		//console.log("JSON.stringify:", JSON.stringify(data))

		setLoading(true);
		setImageStr("");
		fetch(`http://localhost:${PORT}/api/renderFractal`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(clientData),
		})
		.then(response => {
				return response.json()
			}
		)
		.then(data => {
			const newRenderBounds = {
				x: data.x,
				y: data.y,
				xmax: data.xmax,
				xmin: data.xmin,
				ymax: data.ymax,
				ymin: data.ymin,
			}
			setRenderBounds(newRenderBounds);

			const historyItem = {
				...newRenderBounds,
				...clientData,
				imageStr: "data:image/jpeg;base64,"+data.base64,
			};
			const prevHistory = history.filter((el, i) => i <= index);
			setHistory([...prevHistory, historyItem]);
			setIndex(index+1);

			setImageStr("data:image/jpeg;base64,"+data.base64);
			setLoading(false);
		})
		.catch(error => {
			console.error("Error:", error);
			setLoading(false);
		});
	};

	useEffect(() => {
		handleSubmit();
	}, []);

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
				xl:w-1/2
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
				<div className="my-4 flex items-center sm:flex-row flex-col">
					<button
						className={
							index > 0 
								? navButtonActiveClass : navButtonInactiveClass
						}
						onClick={goBack}
					>
						Back
					</button>
					<button
						className="
						rounded-md
						bg-red-400
						hover:bg-red-300
						mx-2
						p-3
						font-mono
						outline-none
						w-full
						sm:flex-grow
						"
						onClick={handleSubmit}
					>
						RENDER FRACTAL
					</button>
					<button
						className={
							index < history.length-1
								? navButtonActiveClass : navButtonInactiveClass
						}
						onClick={goForward}
					>
						Forward	
					</button>
				</div>
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
