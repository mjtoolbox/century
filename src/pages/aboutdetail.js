import React, { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { attributes } from '../content/home.md';

const AboutDetail = () => {
  const { language } = useContext(AppContext);
  const { aboutDetail } = attributes;

  return (
    <div className="bg-base-100 py-8">
      {/* Title Section */}
      <h1 className="text-center text-2xl font-bold pb-5 border-b border-gray-300">
        {language === 'en' ? aboutDetail.title : aboutDetail.ktitle}
      </h1>

      {/* Content Section */}
      <div className="container mx-auto px-4 mt-6">
        <div className="bg-gray-50 shadow-md rounded-lg p-6 leading-relaxed">
          {language === 'en'
            ? aboutDetail.description
            : aboutDetail.kdescription}
        </div>
      </div>
    </div>
  );
};

export default AboutDetail;
