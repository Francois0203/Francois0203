import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  background-color: ${(props) => props.theme.darkMode ? '#444' : '#fff'};
  color: ${(props) => props.theme.darkMode ? '#fff' : '#333'};
  min-height: 80vh;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
`;

const About = () => {
  return (
    <PageContainer>
      <h1>About Me</h1>
      <p>This is the about me page with more details.</p>
    </PageContainer>
  );
};

export default About;