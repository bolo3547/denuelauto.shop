import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: 'How do I buy a car from you?',
    answer: 'Simply browse our inventory, select a car, and contact us. We\'ll guide you through the entire process including documentation, shipping, and customs clearance.'
  },
  {
    question: 'What documents do I need?',
    answer: 'You\'ll need a valid passport, proof of address, and payment confirmation. We handle all export documentation.'
  },
  {
    question: 'How long does shipping take?',
    answer: 'Shipping typically takes 30-45 days depending on your destination port and customs processing.'
  },
  {
    question: 'Do you offer warranties?',
    answer: 'Yes, we offer optional extended warranties and comprehensive insurance coverage for your vehicle.'
  },
  {
    question: 'Can I inspect the car before purchase?',
    answer: 'We provide detailed inspection reports with photos and videos. Virtual inspections are available upon request.'
  }
];

const FAQHelpCenter: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">FAQ & Help Center</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQHelpCenter;
