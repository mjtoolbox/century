import React from 'react';

const users = [
  {
    name: 'John Doe',
    description: 'Experienced software engineer.',
    image: '/lee.jpg',
  },
  {
    name: 'Jane Smith',
    description: 'Creative graphic designer.',
    image: '/profile2.jpg',
  },
  {
    name: 'Mike Johnson',
    description: 'Data scientist and AI enthusiast.',
    image: '/profile3.jpg',
  },
  {
    name: 'Sarah Williams',
    description: 'Passionate product manager.',
    image: '/profile4.jpg',
  },
  {
    name: 'Chris Brown',
    description: 'Marketing and branding specialist.',
    image: '/profile5.jpg',
  },
  {
    name: 'John Doe',
    description: 'Experienced software engineer.',
    image: '/lee.jpg',
  },
  {
    name: 'Jane Smith',
    description: 'Creative graphic designer.',
    image: '/profile2.jpg',
  },
  {
    name: 'Mike Johnson',
    description: 'Data scientist and AI enthusiast.',
    image: '/profile3.jpg',
  },
  {
    name: 'Sarah Williams',
    description: 'Passionate product manager.',
    image: '/profile4.jpg',
  },
  {
    name: 'Chris Brown',
    description: 'Marketing and branding specialist.',
    image: '/profile5.jpg',
  },
];

const ProfileCard = ({ name, description, image }) => (
  <div className='flex flex-col items-center bg-white shadow-lg rounded-lg p-4 w-48 mx-2 my-4'>
    <img
      src={image}
      alt={`${name}'s profile`}
      className='w-24 h-24 rounded-full object-cover mb-3'
    />
    <h3 className='text-lg font-semibold'>{name}</h3>
    <p className='text-sm text-gray-600 text-center'>{description}</p>
  </div>
);

const UserProfileGrid = () => {
  const rows = Array(5).fill(users); // 5 rows of mock user data

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-2xl font-bold text-center mb-8'>User Profiles</h1>
      <div className='container mx-auto space-y-6'>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className='space-y-4'>
            {/* Row Label */}
            <h2 className='text-xl font-bold text-left pl-4'>
              Level {rowIndex + 1}
            </h2>

            {/* Row Content */}
            <div className='flex flex-wrap justify-center lg:justify-evenly'>
              {row.map((user, userIndex) => (
                <ProfileCard
                  key={userIndex}
                  name={user.name}
                  description={user.description}
                  image={user.image}
                />
              ))}
            </div>

            {/* Horizontal Line after all rows except the last */}
            {rowIndex < rows.length - 1 && (
              <hr className='border-t border-gray-300 mx-4' />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfileGrid;
