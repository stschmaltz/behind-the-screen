import { useCurrentUserContext } from '../context/UserContext';

import { NextPage } from 'next';

const HomePage: NextPage = () => {
  const { currentUser, setCurrentUser } = useCurrentUserContext();
  return (
    <div>
      <div className="relative mt-5 p-0 w-full max-w-none">
        <p>howdy {currentUser?.email}</p>
      </div>
    </div>
  );
};

export default HomePage;
