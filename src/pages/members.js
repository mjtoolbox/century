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

  // Define level order
  const levelOrder = ['level1', 'level2', 'level3', 'level4'];

  // Determine levels and labels dynamically
  const levelLabels = {
    level1: language === 'en' ? levels.level1 : levels.klevel1,
    level2: language === 'en' ? levels.level2 : levels.klevel2,
    level3: language === 'en' ? levels.level3 : levels.klevel3,
    level4: language === 'en' ? levels.level4 : levels.klevel4,
  };

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-2xl font-bold text-center mb-8'>
        {language === 'en' ? levels.title : levels.ktitle}
      </h1>
      <div className='container mx-auto space-y-8'>
        {levelOrder.map((level, index) => {
          const membersForLevel = groupedMembers[level] || []; // Default to empty array if no members

          return (
            <div key={level} className='space-y-4'>
              <h2 className='text-xl font-bold text-left pl-4'>
                {levelLabels[level]}
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {membersForLevel.map((user, userIndex) => (
                  <div
                    key={userIndex}
                    className='w-full bg-white shadow-md rounded-lg p-4 text-center'
                  >
                    <img
                      src={user.profilePicture || 'placeholder.svg'} // Graceful fallback
                      alt={user.name}
                      className='w-20 h-20 rounded-full mx-auto mb-3'
                    />
                    <h3 className='text-lg font-bold'>
                      {language === 'en' ? user.name : user.korean}
                    </h3>
                    <p className='text-sm text-gray-600'>{user.dan}</p>
                    <p className='text-sm text-gray-600'>Since {user.since}</p>
                  </div>
                ))}
              </div>
              {index < levelOrder.length - 1 && (
                <hr className='border-t border-gray-300 mx-4' />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Fetch data using getServerSideProps
export async function getServerSideProps() {
  try {
    // Fetch members from the database
    const { rows } = await pool.query(
      'SELECT name, img, hangeul, altname, level, start_date FROM centurymember'
    );

    console.log(rows);

    // Transform data
    const members = rows.map((row) => {
      let assignedLevel;

      if (row.level) {
        if (row.level.includes('1 Dan')) {
          assignedLevel = 'level2';
        } else if (row.level.includes('Dan')) {
          assignedLevel = 'level1';
        } else if (row.level.includes('Kyu')) {
          assignedLevel = 'level3';
        } else {
          assignedLevel = 'level4';
        }
      } else {
        assignedLevel = 'level4';
      }

      const formattedDate = row.start_date
        ? new Date(row.start_date).toISOString().slice(0, 10)
        : 'N/A';

      return {
        korean: row.hangeul,
        name: row.altname || row.name,
        level: assignedLevel,
        dan: row.level || 'n/a',
        since: formattedDate,
        profilePicture:
          `/profile/${row.img}` ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            row.altname || row.name
          )}&background=random`,
      };
    });

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
