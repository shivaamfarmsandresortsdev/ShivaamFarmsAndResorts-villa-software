import React from 'react';
import styles from './RecentActivity.module.css';

const RecentActivity = () => {
  const activities = [
    { text: "New booking confirmed for Villa A", time: "2 hours ago", color: "green" },
    { text: "Staff member John completed maintenance task", time: "4 hours ago", color: "blue" },
    { text: "Low stock alert: Cleaning supplies", time: "6 hours ago", color: "orange" },
  ];

  return (
    <div className={`${styles.mainCard} card rounded-4 p-4`}>
      <ul className={styles.activityList}>
        {activities.map((item, idx) => (
          <li key={idx} style={{ "--bullet-color": item.color }}>
            {item.text}
            <span>{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
