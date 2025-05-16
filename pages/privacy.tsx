import { NextPage } from 'next';
import { useEffect } from 'react';
import { useState } from 'react';
import { logger } from '../lib/logger';

const Custom404: NextPage = () => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('privacy-policy.html')
      .then((res) => res.text())
      .then(setHtml)
      .catch(logger.error);
  }, []);

  return (
    <div
      className="privacy-policy"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Custom404;
