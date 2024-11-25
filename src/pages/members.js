import React, { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { attributes } from '../content/home.md';
import pool from '../utils/vercelpostgres';

const Members = ({ members }) => {
  const { language } = useContext(AppContext);
  const { levels } = attributes;

  // Group members by their level
  const groupedMembers = members.reduce((acc, member) => {
    const level = member.level || 'level4'; // Default to level4 if undefined
    if (!acc[level]) acc[level] = [];
    acc[level].push(member);
    return acc;
  }, {});

  // Determine levels and labels dynamically
  const levelLabels = {
    level1: language === 'en' ? levels.level1 : levels.klevel1,
    level2: language === 'en' ? levels.level2 : levels.klevel2,
    level3: language === 'en' ? levels.level3 : levels.klevel3,
    level4: language === 'en' ? levels.level4 : levels.klevel4,
  };

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-2xl font-bold text-center mb-8'>User Profiles</h1>
      <div className='container mx-auto space-y-8'>
        {Object.entries(groupedMembers).map(([level, members], index) => (
          <div key={level} className='space-y-4'>
            <h2 className='text-xl font-bold text-left pl-4'>
              {levelLabels[level]}
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {members.map((user, userIndex) => (
                <div
                  key={userIndex}
                  className='w-full bg-white shadow-md rounded-lg p-4 text-center'
                >
                  <img
                    src={user.profilePicture || 'placeholder.svg'} // Graceful fallback
                    alt={user.name}
                    className='w-20 h-20 rounded-full mx-auto mb-3'
                  />
                  <h3 className='text-lg font-bold'>{user.name}</h3>
                  <p className='text-sm text-gray-600'>{user.level}</p>
                  <p className='text-sm text-gray-600'>{user.since}</p>
                </div>
              ))}
            </div>
            {index < Object.entries(groupedMembers).length - 1 && (
              <hr className='border-t border-gray-300 mx-4' />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Fetch data using getServerSideProps
export async function getServerSideProps() {
  try {
    // Fetch members from the database
    const { rows } = await pool.query(
      'SELECT name, hangeul, altname, level, start_date FROM centurymember'
    );

    // Transform data
    const members = rows.map((row) => ({
      name: row.name || row.altname, // Use altname if name is null
      hangel: row.hangeul,
      level: row.level || 'level4', // Default to level4 if no level is set
      since: row.start_date ? row.start_date.toISOString() : 'N/A', // Provide fallback for missing dates
      profilePicture: `/images/${row.name || row.altname}.jpg`, // Adjust path as needed
    }));

    return {
      props: {
        members,
      },
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return {
      props: {
        members: [], // Return empty array on error
      },
    };
  }
}

export default Members;
