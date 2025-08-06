import React from 'react';
import TitlePages from '../../utils/TitlePages';
import AllTVAiringToday from '../../components/tv/AllTVAiringToday';

const AiringToday = () => {
  TitlePages('TV Shows Airing Today');
  return (
    <section>
      <AllTVAiringToday />
    </section>
  );
};

export default AiringToday;
