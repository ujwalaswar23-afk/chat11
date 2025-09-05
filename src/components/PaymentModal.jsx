import React, { useState } from 'react'
import { X, IndianRupee, CreditCard, Smartphone } from 'lucide-react'

const PaymentModal = ({ recipient, onClose, onPaymentComplete }) => {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('phonepe')

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    setLoading(true)

    // Simulate PhonePe payment process
    setTimeout(() => {
      const paymentData = {
        amount: parseFloat(amount),
        recipient: recipient.phoneNumber,
        note: note || 'Payment via ChatApp',
        transactionId: `TXN${Date.now()}`,
        method: paymentMethod,
        timestamp: new Date().toISOString()
      }

      onPaymentComplete(paymentData)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Send Payment</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <img
              src={recipient.avatar}
              alt={recipient.name}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <h4 className="font-semibold">{recipient.name}</h4>
              <p className="text-sm text-gray-600">{recipient.phoneNumber}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent outline-none text-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="phonepe"
                  checked={paymentMethod === 'phonepe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <Smartphone className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <div className="font-medium">PhonePe</div>
                  <div className="text-sm text-gray-500">UPI Payment</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Debit/Credit Card</div>
                  <div className="text-sm text-gray-500">Visa, Mastercard, RuPay</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="px-6 py-2 bg-whatsapp-primary text-white rounded-lg hover:bg-whatsapp-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4 mr-1" />
                  Send ₹{amount || '0'}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This is a demo payment system. In production, integrate with actual PhonePe SDK for secure transactions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
