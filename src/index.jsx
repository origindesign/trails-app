import { render } from 'preact';

import SectionMap from './components/section-map.js';
// import preactLogo from './assets/preact.svg';
import './style.scss';

export function App() {
	return (
		<div>
			<SectionMap />
		</div>
		
	);
}

render(<App />, document.getElementById('app'));
