import { useState, useEffect } from 'react';
import { transactionAPI, accountAPI } from '../api';

function Dashboard({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    division: 'Personal',
    description: '',
    account: ''
  });

  const [accountData, setAccountData] = useState({
    name: '',
    balance: 0
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, accRes] = await Promise.all([
        transactionAPI.getAll(),
        accountAPI.getAll()
      ]);
      setTransactions(transRes.data);
      setAccounts(accRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await transactionAPI.create(formData);
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        division: 'Personal',
        description: '',
        account: ''
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create transaction');
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    try {
      await accountAPI.create(accountData);
      setAccountData({ name: '', balance: 0 });
      setShowAccountForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create account');
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>💰 Money Manager</h1>
          <p>Welcome, {user.name}!</p>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </header>

      <div className="stats-grid">
        <div className="stat-card balance">
          <h3>Total Balance</h3>
          <p className="amount">₹{totalBalance.toFixed(2)}</p>
        </div>
        <div className="stat-card income">
          <h3>Total Income</h3>
          <p className="amount">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="stat-card expense">
          <h3>Total Expense</h3>
          <p className="amount">₹{totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="actions">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Transaction'}
        </button>
        <button onClick={() => setShowAccountForm(!showAccountForm)} className="btn-secondary">
          {showAccountForm ? 'Cancel' : '+ Add Account'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>New Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Food, Salary"
                />
              </div>
              <div className="form-group">
                <label>Division</label>
                <input
                  type="text"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="Personal"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Account</label>
                <select
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc.name}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Add Transaction</button>
          </form>
        </div>
      )}

      {showAccountForm && (
        <div className="form-card">
          <h3>New Account</h3>
          <form onSubmit={handleAccountSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Account Name</label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  required
                  placeholder="e.g., Cash, Bank"
                />
              </div>
              <div className="form-group">
                <label>Initial Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={accountData.balance}
                  onChange={(e) => setAccountData({ ...accountData, balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">Create Account</button>
          </form>
        </div>
      )}

      <div className="content-grid">
        <div className="section">
          <h2>Accounts</h2>
          <div className="account-list">
            {accounts.length === 0 ? (
              <p className="empty">No accounts yet. Create one to get started!</p>
            ) : (
              accounts.map(account => (
                <div key={account._id} className="account-item">
                  <span className="account-name">{account.name}</span>
                  <span className="account-balance">₹{parseFloat(account.balance || 0).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h2>Recent Transactions</h2>
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <p className="empty">No transactions yet. Add your first transaction!</p>
            ) : (
              transactions.map(transaction => (
                <div key={transaction._id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-info">
                    <span className="transaction-category">{transaction.category || 'Uncategorized'}</span>
                    <span className="transaction-desc">{transaction.description}</span>
                    <span className="transaction-account">{transaction.account}</span>
                  </div>
                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{parseFloat(transaction.amount).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
