import React from 'react';
import styled from 'styled-components';

// Styled component for Page
const PageContainer = styled.div`
  background-color: ${(props) => props.theme.darkMode ? '#444' : '#fff'};
  color: ${(props) => props.theme.darkMode ? '#fff' : '#333'};
  min-height: 80vh;
  padding: 40px;
  text-align: center;
  transition: all 0.3s ease;
`;

const Home = () => {
  return (
    <PageContainer>
      <h1>Welcome to the Home Page</h1>
      <p>This is where your content goes.</p>
    </PageContainer>
  );
};

export default Home;