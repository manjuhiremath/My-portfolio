'use client';

import { useRef, useState } from 'react';
import { FaFilePdf, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';
import { PERSONAL_INFO, CAREER_OBJECTIVE, EXPERIENCE, PROJECTS, CLIENT_PROJECTS, TECHNICAL_SKILLS, EDUCATION } from './lib/constants';

import Script from 'next/script';

export default function Home() {
  const contentRef = useRef(null);
  const [activeSection, setActiveSection] = useState('about');

  const handleExportPDF = async () => {
    try {
      const element = contentRef.current;

      const opt = {
        margin: [0.3, 0, 0.3, 0], // top, left, bottom, right
        filename: 'Manjunath_M_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          ignoreElements: (element) => element.tagName === 'NAV' || element.classList.contains('no-print')
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      if (typeof window !== 'undefined' && window.html2pdf) {
        await window.html2pdf().set(opt).from(element).save();
      } else {
        alert('PDF library not loaded yet. Please wait a moment and try again.');
      }
    } catch (error) {
      console.error('PDF Export failed:', error);
      alert(`Failed to export PDF: ${error.message}`);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
  ];

  // Helper to process bold text syntax (**text**)
  const formatContent = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">

      {/* Main Container - 80% width on LG screens with Border */}
      <div
        ref={contentRef}
        className="w-full lg:w-[80%]  min-h-screen my-2 lg:my-4  relative flex flex-col"
      >
        {/* Sticky Key Navigation */}
        <nav className="sticky top-2 lg:top-4 z-50 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg">
          <div className="max-w-7xl mx-auto px-2 lg:px-4 py-2">
            <div className="flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-2 md:px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${activeSection === item.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex-1 px-2 lg:px-4 border-2 border-orange-300 rounded-xl lg:my-4 my-2 sm:px-6 py-4">
          {/* Header Section */}
          <header id="about" className="scroll-mt-20 pb-4 border-b border-dashed border-gray-400">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{PERSONAL_INFO.name}</h1>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded-full border border-green-200 animate-pulse">
                    ● Available for Hire
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium max-w-2xl">{PERSONAL_INFO.tagline}</p>
              </div>

              <div className="flex flex-col gap-1.5 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                <a href={`mailto:${PERSONAL_INFO.email}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                  <span className="p-1 bg-white rounded-full border border-gray-200"><FaEnvelope size={10} /></span> {PERSONAL_INFO.email}
                </a>
                <a href={`tel:${PERSONAL_INFO.phone}`} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors">
                  <span className="p-1 bg-white rounded-full border border-gray-200"><FaPhone size={10} /></span> {PERSONAL_INFO.phone}
                </a>
                <div className="flex gap-2 pt-1.5 mt-1 border-t border-gray-200">
                  <a href={`https://${PERSONAL_INFO.linkedin}`} target="_blank" className="p-1.5 bg-white text-blue-600 border border-gray-200 rounded-md hover:shadow-sm transition-all"><FaLinkedin size={14} /></a>
                  <a href={`https://${PERSONAL_INFO.github}`} target="_blank" className="p-1.5 bg-white text-gray-800 border border-gray-200 rounded-md hover:shadow-sm transition-all"><FaGithub size={14} /></a>
                  <a href={`https://${PERSONAL_INFO.website}`} target="_blank" className="p-1.5 bg-white text-indigo-600 border border-gray-200 rounded-md hover:shadow-sm transition-all"><FaGlobe size={14} /></a>
                </div>
              </div>
            </div>

            {/* Career Objective */}
            <div className="mt-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
              <h2 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Career Objective</h2>
              <p className="text-xs text-gray-700 leading-relaxed text-justify">{CAREER_OBJECTIVE}</p>
            </div>
          </header>

          {/* Grid Layout for Large Screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2  items-start">

            {/* Left Column: Experience Section */}
            <section id="experience" className="scroll-mt-20 py-4 lg:border-r border-dashed border-gray-200 lg:pr-4">
              <h2 className="text-sm font-bold text-orange-600 border-l-4 border-orange-600 pl-2 mb-4">EXPERIENCE</h2>
              <div className="space-y-6">
                {EXPERIENCE.map((exp, idx) => (
                  <div key={idx} className="relative mt-2 border border-gray-200 rounded-2xl p-4 sm:border-l-4 hover:border-orange-400 transition-colors group bg-white shadow-sm hover:shadow-md">
                    <div className="flex flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{exp.company}</h3>
                        <p className="text-indigo-600 text-xs font-semibold">{exp.role}</p>
                      </div>
                      <div className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 mt-1 w-fit">
                        <p className="font-medium text-gray-700">{exp.duration}</p>
                        <p>{exp.location}</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {exp.points.map((point, pointIdx) => (
                        <li key={pointIdx} className="flex items-start gap-2 text-[11px] text-gray-600 leading-relaxed text-justify">
                          <span className="w-1 h-1 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></span>
                          <span>{formatContent(point)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Right Column: Projects, Skills, Education */}
            <div className="space-y-6 lg:pl-2">

              {/* Projects Section */}
              <section id="projects" className="scroll-mt-20 py-4 border-b border-dashed border-gray-200">
                <h2 className="text-sm font-bold text-orange-600 border-l-4 border-orange-600 pl-2 mb-4">PROJECTS</h2>
                <div className="grid grid-cols-1 gap-3">
                  {PROJECTS.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all group">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{proj.name}</h3>
                        {proj.link && (
                          <a href={proj.link} target="_blank" className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors">
                            View Live ↗
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mb-2">{proj.subtitle}</p>
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">Tech: <span className="text-gray-600 font-normal">{proj.tech}</span></p>
                      </div>
                      <ul className="space-y-1">
                        {proj.points.map((point, pointIdx) => (
                          <li key={pointIdx} className="flex items-start gap-2 text-[10px] sm:text-xs text-gray-600">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0 group-hover:bg-indigo-400 transition-colors"></span>
                            <span>{formatContent(point)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Client Projects */}
                <div className="mt-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                  <h3 className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-2">Deployed Client Websites</h3>
                  <div className="flex flex-wrap gap-2">
                    {CLIENT_PROJECTS.map((proj, idx) => (
                      <a
                        key={idx}
                        href={`https://${proj.name}`}
                        target="_blank"
                        className="text-[10px] px-2 py-1 bg-white text-indigo-700 border border-indigo-100 rounded-full hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-sm transition-all"
                      >
                        {proj.name}
                      </a>
                    ))}
                  </div>
                </div>
              </section>

              {/* Technical Skills Section */}
              <section id="skills" className="scroll-mt-20 py-2 border-b border-dashed border-gray-200">
                <h2 className="text-sm font-bold text-orange-600 border-l-4 border-orange-600 pl-2 mb-2">TECHNICAL SKILLS</h2>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(TECHNICAL_SKILLS).map(([category, skills], idx) => (
                    <div key={idx} className="p-2 flex justify-between items-center rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200  transition-all">
                      <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">{category}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill, skillIdx) => (
                          <span key={skillIdx} className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education Section */}
              <section id="education" className="scroll-mt-20 py-2">
                <h2 className="text-sm font-bold text-orange-600 border-l-4 border-orange-600 pl-2 mb-2">EDUCATION</h2>
                <div className="space-y-2">
                  {EDUCATION.map((edu, idx) => (
                    <div key={idx} className="p-2 flex justify-between bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-all gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm">{edu.institution}</h3>
                        <p className="text-indigo-600 text-xs font-medium mt-0.5">{edu.degree}</p>
                        <p className="text-[10px] text-green-500 mt-1 font-mono bg-green-50 px-1.5 py-0.5 rounded w-fit">{edu.grade}</p>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 md:text-right bg-gray-50 p-1.5 rounded">
                        <p className="font-bold text-gray-700">{edu.duration}</p>
                        <p>{edu.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-2 border-gray-200 rounded-lg text-gray-900 py-2 mt-auto">
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-gray-400">© 2025 {PERSONAL_INFO.name}</p>
            <div className="flex gap-2">
              <a href={`https://${PERSONAL_INFO.linkedin}`} target="_blank" className="text-gray-400 hover:text-white transition-colors"><FaLinkedin size={16} /></a>
              <a href={`https://${PERSONAL_INFO.github}`} target="_blank" className="text-gray-400 hover:text-white transition-colors"><FaGithub size={16} /></a>
              <a href={`mailto:${PERSONAL_INFO.email}`} className="text-gray-400 hover:text-white transition-colors"><FaEnvelope size={16} /></a>
            </div>
          </div>
        </footer>

        {/* Floating PDF Export Button - Fixed to Viewport */}
        <button
          onClick={handleExportPDF}
          className="fixed bottom-8 right-8 w-12 h-12 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 group"
          title="Download Resume PDF"
        >
          <FaFilePdf size={20} className="group-hover:animate-bounce" />
        </button>
      </div>
      {/* HTML2PDF CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="lazyOnload"
      />
    </div>
  );
}
