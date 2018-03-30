import React from 'react';
import './Datepicker.scss';
import moment from 'moment';
import numeral from 'numeral';
import classnames from 'classnames';
import _ from 'lodash';
import reactClickOutside from 'react-click-outside';
import { findDOMNode } from 'react-dom';
const n = r => n => numeral(n).format('0'.repeat(r));
const f = f => (...a) => (f||_.noop)(...a);
Object.assign(Node.prototype, {
	on: function (e, handler) { _.castArray(e).map(e => this.addEventListener(e, handler)); }, 
	off: function (e, handler) { _.castArray(e).map(e => this.removeEventListener(e, handler)); }, 
	hittest: function (x, y)
	{
		const { left, top, right, bottom } = this.getBoundingClientRect();
		return _.inRange(x, left, right) && _.inRange(y, top, bottom);
	}, 
});
Object.assign(Event.prototype, {
	clientPosition: function ()
	{
		const { clientX: x, clientY: y } = this.touches ? this.touches[0] : this;
		return { x, y };
	}, 
});

export default class Datepicker extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {
			value: moment(), 
			calendarVisible: false, 
		};
	}
	dom()
	{
		return findDOMNode(this);
	}
	componentDidMount()
	{
		this.input = this.dom().querySelector('.dateinput-component');
		this.calendar = this.dom().querySelector('.calendar-component');
	}
	render()
	{
		const { value, calendarVisible } = this.state;
		return (
			<div className="datepicker-component">
				<Dateinput 
					value={value}
					dayChange={this.dayChange}
					onFocus={this.onFocus}
				/>
				<Calendar 
					value={value}
					dayChange={this.dayChange}
					dayClick={this.dayClick}
					show={calendarVisible}
					onClickOutside={this.onCalendarClickOutside}
				/>
			</div>
		);
	}
	dayChange = day =>
	{
		this.setState({ value: day });
	}
	onFocus = e =>
	{
		this.showCalendar(true);
	}
	onCalendarClickOutside = e =>
	{
		const { x, y } = e.clientPosition();
		if (this.input.hittest(x, y)) return;

		this.showCalendar(false);
	}
	dayClick = day => 
	{
		// this.showCalendar(false);
	}
	showCalendar(show)
	{
		this.setState({ calendarVisible: show });
	}
};
const Dateinput = class extends React.Component 
{
	static defaultProps = {
		format: 'YYYY-MM-DD', 
		formats: [
			'MMDD', 
			'YYMMDD',
			'YYYYMMDD', 
			'M.D', 
			'M-D', 
			'M/D', 
			'YY-M-D', 
			'YY.M.D', 
			'YY/M/D', 
			'YYYY-M-D', 
			'YYYY.M.D', 
			'YYYY.M.D', 
		], 
		value: moment(), 
	};
	constructor(props)
	{
		super(props);
		this.state = {
			value: this.props.value.format(this.props.format), 
			invalid: this.props.value.isValid() === false, 
		};
	}
	componentWillReceiveProps(nextProps)
	{
		if (nextProps.value !== this.props.value)
		{
			this.setState({ value: nextProps.value.format(this.props.format) });
		}
	}
	render()
	{
		const { value, invalid } = this.state;
		return (
			<div className="dateinput-component">
				<p className="control">
					<input type="text" 
						className={classnames('input', {
							'is-invalid': invalid, 
						})} 
						value={value}
						onChange={this.onChange}
						onBlur={this.onBlur}
						onFocus={this.onFocus}
					/>
				</p>
			</div>
		);
	}
	onChange = e =>
	{
		const value = e.target.value;
		const day = this.parseValue(value);
		const invalid = day.isValid() === false;
		this.setState({ value, invalid });
	}
	onBlur = e =>
	{
		const { format } = this.props;
		const day = this.parseValue(e.target.value);

		if (day.isValid()) 
		{
			this.setState({ value: day.format(format) });
			f(this.props.dayChange)(day);
		}

		f(this.props.onBlur)(e);
	}
	onFocus = e =>
	{
		f(this.props.onFocus)(e);
	}
	parseValue(text)
	{
		const { formats } = this.props;
		const day = moment(text, formats, true);
		return day;
	}
};
const weekDays = [
	'日曜日', 
	'月曜日', 
	'火曜日', 
	'水曜日', 
	'木曜日', 
	'金曜日', 
	'土曜日', 
];
const weekDaysShort = [
	'日', 
	'月', 
	'火', 
	'水', 
	'木', 
	'金', 
	'土', 
];
const today  = moment();

@reactClickOutside
class Calendar extends React.Component 
{
	static defaultProps = {
		show: true, 
	};
	constructor(props)
	{
		super(props);
		this.state = {
			start: moment().startOf('month'), 
			selected: this.props.value, 
			show: false, 
		};
	}
	dom()
	{
		return findDOMNode(this);
	}
	componentWillReceiveProps(nextProps)
	{
		if (nextProps.value !== this.props.value)
		{
			const selected = nextProps.value;
			const start = selected.clone().startOf('month');
			this.setState({ selected, start });
		}
		if (nextProps.show !== this.props.show)
		{
			this.setState({ show: nextProps.show });
		}
	}
	render()
	{
		const { 
			start, 
			selected, 
			show, 
		} = this.state;
		const year = start.year();
		const month = start.month() + 1;
		const end = start.clone().endOf('month');
		const startOfArray = start.clone().day(0);
		const endOfArray = end.clone().day(6);
		const array = Array(endOfArray.diff(startOfArray, 'days') + 1).fill(0).map((v, i) =>
		{
			const day = startOfArray.clone().add(i, 'days');
			day.isDisabled = day.isSame(start, 'month') === false;
			day.isToday = day.isSame(today, 'days');
			day.isActive = day.isSame(selected, 'days');
			return day;
		});
		return (
			<div 
				className={classnames('calendar-component', {
					'is-visible': show, 
				})}
			>
				<div className="calendar">
					<div className="calendar-nav">
						<div className="calendar-nav-previous-month">
							<button className="button" onClick={e => this.monthAdd(-1)}>
								<i className="fas fa-chevron-left"></i>
							</button>
						</div>
						<div>
							{n(4)(year)}年{n(2)(month)}月
						</div>
						<div className="calendar-nav-next-month">
							<button className="button" onClick={e => this.monthAdd(1)}>
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
							{array.map((day, i) =>
								<div 
									className={classnames('calendar-date', {
										'is-disabled': day.isDisabled, 
									})}
									key={i}
								>
									<button 
										className={classnames('date-item', {
											'is-today': day.isToday, 
											'is-active': day.isActive, 
										})}
										onClick={e => this.dayClick(day)}
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
	}
	dayClick = day =>
	{
		this.setState({ selected: day });
		f(this.props.dayClick)(day);
		f(this.props.dayChange)(day);
	}
	monthAdd = add =>
	{
		this.setState({ start: this.state.start.clone().add(add, 'month') });
	}
	handleClickOutside(e)
	{
		if (this.state.show === false) return;

		f(this.props.onClickOutside)(e);

	}	
};