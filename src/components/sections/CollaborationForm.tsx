'use client';

import { useState } from 'react';

export default function CollaborationForm() {
  const [formData, setFormData] = useState({
    brandName: '',
    email: '',
    website: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Immediately show success and clear form for better UX
    setStatus('success');
    const submittedData = { ...formData };
    setFormData({ brandName: '', email: '', website: '', message: '' });

    // Reset status after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);

    // Submit to API and handle response properly
    fetch(
      '/api/collaboration',
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submittedData),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Form submitted successfully:', data);
    })
    .catch(error => {
      console.error('Form submission error:', error);
      // You could set error state here if needed
    });
  };

  return (

    <section
      id="collaboration"
      className="relative z-[1] bg-[#0A0A0A] px-3 sm:px-5 md:px-8 lg:px-12 py-12 sm:py-14 lg:py-16"
    >

      <div className="max-w-6xl mx-auto">
        <div
          className="relative bg-[#1F1F1F] rounded-2xl overflow-hidden flex flex-col md:flex-row justify-center items-center max-w-[343px] md:max-w-none mx-auto gap-10 md:gap-16 p-5 sm:p-8 md:p-10"
          style={{
            width: '100%',
            minHeight: '502px',
            margin: '0 auto',
            isolation: 'isolate'
          }}
        >
          {/* Curved Gradient Border */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: '16px',
              background: 'linear-gradient(226.35deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 50.5%)',
              padding: '1px'
            }}
          >
            <div
              className="w-full h-full rounded-[15px]"
              style={{
                background: '#1F1F1F'
              }}
            ></div>
          </div>
          {/* Ellipse 2 - Left gradient */}
          <div
            style={{
              position: 'absolute',
              width: '588px',
              height: '588px',
              left: '-477px',
              top: '-404px',
              background: 'linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%)',
              filter: 'blur(100px)',
              transform: 'rotate(180deg)',
              zIndex: 0,
            }}
          />

          {/* Ellipse 3 - Right gradient (Desktop) */}
          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              width: '588px',
              height: '588px',
              left: '893px',
              top: '324px',
              background: 'linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%)',
              filter: 'blur(100px)',
              transform: 'rotate(-92.63deg)',
              zIndex: 1,
            }}
          />

          {/* Ellipse 3 - Mobile gradient (bottom right) */}
          <div
            className="block md:hidden"
            style={{
              position: 'absolute',
              width: '588px',
              height: '588px',
              left: '313px',
              top: '244px',
              background: 'linear-gradient(107.68deg, #3813F3 9.35%, #05B0B3 34.7%, #4B25FD 60.06%, #B9B9E9 72.73%, #DE50EC 88.58%)',
              filter: 'blur(100px)',
              transform: 'rotate(-92.63deg)',
              zIndex: 0,
            }}
          />

          {/* Main Content Frame */}
          <div className="relative z-30 w-full max-w-[319px] md:max-w-[630px] mx-auto">
            {/* Header Frame */}
            <div className="flex flex-col items-start gap-4 mb-8 md:mb-10">
              <h2
                className="text-white font-semibold"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '32px',
                  lineHeight: '100%',
                  width: '100%',
                  maxWidth: '319px'
                }}
              >
                Work with TechSol
              </h2>
              <p
                className="text-white"
                style={{
                  fontFamily: 'Gilroy, sans-serif',
                  fontSize: '16px',
                  lineHeight: '100%',
                  width: '100%',
                  maxWidth: '319px'
                }}
              >
                For collaboration, drop us a message.
              </p>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-6 w-full max-w-[319px] md:max-w-none">
              {/* Brand Name and Email */}
              <div className="flex flex-row gap-6">
                {/* Brand Name Field */}
                <div className="flex flex-col gap-1 w-[147.5px] md:flex-1 md:w-auto">
                  <label className="text-white text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="Enter Name"
                    className="bg-transparent text-white placeholder-white/30 border border-white/30 rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-0 focus:border-white/30"
                    style={{ fontFamily: 'Gilroy, sans-serif', boxShadow: 'none', outline: 'none' }}
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-1 w-[147.5px] md:flex-1 md:w-auto">
                  <label className="text-white text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="abc@example.com"
                    className="bg-transparent text-white placeholder-white/30 border border-white/30 rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-0 focus:border-white/30"
                    style={{ fontFamily: 'Gilroy, sans-serif', boxShadow: 'none', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              {/* Brand Website */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Brand Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourbrand.com"
                  className="bg-transparent text-white placeholder-white/30 border border-white/30 rounded-lg px-4 py-3 w-full text-sm focus:outline-none focus:ring-0 focus:border-white/30"
                  style={{ fontFamily: 'Gilroy, sans-serif', boxShadow: 'none', outline: 'none' }}
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your collaboration idea..."
                  className="bg-transparent text-white placeholder-white/30 border border-white/30 rounded-lg px-4 py-3 w-full resize-none text-sm focus:outline-none focus:ring-0 focus:border-white/30"
                  style={{ fontFamily: 'Gilroy, sans-serif', boxShadow: 'none', outline: 'none', minHeight: '72px' }}
                  rows={3}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="no-focus bg-white text-[#0A0A0A] rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer px-6 sm:px-8 py-3 text-sm font-semibold focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-none w-full md:w-auto md:max-w-[319px]"
                style={{ 
                  fontFamily: 'Gilroy, sans-serif', 
                  outline: 'none !important', 
                  boxShadow: 'none !important',
                  border: 'none !important'
                }}
                onFocus={(e) => e.target.blur()}
              >
                {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : status === 'error' ? 'Failed' : 'Send Message'}
              </button>

              {/* Status Messages */}
              {status === 'success' && (
                <p className="text-green-400 text-xs sm:text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Thank you! We&apos;ll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p className="text-red-400 text-xs sm:text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}