import React from 'react';

const Home = () => {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main page of the application.</p>
      <p>Use the navigation bar in the top-left to navigate (though currently only Home is available).</p>
      <p>The theme switch in the top-right allows toggling between light and dark themes.</p>
      <p>Try navigating to an invalid route to see the Not Found page.</p>
    </div>
  );
};

export default Home;