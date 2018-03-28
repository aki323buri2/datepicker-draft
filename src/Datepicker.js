import React from 'react';
import './Datepicker.scss';
import moment from 'moment';
import { findDOMNode } from 'react-dom';
import _ from 'lodash';
import numeral from 'numeral';
import classnames from 'classnames';
const nn = r => n => numeral(n).format('0'.repeat(r));
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
	static defaultProps = {
		format: 'YYYY-MM-DD', 
	};
	constructor(props)
	{
		super(props);
		this.state = {
			value: moment(), 
		};
	}
	dom()
	{
		return findDOMNode(this);
	}
	componentDidMount()
	{
		this.input = this.dom().querySelector('.dateinput-component .input');
		this.calendar = this.dom().querySelector('.calendar-component');
	}
	componentWillUnmount()
	{
	}
	render()
	{
		const { format } = this.props;
		const { value } = this.state;
		const start = value.clone().startOf('month');
		return <div className="datepicker-component">
			<Dateinput 
				value={value}
				format={format}
				onChange={this.onChange}
				onBlur={this.onBlur}
			/>
			<Calendar
				value={value}
				start={start}
				onChange={this.onChange}
			/>
		</div>;
	}
	onChange = value =>
	{
		this.setState({ value });
	}
	onBlur = ({ value, invalid }) =>
	{
		console.log(value);
	}
};
const Dateinput = class extends React.Component
{
	static defaultProps = {
		format: 'YYYY-MM-DD', 
		formats: [
			'YYYY-MM-DD', 
			'M.D',
			'M/D', 
			'M-D', 
			'YY.M.D',
			'YY/M/D',  
			'YY-M-D',  
			'MMDD', 
			'YYMMDD', 
			'YYYYMMDD', 
		], 
		onChange: _.noop, 
		onBlur: _.noop, 
	};
	constructor(props)
	{
		super(props);
		this.state = {
			value: this.props.value.format(this.props.format), 
		};
	}
	componentWillReceiveProps(nextProps)
	{
		this.setState({ value: nextProps.value.format(this.props.format), });
	}
	render()
	{
		const { value } = this.state;
		const parse = this.parse(value);
		const invalid = parse.isValid() === false;
		return (<div className="dateinput-component">
			<p className="control">
				<input type="text"
					className={classnames('input', {
						'is-invalid': invalid, 
					})}
					value={value}
					onChange={this.onChange}
					onBlur={this.onBlur}

				/>
			</p>
		</div>);
	}
	onChange = e =>
	{
		const value = e.target.value;
		this.setState({ value });
	}
	onBlur = e =>
	{
		const value = e.target.value;
		const parse = this.parse(value);
		if (parse.isValid()) 
		{
			this.props.onChange(parse);
		}
	}
	parse(value)
	{
		return moment(value, this.props.formats, true);
	}
};
const today = moment();
const weekDays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日' ];
const weekDaysShort = ['日', '月', '火', '水', '木', '金', '土' ];
const Calendar = class extends React.Component
{
	static defaultProps = {
		value: null, 
		onChange: _.noop, 
	};
	constructor(props)
	{
		super(props);
		this.state = {
			value: this.props.value, 
			start: this.props.start||moment().clone().startOf('month'), 
		};
	}
	componentWillReceiveProps(nextProps)
	{
		this.setState({
			value: nextProps.value, 
			start: nextProps.start, 
		});
	}
	render()
	{
		const { value, start } = this.state;
		const end = start.clone().endOf('month');
		const startOfArray = start.clone().day(0);
		const endOfArray = end.clone().day(6);
		const array = Array(endOfArray.diff(startOfArray, 'days') + 1).fill(0).map((v, i) =>
		{
			const day = startOfArray.clone().add(i, 'day');
			day.isDisabled = day.isSame(start, 'month') === false;
			day.isToday = day.isSame(today, 'day');
			day.isActive = day.isSame(value, 'day');
			day.isSunday = day.weekday() === 0;
			day.isSaturday = day.weekday() === 6;
			return day;
		});
		return (<div className="calendar-component">
			<div className="calendar">
				<div className="calendar-nav">
					<div className="calendar-nav-previous-month">
						<button className="button"
							onClick={e => this.monthAdd(-1)}
						>
							<i className="fas fa-chevron-left"></i>
						</button>
					</div>
					<div>
						{nn(4)(start.year())}年{nn(2)(start.month() + 1)}月
					</div>
					<div className="calendar-nav-next-month">
						<button className="button"
							onClick={e => this.monthAdd(1)}
						>
							<i className="fas fa-chevron-right"></i>
						</button>
					</div>
				</div>
				<div className="calendar-container">
					<div className="calendar-header">
						{weekDaysShort.map((weekDay, i) => 
							<div className="calendar-date" key={i}>{weekDay}</div>
						)}
					</div>
					<div className="calendar-body">
						{array.map((day, i) =>
							<div
								key={i}
								className={classnames('calendar-date', {
									'is-disabled': day.isDisabled, 
									'is-sunday': day.isSunday, 
									'is-saturday': day.isSaturday, 
								})}
							>
								<button 
									className={classnames('date-item', {
										'is-today': day.isToday, 
										'is-active': day.isActive, 
									})}
									onClick={e => this.onClick(day)}
								>
									{day.date()}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>);
	}
	monthAdd = add =>
	{
		this.setState({ start: this.state.start.add(add, 'month') });
	}
	onClick = day =>
	{
		this.setState({ value: day });
		this.props.onChange(day);
	}
};
export default Datepicker;