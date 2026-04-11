// src/components/FinanceTable/ExpenseTable.jsx
import React from "react";
import { Line } from "react-chartjs-2";

const ExpenseTable = ({ expensesData, expensesOptions }) => {
  return (
    <>
      <h6 className="fw-bold mb-0">Expense Trend</h6>
      <small className="text-muted">Monthly expenses over time</small>
      <div style={{ height: "370px" }} className="w-100">
        <Line data={expensesData} options={expensesOptions} />
      </div>
    </>
  );
};   

export default ExpenseTable;
