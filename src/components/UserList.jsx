import React from 'react';

const UserList = ({ users, onSelectUser, title }) => {
  return (
    <div className="p-2">
      <h2 className="text-md font-semibold mb-2 text-gray-600 px-2">{title}</h2>
      <ul>
        {users.map((user) => (
          <li
            key={user.userId || user._id}
            className="flex items-center p-2 cursor-pointer hover:bg-gray-200 rounded-lg"
            onClick={() => onSelectUser(user)}
          >
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
            <div className="flex-grow">
              <span className="font-medium">{user.name}</span>
              <p className="text-sm text-gray-500">{user.phoneNumber}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
