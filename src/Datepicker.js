import React from 'react';
import './Datepicker.scss';
import moment from 'moment';
import classnames from 'classnames';
import numeral from 'numeral';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
const n = n => v => numeral(v).format(Array(n).fill(0).join(''));
Object.assign(Node.prototype, {
	on : function(e, handler) { _.castArray(e).map(e => this.addEventListener(e, handler)) }, 
	off: function(e, handler) { _.castArray(e).map(e => this.removeEventListener(e, handler)) }, 
	hittest: function (x, y)
	{
		const { left, top, right, bottom } = this.getBoundingClientRect();
		return _.inRnage(x, left, right) && _.inRange(y, top, bottom);
	}, 
});
const weekDaysShort = [
	'日', '月', '火', '水', '木', '金', '土'
]; 
const today = moment();
const Datepicker = class extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {
			value: null, 
		};
	}
	render()
	{
		const { value } = this.state;
		return <DatepickerView
			value={value}
			inputChange={this.inputChange} 
			calendarChange={this.calendarChange} 
		/>;
	}
	inputChange = (value, day, invalid) =>
	{
	}
	calendarChange = value =>
	{
		this.setState({ value });
	}
};
const DatepickerView = ({
	inputChange, 
	calendarChange, 
	value, 
}) => (
	<div className="datepicker-container">
		<Input onChange={inputChange} value={value}/>
		<Calendar onChange={calendarChange}/>
	</div>
);
const Input = class extends React.Component
{
	constructor(props)
	{
		super(props);
		this.day = moment();
		this.parseFormats = [
			'Y-M-D', 
			'M/D', 
			'M.D',
			'Y.M.D', 
			'Y/M/D', 
			'MMDD', 
			'YYMMDD', 
		];
		this.format = this.props.format||'YYYY-MM-DD';
		this.state = {
			value: this.day.format(this.format), 
			invalid: false, 
		}
	}
	render()
	{
		const { format } = this;
		const { value, invalid } = this.state;
		return <InputView
			value={value}
			invalid={invalid}
			onChange={this.onChange}
			onBlur={this.onBlur}
			onKeyDown={this.onKeyDown}
			onFocus={this.onFocus}
			onClick={this.onClick}
		/>
	}
	setValue(value)
	{
		this.setState({ value });
	}
	onChange = e =>
	{
		const value = e.target.value;
		const day = moment(value, this.parseFormats, true);
		const invalid = day.isValid() === false;
		this.setState({ invalid });
		this.setValue(value);
		this.day = day;

		(this.props.onChange||_.noop)({ value, day, invalid });
	}
	onBlur = e =>
	{
		const value = this.day.format('YYYY-MM-DD');
		this.setState({ value });
	}
	onKeyDown = e =>
	{
	}
	onFocus = e =>
	{
	}
	onClick = e =>
	{
	}

}
const InputView = ({
	value, 
	invalid, 
	onChange, 
	onBlur, 
	onKeyDown, 
	onFocus, 
	onClick, 
}) => (
	<div className="input-container">
		<p className="control">
			<input 
				type="text"
				className={classnames('input', {
					'is-invalid': invalid, 
				})}
				value={value}
				onChange={onChange}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				onFocus={onFocus}
				onClick={onClick}
			/>
		</p>
	</div>
);
const Calendar = class extends React.Component
{
	constructor(props)
	{
		super(props);
		const selected = this.props.selected;
		const start = (selected||moment()).clone().startOf('month');;
		this.state = {
			selected, 
			start, 
		};
	}
	render()
	{
		const { selected, start } = this.state;
		const year  = start.year();
		const month = start.month() + 1;
		const end   = start.clone().endOf('month');
		const startOfArray = start.clone().day(0); // last sunday
		const endOfArray = end.clone().day(6); // first saturday

		const arrayCount = endOfArray.diff(startOfArray, 'days') + 1;
		const days = Array(arrayCount).fill(0).map((v, i) =>
		{
			const day = startOfArray.clone().add(i, 'days');
			day.isDisabled = !day.isSame(start, 'month');
			day.isToday = day.isSame(today, 'day');
			day.isActive = day.isSame(selected, 'day');
			day.isSunday = day.day() === 0;
			day.isSaturday = day.day() === 6;
			return day;
		});
		return <CalendarView {...{ year, month, weekDaysShort, days }}
			monthAdd={this.monthAdd}
			dayClick={this.dayClick}
		/>
	}
	monthAdd = add =>
	{
		this.setState({ start: this.state.start.clone().add(add, 'month') });
	}
	dayClick = day =>
	{
		this.setState({ selected: day });
		(this.props.onChange||_.noop)(day);
	}
};

const CalendarView = ({
	year, 
	month, 
	weekDaysShort, 
	days, 
	monthAdd, 
	dayClick, 
}) => (
	<div className="datepicker-container">
		<div className="calendar">
			<div className="calendar-nav">
				<div className="calendar-nav-previous-month">
					<button className="button" onClick={e => monthAdd(-1)}>
						<i className="fas fa-chevron-left"></i>
					</button>
				</div>
				<div>{n(4)(year)}年{n(2)(month)}月</div>
				<div className="calendar-nav-next-month">
					<button className="button" onClick={e => monthAdd(1)}>
						<i className="fas fa-chevron-right"></i>
					</button>
				</div>
			</div>
			<div className="calendar-container">
				<div className="calendar-header">
					{weekDaysShort.map((w, i) => 
						<div className="calendar-date" key={i}>{w}</div>
					)}
				</div>
				<div className="calendar-body">
					{days.map((day, i) =>
						<div 
							key={i}
							className={classnames('calendar-date', {
								'is-disabled': day.isDisabled, 
							})}
						>
							<button
								className={classnames('date-item', {
									'is-today': day.isToday, 
									'is-active': day.isActive, 
									'is-sunday': day.isSunday, 
									'is-saturday': day.isSaturday, 
								})}
								onClick={e => dayClick(day)}
							>
								{day.date()}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	</div>
);
export default Datepicker;