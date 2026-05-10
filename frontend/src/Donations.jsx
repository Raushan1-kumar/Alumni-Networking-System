import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Gift, Award, TrendingUp } from 'lucide-react';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    amount: '', cause: 'General Fund', message: '', isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/donations/public', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(res.data);
    } catch (error) {
      console.error('Failed to fetch donations', error);
    }
  };

  const startQrPayment = (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) < 1) {
      alert('Please enter a valid donation amount.');
      return;
    }

    const upiId = 'gecalumni@upi';
    const name = 'GEC Alumni Fund';
    const note = encodeURIComponent(`Donation for ${formData.cause}`);
    const payAmount = Number(formData.amount).toFixed(2);
    const qrPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${payAmount}&tn=${note}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrPayload)}`;

    setQrData(qrCodeUrl);
    setStep('qr');
  };

  const handleConfirmDonation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const dummyTransaction = `UPI_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      await axios.post('http://localhost:5000/api/donations', {
        ...formData,
        transactionId: dummyTransaction,
        paymentStatus: 'Completed',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const receiptData = {
        transactionId: dummyTransaction,
        amount: Number(formData.amount).toFixed(2),
        cause: formData.cause,
        message: formData.message,
        isAnonymous: formData.isAnonymous,
        date: new Date().toLocaleString(),
      };

      setReceipt(receiptData);
      setStep('receipt');
      setQrData('');
      fetchDonations();
    } catch (error) {
      alert('Donation confirmation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('form');
    setQrData('');
  };

  const handleCloseReceipt = () => {
    setReceipt(null);
    setShowForm(false);
    setStep('form');
    setFormData({ amount: '', cause: 'General Fund', message: '', isAnonymous: false });
  };

  return (
    <div className="container mt-4">
      <div className="card text-center mb-4" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '3rem 1rem' }}>
        <Heart size={48} style={{ marginBottom: '1rem', fill: 'white' }} />
        <h2 style={{ color: 'white' }}>Support Your Alma Mater</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Your contributions help fund scholarships, build modern infrastructure, and drive innovative research at Government Engineering College.
        </p>
        <button 
          className="btn" 
          style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: 'bold', padding: '0.8rem 2rem' }}
          onClick={() => {
            const next = !showForm;
            setShowForm(next);
            if (!next) {
              setStep('form');
              setQrData('');
            }
          }}
        >
          {showForm ? 'Cancel Pledge' : 'Make a Pledge'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
          <h3 className="text-center mb-3">Donation Details</h3>

          {step === 'form' && (
            <form onSubmit={startQrPayment}>
              <div className="form-group mb-3">
                <label className="form-label">Amount (₹)</label>
                <input type="number" min="1" required className="form-control" 
                  value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} 
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Select Cause</label>
                <select className="form-control" required
                  value={formData.cause} onChange={e => setFormData({ ...formData, cause: e.target.value })}
                >
                  <option value="Scholarship">Scholarship Fund</option>
                  <option value="Infrastructure">Infrastructure Development</option>
                  <option value="Research">Research & Innovation</option>
                  <option value="General Fund">General Fund</option>
                </select>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Message (Optional)</label>
                <textarea className="form-control" rows="2" 
                  value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} 
                />
              </div>
              <div className="form-group mb-3 flex items-center gap-2">
                <input type="checkbox" id="anon" 
                  checked={formData.isAnonymous} onChange={e => setFormData({ ...formData, isAnonymous: e.target.checked })} 
                />
                <label htmlFor="anon" style={{ margin: 0 }}>Donate Anonymously</label>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Preparing QR code...' : 'Pay with QR Code'}
              </button>
            </form>
          )}

          {step === 'qr' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '1rem' }}>Scan this QR code with your UPI app to pay ₹{Number(formData.amount).toFixed(2)} for <strong>{formData.cause}</strong>.</p>
              <img src={qrData} alt="Donation QR Code" style={{ maxWidth: '100%', marginBottom: '1rem' }} />
              <p className="text-muted" style={{ marginBottom: '1rem' }}>
                Use UPI ID <strong>gecalumni@upi</strong> and confirm payment in your app.
              </p>
              <button type="button" className="btn btn-primary btn-block mb-3" onClick={handleConfirmDonation} disabled={loading}>
                {loading ? 'Recording payment...' : 'I have paid, confirm donation'}
              </button>
              <button type="button" className="btn btn-outline btn-block" onClick={handleCancel} disabled={loading}>
                Cancel and go back
              </button>
            </div>
          )}

          {step === 'receipt' && receipt && (
            <div style={{ textAlign: 'left', padding: '1rem' }}>
              <h4 className="text-center mb-3">Donation Receipt</h4>
              <div className="card" style={{ padding: '1rem', backgroundColor: '#f8fafc' }}>
                <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
                <p><strong>Amount:</strong> ₹{receipt.amount}</p>
                <p><strong>Cause:</strong> {receipt.cause}</p>
                <p><strong>Message:</strong> {receipt.message || 'No message provided'}</p>
                <p><strong>Donor:</strong> {receipt.isAnonymous ? 'Anonymous' : 'Authenticated donor'}</p>
                <p><strong>Date:</strong> {receipt.date}</p>
              </div>
              <button type="button" className="btn btn-primary btn-block mt-4" onClick={handleCloseReceipt}>
                Close Receipt
              </button>
            </div>
          )}
        </div>
      )}

      <h3>Recent Contributions</h3>
      {donations.length === 0 ? (
        <p className="text-muted mt-2">No donations recorded yet. Be the first to contribute!</p>
      ) : (
        <div className="grid grid-cols-3 mt-3">
          {donations.map(donation => (
            <div className="card" key={donation._id}>
              <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--primary)' }}>
                <Gift size={20} />
                <h4 style={{ margin: 0 }}>₹{donation.amount}</h4>
              </div>
              <p className="mb-1"><strong>Cause:</strong> {donation.cause}</p>
              <p className="mb-2 text-muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>
                "{donation.message || 'Contributed to college growth.'}"
              </p>
              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                  {donation.isAnonymous ? 'Anonymous Alumni' : donation.donor?.name || 'Alumni'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Donations;
