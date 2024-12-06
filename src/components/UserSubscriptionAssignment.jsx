import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function UserSubscriptionAssignment() {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const subscriptionsQuery = query(collection(db, 'subscriptions'));

      const [usersSnapshot, subscriptionsSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(subscriptionsQuery)
      ]);

      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const subscriptionsData = subscriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setUsers(usersData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedSubscription) return;

    try {
      // Update user's subscription information
      const userRef = doc(db, 'users', selectedUser);
      await updateDoc(userRef, {
        subscriptionId: selectedSubscription,
        subscriptionStartDate: new Date().toISOString(),
        status: 'active'
      });

      // Create a subscription record
      await addDoc(collection(db, 'userSubscriptions'), {
        userId: selectedUser,
        subscriptionId: selectedSubscription,
        startDate: new Date().toISOString(),
        status: 'active'
      });

      // Reset form
      setSelectedUser('');
      setSelectedSubscription('');
      
      // Show success message
      alert('Subscription assigned successfully!');
    } catch (error) {
      console.error('Error assigning subscription:', error);
      alert('Error assigning subscription. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Assign Subscription to User
      </h3>
      
      <form onSubmit={handleAssignment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="user">
            Select User
          </label>
          <select
            id="user"
            className="form-select w-full"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            required
          >
            <option value="">Choose a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="subscription">
            Select Subscription Plan
          </label>
          <select
            id="subscription"
            className="form-select w-full"
            value={selectedSubscription}
            onChange={(e) => setSelectedSubscription(e.target.value)}
            required
          >
            <option value="">Choose a plan...</option>
            {subscriptions.map((subscription) => (
              <option key={subscription.id} value={subscription.id}>
                {subscription.name} - {subscription.duration} ({new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                }).format(subscription.price)})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn bg-indigo-500 hover:bg-indigo-600 text-white w-full"
        >
          Assign Subscription
        </button>
      </form>
    </div>
  );
}

export default UserSubscriptionAssignment;
