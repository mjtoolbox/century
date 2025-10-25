import React, { useContext, useMemo } from 'react';
import { AppContext } from '@/components/AppContext';
import { attributes } from '../content/home.md';
import pool from '../utils/vercelpostgres';

const Members = ({ members }) => {
  const { language } = useContext(AppContext);
  const { levels } = attributes;

  // Group and sort members (memoized to avoid recomputation on each render)
  const groupedMembers = useMemo(() => {
    const acc = {};
    for (const member of members) {
      const level = member.level || 'level4';
      if (!acc[level]) acc[level] = [];
      acc[level].push(member);
    }

    // Sort members within each level
    const extractNumber = (text) => {
      const match = (text || '').match(/(\d+)/);
      return match ? parseInt(match[0], 10) : null;
    };

    const parseDate = (date) => (date === 'N/A' || !date ? null : new Date(date));

    const sortFn = (a, b) => {
      const aNumber = extractNumber(a.dan || '');
      const bNumber = extractNumber(b.dan || '');

      if ((a.dan || '').includes('Dan') && (b.dan || '').includes('Dan')) {
        const danComparison = (bNumber || 0) - (aNumber || 0);
        if (danComparison !== 0) return danComparison;
      }
      if ((a.dan || '').includes('Kyu') && (b.dan || '').includes('Kyu')) {
        const kyuComparison = (aNumber || 0) - (bNumber || 0);
        if (kyuComparison !== 0) return kyuComparison;
      }

      const aDate = parseDate(a.since);
      const bDate = parseDate(b.since);
      if (!aDate && !bDate) return 0;
      if (!aDate) return -1;
      if (!bDate) return 1;
      return aDate - bDate;
    };

    for (const key of Object.keys(acc)) acc[key].sort(sortFn);
    return acc;
  }, [members]);

  // Define level order
  const levelOrder = ['level1', 'level2', 'level3', 'level4', 'level5'];

  // Determine levels and labels dynamically
  const levelLabels = {
    level1: language === 'en' ? levels.level1 : levels.klevel1,
    level2: language === 'en' ? levels.level2 : levels.klevel2,
    level3: language === 'en' ? levels.level3 : levels.klevel3,
    level4: language === 'en' ? levels.level4 : levels.klevel4,
    //level5: language === 'en' ? levels.level5 : levels.klevel5,
  };

  // Custom sort logic for members
  const sortMembers = (members) => {
    return members.sort((a, b) => {
      const extractNumber = (text) => {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[0], 10) : null;
      };

      const aNumber = extractNumber(a.dan || '');
      const bNumber = extractNumber(b.dan || '');

      // Primary sort: by level (Dan descending, Kyu ascending)
      if (a.dan.includes('Dan') && b.dan.includes('Dan')) {
        const danComparison = (bNumber || 0) - (aNumber || 0);
        if (danComparison !== 0) return danComparison;
      }
      if (a.dan.includes('Kyu') && b.dan.includes('Kyu')) {
        const kyuComparison = (aNumber || 0) - (bNumber || 0);
        if (kyuComparison !== 0) return kyuComparison;
      }

      // Secondary sort: by start_date (null/n/a first, then ascending date)
      const parseDate = (date) =>
        date === 'N/A' || !date ? null : new Date(date);
      const aDate = parseDate(a.since);
      const bDate = parseDate(b.since);

      if (!aDate && !bDate) return 0; // Both null or N/A
      if (!aDate) return -1; // a comes first if its date is null or N/A
      if (!bDate) return 1; // b comes first if its date is null or N/A
      return aDate - bDate; // Otherwise, sort by ascending date
    });
  };

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-2xl font-bold text-center mb-8'>
        {language === 'en' ? levels.title : levels.ktitle}
      </h1>
      <div className='container mx-auto space-y-8'>
        {levelOrder.map((level, index) => {
          const membersForLevel = groupedMembers[level] || []; // Default to empty array if no members
          const sortedMembers = sortMembers(membersForLevel); // Sort members for the current level

          return (
            <div key={level} className='space-y-4'>
              <h2 className='text-xl font-bold text-left pl-4'>
                {levelLabels[level]}
              </h2>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    {(groupedMembers[level] || []).map((user, userIndex) => (
                      <div
                        key={user.id || userIndex}
                        className='w-full bg-white shadow-md rounded-lg p-4 flex items-center'
                      >
                        <img
                          src={user.profilePicture || '/placeholder.svg'}
                          alt={user.name}
                          loading='lazy'
                          className='w-20 h-20 rounded-full mr-8'
                        />
                        <div className='text-left'>
                          <h3 className='text-lg font-bold'>
                            {language === 'en' ? user.name : user.korean}
                          </h3>
                          {user.is_active && (
                            <>
                              <p className='text-sm text-gray-600'>{user.dan}</p>
                              <p className='text-sm text-gray-600'>Since {user.since}</p>
                            </>
                          )}
                        </div>
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

// Fetch data using getStaticProps (ISR) because member data changes infrequently
export async function getStaticProps() {
  try {
    // Fetch members from the database (include member_id for stable keys)
    const { rows } = await pool.query(
      "SELECT member_id, name, img, hangeul, altname, level, is_active, to_char(start_date::date, 'YYYY-MM-DD') as start_date FROM centurymember"
    );

    // Transform data
    const members = rows.map((row) => {
      let assignedLevel;

      if (!row.is_active) {
        assignedLevel = 'level5';
      } else if (row.is_active && row.level) {
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

      // start_date is returned as a date-only string (YYYY-MM-DD) from the DB
      const formattedDate = row.start_date ? row.start_date : 'N/A';

      // Adjust profile picture logic
      const profilePicture = row.img
        ? `/profile/${row.img}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            row.altname || row.name
          )}&background=random`;

      return {
        id: row.member_id,
        korean: row.hangeul,
        name: row.altname || row.name,
        level: assignedLevel,
        is_active: row.is_active,
        dan: row.level || 'n/a',
        since: formattedDate,
        profilePicture,
      };
    });

    return {
      props: {
        members,
      },
      // Revalidate once a week. Adjust as needed.
      revalidate: 604800,
    };
  } catch (error) {
    console.error('Error fetching members:', error);
    return {
      props: {
        members: [], // Return empty array on error
      },
      revalidate: 86400,
    };
  }
}

export default Members;
