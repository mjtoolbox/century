import React from 'react';
import { AppContext } from '@/components/AppContext';
import { attributes } from '../content/home.md';

const ContactUs = () => {
  const { contactus } = attributes;

  return (
    <div className="bg-base-100 py-8 px-4">
      <div className="text-3xl font-bold text-center mb-10" id="gallery">
        {contactus.title}
      </div>
      <div className="flex flex-col md:flex-row justify-center md:justify-evenly flex-wrap gap-8" id="schedule">
        {/* Langley Card */}
        <div className="w-full md:w-96 bg-base-100 shadow-xl rounded-lg overflow-hidden">
          <div className="card-body p-6">
            <h1 className="card-title font-bold text-xl mb-2">LANGLEY</h1>
            <div className="text-lg mb-1">Monday: 7pm - 9pm</div>
            <div className="text-lg mb-3">Wednesday: 7pm - 9pm</div>
            <h3 className="text-xl font-semibold mb-2">Address:</h3>
            <div className="text-lg">{contactus.place2}</div>
            <div className="text-lg">{contactus.add2}</div>
          </div>
        </div>

        {/* Coquitlam Card */}
        <div className="w-full md:w-96 bg-base-100 shadow-xl rounded-lg overflow-hidden">
          <div className="card-body p-6">
            <h1 className="card-title font-bold text-xl mb-2">COQUITLAM</h1>
            <p className="text-lg mb-1">Friday: 7pm - 9pm</p>
            <p className="text-lg text-red-500 mb-3">{contactus.msg}</p>
            <h3 className="text-xl font-semibold mb-2">Address:</h3>
            <div className="text-lg">{contactus.place3}</div>
            <div className="text-lg">{contactus.add3}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
