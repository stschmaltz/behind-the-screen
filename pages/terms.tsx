import { NextPage } from 'next';
import { useEffect } from 'react';
import { useState } from 'react';
import { logger } from '../lib/logger';

const Custom404: NextPage = () => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('terms-of-service.html')
      .then((res) => res.text())
      .then(setHtml)
      .catch(logger.error);
  }, []);

  return (
    <div
      className="terms-of-service"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Custom404;
