import Form from './components/Form.js';
import About from './components/About.js';
import {useState} from 'react';

const App = () => {
	const [aboutOpen, setAboutOpen] = useState(false);

  return (
		<div 
			className="
				bg-gradient-to-tr 
				from-green-400
				via-pink-300
				to-indigo-500
				min-h-screen
				flex
			"
		>
			<div
				className="
				m-4
				left-0
				top-0
				absolute
				font-mono
				cursor-pointer
				text-gray-600
				"
				onClick={() => setAboutOpen(!aboutOpen)}
			>
				{aboutOpen ? "Back" : "About"}
			</div>
			{aboutOpen
				? <About handleClose={() => setAboutOpen(false)}/>
				: <Form />
			}
		</div>
  );
};

export default App;
