
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-6 md:mb-10 text-text-light dark:text-text-dark">
      <h1 className="text-4xl sm:text-5xl font-bold mb-2 flex items-center justify-center">
        <i className="fas fa-globe-americas mr-3 text-primary-light dark:text-primary-dark"></i>
        ChronoShift
      </h1>
      <p className="text-md sm:text-lg opacity-90 max-w-2xl mx-auto">
        Advanced Timezone Conversion, Meeting Planner, DST Awareness & More!
      </p>
    </header>
  );
};

export default Header;