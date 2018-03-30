import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import Datepicker from './Datepicker';
Promise.resolve().then(e =>
{
	render(<App/>, document.body.appendChild(document.createElement('div')));
});
const App = ({
}) => (
	<div className="app-component box">
		<Datepicker/>
	</div>
);