import { render } from 'preact';

import SectionMap from './components/section-map.jsx';
// import preactLogo from './assets/preact.svg';
import './style.scss';

if (import.meta.env.MODE !== 'development') {
    const script = document.createElement('script');
    script.src = "https://www.bugherd.com/sidebarv2.js?apikey=mtsjorqyssra06hkeutdzq";
    script.async = true;
    document.body.appendChild(script);
}

export function App() {
	return (
		<div>
			<SectionMap />
		</div>
		
	);
}

render(<App />, document.getElementById('app'));
