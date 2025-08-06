import React from 'react';
import TitlePages from '../../utils/TitlePages';
import AllTopRated from '../../components/tv/AllTopRated';

const TopRated = () => {
  TitlePages('Top Rated TV Shows');
  return (
    <section>
      <AllTopRated />
    </section>
  );
};

export default TopRated;
