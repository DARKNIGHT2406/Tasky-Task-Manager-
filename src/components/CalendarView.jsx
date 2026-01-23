'use client';

import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isWeekend,
    isToday,
    isFuture
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CalendarView.module.css';

export default function CalendarView({
    currentDate,
    onMonthChange,
    attendanceData = [],
    leavesData = []
}) {

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDayStatus = (day) => {
        // Future dates
        if (isFuture(day) && !isToday(day)) return 'future';

        // Check for Leave
        const leave = leavesData.find(l =>
            l.status === 'APPROVED' &&
            new Date(l.startDate) <= day &&
            new Date(l.endDate) >= day
        );
        if (leave) return 'leave';

        // Check for Attendance
        const attended = attendanceData.find(a => isSameDay(new Date(a.date), day));
        if (attended) return 'present';

        // Weekends
        if (isWeekend(day)) return 'weekend';

        // Else Absent (if not today or future)
        if (!isToday(day)) return 'absent';

        return 'none'; // Today, not marked yet
    };

    return (
        <div className={styles.calendar}>
            <div className={styles.header}>
                <button onClick={() => onMonthChange(subMonths(currentDate, 1))}>
                    <ChevronLeft size={20} />
                </button>
                <span className={styles.monthLabel}>
                    {format(currentDate, "MMMM yyyy")}
                </span>
                <button onClick={() => onMonthChange(addMonths(currentDate, 1))}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className={styles.weekDays}>
                {weekDays.map(day => (
                    <div key={day} className={styles.weekDay}>{day}</div>
                ))}
            </div>

            <div className={styles.daysGrid}>
                {days.map(day => {
                    const status = getDayStatus(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                ${styles.dayCell} 
                                ${!isCurrentMonth ? styles.disabled : ''}
                                ${styles[status]}
                            `}
                        >
                            <span className={styles.number}>{format(day, dateFormat)}</span>
                            {isToday(day) && <span className={styles.dot}></span>}
                        </div>
                    );
                })}
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.present}`}></span> Present
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.absent}`}></span> Absent
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.leave}`}></span> Leave
                </div>
                <div className={styles.legendItem}>
                    <span className={`${styles.legendDot} ${styles.weekend}`}></span> Weekend
                </div>
            </div>
        </div>
    );
}
