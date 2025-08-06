import React from 'react';
import Container from './Container';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <Container>
        <div className="d-flex gap-1 justify-content-center align-items-center flex-column mb-5 py-sm-4">
          <span>
              <FaGithub />
          </span>
          <small className="text-secondary text-center">&copy;{currentYear} Designed and built by Mohit Yadav</small>
          <small className="text-secondary text-center">
            <span>Data provided by </span>
            <a href="https://www.themoviedb.org/" className="text-secondary fw-normal" target="_blank" rel="noopener noreferrer">
              TMDb
            </a>
          </small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
