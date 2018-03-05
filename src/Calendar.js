import React from 'react';
import './Calendar.scss';
import moment from 'moment';
import numeral from 'numeral';
import classnames from 'classnames';
const nn = r => n => numeral(n).format('0'.repeat(r));
const n2 = n => nn(2)(n);
const n4 = n => nn(4)(n);
const weekDays = [ '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日' ];
const weekDaysShort = [ '日', '月', '火', '水', '木', '金', '土' ];
const today = moment().startOf('day');
const Calendar = class extends React.Component 
{
	constructor(props)
	{
		super(props);
		this.state = {
			start: moment().startOf('month'), 
			selected: moment().add(3, 'day'), 
		};
	}
	render() 
	{
		const { start, selected } = this.state;
		const { onMonthPrev, onMonthNext, onDayClick } = this;
		start.startOf('month');
		const year = start.year();
		const month = start.month() + 1;
		const startOfArray = start.clone().day(0);
		const end = start.clone().endOf('month');
		const endOfArray = end.clone().day(6);
		const days = Array(endOfArray.diff(startOfArray, 'days') + 1).fill(0).map((v, i) =>
		{
			const day = startOfArray.clone().add(i, 'days');
			day.isDisabled = !day.isSame(start, 'month');
			day.isToday = day.isSame(today, 'days');
			day.isActive = selected && day.isSame(selected, 'days');
			day.isSunday = day.day() === 0;
			day.isSaturday = day.day() === 6;
			return day;
		});
		const { className, style } = this.props;
		return <CalendarView 
			{...{
				className, 
				year, month, days, onMonthPrev, onMonthNext, onDayClick, 
				style, 
			}}
		/>;
	}
	onMonthPrev = (year, month) =>
	{
		this.monthAdd(-1);
	}
	onMonthNext = (year, month) =>
	{
		this.monthAdd(1);
	}
	onDayClick = day =>
	{
		this.setState({ selected: day.clone() });
		this.props.onChange(day);
	}
	monthAdd(add)
	{
		this.setState({ start: this.state.start.clone().add(add, 'month') });
	}

};
const CalendarView = ({
	className, 
	style, 
	year, 
	month, 
	days, 
	onMonthPrev, 
	onMonthNext, 
	onDayClick, 
}) => (
	<div className={classnames(className, 'calendar')} style={style}>
		<div className="calendar-nav">
			<div className="calendar-previous-month">
				<button className="button" onClick={e => onMonthPrev(year, month)}>
					<i className="fas fa-chevron-left"></i>
				</button>
			</div>
			<div>
				{nn(4)(year)}年{nn(2)(month)}月
			</div>
			<div className="calendar-next-month">
				<button className="button" onClick={e => onMonthNext(year, month)}>
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
							'is-sunday': day.isSunday, 
							'is-saturday': day.isSaturday, 
						})}
					>
						<button
							className={classnames('date-item', {
								'is-today': day.isToday, 
								'is-active': day.isActive, 
							})}
							onClick={e => onDayClick(day)}
						>
							{day.date()}
						</button>
					</div>
				)}
			</div>
		</div>
	</div>
);
export default Calendar;