import React, { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { attributes } from '../content/home.md';
import { FaDollarSign, FaClipboardCheck, FaShieldAlt } from 'react-icons/fa';

const Membership = () => {
  const { language } = useContext(AppContext);
  const { membership } = attributes;

  const rules = [
    {
      icon: <FaClipboardCheck size={24} className='text-indigo-500' />,
      text: language === 'en' ? membership.li1 : membership.kli1,
    },
    {
      icon: <FaDollarSign size={24} className='text-green-500' />,
      text: language === 'en' ? membership.li2 : membership.kli2,
    },
    {
      icon: <FaClipboardCheck size={24} className='text-blue-500' />,
      text: language === 'en' ? membership.li3 : membership.kli3,
    },
    {
      icon: <FaShieldAlt size={24} className='text-red-500' />,
      text: language === 'en' ? membership.li4 : membership.kli4,
    },
  ];

  return (
    <div className='bg-gray-100 py-12 px-4'>
      {/* Header */}
      <div className='text-center mb-10'>
        <h1 className='text-2xl font-bold text-center mb-8'>
          {language === 'en' ? membership.title : membership.ktitle}
        </h1>
        <p className='text-gray-500 mt-2'>
          {language === 'en'
            ? 'Learn about our membership fees and rules'
            : '회원비 및 규칙에 대해 알아보세요'}
        </p>
      </div>

      {/* Rules Section */}
      <div className='container mx-auto grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2'>
        {rules.map((rule, index) => (
          <div
            key={index}
            className='bg-white shadow-lg rounded-lg p-6 flex items-center space-x-4 transform transition hover:scale-105'
          >
            {/* Icon */}
            <div className='flex-shrink-0'>{rule.icon}</div>
            {/* Rule Text */}
            <div>
              <p className='text-gray-700'>{rule.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membership;
