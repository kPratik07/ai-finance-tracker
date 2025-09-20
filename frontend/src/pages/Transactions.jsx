import React from "react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionList } from "../components/transactions/TransactionList";
import { Loading } from "../components/common/Loading";

const Transactions = () => {
  const { transactions, loading, error } = useTransactions();

  if (loading) return <Loading size="large" />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>
      <TransactionList transactions={transactions} />
    </div>
  );
};

export default Transactions;
