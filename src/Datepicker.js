import React from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import _ from 'lodash';
import './Datepicker.scss';
import Calendar from './Calendar';
Object.assign(Node.prototype, {
	on : function (e, handler) { _.castArray(e).map(e => this.addEventListener(e, handler)); }, 
	off: function (e, handler) { _.castArray(e).map(e => this.removeEventListener(e, handler)); }, 
	hittest: function (x, y)
	{
		const { left, top, right, bottom } = this.getBoundingClientRect();
		return _.inRange(x, left, right) && _.inRange(y, top, bottom);
	}, 
});
const Datepicker = class extends React.Component
{
	constructor(props)
	{
		super(props);
		this.inputClassName = 'datepicker-input';
		this.calendarClassName = 'datepicker-calendar';
		this.state = {
			value: '', 
		};
	}
	dom()
	{
		return findDOMNode(this);
	}
	componentDidMount()
	{
		this.input = this.dom().querySelector('.' + this.inputClassName);
		this.calendar = this.dom().querySelector('.' + this.calendarClassName);
		this.calendar.style.display = 'none';
		this.input.on('click', e => 
		{
			if (this.calendar.visible)
			{
				this.calendarHide();
			}
			else
			{
				this.calendarShow();
			}
		});
	}
	onBlur = e =>
	{
		const { clientX: x, clientY: y } = e.touches ? e.touches[0] : e;
		if (this.input.hittest(x, y)) return;
		if (this.calendar.hittest(x, y)) return;
		this.calendarHide();
	}
	calendarShow()
	{
		this.calendar.visible = true;
		this.calendar.style.display = 'block';
		document.body.on('click', this.onBlur);
	}
	calendarHide()
	{
		this.calendar.visible = false;
		this.calendar.style.display = 'none';
		document.body.off('click', this.onBlud);
	}
	onInputChange = value =>
	{
		this.setState({ value });
	}
	onClendarChange = day =>
	{
		this.setState({ value: day.format('YYYY-MM-DD') });
	}
	render()
	{
		return (
			<div className="datepicker-container">
				<Input
					className={this.inputClassName}
					onChange={this.onInputChange}
					value={this.state.value}
				/>
				<Calendar
					className={this.calendarClassName}
					onChange={this.onClendarChange}
				/>
			</div>
		);
	}
};
const Input = ({
	className, 
	onChange, 
	value, 
}) => (
	<p className={classnames(className, 'control')}>
		<input type="text" className="input"
			value={value}
			onChange={e => onChange(e.target.value)}
		/>
	</p>
);
export default Datepicker;